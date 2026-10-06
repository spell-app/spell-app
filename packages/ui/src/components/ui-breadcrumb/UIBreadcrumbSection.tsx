import { Show } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { proto, UIElement, UIT } from "$/ui/core"

import { breadcrumbSectionVocabulary } from "./ui-breadcrumb-section.vocabulary.en"
import { BreadcrumbFallback } from "./ui-breadcrumb.fallback"
import { DIVIDER, PAGE } from "./ui-breadcrumb.types"

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
export class UIBreadcrumbSection extends UIElement<typeof breadcrumbSectionVocabulary> {
  @proto static vocabulary = breadcrumbSectionVocabulary
  @proto static styles = { breadcrumb: breadcrumbCSS }
  @proto static Fallback = BreadcrumbFallback

  constructor(...args: ConstructorParameters<typeof UIElement>) {
    super(...args)
    this.host.internals.role = UIT.LISTITEM
  }

  protected hostStates() {
    return { active: this.attrs.active }
  }

  render(): JSX.Element {
    const content = (
      <>
        <span class={DIVIDER} part={this.part("divider")} aria-hidden="true" />
        <Show when={this.attrs.href && !this.attrs.active} fallback={this.plainSection()}>
          <a class={this.classes()} part={this.part("section")} href={this.attrs.href} target={this.attrs.target}>
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
      <span class={this.classes()} part={this.part("section")} aria-current={this.attrs.active ? PAGE : undefined}>
        <slot />
      </span>
    )
  }
}
