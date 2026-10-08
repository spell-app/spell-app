import { Show, untrack } from "solid-js"
import { Dynamic, isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { itemVocabulary } from "./ui-item.vocabulary.en"
import { ItemFallback } from "./ui-item.fallback"

import itemCSS from "./ui-item.css?inline"

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
 * - Styles:  `ui-item.css` (host, generic resets) + the OWNER'S sheets (its `styleSheets`), which hold the item rules
 *   keyed on `:host(:state(in-list)) > .item` beside the static `.ui.list > .item`.  They're registered here if
 *   the owner hasn't yet, and re-adopted when the owner changes.
 * - Semantics:  host role from the owner (`listitem`);  root role from the owner (`menuitem` in a menubar);
 *   selected => `aria-current` (the owner's value, `page`, on a link;  `true` otherwise);  the host's
 *   `aria-label` names the box (an icon-only item);  its `aria-expanded` goes to a `<button>` box (a disclosure:  a
 *   menu item that opens a group below it).
 * - `active` is an ALIAS of `selected` (Fomantic's word), read from the host attribute.
 * - A part (`elementSetup.isAPart`):  transparent to other parts' climbs,
 *   so a `<ui-header>` inside an item in a list is the LIST's header (`.ui.list > .item > .content > .header`).
 * - Except in the Items view (`<ui-items>`):  there the owner's `ItemContext.ownsParts` makes the item OWN its
 *   content parts (`ConditionalOwner`, `isOwnerOf()`), so they get `:state(in-item)` -- Fomantic's
 *   `.ui.items > .item > .content > .header`.  Its `image` shorthand takes the owner's `imageClass`.
 ****************/
export class UIItem extends E.UIElement<typeof itemVocabulary> implements E.ConditionalOwner {
  @E.proto static vocabulary = itemVocabulary
  @E.proto static styleSheets = { item: itemCSS }
  @E.proto static elementSetup = { Fallback: ItemFallback, isAPart: true }

  ////////////////
  // ## Owner
  ////////////////

  /** Owner (list, menu), if any. */
  readonly context = new E.PartContext({ host: this.host, noun: this.vocabulary.noun })

  /** Owner's controller, when it renders items (`ItemOwner`). */
  get owner(): Required<ItemOwnerController> | undefined {
    const controller = this.context.ownerController<ItemOwnerController>()
    return controller?.itemContext ? (controller as Required<ItemOwnerController>) : undefined
  }

  /**
   * What the owner wants, or `undefined` when unowned (data only).
   * - `@derived`:  the owner's `itemContext()` has a SIDE EFFECT (a menu records the item and queues a refresh), so
   *   it runs once per change, not per read.
   */
  @E.derived
  get itemContext(): UIT.ItemContext | undefined {
    return this.owner?.itemContext(this.host)
  }

  /** The host role follows the owner (`listitem` in a list). */
  @E.onChange("itemContext", { writesHost: true })
  protected onItemContextChanged(context: UIT.ItemContext | undefined) {
    this.host.internals.role = context?.hostRole ?? null
  }

  /**
   * `ConditionalOwner`:  does this item own its content parts (any noun) now?  Only when its owner's `ItemContext`
   * says so (the Items view).
   * - Reads the DOM (`PartContext.resolve()`), untracked:  other parts ask during their climbs, right after moves,
   *   before this item's own `owner` has landed.
   */
  isOwnerOf(): boolean {
    const owner = E.PartContext.controllerFor<ItemOwnerController>(this.context.resolve())
    return !!owner?.itemContext && !!untrack(() => owner.itemContext!(this.host)).ownsParts
  }

  /** `ui-item.css`, then the owner's sheets (registered here if the owner hasn't yet). */
  get styleSheetNames(): string[] {
    const names = Object.keys(this.styleSheets)
    const styles = this.owner?.styleSheets ?? {}
    const isLoaded = !!(globalThis as E.RuntimeGlobal)[E.RUNTIME_KEY]
    for (const [name, css] of Object.entries(styles)) {
      if (isLoaded && !UI.styles.has(name)) UI.styles.register(name, css)
      names.push(name)
    }
    return names
  }

  ////////////////
  // ## Selected and disabled
  ////////////////

  /** `selected`, or its alias, the host's `active` attribute. */
  @E.cssState("selected")
  get isSelected(): boolean {
    return this.selected || E.Converters.boolean(this.attributes[UIT.ACTIVE], UIT.ACTIVE)
  }

  @E.cssState("disabled")
  get isDisabled(): boolean {
    return this.disabled
  }

  protected classValue(name: E.AttributeName<typeof itemVocabulary>): unknown {
    return name === UIT.SELECTED ? this.isSelected : super.classValue(name)
  }

  /** `aria-current` while selected:  the owner's value on a link (`page`), else `true`. */
  private get ariaCurrent(): UIT.ItemContext["current"] | undefined {
    if (!this.isSelected || this.type !== UIT.ITEM) return undefined
    return this.rootTag === UIT.ANCHOR_TAG ? (this.itemContext?.current ?? UIT.PAGE) : UIT.TRUE
  }

  ////////////////
  // ## The box
  ////////////////

  /** Root element:  link, button, or plain box. */
  get rootTag(): RootTag {
    const context = this.itemContext
    if (this.type !== UIT.ITEM) return DIV
    if (this.href) return UIT.ANCHOR_TAG
    return this.link || context?.interactive ? UIT.BUTTON : DIV
  }

  /** The rendered item box, while owned. */
  private boxElement: HTMLElement | undefined

  /**
   * The item box (`<a>` / `<button>` / `<div>` in the shadow root), or `undefined` while unowned -- what an owner
   * moves focus between (a menubar's roving tabindex:  the host stays untabbable, so assistive tech and axe see
   * the owner's role pattern through it).
   */
  get focusTarget(): HTMLElement | undefined {
    return this.boxElement?.isConnected ? this.boxElement : undefined
  }

  /**
   * `header` for a header item;  `ui-<color>` for a coloured one -- the generic colour remap (`colors.css`) keys on
   * `.ui.red` / `.ui-red`, and an item has no `ui`.
   */
  protected get extraClasses(): string | undefined {
    const color = this.color
    const extra = [this.type === UIT.HEADER ? UIT.HEADER : "", color ? `${UIT.COLOR_CLASS_PREFIX}${color}` : ""]
    return extra.filter(Boolean).join(" ") || undefined
  }

  ////////////////
  // ## Icon and image
  ////////////////

  /** Light-DOM slot occupancy. */
  readonly slots = new E.SlotContent(this.host)

  /** Glyph of the `icon` shorthand;  only loaded once rendered by an owner. */
  readonly iconGlyph = new E.IconGlyph({ owner: this, name: () => (this.itemContext ? this.icon : undefined) })

  /** Has an icon (shorthand or `icon` slot)? */
  get hasIcon(): boolean {
    return !!this.icon || this.slots.hasContent(this.slotForName("icon"))
  }

  /** `image` as a URL. */
  get imageUrl(): string | undefined {
    return this.image?.trim() || undefined
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** The slot alone (unowned), a divider, or the item box. */
  render(): JSX.Element {
    return (
      <Show when={this.itemContext} fallback={this.unowned()}>
        <Show
          when={this.type !== DIVIDER}
          fallback={<div class={DIVIDER} part={this.partForName("item")} role={UIT.SEPARATOR} />}
        >
          {this.box()}
        </Show>
      </Show>
    )
  }

  /**
   * An unowned item's render:  just its content, the bare `<slot>`.
   * - Server render (`$/ui/static`):  wrapped in a `<span>`, the host's stand-in (`:host`'s `display: contents`
   *   reaches it as the root).  Why:  the flattener hands a host's `slot` to its render's FIRST element only, so a
   *   rich dropdown item (`<b>Bold</b> one`, assigned to its row's named slot) would lose the text beside its
   *   element (seo plan, I20).
   */
  private unowned(): JSX.Element {
    return isServer ? (
      <span>
        <slot />
      </span>
    ) : (
      <slot />
    )
  }

  /**
   * The owned item box, around the default slot.
   * - The host's `aria-label` names it (an icon-only item);  its `aria-expanded` goes to a `<button>` box.
   */
  private box(): JSX.Element {
    const isDisabledButton = () => this.rootTag === UIT.BUTTON && this.disabled
    return (
      <Dynamic
        ref={(element: HTMLElement) => (this.boxElement = element)}
        component={this.rootTag}
        class={this.rootClasses}
        part={this.partForName("item")}
        href={this.rootTag === UIT.ANCHOR_TAG && !this.disabled ? this.href : undefined}
        target={this.rootTag === UIT.ANCHOR_TAG ? this.target : undefined}
        type={this.rootTag === UIT.BUTTON ? UIT.BUTTON : undefined}
        role={this.type === UIT.ITEM ? this.itemContext?.role : undefined}
        disabled={isDisabledButton() && !this.itemContext?.role ? true : undefined}
        aria-disabled={this.disabled && !(isDisabledButton() && !this.itemContext?.role) ? UIT.TRUE : undefined}
        aria-current={this.ariaCurrent}
        aria-label={this.attributes[UIT.ARIA_LABEL] ?? undefined}
        aria-expanded={
          this.rootTag === UIT.BUTTON
            ? ((this.attributes[UIT.ARIA_EXPANDED] ?? undefined) as "true" | "false" | undefined)
            : undefined
        }
        data-value={this.value}
      >
        <Show when={this.imageUrl}>
          <img
            class={this.itemContext?.imageClass ?? IMAGE_CLASS}
            part={this.partForName("image")}
            src={this.imageUrl}
            alt=""
          />
        </Show>
        <Show when={this.hasIcon}>
          <span class={UIT.ICON} part={this.partForName("icon")}>
            <slot name={this.slotForName("icon")}>{this.iconGlyph.svg}</slot>
          </span>
        </Show>
        <slot />
      </Dynamic>
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIItem extends E.AttributeValues<typeof itemVocabulary> {}

/** An owner's controller as the item first sees it:  `itemContext` only when it renders items (`ItemOwner`). */
type ItemOwnerController = E.UIElement & Partial<UIT.ItemOwner>

/** Root element names. */
type RootTag = typeof UIT.ANCHOR_TAG | typeof UIT.BUTTON | typeof DIV

/** Root of an item that is neither a link nor a button, a header or a divider. */
const DIV = "div"

/** The `divider` type, and the class of its root. */
const DIVIDER = "divider"

/** Classes of the `image` shorthand, unless the owner says otherwise:  an avatar, as in Fomantic's list examples. */
const IMAGE_CLASS = "ui avatar image"
