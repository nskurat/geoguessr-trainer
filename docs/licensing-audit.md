# Licensing audit

Checked 2026-11-28 against [the licensing policy](licensing.md) after merging the
complete-facts clarification and the OpenStreetMap road-data exception.

## Country findings and credits

| Country | Sources and licences | Footer in English and Belarusian |
|---|---|---|
| France | [Research notes](../trainer-app/src/data/france/RESEARCH.md) | Victor Cazanave's France departments map and CC BY 4.0 link retained; ARCEP numbering-plan reference added alongside Wikipedia |
| Peru | [Research notes](../trainer-app/src/data/peru/RESEARCH.md) | Natural Earth credited; Callao merge disclosed; factual references acknowledged |
| Germany | [Research notes](../trainer-app/src/data/germany/RESEARCH.md) | Natural Earth and GeoNames (CC BY 4.0) credited; town selection and courses described as study approximations |

`trainer-app/src/app/trainer.ts` renders the active country's localized `credits` into
`#credits` in `trainer-app/index.html`. Natural Earth credit is a policy courtesy, not
a licence requirement. The owner accepted both phone datasets under the facts rule.
Peru's MTC chart and France's ARCEP plan are now cited as primary authorities, with
Wikipedia as secondary. The primary links were identified from cited regulator
references; direct regulator/archival access was blocked, so no independent row-level
verification is claimed. No JSON or geometry was removed or replaced.

English tips, subtitles and the Belarusian copy/data translations were reviewed
against the country notes, with spot checks against Plonk It and relevant Wikipedia
pages. Sampled overlaps were names, signals and facts, not close copies of phrasing.
GeoHints could not be fetched in this environment, so that comparison is unverified.
France's phone tip and hint were rewritten in both languages to explain how to use
legacy prefixes without claiming they prove where a number is now.

No OSM extract or input was found in the app, generator or documented sources. The
new exception is only for road geometry/numbers: keep those data in separate
`*.osm.json` files, record the extract and transformations, and give the linked
“Roads © OpenStreetMap contributors, ODbL” credit in every language. It does not clear
other ODbL data or an undocumented map trace.

## npm dependencies

Locked versions and declared SPDX licences from `package-lock.json`; the installed
France outline package was also checked against its `LICENSE.md`. Scope is the npm
package graph, not separate tools supplied by the runner, such as the Playwright
Chromium binary. The first row is the only production package. All others are for
development, validation, tests or building; the browser bundle doesn't run them.

| Direct package | Locked version | Scope | Licence |
|---|---:|---|---|
| `@svg-maps/france.departments` | 1.0.1 | Runtime | CC-BY-4.0 |
| `@eslint/js` | 10.0.1 | Dev | MIT |
| `@types/geojson` | 7946.0.16 | Dev | MIT |
| `@types/node` | 22.20.7 | Dev | MIT |
| `@types/topojson-client` | 3.1.5 | Dev | MIT |
| `@types/topojson-server` | 3.0.4 | Dev | MIT |
| `@types/topojson-simplify` | 3.0.3 | Dev | MIT |
| `@types/topojson-specification` | 1.0.5 | Dev | MIT |
| `@vitest/coverage-v8` | 4.1.12 | Dev | MIT |
| `eslint` | 10.15.0 | Dev | MIT |
| `globals` | 17.14.0 | Dev | MIT |
| `playwright` | 1.65.1 | Dev | Apache-2.0 |
| `topojson-client` | 3.1.0 | Dev | ISC |
| `topojson-server` | 3.0.1 | Dev | ISC |
| `topojson-simplify` | 3.0.3 | Dev | ISC |
| `tsx` | 4.23.15 | Dev | MIT |
| `typescript` | 5.9.3 | Dev | Apache-2.0 |
| `typescript-eslint` | 8.74.0 | Dev | MIT |
| `vite` | 8.4.0 | Dev | MIT |
| `vitest` | 4.1.12 | Dev | MIT |
| `zod` | 4.6.7 | Dev | MIT |

All **226** lockfile entries (including optional platform variants) declare a licence:
173 MIT, 17 Apache-2.0, 12 MPL-2.0, 10 ISC, 6 BSD-2-Clause, 5 BSD-3-Clause,
2 BlueOak-1.0.0, and 1 CC-BY-4.0. No GPL/LGPL/AGPL or missing licence declarations
were found. This is a package-metadata audit, not a review of every upstream package's
vendored code. To print the full per-entry inventory without installing optional
platform binaries, run from the repository root:

```sh
node -e 'for (const [path, p] of Object.entries(require("./package-lock.json").packages)) if (path) console.log(`${path}@${p.version}\t${p.dev ? "dev" : "runtime"}\t${p.license ?? "MISSING"}`)'
```

**Policy flags:** `lightningcss` and its 11 platform packages (1.33.0) declare [MPL-2.0](https://www.mozilla.org/en-US/MPL/2.0/),
a file-level copyleft licence, not GPL. They are CSS build tools; no MPL package is
shipped to visitors. `minimatch` 11.0.9 and `@isaacs/nonrecursive-glob-match` 1.1.0
declare the permissive [Blue Oak Model License 1.0.0](https://blueoakcouncil.org/license/1.0.0),
not listed by name in the policy. They are also dev-only. No packages were changed.
Retain upstream licence/notice files if redistributing the tools themselves.

## Fonts and other assets

| Asset | Source and licence | Finding |
|---|---|---|
| Archivo | [Archivo Project Authors, SIL OFL 1.1](https://github.com/google/fonts/blob/main/ofl/archivo/OFL.txt) | Runtime Google Fonts CSS; not vendored |
| Golos Text | [Golos Text Project Authors, SIL OFL 1.1](https://github.com/google/fonts/blob/main/ofl/golostext/OFL.txt) | Runtime Google Fonts CSS; Cyrillic fallback; not vendored |
| SVG and UI symbols | Trainer's inline map SVG, paths from the credited outlines or generated from country data, CSS controls and text glyphs | No separate icon set or image licence to add |
| Favicon, images, media | No custom favicon declared or shipped; no bundled or remotely embedded photos, screenshots or media found | No third-party credit due |

On page load, `trainer-app/index.html` directs visitors' browsers to request CSS
from `fonts.googleapis.com`, with font binaries served from `fonts.gstatic.com`
as needed. That sends ordinary connection/request information to a third party
even though the app has no backend, telemetry or key transmission. No font delivery
changes were made. External credit links are navigations, not automatic asset loads.

## Open questions for the owner

1. **France artifact provenance:** Can you recover how the original city and prefecture
   coordinates, place-name glosses/example selections, and river waypoints/town lists
   were compiled? History confirms an artifact import, not an upstream source. If
   the source cannot be established, decide whether to commission a separately
   sourced replacement; the existing data is unchanged.
2. **Germany tidal waypoints:** Can you confirm the input for the added Elbe, Weser
   and Ems coordinates? Natural Earth supplies the documented base line, but the
   notes don't identify the exact inputs for the hand-added points. No OSM or
   commercial-map tracing was established.
3. **Font delivery:** Approve self-hosting Archivo and Golos Text (for example via
   `@fontsource/archivo` and `@fontsource/golos-text`), with the needed Latin and
   Cyrillic coverage, weights and OFL copyright/licence notices? This removes the
   automatic Google Fonts requests without changing the app's typography.
4. **Build-tool policy:** Clarify whether the allowed-licence list applies to
   dev-only tools not redistributed by the site. Explicitly document the treatment
   of MPL-2.0 and Blue Oak, or decide whether to replace affected tooling.
