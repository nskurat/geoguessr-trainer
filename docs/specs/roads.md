# Road numbers and a country locator map

**Status:** draft for the owner's review; not an implementation or approved data.
GeoGuessr-pro owns which roads are worth drilling and the evidence; UX-expert owns the
map layer, the practice interaction and the locator. Same shape and rules as the approved
[visual meta spec](visual-meta.md), which already lists "motorway route markers" and
"numbered highways / kilometre markers" as later line signals; this spec is that later step.
The trainer still assumes the country is known: a road number tells you *where inside the
country* you are, and it is worth drilling only where the numbering has a learnable logic
and the number is printed where Street View sees it.

**UI baseline:** `npm run build && npm run smoke -- germany --shots` (git-ignored output in
`.cache/smoke/germany/`). `riv-en-desktop.png` (1280 px, light) and `riv-be-phone.png`
(390 px, dark) show the closest existing layer: river lines in `--river` over region-hued
fills, labels on the line, zoom buttons bottom-right, the River picker in the control bar.
A road layer must read differently from rivers at a glance and add no new toolbar row.

**Evidence used here** (checked 2026-11-28): Wikipedia's [Autoroutes of France](https://en.wikipedia.org/wiki/Autoroutes_of_France),
[Route nationale française](https://fr.wikipedia.org/wiki/Route_nationale_fran%C3%A7aise),
[Autobahns of Germany](https://en.wikipedia.org/wiki/Autobahns_of_Germany) (numbering
system), [Bundesstraße](https://en.wikipedia.org/wiki/Bundesstra%C3%9Fe), [Highways in Peru](https://en.wikipedia.org/wiki/Highways_in_Peru)
(which cites the MTC's route pages), `data/peru/RESEARCH.md` §8, and a measurement of
Natural Earth's `ne_10m_roads` (v5, GitHub master) clipped to each country with
`ne_10m_admin_0_countries` (§4). Player guides (plonkit) were blocked from this session
(HTTP 403), so the "seen on Street View" claims below are from the research notes and
general player knowledge and are marked M at best until re-checked. Wikipedia is used for
facts only (route numbers and termini), never copied text (`docs/licensing.md`).
Confidence: **H** = two sources agree and stable; **M** = one source or likely to change;
**L** = hypothesis, do not quiz.

## 1. Which roads, per country

A road class earns a place only if all three hold: (a) its number is **printed on signs
or markers that Street View shows often** (direction signs, shields, km posts); (b) the
**numbering has a logic** the player can learn as a rule, or there are few enough roads to
learn by heart; (c) a **road number narrows the location** to a part of the country (a
national grid that is everywhere does not). Classes that fail become at most a tip.

### France

| Class | Signs | Logic | Decision |
|---|---|---|---|
| **A** autoroutes (≈ 11,900 km, H) | Red cartouche, white "A 7"; blue direction signs (M) | Single digits radiate from Paris: A1 north, A4 east, A6 south-east to Lyon, A10 south-west, A13 Normandy; A7 continues from Lyon to Marseille, A8 and A9 branch off the A7. Two-digit numbers cluster by region: 20s north/north-west, 30s east/north-east, 40s Alps, 50s south-east/Riviera, 60s south, 70s centre, 80s west (A89 the exception) (H, Wikipedia) | **In.** Class 1 = single digits plus A10–A16 from Paris; class 2 = two-digit regional motorways. Three-digit urban links (A104, A86…) out. |
| **N** routes nationales | Red cartouche, white "N 7"; green direction signs on primary routes (M) | Radiated from Paris historically, but most were handed to the départements in 2006–2008 and renumbered as D roads; about 8,700 km remain national after the 2023 "3DS" transfers, which continue to move sections (H, fr.wikipedia) | **Learn-only, few.** Only long remaining trunks that a player meets on signs (e.g. N10, N12, N165, N20 south of Toulouse) after checking each against the current list. No Practice until two sources agree on current numbers: the network is still changing and old imagery shows old numbers. |
| **D** routes départementales | Yellow cartouche, black "D 7" (M) | Numbered per département, no national logic (owner, H) | **Out.** Tip only: very high D numbers (D6007, D607, D906…) are usually former N roads; the renumbering rule differs per département (M, unverified per département). |
| **M** métropole roads | Turquoise cartouche (M) | Only around Lyon (M6/M7, the old A6/A7 through the city) and a few métropoles | **Out**; a one-line Lyon tip. |
| **E** routes | Green rectangle "E 15" on autoroute signs (M) | Pan-European grid, shared with neighbours; one E number spans several A roads | **Out** as a set; tip at most. Useful as data: Natural Earth tags France's A7 only as E15 (§4). |

Km markers: French *points de repère* (small plates or posts every km on A and N roads;
red-topped bornes for N, yellow-topped for D on older roads) count from a département
boundary, not a national origin (M), so they do not place you nationally: no drill.

### Germany

| Class | Signs | Logic | Decision |
|---|---|---|---|
| **Autobahn** single-digit (A1–A9) | White number on a blue shield; blue direction signs (H) | Long trunks across the country; even numbers run east–west and increase north to south, odd numbers run north–south and increase west to east (H, Wikipedia, numbering since 1974) | **In, class 1.** Nine routes: learn them by heart with the parity rule. |
| **Autobahn** two-digit (A10–A99) | As above | First digit = region: 1x east (Berlin, Brandenburg, Saxony-Anhalt, parts of Saxony); 2x north and north-east; 3x Lower Saxony and Thuringia; 4x Rhine-Ruhr to Frankfurt; 5x Lower Rhine to Cologne; 6x Rhineland-Palatinate, Saarland, Hesse, northern Baden-Württemberg; 7x Thuringia, northern Bavaria, parts of Saxony; 8x Baden-Württemberg; 9x southern Bavaria (98 in Baden-Württemberg) (H, Wikipedia) | **In, class 2.** The best rule-based clue in this spec: a two-digit number narrows to a band of Länder. |
| **Autobahn** three-digit (A100, A555…) | As above | Short city links, first digit follows the region rule | **Out**; the region rule covers them as a tip. |
| **B** Bundesstraßen (≈ 40,000 km) | Yellow rectangle, black number (H, Wikipedia); yellow direction signs | Numbered by law in 1932 and largely kept; low numbers are old long-distance routes (B1 Aachen–Berlin area); higher numbers have only a loose regional pattern (L) | **Learn-only later**, class 3. Very common on signs, but 40,000 km of geometry and no clean rule; revisit with a licensed source (§4). |
| **L / K** Landes-, Kreisstraßen | Numbers rarely on direction signs; on small station markers (M) | Per state / district | **Out.** |
| **E** routes | Seldom signed in Germany (M) | Pan-European | **Out.** |

Km markers: Autobahns carry small blue-and-white kilometre boards every 500 m and
Bundesstraßen white station posts with the road number (M). The Autobahn kilometre counts
along each route, so it adds little beyond the number itself: tip only.

### Peru

| Class | Signs | Logic | Decision |
|---|---|---|---|
| **Longitudinals** PE-1N/1S (Panamericana), PE-3N/3S (Longitudinal de la Sierra), PE-5N/5S (Marginal de la Selva) | Shield-shaped route marker with the number; concrete kilometre posts (*hitos*) (M, RESEARCH §8) | Odd = north–south, numbered west to east: 1 coast, 3 sierra, 5 selva edge; N/S = north or south of the Lima junction (H, Wikipedia citing MTC) | **In, class 1.** Six routes, and each one *is* a landscape band (ties into the visual-meta costa / sierra / selva pilot). |
| **Transversals** (even numbers) | As above | Even = east–west, numbered north to south: PE-2 Paita–Huancabamba … PE-22 Carretera Central (Lima–La Oroya–Chanchamayo), PE-26 Puerto San Juan–Iñapari (the southern Interoceánica), PE-28A Vía de los Libertadores, PE-34 Ilo–Ilave, PE-40 Tacna–Collpa (M, Wikipedia; spurs carry a letter) | **In, class 2, selected.** About ten that carry coverage (PE-22, 26, 28A, 30, 34, PE-8/10/14/16/20 in the north). The north-to-south rule makes the number alone place a road. |
| **Departmental** routes | Prefix of the department, e.g. AR-… (Arequipa), CU-… (Cusco) (M, unverified list) | Prefix = department | **Not a road set**, but a strong *department* clue: propose a tip and a backlog entry for a "route prefix → department" drill like France's plate numbers, after verifying all prefixes against the MTC route classifier (DS 011-2016-MTC). |
| **Vecinal** routes | Rarely signed | Per district | **Out.** |

Km markers: PE-1N/1S posts count from Lima, so "km 450 on the Panamericana Sur" places
you near Nazca (M). Worth a later "km → place" kind on class 1 only, once km anchors are
sourced (§3, later kinds).

### Backlog countries

- **Poland — promising.** National roads (*drogi krajowe*, DK 1–99) are signed with red
  shields with white numbers, voivodeship roads (DW, three digits) with yellow; motorways
  A1/A2/A4 and expressways S… (M). DK numbers are few and memorisable, DW first digits
  are said to cluster by region (L). Natural Earth tags only a few A routes (§4).
- **Guatemala — promising for km posts, weaker for numbers.** CA-1/CA-2/CA-9/CA-13 are
  few and sparse; kilometre posts are said to count from Guatemala City (L), which would
  make a "km → place" drill strong. Natural Earth carries numbers for CA-1, 2, 9 and 13.

## 2. Learn: a zoom-dependent road layer

**Decision:** a new study set **Roads** (`road`), offered only by countries whose data has
roads. In it the map shows roads by class as you zoom, like a road atlas: none at the full
country view, motorway-class roads first, smaller classes deeper. The land is drawn in plain
`--land` (no region hues) so the roads, not the regions, carry colour. Rejected: an overlay
toggle on every set (clutter, a new toolbar control; kept as a later idea), and showing all
roads at the full view (no search left for Practice, unreadable on a phone).

### Zoom thresholds

Thresholds are in **visible map width in km** (from the projection), so they mean the same
on every country and screen; a class is drawn when the view is narrower than its threshold
*and* zoomed at least 1.3× past the full country view (so nothing shows at full view, even
for a small country):

| Class | Meaning (per country data) | Drawn when view width ≤ | Shields when ≤ |
|---|---|---|---|
| 1 | Trunk: A1–A9, French Paris radials, PE-1/3/5 | 700 km | 450 km |
| 2 | Regional: two-digit A, Peru transversals | 300 km | 200 km |
| 3 | Minor (later): B roads, French N | 120 km | 80 km |

At the full view the card says "Zoom in to see roads" next to the zoom buttons' hint; the
first zoom step on Germany (about 640 km wide) already shows class 1. A class fades in over
150 ms (none under `prefers-reduced-motion`). The **selected road is always drawn**,
whatever the zoom, with its shields.

### Look

Roads are cased lines, distinct from rivers (single blue line, italic label): a dark
casing and a light core, wider for class 1. Strokes use `vector-effect: non-scaling-stroke`
so they keep their screen width without per-element rescaling. Labels are **shields**
modelled on the real sign colours, which are themselves the recognition cue (§1): a small
rounded rectangle with the number (`A 7`, `PE-1N`) in Archivo bold 11 px (10 px on phones).
The shield colour is a generic style named in data (`blue`, `red`, `yellow`, `green`,
`white`), never a country in code. Placement: along the line, one shield per ≥ 220 px of
on-screen length (≥ 160 px on phones), at most 12 on screen (8 on phones), placed by
priority (selected road > class 1 > class 2) and dropped when they would overlap a tier-1
city label or another shield. Towns on the selected road are drawn as river towns are.

### Interaction

- **Road picker** in the control bar, in the slot the River picker uses: "All roads" then
  the roads grouped by class (`<optgroup>` per network label, e.g. "Autobahn — trunk").
  Choosing one zooms to it (like a river) and selects it.
- **Tap or click a road** (screen tolerance §3) to select it. Hover on desktop shows a
  tooltip "A 7 · Flensburg – Füssen". Drag never selects.
- **Info card** (side panel, below the map on phones): shield and number, the network label
  and its sign description ("blue shield, white number"), endpoints, towns along it in
  order (the river-card pattern), length, regions it crosses, and the numbering rule that
  applies ("odd: north–south; two digits 4x: Rhine-Ruhr to Frankfurt"). Card text comes
  from data and `copy`, never literals.
- The Area filter is hidden for Roads in Learn (roads cross areas); the `labels` setting
  `off` hides shields, `auto` follows the table above.

### Performance

Roads are a few hundred paths at most (Germany's 66 A routes are ≈ 7 KB gzip at 1 km
tolerance, §4). Draw each road once as one path per part inside one `<g>` per class and
toggle the group's `display` on zoom; no re-render on pan. Shield placement runs after a
zoom ends (debounced, ~100 ms) on projected points cached in map units. A finer geometry
file loads lazily the first time the view is narrower than 150 km (§4).

### Wireframes

Desktop, 1280 px, Learn, zoomed on western Germany with the A 7 selected:

```text
 Germany map trainer                       Country [Germany v]  Language [English v]
 [Macro-regions][States][Cities][Rivers][Name endings][Roads]
 [Learn | Practice]   Road [A 7 v]
 +--------------------------------------------+  +---------------------------+
 |        ══[A 1]══        ║                  |  | LEARN · ROADS             |
 |  ════════[A 2]══════════╬═══════           |  | [A 7]  Autobahn, trunk    |
 |                         ║[A 7]             |  | Blue shield, white number |
 |   ══[A 44]══            ║                  |  | Flensburg – Füssen, 960 km|
 |          ══════[A 4]════╬═════             |  | Odd = north–south; higher |
 |                     • Kassel               |  |   numbers further east    |
 |                         ║                  |  | Towns: Hamburg · Hannover |
 |                         ║            [+]   |  |   · Kassel · Würzburg …   |
 |                    • Fulda           [−]   |  | Crosses: SH, HH, NI, HE…  |
 |                         ║            [⤢]   |  +---------------------------+
 +--------------------------------------------+   [Germany ▫ locator §5]
```

Phone, 390 px, dark, Learn: preferences-first header, controls wrap, map then card.

```text
 [Германія v] [▫] [Беларуская v]
 Германія: трэнажор па карце
 [Макрарэгіёны][Землі][Гарады]
 [Рэкі][Заканчэнні назваў][Дарогі]
 [Вывучэнне | Практыка]
 Дарога [Усе дарогі v]
 +------------------------------+
 |  ══[A 2]══════╬═════         |
 |               ║[A 7]         |
 |    ═════[A 4]═╬════          |
 |               ║          [+] |
 |                        [−]   |
 |                          [⤢] |
 +------------------------------+
 [A 7] Autobahn · Flensburg – Füssen
 (card: towns, rule, Länder …)
```

States: loading (map skeleton, Road picker disabled); a country without roads (no Roads
button at all, saved `road` settings normalised to the first offered set); no road
selected (card says how to explore); fine geometry failing to load (keep the coarse one,
no error shown); light and dark use the tokens in §2 "Visual tokens" below.

### Visual tokens

New tokens, both themes, checked to WCAG 2.2 AA non-text contrast (3:1) against `--land`:
`--road-casing` (light `#3b3f4a`, dark `#0b0f19`), `--road-core` (light `#ffffff`, dark
`#c9d1e3`), `--road-sel` = `--hl` for the selected or target road. Shield fills
`--shield-blue|red|yellow|green|white` keep the real sign colours in both themes (the
colour is the cue), with a 1 px `--border` outline so a white or yellow shield stays
visible on dark land; text on each passes 4.5:1. Reuse `--ok` / `--red` for outcomes, with
text and an icon, never colour alone.

## 3. Practice: search and click

**Decision:** two kinds on the Roads set, reusing the existing kind ids so settings,
rounds and Leitner need no new machinery: **find** labelled "Search and click"
("Find the A 7") and **name** labelled "Which road?" (a highlighted road → its number).
Rejected: a list of numbers to pick from for find (gives the answer away), and a
time limit (not the trainer's tone).

### Find: "Find the A 7"

1. The prompt shows the target as a shield (`A 7`), no endpoints. The map starts at the
   full country view (or the Area scope) with **no road numbers** anywhere; roads appear by
   class as the player zooms (§2 thresholds), all drawn alike, unlabelled.
2. The player pans and zooms. A tap counts only when it is **within the screen tolerance
   of a visible road**: 12 px for a mouse, 20 px for a coarse pointer (a 40 px band, the
   tap-target minimum). The road nearest to the tap point wins; if the target is within
   tolerance at all, it counts as a hit (concurrent or crossing roads favour the player).
3. **Neutral taps** cost no attempt: a tap with no road in tolerance ("Tap on a road"), or
   a tap while the target's class is not yet drawn ("Zoom in — roads appear as you zoom").
   A drag or pinch never answers.
4. **Wrong road:** the tapped road flashes `--red` for 650 ms with its own shield and the
   line "That's the A 5", so a miss still teaches. Three attempts, as today.
5. **Hint after the second miss:** the regions the target crosses pulse once in `--hl`
   outline and the prompt adds "It crosses Hesse and Bavaria". No hint after the first miss
   (the wrong road's number is already information).
6. **After the third miss:** the map zooms to the target, which blinks with its shields;
   the player taps it (or presses Enter / "Next") to continue — the existing reveal rule.
7. Outcome: 0 right first try, 1 second, 2 third, 3 revealed — the existing `Outcome`, so
   scoring, round summary and Leitner boxes are unchanged. Auto-advance timings as today.

### Name: "Which road is this?"

The map zooms to the highlighted road (drawn in `--road-sel`, others faint and unlabelled)
and offers four or five numbers. Distractors are **genuinely confusable**: same class and
nearby (shares a region or runs parallel within ~100 km), plus a same-band number (A 45 for
A 44; PE-28A for PE-26), never random. Keys 1–5 pick, as today; the reveal shows the right
shield on the road. This is also the accessible kind (below).

### Later kinds (not in the pilot)

- "Which road links Hamburg and Basel?" (text only, number choices).
- Peru class 1: "km 450 on PE-1S is near…" (place the point; needs sourced km anchors).

### Round, scope and scheduling

Pool = the country's roads of the classes in a new setting **Road class**
(`roadClass: 'all' | '1' | '2' …`, only shown when the data has more than one class) and
crossing the Area scope. Progress key `road|<road id>` in the existing
`geotrainer_<country>_progress`; find and name share the record (one road, one box), as
other sets do. Round size, due-first priority and miss requeues are the existing
`services/practice` code; distractors and road hit-testing are new pure services.

### Keyboard and screen readers

- Map focusable; arrows pan, `+`/`−` zoom, and a crosshair appears at the map centre while
  it has keyboard focus; **Enter answers at the crosshair** with the same tolerance rule.
  Focus ring per the existing styles.
- The find kind is visual by nature; its description says so, and the **name kind is the
  screen-reader path** (the choices are buttons). The kind control stays reachable.
- A live region announces the question ("Find the A 7"), neutral nudges, "Wrong: that is
  the A 5", the hint and the reveal; outcomes use words and an icon, not colour alone.
- Touch-only devices hide keyboard hints, as today.

## 4. Data model and sources

### Types (proposal, not final API)

Same pattern as rivers: metadata and towns in `roads.json`, generated geometry in
`roadCourses.json`, merged in the country's `index.ts`. Nothing in the trainer names a
country or a network; classes, shield styles and labels are data.

```ts
// types/trainer.ts
export type StudySet = 'reg' | 'dep' | 'city' | 'riv' | 'tel' | 'nom' | 'road';

// types/geo.ts
export type RoadClass = 1 | 2 | 3;                  // 1 trunk, 2 regional, 3 minor (§2)
export type ShieldStyle = 'blue' | 'red' | 'yellow' | 'green' | 'white';

export interface RoadNetwork {
  id: string;            // "A", "PE" — data id, not shown
  shield: ShieldStyle;   // generic style, real-world colour of the sign
}
export interface Road {
  id: string;            // stable, e.g. "a7"; progress key road|a7
  network: string;       // RoadNetwork.id
  ref: string;           // as signed: "A 7", "PE-1N"; never translated
  class: RoadClass;
  course: LatLon[][];    // parts, each ordered from the start terminus
  towns: string[];       // RoadData.towns ids, in order along the road
  codes: string[];       // departments it crosses (hints, Area scope)
  lengthKm?: number;     // sourced; whole route
}
export interface RoadData { networks: RoadNetwork[]; roads: Road[]; towns: RoadTown[] }
// RoadTown = RiverTown's shape (id, name, lat, lon); a town may sit on several roads.

// Country gets `roads?: RoadData` (required when `sets` includes 'road').
// CountryCopy.data gets:
//   roadNetworks?: Record<networkId, { label: string; sign: string }>  // "Autobahn", "blue shield, white number"
//   roadClasses?: Record<RoadClass, string>                              // "trunk", "regional"
//   roads?: Record<roadId, { name?: string; rule?: string }>             // optional nickname, numbering note
```

Zod and `validateCountry` additions: unique ids without `|`; `network` exists; `ref`
non-empty and unique within the country; each course part ≥ 2 distinct finite points inside
the country's bounding box (with a small margin); `towns` and `codes` reference existing ids;
every road's class is drawn by some threshold; `sets` containing `road` requires `roads`
with at least five roads per offered class (enough distractors); copy for every network,
class and road text in every language (the existing "missing translation" rule).
Unit-tested pure services: `roadVisibility(viewWidthKm, zoomRatio) → classes`,
`nearestRoad(point, roads, toleranceMapUnits) → { id, distance }[]` (polyline distance with a
bounding-box prefilter; concurrent sections return all ids), `placeShields(...)`
(deterministic, collision-free), and road distractors with an injectable rng.

Settings: `roadClass` and `road` (picker, like `river`) join `Settings`, normalised when the
country lacks roads or the saved id is gone. Progress: `road|<id>` under the existing key; a
road whose number changes gets a **new id** (old records stay harmless), as visual-meta does.

### Sources and licensing

Measured on 2026-11-28 by clipping Natural Earth `ne_10m_roads` (v5, public domain) to each
country's `ne_10m_admin_0_countries` polygon (metropolitan France only), lengths approximate:

| Country | NE road length | Features with a national number | What is there |
|---|---|---|---|
| France | ≈ 23,400 km | 128 distinct A/N/D refs | Motorways present as geometry, but numbering patchy: **A7 has no A tag** (only E15), A1 ≈ 24 km of ≈ 210 tagged, A9 ≈ 60 km; some refs are old N numbers now D (D619, D6014). |
| Germany | ≈ 21,600 km | 68 A refs, 16 B refs | **Best**: A1–A8 mostly tagged (A9 ≈ 175 of ≈ 530 km); two-digit A mostly present; A99 and recent openings missing; B roads sparse. |
| Peru | ≈ 10,100 km | **none** | Geometry of the main network only, no numbers at all. |
| Poland | ≈ 14,300 km | 9 A refs | A1/A2/A4 partly; no DK numbers. |
| Guatemala | ≈ 1,600 km | CA-1, 2, 9, 13 (as bare numbers) | Sparse. |

NE's roads layer is old (its European features carry version 1.x edit notes) and coarse, but its
geometry is good enough to *read* as the road at our zooms, and the licence is ideal.

Recommendation per country:

- **Germany: Natural Earth geometry + NE's A tags**, corrected by a small hand-written
  overrides file (segment → road id) for untagged parts, checked against two route
  descriptions (Wikipedia list, Autobahn GmbH / BASt facts). For B roads later, evaluate
  BKG's DLM250 (Datenlizenz Deutschland – Namensnennung 2.0, attribution only, M: verify the
  version and terms) before considering anything else.
- **France: Natural Earth geometry, numbered by hand** using NE's E-route and local tags as
  a guide (E15 → A6/A7…), checked against two sources per route. Candidate upgrade: IGN data
  under Etalab's Licence Ouverte 2.0 (attribution only, M: verify which IGN product still
  carries road numbers and its current licence page). France's outline uses a fitted
  projection, so roads, like its rivers, may sit a few px off: check against city dots.
- **Peru: Natural Earth geometry, tagged by hand** from the MTC's route definitions (the
  legal route classifier lists each route as a sequence of towns: facts, not expression),
  falling back to a **hand-drawn course through towns** as for Peru's rivers where NE has
  no line. MTC's own GIS layers would be better, but their licence is unknown (open question).
- **Not usable:** OpenStreetMap (ODbL, share-alike: excluded without the owner's approval);
  Google, Apple, Bing, Michelin or any commercial map, including tracing; GRIP (CC BY-SA).
  OSM is listed as an open question only in case NE plus hand work proves insufficient for
  minor classes; nothing in the pilot needs it.

Every source goes in the country's `RESEARCH.md` with URL, licence, version and date;
credits extend the existing Natural Earth line ("…state outlines, river courses and roads").
Shields are our own SVG/CSS drawing (MIT), not sign files from Commons.

### Bundle size

Measured for NE motorways only, after line merging, coordinates rounded to 3 decimals:

| Germany 66 A routes | raw | gzip |
|---|---|---|
| unsimplified | 68.6 KB | 22.1 KB |
| Douglas–Peucker 0.01° (≈ 1 km) | 19.8 KB | 6.9 KB |
| 0.03° (≈ 3 km) | 13.1 KB | 4.6 KB |

France's 58 A routes: 17.6 KB raw / 6.2 KB gzip at 0.01°. Proposal: `roadCourses.json` at
0.01° loads with the country (budget ≤ 15 KB gzip per country for classes 1–2); a
`roadCoursesDetail.json` at 0.002° loads lazily on first zoom past 150 km wide and only if a
class-3 set is offered. Generation: `npm run build:roads -- <country>` (or a `--roads` step
in `build-outline.ts`) reads the cached NE files, clips to the country with a 5 km buffer
(dropping neighbours' roads such as the Dutch N11 that leak into a naive clip), applies the
overrides, merges, simplifies, rounds, and prints untagged segments and per-road length
against the sourced `lengthKm` so gaps are visible.

## 5. Country locator map

**Decision:** a small, non-interactive locator **beside the country picker**, the country
filled in `--blue` on its continent in `--line` strokes over `--sea`, no labels. Desktop:
64 × 48 px left of the "Country" label in the top-right header; phone: 44 × 36 px between
the two pickers in the first row (the row has ≈ 100 px free at 390 px). Rationale: it
belongs to the choice of country, stays out of the map, and costs no row on phones.
Rejected: an inset in a map corner (covers the map, fights pan and the zoom buttons) and a
side-panel card (below the map on phones, where nobody sees it).

```text
 Desktop header                                   Phone first row (390 px)
 Germany map trainer      [▫▪] Country [Germany v]   [Германія v] [▫▪] [Беларуская v]
                                Language [English v]
```

- Shows: the continent frame from data (Europe for France and Germany, South America for
  Peru), neighbours as outlines, the country filled. France shows the metropolitan part.
- Accessibility: `role="img"` with a localized name, e.g. "Germany on the map of Europe"
  (`t()` key with `{country}` and `{area}`, `area` from `copy`). Hidden in print.
- Data: Natural Earth `ne_110m_admin_0_countries` (public domain), projected and clipped by
  `build-outline.ts` into a tiny per-country `locator.json` (viewBox + two paths), also for
  France, whose main outline comes from npm. Measured:
  Europe ≈ 26 KB raw / 9 KB gzip unclipped, South America ≈ 12 KB / 4 KB; a per-country frame
  rounded to 1 px at 64 px wide should be ≤ 3 KB gzip. Credit: France's copy gains the
  Natural Earth line; Peru's and Germany's already have it.
- Both themes through tokens; no motion; it updates on country switch with the rest.

## 6. Pilot and delivery sequence

**Recommend Germany, Autobahn class 1 (A1–A9) and class 2 (two-digit)**: the clearest
numbering rule of the three countries, blue shields everywhere on coverage, the best Natural
Earth tags, and an exact projection (no fitted-outline drift as in France). About 60 roads
is enough for distractors. France's A roads are the natural second country (same engine,
hand tagging); Peru's six longitudinals and selected transversals third, ideally after the
costa / sierra / selva pilot so the cards can link the two.

Issue-sized steps:

1. **Owner answers** the open questions below.
2. **Research** (geoguessr-pro): `data/germany/RESEARCH.md` roads section — kept routes,
   termini, lengths, towns along each (GeoNames, as today), two sources each, sign notes.
3. **Data tooling**: `build:roads` from Natural Earth with overrides, simplification and a
   gap report; `roads.json`, `roadCourses.json`; the locator paths for all three countries.
4. **Engine**: types, zod and referential checks, copy keys (en, be; Belarusian road terms
   recorded in `i18n/README.md`), `StudySet` `road`, settings normalisation, pure services
   with tests. Existing countries validate unchanged.
5. **Locator UI** (small, independent): with React port stage 3 (header and map), or before
   it in `index.html` if the owner wants it sooner.
6. **Learn road layer** after React port stage 3: layer, thresholds, shields, picker, card.
   Check light and dark, 1280 and 390 px, both languages, France and Peru unchanged.
7. **Practice** after React port stage 4: find (search and click) and name, keyboard
   crosshair, live region, smoke test extended to the new set and kinds.
8. **Evaluate** with the owner, then France.

Sequencing: do not build this inside `trainer.ts` before the port. Steps 2–4 do not touch the
UI and can run in parallel with React stages 1–3 and with the visual-meta Peru research. The
line hit-testing service (`nearestRoad`) is generic and should serve visual-meta's later
`route` / `line` layers too; build it once. React hand-off: `RoadLayer`, `RoadShield`,
`RoadCard`, `RoadPicker`, `LocatorMap` are view components; country data owns roads; settings
own `road` / `roadClass`; progress storage owns Leitner records; round state owns the target,
attempts and hint.

## Open questions for the owner

1. **Pilot:** Germany Autobahn classes 1–2 first (recommended), or France A roads as in your
   example?
2. **Search at full view:** roads hidden until you zoom in, also in Practice (recommended:
   the search is the exercise), or class 1 visible at the full view in Learn?
3. **France N roads:** Learn-only and limited to current long trunks, given the 2006 and 2023
   transfers — agreed? D roads stay a tip.
4. **Germany B roads:** out of the pilot; later as a Learn-only minor class from a licensed
   source (BKG DLM250 if its terms check out)?
5. **Peru sources:** may we hand-tag Natural Earth geometry from the MTC's route
   definitions? Should someone ask the MTC about the licence of its GIS layers?
6. **OpenStreetMap:** stays excluded (recommended; not needed for classes 1–2). Ask again
   only for minor classes?
7. **Peru department route prefixes** (AR-, CU-…): worth a backlog drill like France's plate
   numbers, once the full list is verified?
8. **Neutral taps** (no road in reach, or zoomed out too far) cost no attempt — agreed?
9. **Locator:** beside the country picker, decorative, no click (recommended) — or should
   clicking it open a larger map / the country picker?
10. **Km-marker kinds** (Peru PE-1 "km → place", Guatemala later): worth a follow-up spec?
