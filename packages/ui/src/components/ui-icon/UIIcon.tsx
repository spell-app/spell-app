import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { iconVocabulary } from "./ui-icon.vocabulary.en"
import { IconFallback } from "./ui-icon.fallback"
import { IconLabels } from "./ui-icon.types"

import iconCSS from "./ui-icon.css?inline"

/****************
 * ### `<ui-icon>`
 * An SVG glyph:  `<span class="ui … icon" part="icon"><svg aria-hidden></span>`, from the page's icon packs
 * (`UI.icons`).
 * - Host is `display: contents`:  the span IS the inline box, where Fomantic's `<i class="icon">` sat.
 * - Accessible name on the HOST, through internals (`IconLabels`):  `label` => `role=img` + `aria-label`;  none =>
 *   `aria-hidden`, a decorative glyph.
 * - `:state(in-icons)` when its flat-tree parent is a `<ui-icons>` (`PartContext`, direct mode):  `ui-icon.css`
 *   stacks and positions it by that, since the group can't reach into its children's shadow roots.
 * - `name` is the whole name:  `bell`, `bell outline`, `lucide:bell`.  `outline` appends ` outline`
 *   (Fomantic's `bell outline icon` spelling), so `<ui-icon name="bell" outline>` ~== `name="bell outline"`.
 ****************/
export class UIIcon extends E.UIElement<typeof iconVocabulary> {
  @E.proto static vocabulary = iconVocabulary
  @E.proto static styles = { icon: iconCSS }
  @E.proto static Fallback = IconFallback

  /** `<ui-icons>` parent, if any. */
  readonly context = new E.PartContext(this.host, this.vocabulary.noun, { direct: true })

  /** The glyph for `name` (+ `outline`). */
  readonly glyph = new E.IconGlyph(this, () => this.iconName())

  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
    super(...args)
    const { internals } = this.host
    // SIDE EFFECT:  the host's accessible name follows `label`
    this.hostEffect(
      () => this.attrs.label,
      (label) => IconLabels.applyTo(internals, label)
    )
  }

  protected hostStates() {
    return { disabled: this.attrs.disabled, loading: this.attrs.loading }
  }

  render(): JSX.Element {
    return (
      <span class={this.classes()} part={this.part("icon")}>
        {this.glyph.svg()}
      </span>
    )
  }

  /** The name to look up:  `name`, plus ` outline` for the `outline` attribute;  tracked. */
  private iconName(): string | undefined {
    const name = this.attrs.name
    return name && this.attrs.outline ? `${name}${OUTLINE_SUFFIX}` : name
  }
}

/** What `outline` appends to the name (Fomantic's `bell outline`). */
const OUTLINE_SUFFIX = " outline"
