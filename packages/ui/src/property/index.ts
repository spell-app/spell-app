/**
 * Barrel for `$/ui/property`:  what `<ui-property-editor>` reads a thing's properties from (epic `property-editor`).
 * - `PropertySchemas`:  a component's vocabulary, a JSON Schema or a JSON block's values, as a `PropertySchema`.
 * - `PropertyEditorPages`:  an editor's saved page (`Card.editor.html`):  write a default one, check it, fix it.
 * - No Solid:  node tools and tests import it as it is.
 *   `PropertyEditorPages` works on the DOM it's handed (a browser's, or linkedom's under node).
 */

export * from "./PropertySchemas"
export * from "./PropertyEditorPages"
