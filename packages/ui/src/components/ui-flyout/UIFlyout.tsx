import { E, UIT } from "$/ui/core"
// Import the modal's FILE, not its barrel:  a server render loads this class without `customElements` (`index.ts`)
import { DialogComponent } from "$/ui/components/ui-modal/DialogComponent"
import { flyoutVocabulary } from "./UIFlyout.en"

import flyoutCSS from "./UIFlyout.css?inline"

/****************
 * ### `UIFlyout`
 * The component behind `<ui-flyout>`:  Fomantic's flyout, a side modal.
 * A shadow `<dialog class="ui [position] … flyout" part="flyout">` shown with `showModal()`,
 * sliding in from `position` (left by default) over a `::backdrop` dimmer.
 *
 * - Its behaviour is `<ui-modal>`'s, through the shared `DialogComponent` (modal family):
 *   `visible` / `hidden`, `closedby`, the `closable` icon, approve / deny, `--show` / `--close` invoker commands,
 *   `ui-open` / `ui-close` / `ui-show` / `ui-hide`, its name (`aria-label`, `header` or a slotted `<ui-header>`),
 *   `UI.overlays` (kind `flyout`:  scroll lock, keyboard scope, focus restore).
 * - This class adds its names, its looks and the word widths (`thin`, `very wide`, as `<ui-sidebar>` has).
 * - A flyout is always page-level (the top layer);  it never pushes content:
 *   that's `<ui-sidebar>` in a `<ui-pushable>`.
 ****************/
export class UIFlyout extends DialogComponent<Vocabulary> {
  @E.proto static vocabulary = flyoutVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { flyout: flyoutCSS },
    // the sheet's own transition slides it in from `position`'s edge:
    // Fomantic's name for a flyout from the left (the default), the nearest it has
    animation: "fly right"
  } satisfies Partial<E.ElementSetup>
  @E.proto static rootPart = "flyout"
  @E.proto static overlayKind = "flyout" as const
  @E.proto static shownClass = "visible"

  /** A word width (`thin`) goes before the noun (`UIT.WordWidthClasses`), after the shown class. */
  protected get extraClass(): string | undefined {
    const words = [super.extraClass, UIT.WordWidthClasses.classFor(this.width)].filter(Boolean)
    return words.length ? words.join(" ") : undefined
  }

  /** A word width emits nothing through `ClassBuilder`:  its `width` kind only knows columns. */
  protected classValue(name: E.AttributeName<Vocabulary>): unknown {
    if (name === WIDTH && UIT.WordWidthClasses.classFor(this.width)) return undefined
    return super.classValue(name)
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIFlyout extends E.AttributeValues<Vocabulary> {}

/** The flyout's vocabulary type, for brevity. */
type Vocabulary = typeof flyoutVocabulary

/** The attribute taking word widths beside columns. */
const WIDTH = "width"
