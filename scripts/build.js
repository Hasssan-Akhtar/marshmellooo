// Generates themes/*.json and the contributes.themes list in package.json
// from the palettes in palettes.js. Run with: npm run build
const fs = require('fs');
const path = require('path');
const { PRESETS } = require('./palettes');

const root = path.join(__dirname, '..');
const themesDir = path.join(root, 'themes');

// Append a two-digit alpha to a #RRGGBB colour.
const alpha = (hex, a) => hex.slice(0, 7) + Math.round(a * 255).toString(16).padStart(2, '0').toUpperCase();
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

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
    'editorIndentGuide.background1': alpha(c.lineNo, 0.35),
    'editorIndentGuide.activeBackground1': alpha(c.lineNo, 0.8),
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

function tokenColors(s) {
  const rule = (name, scope, foreground, fontStyle) =>
    ({ name, scope, settings: fontStyle ? { foreground, fontStyle } : { foreground } });
  return [
    rule('Comments', ['comment', 'punctuation.definition.comment'], s.c, 'italic'),
    rule('Keywords', ['keyword', 'storage.type', 'storage.modifier', 'keyword.control'], s.k),
    rule('Operators', ['keyword.operator', 'punctuation', 'meta.brace'], s.o),
    rule('Strings', ['string', 'string.quoted', 'string.template', 'punctuation.definition.string'], s.s),
    rule('Regex & escapes', ['string.regexp', 'constant.character.escape'], s.n),
    rule('Numbers & constants', ['constant.numeric', 'constant.language', 'constant.other', 'variable.other.constant', 'support.constant'], s.n),
    rule('Functions', ['entity.name.function', 'support.function', 'meta.function-call entity.name.function', 'variable.function'], s.f),
    rule('Types & classes', ['entity.name.type', 'entity.name.class', 'support.type', 'support.class', 'entity.other.inherited-class', 'storage.type.primitive'], s.t),
    rule('Variables', ['variable', 'variable.other.readwrite', 'variable.parameter'], s.v),
    rule('Language variables', ['variable.language'], s.k, 'italic'),
    rule('Properties', ['variable.other.property', 'variable.other.object.property', 'support.variable.property', 'meta.object-literal.key', 'support.type.property-name'], s.p),
    rule('Tags', ['entity.name.tag', 'punctuation.definition.tag'], s.tg),
    rule('Attributes', ['entity.other.attribute-name'], s.at),
    rule('Decorators', ['meta.decorator', 'punctuation.decorator', 'entity.name.function.decorator'], s.t),
    rule('Markdown headings', ['markup.heading', 'entity.name.section'], s.k, 'bold'),
    rule('Markdown bold', ['markup.bold'], s.n, 'bold'),
    rule('Markdown italic', ['markup.italic'], s.t, 'italic'),
    rule('Markdown code', ['markup.inline.raw', 'markup.fenced_code'], s.s),
    rule('Links', ['markup.underline.link'], s.f),
    rule('Diff inserted', ['markup.inserted'], s.s),
    rule('Diff deleted', ['markup.deleted'], s.k),
    rule('Invalid', ['invalid'], s.k, 'underline'),
  ];
}

function semanticTokenColors(s) {
  return {
    namespace: s.t,
    class: s.t,
    interface: s.t,
    enum: s.t,
    type: s.t,
    typeParameter: s.t,
    function: s.f,
    method: s.f,
    property: s.p,
    enumMember: s.n,
    parameter: s.v,
    'variable.readonly': s.v,
    'variable.defaultLibrary': s.n,
  };
}

fs.mkdirSync(themesDir, { recursive: true });
for (const f of fs.readdirSync(themesDir)) if (f.endsWith('.json')) fs.unlinkSync(path.join(themesDir, f));

const contributes = [];
for (const preset of PRESETS) {
  for (const mode of ['night', 'day']) {
    const c = preset[mode], dark = mode === 'night';
    const label = `${preset.name} ${dark ? 'Night' : 'Day'}`;
    const file = `${slug(label)}-color-theme.json`;
    const theme = {
      $schema: 'vscode://schemas/color-theme',
      name: label,
      type: dark ? 'dark' : 'light',
      semanticHighlighting: true,
      colors: colors(c, dark),
      semanticTokenColors: semanticTokenColors(c.syn),
      tokenColors: tokenColors(c.syn),
    };
    fs.writeFileSync(path.join(themesDir, file), JSON.stringify(theme, null, 2) + '\n');
    contributes.push({ label, uiTheme: dark ? 'vs-dark' : 'vs', path: `./themes/${file}` });
  }
}

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.contributes = { themes: contributes };
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`Wrote ${contributes.length} themes to themes/`);
