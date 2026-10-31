// Shared theme generation, used by scripts/build.js (built-in flavours) and
// extension.js (custom flavours made in the sidebar).
const { ok, genNight, genDay } = require('./palettes');

// Append a two-digit alpha to a #RRGGBB colour.
const alpha = (hex, a) => hex.slice(0, 7) + Math.round(a * 255).toString(16).padStart(2, '0').toUpperCase();
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const GUIDE_ORDER = ['k', 'f', 's', 'n', 't', 'p'];
function rainbowGuides(syn) {
  const out = {};
  GUIDE_ORDER.forEach((key, i) => {
    out[`editorIndentGuide.background${i + 1}`] = alpha(syn[key], 0.28);
    out[`editorIndentGuide.activeBackground${i + 1}`] = alpha(syn[key], 0.85);
  });
  return out;
}

function colors(c, dark) {
  const t = c.term, s = c.syn;
  return {
    // Base
    focusBorder: alpha(c.cursor, 0.6),
    foreground: c.sideFg,
    descriptionForeground: c.breadcrumb,
    errorForeground: c.err,
    'icon.foreground': c.sideFg,
    'selection.background': alpha(c.selection, 0.9),
    'widget.shadow': c.shadow.startsWith('rgba') ? alpha(dark ? '#080414' : '#503246', dark ? 0.5 : 0.18) : c.shadow,
    'textLink.foreground': c.link,
    'textLink.activeForeground': c.cursor,
    'textBlockQuote.background': c.sideBg,
    'textBlockQuote.border': c.cursor,
    'textCodeBlock.background': c.sideBg,
    'textPreformat.foreground': s.p,

    // Title bar & command center
    'titleBar.activeBackground': c.titleBg,
    'titleBar.activeForeground': c.titleFg,
    'titleBar.inactiveBackground': c.titleBg,
    'titleBar.inactiveForeground': alpha(c.titleFg, 0.6),
    'titleBar.border': c.border,
    'commandCenter.background': c.ccBg,
    'commandCenter.foreground': c.titleFg,
    'commandCenter.border': c.ccBorder,
    'commandCenter.activeBackground': c.lineHl,

    // Activity bar
    'activityBar.background': c.actBg,
    'activityBar.foreground': c.actFg,
    'activityBar.inactiveForeground': c.actInactive,
    'activityBar.border': c.border,
    'activityBar.activeBorder': c.actFg,
    'activityBarBadge.background': c.badgeBg,
    'activityBarBadge.foreground': c.badgeFg,

    // Side bar & lists
    'sideBar.background': c.sideBg,
    'sideBar.foreground': c.sideFg,
    'sideBar.border': c.border,
    'sideBarTitle.foreground': c.sideTitle,
    'sideBarSectionHeader.background': c.sideBg,
    'sideBarSectionHeader.foreground': c.sideTitle,
    'sideBarSectionHeader.border': c.panelBorder,
    'list.activeSelectionBackground': c.listActiveBg,
    'list.activeSelectionForeground': c.fg,
    'list.inactiveSelectionBackground': alpha(c.listActiveBg, 0.7),
    'list.hoverBackground': alpha(c.listActiveBg, 0.5),
    'list.focusOutline': c.listFocus,
    'list.highlightForeground': c.qiHl,
    'list.focusHighlightForeground': c.qiHl,
    'list.errorForeground': c.err,
    'list.warningForeground': c.warn,
    'list.deemphasizedForeground': c.ignored,
    'tree.indentGuidesStroke': c.panelBorder,
    'gitDecoration.addedResourceForeground': c.gitAdd,
    'gitDecoration.untrackedResourceForeground': c.gitAdd,
    'gitDecoration.modifiedResourceForeground': c.gitMod,
    'gitDecoration.deletedResourceForeground': c.gitDel,
    'gitDecoration.conflictingResourceForeground': c.warn,
    'gitDecoration.ignoredResourceForeground': c.ignored,

    // Tabs & breadcrumbs
    'editorGroupHeader.tabsBackground': c.tabsBg,
    'editorGroupHeader.tabsBorder': c.tabBorder,
    'editorGroup.border': c.border,
    'tab.activeBackground': c.tabActiveBg,
    'tab.activeForeground': c.tabActiveFg,
    'tab.activeBorderTop': c.tabTop,
    'tab.inactiveBackground': c.tabInactiveBg,
    'tab.inactiveForeground': c.tabInactiveFg,
    'tab.border': c.tabBorder,
    'tab.hoverBackground': c.tabActiveBg,
    'tab.unfocusedActiveBorderTop': alpha(c.tabTop, 0.5),
    'breadcrumb.background': c.editorBg,
    'breadcrumb.foreground': c.breadcrumb,
    'breadcrumb.focusForeground': c.breadcrumbActive,
    'breadcrumb.activeSelectionForeground': c.breadcrumbActive,

    // Editor
    'editor.background': c.editorBg,
    'editor.foreground': c.fg,
    'editor.lineHighlightBackground': c.lineHl,
    'editor.lineHighlightBorder': '#00000000',
    'editor.selectionBackground': c.selection,
    'editor.inactiveSelectionBackground': alpha(c.selection, 0.6),
    'editor.selectionHighlightBackground': alpha(c.selection, 0.55),
    'editor.wordHighlightBackground': alpha(c.selection, 0.5),
    'editor.wordHighlightStrongBackground': alpha(c.selection, 0.8),
    'editor.findMatchBackground': alpha(s.p, 0.45),
    'editor.findMatchHighlightBackground': alpha(s.p, 0.22),
    'editor.findRangeHighlightBackground': alpha(c.selection, 0.35),
    'editor.rangeHighlightBackground': alpha(c.selection, 0.3),
    'editorCursor.foreground': c.cursor,
    'editorLineNumber.foreground': c.lineNo,
    'editorLineNumber.activeForeground': c.lineNoActive,
    // Rainbow indent guides: each nesting level takes the next syntax colour.
    ...rainbowGuides(c.syn),
    'editorWhitespace.foreground': alpha(c.lineNo, 0.5),
    'editorRuler.foreground': c.rulerBorder,
    'editorLink.activeForeground': c.link,
    'editorBracketMatch.background': alpha(c.selection, 0.6),
    'editorBracketMatch.border': alpha(c.br[0], 0.6),
    'editorBracketHighlight.foreground1': c.br[0],
    'editorBracketHighlight.foreground2': c.br[1],
    'editorBracketHighlight.foreground3': c.br[2],
    'editorBracketHighlight.unexpectedBracket.foreground': c.err,
    'editorError.foreground': c.err,
    'editorWarning.foreground': c.warn,
    'editorInfo.foreground': c.link,
    'editorGutter.background': c.editorBg,
    'editorGutter.addedBackground': c.gitAdd,
    'editorGutter.modifiedBackground': c.gitMod,
    'editorGutter.deletedBackground': c.gitDel,
    'editorOverviewRuler.border': c.rulerBorder,
    'editorOverviewRuler.errorForeground': c.err,
    'editorOverviewRuler.warningForeground': c.warn,
    'editorOverviewRuler.addedForeground': c.gitAdd,
    'editorOverviewRuler.modifiedForeground': c.gitMod,
    'editorOverviewRuler.deletedForeground': c.gitDel,
    'minimap.background': c.editorBg,
    'minimapSlider.background': c.miniSlider.startsWith('rgba') ? alpha(c.fg, 0.08) : c.miniSlider,
    'minimapSlider.hoverBackground': alpha(c.fg, 0.12),
    'minimapSlider.activeBackground': alpha(c.fg, 0.16),
    'scrollbar.shadow': '#00000000',
    'scrollbarSlider.background': alpha(c.lineNo, 0.3),
    'scrollbarSlider.hoverBackground': alpha(c.lineNo, 0.5),
    'scrollbarSlider.activeBackground': alpha(c.lineNo, 0.7),
    'diffEditor.insertedTextBackground': alpha(c.gitAdd, 0.18),
    'diffEditor.removedTextBackground': alpha(c.gitDel, 0.18),
    'diffEditor.insertedLineBackground': alpha(c.gitAdd, 0.1),
    'diffEditor.removedLineBackground': alpha(c.gitDel, 0.1),

    // Widgets: hover, suggest, find, peek
    'editorWidget.background': c.qiBg,
    'editorWidget.foreground': c.fg,
    'editorWidget.border': c.hoverBorder,
    'editorHoverWidget.background': c.hoverBg,
    'editorHoverWidget.foreground': c.hoverFg,
    'editorHoverWidget.border': c.hoverBorder,
    'editorHoverWidget.statusBarBackground': c.hoverBg,
    'editorSuggestWidget.background': c.qiBg,
    'editorSuggestWidget.foreground': c.qiFg,
    'editorSuggestWidget.border': c.hoverBorder,
    'editorSuggestWidget.selectedBackground': c.qiFocusBg,
    'editorSuggestWidget.selectedForeground': c.qiFocusFg,
    'editorSuggestWidget.highlightForeground': c.qiHl,
    'editorSuggestWidget.focusHighlightForeground': c.qiHl,
    'peekView.border': c.cursor,
    'peekViewEditor.background': c.sideBg,
    'peekViewResult.background': c.sideBg,
    'peekViewTitle.background': c.panelBg,
    'peekViewEditor.matchHighlightBackground': alpha(s.p, 0.3),
    'peekViewResult.matchHighlightBackground': alpha(s.p, 0.3),
    'peekViewResult.selectionBackground': c.listActiveBg,

    // Quick input / command palette
    'quickInput.background': c.qiBg,
    'quickInput.foreground': c.qiFg,
    'quickInputList.focusBackground': c.qiFocusBg,
    'quickInputList.focusForeground': c.qiFocusFg,
    'pickerGroup.foreground': c.qiHl,
    'pickerGroup.border': c.hoverBorder,

    // Inputs, buttons, dropdowns, badges
    'input.background': c.inputBg,
    'input.foreground': c.fg,
    'input.border': c.panelBorder,
    'input.placeholderForeground': c.qiDesc,
    'inputOption.activeBorder': c.inputBorder,
    'inputOption.activeBackground': alpha(c.inputBorder, 0.2),
    'inputValidation.errorBorder': c.err,
    'inputValidation.warningBorder': c.warn,
    'dropdown.background': c.inputBg,
    'dropdown.border': c.panelBorder,
    'dropdown.foreground': c.fg,
    'button.background': c.statusBg,
    'button.foreground': c.statusFg,
    'button.hoverBackground': alpha(c.statusBg, 0.85),
    'button.secondaryBackground': c.listActiveBg,
    'button.secondaryForeground': c.fg,
    'checkbox.background': c.inputBg,
    'checkbox.border': c.panelBorder,
    'badge.background': c.remoteBg,
    'badge.foreground': c.remoteFg,
    'progressBar.background': c.cursor,

    // Panel & terminal
    'panel.background': c.panelBg,
    'panel.border': c.panelBorder,
    'panelTitle.activeForeground': c.panelTabActive,
    'panelTitle.inactiveForeground': c.panelTabInactive,
    'panelTitle.activeBorder': c.panelTabBorder,
    'terminal.background': c.panelBg,
    'terminal.foreground': t.fg,
    'terminalCursor.foreground': t.cur,
    'terminal.selectionBackground': alpha(c.selection, 0.8),
    'terminal.ansiBlack': dark ? c.actBg : c.fg,
    'terminal.ansiRed': t.r,
    'terminal.ansiGreen': t.g,
    'terminal.ansiYellow': t.y,
    'terminal.ansiBlue': t.b,
    'terminal.ansiMagenta': t.m,
    'terminal.ansiCyan': t.cy,
    'terminal.ansiWhite': dark ? c.sideFg : t.d,
    'terminal.ansiBrightBlack': t.d,
    'terminal.ansiBrightRed': t.r,
    'terminal.ansiBrightGreen': t.g,
    'terminal.ansiBrightYellow': t.y,
    'terminal.ansiBrightBlue': t.b,
    'terminal.ansiBrightMagenta': t.m,
    'terminal.ansiBrightCyan': t.cy,
    'terminal.ansiBrightWhite': dark ? '#FFFFFF' : c.sideFg,

    // Status bar
    'statusBar.background': c.statusBg,
    'statusBar.foreground': c.statusFg,
    'statusBar.border': c.statusBg,
    'statusBar.noFolderBackground': c.remoteBg,
    'statusBar.noFolderForeground': c.remoteFg,
    'statusBar.debuggingBackground': c.warn,
    'statusBar.debuggingForeground': c.statusFg,
    'statusBarItem.remoteBackground': c.remoteBg,
    'statusBarItem.remoteForeground': c.remoteFg,
    'statusBarItem.hoverBackground': alpha(c.statusFg, 0.12),

    // Notifications & menus
    'notifications.background': c.qiBg,
    'notifications.foreground': c.fg,
    'notifications.border': c.hoverBorder,
    'notificationCenterHeader.background': c.panelBg,
    'notificationsErrorIcon.foreground': c.err,
    'notificationsWarningIcon.foreground': c.warn,
    'notificationsInfoIcon.foreground': c.link,
    'menu.background': c.qiBg,
    'menu.foreground': c.fg,
    'menu.selectionBackground': c.qiFocusBg,
    'menu.selectionForeground': c.qiFocusFg,
    'menu.separatorBackground': c.hoverBorder,
    'debugToolBar.background': c.qiBg,
  };
}

// Each flavour's text personality: which kinds of code are italic, bold or underlined.
// Keys left out are plain, except comments, which default to italic.
const STYLES = {
  'Marshmallow':   { keyword: 'italic', parameter: 'italic', language: 'italic', attribute: 'italic' },
  'Bubblegum':     { keyword: 'bold', function: 'bold', language: 'bold italic', link: 'underline' },
  'Mint Chip':     { comment: '', type: 'bold', link: 'underline' },
  'Peach Cobbler': { type: 'italic', function: 'bold', parameter: 'italic' },
  'Blueberry Pie': { type: 'bold', keyword: 'italic', language: 'italic' },
  'Matcha Latte':  { language: 'italic' },
  'Lemon Drop':    { keyword: 'bold', attribute: 'italic', tag: 'bold', link: 'underline' },
  'Cotton Candy':  { keyword: 'italic', string: 'italic', parameter: 'italic', property: 'italic', attribute: 'italic' },
  'Sea Glass':     { function: 'italic', parameter: 'italic', language: 'italic' },
  'Cherry Cola':   { keyword: 'bold', function: 'bold', type: 'bold', language: 'italic', link: 'underline' },
};

function tokenColors(s, style) {
  const st = { comment: 'italic', ...style };
  // Every rule sets fontStyle explicitly ('' = plain) so specific scopes such as
  // keyword.operator or storage.type.primitive don't inherit a parent's style.
  const rule = (name, scope, foreground, fontStyle = '') => ({ name, scope, settings: { foreground, fontStyle } });
  return [
    rule('Comments', ['comment', 'punctuation.definition.comment'], s.c, st.comment),
    rule('Keywords', ['keyword', 'storage.type', 'storage.modifier', 'keyword.control'], s.k, st.keyword),
    rule('Operators', ['keyword.operator', 'punctuation', 'meta.brace'], s.o),
    rule('Strings', ['string', 'string.quoted', 'string.template', 'punctuation.definition.string'], s.s, st.string),
    rule('Regex & escapes', ['string.regexp', 'constant.character.escape'], s.n),
    rule('Numbers & constants', ['constant.numeric', 'constant.language', 'constant.other', 'variable.other.constant', 'support.constant'], s.n),
    rule('Functions', ['entity.name.function', 'support.function', 'meta.function-call entity.name.function', 'variable.function'], s.f, st.function),
    rule('Types & classes', ['entity.name.type', 'entity.name.class', 'support.type', 'support.class', 'entity.other.inherited-class', 'storage.type.primitive'], s.t, st.type),
    rule('Variables', ['variable', 'variable.other.readwrite'], s.v),
    rule('Parameters', ['variable.parameter'], s.v, st.parameter),
    rule('Language variables', ['variable.language'], s.k, st.language),
    rule('Properties', ['variable.other.property', 'variable.other.object.property', 'support.variable.property', 'meta.object-literal.key', 'support.type.property-name'], s.p, st.property),
    rule('Tags', ['entity.name.tag', 'punctuation.definition.tag'], s.tg, st.tag),
    rule('Attributes', ['entity.other.attribute-name'], s.at, st.attribute),
    rule('Embedded links', ['markup.underline.link', 'string.other.link', 'constant.other.reference.link'], s.f, st.link),
    rule('Decorators', ['meta.decorator', 'punctuation.decorator', 'entity.name.function.decorator'], s.t),
    rule('Markdown headings', ['markup.heading', 'entity.name.section'], s.k, 'bold'),
    rule('Markdown bold', ['markup.bold'], s.n, 'bold'),
    rule('Markdown italic', ['markup.italic'], s.t, 'italic'),
    rule('Markdown code', ['markup.inline.raw', 'markup.fenced_code'], s.s),
    rule('Diff inserted', ['markup.inserted'], s.s),
    rule('Diff deleted', ['markup.deleted'], s.k),
    rule('Invalid', ['invalid'], s.k, 'underline'),
  ];
}

// Semantic rules carry the same font style as their TextMate counterparts so
// semantic highlighting doesn't strip a flavour's bold or italics.
function semanticTokenColors(s, style) {
  const tok = (foreground, fontStyle) => (fontStyle ? { foreground, fontStyle } : foreground);
  return {
    namespace: tok(s.t, style.type),
    class: tok(s.t, style.type),
    interface: tok(s.t, style.type),
    enum: tok(s.t, style.type),
    type: tok(s.t, style.type),
    typeParameter: tok(s.t, style.type),
    function: tok(s.f, style.function),
    method: tok(s.f, style.function),
    property: tok(s.p, style.property),
    enumMember: s.n,
    parameter: tok(s.v, style.parameter),
    'variable.readonly': s.v,
    'variable.defaultLibrary': s.n,
  };
}

// Editor settings the extension applies alongside each flavour (see extension.js).
// lineHeight below 8 is a multiplier of the font size.
const PERSONALITY = {
  'Marshmallow':   { cursorStyle: 'line', cursorWidth: 2, cursorBlinking: 'smooth', cursorSmoothCaretAnimation: 'on', lineHeight: 1.6, letterSpacing: 0 },
  'Bubblegum':     { cursorStyle: 'line', cursorWidth: 3, cursorBlinking: 'expand', cursorSmoothCaretAnimation: 'on', lineHeight: 1.55, letterSpacing: 0.2 },
  'Mint Chip':     { cursorStyle: 'block', cursorWidth: 2, cursorBlinking: 'solid', cursorSmoothCaretAnimation: 'off', lineHeight: 1.4, letterSpacing: 0 },
  'Peach Cobbler': { cursorStyle: 'line', cursorWidth: 2, cursorBlinking: 'phase', cursorSmoothCaretAnimation: 'on', lineHeight: 1.65, letterSpacing: 0.2 },
  'Blueberry Pie': { cursorStyle: 'underline', cursorWidth: 2, cursorBlinking: 'blink', cursorSmoothCaretAnimation: 'on', lineHeight: 1.5, letterSpacing: 0 },
  'Matcha Latte':  { cursorStyle: 'line-thin', cursorWidth: 1, cursorBlinking: 'smooth', cursorSmoothCaretAnimation: 'on', lineHeight: 1.7, letterSpacing: 0.3 },
  'Lemon Drop':    { cursorStyle: 'block-outline', cursorWidth: 2, cursorBlinking: 'blink', cursorSmoothCaretAnimation: 'on', lineHeight: 1.5, letterSpacing: 0.1 },
  'Cotton Candy':  { cursorStyle: 'line', cursorWidth: 2, cursorBlinking: 'expand', cursorSmoothCaretAnimation: 'on', lineHeight: 1.8, letterSpacing: 0.5 },
  'Sea Glass':     { cursorStyle: 'line', cursorWidth: 2, cursorBlinking: 'smooth', cursorSmoothCaretAnimation: 'on', lineHeight: 1.65, letterSpacing: 0.2 },
  'Cherry Cola':   { cursorStyle: 'underline-thin', cursorWidth: 2, cursorBlinking: 'phase', cursorSmoothCaretAnimation: 'on', lineHeight: 1.5, letterSpacing: 0 },
};

// Swatch data for the sidebar flavour picker (see extension.js).
const BLURBS = {
  'Marshmallow': 'The original. Fluffy pink on cocoa.',
  'Bubblegum': 'Pop a bubble, push a commit.',
  'Mint Chip': 'Cool, crisp and suspiciously refreshing.',
  'Peach Cobbler': 'Warm, golden and best served late at night.',
  'Blueberry Pie': 'Deep blue with a sweet, jammy finish.',
  'Matcha Latte': 'Calm greens for focused, whisked-up work.',
  'Lemon Drop': 'A bright, tangy zing for sleepy mornings.',
  'Cotton Candy': 'Spun-sugar pink and blue, light as air.',
  'Sea Glass': 'Sea-worn teals and soft blues.',
  'Cherry Cola': 'Fizzy red over a dark, sweet base.',
};
const swatch = (c) => ({
  bg: c.editorBg, fg: c.fg, side: c.sideBg, accent: c.cursor, line: c.lineHl,
  syn: { k: c.syn.k, f: c.syn.f, s: c.syn.s, n: c.syn.n, t: c.syn.t, p: c.syn.p, c: c.syn.c, o: c.syn.o },
});

// The full theme contents (colours plus token rules) for one palette.
function themeFor(c, dark, style) {
  return {
    colors: colors(c, dark),
    semanticTokenColors: semanticTokenColors(c.syn, style),
    tokenColors: tokenColors(c.syn, style),
  };
}

// ---- Custom flavours --------------------------------------------------------
// A custom flavour is a small spec chosen in the sidebar builder:
//   { slot, display, base, accent, sweetness, like, order }
// base and accent are hues (degrees); like names the built-in flavour whose
// text style and cursor it borrows; order permutes which hue goes where.

const BASES = [10, 50, 110, 190, 255, 290, 330];
const ACCENTS = [345, 55, 95, 150, 180, 235, 295];
const SWEETNESS = { subtle: 0.7, sweet: 1, rush: 1.35 };
const SYNTAX_KEYS = ['n', 'p', 's', 'f', 't'];
const OFFSETS = [60, 100, 160, 220, 300];

function customSpec(spec) {
  const order = spec.order || [0, 1, 2, 3, 4];
  const h = { k: spec.accent };
  SYNTAX_KEYS.forEach((key, i) => (h[key] = (spec.accent + OFFSETS[order[i]]) % 360));
  return { bh: spec.base, bc: 0.03, a: spec.accent, a2: (spec.accent + 300) % 360, h, sat: SWEETNESS[spec.sweetness] ?? 1 };
}

function customPalettes(spec) {
  const p = customSpec(spec);
  return { night: genNight(p), day: genDay(p) };
}

const slotName = (slot) => `Marshmallow Custom ${slot}`;

// A sidebar flavour entry for a custom spec, shaped like media/flavours.json entries.
function customFlavour(spec) {
  const { night, day } = customPalettes(spec);
  return {
    name: slotName(spec.slot),
    display: spec.display,
    custom: spec,
    blurb: `Your own flavour, styled like ${spec.like}.`,
    style: { comment: 'italic', ...STYLES[spec.like] },
    personality: PERSONALITY[spec.like],
    night: swatch(night),
    day: swatch(day),
  };
}

const DEFAULT_CUSTOM = { base: 190, accent: 180, sweetness: 'sweet', like: 'Sea Glass', order: [0, 1, 2, 3, 4] };

module.exports = {
  ok, alpha, themeFor, STYLES, PERSONALITY, BLURBS, swatch,
  BASES, ACCENTS, SWEETNESS, customPalettes, customFlavour, slotName, DEFAULT_CUSTOM,
};
