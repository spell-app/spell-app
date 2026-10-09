import { Show, untrack } from "solid-js"
import { Dynamic, isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { itemVocabulary } from "./UIItem.en"

import itemCSS from "./UIItem.css?inline"

/****************
 * ### `UIItem`
 * The component behind `<ui-item>`:  ONE generic item for every owner that has items,
 * as Fomantic's `.item` is shared by the dropdown, the list and the menu.
 * It draws itself for its OWNER (`PartContext`):  there is no `ui-list-item` or `ui-menu-item`.
 *
 * - No owner (a dropdown option, or a loose item):  it draws only a `<slot>`.
 *   - A dropdown reads its items as DATA (`SlottedItems`) and draws its own `.item[role=option]` rows;
 *     a RICH item is projected into its row, where this slot shows the content live.
 *   - The dropdown is a barrier, so its items never find an outer menu.
 *
 * - Owned (by `<ui-list>` or `<ui-menu>`, whose vocabularies `ownsParts` `item`):
 *   it asks the owner's component for an `ItemContext` (`ItemOwner.itemContext()`, tracked) and draws the item box:
 *   - `<a class="[color] [position] [keyOnly ...] item" part="item" href>` with `href`,
 *     a `<button type="button">` with `link` (or when the owner says its items are interactive), else a `<div>`;
 *   - a `type="header"` item is a `<div class="item header">`, a `divider` a `<div class="divider" role="separator">`;
 *   - inside the box:  the `image` shorthand's `<img class="ui avatar image" part="image" alt="">`,
 *     the icon box (the `icon` shorthand or the `icon` slot), then the default slot.
 *
 * - Styles:  `UIItem.css` (the DOM element and generic resets),
 *   then the OWNER's sheets (its `elementSetup.styleSheets`), which hold the item rules keyed on `:host(:state(in-list)) > .item`, beside the static `.ui.list > .item`.
 *   The item registers them if the owner hasn't yet, and adopts them again when the owner changes.
 *
 * - Semantics:
 *   - the DOM element's role comes from the owner (`listitem`), and so does the box's (`menuitem` in a menubar);
 *   - selected => `aria-current` (the owner's value, `page`, on a link;  `true` otherwise);
 *   - the DOM element's `aria-label` names the box (an icon-only item),
 *     and its `aria-expanded` goes to a `<button>` box (a disclosure:  a menu item that opens a group below it).
 *
 * - `active` is an ALIAS of `selected` (Fomantic's word), read from the DOM element's attribute.
 *
 * - A part (`elementSetup.isAPart`):  transparent to other parts' climbs,
 *   so a `<ui-header>` inside an item in a list is the LIST's header (`.ui.list > .item > .content > .header`).
 *   - Except in the Items view (`<ui-items>`):  there the owner's `ItemContext.ownsParts` makes the item OWN its
 *     content parts (`ConditionalOwner`, `isOwnerOf()`), so they get `:state(in-item)`,
 *     as Fomantic's `.ui.items > .item > .content > .header`.  Its `image` shorthand takes the owner's `imageClass`.
 ****************/
export class UIItem extends E.UIComponent<typeof itemVocabulary> implements E.ConditionalOwner {
  @E.proto static vocabulary = itemVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { item: itemCSS },
    isAPart: true
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## Owner
  ////////////////

  /** Owner (list, menu), if any. */
  readonly context = new E.PartContext({ domElement: this.domElement, noun: this.vocabulary.noun })

  /** The owner's component, when it renders items (`ItemOwner`). */
  get owner(): Required<ItemOwnerComponent> | undefined {
    const component = this.context.ownerComponent<ItemOwnerComponent>()
    return component?.itemContext ? (component as Required<ItemOwnerComponent>) : undefined
  }

  /**
   * What the owner wants, or `undefined` when unowned (data only).
   * - `@derived`:  the owner's `itemContext()` has a SIDE EFFECT (a menu records the item and queues a refresh),
   *   so it runs once per change, not per read.
   */
  @E.derived
  get itemContext(): UIT.ItemContext | undefined {
    return this.owner?.itemContext(this.domElement)
  }

  /** The DOM element's role follows the owner (`listitem` in a list). */
  @E.aria("role")
  protected get ariaRole(): string | undefined {
    return this.itemContext?.domElementRole
  }

  /**
   * `ConditionalOwner`:  does this item own its content parts (any noun) now?  Only when its owner's `ItemContext`
   * says so (the Items view).
   * - Reads the DOM (`PartContext.resolve()`), untracked:  other parts ask during their climbs, right after moves,
   *   before this item's own `owner` has landed.
   */
  isOwnerOf(): boolean {
    const owner = E.PartContext.componentFor<ItemOwnerComponent>(this.context.resolve())
    return !!owner?.itemContext && !!untrack(() => owner.itemContext!(this.domElement)).ownsParts
  }

  /** `UIItem.css`, then the owner's sheets (registered here if the owner hasn't yet). */
  get styleSheetNames(): string[] {
    const names = Object.keys(this.elementSetup.styleSheets)
    const styles = this.owner?.elementSetup.styleSheets ?? {}
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

  /** `selected`, or its alias, the DOM element's `active` attribute. */
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
    return this.rootTag === "a" ? (this.itemContext?.current ?? "page") : "true"
  }

  ////////////////
  // ## The box
  ////////////////

  /** Root element:  link, button, or plain box. */
  get rootTag(): RootTag {
    const context = this.itemContext
    if (this.type !== UIT.ITEM) return "div"
    if (this.href) return "a"
    return this.link || context?.interactive ? "button" : "div"
  }

  /** The rendered item box, while owned. */
  private boxElement: HTMLElement | undefined

  /**
   * The item box (`<a>` / `<button>` / `<div>` in the shadow root), or `undefined` while unowned --
   * what an owner moves focus between (a menubar's roving tabindex:  the DOM element stays untabbable,
   * so assistive tech and axe see the owner's role pattern through it).
   */
  get focusTarget(): HTMLElement | undefined {
    return this.boxElement?.isConnected ? this.boxElement : undefined
  }

  /**
   * `header` for a header item;  `ui-<color>` for a coloured one -- the generic colour remap (`colors.css`) keys on
   * `.ui.red` / `.ui-red`, and an item has no `ui`.
   */
  protected get extraClass(): string | undefined {
    const color = this.color
    const extra = [this.type === UIT.HEADER ? UIT.HEADER : "", color ? `${UIT.COLOR_CLASS_PREFIX}${color}` : ""]
    return extra.filter(Boolean).join(" ") || undefined
  }

  ////////////////
  // ## Icon and image
  ////////////////

  /** Light-DOM slot occupancy. */
  readonly slots = new E.SlotContent(this.domElement)

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
          fallback={<div class={DIVIDER} part={this.partForName("item")} role="separator" />}
        >
          {this.box()}
        </Show>
      </Show>
    )
  }

  /**
   * An unowned item's render:  just its content, the bare `<slot>`.
   * - Server render (`$/ui/static`):  wrapped in a `<span>`, the DOM element's stand-in (`:host`'s `display: contents`
   *   reaches it as the root).  Why:  the flattener hands a DOM element's `slot` to its render's FIRST element only,
   *   so a rich dropdown item (`<b>Bold</b> one`, assigned to its row's named slot) would lose the text beside its
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
   * - The DOM element's `aria-label` names it (an icon-only item);  its `aria-expanded` goes to a `<button>` box.
   */
  private box(): JSX.Element {
    const isDisabledButton = () => this.rootTag === "button" && this.disabled
    return (
      <Dynamic
        ref={(element: HTMLElement) => (this.boxElement = element)}
        component={this.rootTag}
        class={this.rootClass}
        part={this.partForName("item")}
        href={this.rootTag === "a" && !this.disabled ? this.href : undefined}
        target={this.rootTag === "a" ? this.target : undefined}
        type={this.rootTag === "button" ? "button" : undefined}
        role={this.type === UIT.ITEM ? this.itemContext?.role : undefined}
        disabled={isDisabledButton() && !this.itemContext?.role ? true : undefined}
        aria-disabled={this.disabled && !(isDisabledButton() && !this.itemContext?.role) ? "true" : undefined}
        aria-current={this.ariaCurrent}
        aria-label={this.attributes["aria-label"] ?? undefined}
        aria-expanded={
          this.rootTag === "button"
            ? ((this.attributes["aria-expanded"] ?? undefined) as "true" | "false" | undefined)
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

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIItem extends E.AttributeValues<typeof itemVocabulary> {}

/** An owner's component as the item first sees it:  `itemContext` only when it renders items (`ItemOwner`). */
type ItemOwnerComponent = E.UIComponent & Partial<UIT.ItemOwner>

/** Root element names. */
type RootTag = "a" | "button" | "div"

/** The `divider` type, and the class of its root. */
const DIVIDER = "divider"

/** Classes of the `image` shorthand, unless the owner says otherwise:  an avatar, as in Fomantic's list examples. */
const IMAGE_CLASS = "ui avatar image"
