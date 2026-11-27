# Germany — country brief and data notes

Compiled 2026-11-27 for the trainer's Germany data. Confidence: **H** = counted from a
primary dataset (GeoNames, Natural Earth); **M** = well-established general knowledge,
not re-checked online this time; **L** = community GeoGuessr meta from memory, unverified.

Network note: Wikipedia, plonkit.net, geohints, geonames.org and every web search were
blocked while this was compiled. Coordinates and place-name counts come from GeoNames
dumps mirrored on GitHub (`lutangar/cities.json` = GeoNames cities1000;
`zauberware/postal-codes-json-xml-csv` = GeoNames DE postal codes), both CC BY 4.0.
The GeoGuessr signals in §2 are from memory and should be re-checked against plonkit's
Germany guide when it can be fetched.

## 1. Coverage overview

- Street View: official Google coverage dates mostly from 2008–2009 and is thin and old in
  cities, because of the 2010 privacy opt-out (blurred houses). Since 2022–2023 Google has
  re-driven most of the country, so modern Gen 4 coverage is now dense almost everywhere. **M**
- Germany shows up very often in world maps; it is usually recognised at once (signs,
  bollards, yellow place-name signs), so the points are in placing it *inside* the country. **M**

## 2. Regional signals, ranked by usefulness inside Germany

| # | Signal | Region it tells | In the trainer? | Conf. |
|---|---|---|---|---|
| 1 | Town names on the yellow place-name sign (Ortsschild) and direction signs | Any; the next big city on the sign narrows it to tens of km | `city` set; road signs point to the cities in `cities.json` | M |
| 2 | Place-name endings | -ow/-itz east, -ing Old Bavaria, -ingen Swabia, -büll/-by Schleswig, -siel/-fehn East Frisia, -weiler Palatinate/Saar, -leben/-rode Harz | `nom` set (§5) | H (counts) |
| 3 | River in the town name (Frankfurt am Main / Frankfurt (Oder), Halle (Saale)) and along the road | Pins the town to a river | `riv` set | M |
| 4 | Number-plate prefix (Kreis code: M, HH, B, K…) | District; finer than states | No — needs sub-state units (backlog) | M |
| 5 | Landline area code on shop signs (first digit) | 02 Rhineland/Ruhr, 03 East, 04 North, 05 Lower Saxony/East Westphalia/North Hesse, 06 Hesse/RP/Saar/N-BW, 07 BW, 08 South Bavaria, 09 Franconia/Upper Palatinate | Only as a hint in the `dep` tip: zones cut across states | M |
| 6 | Landscape: North German Plain (flat, brick, wind turbines), Mittelgebirge, Alps | Broad north–south split | Not drillable on the map | M |
| 7 | Architecture: red-brick north, half-timbered centre, Alpine chalets south; prefab (Plattenbau) east | Broad | Not drillable | L |
| 8 | Bollard and kerb details, signs in Sorbian (Lausitz) and Danish (Schleswig) | Small areas | Not drillable | L |

## 3. Study-set decisions

- **Offered:** `reg`, `dep`, `city`, `riv`, `nom`.
- **No `tel`.** The engine maps one phone zone per department, but German area-code
  zones (first digit after 0) cut across the Länder: 05 covers Lower Saxony, East
  Westphalia (NW) and North Hesse; 06 covers Hesse, Rheinland-Pfalz, Saarland and northern
  Baden-Württemberg; Bavaria is split between 08 and 09. Any one-zone-per-state mapping
  would teach wrong answers. A rough hint stays in the `dep` tip.
- **No plates.** Kreis codes identify one of about 400 districts, not a state.
- Both need sub-state units (e.g. the BKG VG2500 Kreise, dl-de/by-2-0). That is a
  backlog item.
- **Department codes are hidden.** ISO 3166-2 suffixes (BY, NW…) are only ids.

## 4. Grouping (regions.json)

A study grouping, not an official one. It follows the main GeoGuessr splits:

| Key | Name | States | Capital shown |
|---|---|---|---|
| NORD | Nord | SH, HH, HB, NI | Hamburg |
| WEST | West | NW, HE, RP, SL | Köln |
| SUED | Süd | BW, BY | München |
| OST | Ost | BE, BB, MV, SN, ST, TH | Berlin |

Ost is the former GDR plus Berlin, the clearest cultural and landscape line on Street
View. Hessen goes in West rather than in a "Mitte", to keep four balanced zones.

## 5. Place-name endings (placeNames.json)

Counts of GeoNames DE postal localities ending in the pattern, by state (**H** for the
counts; the origins are **M**):

| Pattern | Counts | Kept as |
|---|---|---|
| -ow | MV 184, BB 99 | p0 (with -itz, -in) |
| -itz | ST 102, SN 62, MV 58, BB 51, TH 49 | p0 |
| -ing | BY 185 | p1 |
| -ingen | BW 200, BY 74 (Swabia), RP 70 | p2 |
| -leben | ST 89, TH 49 | p3 |
| -rode | ST 40, TH 30, NI 12 | p4 (with -roda, TH) |
| -büttel | HH, SH, NI | p5 |
| -siel, -fehn | NI only (East Frisia) | p6 |
| -büll / -by / -rup | SH 18 / SH 27 / mostly SH | p7 |
| -scheid | RP 73, NW 22 | p8 |
| -weiler | RP 120, BW 16, SL 5 | p9 |
| -reuth, -grün | BY 19 for -reuth; -grün also in Saxony's Vogtland | p10 |

-dorf and -hausen occur in every state and are left out on purpose. -ingen is also
common in RP; the pattern lists BW as its home, and the tip says "Swabia".

## 6. Files and sources

- `outline.json`, `riverCourses.json`: `npm run build:outline -- germany` from Natural
  Earth 1:10m admin-1 and rivers (`rivers_lake_centerlines` + `rivers_europe`), public
  domain. The state ids are the ISO 3166-2 suffixes; the names are German.
- `departments.json`: the 16 Länder and their capitals (GeoNames coordinates).
- `regions.json`: §4.
- `cities.json`: 98 cities. Tier 1: the 20 largest or best-known (state capitals and
  regional centres). Tier 2: other large and medium towns spread over every state.
  GeoNames coordinates, checked to fall inside their state's polygon. A few border towns
  (Konstanz, Görlitz, Bad Säckingen, Breisach, Dagebüll) fall just outside the coarse
  Natural Earth outline, and Holzminden (NI) falls just inside NW. That is acceptable.
- `rivers.json`: 14 rivers. Each town is checked to lie within a few km of the drawn course.
  Lengths are total lengths from memory, ±5% (**M**). Hand-drawn `course` tails extend
  Natural Earth downstream: the tidal Elbe Hamburg → Cuxhaven, the Weser Brake →
  Bremerhaven and the Ems to Emden. Natural Earth's upper Spree is wrong, so Bautzen is
  not listed on it. Villingen-Schwenningen is not listed on the Neckar, because NE's
  source stretch misses it.
- `placeNames.json`: §5; example towns use GeoNames coordinates.
- Credits in the footer: Natural Earth (public domain), GeoNames (CC BY 4.0).

## 7. Backlog: signals the engine cannot express

- Area-code zones and plate codes need sub-state units (Kreise).
- Landscape, architecture, bollards and Sorbian/Danish bilingual signs.
- Upper Spree course (Natural Earth's is wrong above Cottbus).
