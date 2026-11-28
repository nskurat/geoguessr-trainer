# Road numbers and a country locator map

**Status:** approved by the owner on 2026-11-28 (see "Owner decisions" at the end; decision 2
reshaped §2 and §3 into pattern-based search); not an implementation or approved data.
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
`ne_10m_admin_0_countries` (§4). OpenStreetMap (approved for road data on 2026-11-28)
could not be queried from this session and is specified as the pipeline's first
measurement. Player guides (plonkit) were blocked from this session
(HTTP 403), so the "seen on Street View" claims below are from the research notes and
general player knowledge and are marked M at best until re-checked. Wikipedia is used for
facts only (route numbers and termini), never copied text (`docs/licensing.md`).
Confidence: **H** = documented by an encyclopedic or official source and stable (a second,
independent source is still required before it becomes data, as in visual-meta); **M** =
player knowledge, one weak source, or likely to change; **L** = hypothesis, do not quiz.

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
| **B** Bundesstraßen (≈ 40,000 km) | Yellow rectangle, black number (H, Wikipedia); yellow direction signs | Numbered by law in 1932 and largely kept; low numbers are old long-distance routes (B1 Aachen–Berlin area); higher numbers have only a loose regional pattern (L) | **Learn-only later**, class 3. Very common on signs, but 40,000 km of geometry and no clean rule; OSM covers them when wanted (§4). |
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
roads. In it the map shows roads by class as you zoom, like a road atlas: **class 1 is already drawn at the full
country view** (owner decision 2: the skill is scanning the network and reading its pattern),
smaller classes appear deeper. The land is drawn in plain
`--land` (no region hues) so the roads, not the regions, carry colour. Rejected: an overlay
toggle on every set (clutter, a new toolbar control; kept as a later idea), and showing every
class at the full view (unreadable on a phone).

### Zoom thresholds

Thresholds are in **visible map width in km** (from the projection), so they mean the same
on every country and screen; a class is drawn when the view is narrower than its threshold
*and*, for classes 2 and 3, zoomed at least 1.3× past the full country view. **Class 1 is
always drawn, with shields at the full view** (fewer, by the placement rule below), because
pattern search needs the trunk network in sight:

| Class | Meaning (per country data) | Drawn when view width ≤ | Shields when ≤ |
|---|---|---|---|
| 1 | Trunk: A1–A9, French Paris radials, PE-1/3/5 | always | always (placement-limited) |
| 2 | Regional: two-digit A, Peru transversals | 300 km | 200 km |
| 3 | Minor (later): B roads, French N | 120 km | 80 km |

Reachability: today the map zooms in to at most the full width ÷ 14 (`zoomAt` in
`trainer.ts`), which is ≈ 80 km for Peru and would leave class-3 shields out of reach. The
Roads set raises that cap to the full width ÷ 28, and every threshold is clamped to at least
1.5× the narrowest reachable view, so each class and its shields can always be reached.

At the full view the card says "Zoom in for regional roads" next to the zoom buttons' hint;
class 1 is visible from the start. A class fades in over
150 ms (none under `prefers-reduced-motion`). In Learn, the **selected road is always
drawn**, whatever the zoom, with its shields. Practice has no selection (§3).

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
  and its sign description ("blue shield, white number"), the numbering rule that applies
  first ("odd: north–south; two digits 4x: Rhine-Ruhr to Frankfurt"), its **neighbours in the
  pattern** ("between the A 5 and the A 9; crosses the A 2 and the A 4"), then endpoints,
  towns along it in order (the river-card pattern), length and regions crossed, then its
  **other numbers** (§4 "Several numbers"): "Also numbered: E 45: Flensburg – Würzburg; A 44:
  Kassel", with former numbers last ("Formerly: …"). The point is
  to learn where a road sits *relative to the others and to the rule*, not its exact course. Card text comes
  from data and `copy`, never literals.
- **Other numbers stay off the map in the pilot.** A road shows only its primary `ref` on its
  shields at every zoom; no secondary (green E) shield appears at deeper zoom, so the map
  stays readable. E-routes and shared numbers appear in the info card only. On a shared
  stretch both lines coincide, and each road's shields are placed by the usual rule, so both
  primary numbers can show there. Secondary shields at the deepest zoom are an option to
  revisit after the pilot, not a pilot item.
- The Area filter is hidden for Roads in Learn (roads cross areas); the `labels` setting
  `off` hides shields, `auto` follows the table above.

### Performance

Roads are a few hundred paths at most (Germany's 66 A routes are ≈ 7 KB gzip at 1 km
tolerance, §4). Draw each road once as one path per part inside one `<g>` per class and
toggle the group's `display` on zoom; lines are never re-rendered on pan. Shield placement
re-runs when a zoom or pan settles (debounced, ~100 ms) on projected points cached in map
units, only for roads intersecting the view. A finer geometry
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

**What find trains (owner decision 2, geoguessr-pro view).** On Street View a player sees a
shield ("A 7") and needs, within seconds, a rough position: *odd, so north–south; between
the A 5 and the A 9, so through the middle of the country*. Pros do not memorise courses;
they read the numbering rule against the roads they already know. So find is a **scanning
exercise on a labelled network**: the trunk roads are visible with their numbers, and the
player locates the target from its neighbours and the rule. It is not a memory test of
where a line runs on a blank map.

### Find: "Find the A 7"

1. The prompt shows the target as a shield (`A 7`), no endpoints. The map starts at the
   full country view (or the Area scope) with the network drawn as in Learn (§2): class 1
   at once, deeper classes as the player zooms, **with shields on the other roads**.
   **Unlabelled:** the target and 3–5 **decoys**, chosen like the name kind's distractors
   (same class, nearby or parallel, same-band numbers), so the target can't be found by
   elimination ("the only road without a shield"). Decoys and target are drawn exactly
   alike. Practice hides the Road picker and clears the Learn selection; only the Road
   class and Area filters remain, and the hover tooltip is off.
2. The player pans and zooms. A tap counts only when it is **within the screen tolerance
   of a visible road**: 12 px for a mouse, 20 px for a coarse pointer (a 40 px band, the
   tap-target minimum). The road **nearest** to the tap point is the answer. Only where the
   target is within 3 px of that nearest distance (a shared, concurrent section or the very
   point of a crossing) does the target win; a tap that is clearly on another road at a
   junction is that other road. **Shared stretches:** where the target shares a carriageway
   with another road (a `concurrent` altRef, §4), both route relations hold the shared ways,
   so both courses run there and the tie rule counts the tap for the target, whichever of
   the two it is. The prompt always uses the primary `ref`, and a road that shares a stretch
   with the target is never one of its decoys. A missing shared section shows up as a gap
   in the build:roads report.
3. **Neutral taps** cost no attempt: a tap with no road in tolerance ("Tap on a road"), or
   a tap while the target's class is not yet drawn ("Zoom in — roads appear as you zoom").
   A drag or pinch never answers.
4. **Wrong road:** the tapped road flashes `--red` for 650 ms with its own shield and the
   line "That's the A 5", so a miss still teaches. Three attempts, as today.
5. **Hint after the second miss: the pattern, not the place.** The prompt states the rule
   and the neighbours from data, e.g. "Odd numbers run north–south; the A 7 lies between the
   A 5 and the A 9", and the two neighbour roads pulse once in `--hl`. Only for a road with
   no usable rule (e.g. a Peru transversal) does the hint fall back to the regions it
   crosses. Then up to two of its other numbers ("the A 7 — also the E 45, E 43"), never a
   former one. No hint after the first miss (the wrong road's number is already information).
6. **After the third miss:** the map zooms to the target, which blinks with its shields;
   the player taps it (or presses Enter / "Next") to continue — the existing reveal rule.
7. Outcome: 0 right first try, 1 second, 2 third, 3 revealed — the existing `Outcome`, so
   scoring, round summary and Leitner boxes are unchanged. Auto-advance timings as today.
8. **Speed is shown, not graded** in the pilot: the time to the right tap appears in the
   feedback ("Found in 4 s") and the round summary gives the median, so the player can see
   the scan getting faster. Whether a slow first-try find should count as outcome 1 is left
   for after the pilot (a pure-service change in `scoring`, with rng/time injected).

### Name: "Which road is this?"

The map zooms to the highlighted road (drawn in `--road-sel`, others faint and unlabelled)
and offers four or five numbers. Distractors are **genuinely confusable**: same class and
nearby (shares a region or runs parallel within ~100 km), plus a same-band number (A 45 for
A 44; PE-28A for PE-26), never random. Keys 1–5 pick, as today; the reveal shows the right
shield on the road. This is also the accessible kind (below).

**Other numbers count as right (decision).** Options are primary refs only, and they never
include another number of the highlighted road. Roads that share a stretch with it are
excluded from the distractors, and E or former numbers are never options. So a right answer
can only be its own shield number. Any answer that is one of the road's numbers (its primary
`ref` or any `altRefs` number, `refMatchesRoad`) counts as **right**, not merely "not
wrong", for a later typed-answer kind or an option list that includes them. A player who
reads "E 45" on a green sign and names it has read the road correctly. The reveal still
shows the primary shield and lists the other numbers.

### Practice wireframes

Desktop, 1280 px, find, after the second miss (hint shown):

```text
 [Macro-regions][States][Cities][Rivers][Name endings][Roads]
 [Learn | Practice]  Kind [Search and click | Which road?]  Class [All v]  Area [All v]
 +--------------------------------------------+  +---------------------------+
 |  [A 1]═══════[A 2]════╬═════════   [A 9]   |  | PRACTICE · 4 / 20         |
 |      ║               ║          ║          |  | Find the  [A 7]           |
 |   ═══╳═══[A 4]═══════╬═══════   ║ (pulse)  |  | ✗ That's the A 5.         |
 |   (red flash: [A 5]) ║  (decoy) ║          |  | Hint: odd numbers run     |
 |      ║ (pulse)       ║          ║          |  |  north–south; the A 7 is  |
 |      ║               ║               [+]   |  |  between the A 5 and A 9. |
 |                                      [−]   |  |                           |
 |                                      [⤢]   |  +---------------------------+
 +--------------------------------------------+
```

Phone, 390 px, dark, name: the prompt is scrolled into view, map then choices.

```text
 +------------------------------+
 | Which road is this?   7 / 20 |
 +------------------------------+
 |      ═══════════             |
 |   (highlighted road, --hl)   |
 |              ═════════   [+] |
 |                          [−] |
 +------------------------------+
 [1  A 4 ] [2  A 44] [3  A 45]
 [4  A 5 ] 
 ✓ A 45 — Dortmund – Aschaffenburg (shown on the road after the answer)
```

Reveal after the third miss in find: the map zooms to the target, which blinks with its
shields, the card says "Here is the A 7 — tap it to continue" and Next / Enter also continues.
Round done, no due items, loading and a country without roads follow the existing states.

Unlabelled lines in the sketch are the target and decoys; every other road keeps its shield.

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

Same pattern as rivers (`rivers.json` + generated `riverCourses.json`), with the licence
boundary of `docs/licensing.md` "OpenStreetMap road data (ODbL)" built in:

- `roads.json` — **our own data** (MIT): networks, the curated list of roads with class,
  sign ref, termini, towns along them (GeoNames, as for rivers), departments crossed, notes.
- `roads.osm.json` — **OSM-derived only** (ODbL): per road id, the simplified course and the
  OSM `ref` and relation id it came from. Nothing of ours goes in it, and nothing from it is
  copied into `roads.json`; the two are joined at load time in the country's `index.ts`
  (as `riverCourses.json` is today), so the combined object exists only in memory.
- `roadCourses.json` — only for a country whose geometry comes from Natural Earth or is
  hand-drawn (public domain / our own), same shape as `roads.osm.json`.

Nothing in the trainer names a country or a network; classes, shield styles and labels are
data.

```ts
// types/trainer.ts
export type StudySet = 'reg' | 'dep' | 'city' | 'riv' | 'tel' | 'nom' | 'road';

// types/geo.ts
export type RoadClass = 1 | 2 | 3;                  // 1 trunk, 2 regional, 3 minor (§2)
export type ShieldStyle = 'blue' | 'red' | 'yellow' | 'green' | 'white';

export interface RoadNetwork {
  id: string;            // "A", "PE" — data id, not shown
  shield: ShieldStyle;   // generic style, real-world colour of the sign
  label: string;         // source language (English): "Autobahn"
  sign: string;          // "Blue shield, white number"
}
export interface Road {
  id: string;            // stable, e.g. "a7"; progress key road|a7
  network: string;       // RoadNetwork.id
  ref: string;           // as signed: "A 7", "PE-1N"; never translated. The primary
                         // number: drilled, prompted and drawn on the shield
  altRefs?: RoadAltRef[]; // its other numbers, most relevant first (below)
  class: RoadClass;
  from: string;          // RoadData.towns id of the start terminus (may be a border town)
  to: string;            // … of the end terminus
  course: LatLon[][];    // parts, each ordered from `from` towards `to`; joined in from
                         // roads.osm.json / roadCourses.json, never stored in roads.json
  towns: string[];       // RoadData.towns ids, in order along the road
  codes: string[];       // departments it crosses (hints, Area scope)
  lengthKm?: number;     // sourced; whole route
  name?: string;         // nickname in English, e.g. "Carretera Central"
  rule?: string;         // numbering note in English, e.g. "Odd: north–south"
}
export interface RoadAltRef {
  ref: string;           // "E 45"; for concurrent, the other road's primary ref
  network: string;       // "E"; for concurrent, the other road's network (need not be in networks)
  kind: 'european' | 'concurrent' | 'former';
  from?: string;         // towns ids of THIS road bounding the stretch (both or neither;
  to?: string;           //   equal for a short stretch at one town); absent = whole road
  note?: string;         // maintainer note in English (exact junctions); not shown or translated
}
export interface RoadData { networks: RoadNetwork[]; roads: Road[]; towns: RoadTown[] }
// RoadTown = RiverTown's shape (id, name, lat, lon); a town may sit on several roads.

// Country gets `roads?: RoadData` (required when `sets` includes 'road').
// As for rivers (`flowsInto` in rivers.json, translated in `copy.data.rivers`), the English
// text lives in the data and every other language translates it by id in CountryCopy.data:
//   roadNetworks?: Record<networkId, { label: string; sign: string }>
//   roads?: Record<roadId, { name?: string; rule?: string }>
// Class names ("trunk", "regional", "minor") are generic interface terms: `t()` keys in
// i18n/en.ts and be.ts, not country copy.
```

```ts
// roads.osm.json (ODbL), generated by scripts/build-roads.ts, never hand-edited
type RoadCourses = Record<roadId, {
  osm: { relation?: number; ways?: number[]; ref: string };  // provenance
  course: [number, number][][];                               // [lat, lon] parts
}>;
```

Zod and `validateCountry` additions: unique ids without `|`; every road in `roads.json`
has exactly one course entry (in `roads.osm.json` or `roadCourses.json`, not both) and every
course entry a road; the OSM `ref` agrees with `roads.json` `ref` after normalising spaces
(a mismatch means OSM renumbered or we did: an error to review, not to auto-fix); a country
with any `*.osm.json` file must have the OSM credit in every language's `credits`;
`network` exists; `ref` non-empty and unique within the country; each course part ≥ 2 distinct finite points inside
the country's bounding box (with a small margin); `from`, `to`, `towns` and `codes`
reference existing ids, and `from` / `to` lie within a few km of the course ends;
every road's class is drawn by some threshold; `sets` containing `road` requires `roads`
with at least five roads per offered class (enough distractors); copy for every network
and road text in every non-source language (the existing "missing translation" rule).
**Several numbers.** A road keeps one primary `ref`: the number drilled, put in the prompt
and drawn on the shield. Its other numbers go in `altRefs`, one entry per number, or per
stretch when the number covers only part of the road. Kinds:

- `european`: an E-route signed on (part of) the road. In Germany it is rare on signs; in
  France it is green next to the A number.
- `concurrent`: a shared stretch, two national numbers on one carriageway. It is recorded on
  **both** roads and names the other road's primary `ref`.
- `former`: a renumbered or legacy number (Peru's older route names, France's N → D
  transfers).

Stretches are town-granular (`from` / `to` are towns of this road bounding the stretch); the
exact junctions go in `note`, sourced in `RESEARCH.md`. Validation:

- No altRef repeats the road's own `ref`.
- A `european` or `former` number is no other road's primary `ref`; a number that is one must
  be `concurrent`.
- A `concurrent` number **is** another road's primary `ref`, in that road's network, and that
  road lists this one back as `concurrent`.
- A number listed twice needs a stretch on every entry, and no stretch is repeated.
- `from` / `to` come both or neither, and are towns of this road.

`refMatchesRoad(ref, road)` accepts the primary `ref` or any altRef number. The OSM `ref`
check splits a ";" list and passes when any number is the primary `ref` or a known altRef;
extra numbers are build:roads suggestions, not errors. The engine uses the numbers as
follows:

- Find never picks a road concurrent with the target as a decoy, and name never offers one
  as an option (`concurrentRoadIds`).
- The hint names up to two current other numbers (`alsoRefs`).
- The info card lists them all with their stretches (`altRefLines`).

Unit-tested pure services: `roadVisibility(viewWidthKm, zoomRatio) → classes`,
`nearestRoad(point, roads, toleranceMapUnits) → { id, distance }[]` (polyline distance with a
bounding-box prefilter; concurrent sections return all ids), `placeShields(...)`
(deterministic, collision-free), and road distractors with an injectable rng.

Settings: `roadClass` and `road` (picker, like `river`) join `Settings`, normalised when the
country lacks roads or the saved id is gone; entering Roads also normalises a saved `town`
or `dot` kind to `find`, like the existing guard for sets without town questions. Progress: `road|<id>` under the existing key; a
road whose number changes gets a **new id** (old records stay harmless), as visual-meta does.

### Sources and licensing

The owner approved OpenStreetMap for **road geometry and road numbers** on 2026-11-28
(`docs/licensing.md`, "OpenStreetMap road data (ODbL)"). OSM is the **recommended source**
for every country where Natural Earth is too coarse or unnumbered, which is all three; Natural
Earth stays as the public-domain fallback and as an independent cross-check. Other OSM data
(places, boundaries, land use) is still not approved: towns come from GeoNames, the outline
and the locator (§5) from Natural Earth.

**Natural Earth, measured** on 2026-11-28 by clipping `ne_10m_roads` (v5, public domain) to
each country's `ne_10m_admin_0_countries` polygon (metropolitan France only), lengths
approximate:

| Country | NE road length | Features with a national number | What is there |
|---|---|---|---|
| France | ≈ 23,400 km | 128 distinct A/N/D refs | Motorways present as geometry, but numbering patchy: **A7 has no A tag** (only E15), A1 ≈ 24 km of ≈ 210 tagged, A9 ≈ 60 km; some refs are old N numbers now D (D619, D6014). |
| Germany | ≈ 21,600 km | 68 A refs, 16 B refs | **Best**: A1–A8 mostly tagged (A9 ≈ 175 of ≈ 530 km); two-digit A mostly present; A99 and recent openings missing; B roads sparse. |
| Peru | ≈ 10,100 km | **none** | Geometry of the main network only, no numbers at all. |
| Poland | ≈ 14,300 km | 9 A refs | A1/A2/A4 partly; no DK numbers. |
| Guatemala | ≈ 1,600 km | CA-1, 2, 9, 13 (as bare numbers) | Sparse. |

Route-level check of Germany's trunk (NE length tagged with the number versus the route's
length per Wikipedia, M; NE lengths are approximate and include parallel carriageways in
places):

| Route | A1 | A2 | A3 | A4 | A5 | A6 | A7 | A8 | A9 |
|---|---|---|---|---|---|---|---|---|---|
| NE tagged, km | 681 | 523 | 509 | 238 | 379 | 442 | 754 | 506 | 175 |
| Route, km | ≈ 750 | ≈ 490 | ≈ 770 | ≈ 600 (two parts) | ≈ 445 | ≈ 480 | ≈ 960 | ≈ 500 | ≈ 530 |

NE's roads layer is old (its European features carry version 1.x edit notes) and coarse;
even Germany would need A3, A4 and A9 tagged by hand, France most of its A roads, and Peru
every route.

**OpenStreetMap versus Natural Earth.** OSM's download and query servers (Overpass,
Geofabrik) were blocked from this session, so OSM could not be measured here; the comparison
below is what the pipeline must confirm, with confidence marks, and step 3 (§6) prints the
real numbers per route before the pilot's scope is final.

| | Natural Earth (measured) | OpenStreetMap (expected, to measure) |
|---|---|---|
| Numbers | Patchy (above); none for Peru | Route **relations** with `ref` for every motorway and national road in all three countries (H for Germany and France, M for Peru's PE routes) |
| Currency | Years old; misses A99, recent openings and the French N→D transfers | Current; also records old numbers in `old_ref`, useful for "you may see the old N 7 on older imagery" tips (M) |
| Geometry | One line per road, ≈ 1:1M, good enough at our zooms | Survey-grade, both carriageways as separate ways: the pipeline keeps one direction |
| Raw size | 50 MB for the world file | Per country: one Overpass query per network returns a few MB (M); a Geofabrik extract is GBs for France and Germany (M), so Overpass is preferred |
| After simplification | Germany's A routes ≈ 7 KB gzip at ≈ 1 km | Should match NE to within ~1.5× at the same tolerance, because tolerance, not source detail, sets the point count (M; measure) |
| Licence | Public domain, credit as good practice | ODbL: separate `*.osm.json`, credit in every language, `RESEARCH.md` record |

Recommendation per country (every route still checked against two sources for its ref and
termini, as any data):

- **Germany: OSM** relations `type=route` + `route=road` + `network=BAB` (Autobahn), later
  `network=BS` (Bundesstraßen) (M: confirm the network values on a sample). NE is the
  cross-check; BKG DLM250 (dl-de/by-2-0) is no longer needed for B roads.
- **France: OSM** relations with `network=FR:A-road` and `FR:N-road` (M: confirm), which also
  settles the current N network after the 2006 and 2023 transfers. France's outline uses a
  fitted projection, so roads, like its rivers, may sit a few px off: check against city dots.
- **Peru: OSM** relations or, if relations are incomplete, ways with `highway=trunk|primary`
  and `ref~"^PE-"` (M: Peru's relations are less complete than Europe's; measure), checked
  against the MTC's route definitions (each route as a sequence of towns). Any stretch OSM
  lacks is **hand-drawn through towns** into `roadCourses.json`, never mixed into the OSM file.
- **Still not usable:** Google, Apple, Bing, Michelin or any commercial map, including
  tracing; GRIP (CC BY-SA); MTC GIS layers until their licence is known.

Every source goes in the country's `RESEARCH.md` with URL, licence, version and date; for OSM
the extract record the licence requires (below). Credits: "Roads © OpenStreetMap
contributors, ODbL" linking <https://www.openstreetmap.org/copyright>, in every
`copy.<lang>.ts` (Belarusian: "Дарогі © удзельнікі OpenStreetMap, ODbL"), next to the
existing Natural Earth and GeoNames lines. Shields are our own SVG/CSS drawing (MIT), not
sign files from Commons.

### Extract and simplification pipeline

`scripts/build-roads.ts`, run as `npm run build:roads -- <country>`, alongside
`build-outline.ts` and sharing its cache (`.cache/`, git-ignored) and projection helpers:

1. **Input:** the country's road list from `roads.json` (id, network, ref) and a per-country
   entry in the script (like `COUNTRIES` in `build-outline.ts`): the OSM network tags, the
   Overpass area (ISO 3166-1 code) and the simplification tolerance.
2. **Extract:** one Overpass query per network, `relation[type=route][route=road][network=…]
   (area); out geom;`, cached as `.cache/osm-<country>-<network>-<date>.json`. The cache
   file name carries the date; `--refresh` re-queries. A Geofabrik `.osm.pbf` extract is the
   fallback if Overpass is unavailable (same filters with `osmium tags-filter`).
3. **Assemble:** per relation, keep members with role `""` or `forward` (one carriageway),
   merge ways into ordered lines, orient from the `from` town to the `to` town in
   `roads.json`, and clip to the country's Natural Earth outline with a 5 km buffer (drops
   the parts of cross-border routes abroad).
4. **Simplify:** Douglas–Peucker in projected km (not degrees, so tolerance is even across
   latitudes): 1 km for classes 1–2, 0.2 km for the lazy detail file; drop parts shorter than
   2 km; round to 3 decimals (≈ 100 m).
5. **Write** `roads.osm.json` (and `roads.detail.osm.json` when a class-3 set exists) with
   `osm.relation`, `osm.ref` and the course, nothing else.
6. **Report:** per road, OSM length versus the sourced `lengthKm`, NE length for the same ref,
   gaps longer than 5 km, ref mismatches, roads in `roads.json` with no relation; plus total
   raw and gzip size against the budget. The report goes into the PR, and its summary
   (date, query, tags, tolerance, sizes) into `RESEARCH.md` as the licence requires.
7. **Several numbers:** OSM often stores several numbers in one tag (`ref=A 1;A 61`) and
   E-routes in `int_ref` (`E 45;E 43`). The script splits both. A relation belongs to every
   road whose primary `ref` is in its `ref` list. A ref mismatch is reported only when none
   of its numbers is a road's primary `ref` or known altRef. The other numbers are listed as
   **suggested altRefs** (road, number, guessed kind, relations) and never written into
   `roads.json`: a review checks the stretch and a second source, then adds them by hand.

Without network access the script runs from the cache; it never writes outside
`data/<country>/` and `.cache/`.

### Bundle size

Measured for NE motorways only, after line merging, coordinates rounded to 3 decimals:

| Germany 66 A routes | raw | gzip |
|---|---|---|
| unsimplified | 68.6 KB | 22.1 KB |
| Douglas–Peucker 0.01° (≈ 1 km) | 19.8 KB | 6.9 KB |
| 0.03° (≈ 3 km) | 13.1 KB | 4.6 KB |

France's 58 A routes: 17.6 KB raw / 6.2 KB gzip at 0.01°. OSM at the same tolerance is
expected in the same range (to be measured by the report). Budget: the course file for
classes 1–2 loads with the country, ≤ 15 KB gzip per country; the detail file loads lazily
on first zoom past 150 km wide and only if a class-3 set is offered.

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
numbering rule of the three countries, blue shields everywhere on coverage, well-tagged
data in both OSM and Natural Earth (so the cross-check works), and an exact projection (no
fitted-outline drift as in France). About 60 roads is enough for distractors. France's A
roads are the natural second country (same engine and pipeline, another network tag); Peru's six longitudinals and selected transversals third, ideally after the
costa / sierra / selva pilot so the cards can link the two.

Issue-sized steps:

1. **Owner answers** the open questions below.
2. **Research** (geoguessr-pro): `data/germany/RESEARCH.md` roads section — kept routes,
   termini, lengths, towns along each (GeoNames, as today), two sources each, sign notes.
3. **Data tooling**: `scripts/build-roads.ts` (§4 pipeline) from OSM via Overpass, with the
   NE cross-check and the gap and size report; `roads.json` (ours) and `roads.osm.json`
   (ODbL), the OSM extract recorded in `RESEARCH.md`, the OSM credit in both languages; the
   locator paths for all three countries (Natural Earth).
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

## Owner decisions (2026-11-28)

1. **Pilot:** Germany's Autobahns (classes 1–2) first, then France, then Peru.
2. **Pattern search, not memorised courses.** The exercise is finding a road quickly by
   scanning the network and remembering the numbering pattern, not learning where exactly it
   runs. So class 1 is drawn with shields from the full view in Learn and Practice; find
   hides the shields of the target and 3–5 confusable decoys only; the hint states the rule
   and the neighbours; speed is shown, not graded (§2, §3).
3. **France N roads:** Learn-only, limited to today's long trunk roads; D roads stay a tip.
4. **Germany B roads:** out of the pilot; later a Learn-only minor class from OSM.
5. **Peru gaps:** where OSM lacks a PE route, hand-draw it through towns from the MTC's
   published route definitions (our own work from official facts). No need to contact the
   MTC about its GIS licence while OSM covers most routes.
6. **Peru department route prefixes** (AR-, CU-…): a backlog item, once the full list is verified.
7. **Neutral taps** (no road in reach, or the target's class not drawn yet) cost no attempt.
8. **Locator:** beside the country picker, an informative image, not clickable for now.
9. **Km-marker kinds** (Peru PE-1, Guatemala later): a follow-up spec after the Germany pilot.
10. **Several numbers per road** (owner comment on the roads pilot PR, 2026-11-28):
    - one primary `ref` plus `altRefs` (`european`, `concurrent`, `former`, with an
      optional town stretch);
    - OSM's extra numbers are only suggestions;
    - other numbers count as right in name and are never distractors;
    - a tap on a shared stretch counts for the target;
    - the pilot shows E numbers only in the info card, with no secondary shields on the
      map (§2, §3, §4).
