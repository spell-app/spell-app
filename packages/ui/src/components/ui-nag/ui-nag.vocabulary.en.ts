/**
 * Every name `<ui-nag>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states, texts.
 * Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-nag size="small" bottom fixed inverted>` => `ui small bottom fixed inverted nag`.
 * - Persistence is opt-in:  only a nag with a `key` reads or writes `storage`.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-nag>`
 * A nag:  `<div class="ui ... nag" part="nag">` around the slot, with a close icon.
 ****************/
export const nagVocabulary = {
  tag: "ui-nag",
  topics: ["notifications", "messages", "overlays", "modules"],
  aka: ["banner", "cookie notice", "announcement bar", "sticky banner"],
  skeleton: false,
  noun: "nag",
  description: "A nag is a persistent message that stays until dismissed, and can remember the dismissal.",
  attributes: [
    { name: "size", kind: "size", description: "Text size, `mini` ... `massive`;  `medium` is the default." },
    { name: "color", kind: "color", description: "Hue:  a filled bar in that colour." },
    { name: "inverted", kind: "keyOnly", description: "Light instead of dark;  a coloured one takes its tint." },
    { name: "fixed", kind: "keyOnly", description: "Fixed to the viewport edge, over the page." },
    {
      name: "overlay",
      kind: "keyOnly",
      description: "Over the page content at its edge (absolute), instead of pushing it down."
    },
    { name: "bottom", kind: "keyOnly", description: "At the bottom edge instead of the top." },
    {
      name: "closable",
      kind: "boolean",
      default: true,
      description: 'Shows the close icon;  `closable="false"` for a nag only script (or `display-time`) closes.'
    },
    {
      name: "key",
      kind: "string",
      description: "Remembers the dismissal under this name, in `storage`;  without one nothing is stored."
    },
    {
      name: "value",
      kind: "string",
      default: "dismiss",
      description: "What a dismissal stores;  a stored `key` with another value doesn't count."
    },
    {
      name: "storage",
      kind: "enum",
      values: ["local", "session", "cookie"],
      default: "cookie",
      description: "Where the dismissal is stored:  `localStorage`, `sessionStorage` or a cookie (Fomantic's default)."
    },
    {
      name: "expires",
      kind: "number",
      default: 30,
      description: "Days a dismissal lasts (`local` and `cookie`);  `0` never expires."
    },
    { name: "persist", kind: "boolean", description: "Shows even when dismissed before (stores nothing new either)." },
    {
      name: "display-time",
      kind: "number",
      description: "Milliseconds before it hides itself (not a dismissal:  nothing is stored);  absent / `0`:  stays."
    },
    { name: "path", kind: "string", default: "/", description: "Cookie `path`." },
    { name: "domain", kind: "string", description: "Cookie `domain`." },
    { name: "secure", kind: "boolean", description: "Cookie `secure`." },
    {
      name: "samesite",
      kind: "enum",
      values: ["lax", "strict", "none"],
      property: "sameSite",
      description: "Cookie `samesite`."
    }
  ],
  events: [
    { name: "ui-show", detail: "{}", description: "Shown, its entry animation finished (Fomantic's `onVisible`)." },
    {
      name: "ui-close",
      detail: "{ reason: NagCloseReason, originalEvent?: Event }",
      cancelable: true,
      description:
        "About to close:  the close icon (`close`), the display time (`timeout`) or `host.close()` (`dismiss`).  " +
        "`preventDefault()` keeps it and stores nothing (Fomantic's `onHide` returning `false`)."
    },
    {
      name: "ui-hide",
      detail: "{ reason: NagCloseReason }",
      description: "Closed, its exit animation finished (Fomantic's `onHidden`);  the host is `hidden` now."
    }
  ],
  slots: [{ name: "", description: 'The text;  a `<span class="title">` is set off in the title colour.' }],
  parts: [
    { name: "nag", description: "The nag bar." },
    { name: "close", description: "The close icon." }
  ],
  states: [{ name: "dismissed", description: "Dismissed now or before (stored), so hidden." }],
  texts: [{ key: "close", text: "Close", description: "Accessible name of the close icon." }]
} as const satisfies ComponentVocabulary
