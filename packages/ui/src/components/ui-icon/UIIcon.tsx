import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { iconVocabulary } from "./UIIcon.en"
import { IconLabels } from "./UIIcon.types"

import iconCSS from "./UIIcon.css?inline"

/****************
 * ### `UIIcon`
 * The component behind `<ui-icon>`:  an SVG glyph from the page's icon packs (`UI.icons`).
 *
 * - Its shadow DOM is one box, `<span class="ui … icon" part="icon"><svg aria-hidden></span>`.
 *   The element is `display: contents`:  the span IS the inline box, where Fomantic's `<i class="icon">` sat.
 * - The accessible name is on the ELEMENT, through `internals` (`IconLabels`):
 *   `label` => `role=img` + `aria-label`;  none => `aria-hidden`, a decorative glyph.
 * - `:state(in-icons)` when its flat-tree parent is a `<ui-icons>` (`PartContext`, direct mode):
 *   `UIIcon.css` stacks and positions it by that, since the group can't reach into its children's shadow roots.
 * - `name` is the whole name:  `bell`, `bell outline`, `lucide:bell`.
 *   `outline` appends ` outline` (Fomantic's `bell outline icon` spelling),
 *   so `<ui-icon name="bell" outline>` ~== `name="bell outline"`.
 ****************/
// `disabled` is only a look, not `isDisabled`:  the element still takes clicks
@E.cssStates("disabled", "loading")
export class UIIcon extends E.UIComponent<typeof iconVocabulary> {
  @E.proto static vocabulary = iconVocabulary
  @E.protoMerged static elementSetup = { styleSheets: { icon: iconCSS } } satisfies Partial<E.ElementSetup>

  /** Its `<ui-icons>` parent, if any. */
  readonly context = new E.PartContext({ domElement: this.domElement, noun: this.vocabulary.noun, isDirect: true })

  ////////////////
  // ## The glyph
  ////////////////

  /** The glyph for `name` (+ `outline`). */
  readonly iconGlyph = new E.IconGlyph({ owner: this, name: () => this.iconName })

  /** The name to look up:  `name`, plus ` outline` for the `outline` attribute;  tracked. */
  private get iconName(): string | undefined {
    const name = this.name
    return name && this.outline ? `${name}${OUTLINE_SUFFIX}` : name
  }

  ////////////////
  // ## Label
  ////////////////

  /** SIDE EFFECT:  the element's accessible name follows `label`. */
  @E.onChange("label", { writesDOMElement: true })
  protected onLabelChanged(label: string | undefined) {
    IconLabels.applyTo(this.domElement.internals, label)
  }

  render(): JSX.Element {
    return (
      <span class={this.rootClass} part={this.partForName("icon")}>
        {this.iconGlyph.svg}
      </span>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIIcon extends E.AttributeValues<typeof iconVocabulary> {}

/** What `outline` appends to the name (Fomantic's `bell outline`). */
const OUTLINE_SUFFIX = " outline"
