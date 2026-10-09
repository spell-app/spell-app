import { Show } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { breadcrumbSectionVocabulary } from "./UIBreadcrumbSection.en"

import breadcrumbCSS from "./UIBreadcrumb.css?inline"

/****************
 * ### `UIBreadcrumbSection`
 * The component behind `<ui-breadcrumb-section>`:  one step of the trail.
 *
 * - Its shadow DOM is its own leading divider,
 *   `<span class="divider" part="divider" aria-hidden="true">` (empty:
 *   `UIBreadcrumb.css` draws the breadcrumb's divider tokens into it, and hides it on the first section),
 *   then the section around the `<slot>`:
 *   - `active`:  `<span class="active section" part="section" aria-current="page">`, the current page,
 *     never a link, even with `href`
 *   - `href`:  `<a class="section" part="section" href target>`
 *   - else `<span class="section" part="section">`
 *
 * - The ELEMENT is `role=listitem` (through `internals`), so the breadcrumb's `<ol>` owns real list items
 *   through its slot.
 ****************/
export class UIBreadcrumbSection extends E.UIComponent<typeof breadcrumbSectionVocabulary> {
  @E.proto static vocabulary = breadcrumbSectionVocabulary
  @E.protoMerged static elementSetup = { styleSheets: { breadcrumb: breadcrumbCSS } } satisfies Partial<E.ElementSetup>

  constructor(...args: ConstructorParameters<typeof E.UIComponent>) {
    super(...args)
    this.domElement.internals.role = "listitem"
  }

  /** The current page (`active`)? */
  @E.cssState("active")
  get isActive(): boolean {
    return this.active
  }

  render(): JSX.Element {
    const content = (
      <>
        <span class={DIVIDER} part={this.partForName("divider")} aria-hidden="true" />
        <Show when={this.href && !this.active} fallback={this.plainSection()}>
          <a class={this.rootClass} part={this.partForName("section")} href={this.href} target={this.target}>
            <slot />
          </a>
        </Show>
      </>
    )
    // a server render (`$/ui/static`) has no element to be the list item:  ONE root, which the flattener makes the
    // `<li>` -- the class grammar's semantic form, `<li><span class="divider"></span><a class="section">`
    return isServer ? <span>{content}</span> : content
  }

  /** The section as text:  the current page (`aria-current`), or a level without a link. */
  private plainSection(): JSX.Element {
    return (
      <span class={this.rootClass} part={this.partForName("section")} aria-current={this.active ? "page" : undefined}>
        <slot />
      </span>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIBreadcrumbSection extends E.AttributeValues<typeof breadcrumbSectionVocabulary> {}

/** The class and part of a section's own leading divider. */
const DIVIDER = "divider"
