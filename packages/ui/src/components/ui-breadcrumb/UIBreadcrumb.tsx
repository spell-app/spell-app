import { createMemo } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { BreadcrumbDivider } from "./BreadcrumbDivider"
import { BreadcrumbFallback } from "./ui-breadcrumb.fallback"
import { breadcrumbVocabulary } from "./ui-breadcrumb.vocabulary.en"

import breadcrumbCSS from "./ui-breadcrumb.css?inline"

/****************
 * ### `<ui-breadcrumb>`
 * A breadcrumb trail, WAI-ARIA's pattern:  `<nav class="ui … breadcrumb" part="breadcrumb" aria-label>` around
 * `<ol part="list"><slot></slot></ol>`;  the `<ui-breadcrumb-section>`s are its list items.
 * - Dividers:  each section draws its OWN leading divider from inherited tokens this root publishes INLINE
 *   (`UIT.BreadcrumbDividerTokens`), so no JS reaches into the sections:
 *   - `divider="›"` => `--ui-breadcrumb-divider: "›"`, serialized as a CSS string;  only when the attribute is
 *     set, so a page theming the token on a wrapper isn't overridden (the sheet's own fallback is `/`)
 *   - `divider-icon="chevron right"` => `--ui-breadcrumb-divider-icon: url("data:image/svg+xml,…")` of the glyph
 *     (painted as a mask in `currentColor`) + `--_ui-breadcrumb-divider-layout: icon`, once the glyph has loaded;
 *     it wins over `divider`
 * - `aria-label`:  the host's, forwarded (two trails on one page need distinct landmark names), else the
 *   translated `label` text ("Breadcrumb").
 ****************/
export class UIBreadcrumb extends E.UIElement<typeof breadcrumbVocabulary> {
  @E.proto static vocabulary = breadcrumbVocabulary
  @E.proto static styles = { breadcrumb: breadcrumbCSS }
  @E.proto static Fallback = BreadcrumbFallback
  @E.proto static delegatesFocus = false

  /** Host `aria-label`, forwarded to the `<nav>`:  two breadcrumbs on one page need distinct names. */
  readonly ariaLabel = new E.HostAttribute({ host: this.host, name: UIT.ARIA_LABEL })

  /** Glyph of `divider-icon`. */
  readonly glyph = new E.IconGlyph({ owner: this, name: () => this.attrs.dividerIcon || undefined })

  /** Inline divider tokens for the root;  `undefined` values are removed. */
  readonly tokens = createMemo(() => {
    const divider = this.attrs.divider
    const icon = this.attrs.dividerIcon ? this.dividerIcon() : undefined
    return {
      [UIT.BreadcrumbDividerTokens.text]: divider === undefined ? undefined : BreadcrumbDivider.cssString(divider),
      [UIT.BreadcrumbDividerTokens.icon]: icon,
      [UIT.BreadcrumbDividerTokens.layout]: icon ? ICON_LAYOUT : undefined
    }
  })

  render(): JSX.Element {
    return (
      <nav
        class={this.classes()}
        part={this.part("breadcrumb")}
        aria-label={this.ariaLabel.get() ?? this.text("label")}
        style={this.tokens()}
      >
        <ol part={this.part("list")}>
          <slot />
        </ol>
      </nav>
    )
  }

  /**
   * `divider-icon`'s glyph as a CSS `url()`, once loaded;  tracked.
   * - A server render (`$/ui/static`) has no `<svg>` template (`glyph.data` stays empty):  the url comes from the
   *   icon's markup, read at once.
   */
  private dividerIcon(): string | undefined {
    if (isServer) {
      const name = this.attrs.dividerIcon
      const markup = name && E.IconGlyph.serverMarkup?.(E.IconGlyph.packsFor(this.host, UI.icons), name)
      return markup ? BreadcrumbDivider.markupUrl(markup) : undefined
    }
    const data = this.glyph.data.get()
    return data ? BreadcrumbDivider.svgUrl(data) : undefined
  }
}

/** `--_ui-breadcrumb-divider-layout` while an icon divider is set. */
const ICON_LAYOUT = "icon"
