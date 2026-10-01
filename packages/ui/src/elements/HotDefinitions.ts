import {
  ElementDefinition,
  RUNTIME_KEY,
  UI,
  UIElement,
  type ComponentVocabulary,
  type Dictionary,
  type RuntimeGlobal,
  type UIElementClass
} from "$/ui/core"

/**
 * Dev-only glue between Vite's hot module replacement and `UIElement.define()`;  NEVER in a build.
 * - Loaded by `@spell-app/solid-element/vite` (the `setup` option, `vite.config.ts`) into every component barrel,
 *   before its `define()` calls run.  SIDE EFFECT:  `install()` wraps `UIElement.define`.
 * - Why:  `define()` is idempotent per tag, so a barrel re-run by HMR would return the OLD element class.  The
 *   wrapper records every tag's class and dictionary;  when a DIFFERENT class of the SAME name defines a known
 *   tag -- its module was re-evaluated -- that class takes over EVERY tag the old one had, the translated
 *   aliases (`ie-boton`) included, through `UIElement.defineTag()`.  The fork swaps each definition in place;
 *   the barrel's `import.meta.hot.accept()` (`hotUpdate()`) then re-renders the live instances.
 * - Also:  English texts the edit changed reach `UI.i18n` (`define()` never overwrites a registered text), and
 *   `updateStyle()` re-registers a component sheet whose `?inline` CSS changed.
 * - NOTE: a vocabulary whose tag was renamed defines the NEW tag;  instances of the old one keep the old class.
 * - `UI.vocabulary.replace()` swaps a changed vocabulary in, and re-resolves the runtime's translated names from it.
 */
export class HotDefinitions {
  /** Every tag defined so far, with what defined it;  by resolved tag. */
  private static readonly tags = new Map<string, HotTag>()

  /** `UIElement.define` as declared, once `install()` has run. */
  private static original?: typeof UIElement.define

  /** Wrap `UIElement.define`;  idempotent. */
  static install() {
    if (HotDefinitions.original) return
    HotDefinitions.original = UIElement.define
    UIElement.define = function (this: UIElementClass, tag?: string, dictionary?: Dictionary) {
      return HotDefinitions.define(this, tag, dictionary)
    }
  }

  /** The wrapped `define()`:  record, re-define on a new version of a class, else as declared. */
  static define(Class: UIElementClass, tag?: string, dictionary?: Dictionary): CustomElementConstructor {
    const original = HotDefinitions.original!
    const resolved = new ElementDefinition(Class.prototype.vocabulary, { tag, dictionary }).tag
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
   * - The fork swaps each class's component, props and options (or records why it can't:  `hotUpdate()` then
   *   reloads the page).
   */
  static replace(Previous: UIElementClass, Next: UIElementClass) {
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
      const definition = new ElementDefinition(Next.prototype.vocabulary, known)
      UIElement.defineTag.call(Next, definition)
    }
  }

  /**
   * A component sheet's `?inline` CSS changed:  re-register it by name (`ui-button.css` => `button`).
   * - The name drops the family folder's `ui-` prefix:  elements register their sheets by bare name
   *   (`@proto static styles = { button: buttonCSS }`).
   * - `Styles.register()` replaces the rules of the sheet every shadow root already adopted:  no re-render.
   * - Registered even if no element used it yet, so a later `adoptStyles()` finds the new text (it only
   *   registers names that are missing).
   */
  static updateStyle(this: void, id: string, css: string) {
    const name = /(?:^|\/)(?:ui-)?([\w-]+)\.css(?:\?|$)/.exec(id)?.[1]
    if (name) HotDefinitions.whenRuntime(() => UI.styles.register(name, css))
  }

  /**
   * Run `fn` now if the runtime is loaded, else once it is.
   * - Queued behind registrations `define()` already queued, ahead of the ones it queues next (same promise).
   */
  private static whenRuntime(fn: () => void) {
    if ((globalThis as RuntimeGlobal)[RUNTIME_KEY]) fn()
    else void UI.load().then(fn)
  }

  /**
   * English texts `Next` changed, as its new defaults.
   * - Defaults sit below every registered string (`I18n.registerDefaults()`), so a translation still wins.
   */
  private static updateTexts(Previous: ComponentVocabulary, Next: ComponentVocabulary) {
    const before = new Map(Previous.texts.map(({ key, text }) => [key, text]))
    const changed: Record<string, string> = {}
    for (const { key, text } of Next.texts) if (before.get(key) !== text) changed[key] = text
    if (Object.keys(changed).length) UI.i18n.registerDefaults(changed, Next.tag)
  }
}

/** What defined one tag:  enough to define it again with a new version of the class. */
type HotTag = {
  /** Current class. */
  Class: UIElementClass
  /** `define()`'s `tag` argument, as passed. */
  tag?: string
  /** `define()`'s `dictionary` argument. */
  dictionary?: Dictionary
}

HotDefinitions.install()
