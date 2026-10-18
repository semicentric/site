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

const [archivoBold, fragmentMono, hanken] = await Promise.all([
  loadGoogleFont("Archivo", 700),
  loadGoogleFont("Fragment Mono", 400),
  loadGoogleFont("Hanken Grotesk", 500),
]);
const overused = readFileSync(join(root, "scripts/fonts/overused-grotesk-500.ttf"));

const fonts = [
  { name: "Hanken Grotesk", data: hanken, weight: 500 as const, style: "normal" as const },
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

const EXCHANGE = [
  ["jane@acme.com", "<EMAIL_1>"],
  ["+1 415 555 0132", "<PHONE_1>"],
  ["4111 1111 1111 1111", "<CARD_1>"],
  ["sk-live-9f2c81e0", "<KEY_1>"],
];

function Highlight({ children }: { children: string }) {
  return (
    <span style={{ display: "flex" }}>
      <span
        style={{
          backgroundColor: PALISADE.ink,
          color: PALISADE.bg,
          padding: "0 18px 8px 18px",
          marginLeft: -18,
        }}
      >
        {children}
      </span>
    </span>
  );
}

function Column({ values, align, color }: { values: string[]; align: "flex-start" | "flex-end"; color: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align,
        gap: 18,
        width: 250,
        fontFamily: "Fragment Mono",
        fontSize: 20,
        color,
      }}
    >
      {values.map((v) => (
        <span key={v}>{v}</span>
      ))}
    </div>
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
      justifyContent: "space-between",
      backgroundColor: PALISADE.bg,
      color: PALISADE.ink,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "104px 96px 0 96px",
        fontFamily: "Archivo",
        fontSize: 64,
        fontWeight: 700,
        letterSpacing: "-0.02em",
        lineHeight: 1.08,
      }}
    >
      <span>The line your data</span>
      <Highlight>never crosses.</Highlight>
    </div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 72px" }}>
      <Column values={EXCHANGE.map(([real]) => real)} align="flex-end" color={PALISADE.picket} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ width: 2, height: 64, backgroundColor: PALISADE.accent }} />
        <svg width={58} height={58} viewBox="0 0 400 400">
          <path fill={PALISADE.ink} fill-rule="evenodd" d={PALISADE.mark} />
        </svg>
        <div style={{ width: 2, height: 64, backgroundColor: PALISADE.accent }} />
      </div>
      <Column values={EXCHANGE.map(([, placeholder]) => placeholder)} align="flex-start" color={PALISADE.ink} />
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

// Phone cards render at roughly 165px wide, so these keep one idea per card
// at type sizes that survive that scale.
await render(
  "neptune-mobile",
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      backgroundColor: NEPTUNE.bg,
      color: NEPTUNE.ink,
      padding: "88px 80px",
      fontFamily: "Overused Grotesk",
      fontSize: 96,
      letterSpacing: "-0.025em",
      lineHeight: 1,
    }}
  >
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span>Closed</span>
      <span>binaries in</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={150} height={168} viewBox="0 0 256 286">
        <path fill={NEPTUNE.ink} d={NEPTUNE.mark} />
        <path fill={NEPTUNE.ink} d={NEPTUNE.bar} />
      </svg>
    </div>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      <span>Open</span>
      <span>source out</span>
    </div>
  </div>,
);

await render(
  "palisade-mobile",
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      backgroundColor: PALISADE.bg,
      color: PALISADE.ink,
      overflow: "hidden",
    }}
  >
    <div style={{ display: "flex", padding: "88px 80px 0 80px" }}>
      <svg width={96} height={96} viewBox="0 0 400 400">
        <path fill={PALISADE.ink} fill-rule="evenodd" d={PALISADE.mark} />
      </svg>
    </div>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "0 80px",
        fontFamily: "Archivo",
        fontSize: 104,
        fontWeight: 700,
        letterSpacing: "-0.02em",
        lineHeight: 1.04,
      }}
    >
      <span>The line</span>
      <span>your data</span>
      <Highlight>never</Highlight>
      <Highlight>crosses.</Highlight>
    </div>
    <div
      style={{
        display: "flex",
        whiteSpace: "nowrap",
        fontFamily: "Fragment Mono",
        fontSize: 44,
        lineHeight: 1.15,
        padding: "0 0 36px 14px",
      }}
    >
      {Array.from({ length: 10 }, (_, i) => (
        <span
          key={i}
          style={{
            flexShrink: 0,
            whiteSpace: "pre",
            color: i % 4 === 2 ? PALISADE.accent : PALISADE.picket,
          }}
        >
          {PICKET}
        </span>
      ))}
    </div>
  </div>,
);

// SRAM's current product render and mark, retained locally so cards can be
// regenerated without a sibling checkout. Source: semicentric/SRAM/web/public.
const SRAM = {
  paper: "#f1f1ed",
  ink: "#111210",
  hero: `data:image/jpeg;base64,${readFileSync(join(root, "scripts/assets/sram-hero.jpg")).toString("base64")}`,
  mark: readFileSync(join(root, "scripts/assets/sram-mark.svg"), "utf8").match(/d="([^"]+)"/)![1],
};

// Rasterize the soft mask directly: Satori's multi-stop alpha gradients can
// introduce a visible band at the top edge of the image.
const featherStops = [[0, 0], [0.05, 0.04], [0.10, 0.16], [0.16, 0.38], [0.23, 0.68], [0.30, 0.9], [0.38, 1], [0.70, 1], [0.76, 0.9], [0.83, 0.65], [0.90, 0.3], [1, 0]];
const feathered = new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 1800 1200"><defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">${featherStops.map(([offset, opacity]) => `<stop offset="${offset}" stop-color="white" stop-opacity="${opacity}"/>`).join("")}</linearGradient><mask id="soft"><rect width="1800" height="1200" fill="url(#fade)"/></mask></defs><image href="${SRAM.hero}" width="1800" height="1200" mask="url(#soft)"/></svg>`).render().asPng();
const sramPhoto = `data:image/png;base64,${feathered.toString("base64")}`;

for (const mobile of [false, true]) {
  await render(
    mobile ? "sram-mobile" : "sram",
    <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", backgroundColor: SRAM.paper, color: SRAM.ink, fontFamily: "Hanken Grotesk", fontWeight: 500, overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", position: "absolute", left: 80, top: 88, fontSize: mobile ? 96 : 78, letterSpacing: "-0.025em", lineHeight: 1.04 }}>
        <span>Machines</span>
        <span>that make</span>
        <span>machines.</span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={sramPhoto} alt="" width={900} height={600} style={{ position: "absolute", left: -24, top: mobile ? 390 : 350 }} />
      <div style={{ display: "flex", alignItems: "center", position: "absolute", left: 80, bottom: 72, gap: 20 }}>
        <svg width={mobile ? 116 : 86} height={mobile ? 43 : 32} viewBox="0 0 915 340">
          <path fill={SRAM.ink} d={SRAM.mark} />
        </svg>
      </div>
    </div>,
  );
}
