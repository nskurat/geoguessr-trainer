# Interface languages

How the interface is translated, and the checks behind the Belarusian wording. The
structure is summarised in `AGENTS.md` ("Interface languages"); this file is for
translators and reviewers.

## Files

| What | Where |
|---|---|
| Interface strings, English (source of truth, defines every key) | `en.ts` |
| Interface strings, Belarusian (typed `Messages`: a missing key fails `npm run typecheck`) | `be.ts` |
| Active language, `t()` / `th()`, `localizeStatic()` for `data-i18n` in `index.html` | `index.ts` |
| Plural selection, interpolation, language negotiation (pure, tested) | `services/i18n/` |
| Country text per language: title, set labels, terms, tips, credits, data text | `data/<country>/copy.<lang>.ts` |

Messages use `{param}` placeholders. A message whose wording depends on a number is an
object of CLDR plural forms chosen by `count` (`Intl.PluralRules`): Belarusian needs
`one` (1, 21, 31…), `few` (2–4, 22–24…), `many` (0, 5–20, 25…) and `other` (fractions).
Keys used with `th()` are trusted HTML (`<b>`, `<span>` only); their parameters are escaped.

## Belarusian conventions

- **Orthography:** the official one (наркамаўка, the 2008 rules), as in the
  dictionaries below. Taraškievica (класічны правапіс: дэпартамэнт, ідэнтычнасьць) would
  be a separate language variant, `be-tarask` (backlog).
- Letters: і, ў (also at word starts after a vowel: «націсніце ў», «Паўночны ўсход»);
  apostrophe ’ (U+2019: аб’ект, з’яўляюцца); quotes «ёлачкі»; dash —.
- **Place names are not translated.** Départements, cities, rivers, Peruvian regions and
  macro-regions keep their official form in Latin script, as on the map and on road signs
  (Bretagne, Loire, Cusco, Norte). Only country names (Францыя, Перу), seas and oceans
  (Ла-Манш, Ціхі акіян), and English exonyms in descriptions (Гасконь, Французская
  Фландрыя, Ніжняя Брэтань, Свяшчэнная даліна) are Belarusian. Latin-script names are
  treated as indeclinable: «упадае ў Loire».
- Country terms (`{term}`, from the country's copy) appear only where the accusative equals
  the nominative (masculine inanimate: рэгіён, дэпартамент, макрарэгіён). "The blue X" is
  rendered «Сінім на карце» to avoid adjective agreement. A future country with a feminine
  term needs case forms in `Term` (backlog).
- Counts after numerals use `Term.counted`: 1 дэпартамент, 3 дэпартаменты, 13
  дэпартаментаў. Ordinals: «з 2-й спробы» (= другой).
- UI labels quoted in tips must match the controls: «Тэрыторыя», «Рака», «Пытаць: Нумар»,
  «Якая зона?», «Размясціць гарады», «Заканчэнне → мясцовасць», «Сапраўдныя назвы».

## Terms and dictionary checks

Sources: [skarnik.by](https://www.skarnik.by) (Russian–Belarusian), [slounik.org](https://slounik.org)
(Граматычны слоўнік назоўніка 2013, Слоўнік беларускай мовы), [be.wikipedia.org](https://be.wikipedia.org)
(article titles), checked November 2026.

| English | Belarusian | Source |
|---|---|---|
| map trainer | трэнажор па карце | skarnik: тренажёр → трэнажор (м.); slounik: трэнажор, -ра |
| region (France, Peru) | рэгіён, мн. рэгіёны, Р. мн. рэгіёнаў | be.wikipedia «Рэгіёны Францыі»; slounik граматычны |
| département | дэпартамент, мн. дэпартаменты, Р. мн. дэпартаментаў | be.wikipedia «Дэпартаменты Францыі»; slounik граматычны |
| macro-region | макрарэгіён (declined like рэгіён) | not in the dictionaries; regular compound макра- + рэгіён |
| prefecture | прэфектура | skarnik: префектура → прэфектура |
| capital (Peru, region centre) | сталіца; адміністрацыйны цэнтр (regions in the info card) | be.wikipedia usage for French régions |
| round | раўнд, Р. раўнда, М. у раўндзе | skarnik: раунд → раўнд; slounik граматычны |
| spaced repetition | інтэрвальнае паўтарэнне | skarnik: интервал → інтэрвал, повторение → паўтарэнне (no entry for the phrase, no be.wikipedia article) |
| progress | прагрэс | skarnik |
| try, attempt | спроба | skarnik: попытка → спроба |
| miss | промах | skarnik: промах → промах |
| target (distance question) | цэль | skarnik: цель (мишень) → цэль; мэта is "goal", not a target on a map |
| landline | стацыянарны нумар | skarnik: стационарный → стацыянарны |
| phone code, prefix | тэлефонны код; прэфікс (м., Р. прэфікса) | skarnik/slounik: префикс → прэфікс |
| area (locality), Area filter | мясцовасць; «Тэрыторыя» | skarnik: местность → мясцовасць, территория → тэрыторыя |
| place-name ending | заканчэнне (назвы) | slounik/skarnik: заканчэнне; канчатак is the grammatical inflection, wrong for -ac or -ville |
| (shop) sign | шыльда | skarnik: вывеска → шыльда |
| hint, clue | падказка | slounik |
| map labels | подпісы | skarnik: подпись → подпіс (м.) |
| zoom, scale | маштаб | skarnik |
| drag, scroll, blink | перацягваць, пракручваць, мігаць | skarnik |
| highlighted | вылучаны (not выдзелены) | skarnik: выделять (отбирать) → вылучаць |
| river; on the river | рака, мн. рэкі; на рацэ | standard |
| source, mouth | выток, вусце | skarnik: исток → выток, устье → вусце |
| estuary | эстуарый | be.wikipedia «Эстуарый» |
| valley | даліна | skarnik: долина → даліна |
| coverage (Street View) | пакрыццё | slounik |
| public domain | грамадскі набытак | be.wikipedia «Грамадскі набытак»; skarnik: общественное достояние |
| Mediterranean, North Sea, Pacific, Atlantic, Channel | Міжземнае мора, Паўночнае мора, Ціхі акіян, Атлантычны акіян, Ла-Манш | be.wikipedia article titles |
| Franco-Provençal | франкаправансальскі | be.wikipedia «Франкаправансальская мова» |
| Gascony, Flanders | Гасконь, Фландрыя | be.wikipedia |
| France, Peru | Францыя; Перу (indeclinable, neuter: «Усё Перу») | be.wikipedia «Перу» |

## The language switch (UX)

Decided with the `ux-expert` skill:

- **Placement:** the Country and Language pickers are app preferences, not study controls,
  so they sit together in the top-right corner of the header, as labelled selects like the
  rest of the bar; the title is plain text again. On phones (≤ 600 px) they are the first
  row of the page (country left, language right, 40 px tall) with their visible labels
  hidden (still the accessible names). Languages are listed by their own names (English,
  Беларуская), so anyone can find theirs.
  Rejected: the country name in the title as a picker (a weak affordance that read as a
  broken heading, and it split the Belarusian «Францыя:» from its colon); the language
  picker in the study bar (mixed with study controls, below the sets); an EN/BE segmented
  toggle (does not scale to more languages).
- **Behaviour:** switching re-renders in place: the map, settings and the round in
  progress are kept (place names do not change). The Country picker still reloads and
  keeps `?lang`.
- **Choice order:** `?lang=` → saved choice (`localStorage geotrainer_lang`, global, not per
  country) → `navigator.languages` → English. Russian does not fall back to Belarusian.
  Picking a language saves it and writes `?lang=` (history.replaceState) so reloads and
  shared links keep it.
- **Document:** `<html lang>`, the page title and the map's aria-label follow the language.
- **Type:** Archivo has no Cyrillic, so `Golos Text` is the per-glyph fallback (Google
  Fonts serves its Cyrillic subset only when Cyrillic is on the page). Light and dark
  themes are unchanged (no new colours).
