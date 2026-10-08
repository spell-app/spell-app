import type { Styles } from "./Styles"

/****************
 * ### `Themes`
 * The theme sheets (`src/styles/themes/*.css`), loaded on demand, and the one switch that applies them, as
 * `UI.themes`:  `await UI.load()`, then `UI.themes.apply("github")`.
 * - In the runtime's lazy chunk (`UIRuntime` builds it), beside `UI.styles`, the registry it applies into.  Never in
 *   `$/ui/styles`, which stays pure data:  code there needed Rolldown's helpers in a chunk `core` doesn't load, so
 *   every page fetched a `rolldown-runtime-<hash>.js` (epic `wwod-spell-ui`, I13).
 * - Registry:  a LITERAL `import.meta.glob()` of the themes folder (`THEME_LOADERS`), so a new `<name>.css` there is a
 *   theme with no edit anywhere.  Lazy:  each sheet is its own chunk, loaded the first time it's applied.
 * - Fomantic's themes are DELTAS on Fomantic's default look, which is our `classic.css`.  So applying a Fomantic
 *   theme registers TWO sheets, `classic` then the theme, both `@layer ui.theme`:  the theme wins ties by order.
 * - Both go on the page AND into every component shadow root (`UI.styles.register(..., { page, shadow })`):
 *   - tokens on `:root` reach components by inheritance either way
 *   - the theme's class-grammar overrides (`.ui.button { ... }`) only reach component markup from INSIDE the root
 * - Sheets in the folder that are NOT Fomantic themes, so left out of `names`:
 *   - `classic`:  the base every Fomantic theme sits on;  `apply("classic")` applies it alone
 *   - `dark`:  a colour SCHEME, not a look;  switch it with `color-scheme` / `ui-dark` / `<ui-root theme>`, on top
 *     of any theme.  `apply("dark")` throws.
 *   - `spell` and `spell-brand`:  OUR OWN themes (`own`), the Spell brand (`spell-brand`:  a copy converging on
 *     Claude Design's pages, epic `design-system`);  applied exactly like a Fomantic theme (on `classic`), but a
 *     picker lists them apart
 * - Registry names in `UI.styles` (`slots`):  `classic` (the base) and `theme` (the current Fomantic theme).  ONE
 *   `theme` slot, so switching themes replaces its text in place.
 ****************/
export class Themes {
  /** the base sheet every Fomantic theme is applied on top of */
  readonly base = BASE

  /** our own themes (not Fomantic ports):  applied like one, listed apart from `names` */
  readonly own: readonly string[] = ["spell", "spell-brand"]

  /** `UI.styles` names:  base slot and theme slot */
  readonly slots = { base: BASE, theme: "theme" } as const

  /** every sheet in the folder, `classic` and `dark` included, A-Z */
  readonly sheets: readonly string[] = Object.keys(THEME_LOADERS).sort()

  /** the Fomantic themes:  every sheet but `classic`, `dark` and `own`, A-Z */
  readonly names: readonly string[] = this.sheets.filter(
    (name) => !NOT_THEMES.includes(name) && !this.own.includes(name)
  )

  /** name last passed to `apply()`, `undefined` for our own look */
  current: string | undefined

  /** the registry themes apply into:  the runtime's `UI.styles`, for the object's life */
  private readonly styles: Styles

  /** counts `apply()` calls, so a slow earlier one can't land after a later one */
  private calls = 0

  constructor({ styles }: ThemesProps) {
    this.styles = styles
  }

  /** Is `name` a sheet in the themes folder? */
  has(name: string): boolean {
    return name in THEME_LOADERS
  }

  /**
   * CSS text of sheet `name`.
   * - SIDE EFFECT:  first call loads its chunk;  the module cache makes later calls free.
   * - Throws a `TypeError` on an unknown name.
   */
  load(name: string): Promise<string> {
    const loader = THEME_LOADERS[name]
    if (!loader) {
      throw new TypeError(`Themes.load():  no sheet \`${name}\`;  pick one of:  ${this.sheets.join(", ")}`)
    }
    return loader()
  }

  /**
   * Apply theme `name` page-wide, on the page and in every component shadow root.
   * - A Fomantic theme (`names`) or one of `own`:  `classic` + the theme.
   * - `"classic"`:  `classic` alone.
   * - `undefined` (or `""`):  neither, our own look.
   * - Concurrent calls:  the LAST one wins, even if an earlier theme's chunk arrives after it.
   * - Throws a `TypeError` on an unknown name, or `"dark"` (see the class docs).
   */
  async apply(name: string | undefined): Promise<void> {
    if (name === "") name = undefined
    if (name !== undefined && (!this.has(name) || name === DARK)) {
      throw new TypeError(
        `Themes.apply():  \`${name}\` isn't a theme;  pick \`${BASE}\`, one of \`own\` or one of:  ${this.names.join(", ")}`
      )
    }
    const call = ++this.calls
    this.current = name
    const base = name === undefined ? "" : await this.load(BASE)
    const theme = name === undefined || name === BASE ? "" : await this.load(name)
    if (call !== this.calls) return
    const options = { page: true, shadow: true }
    // `register()` keeps first-registration order, and the theme MUST follow the base:  without the base, drop
    // the theme first, so both go back in order
    if (!this.styles.has(this.slots.base)) this.styles.register(this.slots.theme, "", options)
    this.styles.register(this.slots.base, base, options)
    this.styles.register(this.slots.theme, theme, options)
  }
}

/** What `new Themes()` takes. */
export type ThemesProps = {
  /** the registry themes apply into:  the runtime's `styles` */
  styles: Styles
}

/** The base sheet every Fomantic theme is applied on top of. */
const BASE = "classic"

/** The colour-scheme sheet:  in the folder, but no theme (`apply()` refuses it). */
const DARK = "dark"

/** Sheets in the folder that are not themes you pick from a list. */
const NOT_THEMES: readonly string[] = [BASE, DARK]

/**
 * Sheet name (`github`) => loader of its CSS text (`?inline`:  Lightning CSS-processed, minified in builds).
 * - NOTE: `import.meta.glob()` MUST stay a literal call:  Vite rewrites it at build time.
 * - RELATIVE, the one `../` in `ui`'s source:  a glob takes no tsconfig alias, and a root-absolute one
 *   (`/src/...`) breaks in a build rooted elsewhere (`brand`'s).
 */
const THEME_LOADERS: Readonly<Record<string, () => Promise<string>>> = Object.fromEntries(
  Object.entries(import.meta.glob<string>("../styles/themes/*.css", { query: "?inline", import: "default" })).map(
    ([path, loader]) => [path.replace(/^.*\//, "").replace(/\.css$/, ""), loader]
  )
)
