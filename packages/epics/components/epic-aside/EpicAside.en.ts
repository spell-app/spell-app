/**
 * Every name `<epic-aside>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type`, plus the panel's parts and states from its types file, which is data too.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

import { PANEL_PARTS, PANEL_STATES } from "./EpicPanel.types"

/****************
 * ### `<epic-aside>`
 * A folded aside in a plan doc's prose:  a digression the main text can skip.
 ****************/
export const epicAsideVocabulary = {
  tag: "epic-aside",
  topics: ["documentation", "containers", "text"],
  aka: ["aside", "digression", "sidebar", "note", "details", "disclosure"],
  noun: "aside",
  ui: false,
  description:
    "A folded aside in prose, for a digression the main text can skip:  an ivory panel headed `Aside:  <title>`, " +
    "its children inside.  Folded to start with;  find-in-page and a click unfold it.  Replaces the old " +
    "`ui-accordion.spell-aside`.",
  attributes: [
    {
      name: "title",
      property: "epicTitle",
      kind: "string",
      description: "What it's about, WITHOUT `Aside:` (drawn):  `where it stood at kickoff, 2026-10-03`."
    }
  ],
  events: [],
  slots: [{ name: "", description: "The aside." }],
  parts: [...PANEL_PARTS],
  states: [...PANEL_STATES],
  texts: [
    { key: "aside", text: "Aside", description: "The heading, without a title." },
    { key: "heading", text: "Aside:  {title}", description: "The heading, with a title." }
  ],
  children: [{ tag: "flow", description: "The aside." }],
  flow: true
} as const satisfies EpicVocabulary
