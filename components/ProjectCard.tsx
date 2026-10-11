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

export type HoverStyle = "lens" | "scan" | "lift";

export type Project = {
  name: string;
  href?: string;
  image?: string;
  dim?: boolean;
};

const PAPER = "#f7f7f5";
const INK = "#101010";
const REVEAL_MS = 900;
const FINISH_MS = 950;
const SCAN_MS = 760;

type Pointer = { x: number; y: number; over: boolean; enteredAt: number };

function useCardCanvas({
  canvasRef,
  pointer,
  src,
  hover,
  delay,
  dim,
  onDone,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  dim: number;
  pointer: React.RefObject<Pointer>;
  src?: string;
  hover: HoverStyle;
  delay: number;
  onDone: () => void;
}) {
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

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
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    let fadeStart: number | null = null;
    let revealed = false;
    let strength = 0;
    let lensX = 0;
    let lensY = 0;
    let last = 0;
    let lastDraw = 0;
    let frame = 0;
    let visible = false;
    let disposed = false;

    const finishReveal = () => {
      if (revealed) return;
      revealed = true;
      canvas.style.background = "transparent";
      done.current();
    };

    const layout = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      if (!width || !height) return false;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.ceil(width * ratio);
      canvas.height = Math.ceil(height * ratio);
      ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
      columns = Math.max(26, Math.min(80, Math.round(width / 6.5)));
      rows = Math.max(1, Math.round((height / width) * columns * 0.6));
      cw = width / columns;
      ch = height / rows;
      aw = Math.ceil(cw * ratio);
      ah = Math.ceil(ch * ratio);
      atlas.width = aw * ATLAS.length;
      atlas.height = ah;
      atlasCtx.clearRect(0, 0, atlas.width, atlas.height);
      atlasCtx.font = `${ch * 0.92 * ratio}px ui-monospace, SFMono-Regular, Menlo, monospace`;
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
          scatter: scatter(i),
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
      ctx.drawImage(atlas, ATLAS.indexOf(char) * aw, 0, aw, ah, x, y, cw, ch);
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
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(mask, 0, 0, width, height);
    };

    const drawReveal = (now: number) => {
      const elapsed = now - (start ?? now);
      const p = clamp(elapsed / REVEAL_MS);
      const coverage = -0.06 + (1 - Math.pow(1 - p, 2.2)) * 1.3;
      const phase = Math.floor(elapsed / 85);
      if (fadeStart === null && p >= 0.8) fadeStart = now;
      const f = fadeStart === null ? 0 : clamp((now - fadeStart) / FINISH_MS);
      const backing = new Float32Array(cells.length);
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const col = i % columns;
        const order = sweepOrder(col, columns, cell);
        const drop = smooth((f - clamp(order) * 0.5) / 0.38);
        backing[i] = 1 - drop;
      }
      paintMask(backing);
      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const col = i % columns;
        const order = sweepOrder(col, columns, cell);
        const age = clamp((coverage - order) * 5);
        if (age <= 0) continue;
        const density = Math.min(1, cell.tone * 0.9 + cell.edge * 0.2);
        const char =
          age < 0.45
            ? streakGlyph(cell.seed >>> 4)
            : p < 0.9 && age < 0.9
              ? flickerGlyph(density, cell.seed >>> 8, phase)
              : densityGlyph(density);
        const settle = 1 - smooth((f - clamp(order) * 0.5 - 0.1) / 0.32);
        const base = (0.08 + cell.prominence * 0.88) * smooth(age);
        const lift = base + (0.9 - base) * smooth(f / 0.35) * cell.prominence;
        glyph(char, col * cw, Math.floor(i / columns) * ch, lift * settle);
      }
      ctx.globalAlpha = 1;
      return f >= 1;
    };

    const drawHover = (now: number, dt: number) => {
      const p = pointer.current;
      const target = p.over ? 1 : 0;
      strength += (target - strength) * (1 - Math.exp(-dt / (target ? 110 : 220)));
      lensX += (p.x - lensX) * (1 - Math.exp(-dt / 60));
      lensY += (p.y - lensY) * (1 - Math.exp(-dt / 60));
      ctx.clearRect(0, 0, width, height);
      if (hover === "lift") return false;
      const active = p.over || strength > 0.002;

      const backing = new Float32Array(cells.length);
      const strengths = new Float32Array(cells.length);
      const phase = Math.floor(now / 95);
      let any = false;
      let pos = 0;
      let band = 0;
      if (hover === "scan") {
        const t = clamp((now - p.enteredAt) / SCAN_MS);
        band = width * 0.22;
        pos = -band + (width + band * 2) * (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
        if (t >= 1) return false;
      }
      const radius = Math.max(width, height) * 0.3;
      for (let i = 0; i < cells.length; i++) {
        const cx = ((i % columns) + 0.5) * cw;
        const cy = (Math.floor(i / columns) + 0.5) * ch;
        let k: number;
        if (hover === "lens") {
          const d = Math.hypot(cx - lensX, cy - lensY) / radius;
          k = strength * (1 - smooth(d + cells[i].scatter * 0.18 - 0.1));
        } else {
          k = 1 - smooth(Math.abs(cx - pos) / band + cells[i].scatter * 0.25);
        }
        if (k > 0.01) any = true;
        strengths[i] = k;
        backing[i] = k * 0.95;
      }
      if (!any) return hover === "scan" || active;
      paintMask(backing);
      for (let i = 0; i < cells.length; i++) {
        const k = strengths[i];
        if (k <= 0.01) continue;
        const cell = cells[i];
        const cx = ((i % columns) + 0.5) * cw;
        const density = Math.min(1, cell.tone * 0.9 + cell.edge * 0.2);
        const char =
          hover === "scan" && cx > pos
            ? streakGlyph(cell.seed >>> 4)
            : k < 0.7
              ? flickerGlyph(density, cell.seed >>> 8, phase)
              : densityGlyph(density);
        glyph(char, (i % columns) * cw, Math.floor(i / columns) * ch, k * (0.12 + cell.prominence * 0.85));
      }
      ctx.globalAlpha = 1;
      return true;
    };

    const drawField = (now: number, dt: number) => {
      const p = pointer.current;
      strength += ((p.over ? 1 : 0) - strength) * (1 - Math.exp(-dt / (p.over ? 260 : 480)));
      const t = reduced ? 0 : now / 1000;
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
          Math.sin(xn * 7.2 + t * 0.55 + Math.sin(yn * 3.1 - t * 0.3) * 1.4) *
            Math.cos(yn * 5.4 - t * 0.42) +
          Math.sin((xn + yn) * 4.3 - t * 0.36) * 0.6;
        const tone = smooth((wave + 1.6) / 3.2);
        const keep = tone - cell.scatter * 0.85;
        if (keep <= 0.2) continue;
        const arrive = smooth((intro * 1.3 - (xn * 0.55 + cell.scatter * 0.45)) / 0.3);
        const order = (1 - yn) * 0.45 + cell.scatter * 0.55;
        const gone = smooth((strength * 1.35 - order) / 0.35);
        const alpha = Math.min(0.55, (keep - 0.2) * 1.1) * dim * arrive * (1 - gone);
        const char =
          keep > 0.55 ? flickerGlyph(tone, cell.seed >>> 8, phase) : keep > 0.38 ? ":" : ".";
        glyph(char, col * cw, row * ch - gone * ch * 3, alpha);
      }
      ctx.globalAlpha = 1;
      if (intro >= 1 && !revealed) finishReveal();
      return false;
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
      if (start === null) start = now + delay * 1000;
      if (now < start) {
        frame = requestAnimationFrame(tick);
        return;
      }
      if (!cells.length && !layout()) {
        frame = requestAnimationFrame(tick);
        return;
      }
      if (field) {
        if (now - lastDraw >= 40 || pointer.current.over || strength > 0.01) {
          drawField(now, Math.max(dt, now - lastDraw));
          lastDraw = now;
        }
        frame = requestAnimationFrame(tick);
        return;
      }
      if (!revealed) {
        canvas.style.background = "transparent";
        if (drawReveal(now)) {
          ctx.clearRect(0, 0, width, height);
          finishReveal();
        }
        frame = requestAnimationFrame(tick);
        return;
      }
      if (drawHover(now, dt)) frame = requestAnimationFrame(tick);
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
        if (revealed && !field) ctx.clearRect(0, 0, width, height);
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

    if (field) {
      wake();
    } else if (reduced) {
      finishReveal();
      image.src = src;
      image.onload = () => {
        layout();
        wake();
      };
    } else {
      image.onload = () => {
        layout();
        wake();
      };
      image.onerror = finishReveal;
      image.src = src;
      if (image.complete && image.naturalWidth) layout();
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      canvas.removeEventListener("card:wake", wake);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", wake);
      image.onload = null;
      image.onerror = null;
    };
  }, [canvasRef, pointer, src, hover, delay, dim]);
}

export default function ProjectCard({
  project,
  hover,
  delay,
}: {
  project: Project;
  hover: HoverStyle;
  delay: number;
}) {
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef<Pointer>({ x: 0, y: 0, over: false, enteredAt: 0 });
  const [revealed, setRevealed] = useState(false);
  const [over, setOver] = useState(false);
  const field = !project.image;

  useCardCanvas({
    canvasRef,
    pointer,
    src: project.image,
    hover,
    delay,
    dim: project.dim ? 0.45 : 1,
    onDone: () => setRevealed(true),
  });

  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    pointer.current.x = e.clientX - r.left;
    pointer.current.y = e.clientY - r.top;
  };

  const enter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    move(e);
    pointer.current.over = true;
    pointer.current.enteredAt = performance.now();
    setOver(true);
    canvasRef.current?.dispatchEvent(new Event("card:wake"));
  };

  const leave = () => {
    pointer.current.over = false;
    setOver(false);
    canvasRef.current?.dispatchEvent(new Event("card:wake"));
  };

  const lift = hover === "lift" && revealed && !field;
  const body = (
    <>
      <div
        className="relative aspect-[4/5] w-full overflow-hidden bg-black/[0.025] outline outline-1 -outline-offset-1 outline-black/[0.06]"
        style={{ contain: "paint" }}
      >
        {project.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.image}
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full select-none object-cover [transition:scale_600ms_var(--ease-out)]"
            style={{ scale: lift && over ? "1.035" : "1" }}
          />
        )}
        <canvas
          ref={canvasRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ background: field ? "transparent" : PAPER }}
        />
        {field && (
          <span
            className="absolute inset-0 flex items-center justify-center text-[13px] tracking-[0.01em] text-muted [transition-property:opacity,filter,translate] duration-500 ease-out"
            style={{
              opacity: over ? 1 : 0,
              filter: over ? "blur(0px)" : "blur(4px)",
              translate: over ? "0 0" : "0 4px",
            }}
          >
            coming soon
          </span>
        )}
      </div>
      <motion.div
        initial={{ opacity: 0, filter: reduced ? "blur(0px)" : "blur(6px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.75, delay: reduced ? 0 : delay + 0.35, ease: EASE }}
        className="mt-3 flex items-center justify-between text-[15px]"
      >
        <span className={field ? "text-muted" : "text-ink"}>{project.name}</span>
        <span
          aria-hidden
          className="text-muted [transition-property:opacity,translate] duration-300 ease-out"
          style={{
            opacity: over ? 1 : 0,
            translate: over ? "0 0" : "-4px 4px",
          }}
        >
          {project.href ? "↗" : "soon"}
        </span>
      </motion.div>
    </>
  );

  const frame = "group block select-none [-webkit-tap-highlight-color:transparent]";

  if (!project.href)
    return (
      <div onPointerEnter={enter} onPointerMove={move} onPointerLeave={leave} className={frame}>
        {body}
      </div>
    );

  return (
    <a
      onPointerEnter={enter}
      onPointerMove={move}
      onPointerLeave={leave}
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${frame} [transition-property:scale] duration-150 ease-out active:scale-[0.985]`}
    >
      {body}
    </a>
  );
}
