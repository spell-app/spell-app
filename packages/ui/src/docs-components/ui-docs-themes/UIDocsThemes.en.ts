/**
 * The English vocabulary of `<ui-docs-themes>`:  every name the tag uses.
 * - Its tag, attributes, events, slots, parts, states and texts.
 *   The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - A DOC-ONLY element (`src/docs-components/`):  filed under the `documentation` topic,
 *   left out of the component list, and loaded by `<ui-root>` like any family.
 * - Class words:  `inverted` (`ui inverted themes`), for dark backgrounds.
 */

import type { E } from "$/ui/core"

/****************
 * ### `docsThemesVocabulary`
 * The names of `<ui-docs-themes>`, the docs site's look controls:  a sun / moon button flipping light and dark,
 * and a palette button opening a small overlay with the theme list and "Match system";
 * or, on a component page, a theme dropdown.  Remembered per viewer.
 ****************/
export const docsThemesVocabulary = {
  tag: "ui-docs-themes",
  topics: ["documentation", "controls", "selection"],
  aka: ["theme picker", "theme switcher", "dark mode toggle", "colour scheme", "appearance", "skin"],
  skeleton: "inline 5 x 2.25",
  noun: "themes",
  description:
    "Theme controls switch the page between light and dark, and pick its theme, and remember both for the next " +
    "page.",
  attributes: [
    {
      name: "for",
      kind: "string",
      property: "htmlFor",
      description:
        "A tag, e.g. `ui-button`:  list only the themes that restyle its family, and say how many (`3 Themes`), as " +
        "Fomantic's per-page theme dropdown does.  Spell, Plain and Classic stay on top."
    },
    {
      name: "show",
      kind: "enum",
      values: ["both", "theme", "scheme"],
      default: "both",
      description:
        "Which controls to show:  `both` (the light / dark button and the palette button with its overlay), " +
        "`scheme` (the light / dark button alone) or `theme` (a theme dropdown, e.g. with `for`)."
    },
    {
      name: "size",
      kind: "size",
      description: "Size of the buttons (or the dropdown), `mini` ... `massive`;  `medium` is the default."
    },
    {
      name: "inverted",
      kind: "keyOnly",
      description: "For dark backgrounds (a dark header or side panel):  light buttons, an inverted dropdown."
    }
  ],
  events: [
    {
      name: "ui-change",
      detail: "{ theme?: string, scheme: 'light' | 'dark' | 'system', shown: 'light' | 'dark', originalEvent?: Event }",
      description:
        "The viewer picked a theme or a scheme here;  `theme` is a `UI.themes` name, absent for our own look;  " +
        "`scheme` is `system` while following the OS, and `shown` the scheme the page shows.  Fired after the look " +
        "is stored and while its sheets load."
    }
  ],
  slots: [],
  parts: [
    { name: "controls", description: "The wrapper around the controls." },
    { name: "scheme", description: "The light / dark `<button>`:  a sun or a moon, the scheme the page shows." },
    { name: "palette", description: "The `<button>` opening the overlay." },
    { name: "overlay", description: 'The overlay, a `<ui-popup open-on="click">`;  its box is `::part(popup)`.' },
    { name: "menu", description: "The overlay's theme list (`role=menu`)." },
    { name: "option", description: "One theme in the list (`role=menuitemradio`)." },
    { name: "system", description: 'The overlay\'s "Match system" switch (`role=switch`).' },
    { name: "tip", description: 'A button\'s tooltip, a `<ui-popup inverted size="mini">`.' },
    { name: "theme", description: 'The theme `<ui-dropdown>` (`show="theme"`).' }
  ],
  states: [
    { name: "themed", description: "A theme other than our own look is applied." },
    { name: "dark", description: "The page shows the dark scheme (chosen, or the OS's while following it)." },
    { name: "following", description: 'The scheme follows the OS (nothing chosen, or "Match system" on).' },
    { name: "open", description: "The overlay is open." }
  ],
  texts: [
    { key: "themeLabel", text: "{title} theme", description: "The dropdown's text:  the chosen theme." },
    {
      key: "themeCount",
      text: "{count} themes",
      description: "The dropdown's text with `for`, while the chosen theme isn't one of the family's."
    },
    { key: "themeCountOne", text: "1 theme", description: "`themeCount` when the family has exactly one theme." },
    {
      key: "themeName",
      text: "Theme",
      description: "Accessible name of the theme dropdown, and the overlay's header."
    },
    { key: "default", text: "Plain", description: "Our own look, no theme." },
    { key: "defaultDescription", text: "Spell UI, unthemed", description: "Under `Plain` in the list." },
    { key: "spellDescription", text: "The Spell brand", description: "Under `Spell` in the list:  the default." },
    {
      key: "spellBrandDescription",
      text: "The brand as Claude Design drew it",
      description: "Under `Spell Brand` in the list:  the theme the brand pages converge on."
    },
    { key: "classicDescription", text: "Fomantic's look", description: "Under `Classic` in the list." },
    { key: "fomanticThemes", text: "Fomantic themes", description: "List header above Fomantic's themes." },
    { key: "toDark", text: "Switch to dark", description: "The light / dark button's name, while the page is light." },
    { key: "toLight", text: "Switch to light", description: "The light / dark button's name, while the page is dark." },
    {
      key: "palette",
      text: "Theme:  {title}",
      description: "The palette button's name and tooltip:  the chosen theme."
    },
    { key: "overlayName", text: "Theme and colour scheme", description: "Accessible name of the overlay." },
    { key: "matchSystem", text: "Match system", description: "The overlay's switch:  follow the OS's scheme." },
    {
      key: "matchSystemDescription",
      text: "Follow your device",
      description: "Under `Match system`."
    }
  ]
} as const satisfies E.ComponentVocabulary
