import { E } from "$/ui/core"

/****************
 * ### `SourceMarkup`
 * Fetched HTML made ready for this page -- what `<ui-include>` and the source BODIES of `<ui-section>` /
 * `<ui-accordion>` (`SourceBody`) share, so markup from a file goes in the same way everywhere.
 * - `parse()`:  the file's `<body>` content (or its first `select` match) as a fragment of THIS document;  parsed by
 *   `DOMParser`, so its scripts never run and its `<head>` is dropped.
 * - `rewriteUrls()`:  relative `href` / `src` / `action` / `poster` / `source` point where they did in the file;
 *   each original is kept beside it (`data-ui-include-*`), which `restoreUrls()` puts back.
 * - `checkNesting()`:  throws for a source inside a source of the same file, or nested deeper than `MAX_DEPTH`.
 * - Static only:  plain DOM, no Solid, no state.  Imports no element class:  `UIInclude` and `SourceBody` call it.
 ****************/
export class SourceMarkup {
  /**
   * `text`'s markup as a fragment of `page`:  `<body>`'s content or the first `select` match, URLs rewritten against
   * `source`.
   * - Throws a `render` `SourceError` for a selector that's invalid or matches nothing.
   */
  static parse(text: string, { page, source, select }: SourceMarkupOptions): DocumentFragment {
    const parsed = new DOMParser().parseFromString(text, "text/html")
    let nodes: Node[]
    if (select) {
      let match: Element | null
      try {
        match = parsed.querySelector(select)
      } catch (error) {
        throw new E.SourceError(`SourceMarkup.parse():  "${select}" isn't a CSS selector;  fix \`select\``, {
          cause: { kind: "render", error }
        })
      }
      if (!match) {
        throw new E.SourceError(
          `SourceMarkup.parse():  nothing in ${source ?? "the content"} matches "${select}";  fix \`select\``,
          { cause: { kind: "render" } }
        )
      }
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
    for (const element of root.querySelectorAll(E.URL_SELECTOR)) {
      for (const name of E.URL_ATTRIBUTES) {
        const value = element.getAttribute(name)
        if (value === null || value.startsWith("#")) continue
        let absolute: string
        try {
          absolute = new URL(value, base).href
        } catch {
          continue
        }
        if (absolute === new URL(value, page.baseURI).href) continue
        element.setAttribute(E.ORIGINAL_PREFIX + name, value)
        element.setAttribute(name, absolute)
      }
    }
  }

  /** Every rewritten URL under `root` back as written, the kept originals removed (for saving). */
  static restoreUrls(root: ParentNode) {
    for (const element of root.querySelectorAll("*")) {
      for (const name of E.URL_ATTRIBUTES) {
        const original = element.getAttribute(E.ORIGINAL_PREFIX + name)
        if (original === null) continue
        element.setAttribute(name, original)
        element.removeAttribute(E.ORIGINAL_PREFIX + name)
      }
    }
  }

  /**
   * Throws a `render` `SourceError` when `host` must NOT load `source`:  an enclosing source of the same file (it
   * would include itself), or more than `MAX_DEPTH` enclosing sources.
   * - `counts` says which ancestors are sources (`<ui-include>`:  other includes;  a body:  anything with `source`).
   * - Climbs out of shadow roots.
   */
  static checkNesting(host: Element, source: string, counts: (element: Element) => boolean) {
    const base = host.ownerDocument.baseURI
    const url = new URL(source, base).href
    let depth = 0
    for (let node = SourceMarkup.parentFor(host); node; node = SourceMarkup.parentFor(node)) {
      if (!counts(node)) continue
      depth++
      const outer = node.getAttribute(E.SOURCE_ATTRIBUTE)
      if (outer && new URL(outer, base).href === url) {
        throw new E.SourceError(
          `SourceMarkup.checkNesting():  ${source} includes itself;  point \`source\` elsewhere`,
          {
            cause: { kind: "render" }
          }
        )
      }
    }
    if (depth >= E.MAX_DEPTH) {
      throw new E.SourceError(
        `SourceMarkup.checkNesting():  ${source} is nested more than ${E.MAX_DEPTH} sources deep;  look for a cycle`,
        { cause: { kind: "render" } }
      )
    }
  }

  /**
   * `element`'s parent in the DOM tree, stepping out of shadow roots;  `undefined` at the top.
   * - The DOM tree, NOT the flat tree (`flatParentFor()`):  the enclosing sources are the markup's ancestors,
   *   whatever slot it's shown in.
   * - `nodeType`, never `instanceof ShadowRoot` / `Element`:  the static render's hosts are linkedom elements
   *   (`AGENTS.md` "Solid authoring" › SSR).
   */
  private static parentFor(element: Element): Element | undefined {
    const parent = element.parentNode
    if (parent?.nodeType === E.NodeType.element) return parent as Element
    if (parent?.nodeType === E.NodeType.documentFragment) return (parent as Partial<ShadowRoot>).host
    return undefined
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
