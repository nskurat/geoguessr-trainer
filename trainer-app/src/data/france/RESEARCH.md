# France — data provenance

## Sources and licences

Audit: 2026-11-28. The initial import (`ecd8b2d`) moved the inline France data out of
the Claude artifact; it does not identify the upstream sources for each point or list.
`8cf6b4c` added the finer prefixes and their [verification notes](PHONE_PREFIXES.md);
`249f9a0` introduced the bilingual copy. Reference links added in this audit do not
retroactively establish what the artifact used.

| Data file / asset | Source | Licence | How it was used | Credit required (y/n) | Status |
|---|---|---|---|---|---|
| `@svg-maps/france.departments` 1.0.1 | Victor Cazanave, [France departments map](https://github.com/VictorCazanave/svg-maps/tree/master/packages/france.departments); installed package metadata and `LICENSE.md` | CC BY 4.0 | Bundled paths as supplied; map display styled by trainer | y — both footers | OK |
| `regions.json` | Artifact import; [INSEE Code officiel géographique](https://www.insee.fr/fr/information/2560452) is a reference for the official units and codes, not a documented original source | Administrative facts; trainer colours | Facts and display choices | n | OK |
| `departements.json` | Artifact import; INSEE COG is a reference for the codes and seats, not for the compiled coordinate points | Administrative facts; coordinate source undocumented | Facts; points used as projection anchors | n for facts; unknown for source collection | needs owner decision |
| `cities.json` | Artifact import; original source of coordinates and selection not recorded | Unverified compilation provenance | Facts and trainer tiers; no evidence of a copied list | unknown | needs owner decision |
| `phone.json` | Primary: [ARCEP national numbering plan](https://www.arcep.fr/la-regulation/grands-dossiers-thematiques-transverses/la-numerotation.html); secondary: [French Wikipedia, Indicatif téléphonique local en France](https://fr.wikipedia.org/wiki/Indicatif_t%C3%A9l%C3%A9phonique_local_en_France) | Official facts; Wikipedia text CC BY-SA, not bundled | Five historical geographic zones, expressed as trainer assignments, colours and a border drill | n — reference acknowledged | fixed |
| `phonePrefixes.json` | Primary: ARCEP numbering plan and [numbering allocations portal](https://extranet.arcep.fr/communications-electroniques/numerotation); secondary: French Wikipedia table and [PHONE_PREFIXES.md](PHONE_PREFIXES.md) | Official facts; Wikipedia text CC BY-SA, not bundled | Historical `AB` facts, up to three locally useful pairs per département in trainer-selected order; learn labels, not current location guarantees | n — reference acknowledged | OK |
| `placeNames.json` | Artifact import; sources for glosses, selected example towns and coordinates not recorded | Facts where identifiable; compilation provenance unverified | Pattern explanations, example selections and points | unknown | needs owner decision |
| `rivers.json` | Artifact import; no recorded source for the approximate `course` waypoints, town coordinates or selections | Lengths and confluences are facts; geometry provenance unverified | Hand-curated courses and exercise towns; no evidence that courses are from Natural Earth or traced from OSM or a commercial map | unknown | needs owner decision |
| `copy.en.ts`, `copy.be.ts` | Trainer artifact and bilingual port; [Plonk It France](https://www.plonkit.net/france) and French Wikipedia consulted as audit comparisons, not licensed assets | Trainer-authored copy (MIT); references only | Original workflow tips and translations of trainer data; phone tip rewritten to avoid overstating the clue; see caveat for place-name explanations above | n for text itself | fixed |

ARCEP is the primary authority for the historic geographic system. The archived assignments
were not independently rechecked row by row during the audit; the French Wikipedia
table is the documented verification of the individual values. ARCEP's
[2022 numbering-plan update](https://www.arcep.fr/actualites/actualites-et-communiques/detail/n/plan-de-numerotation-050922.html)
announced the end of the geographic restriction in metropolitan France from 2023.
The map uses those historical patterns for study, not to assert the location of a new number.

## Grouping (regions.json)

**Decision (2026-11-28 review): keep the 13 metropolitan régions both as the `reg` study set
and as the Area filter.** They pass the trainer's rule for a top-level grouping (an official
level players meet):

- They are a real administrative level, in their current 13 since 2016 (law 2015-29): each
  has an elected regional council (INSEE COG, **H**). Their names and logos show up in
  coverage on regional coaches and trains and on the panels of works they fund (**M**, not
  counted).
- Players already use them: a département number on a plate or a place-name pattern is
  learnt as "this is in Occitanie / Bretagne", and the régions map onto the phone zones and
  name patterns in large blocks (01 Île-de-France, 02 north-west, 04 south-east).
- With 96 départements, the Area filter keeps the départements and cities learnable one
  région at a time.

Corsica (COR) and Île-de-France (IDF) keep their label nudges (`regionLabelOffsets`).
