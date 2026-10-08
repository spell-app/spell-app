/**
 * Every name `<epic-section>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type`, plus the fold pieces (`FOLD_*`) from its types file, which is data too, and the
 *   review controls' parts and texts (`REVIEW_*`) from `epic-item`'s:  an Overview sub-section draws them (Q14).
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 * - `kind`'s values are `SectionIds`' keys plus `overview-part`:  `Definitions.test.ts` checks they agree.
 */

import type { EpicVocabulary } from "$/epics/definitions"

// the review controls an Overview sub-section draws, as `<epic-item>` does
import { REVIEW_PARTS, REVIEW_TEXTS } from "$/epics/components/epic-item/EpicItem.types"

import { FOLD_EVENTS, FOLD_OPEN_ATTRIBUTE, FOLD_PARTS, FOLD_STATES, FOLD_TEXTS } from "./EpicSection.types"

/****************
 * ### `<epic-section>`
 * One section of a plan doc:  Phases, Questions ... Log, or one of the Overview's sub-sections.
 ****************/
export const epicSectionVocabulary = {
  tag: "epic-section",
  topics: ["documentation", "containers", "layout"],
  aka: ["section", "chapter", "panel"],
  noun: "section",
  ui: false,
  description:
    "One section of a plan doc, by `kind`:  its phases, its items or its log;  or, inside `<epic-overview>`, one " +
    "of the Overview's sub-sections (`overview-part`), which gets review notes as items do.",
  attributes: [
    {
      name: "id",
      property: "epicId",
      kind: "string",
      required: true,
      format: "anchor",
      description:
        "Its id, which links use:  FIXED per kind (`phases`, `decisions` for Questions ...);  `o1`, `o2` ... for " +
        "an Overview sub-section."
    },
    {
      name: "kind",
      kind: "enum",
      values: ["overview-part", "phases", "questions", "judgements", "caveats", "todos", "issues", "tests", "log"],
      required: true,
      description:
        "What it holds:  `phases` its `<epic-phase>`s;  `questions` ... `tests` its `<epic-item>`s;  `log` its " +
        "`<epic-event>`s;  `overview-part` prose."
    },
    {
      name: "title",
      property: "epicTitle",
      kind: "string",
      description:
        "An Overview sub-section's title, WITHOUT its number (`Structure`, drawn as `1.1 Structure`):  required " +
        'there (or a `slot="title"` child, for a title with markup).  The page\'s sections draw their own.'
    },
    {
      name: "source",
      kind: "string",
      description: "Its body's part file (`parts/o3.html`, `parts/log.html`), loaded into its children when it opens."
    },
    {
      name: "part-ids",
      kind: "string",
      format: "ids",
      description: "The ids inside its part file:  a link to one loads the body first, then lands."
    },
    FOLD_OPEN_ATTRIBUTE
  ],
  events: [...FOLD_EVENTS],
  slots: [
    { name: "", description: "Its phases, items, log events or prose." },
    { name: "title", description: "A title with markup, in place of `title`." },
    {
      name: "changes",
      description:
        "The Phases section's Plan changes:  a copy of each `<epic-updated>` of a phase still to do " +
        '(`<epic-updated slot="changes" of="3" at="...">`), written by the plan-doc tool on every edit;  drawn as a ' +
        "box above the phases.  None:  no box."
    },
    {
      name: "status",
      description:
        'An Overview sub-section\'s status cards from Claude (`<epic-status slot="status">`, P13):  at the end of ' +
        "its body, above the note box."
    }
  ],
  parts: [
    ...FOLD_PARTS,
    {
      name: "tools",
      description:
        "At the title's end:  the Phases section's Files / Verify toggles;  an item section's state filter;  an " +
        "Overview sub-section's review buttons."
    },
    {
      name: "filter",
      description:
        "An item section's state filter:  a grey filter chip (show all / only what needs you), then one round chip " +
        "per state its items are in, filled while that state's items show."
    },
    { name: "hidden-note", description: 'Under a filtered list:  "3 hidden · show all".' },
    { name: "changes", description: "The Phases section's Plan changes box, above its phases." },
    { name: "empty", description: 'An item section with no items:  "None yet".' },
    ...REVIEW_PARTS
  ],
  states: [
    ...FOLD_STATES,
    { name: "tools", description: "Its title has tools:  the Phases toggles, or a state filter (items in it)." }
  ],
  texts: [
    ...FOLD_TEXTS,
    { key: "phasesTitle", text: "Phases" },
    { key: "questionsTitle", text: "Questions" },
    { key: "judgementsTitle", text: "Judgement calls" },
    { key: "caveatsTitle", text: "Caveats" },
    { key: "todosTitle", text: "Todos" },
    { key: "issuesTitle", text: "Issues" },
    { key: "testsTitle", text: "To test" },
    { key: "logTitle", text: "Log" },
    { key: "noneYet", text: "None yet", description: "An item section with no items." },
    { key: "showFiles", text: "Show each phase's Files", description: "The Phases title's Files toggle, off." },
    { key: "hideFiles", text: "Hide each phase's Files", description: "The Files toggle, on." },
    { key: "showVerify", text: "Show each phase's Verify", description: "The Phases title's Verify toggle, off." },
    { key: "hideVerify", text: "Hide each phase's Verify", description: "The Verify toggle, on." },
    { key: "count", text: "{open} open of {total}", description: "The count badge's tooltip:  `3/7` in words." },
    { key: "filterLabel", text: "Show items by state", description: "The state filter's group, for a screen reader." },
    { key: "showAll", text: "Show everything", description: "The filter chip:  what its click does." },
    {
      key: "showNeeds",
      text: "Show only what needs you",
      description: "The filter chip, everything showing and an item needing attention:  what its click does."
    },
    { key: "showing", text: "Showing:  {words}", description: "A state chip, pressed:  its items show." },
    { key: "hiding", text: "Hiding:  {words}", description: "A state chip, not pressed:  its items are hidden." },
    { key: "stateProgress", text: "in progress", description: "A state chip's words:  `progress` (orange)." },
    { key: "stateAttention", text: "needs attention", description: "A state chip's words:  `attention` (red)." },
    { key: "stateOpen", text: "open, not urgent", description: "A state chip's words:  `open` (blue)." },
    { key: "stateRecent", text: "decided or reviewed recently", description: "A state chip's words:  `recent`." },
    { key: "stateOld", text: "decided or reviewed earlier", description: "A state chip's words:  `old` (grey)." },
    { key: "hiddenNote", text: "{count} hidden · show all", description: "Under a filtered list;  a click shows all." },
    { key: "changesTitle", text: "Plan changes", description: "The Phases section's box of changes to phases to do." },
    ...REVIEW_TEXTS
  ],
  children: [
    { tag: "flow", slot: "title", max: 1, description: "A title with markup." },
    {
      tag: "epic-updated",
      slot: "changes",
      when: { attribute: "kind", values: ["phases"] },
      description:
        "The Plan changes:  a copy of each `<epic-updated>` of a phase still to do, its phase in `of`;  the tool " +
        "rewrites them on every edit."
    },
    {
      tag: "flow",
      when: { attribute: "kind", values: ["overview-part"] },
      description: "An Overview sub-section's prose."
    },
    {
      tag: "epic-status",
      slot: "status",
      when: { attribute: "kind", values: ["overview-part"] },
      description: "An Overview sub-section's status cards from Claude, oldest first (`plan-doc status`)."
    },
    { tag: "epic-phase", when: { attribute: "kind", values: ["phases"] }, description: "The phases, in order." },
    {
      tag: "epic-item",
      when: { attribute: "kind", values: ["questions", "judgements", "caveats", "todos", "issues", "tests"] },
      description: "The items, their id's letter the section's (`q` in Questions)."
    },
    { tag: "epic-event", when: { attribute: "kind", values: ["log"] }, description: "The log, oldest first." }
  ]
} as const satisfies EpicVocabulary
