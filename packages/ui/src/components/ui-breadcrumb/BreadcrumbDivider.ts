/****************
 * ### `BreadcrumbDivider`
 * Values of the divider tokens a breadcrumb publishes (`BREADCRUMB_DIVIDER_TOKENS`), as CSS text -- shared by
 * `<ui-breadcrumb>` and its native fallback, so plain DOM, no Solid.
 ****************/

import { LINE_BREAK, SVG_NS, SVG_START, XMLNS } from "./ui-breadcrumb.types"
export class BreadcrumbDivider {
  /** `text` as a CSS string:  quoted, with `\`, `"` and line breaks escaped (`\A `), e.g. `›` => `"›"`. */
  static cssString(text: string): string {
    return `"${text.replaceAll("\\", "\\\\").replaceAll('"', '\\"').replace(LINE_BREAK, "\\A ")}"`
  }

  /**
   * An icon's `<svg>` as a CSS `url()` of a standalone SVG, for the divider's mask.
   * - Serialized from the page's template, so no second request;  only its shape matters to a mask.
   */
  static svgUrl(svg: SVGSVGElement): string {
    const copy = svg.cloneNode(true) as SVGSVGElement
    copy.setAttribute(XMLNS, SVG_NS)
    return BreadcrumbDivider.dataUrl(new XMLSerializer().serializeToString(copy))
  }

  /**
   * The same from an icon's SVG MARKUP, for a static server render (`$/ui/static`:  no DOM to clone or serialize).
   * - Adds the SVG namespace when the markup lacks it.
   */
  static markupUrl(markup: string): string {
    const standalone = markup.replace(SVG_START, (tag, attributes: string) =>
      new RegExp(`\\s${XMLNS}=`).test(attributes) ? tag : `<svg ${XMLNS}="${SVG_NS}"${attributes}>`
    )
    return BreadcrumbDivider.dataUrl(standalone)
  }

  /** `svg` text as a CSS `url()` of a data URL. */
  private static dataUrl(svg: string): string {
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
  }
}
