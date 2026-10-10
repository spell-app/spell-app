/**
 * Every name `<epic-agents>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-agents>`
 * The epic's running agents (epic `skillz` P3):  "Agents running" on a plan doc, each with a note box that redirects it.
 ****************/
export const epicAgentsVocabulary = {
  tag: "epic-agents",
  topics: ["status", "lists", "forms"],
  aka: ["agents", "running agents", "agents running", "redirect", "background agents"],
  skeleton: "header, 2 line paragraph",
  noun: "agents panel",
  ui: false,
  description:
    "The epic's running agents (epic `skillz` P3), drawn by `<epic-page>` in its shadow root right before its " +
    'blocks, never written in a doc:  "Agents running", a row per agent (name, status, age, task, the redirects so ' +
    "far), each with a note box that redirects it.  Only while the page is served with a token, the epic's list " +
    "answers (`AgentsClient`) and an agent runs;  it folds from its title.",
  attributes: [],
  events: [],
  slots: [],
  parts: [{ name: "base", description: "Its box:  always there, empty without agents." }],
  states: [],
  texts: [
    { key: "agents", text: "Agents running", description: "The panel's title, and its region's name." },
    { key: "agentStarted", text: "Started {time}", description: "An agent's age, its tooltip:  when it started." },
    { key: "agentYou", text: "You", description: "Who sent a redirect:  `You · 10:42 · told 10:43`." },
    { key: "agentTold", text: "told {time}", description: "A redirect a session passed on to the agent." },
    { key: "agentWaiting", text: "waiting for the session", description: "A redirect no session passed on yet." },
    { key: "agentNote", text: "Redirect {name} ...", description: "An agent's empty note box." },
    { key: "agentNoteLabel", text: "Redirect {name}:  your note", description: "An agent's note box, spoken." },
    { key: "agentSend", text: "Send", description: "An agent's Send button:  the note redirects it." }
  ],
  children: []
} as const satisfies EpicVocabulary
