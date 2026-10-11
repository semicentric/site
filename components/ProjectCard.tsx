"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ATLAS,
  clamp,
  densityGlyph,
  flickerGlyph,
  sampleCells,
  scatter,
  smooth,
  streakGlyph,
  sweepOrder,
  type Cell,
} from "./ascii";
import { EASE } from "./shared";

export type Project = {
  name: string;
  href?: string;
  image?: string;
  mobileImage?: string;
};

const NARROW = "(max-width: 767px)";

// The page paper under the tile's 2.5% black wash.
const PAPER = "#f1f1ef";
const INK = "#101010";
const REVEAL_MS = 900;
const RESOLVE_MS = 820;
const RETURN_MS = 620;

function useCardCanvas({
  canvasRef,
  over,
  src,
  mobileSrc,
  delay,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  over: React.RefObject<boolean>;
  src?: string;
  mobileSrc?: string;
  delay: number;
}) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const mask = document.createElement("canvas");
    const maskCtx = mask.getContext("2d");
    const atlas = document.createElement("canvas");
    const atlasCtx = atlas.getContext("2d");
    const sample = document.createElement("canvas");
    const sampler = sample.getContext("2d", { willReadFrequently: true });
    if (!canvas || !ctx || !maskCtx || !atlasCtx || !sampler) return;

    const field = !src;
    // Each card rolls its own field so two coming-soon cards never match.
    const salt = Math.floor(Math.random() * 1e6);
    const roll01 = (k: number) => scatter(salt + k * 7919);
    const fx = 6 + roll01(1) * 3;
    const fy = 4.5 + roll01(2) * 2;
    const px = roll01(3) * Math.PI * 2;
    const py = roll01(4) * Math.PI * 2;
    const fd = 4.3 * (0.8 + roll01(5) * 0.4);
    const dir = roll01(6) > 0.5 ? 1 : -1;
    const drift = roll01(7) * 100;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Without a pointer that can hover, the image would never be seen, so
    // touch devices resolve it once the ASCII has landed.
    const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const narrow = window.matchMedia(NARROW);
    const pick = () => (narrow.matches && mobileSrc) || src || "";
    const image = new window.Image();
    let cells: Cell[] = [];
    let width = 0;
    let height = 0;
    let columns = 0;
    let rows = 0;
    let cw = 0;
    let ch = 0;
    let aw = 0;
    let ah = 0;
    let start: number | null = null;
    let landed = false;
    let resolve = 0;
    let strength = 0;
    let roll = 0;
    let wasOver = false;
    let last = 0;
    let lastDraw = 0;
    let frame = 0;
    let visible = false;
    let disposed = false;

    const layout = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      if (!width || !height) return false;
      const ratio = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = Math.ceil(width * ratio);
      canvas.height = Math.ceil(height * ratio);
      ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
      columns = Math.max(26, Math.min(80, Math.round(width / 6.5)));
      rows = Math.max(1, Math.round((height / width) * columns * 0.6));
      cw = width / columns;
      ch = height / rows;
      aw = Math.max(1, Math.round(cw * (canvas.width / width)));
      ah = Math.max(1, Math.round(ch * (canvas.height / height)));
      atlas.width = aw * ATLAS.length;
      atlas.height = ah;
      atlasCtx.clearRect(0, 0, atlas.width, atlas.height);
      atlasCtx.font = `${ah * 0.92}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      atlasCtx.textAlign = "center";
      atlasCtx.textBaseline = "middle";
      atlasCtx.fillStyle = INK;
      for (let i = 0; i < ATLAS.length; i++) atlasCtx.fillText(ATLAS[i], (i + 0.5) * aw, ah / 2);
      mask.width = columns;
      mask.height = rows;
      if (field) {
        cells = Array.from({ length: columns * rows }, (_, i) => ({
          tone: 0,
          edge: 0,
          prominence: 0,
          seed: Math.imul(i + 1, 2654435761) >>> 0,
          scatter: scatter(i + salt),
        }));
        return true;
      }
      if (!image.naturalWidth) return false;
      sample.width = columns;
      sample.height = rows;
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const cropW = width / scale;
      const cropH = height / scale;
      sampler.drawImage(
        image,
        (image.naturalWidth - cropW) / 2,
        (image.naturalHeight - cropH) / 2,
        cropW,
        cropH,
        0,
        0,
        columns,
        rows,
      );
      cells = sampleCells(sampler.getImageData(0, 0, columns, rows).data, columns);
      return true;
    };

    const glyph = (char: string, x: number, y: number, alpha: number) => {
      if (alpha <= 0.01) return;
      ctx.globalAlpha = Math.min(1, alpha);
      // Land each glyph on whole device pixels so it stays sharp at 2x and 3x.
      const sx = canvas.width / width;
      const sy = canvas.height / height;
      ctx.drawImage(
        atlas,
        ATLAS.indexOf(char) * aw,
        0,
        aw,
        ah,
        Math.round(x * sx) / sx,
        Math.round(y * sy) / sy,
        aw / sx,
        ah / sy,
      );
    };

    const paintMask = (backing: Float32Array) => {
      maskCtx.clearRect(0, 0, columns, rows);
      maskCtx.fillStyle = PAPER;
      for (let i = 0; i < backing.length; i++) {
        if (backing[i] <= 0) continue;
        maskCtx.globalAlpha = backing[i];
        maskCtx.fillRect(i % columns, Math.floor(i / columns), 1, 1);
      }
      ctx.globalAlpha = 1;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(mask, 0, 0, width, height);
    };

    // One pass draws every state: the ASCII landing (p < 1), the resting
    // glyphs, and the hover resolve into the image (r > 0).
    const drawImageCard = (now: number) => {
      const elapsed = now - (start ?? now);
      const p = reduced ? 1 : clamp(elapsed / REVEAL_MS);
      const coverage = -0.06 + (1 - Math.pow(1 - p, 2.2)) * 1.3;
      const phase = Math.floor(now / 85);
      const r = resolve;
      const moving = p < 1 || (r > 0 && r < 1);
      const backing = new Float32Array(cells.length);
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < cells.length; i++) {
        const order = clamp(sweepOrder(i % columns, columns, cells[i]));
        backing[i] = 1 - smooth((r - order * 0.62) / 0.16);
      }
      paintMask(backing);
      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const col = i % columns;
        const raw = sweepOrder(col, columns, cell);
        const order = clamp(raw);
        const age = clamp((coverage - raw) * 5);
        if (age <= 0) continue;
        const density = Math.min(1, cell.tone * 0.9 + cell.edge * 0.2);
        const local = clamp((r - order * 0.62 + 0.15) / 0.3);
        const char =
          age < 0.45
            ? streakGlyph(cell.seed >>> 4)
            : (p < 0.9 && age < 0.9) || (local > 0 && local < 0.8)
              ? flickerGlyph(density, cell.seed >>> 8, phase)
              : densityGlyph(density);
        const settle = 1 - smooth((r - order * 0.62 - 0.02) / 0.16);
        const base = (0.08 + cell.prominence * 0.88) * smooth(age);
        const lift = base + (0.9 - base) * smooth(r / 0.35) * cell.prominence;
        glyph(char, col * cw, Math.floor(i / columns) * ch, lift * settle);
      }
      ctx.globalAlpha = 1;
      if (p >= 1) landed = true;
      return moving;
    };

    const drawField = (now: number, dt: number) => {
      const target = over.current ? 1 : 0;
      // A fresh hover from rest re-rolls the dissolve, so no two look alike.
      if (target && !wasOver && strength < 0.02) roll++;
      wasOver = !!target;
      strength += (target - strength) * (1 - Math.exp(-dt / (target ? 260 : 480)));
      const t = drift + (reduced ? 0 : now / 1000);
      const intro = reduced ? 1 : start === null ? 0 : clamp((now - start) / (REVEAL_MS * 1.4));
      const phase = Math.floor(now / 140);
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const col = i % columns;
        const row = Math.floor(i / columns);
        const xn = col / columns;
        const yn = row / rows;
        const wave =
          Math.sin(xn * fx + px + t * 0.55 + Math.sin(yn * 3.1 - t * 0.3) * 1.4) *
            Math.cos(yn * fy + py - t * 0.42) +
          Math.sin((xn * dir + yn) * fd - t * 0.36) * 0.6;
        const tone = smooth((wave + 1.6) / 3.2);
        const keep = tone - cell.scatter * 0.85;
        if (keep <= 0.2) continue;
        const arrive = smooth((intro * 1.3 - cell.scatter) / 0.3);
        const order = scatter(i + salt + roll * 104729);
        const span = 0.12 + scatter(i * 3 + salt + roll) * 0.3;
        const gone = smooth((strength * (1 + span) - order) / span);
        const alpha = Math.min(0.55, (keep - 0.2) * 1.1) * arrive * (1 - gone);
        const char =
          keep > 0.55 ? flickerGlyph(tone, cell.seed >>> 8, phase) : keep > 0.38 ? ":" : ".";
        glyph(char, col * cw, row * ch, alpha);
      }
      ctx.globalAlpha = 1;
    };

    const tick = (now: number) => {
      frame = 0;
      if (disposed) return;
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      if (!visible || document.hidden) {
        last = 0;
        return;
      }
      if (start === null) start = now + (reduced ? 0 : delay * 1000);
      if (now < start) {
        frame = requestAnimationFrame(tick);
        return;
      }
      if (!cells.length && !layout()) {
        frame = requestAnimationFrame(tick);
        return;
      }
      if (field) {
        if (now - lastDraw >= 40 || over.current || strength > 0.01) {
          drawField(now, Math.max(dt, now - lastDraw));
          lastDraw = now;
        }
        if (!reduced) frame = requestAnimationFrame(tick);
        return;
      }
      canvas.style.background = "transparent";
      const target = landed && (over.current || touch) ? 1 : 0;
      if (reduced) resolve = target;
      else if (resolve < target) resolve = Math.min(1, resolve + dt / RESOLVE_MS);
      else if (resolve > target) resolve = Math.max(0, resolve - dt / RETURN_MS);
      const moving = drawImageCard(now);
      const next = landed && (over.current || touch) ? 1 : 0;
      if (moving || resolve !== next || !landed) frame = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (disposed || frame) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    };

    const resize = () => {
      if (cells.length) {
        cells = [];
        layout();
      }
      wake();
    };

    canvas.addEventListener("card:wake", wake);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    });
    const ro = new ResizeObserver(resize);
    io.observe(canvas);
    ro.observe(canvas);
    document.addEventListener("visibilitychange", wake);

    if (!field) {
      image.onload = () => {
        layout();
        wake();
      };
      image.onerror = () => {
        canvas.style.opacity = "0";
      };
      image.src = pick();
    }
    const swap = () => {
      if (field) return;
      cells = [];
      image.src = pick();
    };
    narrow.addEventListener("change", swap);
    wake();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      canvas.removeEventListener("card:wake", wake);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", wake);
      narrow.removeEventListener("change", swap);
      image.onload = null;
      image.onerror = null;
    };
  }, [canvasRef, over, src, mobileSrc, delay]);
}

export default function ProjectCard({ project, delay }: { project: Project; delay: number }) {
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerOver = useRef(false);
  const [over, setOver] = useState(false);
  const field = !project.image;

  useCardCanvas({
    canvasRef,
    over: pointerOver,
    src: project.image,
    mobileSrc: project.mobileImage,
    delay,
  });

  const show = (value: boolean) => {
    pointerOver.current = value;
    setOver(value);
    canvasRef.current?.dispatchEvent(new Event("card:wake"));
  };

  const set = (value: boolean) => (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") show(value);
  };

  // Touch has no hover, so a tap on a coming-soon card plays the same
  // dissolve and lets it settle back on its own.
  const tapTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(tapTimer.current), []);
  const tap = () => {
    if (!window.matchMedia("(hover: none)").matches) return;
    window.clearTimeout(tapTimer.current);
    const next = !pointerOver.current;
    show(next);
    if (next) tapTimer.current = window.setTimeout(() => show(false), 2400);
  };

  const body = (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: reduced ? 0 : delay, ease: EASE }}
        className="relative aspect-[4/5] w-full overflow-hidden bg-black/[0.025]"
        style={{ contain: "paint" }}
      >
        {project.image && (
          <picture>
            {project.mobileImage && <source media={NARROW} srcSet={project.mobileImage} />}
            <img
              src={project.image}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full select-none object-cover"
            />
          </picture>
        )}
        <canvas
          ref={canvasRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ background: field ? "transparent" : PAPER }}
        />
        {field && (
          <span
            className="absolute inset-0 flex items-center justify-center text-[13px] tracking-[0.01em] text-muted [transition-property:opacity,filter] duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              opacity: over ? 1 : 0,
              filter: over ? "blur(0px)" : "blur(6px)",
            }}
          >
            Coming soon
          </span>
        )}
        {/* Drawn above the art so light cards like Palisade still hold an edge. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.07)]"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, filter: reduced ? "blur(0px)" : "blur(6px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.75, delay: reduced ? 0 : delay + 0.35, ease: EASE }}
        className="mt-3 flex items-center justify-between text-[15px]"
      >
        <span className={field ? "text-muted" : "text-ink"}>{project.name}</span>
        <span
          aria-hidden
          className="text-muted [transition-property:opacity,filter] duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            opacity: over ? 1 : 0,
            filter: over ? "blur(0px)" : "blur(6px)",
          }}
        >
          {project.href ? "↗" : "Soon"}
        </span>
      </motion.div>
    </>
  );

  const frame = "group block select-none [-webkit-tap-highlight-color:transparent]";

  if (!project.href)
    return (
      <div
        onPointerEnter={set(true)}
        onPointerLeave={set(false)}
        onClick={tap}
        className={`${frame} cursor-default`}
      >
        {body}
      </div>
    );

  return (
    <a
      onPointerEnter={set(true)}
      onPointerLeave={set(false)}
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${frame} [transition-property:scale] duration-150 ease-out active:scale-[0.985]`}
    >
      {body}
    </a>
  );
}
