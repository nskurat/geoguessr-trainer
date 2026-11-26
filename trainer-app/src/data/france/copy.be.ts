import type { CountryCopy } from '../../types/geo';

/*
 * France's interface text in Belarusian (official orthography). Place names stay in
 * their official French form, as on the map and on road signs; only the country name,
 * English exonyms and descriptive words are translated. Term choices and dictionary
 * checks: src/i18n/README.md.
 */

/** Where each river flows, by the English text in rivers.json. */
const into = {
  channel: 'Ла-Манш',
  atlantic: 'Атлантычны акіян',
  mediterranean: 'Міжземнае мора',
  northSea: 'Паўночнае мора',
  gironde: 'эстуарый Gironde',
};

export const copyBe: CountryCopy = {
  countryName: 'Францыя',
  subtitle:
    'Рэгіёны, дэпартаменты, гарады, рэкі, тэлефонныя зоны і заканчэнні назваў: вывучыце іх, а потым трэніруйцеся, пакуль не запомніце.',
  setLabels: {
    reg: 'Рэгіёны',
    dep: 'Дэпартаменты',
    city: 'Гарады',
    riv: 'Рэкі',
    tel: 'Тэлефонныя коды',
    nom: 'Заканчэнні назваў',
  },
  regionTerm: {
    one: 'Рэгіён',
    many: 'Рэгіёны',
    counted: { one: 'рэгіён', few: 'рэгіёны', many: 'рэгіёнаў', other: 'рэгіёна' },
  },
  departmentTerm: {
    one: 'Дэпартамент',
    many: 'Дэпартаменты',
    counted: { one: 'дэпартамент', few: 'дэпартаменты', many: 'дэпартаментаў', other: 'дэпартамента' },
  },
  seatLabel: 'Прэфектура',
  plateLabel: 'Нумарныя знакі заканчваюцца на',
  codeLabel: 'Нумар дэпартамента',
  credits:
    'Контуры дэпартаментаў: <a href="https://github.com/VictorCazanave/svg-maps/tree/master/packages/france.departments">France departments map</a>, аўтар Victor Cazanave (svg-maps), ліцэнзія <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Тэлефонныя зоны паводле табліцы французскіх тэлефонных кодаў у Вікіпедыі. Каардынаты, рэчышчы рэк і тыпы назваў прыблізныя і сабраныя для вучобы, а не для геадэзіі.',
  allAreas: 'Уся Францыя',
  phoneHint:
    'З 2023 года новы ці перанесены нумар можа захаваць любы прэфікс, але ў большасці фірмаў застаўся першапачатковы мясцовы нумар, таму на шыльдах гэта па-ранейшаму надзейная падказка.',
  tips: {
    reg: 'Пачніце з контуру: Bretagne і Normandie на паўночным захадзе, Grand Est уздоўж мяжы з Германіяй, Occitanie і PACA на поўдні. Потым трэніруйцеся, пакуль кожны рэгіён не стане зялёным з першай спробы.',
    dep: 'Вывучайце па адным рэгіёне з фільтрам «Тэрыторыя», потым пераключыцеся на «Уся Францыя». Для нумарных знакаў выберыце «Пытаць: Нумар»: дзве лічбы справа на французскім нумарным знаку — гэта дэпартамент.',
    tel: 'Вывучыце пяць зон, потым трэніруйце «Якая зона?» на асобных дэпартаментах: важныя менавіта межы (Allier, Cantal і Haute-Loire — 04; Aveyron — 05; узбярэжжа Languedoc — 04). Заўважылі стацыянарны нумар на шыльдзе крамы, фургоне ці білбордзе — і зона адразу вядомая.',
    nom: 'Выберыце заканчэнне, каб убачыць яго мясцовасць і прыклады. «Заканчэнне → мясцовасць» трэніруе самі мадэлі; «Сапраўдныя назвы» дае рэальныя населеныя пункты, якія трэба размясціць, — менавіта іх вы бачыце на дарожных знаках. Запомніце класічную тройку: адно лацінскае заканчэнне стала -y на поўначы, -é на захадзе і -ac на поўдні.',
    riv: 'Вывучайце раку з фільтрам «Рака»: ён набліжае раку і пералічвае яе гарады па парадку ад вытоку да вусця. Потым выберыце «Размясціць гарады». Назва накшталт Bar-sur-Seine падказвае раку, а вам трэба ведаць, у якім месцы на ёй стаіць горад.',
    city: 'З фільтрам «Тэрыторыя» вывучайце гарады аднаго рэгіёна, потым практыкуйцеся па ўсёй краіне. Назвы меншых гарадоў з’яўляюцца пры павелічэнні.',
  },
  data: {
    phoneZones: {
      '01': { description: 'Paris і дэпартаменты Île-de-France' },
      '02': { name: 'Паўночны захад', description: 'Bretagne, Normandie, Pays de la Loire, Centre-Val de Loire' },
      '03': { name: 'Паўночны ўсход', description: 'Hauts-de-France, Grand Est, Bourgogne-Franche-Comté' },
      '04': {
        name: 'Паўднёвы ўсход',
        description: 'Auvergne-Rhône-Alpes, PACA, Corse і лангедоцкая частка Occitanie (11, 30, 34, 48, 66)',
      },
      '05': { name: 'Паўднёвы захад', description: 'Nouvelle-Aquitaine і тулузская частка Occitanie' },
    },
    namePatterns: {
      p0: {
        where: 'Bretagne, пераважна захад (брэтонамоўная Ніжняя Брэтань)',
        origin: 'Брэтонскія словы: plou — парафія, ker — вёска, tré — хутар, lan — пустэльня, loc — святое месца',
      },
      p1: {
        where: 'Alsace і нямецкамоўны ўсход Moselle',
        origin: 'Германскія: heim — дом, weiler — хутар, dorf — вёска',
      },
      p2: { where: 'Moselle і поўнач Lorraine', origin: 'Германскія -ingen і -dorf, афранцужаныя ў -ange' },
      p3: {
        where: 'Французская Фландрыя (поўнач Nord і Pas-de-Calais)',
        origin: 'Фламандскія: hem — дом, beek — ручай, zele — жытло, kerk — царква',
      },
      p4: {
        where: 'Picardie, Champagne, Lorraine і Artois',
        origin: 'Маёнтак франкскай эпохі: court — сядзіба, звычайна пасля асабовага імя',
      },
      p5: {
        where: 'Перш за ўсё Normandie, а таксама Lorraine і поўнач',
        origin: 'Лацінскае villa, сельскі маёнтак; вельмі густа ў Normandie і Pays de Caux',
      },
      p6: {
        where: 'Île-de-France, Bourgogne, Champagne, Picardie',
        origin: 'Галарымскае -acum, якое на поўначы і ў цэнтры ператварылася ў -y',
      },
      p7: {
        where: 'Захад: Anjou, Maine, Touraine, усходняя Bretagne, Poitou',
        origin: 'Тое самае -acum, якое на захадзе ператварылася ў -é',
      },
      p8: {
        where: 'Паўднёвы захад і поўдзень цэнтра: Limousin, Périgord, Quercy, Auvergne, Charentes, Bordelais',
        origin: 'Тое самае -acum, якое ў аксітанскіх землях захавалася як -ac',
      },
      p9: {
        where: 'Lyonnais, Ain, Bugey, поўнач Isère, даліна Loire каля Saint-Étienne',
        origin: 'Тое самае -acum у франкаправансальскіх землях',
      },
      p10: {
        where: 'Savoie, Haute-Savoie, Pays de Gex',
        origin: 'Савойскае напісанне; апошняя літара звычайна не вымаўляецца',
      },
      p11: { where: 'Усходні Languedoc: Gard і Hérault', origin: 'Аксітанская форма лацінскага заканчэння -anicus' },
      p12: {
        where: 'Гасконь: Landes, Béarn, Bigorre, Gers, поўдзень Gironde',
        origin: 'Даларымскае аквітанскае заканчэнне, роднаснае баскскай мове',
      },
      p13: {
        label: 'tx, -berry, -guy (баскскія)',
        where: 'Французская Краіна Баскаў, захад Pyrénées-Atlantiques',
        origin: 'Баскскае напісанне: tx, berri — новы, itsas — мора',
      },
      p14: {
        label: '-o, -acciu (падобныя на італьянскія)',
        where: 'Corse',
        origin: 'Карсіканская мова, блізкая да таскана-італьянскай',
      },
      p15: { label: 'Ll-, -à (каталанскія)', where: 'Pyrénées-Orientales (Roussillon)', origin: 'Каталанскае напісанне' },
    },
    rivers: {
      r0: { flowsInto: into.channel },
      r1: { flowsInto: into.atlantic },
      r2: { flowsInto: into.mediterranean },
      r3: { flowsInto: into.gironde },
      r4: { flowsInto: into.gironde },
      r5: { flowsInto: 'Garonne' },
      r6: { flowsInto: 'Garonne' },
      r7: { flowsInto: into.northSea },
      r8: { flowsInto: 'Rhine' },
      r9: { flowsInto: into.northSea },
      r10: { flowsInto: 'Seine' },
      r11: { flowsInto: 'Seine' },
      r12: { flowsInto: 'Oise' },
      r13: { flowsInto: into.channel },
      r14: { flowsInto: 'Rhône' },
      r15: { flowsInto: 'Saône' },
      r16: { flowsInto: 'Loire' },
      r17: { flowsInto: 'Loire' },
      r18: { flowsInto: 'Loire' },
      r19: { flowsInto: into.atlantic },
      r20: { flowsInto: 'Seine' },
      r21: { flowsInto: 'Rhône' },
      r22: { flowsInto: 'Rhône' },
      r23: { flowsInto: into.atlantic },
      r24: { flowsInto: into.atlantic },
      r25: { flowsInto: 'Seine' },
      r26: { flowsInto: 'Seine' },
      r27: { flowsInto: 'Loire (пад назвай Maine)' },
      r28: { flowsInto: into.channel },
      r29: { flowsInto: into.mediterranean },
    },
  },
};
