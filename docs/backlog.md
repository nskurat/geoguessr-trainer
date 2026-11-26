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

- Peru signals the engine can't express yet (see `data/peru/RESEARCH.md` §8): landscape
  zones (costa / sierra / selva and sub-zones), highway numbers and km markers, coverage
  gaps (Iquitos is an isolated island of coverage), pole stickers, the Moquegua bollard,
  Lima's inverted-J lamp posts, mototaxi types, crops and soil, volcanoes, Titicaca brick.
- Peru data gaps: Mantaro course (U-shaped lower course not mapped reliably), Chira towns,
  and a few hand-drawn course stretches (Urubamba source, Quillabamba–Sepahua) accurate to
  only a few km.
- Small units are hard to hit at full-map zoom (Paris petite couronne; Lima y Callao is
  fine). Consider a larger hit area or auto-zoom for tiny departments.

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
- France's local phone prefixes (0Z AB) are shown, never quizzed.

- No framework in the first cut, to keep behaviour identical to the artifact.
- Map outlines are bundled from npm (`@svg-maps/france.departments`) instead of loaded from
  a CDN at runtime.
- JSON data is validated by zod (`npm run validate:data`), and that runs in CI.
- Visual design follows the original artifact (tricolore-blue accent, Archivo, road-atlas
  look), not the Nihongo style.
- Trainer code never names a country; country specifics are data in `data/<country>/`.
- Paths derive from `import.meta.env.BASE_URL`; the site is served from `/geoguessr-trainer/`.
- Interface languages: English (source) and Belarusian in the official orthography; place
  names stay official (Latin script); country copy is per language in
  `data/<country>/copy.<lang>.ts`, loaded with the country; switching re-renders in place.
