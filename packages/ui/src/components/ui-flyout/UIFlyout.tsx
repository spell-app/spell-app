import { E, UIT } from "$/ui/core"
// Import the modal's FILE, not its barrel:  a server render loads this class without `customElements` (`index.ts`)
import { DialogElement } from "$/ui/components/ui-modal/DialogElement"
import { FlyoutFallback } from "./ui-flyout.fallback"
import { WIDTH, type Vocabulary } from "./ui-flyout.types"
import { flyoutVocabulary } from "./ui-flyout.vocabulary.en"

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
  @E.proto static vocabulary = flyoutVocabulary
  @E.proto static styleSheets = { flyout: flyoutCSS }
  @E.proto static elementSetup = { Fallback: FlyoutFallback }
  @E.proto static rootPart = "flyout"
  @E.proto static overlayKind = "flyout" as const

  /** A word width (`thin`) goes after the noun (`UIT.WordWidthClasses`). */
  protected get extraClasses(): string | undefined {
    return UIT.WordWidthClasses.classFor(this.width)
  }

  /** A word width emits nothing through `ClassBuilder`:  its `width` kind only knows columns. */
  protected classValue(name: E.AttributeName<Vocabulary>): unknown {
    if (name === WIDTH && UIT.WordWidthClasses.classFor(this.width)) return undefined
    return super.classValue(name)
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIFlyout extends E.AttributeValues<Vocabulary> {}
