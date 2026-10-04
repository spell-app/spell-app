/**
 * Every name `<ui-docs-tokens>` uses:  tag, attributes, events, slots, parts, states, texts.
 * Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - A DOC-ONLY element (`src/docs-components/`):  filed under the `documentation` topic, left out of the component
 *   list, loaded by `<ui-root>` like any family.
 * - Class words:  `global`, `playground` (`ui global playground tokens`);  the data's progress is `:state(loading)` /
 *   `:state(error)`, a changed token `:state(modified)`.
 * - Texts:  every column header, label and message it shows;  the data's own descriptions are English.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-docs-tokens>`
 * The CSS custom properties of a component family, or the foundation's, as tables with live colour swatches;  with
 * `playground`, an input per token that sets it on a live preview.
 ****************/
export const docsTokensVocabulary = {
  tag: "ui-docs-tokens",
  topics: ["documentation", "data display", "tables"],
  aka: [
    "css variables",
    "custom properties",
    "design tokens",
    "theme tokens",
    "token table",
    "theming playground",
    "style playground",
    "swatches"
  ],
  skeleton: {
    parts: [
      { shape: "line", length: "short" },
      { shape: "paragraph", lines: 5 }
    ]
  },
  noun: "tokens",
  description:
    "A token table lists the CSS custom properties of a component family, or of the whole foundation, with their " +
    "defaults and a live swatch for each colour;  a playground adds inputs that restyle a live preview.",
  attributes: [
    {
      name: "family",
      kind: "string",
      description: "Family folder whose tokens to list, e.g. `ui-button`:  its sheets' public `--ui-<tag>-*` tokens."
    },
    {
      name: "tag",
      kind: "string",
      description: "A tag, e.g. `ui-or`:  lists the tokens of the family it belongs to (`ui-button`).  `family` wins."
    },
    {
      name: "global",
      kind: "keyOnly",
      description:
        "The FOUNDATION tokens instead of a family's:  type, sizes, spacing, radii, colours, shadows, motion ...;  one " +
        "table per group, under a header."
    },
    {
      name: "groups",
      kind: "string",
      description:
        "With `global`:  which groups to show, space-separated ids, e.g. `typography radii`;  default every group.  " +
        "Ids:  `typography sizes spacing radii text surfaces borders palette brand semantic scheme shadows motion " +
        "stacking breakpoints`."
    },
    {
      name: "tokens",
      kind: "string",
      description:
        "Only these tokens:  space-separated names, or prefixes ending in `*`, e.g. `--ui-font-size --ui-blue*`."
    },
    {
      name: "playground",
      kind: "keyOnly",
      description:
        "A live preview (the element's children) above the table, an input per token (a colour picker for colours) " +
        "that sets it on the preview, and a reset button."
    },
    {
      name: "target",
      kind: "enum",
      values: ["preview", "page"],
      default: "preview",
      description:
        "Where the playground sets tokens:  `preview` (the children only) or `page` (`:root`:  the whole page follows, " +
        "this table included).  Reset removes what it set."
    },
    {
      name: "caption",
      kind: "string",
      description: "Caption of the table;  `global` captions each group's table with its title instead."
    },
    {
      name: "level",
      kind: "number",
      default: 3,
      description: "Heading level of the group headers with `global`, `1` ... `6`."
    }
  ],
  events: [
    {
      name: "ui-input",
      detail: "{ token: string, value: string, originalEvent?: Event }",
      description: 'A playground input set a token;  `value` `""`:  removed (back to its default).'
    },
    {
      name: "ui-reset",
      detail: "{ tokens: string[], originalEvent?: Event }",
      description: "The reset button removed every token the playground had set (`tokens`)."
    }
  ],
  slots: [
    {
      name: "",
      description:
        "The live preview of the playground, e.g. a `<ui-button>`:  the tokens are set on it.  Ignored without " +
        "`playground`."
    }
  ],
  parts: [
    { name: "tokens", description: "The whole block (`<section>`)." },
    { name: "search", description: "The `<ui-input>` that filters the rows (`global`, or a long table)." },
    { name: "playground", description: "The `<ui-segment>` around the preview and reset button." },
    { name: "preview", description: "The box the preview children (default slot) sit in." },
    { name: "reset", description: "The reset `<ui-button>`." },
    { name: "group", description: "One group of `global`:  its header, description and table." },
    { name: "header", description: "A group's `<ui-header>`." },
    { name: "description", description: "A group's description." },
    { name: "table", description: "Each `<ui-table>`." },
    { name: "swatch", description: "A colour token's live swatch (`<ui-label circular empty>`)." },
    { name: "input", description: "A token's playground `<ui-input>`." },
    { name: "message", description: "The `<ui-message>` shown for no tokens, an unknown family, or a load error." }
  ],
  states: [
    { name: "loading", description: "The site data is on its way." },
    { name: "error", description: "The site data failed to load, or names no such family." },
    { name: "modified", description: "The playground has set at least one token." }
  ],
  texts: [
    { key: "token", text: "Token", description: "Column header:  the custom property's name." },
    { key: "default", text: "Default", description: "Column header:  its default value (and swatch)." },
    { key: "description", text: "Description", description: "Column header:  what it controls." },
    { key: "value", text: "Value", description: "Column header:  the playground's input." },
    { key: "search", text: "Filter tokens", description: "Placeholder and label of the filter input." },
    { key: "reset", text: "Reset", description: "The reset button." },
    { key: "preview", text: "Preview", description: "Accessible name of the playground's preview." },
    { key: "setToken", text: "Set {token}", description: "Accessible name of a token's input." },
    {
      key: "noTokens",
      text: "{tag} exposes no tokens of its own.",
      description: "Message for a family without public tokens."
    },
    { key: "noMatch", text: "No token matches.", description: "Message when the filter leaves no row." },
    {
      key: "unknownFamily",
      text: "No family {family} in the site data.",
      description: "Message for a `family` / `tag` the data doesn't know."
    },
    { key: "loadError", text: "Couldn't load the token data:  {error}", description: "Message when the fetch fails." },
    { key: "missing", text: "Name a family, a tag, or global.", description: "Message with no attribute to go on." }
  ]
} as const satisfies ComponentVocabulary
