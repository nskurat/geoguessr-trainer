# Backlog

The one tracker. Delete an item when it is done; git history is the record. Add anything
out of scope you notice as a short entry: what, where, why.

## Next: React + TypeScript port of the UI layer

Replace the imperative `app/trainer.ts` with components. Behaviour stays identical and the
visual design stays the artifact's (see Settled decisions); this is a structural change only.
- Stage 1: add React and the component test setup (jsdom project for `*.test.tsx`,
  Testing Library), keeping `trainer.ts` running.
- Stage 2: extract state (country, study set, mode, settings, progress) into hooks over the
  existing `services/`; no logic moves out of `services/`.
- Stage 3: port the map (SVG rendering, pan/zoom, labels) and the side panel / Learn mode.
- Stage 4: port Practice (question kinds, rounds, feedback, results) and the control bar.
- Stage 5: delete `trainer.ts`; compare against the artifact side by side, light and dark.
- Add jsdom component tests per stage; pure logic keeps its node-environment unit tests.
- To decide: routing (country in the URL) now or with multi-country support below.

## Multi-country follow-ups

- Design for landscape and other visual signals: [visual meta spec](specs/visual-meta.md)
  (approved 2026-11-28; Peru costa / sierra / selva pilot after React port stages 1–3).
- Road numbers as a study set (zoom-dependent road layer, search-and-click practice) and a
  country locator map: [roads spec](specs/roads.md) (draft, awaiting the owner's answers;
  proposed pilot: Germany's Autobahns, after React port stages 3–4).
- Peru signals the engine can't express yet (see `data/peru/RESEARCH.md` §8): landscape
  zones (costa / sierra / selva and sub-zones), highway numbers and km markers, coverage
  gaps (Iquitos is an isolated island of coverage), pole stickers, the Moquegua bollard,
  Lima's inverted-J lamp posts, mototaxi types, crops and soil, volcanoes, Titicaca brick.
- Peru data gaps: Mantaro course (U-shaped lower course not mapped reliably), Chira towns,
  and a few hand-drawn course stretches (Urubamba source, Quillabamba–Sepahua) accurate to
  only a few km.
- Germany signals that need sub-state units (see `data/germany/RESEARCH.md` §7): landline
  area-code zones (the first digit cuts across the Länder, so no `tel` set) and Kreis plate
  codes. Both need district outlines (e.g. BKG VG2500 Kreise, dl-de/by-2-0). Also
  landscape, architecture, bollards, and Sorbian/Danish bilingual signs.
- Poland signals that need sub-voivodeship units (see `data/poland/RESEARCH.md` §3): landline
  area-code zones (50 two-digit zones named after towns, several per voivodeship, so no `tel`
  set) and powiat plate codes (the first letter is shown per voivodeship in `plate`; the 2–3
  letter county codes need powiat outlines). Also the 2022 extra first letters (V, J, A, Y, X, I)
  should be re-checked against the Ministry regulation when isap.sejm.gov.pl is reachable.
- Germany data gaps: Natural Earth's upper Spree is wrong (Bautzen left off it); the
  hand-drawn tails (Elbe to Cuxhaven, Weser to Bremerhaven, Ems to Emden) are approximate.
  The upper Lahn (above Marburg) is not drawn: NE's "Lahn" follows the Ohm there. The
  GeoGuessr signals and the river lengths in its RESEARCH.md / rivers.json were written
  while the web was blocked and should be re-checked against plonkit and Wikipedia.
- Outlines generated before the `build-outline.ts` conformal fix (Peru's `outline.json`) are
  about 1% squashed horizontally (x was scaled by cos(refLat) twice). Regenerate with
  `npm run build:outline -- peru` when convenient and re-check its label nudges.
- Region labels overlap at full-map zoom on phones (e.g. "Pays de la Loire" / "Centre-Val
  de Loire"), as in the original artifact: needs label-collision handling (hide or shorten
  the lower-priority label until zoomed).
- Small units are hard to hit at full-map zoom (Paris petite couronne; Lima y Callao is
  fine). Consider a larger hit area or auto-zoom for tiny departments.

- Small-city dots are drawn over big-city labels on phones (each city's dot and label are one
  group, so later dots cover earlier labels): draw labels in a layer above all dots. Visible
  with Germany's 98 cities.

## Community requests (planned, not built)

The site is shared with the owner's Belarusian GeoGuessr community. Agreed plan:
- Issue forms (Belarusian first, English below) for "Add a country" and "Suggest a feature /
  report a problem", auto-labelled `needs-review`.
- On the site: "＋ Request a country…" in the country picker and footer links that open
  pre-filled GitHub issue URLs (no API keys; requesters need a GitHub account).
- The owner approves by labelling (`agent:build`) or assigning the GitHub Copilot coding agent;
  agents follow `add-country`, and Claude reviews with `review-agent-pr`.
- Done by the owner (2026-11-27): Copilot budget set, and the Copilot firewall allowlist
  (Wikipedia en/de/fr/es/be, plonkit, geohints, geonames, naturalearthdata, skarnik.by,
  slounik.org, verbum.by) in the repo's Copilot settings.

## Interface languages follow-ups

- Taraškievica (`be-tarask`) as a separate language variant; the current Belarusian is the
  official orthography. Needs its own catalogue and copies (дэпартамэнт, ідэнтычнасьць…).
- Belarusian text was checked against dictionaries (`src/i18n/README.md`), not by a native
  reviewer; a native read of the tips and name-pattern texts is worth doing.
- Belarusian sentences assume masculine inanimate country terms (accusative = nominative).
  A country whose term is feminine (e.g. правінцыя) needs case forms in `Term`.
- After a live language switch, the feedback line of the question on screen stays in the
  previous language until the next question (it is computed when answering).
- Optional Belarusian exonyms for well-known places (Парыж, Луара) as a learner aid; place
  names are deliberately kept official today.
- React port: the active language becomes context; `relocalizeTrainer` goes away.

## Known issues and ideas

- Accessibility pass: keyboard-only map interaction, screen-reader spot check, axe checks
  once components exist.
- The projection is fitted from prefecture-versus-bounding-box-centre anchors, so city dots
  are approximate.
- Settings and progress from the claude.ai artifact are not migrated (different origin,
  separate localStorage).

## Settled decisions

- A country offers only the study sets worth drilling for it (`Country.sets`, decided with
  the `geoguessr-pro` skill). Peru skips name endings: Quechua endings cover the whole sierra
  and don't split it.
- Peru: Callao is merged into Lima Metropolitana ("Lima Metropolitana y Callao") — Natural
  Earth's Callao boundary is wrong and the two are indistinguishable on Street View. The
  top-level grouping (Lima y Callao, Norte, Centro, Sur, Oriente) is a study grouping, not
  an official one. Plate letters are left out: the registry-zone letters are shared between
  regions, changed by 2024–2025 decrees, and blurred on Street View.
- Poland: the 16 voivodeships are the departments, grouped into the seven official NUTS-1
  macroregions. No phone set (zones are finer than voivodeships); the first plate letter is
  shown per voivodeship. Three name patterns (-ice, -ów, -owo/-ewo) chosen from GeoNames counts.
- France's local phone prefixes (0Z AB) are shown, never quizzed.
- Germany: the 16 Länder are the departments, grouped into four study macro-regions (Nord,
  West, Süd, Ost = former GDR + Berlin). No phone codes or plates: area-code zones and
  Kreis codes don't follow state borders. The validator only requires a phone zone per
  department when a country offers `tel`.

- No framework in the first cut, to keep behaviour identical to the artifact.
- Map outlines are bundled from npm (`@svg-maps/france.departments`) instead of loaded from
  a CDN at runtime.
- JSON data is validated by zod (`npm run validate:data`), and that runs in CI.
- Visual design follows the original artifact (tricolore-blue accent, Archivo, road-atlas
  look), not the Nihongo style.
- Trainer code never names a country; country specifics are data in `data/<country>/`.
- Paths derive from `import.meta.env.BASE_URL`; the site is served from `/geoguessr-trainer/`.
- Belarusian is the default interface language (whatever the browser's language); English via
  the picker or `?lang=en`, remembered once chosen.
- Interface languages: English (source) and Belarusian in the official orthography; place
  names stay official (Latin script); country copy is per language in
  `data/<country>/copy.<lang>.ts`, loaded with the country; switching re-renders in place.
