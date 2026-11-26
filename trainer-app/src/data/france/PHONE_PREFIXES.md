# Phone prefixes (AB after the zone digit)

`phonePrefixes.json` maps each département code to 1-3 two-digit strings: the typical AB in landline numbers `0Z AB CD EF GH`, most characteristic first. They descend from the pre-1996 numbering zones (ZNE). Since number portability, VoIP and the 2023 end of geographic matching, they are tendencies, not rules: new numbers can carry any prefix. Intended for small learn-mode labels only, not quiz material.

## Verification
Every entry was checked against the table on French Wikipedia, "Indicatif téléphonique local en France":
https://fr.wikipedia.org/wiki/Indicatif_t%C3%A9l%C3%A9phonique_local_en_France
(columns: zone, indicatif, département(s), since). A value is kept only if the table lists that département (or, for Nord, Lyon, Marseille, Ain etc., the relevant part of it) for that prefix. Order and the 3-value cap are editorial: historic single-département or ZNE codes first, newer shared/regional ranges (e.g. 01 5x, 02 5x, 04 8x) omitted.

Corrections made versus the first draft: Seine-Maritime dropped 32 (02 32 is Eure only); Seine-Saint-Denis dropped 49 (not listed) and now 48/43/42; Haute-Garonne now 61/34 (62 is Gers/Hautes-Pyrénées only); Gard 66 only and Hérault 67 only; Ille-et-Vilaine gained 23; Corse-du-Sud now 95/20 like Haute-Corse.

## Notes
- Shared codes by design: 02 33 (50, 61), 02 43 (53, 72), 02 54 (36, 41), 03 25 (10, 52), 03 29 (55, 88), 03 84 (39, 70, 90), 03 86 (58, 89), 04 71 (15, 43), 04 75 (07, 26), 04 68 (11, 66), 04 92 (04, 05), 04 95 (2A, 2B), 05 53 (24, 47), 05 55 (19, 23, 87), 05 61 (09, 31), 05 63 (81, 82), 05 49 (79, 86).
- Partial-département codes: 04 72 and 04 78 are Lyon only (04 74 is the rest of Rhône); 04 91 is Marseille, 04 42 east/centre BdR, 04 90 west BdR + Vaucluse; 04 50 is the far north-east of Ain plus Haute-Savoie; 03 82/03 83 split Meurthe-et-Moselle; Nord: 03 20 centre, 03 27 south, 03 28 north.
- Trimmed to 3 (more exist): Paris 75 (01 40-49, 53, 55 are all Paris), 78, 91, 92, 93, 94, 95 (Île-de-France); 59 (Nord); 13.
- Nothing remained unverifiable, so nothing was removed.
