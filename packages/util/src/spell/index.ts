/**
 * Barrel for `$/util/spell` -- spell's own utilities, flattened into `$/util` by `../index.ts`.
 * - Grouped below by rough concern: constants, app plumbing, language helpers, fetch/observable, DOM, tasks.
 * - A sub-folder, not beside the generic helpers:  `ui` is published and bundles the generic files, and these pull in
 *   lodash, `chalk`, `pluralize` and React (`view()`).  `string.ts` and `DOM.ts` also share a name with
 *   the generic `../string.ts` / `../dom.ts` (and macOS is case-insensitive).
 * - NOTE: files here import the generic helpers by deep path (`$/util/class`), never the `$/util` barrel:  it re-exports
 *   this folder, which would be a cycle.
 * - NOTE: `ResponseErrors.ts` is deliberately NOT re-exported here -- its error classes (`ResponseError`,
 *   `MissingResourceError`, etc) are consumed directly by `$fetch.ts`/`LoadableFile.ts` via relative import,
 *   not by outside callers, so they stay off this barrel's public surface.
 *   TODO: confirm that's intentional rather than a gap -- no other file imports them today.
 */

export * from "./constants"

export * from "./Logger"
export * from "./prefs"
export * from "./AppPrefStore"

export * from "./assert"
export * from "./cells"
export * from "./Cell"
export * from "./Derived"
export * from "./Reaction"
export * from "./bridges"
export * from "./Schema"
export * from "./extend"
export * from "./Derivative"
export * from "./spellDecorators"
export * from "./Assertable"
export * from "./string"
export * from "./json"
export * from "./array"
export * from "./paths"
export * from "./die"
export * from "./CustomError"

export * from "./abortableFetch"
export * from "./$fetch"
export * from "./Observable"
export * from "./view"
export * from "./Loadable"
export * from "./LoadableFile"

export * from "./Task"
export * from "./TaskList"
