/// <reference types="vite/client" />

/**
 * The global types, used bare, no import (WWOD §9 › "Ambient globals used bare"):  every package that wants them
 * names them in its `tsconfig.json`, `"types": [..., "@spell-app/toolchain/types"]`.
 * - Were the repo root's `types/` (`app.d.ts`, `global.d.ts`, `vite-env.d.ts`) until epic `repo-split` P6.
 * - With Vite's client types (`import.meta.env`, `?inline` imports), as `vite-env.d.ts` gave them.
 */

/**
 * Our `package.json` version, e.g. `"0.8.0"` -- read it as `PACKAGE_VERSION` from `$/util`.
 * - Defined by vite / vitest (`@spell-app/toolchain/packageVersion`), or under `tsx` by `src/packageVersion.node.ts`.
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

/** `import global from "global"`:  the global object, for code written for a bundler that provided it. */
declare module "global" {
  const global: any
  export default global
}
