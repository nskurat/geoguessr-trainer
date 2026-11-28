# Visual meta: teaching what the map looks like

**Status:** proposal for owner review, not an implementation or approved data.
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
| Point/line: landmarks, roads, coverage | Alpine peaks or motorway route markers (M) | Southern volcanoes, numbered highways / kilometre markers and Iquitos coverage island (M) | Alpine landmarks, Autobahn routes / markers (M) | A landmark has a position and a visibility range, not a zone; a road number is meaningful only along its actual route and km numbering system. Use official road/volcano inventories plus a second map and dated road observations. Coverage is time-dependent and is not a land-use polygon: verify current official coverage and distinguish car, trekker and gaps; never infer that Iquitos is the only island. Sources: [Peru research §1, §8](../../trainer-app/src/data/peru/RESEARCH.md), [France](https://www.plonkit.net/france), [Peru](https://www.plonkit.net/peru), [Germany](https://www.plonkit.net/germany) player guides. |
| Per-unit facts: road furniture, poles, plates | Département number on some plates (M); selectable and often blurred, not proof of location | Moquegua bollard and pole stickers (M) | Bollard variants (L); Kreis plate codes are finer than Länder | Attach only if a cue is demonstrably associated with the whole unit or explicitly says “seen in / common in”, with all acceptable units and exceptions recorded. Verify with a road authority/operator or registry and repeated dated player observations. Peru's bollard uniqueness and stickers require re-checking; Germany's coarse Länder are unsuitable for Kreis codes. [Peru research §1, §8](../../trainer-app/src/data/peru/RESEARCH.md); [Germany research §7](../../trainer-app/src/data/germany/RESEARCH.md); [France guide](https://www.plonkit.net/france). |
| Country-wide identifiers | French plate format (H) | Black-and-white striped signposts (M) | Common black-and-white bollards (M) | Useful for identifying a country, not locating within it. Keep at most a short, sourced country tip; **no regional study set** unless a verified variant splits the country. Similar designs exist elsewhere; a national standard does not imply local exclusivity. [France](https://www.plonkit.net/france), [Peru](https://www.plonkit.net/peru), [Germany](https://www.plonkit.net/germany) player guides. |

Use the [Peru research](../../trainer-app/src/data/peru/RESEARCH.md) as a starting
point, not a licence to copy guide images. The [Germany research](../../trainer-app/src/data/germany/RESEARCH.md)
marks several cues low confidence; its coverage statements are historical, so check
again before publishing. A guide establishes player relevance, not independent
proof of geography. Record source URL, date/version, confidence, observations and
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
- **Points/lines:** later, add markers/route strokes and a legend alongside the
  base map. Select a point or line to see the fact, visibility or route limits and
  date. Coverage is an explicitly dated, separately toggled contextual layer, not a
  claim that the rest is permanently inaccessible.
- **Per-unit facts:** select a department, then see a “visual clues” card with
  drawings, qualifiers, other possible units and exceptions. Never repaint an
  entire department to imply a cue is exclusive. National identifiers belong in
  the country tip, not the map quiz.
- Use original, clearly schematic **drawings** in the pilot (not copied from
  Street View); they illustrate characteristic cues, not a real panorama. Include
  text descriptions and identify drawings as such. Later, optional photos may be
  more useful for image → place: use only individually cleared, appropriately
  licensed images (e.g. Wikimedia Commons with per-file licence/author/source,
  attribution and modification/share-alike requirements checked). Street View
  screenshots generally cannot be redistributed; do not bundle them or scrape
  guide imagery. Link to evidence separately where permitted. Do not promise that
  all Commons files have the same licence.
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
  id: string; path: string; creator: string; sourceUrl: string;
  licence: string; licenceUrl: string; changes: string; // or explicit “none”
}
```

`Country.visualLayers` and `Country.visualImages` are optional; localized
`CountryCopy.data` supplies each layer/fact title, cue, uncertainty, image alt
and attribution text for every language. Source-language text and ids live in
country data; no new visible literals in the trainer. Geometry is geographic
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
| [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/) | Public-domain vector/raster base data; useful for country outline and physical context, **not automatically a costa/sierra/selva classification**. Preserve existing outline attribution requirements. |
| [WWF terrestrial ecoregions](https://www.worldwildlife.org/publications/terrestrial-ecoregions-of-the-world/) | Ecologically grounded candidates, often much finer than player-friendly zones; check the exact downloadable dataset, version, licence and attribution before reuse. Do not assume the website or every derived copy is public domain. |
| [Köppen–Geiger climate maps](https://www.nature.com/articles/sdata2018214) | Climate classes can inform a layer, but climate is not the same as what a player sees from a road. Verify the exact data release's licence, resolution and period before conversion; cite the paper and data. |
| Hand-drawn simplified zones | Recommended pilot: original approximation informed by multiple independently checked geographic sources and road observations, with documented methodology and reviewer sign-off. Do not trace an unlicensed map or present fuzzy transitions as surveyed borders. Choose and record a licence for original geometry and drawings. |

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
these zones with Peru's existing five `reg` study groupings.

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

## Open questions for the owner

1. Approve Peru's three broad zones as the first pilot, and are hand-drawn,
   deliberately fuzzy boundaries acceptable?
2. Are original schematic drawings sufficient for launch, and who will create
   and license them? Should cleared photos be a later milestone?
3. Is the proposed image budget acceptable, including for mobile connections?
4. Should multiple-answer clues ever be graded, or remain Learn-only until a
   complete list of possible units can be verified?
5. What source and review threshold should make a changing coverage or road
   furniture fact eligible for practice, and how often should it be rechecked?
6. Should visual facts later be additional sets or contextual cards in existing
   sets, once the Peru pilot has been evaluated?
