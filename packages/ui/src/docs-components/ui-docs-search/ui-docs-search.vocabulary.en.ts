/**
 * Every name `<ui-docs-search>` uses:  tag, attributes, events, slots, parts, states, texts.
 * Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - A DOC-ONLY element (`src/docs-components/`):  filed under the `documentation` topic, left out of the component
 *   list, loaded by `<ui-root>` like any family.
 * - Class words:  `ui [size] finder` on the box;  `size` scales the field and its results (`--ui-scale`).  Not
 *   `search`:  a theme sheet restyling Fomantic's `.ui.search` would reach it.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-docs-search>`
 * The docs site's search:  a pill field that jumps anywhere -- a section of the page shown, a component, an
 * attribute, a page or another page's section -- through a results card under it, keyboard first.
 ****************/
export const docsSearchVocabulary = {
  tag: "ui-docs-search",
  topics: ["documentation", "navigation", "inputs"],
  aka: ["site search", "docs search", "quick find", "jump to", "command palette", "spotlight", "omnibox", "docsearch"],
  skeleton: { width: "16em", height: "2.25em" },
  noun: "finder",
  description:
    "A docs search is a field that finds sections of the page shown, components, attributes and every page's " +
    "sections as you type, and jumps to the one you pick;  `/` or Cmd / Ctrl+K focuses it from anywhere.",
  attributes: [
    {
      name: "base",
      kind: "string",
      description:
        "The site root, relative to the page, e.g. `../` from `components/`;  every result's link starts with it.  " +
        "Default:  the folder above the site's data file (`SiteData`), so links are absolute."
    },
    {
      name: "page",
      kind: "string",
      description:
        'Selector of the element whose sections "On this page" lists:  its `<ui-section id>`s and headers with ' +
        "ids, across every tab.  Default:  `main#main`, else the page's `main`."
    },
    {
      name: "shortcuts",
      kind: "boolean",
      default: true,
      description:
        "`/` and Cmd / Ctrl+K focus the field from anywhere on the page (`/` not while typing in a field);  with " +
        "several fields, the visible one, else one in a closed flyout, which opens.  `false` turns them off."
    },
    {
      name: "placeholder",
      kind: "string",
      description: "The field's hint.  Default:  the vocabulary's `placeholder` text."
    },
    {
      name: "size",
      kind: "size",
      description: "Size of the field and its results, `mini` ... `massive`;  `medium` is the default."
    }
  ],
  events: [
    {
      name: "ui-input",
      detail: "{ value: string, originalEvent: Event }",
      description: "The text changed (every keystroke, and clearing):  what a list beside the field filters by."
    },
    {
      name: "ui-navigate",
      detail: "{ href: string, kind: string, originalEvent: Event }",
      cancelable: true,
      description:
        "A result was picked (Enter or a plain click):  `href` is absolute, `kind` its group (`here`, `component`, " +
        "`page`, `section`, `attribute`).  `preventDefault()` keeps the browser on the page (a router takes over);  " +
        "else a result on the page shown sets the hash, any other loads its page."
    }
  ],
  slots: [],
  parts: [
    { name: "search", description: "The box around the field and its results." },
    { name: "field", description: "The pill:  the icon, the `<input>`, the clear button and the shortcut hint." },
    { name: "input", description: "The `<input role=combobox>`." },
    { name: "keys", description: "The shortcut hint, shown while the field is empty and not focused." },
    { name: "results", description: "The results card (a popover under the field)." },
    { name: "group", description: "One group of results under its label." },
    { name: "label", description: "A group's label:  a mono eyebrow." },
    { name: "option", description: "One result:  a link with `role=option`." },
    { name: "hints", description: "The keys line at the foot of the results." }
  ],
  states: [
    { name: "open", description: "The results card shows." },
    { name: "searching", description: "Text is typed." },
    { name: "empty", description: "The text matches nothing." },
    { name: "loading", description: "The site's data is still on its way:  only this page's sections are searched." }
  ],
  texts: [
    { key: "label", text: "Search the docs", description: "Accessible name of the field." },
    { key: "placeholder", text: "Search", description: "The field's hint." },
    { key: "results", text: "Search results", description: "Accessible name of the results list." },
    { key: "clear", text: "Clear the search", description: "Name of the clear button." },
    { key: "onThisPage", text: "On this page", description: "Label of the page shown's sections." },
    { key: "components", text: "Components", description: "Label of the matching tags." },
    { key: "pages", text: "Pages", description: "Label of the hand-written pages." },
    { key: "sections", text: "Sections", description: "Label of other pages' sections." },
    { key: "attributes", text: "Attributes", description: "Label of the matching attributes." },
    { key: "api", text: "API", description: "Where an attribute result lands:  its tag's API tables." },
    { key: "noMatches", text: "Nothing matches “{query}”", description: "Shown when the text matches nothing." },
    {
      key: "loading",
      text: "Loading the index…",
      description: "Shown under this page's results until the data arrives."
    },
    { key: "resultOne", text: "1 result", description: "Announced:  one result." },
    { key: "resultMany", text: "{count} results", description: "Announced:  the result count." },
    { key: "move", text: "to move", description: "Keys line:  after the up / down keys." },
    { key: "go", text: "to go", description: "Keys line:  after the Enter key." },
    { key: "close", text: "to close", description: "Keys line:  after the Escape key." }
  ]
} as const satisfies ComponentVocabulary
