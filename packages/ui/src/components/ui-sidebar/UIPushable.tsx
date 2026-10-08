import { untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { pushableVocabulary } from "./ui-pushable.vocabulary.en"
import { SidebarFallback } from "./ui-sidebar.fallback"
import { CENTER, NONE_TRANSFORM, type PushableVocabulary } from "./ui-sidebar.types"

import sidebarCSS from "./ui-sidebar.css?inline"

/****************
 * ### `<ui-pushable>`
 * The context sidebars appear in (Fomantic's `.pushable`):  `<div class="pushable" part="pushable"><slot>` -- a
 * clipping, positioned box holding `<ui-sidebar>`s and a `<ui-pusher>`.
 * - Its visible sidebars REPORT what they need (`report()`, a `SidebarLayout`);  it turns that into inherited
 *   tokens on its root (`PusherTokens`:  where the pusher moves, dimmed, blurred), which `ui-sidebar.css` reads in
 *   each `<ui-pusher>`.
 * - One pushing sidebar moves the pusher;  two at once (opposite sides) leave it in place, as Fomantic.
 * - SIDE EFFECT on the light DOM:  while a MODAL sidebar is visible, every other child (the pusher, other sidebars)
 *   gets `inert`, removed again when it hides -- only the `inert`s it added.
 ****************/
export class UIPushable extends E.UIElement<PushableVocabulary> {
  @E.proto static vocabulary = pushableVocabulary
  @E.proto static styleSheets = { sidebar: sidebarCSS }
  @E.proto static elementSetup = { Fallback: SidebarFallback, delegatesFocus: false }

  /** Always:  its sidebars find it by `:state(pushable)`. */
  @E.cssState("pushable")
  get isPushable(): boolean {
    return true
  }

  ////////////////
  // ## Sidebar layouts
  ////////////////

  /** What each visible sidebar asks for. */
  @E.state accessor sidebarLayouts: ReadonlyMap<Element, UIT.SidebarLayout> = new Map()

  /** The root, which carries the tokens. */
  private root?: HTMLDivElement

  /** Children it made `inert`. */
  private readonly childrenMadeInert = new Set<Element>()

  /**
   * A sidebar's layout while it's visible, `undefined` once hidden (or gone).
   * - Called from the sidebar's effects and handlers, never from an owned scope.
   */
  report(sidebar: Element, layout: UIT.SidebarLayout | undefined) {
    const next = new Map(untrack(() => this.sidebarLayouts))
    if (layout) next.set(sidebar, layout)
    else if (!next.delete(sidebar)) return
    this.sidebarLayouts = next
    // at once too:  a sidebar hiding restores focus into the pusher right after, which must not be `inert` then
    this.apply(next)
  }

  /** The layouts changed:  apply them. */
  @E.onChange("sidebarLayouts")
  protected onSidebarLayoutsChanged(layouts: ReadonlyMap<Element, UIT.SidebarLayout>) {
    this.apply(layouts)
  }

  /** Tokens on the root;  `inert` on every child beside a modal sidebar. */
  private apply(layouts: ReadonlyMap<Element, UIT.SidebarLayout>) {
    const root = this.root
    if (!root) return
    const visible = [...layouts.values()]
    const pushing = visible.filter((layout) => layout.transform !== NONE_TRANSFORM)
    const push = pushing.length === 1 ? pushing[0] : undefined
    const modal = visible.find((layout) => layout.modal)
    root.style.setProperty(UIT.PusherTokens.transform, push?.transform ?? NONE_TRANSFORM)
    root.style.setProperty(UIT.PusherTokens.origin, push?.origin ?? CENTER)
    root.style.setProperty(UIT.PusherTokens.dimmed, modal ? ON : OFF)
    root.style.setProperty(UIT.PusherTokens.blurring, modal?.blurring ? ON : OFF)
    const keep = new Set([...layouts].filter(([, layout]) => layout.modal).map(([sidebar]) => sidebar))
    for (const child of this.host.children) {
      const inert = !!modal && !keep.has(child) && !this.isHiddenSidebar(child)
      if (inert && !child.hasAttribute(INERT)) {
        child.setAttribute(INERT, "")
        this.childrenMadeInert.add(child)
      } else if (!inert && this.childrenMadeInert.delete(child)) child.removeAttribute(INERT)
    }
    for (const child of this.childrenMadeInert) {
      if (child.parentElement === this.host) continue
      child.removeAttribute(INERT)
      this.childrenMadeInert.delete(child)
    }
  }

  /** A sidebar that isn't showing:  already out of reach, no `inert` needed. */
  private isHiddenSidebar(child: Element): boolean {
    return child.matches(`:state(${UIT.SIDEBAR_HOST_STATE}):not(:state(${UIT.VISIBLE}))`)
  }

  /** Sidebars that rendered (and reported) before this element had a controller:  ask them again. */
  private askSidebars() {
    for (const child of this.host.children) {
      const sidebar = (child as E.UIHost).controller as { reportLayout?: () => void } | undefined
      sidebar?.reportLayout?.()
    }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    // never on a server:  nothing reports there, and a late report would write a member after the render
    if (!isServer) queueMicrotask(() => this.askSidebars())
    return (
      <div ref={(element) => (this.root = element)} class={PUSHABLE} part={this.partForName("pushable")}>
        <slot />
      </div>
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIPushable extends E.AttributeValues<PushableVocabulary> {}

/** Class word of the root (`ui-sidebar.css`). */
const PUSHABLE = "pushable"

/** A `PusherTokens` switch on:  dimmed, blurring. */
const ON = "1"

/** A `PusherTokens` switch off. */
const OFF = "0"

/** The attribute it adds to the children beside a modal sidebar. */
const INERT = "inert"
