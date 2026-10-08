/**
 * `$/epics` barrel:  code the `epics` pack's elements and the node tools share.  One namespace, `EP`.
 * - `definitions/`:  the ONE description of every `<epic-*>` element (its vocabulary, as data, and its children)
 * - `markup/`:  reading, writing and checking a plan doc's `<epic-*>` markup through those definitions
 * - NOTE: the elements are NOT here:  `$/epics/components` (importing a family defines its tags:  SIDE EFFECT).
 * - Loads in the browser AND in node (the `node` tests, the plan-doc tool):  nothing here may touch `window` /
 *   `document` at load.
 */
export * from "./definitions"
export * from "./markup"

export * as EP from "."
