/**
 * Every name `<epic-send>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-send>`
 * A details page's Send:  where the answer stands, and the button that sends it.
 ****************/
export const epicSendVocabulary = {
  tag: "epic-send",
  topics: ["forms", "buttons"],
  aka: ["send", "submit", "send bar", "answer"],
  skeleton: "inline 12 x 2",
  noun: "send",
  ui: false,
  description:
    "A details page's Send, in its sticky header (epic `epic-workflow` P12):  where the answer stands (`Not " +
    "sent`, `Changes not sent`, `Sent 10/8/26 14:34 · 5 of 17 decided`), then a round blue Send.  It sends the " +
    "whole page, partial answers too, as often as Owen likes:  the page never locks.  Beside them, the draft's " +
    "save (P18):  what's typed and not sent is kept beside the page, and comes back when it reloads.  Once a page.",
  attributes: [],
  events: [],
  slots: [],
  parts: [
    { name: "base", description: "Its box:  the line, then an error when there is one." },
    { name: "state", description: "Where the answer stands, in its colour:  grey, blue (not sent), green (sent)." },
    {
      name: "draft",
      description:
        "The draft's save (P18), muted:  `draft saved 14:04`, `draft from 14:04 put back`;  orange when the page " +
        "server can't take it (the browser still keeps it)."
    },
    {
      name: "send",
      description:
        "The round Send (`<ui-button>`), by the fill rule:  a grey outline with nothing to send, dashed blue with " +
        "changes not sent, a blue outline once sent."
    },
    { name: "error", description: "Why it couldn't send, under them." }
  ],
  states: [
    { name: "pending", description: "Something on the page isn't sent yet." },
    { name: "sent", description: "The page as sent." }
  ],
  texts: [
    { key: "send", text: "Send", description: "The button's name, for a screen reader." },
    {
      key: "sendTip",
      text: "Send what's on the page:  a partial answer is fine, send again any time",
      description: "The button's tooltip."
    }
  ],
  children: []
} as const satisfies EpicVocabulary
