/**
 * Every name `<ui-section>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states, texts.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-section color="teal" dividing sticky>` => `ui teal dividing sticky section`.
 * - Strings and numbers (`header`, `subhead`, `info`, `level`, `badge`, `offset`, `height`), the booleans
 *   (`collapsible`, `collapsed`) and `fold-icon` are not class words:  the element renders or reads them.
 * - `source` (`UIT.SOURCE_BODY_*`):  the content comes from a file the first time the section unfolds (`SourceBody`).
 *   Spread here, so a subclass reusing this vocabulary (`<ui-panel>`) has it too.
 * - `collapsed` is CONTROLLED (as accordion's `open`):  set it to fold / unfold;  `ui-open` / `ui-close` can veto
 *   a person's changes.
 */

import type { E } from "$/ui/core"
import * as UIT from "$/ui/components/components.types"

/****************
 * ### `<ui-section>`
 * A titled section:  `<section class="ui ... section" part="section">`, its title bar (`<hN>` with the icon,
 * header and a fold button, then the badge and actions), an optional subhead, then the content.
 ****************/
export const sectionVocabulary = {
  tag: "ui-section",
  topics: ["layout", "containers"],
  aka: ["section", "panel", "collapsible", "disclosure", "fieldset", "expander"],
  // a title over its content, as a segment's skeleton
  skeleton: { parts: [{ shape: "header" }, { shape: "paragraph" }] },
  noun: "section",
  description: "A section is a titled block of content that can fold away and keep its title in view.",
  attributes: [
    {
      name: "header",
      kind: "string",
      description: 'Title text;  a slotted `slot="header"` is the rich version (code, links).'
    },
    {
      name: "subhead",
      kind: "string",
      description: 'Smaller text under the title;  scrolls away with the content, never sticks.  Or `slot="subhead"`.'
    },
    {
      name: "level",
      kind: "enum",
      values: ["1", "2", "3", "4", "5", "6"],
      description:
        "Heading level of the title (`<h1>` ... `<h6>`);  default:  the enclosing section's level + 1, else 2 " +
        "(under the page's `h1`)."
    },
    {
      name: "icon",
      kind: "icon",
      description: 'Icon name, before the title;  a slotted `slot="icon"` (a `<ui-icon>`, anything) replaces it.'
    },
    {
      name: "badge",
      kind: "string",
      description: 'A small pill after the title, e.g. a count (`3/7`);  `slot="badge"` is the rich version.'
    },
    {
      name: "info",
      kind: "string",
      description:
        "A tip about the section, shown under the title bar while the pointer is on the title (or the fold button " +
        'has keyboard focus);  it describes the title.  `slot="info"` is the rich version (bold words, line breaks).'
    },
    {
      name: "collapsible",
      kind: "boolean",
      description:
        "The title folds and unfolds the content:  a button with `aria-expanded`.  Default:  on inside " +
        '`<ui-sections collapsing>`, sub-sections included;  `collapsible="false"` opts out there.'
    },
    {
      name: "collapsed",
      kind: "boolean",
      description:
        "Folded:  only the title shows.  Controlled:  set it to fold / unfold;  `ui-open` / `ui-close` can veto " +
        "a person's changes.  Find-in-page unfolds a match."
    },
    {
      name: "fold-icon",
      kind: "enum",
      values: ["start", "end"],
      description:
        "With `collapsible`:  where the fold chevron sits:  `start`, before the title (the default), or `end`, at " +
        "the far end of the title bar, after the badge and actions (a click on it folds too)."
    },
    {
      name: "sticky",
      kind: "keyOnly",
      description:
        "The title bar sticks while the section is on screen;  a sticky section inside another sticks just below " +
        "its title."
    },
    {
      name: "offset",
      kind: "number",
      default: 0,
      description:
        "With `sticky`:  pixels between the top edge and a TOP-LEVEL section's stuck title (e.g. a page header's " +
        "height);  nested sections work theirs out."
    },
    { name: "color", kind: "color", description: "Hue of the title (and of the rule or box edge)." },
    {
      name: "size",
      kind: "size",
      description: "Text size of the CONTENT, `mini` ... `massive`;  the title keeps its level's size."
    },
    { name: "dividing", kind: "keyOnly", description: "A rule under the title." },
    { name: "block", kind: "keyOnly", description: "The title bar in a tinted box." },
    { name: "bordered", kind: "keyOnly", description: "A box around the section, as a segment." },
    {
      name: "styled",
      kind: "keyOnly",
      description: "Boxed as a styled accordion:  a tinted title bar over padded content."
    },
    { name: "raised", kind: "keyOnly", description: "With a box:  lifted with a shadow." },
    { name: "basic", kind: "keyOnly", description: "No box, rule or tint, whatever else is set." },
    { name: "compact", kind: "keyOnly", description: "Less padding and space around the title." },
    {
      name: "padded",
      kind: "keyOrValueAndKey",
      values: ["very"],
      description: 'More padding in the content;  `padded="very"` for even more.'
    },
    {
      name: "attached",
      kind: "keyOrValueAndKey",
      values: ["top", "bottom"],
      description: "With a box:  joined edge to edge with the box above / below;  bare `attached` sits between two."
    },
    {
      name: "scrolling",
      kind: "keyOrValueAndKey",
      values: ["short", "very short", "long", "very long"],
      description: "The content has a capped height and scrolls;  `short` ... `very long` scale the cap."
    },
    {
      name: "height",
      kind: "string",
      description:
        "The content's cap, any CSS length (`20em`, `300px`):  above it the content scrolls (implies `scrolling`)."
    },
    {
      name: "text-align",
      kind: "textAlign",
      values: ["left", "center", "right"],
      description: "Aligns the TITLE `left`, `center` or `right`."
    },
    { name: "inverted", kind: "keyOnly", description: "For dark backgrounds:  the dark scheme." },
    { name: "loading", kind: "keyOnly", description: "Dims the content under a spinner;  `aria-busy`." },
    { name: "disabled", kind: "keyOnly", description: "Dimmed and inert;  can't be folded." },
    ...UIT.SOURCE_BODY_ATTRIBUTES
  ],
  events: [
    {
      name: "ui-open",
      detail: "{ open: boolean, section: Element, originalEvent?: Event }",
      cancelable: true,
      description:
        "About to unfold:  the title was activated, or find-in-page matched inside (not cancelable then, " +
        "`cancelable: false`).  Cancel to stay folded."
    },
    {
      name: "ui-close",
      detail: "{ open: boolean, section: Element, originalEvent?: Event }",
      cancelable: true,
      description: "About to fold:  the title was activated.  Cancel to stay open."
    },
    ...UIT.SOURCE_BODY_EVENTS
  ],
  slots: [
    { name: "", description: "The content:  anything, nested `<ui-section>`s included." },
    { name: "header", description: "Rich title, instead of the `header` attribute." },
    { name: "subhead", description: "Rich subhead, instead of the `subhead` attribute." },
    { name: "icon", description: "Icon before the title, instead of the `icon` attribute (a `<ui-icon>`, an image)." },
    { name: "badge", description: "Rich badge, instead of the `badge` attribute (e.g. a `<ui-label>`)." },
    { name: "actions", description: "Controls at the right of the title bar (buttons, a menu);  never fold it." },
    { name: "info", description: "Rich tip, instead of the `info` attribute (bold words, line breaks)." }
  ],
  parts: [
    { name: "section", description: "The section box." },
    { name: "title", description: "The title bar:  sticks with `sticky`." },
    { name: "heading", description: "The `<h1>` ... `<h6>`." },
    { name: "toggle", description: "With `collapsible`:  the `<button>` inside the heading that folds the section." },
    {
      name: "fold-icon",
      description:
        'With `collapsible`:  the chevron, in the toggle;  with `fold-icon="end"`, at the end of the title bar.'
    },
    { name: "icon", description: "The icon box." },
    { name: "header", description: "The title text box." },
    { name: "badge", description: "The badge pill." },
    { name: "actions", description: "The actions box, at the right of the title bar." },
    { name: "tip", description: "With `info`:  the tip, under the title bar, shown on hover and keyboard focus." },
    { name: "subhead", description: "The subhead under the title." },
    { name: "content", description: "The content box:  `size`, `scrolling` and `height` apply here." },
    ...UIT.SOURCE_BODY_PARTS
  ],
  states: [
    { name: "collapsed", description: "Folded." },
    { name: "stuck", description: "With `sticky`:  the title bar is stuck to the top." },
    { name: "animated", description: "Folds with a height transition (`interpolate-size`)." },
    { name: "in-section", description: "Nested in another section." },
    { name: "in-sections", description: "Directly in a `<ui-sections>` group (no section between)." },
    { name: "inverted", description: "In the dark scheme." },
    { name: "loading", description: "Busy:  `loading`, or a `source` body that is slow to arrive." },
    { name: "disabled", description: "Dimmed and inert." },
    ...UIT.SOURCE_BODY_STATES
  ],
  texts: [
    { key: "loading", text: "Loading…", description: "Announced while `loading`." },
    { key: "fold", text: "Fold", description: "Tooltip of the fold button while open." },
    { key: "unfold", text: "Unfold", description: "Tooltip of the fold button while folded." },
    ...UIT.SOURCE_FAILURE_TEXTS
  ],
  ownsParts: ["section"]
} as const satisfies E.ComponentVocabulary
