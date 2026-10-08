import { Show } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { BreadcrumbFallback } from "./ui-breadcrumb.fallback"
import { DIVIDER } from "./ui-breadcrumb.types"
import { breadcrumbSectionVocabulary } from "./ui-breadcrumb-section.vocabulary.en"

import breadcrumbCSS from "./ui-breadcrumb.css?inline"

/****************
 * ### `<ui-breadcrumb-section>`
 * One step of the trail:  its own leading divider, `<span class="divider" part="divider" aria-hidden="true">`
 * (empty:  `ui-breadcrumb.css` draws the breadcrumb's divider tokens into it, and hides it on the first section),
 * then the section around the `<slot>`:
 * - `active`:  `<span class="active section" part="section" aria-current="page">`, the current page, never a
 *   link, even with `href`
 * - `href`:  `<a class="section" part="section" href target>`
 * - else `<span class="section" part="section">`
 * - The HOST is `role=listitem` (internals), so the breadcrumb's `<ol>` owns real list items through its slot.
 ****************/
export class UIBreadcrumbSection extends E.UIElement<typeof breadcrumbSectionVocabulary> {
  @E.proto static vocabulary = breadcrumbSectionVocabulary
  @E.proto static styleSheets = { breadcrumb: breadcrumbCSS }
  @E.proto static elementSetup = { Fallback: BreadcrumbFallback }

  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
    super(...args)
    this.host.internals.role = UIT.LISTITEM
  }

  /** The current page (`active`)? */
  @E.cssState("active")
  get isActive(): boolean {
    return this.active
  }

  render(): JSX.Element {
    const content = (
      <>
        <span class={DIVIDER} part={this.partForName("divider")} aria-hidden={UIT.TRUE} />
        <Show when={this.href && !this.active} fallback={this.plainSection()}>
          <a class={this.rootClasses} part={this.partForName("section")} href={this.href} target={this.target}>
            <slot />
          </a>
        </Show>
      </>
    )
    // a server render (`$/ui/static`) has no host to be the list item:  ONE root, which the flattener makes the
    // `<li>` -- the class grammar's semantic form, `<li><span class="divider"></span><a class="section">`
    return isServer ? <span>{content}</span> : content
  }

  /** The section as text:  the current page (`aria-current`), or a level without a link. */
  private plainSection(): JSX.Element {
    return (
      <span
        class={this.rootClasses}
        part={this.partForName("section")}
        aria-current={this.active ? UIT.PAGE : undefined}
      >
        <slot />
      </span>
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIBreadcrumbSection extends E.AttributeValues<typeof breadcrumbSectionVocabulary> {}
