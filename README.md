# GeoGuessr Trainer 🗺️

[![Live Site](https://img.shields.io/badge/Live_Site-GitHub_Pages-0055a4?style=for-the-badge&logo=github)](https://nskurat.github.io/geoguessr-trainer/)

🔗 **Live Site**: [https://nskurat.github.io/geoguessr-trainer/](https://nskurat.github.io/geoguessr-trainer/)

An interactive map trainer for GeoGuessr-style geography, starting with **France**:
regions, départements, cities, rivers, landline phone zones and place-name endings.
Every topic has a **Learn** mode (explore the map) and a **Practice** mode (several
question types, rounds, and spaced repetition in a Leitner system kept in your
browser's localStorage). It runs entirely in the browser — no backend.

For the codebase layout, conventions and constraints, see [AGENTS.md](AGENTS.md) —
that's the file kept current for both contributors and coding agents. This README
covers only how to run the thing.

## Getting started

Requires Node.js 22.22 or newer.

```bash
npm install
npm run dev
```

Opens the Vite dev server at `http://localhost:5173`.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally, at its real sub-path |
| `npm test` | Run the test suite once |
| `npm run test:coverage` | Test suite with a coverage report |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run validate:data` | Validate every country's data (zod schemas + referential checks) |

There is one `package.json`, at the repo root — `trainer-app/` holds the app's
source but is not a separate npm package.

## Deployment

Pushing to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
(it can also be run by hand via `workflow_dispatch`): typecheck, lint, test and data
validation run first, then `npm run build` produces `dist/`, which GitHub Actions
publishes to GitHub Pages at the URL above. `dist/` is git-ignored and only ever
produced by the build. Pull requests run the same checks through
[`.github/workflows/ci.yml`](.github/workflows/ci.yml), without publishing.

The site is served from the `/geoguessr-trainer/` sub-path; `vite.config.js` sets
`base` accordingly, and the `VITE_BASE_PATH` environment variable overrides it.

One-time setup: in the repository's **Settings → Pages**, set the **Source** to
**GitHub Actions**. Without it the deploy job cannot publish.

## Credits and licence

The code is released under the [MIT licence](LICENSE).

The département outlines are "France departments map" by Victor Cazanave, from
[svg-maps](https://github.com/VictorCazanave/svg-maps) (npm `@svg-maps/france.departments`),
licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The credit line in the
page footer must stay. Phone zones follow the Wikipedia table of French area codes. The
study data is hand-curated and approximate — not survey-grade.

## What's next

Open work, known issues and settled architecture decisions are in
[docs/backlog.md](docs/backlog.md). Next up: porting the UI layer to React.
