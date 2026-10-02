import { UI } from "$/ui/runtime"

import { ComponentBrowser } from "./component-browser"
import "$/ui/components/ui-root"
import { SiteStorage } from "./storage"

/**
 * Behaviour for `layouts/Docs.astro`:  colour scheme, Classic theme, mobile menu, "On this page" index, and the
 * sidebar's component browser (`ComponentBrowser`).
 * - Imports `<ui-root>`, which wraps every page (`layouts/Docs.astro`) and loads the family of each `ui-*` tag on it.
 * - Loads the `UI` runtime like any page using the library would, which also starts mirroring
 *   `#ui-app-stylesheet` into component shadow roots.
 * - Preferences persist in `localStorage` (`SiteStorage`, wrapped:  private windows may throw);  the scheme is also
 *   re-applied by an inline `<head>` script before first paint.
 */
class SiteLayout {
  /** `localStorage` key for the scheme:  `light`, `dark`, or absent for System. */
  static readonly SCHEME_KEY = "spell-ui-site:scheme"
  /** `localStorage` key for the Classic theme:  `"1"` when on. */
  static readonly CLASSIC_KEY = "spell-ui-site:classic"

  /** Wire everything up;  call once. */
  start() {
    this.initScheme()
    this.initClassic()
    this.initMenu()
    this.initToc()
    ComponentBrowser.start()
  }

  ////////////////
  // ## Colour scheme
  ////////////////

  /**
   * Light / Dark / System radios:  toggle `ui-light` / `ui-dark` on `<html>`.
   * - System removes both, so `color-scheme: light dark` (from `tokens.css`) follows the OS.
   */
  private initScheme() {
    const saved = SiteStorage.read(SiteLayout.SCHEME_KEY) ?? "system"
    const radios = document.querySelectorAll<HTMLInputElement>('[data-scheme] input[type="radio"]')
    for (const radio of radios) {
      radio.checked = radio.value === saved
      radio.addEventListener("change", () => radio.checked && this.setScheme(radio.value))
    }
  }

  /** Apply and persist `scheme`. */
  private setScheme(scheme: string) {
    const root = document.documentElement
    root.classList.toggle("ui-light", scheme === "light")
    root.classList.toggle("ui-dark", scheme === "dark")
    SiteStorage.write(SiteLayout.SCHEME_KEY, scheme === "system" ? undefined : scheme)
  }

  ////////////////
  // ## Classic theme
  ////////////////

  /**
   * Classic toggle:  adopt `themes/classic.css` onto the document through the runtime's style registry.
   * - `UI.styles` has no un-register, but re-registering a name with new text REPLACES that sheet's rules in
   *   place, so "off" registers `""` -- the (now empty) sheet stays adopted, harmlessly.
   * - `$/ui/styles` is imported lazily:  it holds every foundation sheet as text, and only this toggle needs it
   *   here (the runtime chunk imports it anyway, so it's a shared chunk, not a second copy).
   */
  private initClassic() {
    const toggle = document.querySelector<HTMLInputElement>("[data-classic]")
    if (!toggle) return
    toggle.checked = SiteStorage.read(SiteLayout.CLASSIC_KEY) === "1"
    if (toggle.checked) void this.setClassic(true)
    toggle.addEventListener("change", () => void this.setClassic(toggle.checked))
  }

  /** Turn the Classic theme on or off, and persist it. */
  private async setClassic(on: boolean) {
    SiteStorage.write(SiteLayout.CLASSIC_KEY, on ? "1" : undefined)
    const [{ classicThemeCSS }] = await Promise.all([import("$/ui/styles"), UI.load()])
    UI.styles.register("classic", on ? classicThemeCSS : "", { page: true })
  }

  ////////////////
  // ## Mobile menu
  ////////////////

  /** Menu button (under 768px only, per CSS):  shows the sidebar;  Escape or a link click closes it. */
  private initMenu() {
    const button = document.querySelector<HTMLButtonElement>("[data-menu-button]")
    const shell = document.querySelector<HTMLElement>("[data-shell]")
    const sidebar = document.querySelector<HTMLElement>("[data-sidebar]")
    if (!button || !shell || !sidebar) return
    button.addEventListener("click", () => setOpen(button.getAttribute("aria-expanded") !== "true"))
    sidebar.addEventListener("click", (event) => (event.target as Element).closest("a") && setOpen(false))
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
        setOpen(false)
        button.focus()
      }
    })

    /** Open or close the sidebar menu. */
    function setOpen(open: boolean) {
      button!.setAttribute("aria-expanded", String(open))
      shell!.toggleAttribute("data-menu-open", open)
    }
  }

  ////////////////
  // ## On this page
  ////////////////

  /**
   * Build the right-hand index from the content's `h2[id]`s, and highlight the section being read.
   * - Hidden when a page has fewer than two sections.
   * - Built client-side so `.astro` pages, MDX pages and component pages all get it with no plumbing.
   */
  private initToc() {
    const aside = document.querySelector<HTMLElement>("[data-toc]")
    const list = aside?.querySelector("[data-toc-list]")
    const headings = [...document.querySelectorAll<HTMLHeadingElement>("[data-content] h2[id]")]
    if (!aside || !list || headings.length < 2) return
    const links = new Map<Element, HTMLAnchorElement>()
    for (const heading of headings) {
      const item = document.createElement("li")
      const link = document.createElement("a")
      link.href = `#${heading.id}`
      link.className = "site-toc-link"
      // the heading's own text, minus its "#" self-link
      link.textContent = [...heading.childNodes]
        .filter((node) => !(node instanceof HTMLAnchorElement))
        .map((node) => node.textContent)
        .join("")
        .trim()
      item.append(link)
      list.append(item)
      links.set(heading, link)
    }
    aside.hidden = false
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (!visible) return
        for (const link of links.values()) link.removeAttribute("aria-current")
        links.get(visible.target)?.setAttribute("aria-current", "true")
      },
      { rootMargin: "0px 0px -70% 0px" }
    )
    for (const heading of headings) observer.observe(heading)
  }
}

new SiteLayout().start()
void UI.load()
