# AGENTS.md

Operational context for coding agents working in this repo. Keep this file lean —
it is loaded into every session. Open work and settled decisions live in `docs/backlog.md`.

## What this is

A static, client-only map trainer for GeoGuessr-style geography, starting with France:
regions, départements, cities, rivers, landline phone zones and place-name endings. Each
topic has a Learn mode (explore the map) and a Practice mode (several question types,
rounds, spaced repetition in a Leitner system kept in localStorage). It began as a
single-file claude.ai artifact. No backend. More countries will follow: the code is
country-agnostic and each country is a data folder. Deployed to GitHub Pages at
`https://nskurat.github.io/geoguessr-trainer/` by `.github/workflows/deploy.yml` on push to `main`.

Stack: Vite 8, TypeScript strict, Vitest 4 (node environment), ESLint 10 + typescript-eslint,
zod for data validation. No UI framework yet: the UI is the artifact's imperative DOM/SVG
code converted to TypeScript. Node >= 22.22.

## Commands

Run from the repo root. There is no nested `package.json`.

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server (root is `trainer-app/`), `http://localhost:5173` |
| `npm run build` | Builds into `dist/` |
| `npm run preview` | Serves the build at its real sub-path |
| `npm test` | Vitest, run once (`*.test.ts` in `__tests__/` folders) |
| `npm run test:coverage` | Coverage report |
| `npm run typecheck` | `tsc --noEmit` — must stay clean |
| `npm run lint` | ESLint over `trainer-app` and `scripts` — must stay clean |
| `npm run validate:data` | Zod schemas + referential checks for every country; exits non-zero on errors |

## Layout

```
vite.config.js          Vite + vitest config (root: trainer-app, base /geoguessr-trainer/ for build/preview)
scripts/validate-content.ts   Validates every country's data (npm run validate:data)
trainer-app/
  index.html            Single page: header, control bar, map container, side panel
  src/
    main.ts             Entry: picks the country (France), builds the index, starts the trainer
    index.css           All styles; colour tokens on :root with light/dark themes
    app/trainer.ts      The imperative UI (map rendering, pan/zoom, controls, practice flow, panel).
                        Temporary shape: to be split into components in the planned React port
    types/geo.ts        Country-agnostic data types (Country, Region, Department, City, River, ...)
    types/trainer.ts    StudySet, Mode, QuestionKind, Outcome
    data/france/        regions, departements, cities, rivers, phone, placeNames .json + index.ts
                        (the Country object: projection reference latitude, label nudges, copy text)
    services/country/   countryIndex.ts (lookups, back-references), schema.ts (zod + validateCountry)
    services/geo/       projection.ts (fit lat/lon -> SVG affine projection from anchors; haversine)
    services/practice/  spacedRepetition (Leitner boxes), round (queue, scoring, requeue misses),
                        distractors (multiple-choice options), scoring (distance bands), settings
    services/storage/   trainerStorage.ts: TrainerStorage adapter, localStorage impl with memory fallback
    utils/              random (shuffle with injectable rng), html (escapeHtml), svgPath (smoothPath)
```

## Conventions

- TypeScript strict; `tsc --noEmit` and lint must stay clean. No new `any`.
- Pure logic (scheduling, scoring, projection, distractors, round queue) lives in
  `services/` or `utils/` as side-effect-free modules **with unit tests**, with rng and
  time injectable for determinism. The UI layer stays thin.
- New external data or storage goes behind an adapter interface — see
  `services/storage/trainerStorage.ts` for the pattern.
- Country data is data only. The trainer code never names a country; France-specific
  text lives in `data/france/index.ts` `copy`.
- Paths are never hardcoded — derive from `import.meta.env.BASE_URL`.
- UI/UX follows the original artifact's design (tricolore-blue accent, Archivo font,
  road-atlas look, CSS custom-property colour tokens with light/dark themes in
  `src/index.css`), not the Nihongo repo's style.

## Constraints

- **Data JSON is hand-curated study data**, approximate and not survey-grade. Change it
  deliberately and keep `npm run validate:data` clean.
- **Attribution is a licence requirement.** Département outlines are "France departments
  map" by Victor Cazanave (svg-maps, npm `@svg-maps/france.departments` v1), CC BY 4.0 —
  the credit line in the page footer must stay. Phone zones follow the Wikipedia table
  of French area codes.
- The app is served from the `/geoguessr-trainer/` sub-path (`vite.config.js` `base`;
  `VITE_BASE_PATH` overrides). Never hardcode paths.
- Progress and settings live in the user's localStorage, per country
  (`geotrainer_<country>_progress`). No backend, telemetry or key transmission.

## Adding a country

Add `data/<country>/` JSON plus an `index.ts` exporting a `Country`, an outline (an
`@svg-maps` package or equivalent with matching department ids), and register it in
`scripts/validate-content.ts`. The country selection UI is not built yet (see backlog);
agent skills to help build future countries are planned.

## Where things are recorded

- Open work, known issues, deferred ideas and settled decisions: `docs/backlog.md` (the only tracker).

## Next up

Port the UI layer (`app/trainer.ts`) to React + TypeScript with identical behaviour and
the artifact's visual design — section 1 of `docs/backlog.md`. Out-of-scope things you
notice go in the backlog, not fixed in passing.
