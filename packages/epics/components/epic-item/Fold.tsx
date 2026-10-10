import type { Accessor } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

/****************
 * ### `Fold`
 * The open / folded state of a box an `<epic-*>` element folds by itself, never written to the file:  Choices, an
 * answered question's option panels, More Details, Original Discussion, and every card with a heading band (a reply,
 * the answer, a status card, a note:  Owen, 2026-10-08, "everything in a section box should be collapsible").
 * (`<epic-item>` folds through its `open` attribute instead:  links and P9 open it from outside.)
 * - Starts as `initial()` says, and follows it until the reader toggles it:  an option panel opens while its option
 *   is the chosen one.
 * - The content box takes `hidden()` and `watch` as its ref:  folded, it's `hidden="until-found"`, so find-in-page
 *   reaches the text and unfolds it (`beforematch`).
 * - A card's heading band takes `heading` as its ref, with its fold button (`button()`) first in it:
 *   a click anywhere on the band folds, but on a link or another control in it.
 * - Draws the two pieces every fold shares:  its fold button (`fold.button()`) and the chevron (`Fold.chevron()`).
 *   Methods, not tags of their own (P10):
 *   - the button is named by `aria-labelledby`, whose ids must be in the same shadow root as the card's heading:
 *     a tag would put a shadow root between them
 *   - the chevron must be on screen in the first frame, with no wait for an element to upgrade
 * - Its listeners are added by its refs, by hand:  `Fold` is no component, so no `@E.on`.
 ****************/
export class Fold {
  /** The reader's choice, once made;  `undefined` until then. */
  @E.state private accessor toggled: boolean | undefined = undefined

  constructor(private readonly initial: Accessor<boolean>) {}

  ////////////////
  // ## Open or folded
  ////////////////

  /** Open?  Tracked. */
  readonly isOpen = (): boolean => this.toggled ?? this.initial()

  /** The content box's `hidden`:  `until-found` while folded;  tracked. */
  readonly hidden = (): "until-found" | undefined => (this.isOpen() ? undefined : "until-found")

  /** Open if folded, fold if open:  a click on its header. */
  readonly toggle = () => {
    this.toggled = !this.isOpen()
  }

  /** The content box's ref:  find-in-page matched inside the folded box, which the browser has revealed. */
  readonly watch = (content: HTMLElement) => {
    content.addEventListener("beforematch", () => (this.toggled = true))
  }

  ////////////////
  // ## Drawing
  ////////////////

  /**
   * The fold button FIRST in a card's heading band -- `<epic-reply>`, `<epic-answer>`, `<epic-status>`, `<epic-note>`,
   * an `<epic-update>` note, `<epic-updated>` -- so everything boxed in a section folds (Owen, 2026-10-08).
   * - A `<button>`, named by the heading's words (`labelledBy`:  ids in the same shadow root),
   *   `aria-expanded` as the fold stands;  the chevron turns down while open (`Fold.css`, which each card adopts).
   * - No click handler of its own:  its band's (`heading`) takes a click on it, Enter and Space too,
   *   and a click on the rest of the band.
   */
  button({ controls, labelledBy, part }: FoldButtonOptions): JSX.Element {
    return (
      <button
        type="button"
        class={FOLD_BUTTON}
        part={part}
        aria-expanded={this.isOpen() ? "true" : "false"}
        aria-controls={controls}
        aria-labelledby={labelledBy}
      >
        {Fold.chevron()}
      </button>
    )
  }

  /**
   * The fold chevron every `<epic-*>` fold draws (an item's line, Choices, an answered question's option panels,
   * More Details, Original Discussion, a card's fold button):  a right-pointing stroke, turned down by its sheet while open.
   * - Drawn here, not from an icon pack:  on screen in the first frame, and its box is exactly its 16-unit view box,
   *   so it centres where its sheet puts it.
   * - Its look (size, stroke, the turn) is each sheet's:  `svg.chevron`.
   */
  static chevron(): JSX.Element {
    return (
      <svg class={CHEVRON} viewBox="0 0 16 16" aria-hidden="true">
        <path d="M6 3.5 10.5 8 6 12.5" />
      </svg>
    )
  }

  ////////////////
  // ## The heading band
  ////////////////

  /**
   * A card's heading band's ref:  a click on it folds or unfolds (`onHeadingClick()`).
   * - a native listener, not JSX's `onClick`:  Solid delegates that to the document, where the click's
   *   `currentTarget` (where the band ends) is gone
   */
  readonly heading = (band: HTMLElement) => {
    band.addEventListener("click", this.onHeadingClick)
  }

  /**
   * A click on the heading band:  its fold button (a click, Enter or Space) toggles;  so does any other spot,
   * unless it's a link or another control in the band, or the end of a drag selecting its words.
   */
  private readonly onHeadingClick = (event: MouseEvent) => {
    // nothing to fold (an empty body):  the band draws no button
    if (!(event.currentTarget as Element).querySelector(`.${FOLD_BUTTON}`)) return
    for (const target of event.composedPath()) {
      if (!(target instanceof Element) || target === event.currentTarget) break
      if (target.classList.contains(FOLD_BUTTON)) return this.toggle()
      if (target.matches(CONTROLS)) return
    }
    if (String(window.getSelection() ?? "")) return
    this.toggle()
  }
}

/** What `fold.button()` takes. */
export type FoldButtonOptions = {
  /** the `id` of the box it folds */
  controls: string
  /** the `id`s of the heading's words, space-separated:  its name */
  labelledBy: string
  /** its `part`:  `toggle` in every card's vocabulary */
  part: string
}

/** Class of a card's fold button (`fold.button()`):  a click on it always folds. */
export const FOLD_BUTTON = "fold-button"

/** Class word of a heading band that folds its card (it has a body):  a pointer over it (`Fold.css`). */
export const FOLDS = "folds"

/** What, on a line or a heading band, acts by itself:  a click there doesn't fold (`<epic-item>`'s line too). */
export const CONTROLS = "a[href], button, input, select, textarea, label, summary, [role='button'], [contenteditable]"

/** `Fold.chevron()`'s class. */
const CHEVRON = "chevron"
