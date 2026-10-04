import type { JSX } from "@solidjs/web"

import { IconGlyph, PartContext, proto, UIElement, UIT } from "$/ui/core"

import { iconVocabulary } from "./ui-icon.vocabulary.en"
import { IconFallback } from "./ui-icon.fallback"

import iconCSS from "./ui-icon.css?inline"
import { OUTLINE } from "./ui-icon.types"

/****************
 * ### `<ui-icon>`
 * An SVG glyph:  `<span class="ui … icon" part="icon"><svg aria-hidden></span>`, from the page's icon packs
 * (`UI.icons`).
 * - Host is `display: contents`:  the span IS the inline box, where Fomantic's `<i class="icon">` sat.
 * - Accessible name on the HOST, through internals:  `label` => `role=img` + `aria-label`;  none =>
 *   `aria-hidden`, a decorative glyph.
 * - `:state(in-icons)` when its flat-tree parent is a `<ui-icons>` (`PartContext`, direct mode):  `ui-icon.css`
 *   stacks and positions it by that, since the group can't reach into its children's shadow roots.
 * - `name` is the whole name:  `bell`, `bell outline`, `lucide:bell`.  `outline` appends ` outline`
 *   (Fomantic's `bell outline icon` spelling), so `<ui-icon name="bell" outline>` ~== `name="bell outline"`.
 ****************/
export class UIIcon extends UIElement<typeof iconVocabulary> {
  @proto static vocabulary = iconVocabulary
  @proto static styles = { icon: iconCSS }
  @proto static Fallback = IconFallback

  /** `<ui-icons>` parent, if any. */
  readonly context = new PartContext(this.host, this.vocabulary.noun, { direct: true })

  /** The glyph for `name` (+ `outline`). */
  readonly glyph = new IconGlyph(this, () => this.iconName())

  constructor(...args: ConstructorParameters<typeof UIElement>) {
    super(...args)
    const { internals } = this.host
    this.hostEffect(
      () => this.attrs.label,
      (label) => {
        internals.role = label ? UIT.IMG : null
        internals.ariaLabel = label ?? null
        internals.ariaHidden = label ? null : UIT.TRUE
      }
    )
  }

  protected hostStates() {
    return { disabled: this.attrs.disabled, loading: this.attrs.loading }
  }

  /** The name to look up:  `name`, plus ` outline` for the `outline` attribute;  tracked. */
  private iconName(): string | undefined {
    const name = this.attrs.name
    return name && this.attrs.outline ? `${name}${OUTLINE}` : name
  }

  render(): JSX.Element {
    return (
      <span class={this.classes()} part={this.part("icon")}>
        {this.glyph.svg()}
      </span>
    )
  }
}
