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
 * - Draws the pieces every fold shares:  its fold button (`fold.button()`), the chevron (`Fold.chevron()`), and the
 *   collapse-all button of an open title (`Fold.collapseAllButton()`, folding all under it:  `foldAllUnder()`).
 *   Methods, not tags of their own (P10):
 *   - the button is named by `aria-labelledby`, whose ids must be in the same shadow root as the card's heading:
 *     a tag would put a shadow root between them
 *   - the chevrons must be on screen in the first frame, with no wait for an element to upgrade
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

  /** Fold it, if open (collapse-all, `foldAllUnder()`);  true when it was open. */
  readonly close = (): boolean => {
    if (!this.isOpen()) return false
    this.toggled = false
    return true
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

  /**
   * The collapse-all button:  the double up-chevron beside an open title's fold chevron -- a section's, a phase's,
   * an item's, the page toolbar's -- that folds everything under it, the title itself staying open (Owen, 2026-10-10:
   * "Add collapse all buttons to the headers ... It should close everything underneath it").
   * - What it folds is its owner's `collapseAll()` (`foldAllUnder()`);  this only draws it and calls `onCollapse`.
   * - Drawn here, as the chevron is:  on screen in the first frame, in the chevron's stroke.
   * - Its look:  `CollapseAll.css`, which each owner adopts as `epic-collapse-all`.
   */
  static collapseAllButton({ label, part, onCollapse }: CollapseAllOptions): JSX.Element {
    return (
      <button type="button" class={COLLAPSE_ALL} part={part} aria-label={label} title={label} onClick={onCollapse}>
        <svg class={CHEVRONS} viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4 8.5 8 4.5 12 8.5M4 12.5 8 8.5 12 12.5" />
        </svg>
      </button>
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

/**
 * Fold everything under `root`:  collapse-all (Owen, 2026-10-10:  "close everything underneath it"),
 * the double chevron on a section's, phase's or item's title, and the page toolbar's.
 * - every `<epic-*>` element inside it that folds, in page order:
 *   - sections, phases and items through their own `collapse()`:  the cancelable `ui-close`, as a click's,
 *     so the page remembers a section's fold as usual
 *   - every card and panel (an aside, a code block, a reply, Choices ...) through its `fold` (`Fold.close()`)
 * - `root` itself stays as it is;  so do the boxes in its shadow root (its own `collapseAll()` folds those)
 * - returns how many it folded
 */
export function foldAllUnder(root: Element): number {
  let folded = 0
  for (const element of root.querySelectorAll("*")) {
    if (!element.localName.startsWith(EPIC_PREFIX)) continue
    const component = (element as Partial<E.DOMElement>).component as Collapsible | undefined
    if (!component) continue
    const closed = component.collapse ? component.collapse() : component.fold instanceof Fold && component.fold.close()
    if (closed) folded++
  }
  return folded
}

/** What `foldAllUnder()` folds:  a component that folds itself (`collapse()`), or one with a box that folds (`fold`). */
type Collapsible = {
  /** fold it as a click would;  true when it was open */
  collapse?: () => boolean
  /** its box's fold */
  fold?: unknown
}

/**
 * The cards and panels that fold by a `Fold`, as an item's children:  an open item holding one shows its
 * collapse-all button.
 */
export const FOLDING_CARDS =
  "epic-aside, epic-code, epic-answer, epic-more, epic-reply, epic-status, epic-original, epic-choices, epic-update, epic-note"

/** Tag prefix of the plan doc's elements:  only those fold. */
const EPIC_PREFIX = "epic-"

/** What `Fold.collapseAllButton()` takes. */
export type CollapseAllOptions = {
  /** its name and tooltip:  `Fold everything in Questions` */
  label: string
  /** its `part`:  `collapse-all` in each owner's vocabulary */
  part: string
  /** clicked:  fold everything under its owner */
  onCollapse: () => void
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

/** `Fold.collapseAllButton()`'s class. */
const COLLAPSE_ALL = "collapse-all"

/** Its glyph's class. */
const CHEVRONS = "chevrons"
