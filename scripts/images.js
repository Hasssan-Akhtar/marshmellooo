// Renders the extension icon and the Marketplace screenshots with headless
// Chrome, using the real flavour colours. Run with: npm run images
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const flavours = require('../media/flavours.json');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'images');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'marshmallow-images-'));

function render(name, html, width, height, scale = 2) {
  const file = path.join(tmp, `${name}.html`);
  fs.writeFileSync(file, html);
  const out = path.join(name === 'icon' ? root : outDir, `${name}.png`);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--force-device-scale-factor=${scale}`,
    `--window-size=${width},${height}`, `--screenshot=${out}`, `file://${file}`], { stdio: 'ignore' });
  console.log('wrote', path.relative(root, out));
}

const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const css = (fs = '') => (fs.includes('italic') ? 'font-style:italic;' : '') + (fs.includes('bold') ? 'font-weight:700;' : '') + (fs.includes('underline') ? 'text-decoration:underline;' : '');

// Each line is a list of [text, syntaxKey, styleKey]; plain text uses the foreground.
const CODE = [
  [['// a tiny snack scheduler', 'c', 'comment']],
  [['import', 'k', 'keyword'], [' { ', 'o'], ['bake', null], [' } ', 'o'], ['from', 'k', 'keyword'], [" './oven'", 's', 'string']],
  [],
  [['type', 'k', 'keyword'], [' ', null], ['Treat', 't', 'type'], [' = { ', 'o'], ['name', 'p', 'property'], [': ', 'o'], ['string', 't', 'type'], ['; ', 'o'], ['sweet', 'p', 'property'], [': ', 'o'], ['number', 't', 'type'], [' }', 'o']],
  [],
  [['export', 'k', 'keyword'], [' ', null], ['function', 'k', 'keyword'], [' ', null], ['pickSnack', 'f', 'function'], ['(', 'o'], ['hour', null, 'parameter'], [': ', 'o'], ['number', 't', 'type'], ['): ', 'o'], ['Treat', 't', 'type'], [' {', 'o']],
  [['  ', null], ['if', 'k', 'keyword'], [' (', 'o'], ['hour', null, 'parameter'], [' > ', 'o'], ['22', 'n'], [') ', 'o'], ['return', 'k', 'keyword'], [' ', null], ['bake', 'f', 'function'], ['(', 'o'], ['"s\'mores"', 's', 'string'], [', ', 'o'], ['3', 'n'], [')', 'o']],
  [['  ', null], ['return', 'k', 'keyword'], [' { ', 'o'], ['name', 'p', 'property'], [': ', 'o'], ['"marshmallow"', 's', 'string'], [', ', 'o'], ['sweet', 'p', 'property'], [': ', 'o'], ['10', 'n'], [' }', 'o']],
  [['}', 'o']],
];

function code(f, c, lineNo = true) {
  return CODE.map((line, i) => {
    const toks = line.map(([text, key, styleKey]) =>
      `<span style="color:${key ? c.syn[key] : c.fg};${css(f.style[styleKey])}">${esc(text)}</span>`).join('');
    return `<div class="ln" style="${i === 6 ? `background:${c.line}` : ''}">${lineNo ? `<i style="color:${c.syn.c}">${i + 1}</i>` : ''}${toks || '&nbsp;'}</div>`;
  }).join('');
}

// A small editor window: title bar, activity bar, tab, code and status bar.
function editor(f, mode, { width, label = true }) {
  const c = f[mode];
  return `<div class="ed" style="width:${width}px;background:${c.bg};color:${c.fg}">
    <div class="bar" style="background:${c.side}"><b style="background:${c.syn.k}"></b><b style="background:${c.syn.n}"></b><b style="background:${c.syn.s}"></b></div>
    <div class="body"><div class="act" style="background:${c.side}"><i style="background:${c.accent}"></i><i style="background:${c.syn.c}"></i><i style="background:${c.syn.c}"></i></div>
    <div class="main"><div class="tab" style="background:${c.side}"><span style="background:${c.bg};border-top:2px solid ${c.accent}">snacks.ts</span></div>
    <div class="code">${code(f, c)}</div></div></div>
    <div class="status" style="background:${c.accent};color:${c.bg}">${label ? `🍡 ${f.name} ${mode === 'night' ? 'Night' : 'Day'}` : ''}</div></div>`;
}

const BASE_CSS = `*{box-sizing:border-box;margin:0}body{font-family:-apple-system,system-ui,sans-serif}
.ed{border-radius:10px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.25)}
.bar{height:22px;display:flex;gap:6px;align-items:center;padding-left:10px}.bar b{width:9px;height:9px;border-radius:50%}
.body{display:flex}.act{width:30px;display:flex;flex-direction:column;align-items:center;gap:10px;padding-top:10px}.act i{width:14px;height:14px;border-radius:4px;opacity:.9}
.main{flex:1;min-width:0}.tab{height:26px;display:flex;align-items:flex-end}.tab span{font-size:11px;padding:5px 12px}
.code{font:12px/1.65 Menlo,Monaco,monospace;padding:8px 0;white-space:pre}.ln{padding:0 10px}.ln i{display:inline-block;width:22px;font-style:normal;opacity:.7}
.status{height:22px;font-size:11px;display:flex;align-items:center;justify-content:flex-end;padding-right:10px;font-weight:600}`;

// Ten flavours side by side in one mode.
function gallery(mode) {
  const page = mode === 'night' ? '#17151E' : '#EFE7E1';
  return `<!doctype html><meta charset="utf-8"><style>${BASE_CSS}body{background:${page};padding:28px}
  .grid{display:grid;grid-template-columns:repeat(2,560px);gap:24px}</style>
  <div class="grid">${flavours.map((f) => editor(f, mode, { width: 560 })).join('')}</div>`;
}

// The hero image: Marshmallow Night and Day overlapping.
function hero() {
  const f = flavours[0];
  return `<!doctype html><meta charset="utf-8"><style>${BASE_CSS}body{background:#17151E;padding:40px;position:relative;height:100vh}
  .a{position:absolute;left:40px;top:40px}.b{position:absolute;left:420px;top:120px}</style>
  <div class="a">${editor(f, 'night', { width: 620 })}</div><div class="b">${editor(f, 'day', { width: 620 })}</div>`;
}

fs.mkdirSync(outDir, { recursive: true });
render('icon', `<!doctype html><style>body{margin:0;background:transparent}</style>${fs.readFileSync(path.join(root, 'media', 'icon.svg'), 'utf8')}`, 256, 256, 1);
render('hero', hero(), 1100, 440);
render('flavours-night', gallery('night'), 1200, 1470);
render('flavours-day', gallery('day'), 1200, 1470);
fs.rmSync(tmp, { recursive: true, force: true });
