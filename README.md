# Marshmallow Theme

*Code that looks good enough to eat.*

Soft pastel syntax on a cocoa-dark or cream-light canvas. Every flavour comes in **Night** (for when the snacks come out) and **Day** (fresh out of the oven).

| Flavour | |
|---|---|
| **Marshmallow** | The original. Fluffy pink on cocoa. |
| **Bubblegum** | Pop a bubble, push a commit. |
| **Mint Chip** | Cool, crisp and suspiciously refreshing. |
| **Peach Cobbler** | Warm, golden and best served late at night. |
| **Blueberry Pie** | Deep blue with a sweet, jammy finish. |
| **Matcha Latte** | Calm greens for focused, whisked-up work. |
| **Lemon Drop** | A bright, tangy zing for sleepy mornings. |
| **Cotton Candy** | Spun-sugar pink and blue, light as air. |
| **Sea Glass** | Sea-worn teals and soft blues. |
| **Cherry Cola** | Fizzy red over a dark, sweet base. |

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
