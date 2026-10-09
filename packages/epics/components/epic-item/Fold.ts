import type { Accessor } from "solid-js"

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
 * - A card's heading band takes `heading` as its ref, with a `<FoldButton>` first in it:  a click anywhere on the
 *   band folds, but on a link or another control in it.
 ****************/
export class Fold {
  /** The reader's choice, once made;  `undefined` until then. */
  @E.state private accessor toggled: boolean | undefined = undefined

  constructor(private readonly initial: Accessor<boolean>) {}

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

  /**
   * A card's heading band's ref:  a click on it folds or unfolds (`onHeadingClick()`).
   * - a native listener, not JSX's `onClick`:  Solid delegates that to the document, where the click's
   *   `currentTarget` (where the band ends) is gone
   */
  readonly heading = (band: HTMLElement) => {
    band.addEventListener("click", this.onHeadingClick)
  }

  /**
   * A click on the heading band:  its `<FoldButton>` (a click, Enter or Space) toggles;  so does any other spot,
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

/** Class of a card's fold button (`<FoldButton>`):  a click on it always folds. */
export const FOLD_BUTTON = "fold-button"

/** Class word of a heading band that folds its card (it has a body):  a pointer over it (`FoldButton.css`). */
export const FOLDS = "folds"

/** What, on a line or a heading band, acts by itself:  a click there doesn't fold (`<epic-item>`'s line too). */
export const CONTROLS = "a[href], button, input, select, textarea, label, summary, [role='button'], [contenteditable]"
