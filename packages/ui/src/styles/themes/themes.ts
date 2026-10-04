import type { Styles } from "$/ui/runtime"

/**
 * The theme sheets in this folder, loaded on demand, and the one switch that applies them:  `ThemeSheets.apply()`.
 * - Registry:  a LITERAL `import.meta.glob("./*.css")`, so a new `<name>.css` here is a theme with no edit
 *   anywhere.  Lazy:  each sheet is its own chunk, loaded the first time it's applied, so `$/ui/styles` doesn't
 *   carry every theme.
 * - Fomantic's themes are DELTAS on Fomantic's default look, which is our `classic.css`.  So applying a Fomantic
 *   theme registers TWO sheets, `classic` then the theme, both `@layer ui.theme`:  the theme wins ties by order.
 * - Both go on the page AND into every component shadow root (`UI.styles.register(..., { page, shadow })`):
 *   - tokens on `:root` reach components by inheritance either way
 *   - the theme's class-grammar overrides (`.ui.button { ... }`) only reach component markup from INSIDE the root
 * - Three sheets here are NOT Fomantic themes, and are left out of `names`:
 *   - `classic`:  the base every Fomantic theme sits on;  `apply("classic")` applies it alone
 *   - `dark`:  a colour SCHEME, not a look;  switch it with `color-scheme` / `ui-dark` / `<ui-root theme>`, on top
 *     of any theme.  `apply("dark")` throws.
 *   - `spell`:  OUR OWN theme (`OWN`), the Spell brand;  applied exactly like a Fomantic theme (on `classic`), but
 *     a picker lists it apart from them
 * - Registry names in `UI.styles`:  `classic` (the base;  the same name the Astro site's toggle used) and `theme`
 *   (the current Fomantic theme).  ONE `theme` slot, so switching themes replaces its text in place.
 */
export class ThemeSheets {
  /** the base sheet every Fomantic theme is applied on top of */
  static readonly BASE = "classic"
  /** sheets in this folder that are not themes you pick from a list */
  static readonly NOT_THEMES: readonly string[] = [ThemeSheets.BASE, "dark"]
  /** our own themes (not Fomantic ports):  applied like one, listed apart from `names` */
  static readonly OWN: readonly string[] = ["spell"]
  /** `UI.styles` names:  base slot and theme slot */
  static readonly SLOTS = { base: "classic", theme: "theme" } as const

  /**
   * sheet name -> loader of its CSS text (`?inline`:  Lightning CSS-processed, minified in builds)
   * - NOTE: `import.meta.glob` MUST stay a literal call:  Vite rewrites it at build time.
   */
  static readonly loaders: Readonly<Record<string, () => Promise<string>>> = ThemeSheets.byName(
    import.meta.glob<string>("./*.css", { query: "?inline", import: "default" })
  )

  /** every sheet in this folder, `classic` and `dark` included, A-Z */
  static readonly sheets: readonly string[] = Object.keys(ThemeSheets.loaders).sort()

  /** the Fomantic themes:  every sheet but `NOT_THEMES` and `OWN`, A-Z */
  static readonly names: readonly string[] = ThemeSheets.sheets.filter(
    (name) => !ThemeSheets.NOT_THEMES.includes(name) && !ThemeSheets.OWN.includes(name)
  )

  /** name last passed to `apply()`, `undefined` for our own look */
  static current: string | undefined

  /** Is `name` a sheet in this folder? */
  static has(name: string): boolean {
    return name in ThemeSheets.loaders
  }

  /**
   * CSS text of sheet `name`.
   * - SIDE EFFECT:  first call loads its chunk;  the module cache makes later calls free.
   * - Throws on an unknown name.
   */
  static load(name: string): Promise<string> {
    const loader = ThemeSheets.loaders[name]
    if (!loader) throw new Error(`ThemeSheets: no theme "${name}" -- known:  ${ThemeSheets.sheets.join(", ")}`)
    return loader()
  }

  /**
   * Apply theme `name` page-wide, on the page and in every component shadow root.
   * - A Fomantic theme (`names`) or one of `OWN`:  `classic` + the theme.
   * - `"classic"`:  `classic` alone.
   * - `undefined` (or `""`):  neither, our own look.
   * - `styles`:  the registry to use, default the page runtime's `UI.styles` (loading the runtime if need be;
   *   a DYNAMIC import, so `$/ui/styles` stays free of the runtime chunk).
   * - Concurrent calls:  the LAST one wins, even if an earlier theme's chunk arrives after it.
   * - Throws on an unknown name, or `"dark"` (see the class docs).
   */
  static async apply(name: string | undefined, styles?: Styles): Promise<void> {
    if (name === "") name = undefined
    if (name !== undefined && (!ThemeSheets.has(name) || name === "dark")) {
      throw new Error(`ThemeSheets.apply: "${name}" isn't a theme -- known:  ${ThemeSheets.names.join(", ")}`)
    }
    const call = ++ThemeSheets.calls
    ThemeSheets.current = name
    const base = name === undefined ? "" : await ThemeSheets.load(ThemeSheets.BASE)
    const theme = name === undefined || name === ThemeSheets.BASE ? "" : await ThemeSheets.load(name)
    const registry = styles ?? (await ThemeSheets.pageStyles())
    if (call !== ThemeSheets.calls || !registry) return
    const options = { page: true, shadow: true }
    // `register()` keeps first-registration order, and the theme MUST follow the base:  without the base, drop
    // the theme first, so both go back in order
    if (!registry.has(ThemeSheets.SLOTS.base)) registry.register(ThemeSheets.SLOTS.theme, "", options)
    registry.register(ThemeSheets.SLOTS.base, base, options)
    registry.register(ThemeSheets.SLOTS.theme, theme, options)
  }

  ////////////////
  // ## Internals
  ////////////////

  /** counts `apply()` calls, so a slow earlier one can't land after a later one */
  private static calls = 0

  /** The page runtime's `Styles`, loading the runtime first;  `undefined` outside a browser. */
  private static async pageStyles(): Promise<Styles | undefined> {
    if (typeof document === "undefined") return undefined
    const { loadUI } = await import("$/ui/runtime")
    return (await loadUI()).styles
  }

  /** Glob result (`"./github.css" -> loader`) keyed by sheet name (`github`). */
  private static byName(glob: Record<string, () => Promise<string>>): Record<string, () => Promise<string>> {
    return Object.fromEntries(
      Object.entries(glob).map(([path, loader]) => [path.replace(/^.*\//, "").replace(/\.css$/, ""), loader])
    )
  }
}
