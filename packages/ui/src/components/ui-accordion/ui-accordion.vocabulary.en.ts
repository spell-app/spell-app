/**
 * Every name `<ui-accordion>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states, texts.
 * Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-accordion styled compact="very" inverted>` => `ui inverted styled very compact accordion`.
 *   `ui-accordion.css` keys on those words.
 * - Panels are the light children in PAIRS:  a `<ui-title>` (the generic part) and the element after it (usually a
 *   `<ui-content>`) -- Fomantic's `.title` + `.content`, one to one.  The accordion wraps each pair in its own
 *   `<details>` in its shadow root (manual slot assignment), so the titles and contents never need a panel element.
 * - The accordion does NOT own the `title` / `content` parts:  its `<summary class="title">` and
 *   `<div class="content">` are the boxes, so the slotted parts stay plain (`ui-parts.css` has no box for them).
 * - `open` lists the open panels by INDEX, like Fomantic's `open(index)`:  a pair has no element of its own to carry
 *   the state.  An open panel is `open`, as a `<details>` is.
 * - A `<ui-accordion>` inside another one is NESTED (`ownsParts:  accordion`):  it drops `ui` and takes its parent's
 *   look, as Fomantic's `.ui.accordion .accordion` does.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-accordion>`
 * An accordion:  `<div class="ui ... accordion" part="accordion">` holding one `<details>` per title + content pair.
 ****************/
export const accordionVocabulary = {
  tag: "ui-accordion",
  topics: ["containers", "navigation", "data display", "modules"],
  aka: ["collapse", "collapsible", "disclosure", "expander", "details", "faq"],
  skeleton: {
    parts: [
      { shape: "line", length: "long" },
      { shape: "line", length: "long" },
      { shape: "line", length: "long" }
    ]
  },
  noun: "accordion",
  description: "An accordion allows users to toggle the display of sections of content.",
  attributes: [
    { name: "styled", kind: "keyOnly", description: "A boxed accordion:  bordered, bold titles, padded content." },
    { name: "fluid", kind: "keyOnly", description: "Takes the full width of its container." },
    { name: "inverted", kind: "keyOnly", description: "The dark scheme, for a dark background." },
    {
      name: "basic",
      kind: "keyOnly",
      description: "With `styled`:  no box, no rules between titles -- only the styled spacing and title colours."
    },
    {
      name: "compact",
      kind: "keyOrValueAndKey",
      values: ["very"],
      description: 'Less padding around titles and content;  `compact="very"` less still (`very compact`).'
    },
    {
      name: "tree",
      kind: "keyOnly",
      description: "Indents each panel's content under its title, like a file tree (nested accordions line up)."
    },
    {
      name: "exclusive",
      kind: "boolean",
      default: true,
      description:
        "Only one panel open at a time (a `<details name>` group):  opening one closes the others.  " +
        '`exclusive="no"` lets any number stay open.'
    },
    {
      name: "collapsible",
      kind: "boolean",
      default: true,
      description: 'The open panel closes when its title is activated;  `collapsible="no"` keeps one open.'
    },
    {
      name: "open",
      kind: "string",
      description:
        'Indexes of the open panels (0-based), space-separated:  `open="0"`, `open="0 2"`.  Controlled:  set it to ' +
        "open / close panels;  `ui-open` / `ui-close` can veto the user's changes.  When `exclusive`, only the " +
        "first index counts."
    }
  ],
  events: [
    {
      name: "ui-open",
      detail: "{ index: number, open: true, title: Element, content?: Element, originalEvent?: Event }",
      cancelable: true,
      description:
        "A panel is about to open;  `preventDefault()` keeps it closed.  NOT cancelable in effect when the browser " +
        "opened it itself (find-in-page)."
    },
    {
      name: "ui-close",
      detail: "{ index: number, open: false, title: Element, content?: Element, originalEvent?: Event }",
      cancelable: true,
      description:
        "A panel is about to close -- its title was activated, or another panel is opening in an `exclusive` " +
        "accordion;  `preventDefault()` keeps it open (and then the other one closed)."
    }
  ],
  slots: [
    {
      name: "",
      description:
        "Title + content pairs:  each `<ui-title>` starts a panel, the element after it is its content (usually a " +
        "`<ui-content>`).  Other children are not shown."
    }
  ],
  parts: [
    { name: "accordion", description: "The accordion box." },
    { name: "panel", description: "One panel's `<details>`." },
    { name: "title", description: 'A panel\'s `<summary class="title">`:  the control that opens and closes it.' },
    { name: "icon", description: "The dropdown arrow in a title, turned down while the panel is open." },
    { name: "content", description: "A panel's content box." }
  ],
  states: [
    { name: "open", description: "At least one panel is open." },
    { name: "animated", description: "Panels open and close with a height transition (`interpolate-size`)." },
    { name: "in-accordion", description: "Nested in another accordion:  it takes that one's look." }
  ],
  texts: [],
  ownsParts: ["accordion"]
} as const satisfies ComponentVocabulary
