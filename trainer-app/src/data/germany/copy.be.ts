import type { CountryCopy } from '../../types/geo';

/*
 * Germany's interface text in Belarusian (official orthography). Place and river names
 * stay in their official German form, as on the map and on signs; only the country
 * name, seas and descriptive words are translated. Term choices: src/i18n/README.md.
 */

const northSea = 'Паўночнае мора';

export const copyBe: CountryCopy = {
  countryName: 'Германія',
  subtitle:
    'Макрарэгіёны, землі, гарады, рэкі і заканчэнні назваў: вывучыце іх, а потым трэніруйцеся, пакуль не запомніце.',
  setLabels: {
    reg: 'Макрарэгіёны',
    dep: 'Землі',
    city: 'Гарады',
    riv: 'Рэкі',
    nom: 'Заканчэнні назваў',
  },
  regionTerm: {
    one: 'Макрарэгіён',
    many: 'Макрарэгіёны',
    counted: { one: 'макрарэгіён', few: 'макрарэгіёны', many: 'макрарэгіёнаў', other: 'макрарэгіёна' },
  },
  departmentTerm: {
    one: 'Зямля',
    many: 'Землі',
    counted: { one: 'зямля', few: 'зямлі', many: 'земляў', other: 'зямлі' },
  },
  seatLabel: 'Сталіца',
  allAreas: 'Уся Германія',
  phoneHint: '',
  tips: {
    reg: 'Гэта навучальная групоўка, а не афіцыйная: Nord (узбярэжжа Паўночнага мора, Hamburg і Niedersachsen), West (Рэйнская вобласць, Рур, Hessen і Saarland), Süd (Baden-Württemberg і Bayern) і Ost — былая ГДР разам з Berlin. Вывучыце яе першай, а потым выкарыстоўвайце як фільтр «Тэрыторыя» для ўсяго астатняга.',
    dep: 'Вывучайце па адным макрарэгіёне з фільтрам «Тэрыторыя», потым пераключыцеся на «Уся Германія». Прывязвайце кожную зямлю да яе сталіцы. Тэлефонныя коды на шыльдах крам — хуткая праверка, хоць іх зоны не супадаюць з межамі земляў: 03 — усход, 04 — поўнач, 08 — поўдзень Bayern, 09 — поўнач Bayern.',
    city: 'Пакрыццё шчыльнае паўсюль, таму вывучайце гарады па адным макрарэгіёне з фільтрам «Тэрыторыя», потым па ўсёй краіне. Дарожныя знакі паказваюць на наступны вялікі горад, таму ведайце, у які бок ляжыць кожны. Назвы меншых гарадоў з’яўляюцца пры павелічэнні.',
    riv: 'Назвы гарадоў часта ўтрымліваюць раку: Frankfurt am Main, Frankfurt (Oder), Halle (Saale), Mülheim an der Ruhr. Вывучайце раку з фільтрам «Рака», дзе яе гарады ідуць ад вытоку да вусця, потым выберыце «Размясціць гарады», каб ведаць, дзе на рацэ ляжыць кожны.',
    nom: 'Выберыце заканчэнне, каб убачыць яго арэал і прыклады. Галоўны падзел: -ow і -itz на былым славянскім усходзе супраць -ing у Старой Баварыі і -ingen у Швабіі; далей куткі: -büll і -by каля Даніі, -siel і -fehn ва Усходняй Фрысландыі, -weiler у Пфальцы і Saarland, -leben і -rode вакол Гарца. -dorf і -hausen ёсць паўсюль і нічога не кажуць.',
  },
  credits:
    'Контуры земляў і рэчышчы рэк: <a href="https://www.naturalearthdata.com/">Natural Earth</a> (грамадскі набытак). Каардынаты населеных пунктаў: <a href="https://www.geonames.org/">GeoNames</a>, ліцэнзія <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Гарады, рэкі і заканчэнні назваў сабраныя для вучобы (гл. RESEARCH.md у рэпазіторыі); каардынаты і рэчышчы прыблізныя, а не для геадэзіі.',
  data: {
    rivers: {
      r0: { flowsInto: `${northSea} (праз Нідэрланды)` },
      r1: { flowsInto: 'Чорнае мора' },
      r2: { flowsInto: `${northSea} каля Cuxhaven` },
      r3: { flowsInto: 'Rhein каля Mainz' },
      r4: { flowsInto: `${northSea} каля Bremerhaven` },
      r5: { flowsInto: 'Rhein каля Koblenz' },
      r6: { flowsInto: 'Rhein каля Mannheim' },
      r7: { flowsInto: 'Балтыйскае мора' },
      r8: { flowsInto: 'Elbe каля Barby' },
      r9: { flowsInto: 'Donau каля Deggendorf' },
      r10: { flowsInto: 'Havel у Berlin-Spandau' },
      r11: { flowsInto: 'Rhein каля Duisburg' },
      r12: { flowsInto: `${northSea} каля Emden` },
      r13: { flowsInto: 'Donau каля Passau' },
    },
    namePatterns: {
      p0: {
        where:
          'Былы славянскі ўсход за Elbe і Saale: -ow перш за ўсё ў Mecklenburg-Vorpommern і Brandenburg, -itz у Sachsen, Sachsen-Anhalt і на ўсходзе Thüringen',
        origin: 'Славянскія (палабскія і лужыцкія) назвы ў анямечанай форме: -ow і -in з прыметнікавых канчаткаў, -itz з -ice',
      },
      p1: {
        where: 'Старая Баварыя: Oberbayern і Niederbayern, на ўсход ад Lech',
        origin: 'Баварскае -ing — «людзі такога»: паселішча, названае паводле заснавальніка',
      },
      p2: {
        where: 'Baden-Württemberg і баварская Швабія на захад ад Lech; асобныя назвы ў іншых месцах (Göttingen, Solingen)',
        origin: 'Алеманскае -ingen — «людзі такога»: паселішча, названае паводле заснавальніка',
      },
      p3: {
        where: 'Sachsen-Anhalt і поўнач Thüringen, вакол Гарца і Магдэбургскай Бёрдэ',
        origin: 'Старасаксонскае і цюрынгскае leba — спадчына: маёнтак, пакінуты спадчынніку',
      },
      p4: {
        where: 'Гарц (Niedersachsen, Sachsen-Anhalt) і Thüringen',
        origin: 'Сярэднявечныя расчысткі ў лясах: roden — карчаваць',
      },
      p5: {
        where: 'Усход Niedersachsen (Braunschweig, Gifhorn), Hamburg і захад Гольштэйна (Dithmarschen)',
        origin: 'Старасаксонскае butli — жытло',
      },
      p6: {
        where: 'Усходняя Фрысландыя, паўночна-марскі куток Niedersachsen',
        origin: 'Фрызскія і ніжненямецкія: siel — шлюз праз дамбу, fehn — калонія на тарфяным балоце',
      },
      p7: {
        where: 'Шлезвіг, крайняя поўнач Schleswig-Holstein да мяжы з Даніяй',
        origin: 'Дацкія: by і rup (torp) — вёска, büll (bøl) — сядзіба',
      },
      p8: {
        where: 'Айфель, Хунсрук і Вестэрвальд (Rheinland-Pfalz), Бергішэс-Ланд і Заўэрланд (Nordrhein-Westfalen)',
        origin: 'Scheid — водападзел або памежны хрыбет',
      },
      p9: {
        where: 'Rheinland-Pfalz (Пфальц, Хунсрук, Айфель) і Saarland',
        origin: 'Лацінскае villare — хутар: галарымскія назвы паселішчаў',
      },
      p10: {
        where: 'Верхняя Франконія і Верхні Пфальц (паўночны ўсход Bayern); -grün таксама ў Фогтландзе і Рудных гарах (Sachsen)',
        origin: 'Сярэднявечныя расчысткі: reuth ад roden — карчаваць, grün — зялёная паляна',
      },
    },
  },
};
