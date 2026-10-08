import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { BreadcrumbDivider } from "./BreadcrumbDivider"
import { breadcrumbVocabulary } from "./UIBreadcrumb.en"

import breadcrumbCSS from "./UIBreadcrumb.css?inline"

/****************
 * ### `UIBreadcrumb`
 * The component behind `<ui-breadcrumb>`:  a trail of links to the pages above this one, in WAI-ARIA's pattern.
 *
 * - Its shadow DOM is `<nav class="ui … breadcrumb" part="breadcrumb" aria-label>`,
 *   around `<ol part="list"><slot></slot></ol>`:  the `<ui-breadcrumb-section>`s are its list items.
 *
 * - Dividers:  each section draws its OWN leading divider,
 *   from inherited tokens this component publishes INLINE on its box (`UIT.BreadcrumbDividerTokens`),
 *   so no JS reaches into the sections:
 *   - `divider="›"` => `--ui-breadcrumb-divider: "›"`, serialized as a CSS string;  only when the attribute is
 *     set, so a page theming the token on a wrapper isn't overridden (the sheet's own fallback is `/`)
 *   - `divider-icon="chevron right"` => `--ui-breadcrumb-divider-icon: url("data:image/svg+xml,…")` of the glyph
 *     (painted as a mask in `currentColor`) + `--_ui-breadcrumb-divider-layout: icon`, once the glyph has loaded;
 *     it wins over `divider`
 *
 * - `aria-label`:  the element's, moved to the `<nav>` (two trails on one page need distinct landmark names),
 *   else the translated `label` text ("Breadcrumb").
 ****************/
export class UIBreadcrumb extends E.UIComponent<typeof breadcrumbVocabulary> {
  @E.proto static vocabulary = breadcrumbVocabulary
  @E.proto static styleSheets = { breadcrumb: breadcrumbCSS }
  @E.proto static elementSetup = { delegatesFocus: false } satisfies Partial<E.ElementSetup>

  render(): JSX.Element {
    return (
      <nav
        class={this.rootClasses}
        part={this.partForName("breadcrumb")}
        aria-label={this.attributes["aria-label"] ?? this.translationForKey("label")}
        style={this.dividerTokens}
      >
        <ol part={this.partForName("list")}>
          <slot />
        </ol>
      </nav>
    )
  }

  ////////////////
  // ## Dividers
  ////////////////

  /** Glyph of `divider-icon`. */
  readonly dividerIconGlyph = new E.IconGlyph({ owner: this, name: () => this.dividerIcon || undefined })

  /** Inline divider tokens for the root;  `undefined` values are removed. */
  @E.derived
  get dividerTokens(): Record<string, string | undefined> {
    const { divider } = this
    const icon = this.dividerIcon ? this.dividerIconUrl : undefined
    return {
      [UIT.BreadcrumbDividerTokens.text]: divider === undefined ? undefined : BreadcrumbDivider.cssString(divider),
      [UIT.BreadcrumbDividerTokens.icon]: icon,
      [UIT.BreadcrumbDividerTokens.layout]: icon ? ICON_LAYOUT : undefined
    }
  }

  /**
   * `divider-icon`'s glyph as a CSS `url()`, once loaded;  tracked.
   * - A server render (`$/ui/static`) has no `<svg>` template (`svgTemplate` stays empty):  the url comes from
   *   the icon's markup, read at once.
   */
  private get dividerIconUrl(): string | undefined {
    if (isServer) {
      const name = this.dividerIcon
      const markup = name && E.IconGlyph.serverMarkup?.(E.IconGlyph.packsFor(this.domElement, UI.icons), name)
      return markup ? BreadcrumbDivider.markupUrl(markup) : undefined
    }
    const data = this.dividerIconGlyph.svgTemplate
    return data ? BreadcrumbDivider.svgUrl(data) : undefined
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIBreadcrumb extends E.AttributeValues<typeof breadcrumbVocabulary> {}

/** `--_ui-breadcrumb-divider-layout` while an icon divider is set. */
const ICON_LAYOUT = "icon"
