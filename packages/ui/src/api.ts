/**
 * `api` lib entry (`@spell-app/ui/api`):  the NAMESPACED API, for apps that extend or introspect the components.
 * - `E` ~== `$/ui/elements`:  element core, base classes, `ClassBuilder`, the `forms` bases (`FormElement` ...)
 * - `V` ~== `$/ui/vocabulary`:  vocabulary schema, value sets, registry, converters
 * - NOT a side-effect module:  registers no element.  Import a family (`@spell-app/ui/ui-button`) or `@spell-app/ui` for that.
 * - NOTE: its own entry, NOT part of `index` (`@spell-app/ui`):  `export * as` needs Rolldown's `__exportAll` helper,
 *   and namespacing a module that `core` also reaches moves Rolldown's runtime helpers into a shared
 *   `rolldown-runtime-<hash>.js` that `core.js` and every family import.  Here the namespace objects stay in
 *   `api.js`, which imports `__exportAll` from `core.js`.  `yarn measure` checks (`runtimeChunks`).
 * - NOTE: `V` namespaces `vocabulary.api.ts`, not the `$/ui/vocabulary` barrel, for the same reason:  see there.
 * - SIDE EFFECT (of the build only):  `import "$/ui/forms"` puts the `forms` ENTRY on this entry's path too.  Without
 *   it `E` reaches the `forms` leaves only through the `$/ui/elements` barrel, and Rolldown hoists them out of `forms.js`
 *   into a shared `FormElement-<hash>.js`, leaving `forms.js` a facade.
 */

import "$/ui/forms"

export * as E from "$/ui/elements"
export * as V from "$/ui/vocabulary/vocabulary.api"
