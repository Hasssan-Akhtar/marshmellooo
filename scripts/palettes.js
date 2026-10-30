// Palettes ported from the Claude Design file "Marshmallow Theme".
const P = {
  night: {
    page: { bg: '#17151E', surface: '#211E2B', fg: '#EDE6F5', muted: '#9C92B5', line: '#332E42', accent: '#FFB3D1' },
    editorBg: '#2B2838', fg: '#EDE6F5', border: '#1C1925', shadow: 'rgba(8,4,20,.55)',
    titleBg: '#1F1C28', titleFg: '#A79DC0', ccBg: '#2B2838', ccBorder: '#3A3548',
    actBg: '#1F1C28', actFg: '#FFB3D1', actInactive: '#6E6585', badgeBg: '#A8E6B8', badgeFg: '#1F1C28',
    sideBg: '#252230', sideFg: '#CFC6E2', sideTitle: '#8E84A8', listActiveBg: '#3A3450', listFocus: '#FFB3D1', ignored: '#6E6585',
    tabsBg: '#252230', tabBorder: '#1F1C28', tabInactiveBg: '#252230', tabInactiveFg: '#8E84A8', tabActiveBg: '#2B2838', tabActiveFg: '#EDE6F5', tabTop: '#FFB3D1',
    breadcrumb: '#8E84A8', breadcrumbActive: '#EDE6F5',
    lineHl: '#332F43', lineNo: '#5D5573', lineNoActive: '#C7A8FF', cursor: '#FFB3D1', selection: '#4D446B',
    gitAdd: '#8EDBA4', gitMod: '#8FC3FF', gitDel: '#FF8FA3', err: '#FF7A93', warn: '#FFC97A',
    hoverBg: '#353047', hoverBorder: '#4A4362', hoverFg: '#EDE6F5', hoverMuted: '#8E84A8', link: '#8FD3FF',
    miniSlider: 'rgba(237,230,245,.06)', rulerBorder: '#332F43',
    panelBg: '#252230', panelBorder: '#3A3548', panelTabActive: '#EDE6F5', panelTabInactive: '#8E84A8', panelTabBorder: '#FFB3D1',
    term: { fg: '#EDE6F5', r: '#FF8FA3', g: '#A8E6B8', y: '#FFE08F', b: '#8FD3FF', m: '#FF9EC7', cy: '#9FE7E0', d: '#7D7396', cur: '#FFB3D1' },
    statusBg: '#FFB3D1', statusFg: '#2B2838', remoteBg: '#C7A8FF', remoteFg: '#2B2838',
    qiBg: '#2F2B3D', qiFg: '#EDE6F5', inputBg: '#252230', inputBorder: '#FFB3D1', qiFocusBg: '#4D446B', qiFocusFg: '#FFFFFF', qiHl: '#FFB3D1', qiDesc: '#8E84A8',
    syn: { k: '#FF9EC7', f: '#8FD3FF', s: '#A8E6B8', n: '#FFC69E', t: '#C7A8FF', v: '#EDE6F5', p: '#FFE08F', c: '#7D7396', cn: '#FFC69E', tg: '#FF9EC7', at: '#FFE08F', o: '#A79DC0', plain: '#EDE6F5' },
    br: ['#FFB3D1', '#8FD3FF', '#FFE08F']
  },
  day: {
    page: { bg: '#EFE7E1', surface: '#FFFAF6', fg: '#3A3247', muted: '#8C7F99', line: '#E6DAD1', accent: '#D6428A' },
    editorBg: '#FFFAF6', fg: '#3A3247', border: '#E3D7CE', shadow: 'rgba(80,50,70,.22)',
    titleBg: '#F3EAE3', titleFg: '#8C7F99', ccBg: '#FFFAF6', ccBorder: '#E6DAD1',
    actBg: '#F3EAE3', actFg: '#D6428A', actInactive: '#B4A7BD', badgeBg: '#2E9C5A', badgeFg: '#FFFFFF',
    sideBg: '#F8F1EB', sideFg: '#4A4058', sideTitle: '#9A8DA6', listActiveBg: '#EBDDFB', listFocus: '#F27BB0', ignored: '#B4A7BD',
    tabsBg: '#F3EAE3', tabBorder: '#E9DED5', tabInactiveBg: '#F3EAE3', tabInactiveFg: '#9A8DA6', tabActiveBg: '#FFFAF6', tabActiveFg: '#3A3247', tabTop: '#F27BB0',
    breadcrumb: '#9A8DA6', breadcrumbActive: '#3A3247',
    lineHl: '#FBF0E8', lineNo: '#C6B9CC', lineNoActive: '#8152D6', cursor: '#E0559A', selection: '#EADFFC',
    gitAdd: '#4FBF78', gitMod: '#5AA6E8', gitDel: '#E8607E', err: '#E0435E', warn: '#D9932A',
    hoverBg: '#FFFFFF', hoverBorder: '#EADFD6', hoverFg: '#3A3247', hoverMuted: '#9A8DA6', link: '#2A86C9',
    miniSlider: 'rgba(58,50,71,.05)', rulerBorder: '#F1E7DF',
    panelBg: '#F8F1EB', panelBorder: '#E9DED5', panelTabActive: '#3A3247', panelTabInactive: '#9A8DA6', panelTabBorder: '#F27BB0',
    term: { fg: '#3A3247', r: '#D63E5C', g: '#2E9C5A', y: '#A87400', b: '#2A86C9', m: '#D6428A', cy: '#1F9C98', d: '#A496AE', cur: '#E0559A' },
    statusBg: '#FFC2DC', statusFg: '#3A3247', remoteBg: '#D9C6FF', remoteFg: '#3A3247',
    qiBg: '#FFFFFF', qiFg: '#3A3247', inputBg: '#F8F1EB', inputBorder: '#F27BB0', qiFocusBg: '#EADFFC', qiFocusFg: '#3A3247', qiHl: '#D6428A', qiDesc: '#9A8DA6',
    syn: { k: '#D6428A', f: '#2A86C9', s: '#2E9C5A', n: '#D9732A', t: '#8152D6', v: '#3A3247', p: '#A87400', c: '#A496AE', cn: '#D9732A', tg: '#D6428A', at: '#A87400', o: '#8C7F99', plain: '#3A3247' },
    br: ['#D6428A', '#2A86C9', '#C98A00']
  }
};

function ok(l, c, h) {
  const hr = h * Math.PI / 180, a = c * Math.cos(hr), b = c * Math.sin(hr);
  const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3, M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3, S = (l - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  const r = 4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S, g = -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S, bb = -0.0041960863 * L - 0.7034186147 * M + 1.7076147010 * S;
  const f = x => { x = Math.max(0, Math.min(1, x)); x = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055; return Math.round(x * 255).toString(16).padStart(2, '0'); };
  return ('#' + f(r) + f(g) + f(bb)).toUpperCase();
}
function genNight(p) {
  const N = (l, c = p.bc) => ok(l, c, p.bh), A = h => ok(0.82, 0.1, h), h = p.h;
  const editorBg = N(0.27), sideBg = N(0.245), actBg = N(0.22), fg = N(0.94, 0.018), accent = A(p.a), muted = N(0.67, 0.035);
  return {
    page: { bg: N(0.18), surface: N(0.23), fg, muted: N(0.7, 0.04), line: N(0.32), accent },
    editorBg, fg, border: N(0.2), shadow: 'rgba(8,4,20,.55)',
    titleBg: actBg, titleFg: N(0.72, 0.03), ccBg: editorBg, ccBorder: N(0.34),
    actBg, actFg: accent, actInactive: N(0.55, 0.03), badgeBg: A(h.s), badgeFg: actBg,
    sideBg, sideFg: N(0.86, 0.025), sideTitle: muted, listActiveBg: N(0.35, 0.05), listFocus: accent, ignored: N(0.52, 0.03),
    tabsBg: sideBg, tabBorder: actBg, tabInactiveBg: sideBg, tabInactiveFg: muted, tabActiveBg: editorBg, tabActiveFg: fg, tabTop: accent,
    breadcrumb: muted, breadcrumbActive: fg,
    lineHl: N(0.30), lineNo: N(0.47, 0.04), lineNoActive: A(h.t), cursor: accent, selection: N(0.38, 0.07),
    gitAdd: ok(0.82, 0.12, 150), gitMod: ok(0.78, 0.1, 245), gitDel: ok(0.74, 0.13, 10), err: ok(0.7, 0.16, 12), warn: ok(0.84, 0.12, 75),
    hoverBg: N(0.31), hoverBorder: N(0.38), hoverFg: fg, hoverMuted: muted, link: A(h.f),
    miniSlider: 'rgba(255,255,255,.06)', rulerBorder: N(0.3),
    panelBg: sideBg, panelBorder: N(0.33), panelTabActive: fg, panelTabInactive: muted, panelTabBorder: accent,
    term: { fg, r: ok(0.76, 0.12, 15), g: ok(0.84, 0.11, 150), y: ok(0.88, 0.11, 95), b: ok(0.8, 0.1, 235), m: ok(0.8, 0.12, 350), cy: ok(0.86, 0.08, 195), d: N(0.6, 0.04), cur: accent },
    statusBg: accent, statusFg: editorBg, remoteBg: A(p.a2), remoteFg: editorBg,
    qiBg: N(0.31), qiFg: fg, inputBg: sideBg, inputBorder: accent, qiFocusBg: N(0.4, 0.07), qiFocusFg: '#FFFFFF', qiHl: accent, qiDesc: muted,
    syn: { k: A(h.k), f: A(h.f), s: A(h.s), n: A(h.n), t: A(h.t), v: fg, p: A(h.p), c: N(0.6, 0.045), cn: A(h.n), tg: A(h.k), at: A(h.p), o: N(0.74, 0.04), plain: fg },
    br: [A(h.k), A(h.f), A(h.p)]
  };
}
function genDay(p) {
  const D = (l, c = p.bc * 0.6) => ok(l, c, p.bh), A = h => ok(0.57, 0.15, h), h = p.h;
  const editorBg = D(0.985, 0.008), sideBg = D(0.965, 0.012), actBg = D(0.945, 0.015), fg = D(0.3, 0.04), accent = A(p.a), muted = D(0.6, 0.04);
  const selection = ok(0.92, 0.05, h.t);
  return {
    page: { bg: D(0.93, 0.016), surface: editorBg, fg, muted: D(0.56, 0.04), line: D(0.88, 0.02), accent },
    editorBg, fg, border: D(0.89, 0.02), shadow: 'rgba(80,50,70,.22)',
    titleBg: actBg, titleFg: muted, ccBg: editorBg, ccBorder: D(0.9, 0.02),
    actBg, actFg: accent, actInactive: D(0.75, 0.03), badgeBg: A(h.s), badgeFg: '#FFFFFF',
    sideBg, sideFg: D(0.38, 0.04), sideTitle: muted, listActiveBg: selection, listFocus: accent, ignored: D(0.72, 0.03),
    tabsBg: actBg, tabBorder: D(0.91, 0.02), tabInactiveBg: actBg, tabInactiveFg: muted, tabActiveBg: editorBg, tabActiveFg: fg, tabTop: accent,
    breadcrumb: muted, breadcrumbActive: fg,
    lineHl: D(0.965, 0.015), lineNo: D(0.78, 0.03), lineNoActive: A(h.t), cursor: accent, selection,
    gitAdd: ok(0.68, 0.15, 150), gitMod: ok(0.65, 0.13, 245), gitDel: ok(0.62, 0.18, 10), err: ok(0.58, 0.2, 15), warn: ok(0.68, 0.15, 70),
    hoverBg: '#FFFFFF', hoverBorder: D(0.9, 0.02), hoverFg: fg, hoverMuted: muted, link: A(h.f),
    miniSlider: 'rgba(0,0,0,.05)', rulerBorder: D(0.94, 0.015),
    panelBg: sideBg, panelBorder: D(0.91, 0.02), panelTabActive: fg, panelTabInactive: muted, panelTabBorder: accent,
    term: { fg, r: ok(0.56, 0.18, 15), g: ok(0.58, 0.14, 150), y: ok(0.6, 0.13, 80), b: ok(0.56, 0.14, 240), m: ok(0.57, 0.17, 350), cy: ok(0.6, 0.1, 195), d: D(0.68, 0.03), cur: accent },
    statusBg: ok(0.86, 0.08, p.a), statusFg: fg, remoteBg: ok(0.84, 0.08, p.a2), remoteFg: fg,
    qiBg: '#FFFFFF', qiFg: fg, inputBg: sideBg, inputBorder: accent, qiFocusBg: selection, qiFocusFg: fg, qiHl: accent, qiDesc: muted,
    syn: { k: A(h.k), f: A(h.f), s: A(h.s), n: A(h.n), t: A(h.t), v: fg, p: ok(0.56, 0.13, h.p), c: D(0.68, 0.03), cn: A(h.n), tg: A(h.k), at: ok(0.56, 0.13, h.p), o: D(0.55, 0.04), plain: fg },
    br: [A(h.k), A(h.f), ok(0.56, 0.13, h.p)]
  };
}
const PRESET_SPECS = [
  { name: 'Bubblegum', bh: 340, bc: 0.03, a: 335, a2: 300, h: { k: 330, f: 215, s: 165, n: 55, t: 300, p: 90 } },
  { name: 'Mint Chip', bh: 175, bc: 0.025, a: 165, a2: 25, h: { k: 165, f: 230, s: 130, n: 30, t: 280, p: 85 } },
  { name: 'Peach Cobbler', bh: 45, bc: 0.025, a: 55, a2: 320, h: { k: 330, f: 200, s: 140, n: 60, t: 320, p: 85 } },
  { name: 'Blueberry Pie', bh: 265, bc: 0.04, a: 255, a2: 330, h: { k: 320, f: 240, s: 175, n: 40, t: 285, p: 95 } },
  { name: 'Matcha Latte', bh: 135, bc: 0.02, a: 135, a2: 80, h: { k: 135, f: 200, s: 100, n: 50, t: 340, p: 80 } },
  { name: 'Lemon Drop', bh: 95, bc: 0.02, a: 95, a2: 200, h: { k: 90, f: 225, s: 155, n: 40, t: 305, p: 110 } },
  { name: 'Cotton Candy', bh: 310, bc: 0.035, a: 320, a2: 220, h: { k: 330, f: 225, s: 190, n: 70, t: 290, p: 20 } },
  { name: 'Sea Glass', bh: 215, bc: 0.03, a: 200, a2: 150, h: { k: 200, f: 250, s: 150, n: 45, t: 290, p: 95 } },
  { name: 'Cherry Cola', bh: 345, bc: 0.03, a: 325, a2: 50, h: { k: 325, f: 210, s: 135, n: 55, t: 330, p: 80 } }
];
const PRESETS = [{ name: 'Marshmallow', night: P.night, day: P.day }].concat(PRESET_SPECS.map(p => ({ name: p.name, night: genNight(p), day: genDay(p) })));

module.exports = { PRESETS };
