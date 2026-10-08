/**
 * The English vocabulary of `<ui-accordion>`:  every name the tag uses.
 * - Its tag, attributes (each with its kind and allowed values), events, slots, parts, states and texts.
 *   The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Pure data:  node imports it (`yarn site:data`, `yarn gen:root`),
 *   so `$/ui/core` for types only, and `UIT` by value straight from `components.types`.
 * - The attributes become Fomantic's class words, in Fomantic's order (`ClassBuilder`):
 *   `<ui-accordion styled compact="very" inverted>` => `ui inverted styled very compact accordion`.
 *   `UIAccordion.css` keys on those words.
 * - The panels are the light children in PAIRS:  a `<ui-title>` (the generic part) and the element after it
 *   (usually a `<ui-content>`), as Fomantic's `.title` + `.content`, one to one.
 *   The accordion wraps each pair in its own `<details>` in its shadow root (manual slot assignment),
 *   so the titles and contents never need a panel element.
 * - The accordion does NOT own the `title` / `content` parts:
 *   its `<summary class="title">` and `<div class="content">` are the boxes, so the slotted parts stay plain
 *   (`UIParts.css` has no box for them).
 * - `open` lists the open panels by INDEX, like Fomantic's `open(index)`:
 *   a pair has no element of its own to carry the state.  An open panel is `open`, as a `<details>` is.
 * - `source` (`UIT.LoadableBody*`):  the FIRST panel's content comes from a file the first time it opens
 *   (`LoadableBody`);  meant for an accordion of one title + content pair (a plan doc's item).
 * - A `<ui-accordion>` inside another one is NESTED (`ownsParts:  accordion`):
 *   it drops `ui` and takes its parent's look, as Fomantic's `.ui.accordion .accordion` does.
 */

import type { E } from "$/ui/core"
import * as UIT from "$/ui/components/components.types"

/****************
 * ### `accordionVocabulary`
 * The names of `<ui-accordion>`:
 * `<div class="ui … accordion" part="accordion">` holding one `<details>` per title + content pair.
 ****************/
export const accordionVocabulary = {
  tag: "ui-accordion",
  topics: ["containers", "navigation", "data display", "modules"],
  aka: ["collapse", "collapsible", "disclosure", "expander", "details", "faq"],
  skeleton: "long line, long line, long line",
  noun: "accordion",
  description: "An accordion lets people show and hide sections of content.",
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
        "open / close panels;  `ui-open` / `ui-close` can veto people's changes.  When `exclusive`, only the " +
        "first index counts."
    },
    ...UIT.SourceBodyAttributes
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
    },
    ...UIT.SourceBodyEvents
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
    { name: "content", description: "A panel's content box." },
    ...UIT.SourceBodyParts
  ],
  states: [
    { name: "open", description: "At least one panel is open." },
    { name: "animated", description: "Panels open and close with a height transition (`interpolate-size`)." },
    { name: "in-accordion", description: "Nested in another accordion:  it takes that one's look." },
    { name: "loading", description: "With `source`:  fetching the file." },
    ...UIT.SourceBodyStates
  ],
  texts: [...UIT.SourceFailureTexts],
  ownsParts: ["accordion"]
} as const satisfies E.ComponentVocabulary
