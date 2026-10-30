# Marshmallow Theme

*Code that looks good enough to eat.*

Soft pastel syntax on a cocoa-dark or cream-light canvas. Every flavour comes in **Night** (for when the snacks come out) and **Day** (fresh out of the oven).

| Flavour | | Text style |
|---|---|---|
| **Marshmallow** | The original. Fluffy pink on cocoa. | Soft cursive: italic keywords, parameters, `this` and attributes |
| **Bubblegum** | Pop a bubble, push a commit. | Loud and poppy: bold keywords and functions, bold-italic `this` |
| **Mint Chip** | Cool, crisp and suspiciously refreshing. | Crisp: no italics at all, bold types |
| **Peach Cobbler** | Warm, golden and best served late at night. | Cozy: italic types and parameters, bold functions |
| **Blueberry Pie** | Deep blue with a sweet, jammy finish. | Rich: bold types, italic keywords and `this` |
| **Matcha Latte** | Calm greens for focused, whisked-up work. | Zen: almost plain, just italic comments and `this` |
| **Lemon Drop** | A bright, tangy zing for sleepy mornings. | Zingy: bold keywords and HTML tags, italic attributes |
| **Cotton Candy** | Spun-sugar pink and blue, light as air. | Airy: italic keywords, strings, parameters, properties and attributes |
| **Sea Glass** | Sea-worn teals and soft blues. | Flowing: italic functions, parameters and `this` |
| **Cherry Cola** | Fizzy red over a dark, sweet base. | Fizzy: bold keywords, functions and types |

The text styles look best with a font that has a real italic, such as Victor Mono, Maple Mono or Cascadia Code. Set it with `editor.fontFamily` in your VS Code settings.

## Flavour picker

Click the marshmallow icon in the activity bar to open the **Flavours** panel. Each card previews a flavour's colours and text style; click one to apply it. Use the Night/Day switch to change mode, or the ✨ button in the panel's title bar to pick a random flavour.

## Install locally

```bash
npm run package
code --install-extension marshmallow-theme-0.2.0.vsix
```

Then pick a theme with **Preferences: Color Theme** (`Cmd+K Cmd+T`).

## Editing colours

The theme files in `themes/` are generated, so don't edit them by hand.

- `scripts/palettes.js` holds the palettes from the original design. Marshmallow is hand-tuned; the other flavours come from an OKLCH formula driven by `PRESET_SPECS`.
- `scripts/build.js` maps each palette onto VS Code colour keys and token scopes. `STYLES` at the top of the token section sets each flavour's italic/bold/underline choices.

After changing either file, run `npm run build`. It also regenerates `media/flavours.json`, which the flavour picker in `extension.js` reads.
