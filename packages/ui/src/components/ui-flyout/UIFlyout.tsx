import { proto, type AttributeName } from "$/ui/core"
import { DialogElement } from "$/ui/components/ui-modal/DialogElement"

import { flyoutVocabulary } from "./ui-flyout.vocabulary.en"
import { FlyoutFallback } from "./ui-flyout.fallback"
import { FLYOUT_WORD_WIDTHS, Vocabulary, WIDTH } from "./ui-flyout.types"

import flyoutCSS from "./ui-flyout.css?inline"

/****************
 * ### `<ui-flyout>`
 * Fomantic's flyout -- a side modal:  a shadow `<dialog class="ui [position] ... flyout" part="flyout">` shown with
 * `showModal()`, sliding in from `position` (left by default) over a `::backdrop` dimmer.
 * - Behaviour is `<ui-modal>`'s, through the shared `DialogElement` (modal family):  `open`, `closedby`, the
 *   `closable` icon, approve / deny, `--show` / `--close` invoker commands, `ui-open` / `ui-close` / `ui-show` /
 *   `ui-hide`, naming by `aria-label` / `header` / a slotted `<ui-header>`, `UI.overlays` (kind `flyout`:  scroll
 *   lock, keyboard scope, focus restore).  This class adds its names, looks and word widths.
 * - A flyout is always page-level (the top layer);  it never pushes content -- that's `<ui-sidebar>` in a
 *   `<ui-pushable>`.
 ****************/
export class UIFlyout extends DialogElement<Vocabulary> {
  @proto static vocabulary = flyoutVocabulary
  @proto static styles = { flyout: flyoutCSS }
  @proto static Fallback = FlyoutFallback
  @proto static rootPart = "flyout"
  @proto static overlayKind = "flyout" as const

  /** A word width (`thin`) goes after the noun;  `ClassBuilder`'s `width` kind only knows columns. */
  protected extraClasses(): string | undefined {
    return UIFlyout.wordWidth(this.attrs.width)
  }

  protected classValue(name: AttributeName<Vocabulary>): unknown {
    if (name === WIDTH && UIFlyout.wordWidth(this.attrs.width)) return undefined
    return super.classValue(name)
  }

  /** `width` when it's one of Fomantic's words (spaces or dashes), else `undefined`. */
  static wordWidth(width: string | number | undefined): string | undefined {
    const text = typeof width === "string" ? width.trim().replace(/[\s-]+/g, " ") : undefined
    return FLYOUT_WORD_WIDTHS.find((word) => word === text)
  }
}
