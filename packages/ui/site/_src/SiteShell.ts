import { URL_ATTRIBUTES, URL_SELECTOR } from "$/ui/core"

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
 ****************/
export class SiteShell {
  /** The layout, from the site's root. */
  static readonly LAYOUT = "_parts/layout.html"

  /** Class on `<html>` once the shell is done (mounted or not):  `site.css` shows the page's `main` again. */
  static readonly MOUNTED_CLASS = "site-mounted"

  /** Where the layout takes the page's `main`. */
  static readonly CONTENT_SELECTOR = ".site-content"

  /**
   * Wrap the page's `main` in the layout;  resolves with the layout's content box, or `undefined` when the page has
   * no bare `main` or the layout didn't load.
   * - SIDE EFFECTS:  prepends the layout's `<body>` content to the page's;  moves `main` into it;  adds
   *   `MOUNTED_CLASS` to `<html>` whatever happens.
   */
  static async mount(siteRoot: URL): Promise<HTMLElement | undefined> {
    const main = document.querySelector<HTMLElement>("body > main#main")
    try {
      if (!main) return undefined
      const url = new URL(SiteShell.LAYOUT, siteRoot)
      const response = await fetch(url)
      if (!response.ok) throw new Error(`${url.href}:  ${response.status}`)
      const parsed = new DOMParser().parseFromString(await response.text(), "text/html")
      SiteShell.absolutize(parsed.body, url)
      const fragment = document.createDocumentFragment()
      for (const node of [...parsed.body.childNodes]) fragment.append(document.importNode(node, true))
      const content = fragment.querySelector<HTMLElement>(SiteShell.CONTENT_SELECTOR)
      if (!content) throw new Error(`${url.href}:  no ${SiteShell.CONTENT_SELECTOR}`)
      content.append(main)
      document.body.prepend(fragment)
      return content
    } catch (error) {
      console.warn("Spell UI site:  couldn't mount the layout;  showing the page alone", error)
      return undefined
    } finally {
      document.documentElement.classList.add(SiteShell.MOUNTED_CLASS)
    }
  }

  /**
   * Make every relative URL under `root` absolute against `base`:  same-origin ones as a path (`/ui/index.html`),
   * others in full.  In-page links (`#id`) and URLs with a scheme stay.
   */
  static absolutize(root: ParentNode, base: URL | string): void {
    for (const element of root.querySelectorAll(URL_SELECTOR)) {
      for (const name of URL_ATTRIBUTES) {
        const value = element.getAttribute(name)
        if (value === null || value === "" || value.startsWith("#") || SiteShell.SCHEME.test(value)) continue
        let url: URL
        try {
          url = new URL(value, base)
        } catch {
          continue
        }
        element.setAttribute(name, url.origin === location.origin ? url.pathname + url.search + url.hash : url.href)
      }
    }
  }

  /** A URL that names its own scheme (`https:`, `mailto:`, `data:` ...), or starts at the root (`/x`, `//host`). */
  private static readonly SCHEME = /^([a-z][a-z0-9+.-]*:|\/)/i
}
