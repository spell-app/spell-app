/****************
 * ### `BreadcrumbDivider`
 * Values of the divider tokens a breadcrumb publishes (`BREADCRUMB_DIVIDER_TOKENS`), as CSS text -- shared by
 * `<ui-breadcrumb>` and its native fallback, so plain DOM, no Solid.
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
    copy.setAttribute(XMLNS, SVG_NS)
    return `url("data:image/svg+xml,${encodeURIComponent(new XMLSerializer().serializeToString(copy))}")`
  }
}

/** SVG namespace, for the data URL's root:  a standalone SVG image needs it. */
const SVG_NS = "http://www.w3.org/2000/svg"

/** Attribute declaring it. */
const XMLNS = "xmlns"

/** Line breaks, escaped in a CSS string. */
const LINE_BREAK = /\r\n|\r|\n/g
