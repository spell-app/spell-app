import type { JSX } from "@solidjs/web"

import { E, UI } from "$/ui/core"
import type { SpellCore } from "$/core"
import { spellElementVocabulary } from "./SpellElement.en"

/****************
 * ### `SpellElement`
 * The component behind a drawable thing's own element, e.g. `<solitaire-card>` for `a card is a drawable thing`.
 *
 * - A Spell UI component like any `ui-*` one:  its own shadow root, with the page's theme and base styles.
 *   Then its type's own `<css>`, its class's `static css`, after its super-types' (`cssOf()`).
 * - It draws its `thing`, through the program's runtime:  `spellCore.drawOwn()`, in the thing's error net.
 * - ONE tag per drawable type, defined the first time a program defines its elements (`defineFor()`).
 *   What the tag draws with is looked up when it draws (`SPELL_ELEMENTS`), so a program run again takes it over.
 * - Part of `spell-runtime.js`:  NEVER value-imports `$/core`.
 *   Each runtime copy hands itself over in `installSpellElements()`.
 ****************/
export class SpellElement extends E.UIComponent<typeof spellElementVocabulary> {
  @E.proto static vocabulary = spellElementVocabulary
  @E.protoMerged static elementSetup: Partial<E.ElementSetup> = { delegatesFocus: false }

  render(): JSX.Element {
    return <>{this.drawing}</>
  }

  /** Our thing's drawing -- nothing until a program sets our `thing`, or before our tag's runtime is known. */
  get drawing(): JSX.Element {
    const { thing } = this
    const entry = SPELL_ELEMENTS.get(this.domElement.localName)
    if (!thing || !entry) return null
    return entry.spellCore.drawOwn(thing) as JSX.Element
  }

  /**
   * Make `tag` the element of drawable class `Class`, from `spellCore`'s program, e.g. `solitaire-card` for `Card`.
   * - The first time:  a component class for the tag, its vocabulary ours under that tag, defined on the page.
   * - Again (a program run again after an edit, or another `<spell-app>` running the same project):
   *   the platform can't define a tag twice, so it stays, and what's behind it is swapped (epic `drawable-thing` P7):
   *   - it draws with the latest `spellCore` from then on (`SPELL_ELEMENTS`)
   *   - its type's CSS is replaced in every element of the tag on the page, at once (`restyle()`)
   *   - what it draws comes from its `thing`, so a program run again draws its new things with their new `draw()`
   */
  static defineFor(tag: string, Class: Function, spellCore: SpellCore): void {
    SPELL_ELEMENTS.set(tag, { Class, spellCore })
    // never "":  `UI.styles.register()` takes that as "unregister", and the tag's elements would lose the sheet
    const css = SpellElement.cssOf(Class) || `/* <${tag}>:  no styles of its own */`
    if (customElements.get(tag)) return SpellElement.restyle(tag, css)
    // our names under its tag:  typed as ours, whose tag is a literal
    const vocabulary = { ...spellElementVocabulary, tag, noun: Class.name } as unknown as typeof spellElementVocabulary
    const Component = class extends SpellElement {
      @E.proto static vocabulary = vocabulary
      // the sheet is named for the tag, so `restyle()` can replace it
      @E.protoMerged static elementSetup: Partial<E.ElementSetup> = { styleSheets: { [tag]: css } }
    }
    Component.define()
  }

  /**
   * Replace `tag`'s own sheet with `css`, in every shadow root that adopted it:  no element is drawn again.
   * - Spell UI's own way to swap a sheet (`UI.styles.register()`), as its hot reload does.
   * - Waits for the runtime, if it hasn't loaded yet.
   */
  static restyle(tag: string, css: string): void {
    const register = () => void UI.styles.register(tag, css)
    if ((globalThis as E.RuntimeGlobal)[E.RUNTIME_KEY]) register()
    else void UI.load().then(register)
  }

  /**
   * The CSS of drawable class `Class`:  each class's own `static css` (its type's `<css>`), its super-types' first --
   * `""` if none has any.
   */
  static cssOf(Class: Function): string {
    const sheets: string[] = []
    for (let at: unknown = Class; typeof at === "function"; at = Object.getPrototypeOf(at)) {
      if (Object.hasOwn(at, "css")) sheets.unshift(String((at as unknown as { css: unknown }).css))
    }
    return sheets.join("\n")
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface SpellElement extends E.AttributeValues<typeof spellElementVocabulary> {}

/**
 * Let `spellCore` define its drawable classes' elements:  sets `spellCore.elementDefiner`.
 * - Called once per runtime copy, by `spellRuntime.ts`.
 */
export function installSpellElements(spellCore: SpellCore): void {
  spellCore.elementDefiner = (tag, Class) => SpellElement.defineFor(tag, Class, spellCore)
}

/** What a drawable type's tag draws with:  its class, and the runtime of the program that defined it last. */
type SpellElementEntry = {
  /** The drawable class, e.g. `Card`. */
  Class: Function
  /** The runtime its program runs on:  draws its things. */
  spellCore: SpellCore
}

/**
 * Each drawable type's tag, and what it draws with -- ONE map per page, on `globalThis`:
 * every runtime copy (each `<spell-app>` has its own) shares the page's custom elements.
 */
const SPELL_ELEMENTS: Map<string, SpellElementEntry> = ((globalThis as SpellElementsGlobal)[
  Symbol.for("@spell-app/spell-elements")
] ??= new Map())

/** `globalThis`, holding `SPELL_ELEMENTS`. */
type SpellElementsGlobal = typeof globalThis & { [key: symbol]: Map<string, SpellElementEntry> | undefined }
