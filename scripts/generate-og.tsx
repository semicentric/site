import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { writeFileSync } from "node:fs";

const fontData = await fetch(
  "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf"
).then((res) => res.arrayBuffer());

const svg = await satori(
  <div
    style={{
      background: "#0a0a0a",
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "20px",
    }}
  >
    <svg
      fill="none"
      viewBox="31 164 450 184"
      xmlns="http://www.w3.org/2000/svg"
      width="126"
      height="52"
    >
      <path d="M115 251.5 L126 248.5 L250 174.5 L137 194 L116 238Z" fill="white" />
      <path d="M57 262.5 L87.5 266 L98.5 263.5 L64.5 244Z" fill="white" />
      <path d="M125.5 265.5 L160 278 L471 256 L147 255.5Z" fill="white" />
      <path d="M41 303.5 L65.5 326.5 L105.5 290 L105.5 276.5Z" fill="white" />
      <path d="M203.5 336.5 L129.5 285.5 L129.5 294 L168.5 337.5Z" fill="white" />
    </svg>
    <div
      style={{
        display: "flex",
        fontSize: 48,
        fontFamily: "Inter",
        fontWeight: 500,
        color: "white",
        letterSpacing: "-0.03em",
      }}
    >
      semicentric
    </div>
  </div>,
  {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Inter",
        data: fontData,
        style: "normal",
        weight: 500,
      },
    ],
  }
);

const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: 1200 },
});
const pngData = resvg.render();
const pngBuffer = pngData.asPng();

writeFileSync("public/og-image.png", pngBuffer);
console.log("Generated public/og-image.png");
