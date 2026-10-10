/**
 * Barrel for `$/util/reactive` -- the reactive engine every reactive class shares:  spell cells, the records, the
 * schema and the decorators.  Flattened into `$/util` by `../index.ts`.
 * - Spell cells (`cells.ts`, `Cell`, `Derived`, `Reaction`):  who read what, and telling them when it changed.
 * - The records (`extend.ts`):  each object's props and state, read and written synchronously -- `getProp()` /
 *   `setProp()`, `getState()` / `setState()`, `derive()`.
 * - `Schema`:  each class's declared prop types.
 * - The decorators (`decorators.ts`):  `@prop`, `@state`, `@derived`.
 * - The bridges (`bridges.ts`):  `bridgeSolid()`, which the HOST calls with its Solid, and `observe()`.
 * - GENERIC:  no lodash, no Solid, nothing spell-specific, so any package may import it, Spell UI included (file by
 *   file, as `ui`'s `src/util/index.ts` imports util's other generic files).  Spell's own layer on top
 *   (`Observable`, `@thing`) is in `$/util/spell`.
 * - NOTE: its files import each other as peers, never through `$/util`, which re-exports this folder:  a cycle.
 */

export * from "./cells"
export * from "./Cell"
export * from "./Derived"
export * from "./Reaction"
export * from "./bridges"
export * from "./Schema"
export * from "./extend"
export * from "./decorators"
