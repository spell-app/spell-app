import { createEffect, createMemo, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import {
  Converters,
  HostAttribute,
  PartContext,
  proto,
  UIElement,
  type AttributeName,
  type TabShowDetail,
  type UIHost
} from "$/core"

import { tabVocabulary } from "./tab.vocabulary.en"
import { TabFallback } from "./tab.fallback"

import segmentCSS from "$/components/segment/segment.css?inline"
import tabCSS from "./tab.css?inline"

/** Vocabulary type, for brevity. */
type Vocabulary = typeof tabVocabulary

/****************
 * ### `<ui-tab>`
 * One PANE of a `<ui-tabs>` (Fomantic's `.ui.tab`):  `<div class="ui [bottom attached] tab segment [active]"
 * part="tab">` around its content.  Its `label` / `icon` become a tab in the tabs' menu.
 * - Owned (`PartContext`, `:state(in-tabs)`):  the tabs decide what it shows as (`TabOwner.paneState()`):  selected
 *   or not, attached to which edge, basic.  The host is the `role="tabpanel"` (internals), named by `label`, and a
 *   Tab stop (`tabindex="0"` unless the page set one) so keyboard users reach content with no control in it.
 * - Alone (no `<ui-tabs>`):  shown while its own `selected` (or `active`) is set.
 * - Hidden panes are `display: none` hosts:  out of the layout and the accessibility tree.
 * - `lazy`:  its `<template>` children are stamped into it (light DOM, after them) the first time it's shown;
 *   `ui-show` (`{ value, first }`) fires every time it becomes the shown pane.
 * - Looks come from `segment.css` (the pane IS a segment) and `tab.css`, adopted in that order.
 ****************/
export class UITab extends UIElement<Vocabulary> {
  @proto static vocabulary = tabVocabulary
  @proto static styles = { segment: segmentCSS, tab: tabCSS }
  @proto static Fallback = TabFallback
  // the HOST is the tabpanel and its focus stop;  nothing inside to delegate to
  @proto static delegatesFocus = false

  /** Owning tabs. */
  readonly context = new PartContext(this.host, this.vocabulary.noun)

  /** Host `active`, the alias of `selected`. */
  readonly activeAttribute = new HostAttribute(this.host, ACTIVE)

  /** Shown before (lazy content stamped, `first` spent). */
  private shownBefore = false

  /** `tabindex` this element put on the host (so it only removes its own). */
  private ownTabIndex = false

  ////////////////
  // ## Derived state
  ////////////////

  /** The owning tabs' controller, if it answers `paneState()`. */
  readonly owner = createMemo((): TabOwner | undefined => {
    const controller = (this.context.owner.get()?.owner as UIHost | undefined)
      ?.controller as unknown as Partial<TabOwner>
    return controller?.paneState ? (controller as TabOwner) : undefined
  })

  /** How to show:  the owner's say, else its own attributes. */
  readonly state = createMemo((): TabPaneState => {
    const owner = this.owner()
    if (owner) return owner.paneState(this.host)
    return {
      selected: this.ownSelected(),
      attached: this.attrs.attached,
      basic: this.attrs.basic,
      inverted: this.attrs.inverted
    }
  })

  /** Its own `selected` (or `active`):  the tabs read it for the first pane to show.  Tracked. */
  ownSelected(): boolean {
    return this.attrs.selected || Converters.boolean(this.activeAttribute.get() ?? undefined, ACTIVE)
  }

  ////////////////
  // ## Element hooks
  ////////////////

  protected classValue(name: AttributeName<Vocabulary>): unknown {
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
      <div class={this.classes()} part={this.part("tab")} aria-busy={this.attrs.loading ? TRUE : undefined}>
        <slot />
      </div>
    )
  }

  /**
   * Role, name and Tab stop while owned;  `ui-show` (and lazy content) each time it becomes the shown pane.
   * - Created in `mount()`:  they read the owner and overridable state.
   */
  private effects() {
    const { host } = this
    createEffect(
      () => !!this.owner(),
      (owned) => {
        host.internals.role = owned ? TABPANEL : null
        if (owned && !host.hasAttribute(TABINDEX)) {
          host.tabIndex = 0
          this.ownTabIndex = true
        } else if (!owned && this.ownTabIndex) {
          host.removeAttribute(TABINDEX)
          this.ownTabIndex = false
        }
      }
    )
    createEffect(
      () => (this.owner() ? (this.attrs.label ?? this.attrs.value ?? null) : null),
      (label) => {
        host.internals.ariaLabel = label
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
    const first = !this.shownBefore
    this.shownBefore = true
    if (first && untrack(() => this.attrs.lazy)) {
      for (const template of this.host.querySelectorAll<HTMLTemplateElement>(TEMPLATES)) {
        this.host.append(template.content.cloneNode(true))
      }
    }
    const owner = untrack(this.owner)
    const value = owner ? owner.valueOf(this.host) : (untrack(() => this.attrs.value) ?? "")
    const detail: TabShowDetail = { value, first }
    this.emit("ui-show", detail)
  }
}

/** What a pane asks its owner (`UITabs`, not imported:  it imports this file). */
export type TabOwner = {
  /** How `pane` shows now.  Tracked. */
  paneState(pane: Element): TabPaneState
  /** `pane`'s value:  its `value`, else its index.  Untracked. */
  valueOf(pane: Element): string
}

/** How a pane shows, from `TabOwner.paneState()`. */
export type TabPaneState = {
  /** the shown pane */
  selected: boolean
  /** edge it joins the menu on */
  attached?: string | boolean
  /** no segment box */
  basic: boolean
  /** a dark pane */
  inverted: boolean
}

/** Alias attribute of `selected`. */
const ACTIVE = "active"

/** Class after the noun:  the pane is a segment. */
const SEGMENT = "segment"

/** Host role while owned. */
const TABPANEL = "tabpanel"

/** Host attribute for the pane's Tab stop. */
const TABINDEX = "tabindex"

/** A lazy pane's templates:  direct children only. */
const TEMPLATES = ":scope > template"

/** `aria-busy` value. */
const TRUE = "true"
