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

## Multi-country support

- Country picker / route; `main.ts` currently picks France directly.
- Generalise the France-specific UI labels still in `app/trainer.ts` ("Départements",
  "Département number", "Plates end in", region / département terminology) into the
  country's `copy`.
- Per-country progress keys already exist (`geotrainer_<country>_progress`).
- Agent skills for researching and building a new country's data (sources, outline
  package, validation) — planned, not started.

## Known issues and ideas

- Accessibility pass: keyboard-only map interaction, screen-reader spot check, axe checks
  once components exist.
- The projection is fitted from prefecture-versus-bounding-box-centre anchors, so city dots
  are approximate.
- Settings and progress from the claude.ai artifact are not migrated (different origin,
  separate localStorage).

## Settled decisions

- No framework in the first cut, to keep behaviour identical to the artifact.
- Map outlines are bundled from npm (`@svg-maps/france.departments`) instead of loaded from
  a CDN at runtime.
- JSON data is validated by zod (`npm run validate:data`), and that runs in CI.
- Visual design follows the original artifact (tricolore-blue accent, Archivo, road-atlas
  look), not the Nihongo style.
- Trainer code never names a country; country specifics are data in `data/<country>/`.
- Paths derive from `import.meta.env.BASE_URL`; the site is served from `/geoguessr-trainer/`.
