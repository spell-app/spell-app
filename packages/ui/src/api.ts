/**
 * `api` lib entry (`@spell-app/ui/api`):  the NAMESPACED API, for apps that extend or introspect the components.
 * - `E` ~== `$/ui/core`:  element core, base classes, `ClassBuilder`, the foundation;  the SAME `E` component files
 *   import (`import { E } from "$/ui/core"`)
 * - `F` ~== `$/ui/forms`:  the form bases (`FormComponent`, `DOMFormControlElement`, `Validator`, `MenuOptions` ...)
 * - `V` ~== `$/ui/vocabulary`:  vocabulary schema, value sets, registry, converters
 * - NOT a side-effect module:  registers no element.  Import a family (`@spell-app/ui/ui-button`) or `@spell-app/ui` for that.
 * - NOTE: its own entry, NOT part of `index` (`@spell-app/ui`):  `export * as` needs Rolldown's `__exportAll` helper,
 *   and namespacing a module that `core` also reaches moves Rolldown's runtime helpers into a shared
 *   `rolldown-runtime-<hash>.js` that `core.js` and every family import.  `E` / `F` are built where their entries
 *   are (`core.ts`, `forms.ts`), so only `V`'s object lives here.  `yarn measure` checks (`runtimeChunks`).
 * - NOTE: `V` namespaces `vocabulary.api.ts`, not the `$/ui/vocabulary` barrel, for the same reason:  see there.
 */

export { E } from "$/ui/core"
export { F } from "$/ui/forms"
export * as V from "$/ui/vocabulary/vocabulary.api"
