/**
 * Barrel for `$/ui/vocabulary` -- the naming layer:
 * vocabulary schema, shared value sets, the registry / translation resolver, and attribute converters.
 * - No DOM and no Solid:  `UIComponent` and the native fallbacks read the same names.
 * - Its place in the import graph:  BELOW the element core, above `$/ui/util` only.
 *   - Node loads it with the vocabularies (`yarn site:data`, `yarn gen:root`),
 *     so it MUST NEVER import `$/ui/core`, `$/ui/elements` or `$/ui/runtime`.
 * - Who reaches it, and how:
 *   - component and element-core files:  through the `core` entry, as `E` (`E.ValueSets`, `E.Converters`)
 *   - apps:  through the `api` entry, as `V` (`vocabulary.api.ts`)
 *   - the runtime's `UI.vocabulary` service wraps `Vocabulary`
 * - NOTE: no namespace of its own here:
 *   `export * as V` of this barrel would cost every page a chunk (see `vocabulary.api.ts`).
 */

export * from "./vocabulary.types"

export * from "./ValueSets"
export * from "./Converters"
export * from "./Vocabulary"
export * from "./SharedVocabulary"
