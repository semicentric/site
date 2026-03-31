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
      viewBox="-24 0 604 440"
      xmlns="http://www.w3.org/2000/svg"
      width="80"
      height="58"
    >
      <path d="m0 260 50.967-60h505.033l-50.967 60z" fill="white" />
      <path d="m506 0h-88.158l-246.842 440h88.158z" fill="white" />
      <circle cx="496" cy="135" r="35" fill="white" />
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
