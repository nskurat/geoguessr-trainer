import type { CountryCopy } from '../../types/geo';

/*
 * Poland's interface text in Belarusian (official orthography). Place and river names
 * stay in their official Polish form, as on the map and on signs; only the country
 * name, seas and descriptive words are translated. Term choices: src/i18n/README.md.
 */

const baltic = 'Балтыйскае мора';

export const copyBe: CountryCopy = {
  countryName: 'Польшча',
  subtitle:
    'Макрарэгіёны, ваяводствы, гарады, рэкі і заканчэнні назваў: вывучыце іх, а потым трэніруйцеся, пакуль не запомніце.',
  setLabels: {
    reg: 'Макрарэгіёны',
    dep: 'Ваяводствы',
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
    one: 'Ваяводства',
    many: 'Ваяводствы',
    counted: { one: 'ваяводства', few: 'ваяводствы', many: 'ваяводстваў', other: 'ваяводства' },
  },
  seatLabel: 'Цэнтр',
  plateLabel: 'Нумарныя знакі пачынаюцца з',
  allAreas: 'Уся Польшча',
  phoneHint: '',
  tips: {
    reg: 'Сем афіцыйных макрарэгіёнаў NUTS-1 — статыстычная групоўка ЕС, на знаках яе не ўбачыце, але яна суцэльная і лёгка правяраецца: Centralny (Łódzkie, Świętokrzyskie), Południowy (Małopolskie, Śląskie), Wschodni (Lubelskie, Podkarpackie, Podlaskie), Północno-Zachodni (Wielkopolskie, Zachodniopomorskie, Lubuskie), Południowo-Zachodni (Dolnośląskie, Opolskie), Północny (Pomorskie, Kujawsko-Pomorskie, Warmińsko-Mazurskie) і асобна Mazowieckie. Вывучыце іх першымі, а потым выкарыстоўвайце як фільтр «Тэрыторыя» для ўсяго астатняга.',
    dep: 'Вывучайце па адным макрарэгіёне з фільтрам «Тэрыторыя», потым пераключыцеся на «Уся Польшча». Прывязвайце кожнае ваяводства да яго цэнтра. Першая літара нумарнога знака — ваяводства (W — Warszawa і Mazowieckie, K — Kraków, G — Gdańsk, D — Wrocław, P — Poznań, S — Katowice): націсніце на ваяводства, каб убачыць яго літары. З 2022 года некаторыя ваяводствы выдаюць і другую літару, напрыклад A для Mazowieckie і J для Małopolskie, таму адной літары ўжо мала.',
    city: 'Пакрыццё шчыльнае ўсюды, таму вывучайце гарады па адным макрарэгіёне з фільтрам «Тэрыторыя», потым па ўсёй краіне. Дарожныя знакі паказваюць на наступны вялікі горад, таму ведайце, у які бок ляжыць кожны. Назвы меншых гарадоў з’яўляюцца пры павелічэнні. У двух ваяводствах па два цэнтры: Bydgoszcz і Toruń, Gorzów Wielkopolski і Zielona Góra.',
    riv: 'Wisła цячэ з Бяскідаў на поўдні праз Kraków, Warszawa і Toruń да Балтыйскага мора каля Gdańsk; Odra ідзе ўздоўж мяжы з Германіяй на захадзе; Bug і Narew працякаюць па ўсходзе. Вывучайце раку з фільтрам «Рака», дзе яе гарады ідуць ад вытоку да вусця, потым выберыце «Размясціць гарады», каб ведаць, дзе на рацэ ляжыць кожны.',
    nom: 'Выберыце заканчэнне, каб убачыць яго арэал і прыклады. -ice і -owice збіраюцца на паўднёвым захадзе (Śląsk, Opole, Dolny Śląsk, Małopolska), -ów ідзе праз поўдзень і ўсход і амаль не трапляецца на поўначы, а -owo і -ewo — адваротны выпадак: Pomorze, Kujawy, Mazury, Wielkopolska, але ніколі поўдзень. -ów — той самы славянскі суфікс, што -ow на ўсходзе Германіі.',
  },
  credits:
    'Контуры ваяводстваў і рэчышчы рэк: <a href="https://www.naturalearthdata.com/">Natural Earth</a> (грамадскі набытак). Каардынаты населеных пунктаў: <a href="https://www.geonames.org/">GeoNames</a>, ліцэнзія <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Гарады, рэкі і заканчэнні назваў сабраныя для вучобы (гл. RESEARCH.md у рэпазіторыі); каардынаты і рэчышчы прыблізныя, а не для геадэзіі.',
  data: {
    namePatterns: {
      p0: {
        where:
          'Паўднёвы захад: Śląsk, Opole, Dolny Śląsk, поўдзень Łódź і Małopolska, а таксама невялікі арэал у Pomorze Zachodnie',
        origin:
          'Славянскія канчаткі множнага ліку, якімі называлі пасяленне па яго людзях («людзі …»); -owice — гэта -ice, дададзенае да асабовага імя',
      },
      p1: {
        where:
          'Поўдзень і ўсход: Świętokrzyskie, Łódź, Lublin, Dolny Śląsk, Opole, Mazowsze і Śląsk; на поўначы амаль не трапляецца',
        origin:
          'Славянскі прыналежны канчатак, «(месца) …»: Kraków — «горад Крака»; той самы суфікс, што -ow на ўсходзе Германіі',
      },
      p2: {
        where:
          'Поўнач і захад: Pomorze, Kujawy, Warmia і Mazury, Wielkopolska і Pomorze Zachodnie; на поўдні ніколі',
        origin: 'Ніякая форма таго ж прыналежнага канчатка: «(месца) …»; -ewo стаіць пасля мяккіх зычных',
      },
    },
    rivers: {
      r0: { flowsInto: `${baltic} каля Gdańsk` },
      r1: { flowsInto: `${baltic} каля Świnoujście` },
      r2: { flowsInto: 'Odra каля Kostrzyn nad Odrą' },
      r3: { flowsInto: 'Narew каля Serock' },
      r4: { flowsInto: 'Wisła каля Modlin, ніжэй за Serock' },
      r5: { flowsInto: 'Wisła каля Sandomierz' },
      r6: { flowsInto: 'Warta каля Santok' },
      r7: { flowsInto: 'Wisła каля Warka' },
      r8: { flowsInto: 'Wisła каля Opatowiec' },
      r9: { flowsInto: 'Odra каля Krosno Odrzańskie' },
    },
  },
};
