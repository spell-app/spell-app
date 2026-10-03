/**
 * Whole pages turned static, for `spell static` (`packages/cli`):  every `ui-*` element of a `StaticCatalog` family
 * rendered to light DOM (`StaticRender.page()`), the scripts that load the elements removed, and the stylesheet that
 * styles what's left, linked or inline.
 * - Loaded through Vite's SSR (`StaticRenderer`, `server.ssrLoadModule(StaticRenderer.DOCUMENT)`), NEVER by node
 *   directly:  the controllers' JSX must compile for the server, as for `visual/StaticFixture.ts`.
 * - Node only, like `$/ui/server`.
 */

import { existsSync, readFileSync } from "node:fs"
import { dirname, relative, resolve, sep } from "node:path"
import { parseHTML } from "linkedom"
import { transform } from "lightningcss"
import postcss from "postcss"

import { StaticCatalog, StaticPageStyles, StaticRender, StaticStylesheet } from "$/ui/server"

import type { StaticDocumentOptions, StaticDocumentResult, StaticStylesheetResult } from "./tools.types.ts"

/****************
 * ### `StaticDocument`
 * One page in, its static twin out.  See the file header.
 ****************/
export class StaticDocument {
  /**
   * A `<script>` (its `src` or its text) or `<link rel="modulepreload">` (`href`) that loads the elements:  a static
   * page MUST NOT (an upgrade would take the flattened markup for slotted content, plan caveat C4).
   * - `@spell-app/ui...` and `$/ui...` imports;  `ui`'s own `src/` / `dist/`;  a family's folder (`ui-button/`)
   * - the docs' classic bundle, `spell-ui.js` (and `spell-ui-*.js`), which also holds the docs page runtime
   * - NOT import maps:  other modules may still need them, and they load nothing themselves.
   */
  static readonly ELEMENT_SCRIPT =
    /@spell-app\/ui\b|\$\/ui\b|\/ui\/(?:src|dist)\/|\/components\/ui-[\w-]+\/|\bspell-ui(?:[\w.-]*)\.js\b/

  /** `StaticCatalog`'s classes, once defined */
  private static defined = false

  /**
   * Render `html`, a whole document.
   * - SIDE EFFECT:  outside `shared`, clears `StaticRender.sheetUsage` first, so the stylesheet covers only this page.
   */
  static async render(html: string, options: StaticDocumentOptions = {}): Promise<StaticDocumentResult> {
    StaticDocument.define()
    if (options.shared && !options.href) throw new Error("StaticDocument:  a shared stylesheet needs an href")
    if (!options.shared) StaticRender.resetUsage()
    await StaticRender.prepare(html)
    const rendered = StaticRender.page(html)
    const tags = [...StaticRender.lastTags]
    const css = options.shared ? undefined : StaticDocument.stylesheet(tags, options.minify)

    const { document } = parseHTML(rendered)
    const inlined = options.input ? StaticDocument.inlineLinkedSheets(document, options.input, options.output) : []
    const dropped = StaticDocument.dropScripts(document)
    const head = StaticDocument.head(document)
    const sheet = document.createElement(options.href ? "link" : "style")
    if (options.href) {
      sheet.setAttribute("rel", "stylesheet")
      sheet.setAttribute("href", options.href)
    } else {
      sheet.textContent = css!.text
    }
    // FIRST, before the page's own CSS:  its `@layer ui-slotted, page, ui;` must set the layer order before a page
    // sheet names a `ui.*` layer (the docs' `spell-doc.css` does), or `page` would land AFTER `ui` and win
    const before = head.querySelector('link[rel~="stylesheet"], style')
    head.insertBefore(sheet, before)
    if (before) head.insertBefore(document.createTextNode("\n    "), before)

    return {
      html: (document.doctype ? "<!doctype html>\n" : "") + document.documentElement.outerHTML,
      css,
      tags,
      unrendered: StaticDocument.unrendered(document),
      dropped,
      inlined
    }
  }

  /**
   * The stylesheet for `tags`' families, after every page that uses them has rendered.
   * - `minify` (default `true`):  `minify()`.
   */
  static stylesheet(tags: Iterable<string>, minify = true): StaticStylesheetResult {
    StaticDocument.define()
    const families = [...new Set(tags)].map((tag) => StaticRender.families.get(tag)!).filter(Boolean)
    const full = StaticStylesheet.build(families, StaticRender.sheetUsage)
    const fullSize = Buffer.byteLength(full)
    if (!minify) return { text: full, fullSize }
    return { ...StaticDocument.minify(full), fullSize }
  }

  /**
   * `css` minified by Lightning CSS, which keeps `@scope`, `@layer`, `:where()` and `light-dark()` as written (no
   * `targets`:  nothing is lowered).
   * - Strict:  a rule it can't parse fails the minify rather than being dropped.  Then it falls back to stripping
   *   comments and blank lines (`minifyFallback` says why).
   */
  static minify(css: string): Omit<StaticStylesheetResult, "fullSize"> {
    try {
      const { code } = transform({ filename: "page.static.css", code: Buffer.from(css), minify: true })
      return { text: code.toString() }
    } catch (error) {
      const text = css
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\s*\n\s*/g, "\n")
        .trim()
      return { text, minifyFallback: error instanceof Error ? error.message : String(error) }
    }
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** Define `StaticCatalog`'s classes, once. */
  private static define() {
    if (StaticDocument.defined) return
    StaticRender.define(...StaticCatalog.classes)
    StaticDocument.defined = true
  }

  /**
   * The page's LOCAL linked stylesheets that say something about elements (`::part()`, `:state()`, `ui-*` tags),
   * replaced IN PLACE by a `<style>` holding the rewritten sheet (`StaticPageStyles`);  returns their hrefs.
   * - In place:  the cascade order stays what the page wrote;  no extra files to write or link.
   * - Relative `url()`s are rebased from the sheet's folder to the output page's.
   * - Left as links:  remote sheets, missing files, sheets the rewrite doesn't change, sheets that don't parse.
   * - NOTE:  `@import` inside a sheet isn't followed.
   */
  static inlineLinkedSheets(document: Document, input: string, output = input): string[] {
    const tags = StaticRender.tags()
    const inlined: string[] = []
    for (const link of [...document.querySelectorAll('link[rel~="stylesheet"][href]')]) {
      const href = link.getAttribute("href")!
      if (/^(?:[a-z][\w+.-]*:|\/\/)/i.test(href)) continue
      const file = resolve(dirname(input), href.split(/[?#]/)[0]!)
      if (!existsSync(file)) continue
      const css = readFileSync(file, "utf8")
      let rewritten: string
      try {
        rewritten = StaticPageStyles.rewrite(css, tags)
      } catch {
        continue
      }
      if (rewritten === postcss.parse(css).toString()) continue
      const style = document.createElement("style")
      style.setAttribute("data-static-from", href)
      style.textContent = StaticDocument.rebase(rewritten, dirname(file), dirname(output))
      link.replaceWith(style)
      inlined.push(href)
    }
    return inlined
  }

  /** `css`'s relative `url()`s, written for `from`, made relative to `to`. */
  private static rebase(css: string, from: string, to: string): string {
    return css.replace(URL, (match, quote: string, url: string) => {
      if (/^(?:[a-z][\w+.-]*:|\/|#)/i.test(url)) return match
      const moved = relative(to, resolve(from, url)).split(sep).join("/")
      return `url(${quote}${moved}${quote})`
    })
  }

  /** Remove `document`'s element-loading scripts (`ELEMENT_SCRIPT`);  returns what each loaded. */
  private static dropScripts(document: Document): string[] {
    const dropped: string[] = []
    for (const element of document.querySelectorAll('script, link[rel~="modulepreload"]')) {
      if (element.localName === "script" && element.getAttribute("type") === "importmap") continue
      const url = element.getAttribute(element.localName === "script" ? "src" : "href")
      if (!StaticDocument.ELEMENT_SCRIPT.test(url ?? element.textContent ?? "")) continue
      dropped.push(url ?? "inline")
      element.remove()
    }
    return dropped
  }

  /** `document`'s `<head>`, made first in `<html>` if it has none. */
  private static head(document: Document): HTMLHeadElement {
    let head = document.querySelector("head")
    if (!head) {
      head = document.createElement("head")
      document.documentElement.insertBefore(head, document.documentElement.firstChild)
    }
    return head
  }

  /** `ui-*` tags left in `document`, with how many. */
  private static unrendered(document: Document): Record<string, number> {
    const counts: Record<string, number> = {}
    for (const element of document.querySelectorAll("*")) {
      if (element.localName.startsWith("ui-")) counts[element.localName] = (counts[element.localName] ?? 0) + 1
    }
    return counts
  }
}

/** A `url(...)` in CSS:  its quote (or none) and its URL. */
const URL = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g
