import { Show } from "solid-js"
import { Dynamic, isServer, type JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { stepVocabulary } from "./ui-step.vocabulary.en"
import { StepFallback } from "./ui-step.fallback"
import { BOX, CURRENT_STEP, TITLE_PART } from "./ui-step.types"

import partsCSS from "$/ui/components/ui-parts/ui-parts.css?inline"
import stepCSS from "./ui-step.css?inline"

/****************
 * ### `<ui-step>`
 * One step:  `<div class="[color] [keyOnly ...] step" part="step">` -- `<a>` with `href`, a `<button>` with `link`
 * -- holding the icon box, the shorthand content (`header` / `description`), the slot and, once `completed`, a
 * visually hidden "Completed".
 * - Semantics:  the host is a `listitem` (internals) of the group's `<ol>`;  the selected step is the current one,
 *   `aria-current="step"` on the root.  A disabled step is `aria-disabled` (a link keeps its `<a>` without `href`),
 *   a disabled `<button>` is `disabled`:  its dimmed text is an INACTIVE component's (WCAG 1.4.3's exemption),
 *   and assistive tech says so.
 * - `selected` is canonical;  an `active` attribute is Fomantic's word for it, read raw (`attributes`).
 * - Completed:  a check replaces the icon (the `icon` glyph or the slotted `slot=icon`, which stays in the DOM,
 *   hidden);  an ordered step's number turns into a check in CSS.
 * - OWNER of the `content`, `title` and `description` parts (`ownsParts`):  slotted parts style themselves from
 *   `ui-parts.css` (`:state(in-step)`), reading `--_ui-step-state` / `--_ui-step-layout` from this root.  The shorthands
 *   are the same parts drawn here with their static `in-step` classes, which is why the step adopts `ui-parts.css`.
 * - Group variations (vertical, ordered, stacked, circular ...) arrive as inherited `--_ui-steps-*` tokens from the
 *   `<ui-steps>` root;  `ui-step.css` reads them (see its header).
 ****************/
export class UIStep extends E.UIElement<typeof stepVocabulary> {
  @E.proto static vocabulary = stepVocabulary
  @E.proto static styleSheets = { step: stepCSS, parts: partsCSS }
  @E.proto static elementSetup = { Fallback: StepFallback }

  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
    super(...args)
    // SIDE EFFECT:  one item of the group's ordered list;  a server render (`$/ui/static`) makes the root an `<li>`
    this.host.internals.role = UIT.LISTITEM
  }

  ////////////////
  // ## State
  ////////////////

  /** The current step:  `selected`, or the `active` alias;  `:state(selected)`. */
  @E.cssState("selected")
  get isSelected(): boolean {
    return this.selected || E.Converters.boolean(this.attributes[UIT.ACTIVE], UIT.ACTIVE)
  }

  /** `completed`:  `:state(completed)`. */
  @E.cssState("completed")
  get isCompleted(): boolean {
    return !!this.completed
  }

  /** Disabled by its attribute;  `:state(disabled)`. */
  @E.cssState("disabled")
  get isDisabled(): boolean {
    return !!this.disabled
  }

  ////////////////
  // ## Content
  ////////////////

  /** Light-DOM slot occupancy. */
  readonly slots = new E.SlotContent(this.host)

  /** Has shorthand content? */
  get hasShorthand(): boolean {
    return !!this.header || !!this.description
  }

  /** Has content (shorthand or slotted):  `:state(content)`. */
  @E.cssState("content")
  get hasContent(): boolean {
    return this.hasShorthand || this.slots.hasContent("")
  }

  ////////////////
  // ## The icon
  ////////////////

  /** Glyph of the `icon` shorthand. */
  readonly iconGlyph = new E.IconGlyph({ owner: this, name: () => this.icon })

  /** Has an icon (shorthand or `icon` slot)? */
  get hasIcon(): boolean {
    return !!this.icon || this.slots.hasContent(this.slotForName("icon"))
  }

  /** The check a completed step shows in place of its icon. */
  readonly checkGlyph = new E.IconGlyph({
    owner: this,
    name: () => (this.completed && this.hasIcon ? CHECK : undefined)
  })

  ////////////////
  // ## Classes
  ////////////////

  /**
   * Extra class words:
   * - `active` for the `active` alias, when `selected` doesn't add it
   * - `ui-<color>` for a coloured step:  the generic colour remap (`colors.css`) keys on `.ui.red` / `.ui-red`, and a
   *   step has no `ui`
   */
  protected get extraClasses(): string | undefined {
    const color = this.color
    const extra = [
      this.isSelected && !this.selected ? UIT.ACTIVE : "",
      color ? `${UIT.COLOR_CLASS_PREFIX}${color}` : ""
    ]
    return extra.filter(Boolean).join(" ") || undefined
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** Root element:  a link, a button (`link`), or a box. */
  get rootTag(): string {
    return this.href ? UIT.ANCHOR_TAG : this.link ? UIT.BUTTON : BOX
  }

  render(): JSX.Element {
    return (
      <Dynamic
        component={this.rootTag}
        class={this.rootClasses}
        part={this.partForName("step")}
        href={this.rootTag === UIT.ANCHOR_TAG && !this.disabled ? this.href : undefined}
        target={this.rootTag === UIT.ANCHOR_TAG ? this.target : undefined}
        type={this.rootTag === UIT.BUTTON ? UIT.BUTTON : undefined}
        disabled={this.rootTag === UIT.BUTTON && this.disabled ? true : undefined}
        aria-disabled={this.rootTag !== UIT.BUTTON && this.disabled ? UIT.TRUE : undefined}
        aria-current={this.isSelected ? CURRENT_STEP : undefined}
      >
        <Show when={this.hasIcon}>
          <span class={UIT.ICON} part={this.partForName("icon")}>
            {/* a server render (`$/ui/static`) swaps the slot for its content, `hidden` and all:  leave it out */}
            <Show when={!(isServer && this.completed)}>
              <slot name={this.slotForName("icon")} hidden={this.completed || undefined}>
                {this.iconGlyph.svg}
              </slot>
            </Show>
            {this.checkGlyph.svg}
          </span>
        </Show>
        <Show when={this.hasShorthand}>
          <div class={this.staticPart(UIT.CONTENT)} part={this.partForName("content")}>
            <Show when={this.header}>
              <div class={this.staticPart(TITLE_PART)} part={this.partForName("title")}>
                {this.header}
              </div>
            </Show>
            <Show when={this.description}>
              <div class={this.staticPart(UIT.DESCRIPTION)} part={this.partForName("description")}>
                {this.description}
              </div>
            </Show>
          </div>
        </Show>
        <slot />
        <Show when={this.completed}>
          <span class={UIT.VISUALLY_HIDDEN}>{this.translationForKey("stepCompleted")}</span>
        </Show>
      </Dynamic>
    )
  }

  /** Classes of a shorthand part:  its noun and the static owner class (`ui-parts.css`), e.g. `title in-step`. */
  private staticPart(noun: string): string {
    return `${noun} ${UIT.PART_STATIC_CLASS_PREFIX}${this.vocabulary.noun}`
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIStep extends E.AttributeValues<typeof stepVocabulary> {}

/** Glyph of a completed step's icon. */
const CHECK = "check"
