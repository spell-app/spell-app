import { SourceError } from "$/ui/runtime"

import { MAX_DEPTH, ORIGINAL_PREFIX, URL_ATTRIBUTES, URL_SELECTOR } from "./elements.types"

/****************
 * ### `SourceMarkup`
 * Fetched HTML made ready for this page -- what `<ui-include>` and the source BODIES of `<ui-section>` /
 * `<ui-accordion>` (`SourceBody`) share, so markup from a file goes in the same way everywhere.
 * - `parse()`:  the file's `<body>` content (or its first `select` match) as a fragment of THIS document;  parsed by
 *   `DOMParser`, so its scripts never run and its `<head>` is dropped.
 * - `rewriteUrls()`:  relative `href` / `src` / `action` / `poster` / `source` point where they did in the file;
 *   each original is kept beside it (`data-ui-include-*`), which `restoreUrls()` puts back.
 * - `refusal()`:  a source inside a source of the same file, or nested deeper than `MAX_DEPTH`.
 * - Static only:  plain DOM, no Solid, no state.
 ****************/
export class SourceMarkup {
  /**
   * `text`'s markup as a fragment of `page`:  `<body>`'s content or the first `select` match, URLs rewritten against
   * `source`.
   * - Returns a `render` `SourceError` for a selector that's invalid or matches nothing.
   */
  static parse(text: string, { page, source, select }: SourceMarkupOptions): DocumentFragment | SourceError {
    const parsed = new DOMParser().parseFromString(text, "text/html")
    let nodes: Node[]
    if (select) {
      let match: Element | null
      try {
        match = parsed.querySelector(select)
      } catch {
        return new SourceError("render", `"${select}" isn't a CSS selector`)
      }
      if (!match) return new SourceError("render", `Nothing in ${source ?? "the content"} matches "${select}"`)
      nodes = [match]
    } else nodes = [...parsed.body.childNodes]
    const fragment = page.createDocumentFragment()
    for (const node of nodes) fragment.append(page.importNode(node, true))
    if (source) SourceMarkup.rewriteUrls(fragment, source, page)
    return fragment
  }

  /**
   * Point relative URLs in `root` where they pointed in `source`, keeping each original beside it.
   * - Skips `#hash` links and URLs that resolve the same against the page.
   */
  static rewriteUrls(root: ParentNode, source: string, page: Document) {
    const base = new URL(source, page.baseURI)
    for (const element of root.querySelectorAll(URL_SELECTOR)) {
      for (const name of URL_ATTRIBUTES) {
        const value = element.getAttribute(name)
        if (value === null || value.startsWith("#")) continue
        let absolute: string
        try {
          absolute = new URL(value, base).href
        } catch {
          continue
        }
        if (absolute === new URL(value, page.baseURI).href) continue
        element.setAttribute(ORIGINAL_PREFIX + name, value)
        element.setAttribute(name, absolute)
      }
    }
  }

  /** Every rewritten URL under `root` back as written, the kept originals removed (for saving). */
  static restoreUrls(root: ParentNode) {
    for (const element of root.querySelectorAll("*")) {
      for (const name of URL_ATTRIBUTES) {
        const original = element.getAttribute(ORIGINAL_PREFIX + name)
        if (original === null) continue
        element.setAttribute(name, original)
        element.removeAttribute(ORIGINAL_PREFIX + name)
      }
    }
  }

  /**
   * A reason `host` must NOT load `source`:  an enclosing source of the same file (it would include itself), or more
   * than `MAX_DEPTH` enclosing sources;  `undefined` when it may.
   * - `counts` says which ancestors are sources (`<ui-include>`:  other includes;  a body:  anything with `source`).
   * - Climbs out of shadow roots.
   */
  static refusal(host: Element, source: string, counts: (element: Element) => boolean): SourceError | undefined {
    const base = host.ownerDocument.baseURI
    const url = new URL(source, base).href
    let depth = 0
    for (let node = SourceMarkup.parentOf(host); node; node = SourceMarkup.parentOf(node)) {
      if (!counts(node)) continue
      depth++
      const outer = node.getAttribute(SOURCE_ATTRIBUTE)
      if (outer && new URL(outer, base).href === url) return new SourceError("render", `${source} includes itself`)
    }
    if (depth >= MAX_DEPTH) return new SourceError("render", `${source}:  sources nested more than ${MAX_DEPTH} deep`)
    return undefined
  }

  /** `element`'s parent, stepping out of shadow roots. */
  private static parentOf(element: Element): Element | undefined {
    const parent = element.parentNode
    if (parent instanceof ShadowRoot) return parent.host
    return parent instanceof Element ? parent : undefined
  }
}

/** Options of `SourceMarkup.parse()`. */
export type SourceMarkupOptions = {
  /** the document the fragment is for */
  page: Document
  /** `source` as written:  URLs are rewritten against it, errors name it */
  source?: string
  /** CSS selector:  only its first match goes in */
  select?: string
}

/** The attribute naming an element's file. */
const SOURCE_ATTRIBUTE = "source"
