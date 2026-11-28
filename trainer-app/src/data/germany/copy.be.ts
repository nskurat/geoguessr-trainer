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
    'Землі, гарады, рэкі і заканчэнні назваў: вывучыце іх, а потым трэніруйцеся, пакуль не запомніце.',
  setLabels: {
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
    counted: { one: 'зямля', few: 'зямлі', many: 'зямель', other: 'зямлі' },
  },
  seatLabel: 'Сталіца',
  allAreas: 'Уся Германія',
  phoneHint: '',
  tips: {
    dep: 'Вывучайце па адным макрарэгіёне з фільтрам «Тэрыторыя», потым пераключыцеся на «Уся Германія». Чатыры макрарэгіёны — навучальная групоўка, а не афіцыйная: Nord, West, Süd і Ost; Ost — былая Усходняя Германія разам з Berlin — мае найвыразнейшыя прыкметы (назвы на -ow і -itz, тэлефонныя коды 03). Прывязвайце кожную зямлю да яе сталіцы. Тэлефонныя коды на шыльдах крам — хуткая праверка, хоць іх зоны не супадаюць з межамі зямель: 04 — поўнач, 08 — поўдзень Bayern, 09 — поўнач Bayern.',
    city: 'Пакрыццё шчыльнае ўсюды, таму вывучайце гарады па адным макрарэгіёне з фільтрам «Тэрыторыя», потым па ўсёй краіне. Дарожныя знакі паказваюць на наступны вялікі горад, таму ведайце, у які бок ляжыць кожны. Назвы меншых гарадоў з’яўляюцца пры павелічэнні.',
    riv: 'Назвы гарадоў часта ўтрымліваюць раку: Frankfurt am Main, Frankfurt (Oder), Halle (Saale), Limburg an der Lahn. Вывучайце раку з фільтрам «Рака», дзе яе гарады ідуць ад вытоку да вусця, потым выберыце «Размясціць гарады», каб ведаць, дзе на рацэ ляжыць кожны.',
    nom: 'Выберыце заканчэнне, каб убачыць яго арэал і прыклады. Галоўны падзел: -ow і -itz на былым славянскім усходзе супраць -ing у Altbayern і -ingen у Schwaben, а -heim ідзе ўздоўж Rhein ад Mainz да Karlsruhe; далей куткі: -büll і -by каля Даніі, -siel і -fehn у Ostfriesland, -weiler у Pfalz і Saarland, -leben і -rode вакол Harz. -dorf і -hausen ёсць усюды і нічога не кажуць.',
  },
  credits:
    'Контуры зямель і рэчышчы рэк: <a href="https://www.naturalearthdata.com/">Natural Earth</a> (грамадскі набытак). Каардынаты населеных пунктаў: <a href="https://www.geonames.org/">GeoNames</a>, ліцэнзія <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Гарады, рэкі і заканчэнні назваў сабраныя для вучобы (гл. RESEARCH.md у рэпазіторыі); каардынаты і рэчышчы прыблізныя, а не для геадэзіі.',
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
      r14: { flowsInto: 'Rhein каля Lahnstein' },
    },
    namePatterns: {
      p0: {
        where:
          'Былы славянскі ўсход за Elbe і Saale: -ow перш за ўсё ў Mecklenburg-Vorpommern і Brandenburg, -itz у Sachsen, Sachsen-Anhalt і на ўсходзе Thüringen',
        origin: 'Славянскія (палабскія і лужыцкія) назвы ў анямечанай форме: -ow і -in з прыметнікавых канчаткаў, -itz з -ice',
      },
      p1: {
        where: 'Altbayern: Oberbayern і Niederbayern, на ўсход ад Lech',
        origin: 'Баварскае -ing — «людзі такога»: паселішча, названае паводле заснавальніка',
      },
      p2: {
        where: 'Baden-Württemberg і баварская частка Schwaben на захад ад Lech; асобныя назвы ў іншых месцах (Göttingen, Solingen)',
        origin: 'Швабскае -ingen — «людзі такога»: паселішча, названае паводле заснавальніка',
      },
      p3: {
        where: 'Sachsen-Anhalt і поўнач Thüringen, вакол Harz і Magdeburger Börde',
        origin: 'Старое нямецкае leba — спадчына: маёнтак, пакінуты спадчынніку',
      },
      p4: {
        where: 'Harz (Niedersachsen, Sachsen-Anhalt) і Thüringen',
        origin: 'Сярэдневяковыя расчысткі ў лясах: roden — карчаваць',
      },
      p5: {
        where: 'Усход Niedersachsen (Braunschweig, Gifhorn), Hamburg і захад Holstein (Dithmarschen)',
        origin: 'Старое нямецкае butli — жытло',
      },
      p6: {
        where: 'Ostfriesland, куток Niedersachsen на Паўночным моры',
        origin: 'Фрызскія і мясцовыя нямецкія: siel — шлюз праз дамбу, fehn — калонія на тарфяным балоце',
      },
      p7: {
        where: 'Schleswig, крайняя поўнач Schleswig-Holstein да мяжы з Даніяй',
        origin: 'Дацкія: by і rup (torp) — вёска, büll (bøl) — сядзіба',
      },
      p8: {
        where: 'Eifel, Hunsrück і Westerwald (Rheinland-Pfalz), Bergisches Land і Sauerland (Nordrhein-Westfalen)',
        origin: 'Scheid — водападзел або памежны хрыбет',
      },
      p9: {
        where: 'Rheinland-Pfalz (Pfalz, Hunsrück, Eifel) і Saarland',
        origin: 'Лацінскае villare — хутар: галарымскія назвы паселішчаў',
      },
      p10: {
        where: 'Oberfranken і Oberpfalz (паўночны ўсход Bayern); -grün таксама ў Vogtland і Erzgebirge (Sachsen)',
        origin: 'Сярэдневяковыя расчысткі: reuth ад roden — карчаваць, grün — зялёная паляна',
      },
      p11: {
        where:
          'Абапал Rhein: Rheinhessen і Pfalz (Rheinland-Pfalz), поўнач Baden-Württemberg, поўдзень Hessen; таксама Unterfranken (Bayern)',
        origin: 'Франкскае heim — дом: паселішчы часоў франкскай каланізацыі, часта пасля асабовага імя',
      },
    },
    roadNetworks: {
      A: {
        label: 'Аўтабан',
        sign: 'Сіні шчыт з белым нумарам; нумар таксама стаіць першым на сініх знаках напрамку',
        rules: {
          odd: 'Няцотныя нумары ідуць пераважна з поўначы на поўдзень',
          even: 'Цотныя нумары ідуць пераважна з захаду на ўсход',
          trunk:
            'Аднаразрадныя нумары — доўгія магістралі: няцотныя растуць з захаду на ўсход, цотныя — з поўначы на поўдзень',
          band1: 'Нумары 10–19 — усход: Berlin, Brandenburg, Mecklenburg, Sachsen-Anhalt і Sachsen',
          band2: 'Нумары 20–29 — поўнач: Hamburg, Bremen, Schleswig-Holstein і ўзбярэжжы',
          band3: 'Нумары 30–39 — Niedersachsen і яго ваколіцы: Osnabrück, Bielefeld, Hannover, Braunschweig',
          band4: 'Нумары 40–49 — Ruhrgebiet, узгоркі на поўдзень ад яго і поўнач Hessen',
          band5: 'Нумары 50–59 — Niederrhein вакол Düsseldorf і Köln',
          band6: 'Нумары 60–69 — паўднёвы захад: Rhein-Main, Pfalz, Eifel і Saarland',
          band7: 'Нумары 70–79 — Thüringen, Franken і захад Sachsen',
          band8: 'Нумары 80–89 — Baden-Württemberg',
          band9: 'Нумары 90–99 — крайні поўдзень: поўдзень Bayern вакол München і мяжа са Швейцарыяй',
          ring: 'Кальцо вакол горада: захоўвае свой дыяпазон нумароў, але не мае напрамку',
          exception: 'Выключэнне: яго напрамак парушае правіла цотных і няцотных нумароў',
        },
      },
    },
  },
};
