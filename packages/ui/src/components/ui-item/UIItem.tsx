import { Show, createEffect, createMemo, untrack } from "solid-js"
import { Dynamic, type JSX } from "@solidjs/web"

import {
  Converters,
  HostAttribute,
  IconGlyph,
  PartContext,
  proto,
  RUNTIME_KEY,
  SlotContent,
  UI,
  UIElement,
  type AttributeName,
  type ConditionalOwner,
  type RuntimeGlobal,
  type UIHost,
  UIT
} from "$/ui/core"

import { itemVocabulary } from "./ui-item.vocabulary.en"
import { ItemFallback } from "./ui-item.fallback"

import itemCSS from "./ui-item.css?inline"
import { DIVIDER, COLOR_CLASS_PREFIX, DIV, SEPARATOR, IMAGE_CLASS, type RootTag } from "./ui-item.types"

/****************
 * ### `<ui-item>`
 * ONE generic item for every owner that has items -- Fomantic's `.item` is shared by dropdown, list and menu --
 * rendered by OWNER context (`PartContext`), never `ui-list-item` / `ui-menu-item`.
 * - No owner (a dropdown option, or loose):  renders only `<slot>`.  A dropdown reads its items as DATA
 *   (`SlottedItems`) and draws its own `.item[role=option]` rows;  a RICH item is projected into its row, where
 *   this slot shows the content live.  The dropdown is a barrier, so its items never find an outer menu.
 * - Owned (`<ui-list>`, `<ui-menu>`:  their vocabularies `ownsParts` `item`):  asks the owner's controller for an
 *   `ItemContext` (`ItemOwner.itemContext()`, tracked) and renders the item box, in order:
 *   `<a class="[color] [position] [keyOnly ...] item" part="item" href>` (with `href`), a `<button type="button">`
 *   (`link`, or the owner says items are interactive), or a `<div>`;  a `type="header"` item is a `<div class="item
 *   header">`, a `divider` a `<div class="divider" role="separator">`.  Inside:  the `image` shorthand's
 *   `<img class="ui avatar image" part="image" alt="">`, the icon box (`icon` shorthand or `icon` slot), the slot.
 * - Styles:  `ui-item.css` (host, generic resets) + the OWNER'S sheets (its `styles`), which hold the item rules
 *   keyed on `:host(:state(in-list)) > .item` beside the static `.ui.list > .item`.  They're registered here if
 *   the owner hasn't yet, and re-adopted when the owner changes.
 * - Semantics:  host role from the owner (`listitem`);  root role from the owner (`menuitem` in a menubar);
 *   selected => `aria-current` (the owner's value, `page`, on a link;  `true` otherwise);  the host's
 *   `aria-label` names the box (an icon-only item).
 * - `active` is an ALIAS of `selected` (Fomantic's word), read from the host attribute.
 * - A part (`isPart`):  transparent to other parts' climbs, so a `<ui-header>` inside an item in a list is the
 *   LIST's header (`.ui.list > .item > .content > .header`).
 * - Except in the Items view (`<ui-items>`):  there the owner's `ItemContext.ownsParts` makes the item OWN its
 *   content parts (`ConditionalOwner`, `ownsPart()`), so they get `:state(in-item)` -- Fomantic's
 *   `.ui.items > .item > .content > .header`.  Its `image` shorthand takes the owner's `imageClass`.
 ****************/
export class UIItem extends UIElement<typeof itemVocabulary> implements ConditionalOwner {
  @proto static vocabulary = itemVocabulary
  @proto static styles = { item: itemCSS }
  @proto static Fallback = ItemFallback
  @proto static isPart = true

  /** Owner (list, menu), if any. */
  readonly context = new PartContext(this.host, this.vocabulary.noun)

  /** Light-DOM slot occupancy. */
  readonly slots = new SlotContent(this.host)

  /** Host `active` attribute:  the alias of `selected`. */
  readonly activeAttribute = new HostAttribute(this.host, UIT.ACTIVE)

  /** Host `aria-label`, forwarded to the item box:  an icon-only item needs a name. */
  readonly ariaLabel = new HostAttribute(this.host, UIT.ARIA_LABEL)

  ////////////////
  // ## Derived state
  ////////////////

  /** Owner's controller, when it renders items (`ItemOwner`). */
  readonly owner = createMemo(() => {
    const controller = (this.context.owner.get()?.owner as UIHost | undefined)?.controller
    return controller && "itemContext" in controller ? (controller as UIElement & UIT.ItemOwner) : undefined
  })

  /** What the owner wants, or `undefined` when unowned (data only).  Tracked. */
  readonly itemContext = createMemo<UIT.ItemContext | undefined>(() => this.owner()?.itemContext(this.host))

  /** `selected`, or its alias `active`. */
  readonly isSelected = createMemo(
    () => this.attrs.selected || Converters.boolean(this.activeAttribute.get() ?? undefined, UIT.ACTIVE)
  )

  /** Root element:  link, button, or plain box. */
  readonly tag = createMemo((): RootTag => {
    const context = this.itemContext()
    if (this.attrs.type !== UIT.ITEM) return DIV
    if (this.attrs.href) return UIT.LINK
    return this.attrs.link || context?.interactive ? UIT.BUTTON : DIV
  })

  /** Glyph of the `icon` shorthand;  only loaded once rendered by an owner. */
  readonly glyph = new IconGlyph(this, () => (this.itemContext() ? this.attrs.icon : undefined))

  /** Has an icon (shorthand or `icon` slot)? */
  readonly hasIcon = createMemo(() => !!this.attrs.icon || this.slots.has(this.slot("icon")))

  /** `image` as a URL. */
  readonly imageSrc = createMemo(() => this.attrs.image?.trim() || undefined)

  /** The rendered item box, while owned. */
  private boxElement: HTMLElement | undefined

  constructor(...args: ConstructorParameters<typeof UIElement>) {
    super(...args)
    // SIDE EFFECT:  host role follows the owner (`listitem` in a list)
    createEffect(
      () => this.itemContext()?.hostRole ?? null,
      (role) => {
        this.host.internals.role = role
      }
    )
  }

  /**
   * The item box (`<a>` / `<button>` / `<div>` in the shadow root), or `undefined` while unowned -- what an owner
   * moves focus between (a menubar's roving tabindex:  the host stays untabbable, so assistive tech and axe see
   * the owner's role pattern through it).
   */
  get focusTarget(): HTMLElement | undefined {
    return this.boxElement?.isConnected ? this.boxElement : undefined
  }

  isDisabled(): boolean {
    return this.attrs.disabled
  }

  /**
   * `ConditionalOwner`:  does this item own its content parts now?  Only when its owner's `ItemContext` says so
   * (the Items view).
   * - Reads the DOM (`PartContext.resolve()`), untracked:  other parts ask during their climbs, right after moves,
   *   before this item's own `owner` signal has landed.
   */
  ownsPart(): boolean {
    const controller = (this.context.resolve()?.owner as UIHost | undefined)?.controller
    if (!controller || !("itemContext" in controller)) return false
    return !!untrack(() => (controller as UIElement & UIT.ItemOwner).itemContext(this.host)).ownsParts
  }

  protected classValue(name: AttributeName<typeof itemVocabulary>): unknown {
    return name === UIT.SELECTED ? this.isSelected() : super.classValue(name)
  }

  /**
   * `header` for a header item;  `ui-<color>` for a coloured one -- the generic colour remap (`colors.css`) keys on
   * `.ui.red` / `.ui-red`, and an item has no `ui`.
   */
  protected extraClasses(): string | undefined {
    const color = this.attrs.color
    const extra = [this.attrs.type === UIT.HEADER ? UIT.HEADER : "", color ? `${COLOR_CLASS_PREFIX}${color}` : ""]
    return extra.filter(Boolean).join(" ") || undefined
  }

  protected hostStates() {
    return { selected: this.isSelected(), disabled: this.attrs.disabled }
  }

  /** `ui-item.css`, then the owner's sheets (registered here if the owner hasn't yet).  Tracked. */
  protected sheetNames(): string[] {
    const names = Object.keys(this.styles)
    const styles = this.owner()?.styles ?? {}
    const loaded = !!(globalThis as RuntimeGlobal)[RUNTIME_KEY]
    for (const [name, css] of Object.entries(styles)) {
      if (loaded && !UI.styles.has(name)) UI.styles.register(name, css)
      names.push(name)
    }
    return names
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** The slot alone (unowned), a divider, or the item box. */
  render(): JSX.Element {
    return (
      <Show when={this.itemContext()} fallback={<slot />}>
        <Show
          when={this.attrs.type !== DIVIDER}
          fallback={<div class={DIVIDER} part={this.part("item")} role={SEPARATOR} />}
        >
          {this.box()}
        </Show>
      </Show>
    )
  }

  /** The owned item box, around the default slot. */
  private box(): JSX.Element {
    const disabledButton = () => this.tag() === UIT.BUTTON && this.attrs.disabled
    return (
      <Dynamic
        ref={(element: HTMLElement) => (this.boxElement = element)}
        component={this.tag()}
        class={this.classes()}
        part={this.part("item")}
        href={this.tag() === UIT.LINK && !this.attrs.disabled ? this.attrs.href : undefined}
        target={this.tag() === UIT.LINK ? this.attrs.target : undefined}
        type={this.tag() === UIT.BUTTON ? UIT.BUTTON : undefined}
        role={this.attrs.type === UIT.ITEM ? this.itemContext()?.role : undefined}
        disabled={disabledButton() && !this.itemContext()?.role ? true : undefined}
        aria-disabled={this.attrs.disabled && !(disabledButton() && !this.itemContext()?.role) ? "true" : undefined}
        aria-current={this.current()}
        aria-label={this.ariaLabel.get() ?? undefined}
        data-value={this.attrs.value}
      >
        <Show when={this.imageSrc()}>
          <img
            class={this.itemContext()?.imageClass ?? IMAGE_CLASS}
            part={this.part("image")}
            src={this.imageSrc()}
            alt=""
          />
        </Show>
        <Show when={this.hasIcon()}>
          <span class={UIT.ICON} part={this.part("icon")}>
            <slot name={this.slot("icon")}>{this.glyph.svg()}</slot>
          </span>
        </Show>
        <slot />
      </Dynamic>
    )
  }

  /** `aria-current` while selected:  the owner's value on a link (`page`), else `true`. */
  private current(): UIT.ItemContext["current"] | undefined {
    if (!this.isSelected() || this.attrs.type !== UIT.ITEM) return undefined
    return this.tag() === UIT.LINK ? (this.itemContext()?.current ?? UIT.PAGE) : UIT.TRUE
  }
}
