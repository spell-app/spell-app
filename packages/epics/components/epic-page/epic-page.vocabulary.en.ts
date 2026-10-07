/**
 * Every name `<epic-page>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-page>`
 * A plan doc:  one epic's page.
 ****************/
export const epicPageVocabulary = {
  tag: "epic-page",
  topics: ["documentation", "layout", "containers"],
  aka: ["plan doc", "epic", "plan", "project plan"],
  skeleton: { parts: [{ shape: "header" }, { shape: "paragraph", lines: 4 }] },
  noun: "page",
  ui: false,
  description:
    "A plan doc:  one epic's page -- its header and meta lines, the Overview, then its sections in a fixed order.",
  attributes: [
    {
      name: "epic",
      kind: "string",
      required: true,
      format: "epic name",
      description: "The epic's name:  its folder in `epics/`, and its branch's (`epic-components`)."
    },
    {
      name: "title",
      property: "epicTitle",
      kind: "string",
      required: true,
      description: "The epic's title, without `Epic: ` (`Windows and Review`):  the page's h1 reads `Epic: <title>`."
    },
    { name: "branch", kind: "string", description: "Its git branch;  absent for a future epic." },
    {
      name: "worktree",
      kind: "string",
      description: "Its worktree's folder, absolute;  absent for a future epic, or once the worktree is gone."
    },
    { name: "started", kind: "string", format: "date", description: "The day the plan doc was made." },
    { name: "updated", kind: "string", format: "date", description: "The day a command last changed it." },
    {
      name: "future",
      kind: "boolean",
      description:
        "A FUTURE epic (`/epic future`):  an idea written down, not planned yet;  its open questions are on " +
        "`details/analysis.html`."
    },
    {
      name: "bedtime",
      kind: "string",
      description: "A `/bedtime` run is on, and what it runs (`P3-P6`):  items it changes are `recent`."
    },
    {
      name: "recent-since",
      kind: "string",
      format: "time",
      description:
        "Items decided, reviewed or closed since then are `recent` (green):  the commit time of `HEAD~2` in the " +
        "doc's checkout.  Absent without git history."
    },
    {
      name: "repo",
      kind: "string",
      description:
        "The repo's web address (`https://github.com/spell-app/spell-app`):  `<epic-commit>` links are made from " +
        "it.  Absent:  commits show without links."
    }
  ],
  events: [],
  slots: [
    { name: "", description: "The Overview, then the sections." },
    {
      name: "durable",
      description:
        'A link to the durable doc, once Doc Review wrote one:  `<a slot="durable" href="../../guides/x.html">X</a>`.'
    }
  ],
  parts: [{ name: "base", description: "The page." }],
  states: [],
  texts: [],
  children: [
    { tag: "flow", slot: "durable", max: 1, description: "The durable doc's link." },
    { tag: "epic-overview", min: 1, max: 1, description: "1. Overview." },
    { tag: "epic-section", where: { attribute: "kind", values: ["phases"] }, max: 1, description: "2. Phases." },
    {
      tag: "epic-section",
      where: { attribute: "kind", values: ["questions"] },
      max: 1,
      description: "3. Questions."
    },
    {
      tag: "epic-section",
      where: { attribute: "kind", values: ["judgements"] },
      max: 1,
      description: "4. Judgement calls."
    },
    { tag: "epic-section", where: { attribute: "kind", values: ["caveats"] }, max: 1, description: "5. Caveats." },
    { tag: "epic-section", where: { attribute: "kind", values: ["todos"] }, max: 1, description: "6. Todos." },
    { tag: "epic-section", where: { attribute: "kind", values: ["issues"] }, max: 1, description: "7. Issues." },
    { tag: "epic-section", where: { attribute: "kind", values: ["tests"] }, max: 1, description: "8. To test." },
    { tag: "epic-section", where: { attribute: "kind", values: ["log"] }, max: 1, description: "9. Log." }
  ],
  childOrder: "listed"
} as const satisfies EpicVocabulary
