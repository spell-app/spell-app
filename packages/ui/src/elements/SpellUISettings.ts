// Import directly to avoid circular import:  everything here sits below the `core` entry, which imports this file
import { SpellSolid, type SpellSolidSettings } from "@spell-app/spell-element"
import { Warnings } from "$/ui/util"
import { Converters, SharedVocabulary, ValueSets, Vocabulary } from "$/ui/vocabulary"
import { UI } from "$/ui/runtime"
import { RUNTIME_KEY, type RuntimeGlobal } from "$/ui/runtime/runtime.types"
import * as UIT from "$/ui/components/components.types"
import { ClassBuilder } from "./ClassBuilder"

/****************
 * ### `SpellUISettings`
 * What Spell UI hands spell-element as it loads (`SpellSolid.install()`), which every set's elements draw with:
 * its runtime (`UI`), its vocabulary layer, its style sheets, focus and animations (`E.SpellSolidSettings`).
 * - Installed as `$/ui/core` loads (`core.ts` imports this file), so before any family's `define()`:
 *   a family imports `$/ui/core` first.
 * - What each one is in Spell UI:
 *   - `runtime`:  the page's `UI` runtime, lazy (`$/ui/runtime`):  elements show once it has loaded
 *   - `words`:  `$/ui/vocabulary` (`Vocabulary`, `SharedVocabulary`, `Converters`, `ValueSets`), `ClassBuilder`,
 *     and the runtime's `UI.vocabulary` and `UI.i18n`
 *   - `styles`, `focus`:  the runtime's `UI.styles`, `UI.focus`
 *   - `motion`:  Fomantic's animations (`UIT.Animations`), run by `UI.transitions`;  `--ui-motion`
 *   - `warn`:  `Warnings.warn()`, `[@spell-app/ui] ...`
 * - SIDE EFFECT:  installs them;  listed in `package.json`'s `sideEffects`.
 * - Imported for that by `core.ts`, AND by `$/ui`'s barrel (`index.ts`) and the root's (`ui-root/index.ts`):
 *   - `core.ts` alone isn't enough in a bundle, since it's only re-exports:
 *     a bundler that sees nothing of it used drops its side-effect import too.
 *     Spell UI's site and the brand's pages lost it.
 *   - Every page has a root, or loads `$/ui`.
 *   - Not `core.ts` in `sideEffects` instead:  that re-chunks the app's `spell-solid.js`
 *     (its `BuiltInPacks` moves out, away from where `<spell-app>` finds its icons).
 * - A code-split build may run a family's chunk first:
 *   that family's `define()` waits for the install (`SpellSolid.whenInstalled()`).
 *   - The app's `spell-solid.js` ran `<ui-components>`'s before its entry's body, where this file lands.
 ****************/
export class SpellUISettings {
  /** The settings, as spell-element reads them. */
  static readonly settings: SpellSolidSettings = {
    runtime: {
      get isLoaded() {
        return !!(globalThis as RuntimeGlobal)[RUNTIME_KEY]
      },
      load: () => UI.load()
    },
    words: {
      names: () => new Vocabulary(),
      classes: (vocabulary) => new ClassBuilder(vocabulary),
      attributesFor: (vocabulary) => SharedVocabulary.attributesFor(vocabulary),
      takesShared: (vocabulary, name) => SharedVocabulary.takesShared(vocabulary, name),
      converters: Converters,
      valuesFor: (spec) => ValueSets.setFor(spec),
      text: (key, params, tag) => UI.i18n.t(key, params, tag),
      registerVocabulary(vocabulary, how) {
        if (how === "replace") UI.vocabulary.replace(vocabulary)
        else UI.vocabulary.register(vocabulary)
      },
      registerTexts: (texts, tag) => UI.i18n.registerDefaults(texts, tag)
    },
    styles: {
      registerOnce: (sheets) => UI.styles.registerOnce(sheets),
      register: (name, css) => UI.styles.register(name, css),
      adoptInto: (root, names) => UI.styles.adoptInto(root, names)
    },
    focus: {
      moveOutOf: (container) => UI.focus.moveOutOf(container)
    },
    motion: {
      defaultAnimation: UIT.DEFAULT_ANIMATION,
      property: UIT.MOTION_PROPERTY,
      get isReduced() {
        return UI.browser.isReducedMotion
      },
      isAttention: (animation) => UIT.AnimationLookup.isAttention(animation),
      reveal: (box) => UI.transitions.reveal(box),
      animate: (element, animation, visible) =>
        UI.transitions.animate({
          element,
          name: UIT.AnimationLookup.runtimeNameFor(animation),
          direction: visible ? UIT.IN : UIT.OUT
        })
    },
    warn: (source, message, ...data) => Warnings.warn(source, message, ...data)
  }
}

SpellSolid.install(SpellUISettings.settings)
