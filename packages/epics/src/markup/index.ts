/**
 * `$/epics/markup` barrel:  reading, writing and checking a plan doc's `<epic-*>` markup through
 * `$/epics/definitions`, on linkedom documents (node) and the browser's DOM alike;  and turning older prose shapes
 * into the elements (`ProseRewrite`).
 * - Node-safe:  defines no element, touches no DOM global.
 */
export * from "./markup.types"

export * from "./MarkupCheck"
export * from "./Markup"
export * from "./ProseRewrite"
