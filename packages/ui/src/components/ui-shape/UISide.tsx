import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { UIShape } from "./UIShape"
import { SIDE } from "./UIShape.types"
import { sideVocabulary } from "./UISide.en"

import shapeCSS from "./UIShape.css?inline"

/****************
 * ### `UISide`
 * The component behind `<ui-side>`:
 * one side of a `<ui-shape>` (Fomantic's `.side`), `<div class="side" part="side"><slot>`.
 *
 * - Passive:  the DOM element is the face that turns.
 *   Its shape sets its states (`active`, `inactive`, `animating`, `leaving`)
 *   and, while flipping, its inline `transform` / `top` / `left`;  `UIShape.css` does the rest.
 * - Outside a working shape (no `inactive` state) every side shows, stacked:  content is never lost.
 * - A server render (`$/ui/static`):
 *   - in a `text` shape the root is a `<span>` (`UIShape.rendersInlineOnServer`)
 *   - which side shows goes by its states (`data-state`), not the class grammar's `active` class:
 *     that one's rule (states layer) would beat a cube face's `display: flex`
 ****************/
export class UISide extends E.UIComponent<typeof sideVocabulary> {
  @E.proto static vocabulary = sideVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { shape: shapeCSS },
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  /** Always a side:  `:state(side)`. */
  @E.cssState("side")
  get isSide(): boolean {
    return true
  }

  render(): JSX.Element {
    if (this.isInline) return this.inlineSide()
    return (
      <div class={SIDE} part={this.partForName("side")}>
        <slot />
      </div>
    )
  }

  /** A side of a `text` shape in a server render (see class docs). */
  private get isInline(): boolean {
    if (!isServer) return false
    // `parentElement` is the platform's:  `null` at the top
    const shape = (this.domElement.parentElement as E.DOMElement | null)?.component
    return shape instanceof UIShape && shape.rendersInlineOnServer
  }

  /** `render()`'s markup as a `<span>` (`isInline`). */
  private inlineSide(): JSX.Element {
    return (
      <span class={SIDE} part={this.partForName("side")}>
        <slot />
      </span>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UISide extends E.AttributeValues<typeof sideVocabulary> {}
