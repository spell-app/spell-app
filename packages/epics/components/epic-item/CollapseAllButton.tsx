import type { JSX } from "@solidjs/web"

/****************
 * ### `<CollapseAllButton>`
 * The double up-chevron beside an open title's fold chevron -- a section's, a phase's, an item's --
 * that folds everything under it, the title itself staying open (Owen, 2026-10-10:
 * "Add collapse all buttons to the headers ... It should close everything underneath it").
 * - What it folds is its owner's `collapseAll()` (`foldAllUnder()`, `Fold.ts`);  this only draws and calls it.
 * - Drawn here, not from an icon pack (as `<Chevron>`):  on screen in the first frame, the chevron's stroke.
 * - Its look:  `CollapseAllButton.css`, which each owner adopts as `epic-collapse-all`.
 * - Plain Solid, no element of its own;  each family imports THIS file, never `epic-item`'s barrel.
 ****************/
export function CollapseAllButton(props: CollapseAllButtonProps): JSX.Element {
  return (
    <button
      type="button"
      class={COLLAPSE_ALL}
      part={props.part}
      aria-label={props.label}
      title={props.label}
      onClick={() => props.onCollapse()}
    >
      <svg class={CHEVRONS} viewBox="0 0 16 16" aria-hidden="true">
        <path d="M4 8.5 8 4.5 12 8.5M4 12.5 8 8.5 12 12.5" />
      </svg>
    </button>
  )
}

/** Props for `<CollapseAllButton>`. */
export type CollapseAllButtonProps = {
  /** its name and tooltip:  `Fold everything in Questions` */
  label: string
  /** its `part`:  `collapse-all` in each owner's vocabulary */
  part: string
  /** clicked:  fold everything under its owner */
  onCollapse: () => void
}

/** The button's class. */
const COLLAPSE_ALL = "collapse-all"

/** Its glyph's class. */
const CHEVRONS = "chevrons"
