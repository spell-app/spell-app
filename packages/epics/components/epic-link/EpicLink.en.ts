/**
 * Every name `<epic-link>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-link>`
 * A link to a saga, an epic, a phase or an item, from any page (epic `epic-workflow` P15, J32).
 ****************/
export const epicLinkVocabulary = {
  tag: "epic-link",
  topics: ["documentation", "navigation", "text"],
  aka: ["link", "saga link", "item link", "cross reference", "SAGA:/", "address"],
  noun: "link",
  ui: false,
  description:
    "A link to a saga page, an epic page, or a phase or item on one, written by what it points at, not by path:  " +
    '`<epic-link epic="seo" item="J3">`.  None of `saga` / `epic`:  the page it\'s in.  With no text, it draws ' +
    "the short form (`seo J3`, `T3` on its own page, `P7 · Epic Migrate` for a phase), the target's title its " +
    "tooltip.  The same as a short address, `SAGA:/<saga>/<epic>#<id>`.",
  attributes: [
    {
      name: "saga",
      kind: "string",
      format: "epic name",
      description:
        "The saga's id (`drawable-spell`).  Alone:  its saga page.  With an epic:  the saga that epic names " +
        "(not needed;  one it doesn't name still links, and the link check flags it)."
    },
    {
      name: "epic",
      kind: "string",
      format: "epic name",
      description: "The epic's id (`python-target`):  its epic page."
    },
    {
      name: "item",
      kind: "string",
      format: "anchor",
      description: "An id on that page, any case (`T1`, `j32`, `o1`):  lands on it, opening an item."
    },
    {
      name: "phase",
      kind: "string",
      description:
        "A phase instead of an item:  its number (`7`, `P7`) or its name (`epic-migrate`, the slug of its title)."
    }
  ],
  events: [],
  slots: [{ name: "", description: "The link's text;  none:  the short form." }],
  parts: [{ name: "base", description: "The link, an `<a>`;  plain text while it has nowhere to go." }],
  states: [{ name: "broken", description: "What it points at isn't there:  no page, or no such id on it." }],
  texts: [{ key: "broken", text: "Not found:  {target}", description: "A broken link's tooltip." }],
  children: [{ tag: "flow", description: "The link's text, if not the short form." }],
  flow: true
} as const satisfies EpicVocabulary
