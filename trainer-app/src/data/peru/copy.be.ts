import type { CountryCopy } from '../../types/geo';

/*
 * Peru's interface text in Belarusian (official orthography). Place names stay in
 * their official Spanish form, as on the map and on signs; only the country name,
 * English exonyms (the Sacred Valley) and descriptive words are translated. Term
 * choices and dictionary checks: src/i18n/README.md.
 */

const pacific = 'Ціхі акіян';

export const copyBe: CountryCopy = {
  countryName: 'Перу',
  subtitle:
    'Макрарэгіёны, рэгіёны, гарады, тэлефонныя коды і даліны рэк: вывучыце іх, а потым трэніруйцеся, пакуль не запомніце.',
  setLabels: {
    reg: 'Макрарэгіёны',
    dep: 'Рэгіёны',
    city: 'Гарады',
    tel: 'Тэлефонныя коды',
    riv: 'Даліны рэк',
  },
  regionTerm: {
    one: 'Макрарэгіён',
    many: 'Макрарэгіёны',
    counted: { one: 'макрарэгіён', few: 'макрарэгіёны', many: 'макрарэгіёнаў', other: 'макрарэгіёна' },
  },
  departmentTerm: {
    one: 'Рэгіён',
    many: 'Рэгіёны',
    counted: { one: 'рэгіён', few: 'рэгіёны', many: 'рэгіёнаў', other: 'рэгіёна' },
  },
  seatLabel: 'Сталіца',
  allAreas: 'Усё Перу',
  phoneHint:
    'Мабільныя нумары (9 лічбаў, пачынаюцца з 9) не прывязаныя да мясцовасці. Стацыянарны нумар з двухзначным кодам у дужках, напрыклад (044) ці (084), дакладна паказвае рэгіён; (01) — гэта Lima, Callao або правінцыі рэгіёна Lima.',
  tips: {
    reg: 'Гэта навучальная групоўка, а не афіцыйная: Lima y Callao, Norte (паўночнае ўзбярэжжа і поўнач Андаў), цэнтральныя Анды (Centro), Sur ад Ica да Puno і амазонскі Oriente. Вывучыце яе першай, а потым выкарыстоўвайце як фільтр «Тэрыторыя» для ўсяго астатняга.',
    dep: 'Вывучайце па адным макрарэгіёне з фільтрам «Тэрыторыя», потым пераключыцеся на «Усё Перу». Прывязвайце кожны рэгіён да яго сталіцы і да дарогі, па якой вы б туды заехалі: узбярэжжа — гэта адна доўгая Panamericana, горы — ланцуг далін.',
    city: 'Большая частка пакрыцця Street View ідзе ўздоўж Panamericana на ўзбярэжжы і некалькіх дарог у Андах і Амазоніі, таму вывучайце гарады на іх па парадку. З фільтрам «Тэрыторыя» вывучайце гарады аднаго макрарэгіёна; назвы меншых гарадоў з’яўляюцца пры павелічэнні.',
    tel: 'Трэніруйце «Якая зона?» на асобных рэгіёнах: першая лічба групуе краіну (04 — поўнач і цэнтр, 05 — поўдзень, 06 — цэнтр і Loreto, 07 — паўночнае ўзбярэжжа і Cajamarca, 08 — бок Cusco). Заўважылі стацыянарны нумар накшталт (054) на шыльдзе крамы, школы ці гатэля — і рэгіён адразу вядомы.',
    riv: 'Назвы перуанскіх гарадоў рэдка ўтрымліваюць назву ракі, але дарогі ў Андах і Амазоніі ідуць далінамі: Callejón de Huaylas — гэта Santa, Свяшчэнная даліна (Valle Sagrado) — Urubamba, Carretera Central падымаецца ўздоўж Rímac. Вывучыце гарады кожнай даліны ад вытоку да вусця, потым выберыце «Размясціць гарады».',
  },
  credits:
    'Контуры рэгіёнаў і большасць рэчышчаў рэк: <a href="https://www.naturalearthdata.com/">Natural Earth</a> (грамадскі набытак); Callao паказаны разам з Lima Metropolitana. Тэлефонныя коды, гарады і гарады на рэках сабраныя з Вікіпедыі і гайдаў па GeoGuessr (гл. RESEARCH.md у рэпазіторыі). Каардынаты і рэчышчы прыблізныя і сабраныя для вучобы, а не для геадэзіі.',
  data: {
    // Zone names are region names and stay as in the data; descriptions list places.
    phoneZones: {
      '01': {
        description: 'Lima Metropolitana, Callao і правінцыі рэгіёна Lima (Huacho, Huaral, Barranca, Cañete)',
      },
      '041': { description: 'Amazonas (Chachapoyas, Bagua)' },
      '042': { description: 'San Martín (Moyobamba, Tarapoto, Juanjuí)' },
      '043': { description: 'Áncash (Huaraz, Chimbote, Callejón de Huaylas)' },
      '044': { description: 'La Libertad (Trujillo, Pacasmayo, Huamachuco)' },
      '051': { description: 'Puno (Puno, Juliaca, возера Titicaca)' },
      '052': { description: 'Tacna' },
      '053': { description: 'Moquegua (Moquegua, Ilo)' },
      '054': { description: 'Arequipa (Arequipa, Camaná, Mollendo)' },
      '056': { description: 'Ica (Ica, Chincha, Pisco, Nasca)' },
      '061': { description: 'Ucayali (Pucallpa)' },
      '062': { description: 'Huánuco (Huánuco, Tingo María)' },
      '063': { description: 'Pasco (Cerro de Pasco, Oxapampa)' },
      '064': { description: 'Junín (Huancayo, Tarma, La Oroya, Satipo)' },
      '065': { description: 'Loreto (Iquitos, Yurimaguas)' },
      '066': { description: 'Ayacucho (Ayacucho, Huanta, Puquio)' },
      '067': { description: 'Huancavelica' },
      '072': { description: 'Tumbes' },
      '073': { description: 'Piura (Piura, Sullana, Talara, Paita)' },
      '074': { description: 'Lambayeque (Chiclayo)' },
      '076': { description: 'Cajamarca (Cajamarca, Jaén, Chota)' },
      '082': { description: 'Madre de Dios (Puerto Maldonado)' },
      '083': { description: 'Apurímac (Abancay, Andahuaylas)' },
      '084': { description: 'Cusco (Cusco, Sicuani, Quillabamba)' },
    },
    rivers: {
      r0: { flowsInto: 'Атлантычны акіян (праз Бразілію)' },
      r1: { flowsInto: 'Marañón, утвараючы Amazonas каля Nauta' },
      r2: { flowsInto: 'Marañón' },
      r3: { flowsInto: 'Tambo, утвараючы Ucayali каля Atalaya' },
      r4: { flowsInto: pacific },
      r5: { flowsInto: `${pacific} каля Callao` },
    },
  },
};
