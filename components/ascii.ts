export const ATLAS = ".:-=+/<x%#";

const DENSITY = ".:-=+x%#";
const STREAK = "-=";
const DENSE = "x%#/";
const MID = ":=+<";
const LOW = ".:";

export const clamp = (v: number) => Math.max(0, Math.min(1, v));
export const smooth = (v: number) => {
  const t = clamp(v);
  return t * t * (3 - 2 * t);
};

export function scatter(index: number) {
  let h = Math.imul(index + 1, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function densityGlyph(density: number) {
  return DENSITY[Math.min(DENSITY.length - 1, Math.max(0, Math.floor(density * DENSITY.length)))];
}

export function flickerGlyph(density: number, seed: number, phase: number) {
  const set = density > 0.6 ? DENSE : density > 0.22 ? MID : LOW;
  return set[(seed + phase) % set.length];
}

export function streakGlyph(seed: number) {
  return STREAK[seed % STREAK.length];
}

export type Cell = { tone: number; edge: number; prominence: number; seed: number; scatter: number };

export function sampleCells(pixels: Uint8ClampedArray, columns: number): Cell[] {
  const light = Array.from({ length: pixels.length / 4 }, (_, i) => {
    const o = i * 4;
    const a = pixels[o + 3] / 255;
    return ((pixels[o] * 0.2126 + pixels[o + 1] * 0.7152 + pixels[o + 2] * 0.0722) / 255) * a + 1 - a;
  });
  const sorted = [...light].sort((a, b) => a - b);
  const low = sorted[Math.floor(sorted.length * 0.03)] ?? 0;
  const high = sorted[Math.floor(sorted.length * 0.97)] ?? 1;
  const range = Math.max(0.25, high - low);
  const dark = (sorted[Math.floor(sorted.length / 2)] ?? 1) < 0.45;
  return light.map((value, i) => {
    const x = i % columns;
    const left = light[x > 0 ? i - 1 : i];
    const right = light[x < columns - 1 ? Math.min(light.length - 1, i + 1) : i];
    const above = light[i >= columns ? i - columns : i];
    const below = light[i + columns < light.length ? i + columns : i];
    const edge = Math.min(1, (Math.hypot(right - left, below - above) * 1.2) / range);
    const n = high - low < 0.25 ? value : (value - low) / range;
    const tone = Math.pow(clamp(dark ? n : 1 - n), 1.4);
    return {
      tone,
      edge,
      prominence: Math.max(tone * 0.75, edge),
      seed: Math.imul(i + 1, 2654435761) >>> 0,
      scatter: scatter(i),
    };
  });
}

// Cells arrive left to right like the mark's trailing ray, loosened by noise
// so the front reads as a sweep rather than a wipe.
export function sweepOrder(column: number, columns: number, cell: Cell) {
  return (column / Math.max(1, columns - 1)) * 0.55 + cell.scatter * 0.45 - cell.prominence * 0.12;
}
