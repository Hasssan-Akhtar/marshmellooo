// Sidebar flavour picker: an activity bar view that previews every flavour
// and applies it with one click.
const vscode = require('vscode');
const crypto = require('crypto');
const flavours = require('./media/flavours.json');

const THEME_KEY = 'workbench.colorTheme';
const MODES = { night: 'Night', day: 'Day' };

function currentTheme() {
  return vscode.workspace.getConfiguration().get(THEME_KEY) || '';
}

// Returns { name, mode } when the active theme is one of ours, else null.
function parseTheme(label) {
  for (const f of flavours) {
    for (const [mode, word] of Object.entries(MODES)) {
      if (label === `${f.name} ${word}`) return { name: f.name, mode };
    }
  }
  return null;
}

function applyTheme(name, mode) {
  return vscode.workspace
    .getConfiguration()
    .update(THEME_KEY, `${name} ${MODES[mode]}`, vscode.ConfigurationTarget.Global);
}

class FlavourView {
  constructor() {
    const active = parseTheme(currentTheme());
    const kind = vscode.window.activeColorTheme.kind;
    this.mode = active ? active.mode : kind === vscode.ColorThemeKind.Light ? 'day' : 'night';
  }

  resolveWebviewView(view) {
    this.view = view;
    view.webview.options = { enableScripts: true };
    view.webview.html = this.html(view.webview);
    view.webview.onDidReceiveMessage((msg) => {
      if (msg.type === 'apply') applyTheme(msg.name, this.mode);
      if (msg.type === 'mode') this.setMode(msg.mode);
    });
  }

  refresh() {
    const active = parseTheme(currentTheme());
    if (active) this.mode = active.mode;
    this.view?.webview.postMessage({ type: 'state', mode: this.mode, active: active && active.name });
  }

  // Switching mode re-applies the active flavour in the other mode, if one is active.
  setMode(mode) {
    this.mode = mode;
    const active = parseTheme(currentTheme());
    if (active && active.mode !== mode) applyTheme(active.name, mode);
    else this.refresh();
  }

  toggleMode() {
    this.setMode(this.mode === 'night' ? 'day' : 'night');
  }

  surprise() {
    const active = parseTheme(currentTheme());
    const others = flavours.filter((f) => !active || f.name !== active.name);
    const pick = others[Math.floor(Math.random() * others.length)];
    applyTheme(pick.name, this.mode);
  }

  html(webview) {
    const nonce = crypto.randomBytes(16).toString('base64');
    const active = parseTheme(currentTheme());
    const state = { mode: this.mode, active: active && active.name, flavours };
    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { padding: 8px 10px 16px; color: var(--vscode-foreground); font-family: var(--vscode-font-family); font-size: var(--vscode-font-size); }
  .modes { display: flex; gap: 4px; padding: 3px; border-radius: 999px; background: var(--vscode-input-background); margin-bottom: 12px; }
  .modes button { flex: 1; border: 0; padding: 5px 0; border-radius: 999px; cursor: pointer; font: inherit; color: var(--vscode-foreground); background: transparent; }
  .modes button.on { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
  .card { display: block; width: 100%; text-align: left; border: 2px solid transparent; border-radius: 10px; padding: 0; margin-bottom: 10px; cursor: pointer; overflow: hidden; font: inherit; }
  .card:hover { border-color: var(--vscode-focusBorder); }
  .card:focus-visible { outline: 2px solid var(--vscode-focusBorder); outline-offset: 2px; }
  .card.active { border-color: var(--accent); }
  .head { display: flex; align-items: center; gap: 8px; padding: 8px 10px 4px; }
  .dot { width: 10px; height: 10px; border-radius: 50%; flex: none; }
  .name { font-weight: 600; flex: 1; }
  .tick { font-size: 11px; padding: 1px 7px; border-radius: 999px; }
  .code { font-family: var(--vscode-editor-font-family); font-size: 12px; line-height: 1.55; padding: 4px 10px 6px; white-space: pre; overflow: hidden; }
  .foot { padding: 5px 10px 8px; font-size: 11px; opacity: .75; }
</style>
</head>
<body>
<div class="modes" role="group" aria-label="Mode">
  <button data-mode="night">Night</button>
  <button data-mode="day">Day</button>
</div>
<div id="list"></div>
<script nonce="${nonce}">
  const vscode = acquireVsCodeApi();
  let state = ${JSON.stringify(state)};

  const esc = (s) => s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const css = (fontStyle = '') =>
    (fontStyle.includes('italic') ? 'font-style:italic;' : '') +
    (fontStyle.includes('bold') ? 'font-weight:700;' : '') +
    (fontStyle.includes('underline') ? 'text-decoration:underline;' : '');
  const tok = (text, color, fontStyle) => '<span style="color:' + color + ';' + css(fontStyle) + '">' + esc(text) + '</span>';

  // A two-line snippet that shows off each flavour's colours and text style.
  function preview(f, c) {
    const s = c.syn, st = f.style;
    return [
      tok('// pick a treat', s.c, st.comment),
      tok('const', s.k, st.keyword) + tok(' snack ', c.fg) + tok('=', s.o) + ' ' + tok('bake', s.f, st.function) +
        tok('(', s.o) + tok('3', s.n) + tok(', ', s.o) + tok('"s\\'more"', s.s, st.string) + tok(')', s.o),
      tok('type', s.k, st.keyword) + ' ' + tok('Treat', s.t, st.type) + ' ' + tok('=', s.o) + ' ' +
        tok('{ ', s.o) + tok('sweet', s.p, st.property) + tok(': ', s.o) + tok('true', s.n) + tok(' }', s.o),
    ].join('\\n');
  }

  function render() {
    for (const b of document.querySelectorAll('.modes button')) b.classList.toggle('on', b.dataset.mode === state.mode);
    document.getElementById('list').innerHTML = state.flavours.map((f) => {
      const c = f[state.mode], on = f.name === state.active;
      return '<button class="card' + (on ? ' active' : '') + '" data-name="' + esc(f.name) + '"' +
        ' title="Apply ' + esc(f.name) + '" aria-pressed="' + on + '"' +
        ' style="background:' + c.bg + ';color:' + c.fg + ';--accent:' + c.accent + '">' +
        '<div class="head"><span class="dot" style="background:' + c.accent + '"></span>' +
        '<span class="name">' + esc(f.name) + '</span>' +
        (on ? '<span class="tick" style="background:' + c.accent + ';color:' + c.bg + '">Active</span>' : '') + '</div>' +
        '<div class="code" style="background:' + c.line + '">' + preview(f, c) + '</div>' +
        '<div class="foot">' + esc(f.blurb) + '</div></button>';
    }).join('');
  }

  document.addEventListener('click', (e) => {
    const mode = e.target.closest('[data-mode]');
    if (mode) return vscode.postMessage({ type: 'mode', mode: mode.dataset.mode });
    const card = e.target.closest('.card');
    if (card) vscode.postMessage({ type: 'apply', name: card.dataset.name });
  });
  window.addEventListener('message', (e) => {
    if (e.data.type === 'state') { state = { ...state, mode: e.data.mode, active: e.data.active }; render(); }
  });
  render();
</script>
</body>
</html>`;
  }
}

function activate(context) {
  const view = new FlavourView();
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('marshmallow.flavours', view),
    vscode.commands.registerCommand('marshmallow.toggleMode', () => view.toggleMode()),
    vscode.commands.registerCommand('marshmallow.surprise', () => view.surprise()),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(THEME_KEY)) view.refresh();
    }),
  );
}

module.exports = { activate };
