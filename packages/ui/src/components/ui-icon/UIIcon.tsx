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
  @E.proto static styleSheets = { icon: iconCSS }
  @E.proto static elementSetup = { Fallback: IconFallback }

  /** `<ui-icons>` parent, if any. */
  readonly context = new E.PartContext({ host: this.host, noun: this.vocabulary.noun, isDirect: true })

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

  /** SIDE EFFECT:  the host's accessible name follows `label`. */
  @E.onChange("label", { writesHost: true })
  protected onLabelChanged(label: string | undefined) {
    IconLabels.applyTo(this.host.internals, label)
  }

  ////////////////
  // ## States
  ////////////////

  /**
   * Dimmed (`disabled`):  `:state(disabled)`.
   * - Not `isDisabled`:  that would make the host swallow clicks, which an icon never did.
   */
  @E.cssState("disabled")
  get looksDisabled(): boolean {
    return this.disabled
  }

  /** Spinning (`loading`):  `:state(loading)`. */
  @E.cssState("loading")
  get isLoading(): boolean {
    return this.loading
  }

  render(): JSX.Element {
    return (
      <span class={this.rootClasses} part={this.partForName("icon")}>
        {this.iconGlyph.svg}
      </span>
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIIcon extends E.AttributeValues<typeof iconVocabulary> {}

/** What `outline` appends to the name (Fomantic's `bell outline`). */
const OUTLINE_SUFFIX = " outline"
