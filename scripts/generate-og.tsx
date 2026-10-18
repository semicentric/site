import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "node:fs";

// Keep the social preview in the same paper/ink palette as the site.
const paper = "#f7f7f5";
const ink = "#101010";
async function font(family: string, weight: number) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`,
    { headers: { "User-Agent": "curl/8" } },
  ).then((res) => {
    if (!res.ok) throw new Error(`Font stylesheet failed: ${family}`);
    return res.text();
  });
  const url = css.match(/src: url\((.+?)\)/)?.[1];
  if (!url) throw new Error(`Missing font: ${family}`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Font download failed: ${family}`);
  return response.arrayBuffer();
}
const [display, mono] = await Promise.all([
  font("Instrument Sans", 600),
  font("Fragment Mono", 400),
]);

// Sample the real emblem into a character grid. The deterministic surrounding
// field echoes the homepage's ASCII animation without using project cards.
const columns = 64;
const rows = 44;
const mark = readFileSync("public/logo.svg", "utf8")
  .replace(/viewBox="[^"]+"/, 'viewBox="20 70 470 350"')
  .replace(/width="[^"]+"/, `width="${columns}"`)
  .replace(/height="[^"]+"/, `height="${rows}"`);
const raster = new Resvg(mark, { fitTo: { mode: "width", value: columns } }).render();
const pixels = raster.pixels;
const glyphs = [];
for (let y = 0; y < rows; y++) {
  for (let x = 0; x < columns; x++) {
    const alpha = pixels[(y * columns + x) * 4 + 3] / 255 || 0;
    const wave = Math.sin(x * 0.19 + y * 0.12) * Math.cos(y * 0.23 - x * 0.08);
    const noise = ((x * 73 + y * 137 + x * y * 11) % 101) / 100;
    const edge = Math.min(1, x / 8, (columns - x) / 9, y / 7, (rows - y) / 7);
    const opacity = alpha > 0.15 ? 0.5 + alpha * 0.5 : (0.05 + Math.max(0, wave) * 0.22) * edge;
    const character = alpha > 0.65 ? "#" : alpha > 0.15 ? "+" : noise > 0.7 ? ":" : noise > 0.35 ? "." : "+";
    glyphs.push(<span key={`${x}-${y}`} style={{ position: "absolute", left: x * 9, top: y * 11, opacity, fontSize: 12, lineHeight: 1 }}>{character}</span>);
  }
}

const svg = await satori(
  <div style={{ width: "100%", height: "100%", display: "flex", background: paper, color: ink, fontFamily: "Instrument Sans", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 64, top: 51, fontSize: 55, letterSpacing: "-0.045em" }}>semicentric</div>
    <div style={{ position: "absolute", left: 64, top: 208, display: "flex", flexDirection: "column", fontSize: 66, letterSpacing: "-0.045em", lineHeight: 1.04 }}>
      <span>The machine</span>
      <span>should answer</span>
      <span>to you.</span>
    </div>
    <div style={{ position: "absolute", left: 610, top: 96, width: 576, height: 484, display: "flex", fontFamily: "Fragment Mono" }}>{glyphs}</div>
    <div style={{ position: "absolute", left: 64, bottom: 54, fontFamily: "Fragment Mono", fontSize: 15, color: "#75746e" }}>security, on your terms.</div>
    <div style={{ position: "absolute", right: 64, bottom: 54, fontFamily: "Fragment Mono", fontSize: 15, color: "#75746e" }}>semicentric.co</div>
  </div>,
  { width: 1200, height: 630, fonts: [
    { name: "Instrument Sans", data: display, weight: 600, style: "normal" },
    { name: "Fragment Mono", data: mono, weight: 400, style: "normal" },
  ] },
);
writeFileSync("public/og-image.png", new Resvg(svg).render().asPng());
console.log("Generated public/og-image.png (1200 × 630)");
