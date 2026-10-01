/**
 * Shared types for `$/ui/util`.
 * - Exported rather than ambient (parser's `app.d.ts` globals), so a package consumer's `.d.ts` stays
 *   self-contained and nothing leaks into the host app's global scope.
 */

////////////////
// ## Classes
////////////////

/** Constructor type, e.g. `Constructor<HTMLElement>` represents a class that constructs `HTMLElement`s. */
export type Constructor<T> = new (...args: any[]) => T

/** Like `Constructor<T>` but also accepts `abstract` classes -- use for `instanceof` checks, NEVER for `new`. */
export type AbstractClass<T> = abstract new (...args: any[]) => T

////////////////
// ## Readability
////////////////

/**
 * Make VSCode hover of `T` more readable.
 * - e.g.:  `Prettify<SomeComplexType>`
 * - See:  https://www.totaltypescript.com/concepts/the-prettify-helper
 */
export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}
