# Visual meta: teaching what the map looks like

**Status:** approved by the owner on 2026-11-28 (see "Owner decisions" at the end); not an
implementation or approved data.
GeoGuessr-pro owns signal selection and evidence; UX-expert owns presentation and
interaction. The trainer assumes the country is already known. Existing sets teach
names attached to administrative areas, points or lines; none can represent an
independently bounded landscape or a visual clue with uncertainty.

**UI baseline:** run `npm run build && npm run smoke -- peru france --shots`.
Generated (git-ignored) examples are `.cache/smoke/france/dep-en-desktop.png`
(1280 px, light) and `.cache/smoke/peru/riv-be-phone.png` (390 px, dark).
The desktop Learn view has the map beside a card; on the phone the preferences
and wrapping Belarusian set controls precede the map and the card follows it.
These are existing Learn screens, not a visual-meta prototype. They show why a
new layer must fit the current map and why a large extra toolbar would crowd mobile.

## 1. What to teach

Prioritize **landscape and vegetation**, visible in many rounds, before local
furniture and architecture. A cue narrows a search; it does not prove a location.
The examples below are candidates, not an assertion that the whole named area looks
the same. Confidence is in the *teaching proposition*, not a polygon boundary:
H = broad pattern supported by geography and player evidence; M = useful but
variable, needs local verification; L = hypothesis, do not quiz yet.

| Geography / signal | France | Peru | Germany | Reliability and sourcing before inclusion |
|---|---|---|---|---|
| Zones: relief, climate, vegetation, crops, soil | Mediterranean vegetation in the south (H); Alpine relief in the southeast (H) | Coastal desert, Andes and eastern forest (H); local crops/red soil (M) | Northern plain, central uplands, Alps in the south (H) | Broad, repeated cues are better than a single crop or soil colour. Compare a geographic/ecological source and independent, dated road-level observations across the zone and its edges. Seasons, irrigation and altitude change appearances. Sources: [France geography](https://en.wikipedia.org/wiki/Geography_of_France), [Peru geography](https://en.wikipedia.org/wiki/Geography_of_Peru), [Germany geography](https://en.wikipedia.org/wiki/Geography_of_Germany), plus the country player guides below. |
| Zones: architecture / languages | Breton bilingual signs in Brittany (M); southern building styles (L) | Titicaca-area brick / blue glass (M) | Northern brick, southern Alpine buildings; Sorbian/Danish signs (L in existing research) | Styles travel and signs are local, not exclusive. Establish distribution and counterexamples from cultural/language sources and multiple dated observations; show “often”, never a guarantee. Sources: [France guide](https://www.plonkit.net/france), [Peru research](../../trainer-app/src/data/peru/RESEARCH.md), [Germany research §1, §7](../../trainer-app/src/data/germany/RESEARCH.md). |
| Point/line: landmarks, roads, coverage | Alpine peaks or motorway route markers (M) | Southern volcanoes, numbered highways / kilometre markers and Iquitos coverage island (M) | Alpine landmarks, Autobahn routes / markers (M) | A landmark has a position and a visibility range, not a zone; a road number is meaningful only along its actual route and km numbering system. Roads, road numbers and km markers are specified in [roads.md](roads.md). For landmarks, use an official inventory (e.g. a volcano catalogue) plus a second allowed source, never a commercial map, and dated road observations. Coverage is time-dependent and is not a land-use polygon: distinguish car, trekker and gaps, and never infer that Iquitos is the only island. **Coverage geometry is never derived from Google's coverage overlay or screenshots** (`docs/licensing.md`): record coverage as dated text facts or as points on GeoNames towns, with the observation sources in `RESEARCH.md`. Sources: [Peru research §1, §8](../../trainer-app/src/data/peru/RESEARCH.md), [France](https://www.plonkit.net/france), [Peru](https://www.plonkit.net/peru), [Germany](https://www.plonkit.net/germany) player guides. |
| Per-unit facts: road furniture, poles, plates | Département number on some plates (M); selectable and often blurred, not proof of location | Moquegua bollard and pole stickers (M) | Bollard variants (L); Kreis plate codes are finer than Länder | Attach only if a cue is demonstrably associated with the whole unit or explicitly says “seen in / common in”, with all acceptable units and exceptions recorded. Verify with a road authority/operator or registry and repeated dated player observations. Peru's bollard uniqueness and stickers require re-checking; Germany's coarse Länder are unsuitable for Kreis codes. [Peru research §1, §8](../../trainer-app/src/data/peru/RESEARCH.md); [Germany research §7](../../trainer-app/src/data/germany/RESEARCH.md); [France guide](https://www.plonkit.net/france). |
| Country-wide identifiers | French plate format (H) | Peruvian plate format (H); see `data/peru/RESEARCH.md` §4 | Common black-and-white bollards (M) | Useful for identifying a country, not locating within it. Keep at most a short, sourced country tip; **no regional study set** unless a verified variant splits the country. Similar designs exist elsewhere; a national standard does not imply local exclusivity. [France](https://www.plonkit.net/france), [Peru](https://www.plonkit.net/peru), [Germany](https://www.plonkit.net/germany) player guides. |

Use the [Peru research](../../trainer-app/src/data/peru/RESEARCH.md) as a starting
point, not a licence to copy guide images. The [Germany research](../../trainer-app/src/data/germany/RESEARCH.md)
marks several cues low confidence; its coverage statements are historical, so check
again before publishing. A guide establishes player relevance, not independent
proof of geography. Guides and Wikipedia are references for facts only: write cues in our
own words, and do not reproduce a guide's curated selection or table of cues, its images or
its maps. A complete official list (e.g. all Kreis plate codes) may match Wikipedia entry for
entry if the primary source (registry or decree) is cited; a curated subset may not be
copied (`docs/licensing.md`, "Facts versus expression"). Record source URL, date/version, confidence, observations and
counterexamples with each proposed fact; seek two independent sources. Skip facts
whose geographic extent, visibility or answer cannot be defended. Coverage
weighting affects which examples are asked, not the shape of the landscape.

## 2. Learning and practice design

**Decision:** one opt-in *Landscape* set per country when it has reviewed data.
Learn has a selectable, semi-transparent zone overlay above the existing outline;
practice uses curated, unambiguous examples, not randomly sampled polygons. Other
signal types use the same visual-fact vocabulary later; do not launch a separate
set for every bollard. The map is an approximation, not an ecological boundary
authority. Reject colouring whole departments for convenience: it teaches false
borders. Reject a photo-only flashcard deck: it loses the spatial relationship.

### Learn

- **Zones:** show one layer at a time, with boundaries independent of departments;
  legend with swatch **and** name/pattern, “approximate / transitions vary”, and
  toggles for overlay and labels. Tap zone or legend to select; card shows localized
  name, defining visual cues, exceptions, example illustration and attribution.
  At overlaps offer a list of matching zones rather than silently selecting one.
  Unmapped areas say “not mapped”, never “no vegetation”.
- **Points/lines:** later, add markers and a legend alongside the base map. Roads,
  road numbers and km markers belong to [roads.md](roads.md); reuse its `nearestRoad`
  hit-testing for any line layer here. Select a point or line to see the fact, visibility or route limits and
  date. Coverage is an explicitly dated, separately toggled contextual layer, not a
  claim that the rest is permanently inaccessible.
- **Per-unit facts:** select a department, then see a “visual clues” card with
  drawings, qualifiers, other possible units and exceptions. Never repaint an
  entire department to imply a cue is exclusive. National identifiers belong in
  the country tip, not the map quiz.
- Use original, clearly schematic **drawings** in the pilot; they illustrate
  characteristic cues, not a real panorama. Include text descriptions and identify
  drawings as such. Later, optional photos may be useful for image → place, but
  all bundled images must follow the repository's MIT-compatible image policy:
  public domain / CC0, CC BY 4.0 with attribution, MIT-licensed assets, or our own
  drawings and diagrams. Verify the licence and provenance of each individual
  Wikimedia Commons file; Commons is not itself a licence.
- Never use Google Street View or Google Maps imagery, including screenshots;
  also exclude NC, ND and images without a clear licence. CC BY-SA, GFDL and
  fair-use files are excluded (Owner decision 7): such a signal gets our own drawing
  and a link to the source. Do not scrape guide imagery.
  Link to evidence separately where permitted.
- Show an accessible credit beside each image in Learn and Practice: author,
  linked source, licence and licence link, plus a modification notice where
  applicable. Include the same per-image attribution in the country's footer
  credits, alongside existing outline and GeoNames credits; keep it readable and
  reachable on mobile and in both languages. During a question, author and licence
  stay beside the image; only a title or caption that would reveal the place is
  withheld until the answer.
- Bundle drawings locally, lazily with the selected country's layer; no remote image
  requests or trackers. Initial budget: ≤ 150 KB compressed total for pilot images,
  ≤ 50 KB per asset, including alternatives; optimize and measure the production
  build. If photos are approved later, set a separate budget, responsive sizes and
  lazy loading before adding them. Serve paths via `import.meta.env.BASE_URL`.
  On failure show alt text and a retry or skip, never a broken graded question.

### Practice

| Kind | Prompt and answer | Guardrails |
|---|---|---|
| Point → zone | Highlight a curated map point; choose its zone from names | Ask only points well inside one reviewed zone, away from transitions, holes and overlaps; use plausible neighbouring distractors and text choices. |
| Find zone | Name a zone; tap its overlay | Any unambiguous interior part of the target polygon counts, including disjoint parts; tapping another unambiguous zone is wrong. Border, overlap and unmapped taps are neutral with a prompt to choose inside. Map must not leak the answer via labels or distinctive fills. Offer a point → zone question as a keyboard/screen-reader alternative, not a list that reveals the named target. |
| Image → place (later) | Show a cleared image/drawing and ask for a region or zone from choices | Use only a reviewed exemplar with one defensible answer at the asked granularity; reject ambiguous, distinctive-location or misleading images. Do not claim a schematic alone is a real-world diagnostic. |
| Attribute → unit (later) | Show a drawing/description; ask which unit has the clue | Offer “select all that apply” only when the complete accepted set is curated; otherwise ask a qualified question with exactly one defensible choice. Never mark another known unit wrong. |
| Point/line (later) | Find a named landmark / select a route | Reuse point or line interaction where appropriate; no invented visibility or km-marker precision. |

Show immediate feedback in words and on the map, the explanation and exceptions;
keep the current retry/reveal and round-summary conventions. A wrong answer never
changes the geographic truth. No quiz if there are too few defensible alternatives;
offer Learn instead. Do not ask arbitrary border points or drill coverage gaps as
if a snapshot were permanent.

### Layout and states

Desktop, 1280 px (same Archivo, atlas map and blue accent):

```text
 Country  Language                 Peru map trainer     [Landscape] [other sets…]
 [Learn | Practice]   [Layer: Landscape v]   [Labels: Auto v]
 +----------------------------------+  +---------------------------------+
 |  map, faint admin borders        |  | LANDSCAPE / selected zone       |
 |  ::::: costa    ^^^ sierra       |  | Costa — approximate             |
 |        ^^^^^^^    /// selva      |  | [schematic] cues & exceptions   |
 |   zoom + − reset                 |  | Source / image credit            |
 +----------------------------------+  +---------------------------------+
 Legend: [::: Costa] [^^ Sierra] [/// Selva]  [overlay on/off]
 ```

Phone, 390 px: preserve the existing preferences-first header and wrapping
controls. In Learn, map first, legend then selected card; no quiz controls.
In Practice, scroll the prompt into view as today, then map and choices; do not
pin a large image over the map.

```text
 [Country v] [Language v]
 Peru map trainer
 [Landscape] [other sets …]
 [Learn | Practice] [Layer v]
 +----------------------------+
 | Which zone is this point?  |
 |         3 / 10             |
 +----------------------------+
 |      map      • point      |
 |                            |
 |                +  −  reset |
 +----------------------------+
 [Costa] [Sierra] [Selva]
 Feedback / explanation
 ```

Use ≥40 px targets, wrapping rather than horizontal page scroll; pan/pinch must
not submit, taps must work without hover, and the Learn legend handles small or
enclosed polygons. Keyboard users can answer with the point → zone choices,
tab and activate controls; provide visible focus and announce question, feedback
and reveal via a live region. Text, patterns and borders supplement colour; check WCAG 2.2 AA in
both light/dark themes and honour reduced motion. Reuse `--land`, `--sea`,
`--border`, `--blue`, `--hl` and outcome tokens; add tested light/dark overlay
tokens only if needed. Avoid label collisions by zoom/priority, not by hiding
the accessible legend. Localize all UI and fact text in English and Belarusian.

Loading shows map skeleton and disabled controls; empty/missing layer shows a
localized explanation and other sets; bad image offers text and skip. Feedback
identifies wrong/right without colour alone; after exhausted attempts reveal the
answer and an actionable next control. Round done shows score, review and restart;
no due items offers a new round or Learn. Refresh restores settings and saved
progress, not an unfinished round. The country picker navigates to a new URL and
cancels the round; Back returns to the previous URL and reloads that country's
settings and progress, not the unfinished round. Do not mix countries' layers or
records. Hide unavailable controls and normalize obsolete settings. Live language
switch updates the card, legend and prompt.

## 3. Data and engine contract (proposal)

In `types/geo.ts`, add optional, country-owned visual data; the engine knows
generic layers and relations, never country names. Example shape, not final API:

```ts
type VisualGeometry =
  | { kind: 'area'; polygons: LatLon[][][] } // polygons → rings → [lat, lon]; first ring outer, rest holes
  | { kind: 'point'; at: LatLon }
  | { kind: 'line'; path: LatLon[] };
interface VisualFact {
  id: string;                  // stable within layer
  geometry?: VisualGeometry;  // absent for department-associated facts
  departmentCodes?: string[]; // non-exclusive associations, not a partition
  imageIds?: string[];
  evidence: { url: string; checked: string; confidence: 'high' | 'medium' | 'low' }[];
}
interface VisualLayer {
  id: string;
  kind: 'zone' | 'landmark' | 'route' | 'unit' | 'coverage';
  facts: VisualFact[];
}
interface VisualImage {
  id: string; path: string;
  source: string; author: string; url?: string;  // field names as in docs/licensing.md
  licence: 'public-domain' | 'CC0-1.0' | 'CC-BY-2.0' | 'CC-BY-3.0' | 'CC-BY-4.0' | 'MIT';
  licenceUrl?: string; changes: string; // or explicit “none”
}
```

`Country.visualLayers` and `Country.visualImages` are optional; localized
`CountryCopy.data` supplies each layer/fact title, cue, uncertainty, image alt
and attribution text for every language. Source-language text and ids live in
country data; no new visible literals in the trainer. For each image, record
the original source, author, licence, source URL and licence URL, plus any
modifications; preserve MIT copyright and licence notices with the asset. For
our own drawings, record the repository as source, the author and the chosen
MIT-compatible licence; a repository path may identify the source instead of an
external URL. Use an explicit unknown-author designation only when the verified
public-domain source itself does not identify an author. Geometry is geographic
coordinates transformed with the **same country projection** as the outline,
not SVG paths copied from another projection; France's fitted outline needs
alignment checked. Areas may be multipart, have holes, overlap, leave gaps and
cross departments or country boundaries; clip for display without changing
evidence. Define an explicit screen-space border tolerance for interactions and
exclude transitions from point questions. One selected layer avoids stacking
ambiguous unrelated classifications.

Extend `services/country/schema.ts` and `validateCountry`: finite lat/lon and
valid ranges, nonempty stable ids (no `|`), unique ids within their namespace,
closed rings with ≥4 positions, valid holes/non-self-intersection and nonzero
areas, line ≥2 distinct points, valid department/image references and appropriate
geometry for each layer kind. Reject enabled sets without usable data, missing
translations/credits/licences, invalid attribution paths or unsourced facts.
For each image `npm run validate:data` must check the allowed licence enum,
nonempty source, author and changes, valid source and licence URLs for external
assets, a valid local path, and complete credit/alt text in each language.
For repository-authored drawings, require the repository source path and chosen
licence instead of external URLs. Reject missing or unsupported licences and
missing required notices; automated checks cannot establish that a claimed
licence is genuine, so a reviewer must verify provenance and rights before inclusion.
Keep geometry/source checks in tooling as appropriate, with actionable errors;
validation does not establish factual truth. Record source version, date,
derivation/simplification and asset rights in country research.

Curate question examples separately: stable id, layer/fact reference, prompt
point or image reference, accepted answer ids, plausible distractors and
evidence. Validate point-in-polygon and distance from uncertain borders for
single-answer examples; require disjoint, existing answer/distractor ids and
enough options, and validate every referenced image and translation. No arbitrary
random point generation. Multi-answer examples require an explicitly complete
accepted set; otherwise omit them. Low-confidence facts remain Learn-only until
reviewed.

Extend `StudySet`, `STUDY_SETS`, settings normalization, country set labels,
tips and question-kind availability deliberately. Proposed pilot id `land`
identifies the landscape set, not a country; stable ids are data, not translated
labels. Store e.g. `land|zone:landscape:costa` and
`land|example:landscape:coast-01` under the
existing `geotrainer_<country>_progress` key. A find-zone question tracks the
zone; a point/image question tracks its exemplar, so performance on one view does
not imply mastery of another. Copies of the *same* exemplar share one record.
Do not reuse an id for changed meaning; a reviewed semantic change gets a new
id (old orphaned records remain harmless), with an explicit migration only when
equivalence is certain. Preserve existing records and set-scoped reset. Normalize
unsupported saved sets/kinds to a valid offered fallback. Reuse current Leitner
boxes, due priority, first-attempt scoring and miss requeues; do not add a new
storage key or reset legacy progress. Small pools can use all items, but duplicate
prompts must not advance one record multiple times for the same attempt.

## 4. Where boundaries and images come from

| Candidate | Use and licence gate |
|---|---|
| [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/) | Public-domain vector/raster base data; useful for country outline and physical context, **not automatically a costa/sierra/selva classification**. Its physical layers (e.g. `geography_regions_polys`, elevation points) are candidates to check. Credit is good practice, not a requirement (the required outline credit is France's `@svg-maps` one). |
| [WWF terrestrial ecoregions](https://www.worldwildlife.org/publications/terrestrial-ecoregions-of-the-world/) | Ecologically grounded candidates, often much finer than player-friendly zones; check the exact downloadable dataset, version, licence and attribution before reuse. Do not assume the website or every derived copy is public domain. **Excluded until checked** (see the licence test below). |
| [Köppen–Geiger climate maps](https://www.nature.com/articles/sdata2018214) | Climate classes can inform a layer, but climate is not the same as what a player sees from a road. Verify the exact data release's licence, resolution and period before conversion; cite the paper and data. Excluded until checked. |
| Elevation (USGS SRTM / GMTED2010) | Believed public domain (verify): an altitude band can inform a sierra boundary. |
| Land cover (ESA WorldCover) | Believed CC BY 4.0 (verify): credit in every `copy.<lang>.ts` if used. |
| Volcanoes and other landmarks | Coordinates are facts: enter them by hand from an official catalogue (e.g. INGEMMET, the Smithsonian Global Volcanism Program) and cite it; do not bundle their datasets until their licence is known. |
| OpenStreetMap (ODbL) | **Roads only**, under [roads.md](roads.md) and the policy's OSM section (separate `*.osm.json`, credit in every language, extract recorded). Land use, `natural=volcano` / peaks and places are not covered: owner decision 2026-11-28, not for now; use the alternatives above, and ask again only if the pilot cannot be done without it. If ever approved, they also go in separate `*.osm.json` files. |
| Hand-drawn simplified zones | Recommended pilot: original approximation informed by multiple independently checked geographic sources and road observations, with documented methodology and reviewer sign-off. Do not trace an unlicensed map or present fuzzy transitions as surveyed borders. Choose and record a licence for original geometry and drawings. |

**Licence test for any third-party dataset:** usable only if the exact release is public
domain, CC0 or CC BY (any version); NC, ND, share-alike or no clear licence means excluded.
Record URL, version, licence and date checked in `RESEARCH.md`; for CC BY add the credit to
every `copy.<lang>.ts`.

Simplify at a documented tolerance, retain islands/holes as needed, and visually
check against the base map. Check source terms for derivatives, attribution and
redistribution before committing anything; research pages and player guides are
references, not automatically reusable media.

## 5. Pilot and delivery sequence

Recommend **Peru: costa / sierra / selva** as one broad landscape layer, with
vegetation/relief cues inside its cards rather than a second overlapping set.
These broad bands are geographically and visually useful but boundaries are
transitional; coastal irrigation, high-altitude variation and eastern slopes
make easy counterexamples. Avoid subzones, volcano exclusivity and pole/bollard
quizzes until their evidence and usable coverage are checked. Do not confuse
these zones with Peru's five study groupings (Lima y Callao, Norte, Centro, Sur, Oriente), now an Area filter only.

1. **Owner decision and research:** approve scope, image policy and boundaries;
   geo expert sources two independent references, records date, exceptions,
   coverage and simplified geometry methodology. Review at least ten scattered
   examples including edges; retain a list of excluded ambiguous examples.
2. **Data/engine:** introduce optional types, zod/referential validation, generic
   projection and stable example identities with deterministic unit tests;
   validate every existing country unchanged and test migration/reset.
3. **Learn UI:** after React port stages 1–3, add overlay, legend, selection,
   card and accessible controls; supply both languages, drawings and credits.
   Verify light/dark, 1280 and 390 px, English and Belarusian, pan/zoom and
   France/Germany regression.
4. **Practice:** after React stage 4, implement the two pilot question kinds,
   answer exclusion around boundaries, feedback, scheduling and keyboard/list
   fallback; add component and deterministic service tests for overlap, holes,
   border taps, empty pools and progress. Run the existing build, typecheck,
   lint, data validation and smoke suite. Measure lazy-loaded size.
5. **Evaluate:** owner reviews actual examples, licences and UX screenshots;
   only then consider a second layer or photo-based questions. No data migration
   or gameplay changes in this spec PR.

Keep the planned React port behavioural and structural; do not implement this
inside `trainer.ts` before porting or block stages 1–2 on new content. React
hand-off: layer/legend/map selection and fact card are view components; settings
and country own selection, progress storage owns Leitner records, round state owns
the active question and feedback. Pure geometry and answer validation belong in
tested services. Preview the design against the port rather than assuming this
wireframe is a pixel-perfect rendering.

## Owner decisions (2026-11-28)

1. **Pilot:** Peru's three broad zones (costa / sierra / selva) are the first pilot.
   Hand-drawn, deliberately fuzzy boundaries are acceptable, as long as Practice only asks
   about points well inside a zone.
2. **Images at launch:** our own schematic drawings only (simple SVGs, which an agent may
   draw and the owner reviews), released under MIT as our own work. Cleared photos (CC0 or
   CC BY 4.0) are a later milestone.
3. **Budget:** the proposed image budget is accepted (≤ 150 KB compressed for all pilot
   images, ≤ 50 KB per asset).
4. **Multiple-answer clues:** Learn-only until the complete list of units is verified;
   grading an incomplete list would teach wrong answers.
5. **Changing facts** (road furniture, coverage): eligible for Practice only with two
   independent sources, confidence H and a "checked on" date; rechecked once a year or
   whenever coverage changes. M and L facts stay Learn-only.
6. **Sets versus cards:** decide after the Peru pilot is evaluated. The leaning is one
   Landscape set per country plus contextual cards on existing units for per-unit clues
   (bollards and similar), so the set menu does not grow with every signal.
7. **CC BY-SA images:** no exception. A signal whose only images are BY-SA stays image-free,
   with our own drawing and a link to the source (`docs/licensing.md`).
8. **Licensing review (2026-11-28, after the OSM road exception):** CC BY images and data of
   any version are allowed with credit; OpenStreetMap beyond roads (land use, volcanoes,
   places) is not used for now, in favour of public-domain or CC BY alternatives (§4).
