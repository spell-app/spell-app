/**
 * Every name `<ui-docs-themes>` uses:  tag, attributes, events, slots, parts, states, texts.
 * Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - A DOC-ONLY element (`src/docs-components/`):  filed under the `documentation` topic, left out of the component
 *   list, loaded by `<ui-root>` like any family.
 * - Class words:  `inverted` (`ui inverted themes`), passed on to the widgets inside.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-docs-themes>`
 * The docs site's look controls:  a theme dropdown (our own look, Classic, every Fomantic theme) and a light / dark
 * / system button group, both remembered per viewer.
 ****************/
export const docsThemesVocabulary = {
  tag: "ui-docs-themes",
  topics: ["documentation", "controls", "selection"],
  aka: ["theme picker", "theme switcher", "dark mode toggle", "colour scheme", "appearance", "skin"],
  skeleton: { display: "inline", width: "16em", height: "2.5em" },
  noun: "themes",
  description:
    "Theme controls pick the page's theme and its light, dark or system colour scheme, and remember both for the " +
    "next page.",
  attributes: [
    {
      name: "for",
      kind: "string",
      description:
        "A tag, e.g. `ui-button`:  list only the themes that restyle its family, and say how many (`3 Themes`), as " +
        "Fomantic's per-page theme dropdown does.  Default and Classic stay on top."
    },
    {
      name: "show",
      kind: "enum",
      values: ["both", "theme", "scheme"],
      default: "both",
      description: "Which controls to show:  the theme dropdown, the scheme buttons, or `both`."
    },
    {
      name: "size",
      kind: "size",
      description: "Size of the dropdown and buttons, `mini` ... `massive`;  `medium` is the default."
    },
    {
      name: "inverted",
      kind: "keyOnly",
      description: "For dark backgrounds (the site header):  inverted dropdown and buttons."
    }
  ],
  events: [
    {
      name: "ui-change",
      detail: "{ theme?: string, scheme: 'light' | 'dark' | 'system', originalEvent?: Event }",
      description:
        "The viewer picked a theme or a scheme here;  `theme` is a `ThemeSheets` name, absent for our own look.  " +
        "Fired after the look is stored and while its sheets load."
    }
  ],
  slots: [],
  parts: [
    { name: "controls", description: "The wrapper around both controls." },
    { name: "theme", description: "The theme `<ui-dropdown>`." },
    { name: "scheme", description: "The scheme `<ui-buttons>` group." },
    { name: "light", description: "The light scheme `<ui-button>`." },
    { name: "dark", description: "The dark scheme `<ui-button>`." },
    { name: "system", description: "The system scheme `<ui-button>`." }
  ],
  states: [
    { name: "themed", description: "A theme other than our own look is applied." },
    { name: "dark", description: "The dark scheme is chosen (not `system`)." }
  ],
  texts: [
    { key: "themeLabel", text: "{title} theme", description: "The dropdown's text:  the chosen theme." },
    {
      key: "themeCount",
      text: "{count} themes",
      description: "The dropdown's text with `for`, while the chosen theme isn't one of the family's."
    },
    { key: "themeCountOne", text: "1 theme", description: "`themeCount` when the family has exactly one theme." },
    { key: "themeName", text: "Theme", description: "Accessible name of the theme dropdown." },
    { key: "default", text: "Default", description: "Our own look." },
    { key: "defaultDescription", text: "Spell UI", description: "Under `Default` in the menu." },
    { key: "classicDescription", text: "Fomantic's look", description: "Beside `Classic` in the menu." },
    { key: "fomanticThemes", text: "Fomantic themes", description: "Menu header above Fomantic's themes." },
    { key: "schemeName", text: "Colour scheme", description: "Accessible name of the scheme buttons." },
    { key: "light", text: "Light", description: "The light scheme button's name." },
    { key: "dark", text: "Dark", description: "The dark scheme button's name." },
    { key: "system", text: "System", description: "The system scheme button's name:  follow the OS." }
  ]
} as const satisfies ComponentVocabulary
