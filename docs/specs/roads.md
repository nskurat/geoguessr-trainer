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

## 3. Practice: search and click

## 4. Data model and sources

## 5. Country locator map

## 6. Pilot and delivery sequence

## Open questions for the owner
