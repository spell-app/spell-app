/**
 * Every name `<epic-phase>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type`, plus two types files' data:
 *   - the fold pieces (`FOLD_*`), from `epic-section`'s
 *   - the review controls' parts (`REVIEW_PARTS`), from `epic-review`'s:  a phase takes review notes (epic `airplane` P2)
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

// the review controls a phase draws, as `<epic-item>` does
import { REVIEW_PARTS } from "$/epics/components/epic-review/EpicReview.types"
// the fold pieces every folding block shares
import {
  FOLD_EVENTS,
  FOLD_OPEN_ATTRIBUTE,
  FOLD_PARTS,
  FOLD_STATES,
  FOLD_TEXTS
} from "$/epics/components/epic-section/EpicSection.types"

/****************
 * ### `<epic-phase>`
 * One phase of the plan, in `<epic-section kind="phases">`.
 ****************/
export const epicPhaseVocabulary = {
  tag: "epic-phase",
  topics: ["documentation", "progress", "containers"],
  aka: ["phase", "milestone", "step", "stage"],
  noun: "phase",
  ui: false,
  description:
    "One phase of the plan:  its status icon and estimate in its title line;  its fields (Symptom, Changes, " +
    "Requests, Goal), Owen's kept notes, its plan changes (`<epic-update>` blocks, at the end of its " +
    "description), then Done, commits, Files, Verify and To review, as children in that order.  " +
    "While the page is reviewed, it takes review notes as an Overview sub-section does:  Revisit, Make Todo, Do Now.",
  attributes: [
    {
      name: "id",
      property: "epicId",
      kind: "string",
      required: true,
      format: "phase id",
      description: "`p1`, `p2` ...:  shown as `P2 · <title>`;  links use it (`#p2`)."
    },
    {
      name: "title",
      property: "epicTitle",
      kind: "string",
      required: "or slot",
      description: "Its short name, 2-4 words, WITHOUT its id (`Saved Replies`, drawn as `P1 · Saved Replies`)."
    },
    {
      name: "status",
      kind: "enum",
      values: ["todo", "active", "done"],
      required: true,
      description: "`todo`, `active` (one at a time, blue:  under way) or `done` (green)."
    },
    {
      name: "estimate",
      kind: "string",
      description:
        "Wall-clock time for Claude to do it, agents included, Owen's review not:  `30m`, `2h`, `1h30m`, `1-2h`."
    },
    {
      name: "source",
      kind: "string",
      description: "Its body's part file (`parts/p2.html`), loaded into its children when it opens."
    },
    {
      name: "part-ids",
      kind: "string",
      format: "ids",
      description: "The ids inside its part file:  a link to one loads the body first, then lands."
    },
    { name: "commits", kind: "boolean", description: "Its body lists commits (the page's git buttons)." },
    {
      name: "changes",
      kind: "number",
      description:
        "How many plan changes (`<epic-update>` blocks) it holds, written by the plan-doc tool on every edit:  its " +
        "title row says so while it isn't done, folded too (its body, a part, loads only when it opens)."
    },
    FOLD_OPEN_ATTRIBUTE
  ],
  events: [...FOLD_EVENTS],
  slots: [
    { name: "", description: "Its fields, Owen's kept notes, its plan changes and commits." },
    { name: "title", description: "A title with markup, in place of `title`." },
    {
      name: "changes",
      description:
        'An OLDER doc\'s plan changes (`<epic-updated slot="changes">`, 2026-10-11, P6):  drawn at the end of its ' +
        "body, unboxed, until the plan-doc tool migrates them to `<epic-update>` blocks (`updates-as-epic-update`)."
    },
    {
      name: "status",
      description:
        "Claude's status cards on Owen's marks (`<epic-status slot=\"status\">`, P13):  at the end of its body, " +
        "above the note box."
    }
  ],
  parts: [
    ...FOLD_PARTS,
    { name: "status", description: "Its status icon, in its status's colour." },
    {
      name: "changed",
      description: "In its title, while it isn't done:  its plan changed, an orange pen and how many times (`changes`)."
    },
    { name: "tools", description: "At the title's end:  its review buttons, while the page is reviewed." },
    ...REVIEW_PARTS
  ],
  states: [...FOLD_STATES],
  texts: [
    ...FOLD_TEXTS,
    // `status*`:  the review controls' `todo` is Make Todo
    { key: "statusTodo", text: "To do", description: "The status icon's name:  `todo`." },
    { key: "statusActive", text: "Under way", description: "The status icon's name:  `active`." },
    { key: "statusDone", text: "Done", description: "The status icon's name:  `done`." },
    {
      key: "changedTip",
      text: "Its plan changed:  {count} × Update, at the end of its description",
      description: "The title's pen while it isn't done:  its tooltip and name;  `count` how many changes."
    }
  ],
  children: [
    { tag: "flow", slot: "title", max: 1, description: "A title with markup." },
    {
      tag: "epic-field",
      where: { attribute: "name", values: ["symptom"] },
      max: 1,
      description: "Symptom:  what's wrong today, one line."
    },
    {
      tag: "epic-field",
      where: { attribute: "name", values: ["changes"] },
      max: 1,
      description: "Changes:  what changes, two or three lines."
    },
    {
      tag: "epic-updated",
      slot: "changes",
      description:
        "An OLDER doc's plan changes (2026-10-11, P6):  the plan-doc tool's next write makes each an " +
        "`<epic-update>` block, after Goal (`updates-as-epic-update`)."
    },
    {
      tag: "epic-updated",
      description:
        "An OLDER doc's plan changes, in no slot (until 2026-10-11):  drawn among its fields until the plan-doc " +
        "tool's next write makes each an `<epic-update>` block, after Goal."
    },
    {
      tag: "epic-field",
      where: { attribute: "name", values: ["requests"] },
      max: 1,
      description:
        "Requests:  what Owen sent this phase from other sessions (epic `epic-workflow`), one labelled block each:  " +
        "his words, the sender, his screenshots (`spell epic file`)."
    },
    {
      tag: "epic-reply",
      description:
        "Owen's notes on the phase from the page, kept once Claude took them (`inbox done | clear`), oldest first."
    },
    {
      tag: "epic-status",
      slot: "status",
      description: "Claude's status cards on Owen's marks, oldest first (`plan-doc status`;  a todo filed:  born done)."
    },
    {
      tag: "epic-field",
      where: { attribute: "name", values: ["goal"] },
      max: 1,
      description: "Goal:  a bullet per outcome."
    },
    {
      tag: "epic-update",
      description:
        "Its plan changes, oldest first, at the end of its description (Owen, 2026-10-11):  each an " +
        "`<epic-update at summary>` block, `Update: <summary>` and its date, what changed under it;  kept once done."
    },
    {
      tag: "epic-field",
      where: { attribute: "name", values: ["done"] },
      max: 1,
      description: "Done:  what was built, once done."
    },
    { tag: "epic-commit", description: "Its commits, oldest first." },
    {
      tag: "epic-field",
      where: { attribute: "name", values: ["files"] },
      max: 1,
      description: "Files:  what changes."
    },
    {
      tag: "epic-field",
      where: { attribute: "name", values: ["verify"] },
      max: 1,
      description: "Verify:  how we know it worked."
    },
    {
      tag: "epic-field",
      where: { attribute: "name", values: ["to-review"] },
      max: 1,
      description: "To review:  the items added during it still open and not reviewed (written by the script)."
    }
  ],
  childOrder: "listed"
} as const satisfies EpicVocabulary
