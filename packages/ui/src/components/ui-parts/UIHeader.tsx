import { Dynamic, type JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { headerVocabulary } from "./UIHeader.en"

/****************
 * ### `UIHeader`
 * The component behind `<ui-header>`:  a header, which is two things in one.
 *
 * - STANDALONE:  Fomantic's `ui header`, in the class grammar (`ui large red dividing header`):
 *   - on a `<div>`;
 *   - on `<h1>` ... `<h6>` with `level` (a page header, sized by its level unless `size` is set);
 *   - on `<a>` with `href`.
 * - OWNED (in a card, a modal ... or another header, whose sub header it then is):  a bare `.header`, never `ui`,
 *   as Fomantic's `.ui.card > .content > .header`.
 * - `level` makes a real heading.  A linked heading is `<a role="heading" aria-level>`,
 *   since the link carries the class grammar.
 * - It is an OWNER too (`ownsParts:  header, content`):  a `<ui-header>` or `<ui-content>` inside it belongs to it.
 ****************/
export class UIHeader extends E.PartComponent<typeof headerVocabulary> {
  @E.proto static vocabulary = headerVocabulary

  render(): JSX.Element {
    return (
      <Dynamic
        component={this.rootTag}
        class={this.rootClass}
        part={this.partForName("header")}
        href={this.href}
        role={this.href && this.level ? "heading" : undefined}
        aria-level={this.href ? this.level : undefined}
      >
        <slot />
      </Dynamic>
    )
  }

  /** `<a>` for `href`, `<hN>` for `level`, else `<div>`. */
  protected get rootTag(): string {
    if (this.href) return "a"
    const level = this.level ? (Number(this.level) as UIT.HeaderLevel) : undefined
    return level ? `h${level}` : "div"
  }

  /** Standalone:  the class grammar;  owned:  the bare noun. */
  get rootClass(): string {
    return this.context.ownerNoun ? this.vocabulary.noun : super.rootClass
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIHeader extends E.AttributeValues<typeof headerVocabulary> {}
