/**
 * `$/epics/markup` barrel:  reading, writing and checking a plan doc's `<epic-*>` markup through
 * `$/epics/definitions`, on linkedom documents (node) and the browser's DOM alike.
 * - Node-safe:  defines no element, touches no DOM global.
 * - Turning the old prose shapes into the elements is the plan-doc tool's (`$/epics/tool/ProseRewrite`).
 */
export * from "./markup.types"

export * from "./MarkupCheck"
export * from "./Markup"
