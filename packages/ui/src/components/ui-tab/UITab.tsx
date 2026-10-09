import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { tabVocabulary } from "./UITab.en"
import type { TabOwner, TabPaneState } from "./UITab.types"

import segmentCSS from "$/ui/components/ui-segment/UISegment.css?inline"
import tabCSS from "./UITab.css?inline"

/****************
 * ### `UITab`
 * The component behind `<ui-tab>`:  one PANE of a `<ui-tabs>` (Fomantic's `.ui.tab`),
 * `<div class="ui [bottom attached] tab segment [active]" part="tab">` around its content.
 * Its `label` / `icon` become a tab in the tab set's menu.
 *
 * - Owned (`PartContext`, `:state(in-tabs)`):  the tab set decides how it shows (`TabOwner.paneState()`):
 *   selected or not, attached to which edge, basic.
 *   - The DOM element is the `role="tabpanel"` (through `internals`), named by `label`,
 *     and a Tab stop (`tabindex="0"`, unless the page set one),
 *     so keyboard users reach content with no control in it.
 * - Alone (no `<ui-tabs>`):  shown while its own `selected` (or `active`) is set.
 * - Hidden panes are DOM elements with `display: none`:  out of the layout and the accessibility tree.
 * - `lazy`:  its `<template>` children are stamped into it (light DOM, after them) the first time it shows;
 *   `ui-show` (`{ value, first }`) fires every time it becomes the shown pane.
 * - Its looks come from `UISegment.css` (the pane IS a segment) and `UITab.css`, adopted in that order.
 ****************/
export class UITab extends E.UIComponent<typeof tabVocabulary> {
  @E.proto static vocabulary = tabVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { segment: segmentCSS, tab: tabCSS },
    // the DOM element is the tabpanel and its focus stop;  nothing inside to delegate to
    delegatesFocus: false,
    // `disabled`:  Fomantic's look
    disabled: "its own",
    // `loading`:  Fomantic's veil
    loading: "its own"
  } satisfies Partial<E.ElementSetup>

  /** Always:  `UITab.css` tells a pane's DOM element from a tab set's by `:state(pane)`. */
  @E.cssState("pane")
  get isPane(): boolean {
    return true
  }

  ////////////////
  // ## The owner
  ////////////////

  /** Owning tabs. */
  readonly context = new E.PartContext({ domElement: this.domElement, noun: this.vocabulary.noun })

  /** The owning tab set's component, if it answers `paneState()`. */
  get owner(): TabOwner | undefined {
    const owner = this.context.ownerComponent<Partial<TabOwner>>()
    return owner?.paneState ? (owner as TabOwner) : undefined
  }

  /** `tabindex` this element put on the DOM element (so it only removes its own). */
  private tabIndexIsOurs = false

  /** Owned:  the DOM element is a `tabpanel`;  alone, no role. */
  @E.aria("role")
  protected get ariaRole(): string | undefined {
    return this.owner ? "tabpanel" : undefined
  }

  /** Owned:  the DOM element is named by its `label`, else its `value`;  alone, unnamed. */
  @E.aria("ariaLabel")
  protected get accessibleName(): string | undefined {
    return this.owner ? (this.label ?? this.value) : undefined
  }

  /** Owned:  the DOM element is a Tab stop (unless the page set a `tabindex`);  alone, not. */
  @E.onChange("owner", { writesDOMElement: true })
  protected onOwnerChanged(owner: TabOwner | undefined) {
    const { domElement } = this
    const owned = !!owner
    if (owned && !domElement.hasAttribute("tabindex")) {
      domElement.tabIndex = 0
      this.tabIndexIsOurs = true
    } else if (!owned && this.tabIndexIsOurs) {
      domElement.removeAttribute("tabindex")
      this.tabIndexIsOurs = false
    }
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
   * - `@derived`:  the owner's answer looks the pane up among the tabs, and four readers share it.
   * - Lazy by nature, so a static render (`$/ui/static`),
   *   which builds this pane before its later siblings, asks at render time.
   */
  @E.derived
  get paneState(): TabPaneState {
    const owner = this.owner
    if (owner) return owner.paneState(this.domElement)
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
  protected get extraClass(): string | undefined {
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
  @E.untracked
  private onShown() {
    const first = !this.wasShownBefore
    this.wasShownBefore = true
    if (first && this.lazy) {
      for (const template of this.domElement.querySelectorAll<HTMLTemplateElement>(TEMPLATES)) {
        this.domElement.append(template.content.cloneNode(true))
      }
    }
    const owner = this.owner
    const value = owner ? owner.valueFor(this.domElement) : (this.value ?? "")
    const detail: UIT.TabShowDetail = { value, first }
    this.send("ui-show", detail)
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("tab")} aria-busy={this.loading ? "true" : undefined}>
        <slot />
      </div>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UITab extends E.AttributeValues<typeof tabVocabulary> {}

/** The class after a pane's noun:  the pane is a segment (`ui … tab segment`). */
const SEGMENT = "segment"

/** A lazy pane's templates:  direct children only. */
const TEMPLATES = ":scope > template"
