# Peru — country brief and data notes

Compiled 2026-11-26 for the trainer's Peru data. Confidence: **H** = two independent
sources or an official/primary text; **M** = one good source (or Wikipedia only);
**L** = search-engine summary only or inference. Facts read only through a WebSearch
summary (the page itself could not be fetched) are marked *(summary)*.

Network note: only en/es Wikipedia, plonkit.net and geohints.com could be fetched
(geohints' Peru page returned 403). SUNARP, MTC, OSIPTEL, INEI and the dealer/press pages
were seen only through WebSearch summaries.

## 1. Coverage overview

- Coverage is concentrated in the **west** (coast and Andes) and on the main highways.
  The Amazon has only isolated pockets: **Iquitos** (Gen 3 only, no road link to the rest),
  **Pucallpa** and the 5N/Federico Basadre road, **Tarapoto**/San Martín, and the
  **Interoceánica (30C)** to Puerto Maldonado and Iñapari (Gen 3 white car, partly Gen 4). [Plonk It, M]
- Generations: Gen 3 (black or white car), Gen 4, and Gen 4 "smallcam" (lower mount).
  A white car also covers the Aguas Calientes–Machu Picchu road; a trekker covers the
  Cusco–Aguas Calientes railway. [Plonk It, M]
- Highways: 1 (Panamericana, N/S), 3 (Andean longitudinal) and 5 (Fernando Belaúnde,
  selva edge) are the long north–south axes; route numbers rise from north to south.
  1N/S is divided only near Lima. [Plonk It, M]

## 2. Regional signals, ranked by usefulness inside Peru

| # | Signal | Why it splits the country | Conf. |
|---|---|---|---|
| 1 | **Landscape zone** (costa desert / sierra / selva) | Tells you the band at a glance; dry flat desert near Piura, Ica–Arequipa–Tacna "Chilean" desert, altiplano around Puno and Lake Chinchaycocha, rainforest east. | H (Plonk It + geography) |
| 2 | **Road / highway number** and km markers | Black-and-white concrete km posts, some show the route number near towns; numbers rise N→S. | M (Plonk It) |
| 3 | **Town names on signs and painted political walls** | Directly drillable: the `city` set. | — |
| 4 | **Landline area code** on shop signs | One 2-digit code per region (Lima/Callao/Lima region share 01). Exact region when seen, but most signs now show 9-digit mobiles. | H (Wikipedia + MTC chart cited there) |
| 5 | **Regional crops and vegetation** | Sugar cane Chiclayo–Trujillo, olives in Tacna, coconut/banana north coast, pine plantations in the sierra, red soil around Cusco/Ayacucho/Cajamarca/Tarapoto, volcanoes only in the Arequipa south-east. | M (Plonk It) |
| 6 | **Architecture** | Red brick and blue glass near Lake Titicaca; overhanging roofs with wooden supports in the north; colonial + brick in Cusco. | M (Plonk It) |
| 7 | **Pole stickers** | Yellow vertical numbers on the north coast and in Tacna; horizontal sticker with a city code (e.g. CH = Chimbote). | M (Plonk It) |
| 8 | **Mototaxis** | Open-front type mostly in the north and Amazon-adjacent areas; Puerto Maldonado drivers in yellow vests; inverted-J lamp posts in Lima. | M (Plonk It) |
| 9 | **Moquegua bollard** | Cylindrical with black-yellow top stripe, unique to Moquegua. | M (Plonk It) |
| 10 | **River valley** | Andean and selva roads follow rivers (Callejón de Huaylas = Santa, Sacred Valley = Urubamba, Carretera Central = Rímac, Huallaga valley road Huánuco → Yurimaguas). Town names almost never contain the river. | M |
| 11 | **Plate first letter** | Registry zone letter (see §4). Plates are blurred by Google and Lima letters A–F dominate everywhere, so low practical value. | M–H for the table, L for Street View usefulness |

Myths / pitfalls:
- "The plate letter tells the region": only the **registry zone** (13–14 zones, several
  regions share a letter), and the vehicle may have been registered anywhere; Zona IX
  (Lima-Callao) holds well over half the national fleet *(summary, L)*.
- "Area codes on phone numbers": mobile numbers are non-geographic nationwide since
  4 Sept 2010; only landlines carry a code. [Wikipedia, M]
- The Lima region outside the capital (Huacho, Barranca, Cañete) also uses **01**, not a
  separate code. [Wikipedia table "1 = Lima and Callao" + INEI/Congreso directories listing
  Huacho, Barranca and Cañete numbers as 01-… *(summary)*, M]

## 3. Study-set decisions

| Set | Decision | Reason |
|---|---|---|
| `reg` | **Enabled** | Peru has no official tier between nation and region; a 5-zone study grouping (below) gives players the coarse placement the landscape already suggests. |
| `dep` | **Enabled** | The 24 regions + Lima/Callao are the map backbone; plate letters shown where verified. |
| `city` | **Enabled** | Town names on signs and painted walls are the most common exact clue; 79 cities weighted to covered roads. |
| `tel` | **Enabled** | Codes are strictly regional and printed on older shop/hotel/school signs; one code = one region (01 = whole Lima department + Callao). Value is moderate because mobiles dominate. |
| `riv` | **Enabled (limited)** | Not for river-named towns (there are almost none) but because covered Andean/Amazon roads run along a few valleys; 6 rivers only. |
| `nom` | **Skipped** | Quechua toponyms (-pampa/-bamba, -marca, -cocha) blanket the whole sierra and do not split it; the Aymara zone is essentially Puno, already obvious from the altiplano/Titicaca landscape; Amazonian "Puerto …" names are also used on the coast (Puerto Eten, Puerto Pizarro) and the selva has little coverage. Nothing passed the "regional and defensible" bar with sources I could verify. |

## 4. Plates (departments.json `plate`)

2010-onward plates: the **first character is the registry zone** (SUNARP Zona Registral),
letters reassigned in January 2010; E = special plates (government, police, diplomatic…). [en + es Wikipedia, citing DS 017-2008-MTC Annex II, H]

| Letter | Regions | Sources |
|---|---|---|
| A, B, C, D, F | Lima, Callao (and the Lima region: Huacho office belongs to Zona IX *(summary)*) | Wikipedia en/es; Hyundai, Kia, Libero blogs *(summary)* |
| H | Áncash | same |
| L | Loreto | same + DS 021-2025-MTC annex (Zona IV Iquitos) *(summary)* |
| M (then K) | Amazonas, Cajamarca, Lambayeque | Wikipedia; DS 021-2024-MTC: Zona II Chiclayo uses K after M is exhausted *(summary)*. Hyundai's list omits Lambayeque under M. |
| P | Piura, Tumbes | Wikipedia; blogs; DS 021-2025 annex (Zona I Piura) *(summary)* |
| S | San Martín | Wikipedia; Kia; MTC annex (Zona III Moyobamba) *(summary)* |
| T | La Libertad | Wikipedia; blogs |
| U | Ucayali | Wikipedia; Kia; MTC annex (Zona VI Pucallpa) *(summary)* |
| V | Arequipa | Wikipedia; blogs |
| W | Huánuco, Junín, Pasco | Wikipedia; blogs |
| X | Apurímac, Cusco, Madre de Dios | Wikipedia; blogs; MTC annex *(summary)* |
| Y | Ica | Wikipedia; blogs |
| Z | Moquegua, Puno, Tacna | Wikipedia; blogs |

**Left out: Ayacucho and Huancavelica.** Wikipedia and the blogs give both as Y (with Ica),
but a summary of the DS 021-2024-MTC zone table lists Huancavelica under Zona VIII
(Huancayo, i.e. W) and a summary of the 2025 annex gives Zona XIV (Ayacucho) a different
letter (I). Unresolved without the official annex, so no `plate` for AYA/HUV.

## 5. Phone (phone.json)

Source: en Wikipedia "Telephone numbers in Peru" (table from the MTC area-code chart,
codes in force since 1 March 2003). Lima/Callao landlines have 7 digits, the rest 6.
Display format: with the trunk 0, as printed on Peruvian signs and dialled domestically
("01", "044", "084"). First digit groups: 04 Amazonas/San Martín/Áncash/La Libertad;
05 Puno/Tacna/Moquegua/Arequipa/Ica; 06 Ucayali/Huánuco/Pasco/Junín/Loreto/Ayacucho/Huancavelica;
07 Tumbes/Piura/Lambayeque/Cajamarca; 08 Madre de Dios/Apurímac/Cusco. Hues share a base
per first digit (±12–15). `borderDepartements` left empty: every zone is a single region
(except 01), so "zone borders" are just region borders. No 2024–2026 change to geographic
codes found (searches only turned up the new 500 commercial prefix, DS 018-2026-MTC,
and portability rules) *(summary, M)*.

## 6. Grouping (regions.json)

Polling firms report Peru as Lima + Norte / Centro / Sur / Oriente (Ipsos' sheets use
finer costa/sierra strata plus Oriente *(summary)*). There is no single official mapping,
so this is a **study grouping**, chosen to match what a player sees:

- **LYC Lima y Callao** — LMA, LIM (one landline code, one plate block, same coastal look).
- **NOR Norte** (Trujillo) — TUM, PIU, LAM, LAL, CAJ, ANC: north coast + northern Andes.
- **CEN Centro** (Huancayo) — HUC, PAS, JUN, HUV, AYA: central sierra (Mantaro valley,
  Chinchaycocha, rocky outcrops Junín→Ayacucho per Plonk It).
- **SUR Sur** (Arequipa) — ICA, APU, CUS, ARE, PUN, MOQ, TAC: southern desert coast (Ica
  grouped here for its Chile-like desert, per Plonk It) and southern Andes/altiplano.
- **ORI Oriente** (Iquitos) — AMA, SAM, LOR, UCA, MDD: Amazonian regions.

Judgement calls: Ica (Centro in some schemes), Madre de Dios (often "Macro Sur"),
Amazonas (Andean Chachapoyas but selva Bagua) and Ayacucho.

## 7. Files and sources

- **departments.json** — 25 units (Callao merged into LMA "Lima Metropolitana y Callao",
  coordinator decision). Capital coordinates from Wikipedia (en `{{coord}}` or es page
  coordinates), cross-checked against Natural Earth populated places (≤3 km except where
  NE is coarse). Lima uses Wikipedia's city point (−12.060, −77.038), ~1.5 km south of the
  Plaza Mayor.
- **cities.json** — 79 cities (21 tier 1). Coordinates: Wikipedia (en/es), checked against
  Natural Earth; every point verified inside its region with the NE admin-1 polygons
  (Iñapari sits on the border line). Corrections made: Caraz (es page point was 7 km off;
  en value used), Tarapoto/Casma/Satipo (NE 6–13 km off; Wikipedia used).
  **Chincha Alta** (−13.42, −76.14) is uncertain by ~3 km: Wikipedia says −13.45, NE −13.42.
  Chosica was dropped from cities (it is in Lima Province, but its point falls on the
  coarse NE boundary on the Huarochirí side); it remains a Rímac river town.
- **rivers.json** — 6 rivers, 39 towns. Lengths: Amazonas 7062 km total (es WP); Ucayali
  1771 km (es WP "sólo Ucayali"; en WP says 2238 incl. other reckonings); Huallaga 1138 km
  (es WP; en 1100); Urubamba 862 km (es WP citing INEI Compendio 2001; en/FAO 724);
  Santa 347 km (es WP); Rímac 160 km (es WP; en says 204). Towns on each river taken
  from the es/en river or town articles: Santa (es Río Santa; Recuay, Santa town articles),
  Huallaga (es Río Huallaga lists Ambo, Huánuco, Tingo María, Tocache, Juanjuí, Bellavista,
  Picota, Chazuta, Yurimaguas; Aucayacu article), Urubamba (es Río Urubamba: Combapata,
  Urcos, Pisac, Calca, Urubamba, Ollantaytambo, Aguas Calientes, Quillabamba, Sepahua,
  Atalaya), Rímac (es Río Rímac and district articles), Ucayali (en/es: Atalaya, Pucallpa,
  Contamana, Requena), Amazonas (Iquitos, Indiana, Caballococha, Santa Rosa articles).
  `course: []` for Amazonas, Ucayali, Huallaga, Santa (Natural Earth). Hand courses:
  **Urubamba** — source near Abra La Raya (approximate, L), then Sicuani … Sepahua town
  points, mouth at Atalaya from en WP (−10.702, −73.754); the Quillabamba→Echarati→Pongo de
  Mainique (WP point)→Camisea→Sepahua stretch is straight-line between known points, so
  expect a few km of error there. **Rímac** — Ticlio (WP) as headwater proxy, town/district
  points, mouth at Callao (−12.032, −77.137; L — en WP's "mouth" coordinate is actually
  Chosica). Mantaro left out: its U-shaped lower course could not be waypointed reliably
  (its source −10.921, −76.279 and mouth −12.263, −73.979 are known from es/en WP).
- **phone.json** — §5. **regions.json** — §6. **copy.en.ts** (and its translations, copy.<lang>.ts) — tips written from this brief.
- Plonk It Peru guide: https://www.plonkit.net/peru (updated 2026-06-23)
- https://en.wikipedia.org/wiki/Telephone_numbers_in_Peru
- https://en.wikipedia.org/wiki/Vehicle_registration_plates_of_Peru ;
  https://es.wikipedia.org/wiki/Matr%C3%ADculas_automovil%C3%ADsticas_de_Per%C3%BA
- DS 021-2024-MTC (https://lpderecho.pe/modifican-reglamento-placa-unica-nacional-rodaje-incluir-nuevas-categorias-decreto-supremo-021-2024-mtc/) and
  DS 021-2025-MTC annex (https://actualidadcivil.pe/normas-legales/anexo-decreto-supremo-021-2025-mtc/a19220cb-22f8-4402-9719-891be53ce86d) *(summary)*
- Hyundai Perú (https://hyundai.pe/blog/significado-placas-vehiculares-peru/), Kia Perú
  (https://www.kia.com/pe/util/news/significado-placas-vehiculares.html), Libero *(summary)*
- Sunarp Huacho / Zona IX (https://www.gob.pe/institucion/sunarp/noticias/1415081-programa-sunarp-te-escucha-llego-a-huacho) *(summary)*
- INEI directory (https://www.inei.gob.pe/media/archivos/Directorio_ODEI-OZEI.pdf), Congreso
  municipal directory (https://www3.congreso.gob.pe/Docs/Otamdegrl/files/directorio/dlimaprov926.pdf) for 01 in Lima region *(summary)*
- es/en Wikipedia articles of each river and town named above; Natural Earth 10m populated
  places and admin-1 (public domain).

## 8. Backlog: signals the engine cannot express

- **Landscape bands** costa / sierra / selva and sub-zones (Piura flat desert, Ica–Tacna
  desert, altiplano, Chinchaycocha, Tarapoto hills) — a "terrain zone" layer that cuts across regions.
- **Highway numbers** (1N/1S, 3N/3S, 5N/5S, 22, 26, 28B, 30C…) with km markers — a "which road?" set.
- **Coverage map** — Amazon gaps, Iquitos as an island, trekker/train lines — to down-weight uncovered areas.
- **Pole-sticker city codes** (north coast, Tacna) and yellow vertical pole numbers.
- **Moquegua bollard**, Lima inverted-J lamp posts, Puerto Maldonado yellow-vest mototaxis, open-front mototaxis in the north.
- **Crops and soil**: sugar cane, olives (Tacna), red soil zones, pine plantations, volcanoes (Arequipa only).
- **Architecture**: Titicaca red brick + blue glass, northern overhanging roofs.
- **Plate letter blocks** as their own drill (zone → several regions), if ever useful; needs the official 2025 annex to settle Ayacucho/Huancavelica.
- **Mantaro river** course (needs a proper source for its lower loop) — valuable for the Jauja–Huancayo valley.
