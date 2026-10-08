import { E, UI } from "$/ui/core"

/****************
 * ### `HotDefinitions`
 * Dev-only glue between Vite's hot module replacement and `UIComponent.define()`;  NEVER in a build.
 * - Loaded by `@spell-app/solid-element/vite` (the `setup` option, `vite.config.ts`) into every component barrel,
 *   before its `define()` calls run.  SIDE EFFECT:  `install()` wraps `UIComponent.define`.
 * - Why:  `define()` is idempotent per tag, so a barrel re-run by HMR would return the OLD element class.  The
 *   wrapper records every tag's class and dictionary;  when a DIFFERENT class of the SAME name defines a known
 *   tag -- its module was re-evaluated -- that class takes over EVERY tag the old one had, the translated
 *   aliases (`ie-boton`) included, through `UIComponent.defineTag()`.  solid-element swaps each definition in place;
 *   the barrel's `import.meta.hot.accept()` (`hotUpdate()`) then re-renders the live instances.
 * - Also:  English texts the edit changed reach `UI.i18n` (`define()` never overwrites a registered text), and
 *   `updateStyle()` re-registers a component sheet whose `?inline` CSS changed.
 * - NOTE: a vocabulary whose tag was renamed defines the NEW tag;  instances of the old one keep the old class.
 * - `UI.vocabulary.replace()` swaps a changed vocabulary in, and re-resolves the runtime's translated names from it.
 * - Imports the core through `$/ui/core`, as a component file does:  it's loaded into component barrels, and NOTHING
 *   in the core imports it (it's not in the `$/ui/elements` barrel).
 * - STATIC and instance-free on purpose:  ONE record of definitions per page, as `customElements` is.
 ****************/
export class HotDefinitions {
  /** Wrap `UIComponent.define`;  idempotent. */
  static install() {
    if (HotDefinitions.original) return
    HotDefinitions.original = E.UIComponent.define
    E.UIComponent.define = function (this: E.UIComponentClass, tag?: string, dictionary?: E.Dictionary) {
      return HotDefinitions.define(this, tag, dictionary)
    }
  }

  /** The wrapped `define()`:  record, re-define on a new version of a class, else as declared. */
  static define(Class: E.UIComponentClass, tag?: string, dictionary?: E.Dictionary): CustomElementConstructor {
    const original = HotDefinitions.original!
    const resolved = new E.ElementDefinition(Class.prototype.vocabulary, { tag, dictionary }).tag
    const known = HotDefinitions.tags.get(resolved)
    if (!known) {
      HotDefinitions.tags.set(resolved, { Class, tag, dictionary })
      return original.call(Class, tag, dictionary)
    }
    const defined = customElements.get(resolved)
    if (!defined || known.Class === Class || known.Class.name !== Class.name)
      return original.call(Class, tag, dictionary)
    HotDefinitions.replace(known.Class, Class)
    return defined
  }

  /**
   * `Next` is a new version of `Previous`:  re-define every tag `Previous` had with it.
   * - solid-element swaps each class's component, props and options (or records why it can't:  `hotUpdate()` then
   *   reloads the page).
   */
  static replace(Previous: E.UIComponentClass, Next: E.UIComponentClass) {
    const before = Previous.prototype.vocabulary
    const after = Next.prototype.vocabulary
    if (before !== after) {
      HotDefinitions.whenRuntime(() => {
        // `register()` refuses a second vocabulary object for a tag:  swap the new version in, so `defineTag()`'s
        // registration is a no-op and localized names re-resolve
        UI.vocabulary.replace(after)
        HotDefinitions.updateTexts(before, after)
      })
    }
    for (const known of HotDefinitions.tags.values()) {
      if (known.Class !== Previous) continue
      known.Class = Next
      const definition = new E.ElementDefinition(Next.prototype.vocabulary, known)
      E.UIComponent.defineTag.call(Next, definition)
    }
  }

  /**
   * A component sheet's `?inline` CSS changed:  re-register it by name (`UIButton.css` => `button`).
   * - The name is the file's, without `UI`, in kebab-case (`UITreeDiagram.css` => `tree-diagram`):
   *   elements register their sheets by that bare name (`@proto static styleSheets = { button: buttonCSS }`).
   * - A second sheet (`UIDimmer.page.css`) or a sheet registered under another name isn't matched:
   *   an edit to it shows after a page reload.
   * - `Styles.register()` replaces the rules of the sheet every shadow root already adopted:  no re-render.
   * - Registered even if no element used it yet, so a later `adoptStyles()` finds the new text (it only
   *   registers names that are missing).
   */
  static updateStyle(this: void, id: string, css: string) {
    const stem = /(?:^|\/)UI([A-Za-z0-9]+)\.css(?:\?|$)/.exec(id)?.[1]
    if (!stem) return
    const name = stem.replace(/(?<=.)([A-Z])/g, "-$1").toLowerCase()
    HotDefinitions.whenRuntime(() => UI.styles.register(name, css))
  }

  /**
   * Run `task` now if the runtime is loaded, else once it is.
   * - Queued behind registrations `define()` already queued, ahead of the ones it queues next (same promise).
   */
  private static whenRuntime(task: () => void) {
    if ((globalThis as E.RuntimeGlobal)[E.RUNTIME_KEY]) task()
    else void UI.load().then(task)
  }

  /**
   * English texts the `next` version of a vocabulary changed, as its new defaults.
   * - Defaults sit below every registered string (`I18n.registerDefaults()`), so a translation still wins.
   */
  private static updateTexts(previous: E.ComponentVocabulary, next: E.ComponentVocabulary) {
    const previousTexts = new Map(previous.texts.map(({ key, text }) => [key, text]))
    const changed: Record<string, string> = {}
    for (const { key, text } of next.texts) if (previousTexts.get(key) !== text) changed[key] = text
    if (Object.keys(changed).length) UI.i18n.registerDefaults(changed, next.tag)
  }

  ////////////////
  // ## Page-wide registry
  ////////////////

  /** Every tag defined so far, with what defined it;  by resolved tag. */
  private static readonly tags = new Map<string, HotTag>()

  /** `UIComponent.define` as declared, once `install()` has run. */
  private static original?: typeof E.UIComponent.define
}

/** What defined one tag:  enough to define it again with a new version of the class. */
type HotTag = {
  /** Current class. */
  Class: E.UIComponentClass
  /** `define()`'s `tag` argument, as passed. */
  tag?: string
  /** `define()`'s `dictionary` argument. */
  dictionary?: E.Dictionary
}

HotDefinitions.install()
