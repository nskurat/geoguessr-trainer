import type { CountryCopy } from '../../types/geo';

/** Poland's interface text in English (the source language). */
export const copyEn: CountryCopy = {
  countryName: 'Poland',
  subtitle:
    'Voivodeships, cities, rivers and place-name endings: learn them, then drill until they stick.',
  setLabels: {
    dep: 'Voivodeships',
    city: 'Cities',
    riv: 'Rivers',
    nom: 'Name endings',
  },
  departmentTerm: { one: 'Voivodeship', many: 'Voivodeships' },
  seatLabel: 'Seat',
  plateLabel: 'Plates start with',
  allAreas: 'All of Poland',
  phoneHint: '',
  tips: {
    dep: 'Start with the voivodeships on the coast and the borders, then fill in the centre, and anchor each one on its seat. The first letter of a number plate is the voivodeship (W Warsaw and Masovia, K Kraków, G Gdańsk, D Wrocław, P Poznań, S Katowice): click a voivodeship to see its letters. Since 2022 some voivodeships also issue a second letter, such as A for Masovia and J for Lesser Poland, so one letter is no longer the whole story.',
    city: 'Coverage is dense everywhere, so learn the big cities first, then zoom in for the smaller ones. Direction signs point to the next big city, so know which way each one lies. Two voivodeships have two seats each: Bydgoszcz and Toruń, Gorzów Wielkopolski and Zielona Góra.',
    riv: 'The Wisła runs from the Beskids in the south through Kraków, Warsaw and Toruń to the Baltic at Gdańsk; the Odra follows the German border in the west; the Bug and the Narew run through the east. Learn a river with the River filter, which lists its towns from source to mouth, then use Place towns to know where along it each one sits.',
    nom: 'Pick an ending to see its area and examples. -ice and -owice cluster in the south-west (Silesia, Opole, Lower Silesia, Lesser Poland), -ów runs across the south and east and is almost absent in the north, and -owo and -ewo are the mirror image: Pomerania, Kuyavia, Masuria, Greater Poland, never the south. -ów is the same Slavic suffix as -ow in eastern Germany.',
  },
  credits:
    'Voivodeship outlines and river courses: <a href="https://www.naturalearthdata.com/">Natural Earth</a> (public domain). Town coordinates: <a href="https://www.geonames.org/">GeoNames</a>, licensed <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Cities, rivers and place-name patterns are compiled for study (see RESEARCH.md in the repository); coordinates and courses are approximate, not survey-grade.',
};
