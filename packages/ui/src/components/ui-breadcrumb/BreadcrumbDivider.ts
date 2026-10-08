/****************
 * ### `BreadcrumbDivider`
 * The values of the divider tokens a breadcrumb publishes (`UIT.BreadcrumbDividerTokens`), as CSS text,
 * for `UIBreadcrumb`.
 * - Imports nothing:  plain DOM, no Solid, so a static server render uses it too.
 * - STATIC and instance-free:  pure conversions.
 ****************/
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
    copy.setAttribute("xmlns", "http://www.w3.org/2000/svg")
    return BreadcrumbDivider.dataUrl(new XMLSerializer().serializeToString(copy))
  }

  /**
   * The same from an icon's SVG MARKUP, for a static server render (`$/ui/static`:  no DOM to clone or serialize).
   * - Adds the SVG namespace when the markup lacks it.
   */
  static markupUrl(markup: string): string {
    const standalone = markup.replace(SVG_START, (tag, attributes: string) =>
      HAS_XMLNS.test(attributes) ? tag : `<svg xmlns="http://www.w3.org/2000/svg"${attributes}>`
    )
    return BreadcrumbDivider.dataUrl(standalone)
  }

  /** `svg` text as a CSS `url()` of a data URL. */
  private static dataUrl(svg: string): string {
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
  }
}

/** An `<svg>` start tag:  group 1 is the rest of the tag, its attributes. */
const SVG_START = /^\s*<svg\b([^>]*)>/

/** Attributes that declare `xmlns` already. */
const HAS_XMLNS = /\sxmlns=/

/** Line breaks, escaped in a CSS string. */
const LINE_BREAK = /\r\n|\r|\n/g
