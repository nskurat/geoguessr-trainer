import type { CountryCopy } from '../../types/geo';

/** Poland's interface text in English (the source language). */
export const copyEn: CountryCopy = {
  countryName: 'Poland',
  subtitle:
    'Macroregions, voivodeships, cities, rivers and place-name endings: learn them, then drill until they stick.',
  setLabels: {
    reg: 'Macroregions',
    dep: 'Voivodeships',
    city: 'Cities',
    riv: 'Rivers',
    nom: 'Name endings',
  },
  regionTerm: { one: 'Macroregion', many: 'Macroregions' },
  departmentTerm: { one: 'Voivodeship', many: 'Voivodeships' },
  seatLabel: 'Seat',
  plateLabel: 'Plates start with',
  allAreas: 'All of Poland',
  phoneHint: '',
  tips: {
    reg: 'The seven official NUTS-1 macroregions, an EU statistics grouping you will not see on signs, but contiguous and easy to check: Centralny (Łódzkie, Świętokrzyskie), Południowy (Małopolskie, Śląskie), Wschodni (Lubelskie, Podkarpackie, Podlaskie), Północno-Zachodni (Wielkopolskie, Zachodniopomorskie, Lubuskie), Południowo-Zachodni (Dolnośląskie, Opolskie), Północny (Pomorskie, Kujawsko-Pomorskie, Warmińsko-Mazurskie) and Mazowieckie on its own. Learn them first, then use them as the Area filter for everything else.',
    dep: 'Learn one macroregion at a time with the Area filter, then switch to All of Poland. Anchor each voivodeship on its seat. The first letter of a number plate is the voivodeship (W Warsaw and Masovia, K Kraków, G Gdańsk, D Wrocław, P Poznań, S Katowice): click a voivodeship to see its letters. Since 2022 some voivodeships also issue a second letter, such as A for Masovia and J for Lesser Poland, so one letter is no longer the whole story.',
    city: 'Coverage is dense everywhere, so learn the cities one macroregion at a time with the Area filter, then the whole country. Direction signs point to the next big city, so know which way each one lies. Smaller cities show their names when you zoom in. Two voivodeships have two seats each: Bydgoszcz and Toruń, Gorzów Wielkopolski and Zielona Góra.',
    riv: 'The Wisła runs from the Beskids in the south through Kraków, Warsaw and Toruń to the Baltic at Gdańsk; the Odra follows the German border in the west; the Bug and the Narew run through the east. Learn a river with the River filter, which lists its towns from source to mouth, then use Place towns to know where along it each one sits.',
    nom: 'Pick an ending to see its area and examples. -ice and -owice cluster in the south-west (Silesia, Opole, Lower Silesia, Lesser Poland), -ów runs across the south and east and is almost absent in the north, and -owo and -ewo are the mirror image: Pomerania, Kuyavia, Masuria, Greater Poland, never the south. -ów is the same Slavic suffix as -ow in eastern Germany.',
  },
  credits:
    'Voivodeship outlines and river courses: <a href="https://www.naturalearthdata.com/">Natural Earth</a> (public domain). Town coordinates: <a href="https://www.geonames.org/">GeoNames</a>, licensed <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Cities, rivers and place-name patterns are compiled for study (see RESEARCH.md in the repository); coordinates and courses are approximate, not survey-grade.',
};
