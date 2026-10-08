import type { JSX } from "@solidjs/web"

/**
 * The fold chevron every `<epic-*>` fold draws (an item's line, Choices, an answered question's option panels, More
 * Details, Original Discussion):  a right-pointing stroke, turned down by its sheet while open.
 * - Drawn here, not from an icon pack:  on screen in the first frame, and its box is exactly its 16-unit view box,
 *   so it centres where its sheet puts it.
 * - Its look (size, stroke, the turn) is each sheet's:  `svg.chevron`.
 */
export function Chevron(): JSX.Element {
  return (
    <svg class={CHEVRON} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M6 3.5 10.5 8 6 12.5" />
    </svg>
  )
}

/** `Chevron()`'s class. */
const CHEVRON = "chevron"
