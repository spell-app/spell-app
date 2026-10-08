/**
 * Every name `<epic-overview>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type`, plus the fold pieces (`FOLD_*`) from `epic-section`'s types file, data too.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

// the fold pieces every folding block shares
import {
  FOLD_EVENTS,
  FOLD_OPEN_ATTRIBUTE,
  FOLD_PARTS,
  FOLD_STATES,
  FOLD_TEXTS
} from "$/epics/components/epic-section/EpicSection.types"

/****************
 * ### `<epic-overview>`
 * A plan doc's first section, "1. Overview".
 ****************/
export const epicOverviewVocabulary = {
  tag: "epic-overview",
  topics: ["documentation", "containers"],
  aka: ["summary", "introduction", "kickoff"],
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
    },
    FOLD_OPEN_ATTRIBUTE
  ],
  events: [...FOLD_EVENTS],
  slots: [
    {
      name: "",
      description:
        "The summary (`<epic-summary>`), the Kickoff prompt (`<epic-prompt>`), then the sub-sections " +
        '(`<epic-section kind="overview-part">`s).'
    },
    {
      name: "summary",
      description: 'The summary in older docs:  `<p slot="summary">`;  `<epic-summary>` since P14.'
    },
    {
      name: "prompt",
      description:
        'The prompt in older docs:  `<blockquote slot="prompt">`, drawn folded;  `<epic-prompt>` since P14, which ' +
        "folds itself."
    }
  ],
  parts: [
    ...FOLD_PARTS,
    {
      name: "prompt",
      description:
        "An older doc's folded Kickoff prompt:  a `<details>` around the `prompt` slot (`<epic-prompt>` draws its own)."
    },
    { name: "estimate", description: "The estimate line." }
  ],
  states: [...FOLD_STATES],
  texts: [
    ...FOLD_TEXTS,
    { key: "title", text: "Overview", description: "Its title, after its number." },
    { key: "prompt", text: "Kickoff prompt", description: "The folded prompt's title." },
    { key: "estimate", text: "Estimate:", description: "Before the estimate." }
  ],
  children: [
    { tag: "flow", slot: "summary", max: 1, description: "The summary, in older docs." },
    { tag: "flow", slot: "prompt", max: 1, description: "The kickoff prompt, in older docs." },
    { tag: "epic-summary", max: 1, description: "The summary, two sentences." },
    { tag: "epic-prompt", max: 1, description: "The kickoff prompt, as typed." },
    { tag: "flow", description: "Prose before the sub-sections (older docs)." },
    {
      tag: "epic-section",
      where: { attribute: "kind", values: ["overview-part"] },
      description: "The sub-sections, `o1`, `o2` ..."
    }
  ],
  childOrder: "listed"
} as const satisfies EpicVocabulary
