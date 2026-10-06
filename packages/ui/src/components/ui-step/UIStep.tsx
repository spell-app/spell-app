import { Show, createMemo } from "solid-js"
import { Dynamic, isServer, type JSX } from "@solidjs/web"

import { Converters, HostAttribute, IconGlyph, proto, SlotContent, UIElement } from "$/ui/core"

import { stepVocabulary } from "./ui-step.vocabulary.en"
import { StepFallback } from "./ui-step.fallback"

import stepCSS from "./ui-step.css?inline"
import partsCSS from "$/ui/components/ui-parts/ui-parts.css?inline"
import { CHECK, BOX, STEP, CONTENT, TITLE, DESCRIPTION, COLOR_CLASS_PREFIX } from "./ui-step.types"
import { ACTIVE, BUTTON, TRUE, ICON, VISUALLY_HIDDEN, LINK, LISTITEM } from "$/ui/components/components.types"

/****************
 * ### `<ui-step>`
 * One step:  `<div class="[color] [keyOnly ...] step" part="step">` -- `<a>` with `href`, a `<button>` with `link`
 * -- holding the icon box, the shorthand content (`header` / `description`), the slot and, once `completed`, a
 * visually hidden "Completed".
 * - Semantics:  the host is a `listitem` (internals) of the group's `<ol>`;  the selected step is the current one,
 *   `aria-current="step"` on the root.  A disabled step is `aria-disabled` (a link keeps its `<a>` without `href`),
 *   a disabled `<button>` is `disabled`:  its dimmed text is an INACTIVE component's (WCAG 1.4.3's exemption),
 *   and assistive tech says so.
 * - `selected` is canonical;  an `active` attribute is Fomantic's word for it, read through `HostAttribute`.
 * - Completed:  a check replaces the icon (the `icon` glyph or the slotted `slot=icon`, which stays in the DOM,
 *   hidden);  an ordered step's number turns into a check in CSS.
 * - OWNER of the `content`, `title` and `description` parts (`ownsParts`):  slotted parts style themselves from
 *   `ui-parts.css` (`:state(in-step)`), reading `--_ui-step-state` / `--_ui-step-layout` from this root.  The shorthands
 *   are the same parts drawn here with their static `in-step` classes, which is why the step adopts `ui-parts.css`.
 * - Group variations (vertical, ordered, stacked, circular ...) arrive as inherited `--_ui-steps-*` tokens from the
 *   `<ui-steps>` root;  `ui-step.css` reads them (see its header).
 ****************/
export class UIStep extends UIElement<typeof stepVocabulary> {
  @proto static vocabulary = stepVocabulary
  @proto static styles = { step: stepCSS, parts: partsCSS }
  @proto static Fallback = StepFallback

  /** Light-DOM slot occupancy. */
  readonly slots = new SlotContent(this.host)

  /** Fomantic's `active` attribute, an alias of `selected`. */
  readonly activeAttribute = new HostAttribute(this.host, ACTIVE)

  /** Glyph of the `icon` shorthand. */
  readonly glyph = new IconGlyph(this, () => this.attrs.icon)

  ////////////////
  // ## Derived state
  ////////////////

  /** The current step:  `selected`, or the `active` alias. */
  readonly isSelected = createMemo(
    () => this.attrs.selected || Converters.boolean(this.activeAttribute.get() ?? undefined, ACTIVE)
  )

  /** Has an icon (shorthand or `icon` slot)? */
  readonly hasIcon = createMemo(() => !!this.attrs.icon || this.slots.has(this.slot("icon")))

  /** Has shorthand content? */
  readonly hasShorthand = createMemo(() => !!this.attrs.header || !!this.attrs.description)

  /** The check a completed step shows in place of its icon;  after `hasIcon`, which it reads at once. */
  readonly checkGlyph = new IconGlyph(this, () => (this.attrs.completed && this.hasIcon() ? CHECK : undefined))

  /** Root element:  a link, a button (`link`), or a box. */
  readonly tag = createMemo(() => (this.attrs.href ? LINK : this.attrs.link ? BUTTON : BOX))

  constructor(...args: ConstructorParameters<typeof UIElement>) {
    super(...args)
    // SIDE EFFECT:  one item of the group's ordered list;  a server render (`$/ui/static`) makes the root an `<li>`
    this.host.internals.role = LISTITEM
  }

  isDisabled(): boolean {
    return this.attrs.disabled
  }

  /**
   * Extra class words:
   * - `active` for the `active` alias, when `selected` doesn't add it
   * - `ui-<color>` for a coloured step:  the generic colour remap (`colors.css`) keys on `.ui.red` / `.ui-red`, and a
   *   step has no `ui`
   */
  protected extraClasses(): string | undefined {
    const color = this.attrs.color
    const extra = [
      this.isSelected() && !this.attrs.selected ? ACTIVE : "",
      color ? `${COLOR_CLASS_PREFIX}${color}` : ""
    ]
    return extra.filter(Boolean).join(" ") || undefined
  }

  protected hostStates() {
    return {
      selected: this.isSelected(),
      completed: this.attrs.completed,
      disabled: this.attrs.disabled,
      content: this.hasShorthand() || this.slots.has("")
    }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    const { attrs } = this
    return (
      <Dynamic
        component={this.tag()}
        class={this.classes()}
        part={this.part("step")}
        href={this.tag() === LINK && !attrs.disabled ? attrs.href : undefined}
        target={this.tag() === LINK ? attrs.target : undefined}
        type={this.tag() === BUTTON ? BUTTON : undefined}
        disabled={this.tag() === BUTTON && attrs.disabled ? true : undefined}
        aria-disabled={this.tag() !== BUTTON && attrs.disabled ? TRUE : undefined}
        aria-current={this.isSelected() ? STEP : undefined}
      >
        <Show when={this.hasIcon()}>
          <span class={ICON} part={this.part("icon")}>
            {/* a server render (`$/ui/static`) swaps the slot for its content, `hidden` and all:  leave it out */}
            <Show when={!(isServer && attrs.completed)}>
              <slot name={this.slot("icon")} hidden={attrs.completed || undefined}>
                {this.glyph.svg()}
              </slot>
            </Show>
            {this.checkGlyph.svg()}
          </span>
        </Show>
        <Show when={this.hasShorthand()}>
          <div class={CONTENT} part={this.part("content")}>
            <Show when={attrs.header}>
              <div class={TITLE} part={this.part("title")}>
                {attrs.header}
              </div>
            </Show>
            <Show when={attrs.description}>
              <div class={DESCRIPTION} part={this.part("description")}>
                {attrs.description}
              </div>
            </Show>
          </div>
        </Show>
        <slot />
        <Show when={attrs.completed}>
          <span class={VISUALLY_HIDDEN}>{this.text("stepCompleted")}</span>
        </Show>
      </Dynamic>
    )
  }
}
