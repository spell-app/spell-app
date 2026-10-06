/**
 * Every name `<ui-message>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states, texts.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-message state="negative" attached="bottom" size="small">` => `ui small negative bottom attached message`.
 *   The element adds `icon` (`extra`) when it shows an icon.
 * - `color` and `state` are both remaps (`colors.css`);  `state` is `kind: "valueOnly"` because it emits its value
 *   alone (`ui negative message`), as dropdown's `state` does.
 * - A message OWNS the `header` and `content` parts:  slotted `<ui-header>` / `<ui-content>` get
 *   `:state(in-message)` and style themselves from `ui-parts.css`, reading `--_ui-message-layout` (`ui-message.css`).
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-message>`
 * A message:  `<div class="ui ... message" part="message">` with an optional icon, a content block and a close
 * button.
 ****************/
export const messageVocabulary = {
  tag: "ui-message",
  topics: ["messages", "feedback", "notifications", "status", "collections"],
  aka: ["alert", "callout", "notice", "banner", "info box", "error message"],
  skeleton: "header, long line",
  noun: "message",
  description: "A message displays information that explains nearby content.",
  attributes: [
    { name: "size", kind: "size", description: "Text size, `mini` ... `massive`;  `medium` is the default." },
    { name: "color", kind: "color", description: "Hue:  a tinted surface, border and text." },
    {
      name: "state",
      kind: "valueOnly",
      values: ["positive", "negative", "error", "info", "success", "warning"],
      description: "Consequence, tinting it like a colour."
    },
    { name: "floating", kind: "keyOnly", description: "Lifted off the page with a shadow." },
    { name: "compact", kind: "keyOnly", description: "Only as wide as its content." },
    { name: "centered", kind: "keyOnly", description: "Centres its text (and its icon with the content)." },
    { name: "inverted", kind: "keyOnly", description: "The dark scheme;  a coloured one keeps its hue in the text." },
    {
      name: "attached",
      kind: "keyOrValueAndKey",
      values: ["top", "bottom"],
      description: "Joined edge to edge with the segment or form below;  `bottom` joins the one above."
    },
    {
      name: "text-align",
      kind: "textAlign",
      values: ["center", "right"],
      description: "Aligns its text `center` or `right`."
    },
    {
      name: "icon",
      kind: "icon",
      description: "Icon name, shown large beside the content;  the root gets the `icon` class."
    },
    {
      name: "header",
      kind: "string",
      description: "Shorthand for a header above the content;  a slotted `<ui-header>` is the rich version."
    },
    {
      name: "dismissible",
      kind: "boolean",
      description: "Shows a close button;  clicking it dispatches `ui-dismiss`, then hides the message."
    }
  ],
  events: [
    {
      name: "ui-dismiss",
      detail: "{ originalEvent?: Event }",
      cancelable: true,
      description:
        "The close button of a `dismissible` message was activated.  Unless cancelled the element sets `hidden` " +
        "on itself (it never removes itself)."
    }
  ],
  slots: [
    { name: "", description: "Content:  text, `<p>`s, a `<ul>` list, `<ui-header>` / `<ui-content>` parts." },
    { name: "icon", description: "Icon, instead of the `icon` attribute;  shown large beside the content." }
  ],
  parts: [
    { name: "message", description: "The message box." },
    { name: "icon", description: "The icon box." },
    { name: "content", description: "The content block around the header and the default slot." },
    { name: "header", description: "The `header` shorthand." },
    { name: "close", description: "The close button of a `dismissible` message." }
  ],
  states: [{ name: "inverted", description: "In the dark scheme." }],
  texts: [{ key: "dismiss", text: "Dismiss", description: "Accessible name of the close button." }],
  ownsParts: ["header", "content"]
} as const satisfies E.ComponentVocabulary
