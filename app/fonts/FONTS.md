# Display typefaces

Six self-hosted display faces, switchable via `data-font="<slug>"` on any ancestor
element. Each maps to `--font-display` in `app/globals.css`, which also sets
`--display-weight: 600` so the semibold cut is what renders by default.

Every face below is a static instance cut from an upstream variable font (or a
static release), subset to Latin and compressed to woff2.

---

## archivo

- **Family:** Archivo (Expanded 118, SemiBold / Bold)
- **Foundry / designer:** Omnibus-Type (Héctor Gatti, Pablo Cosgaya and others)
- **License:** SIL Open Font License 1.1
- **Source:** https://github.com/google/fonts/tree/main/ofl/archivo
  (`https://raw.githubusercontent.com/google/fonts/main/ofl/archivo/Archivo%5Bwdth%2Cwght%5D.ttf`)
- **Files:** `archivo-semibold.woff2` (600), `archivo-bold.woff2` (700), instanced at `wdth=118`
- **Why:** A grotesque built for signage and high performance, pushed to 118 of
  its 125 width axis: broad, square-shouldered and evenly spaced, with none of
  the stretch of a true extended cut. The most straightforwardly corporate of
  the set.

## instrument-sans

- **Family:** Instrument Sans (SemiBold / Bold)
- **Foundry / designer:** Rodrigo Fuenzalida and Jordan Egstad, Instrument
- **License:** SIL Open Font License 1.1
- **Source:** https://github.com/google/fonts/tree/main/ofl/instrumentsans
  (`https://raw.githubusercontent.com/google/fonts/main/ofl/instrumentsans/InstrumentSans%5Bwdth%2Cwght%5D.ttf`)
- **Files:** `instrument-sans-semibold.woff2` (600), `instrument-sans-bold.woff2` (700), instanced at `wdth=100`
- **Why:** A contemporary neo-grotesque with generous counters, a large x-height
  and flat, unfussy terminals. Sober to the point of being invisible, which is
  the point: it reads as a company that already exists.

## zilla-slab

- **Family:** Zilla Slab (SemiBold / Bold)
- **Foundry / designer:** Typotheque (Peter Bilak), commissioned by Mozilla
- **License:** SIL Open Font License 1.1
- **Source:** https://github.com/google/fonts/tree/main/ofl/zillaslab
  (`https://raw.githubusercontent.com/google/fonts/main/ofl/zillaslab/ZillaSlab-SemiBold.ttf`)
- **Files:** `zilla-slab-semibold.woff2` (600), `zilla-slab-bold.woff2` (700)
- **Why:** A slab with blunt, unbracketed serifs on a wide, upright skeleton.
  The semibold has weight in the stems without going black, so it feels solid
  and engineered rather than loud.

## gabarito

- **Family:** Gabarito (SemiBold / Bold)
- **Foundry / designer:** Naipe Foundry (Ariel Di Lisio)
- **License:** SIL Open Font License 1.1
- **Source:** https://github.com/google/fonts/tree/main/ofl/gabarito
  (`https://raw.githubusercontent.com/google/fonts/main/ofl/gabarito/Gabarito%5Bwght%5D.ttf`)
- **Files:** `gabarito-semibold.woff2` (600), `gabarito-bold.woff2` (700)
- **Why:** Wide, softly squared bowls and a low contrast that keeps the
  lowercase looking well-fed at every size. Warmer than the two grotesques above
  while staying entirely legible as a wordmark.

## fraunces

- **Family:** Fraunces (SemiBold / Bold, optical size 48, WONK off)
- **Foundry / designer:** Undercase Type (Phaedra Charles and Flavia Zimbardi)
- **License:** SIL Open Font License 1.1
- **Source:** https://github.com/google/fonts/tree/main/ofl/fraunces
  (`https://raw.githubusercontent.com/google/fonts/main/ofl/fraunces/Fraunces%5BSOFT%2CWONK%2Copsz%2Cwght%5D.ttf`)
- **Files:** `fraunces-semibold.woff2` (600), `fraunces-bold.woff2` (700), instanced at `opsz=48 SOFT=0 WONK=0`
- **Why:** The display optical size gives a broad, high-waisted serif with thick
  stems; turning WONK to 0 removes the splayed, wobbly leg forms the family is
  known for. What is left is a confident old-style serif with presence and no
  gimmick.

## syne

- **Family:** Syne (SemiBold / Bold)
- **Foundry / designer:** Bonjour Monde (Lucas Descroix, Bonjour Monde)
- **License:** SIL Open Font License 1.1
- **Source:** https://github.com/google/fonts/tree/main/ofl/syne
  (`https://raw.githubusercontent.com/google/fonts/main/ofl/syne/Syne%5Bwght%5D.ttf`)
- **Files:** `syne-semibold.woff2` (600), `syne-bold.woff2` (700)
- **Why:** The one face with real personality: wide, flat-sided letterforms with
  unusually tight joins and a compressed vertical rhythm. Still a grotesque, so
  it holds together as a wordmark, but it will not be mistaken for anyone else.
