/**
 * Every name the generic content parts use -- `<ui-content>`, `<ui-header>`, `<ui-description>`, `<ui-meta>`,
 * `<ui-extra>`, `<ui-actions>`, `<ui-title>`, `<ui-summary>`, `<ui-date>`, `<ui-author>`, `<ui-avatar>`,
 * `<ui-detail>`, `<ui-value>`.  Schema:  `ComponentVocabulary` (`$/vocabulary`).
 * - The noun IS the part word, and the class it renders:  `<ui-meta>` => `<div class="meta">`.  Parts have no
 *   `ui` class (`ui: false`), except a STANDALONE `<ui-header>`, which is Fomantic's `ui header`.
 * - Owners declare what they own (`ownsParts` in THEIR vocabularies);  `OwnerContext` finds a part's nearest
 *   owner and the part sets `:state(in-<owner>)`.  Each part's `states` lists the owners Fomantic styles it in.
 * - `<ui-header>` owns parts too:  a nested `<ui-header>` is its sub header, a `<ui-content>` its text column.
 * - `parts.css` styles every part;  see its header for the owner tokens owners must set.
 */

import type { ComponentVocabulary } from "$/vocabulary"

/** Part nouns, in the order the plan lists them;  each is also the class its root renders. */
export const PART_NOUNS = [
  "content",
  "header",
  "description",
  "meta",
  "extra",
  "actions",
  "title",
  "summary",
  "date",
  "author",
  "avatar",
  "detail",
  "value"
] as const

/****************
 * ### `<ui-content>`
 * A content block:  `<div class="content">`.
 ****************/
export const contentVocabulary = {
  tag: "ui-content",
  noun: "content",
  ui: false,
  description: "The main content block of a card, item, event, comment, modal, message, list item, step ...",
  attributes: [
    { name: "image", kind: "keyOnly", description: "In a modal:  an image beside the description (a flex row)." },
    { name: "scrolling", kind: "keyOnly", description: "In a modal:  a capped height that scrolls." },
    { name: "floated", kind: "valueAndKey", values: "floats", description: "Floats `left` or `right`." },
    {
      name: "text-align",
      kind: "textAlign",
      values: "alignments",
      description: "Aligns its text `left`, `center`, `right` or `justified` (a card's `center aligned content`)."
    },
    {
      name: "vertical-align",
      kind: "verticalAlign",
      values: "verticalAlignments",
      description: "In an item or a list:  `top`, `middle` or `bottom` against the image or icon beside it."
    }
  ],
  events: [],
  slots: [{ name: "", description: "Content, usually other parts." }],
  parts: [{ name: "content", description: "The content box." }],
  states: [
    { name: "in-card", description: "Owned by a card." },
    { name: "in-item", description: "Owned by a item." },
    { name: "in-feed", description: "Owned by a feed." },
    { name: "in-comment", description: "Owned by a comment." },
    { name: "in-modal", description: "Owned by a modal." },
    { name: "in-flyout", description: "Owned by a flyout." },
    { name: "in-message", description: "Owned by a message." },
    { name: "in-list", description: "Owned by a list." },
    { name: "in-step", description: "Owned by a step." },
    { name: "in-accordion", description: "Owned by a accordion." },
    { name: "in-popup", description: "Owned by a popup." },
    { name: "in-toast", description: "Owned by a toast." },
    { name: "in-search", description: "Owned by a search." },
    { name: "in-header", description: "Owned by a header." }
  ],
  texts: []
} as const satisfies ComponentVocabulary

/****************
 * ### `<ui-header>`
 * A header:  standalone, `<div class="ui ... header">` (`<h1>` ... `<h6>` with `level`);  owned, `<div class="header">`.
 ****************/
export const headerVocabulary = {
  tag: "ui-header",
  noun: "header",
  plural: "headers",
  description: "A header provides a short summary of content.",
  attributes: [
    {
      name: "level",
      kind: "enum",
      values: ["1", "2", "3", "4", "5", "6"],
      description: "Page header:  renders `<h1>` ... `<h6>`, sized by level unless `size` is set."
    },
    {
      name: "size",
      kind: "size",
      description:
        "Content header size relative to the surrounding text, `mini` ... `massive`;  `medium` is the default."
    },
    { name: "color", kind: "color", description: "Hue of the text (and of a `dividing` rule)." },
    {
      name: "sub",
      kind: "keyOnly",
      description: "A sub heading:  small, uppercase.  Inside a header, its sub header."
    },
    { name: "icon", kind: "keyOnly", description: "Icon header:  a large slotted icon centred above the text." },
    { name: "dividing", kind: "keyOnly", description: "A rule below it." },
    { name: "block", kind: "keyOnly", description: "In a tinted box." },
    {
      name: "attached",
      kind: "keyOrValueAndKey",
      values: ["top", "bottom"],
      description: "Joined to a segment below (`top`) or above (`bottom`);  bare `attached` sits between two."
    },
    { name: "seamless", kind: "keyOnly", description: "With `attached`:  no line where it meets the segment." },
    { name: "floated", kind: "valueAndKey", values: "floats", description: "Floats `left` or `right`." },
    {
      name: "text-align",
      kind: "textAlign",
      values: "alignments",
      description: "Aligns its text `left`, `center`, `right` or `justified`."
    },
    { name: "fitted", kind: "keyOnly", description: "No padding." },
    { name: "disabled", kind: "keyOnly", description: "Dimmed." },
    { name: "inverted", kind: "keyOnly", description: "For dark backgrounds:  the dark scheme, for it and its parts." },
    { name: "href", kind: "string", description: "Renders a link (`<a>`) styled as a header." }
  ],
  events: [],
  slots: [
    {
      name: "",
      description: "Text, a slotted `<ui-icon>` / `<img>`, a `<ui-content>` and a nested `<ui-header>` (sub header)."
    }
  ],
  parts: [{ name: "header", description: "The header box (`<div>`, `<h1>` ... `<h6>`, or `<a>`)." }],
  states: [
    { name: "in-card", description: "Owned by a card." },
    { name: "in-item", description: "Owned by a item." },
    { name: "in-modal", description: "Owned by a modal." },
    { name: "in-flyout", description: "Owned by a flyout." },
    { name: "in-message", description: "Owned by a message." },
    { name: "in-list", description: "Owned by a list." },
    { name: "in-popup", description: "Owned by a popup." },
    { name: "in-toast", description: "Owned by a toast." },
    { name: "in-header", description: "Owned by a header." },
    { name: "in-menu", description: "Owned by a menu:  an item's sub header (a vertical menu's `.item > .header`)." }
  ],
  texts: [],
  ownsParts: ["header", "content"]
} as const satisfies ComponentVocabulary

/****************
 * ### `<ui-description>`
 * Descriptive text:  `<div class="description">`.
 ****************/
export const descriptionVocabulary = {
  tag: "ui-description",
  noun: "description",
  ui: false,
  description: "A description of the content:  card / item / modal / list / step / search text, a comment's text.",
  attributes: [],
  events: [],
  slots: [{ name: "", description: "Text." }],
  parts: [{ name: "description", description: "The description box." }],
  states: [
    { name: "in-card", description: "Owned by a card." },
    { name: "in-item", description: "Owned by a item." },
    { name: "in-comment", description: "Owned by a comment." },
    { name: "in-modal", description: "Owned by a modal." },
    { name: "in-flyout", description: "Owned by a flyout." },
    { name: "in-list", description: "Owned by a list." },
    { name: "in-step", description: "Owned by a step." },
    { name: "in-search", description: "Owned by a search." }
  ],
  texts: []
} as const satisfies ComponentVocabulary

/****************
 * ### `<ui-meta>`
 * Metadata:  `<div class="meta">`.
 ****************/
export const metaVocabulary = {
  tag: "ui-meta",
  noun: "meta",
  ui: false,
  description: "Metadata about the content, e.g. a date or a category;  a comment's `metadata`.",
  attributes: [],
  events: [],
  slots: [{ name: "", description: "Short items, spaced apart (`<span>`s, links)." }],
  parts: [{ name: "meta", description: "The meta box." }],
  states: [
    { name: "in-card", description: "Owned by a card." },
    { name: "in-item", description: "Owned by a item." },
    { name: "in-feed", description: "Owned by a feed." },
    { name: "in-comment", description: "Owned by a comment." }
  ],
  texts: []
} as const satisfies ComponentVocabulary

/****************
 * ### `<ui-extra>`
 * Extra content:  `<div class="extra">`.
 ****************/
export const extraVocabulary = {
  tag: "ui-extra",
  noun: "extra",
  ui: false,
  description: "Extra content, set apart from the main content, e.g. a card's footer.",
  attributes: [{ name: "text", kind: "keyOnly", description: "In a feed:  a block of extra text." }],
  events: [],
  slots: [{ name: "", description: "Content." }],
  parts: [{ name: "extra", description: "The extra box." }],
  states: [
    { name: "in-card", description: "Owned by a card." },
    { name: "in-item", description: "Owned by a item." },
    { name: "in-feed", description: "Owned by a feed." }
  ],
  texts: []
} as const satisfies ComponentVocabulary

/****************
 * ### `<ui-actions>`
 * Actions:  `<div class="actions">`.
 ****************/
export const actionsVocabulary = {
  tag: "ui-actions",
  noun: "actions",
  ui: false,
  description: "Actions a user can take:  a modal's or toast's buttons, a comment's reply links.",
  attributes: [],
  events: [],
  slots: [{ name: "", description: "Buttons or links." }],
  parts: [{ name: "actions", description: "The actions box." }],
  states: [
    { name: "in-comment", description: "Owned by a comment." },
    { name: "in-modal", description: "Owned by a modal." },
    { name: "in-flyout", description: "Owned by a flyout." },
    { name: "in-toast", description: "Owned by a toast." }
  ],
  texts: []
} as const satisfies ComponentVocabulary

/****************
 * ### `<ui-title>`
 * A title:  `<div class="title">` (`<a>` with `href`).
 ****************/
export const titleVocabulary = {
  tag: "ui-title",
  noun: "title",
  ui: false,
  description: "A title:  a step's, an accordion panel's, a search result's.",
  attributes: [{ name: "href", kind: "string", description: "Renders a link (`<a>`)." }],
  events: [],
  slots: [{ name: "", description: "Text." }],
  parts: [{ name: "title", description: "The title box." }],
  states: [
    { name: "in-step", description: "Owned by a step." },
    { name: "in-accordion", description: "Owned by a accordion." },
    { name: "in-search", description: "Owned by a search." }
  ],
  texts: []
} as const satisfies ComponentVocabulary

/****************
 * ### `<ui-summary>`
 * A summary:  `<div class="summary">`.
 ****************/
export const summaryVocabulary = {
  tag: "ui-summary",
  noun: "summary",
  ui: false,
  description: "A feed event's summary line, e.g. who did what, with an inline date.",
  attributes: [],
  events: [],
  slots: [{ name: "", description: "Text, `<ui-author>`, `<ui-date>`." }],
  parts: [{ name: "summary", description: "The summary box." }],
  states: [{ name: "in-feed", description: "Owned by a feed." }],
  texts: []
} as const satisfies ComponentVocabulary

/****************
 * ### `<ui-date>`
 * A date:  `<time class="date">`.
 ****************/
export const dateVocabulary = {
  tag: "ui-date",
  noun: "date",
  ui: false,
  description: "When something happened;  inline and small inside a summary.",
  attributes: [{ name: "datetime", kind: "string", description: "Machine-readable date, as `<time datetime>`." }],
  events: [],
  slots: [{ name: "", description: "The human-readable date." }],
  parts: [{ name: "date", description: "The `<time>`." }],
  states: [{ name: "in-feed", description: "Owned by a feed." }],
  texts: []
} as const satisfies ComponentVocabulary

/****************
 * ### `<ui-author>`
 * An author:  `<span class="author">` (`<a>` with `href`).
 ****************/
export const authorVocabulary = {
  tag: "ui-author",
  noun: "author",
  ui: false,
  description: "Who wrote a comment or did a feed event (Fomantic's feed `user`).",
  attributes: [
    { name: "href", kind: "string", description: "Renders a link (`<a>`), e.g. to a profile." },
    { name: "target", kind: "string", description: "Link target, with `href`." }
  ],
  events: [],
  slots: [{ name: "", description: "The name." }],
  parts: [{ name: "author", description: "The author box." }],
  states: [
    { name: "in-comment", description: "Owned by a comment." },
    { name: "in-feed", description: "Owned by a feed." }
  ],
  texts: []
} as const satisfies ComponentVocabulary

/****************
 * ### `<ui-avatar>`
 * An avatar:  `<span class="avatar"><img alt=""></span>`.
 ****************/
export const avatarVocabulary = {
  tag: "ui-avatar",
  noun: "avatar",
  ui: false,
  description: "A small picture of a person:  a comment's or a card's.",
  attributes: [
    { name: "src", kind: "string", description: "Image URL;  renders the `<img>` (or slot one)." },
    { name: "alt", kind: "string", description: 'Alternative text;  default `""` (decorative, the name is nearby).' }
  ],
  events: [],
  slots: [{ name: "", description: "An `<img>`, instead of `src`." }],
  parts: [
    { name: "avatar", description: "The avatar box." },
    { name: "image", description: "The `<img>` rendered from `src`." }
  ],
  states: [
    { name: "in-card", description: "Owned by a card." },
    { name: "in-item", description: "Owned by a item." },
    { name: "in-comment", description: "Owned by a comment." }
  ],
  texts: []
} as const satisfies ComponentVocabulary

/****************
 * ### `<ui-detail>`
 * A detail:  `<span class="detail">` (`<a>` with `href`).
 ****************/
export const detailVocabulary = {
  tag: "ui-detail",
  noun: "detail",
  ui: false,
  description: "A label's dimmer second value, e.g. a count.",
  attributes: [{ name: "href", kind: "string", description: 'Renders a link (`<a class="detail" href>`).' }],
  events: [],
  slots: [{ name: "", description: "Text, an icon." }],
  parts: [{ name: "detail", description: "The detail box." }],
  states: [{ name: "in-label", description: "Owned by a label." }],
  texts: []
} as const satisfies ComponentVocabulary

/****************
 * ### `<ui-value>`
 * A value:  `<div class="value">`.
 ****************/
export const valueVocabulary = {
  tag: "ui-value",
  noun: "value",
  ui: false,
  description: "A statistic's value;  a search result's price.",
  attributes: [{ name: "text", kind: "keyOnly", description: "In a statistic:  a word value, smaller and bold." }],
  events: [],
  slots: [{ name: "", description: "The value:  a number, a word, an icon or image." }],
  parts: [{ name: "value", description: "The value box." }],
  states: [
    { name: "in-statistic", description: "Owned by a statistic." },
    { name: "in-search", description: "Owned by a search." }
  ],
  texts: []
} as const satisfies ComponentVocabulary

/** Every part's vocabulary, in `PART_NOUNS` order. */
export const PART_VOCABULARIES = [
  contentVocabulary,
  headerVocabulary,
  descriptionVocabulary,
  metaVocabulary,
  extraVocabulary,
  actionsVocabulary,
  titleVocabulary,
  summaryVocabulary,
  dateVocabulary,
  authorVocabulary,
  avatarVocabulary,
  detailVocabulary,
  valueVocabulary
] as const
