/**
 * `api` lib entry (`@spell/ui/api`):  the NAMESPACED API, for apps that extend or introspect the components.
 * - `E` ~== `$/elements`:  element core, base classes, `ClassBuilder`, the `forms` bases (`FormElement` ...)
 * - `V` ~== `$/vocabulary`:  vocabulary schema, value sets, registry, converters
 * - NOT a side-effect module:  registers no element.  Import a family (`@spell/ui/button`) or `@spell/ui` for that.
 * - NOTE: its own entry, NOT part of `index` (`@spell/ui`):  `export * as` needs Rolldown's `__exportAll` helper,
 *   and namespacing a module that `core` also reaches moves Rolldown's runtime helpers into a shared
 *   `rolldown-runtime-<hash>.js` that `core.js` and every family import.  Here the namespace objects stay in
 *   `api.js`, which imports `__exportAll` from `core.js`.  `yarn measure` checks (`runtimeChunks`).
 * - NOTE: `V` namespaces `vocabulary.api.ts`, not the `$/vocabulary` barrel, for the same reason:  see there.
 * - SIDE EFFECT (of the build only):  `import "$/forms"` puts the `forms` ENTRY on this entry's path too.  Without
 *   it `E` reaches the `forms` leaves only through the `$/elements` barrel, and Rolldown hoists them out of `forms.js`
 *   into a shared `FormElement-<hash>.js`, leaving `forms.js` a facade.
 */

import "$/forms"

export * as E from "$/elements"
export * as V from "$/vocabulary/vocabulary.api"
