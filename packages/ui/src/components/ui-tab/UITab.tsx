import { untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

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
  @E.proto static styleSheets = { segment: segmentCSS, tab: tabCSS }
  @E.proto static elementSetup = {
    Fallback: TabFallback,
    // the HOST is the tabpanel and its focus stop;  nothing inside to delegate to
    delegatesFocus: false
  }

  /** Always:  `ui-tab.css` tells a pane's host from a tab set's by `:state(pane)`. */
  @E.cssState("pane")
  get isPane(): boolean {
    return true
  }

  ////////////////
  // ## The owner
  ////////////////

  /** Owning tabs. */
  readonly context = new E.PartContext({ host: this.host, noun: this.vocabulary.noun })

  /** The owning tabs' controller, if it answers `paneState()`. */
  get owner(): TabOwner | undefined {
    const controller = this.context.ownerController<Partial<TabOwner>>()
    return controller?.paneState ? (controller as TabOwner) : undefined
  }

  /** `tabindex` this element put on the host (so it only removes its own). */
  private tabIndexIsOurs = false

  /** Owned:  the host is a `tabpanel` and a Tab stop (unless the page set a `tabindex`);  alone, neither. */
  @E.onChange("owner", { writesHost: true })
  protected onOwnerChanged(owner: TabOwner | undefined) {
    const { host } = this
    const owned = !!owner
    host.internals.role = owned ? TABPANEL : null
    if (owned && !host.hasAttribute(UIT.TABINDEX)) {
      host.tabIndex = 0
      this.tabIndexIsOurs = true
    } else if (!owned && this.tabIndexIsOurs) {
      host.removeAttribute(UIT.TABINDEX)
      this.tabIndexIsOurs = false
    }
  }

  /** Owned:  the host is named by its `label`, else its `value`;  alone, unnamed. */
  @E.onChange("owner", "label", "value", { writesHost: true })
  protected onLabelChanged(owner: TabOwner | undefined, label: string | undefined, value: string | undefined) {
    this.host.internals.ariaLabel = (owner ? (label ?? value) : undefined) ?? null
  }

  ////////////////
  // ## Selection
  ////////////////

  /** Its own `selected` (or the `active` alias):  the tabs read it for the first pane to show. */
  get isMarkedSelected(): boolean {
    return this.selected || E.Converters.boolean(this.attributes[UIT.ACTIVE], UIT.ACTIVE)
  }

  /**
   * How to show:  the owner's say, else its own attributes.
   * - `@derived`:  the owner's answer looks the pane up among the tabs, and four readers share it.  Lazy by nature,
   *   so a static render (`$/ui/static`), which builds this pane before its later siblings, asks at render time.
   */
  @E.derived
  get paneState(): TabPaneState {
    const owner = this.owner
    if (owner) return owner.paneState(this.host)
    return {
      selected: this.isMarkedSelected,
      attached: this.attached,
      basic: this.basic,
      inverted: this.inverted
    }
  }

  /** The shown pane:  `:state(selected)`. */
  @E.cssState("selected")
  get isSelected(): boolean {
    return this.paneState.selected
  }

  protected classValue(name: E.AttributeName<typeof tabVocabulary>): unknown {
    const state = this.paneState
    if (name === "selected") return state.selected
    if (name === "attached") return state.attached
    if (name === "basic") return state.basic
    if (name === "inverted") return state.inverted
    return super.classValue(name)
  }

  /** Fomantic's pane is a segment:  `ui ... tab segment`. */
  protected get extraClasses(): string | undefined {
    return SEGMENT
  }

  ////////////////
  // ## Showing
  ////////////////

  /** Shown before (lazy content stamped, `first` spent). */
  private wasShownBefore = false

  /** On screen:  the shown pane, rendered and connected. */
  protected get isShown(): boolean {
    return this.isReady && this.isConnected && this.isSelected
  }

  /** Each time it BECOMES the shown pane:  `onShown()`. */
  @E.onChange("isShown")
  protected onShownChanged(isShown: boolean) {
    if (isShown) this.onShown()
  }

  /** Became the shown pane:  stamp lazy content the first time, then `ui-show`. */
  private onShown() {
    const first = !this.wasShownBefore
    this.wasShownBefore = true
    if (first && untrack(() => this.lazy)) {
      for (const template of this.host.querySelectorAll<HTMLTemplateElement>(TEMPLATES)) {
        this.host.append(template.content.cloneNode(true))
      }
    }
    const owner = untrack(() => this.owner)
    const value = owner ? owner.valueFor(this.host) : (untrack(() => this.value) ?? "")
    const detail: UIT.TabShowDetail = { value, first }
    this.send("ui-show", detail)
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("tab")} aria-busy={this.loading ? UIT.TRUE : undefined}>
        <slot />
      </div>
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UITab extends E.AttributeValues<typeof tabVocabulary> {}

/** A lazy pane's templates:  direct children only. */
const TEMPLATES = ":scope > template"
