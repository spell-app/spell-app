/**
 * Barrel for `$/vocabulary` -- the library-neutral naming layer:  vocabulary schema, shared value sets,
 * the registry / translation resolver, and attribute converters.
 * - No DOM and no base library:  `UIElement` (Solid) and the native fallbacks read the same names.
 * - NOTE: no namespace yet;  import by name, e.g. `import { ValueSets } from "$/vocabulary"`.
 *   The runtime's `UI.vocabulary` service wraps `Vocabulary`.
 */

export * from "./vocabulary.types"

export * from "./ValueSets"
export * from "./Converters"
export * from "./Vocabulary"
