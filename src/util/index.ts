/**
 * Barrel for `~/util` -- general-purpose utilities with no dependency on rest of app.
 * - Grouped below by rough concern: constants, app plumbing, language helpers, fetch/observable, DOM, tasks.
 * - NOTE: `ResponseErrors.ts` is deliberately NOT re-exported here -- its error classes (`ResponseError`,
 *   `MissingResourceError`, etc) are consumed directly by `$fetch.ts`/`LoadableFile.ts` via relative import,
 *   not by outside callers, so they stay off this barrel's public surface.
 *   TODO: confirm that's intentional rather than a gap -- no other file imports them today.
 */

export * from "./constants"

export * from "./Logger"
export * from "./class"
export * from "./decorators"
export * from "./prefs"
export * from "./AppPrefStore"

export * from "./assert"
export * from "./extend"
export * from "./Derivative"
export * from "./Assertable"
export * from "./string"
export * from "./json"
export * from "./paths"
export * from "./die"
export * from "./CustomError"

export * from "./abortableFetch"
export * from "./$fetch"
export * from "./Observable"
export * from "./Loadable"
export * from "./LoadableFile"

export * from "./DOM"

export * from "./Task"
export * from "./TaskList"
