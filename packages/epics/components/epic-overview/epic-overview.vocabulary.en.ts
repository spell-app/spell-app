/**
 * Every name `<epic-overview>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-overview>`
 * A plan doc's first section, "1. Overview".
 ****************/
export const epicOverviewVocabulary = {
  tag: "epic-overview",
  topics: ["documentation", "containers"],
  aka: ["summary", "introduction", "kickoff"],
  skeleton: null,
  noun: "overview",
  ui: false,
  description:
    "A plan doc's Overview:  the two-sentence summary, the prompt that started the plan, the total estimate, then " +
    "the substance in numbered sub-sections.",
  attributes: [
    {
      name: "id",
      property: "epicId",
      kind: "enum",
      values: ["overview"],
      required: true,
      description: "Always `overview`:  links land on it (`#overview`)."
    },
    {
      name: "estimate",
      kind: "string",
      description:
        "The total estimate, as the script adds it up from the phases (`4h-5h 30m in all, 2h-3h left (P5 not " +
        "estimated)`).  Absent before the first phase."
    }
  ],
  events: [],
  slots: [
    { name: "", description: 'The sub-sections:  `<epic-section kind="overview-part">`s.' },
    { name: "summary", description: 'The summary, two sentences:  `<p slot="summary">`.' },
    {
      name: "prompt",
      description: 'The prompt that started the plan, as typed:  `<blockquote slot="prompt">`;  drawn folded.'
    }
  ],
  parts: [{ name: "base", description: "The section." }],
  states: [],
  texts: [],
  children: [
    { tag: "flow", slot: "summary", max: 1, description: "The summary." },
    { tag: "flow", slot: "prompt", max: 1, description: "The kickoff prompt." },
    { tag: "flow", description: "Prose before the sub-sections (older docs)." },
    {
      tag: "epic-section",
      where: { attribute: "kind", values: ["overview-part"] },
      description: "The sub-sections, `o1`, `o2` ..."
    }
  ],
  childOrder: "listed"
} as const satisfies EpicVocabulary
