/**
 * `$/epics/links`:  pointing at a saga, an epic, a phase or an item, the same way everywhere (epic `epic-workflow`
 * P15):  short addresses (`SAGA:/drawable-spell/python-target#T1`), `<epic-link>`'s attributes, and what a page holds
 * to land on.
 * - Pure, node-safe at import:  the elements, the docs runtime (`spell-doc-runtime.js`) and the node tools import it.
 * - NOT in the `$/epics` barrel:  the docs runtime imports this alone, so its bundle gets none of the rest.
 * - What's THERE in a checkout (sagas, pages, ids on disk):  the epic tool's `EpicTargets`, node only.
 */
export * from "./links.types"

export * from "./EpicAddress"
export * from "./PageTargets"
