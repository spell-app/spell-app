/**
 * Every name `<epic-ask>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-ask>`
 * A question Owen answers ON the page:  a details page's, in a section of its own.
 ****************/
export const epicAskVocabulary = {
  tag: "epic-ask",
  topics: ["forms", "selection"],
  aka: ["question", "ask", "poll", "multiple choice", "form question", "picker"],
  skeleton: "6 tall",
  noun: "ask",
  ui: false,
  description:
    "A question Owen answers ON the page (a details page's;  epic `epic-workflow` P12):  its text an " +
    "`<epic-question>`, its options an `<epic-choices>` of `<epic-option>`s, each with a tick box, then an Other " +
    "box.  Its line shows a chip in the epic page's state colours (red:  nothing yet;  green:  picked;  blue:  " +
    "Claude has more to do).  Its answer goes under its section's id.",
  attributes: [
    {
      name: "name",
      kind: "string",
      description:
        "The key its answer goes under (`q1`);  none:  its `<ui-section>`'s id.  Its options' comments are " +
        "`<key>-<letter>` (`q1-B`)."
    },
    {
      name: "multiple",
      kind: "boolean",
      description: "Pick several (tick boxes);  without it, pick one (round ones)."
    },
    {
      name: "select-all",
      kind: "boolean",
      description: "With `multiple`:  a Select all / Select none button on its line, for the options shown."
    },
    {
      name: "filter",
      kind: "boolean",
      description: "An Open | All toggle on its line:  Open (the default) hides the options marked `done`."
    },
    {
      name: "more-details",
      kind: "boolean",
      description:
        'A (?) on each option, "Provide more details":  pressed, the option is ticked too, and the answer carries ' +
        "its letter under `<key>-more`, so Claude explains it in full before asking again."
    }
  ],
  events: [],
  slots: [{ name: "", description: "The question:  an `<epic-question>`, then an `<epic-choices>`;  prose too." }],
  parts: [
    { name: "base", description: "The question's box." },
    { name: "line", description: "Its line:  the chip, how to answer, its tools." },
    {
      name: "chip",
      description: "Its id chip (`Q1`), in the epic page's state colours:  red needs Owen, green picked, blue Claude's."
    },
    { name: "how", description: "`Pick one` or `Pick several`." },
    { name: "tools", description: "Its buttons:  Select all, Open | All." },
    { name: "other", description: 'The Other box, an `<epic-text-box type="other">`, after the options.' }
  ],
  states: [
    { name: "attention", description: "Nothing picked or written yet:  red." },
    { name: "done", description: "An option picked:  green." },
    { name: "working", description: '"Provide more details" asked, or only Other written:  blue, Claude\'s to do.' }
  ],
  texts: [
    { key: "pickOne", text: "Pick one", description: "Its line, without `multiple`." },
    { key: "pickSeveral", text: "Pick several", description: "Its line, with `multiple`." },
    { key: "selectAll", text: "Select all", description: "Ticks every option shown." },
    { key: "selectNone", text: "Select none", description: "Once every option shown is ticked:  unticks them." },
    { key: "open", text: "Open", description: "The filter's first half:  only the options not marked `done`." },
    { key: "all", text: "All", description: "The filter's second half:  every option." },
    { key: "openTip", text: "Show only the open ones", description: "Tooltip of Open." },
    { key: "allTip", text: "Show every option", description: "Tooltip of All." },
    { key: "otherOne", text: "Other:  your own answer", description: "The Other box's placeholder, pick one." },
    { key: "otherSeveral", text: "Other:  add your own", description: "The Other box's placeholder, pick several." },
    { key: "attentionTip", text: "{id}:  needs your answer", description: "The chip's tooltip:  nothing yet." },
    { key: "doneTip", text: "{id}:  decided", description: "The chip's tooltip:  an option picked." },
    {
      key: "workingTip",
      text: "{id}:  Claude has more to do",
      description: "The chip's tooltip:  more details asked, or only Other written."
    }
  ],
  children: [
    { tag: "epic-question", max: 1, description: "The question, in full." },
    { tag: "epic-choices", max: 1, description: "Its options, each with a tick box." },
    { tag: "flow", description: "Anything else it needs:  a table, a picture." }
  ]
} as const satisfies EpicVocabulary
