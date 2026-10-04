// Spell palette generator — OKLCH ladders with fine top/bottom steps.
// Used by tokens build, the Palette page and the Color-set chooser.
export const STEPS = [25, 50, 75, 100, 150, 200, 300, 400, 500, 600, 700, 800, 850, 900, 925, 950, 975];
// Target lightness per step (neutral ladder; chromatic sets bend it toward their seed)
export const LADDER = { 25: .992, 50: .979, 75: .965, 100: .948, 150: .922, 200: .892, 300: .82, 400: .72, 500: .63, 600: .55, 700: .47, 800: .39, 850: .345, 900: .30, 925: .265, 950: .225, 975: .175 };
// Relative chroma per step (1 = seed chroma at 500)
export const CHROMA = { 25: .1, 50: .16, 75: .22, 100: .29, 150: .4, 200: .52, 300: .74, 400: .93, 500: 1, 600: .97, 700: .88, 800: .76, 850: .68, 900: .6, 925: .53, 950: .46, 975: .36 };

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lin = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const gam = c => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function hexToRgb(hex) { const h = hex.replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map(x => x + x).join('') : h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => v / 255); }
export function rgbToHex(rgb) { return '#' + rgb.map(v => Math.round(clamp(v, 0, 1) * 255).toString(16).padStart(2, '0')).join('').toUpperCase(); }
export function rgbToOklch([r, g, b]) {
  r = lin(r); g = lin(g); b = lin(b);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { l: L, c: Math.hypot(A, B), h: (Math.atan2(B, A) * 180 / Math.PI + 360) % 360 };
}
export function oklchToRgbRaw({ l, c, h }) {
  const a = c * Math.cos(h * Math.PI / 180), b = c * Math.sin(h * Math.PI / 180);
  const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const S = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S, -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S, -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S].map(gam);
}
const inGamut = rgb => rgb.every(v => v >= -0.0005 && v <= 1.0005);
export function oklchToHex(o) {
  let c = o.c, rgb = oklchToRgbRaw({ ...o, c });
  if (!inGamut(rgb)) { let lo = 0, hi = c; for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; if (inGamut(oklchToRgbRaw({ ...o, c: mid }))) lo = mid; else hi = mid; } rgb = oklchToRgbRaw({ ...o, c: lo }); }
  return rgbToHex(rgb);
}
export const hexToOklch = hex => rgbToOklch(hexToRgb(hex));
export function luminance(hex) { const [r, g, b] = hexToRgb(hex).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
export function contrast(a, b) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
export function nearestStep(l) { return STEPS.reduce((best, s) => (Math.abs(LADDER[s] - l) < Math.abs(LADDER[best] - l) ? s : best), 500); }

/**
 * Build a scale from a seed colour.  The seed lands EXACTLY on its anchor step (auto = nearest lightness);
 * lightness bends smoothly toward the seed, fixed at the ends;  chroma follows CHROMA relative to the anchor.
 * opts: { anchor, hueShift (deg added toward dark end), chromaScale }
 */
export function generateScale(seedHex, opts = {}) {
  const seed = hexToOklch(seedHex);
  const anchor = opts.anchor || nearestStep(seed.l);
  const dL = seed.l - LADDER[anchor];
  const kA = CHROMA[anchor];
  const cs = opts.chromaScale ?? 1;
  const hueShift = opts.hueShift ?? 0;
  const out = {};
  for (const s of STEPS) {
    if (s === anchor) { out[s] = seedHex.toUpperCase(); continue; }
    const t = s < anchor ? s / anchor : (1000 - s) / (1000 - anchor);
    const w = Math.sin(clamp(t, 0, 1) * Math.PI / 2) ** 1.4;
    const l = clamp(LADDER[s] + dL * w, 0.08, 0.995);
    const c = seed.c * (CHROMA[s] / kA) * cs;
    const h = seed.h + hueShift * ((s - anchor) / 1000);
    out[s] = oklchToHex({ l, c, h });
  }
  return { anchor, seed: seedHex.toUpperCase(), scale: out };
}

// Tailwind v4 500-step seeds (OKLCH) — regenerated on our 17-step ladder
export const TW_SEEDS = {
  red: [.637, .237, 25.3], orange: [.705, .213, 47.6], amber: [.769, .188, 70.1], yellow: [.795, .184, 86.0],
  lime: [.768, .233, 130.9], green: [.723, .219, 149.6], emerald: [.696, .17, 162.5], teal: [.704, .14, 182.5],
  cyan: [.715, .143, 215.2], sky: [.685, .169, 237.3], blue: [.623, .214, 259.8], indigo: [.585, .233, 277.1],
  violet: [.606, .25, 292.7], purple: [.627, .265, 303.9], fuchsia: [.667, .295, 322.2], pink: [.656, .241, 354.3], rose: [.645, .246, 16.4]
};
// Spell Purple, hue nudged 292°→286° toward House of Owen (274°)
export const SPELL = { purple: '#6550CA' };
export const BRAND = { brand: { hex: '#8E96B5', label: 'Brand', note: 'House of Owen · Valspar 8003-47D' }, accent: { hex: '#F1E7D4', label: 'Accent', note: 'Polished Ivory · Valspar 7006-6' } };

export function buildPalette() {
  const sets = [];
  sets.push({ name: 'brand', ...BRAND.brand, ...generateScale(BRAND.brand.hex, { anchor: 500 }) });
  sets.push({ name: 'accent', ...BRAND.accent, ...generateScale(BRAND.accent.hex) });
  for (const [name, [l, c, h]] of Object.entries(TW_SEEDS)) {
    if (name === 'violet') { sets.push({ name, label: 'Violet', note: 'Tuned: Spell Purple at 600, Aubergine at 925', ...generateScale(SPELL.purple, { anchor: 600 }) }); continue; }
    sets.push({ name, label: name[0].toUpperCase() + name.slice(1), ...generateScale(oklchToHex({ l, c, h }), { anchor: 500 }) });
  }
  const hoo = hexToOklch(BRAND.brand.hex);
  sets.push({ name: 'grey', label: 'Grey', note: 'Neutral, tinted toward brand hue', ...generateScale(oklchToHex({ l: .63, c: .014, h: hoo.h }), { anchor: 500 }) });
  return sets;
}
