import { Dynamic, type JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { PartElement } from "./PartElement"
import { headerVocabulary } from "./ui-header.vocabulary.en"
import { HEADING } from "./ui-parts.types"

/****************
 * ### `<ui-header>`
 * A header, two elements in one:
 * - STANDALONE:  Fomantic's `ui header` in the class grammar (`ui large red dividing header`) on `<div>`, on
 *   `<h1>` ... `<h6>` with `level` (a page header, sized by level unless `size` is set), or on `<a>` with `href`
 * - OWNED (in a card, a modal ... or another header, whose sub header it then is):  a bare `.header`, never
 *   `ui`, as Fomantic's `.ui.card > .content > .header`
 * - Semantics:  `level` is a real heading;  a linked heading is `<a role="heading" aria-level>`, since the link
 *   carries the class grammar.
 * - It is an OWNER too (`ownsParts:  header, content`):  a nested `<ui-header>` / `<ui-content>` resolves to it.
 ****************/
export class UIHeader extends PartElement<typeof headerVocabulary> {
  @E.proto static vocabulary = headerVocabulary

  render(): JSX.Element {
    return (
      <Dynamic
        component={this.rootTag}
        class={this.rootClasses}
        part={this.partForName("header")}
        href={this.href}
        role={this.href && this.level ? HEADING : undefined}
        aria-level={this.href ? this.level : undefined}
      >
        <slot />
      </Dynamic>
    )
  }

  /** `<a>` for `href`, `<hN>` for `level`, else `<div>`. */
  protected get rootTag(): string {
    if (this.href) return UIT.ANCHOR_TAG
    const level = this.level ? (Number(this.level) as UIT.HeaderLevel) : undefined
    return level ? `h${level}` : "div"
  }

  /** Standalone:  the class grammar;  owned:  the bare noun. */
  get rootClasses(): string {
    return this.context.ownerNoun ? this.vocabulary.noun : super.rootClasses
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIHeader extends E.AttributeValues<typeof headerVocabulary> {}
