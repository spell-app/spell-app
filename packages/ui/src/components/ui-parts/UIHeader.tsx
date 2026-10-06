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
        component={this.tag()}
        class={this.rootClass()}
        part={this.part("header")}
        href={this.attrs.href}
        role={this.attrs.href && this.attrs.level ? HEADING : undefined}
        aria-level={this.attrs.href ? this.attrs.level : undefined}
      >
        <slot />
      </Dynamic>
    )
  }

  /** `<a>` for `href`, `<hN>` for `level`, else `<div>`. */
  protected tag(): string {
    if (this.attrs.href) return UIT.ANCHOR_TAG
    const level = this.attrs.level ? (Number(this.attrs.level) as UIT.HeaderLevel) : undefined
    return level ? `h${level}` : "div"
  }

  /** Standalone:  the class grammar;  owned:  the bare noun. */
  protected rootClass(): string {
    return this.context.ownerNoun() ? this.vocabulary.noun : this.classes()
  }
}
