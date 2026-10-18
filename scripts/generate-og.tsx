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
  font("IBM Plex Mono", 700),
]);

// Render directly into a square-cell grid, preserving the emblem's aspect
// ratio. One solid glyph and a hard coverage threshold keep the silhouette
// crisp; no background noise or translucent fringe characters.
const columns = 60;
const rows = 25;
const cell = 450 / columns;
const mark = readFileSync("public/logo.svg", "utf8")
  .replace(/viewBox="[^"]+"/, 'viewBox="31 164 450 187.5"')
  .replace("<svg ", `<svg width="${columns}" height="${rows}" `);
const raster = new Resvg(mark).render();
const pixels = raster.pixels;
const glyphs = [];
for (let y = 0; y < rows; y++) {
  for (let x = 0; x < columns; x++) {
    const alpha = pixels[(y * columns + x) * 4 + 3] / 255;
    if (alpha < 0.45) continue;
    glyphs.push(
      <span key={`${x}-${y}`} style={{ position: "absolute", left: x * cell, top: y * cell, fontSize: 9, lineHeight: 1 }}>#</span>,
    );
  }
}

const svg = await satori(
  <div style={{ width: "100%", height: "100%", display: "flex", background: paper, color: ink, fontFamily: "Instrument Sans", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 64, top: 49, width: 1072, display: "flex", justifyContent: "center", fontSize: 56, letterSpacing: "-0.045em" }}>semicentric</div>
    <div style={{ position: "absolute", left: 395, top: 161, width: 450, height: 188, display: "flex", fontFamily: "IBM Plex Mono", fontWeight: 700 }}>{glyphs}</div>
    <div style={{ position: "absolute", left: 64, top: 399, width: 1072, display: "flex", flexDirection: "column", alignItems: "center", fontSize: 66, letterSpacing: "-0.045em", lineHeight: 1.04 }}>
      <span>The machine should</span>
      <span>answer to you.</span>
    </div>
  </div>,
  { width: 1200, height: 630, fonts: [
    { name: "Instrument Sans", data: display, weight: 600, style: "normal" },
    { name: "IBM Plex Mono", data: mono, weight: 700, style: "normal" },
  ] },
);
writeFileSync("public/og-image.png", new Resvg(svg).render().asPng());
console.log("Generated public/og-image.png (1200 × 630)");
