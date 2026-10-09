import { Dynamic, type JSX } from "@solidjs/web"

// Import directly to avoid circular import
import { protoMerged } from "$/ui/util"
import { E } from "$/ui/core"
// Import directly to avoid circular import
import { UIComponent } from "./UIComponent"

import partsCSS from "$/ui/components/ui-parts/UIParts.css?inline"

/****************
 * ### `PartComponent`
 * The base class of the generic content parts' components (`<ui-content>`, `<ui-header>`, `<ui-meta>` ...):
 * ONE element per part word, styled by its OWNER (`:state(in-card)`), never a `ui-card-header`.
 * - Owner:  `PartContext` resolves the nearest owner whose vocabulary `ownsParts` this noun,
 *   climbing the flat tree with a barrier at every non-part component,
 *   and keeps `:state(in-<owner>)` on the DOM element.
 * - Markup:  `<div class="<noun> [keyOnly ...]" part="<noun>"><slot></slot></div>`.
 *   - Subclasses change the tag (`rootTag`:  `<a>` for `href`, `<time>`, `<span>`),
 *     the link / time attributes and the content.
 *   - `rootClass` is the class grammar (`[keyOnly ...] <noun>`, no `ui`).
 * - `--_ui-part`:  `UIParts.css` declares it on the ROOT from the noun class, never on the DOM element --
 *   a DOM element declaring it would be what its own root's `@container style(--_ui-part: summary)` queries,
 *   so a date could never see the summary it sits in.
 * - Every part adopts `UIParts.css`;  `elementSetup.isAPart` makes them transparent to other parts' climbs.
 * - The one element-core class that loads a family's file (`UIParts.css`):
 *   every part family shares the sheet, so it lands in `core`.
 *   It imports nothing else of `$/ui/components`.
 ****************/
export abstract class PartComponent<V extends E.ComponentVocabulary = E.ComponentVocabulary> extends UIComponent<V> {
  @protoMerged static elementSetup: Partial<E.ElementSetup> = { styleSheets: { parts: partsCSS }, isAPart: true }

  /** Owner context for this part's noun. */
  readonly context = new E.PartContext({ domElement: this.domElement, noun: this.vocabulary.noun })

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <Dynamic
        component={this.rootTag}
        class={this.rootClass}
        part={this.partForName(this.vocabulary.noun as E.PartName<V>)}
        href={this.rootHref}
        target={this.rootTarget}
        datetime={this.rootDatetime}
        tabindex={this.rootTabIndex}
      >
        {this.content()}
      </Dynamic>
    )
  }

  /**
   * Root element name;  default `div`.  Tracked.
   * - Named for the ROOT:  `tag` / `href` / `target` are the vocabulary's attribute getters (`this.href`).
   */
  protected get rootTag(): string {
    return "div"
  }

  /** `href` of a link root.  Tracked. */
  protected get rootHref(): string | undefined {
    return undefined
  }

  /** `target` of a link root.  Tracked. */
  protected get rootTarget(): string | undefined {
    return undefined
  }

  /** `datetime` of a `<time>` root.  Tracked. */
  protected get rootDatetime(): string | undefined {
    return undefined
  }

  /**
   * `tabindex` of the root, e.g. `0` for a scrolling region (keyboard users must reach it).
   * - Tracked.
   */
  protected get rootTabIndex(): number | undefined {
    return undefined
  }

  /** Root content;  default the default slot. */
  protected content(): JSX.Element {
    return <slot />
  }
}
