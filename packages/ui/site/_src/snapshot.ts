/**
 * The site entry's FIRST import:  keep every `<ui-docs-example>`'s markup before any family loads and upgrades it
 * (`ExampleSource.snapshot()`).
 * - A module of its own, imported first, because ES modules evaluate in import order:  this runs before
 *   `<ui-root>`'s module defines anything.  The entry's own body runs only after ALL its imports.
 * - SIDE EFFECT:  fills the page's snapshot map.
 */
import { ExampleSource } from "$/ui/docs-components/ui-docs-example/ExampleSource"

ExampleSource.snapshot(document)
