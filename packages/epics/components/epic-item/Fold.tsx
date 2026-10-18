import type { Accessor } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/spell-solid"

import { ACTIONS_SLOT } from "./Fold.types"

/****************
 * ### `Fold`
 * The open / folded state of a box an `<epic-*>` element folds by itself, never written to the file.
 * - The boxes that fold by one:
 *   - Choices, an answered question's option panels, More Details, Original Discussion,
 *     an aside or code panel, the Agents running panel
 *   - every card with a heading band:  a reply, the answer, a status card, a note
 *     (Owen, 2026-10-08, "everything in a section box should be collapsible")
 *   - NOT `<epic-item>`:  it folds through its `open` attribute, as links and P9 open it from outside
 * - Starts as `initial()` says, and follows it until the reader toggles it:
 *   an option panel opens while its option is the chosen one.
 * - The content box takes `hidden()`, and `watch` as its ref:
 *   folded, it's `hidden="until-found"`, so find-in-page reaches the text and unfolds it (`beforematch`).
 * - A card's heading band takes `heading` as its ref, with its fold button (`button()`) first in it:
 *   a click anywhere on the band folds, but on a link or another control in it.
 * - Draws the pieces every fold shares:
 *   - its fold button (`fold.button()`)
 *   - the chevron (`Fold.chevron()`)
 *   - the collapse-all button of an open title (`Fold.collapseAllButton()`, folding all under it:  `foldAllUnder()`)
 *   - the box of a title row's `actions` slot (`Fold.actions()`):  the page's own buttons there
 * - Those are methods, not tags of their own (P10):
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
   * The fold button FIRST in a card's heading band, so everything boxed in a section folds (Owen, 2026-10-08).
   * - The cards:
   *   `<epic-reply>`, `<epic-answer>`, `<epic-status>`, `<epic-note>`, an `<epic-update>` note, `<epic-updated>`
   * - A `<button>`, named by the heading's words (`labelledBy`:  ids in the same shadow root),
   *   its `aria-expanded` as the fold stands,
   *   its tooltip (`tips`) what a click does
   * - The chevron turns down while open (`Fold.css`, which each card adopts).
   * - No click handler of its own:  its band's (`heading`) takes a click on it, Enter and Space too,
   *   and a click on the rest of the band.
   */
  button({ controls, labelledBy, part, tips }: FoldButtonOptions): JSX.Element {
    return (
      <button
        type="button"
        class={FOLD_BUTTON}
        part={part}
        aria-expanded={this.isOpen() ? "true" : "false"}
        aria-controls={controls}
        aria-labelledby={labelledBy}
        title={this.isOpen() ? tips.fold : tips.unfold}
      >
        {Fold.chevron()}
      </button>
    )
  }

  /**
   * The fold chevron every `<epic-*>` fold draws:  a right-pointing stroke, turned down by its sheet while open.
   * - Where:  an item's line, Choices, an answered question's option panels, More Details, Original Discussion,
   *   a card's fold button
   * - Drawn here, not from an icon pack:  on screen in the first frame,
   *   and its box is exactly its 16-unit view box, so it centres where its sheet puts it.
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
   * The collapse-all button:  the double up-chevron beside an open title's fold chevron,
   * which folds everything under it, the title itself staying open
   * (Owen, 2026-10-10:  "Add collapse all buttons to the headers ... It should close everything underneath it").
   * - Whose:  a section's, a phase's, an item's, the page toolbar's
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

  /**
   * The box of a title row's ACTIONS SLOT (`Fold.types.ts`):  the page's own buttons there
   * (`<ui-button slot="actions">`), and the docs runtime's bullhorn.
   * - Each element puts it after its title, before its own buttons.
   * - A click in it never folds (`CONTROLS`).
   * - `hidden` while nothing is slotted, so an empty box takes no room:  read where it's drawn, so it follows.
   */
  static actions({ part, hidden }: ActionsBoxOptions): JSX.Element {
    return (
      <span class={ACTIONS_BOX} part={part} hidden={hidden?.()}>
        <slot name={ACTIONS_SLOT} />
      </span>
    )
  }

  /** Expand-all's button, the page toolbar's:  collapse-all's look, its double chevron pointing down. */
  static expandAllButton({ label, part, onCollapse: onExpand }: CollapseAllOptions): JSX.Element {
    return (
      <button type="button" class={COLLAPSE_ALL} part={part} aria-label={label} title={label} onClick={onExpand}>
        <svg class={CHEVRONS} viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4 3.5 8 7.5 12 3.5M4 7.5 8 11.5 12 7.5" />
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
   * A click on the heading band toggles.
   * - on its fold button:  a click, Enter or Space
   * - on any other spot, unless it's a link or another control in the band,
   *   or the end of a drag selecting its words
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
 * Fold everything under `root`:  collapse-all (Owen, 2026-10-10:  "close everything underneath it").
 * - its button:  the double chevron on a section's, phase's or item's title, and the page toolbar's
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

/**
 * Open everything under `root`:  the page toolbar's expand-all (Owen, 2026-10-13:  "Add expand all button next to
 * collapse all").
 * - every section, phase and item inside it, through their own `expand()`:  the cancelable `ui-open`, as a click's
 * - NOT the cards and panels inside them (asides, code, replies ...):  those stay as the reader left them, so an
 *   opened page reads as a list of items, not every aside at once
 * - returns how many it opened
 */
export function expandAllUnder(root: Element): number {
  let opened = 0
  for (const element of root.querySelectorAll("*")) {
    if (!element.localName.startsWith(EPIC_PREFIX)) continue
    const component = (element as Partial<E.DOMElement>).component as { expand?: () => boolean } | undefined
    if (component?.expand?.()) opened++
  }
  return opened
}

/** What `foldAllUnder()` folds:  a component that folds itself (`collapse()`), or one with a box that folds (`fold`). */
type Collapsible = {
  /** fold it as a click would;  true when it was open */
  collapse?: () => boolean
  /** its box's fold */
  fold?: unknown
}

/**
 * The cards and panels that fold by a `Fold`, as an item's children:
 * an open item holding one shows its collapse-all button.
 */
export const FOLDING_CARDS =
  "epic-aside, epic-code, epic-answer, epic-more, epic-reply, epic-status, epic-original, epic-choices, epic-update, epic-note"

/** Tag prefix of the epic page's elements:  only those fold. */
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

/** What `Fold.actions()` takes. */
export type ActionsBoxOptions = {
  /** its `part`:  `actions` in each owner's vocabulary (`ACTIONS_PART_SPEC`), or the owner's own box's */
  part?: string
  /** nothing slotted:  hidden;  a function, read where the box is drawn (tracked) */
  hidden?: () => boolean
}

/** What `fold.button()` takes. */
export type FoldButtonOptions = {
  /** the `id` of the box it folds */
  controls: string
  /** the `id`s of the heading's words, space-separated:  its name */
  labelledBy: string
  /** its `part`:  `toggle` in every card's vocabulary */
  part: string
  /** its tooltip while open (`fold`) and while folded (`unfold`):  the card's `foldTip` / `unfoldTip` texts */
  tips: FoldTips
}

/** A fold button's tooltips, from its card's vocabulary. */
export type FoldTips = {
  /** while open:  `Fold this reply` */
  fold: string
  /** while folded:  `Unfold this reply` */
  unfold: string
}

/** Class of a card's fold button (`fold.button()`):  a click on it always folds. */
export const FOLD_BUTTON = "fold-button"

/** Class word of a heading band that folds its card (it has a body):  a pointer over it (`Fold.css`). */
export const FOLDS = "folds"

/** Class of the box of a title row's `actions` slot (`Fold.actions()`). */
export const ACTIONS_BOX = "slotted-actions"

/**
 * What, on a line or a heading band, acts by itself:  a click there doesn't fold (`<epic-item>`'s line too).
 * - the `actions` slot and its box:  whatever the page put there acts by itself, even a plain `<span>`
 */
export const CONTROLS =
  "a[href], button, input, select, textarea, label, summary, [role='button'], [contenteditable], " +
  `slot[name='${ACTIONS_SLOT}'], .${ACTIONS_BOX}`

/** `Fold.chevron()`'s class. */
const CHEVRON = "chevron"

/** `Fold.collapseAllButton()`'s class. */
const COLLAPSE_ALL = "collapse-all"

/** Its glyph's class. */
const CHEVRONS = "chevrons"
