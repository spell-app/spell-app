/**
 * Barrel for `<spell-editor>`:  edits a spell project in any page, and feeds `<spell-app>`s what it compiles.
 * - NOTE: left out:
 *   - `element.ts`:  the bundle entry, which defines the element the moment it's imported
 *   - `SpellEditorElement`:  `extends HTMLElement`, and `customElement()`, fail where there's no DOM, e.g. in tests
 */
export * from "./SpellEditorPane"
