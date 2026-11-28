# Germany — country brief and data notes

Compiled 2026-11-27 for the trainer's Germany data. Confidence: **H** = counted from a
primary dataset (GeoNames, Natural Earth); **M** = well-established general knowledge,
not re-checked online this time; **L** = community GeoGuessr meta from memory, unverified.

Network note: Wikipedia, Wikidata, plonkit.net, geohints, geonames.org, skarnik.by,
slounik.org and every web search were blocked while this was compiled; only
raw.githubusercontent.com was reachable. What could be checked there was:

- Coordinates and place-name counts: GeoNames dumps mirrored on GitHub
  (`lutangar/cities.json` = GeoNames cities1000; `zauberware/postal-codes-json-xml-csv` =
  GeoNames DE postal codes), both CC BY 4.0.
- Area codes: Google libphonenumber's geocoding table
  (`resources/geocoding/de/49.txt`, Apache 2.0), joined to the GeoNames postal places (§3).
- Belarusian spelling and declension: the official-orthography Hunspell dictionary in
  `LibreOffice/dictionaries` (`be_BY/be-official`), see `src/i18n/README.md`.

Still from memory, unverified: the GeoGuessr signals in §2 (re-check against plonkit's
Germany guide) and the river lengths in `rivers.json` (§6).

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
| 5 | Landline area code on shop signs (first digit) | 02 NW and northern RP, 03 East, 04 North, 05 NI, East Westphalia and North Hesse, 06 Hesse/RP/Saar/N-BW, 07 BW, 08 southern Bavaria, 09 northern Bavaria | Only as a hint in the `dep` tip: zones cut across states | H (§3) |
| 6 | Landscape: North German Plain (flat, brick, wind turbines), Mittelgebirge, Alps | Broad north–south split | Not drillable on the map | M |
| 7 | Architecture: red-brick north, half-timbered centre, Alpine chalets south; prefab (Plattenbau) east | Broad | Not drillable | L |
| 8 | Bollard and kerb details, signs in Sorbian (Lausitz) and Danish (Schleswig) | Small areas | Not drillable | L |

## 3. Study-set decisions

- **Offered:** `dep`, `city`, `riv`, `nom`. The macro-regions (§4) are an Area filter only,
  not the `reg` set.
- **No `tel`.** The engine maps one phone zone per department, but German area-code
  zones (first digit after 0) cut across the Länder: 05 covers Lower Saxony, East
  Westphalia (NW) and North Hesse; 06 covers Hesse, Rheinland-Pfalz, Saarland and northern
  Baden-Württemberg; Bavaria is split between 08 and 09. Any one-zone-per-state mapping
  would teach wrong answers. A rough hint stays in the `dep` tip. Checked by joining the
  5,200 prefixes in libphonenumber's `de/49.txt` to the state of the GeoNames postal place
  with the same name (about 370 names unmatched; single-digit stray counts are homonyms).
  Places per state for each first digit:

  | Digit | Places per state |
  |---|---|
  | 02 | NW 395, RP 79 |
  | 03 | MV 252, BB 248, ST 247, SN 201, TH 179 (and 030 Berlin) |
  | 04 | NI 282, SH 224 (and 040 Hamburg, 0421 Bremen) |
  | 05 | NI 374, NW 105, HE 55 |
  | 06 | RP 223, HE 219, BW 47, SL 47, BY 28 |
  | 07 | BW 458 |
  | 08 | BY 418: median latitude 48.2°N, 90% south of 48.7°N |
  | 09 | BY 503: median latitude 49.6°N, 90% north of 48.9°N |
- **No plates.** Kreis codes identify one of about 400 districts, not a state.
- Both need sub-state units (e.g. the BKG VG2500 Kreise, dl-de/by-2-0). That is a
  backlog item.
- **Department codes are hidden.** ISO 3166-2 suffixes (BY, NW…) are only ids.

## 4. Grouping (regions.json): Area filter only

A study grouping, not an official one. It follows the main GeoGuessr splits:

| Key | Name | States | Capital shown |
|---|---|---|---|
| NORD | Nord | SH, HH, HB, NI | Hamburg |
| WEST | West | NW, HE, RP, SL | Köln |
| SUED | Süd | BW, BY | München |
| OST | Ost | BE, BB, MV, SN, ST, TH | Berlin |

Ost is the former GDR plus Berlin, the clearest cultural and landscape line on Street
View. Hessen goes in West rather than in a "Mitte", to keep four balanced zones.

**Decision (2026-11-28 review): keep the grouping as the Area filter only; drop the `reg`
study set.**

- Why keep it: Ost carries real Street View signals that the player meets as one block:
  -ow/-itz place names (§5, **H** counts), the 03 area codes (§3, **H**), and the former
  inner-German border as a cultural and architectural line (**M**). Nord and Süd line up
  with the 04 and 07/08/09 area-code digits (§3) and with the -büttel/-siel versus
  -ing/-ingen endings. So learning states and cities one zone at a time teaches groups that
  share clues, and the Learn map colours states by zone.
- Why no `reg` set: the four names are our own labels, never on a sign, and "West" is the
  leftover of the other three (Hessen could as well be "Mitte"). Drilling "which zone is
  Thüringen in?" teaches the partition, not anything visible; the useful part (which states
  were the GDR) is in the `dep` tip and the filter.
- Saved settings with `set: 'reg'` fall back to the first offered set (`dep`); a saved Area
  stays valid. Old `reg|…` progress records stay in localStorage, unused.

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
| -heim | RP 219, BW 140, BY 116 (median latitude 49.5°N: Franconia), HE 32 | p11 |

-dorf and -hausen occur in every state and are left out on purpose. -ingen is also
common in RP; the pattern lists BW as its home, and the tip says "Swabia". -heim overlaps
-ingen and -weiler in the south-west but is rare in the north and east; its map shows RP,
BW and HE, and the text names Lower Franconia (one region of Bayern, so BY is not shaded).

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
- `rivers.json`: 15 rivers. Each town is checked to lie within a few km of the drawn course.
  Lengths are total lengths from memory, ±5% (**M**). Hand-drawn `course` tails extend
  Natural Earth downstream: the tidal Elbe Hamburg → Cuxhaven, the Weser Brake →
  Bremerhaven and the Ems to Emden. Natural Earth's upper Spree is wrong, so Bautzen is
  not listed on it. Villingen-Schwenningen is not listed on the Neckar, because NE's
  source stretch misses it. Natural Earth's "Lahn" starts up the Ohm in the Vogelsberg; it is
  cut at Cölbe, so the upper Lahn (Biedenkopf) is not drawn and Marburg is its first town.
- `placeNames.json`: §5; example towns use GeoNames coordinates.
- Credits in the footer: Natural Earth (public domain), GeoNames (CC BY 4.0).

## 7. Roads (roads.json)

Compiled 2026-11-28 for the roads pilot (`docs/specs/roads.md`, owner decisions of
2026-11-28). Find is a **pattern search on a labelled network**, so every road carries its
numbering rules and its neighbours as well as its towns.

### Kept routes

All 64 Autobahns **in operation**: class 1 = the nine single-digit trunk routes (A 1–A 9),
class 2 = the 55 two-digit routes. Left out: numbers that are only planned or under
construction (A 16, A 18, A 22, A 32, A 35, A 41, A 47, A 50, A 51, A 53–A 56, A 69, A 75,
A 77, A 80, A 82–A 91, A 97), three-digit spurs and city routes (A 100, A 111, A 352, …: a
later class 3 at most), and Bundesstraßen (owner decision 4).

Ids are `a<number>` and the signed ref is `A <number>` (with the space, as on the shields). A
road that is renumbered gets a new id.

### The numbering rule (in our own words)

Network `A` in `roads.json`, rule ids in brackets; each road lists the rules that place it,
most telling first.

- Direction: odd numbers run mainly north–south (`odd`), even numbers mainly east–west
  (`even`). **H** (de.wikipedia list, introduction; obvious on the map).
- Single digits are the long trunk routes; odd ones count up from west to east (A 1 … A 9),
  even ones from north to south (A 2 … A 8) (`trunk`). **H** (map; Natural Earth courses).
- Two-digit numbers: the first digit is a regional band (`band1` … `band9`). **H** for the
  scheme (de.wikipedia list); the area wording is ours and approximate (**M**):
  1 east (Berlin, Brandenburg, Mecklenburg, Saxony-Anhalt, Saxony); 2 north (Hamburg,
  Bremen, Schleswig-Holstein, the coasts); 3 Lower Saxony and its edges; 4 the Ruhr, the hills
  south of it and north Hesse; 5 the Lower Rhine (Düsseldorf, Köln); 6 the south-west
  (Rhine–Main, the Palatinate, the Eifel, Saarland); 7 Thuringia, Franconia, west Saxony;
  8 Baden-Württemberg; 9 the far south (southern Bavaria, the Swiss border: A 98).
- Rings keep their band but have no direction (`ring`): A 10 (Berlin), A 99 (München). **H**
- Exceptions to the odd–even rule (`exception`): A 14 and A 15 are named as exceptions by
  the de.wikipedia list (**H**); A 25, A 36, A 62 and A 72 break it on the map (**M**, our
  reading of the Natural Earth courses and the route descriptions).

**Between** lists the parallel roads either side in the pattern (0–2), our own reading of
the network: for class 1 the next trunk routes in number order (A 7 lies between A 5 and
A 9); for class 2 the nearest parallel routes, preferring class 1 where one is near. Empty
where no parallel helps (rings, short spurs, A 98 along the border); the hint then uses the
rules and the crossings. **M** throughout.
**Main crossings** are the other kept roads met at motorway junctions (Kreuz, Dreieck), in
order along the road, read from the junction lists of each route article (the `KN` rows).
**H** for the set, **M** for the order where an article lists both directions.

### Signs (Street View)

- Autobahn: white number on a blue six-sided shield (`A 7`, StVO sign 405); the same shield
  leads the blue direction and advance-direction signs at junctions and on Autobahn
  entrance signs. Distance boards and reassurance signs rarely repeat it, so on coverage the
  number is read at junctions and on-ramps, not along open stretches. **M**
- Not to confuse: Bundesstraße numbers are black on a yellow rectangle (`B 27`); European
  routes white on green (`E 45`), often next to the A shield. Two-digit A and B numbers
  overlap (A 27 and B 27 are unrelated). **M**
- Coverage: Autobahns are fully covered by the 2022–2023 re-drive (§1); the official
  2008–2009 coverage also drove most of them. **M**

### Towns and termini

Towns are our own selection (3–12 per road, the termini first and last, in order from
`from` to `to`), chosen from the route description of the de.wikipedia list and the exit
lists of the route articles. Coordinates are GeoNames DE (CC BY 4.0, already credited),
rounded to 3 decimals, matched by name **and** state to avoid homonyms (Halle (Saale) vs
Halle (Westf.), Neunkirchen (Saar), Wörth am Rhein, Eschenlohe in Garmisch-Partenkirchen
district). Where a road ends at a junction or a border, the terminus is the nearest town on
it (Werder (Havel) for the A 2, Michendorf for the A 9, Penkun for the A 11, Langsur for the
A 64). Termini can therefore lie up to ~20 km from the course end; validation allows 25 km.
The A 10 and A 99 rings are listed clockwise from their first junction.

### Sources and confidence

Two sources per road:

1. **list + article**: de.wikipedia ["Liste der Bundesautobahnen in Deutschland"][de-ab-list]
   (route description, length in km, status) and the route article for each number (infobox
   termini, junctions, exits), read 2026-11-28. Facts only; no text, table or selection is
   copied (`docs/licensing.md`). en.wikipedia's list was consulted but is a translation of
   the German one, so it is not counted as a second source.
2. **NE**: Natural Earth 1:10m roads (public domain), the line with the same number
   (`routeraw` token `A7`), via the cross-check of `npm run build:roads` (below).

Confidence per road: **H** every listed town is within 10 km of the Natural Earth line with
the same number; **M** the towns are in the list's route description or within 15 km of an
exit in the article, but Natural Earth lacks or only partly covers the road (A 26, A 36,
A 37, A 42, A 49, A 64, A 67, A 94, A 98 and A 99 have no NE line; A 3 east of Nürnberg,
A 4 east of Kirchheim, the north of the A 9 and A 14 and parts of others are missing);
**L** a town comes from neither (named in brackets). Lengths are the list's figures (**H**).

Class 1:

| Road | From → to | km | Towns between (in order) | Rules | Between | Main crossings, in order | Sources | Conf. |
|---|---|---|---|---|---|---|---|---|
| A 1 | Heiligenhafen → Saarbrücken | 748 | Lübeck, Hamburg, Bremen, Osnabrück, Münster, Dortmund, Wuppertal, Köln, Blankenheim, Trier | odd, trunk | A 3 | A 20, A 21, A 24, A 25, A 7, A 39, A 27, A 28, A 29, A 30, A 43, A 2, A 44, A 45, A 46, A 3, A 59, A 57, A 4, A 61, A 48, A 60, A 62, A 8 | list + article + NE | M |
| A 2 | Oberhausen → Werder (Havel) | 473 | Gelsenkirchen, Dortmund, Hamm, Bielefeld, Hannover, Braunschweig, Magdeburg, Brandenburg an der Havel | even, trunk | A 4 | A 3, A 31, A 43, A 45, A 1, A 33, A 30, A 37, A 7, A 39, A 14, A 10 | list + article + NE | H |
| A 3 | Emmerich am Rhein → Passau | 769 | Oberhausen, Duisburg, Düsseldorf, Köln, Limburg an der Lahn, Wiesbaden, Frankfurt am Main, Aschaffenburg, Würzburg, Nürnberg, Regensburg, Deggendorf | odd, trunk | A 1, A 5 | A 2, A 42, A 40, A 52, A 44, A 46, A 1, A 4, A 59, A 48, A 66, A 67, A 5, A 45, A 81, A 7, A 73, A 9, A 6, A 93, A 92, A 94 | list + article + NE | M |
| A 4 | Aachen → Görlitz | 583 | Köln, Olpe, Kreuztal, Eisenach, Erfurt, Jena, Gera, Chemnitz, Dresden, Bautzen | even, trunk | A 2, A 6 | A 44, A 61, A 1, A 3, A 59, A 45, A 7, A 71, A 9, A 72, A 14, A 17, A 13 | list + article + NE | M |
| A 5 | Alsfeld → Weil am Rhein | 440 | Gießen, Frankfurt am Main, Darmstadt, Heidelberg, Karlsruhe, Offenburg, Freiburg im Breisgau | odd, trunk | A 3, A 7 | A 7, A 49, A 45, A 66, A 3, A 67, A 6, A 8, A 98 | list + article + NE | M |
| A 6 | Saarbrücken → Waidhaus | 484 | Kaiserslautern, Mannheim, Heilbronn, Crailsheim, Nürnberg, Amberg | even, trunk | A 4, A 8 | A 8, A 62, A 63, A 61, A 67, A 5, A 81, A 7, A 73, A 9, A 3, A 93 | list + article + NE | M |
| A 7 | Flensburg → Füssen | 962 | Neumünster, Hamburg, Hannover, Göttingen, Kassel, Fulda, Würzburg, Ulm, Kempten (Allgäu) | odd, trunk | A 5, A 9 | A 23, A 26, A 1, A 39, A 27, A 37, A 2, A 38, A 49, A 44, A 4, A 5, A 66, A 70, A 3, A 6, A 8, A 96 | list + article + NE | H |
| A 8 | Perl → Bad Reichenhall | 505 | Saarlouis, Neunkirchen (Saar), Pirmasens, Karlsruhe, Pforzheim, Stuttgart, Ulm, Augsburg, München, Rosenheim | even, trunk | A 6 | A 1, A 6, A 5, A 81, A 7, A 99, A 93 | list + article + NE | M |
| A 9 | Michendorf → München | 530 | Dessau-Roßlau, Leipzig, Hof (Saale), Bayreuth, Nürnberg, Ingolstadt | odd, trunk | A 7 | A 10, A 14, A 38, A 4, A 72, A 70, A 3, A 6, A 73, A 93, A 92, A 99 | list + article + NE | M |

Class 2:

| Road | From → to | km | Towns between (in order) | Rules | Between | Main crossings, in order | Sources | Conf. |
|---|---|---|---|---|---|---|---|---|
| A 10 | Bernau bei Berlin → Oranienburg | 196 | Königs Wusterhausen, Michendorf, Werder (Havel) | band1, ring | — | A 11, A 12, A 13, A 9, A 2, A 24 | list + article + NE | H |
| A 11 | Penkun → Bernau bei Berlin | 110 | Eberswalde | band1, odd | A 24, A 12 | A 20, A 10 | list + article + NE | H |
| A 12 | Fürstenwalde/Spree → Frankfurt (Oder) | 58 | — | band1, even | A 11, A 13 | A 10 | list + article + NE | H |
| A 13 | Schönefeld → Dresden | 151 | Königs Wusterhausen, Lübbenau/Spreewald, Schwarzheide | band1, odd | A 12, A 9 | A 10, A 15, A 4 | list + article + NE | H |
| A 14 | Wismar → Nossen | 341 | Schwerin, Ludwigslust, Wolmirstedt, Magdeburg, Halle (Saale), Leipzig, Grimma | band1, exception | A 39, A 9 | A 20, A 24, A 2, A 36, A 9, A 38, A 4 | list + article + NE | M |
| A 15 | Lübbenau/Spreewald → Forst (Lausitz) | 64 | Cottbus | band1, exception | A 12, A 4 | A 13 | list + article + NE | H |
| A 17 | Dresden → Bad Gottleuba-Berggießhübel | 45 | Pirna | band1, odd | — | A 4 | list + article + NE | H |
| A 19 | Rostock → Wittstock/Dosse | 123 | Güstrow | band1, odd | A 14, A 11 | A 20, A 24 | list + article + NE | H |
| A 20 | Bad Segeberg → Prenzlau | 345 | Lübeck, Wismar, Rostock, Greifswald, Neubrandenburg | band2, even | A 24 | A 29, A 21, A 1, A 14, A 19, A 11 | list + article + NE | M |
| A 21 | Kiel → Bargteheide | 64 | Bad Segeberg | band2, odd | A 7, A 1 | A 20, A 1 | list + article + NE | H |
| A 23 | Heide (Holstein) → Hamburg | 96 | Itzehoe, Elmshorn, Pinneberg | band2, odd | A 7 | A 7 | list + article + NE | M |
| A 24 | Hamburg → Kremmen | 237 | Hagenow, Wittstock/Dosse, Neuruppin | band2, even | A 20, A 2 | A 1, A 14, A 19, A 10 | list + article + NE | M |
| A 25 | Hamburg → Geesthacht | 18 | — | band2, exception | — | A 1 | list + article + NE | H |
| A 26 | Stade → Neu Wulmstorf | 25 | Buxtehude | band2, even | — | A 7 | list + article | M |
| A 27 | Cuxhaven → Walsrode | 162 | Bremerhaven, Bremen, Verden (Aller) | band2, odd | A 29, A 7 | A 1, A 7 | list + article + NE | H |
| A 28 | Leer (Ostfriesland) → Stuhr | 97 | Oldenburg, Delmenhorst | band2, even | A 30 | A 31, A 20, A 29, A 1 | list + article + NE | H |
| A 29 | Wilhelmshaven → Ahlhorn | 95 | Varel, Oldenburg | band2, odd | A 31, A 27 | A 20, A 28, A 1 | list + article + NE | H |
| A 30 | Bad Bentheim → Bad Oeynhausen | 136 | Rheine, Osnabrück, Melle | band3, even | A 28, A 2 | A 31, A 1, A 33, A 2 | list + article + NE | H |
| A 31 | Emden → Bottrop | 241 | Leer (Ostfriesland), Meppen, Lingen (Ems), Gronau (Westf.), Borken (Westf.) | band3, odd | A 1 | A 28, A 30, A 2 | list + article + NE | M |
| A 33 | Osnabrück → Bad Wünnenberg | 104 | Halle (Westf.), Bielefeld, Paderborn | band3, odd | — | A 30, A 2, A 44 | list + article + NE | H |
| A 36 | Braunschweig → Bernburg (Saale) | 120 | Wolfenbüttel, Wernigerode, Quedlinburg, Aschersleben | band3, exception | A 2, A 38 | A 39, A 14 | list + article | M |
| A 37 | Burgdorf → Laatzen | 14 | Hannover | band3, odd | — | A 7, A 2 | list + article | L (Laatzen) |
| A 38 | Göttingen → Leipzig | 219 | Leinefelde-Worbis, Nordhausen, Sangerhausen, Merseburg | band3, even | A 2, A 4 | A 7, A 71, A 9, A 72, A 14 | list + article + NE | M |
| A 39 | Maschen → Salzgitter | 99 | Lüneburg, Wolfsburg, Braunschweig | band3, odd | A 7, A 14 | A 7, A 1, A 2, A 36 | list + article + NE | M |
| A 40 | Straelen → Dortmund | 95 | Moers, Duisburg, Mülheim an der Ruhr, Essen, Bochum | band4, even | A 42, A 44 | A 57, A 59, A 3, A 52, A 43, A 45, A 1, A 44 | list + article + NE | M |
| A 42 | Kamp-Lintfort → Dortmund | 58 | Duisburg, Oberhausen, Bottrop, Gelsenkirchen, Herne | band4, even | A 2, A 40 | A 57, A 59, A 3, A 43, A 45 | list + article | M |
| A 43 | Münster → Wuppertal | 93 | Dülmen, Marl, Recklinghausen, Herne, Bochum | band4, odd | A 31, A 1 | A 1, A 52, A 2, A 42, A 40, A 46 | list + article + NE | M |
| A 44 | Aachen → Sontra | 307 | Mönchengladbach, Düsseldorf, Ratingen, Unna, Soest, Warburg, Kassel | band4, even | A 2, A 4 | A 4, A 61, A 46, A 52, A 57, A 3, A 1, A 33, A 49, A 7 | list + article + NE | M |
| A 45 | Dortmund → Hanau | 257 | Hagen, Lüdenscheid, Siegen, Wetzlar | band4, odd | A 3, A 7 | A 2, A 42, A 40, A 1, A 46, A 4, A 5, A 66, A 3 | list + article + NE | H |
| A 46 | Heinsberg → Olsberg | 149 | Erkelenz, Neuss, Düsseldorf, Wuppertal, Hagen, Hemer, Arnsberg, Meschede | band4, even | A 44, A 4 | A 61, A 44, A 57, A 59, A 3, A 1, A 43, A 45 | list + article + NE | M |
| A 48 | Daun → Montabaur | 78 | Mayen, Koblenz | band4, even | A 4, A 60 | A 1, A 61, A 3 | list + article + NE | H |
| A 49 | Kassel → Schwalmstadt | 87 | Baunatal | band4, odd | A 45, A 7 | A 7, A 44, A 5 | list + article | M |
| A 52 | Niederkrüchten → Marl | 97 | Mönchengladbach, Neuss, Düsseldorf, Essen, Gelsenkirchen | band5, even | — | A 61, A 44, A 57, A 3, A 40, A 43 | list + article + NE | H |
| A 57 | Goch → Köln | 119 | Moers, Krefeld, Neuss | band5, odd | A 61, A 3 | A 42, A 40, A 44, A 52, A 46, A 1 | list + article + NE | M |
| A 59 | Dinslaken → Bonn | 69 | Duisburg, Düsseldorf, Leverkusen, Köln, Troisdorf | band5, odd | A 57, A 3 | A 42, A 40, A 46, A 1, A 3, A 4 | list + article + NE | M |
| A 60 | Prüm → Rüsselsheim am Main | 113 | Bitburg, Wittlich, Bingen am Rhein, Mainz | band6, even | A 48, A 6 | A 1, A 61, A 63, A 67 | list + article + NE | M |
| A 61 | Nettetal → Hockenheim | 313 | Mönchengladbach, Erftstadt, Bad Neuenahr-Ahrweiler, Koblenz, Bingen am Rhein, Alzey, Worms, Ludwigshafen am Rhein, Speyer | band6, odd | A 1, A 3 | A 52, A 46, A 44, A 4, A 1, A 48, A 60, A 63, A 6, A 65 | list + article + NE | M |
| A 62 | Nonnweiler → Pirmasens | 79 | Kusel, Landstuhl | band6, exception | — | A 1, A 6 | list + article + NE | M |
| A 63 | Mainz → Kaiserslautern | 73 | Alzey, Kirchheimbolanden | band6, odd | — | A 60, A 61, A 6 | list + article + NE | H |
| A 64 | Langsur → Trier | 18 | — | band6, even | — | — | list + article | M |
| A 65 | Ludwigshafen am Rhein → Wörth am Rhein | 59 | Neustadt an der Weinstraße, Landau in der Pfalz | band6, odd | A 62, A 61 | A 61 | list + article + NE | H |
| A 66 | Wiesbaden → Fulda | 126 | Frankfurt am Main, Hanau, Gelnhausen, Schlüchtern | band6, even | A 4, A 3 | A 3, A 5, A 45, A 7 | list + article + NE | M |
| A 67 | Rüsselsheim am Main → Viernheim | 58 | Darmstadt | band6, odd | A 61, A 5 | A 3, A 60, A 5, A 6 | list + article | M |
| A 70 | Schweinfurt → Bayreuth | 120 | Bamberg | band7, even | A 4, A 3 | A 7, A 71, A 73, A 9 | list + article + NE | H |
| A 71 | Sangerhausen → Schweinfurt | 220 | Sömmerda, Erfurt, Arnstadt, Ilmenau, Suhl, Meiningen | band7, odd | A 7, A 9 | A 38, A 4, A 73, A 70 | list + article + NE | M |
| A 72 | Hof (Saale) → Leipzig | 169 | Plauen, Zwickau, Chemnitz | band7, exception | A 9 | A 9, A 93, A 4, A 38 | list + article + NE | M |
| A 73 | Suhl → Feucht | 167 | Coburg, Bamberg, Forchheim, Erlangen, Fürth, Nürnberg | band7, odd | A 71, A 9 | A 71, A 70, A 3, A 6, A 9 | list + article + NE | H |
| A 81 | Würzburg → Gottmadingen | 276 | Heilbronn, Ludwigsburg, Stuttgart, Sindelfingen, Rottweil, Villingen-Schwenningen, Singen (Hohentwiel) | band8, odd | A 5, A 7 | A 3, A 6, A 8, A 98 | list + article + NE | M |
| A 92 | Oberschleißheim → Deggendorf | 134 | Freising, Landshut, Dingolfing | band9, even | A 9, A 94 | A 99, A 9, A 3 | list + article + NE | H |
| A 93 | Hof (Saale) → Kiefersfelden | 268 | Marktredwitz, Weiden in der Oberpfalz, Schwandorf, Regensburg, Wolnzach, Rosenheim | band9, odd | A 9 | A 72, A 6, A 3, A 9, A 8 | list + article + NE | M |
| A 94 | München → Kirchham | 109 | Mühldorf am Inn, Altötting, Burghausen, Malching | band9, even | A 92, A 8 | A 99, A 3 | list + article | L (Mühldorf am Inn, Altötting) |
| A 95 | München → Eschenlohe | 69 | Wolfratshausen, Penzberg, Murnau am Staffelsee | band9, odd | A 96, A 8 | — | list + article + NE | M |
| A 96 | Lindau (Bodensee) → München | 173 | Wangen im Allgäu, Memmingen, Mindelheim, Landsberg am Lech | band9, even | A 8 | A 7, A 99 | list + article + NE | M |
| A 98 | Weil am Rhein → Stockach | 47 | Rheinfelden (Baden), Murg, Waldshut-Tiengen, Singen (Hohentwiel) | band9, even | — | A 5, A 81 | list + article | M |
| A 99 | Germering → Hohenbrunn | 58 | Karlsfeld, Unterschleißheim, Garching bei München, Aschheim, Haar | band9, ring | — | A 96, A 8, A 92, A 9, A 94 | list + article | M |

The two **L** entries (Laatzen at the A 37's Messe end, Mühldorf am Inn and Altötting on the
A 94) are from general knowledge and should be checked against the OSM course once the
extract runs.

### Other numbers (`altRefs`)

A road keeps one primary `ref`: the A number, drilled and shown on the shield. Its other
numbers are in `altRefs` and are never drilled. They show in the info card and the hint, and
choosing one counts as right (spec §4 "Several numbers").

- **European routes** (`european`, network `E`): white on green, often next to the A shield
  on direction signs, but rarely on their own (Signs, above). Recorded for class 1 and the
  A 10 and A 11, the routes whose de.wikipedia articles list E-routes. That is the infobox
  `ENUMMER` fields, plus the "Abschnitte als Europastraße" section where there is one.
  - **Stretches:** from that section or from the junction lists of the E-route articles
    ("Europastraße 40", "Europastraße 52" …, read 2026-11-28). Each stretch is bounded by
    the nearest of our towns.
  - **`note`:** the exact junctions. It is a maintainer note, neither shown nor translated.
  - **Left out:** stretches shorter than one town span (≈ 30 km or less): the A 1's E 42 at
    Wittlich, the A 3's E 43 and E 44, the A 4's E 314 and E 55, the A 7's E 40, the A 9's
    E 48, and the A 10's E 26 and E 51. Also left out: the E-routes on two-digit Autobahns
    (A 14, A 24, A 44, A 45, A 61, A 67, A 70, A 81 …), whose route articles do not list them.
    Both go in when the OSM `int_ref` suggestions (build:roads report) give a second source.
- **Shared stretches** (`concurrent`): two A numbers on one carriageway, recorded on both
  roads. Each is from the route article's text:
  - A 1 / A 61, Dreieck Erfttal – Kreuz Bliesheim, at Erftstadt (A 1 article).
  - A 3 / A 4, Kreuz Köln-Ost – Dreieck Köln-Heumar (A 3 and A 4 articles).
  - A 7 / A 44, Kassel-Ost – Dreieck Kassel-Süd (A 7 article).

  The A 8 / A 81 stretch at Leonberg is not stated in either article. It stays out until
  the OSM report confirms it.
- **Former numbers** (`former`): none recorded for Germany. The 1975 renumbering replaced
  numbers that are no longer signed (the A 7 was signed as E 3 before), so they do not help
  on Street View.

| Road | Other numbers (stretch between our towns) | Source | Conf. |
|---|---|---|---|
| A 1 | E 47 Heiligenhafen–Lübeck; E 22 Lübeck–Bremen; E 37 Bremen–Köln; E 31 and E 29 Köln–Blankenheim; E 44 Blankenheim–Trier (in sections); E 422 Trier–Saarbrücken; A 61 at Köln–Blankenheim | A 1 article (section + infobox), E 29 / E 31 articles | H (E 44 M) |
| A 2 | E 34 Oberhausen–Bielefeld; E 30 Bielefeld–Werder | A 2 article, E 30 article | H |
| A 3 | E 35 Emmerich–Wiesbaden; E 34 Oberhausen–Duisburg; E 42 Frankfurt–Aschaffenburg; E 41 Aschaffenburg–Würzburg; E 45 Würzburg–Nürnberg; E 56 Nürnberg–Passau; A 4 at Köln | A 3 article (section), E 41 / E 56 articles | H |
| A 4 | E 40 Aachen–Olpe and Eisenach–Görlitz; A 3 at Köln | E 40 article (German course list), A 4 article | H |
| A 5 | E 40 Alsfeld–Gießen; E 451 Gießen–Darmstadt; E 35 Darmstadt–Weil am Rhein; E 52 Karlsruhe–Offenburg; E 54 Freiburg–Weil am Rhein | A 5 article (order N→S), E 40 / E 451 / E 52 / E 54 articles | M |
| A 6 | E 50, the whole route | A 6 article ("auf ganzer Länge"), E 50 article | H |
| A 7 | E 45 Flensburg–Würzburg; E 43 Würzburg–Ulm; E 532 Ulm–Füssen; A 44 at Kassel | A 7 article (section), E 45 article | H |
| A 8 | E 52 Karlsruhe–Bad Reichenhall (round München on the A 99); E 29 Perl–Saarlouis; E 45 München–Rosenheim; E 60 Rosenheim–Bad Reichenhall | A 8 article (section), E 52 article | H |
| A 9 | E 51 Michendorf–Nürnberg; E 49 Leipzig–Hof (to Schleiz); E 45 Nürnberg–München | E 51 / E 49 / E 45 articles (junction lists) | M |
| A 10 | E 30 southern ring (Werder–Königs Wusterhausen); E 55 northern and eastern ring | A 10 infobox, E 30 / E 55 articles | M |
| A 11 | E 28, the whole route | A 11 article, E 28 article | H |
| A 44 | A 7 at Kassel | A 7 article | H |
| A 61 | A 1 at Erftstadt | A 1 article | H |

### Courses: OpenStreetMap extract (ODbL)

**Not yet extracted.** The courses come from OSM route relations
(`relation[type=route][route=road][network=BAB]` in area `ISO3166-1=DE`, `out geom`),
assembled, clipped and simplified by `npm run build:roads -- germany` into
`roads.osm.json` (docs/specs/roads.md §4). On 2026-11-28 overpass-api.de, the
overpass.kumi.systems mirror, download.geofabrik.de and openstreetmap.org could not be
reached from the environment this was compiled in, so the file does not exist yet, and no
geometry was drawn by hand instead. Germany therefore does **not** add the OSM credit yet
and does not offer the Roads set: `npm run validate:data` requires the credit in every
language as soon as a `roads.osm.json` exists.

Extract record (to complete when the script runs; the script prints these values):

| Field | Value |
|---|---|
| Source | Overpass API (overpass-api.de), fallback Geofabrik `germany-latest.osm.pbf` + `osmium tags-filter` |
| Date | pending |
| Query | `[out:json][timeout:300];area["ISO3166-1"="DE"][admin_level=2]->.a;relation[type=route][route=road][network="BAB"](area.a);out geom;` |
| Tags | `type=route`, `route=road`, `network=BAB`; matched to roads.json by `ref` (spaces normalised; a ";" list belongs to each road it names). `ref` and `int_ref` numbers not in roads.json are listed as suggested altRefs, never written |
| Suggested altRefs | pending (review each against a second source before adding it to roads.json) |
| Members | role `""` or `forward` (one carriageway), ways merged and oriented from → to |
| Clip | Natural Earth 1:10m admin-0 outline of Germany, 5 km buffer |
| Simplification | Douglas–Peucker in projected km, 1 km for classes 1–2; parts < 2 km dropped; 3 decimals |
| Size | pending (budget ≤ 15 KB gzip) |
| Licence | ODbL 1.0; "Roads © OpenStreetMap contributors, ODbL", <https://www.openstreetmap.org/copyright> |

### Natural Earth cross-check (build:roads report, 2026-11-28)

From `npm run build:roads -- germany` without OSM: Natural Earth length within Germany
and the listed towns more than 10 km from the NE line with the same number. Most distant
towns are where NE's line stops short (its length is well under the sourced length), not
errors in the list.

| Road | Class | Sourced km | OSM km | NE km | NE parts | Towns > 10 km from NE line | OSM gaps > 5 km |
|---|---|---|---|---|---|---|---|
| A 1 | 1 | 748 | n/a | 689 | 10 | Blankenheim 20 | n/a |
| A 2 | 1 | 473 | n/a | 519 | 8 |  | n/a |
| A 3 | 1 | 769 | n/a | 552 | 6 | Regensburg 74, Deggendorf 135, Passau 179 | n/a |
| A 4 | 1 | 583 | n/a | 251 | 7 | Aachen 23, Kreuztal 10, Eisenach 172, Erfurt 191, Jena 153, Gera 120, Chemnitz 67, Dresden 10 | n/a |
| A 5 | 1 | 440 | n/a | 467 | 6 | Weil am Rhein 48 | n/a |
| A 6 | 1 | 484 | n/a | 431 | 3 | Waidhaus 28 | n/a |
| A 7 | 1 | 962 | n/a | 983 | 11 |  | n/a |
| A 8 | 1 | 505 | n/a | 514 | 5 | München 11 | n/a |
| A 9 | 1 | 530 | n/a | 216 | 2 | Leipzig 12, Hof (Saale) 115, Bayreuth 68, München 49 | n/a |
| A 10 | 2 | 196 | n/a | 195 | 3 |  | n/a |
| A 11 | 2 | 110 | n/a | 112 | 2 |  | n/a |
| A 12 | 2 | 58 | n/a | 72 | 2 |  | n/a |
| A 13 | 2 | 151 | n/a | 181 | 2 |  | n/a |
| A 14 | 2 | 341 | n/a | 198 | 2 | Wismar 191, Schwerin 162, Ludwigslust 128 | n/a |
| A 15 | 2 | 64 | n/a | 63 | 1 |  | n/a |
| A 17 | 2 | 45 | n/a | 32 | 1 |  | n/a |
| A 19 | 2 | 123 | n/a | 123 | 1 |  | n/a |
| A 20 | 2 | 345 | n/a | 375 | 1 | Neubrandenburg 13 | n/a |
| A 21 | 2 | 64 | n/a | 71 | 1 |  | n/a |
| A 23 | 2 | 96 | n/a | 92 | 1 | Hamburg 10 | n/a |
| A 24 | 2 | 237 | n/a | 181 | 1 | Neuruppin 34, Kremmen 58 | n/a |
| A 25 | 2 | 18 | n/a | 20 | 1 |  | n/a |
| A 26 | 2 | 25 | n/a | none |  | (no NE line) | n/a |
| A 27 | 2 | 162 | n/a | 161 | 1 |  | n/a |
| A 28 | 2 | 97 | n/a | 127 | 2 |  | n/a |
| A 29 | 2 | 95 | n/a | 92 | 2 |  | n/a |
| A 30 | 2 | 136 | n/a | 134 | 1 |  | n/a |
| A 31 | 2 | 241 | n/a | 187 | 1 | Emden 25, Leer (Ostfriesland) 15 | n/a |
| A 33 | 2 | 104 | n/a | 95 | 1 |  | n/a |
| A 36 | 2 | 120 | n/a | none |  | (no NE line) | n/a |
| A 37 | 2 | 14 | n/a | none |  | (no NE line) | n/a |
| A 38 | 2 | 219 | n/a | 212 | 1 | Göttingen 11 | n/a |
| A 39 | 2 | 99 | n/a | 64 | 1 | Maschen 115, Lüneburg 91 | n/a |
| A 40 | 2 | 95 | n/a | 52 | 2 | Straelen 10, Essen 12 | n/a |
| A 42 | 2 | 58 | n/a | none |  | (no NE line) | n/a |
| A 43 | 2 | 93 | n/a | 67 | 2 | Marl 13, Recklinghausen 16, Herne 18, Bochum 13 | n/a |
| A 44 | 2 | 307 | n/a | 168 | 3 | Aachen 13, Mönchengladbach 20, Sontra 37 | n/a |
| A 45 | 2 | 257 | n/a | 231 | 3 |  | n/a |
| A 46 | 2 | 149 | n/a | 52 | 2 | Heinsberg 59, Erkelenz 44, Neuss 17, Düsseldorf 12, Hagen 21, Hemer 20, Olsberg 10 | n/a |
| A 48 | 2 | 78 | n/a | 68 | 1 |  | n/a |
| A 49 | 2 | 87 | n/a | none |  | (no NE line) | n/a |
| A 52 | 2 | 97 | n/a | 128 | 4 |  | n/a |
| A 57 | 2 | 119 | n/a | 58 | 1 | Krefeld 13, Neuss 28, Köln 61 | n/a |
| A 59 | 2 | 69 | n/a | 20 | 1 | Dinslaken 74, Duisburg 59, Düsseldorf 38, Leverkusen 12 | n/a |
| A 60 | 2 | 113 | n/a | 60 | 1 | Bingen am Rhein 70, Mainz 97, Rüsselsheim am Main 107 | n/a |
| A 61 | 2 | 313 | n/a | 319 | 5 | Nettetal 24, Mönchengladbach 14, Erftstadt 19, Ludwigshafen am Rhein 12, Speyer 27, Hockenheim 30 | n/a |
| A 62 | 2 | 79 | n/a | 45 | 1 | Pirmasens 26 | n/a |
| A 63 | 2 | 73 | n/a | 83 | 1 |  | n/a |
| A 64 | 2 | 18 | n/a | none |  | (no NE line) | n/a |
| A 65 | 2 | 59 | n/a | 62 | 1 |  | n/a |
| A 66 | 2 | 126 | n/a | 107 | 1 | Wiesbaden 11 | n/a |
| A 67 | 2 | 58 | n/a | none |  | (no NE line) | n/a |
| A 70 | 2 | 120 | n/a | 158 | 3 |  | n/a |
| A 71 | 2 | 220 | n/a | 211 | 1 | Sangerhausen 17 | n/a |
| A 72 | 2 | 169 | n/a | 100 | 1 | Leipzig 67 | n/a |
| A 73 | 2 | 167 | n/a | 261 | 5 |  | n/a |
| A 81 | 2 | 276 | n/a | 135 | 2 | Würzburg 140, Heilbronn 53, Ludwigsburg 27, Stuttgart 17 | n/a |
| A 92 | 2 | 134 | n/a | 125 | 1 |  | n/a |
| A 93 | 2 | 268 | n/a | 222 | 2 | Rosenheim 87, Kiefersfelden 114 | n/a |
| A 94 | 2 | 109 | n/a | none |  | (no NE line) | n/a |
| A 95 | 2 | 69 | n/a | 42 | 1 | Murnau am Staffelsee 17, Eschenlohe 26 | n/a |
| A 96 | 2 | 173 | n/a | 56 | 1 | Mindelheim 23, Landsberg am Lech 50, München 99 | n/a |
| A 98 | 2 | 47 | n/a | none |  | (no NE line) | n/a |
| A 99 | 2 | 58 | n/a | none |  | (no NE line) | n/a |

[de-ab-list]: https://de.wikipedia.org/wiki/Liste_der_Bundesautobahnen_in_Deutschland

## Sources and licences

Audit: 2026-11-28. `2945554` introduced Germany (owner with the Copilot coding agent);
`97a7fdd` added the -heim counts and clipped Lahn course and checked the phone hint;
`b005e55` corrected how selected river lengths are presented. The sources below are
from those commits and §§3–6. Natural Earth and GeoNames's upstream terms were checked
on the audit date.

| Data file / asset | Source | Licence | How it was used | Credit required (y/n) | Status |
|---|---|---|---|---|---|
| `outline.json` | [Natural Earth vector data][de-ne], 1:10m admin-1 and national outline; `scripts/build-outline.ts` | [Public domain][de-ne-terms] | Derived, projected and simplified state geometry | n — credited in both footers | OK |
| `riverCourses.json` | Natural Earth 1:10m rivers/lake centerlines and Europe rivers; `scripts/build-outline.ts` | Public domain | Derived base courses; Lahn clipped at Cölbe | n — credited in both footers | OK |
| `regions.json` | Trainer-authored by owner and coding agent (§4), using the 16 Länder and former GDR as factual references | Trainer work (MIT) | Original four-group study scheme, anchor cities and colours | n | OK |
| `departments.json` | Natural Earth state IDs and [GeoNames cities1000 mirror][de-cities] for capital coordinates (§6) | Public domain; [CC BY 4.0][geonames-terms] | Facts: codes, names, capitals and coordinates | y — GeoNames in both footers | OK |
| `cities.json` | GeoNames cities1000 mirror, checked against Natural Earth (§6) | CC BY 4.0; public domain for polygon checks | Facts: coordinates and names; trainer selection and tiers | y — GeoNames in both footers | OK |
| `placeNames.json` | [GeoNames DE postal-code mirror][de-postal] for original suffix counts (§5); GeoNames cities for example coordinates; glosses from compiler's knowledge | CC BY 4.0; trainer explanations (MIT) | Derived suffix distributions and selected examples; not a copied guide list | y — GeoNames in both footers | OK |
| `rivers.json` (metadata and towns) | Trainer compiler's length estimates (§6), GeoNames town coordinates checked against the Natural Earth courses | Trainer compilation (MIT); CC BY 4.0 for GeoNames | Facts: lengths, outlets and exercise towns; estimates remain approximate | y — GeoNames in both footers | OK |
| `rivers.json` (nonempty `course` fields) | Trainer-authored extensions of Natural Earth geometry: Elbe Hamburg–Cuxhaven, Weser below Brake–Bremerhaven and Ems to Emden (§6) | Public-domain base; exact inputs for added points not recorded | Derived base with hand-drawn tidal waypoints; GeoNames towns checked against the course, not documented as the source of every point | n for base; unknown for added-point source | needs owner decision |
| `roads.json` | Trainer selection (§7): de.wikipedia list and route articles for facts (termini, lengths, junctions), Natural Earth 1:10m roads for the cross-check, GeoNames DE for town coordinates | Facts; public domain; [CC BY 4.0][geonames-terms] | Our own data: ids, classes, rules in our words, neighbours, towns; no OSM data and no copied text | y — GeoNames in both footers | OK |
| `roads.osm.json` | OpenStreetMap via Overpass, `npm run build:roads -- germany` (§7) | ODbL 1.0 | Not generated yet (OSM unreachable on 2026-11-28) | y — OSM credit in every language once the file exists | pending |
| `copy.en.ts`, `copy.be.ts` | Trainer wording from §§2–6; [libphonenumber `de/49.txt`][de-phone] and GeoNames postal matching for the phone hint; [Belarusian spelling sources](../../i18n/README.md) | Trainer work (MIT); libphonenumber Apache-2.0, used as reference, not bundled; CC BY 4.0 data reference | Workflow tips and translations, not guide prose. Spot checks against [Plonk It Germany](https://www.plonkit.net/germany) and [Wikipedia's Frankfurt entry](https://en.wikipedia.org/wiki/Frankfurt) found factual overlap, not close copying | n for authored copy | OK |

Germany has no phone dataset, fine prefixes or plate study set. The phone hint is a
factual summary; the libphonenumber table and postal-code join are not shipped.

[de-ne]: https://github.com/nvkelso/natural-earth-vector
[de-ne-terms]: https://www.naturalearthdata.com/about/terms-of-use/
[de-cities]: https://github.com/lutangar/cities.json
[de-postal]: https://github.com/zauberware/postal-codes-json-xml-csv
[de-phone]: https://github.com/google/libphonenumber/blob/master/resources/geocoding/de/49.txt
[geonames-terms]: https://download.geonames.org/export/dump/readme.txt

## 8. Backlog: signals the engine cannot express

- Area-code zones and plate codes need sub-state units (Kreise).
- Landscape, architecture, bollards and Sorbian/Danish bilingual signs.
- Upper Spree course (Natural Earth's is wrong above Cottbus).
