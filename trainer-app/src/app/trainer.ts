/*
 * The trainer UI: map rendering, pan and zoom, the control bar, the practice
 * flow and the side panel. This is the original artifact's imperative DOM/SVG
 * code, typed and wired to the tested services; the planned React port splits
 * it into components (docs/backlog.md). Behaviour should stay identical to the
 * artifact until then.
 *
 * Item ids, by study set:
 *   reg  region key ("BRE")        dep  department code ("29")
 *   city "c<n>"                     riv  river "r<n>"; river towns "t<n>"
 *   nom  pattern "p<n>"; towns "n<n>"
 *   tel  "Z<zone>_<copy>" for find-the-zone questions (each zone asked 3 times),
 *        "z<zone>" for zone answer choices, department codes otherwise.
 */
import { t, termFor, th } from '../i18n';
import { en, type MessageKey } from '../i18n/en';
import type { CountryIndex } from '../services/country/countryIndex';
import {
  fitProjection,
  haversineKm,
  projectionFromAffine,
  type Projection,
} from '../services/geo/projection';
import { pickChoices, pickPatternChoices } from '../services/practice/distractors';
import { createRound, recordOutcome, type RoundState } from '../services/practice/round';
import {
  CITY_DISTANCE_BANDS,
  RIVER_TOWN_DISTANCE_BANDS,
  distanceOutcome,
  isMiss,
} from '../services/practice/scoring';
import { normalizeSettings, type Settings } from '../services/practice/settings';
import {
  pickRound,
  progressStats,
  recordAnswer,
  type ProgressRecords,
} from '../services/practice/spacedRepetition';
import type { TrainerStorage } from '../services/storage/trainerStorage';
import type { Point } from '../types/geo';
import type { Outcome, QuestionKind, StudySet } from '../types/trainer';
import { escapeHtml as esc } from '../utils/html';
import { smoothPath } from '../utils/svgPath';

/* ---------- DOM ---------- */

function $<T extends Element = HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Missing element ${selector}`);
  return el;
}
const children = (parent: Element) => [...parent.children] as SVGGraphicsElement[];

const svg = $<SVGSVGElement>('#map');
const land = $<SVGGElement>('#land');
const depLabels = $<SVGGElement>('#labD');
const regionLabels = $<SVGGElement>('#labR');
const cityLayer = $<SVGGElement>('#cty');
const effects = $<SVGGElement>('#fx');
const riverLayer = $<SVGGElement>('#riv');
const riverLabels = $<SVGGElement>('#rvl');
const riverTownLayer = $<SVGGElement>('#tw');
const zoneLabels = $<SVGGElement>('#zl');
const nameTownLayer = $<SVGGElement>('#nx');
const prefixLabels = $<SVGGElement>('#lp');
const tip = $('#tip');

/** Map colours of the four outcomes: first try, second, third, missed. */
const OUTCOME_COLORS = ['var(--ok)', 'var(--y)', 'var(--or)', 'var(--red)'];

/** Heading of a study set, from the country's copy. */
const setLabel = (set: StudySet) => ix.copy.setLabels[set] ?? set;

/** Label of a question-type button: a set-specific one (`kind.tel.find`) or the default (`kind.find`). */
function kindLabel(set: StudySet, kind: QuestionKind): string {
  const specific = `kind.${set}.${kind}`;
  return t((specific in en ? specific : `kind.${kind}`) as MessageKey);
}

/* ---------- state ---------- */

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
}
interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface Feedback {
  text: string;
  tone: 'ok' | 'mid' | 'no';
}
interface PracticeRound extends RoundState {
  current: string | null;
  /** The item last asked, kept on screen while the next one is scheduled. */
  last: string | null;
  tries: number;
  /** Three wrong taps: the answer blinks and must be tapped to continue. */
  locked: boolean;
  /** Answered; waiting for the user (or a timer) to move on. */
  waiting: boolean;
  wrong: string[];
  feedback: Feedback | null;
  /** Bumped per question, so stale timers do nothing. */
  seq: number;
  askBy: 'num' | 'name';
  choices: string[] | null;
  outcome: Outcome;
  distanceKm: number;
}

let ix: CountryIndex;
let storage: TrainerStorage;
let settings: Settings;
let progress: ProgressRecords = {};

let projection: Projection | null = null;
let depPaths: SVGPathElement[] = [];
const pathByCode: Record<string, SVGPathElement> = {};
const boxes: Record<string, Box> = {};
const regionCentres: Record<string, { x: number; y: number }> = {};
const riverEls: Record<string, SVGGElement> = {};
/** Map position of every city, river town and name town, by id. */
const pos: Record<string, Point> = {};
let fullView: ViewBox = { x: 0, y: 0, w: 613, h: 585 };
let view: ViewBox = { ...fullView };
let round: PracticeRound | null = null;
/** Item shown in the learn-mode info card. */
let selected: string | null = null;

const saveSettings = () => storage.saveSettings(settings);
const isZoneSet = () => settings.set === 'tel' || settings.set === 'nom';
const distanceQuestion = () =>
  (settings.set === 'city' && settings.kind === 'find') ||
  (settings.set === 'riv' && settings.kind === 'town');

/** Whether department codes are meaningful to players and shown (France's numbers). */
const codesShown = () => ix.country.departmentCodes === 'shown';
/** "département", "region": the second-level term inside a sentence. */
const depTerm = () => ix.copy.departmentTerm.one.toLowerCase();

/** Find-the-zone question ids are "Z<zone>_<copy>"; zone answer choices are "z<zone>". */
const zoneOfQuestion = (u: string): string | undefined => {
  const zone = /^Z(.+)_\d+$/.exec(u)?.[1];
  return zone && ix.phoneZoneById[zone] ? zone : undefined;
};
const zoneOfChoice = (u: string): string | undefined =>
  u.startsWith('z') && ix.phoneZoneById[u.slice(1)] ? u.slice(1) : undefined;

/* ---------- map building ---------- */

function weightedCentre(codes: string[]): { x: number; y: number } {
  let sx = 0;
  let sy = 0;
  let sw = 0;
  for (const c of codes) {
    const b = boxes[c];
    if (!b) continue;
    const w = b.w * b.h;
    sx += b.cx * w;
    sy += b.cy * w;
    sw += w;
  }
  return { x: sx / sw, y: sy / sw };
}

function build(): void {
  const { country } = ix;
  const [x, y, w, h] = (country.outline.viewBox || '0 0 613 585').split(/[ ,]+/).map(Number);
  fullView = { x, y, w, h };
  view = { ...fullView };
  const byId: Record<string, { path: string }> = {};
  country.outline.locations.forEach((l) => (byId[String(l.id).toUpperCase()] = l));

  let html = '';
  for (const r of ix.regions) {
    const codes = r.codes.filter((c) => byId[c]);
    html +=
      `<g class="reg" data-r="${r.key}">` +
      codes.map((c) => `<path class="halo" d="${esc(byId[c].path)}"/>`).join('') +
      codes.map((c) => `<path class="dep" data-code="${c}" d="${esc(byId[c].path)}"/>`).join('') +
      '</g>';
  }
  land.innerHTML = html;
  depPaths = [...land.querySelectorAll<SVGPathElement>('.dep')];
  for (const p of depPaths) {
    const code = p.dataset.code!;
    pathByCode[code] = p;
    const b = p.getBBox();
    boxes[code] = { x: b.x, y: b.y, w: b.width, h: b.height, cx: b.x + b.width / 2, cy: b.y + b.height / 2 };
  }
  for (const r of ix.regions) {
    const c = weightedCentre(r.codes);
    const nudge = country.regionLabelOffsets[r.key];
    regionCentres[r.key] = { x: c.x + (nudge?.dx ?? 0), y: c.y + (nudge?.dy ?? 0) };
  }

  const placed = ix.departments.filter((d) => boxes[d.code]);
  const affine = country.outline.affine;
  projection = affine
    ? projectionFromAffine(affine, country.projectionRefLat)
    : fitProjection(
        placed.map((d) => ({ lat: d.lat, lon: d.lon, x: boxes[d.code].cx, y: boxes[d.code].cy })),
        country.projectionRefLat,
      );
  const project = projection.project;
  const dot = (attr: string, id: string, name: string, lat: number, lon: number, extra = '') => {
    const p = project(lat, lon);
    pos[id] = p;
    return `<g ${attr}="${id}"${extra}><circle cx="${p[0]}" cy="${p[1]}"/><text x="${p[0]}" y="${p[1]}">${esc(name)}</text></g>`;
  };

  depLabels.innerHTML = placed
    .map((d) => {
      const nudge = country.departmentLabelOffsets?.[d.code];
      const x = boxes[d.code].cx + (nudge?.dx ?? 0);
      const y = boxes[d.code].cy + (nudge?.dy ?? 0);
      return `<text data-code="${d.code}" x="${x}" y="${y}"></text>`;
    })
    .join('');
  regionLabels.innerHTML = ix.regions
    .map(
      (r) =>
        `<text class="rn" data-r="${r.key}" x="${regionCentres[r.key].x}" y="${regionCentres[r.key].y}">${esc(r.name)}</text>`,
    )
    .join('');
  cityLayer.innerHTML = ix.cities
    .map((c) => dot('data-c', c.id, c.name, c.lat, c.lon, ` data-t="${c.tier}"`))
    .join('');

  const labelAt: Record<string, Point> = {};
  riverLayer.innerHTML = ix.rivers
    .map((r) => {
      const pts = r.course.map(([lat, lon]) => project(lat, lon));
      const d = smoothPath(pts);
      labelAt[r.id] = pts[Math.floor(pts.length / 2)];
      const width = r.lengthKm > 700 ? 3.4 : r.lengthKm > 400 ? 2.7 : 2.1;
      return `<g class="rv" data-rv="${r.id}"><path class="ln" d="${d}" data-w="${width}" style="stroke-width:${width}px"/><path class="hit" d="${d}"/></g>`;
    })
    .join('');
  riverLayer.querySelectorAll<SVGGElement>('.rv').forEach((g) => (riverEls[g.dataset.rv!] = g));
  riverLabels.innerHTML = ix.rivers
    .map(
      (r) => `<text data-rv="${r.id}" x="${labelAt[r.id][0]}" y="${labelAt[r.id][1]}">${esc(r.name)}</text>`,
    )
    .join('');
  riverTownLayer.innerHTML = ix.riverTowns.map((t) => dot('data-t', t.id, t.name, t.lat, t.lon)).join('');
  zoneLabels.innerHTML = ix.phoneZones
    .map((z) => {
      const c = weightedCentre(ix.departmentsInZone[z.zone]);
      return `<text x="${c.x}" y="${c.y}">${z.zone}</text>`;
    })
    .join('');
  nameTownLayer.innerHTML = ix.nameTowns.map((t) => dot('data-n', t.id, t.name, t.lat, t.lon)).join('');
  prefixLabels.innerHTML = placed
    .filter((d) => localPrefixes(d.code).length)
    .map(
      (d) =>
        `<text x="${boxes[d.code].cx}" y="${boxes[d.code].cy}">${esc(localPrefixes(d.code).join(' '))}</text>`,
    )
    .join('');
  $('#msg').style.display = 'none';
}

/* ---------- view ---------- */

function setView(v: ViewBox): void {
  view = v;
  svg.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`);
  scaleLabels();
}

/** Screen pixels per map unit. */
function zoom(): number {
  const m = svg.getScreenCTM();
  return m ? m.a : 1;
}

/** Keeps text, dots and strokes the same on-screen size at any zoom. */
function scaleLabels(): void {
  const z = zoom();
  if (!z) return;
  const set = (el: Element, attr: string, value: number) => el.setAttribute(attr, String(value));
  set(depLabels, 'font-size', 10.5 / z);
  set(depLabels, 'stroke-width', 3 / z);
  set(regionLabels, 'font-size', 13.5 / z);
  set(regionLabels, 'stroke-width', 3.5 / z);
  for (const g of [cityLayer, riverTownLayer, nameTownLayer]) {
    set(g, 'font-size', 12 / z);
    set(g, 'stroke-width', 3 / z);
    g.querySelectorAll('circle').forEach((c) => {
      set(c, 'r', ((c.parentNode as Element).classList.contains('big') ? 7 : 3.6) / z);
      set(c, 'stroke-width', 1.5 / z);
    });
    g.querySelectorAll('text').forEach((t) => set(t, 'dx', 7 / z));
  }
  set(zoneLabels, 'font-size', (ix.phoneZones.length <= 8 ? 30 : 15) / z);
  set(zoneLabels, 'stroke-width', 4 / z);
  set(prefixLabels, 'font-size', 8 / z);
  set(prefixLabels, 'stroke-width', 2.5 / z);
  set(riverLabels, 'font-size', 12.5 / z);
  set(riverLabels, 'stroke-width', 3 / z);
  riverLabels.querySelectorAll('text').forEach((t) => set(t, 'dy', -9 / z));
  effects.querySelectorAll<SVGElement>('[data-s]').forEach((e) => {
    const s = Number(e.dataset.s);
    if (e.tagName === 'circle') set(e, 'r', s / z);
    else set(e, 'stroke-width', s / z);
  });
  effects.querySelectorAll('text').forEach((t) => {
    set(t, 'font-size', 13 / z);
    set(t, 'stroke-width', 3 / z);
    set(t, 'dy', -12 / z);
  });
  updateLabels();
}

function toSvg(sx: number, sy: number): DOMPoint {
  return new DOMPoint(sx, sy).matrixTransform(svg.getScreenCTM()!.inverse());
}

function zoomAt(factor: number, sx: number, sy: number): void {
  const pt = toSvg(sx, sy);
  const w = Math.min(fullView.w * 1.2, Math.max(fullView.w / 14, view.w * factor));
  const k = w / view.w;
  setView({ x: pt.x - (pt.x - view.x) * k, y: pt.y - (pt.y - view.y) * k, w, h: view.h * k });
}

function zoomTo(codes: string[] | null): void {
  if (!codes) {
    setView({ ...fullView });
    return;
  }
  let x0 = 1e9;
  let y0 = 1e9;
  let x1 = -1e9;
  let y1 = -1e9;
  for (const c of codes) {
    const b = boxes[c];
    if (!b) continue;
    x0 = Math.min(x0, b.x);
    y0 = Math.min(y0, b.y);
    x1 = Math.max(x1, b.x + b.w);
    y1 = Math.max(y1, b.y + b.h);
  }
  const pw = (x1 - x0) * 0.12 + 8;
  const ph = (y1 - y0) * 0.12 + 8;
  setView({ x: x0 - pw, y: y0 - ph, w: x1 - x0 + 2 * pw, h: y1 - y0 + 2 * ph });
}

const scopeCodes = () =>
  settings.scope === 'all' || settings.set === 'reg' || settings.set === 'riv' || isZoneSet()
    ? null
    : ix.regionByKey[settings.scope].codes;

function zoomView(): void {
  const { river } = settings;
  if (
    settings.set === 'riv' &&
    river !== 'all' &&
    riverEls[river] &&
    (settings.mode === 'learn' || settings.kind === 'town')
  ) {
    const b = riverEls[river].querySelector<SVGPathElement>('.ln')!.getBBox();
    const pw = b.width * 0.15 + 12;
    const ph = b.height * 0.15 + 12;
    setView({ x: b.x - pw, y: b.y - ph, w: b.width + 2 * pw, h: b.height + 2 * ph });
    return;
  }
  zoomTo(scopeCodes());
}

/* pointer: pan, pinch, click */
const pointers = new Map<number, { x: number; y: number }>();
let drag: { x: number; y: number } | null = null;
let moved = false;
let pinch: { d: number } | null = null;

function bindPointer(): void {
  svg.addEventListener('pointerdown', (e) => {
    svg.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved = false;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) };
      drag = null;
    } else drag = { x: e.clientX, y: e.clientY };
  });
  svg.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) {
      hover(e);
      return;
    }
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      zoomAt(pinch.d / d, (a.x + b.x) / 2, (a.y + b.y) / 2);
      pinch.d = d;
      moved = true;
      return;
    }
    if (drag) {
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (!moved && Math.hypot(dx, dy) < 6) return;
      moved = true;
      svg.classList.add('drag');
      const z = zoom();
      setView({ ...view, x: view.x - dx / z, y: view.y - dy / z });
      drag = { x: e.clientX, y: e.clientY };
      tip.style.display = 'none';
    }
  });
  const up = (e: PointerEvent) => {
    const was = pointers.has(e.pointerId);
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    svg.classList.remove('drag');
    if (was && !moved && e.type === 'pointerup' && pointers.size === 0) click(e);
    if (pointers.size === 0) drag = null;
  };
  svg.addEventListener('pointerup', up);
  svg.addEventListener('pointercancel', up);
  svg.addEventListener('pointerleave', () => {
    tip.style.display = 'none';
    setHover(null);
  });
  svg.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      zoomAt(Math.exp(e.deltaY * 0.0018), e.clientX, e.clientY);
    },
    { passive: false },
  );
  const zoomCentre = (factor: number) => {
    const r = svg.getBoundingClientRect();
    zoomAt(factor, r.left + r.width / 2, r.top + r.height / 2);
  };
  $('#zin').onclick = () => zoomCentre(0.66);
  $('#zout').onclick = () => zoomCentre(1.5);
  $('#zre').onclick = () => zoomView();
  new ResizeObserver(() => scaleLabels()).observe(svg);
}

/** The item under the pointer for the current set, or null. */
function unitAt(e: MouseEvent): string | null {
  if (settings.set === 'city') {
    // Nearest visible dot within 22 px, so small dots are easy to hit.
    let best: string | null = null;
    let bestDistance = 22;
    for (const g of children(cityLayer)) {
      if (g.style.display === 'none') continue;
      const r = g.querySelector('circle')!.getBoundingClientRect();
      const d = Math.hypot(r.x + r.width / 2 - e.clientX, r.y + r.height / 2 - e.clientY);
      if (d < bestDistance) {
        bestDistance = d;
        best = g.dataset.c!;
      }
    }
    return best;
  }
  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (!el) return null;
  if (settings.set === 'riv') {
    const g = el.closest<SVGGElement>('.rv');
    return g ? g.dataset.rv! : null;
  }
  const p = el.closest<SVGPathElement>('.dep');
  if (!p) return null;
  const code = p.dataset.code!;
  if (isZoneSet()) return code;
  if (settings.set === 'reg') return ix.departmentByCode[code].region;
  if (settings.set === 'dep') {
    if (settings.scope !== 'all' && ix.departmentByCode[code].region !== settings.scope) return null;
    return code;
  }
  return null;
}

let hovered: string | null = null;
function setHover(u: string | null): void {
  if (hovered === u) return;
  svg.querySelectorAll('.hov').forEach((x) => x.classList.remove('hov'));
  hovered = u;
  if (!u) return;
  if (riverEls[u]) riverEls[u].classList.add('hov');
  else if (settings.set === 'reg') land.querySelector(`.reg[data-r="${u}"]`)!.classList.add('hov');
  else if (pathByCode[u]) pathByCode[u].classList.add('hov');
}

function hover(e: PointerEvent): void {
  if (!projection) return;
  const u = unitAt(e);
  const can =
    settings.mode === 'learn' ||
    (settings.kind === 'find' && settings.set !== 'city') ||
    (settings.kind === 'town' && settings.set === 'nom');
  setHover(can && u && !ix.cityById[u] ? u : null);
  if (settings.mode === 'learn' && u) showTip(u, e);
  else tip.style.display = 'none';
}

/** Finer local prefixes of a department (France: the two digits after 0Z); shown, never quizzed. */
const localPrefixes = (code: string) => ix.country.phone.localPrefixes?.[code] ?? [];

/** A pattern label without its parenthesised note, e.g. "-o, -acciu". */
const shortPattern = (label: string) => label.split(' (')[0];
const patternsIn = (code: string) => ix.namePatterns.filter((p) => p.codes.includes(code));

function tipText(u: string): string {
  const d = ix.departmentByCode[u];
  if (settings.set === 'tel' && d) {
    const local = localPrefixes(u);
    return nameOf(u, 'full') + ' → ' + ix.zoneOfDepartment[u] + (local.length ? ' ' + local.join('/') : '');
  }
  if (settings.set === 'nom' && d) {
    const ps = patternsIn(u);
    return d.name + (ps.length ? ': ' + ps.map((p) => shortPattern(p.label)).join(' / ') : '');
  }
  return nameOf(u, 'full');
}

let tipTimer = 0;
function showTip(u: string, e: MouseEvent, ms?: number): void {
  const r = $('#box').getBoundingClientRect();
  tip.textContent = tipText(u);
  tip.style.left = Math.min(Math.max(e.clientX - r.left, 90), r.width - 90) + 'px';
  tip.style.top = e.clientY - r.top + 'px';
  tip.style.display = 'block';
  clearTimeout(tipTimer);
  if (ms) tipTimer = window.setTimeout(() => (tip.style.display = 'none'), ms);
}

type NameStyle = 'num' | 'name' | 'full' | '';

function nameOf(u: string, how: NameStyle = ''): string {
  if (ix.regionByKey[u]) return ix.regionByKey[u].name;
  const d = ix.departmentByCode[u];
  if (d) {
    if (!codesShown()) return d.name;
    if (how === 'num') return d.code;
    if (how === 'name') return d.name;
    return d.code + ' · ' + d.name;
  }
  if (ix.riverById[u]) return ix.riverById[u].name;
  if (ix.riverTownById[u]) return ix.riverTownById[u].name;
  if (ix.patternById[u]) return ix.patternById[u].label;
  if (ix.nameTownById[u]) return ix.nameTownById[u].name;
  const questionZone = zoneOfQuestion(u);
  if (questionZone) return t('name.zone', { zone: questionZone, name: ix.phoneZoneById[questionZone].name });
  const choiceZone = zoneOfChoice(u);
  if (choiceZone) return how === 'full' ? choiceZone + ' · ' + ix.phoneZoneById[choiceZone].name : choiceZone;
  return ix.cityById[u].name;
}

const regionOf = (u: string) =>
  ix.regionByKey[u] ? u : (ix.departmentByCode[u]?.region ?? ix.cityById[u]?.region ?? u);

/* ---------- rendering ---------- */

const mix = (color: string, percent: number) => `color-mix(in srgb, ${color} ${percent}%, var(--land))`;
const hueFill = (hue: number) => `hsl(${hue} var(--rs) var(--rl))`;

/** The departments a zone-set item covers: a phone zone, a pattern's area, or a town's pattern area. */
function zoneOf(u: string): string[] {
  const zone = zoneOfQuestion(u);
  if (zone) return ix.departmentsInZone[zone];
  if (ix.patternById[u]) return ix.patternById[u].codes;
  if (ix.nameTownById[u]) return ix.patternById[ix.nameTownById[u].pattern].codes;
  return [];
}

/** Learn-mode pattern: the selected one, or the first if nothing (or a department) is selected. */
function learnPattern() {
  if (selected && ix.patternById[selected]) return ix.patternById[selected];
  return selected && ix.departmentByCode[selected] ? null : ix.namePatterns[0];
}

function zoneFill(code: string, learn: boolean): string {
  if (settings.set === 'tel' && learn) return hueFill(ix.phoneZoneById[ix.zoneOfDepartment[code]].hue);
  if (learn) {
    const p = learnPattern();
    return p && p.codes.includes(code) ? mix('var(--hl)', 60) : 'var(--land)';
  }
  if (!round || !round.current) return 'var(--land)';
  if (settings.set === 'tel' && settings.kind === 'name') {
    if (code === round.current) return 'var(--blue)';
    return round.shown[code] != null ? OUTCOME_COLORS[round.shown[code]] : 'var(--land)';
  }
  const zone = zoneOf(round.current);
  if (settings.kind === 'name') return zone.includes(code) ? mix('var(--blue)', 70) : 'var(--land)';
  if (round.waiting && zone.includes(code))
    return round.outcome === 0 ? mix('var(--ok)', 75) : mix('var(--red)', 60);
  return 'var(--land)';
}

function colorize(): void {
  const learn = settings.mode === 'learn';
  const { set } = settings;
  for (const p of depPaths) {
    const code = p.dataset.code!;
    const region = ix.departmentByCode[code].region;
    const inScope = set === 'reg' || settings.scope === 'all' || region === settings.scope;
    let fill: string;
    if (!inScope) fill = 'var(--off)';
    else if (learn && set !== 'city') fill = hueFill(ix.regionByKey[region].hue);
    else fill = 'var(--land)';
    if (!learn && round && set !== 'city' && set !== 'riv') {
      const u = set === 'reg' ? region : code;
      if (round.shown[u] != null) fill = OUTCOME_COLORS[round.shown[u]];
      if (u === round.current && (settings.kind === 'name' || round.locked)) fill = 'var(--blue)';
    }
    if (isZoneSet()) fill = zoneFill(code, learn);
    p.style.fill = fill;
    p.style.stroke = set === 'reg' ? fill : 'var(--dline)';
    p.classList.toggle('out', !inScope);
    const pulse =
      !isZoneSet() &&
      !learn &&
      !!round?.locked &&
      set !== 'city' &&
      set !== 'riv' &&
      (set === 'reg' ? region : code) === round.current;
    p.classList.toggle('pulse', pulse);
  }
  const isRiver = set === 'riv';
  for (const g of [riverLayer, riverLabels, riverTownLayer]) g.style.display = isRiver ? '' : 'none';
  zoneLabels.style.display = set === 'tel' && learn ? '' : 'none';
  prefixLabels.style.display = set === 'tel' && learn ? '' : 'none';
  nameTownLayer.style.display = set === 'nom' ? '' : 'none';
  if (isRiver) {
    const town = round?.current ? ix.riverTownById[round.current] : undefined;
    for (const r of ix.rivers) {
      const g = riverEls[r.id];
      if (!g) continue;
      const line = g.querySelector<SVGPathElement>('.ln')!;
      let color = '';
      if (learn) {
        if (selected === r.id || (!selected && settings.river === r.id)) color = 'var(--hl)';
      } else if (round && settings.kind !== 'town') {
        if (round.shown[r.id] != null) color = OUTCOME_COLORS[round.shown[r.id]];
        if (r.id === round.current && (settings.kind === 'name' || round.locked)) color = 'var(--hl)';
      } else if (round && settings.kind === 'town' && round.waiting && town?.rivers.includes(r.id)) {
        color = 'var(--hl)';
      }
      line.style.stroke = color;
      line.style.strokeWidth = Number(line.dataset.w) * (color === 'var(--hl)' ? 1.7 : 1) + 'px';
      g.classList.toggle('pulse', !learn && !!round?.locked && r.id === round.current);
      // Highlighted rivers go on top.
      if (color === 'var(--hl)') riverLayer.appendChild(g);
    }
  }
  updateLabels();
}

function updateLabels(): void {
  if (!projection) return;
  const learn = settings.mode === 'learn';
  const { set } = settings;
  const z = zoom();
  const depMode = !codesShown()
    ? settings.labels === 'off'
      ? 'off'
      : 'name'
    : settings.labels === 'auto'
      ? z >= 2.6
        ? 'name'
        : 'num'
      : settings.labels;
  const shown = (u: string) => !!round && round.shown[u] != null;

  for (const t of children(depLabels)) {
    const code = t.dataset.code!;
    const d = ix.departmentByCode[code];
    let show = false;
    if (set === 'dep') {
      const inScope = settings.scope === 'all' || d.region === settings.scope;
      show = inScope && (learn ? depMode !== 'off' : shown(code));
    }
    t.style.display = show ? '' : 'none';
    if (show) t.textContent = learn ? (depMode === 'name' ? d.name : d.code) : codesShown()
        ? d.code + ' ' + d.name
        : d.name;
  }
  for (const t of children(regionLabels)) {
    t.style.display = set === 'reg' && (learn || shown(t.dataset.r!)) ? '' : 'none';
  }

  const learnRiver =
    set === 'riv' && learn
      ? selected && ix.riverById[selected]
        ? selected
        : settings.river !== 'all'
          ? settings.river
          : null
      : null;
  const currentTown = round?.current ? ix.riverTownById[round.current] : undefined;
  for (const t of children(riverLabels)) {
    const id = t.dataset.rv!;
    const show =
      set === 'riv' &&
      (learn ||
        (settings.kind !== 'town' && shown(id)) ||
        (!!round && settings.kind === 'town' && round.waiting && !!currentTown?.rivers.includes(id)));
    t.style.display = show ? '' : 'none';
  }
  for (const g of children(riverTownLayer)) {
    const id = g.dataset.t!;
    let show = false;
    if (set === 'riv') {
      if (learn) show = !!learnRiver && ix.riverById[learnRiver].towns.includes(id);
      else if (round && settings.kind === 'town') show = shown(id) && round.current !== id;
    }
    g.style.display = show ? '' : 'none';
    g.querySelector('text')!.style.display = show ? '' : 'none';
    g.querySelector('circle')!.style.fill = !learn && shown(id) ? OUTCOME_COLORS[round!.shown[id]] : '';
  }

  if (set === 'nom') {
    const p = learn ? learnPattern() : null;
    for (const g of children(nameTownLayer)) {
      const t = ix.nameTownById[g.dataset.n!];
      const show = learn
        ? !!p && t.pattern === p.id && !t.extra
        : !!round && round.waiting && round.current === t.id && settings.kind === 'town';
      g.style.display = show ? '' : 'none';
    }
  }

  for (const g of children(cityLayer)) {
    const c = ix.cityById[g.dataset.c!];
    const inScope = settings.scope === 'all' || c.region === settings.scope;
    let dot = false;
    let text = false;
    if (set === 'city' && inScope) {
      if (learn) {
        dot = true;
        text = c.tier === 1 || z >= 2 || settings.scope !== 'all';
      } else if (round) {
        const done = shown(c.id);
        if (settings.kind === 'dot') {
          dot = true;
          text = done && round.current !== c.id;
        } else {
          dot = done || (settings.kind === 'name' && round.current === c.id);
          text = done && round.current !== c.id;
        }
      }
    }
    g.style.display = dot ? '' : 'none';
    g.querySelector('text')!.style.display = text ? '' : 'none';
    const practising = settings.mode === 'practice' && !!round && round.current === c.id;
    const locked = practising && settings.kind === 'dot' && round!.locked;
    g.classList.toggle('big', practising && (settings.kind === 'name' || locked));
    g.classList.toggle('pulse', locked);
    const big = g.classList.contains('big');
    const circle = g.querySelector('circle')!;
    circle.setAttribute('r', String((big ? 7 : 3.6) / z));
    circle.style.fill =
      !learn && shown(c.id) && round!.current !== c.id
        ? OUTCOME_COLORS[round!.shown[c.id]]
        : big
          ? 'var(--blue)'
          : '';
  }
}

/* ---------- controls ---------- */

const SEGMENTS = [
  ['#setSeg', 'set'],
  ['#modeSeg', 'mode'],
  ['#kindSeg', 'kind'],
] as const;

const show = (selector: string, visible: boolean) => ($(selector).style.display = visible ? '' : 'none');
const selectEl = (selector: string) => $<HTMLSelectElement>(selector);

function syncControls(): void {
  const { set, mode, kind } = settings;
  for (const [id, key] of SEGMENTS)
    for (const b of $(id).children)
      b.setAttribute('aria-pressed', String((b as HTMLElement).dataset.v === settings[key]));
  show('#kindSeg', mode === 'practice');
  $('.app').classList.toggle('learning', mode === 'learn');
  show('#scopeL', !(set === 'reg' || set === 'riv' || isZoneSet()));
  show('#kindSeg [data-v=town]', set === 'riv' || set === 'nom');
  show('#kindSeg [data-v=dot]', set === 'city');
  for (const b of $('#kindSeg').children)
    b.textContent = kindLabel(set, (b as HTMLElement).dataset.v as QuestionKind);
  show('#rselL', set === 'riv' && (mode === 'learn' || kind === 'town'));
  selectEl('#rsel').value = settings.river;
  show('#sizeL', mode === 'practice');
  selectEl('#size').value = settings.size;
  show('#telfL', set === 'tel' && mode === 'practice' && kind === 'name' && ix.borderDepartments.length > 0);
  selectEl('#telf').value = settings.phoneFilter;
  show('#askL', set === 'dep' && mode === 'practice' && codesShown());
  show('#labL', set === 'dep' && mode === 'learn');
  selectEl('#scope').value = settings.scope;
  selectEl('#ask').value = settings.ask;
  selectEl('#labs').value = settings.labels;
}

/** Options of the Area and River filters (their "all" option is translated). */
function renderOptions(): void {
  selectEl('#scope').innerHTML =
    `<option value="all">${esc(ix.copy.allAreas)}</option>` +
    ix.regions.map((r) => `<option value="${r.key}">${esc(r.name)}</option>`).join('');
  selectEl('#rsel').innerHTML =
    `<option value="all">${esc(t('ctl.allRivers'))}</option>` +
    ix.rivers.map((r) => `<option value="${r.id}">${esc(r.name)}</option>`).join('');
}

function bindControls(): void {
  renderOptions();

  for (const [id, key] of SEGMENTS)
    $(id).addEventListener('click', (e) => {
      const b = (e.target as Element).closest('button');
      if (!b) return;
      b.blur();
      settings = normalizeSettings({ ...settings, [key]: b.dataset.v }, validValues());
      changed(key !== 'kind' || settings.set === 'riv');
    });

  const onSelect = (selector: string, apply: (value: string) => void, rezoom: boolean) =>
    (selectEl(selector).onchange = (e) => {
      apply((e.target as HTMLSelectElement).value);
      settings = normalizeSettings(settings, validValues());
      changed(rezoom);
    });
  onSelect('#rsel', (v) => (settings.river = v), true);
  onSelect('#scope', (v) => (settings.scope = v), true);
  onSelect('#size', (v) => (settings.size = v as Settings['size']), false);
  onSelect('#telf', (v) => (settings.phoneFilter = v as Settings['phoneFilter']), false);
  onSelect('#ask', (v) => (settings.ask = v as Settings['ask']), false);
  selectEl('#labs').onchange = (e) => {
    settings = normalizeSettings(
      { ...settings, labels: (e.target as HTMLSelectElement).value },
      validValues(),
    );
    saveSettings();
    updateLabels();
  };

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.id === 'rs' && round) start(round.items);
    if (target.id === 'srReset') resetProgress(target);
  });
  document.addEventListener('keydown', onKey);
}

const validValues = () => ({
  regionKeys: ix.regions.map((r) => r.key),
  riverIds: ix.rivers.map((r) => r.id),
  sets: ix.country.sets,
});

function changed(rezoom: boolean): void {
  if (settings.set !== 'riv' && settings.set !== 'nom' && settings.kind === 'town') settings.kind = 'find';
  if (settings.set !== 'city' && settings.kind === 'dot') settings.kind = 'find';
  saveSettings();
  syncControls();
  selected = null;
  effects.innerHTML = '';
  if (rezoom) zoomView();
  if (settings.mode === 'practice') start();
  else {
    round = null;
    colorize();
    panel();
  }
}

function onKey(e: KeyboardEvent): void {
  const target = e.target as HTMLElement;
  if (target.tagName === 'SELECT') return;
  if (
    settings.mode === 'practice' &&
    (e.key === 'Enter' || e.key === ' ') &&
    target.closest?.('.seg,.choices,#prompt')
  )
    e.preventDefault();
  if (settings.mode !== 'practice' || !round || !round.current) return;
  if (e.key === 'Enter' && round.waiting && document.querySelector('#nextBtn')) {
    e.preventDefault();
    next();
    return;
  }
  if (settings.kind === 'name' && /^[1-5]$/.test(e.key)) {
    const b = $('#prompt').querySelectorAll<HTMLButtonElement>('.choices button')[Number(e.key) - 1];
    if (b) choose(b.dataset.u!, b);
  }
}

/* ---------- practice engine ---------- */

/** Every item of the current set and filters. */
function pool(): string[] {
  const { set, mode, kind } = settings;
  if (set === 'reg') return ix.regions.map((r) => r.key);
  if (set === 'tel') {
    if (mode === 'learn') return ix.phoneZones.map((z) => z.zone);
    return kind === 'name'
      ? ix.departments
          .filter(
            (d) => boxes[d.code] && (settings.phoneFilter === 'all' ||
                !ix.borderDepartments.length ||
                ix.borderDepartments.includes(d.code)),
          )
          .map((d) => d.code)
      : zoneQuestionCopies().flatMap((i) => ix.phoneZones.map((z) => 'Z' + z.zone + '_' + i));
  }
  if (set === 'nom')
    return kind === 'town' && mode === 'practice'
      ? ix.nameTowns.map((t) => t.id)
      : ix.namePatterns.map((p) => p.id);
  if (set === 'riv') {
    if (kind !== 'town' || mode !== 'practice') return ix.rivers.map((r) => r.id);
    return settings.river === 'all'
      ? ix.riverTowns.map((t) => t.id)
      : ix.riverById[settings.river].towns.slice();
  }
  const inScope = (x: { region: string }) => settings.scope === 'all' || x.region === settings.scope;
  if (set === 'dep') return ix.departments.filter((d) => inScope(d) && boxes[d.code]).map((d) => d.code);
  return ix.cities.filter(inScope).map((c) => c.id);
}

const missed = (o: Outcome | undefined) => isMiss(o, distanceQuestion());
const zoneAnswer = () => 'z' + ix.zoneOfDepartment[round!.current!];
const rightChoice = () =>
  settings.set === 'tel' && settings.kind === 'name' ? zoneAnswer() : round!.current!;
const isRight = (u: string) => u === rightChoice();

/** Progress key; the three copies of a find-the-zone question share one record. */
const progressKeyOf = (u: string) => {
  const zone = zoneOfQuestion(u);
  return settings.set + '|' + (zone ? 'Z' + zone : u);
};
/** Few zones are each asked three times per round; many zones once. */
const zoneQuestionCopies = () => (ix.phoneZones.length <= 8 ? [0, 1, 2] : [0]);

function recordProgress(u: string, o: Outcome): void {
  const key = progressKeyOf(u);
  progress[key] = recordAnswer(progress[key], missed(o), Date.now());
  storage.saveProgress(progress);
}

function resetProgress(button: HTMLElement): void {
  if (!button.dataset.armed) {
    button.dataset.armed = '1';
    button.textContent = t('progress.resetConfirm', { set: setLabel(settings.set) });
    return;
  }
  for (const k of Object.keys(progress)) if (k.startsWith(settings.set + '|')) delete progress[k];
  storage.saveProgress(progress);
  if (settings.mode === 'practice') start();
  else panel();
}

const stats = (items: string[]) => progressStats(items.map(progressKeyOf), progress, Date.now());

/** Runs `fn` after `ms` unless the user has moved on to another question meanwhile. */
function later(fn: () => void, ms: number): void {
  const r = round;
  const seq = round?.seq;
  setTimeout(() => {
    if (round === r && round?.seq === seq) fn();
  }, ms);
}

function start(list?: string[]): void {
  const size = settings.size === 'all' ? 'all' : Number(settings.size);
  const items = list || pickRound(pool(), size, progressKeyOf, progress, Date.now(), Math.random);
  round = {
    ...createRound(items, Math.random),
    current: null,
    last: null,
    tries: 0,
    locked: false,
    waiting: false,
    wrong: [],
    feedback: null,
    seq: 0,
    askBy: 'name',
    choices: null,
    outcome: 0,
    distanceKm: 0,
  };
  effects.innerHTML = '';
  next();
}

function next(): void {
  const r = round!;
  effects.innerHTML = '';
  if (!r.queue.length) {
    r.current = null;
    colorize();
    panel();
    return;
  }
  r.current = r.queue.shift()!;
  r.tries = 0;
  r.locked = false;
  r.waiting = false;
  r.wrong = [];
  r.feedback = null;
  r.seq++;
  r.askBy =
    settings.set === 'dep' && codesShown()
      ? settings.ask === 'mix'
        ? Math.random() < 0.5
          ? 'num'
          : 'name'
        : settings.ask
      : 'name';
  if (settings.kind === 'name') r.choices = choicesFor(r.current);
  colorize();
  panel();
  keepQuizInView();
}

function choicesFor(answer: string): string[] {
  const { set } = settings;
  if (set === 'tel') {
    const zones = ix.phoneZones.map((z) => 'z' + z.zone);
    if (zones.length <= 5) return zones;
    // Many zones: four options, preferring codes with the same first digit.
    return pickChoices({
      answer: zoneAnswer(),
      roundItems: zones,
      allItems: zones,
      // First significant digit: "z044" and "z043" are both northern codes.
      groupOf: (u) => u.slice(1).replace(/^0+/, '').charAt(0),
      rng: Math.random,
    });
  }
  if (set === 'nom') return pickPatternChoices(answer, ix.namePatterns, Math.random);
  const allItems =
    set === 'riv'
      ? ix.rivers.map((r) => r.id)
      : set === 'reg'
        ? ix.regions.map((r) => r.key)
        : set === 'dep'
          ? ix.departments.filter((d) => boxes[d.code]).map((d) => d.code)
          : ix.cities.map((c) => c.id);
  return pickChoices({ answer, roundItems: round!.items, allItems, groupOf: regionOf, rng: Math.random });
}

function finishItem(o: Outcome): void {
  const r = round!;
  const u = r.current!;
  if (recordOutcome(r, u, o, missed(o), Math.random)) recordProgress(u, o);
}

function click(e: PointerEvent): void {
  if (!projection) return;
  if (settings.mode === 'learn') {
    const u = unitAt(e);
    selected = u || null;
    if (u && !ix.cityById[u] && settings.set === 'city') selected = null;
    if (u) showTip(u, e, 2500);
    panel();
    colorize();
    return;
  }
  const r = round;
  if (!r || !r.current) return;
  const current = r.current;

  if (isZoneSet()) {
    if (settings.kind === 'name') return;
    if (r.waiting) {
      r.feedback = null;
      next();
      return;
    }
    const u = unitAt(e);
    if (!u) return;
    const zone = zoneOf(current);
    const done = (o: Outcome) => {
      finishItem(o);
      r.waiting = true;
      r.outcome = o;
      const where =
        settings.set === 'tel'
          ? t('fb.zoneWhere', {
              zone: zoneOfQuestion(current)!,
              description: ix.phoneZoneById[zoneOfQuestion(current)!].description,
            })
          : t('fb.areaWhere', { where: ix.patternById[ix.nameTownById[current]?.pattern ?? current].where });
      const verdict = o === 0 ? t('fb.correct') : o < 3 ? t('fb.tryN', { n: o + 1 }) + '.' : t('fb.missed');
      r.feedback = {
        text: verdict + ' ' + where,
        tone: o === 0 ? 'ok' : o < 3 ? 'mid' : 'no',
      };
      colorize();
      scaleLabels();
      panel();
      if (o === 0) later(next, 1400);
    };
    if (zone.includes(u)) {
      done(r.tries as Outcome);
      return;
    }
    r.tries++;
    flash(u);
    if (r.tries >= 3) {
      r.feedback = { text: t('fb.notThere'), tone: 'no' };
      panel();
      later(() => done(3), 660);
      return;
    }
    const d = ix.departmentByCode[u];
    const ps = patternsIn(u);
    r.feedback = {
      text:
        settings.set === 'tel'
          ? t('fb.telWrong', { name: d.name, zone: ix.zoneOfDepartment[u] })
          : ps.length
            ? t('fb.nomWrong', { name: d.name, patterns: ps.map((p) => shortPattern(p.label)).join(' / ') })
            : t('fb.nomWrongNone', { name: d.name }),
      tone: 'no',
    };
    panel();
    return;
  }

  if (distanceQuestion()) {
    if (r.waiting) {
      next();
      return;
    }
    const pt = toSvg(e.clientX, e.clientY);
    const [lat, lon] = projection.unproject(pt.x, pt.y);
    const target = ix.cityById[current] || ix.riverTownById[current];
    const km = haversineKm(lat, lon, target.lat, target.lon);
    const o = distanceOutcome(km, settings.set === 'riv' ? RIVER_TOWN_DISTANCE_BANDS : CITY_DISTANCE_BANDS);
    finishItem(o);
    r.waiting = true;
    r.distanceKm = km;
    r.outcome = o;
    const color = OUTCOME_COLORS[o];
    const [tx, ty] = pos[current];
    effects.innerHTML =
      `<line x1="${pt.x}" y1="${pt.y}" x2="${tx}" y2="${ty}" stroke="${color}" data-s="2" stroke-dasharray="0"/>` +
      `<circle cx="${pt.x}" cy="${pt.y}" fill="var(--ink)" data-s="4"/>` +
      `<circle cx="${tx}" cy="${ty}" fill="${color}" stroke="var(--card)" data-s="7"/>` +
      `<g class="lab"><text x="${tx}" y="${ty}">${esc(target.name)}</text></g>`;
    scaleLabels();
    colorize();
    panel();
    return;
  }

  if (!((settings.kind === 'find' && settings.set !== 'city') || settings.kind === 'dot')) return;
  const u = unitAt(e);
  if (!u) return;
  if (r.locked) {
    if (u === current) {
      finishItem(3);
      next();
    }
    return;
  }
  if (u === current) {
    const o = r.tries as Outcome;
    finishItem(o);
    r.feedback = { text: o === 0 ? t('fb.correct') : t('fb.tryN', { n: o + 1 }), tone: o === 0 ? 'ok' : 'mid' };
    r.current = null;
    colorize();
    panel();
    later(next, o === 0 ? 450 : 800);
    return;
  }
  r.tries++;
  r.feedback = { text: t('fb.thats', { name: nameOf(u, 'full') }), tone: 'no' };
  flash(u);
  if (r.tries >= 3) {
    r.locked = true;
    r.feedback = { text: t('fb.blinking'), tone: 'no' };
  }
  colorize();
  panel();
}

/** Briefly marks a wrong answer red. */
function flash(u: string): void {
  if (ix.cityById[u]) {
    const circle = cityLayer.querySelector<SVGCircleElement>(`[data-c="${u}"] circle`)!;
    setTimeout(() => (circle.style.fill = 'var(--red)'), 0);
    setTimeout(colorize, 650);
    return;
  }
  if (riverEls[u]) {
    const line = riverEls[u].querySelector<SVGPathElement>('.ln')!;
    setTimeout(() => (line.style.stroke = 'var(--red)'), 0);
    setTimeout(colorize, 650);
    return;
  }
  const paths =
    settings.set === 'reg'
      ? ix.regionByKey[u].codes.map((c) => pathByCode[c]).filter(Boolean)
      : [pathByCode[u]];
  setTimeout(() => {
    for (const p of paths) {
      p.style.fill = 'var(--red)';
      p.style.stroke = settings.set === 'reg' ? 'var(--red)' : 'var(--dline)';
    }
  }, 0);
  setTimeout(colorize, 650);
}

function choose(u: string, button: HTMLElement): void {
  const r = round;
  if (!r || !r.current || r.waiting) return;
  const how: NameStyle = settings.set === 'dep' || settings.set === 'tel' ? 'full' : '';
  if (isRight(u)) {
    const o = r.tries as Outcome;
    finishItem(o);
    button.classList.add('ok');
    r.waiting = true;
    r.feedback = { text: o === 0 ? t('fb.correct') : t('fb.rightOnTry', { n: o + 1 }), tone: o === 0 ? 'ok' : 'mid' };
    colorize();
    panel();
    later(next, o === 0 ? 500 : 900);
    return;
  }
  r.tries++;
  r.wrong.push(u);
  if (r.tries >= 2) {
    finishItem(3);
    r.waiting = true;
    r.feedback = { text: t('fb.itWas', { name: nameOf(rightChoice(), how) }), tone: 'no' };
    colorize();
    panel();
    return;
  }
  r.feedback = { text: t('fb.not', { name: nameOf(u, how) }), tone: 'no' };
  panel();
}

/* ---------- panel ---------- */

/** Touch-only devices have no keyboard shortcuts to advertise. */
const touchOnly = () => matchMedia('(hover: none) and (pointer: coarse)').matches;

/**
 * On narrow screens the prompt sits above the map; bring both into view when a
 * question starts, unless they already are.
 */
function keepQuizInView(): void {
  if (!matchMedia('(max-width: 880px)').matches) return;
  const prompt = $('#prompt').getBoundingClientRect();
  const map = $('#box').getBoundingClientRect();
  if (prompt.top >= 0 && map.bottom <= window.innerHeight) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: window.scrollY + prompt.top - 8, behavior: reduce ? 'auto' : 'smooth' });
}

/** Bolds the river joiner in a town name: Bar<b>-sur-</b>Seine. */
const emphasizeJoiner = (name: string) => esc(name).replace(/(-sur-|-en-|-sous-)/, '<b>$1</b>');

const CARD = '<div class="card info" style="margin-top:12px;background:var(--bg)">';

function panel(): void {
  const prompt = $('#prompt');
  const more = $('#more');
  if (!projection) {
    prompt.innerHTML = `<p class="k">${esc(t('panel.loading'))}</p>`;
    more.innerHTML = '';
    return;
  }
  const { set, kind } = settings;

  if (settings.mode === 'learn') {
    const heading =
      set !== 'reg' && settings.scope !== 'all'
        ? t('learn.inScope', { set: setLabel(set), area: ix.regionByKey[settings.scope].name })
        : setLabel(set);
    const n = pool().length;
    if (set === 'riv' && !selected && settings.river !== 'all') selected = settings.river;
    prompt.innerHTML = `<p class="k">${esc(t('learn.heading'))}</p><p class="target">${esc(heading)}<small>${esc(t('learn.count', { count: n }))}</small></p>${infoHtml()}<div class="row"><button class="btn pri" id="go">${esc(t('learn.start'))}</button></div>${progressHtml()}`;
    $('#go').onclick = () => {
      settings.mode = 'practice';
      changed(false);
    };
    prompt.querySelectorAll<HTMLElement>('[data-u]').forEach(
      (b) =>
        (b.onclick = () => {
          selected = b.dataset.u!;
          if (ix.departmentByCode[selected] && set === 'dep') zoomTo([selected]);
          panel();
          colorize();
        }),
    );
    more.innerHTML = tipsHtml();
    return;
  }

  const r = round!;
  if (!r.current && !r.queue.length) {
    const total = r.items.length;
    const pct = Math.round((100 * r.score) / total);
    const misses = r.items.filter((u) => missed(r.first[u]));
    prompt.innerHTML = `<p class="k">${esc(t('round.complete'))}</p><p class="target">${r.score} / ${total}<small>${esc(t('round.firstTime', { pct }))}</small></p>${misses.length ? `<p class="k" style="margin-top:10px">${esc(t('round.toReview', { count: misses.length }))}</p><div class="missed chips">${misses.map((u) => `<span>${esc(nameOf(u, 'full'))}</span>`).join('')}</div>` : `<p class="fb ok">${esc(t('round.perfect'))}</p>`}<div class="row">${misses.length ? `<button class="btn pri" id="rm">${esc(t('round.practiseMissed'))}</button>` : ''}<button class="btn" id="nr">${esc(t('round.new'))}</button></div>`;
    if (misses.length) $('#rm').onclick = () => start(misses);
    $('#nr').onclick = () => start();
    const st = stats(pool());
    $('#nr').textContent = st.due ? t('round.nextDue', { count: st.due }) : t('round.next');
    more.innerHTML = statsHtml();
    return;
  }

  const cur = (r.current || r.last)!;
  r.last = cur;
  let heading =
    kind === 'find' || kind === 'dot' ? t('q.find') : kind === 'town' ? t('q.placeTown') : t('q.name');
  if (set === 'tel') heading = kind === 'find' ? t('q.telFind', { term: depTerm() }) : t('q.telName');
  if (set === 'nom')
    heading = kind === 'find' ? t('q.nomFind') : kind === 'town' ? t('q.nomTown') : t('q.nomName');

  let target: string;
  let sub: string;
  if ((kind === 'find' || kind === 'dot') && !isZoneSet()) {
    target = esc(set === 'dep' ? nameOf(cur, r.askBy) : nameOf(cur));
    sub =
      set === 'city'
        ? kind === 'dot'
          ? t('sub.dot')
          : t('sub.city')
        : set === 'riv'
          ? t('sub.river')
          : set === 'dep' && r.askBy === 'num'
            ? (ix.copy.codeLabel ?? t('sub.codeNumber', { term: ix.copy.departmentTerm.one }))
            : '';
  } else if (set === 'tel') {
    target = kind === 'find' ? zoneOfQuestion(cur)! : esc(t('target.blueTerm', { term: depTerm() }));
    sub =
      kind === 'find'
        ? t('sub.telFind', { term: depTerm() })
        : touchOnly()
          ? t('sub.pickZoneTouch')
          : t('sub.pickZone', { count: r.choices?.length ?? 5 });
  } else if (set === 'nom') {
    if (kind === 'find') {
      target = esc(ix.patternById[cur].label);
      sub = t('sub.nomFind', { term: depTerm() });
    } else if (kind === 'town') {
      const town = ix.nameTownById[cur];
      target = esc(town.name);
      sub = r.waiting ? t('sub.pattern', { label: ix.patternById[town.pattern].label }) : t('sub.nomTown');
    } else {
      target = esc(t('target.blueArea'));
      sub = touchOnly() ? t('sub.pickEndingTouch') : t('sub.pickEnding');
    }
  } else if (kind === 'town') {
    const town = ix.riverTownById[cur];
    target = emphasizeJoiner(town.name);
    sub = r.waiting
      ? t('sub.onRivers', {
          rivers: town.rivers.map((id) => ix.riverById[id].name).join(t('list.and')),
          count: town.rivers.length,
        })
      : t('sub.riverTown');
  } else {
    target = esc(
      set === 'city'
        ? t('target.blueDot')
        : set === 'reg'
          ? t('target.blueTerm', { term: ix.copy.regionTerm.one.toLowerCase() })
          : set === 'riv'
            ? t('target.pinkRiver')
            : t('target.blueTerm', { term: depTerm() }),
    );
    sub = touchOnly() ? t('sub.pickAnswerTouch') : t('sub.pickAnswer');
  }

  const feedback: Feedback | null =
    r.feedback ||
    (distanceQuestion() && r.waiting
      ? {
          text: t(`fb.distance${r.outcome}`, { km: Math.round(r.distanceKm) }),
          tone: (['ok', 'ok', 'mid', 'no'] as const)[r.outcome],
        }
      : null);

  let choices = '';
  if (kind === 'name' && r.choices) {
    // Zones named after their region (Peru) would give the answer away, so show codes only.
    const how: NameStyle =
      set === 'dep' ? r.askBy : set === 'tel' && ix.phoneZones.length <= 5 ? 'full' : '';
    choices =
      '<div class="choices">' +
      r.choices
        .map(
          (u, i) =>
            `<button data-u="${u}" class="${r.waiting && isRight(u) ? 'ok' : r.wrong.includes(u) ? 'no' : ''}"><b>${i + 1}</b>${esc(nameOf(u, how))}</button>`,
        )
        .join('') +
      '</div>';
  }
  const needsNext =
    r.waiting &&
    (distanceQuestion() || (isZoneSet() && kind !== 'name') || (kind === 'name' && r.tries >= 2));
  const nextButton = needsNext
    ? `<div class="row"><button class="btn pri" id="nextBtn">${esc(t('next'))} <kbd>Enter</kbd></button></div>`
    : '';
  prompt.innerHTML = `<p class="k">${heading}</p><p class="target">${target}${sub ? `<small>${esc(sub)}</small>` : ''}</p>${choices}<p class="fb ${feedback ? feedback.tone : ''}">${feedback ? esc(feedback.text) : ''}</p>${nextButton}`;
  prompt
    .querySelectorAll<HTMLButtonElement>('.choices button')
    .forEach((b) => (b.onclick = () => choose(b.dataset.u!, b)));
  const nextBtn = document.querySelector<HTMLElement>('#nextBtn');
  if (nextBtn)
    nextBtn.onclick = () => {
      r.feedback = null;
      next();
    };
  more.innerHTML = statsHtml();
}

function progressHtml(): string {
  const items =
    settings.mode === 'learn' && settings.set === 'tel'
      ? ix.departments.filter((d) => boxes[d.code]).map((d) => d.code)
      : pool();
  const st = stats(items);
  if (!st.total) return '';
  const kindText =
    settings.mode === 'practice'
      ? ' (' + esc(document.querySelector('#kindSeg [aria-pressed=true]')?.textContent || '') + ')'
      : '';
  return `<p class="k" style="margin-top:12px">${esc(t('progress.title', { set: setLabel(settings.set) }))}${kindText}</p><div class="prog"><i style="width:${(100 * st.solid) / st.total}%;background:var(--ok)"></i></div><div class="stats"><span>${esc(t('progress.solid', { solid: st.solid, total: st.total }))}</span><span>${esc(t('progress.dueNew', { due: st.due, fresh: st.fresh }))}</span></div><p class="hint">${esc(t('progress.hint'))}</p><div class="row"><button class="btn" id="srReset" style="flex:0 0 auto">${esc(t('progress.reset'))}</button></div>`;
}

function statsHtml(): string {
  const r = round!;
  const total = r.items.length;
  const done = Object.keys(r.first).length;
  const bandsHint =
    settings.set === 'city' && settings.kind === 'find'
      ? t('stats.bands', { right: CITY_DISTANCE_BANDS[0], close: CITY_DISTANCE_BANDS[1] })
      : settings.kind === 'town' && settings.set === 'riv'
        ? t('stats.bands', { right: RIVER_TOWN_DISTANCE_BANDS[0], close: RIVER_TOWN_DISTANCE_BANDS[1] })
        : '';
  return `<div class="card"><p class="k">${esc(t('stats.thisRound'))}</p><div class="prog"><i style="width:${(100 * done) / total}%"></i></div><div class="stats"><span>${esc(t('stats.seen', { done, total }))}</span><span>${esc(t('stats.firstTime', { count: r.score }))}</span></div>
 <div class="legend"><span><i style="background:var(--ok)"></i>${esc(t('legend.first'))}</span><span><i style="background:var(--y)"></i>${esc(t('legend.second'))}</span><span><i style="background:var(--or)"></i>${esc(t('legend.third'))}</span><span><i style="background:var(--red)"></i>${esc(t('legend.missed'))}</span></div>
 <p class="hint">${esc(t('stats.hint'))} ${esc(bandsHint)}</p>
 <div class="row"><button class="btn" id="rs">${esc(t('stats.restart'))}</button></div>${progressHtml()}</div>${tipsHtml()}`;
}

function infoHtml(): string {
  if (settings.set === 'tel') {
    const legend = `<div class="zleg">${ix.phoneZones
      .map(
        (z) =>
          `<div><i style="background:${hueFill(z.hue)}"></i><span><b>${z.zone}</b> ${esc(z.name)}: ${esc(z.description)}</span></div>`,
      )
      .join('')}</div><p class="hint">${esc(ix.copy.phoneHint)}</p>`;
    return (selected && ix.departmentByCode[selected] ? infoCard() : '') + `${CARD}${legend}</div>`;
  }
  if (settings.set === 'nom') {
    if (!selected) selected = ix.namePatterns[0].id;
    const chips = `<div class="chips" style="margin-top:12px">${ix.namePatterns.map((p) => `<button data-u="${p.id}" ${p.id === selected ? 'style="background:var(--ink);color:var(--bg)"' : ''}>${esc(p.label)}</button>`).join('')}</div>`;
    return chips + infoCard();
  }
  return infoCard();
}

function infoCard(): string {
  if (!selected) return `${CARD}<p>${esc(t('info.nothing'))}</p></div>`;
  const u = selected;
  let h = '';
  const d = ix.departmentByCode[u];
  if (ix.regionByKey[u]) {
    const r = ix.regionByKey[u];
    const units = termFor(ix.copy.departmentTerm, r.codes.length);
    h = `<h3>${esc(r.name)}</h3><p>${th('info.region', { capital: r.capital, count: r.codes.length, units })}</p><div class="chips">${r.codes.map((c) => `<button data-u="${c}">${codesShown() ? c + ' ' : ''}${esc(ix.departmentByCode[c].name)}</button>`).join('')}</div>`;
  } else if (settings.set === 'tel' && d) {
    const z = ix.zoneOfDepartment[d.code];
    const local = localPrefixes(d.code);
    h = `<h3>${esc(nameOf(d.code, 'full'))}</h3><p>${th('info.landlines', { zone: z, name: ix.phoneZoneById[z].name })}</p>${local.length ? `<p>${th('info.localPrefixes', { prefixes: local.map((p) => z + ' ' + p).join(', ') })}</p>` : ''}`;
  } else if (settings.set === 'nom' && d) {
    const ps = patternsIn(d.code);
    h = `<h3>${esc(nameOf(d.code, 'full'))}</h3><p>${esc(ps.length ? t('info.typicalEndings') : t('info.noPatterns'))}</p><div class="chips">${ps.map((p) => `<button data-u="${p.id}">${esc(p.label)}</button>`).join('')}</div>`;
  } else if (d) {
    const cities = ix.cities.filter((c) => c.code === d.code);
    const { seatLabel, regionTerm, plateLabel } = ix.copy;
    h = `<h3>${esc(nameOf(d.code, 'full'))}</h3><p>${esc(seatLabel)} <b>${esc(d.prefecture)}</b></p><p>${esc(regionTerm.one)} <b>${esc(ix.regionByKey[d.region].name)}</b></p>${plateLabel && d.plate ? `<p>${esc(plateLabel)} <b>${esc(d.plate)}</b></p>` : ''}${cities.length ? `<p>${th('info.citiesHere', { cities: cities.map((c) => c.name).join(', ') })}</p>` : ''}`;
  } else if (ix.patternById[u]) {
    const p = ix.patternById[u];
    const towns = p.towns
      .filter((town) => !town.extra)
      .map((town) => town.name)
      .join(', ');
    h = `<h3>${esc(p.label)}</h3><p><b>${esc(p.where)}</b></p><p>${esc(p.origin)}</p><p style="margin-top:6px">${th('info.examples', { towns })}</p><p class="hint">${esc(t('info.examplesHint'))}</p>`;
  } else if (ix.riverById[u]) {
    const r = ix.riverById[u];
    const length = th(r.lengthIsTotal ? 'info.riverLengthTotal' : 'info.riverLength', {
      km: r.lengthKm,
      country: ix.copy.countryName,
      into: r.flowsInto,
    });
    h = `<h3>${esc(r.name)}</h3><p>${length}</p><p style="margin-top:6px">${esc(t('info.riverTowns'))}</p><div class="chips">${r.towns.map((t) => `<span>${emphasizeJoiner(ix.riverTownById[t].name)}</span>`).join('')}</div>`;
  } else if (ix.cityById[u]) {
    const c = ix.cityById[u];
    const cd = ix.departmentByCode[c.code];
    const { departmentTerm, regionTerm } = ix.copy;
    h = `<h3>${esc(c.name)}</h3><p>${esc(departmentTerm.one)} <b>${codesShown() ? cd.code + ' ' : ''}${esc(cd.name)}</b></p><p>${esc(regionTerm.one)} <b>${esc(ix.regionByKey[c.region].name)}</b></p>`;
  }
  return `${CARD}${h}</div>`;
}

function tipsHtml(): string {
  const text = ix.copy.tips[settings.set] ?? '';
  return `<div class="card"><p class="k">${esc(t('tips.heading'))}</p><p style="margin:0;font-size:15px">${text}</p></div>`;
}

/* ---------- start ---------- */

/** Title, subtitle, set buttons, area labels and credits for the country. */
function renderChrome(): void {
  const { copy } = ix;
  const name = copy.countryName;
  document.title = t('app.title', { country: name });
  $('#title').innerHTML = th('app.h1', { country: name });
  $('#subtitle').textContent = copy.subtitle;
  svg.setAttribute('aria-label', t('map.label', { country: name }));
  $('#setSeg').innerHTML = ix.country.sets
    .map((set) => `<button data-v="${set}">${esc(setLabel(set))}</button>`)
    .join('');
  $('#telfLabel').textContent = copy.departmentTerm.many;
  // Department numbers only mean something where codes are shown.
  selectEl('#labs').querySelector<HTMLOptionElement>('option[value=num]')!.hidden = !codesShown();
  $('#credits').innerHTML = copy.credits;
}

/**
 * Switches the running trainer to `index` (the same country in another language): text is
 * re-rendered, while the map, settings and the round in progress are kept.
 */
export function relocalizeTrainer(index: CountryIndex): void {
  if (!ix) return;
  ix = index;
  tip.style.display = 'none';
  renderChrome();
  renderOptions();
  syncControls();
  panel();
}

export function startTrainer(index: CountryIndex, trainerStorage: TrainerStorage): void {
  ix = index;
  storage = trainerStorage;
  settings = normalizeSettings(storage.loadSettings(), validValues());
  if (settings.set !== 'riv' && settings.set !== 'nom' && settings.kind === 'town') settings.kind = 'find';
  if (settings.set !== 'city' && settings.kind === 'dot') settings.kind = 'find';
  renderChrome();
  progress = storage.loadProgress();
  bindControls();
  bindPointer();
  syncControls();
  panel();
  build();
  zoomView();
  if (settings.mode === 'practice') start();
  else {
    colorize();
    panel();
  }
}
