import type { CountryCopy } from '../../types/geo';

/** France's interface text in English (the source language). */
export const copyEn: CountryCopy = {
  countryName: 'France',
  subtitle:
    'Regions, départements, cities, rivers, phone zones and place-name endings: learn them, then drill until they stick.',
  setLabels: {
    reg: 'Regions',
    dep: 'Départements',
    city: 'Cities',
    riv: 'Rivers',
    tel: 'Phone codes',
    nom: 'Name endings',
  },
  regionTerm: { one: 'Region', many: 'Regions' },
  departmentTerm: { one: 'Département', many: 'Départements' },
  seatLabel: 'Prefecture',
  plateLabel: 'Plates end in',
  credits:
    'Département outlines: <a href="https://github.com/VictorCazanave/svg-maps/tree/master/packages/france.departments">France departments map</a> by Victor Cazanave (svg-maps), licensed <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Phone zones follow the Wikipedia table of French area codes. Coordinates, river courses and place-name patterns are approximate and compiled for study, not survey-grade.',
  allAreas: 'All of France',
  phoneHint:
    'Since 2023 a new or moved number can keep any prefix, but most businesses still have their original local one, so it remains a strong clue on signs.',
  tips: {
    reg: 'Start with the outline: Bretagne and Normandie in the northwest, Grand Est along the German border, Occitanie and PACA across the south. Then drill until every region is green on the first try.',
    dep: 'Learn one region at a time with the Area filter, then switch to All of France. Use Ask by Number for plates: the two digits on the right of a French plate are the département.',
    tel: 'Learn the five zones, then drill Which zone? on single départements: the edges are what matter (Allier, Cantal and Haute-Loire are 04; Aveyron is 05; the Languedoc coast is 04). Spot a landline on a shop sign, van or billboard and you know the zone instantly.',
    nom: 'Pick an ending to see its area and examples. Ending → area drills the patterns; Real towns gives you actual names to place, which is what you see on road signs. Remember the classic trio: one Latin ending became -y in the north, -é in the west and -ac in the south.',
    riv: 'Learn a river with the River filter: it zooms to the river and lists its towns in order from source to mouth. Then use Place towns. A name like Bar-sur-Seine tells you the river, and you have to know where along it the town sits.',
    city: 'Use the Area filter to learn a region’s cities, then practise the whole country. Smaller cities show their names when you zoom in.',
  },
};
