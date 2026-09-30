import { Dynamic, type JSX } from "@solidjs/web"

import { proto } from "$/util"
import type { ComponentVocabulary } from "$/vocabulary"

import type { PartName } from "./elements.types"
import { PartContext } from "./PartContext"
import { UIElement } from "./UIElement"

import partsCSS from "$/components/parts/parts.css?inline"

/**
 * Base of the generic content parts (`<ui-content>`, `<ui-header>`, `<ui-meta>` ...):  ONE element per part word,
 * styled by its OWNER (`:state(in-card)`), never `ui-card-header`.
 * - Owner:  `PartContext` resolves the nearest owner whose vocabulary `ownsParts` this noun, climbing the flat
 *   tree with a barrier at every non-part component, and keeps `:state(in-<owner>)` on the host.
 * - Markup:  `<div class="<noun> [keyOnly ...]" part="<noun>"><slot></slot></div>`;  subclasses change the tag
 *   (`tag()`:  `<a>` for `href`, `<time>`, `<span>`), the link / time attributes and the content.
 * - `--_ui-part`:  `parts.css` declares it on the ROOT from the noun class, never on the host -- a host
 *   declaring it would be what its own root's `@container style(--_ui-part: summary)` queries, so a date could
 *   never see the summary it sits in.
 * - Every part adopts `parts.css`;  `@proto static isPart` makes parts transparent to other parts' climbs.
 */
export abstract class ContentPart<V extends ComponentVocabulary = ComponentVocabulary> extends UIElement<V> {
  @proto static styles = { parts: partsCSS }
  @proto static isPart = true

  /** Owner context for this part's noun. */
  readonly context = new PartContext(this.host, this.vocabulary.noun)

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <Dynamic
        component={this.tag()}
        class={this.rootClass()}
        part={this.part(this.vocabulary.noun as PartName<V>)}
        href={this.href()}
        target={this.target()}
        datetime={this.datetime()}
        tabindex={this.tabIndex()}
      >
        {this.content()}
      </Dynamic>
    )
  }

  /** Root element name;  default `div`.  Tracked. */
  protected tag(): string {
    return "div"
  }

  /** Root classes;  default the class grammar (`[keyOnly ...] <noun>`, no `ui`).  Tracked. */
  protected rootClass(): string {
    return this.classes()
  }

  /** `href` of a link root.  Tracked. */
  protected href(): string | undefined {
    return undefined
  }

  /** `target` of a link root.  Tracked. */
  protected target(): string | undefined {
    return undefined
  }

  /** `datetime` of a `<time>` root.  Tracked. */
  protected datetime(): string | undefined {
    return undefined
  }

  /** `tabindex` of the root, e.g. `0` for a scrolling region (keyboard users must reach it).  Tracked. */
  protected tabIndex(): number | undefined {
    return undefined
  }

  /** Root content;  default the default slot. */
  protected content(): JSX.Element {
    return <slot />
  }
}
