import type { JSX } from "@solidjs/web"

import { Chevron } from "./Chevron"
import { FOLD_BUTTON, type Fold } from "./Fold"

/****************
 * ### `<FoldButton>`
 * The fold chevron FIRST in a card's heading band -- `<epic-reply>`, `<epic-answer>`, `<epic-status>`, `<epic-note>`,
 * an `<epic-update>` note, `<epic-updated>` -- so everything boxed in a section folds (Owen, 2026-10-08).
 * - A `<button>`, named by the heading's words (`labelledBy`:  ids in the same shadow root), `aria-expanded` as its
 *   `fold` stands;  the chevron turns down while open (`FoldButton.css`, which each card adopts).
 * - No click handler of its own:  its band's (`Fold.heading`) takes a click on it, Enter and Space too, and a
 *   click on the rest of the band.
 * - Plain Solid, no element of its own;  each family imports THIS file, never `epic-item`'s barrel.
 ****************/
export function FoldButton(props: FoldButtonProps): JSX.Element {
  return (
    <button
      type="button"
      class={FOLD_BUTTON}
      part={props.part}
      aria-expanded={props.fold.isOpen() ? "true" : "false"}
      aria-controls={props.controls}
      aria-labelledby={props.labelledBy}
    >
      <Chevron />
    </button>
  )
}

/** Props for `<FoldButton>`. */
export type FoldButtonProps = {
  /** the card's open / folded state */
  fold: Fold
  /** the `id` of the box it folds */
  controls: string
  /** the `id`s of the heading's words, space-separated:  its name */
  labelledBy: string
  /** its `part`:  `toggle` in every card's vocabulary */
  part: string
}
