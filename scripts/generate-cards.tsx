import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const WIDTH = 800;
const HEIGHT = 1000;

const root = process.cwd();
const out = join(root, "public/projects");
mkdirSync(out, { recursive: true });

async function loadGoogleFont(family: string, weight: number) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`,
    { headers: { "User-Agent": "curl/8" } },
  ).then((r) => r.text());
  const url = css.match(/src: url\((.+?)\)/)?.[1];
  if (!url) throw new Error(`no font url for ${family} ${weight}`);
  return fetch(url).then((r) => r.arrayBuffer());
}

const [archivoBold, fragmentMono] = await Promise.all([
  loadGoogleFont("Archivo", 700),
  loadGoogleFont("Fragment Mono", 400),
]);
const overused = readFileSync(join(root, "scripts/fonts/overused-grotesk-500.ttf"));

const fonts = [
  { name: "Archivo", data: archivoBold, weight: 700 as const, style: "normal" as const },
  { name: "Fragment Mono", data: fragmentMono, weight: 400 as const, style: "normal" as const },
  { name: "Overused Grotesk", data: overused, weight: 500 as const, style: "normal" as const },
];

async function render(name: string, node: React.ReactNode) {
  const svg = await satori(node, { width: WIDTH, height: HEIGHT, fonts });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } }).render().asPng();
  const path = join(out, `${name}.png`);
  writeFileSync(path, png);
  console.log(`wrote ${path} (${png.byteLength} bytes)`);
}

const NEPTUNE = {
  bg: "#ffffff",
  ink: "#111400",
  faint: "#d6d6d0",
  dim: "#9a9a92",
  mark: "M35,3 L3,37 L84.662736,117.869894 C98.317558,131.392145 106,149.812002 106,169.029323 L106,283 L151,284 L151,169.823376 C151,150.727789 158.585693,132.414307 172.088312,118.911688 L254,37 L222,5 L151,75 L151,3 L106,3 L106,75 L35,3 Z",
  bar: "M0,162 L256,162 L256,207 L0,207 Z",
};

const HEX = [
  "7f 45 4c 46 02 01 01 00",
  "fd 7b bf a9 fd 03 00 91",
  "1f 20 03 d5 ff 43 00 d1",
];

const SOURCE = [
  "int main(int argc, char **argv)",
  "{",
  "    return patch(argv[1]);",
  "}",
];

await render(
  "neptune",
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      backgroundColor: NEPTUNE.bg,
      color: NEPTUNE.ink,
      padding: "104px 96px",
      fontFamily: "Overused Grotesk",
    }}
  >
    <span style={{ fontSize: 52, letterSpacing: "-0.02em", lineHeight: 1 }}>
      Closed binaries in
    </span>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontFamily: "Fragment Mono",
          fontSize: 21,
          lineHeight: 1.5,
          color: NEPTUNE.faint,
          alignSelf: "flex-start",
        }}
      >
        {HEX.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
      <svg width={74} height={82} viewBox="0 0 256 286">
        <path fill={NEPTUNE.ink} d={NEPTUNE.mark} />
        <path fill={NEPTUNE.ink} d={NEPTUNE.bar} />
      </svg>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontFamily: "Fragment Mono",
          fontSize: 21,
          lineHeight: 1.5,
          color: NEPTUNE.dim,
          alignSelf: "flex-end",
          width: 420,
        }}
      >
        {SOURCE.map((l) => (
          <span key={l} style={{ whiteSpace: "pre" }}>
            {l}
          </span>
        ))}
      </div>
    </div>
    <span
      style={{
        fontSize: 52,
        letterSpacing: "-0.02em",
        lineHeight: 1,
        alignSelf: "flex-end",
      }}
    >
      Open source out
    </span>
  </div>,
);

const PALISADE = {
  bg: "#f6f5f1",
  ink: "#14130f",
  picket: "#cfcdc2",
  accent: "rgba(244, 60, 30, 0.55)",
  mark: "M 200,25 L 230,85 L 230,375 L 170,375 L 170,85 Z M 63.786797,293.786797 L 293.786797,63.786797 L 336.213203,106.213203 L 106.213203,336.213203 Z",
};

const PICKET = "^  \n|==\n|  ";
const PICKET_COUNT = 16;

function Highlight({ children }: { children: string }) {
  return (
    <span style={{ display: "flex" }}>
      <span
        style={{
          backgroundColor: PALISADE.ink,
          color: PALISADE.bg,
          padding: "0 22px 10px 22px",
          marginLeft: -22,
        }}
      >
        {children}
      </span>
    </span>
  );
}

await render(
  "palisade",
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      backgroundColor: PALISADE.bg,
      color: PALISADE.ink,
      overflow: "hidden",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "104px 96px 0 96px" }}>
      <svg width={52} height={52} viewBox="0 0 400 400">
        <path fill={PALISADE.ink} fill-rule="evenodd" d={PALISADE.mark} />
      </svg>
      <span style={{ fontFamily: "Archivo", fontSize: 38, fontWeight: 700, letterSpacing: "-0.02em" }}>
        Palisade
      </span>
    </div>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        justifyContent: "center",
        padding: "0 96px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontFamily: "Archivo",
          fontSize: 80,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1.06,
        }}
      >
        <span>The line</span>
        <span>your data</span>
        <Highlight>never</Highlight>
        <Highlight>crosses.</Highlight>
      </div>
    </div>
    <div
      style={{
        display: "flex",
        whiteSpace: "nowrap",
        fontFamily: "Fragment Mono",
        fontSize: 26,
        lineHeight: 1.2,
        padding: "0 0 40px 10px",
      }}
    >
      {Array.from({ length: PICKET_COUNT }, (_, i) => (
        <span
          key={i}
          style={{
            flexShrink: 0,
            whiteSpace: "pre",
            color: i % 7 === 3 ? PALISADE.accent : PALISADE.picket,
          }}
        >
          {PICKET}
        </span>
      ))}
    </div>
  </div>,
);
