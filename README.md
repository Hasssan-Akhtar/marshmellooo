# Marshmallow Theme

Soft pastel syntax on a cocoa-dark or cream-light canvas. Ten flavours, each in a **Night** (dark) and **Day** (light) variant:

Marshmallow · Bubblegum · Mint Chip · Peach Cobbler · Blueberry Pie · Matcha Latte · Lemon Drop · Cotton Candy · Sea Glass · Cherry Cola

## Install locally

```bash
npm run package
code --install-extension marshmallow-theme-0.1.0.vsix
```

Then pick a theme with **Preferences: Color Theme** (`Cmd+K Cmd+T`).

## Editing colours

The theme files in `themes/` are generated, so don't edit them by hand.

- `scripts/palettes.js` holds the palettes from the original design. Marshmallow is hand-tuned; the other flavours come from an OKLCH formula driven by `PRESET_SPECS`.
- `scripts/build.js` maps each palette onto VS Code colour keys and token scopes.

After changing either file, run `npm run build`.
