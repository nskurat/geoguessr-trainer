/*
 * Browser smoke test for the built site: `npm run build && npm run smoke -- [country…] [options]`.
 *
 * For every country (default: all in trainer-app/src/data/countries.ts) and interface
 * language, it serves dist/ at its real sub-path and, with Playwright Chromium:
 *   - opens Learn mode for each offered study set and records a text snapshot of the page
 *     (prompt, visible map labels): deterministic, so two builds can be compared;
 *   - plays a short Practice round of every question kind of every set, answering at random
 *     (seeded), and fails on any page error.
 *
 * Options:
 *   --shots              also save screenshots (desktop 1280 light, phone 390 dark) to
 *                        .cache/smoke/<country>/ (git-ignored)
 *   --snapshot <file>    write the Learn-mode text snapshot to <file> (JSON)
 *   --compare <file>     compare against a snapshot written earlier, e.g. from a main build,
 *                        and fail on differences: proves a change left other countries alone
 *
 * Chromium: uses $PLAYWRIGHT_CHROMIUM or /opt/pw-browsers/chromium when present (Claude Code
 * cloud sessions), otherwise Playwright's own browser (`npx playwright install chromium`).
 */
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { extname, join, normalize, resolve } from 'node:path';
import { chromium, devices, type Browser } from 'playwright';
import { COUNTRIES } from '../trainer-app/src/data/countries';
import type { StudySet } from '../trainer-app/src/types/trainer';
import { LANGS } from '../trainer-app/src/types/i18n';

const BASE = '/geoguessr-trainer/';
const DIST = resolve('dist');
const KINDS: Record<StudySet, string[]> = {
  reg: ['find', 'name'],
  dep: ['find', 'name'],
  city: ['find', 'name', 'dot'],
  riv: ['find', 'name', 'town'],
  tel: ['find', 'name'],
  nom: ['find', 'name', 'town'],
};
const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const option = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const optionValues = new Set([option('--snapshot'), option('--compare')]);
const wanted = args.filter((a) => !a.startsWith('--') && !optionValues.has(a));

/** Serves dist/ under BASE, like GitHub Pages. */
function serve(): Promise<{ url: string; close: () => void }> {
  if (!existsSync(join(DIST, 'index.html'))) throw new Error('No dist/: run `npm run build` first.');
  const server = createServer((req, res) => {
    const path = decodeURIComponent((req.url ?? '/').split('?')[0]);
    if (!path.startsWith(BASE)) {
      res.writeHead(404).end();
      return;
    }
    let file = normalize(join(DIST, path.slice(BASE.length)));
    if (!file.startsWith(DIST)) {
      res.writeHead(403).end();
      return;
    }
    if (!existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html');
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  return new Promise((ok) =>
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo;
      ok({ url: `http://127.0.0.1:${port}${BASE}`, close: () => server.close() });
    }),
  );
}

function launch(): Promise<Browser> {
  const path = process.env.PLAYWRIGHT_CHROMIUM ?? '/opt/pw-browsers/chromium';
  return chromium.launch(existsSync(path) ? { executablePath: path } : {});
}

/**
 * Learn-mode text snapshot, run in the page. A string, not a function: tsx would inject
 * helpers (`__name`) into a function that do not exist in the browser.
 */
const SNAPSHOT_SCRIPT = `(() => {
  const visible = (e) => getComputedStyle(e).display !== 'none' && e.style.display !== 'none';
  const texts = (sel) => [...document.querySelectorAll(sel)].filter(visible).map((e) => e.textContent.trim());
  return {
    prompt: document.querySelector('#prompt').textContent.replace(/\\s+/g, ' ').trim(),
    labels: texts('#labD text, #labR text, #rvl text, #zl text, #lp text'),
    dots: [...document.querySelectorAll('#cty g, #tw g')].filter(visible).length,
  };
})()`;

/** Seeds Math.random in the page so practice rounds are repeatable. */
const SEED_SCRIPT = `(() => { let s = 42; Math.random = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296); })()`;

async function main(): Promise<void> {
  const countries = COUNTRIES.filter((c) => !wanted.length || wanted.includes(c.id));
  if (!countries.length) throw new Error(`Unknown country: ${wanted.join(', ')}`);
  const site = await serve();
  const browser = await launch();
  const errors: string[] = [];
  const snapshot: Record<string, unknown> = {};

  try {
    for (const entry of countries) {
      const country = await entry.load();
      const shotsDir = join('.cache', 'smoke', country.id);
      if (flag('--shots')) mkdirSync(shotsDir, { recursive: true });
      const key = `geotrainer_${country.id}_settings`;

      for (const lang of LANGS) {
        const url = `${site.url}?country=${country.id}&lang=${lang}`;

        // Learn mode: snapshot and screenshots.
        for (const set of country.sets) {
          const views = flag('--shots')
            ? ([
                ['desktop', { viewport: { width: 1280, height: 900 }, colorScheme: 'light' as const }],
                ['phone', { ...devices['iPhone 13'], colorScheme: 'dark' as const }],
              ] as const)
            : ([['desktop', { viewport: { width: 1280, height: 900 } }]] as const);
          for (const [view, contextOptions] of views) {
            const context = await browser.newContext(contextOptions);
            const page = await context.newPage();
            page.on('pageerror', (e) => errors.push(`${country.id}/${lang}/${set}/learn: ${e.message}`));
            await page.addInitScript(
              ([k, v]) => {
                localStorage.clear();
                localStorage.setItem(k, v);
              },
              [key, JSON.stringify({ set, mode: 'learn' })] as const,
            );
            await page.goto(url);
            await page.waitForFunction(() => document.querySelector<HTMLElement>('#msg')?.style.display === 'none');
            await page.waitForTimeout(300);
            const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
            const width = page.viewportSize()?.width ?? 0;
            if (scrollWidth > width) errors.push(`${country.id}/${lang}/${set}/${view}: horizontal scroll`);
            if (view === 'desktop') {
              const footer = page.locator('#credits');
              if (!(await footer.isVisible()) || (await footer.innerHTML()) !== country.copy[lang].credits) {
                errors.push(`${country.id}/${lang}/${set}: missing or incorrect footer attribution`);
              }
              snapshot[`${country.id}/${lang}/${set}`] = await page.evaluate(SNAPSHOT_SCRIPT);
            }
            if (flag('--shots')) await page.screenshot({ path: join(shotsDir, `${set}-${lang}-${view}.png`) });
            await context.close();
          }
        }

        // Practice: every kind of every set, a few random answers each.
        const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
        await context.addInitScript(SEED_SCRIPT);
        for (const set of country.sets) {
          for (const kind of KINDS[set]) {
            const page = await context.newPage();
            page.on('pageerror', (e) => errors.push(`${country.id}/${lang}/${set}/${kind}: ${e.message}`));
            await page.addInitScript(
              ([k, v]) => localStorage.setItem(k, v),
              [key, JSON.stringify({ set, mode: 'practice', kind, size: '10' })] as const,
            );
            await page.goto(url);
            await page.waitForFunction(() => document.querySelector<HTMLElement>('#msg')?.style.display === 'none');
            const box = (await page.locator('#map').boundingBox())!;
            for (let i = 0; i < 10; i++) {
              if (kind === 'name') await page.keyboard.press(String(1 + (i % 4)));
              else
                await page.mouse.click(
                  box.x + box.width * (0.3 + ((i * 37) % 40) / 100),
                  box.y + box.height * (0.25 + ((i * 53) % 50) / 100),
                );
              if (await page.locator('#nextBtn').count()) await page.keyboard.press('Enter');
              await page.waitForTimeout(80);
            }
            await page.close();
          }
        }
        await context.close();
        console.log(`${country.id} (${lang}): ${country.sets.join(', ')} checked`);
      }
    }
  } finally {
    await browser.close();
    site.close();
  }

  const snapshotFile = option('--snapshot');
  if (snapshotFile) writeFileSync(snapshotFile, JSON.stringify(snapshot, null, 2) + '\n');
  const compareFile = option('--compare');
  if (compareFile) {
    const before = JSON.parse(readFileSync(compareFile, 'utf8')) as Record<string, unknown>;
    for (const [k, v] of Object.entries(before)) {
      if (!(k in snapshot)) continue; // a country not checked this run
      if (JSON.stringify(v) !== JSON.stringify(snapshot[k])) errors.push(`${k}: Learn snapshot differs from ${compareFile}`);
    }
  }

  if (errors.length) {
    console.error(`\n${errors.length} problem(s):\n- ${errors.join('\n- ')}`);
    process.exit(1);
  }
  console.log('\nSmoke test passed.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
