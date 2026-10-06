/**
 * Every name `<ui-docs-api>` uses:  tag, attributes, events, slots, parts, states, texts.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - A DOC-ONLY element (`src/docs-components/`):  filed under the `documentation` topic, left out of the component
 *   list, loaded by `<ui-root>` like any family.
 * - No class words:  `ui api` only;  the data's progress is `:state(loading)` / `:state(error)`.
 * - Texts:  every title, column header and message the tables show;  the data's own descriptions are English.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-docs-api>`
 * The API reference of a tag, or of every tag of a family:  attributes, properties, events, slots, parts, states and
 * texts tables, from the site's data.
 ****************/
export const docsApiVocabulary = {
  tag: "ui-docs-api",
  topics: ["documentation", "data display", "tables"],
  aka: ["api reference", "api table", "props table", "properties table", "attribute table", "args table", "reference"],
  skeleton: "short line, 5 line paragraph",
  noun: "api",
  description:
    "An API reference lists a tag's attributes, properties, events, slots, parts, states and texts as tables, from " +
    "the site's generated data.",
  attributes: [
    {
      name: "tag",
      kind: "string",
      description: "The tag to document, e.g. `ui-button`:  its tables only, no header of its own."
    },
    {
      name: "family",
      kind: "string",
      description:
        "Document EVERY tag of a family instead, e.g. `ui-button` (`<ui-button>`, `<ui-buttons>`, `<ui-or>`):  " +
        "each under its own header, whose id is the tag, so `#ui-or` links to it.  A folder or any of its tags."
    },
    {
      name: "level",
      kind: "number",
      default: 3,
      description:
        "Heading level of the topmost headers it draws, `1` ... `5`:  the tag headers with `family`, else the " +
        "table titles;  table titles sit one level under tag headers."
    }
  ],
  events: [
    {
      name: "ui-render",
      detail: "{ tags: string[] }",
      description: "The tables are drawn (the data arrived, or `tag` / `family` changed);  `tags` are the tags shown."
    }
  ],
  slots: [],
  parts: [
    { name: "api", description: "The whole reference (`<section>`)." },
    { name: "tag", description: "One tag's block (`<section>`), with `family`." },
    {
      name: "header",
      description: "A tag's `<ui-header>`, with `family`:  its id is the tag, its text a link to itself."
    },
    { name: "description", description: "A tag's one-line summary under its header, with `family`." },
    { name: "title", description: "A table's `<ui-header>` title, e.g. `Attributes`." },
    { name: "note", description: "The line under a table's title, e.g. how events travel." },
    { name: "table", description: "Each `<ui-table>`." },
    { name: "message", description: "The `<ui-message>` shown when the data can't be loaded or has no such tag." }
  ],
  states: [
    { name: "loading", description: "Fetching the site's data." },
    { name: "error", description: "The data couldn't be loaded, or has no such tag:  the message shows." }
  ],
  texts: [
    { key: "attributes", text: "Attributes", description: "Title of the attributes table." },
    { key: "properties", text: "Properties", description: "Title of the rich-data properties table." },
    { key: "events", text: "Events", description: "Title of the events table." },
    { key: "slots", text: "Slots", description: "Title of the slots table." },
    { key: "parts", text: "Parts", description: "Title of the `::part()` table." },
    { key: "states", text: "States", description: "Title of the `:state()` table." },
    { key: "texts", text: "Texts", description: "Title of the translatable texts table." },
    {
      key: "propertiesNote",
      text: "Rich data:  set as JS properties, never as attributes.",
      description: "Line under the properties title;  `` `x` `` becomes code."
    },
    {
      key: "eventsNote",
      text: "Bubbling, composed `CustomEvent`s;  the data is in `event.detail`.",
      description: "Line under the events title."
    },
    {
      key: "partsNote",
      text: "Style them from outside with `::part()`.",
      description: "Line under the parts title."
    },
    {
      key: "statesNote",
      text: "Match them with `:state()`.",
      description: "Line under the states title."
    },
    {
      key: "textsNote",
      text: "Every string the element shows, translatable through `UI.i18n`.",
      description: "Line under the texts title."
    },
    { key: "attribute", text: "Attribute", description: "Column header." },
    { key: "property", text: "Property", description: "Column header." },
    { key: "event", text: "Event", description: "Column header." },
    { key: "slot", text: "Slot", description: "Column header." },
    { key: "part", text: "Part", description: "Column header." },
    { key: "state", text: "State", description: "Column header." },
    { key: "key", text: "Key", description: "Column header of the texts table." },
    { key: "kind", text: "Kind", description: "Column header." },
    { key: "values", text: "Values", description: "Column header." },
    { key: "default", text: "Default", description: "Column header." },
    { key: "detail", text: "Detail", description: "Column header:  `event.detail`'s shape." },
    { key: "english", text: "English", description: "Column header of the texts table." },
    { key: "description", text: "Description", description: "Column header." },
    { key: "defaultSlot", text: "(default)", description: "Name of the unnamed slot." },
    { key: "alias", text: "alias", description: "Note under a name:  another name accepted for it." },
    {
      key: "propertyName",
      text: "property",
      description: "Note under a name:  its JS property, when that isn't the name in camelCase."
    },
    { key: "notReflected", text: "not reflected", description: "Note:  the property isn't written back." },
    { key: "cancelable", text: "cancelable", description: "Note:  `preventDefault()` vetoes the event." },
    { key: "valueSet", text: "set", description: "Note under values:  the shared value set they come from." },
    {
      key: "tableLabel",
      text: "{section} of {tag}",
      description: "Accessible name of a table, e.g. `Attributes of <ui-or>`."
    },
    { key: "noTag", text: "Set `tag` or `family`.", description: "Message:  neither attribute is set." },
    { key: "notFound", text: "No API data for `{tag}`.", description: "Message:  the data has no such tag." },
    {
      key: "loadError",
      text: "Couldn't load the API data:  {error}",
      description: "Message:  the data file failed to load."
    }
  ]
} as const satisfies E.ComponentVocabulary
