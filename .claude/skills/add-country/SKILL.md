---
name: add-country
description: End-to-end pipeline for adding a country to this GeoGuessr map trainer — country brief with the geoguessr-pro lens, outline from Natural Earth, sourced data files, interface copy in every language, validation, browser checks with the ux-expert routine, and a PR that reports decisions and doubts. Use when an issue or request says "add <country>" (in any language), or when extending an existing country with a new study set.
---

# Add a country

You turn a request like "I want to add Germany" (it may be written in Belarusian, Russian or
any language) into a merged-quality PR. France is the reference implementation; Peru shows
a generated outline, a merged unit, skipped sets and hand-researched river courses. Work in
the order below and do not skip the gates: a wrong fact shipped to players is worse than a
smaller country.

## 0. Read first

`AGENTS.md` (layout, conventions, "Adding a country", "Interface languages"), `docs/backlog.md`,
`trainer-app/src/types/geo.ts`, `trainer-app/src/data/peru/` (index.ts, copy.en.ts, copy.be.ts,
RESEARCH.md) and `scripts/build-outline.ts`. Load the `geoguessr-pro` and `ux-expert` skills
(`.claude/skills/`); this skill sequences them, they hold the judgement.

## 1. Brief and study sets (geoguessr-pro) — gate

Write `trainer-app/src/data/<id>/RESEARCH.md` first: coverage overview, regional signals ranked
for Street View usefulness, and a table of the six sets (`reg`, `dep`, `city`, `riv`, `tel`,
`nom`) with enable/skip and why. Rules of thumb from the countries so far:

- Enable only what helps place yourself **inside** the country on Street View. Peru skipped
  name endings (Quechua endings blanket the whole sierra); France keeps rivers because town
  names carry them ("-sur-Seine").
- **Unit granularity decides `tel` and plates.** The map's units are what Natural Earth
  admin-1 offers (Germany: 16 Länder; Peru: 25 regions). If area codes or plate codes follow
  finer units (Germany's Vorwahl zones and Kfz districts do), mapping them onto coarse units
  would teach wrong answers: skip the set or find a finer outline source, and log it in the
  backlog. Never force one zone per unit when a unit spans several.
- **The top-level grouping (`regions.json`) is optional.** Include it only if it is an official
  level players meet (France's régions) or if its groups carry real Street View signals
  (Germany's Ost, the former GDR). Never add one just to chunk a long list (Poland's NUTS-1
  macroregions were removed: statistical units nobody sees). If included, it must partition
  `dep`, and RESEARCH.md says whether it is a **study set** (`reg` in `sets`), an **Area
  filter only** (Germany, Peru: groups share clues, but the names are ours) or **both**
  (France). Without it: no `regions` in `index.ts`, no `regionTerm` in the copy, no `reg` set,
  and the UI hides the Area filter.
- Facts that become data need a source; mark confidence. Leave out what you cannot verify
  (Peru left out plate letters: unsettled and blurred on Street View).

**Stop and ask on the issue** (comment, then wait) if: no usable outline exists for sensible
units; the grouping or a set decision is genuinely contested; or key facts cannot be verified
with the sources your environment can reach. Say exactly what you need.

## 2. Outline

Use an `@svg-maps/<country>` package if one exists with matching ids (France). Otherwise add an
entry to `COUNTRIES` in `scripts/build-outline.ts` and run `npm run build:outline -- <id>`
(Natural Earth 1:10m, public domain; writes `outline.json` with the exact projection `affine`
and `riverCourses.json`). Then look at it (render outline + rivers with Playwright) before
building on it. Known Natural Earth pitfalls:

- Ids: use ISO 3166-2 suffixes; NE sometimes tags two features alike (Peru's Lima Province and
  Lima region both PE-LIM: override one).
- Wrong or tiny units: merge with `merge: { ID: { from: [...], name } }` when a unit is wrong
  and indistinguishable on Street View (Peru merged Callao into Lima Metropolitana).
- Rivers: NE names can be wrong ("Tumbes" is the Chira) and lines can bundle several rivers
  (NE "Ucayali" starts at the Apurímac's source) or run mouth → source: check each one on the
  render, use `mouth`/`from`/`to` in the river spec, and hand-research courses NE lacks.
- Tiny units must stay clickable; note in the backlog if they are hard to hit.
- Rivers split under several names or missing tributaries: `ne: ['Rhein', 'Rhine']`, and
  `extraRiverLayers: ['rivers_europe']`; continue NE lines that stop short (tidal estuaries) with
  hand-drawn `course` points in rivers.json.

## 3. Data files in `trainer-app/src/data/<id>/`

Same shapes as Peru and France (see `types/geo.ts`): `regions.json` (only if §1 keeps a grouping), `departments.json`
(`plate` only if verified), `cities.json` (~60–90; tier 1 ≈ 20 always-labelled, all unit
capitals; prefer towns on covered roads), and only for enabled sets `phone.json`,
`placeNames.json` (4–8 example towns + 2–5 `extra` practice-only towns per pattern),
`rivers.json` (towns source → mouth). Coordinates to ~1 km; cross-check against NE populated
places or GeoNames (CC BY: credit it). `lengthIsTotal` only for rivers that leave the country.
If a unit's label lands on an enclosed unit, add `departmentLabelOffsets`. Ids are stable counters (`c0`, `t0`, `n0`, `p0`, `r0`). Keep official/local place names
with accents; never translate place names. Every source must pass `docs/licensing.md`
(facts from guides and Wikipedia are fine as references; no copied prose, maps or images,
no OpenStreetMap / CC BY-SA data without the owner's approval); list each with its licence
in RESEARCH.md.

`index.ts` exports the `Country` (`sets`, `departmentCodes: 'shown'` only if players know the
codes, `projectionRefLat`/`outline` from outline.json, `copy: { en, be }`). Register it in
`trainer-app/src/data/countries.ts` and `scripts/validate-content.ts`.

## 3b. Roads (optional study set)

Roads are the study set `road`: numbered roads drilled as a **pattern** (spec
`docs/specs/roads.md`). Decide with `geoguessr-pro` whether the country's numbering is worth it
(a learnable rule, numbers on signs in coverage, enough covered routes) and which classes to
keep. If yes:

1. Research each kept route in RESEARCH.md (roads section): termini, length, towns in order
   (GeoNames), the **numbering rule** it follows and its **neighbours in the pattern** (the
   parallel roads either side, the main crossings), sign notes; two sources each, H/M/L.
2. Write `roads.json` (our data only: networks with rule texts in our words, roads with `rules`,
   `between`, `crosses`, towns, `codes`), then add the country to `COUNTRIES` in
   `scripts/build-roads.ts` and run `npm run build:roads -- <id>`: Overpass (Geofabrik
   fallback), clipped to the Natural Earth outline, simplified in km, with a Natural Earth
   cross-check and a gap / ref-mismatch / size report (`.cache/osm/report-<id>.md`).
3. OpenStreetMap licensing (`docs/licensing.md`, "OpenStreetMap road data (ODbL)"): OSM
   geometry goes **only** into `roads.osm.json`, never into `roads.json`; record the extract in
   RESEARCH.md (source, date, query, tags, tolerance, sizes); add "Roads © OpenStreetMap
   contributors, ODbL" with the https://www.openstreetmap.org/copyright link to `credits` in
   **every** `copy.<lang>.ts` (validate:data fails without it); README lists the ODbL files.
   **Several numbers:** keep one primary `ref` per road (the number on its shield). Put its
   other numbers in `altRefs`, as `{ ref, network, kind, from?, to?, note? }`, with these
   kinds:
   - `european`: E-routes;
   - `concurrent`: a shared carriageway, recorded on both roads with the other road's primary
     `ref`;
   - `former`: renumbered or legacy numbers.

   Give the stretch as two towns of the road when the number does not cover the whole road,
   and source each in RESEARCH.md. The build:roads report lists the OSM `ref` / `int_ref`
   numbers not in roads.json as **suggested altRefs**. Verify them and add them by hand;
   the script never writes them.
4. Translate every network's label, sign and rule texts in `copy.<lang>.data.roadNetworks`.
   Offer `road` in `sets` only once the road UI exists and every road has a course.
5. If OSM is unreachable, stop and say so; never hand-draw geometry instead.

Also run `npm run build:locator` for the new country (add it to `FRAMES` in
`scripts/build-locator.ts`): the picker's locator map from Natural Earth admin-0.

Countries with roads: Germany (Autobahn classes 1–2 with E-route and shared-stretch
`altRefs`, `roads.json` only; courses pending the OSM extract, set not offered yet). France and Peru are next (spec §6).

## 4. Copy in every interface language

One `copy.<lang>.ts` per language in `types/i18n.ts` `LANGS` (today `en`, `be`): country name,
subtitle, set labels, terms (`Term.counted` plural forms for Belarusian), seat label, tips (2–3
actionable sentences per enabled set, in the voice of France's and Peru's), phone hint,
credits (attribution is a licence requirement), and `data` translations of the JSON's English
text by id. Belarusian: official orthography (наркамаўка), real і/ў and ’; check non-obvious
terms on skarnik.by / slounik.org / verbum.by and add them to `trainer-app/src/i18n/README.md`.

## Coding agents (Copilot and others)

The GitHub Copilot coding agent gets its environment from `.github/workflows/copilot-setup-steps.yml`
and works behind a firewall: if sources are blocked, use GitHub-mirrored data dumps and mark
memory-only claims L/M, or stop and ask. Its CI needs a maintainer's approval click. Each
`@copilot` comment is a billed session: batch feedback. Reviews follow `review-agent-pr`.

## 5. Validate

`npm run typecheck`, `npm run lint`, `npm test`, `npm run validate:data` (0 errors; explain any
warning), `npm run build`. Fix data, not the validator.

## 6. Browser check (ux-expert routine)

`npm run smoke -- <id> --shots` covers the matrix below and fails on page errors; to prove
other countries unchanged, snapshot main (`--snapshot main.json`) and `--compare` the branch.

`npm run build && npx vite preview --port <free>`; with Playwright (a repo devDependency;
run `npx playwright install chromium` if its browser is missing, or in Claude Code cloud sessions
launch with `executablePath: '/opt/pw-browsers/chromium'`), screenshot every enabled set
in Learn at 1280 px and 390 px (`devices['iPhone 13']`), light and dark, `?lang=en` and
`?lang=be`, reaching states through `geotrainer_<id>_settings` in localStorage. Play a Practice
round of every set × question type and assert no page errors. Look at the screenshots: labels
readable, dots on the right side of borders, rivers on their real courses, small units
reachable. Then confirm France and Peru are unchanged (same DOM text in Learn for each set).

## 7. PR

Branch, commit in logical steps, open a PR titled "Add <Country>". Body: the set table (enabled
/ skipped + one-line reason), counts per file, outline source and merges, what was left out and
why, uncertain facts with confidence, screenshots checked, and backlog entries added (signals
the engine cannot express yet). Comment on the issue in the requester's language with a short
summary and the PR link. Do not merge: the maintainer reviews data PRs.

## Working with the other roles

`geoguessr-pro` decides what to drill and reviews the data; `ux-expert` owns how it looks and
behaves (and the browser routine). If the engine cannot express a valuable signal, add a
backlog entry rather than bending the data.
