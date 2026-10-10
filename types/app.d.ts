/**
 * Global type definitions for the app.
 * Included automatically by tsconfig and does not require importing.
 */

/**
 * Our `package.json` version, e.g. `"0.8.0"` -- read it as `PACKAGE_VERSION` from `$/util`.
 * - Defined by vite / vitest (`vite.packageVersion.ts`), or under `tsx` by `src/packageVersion.node.ts`.
 * - `var` so `globalThis.__PACKAGE_VERSION__` is typed too.
 */
declare var __PACKAGE_VERSION__: string

/** Constructor type, e.g. `Class<Token>` represents a class that constructs `Token` instances. */
type Class<T> = new (...args: any[]) => T

/** Like `Class<T>` but also accepts `abstract` classes -- use for `instanceof` checks, NEVER for `new`. */
type AbstractClass<T> = abstract new (...args: any[]) => T

/**
 * Make VSCode hover of `T` more readable.
 * - e.g.:  `Prettify<SomeComplexType>`
 * -  See:  https://www.totaltypescript.com/concepts/the-prettify-helper
 */
type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

/**
 * Given string `List`, return type of segments separated by `Delimiter`.
 * - Default Delimiter is `:`
 * - e.g.:  `type Segments = List<"a:b:c">`  // => `type Segments = "a"|"b"|"c"
 */
type SplitString<List, Delimiter extends string = ":"> = List extends `${infer Head}${Delimiter}${infer Tail}`
  ? Head | SplitString<Tail, Delimiter>
  : List
