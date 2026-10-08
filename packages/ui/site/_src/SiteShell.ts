import { E } from "$/ui/core"
import { SiteData } from "$/ui/docs-components/SiteData"
import { PAGE_MAIN } from "./site.types"

/****************
 * ### `SiteShell`
 * Puts the page in the site's ONE layout (`_parts/layout.html`) on first load:  a page's own file holds only its
 * `<head>` and `<main id="main" class="site-main">`, so the chrome (top bar, nav, footer ...) is written once.
 * - Mounts BEFORE `<ui-root>` is defined (`site.ts`), so the root's `display="when-ready"` keeps the whole page
 *   hidden until the layout is in and every element in it is ready:  no flash of unstyled markup, no jump.
 * - Until then, `site.css` hides the bare `main` (`html:not(.site-mounted)`);  a page that can't fetch the layout
 *   (opened from disk, a failed fetch) shows its `main` alone.
 * - Every relative URL in the layout is made absolute as it mounts:  the layout stays while the router changes the
 *   page's URL under it.
 * - Static only:  one layout per page.
 ****************/
export class SiteShell {
  /**
   * Wrap the page's `main` in the layout;  resolves with the layout's content box, or `undefined` when the page has
   * no bare `main` or the layout didn't load.
   * - SIDE EFFECTS:  prepends the layout's `<body>` content to the page's;  moves `main` into it;  adds
   *   `MOUNTED_CLASS` to `<html>` whatever happens.
   * - NEVER throws:  a layout that doesn't come is a warning (`E.Warnings`), and the page shows alone.
   */
  static async mount(siteRoot: URL): Promise<HTMLElement | undefined> {
    const main = document.querySelector<HTMLElement>(`body > ${PAGE_MAIN}`)
    try {
      if (!main) return undefined
      const url = new URL(LAYOUT, siteRoot).href
      const response = await SiteData.request(url, { method: "SiteShell.mount()", fix: `check ${LAYOUT}` })
      const parsed = new DOMParser().parseFromString(await response.text(), "text/html")
      SiteShell.absolutize(parsed.body, url)
      const fragment = document.createDocumentFragment()
      for (const node of [...parsed.body.childNodes]) fragment.append(document.importNode(node, true))
      const content = fragment.querySelector<HTMLElement>(CONTENT_SELECTOR)
      if (!content) {
        throw new E.SourceError(`SiteShell.mount():  ${url} has no ${CONTENT_SELECTOR};  add one to ${LAYOUT}`, {
          cause: { kind: "render" }
        })
      }
      content.append(main)
      document.body.prepend(fragment)
      return content
    } catch (error) {
      E.Warnings.warn("Spell UI site", "couldn't mount the layout;  showing the page alone", error)
      return undefined
    } finally {
      document.documentElement.classList.add(MOUNTED_CLASS)
    }
  }

  /**
   * Make every relative URL under `root` absolute against `base`:  same-origin ones as a path (`/ui/index.html`),
   * others in full.  In-page links (`#id`) and URLs with a scheme stay.
   */
  static absolutize(root: ParentNode, base: URL | string): void {
    for (const element of root.querySelectorAll(E.URL_SELECTOR)) {
      for (const name of E.URL_ATTRIBUTES) {
        const value = element.getAttribute(name)
        if (value === null || value === "" || value.startsWith("#") || SCHEME.test(value)) continue
        const url = SiteShell.urlFor(value, base)
        if (url)
          element.setAttribute(name, url.origin === location.origin ? url.pathname + url.search + url.hash : url.href)
      }
    }
  }

  /** `value` as a URL against `base`;  `undefined` when it isn't one. */
  private static urlFor(value: string, base: URL | string): URL | undefined {
    try {
      return new URL(value, base)
    } catch {
      return undefined
    }
  }
}

/** The layout, from the site's root. */
const LAYOUT = "_parts/layout.html"

/** Class on `<html>` once the shell is done (mounted or not):  `site.css` shows the page's `main` again. */
const MOUNTED_CLASS = "site-mounted"

/** Where the layout takes the page's `main`. */
const CONTENT_SELECTOR = ".site-content"

/** A URL that names its own scheme (`https:`, `mailto:`, `data:` ...), or starts at the root (`/x`, `//host`). */
const SCHEME = /^([a-z][a-z0-9+.-]*:|\/)/i
