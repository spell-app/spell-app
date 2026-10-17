/**
 * Every name `<epic-updated>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-updated>`
 * RETIRED (2026-10-11):  one change to a phase's plan, in an older doc.  `<epic-update at summary>` replaces it;
 * the epic tool's next write migrates each (`updates-as-epic-update`).
 ****************/
export const epicUpdatedVocabulary = {
  tag: "epic-updated",
  topics: ["documentation", "content parts"],
  aka: ["updated", "plan change", "revision", "amendment"],
  noun: "updated",
  ui: false,
  description:
    "RETIRED (Owen, 2026-10-11):  an older doc's change to a phase's plan, a dated fence.  Still drawn, until the " +
    "epic tool's next write makes it an `<epic-update at summary>` block at the end of its phase's " +
    "description (`updates-as-epic-update`).",
  attributes: [
    {
      name: "at",
      kind: "string",
      required: true,
      format: "time",
      description: "When the plan changed:  `2026-10-06 14:30`, drawn `10/6/26 14:30`."
    },
    { name: "phase", kind: "number", description: "The phase active when it changed (`3`)." },
    {
      name: "of",
      kind: "number",
      description:
        "An OLDER doc's COPY in the Phases section (T14, until 2026-10-11):  the phase whose plan it changes (`5`).  " +
        "Never drawn;  the epic tool removes the copies on its next write.  Never on the line in its phase."
    }
  ],
  events: [],
  slots: [{ name: "", description: "What changed in the plan, and why." }],
  parts: [
    { name: "base", description: "The fence:  a dashed orange box." },
    { name: "toggle", description: "The fold chevron, a `<button>`, first:  its heading row folds what changed." },
    { name: "icon", description: "Its icon, centred on its first line." },
    { name: "label", description: "`Updated`, then its time." },
    { name: "body", description: "What changed, under the heading;  hidden (`until-found`) while folded." }
  ],
  states: [{ name: "open", description: "Unfolded:  it starts so (page state, never written)." }],
  texts: [
    { key: "foldTip", text: "Fold this plan change", description: "Tooltip of its fold button while open." },
    { key: "unfoldTip", text: "Unfold this plan change", description: "Tooltip of its fold button while folded." },

    { key: "updated", text: "Updated", description: "Its label." },
    { key: "during", text: "during P{phase}", description: "After its time:  the phase under way then." }
  ],
  children: [{ tag: "flow", description: "What changed in the plan, and why." }]
} as const satisfies EpicVocabulary
