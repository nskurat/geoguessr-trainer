import type { CountryCopy } from '../../types/geo';

/** Germany's interface text in English (the source language). */
export const copyEn: CountryCopy = {
  countryName: 'Germany',
  subtitle:
    'States, cities, rivers and place-name endings: learn them, then drill until they stick.',
  setLabels: {
    dep: 'States',
    city: 'Cities',
    riv: 'Rivers',
    nom: 'Name endings',
  },
  regionTerm: { one: 'Macro-region', many: 'Macro-regions' },
  departmentTerm: { one: 'State', many: 'States' },
  seatLabel: 'Capital',
  allAreas: 'All of Germany',
  phoneHint: '',
  tips: {
    dep: 'Learn one macro-region at a time with the Area filter, then switch to All of Germany. The four macro-regions are a study grouping, not an official one: Nord, West, Süd and Ost; Ost, the former GDR with Berlin, is the one with the clearest signals (-ow and -itz names, 03 area codes). Anchor each state on its capital. Area codes on shop signs are a quick cross-check, though their zones ignore state borders: 04 is the North, 08 southern Bayern and 09 northern Bayern.',
    city: 'Coverage is dense everywhere, so learn the cities one macro-region at a time with the Area filter, then the whole country. Road signs point to the next big city, so know which way each one lies. Smaller cities show their names when you zoom in.',
    riv: 'Town names often carry the river: Frankfurt am Main, Frankfurt (Oder), Halle (Saale), Limburg an der Lahn. Learn a river with the River filter, which lists its towns from source to mouth, then use Place towns to know where along it each one sits.',
    nom: 'Pick an ending to see its area and examples. The big split is -ow and -itz in the former Slavic east against -ing in Old Bavaria and -ingen in Swabia, with -heim along the Rhine plain from Mainz to Karlsruhe; then the corners: -büll and -by near Denmark, -siel and -fehn in East Frisia, -weiler in the Palatinate and the Saarland, -leben and -rode around the Harz. -dorf and -hausen are everywhere and tell you nothing.',
  },
  credits:
    'State outlines and river courses: <a href="https://www.naturalearthdata.com/">Natural Earth</a> (public domain). Town coordinates: <a href="https://www.geonames.org/">GeoNames</a>, licensed <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Cities, rivers and place-name patterns are compiled for study (see RESEARCH.md in the repository); coordinates and courses are approximate, not survey-grade.',
};
