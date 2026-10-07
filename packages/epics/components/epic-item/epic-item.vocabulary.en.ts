/**
 * Every name `<epic-item>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-item>`
 * One item of a plan doc:  a question, judgement call, caveat, todo, issue or test.
 ****************/
export const epicItemVocabulary = {
  tag: "epic-item",
  topics: ["documentation", "lists", "status"],
  aka: ["item", "question", "decision", "judgement call", "caveat", "todo", "issue", "test", "ticket"],
  skeleton: null,
  noun: "item",
  ui: false,
  description:
    "One item:  a question, judgement call, caveat, todo, issue or test -- ONE element for every kind, the kind " +
    "its id's letter (Q11).  Its line (id chip in its state's colour, title, review label) is drawn;  its details, " +
    "choices, answer, replies, earlier versions and commits are its children.",
  attributes: [
    {
      name: "id",
      property: "epicId",
      kind: "string",
      required: true,
      format: "item id",
      description:
        "`q7` (question), `j3` (judgement call), `c1` (caveat), `t4` (todo), `i2` (issue), `v1` (test):  shown as " +
        "`Q7`;  links use it (`#q7`)."
    },
    {
      name: "title",
      property: "epicTitle",
      kind: "string",
      required: "or slot",
      description: "Its line, WITHOUT its id (`Which colour names?`);  an answered question keeps its question's."
    },
    {
      name: "status",
      kind: "enum",
      values: ["open", "decided", "done", "canceled"],
      required: true,
      description:
        "`open`;  `decided` (an answered question:  a decision in force);  `done` (closed:  fixed, passed, " +
        "accepted);  `canceled` (made moot:  struck through)."
    },
    {
      name: "state",
      kind: "enum",
      values: ["attention", "progress", "open", "recent", "old"],
      description:
        "Its id chip's colour, written by the script on every edit:  `attention` (red:  needs Owen), `progress` " +
        "(orange:  queued or being worked), `open` (blue), `recent` (green:  closed or reviewed lately), `old` (grey)."
    },
    {
      name: "changed",
      kind: "string",
      format: "time",
      description: "When a command last changed its status or review marks (ISO, with offset)."
    },
    { name: "phase", kind: "number", description: "The phase active when it was added:  its To review line lists it." },
    {
      name: "answered",
      kind: "boolean",
      description: "An answered question:  its details read question, Choices, then the answer."
    },
    { name: "reviewed", kind: "string", format: "date", description: "Gone through with Owen, that day." },
    {
      name: "review-as",
      kind: "enum",
      values: ["approve", "todo", "revisit"],
      description: "How Owen's review mark was applied:  its button stays outlined in that colour."
    },
    {
      name: "deferred",
      kind: "string",
      format: "date",
      description: "Put off, that day:  still not reviewed, offered again next review."
    },
    {
      name: "queued",
      kind: "string",
      format: "date",
      description: "A review decided on work, that day, not started yet:  the next review offers it first."
    },
    { name: "work", kind: "string", description: "The queued work, in a few words (`Skip short sections`)." },
    { name: "working", kind: "boolean", description: "Work on it is under way." },
    {
      name: "bedtime",
      kind: "boolean",
      description: "Changed during a `/bedtime` run:  `recent` until reviewed."
    },
    {
      name: "source",
      kind: "string",
      description: "Its details' part file (`parts/q7.htm`), loaded into its children when it opens."
    },
    {
      name: "part-ids",
      kind: "string",
      format: "ids",
      description: "The ids inside its part file (an old `d7` answer):  a link to one loads the body first, then lands."
    },
    { name: "commits", kind: "boolean", description: "Its details list commits (the page's git buttons)." }
  ],
  events: [],
  slots: [
    { name: "", description: "Its details." },
    { name: "title", description: "A title with markup, in place of `title`." }
  ],
  parts: [{ name: "base", description: "The item." }],
  states: [],
  texts: [],
  children: [
    { tag: "flow", slot: "title", max: 1, description: "A title with markup." },
    { tag: "flow", description: "Its text:  the question as asked, the call and why, the details." },
    { tag: "epic-choices", max: 1, description: "A question's option cards." },
    { tag: "epic-answer", max: 1, description: "An answered question's answer." },
    { tag: "epic-more", max: 1, description: "More Details, added after its text." },
    { tag: "epic-reply", description: "Replies, oldest first." },
    { tag: "epic-original", max: 1, description: "Its earlier text, folded." },
    { tag: "epic-commit", description: "Commits that fixed or built it, oldest first." }
  ],
  childOrder: "listed"
} as const satisfies EpicVocabulary
