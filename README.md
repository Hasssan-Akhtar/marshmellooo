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

Click the marshmallow icon in the activity bar to open the **Flavours** panel. Each flavour is a slim row with a strip of its colours; click one to apply it. The active flavour expands to show a code preview and the Pin button, and Extras folds away underneath. Use the Night/Day switch to change mode, or the ✨ button in the panel's title bar to pick a random flavour.

You can also click the 🍡 flavour name in the status bar, or run **Marshmallow: Pick a Flavour**, for a quick picker.

## Make your own flavour

Click **✦ Make your own flavour** at the bottom of the list. Name it, pick a base and an accent, choose how sweet the syntax colours are (Subtle, Sweet or Sugar rush), and borrow the text style and cursor of any built-in flavour. While the builder is open, the whole editor shows your flavour live as you change it; **Cancel** puts back what you had and **Save** keeps it. 🎲 Shuffle rolls a random base, accent, sweetness and style (keeping your name). Save it and it joins the list, in both Night and Day, with an ✎ button to edit or delete it.

You can keep up to three. They live in the **Marshmallow Custom 1–3** theme slots, and their colours are stored as theme-scoped `workbench.colorCustomizations`, `editor.tokenColorCustomizations` and `editor.semanticTokenColorCustomizations` in your user settings. Deleting a flavour removes only its own entries.

## Extras

All of these live in **Settings → Marshmallow** and at the bottom of the Flavours panel.

- **Personality** (on by default): each flavour brings its own cursor shape, blink and spacing. Your previous cursor and spacing settings are saved first, and turning Personality off puts them back.
- **Rainbow indent guides:** indent guides cycle through the flavour's syntax colours, brighter on the block you're in. Built into every theme.
- **Pin to project:** the active card's **Pin** button saves the flavour in the project's `.vscode/settings.json`, so that window always opens in it. Picking another flavour while pinned updates the pin; **Unpin** removes it.
- **Follow the sun:** `off`, `system` (match your OS light/dark appearance) or `time` (Day from `dayStartsAt`, Night from `nightStartsAt`). Keeps your flavour and only flips Night/Day.
- **Flavour of the day** (off by default): the first window each day opens in a random flavour. Pinned projects keep theirs.
- **Status bar treat** (on by default): shows the active flavour in the status bar.

## Install locally

```bash
npm run package
code --install-extension marshmallow-theme-0.4.2.vsix
```

Then pick a theme with **Preferences: Color Theme** (`Cmd+K Cmd+T`).

## Editing colours

The theme files in `themes/` are generated, so don't edit them by hand.

- `lib/palettes.js` holds the palettes from the original design. Marshmallow is hand-tuned; the other flavours come from an OKLCH formula driven by `PRESET_SPECS`.
- `lib/theme.js` maps a palette onto VS Code colour keys and token scopes. `STYLES` sets each flavour's italic/bold/underline choices and `PERSONALITY` its cursor and spacing. The extension uses the same code to build custom flavours.
- `scripts/build.js` writes the theme files from those two.

After changing any of them, run `npm run build`. It also regenerates `media/flavours.json`, which the flavour picker in `extension.js` reads.
