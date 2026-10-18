import type { JSX } from "@solidjs/web"

import { E } from "$/spell-solid"

// the fold pieces every `<epic-*>` fold shares:  their files, not `epic-item`'s barrel (which would define it here)
import { Fold } from "$/epics/components/epic-item/Fold"

/****************
 * ### `EpicPanel`
 * Base of the epic page's folded PANELS in prose -- `<epic-aside>`, `<epic-code>`:  a heading that folds a body.
 * - nothing else:  no sticky line, no contents entry (that's `EpicFold`'s, for sections and phases)
 * - The heading is a `<button>`:  the fold chevron, then `heading()`:  folded, ONE line cut with "…", its words the
 *   tooltip;  open, as many lines as it needs (Owen, 2026-10-18:  "ellipsis when collapsed, wrap when expanded").
 *   After it in the row, the `actions` slot (`Fold.actions()`):  the page's own buttons, and the docs runtime's
 *   bullhorn.  The button ends where they start, so a click on one never folds the panel.
 *   The body (`body()`:  the element's children by default) is hidden `until-found` while folded,
 *   so find-in-page reaches it and unfolds it (`Fold`).
 * - Folding is PAGE state, never written to the doc:  folded to start with, unless `startsOpen()` says so.
 * - The DOM element's own `title` would be a browser tooltip over the whole panel:
 *   the wrapper's EMPTY `title` stops it there (T8).
 * - Its shape:  `EpicPanel.css`, which each subclass adopts beside its own sheet (the fill, the heading's type).
 * - Subclasses in other families import THIS file directly, never the `epic-aside` barrel.
 ****************/
export abstract class EpicPanel<V extends E.ComponentVocabulary> extends E.UIComponent<V> {
  @E.protoMerged static elementSetup: Partial<E.ElementSetup> = {
    // a container:  a click on its text must not jump to the fold button
    delegatesFocus: false,
    // `disabled`:  unusable, its fold button too;  `loading`:  the shared spinner
    disabled: "unusable",
    loading: "loader"
  }

  /** Light-DOM slot occupancy:  has it buttons in its `actions` slot? */
  readonly slots = new E.SlotContent(this.domElement)

  /** Open or folded:  as `startsOpen()` says, until the reader toggles it. */
  readonly fold = new Fold(() => this.startsOpen())

  /** Unfolded. */
  @E.cssState("open")
  get isOpen(): boolean {
    return this.fold.isOpen()
  }

  /** Open to start with?  Folded, unless a subclass says otherwise. */
  protected startsOpen(): boolean {
    return false
  }

  /** The heading's words, after the chevron:  text, so a folded heading can carry them as its tooltip. */
  protected abstract heading(): string

  /** What the body shows:  the element's children. */
  protected body(): JSX.Element {
    return <slot />
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("base" as never)} title="">
        <div class={HEAD} part={this.partForName("head" as never)}>
          <button
            type="button"
            class={TOGGLE}
            part={this.partForName("toggle" as never)}
            aria-expanded={this.isOpen ? "true" : "false"}
            aria-controls={BODY_ID}
            title={this.translationForKey((this.isOpen ? "foldTip" : "unfoldTip") as never)}
            onClick={this.fold.toggle}
          >
            {Fold.chevron()}
            {/* folded:  ONE line, cut with "…", its words the tooltip;  open:  it wraps (EpicPanel.css) */}
            <span
              class={HEADING}
              part={this.partForName("heading" as never)}
              title={this.isOpen ? undefined : this.heading()}
            >
              {this.heading()}
            </span>
          </button>
          {Fold.actions({
            part: this.partForName("actions" as never),
            hidden: () => !this.slots.hasContent(this.slotForName("actions" as never))
          })}
        </div>
        <div
          ref={this.fold.watch}
          id={BODY_ID}
          class={BODY}
          part={this.partForName("body" as never)}
          hidden={this.fold.hidden()}
        >
          {this.body()}
        </div>
      </div>
    )
  }
}

/** Class of the title row:  the heading, then the `actions` slot. */
const HEAD = "head"

/** Class of the heading, the `<button>` that folds it. */
const TOGGLE = "toggle"

/** Class of the heading's words. */
const HEADING = "heading"

/** Class of the body. */
const BODY = "body"

/** `id` of the body, which the heading controls. */
const BODY_ID = "body"
