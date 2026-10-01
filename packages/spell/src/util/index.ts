/**
 * Barrel for `~/util` -- general-purpose utilities with no dependency on rest of app.
 * - Grouped below by rough concern: constants, app plumbing, language helpers, fetch/observable, DOM, tasks.
 *   (`#util` first.)
 * - Re-exports `#util` (`packages/util`, shared with `ui`:  `@proto`, class helpers, name-case strings,
 *   shadow-aware DOM), so the many `from "~/util"` imports still find them.
 * - `string.ts` (lodash / `pluralize` / whitespace) and `DOM.ts` (scroll / computed style) stay here:  only
 *   `spell` uses them, and anything in `#util` lands in `ui`'s `core` bundle.
 * - NOTE: `ResponseErrors.ts` is deliberately NOT re-exported here -- its error classes (`ResponseError`,
 *   `MissingResourceError`, etc) are consumed directly by `$fetch.ts`/`LoadableFile.ts` via relative import,
 *   not by outside callers, so they stay off this barrel's public surface.
 *   TODO: confirm that's intentional rather than a gap -- no other file imports them today.
 */

export * from "#util"
export * from "./constants"

export * from "./Logger"
export * from "./prefs"
export * from "./AppPrefStore"

export * from "./assert"
export * from "./extend"
export * from "./Derivative"
export * from "./Assertable"
export * from "./string"
export * from "./DOM"
export * from "./json"
export * from "./paths"
export * from "./die"
export * from "./CustomError"

export * from "./abortableFetch"
export * from "./$fetch"
export * from "./Observable"
export * from "./Loadable"
export * from "./LoadableFile"

export * from "./Task"
export * from "./TaskList"
