import { createEffect, untrack } from "solid-js"
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
 *   tokens on its root (`PUSHER_TOKENS`:  where the pusher moves, dimmed, blurred), which `ui-sidebar.css` reads in
 *   each `<ui-pusher>`.
 * - One pushing sidebar moves the pusher;  two at once (opposite sides) leave it in place, as Fomantic.
 * - SIDE EFFECT on the light DOM:  while a MODAL sidebar is visible, every other child (the pusher, other sidebars)
 *   gets `inert`, removed again when it hides -- only the `inert`s it added.
 ****************/
export class UIPushable extends E.UIElement<PushableVocabulary> {
  @E.proto static vocabulary = pushableVocabulary
  @E.proto static styles = { sidebar: sidebarCSS }
  @E.proto static Fallback = SidebarFallback
  @E.proto static delegatesFocus = false

  /** What each visible sidebar asks for. */
  readonly layouts = new E.Cell<ReadonlyMap<Element, UIT.SidebarLayout>>(new Map())

  /** The root, which carries the tokens. */
  private root?: HTMLDivElement

  /** Children it made `inert`. */
  private readonly inerted = new Set<Element>()

  protected hostStates() {
    return { pushable: true }
  }

  render(): JSX.Element {
    createEffect(
      () => this.layouts.get(),
      (layouts) => this.apply(layouts)
    )
    // never on a server:  nothing reports there, and a late report would write a signal after the render
    if (!isServer) queueMicrotask(() => this.askSidebars())
    return (
      <div ref={(element) => (this.root = element)} class={PUSHABLE} part={this.part("pushable")}>
        <slot />
      </div>
    )
  }

  /** Sidebars that rendered (and reported) before this element had a controller:  ask them again. */
  private askSidebars() {
    for (const child of this.host.children) {
      const sidebar = (child as E.UIHost).controller as { reportLayout?: () => void } | undefined
      sidebar?.reportLayout?.()
    }
  }

  /**
   * A sidebar's layout while it's visible, `undefined` once hidden (or gone).
   * - Called from the sidebar's effects and handlers, never from an owned scope.
   */
  report(sidebar: Element, layout: UIT.SidebarLayout | undefined) {
    const next = new Map(untrack(() => this.layouts.get()))
    if (layout) next.set(sidebar, layout)
    else if (!next.delete(sidebar)) return
    this.layouts.set(next)
    // at once too:  a sidebar hiding restores focus into the pusher right after, which must not be `inert` then
    this.apply(next)
  }

  /** Tokens on the root;  `inert` on every child beside a modal sidebar. */
  private apply(layouts: ReadonlyMap<Element, UIT.SidebarLayout>) {
    const root = this.root
    if (!root) return
    const visible = [...layouts.values()]
    const pushing = visible.filter((layout) => layout.transform !== NONE_TRANSFORM)
    const push = pushing.length === 1 ? pushing[0] : undefined
    const modal = visible.find((layout) => layout.modal)
    root.style.setProperty(UIT.PUSHER_TOKENS.transform, push?.transform ?? NONE_TRANSFORM)
    root.style.setProperty(UIT.PUSHER_TOKENS.origin, push?.origin ?? CENTER)
    root.style.setProperty(UIT.PUSHER_TOKENS.dimmed, modal ? ON : OFF)
    root.style.setProperty(UIT.PUSHER_TOKENS.blurring, modal?.blurring ? ON : OFF)
    const keep = new Set([...layouts].filter(([, layout]) => layout.modal).map(([sidebar]) => sidebar))
    for (const child of this.host.children) {
      const inert = !!modal && !keep.has(child) && !this.isHiddenSidebar(child)
      if (inert && !child.hasAttribute(INERT)) {
        child.setAttribute(INERT, "")
        this.inerted.add(child)
      } else if (!inert && this.inerted.delete(child)) child.removeAttribute(INERT)
    }
    for (const child of this.inerted) {
      if (child.parentElement === this.host) continue
      child.removeAttribute(INERT)
      this.inerted.delete(child)
    }
  }

  /** A sidebar that isn't showing:  already out of reach, no `inert` needed. */
  private isHiddenSidebar(child: Element): boolean {
    return child.matches(`:state(${UIT.SIDEBAR_HOST_STATE}):not(:state(${UIT.VISIBLE}))`)
  }
}

/** Class word of the root (`ui-sidebar.css`). */
const PUSHABLE = "pushable"

/** A `PUSHER_TOKENS` switch on:  dimmed, blurring. */
const ON = "1"

/** A `PUSHER_TOKENS` switch off. */
const OFF = "0"

/** The attribute it adds to the children beside a modal sidebar. */
const INERT = "inert"
