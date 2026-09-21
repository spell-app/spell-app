/**
 * Global type definitions for the app.
 * Included automatically by tsconfig and does not require importing.
 */

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

/**
 * Common React types available globally, so files don't need to import them individually.
 * Use e.g. `ReactNode` rather than `React.ReactNode`.
 */
type ReactNode = import("react").ReactNode

/**
 * Alias for `React.Component`.
 * - NOTE: empty `{}` defaults mirror upstream `React.Component`'s own `P = {}, S = {}`.
 */
type ReactComponent<P = {}, S = {}> = import("react").Component<P, S>

/**
 * Alias for `React.ComponentType`.
 * - NOTE: empty `{}` default mirrors upstream `React.ComponentType`'s own `P = {}`.
 */
type ReactComponentType<P = {}> = import("react").ComponentType<P>

/** Alias for `React.ReactElement`. */
type ReactElement<P = any> = import("react").ReactElement<P>
