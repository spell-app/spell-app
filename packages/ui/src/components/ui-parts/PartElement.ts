import { E } from "$/ui/core"
import { ContentPartFallback } from "./ui-parts.fallback"

/****************
 * ### `PartElement`
 * The parts family's base:  `E.ContentPart` (in `core`, as the owner-context machinery) plus the family's native
 * fallback, `ContentPartFallback` -- one class for all 13 parts, keyed by the host's tag.
 * - Why a family base:  the fallback belongs in the `parts` chunk, not in `core` with `ContentPart`.
 ****************/
export abstract class PartElement<V extends E.ComponentVocabulary = E.ComponentVocabulary> extends E.ContentPart<V> {
  @E.proto static Fallback = ContentPartFallback
}
