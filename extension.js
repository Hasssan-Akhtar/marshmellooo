// Marshmallow extension: the Flavours sidebar, status bar picker, per-flavour
// personality (cursor and spacing), project pins, Follow the Sun and
// Flavour of the Day, and custom flavours made in the sidebar.
const vscode = require('vscode');
const crypto = require('crypto');
const builtIns = require('./media/flavours.json');
const { ok, themeFor, STYLES, BASES, ACCENTS, customPalettes, customFlavour, slotName, DEFAULT_CUSTOM } = require('./lib/theme');

const THEME_KEY = 'workbench.colorTheme';
const DARK_KEY = 'workbench.preferredDarkColorTheme';
const LIGHT_KEY = 'workbench.preferredLightColorTheme';
const AUTO_KEY = 'window.autoDetectColorScheme';
const MODES = { night: 'Night', day: 'Day' };
const PERSONALITY_KEYS = ['cursorStyle', 'cursorWidth', 'cursorBlinking', 'cursorSmoothCaretAnimation', 'lineHeight', 'letterSpacing'];
const { Global, Workspace } = vscode.ConfigurationTarget;

const config = () => vscode.workspace.getConfiguration();
const setting = (key) => vscode.workspace.getConfiguration('marshmallow').get(key);
const label = (name, mode) => `${name} ${MODES[mode]}`;
const CUSTOM_SLOTS = [1, 2, 3];
const CUSTOM_KEYS = {
  colors: 'workbench.colorCustomizations',
  tokens: 'editor.tokenColorCustomizations',
  semantic: 'editor.semanticTokenColorCustomizations',
};

// Saved custom flavour specs by slot, loaded from globalState in activate().
let customs = {};
let globalState;
let trying = null; // the live try-on in progress, see "Live try-on" below
const allFlavours = () => {
  const saved = CUSTOM_SLOTS.filter((n) => customs[n]).map((n) => customFlavour(customs[n]));
  // A brand-new flavour being tried on isn't saved yet, but VS Code is showing it.
  if (trying?.isNew && trying.spec) saved.push({ ...customFlavour(trying.spec), trying: true });
  return builtIns.concat(saved);
};
const byName = (name) => allFlavours().find((f) => f.name === name);
// What people see: a custom flavour's own name rather than its slot.
const title = (name) => byName(name)?.display || name;
const titled = (name, mode) => `${title(name)} ${MODES[mode]}`;
const hasWorkspace = () => !!vscode.workspace.workspaceFolders?.length;

// Returns { name, mode } when the label is one of ours, else null.
function parseTheme(text) {
  for (const f of allFlavours()) {
    for (const mode of Object.keys(MODES)) {
      if (text === label(f.name, mode)) return { name: f.name, mode };
    }
  }
  return null;
}

// The theme VS Code is actually showing. With OS matching on, that's one of
// the preferred themes rather than workbench.colorTheme.
function activeFlavour() {
  if (config().get(AUTO_KEY)) {
    const light = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Light;
    return parseTheme(config().get(light ? LIGHT_KEY : DARK_KEY) || '');
  }
  return parseTheme(config().get(THEME_KEY) || '');
}

function pinnedFlavour() {
  return parseTheme(config().inspect(THEME_KEY)?.workspaceValue || '');
}

// Writes a setting only when it differs, so several open windows don't churn.
async function put(key, value, target) {
  const info = config().inspect(key);
  const current = target === Workspace ? info?.workspaceValue : info?.globalValue;
  if (current !== value) await config().update(key, value, target);
}

// Applies a flavour where it currently lives: the project if pinned, else globally.
async function applyFlavour(name, mode, target = pinnedFlavour() ? Workspace : Global) {
  await put(THEME_KEY, label(name, mode), target);
  if (setting('followTheSun') === 'system') {
    await put(DARK_KEY, label(name, 'night'), target);
    await put(LIGHT_KEY, label(name, 'day'), target);
  }
}

// ---- Personality: cursor and spacing per flavour --------------------------

class Personality {
  constructor(state) {
    this.state = state;
  }

  // Saves the user's own values once, before we first overwrite them.
  async saveOriginals() {
    if (this.state.get('originals')) return;
    const editor = vscode.workspace.getConfiguration('editor');
    const originals = {};
    for (const key of PERSONALITY_KEYS) originals[key] = editor.inspect(key)?.globalValue ?? null;
    await this.state.update('originals', originals);
  }

  async apply() {
    const active = activeFlavour();
    if (!setting('personality') || !active) return;
    await this.saveOriginals();
    const editor = vscode.workspace.getConfiguration('editor');
    const values = byName(active.name).personality;
    for (const key of PERSONALITY_KEYS) {
      if (editor.get(key) !== values[key]) await editor.update(key, values[key], Global);
    }
  }

  async restore() {
    const originals = this.state.get('originals');
    if (!originals) return;
    const editor = vscode.workspace.getConfiguration('editor');
    for (const key of PERSONALITY_KEYS) await editor.update(key, originals[key] ?? undefined, Global);
    await this.state.update('originals', undefined);
  }
}

// ---- Follow the Sun -------------------------------------------------------

function minutes(hhmm, fallback) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm || '');
  return m ? Number(m[1]) * 60 + Number(m[2]) : fallback;
}

function modeForNow() {
  const now = new Date();
  const t = now.getHours() * 60 + now.getMinutes();
  const day = minutes(setting('dayStartsAt'), 7 * 60);
  const night = minutes(setting('nightStartsAt'), 19 * 60);
  const isDay = day < night ? t >= day && t < night : t >= day || t < night;
  return isDay ? 'day' : 'night';
}

class FollowTheSun {
  constructor(state) {
    this.state = state;
    this.lastMode = null;
    this.timer = null;
  }

  // Re-reads the setting and sets up OS matching or the clock.
  async configure() {
    clearInterval(this.timer);
    this.timer = null;
    this.lastMode = null;
    const how = setting('followTheSun');
    const active = activeFlavour() || pinnedFlavour();

    if (how === 'system') {
      if (active) {
        const target = pinnedFlavour() ? Workspace : Global;
        await put(DARK_KEY, label(active.name, 'night'), target);
        await put(LIGHT_KEY, label(active.name, 'day'), target);
      }
      // Remember that we turned OS matching on, so we only ever undo our own change.
      if (!config().inspect(AUTO_KEY)?.globalValue) {
        await config().update(AUTO_KEY, true, Global);
        await this.state.update('setAutoDetect', true);
      }
      return;
    }
    if (this.state.get('setAutoDetect')) {
      await config().update(AUTO_KEY, undefined, Global);
      await this.state.update('setAutoDetect', undefined);
    }
    if (how === 'time') {
      this.tick();
      this.timer = setInterval(() => this.tick(), 60 * 1000);
    }
  }

  // Only acts when the clock crosses a boundary, so a manual Night/Day
  // switch sticks until the next sunrise or sunset.
  tick() {
    const mode = modeForNow();
    if (mode === this.lastMode) return;
    this.lastMode = mode;
    const active = activeFlavour();
    if (active && active.mode !== mode) applyFlavour(active.name, mode);
  }

  dispose() {
    clearInterval(this.timer);
  }
}

// ---- Flavour of the Day ---------------------------------------------------

async function flavourOfTheDay(state) {
  if (!setting('flavourOfTheDay') || pinnedFlavour()) return;
  const today = new Date().toDateString();
  if (state.get('flavourOfTheDay') === today) return;
  await state.update('flavourOfTheDay', today);
  const active = activeFlavour();
  const mode = setting('followTheSun') === 'time' ? modeForNow() : active ? active.mode : 'night';
  const others = builtIns.filter((f) => !active || f.name !== active.name);
  const pick = others[Math.floor(Math.random() * others.length)];
  await applyFlavour(pick.name, mode);
  vscode.window.showInformationMessage(`🍡 Today's flavour: ${pick.name}. ${pick.blurb}`);
}

// ---- Status bar and quick pick --------------------------------------------

class StatusBar {
  constructor() {
    this.item = vscode.window.createStatusBarItem('marshmallow.flavour', vscode.StatusBarAlignment.Right, 100);
    this.item.name = 'Marshmallow Flavour';
    this.item.command = 'marshmallow.pick';
  }

  refresh() {
    const active = activeFlavour();
    if (!setting('statusBar') || !active) return this.item.hide();
    const pinned = pinnedFlavour();
    this.item.text = `🍡 ${titled(active.name, active.mode)}${pinned ? ' $(pin)' : ''}`;
    this.item.tooltip = `${byName(active.name).blurb}${pinned ? '\nPinned to this project.' : ''}\nClick to pick another flavour.`;
    this.item.show();
  }

  dispose() {
    this.item.dispose();
  }
}

async function pickFlavour() {
  const active = activeFlavour();
  const items = [];
  for (const mode of Object.keys(MODES)) {
    items.push({ label: MODES[mode], kind: vscode.QuickPickItemKind.Separator });
    for (const f of allFlavours()) {
      const on = active && active.name === f.name && active.mode === mode;
      items.push({ label: `${on ? '$(check) ' : ''}${titled(f.name, mode)}`, description: f.blurb, name: f.name, mode });
    }
  }
  const choice = await vscode.window.showQuickPick(items, { placeHolder: 'Pick a Marshmallow flavour', matchOnDescription: true });
  if (choice?.name) await applyFlavour(choice.name, choice.mode);
}

// ---- Sidebar view ---------------------------------------------------------

class FlavourView {
  constructor() {
    const active = activeFlavour();
    const kind = vscode.window.activeColorTheme.kind;
    this.mode = active ? active.mode : kind === vscode.ColorThemeKind.Light ? 'day' : 'night';
  }

  resolveWebviewView(view) {
    this.view = view;
    view.webview.options = { enableScripts: true };
    view.webview.html = this.html();
    view.webview.onDidReceiveMessage((msg) => {
      if (msg.type === 'apply') applyFlavour(msg.name, this.mode);
      if (msg.type === 'mode') this.setMode(msg.mode);
      if (msg.type === 'pin') vscode.commands.executeCommand('marshmallow.pinToProject');
      if (msg.type === 'unpin') vscode.commands.executeCommand('marshmallow.unpinFromProject');
      if (msg.type === 'setting') vscode.workspace.getConfiguration('marshmallow').update(msg.key, msg.value, Global);
      if (msg.type === 'preview') {
        view.webview.postMessage({ type: 'preview', flavour: customFlavour({ ...msg.spec, slot: 0 }) });
        tryOn(msg.spec, this.currentMode());
      }
      if (msg.type === 'cancel') endTryOn(false);
      if (msg.type === 'save') saveCustom(msg.spec, this.currentMode());
      if (msg.type === 'delete') deleteCustom(msg.slot);
    });
    // The builder's draft lives in the webview, so hiding the panel abandons it.
    view.onDidChangeVisibility(() => {
      if (!view.visible) endTryOn(false);
    });
    view.onDidDispose(() => {
      endTryOn(false);
    });
  }

  // The mode actually showing, falling back to the panel's switch.
  currentMode() {
    return activeFlavour()?.mode ?? this.mode;
  }

  state() {
    const active = activeFlavour();
    if (active) this.mode = active.mode;
    const m = vscode.workspace.getConfiguration('marshmallow');
    return {
      flavours: allFlavours(),
      freeSlot: CUSTOM_SLOTS.find((n) => !customs[n]) ?? null,
      mode: this.mode,
      active: active && active.name,
      pinned: !!pinnedFlavour(),
      canPin: hasWorkspace(),
      settings: {
        personality: m.get('personality'),
        followTheSun: m.get('followTheSun'),
        flavourOfTheDay: m.get('flavourOfTheDay'),
        statusBar: m.get('statusBar'),
      },
    };
  }

  refresh() {
    this.view?.webview.postMessage({ type: 'state', ...this.state() });
  }

  // Switching mode re-applies the active flavour in the other mode, if one is active.
  setMode(mode) {
    this.mode = mode;
    const active = activeFlavour();
    if (active && active.mode !== mode) applyFlavour(active.name, mode);
    else this.refresh();
  }

  toggleMode() {
    this.setMode(this.mode === 'night' ? 'day' : 'night');
  }

  surprise() {
    const active = activeFlavour();
    const others = allFlavours().filter((f) => !active || f.name !== active.name);
    const pick = others[Math.floor(Math.random() * others.length)];
    applyFlavour(pick.name, this.mode);
  }

  html() {
    const nonce = crypto.randomBytes(16).toString('base64');
    const cspSource = this.view.webview.cspSource;
    const init = { ...this.state(), builder: builderOptions() };
    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { padding: 8px 10px 16px; color: var(--vscode-foreground); font-family: var(--vscode-font-family); font-size: var(--vscode-font-size); }
  .modes { display: flex; gap: 4px; padding: 3px; border-radius: 999px; background: var(--vscode-input-background); margin-bottom: 12px; }
  .modes button { flex: 1; border: 0; padding: 5px 0; border-radius: 999px; cursor: pointer; font: inherit; color: var(--vscode-foreground); background: transparent; }
  .modes button:disabled { cursor: default; opacity: .6; }
  .modes button.on { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
  .item { margin-bottom: 4px; }
  .item.active { margin: 8px 0; }
  .card { display: block; width: 100%; text-align: left; border: 2px solid transparent; border-radius: 8px; padding: 0; cursor: pointer; overflow: hidden; font: inherit; }
  .card:hover { border-color: var(--vscode-focusBorder); }
  .card:focus-visible { outline: 2px solid var(--vscode-focusBorder); outline-offset: 2px; }
  .card.active { border-color: var(--accent); border-bottom-left-radius: 0; border-bottom-right-radius: 0; }
  .head { display: flex; align-items: center; gap: 8px; padding: 5px 8px; }
  .active .head { padding: 8px 10px 4px; }
  .chips { display: flex; gap: 3px; }
  .chips i { width: 7px; height: 7px; border-radius: 2px; }
  .dot { width: 10px; height: 10px; border-radius: 50%; flex: none; }
  .name { font-weight: 600; flex: 1; }
  .tick { font-size: 11px; padding: 1px 7px; border-radius: 999px; }
  .code { font-family: var(--vscode-editor-font-family); font-size: 12px; line-height: 1.55; padding: 4px 10px 6px; white-space: pre; overflow: hidden; }
  .foot { padding: 5px 10px 8px; font-size: 11px; opacity: .75; }
  .pin { display: flex; align-items: center; gap: 8px; padding: 6px 10px; font-size: 11px; border: 2px solid var(--accent); border-top: 0; border-radius: 0 0 10px 10px; }
  .pin span { flex: 1; opacity: .85; }
  .pin button { border: 0; border-radius: 999px; padding: 3px 10px; cursor: pointer; font: inherit; background: var(--accent); color: var(--bg); }
  summary { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; opacity: .7; margin: 14px 0 6px; font-weight: 600; cursor: pointer; }
  /* Extras take the active flavour's accent, falling back to the editor's button colour. */
  body { --x-on: var(--vscode-button-background); --x-on-fg: var(--vscode-button-foreground); --x-off: var(--vscode-input-background); }
  .row { display: flex; align-items: center; gap: 10px; margin: 10px 0; }
  .row .text { flex: 1; }
  .row small { display: block; color: var(--vscode-descriptionForeground); }
  .switch { position: relative; flex: none; width: 30px; height: 17px; border: 0; padding: 0; border-radius: 999px; background: var(--x-off); cursor: pointer; transition: background .15s; }
  .switch::after { content: ''; position: absolute; top: 3px; left: 3px; width: 11px; height: 11px; border-radius: 50%; background: var(--vscode-descriptionForeground); transition: left .15s, background .15s; }
  .switch[aria-checked=true] { background: var(--x-on); }
  .switch[aria-checked=true]::after { left: 16px; background: var(--x-on-fg); }
  .switch:focus-visible, .seg button:focus-visible { outline: 2px solid var(--vscode-focusBorder); outline-offset: 2px; }
  .seg { display: flex; gap: 2px; padding: 2px; margin-top: 5px; border-radius: 999px; background: var(--x-off); }
  .seg button { flex: 1; border: 0; padding: 4px 0; border-radius: 999px; cursor: pointer; font: inherit; font-size: 11px; color: var(--vscode-foreground); background: transparent; }
  .seg button[aria-checked=true] { background: var(--x-on); color: var(--x-on-fg); }
  .item { position: relative; }
  .item.custom .head { padding-right: 34px; }
  .edit { position: absolute; top: 4px; right: 4px; width: 24px; height: 22px; border: 0; border-radius: 6px; cursor: pointer; font: inherit; background: transparent; color: inherit; opacity: .8; }
  .edit:hover { opacity: 1; background: rgba(127,127,127,.25); }
  .make { display: block; width: 100%; margin: 8px 0 4px; padding: 7px 8px; text-align: left; font: inherit; cursor: pointer; border-radius: 8px; color: var(--vscode-foreground); background: transparent; border: 1px dashed var(--vscode-descriptionForeground); }
  .make:hover { border-style: solid; }
  .make.full { cursor: default; opacity: .6; border-style: dashed; }
  .builder { border: 2px solid var(--accent); border-radius: 8px; padding: 10px; margin: 8px 0; }
  .b-head { font-weight: 600; }
  .b-lab { display: block; font-size: 11px; opacity: .75; margin: 10px 0 5px; }
  .dots { display: flex; gap: 6px; flex-wrap: wrap; }
  .sw-dot { width: 18px; height: 18px; border-radius: 50%; border: 0; padding: 0; cursor: pointer; box-shadow: inset 0 0 0 1px rgba(127,127,127,.35); }
  .sw-dot[aria-pressed=true] { outline: 2px solid currentColor; outline-offset: 2px; }
  .builder input, .builder select { width: 100%; box-sizing: border-box; font: inherit; color: inherit; background: var(--line); border: 1px solid rgba(127,127,127,.35); border-radius: 6px; padding: 5px 8px; }
  .builder .seg { background: var(--line); }
  .builder .seg button { color: inherit; }
  .builder .seg button[aria-checked=true] { background: var(--accent); color: var(--bg); }
  .b-actions { display: flex; gap: 6px; margin-top: 10px; align-items: center; }
  .b-actions button { border: 1px solid rgba(127,127,127,.4); background: transparent; color: inherit; border-radius: 999px; padding: 4px 10px; font: inherit; font-size: 11px; cursor: pointer; }
  .b-actions .primary { background: var(--accent); color: var(--bg); border-color: var(--accent); }
</style>
</head>
<body>
<div class="modes" role="group" aria-label="Mode">
  <button data-mode="night">Night</button>
  <button data-mode="day">Day</button>
</div>
<div id="list"></div>
<details id="extras"><summary>Extras</summary>
<div class="row"><span class="text" id="l-personality">Personality<small>Each flavour's own cursor and spacing</small></span>
  <button class="switch" role="switch" data-toggle="personality" aria-labelledby="l-personality"></button></div>
<div class="row" style="display:block"><span id="l-sun">Follow the sun<small>Switch Night/Day automatically</small></span>
  <div class="seg" role="radiogroup" aria-labelledby="l-sun">
    <button role="radio" data-sun="off">Off</button><button role="radio" data-sun="system" title="Match your OS light/dark appearance">OS</button><button role="radio" data-sun="time" title="Day 07:00, Night 19:00 (change in Settings)">Time</button>
  </div></div>
<div class="row"><span class="text" id="l-daily">Flavour of the day<small>A random flavour each morning</small></span>
  <button class="switch" role="switch" data-toggle="flavourOfTheDay" aria-labelledby="l-daily"></button></div>
<div class="row"><span class="text" id="l-status">Status bar treat<small>Show the flavour in the status bar</small></span>
  <button class="switch" role="switch" data-toggle="statusBar" aria-labelledby="l-status"></button></div>
</details>
<script nonce="${nonce}">
  const vscode = acquireVsCodeApi();
  let state = ${JSON.stringify(init)};

  const esc = (s) => s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const css = (fontStyle = '') =>
    (fontStyle.includes('italic') ? 'font-style:italic;' : '') +
    (fontStyle.includes('bold') ? 'font-weight:700;' : '') +
    (fontStyle.includes('underline') ? 'text-decoration:underline;' : '');
  const tok = (text, color, fontStyle) => '<span style="color:' + color + ';' + css(fontStyle) + '">' + esc(text) + '</span>';

  // A short snippet that shows off each flavour's colours and text style.
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

  function pinBar(c) {
    if (!state.canPin) return '';
    return '<div class="pin" style="background:' + c.bg + ';color:' + c.fg + ';--bg:' + c.bg + '">' +
      (state.pinned
        ? '<span>📌 Pinned to this project</span><button data-action="unpin">Unpin</button>'
        : '<span>Use this flavour for this project only</span><button data-action="pin">Pin</button>') +
      '</div>';
  }

  // ---- Make your own --------------------------------------------------------
  let draft = null, draftPreview = null;
  const named = (f) => f.display || f.name;

  function openBuilder(spec) {
    draft = spec ? { ...spec } : { ...state.builder.defaults, display: '' };
    draftPreview = null;
    vscode.postMessage({ type: 'preview', spec: draft });
    render();
  }
  // A random take on every choice except the name.
  const any = (list) => list[Math.floor(Math.random() * list.length)];
  function shuffled() {
    const b = state.builder;
    return {
      base: any(b.bases).hue,
      accent: any(b.accents).hue,
      sweetness: any(['subtle', 'sweet', 'rush']),
      like: any(b.likes),
      order: [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5),
    };
  }
  const updateDraft = (change) => { Object.assign(draft, change); vscode.postMessage({ type: 'preview', spec: draft }); };

  function builderHtml() {
    if (!draftPreview) return '<div class="builder" style="--accent:var(--vscode-focusBorder)">Mixing your flavour…</div>';
    const f = draftPreview, c = f[state.mode], b = state.builder;
    const dots = (list, key) => list.map((o) => '<button class="sw-dot" data-pick="' + key + '" data-hue="' + o.hue + '"' +
      ' aria-label="' + key + ' colour" aria-pressed="' + (draft[key] === o.hue) + '" style="background:' + o[state.mode] + '"></button>').join('');
    const sweet = [['subtle', 'Subtle'], ['sweet', 'Sweet'], ['rush', 'Sugar rush']].map(([v, t]) =>
      '<button role="radio" data-sweet="' + v + '" aria-checked="' + (draft.sweetness === v) + '">' + t + '</button>').join('');
    const likes = b.likes.map((n) => '<option' + (n === draft.like ? ' selected' : '') + '>' + esc(n) + '</option>').join('');
    return '<div class="builder" style="background:' + c.bg + ';color:' + c.fg + ';--accent:' + c.accent + ';--bg:' + c.bg + ';--line:' + c.line + '">' +
      '<div class="b-head"><span style="color:' + c.accent + '">✦</span> ' + (draft.slot ? 'Edit your flavour' : 'Make your own') + '</div>' +
      '<label class="b-lab" for="b-name">Name</label><input id="b-name" maxlength="40" placeholder="Hot Cocoa" value="' + esc(draft.display || '') + '">' +
      '<div class="b-lab">Base</div><div class="dots">' + dots(b.bases, 'base') + '</div>' +
      '<div class="b-lab">Accent</div><div class="dots">' + dots(b.accents, 'accent') + '</div>' +
      '<div class="b-lab">Sweetness</div><div class="seg" role="radiogroup" aria-label="Sweetness">' + sweet + '</div>' +
      '<label class="b-lab" for="b-like">Text style and cursor like</label><select id="b-like">' + likes + '</select>' +
      '<div class="code" style="background:' + c.line + ';border-radius:6px;margin-top:10px">' + preview(f, c) + '</div>' +
      '<div class="b-actions"><button data-b="shuffle" title="Surprise me: random colours, sweetness and style">🎲 Shuffle</button>' +
      (draft.slot ? '<button data-b="delete">Delete</button>' : '') +
      '<span style="flex:1"></span><button data-b="cancel">Cancel</button><button data-b="save" class="primary">Save</button></div></div>';
  }

  function makeRow() {
    if (draft && !draft.slot) return builderHtml();
    if (state.freeSlot) return '<button class="make" data-b="new">✦ Make your own flavour</button>';
    return '<div class="make full">All 3 custom slots are used. Edit or delete one to make another.</div>';
  }

  function render() {
    const followOS = state.settings.followTheSun === 'system';
    for (const b of document.querySelectorAll('.modes button')) {
      b.classList.toggle('on', b.dataset.mode === state.mode);
      b.disabled = followOS;
      b.title = followOS ? 'Night/Day follows your OS (see Follow the sun below)' : '';
    }
    for (const el of document.querySelectorAll('[data-toggle]')) el.setAttribute('aria-checked', !!state.settings[el.dataset.toggle]);
    for (const el of document.querySelectorAll('[data-sun]')) el.setAttribute('aria-checked', el.dataset.sun === state.settings.followTheSun);
    const act = state.flavours.find((f) => f.name === state.active);
    if (act) {
      document.body.style.setProperty('--x-on', act[state.mode].accent);
      document.body.style.setProperty('--x-on-fg', act[state.mode].bg);
    }
    // Only the active flavour is expanded; the rest are slim rows with a colour strip.
    document.getElementById('list').innerHTML = state.flavours.map((f) => {
      if (f.trying) return '';
      if (draft && f.custom && draft.slot === f.custom.slot) return builderHtml();
      const c = f[state.mode], on = f.name === state.active;
      const chips = ['k', 'f', 's', 'n', 't', 'p'].map((k) => '<i style="background:' + c.syn[k] + '"></i>').join('');
      return '<div class="item' + (on ? ' active' : '') + (f.custom ? ' custom' : '') + '" style="--accent:' + c.accent + '">' +
        '<button class="card' + (on ? ' active' : '') + '" data-name="' + esc(f.name) + '"' +
        ' title="' + esc(named(f) + ': ' + f.blurb) + '" aria-pressed="' + on + '"' +
        ' style="background:' + c.bg + ';color:' + c.fg + '">' +
        '<div class="head"><span class="dot" style="background:' + c.accent + '"></span>' +
        '<span class="name">' + esc(named(f)) + '</span>' +
        (on ? '<span class="tick" style="background:' + c.accent + ';color:' + c.bg + '">Active</span>'
            : '<span class="chips">' + chips + '</span>') + '</div>' +
        (on ? '<div class="code" style="background:' + c.line + '">' + preview(f, c) + '</div>' +
              '<div class="foot">' + esc(f.blurb) + '</div>' : '') +
        '</button>' +
        (f.custom ? '<button class="edit" data-edit="' + f.custom.slot + '" title="Edit ' + esc(named(f)) + '" aria-label="Edit ' + esc(named(f)) + '" style="color:' + c.fg + '">✎</button>' : '') +
        (on ? pinBar(c) : '') + '</div>';
    }).join('') + makeRow();
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-b]');
    if (b) {
      const act = b.dataset.b;
      if (act === 'new') return openBuilder();
      if (act === 'shuffle') return updateDraft(shuffled());
      if (act === 'cancel') { vscode.postMessage({ type: 'cancel' }); draft = null; return render(); }
      if (act === 'delete') { vscode.postMessage({ type: 'delete', slot: draft.slot }); draft = null; return render(); }
      if (act === 'save') { vscode.postMessage({ type: 'save', spec: draft }); draft = null; return render(); }
    }
    const pick = e.target.closest('[data-pick]');
    if (pick) return updateDraft({ [pick.dataset.pick]: Number(pick.dataset.hue) });
    const sweet = e.target.closest('[data-sweet]');
    if (sweet) return updateDraft({ sweetness: sweet.dataset.sweet });
    const edit = e.target.closest('[data-edit]');
    if (edit) return openBuilder(state.flavours.find((f) => f.custom && f.custom.slot === Number(edit.dataset.edit)).custom);
    const mode = e.target.closest('[data-mode]');
    if (mode) return vscode.postMessage({ type: 'mode', mode: mode.dataset.mode });
    const toggle = e.target.closest('[data-toggle]');
    if (toggle) return vscode.postMessage({ type: 'setting', key: toggle.dataset.toggle, value: !state.settings[toggle.dataset.toggle] });
    const sun = e.target.closest('[data-sun]');
    if (sun) return vscode.postMessage({ type: 'setting', key: 'followTheSun', value: sun.dataset.sun });
    const action = e.target.closest('[data-action]');
    if (action) return vscode.postMessage({ type: action.dataset.action });
    const card = e.target.closest('.card');
    if (card) vscode.postMessage({ type: 'apply', name: card.dataset.name });
  });
  // Remember whether Extras is open across panel reloads.
  const extras = document.getElementById('extras');
  extras.open = !!vscode.getState()?.extras;
  extras.addEventListener('toggle', () => vscode.setState({ extras: extras.open }));
  document.addEventListener('input', (e) => {
    if (e.target.id === 'b-name' && draft) draft.display = e.target.value;
  });
  document.addEventListener('change', (e) => {
    if (e.target.id === 'b-like' && draft) updateDraft({ like: e.target.value });
  });
  window.addEventListener('message', (e) => {
    if (e.data.type === 'state') { const { type, ...rest } = e.data; state = { ...state, ...rest }; render(); }
    if (e.data.type === 'preview' && draft) { draftPreview = e.data.flavour; render(); }
  });
  render();
</script>
</body>
</html>`;
  }
}

// ---- Custom flavours ------------------------------------------------------
// Each custom flavour lives in one of the "Marshmallow Custom N" theme slots.
// Its colours go into the user's theme-scoped colour customizations, which
// VS Code applies whenever that slot's theme is active.

// Swatches for the builder's base and accent pickers, in both modes.
function builderOptions() {
  return {
    bases: BASES.map((hue) => ({ hue, night: ok(0.27, 0.03, hue), day: ok(0.95, 0.03, hue) })),
    accents: ACCENTS.map((hue) => ({ hue, night: ok(0.82, 0.1, hue), day: ok(0.57, 0.15, hue) })),
    likes: Object.keys(STYLES),
    defaults: DEFAULT_CUSTOM,
  };
}

async function writeCustomizations(spec) {
  const palettes = customPalettes(spec);
  const next = {};
  for (const [kind, key] of Object.entries(CUSTOM_KEYS)) next[kind] = { ...(config().inspect(key)?.globalValue || {}) };
  for (const mode of Object.keys(MODES)) {
    const t = themeFor(palettes[mode], mode === 'night', STYLES[spec.like]);
    const scope = `[${label(slotName(spec.slot), mode)}]`;
    next.colors[scope] = t.colors;
    next.tokens[scope] = { textMateRules: t.tokenColors };
    next.semantic[scope] = { enabled: true, rules: t.semanticTokenColors };
  }
  for (const [kind, key] of Object.entries(CUSTOM_KEYS)) await config().update(key, next[kind], Global);
}

async function clearCustomizations(slot) {
  for (const key of Object.values(CUSTOM_KEYS)) {
    const value = { ...(config().inspect(key)?.globalValue || {}) };
    for (const mode of Object.keys(MODES)) delete value[`[${label(slotName(slot), mode)}]`];
    await config().update(key, Object.keys(value).length ? value : undefined, Global);
  }
}

async function storeCustoms() {
  await globalState.update('customs', customs);
}

function cleanSpec(spec, slot) {
  return {
    slot,
    display: String(spec.display || '').trim().slice(0, 40) || `My Flavour ${slot}`,
    base: Number(spec.base),
    accent: Number(spec.accent),
    sweetness: spec.sweetness,
    like: STYLES[spec.like] ? spec.like : DEFAULT_CUSTOM.like,
    order: spec.order,
  };
}

async function saveCustom(spec, mode) {
  const slot = spec.slot || trying?.slot || CUSTOM_SLOTS.find((n) => !customs[n]);
  await endTryOn(true);
  if (!slot) return vscode.window.showWarningMessage('All three custom slots are used. Delete one to make another.');
  const clean = cleanSpec(spec, slot);
  customs = { ...customs, [slot]: clean };
  await storeCustoms();
  await writeCustomizations(clean);
  await applyFlavour(slotName(slot), mode);
  vscode.commands.executeCommand('marshmallow.refresh');
}

async function deleteCustom(slot) {
  const spec = customs[slot];
  if (!spec) return;
  await endTryOn(false);
  const ok = await vscode.window.showWarningMessage(`Delete your flavour "${spec.display}"?`, { modal: true }, 'Delete');
  if (ok !== 'Delete') return;
  // Move off the slot first so VS Code isn't left on a theme we're clearing.
  const active = activeFlavour();
  if (active && active.name === slotName(slot)) await applyFlavour('Marshmallow', active.mode);
  const { [slot]: _removed, ...rest } = customs;
  customs = rest;
  await storeCustoms();
  await clearCustomizations(slot);
  vscode.commands.executeCommand('marshmallow.refresh');
}

// ---- Live try-on ------------------------------------------------------------
// While the builder is open, each change is written into the flavour's slot and
// applied, so the whole editor shows it. Cancel puts back the theme settings
// and slot colours from before; the record is kept in globalState so a try-on
// interrupted by closing VS Code is undone on the next start.

let queue = Promise.resolve();
let pending = null;
let timer = null;
const serial = (fn) => (queue = queue.then(fn, fn));

// Coalesces quick clicks into one write.
function tryOn(spec, mode) {
  pending = { spec, mode };
  clearTimeout(timer);
  timer = setTimeout(() => serial(async () => {
    const next = pending;
    pending = null;
    if (next) await tryOnNow(next.spec, next.mode);
  }), 120);
}

async function tryOnNow(spec, mode) {
  if (!trying) {
    const slot = spec.slot || CUSTOM_SLOTS.find((n) => !customs[n]);
    if (!slot) return;
    const target = pinnedFlavour() ? Workspace : Global;
    const previous = {};
    for (const key of [THEME_KEY, DARK_KEY, LIGHT_KEY]) {
      const info = config().inspect(key);
      previous[key] = target === Workspace ? info?.workspaceValue : info?.globalValue;
    }
    trying = { slot, isNew: !customs[slot], target, previous };
  }
  trying.spec = cleanSpec(spec, trying.slot);
  await globalState.update('tryingOn', trying);
  await writeCustomizations(trying.spec);
  await applyFlavour(slotName(trying.slot), mode, trying.target);
  vscode.commands.executeCommand('marshmallow.refresh');
}

// Ends a try-on. With keep false, puts back what was there before it started.
async function endTryOn(keep) {
  clearTimeout(timer);
  pending = null;
  await queue;
  const t = trying || globalState.get('tryingOn');
  trying = null;
  if (!t) return;
  await globalState.update('tryingOn', undefined);
  if (keep) return;
  if (customs[t.slot]) await writeCustomizations(customs[t.slot]);
  else await clearCustomizations(t.slot);
  for (const [key, value] of Object.entries(t.previous)) await put(key, value, t.target);
  vscode.commands.executeCommand('marshmallow.refresh');
}

// ---- Wiring ---------------------------------------------------------------

async function pinToProject() {
  if (!hasWorkspace()) return vscode.window.showWarningMessage('Open a folder first to pin a flavour to it.');
  const active = activeFlavour();
  if (!active) return vscode.window.showWarningMessage('Pick a Marshmallow flavour first, then pin it.');
  await applyFlavour(active.name, active.mode, Workspace);
  vscode.window.showInformationMessage(`📌 ${active.name} is pinned to this project.`);
}

async function unpinFromProject() {
  const cfg = config();
  for (const key of [THEME_KEY, DARK_KEY, LIGHT_KEY]) {
    if (cfg.inspect(key)?.workspaceValue !== undefined) await cfg.update(key, undefined, Workspace);
  }
}

async function activate(context) {
  const state = context.globalState;
  globalState = state;
  customs = state.get('customs') || {};
  await endTryOn(false);
  const personality = new Personality(state);
  const sun = new FollowTheSun(state);
  const status = new StatusBar();
  const view = new FlavourView();

  const refresh = () => {
    status.refresh();
    view.refresh();
  };

  context.subscriptions.push(
    status,
    sun,
    vscode.window.registerWebviewViewProvider('marshmallow.flavours', view),
    vscode.commands.registerCommand('marshmallow.pick', pickFlavour),
    vscode.commands.registerCommand('marshmallow.refresh', refresh),
    vscode.commands.registerCommand('marshmallow.toggleMode', () => view.toggleMode()),
    vscode.commands.registerCommand('marshmallow.surprise', () => view.surprise()),
    vscode.commands.registerCommand('marshmallow.pinToProject', pinToProject),
    vscode.commands.registerCommand('marshmallow.unpinFromProject', unpinFromProject),
    vscode.window.onDidChangeActiveColorTheme(() => {
      personality.apply();
      refresh();
    }),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('marshmallow.personality')) {
        setting('personality') ? personality.apply() : personality.restore();
      }
      if (['followTheSun', 'dayStartsAt', 'nightStartsAt'].some((k) => e.affectsConfiguration(`marshmallow.${k}`))) {
        sun.configure();
      }
      if (e.affectsConfiguration(THEME_KEY) || e.affectsConfiguration('marshmallow')) refresh();
    }),
  );

  await flavourOfTheDay(state);
  await sun.configure();
  await personality.apply();
  refresh();
}

module.exports = { activate };
