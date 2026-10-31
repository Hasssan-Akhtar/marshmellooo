// Generates themes/*.json, media/flavours.json and the contributes.themes list
// in package.json from lib/palettes.js and lib/theme.js. Run with: npm run build
const fs = require('fs');
const path = require('path');
const { PRESETS } = require('../lib/palettes');
const { themeFor, STYLES, PERSONALITY, BLURBS, swatch, customPalettes, slotName, DEFAULT_CUSTOM } = require('../lib/theme');

const root = path.join(__dirname, '..');
const themesDir = path.join(root, 'themes');
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const CUSTOM_SLOTS = [1, 2, 3];

fs.mkdirSync(themesDir, { recursive: true });
for (const f of fs.readdirSync(themesDir)) if (f.endsWith('.json')) fs.unlinkSync(path.join(themesDir, f));

const contributes = [];
function writeTheme(name, palettes, style) {
  for (const mode of ['night', 'day']) {
    const dark = mode === 'night';
    const label = `${name} ${dark ? 'Night' : 'Day'}`;
    const file = `${slug(label)}-color-theme.json`;
    const theme = {
      $schema: 'vscode://schemas/color-theme',
      name: label,
      type: dark ? 'dark' : 'light',
      semanticHighlighting: true,
      ...themeFor(palettes[mode], dark, style),
    };
    fs.writeFileSync(path.join(themesDir, file), JSON.stringify(theme, null, 2) + '\n');
    contributes.push({ label, uiTheme: dark ? 'vs-dark' : 'vs', path: `./themes/${file}` });
  }
}

for (const preset of PRESETS) writeTheme(preset.name, preset, STYLES[preset.name]);

// Custom slots ship with a default look; the extension recolours them through
// theme-scoped colour customizations when you save a flavour into a slot.
for (const slot of CUSTOM_SLOTS) writeTheme(slotName(slot), customPalettes(DEFAULT_CUSTOM), STYLES[DEFAULT_CUSTOM.like]);

// Swatch data for the sidebar flavour picker (see extension.js).
const flavours = PRESETS.map((p) => ({
  name: p.name,
  blurb: BLURBS[p.name],
  style: { comment: 'italic', ...STYLES[p.name] },
  personality: PERSONALITY[p.name],
  night: swatch(p.night),
  day: swatch(p.day),
}));
fs.mkdirSync(path.join(root, 'media'), { recursive: true });
fs.writeFileSync(path.join(root, 'media', 'flavours.json'), JSON.stringify(flavours, null, 2) + '\n');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.contributes = { ...pkg.contributes, themes: contributes };
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`Wrote ${contributes.length} themes to themes/ and swatches to media/flavours.json`);
