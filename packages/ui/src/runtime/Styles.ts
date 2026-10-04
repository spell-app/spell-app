import type { StyleRegisterOptions, StyleSource } from "./runtime.types"
import { AppStylesheet } from "./AppStylesheet"

/**
 * Registry of named constructable stylesheets, and the one place that sets `adoptedStyleSheets`, as `UI.styles`.
 * - Why a registry:  every component instance shares ONE `CSSStyleSheet` per name (no per-instance `<style>`),
 *   and re-registering a name updates it everywhere at once.
 * - Order inside every shadow root (`adoptInto()`):
 *   1. foundation sheets, in `setFoundation()` order (layers, tokens, reset ...)
 *   2. the component's own sheets, as passed
 *   3. any sheets someone else put on the root (kept, not clobbered)
 *   4. utilities (`setUtilities()`, default `["utilities"]`)
 *   5. `shadow: true` sheets (themes), in registration order
 *   6. the app stylesheet (`#ui-app-stylesheet`) -- ALWAYS last, see `AppStylesheet`
 * - Unregistered names are skipped, not errors:  foundation / utilities may be registered after components
 *   connect, and every adopted root is re-pushed when they are.
 * - Roots are held WEAKLY, so a disconnected component's shadow root can be collected.
 */
export class Styles {
  /** name -> sheet */
  private readonly sheets = new Map<string, CSSStyleSheet>()
  /** name -> last CSS text, so re-registering identical text is a no-op */
  private readonly texts = new Map<string, string>()
  /** every sheet this registry created or was handed -- anything else on a root is "foreign" */
  private readonly owned = new WeakSet<CSSStyleSheet>()
  /** names also pushed onto `document.adoptedStyleSheets` */
  private readonly pageNames = new Set<string>()
  /** names also adopted into every shadow root, after utilities, see `StyleRegisterOptions.shadow` */
  private readonly shadowNames = new Set<string>()
  /** page names `ui.css` already carries, see `StyleRegisterOptions.linked` */
  private readonly linkedNames = new Set<string>()
  /** foundation names, in order */
  private foundation: string[] = []
  /** utility names, in order */
  private utilities: string[] = ["utilities"]
  /** every root `adoptInto()` has seen */
  private readonly roots = new Set<WeakRef<ShadowRoot>>()
  /** component sheet names per root */
  private readonly rootNames = new WeakMap<ShadowRoot, string[]>()
  /** the `#ui-app-stylesheet` mirror, created on first `adoptInto()` / `appSheetReady` */
  private app?: AppStylesheet

  ////////////////
  // ## Registry
  ////////////////

  /**
   * Register `css` as `name`.  Idempotent.
   * - Text:  built with `replaceSync`;  re-registering different text REPLACES the existing sheet's rules in place,
   *   so every root already using it updates with no re-push.
   * - A `CSSStyleSheet`:  used as-is;  a different object for an existing name is swapped into every root.
   * - `page: true`:  also pushed onto `document.adoptedStyleSheets`, once;  with `linked: true` too, only while
   *   the page doesn't link `ui.css` (see `StyleRegisterOptions`).
   * - `shadow: true`:  also adopted into EVERY shadow root `adoptInto()` knows, now and later, after utilities
   *   (themes:  their class-grammar overrides must reach component markup).
   * - `""` UNREGISTERS `name`:  dropped from the page, every shadow root and the registry (`has()` turns false),
   *   whatever options it was registered with;  returns an empty, detached sheet.
   * - NOTE: `page` / `shadow` / `linked` only ever ADD:  a later call without them keeps what an earlier one set.
   * - NOTE: `replaceSync` drops `@import` -- registered text MUST be self-contained.
   */
  register(
    name: string,
    css: StyleSource,
    { page = false, linked = false, shadow = false }: StyleRegisterOptions = {}
  ): CSSStyleSheet {
    if (css === "") return this.unregister(name)
    let sheet = this.sheets.get(name)
    let swapped = false
    if (typeof css === "string") {
      if (!sheet) sheet = new CSSStyleSheet()
      if (this.texts.get(name) !== css) {
        // WebKit: a second `replaceSync` before anything read `cssRules` APPENDS to the old rules (old ones stay
        // live, and `cssRules` reads stale):  reading a rule first makes it replace
        if (this.texts.has(name)) void sheet.cssRules[0]
        sheet.replaceSync(css)
        this.texts.set(name, css)
      }
    } else if (css !== sheet) {
      swapped = !!sheet
      sheet = css
      this.texts.delete(name)
    }
    const added = !this.sheets.has(name)
    this.sheets.set(name, sheet)
    this.owned.add(sheet)
    if (page && linked) this.linkedNames.add(name)
    if (page && !this.pageNames.has(name)) {
      this.pageNames.add(name)
      this.refreshPage()
    } else if (swapped && this.pageNames.has(name)) {
      this.refreshPage()
    }
    const newShadow = shadow && !this.shadowNames.has(name)
    if (newShadow) this.shadowNames.add(name)
    if (added || swapped || newShadow) this.refreshRoots()
    return sheet
  }

  /**
   * Forget `name`:  off the page, out of every shadow root, out of the registry.
   * - The old sheet stays in `owned`, so the re-pushes drop it rather than keep it as "foreign".
   * - A root that lists it as a COMPONENT sheet keeps the name, so registering it again puts it back.
   * - Returns an empty sheet nothing adopts, so `register()` keeps its return type.
   */
  private unregister(name: string): CSSStyleSheet {
    const known = this.sheets.delete(name)
    this.texts.delete(name)
    this.linkedNames.delete(name)
    this.shadowNames.delete(name)
    if (this.pageNames.delete(name)) this.refreshPage()
    if (known) this.refreshRoots()
    return new CSSStyleSheet()
  }

  /** Sheet registered as `name`, if any. */
  sheet(name: string): CSSStyleSheet | undefined {
    return this.sheets.get(name)
  }

  /** Is `name` registered? */
  has(name: string): boolean {
    return this.sheets.has(name)
  }

  /** Set the foundation sheet names, in cascade order;  re-pushes every adopted root. */
  setFoundation(names: string[]) {
    this.foundation = [...names]
    this.refreshRoots()
  }

  /** Set the utility sheet names (adopted after component sheets);  re-pushes every adopted root. */
  setUtilities(names: string[]) {
    this.utilities = [...names]
    this.refreshRoots()
  }

  ////////////////
  // ## Adoption
  ////////////////

  /**
   * Set `root.adoptedStyleSheets` to foundation + `names` + utilities + app sheet (see class docs for order),
   * and remember `root` so later registrations reach it.
   * - Call from the component's constructor or `connectedCallback`;  calling again with other names
   *   replaces that root's component sheets.
   * - SIDE EFFECT:  first call starts watching `#ui-app-stylesheet`.
   */
  adoptInto(root: ShadowRoot, names: string[]) {
    const known = this.rootNames.has(root)
    this.rootNames.set(root, [...names])
    if (!known) this.roots.add(new WeakRef(root))
    void this.startApp()
    this.push(root)
  }

  /**
   * Resolves once the app stylesheet reflects `#ui-app-stylesheet` as of its latest change.
   * - SIDE EFFECT:  starts watching it, if nothing has yet.
   */
  get appSheetReady(): Promise<void> {
    return this.startApp() ?? Promise.resolve()
  }

  /** The app stylesheet mirror, if started. */
  get appSheet(): CSSStyleSheet | undefined {
    return this.app?.sheet
  }

  /** Stop watching `#ui-app-stylesheet`, forget every root;  for tests and teardown. */
  dispose() {
    this.app?.stop()
    this.app = undefined
    this.roots.clear()
  }

  ////////////////
  // ## Internals
  ////////////////

  /** Create and start the app-sheet mirror once;  its current `ready`. */
  private startApp(): Promise<void> | undefined {
    if (typeof document === "undefined") return undefined
    if (!this.app) {
      // app sheets count as owned, so a swapped-out one is dropped from roots rather than kept as "foreign"
      this.app = new AppStylesheet({
        onSheetChange: (sheet) => {
          this.owned.add(sheet)
          this.refreshRoots()
        }
      })
      this.owned.add(this.app.sheet)
    }
    void this.app.start()
    return this.app.ready
  }

  /** Recompute one root's `adoptedStyleSheets`. */
  private push(root: ShadowRoot) {
    const names = this.rootNames.get(root) ?? []
    const foreign = root.adoptedStyleSheets.filter((sheet) => !this.owned.has(sheet))
    const sheets = [
      ...this.lookup(this.foundation),
      ...this.lookup(names),
      ...foreign,
      ...this.lookup(this.utilities),
      ...this.lookup(this.shadowNames),
      ...(this.app ? [this.app.sheet] : [])
    ]
    root.adoptedStyleSheets = [...new Set(sheets)]
  }

  /** Re-push every live root;  drops collected ones. */
  private refreshRoots() {
    for (const ref of this.roots) {
      const root = ref.deref()
      if (root) this.push(root)
      else this.roots.delete(ref)
    }
  }

  /** Put the page sheets onto `document.adoptedStyleSheets`, keeping anything else already there. */
  private refreshPage() {
    if (typeof document === "undefined") return
    const foreign = document.adoptedStyleSheets.filter((sheet) => !this.owned.has(sheet))
    // a page that links `ui.css` already has ITS sheets -- adopting them again just doubles the CSS;  component
    // page sheets (`table`, `scroll-lock`) aren't in it
    const linked = this.pageIsLinked
    const ours = this.lookup([...this.pageNames].filter((name) => !linked || !this.linkedNames.has(name)))
    document.adoptedStyleSheets = [...foreign, ...ours]
    if (!linked && !this.watchingLoad && document.readyState !== "complete") {
      // a `<link>` still loading may bring the marker;  re-check once the page has settled
      this.watchingLoad = true
      window.addEventListener("load", () => this.refreshPage(), { once: true })
    }
  }

  /** Has the page linked `ui.css` (which sets `--ui-page-sheet: linked` on `:root`)? */
  private get pageIsLinked(): boolean {
    return getComputedStyle(document.documentElement).getPropertyValue("--ui-page-sheet").trim() === "linked"
  }

  /** `load` listener armed, so page sheets get re-evaluated once late `<link>`s are in. */
  private watchingLoad = false

  /** Registered sheets for `names`, skipping unregistered ones. */
  private lookup(names: Iterable<string>): CSSStyleSheet[] {
    const found: CSSStyleSheet[] = []
    for (const name of names) {
      const sheet = this.sheets.get(name)
      if (sheet) found.push(sheet)
    }
    return found
  }
}
