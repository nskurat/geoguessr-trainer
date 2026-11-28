# Licensing policy for content

The code is MIT (`LICENSE`). Everything bundled with the site (outlines, data, images,
fonts, text) is redistributed from a public repository, so it must allow that **without
adding terms beyond MIT**, and every credit it requires must be shown. Agents and humans
follow this policy for every new asset or data source; when in doubt, leave it out and ask
the owner on the issue or PR.

## Allowed

| Licence | Use | Obligation |
|---|---|---|
| Public domain, CC0 | Freely (e.g. Natural Earth) | Credit anyway as good practice |
| CC BY 4.0 | Data, outlines, images (e.g. GeoNames, `@svg-maps`) | Credit line in the footer credits (`copy.<lang>.ts` `credits`) and, for images, beside the image |
| MIT, ISC, BSD, Apache-2.0 | npm packages and assets | Keep the copyright and licence notice with the asset |
| OFL (SIL Open Font License) | Fonts | Keep the font's licence notice |
| Our own work | Hand-drawn zones, drawings, research notes | Record the author and source in the country's `RESEARCH.md` |

## Not allowed

- **Google Street View and Google Maps** imagery and data, including screenshots and traced
  shapes. Same for other commercial maps (Apple, Bing, Yandex, Mapy.cz).
- **NC** (non-commercial) or **ND** (no derivatives) licences of any kind.
- Anything **without a clear licence**: images from guides (plonkit, geohints), blogs, search
  results, Reddit, YouTube stills. "Found on the web" is not a licence.
- **Share-alike** content bundled in the repo: CC BY-SA (most Wikipedia text, many Wikimedia
  Commons files) and ODbL (OpenStreetMap data). Share-alike adds terms beyond MIT, so it
  needs the owner's explicit approval per item, recorded in the PR and in `RESEARCH.md`.
- GPL / LGPL / AGPL code or assets.

## Facts versus expression

Facts are not copyrightable: a city's coordinates, a river's length, which area code belongs
to which town, which region a plate letter stands for. Guides and Wikipedia are fine as
**references** for facts, cited in `RESEARCH.md`. Do not copy their **expression**: prose,
tips written in someone else's words, tables copied wholesale, their images or their maps.
Write tips in our own words, and build geometry from allowed data (Natural Earth, `@svg-maps`)
or draw it yourself from several sources, never by tracing one copyrighted map.

## Wikimedia Commons

Commons hosts files under many licences; Commons itself is not a licence. Check each file's
page: CC0 / public domain / CC BY are allowed; CC BY-SA, GFDL and "fair use" are not without
owner approval. Record the file page URL, author, licence and any changes you made.

## Recording and checking

- Every source goes in the country's `RESEARCH.md` with its URL, licence and the date checked.
- Every required credit goes in `copy.<lang>.ts` `credits` for each interface language, and
  existing credit lines are never removed while the asset is used (AGENTS.md "Constraints").
- Images (when the trainer gets them, see `docs/specs/visual-meta.md`) carry `source`,
  `author`, `licence`, `url` and `changes` in the data, checked by `npm run validate:data`;
  the licence must be one of the allowed ones above.
- A new npm dependency: check its licence (`npm view <pkg> license`) before adding it.
- Reviewers (`review-agent-pr`) check this policy for every new asset or data source.
