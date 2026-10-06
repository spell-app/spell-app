import { createEffect, createMemo, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { tabVocabulary } from "./ui-tab.vocabulary.en"
import { TabFallback } from "./ui-tab.fallback"
import { SEGMENT, TABPANEL, type TabOwner, type TabPaneState } from "./ui-tab.types"

import segmentCSS from "$/ui/components/ui-segment/ui-segment.css?inline"
import tabCSS from "./ui-tab.css?inline"

/****************
 * ### `<ui-tab>`
 * One PANE of a `<ui-tabs>` (Fomantic's `.ui.tab`):  `<div class="ui [bottom attached] tab segment [active]"
 * part="tab">` around its content.  Its `label` / `icon` become a tab in the tabs' menu.
 * - Owned (`PartContext`, `:state(in-tabs)`):  the tabs decide what it shows as (`TabOwner.paneState()`):  selected
 *   or not, attached to which edge, basic.  The host is the `role="tabpanel"` (internals), named by `label`, and a
 *   Tab stop (`tabindex="0"` unless the page set one) so people on a keyboard reach content with no control in it.
 * - Alone (no `<ui-tabs>`):  shown while its own `selected` (or `active`) is set.
 * - Hidden panes are `display: none` hosts:  out of the layout and the accessibility tree.
 * - `lazy`:  its `<template>` children are stamped into it (light DOM, after them) the first time it's shown;
 *   `ui-show` (`{ value, first }`) fires every time it becomes the shown pane.
 * - Looks come from `ui-segment.css` (the pane IS a segment) and `ui-tab.css`, adopted in that order.
 ****************/
export class UITab extends E.UIElement<typeof tabVocabulary> {
  @E.proto static vocabulary = tabVocabulary
  @E.proto static styles = { segment: segmentCSS, tab: tabCSS }
  @E.proto static Fallback = TabFallback
  // the HOST is the tabpanel and its focus stop;  nothing inside to delegate to
  @E.proto static delegatesFocus = false

  /** Owning tabs. */
  readonly context = new E.PartContext(this.host, this.vocabulary.noun)

  /** Host `active`, the alias of `selected`. */
  readonly activeAttribute = new E.HostAttribute({ host: this.host, name: UIT.ACTIVE })

  /** Shown before (lazy content stamped, `first` spent). */
  private hasShown = false

  /** `tabindex` this element put on the host (so it only removes its own). */
  private hasOwnTabIndex = false

  ////////////////
  // ## Derived state
  ////////////////

  /** The owning tabs' controller, if it answers `paneState()`. */
  readonly owner = createMemo((): TabOwner | undefined => {
    const controller = this.context.ownerController<Partial<TabOwner>>()
    return controller?.paneState ? (controller as TabOwner) : undefined
  })

  /**
   * How to show:  the owner's say, else its own attributes.
   * - `lazy` on a server:  the owner's answer reads every pane's controller, and a static render (`$/ui/static`)
   *   builds this one before its later siblings';  a server memo computes once, so it waits for render time.
   */
  readonly state = createMemo(
    (): TabPaneState => {
      const owner = this.owner()
      if (owner) return owner.paneState(this.host)
      return {
        selected: this.ownSelected(),
        attached: this.attrs.attached,
        basic: this.attrs.basic,
        inverted: this.attrs.inverted
      }
    },
    { lazy: isServer }
  )

  /** Its own `selected` (or `active`):  the tabs read it for the first pane to show.  Tracked. */
  ownSelected(): boolean {
    return this.attrs.selected || E.Converters.boolean(this.activeAttribute.get(), UIT.ACTIVE)
  }

  ////////////////
  // ## Element hooks
  ////////////////

  protected classValue(name: E.AttributeName<typeof tabVocabulary>): unknown {
    const state = this.state()
    if (name === "selected") return state.selected
    if (name === "attached") return state.attached
    if (name === "basic") return state.basic
    if (name === "inverted") return state.inverted
    return super.classValue(name)
  }

  /** Fomantic's pane is a segment:  `ui ... tab segment`. */
  protected extraClasses(): string | undefined {
    return SEGMENT
  }

  protected hostStates() {
    return { pane: true, selected: this.state().selected }
  }

  ////////////////
  // ## Rendering
  ////////////////

  mount(): JSX.Element {
    this.effects()
    return super.mount()
  }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("tab")} aria-busy={this.attrs.loading ? UIT.TRUE : undefined}>
        <slot />
      </div>
    )
  }

  /**
   * Role, name and Tab stop while owned;  `ui-show` (and lazy content) each time it becomes the shown pane.
   * - Created in `mount()`:  they read the owner and overridable state.
   * - Role, name and Tab stop are host effects:  a static render (`$/ui/static`) writes them out.
   */
  private effects() {
    const { host } = this
    this.hostEffect(
      () => !!this.owner(),
      (owned) => {
        host.internals.role = owned ? TABPANEL : null
        if (owned && !host.hasAttribute(UIT.TABINDEX)) {
          host.tabIndex = 0
          this.hasOwnTabIndex = true
        } else if (!owned && this.hasOwnTabIndex) {
          host.removeAttribute(UIT.TABINDEX)
          this.hasOwnTabIndex = false
        }
      }
    )
    this.hostEffect(
      () => (this.owner() ? (this.attrs.label ?? this.attrs.value) : undefined),
      (label) => {
        host.internals.ariaLabel = label ?? null
      }
    )
    createEffect(
      () => this.loaded() && this.connected.get() && this.state().selected,
      (shown) => {
        if (shown) this.shown()
      }
    )
  }

  /** Became the shown pane:  stamp lazy content the first time, then `ui-show`. */
  private shown() {
    const first = !this.hasShown
    this.hasShown = true
    if (first && untrack(() => this.attrs.lazy)) {
      for (const template of this.host.querySelectorAll<HTMLTemplateElement>(TEMPLATES)) {
        this.host.append(template.content.cloneNode(true))
      }
    }
    const owner = untrack(this.owner)
    const value = owner ? owner.valueFor(this.host) : (untrack(() => this.attrs.value) ?? "")
    const detail: UIT.TabShowDetail = { value, first }
    this.emit("ui-show", detail)
  }
}

/** A lazy pane's templates:  direct children only. */
const TEMPLATES = ":scope > template"
