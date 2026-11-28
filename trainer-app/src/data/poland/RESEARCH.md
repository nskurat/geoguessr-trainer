# Poland — country brief and data notes

Compiled 2026-11-28 for the trainer's Poland data. Confidence: **H** = counted or read from a
primary dataset or checked against a published list; **M** = well-established general
knowledge or a secondary source only; **L** = community GeoGuessr meta from memory,
unverified.

Network note: what was reachable while compiling: raw.githubusercontent.com (Natural Earth
mirror, GeoNames `cities1000` mirror) and en.wikipedia.org (raw wikitext). Not reachable:
geonames.org, gov.pl, isap.sejm.gov.pl (the official plate and numbering decrees), skarnik.by,
slounik.org. Plonkit and geohints were not used as sources (policy: `docs/licensing.md`). Where a
primary legal source is named below but could not be opened, the claim rests on Wikipedia as a
secondary reference and is marked **M**.

## 1. Coverage overview

- Street View: Poland has full official Google coverage, mostly recent (Gen 3/4), including
  small roads. Almost every place is reachable, so no voivodeship needs down-weighting. **M**
- Players usually recognise Poland at once (yellow-black place-name signs, white plates with a
  blue EU strip, Polish-language signs), so the points are in placing yourself *inside* the
  country. **M**

## 2. Regional signals, ranked by usefulness inside Poland

| # | Signal | Region it tells | In the trainer? | Conf. |
|---|---|---|---|---|
| 1 | Town names on place-name and direction signs | Any; the next big city narrows it to tens of km | `city` set | M |
| 2 | Plate: the first letter is the voivodeship (W Warsaw/Masovia, K Kraków/Lesser Poland, G Pomerania, D Lower Silesia …). Large plates, normally readable on the car in front. | One voivodeship | `plate` on each voivodeship in `dep`, shown on its info card | H (letters) / M (2022 extra letters) |
| 3 | Place-name endings: -ice/-owice (south-west, Silesia), -ów (south and east), -owo/-ewo (north and west) | Broad halves of the country | `nom` set (§5) | H (counts) |
| 4 | The river beside the road or town (Vistula through Warsaw, Kraków and Toruń; the Oder along the west border) | Pins a town to a river | `riv` set | M |
| 5 | Landline area code on shop signs (two digits, e.g. 22 Warsaw, 12 Kraków) | A zone, finer than a voivodeship | Not in the trainer (§3) | M |
| 6 | Landscape: Baltic coast and lakes (north), lowland plain (centre), uplands and Carpathians (south) | Broad north–south | Not drillable on the map | M |
| 7 | Architecture: brick Gothic in Pomerania and Warmia, timber churches in the south | Broad | Not drillable | L |

## 3. Study-set decisions

| Set | Decision | Why |
|---|---|---|
| `reg` | **Enabled** — the 7 NUTS-1 macroregions (§4) | Official and checkable, and the groups are geographically coherent |
| `dep` | **Enabled** — the 16 voivodeships (Natural Earth admin-1) | The units players need; capitals as "seat" |
| `city` | **Enabled** | Road signs name the next city |
| `riv` | **Enabled** | Poland's big rivers are one-to-one with its regions (Vistula, Oder) and the towns on them are drillable |
| `tel` | **Skipped** | See below |
| `nom` | **Enabled** — three patterns | They split the country into halves players can use (§5) |

- **No `tel`.** Polish landline area codes are two digits (the first two digits after the 48
  country code) and there are 50 of them in Google's libphonenumber metadata
  (`resources/geocoding/en/48.txt`, Apache 2.0, read 2026-11-28): 12, 13, 14, 15, 16, 17, 18, 22,
  23, 24, 25, 29, 30, 32, 33, 34, 41, 42, 43, 44, 46, 48, 52, 54, 55, 56, 58, 59, 61, 62, 63, 65, 67, 68,
  71, 74, 75, 76, 77, 81, 82, 83, 84, 85, 86, 87, 89, 91, 94, 95. Each is named after one town: they
  follow the telephone network's old zones (about the pre-1999 voivodeships), not the 16 current
  units. So a voivodeship holds several zones: Masovia alone has 22, 23, 24, 25, 29 and 48 (Warsaw,
  Ciechanów, Płock, Siedlce, Ostrołęka, Radom), Lesser Poland 12, 14, 18 and 33, Subcarpathia 13, 15,
  16 and 17. The engine maps one zone per unit; any such mapping would teach wrong answers. This is
  the case the skill's "unit granularity" rule calls out. Whether a few zones straddle voivodeship
  borders (e.g. a district seat that moved in the 1999 reform) was not checked (no gov.pl access);
  it does not change the decision. **M**. Logged in `docs/backlog.md` (needs sub-voivodeship units:
  the 380 powiats).
- **Plates (`plate`).** The first letter is the voivodeship. Verified by parsing the district tables
  of Wikipedia's "Vehicle registration plates of Poland": every county code in each voivodeship
  column starts with the same letter, and the 16 letters are D, C, E, L, F, K, W, O, R, B, G, S, T, N,
  P, Z in that order (Lower Silesia … West Pomerania). **H**. Primary source: the Ministry of
  Infrastructure's regulation on vehicle registration (Rozporządzenie w sprawie rejestracji i
  oznaczania pojazdów), isap.sejm.gov.pl, **not reachable here**.
  - Since 2022 extra first letters exist for voivodeships running out of combinations: V Lower
    Silesia, J Lesser Poland, A Masovia, Y Subcarpathia, X Pomerania, I Silesia (and M for Greater
    Poland, reportedly unused). The trainer shows both letters where they exist ("D, V"). **M**:
    secondary source only (Wikipedia citing the 2022 Ministry regulation and press); the plate
    label says "start with", not "start with only".
  - Special plates start with other letters: H (interior ministry services), U (military), and
    diplomats' W. Not drilled.
- **Department codes are hidden.** The ISO 3166-2 suffixes (DS, KP …) are only ids; the plate letter
  is shown on the info card instead.

## 4. Grouping (regions.json)

The 7 NUTS-1 macroregions as in the current NUTS classification (Eurostat; the Wikipedia article
"NUTS statistical regions of Poland" lists the 16 voivodeships under them, checked). **H**.

| Key | Name | Voivodeships | Capital shown |
|---|---|---|---|
| CEN | Centralny | Łódzkie, Świętokrzyskie | Łódź |
| POL | Południowy | Małopolskie, Śląskie | Kraków |
| WSC | Wschodni | Lubelskie, Podkarpackie, Podlaskie | Lublin |
| PZ | Północno-Zachodni | Wielkopolskie, Zachodniopomorskie, Lubuskie | Poznań |
| PDZ | Południowo-Zachodni | Dolnośląskie, Opolskie | Wrocław |
| PN | Północny | Pomorskie, Kujawsko-Pomorskie, Warmińsko-Mazurskie | Gdańsk |
| MAZ | Mazowieckie | Mazowieckie | Warszawa |

Why this and not a looser study grouping: it is official, anyone can check it, and its groups are
contiguous and similar in size (except Masovia, which stands alone: it is Poland's biggest unit and
the capital's). The alternatives (four compass quarters) cut Masovia or Greater Poland in
arbitrary places. Weakness: "Północny" mixes the Baltic coast with the Masurian lakes, and
"Centralny" is just two units. Not a contested decision; flagged as a doubt in the PR.

## 5. Name patterns (placeNames.json)

Share of GeoNames places with ≥1,000 inhabitants (3,022 in Poland) whose name ends in the
pattern, per voivodeship. **H** (counted from the dataset; the story of the origin is **M**).

| Ending | DS | OP | SL | MA | LD | SK | LU | PK | MZ | PD | WP | KP | PM | WN | ZP | LB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| -ice | 13 | 16 | 17 | 14 | 12 | 5 | 4 | 2 | 3 | 1 | 3 | 3 | 3 | 1 | 10 | 5 |
| -ów | 14 | 14 | 11 | 11 | 21 | 29 | 20 | 8 | 14 | 9 | 9 | 0 | 1 | 0 | 5 | 6 |
| -owo, -ewo | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 5 | 8 | 11 | 14 | 14 | 15 | 14 | 2 |

Percent of places, rounded down. The three endings split the country: -ice/-owice stand in the
south-west (Silesia, Opole, Lesser Poland, Łódź), -ów in the south and east and almost never in
the north, -owo/-ewo in the north and west and never in the south. -ino/-in (Pomerania) and
-ki/-ka are weaker (single-digit gaps) and left out. German-origin names (-bork, -burg) are
too rare (≤1 %) to drill.

## 6. Rivers (rivers.json, riverCourses.json)

Natural Earth 1:10m has the Vistula, Oder, Warta and Bug in its centrelines and the other
tributaries in `rivers_europe`. Rivers: Wisła, Odra, Warta, Bug, Narew, San, Noteć, Pilica,
Dunajec, Bóbr. Lengths (total length, km) from Wikipedia's "List of rivers of Poland"
(citing the official hydronym list KSNG): Wisła 1,022, Odra 840, Warta 795, Bug 774, Narew 499,
San 458, Noteć 391, Pilica 333, Bóbr 279, Dunajec 249. **M** (the Vistula is also quoted as
1,047 km elsewhere). Odra, Bug, Narew, San and Bóbr rise outside Poland: `lengthIsTotal`.

## 7. Cities (cities.json)

86 cities, 21 in tier 1: all 16 voivodeship capitals including both seats of Kujawsko-Pomorskie
(Bydgoszcz, Toruń) and Lubuskie (Gorzów Wielkopolski, Zielona Góra), plus Częstochowa, Radom and
Gdynia. Coordinates: GeoNames `cities1000` (CC BY 4.0), ~1 km. Coordinates checked against the
voivodeship polygon of the outline. Seat of each voivodeship in `departments.json`: for
Kujawsko-Pomorskie the seat is "Bydgoszcz / Toruń" and for Lubuskie "Gorzów Wielkopolski / Zielona
Góra" (the voivode sits in Bydgoszcz and Gorzów; the sejmik in Toruń and Zielona Góra). **H**.

## 8. Sources and licences

| Source | Used for | Licence | Checked |
|---|---|---|---|
| Natural Earth 1:10m admin-1, rivers_lake_centerlines, rivers_europe (via github.com/nvkelso/natural-earth-vector) | Voivodeship outlines, river courses | Public domain | 2026-11-28 |
| GeoNames `cities1000` (via github.com/lutangar/cities.json) | Town coordinates, place-name counts | CC BY 4.0 — credited in the footer of `copy.en.ts` and `copy.be.ts` | 2026-11-28 |
| Wikipedia, "Vehicle registration plates of Poland" (wikitext) | Plate letters per voivodeship (a complete list of facts), the 2022 extra letters | CC BY-SA, used as a reference for facts only; no text, table or image copied | 2026-11-28 |
| Wikipedia, "NUTS statistical regions of Poland" | Macroregion grouping | Same | 2026-11-28 |
| Wikipedia, "List of rivers of Poland" | River lengths | Same | 2026-11-28 |
| Google libphonenumber `geocoding/en/48.txt` (github.com/google/libphonenumber) | The list of Polish area codes, to justify skipping `tel` (not bundled) | Apache 2.0 | 2026-11-28 |
| Own work | Tips, grouping rationale, name-pattern analysis, the hand-picked city and river-town lists | Author: this repository | 2026-11-28 |

No OpenStreetMap data, no Google imagery, nothing copied from plonkit or geohints.
