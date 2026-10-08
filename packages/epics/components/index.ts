/**
 * `$/epics/components` barrel:  every `<epic-*>` element of the `epics` pack, each defined (SIDE EFFECT) as
 * its folder's barrel is imported.
 * - `spell dev pack element epics <tag>` adds a family, and its line here.
 * - The pack's script doesn't import this:  its generated entry (`pack/epics.entry.ts`) imports each family's
 *   barrel from `define()`, when `<ui-root>` registers the pack.
 */
export * from "./epic-page"
export * from "./epic-overview"
export * from "./epic-section"
export * from "./epic-phase"
export * from "./epic-item"
export * from "./epic-choices"
export * from "./epic-answer"
export * from "./epic-original"
export * from "./epic-commit"
export * from "./epic-event"
export * from "./epic-update"
export * from "./epic-status"
export * from "./epic-code"
export * from "./epic-aside"
export * from "./epic-note"
