import { E } from "$/spell-element"

/****************
 * ### `SpellSolid`
 * The settings a component set's runtime hands spell-element as it loads:
 * the services the element bases call (`E.SpellSolidSettings`).
 * - Why:  spell-element makes custom elements for EVERY set (Spell UI's, the epics', the app's, a space's),
 *   so it never imports one.
 *   What an element needs of the page's runtime (its words, style sheets, focus, animations) comes through here.
 * - Spell UI installs its own as `$/ui/core` loads (`packages/ui/src/elements/SpellUISettings.ts`):
 *   every other set's elements draw on a page that has Spell UI's runtime.
 * - A tag defined BEFORE any settings are in waits for them (`whenInstalled()`, `UIComponent.define()`).
 *   - Why:  a code-split bundle may run a family's chunk before the chunk that installs them,
 *     whatever the source's order.
 *   - The app's `spell-solid.js` did:  `<ui-components>` before Spell UI's core.
 * - STATIC and instance-free on purpose:  ONE set of settings per page, as there is one spell-element.
 ****************/
export class SpellSolid {
  /**
   * Hand spell-element the page's settings.
   * - Called as the runtime loads:  `$/ui/core` installs Spell UI's.
   * - Tags defined before that are defined now.
   * - A second call replaces the first (tests, a page that swaps its runtime).
   */
  static install(settings: E.SpellSolidSettings) {
    SpellSolid.installed = settings
    for (const task of SpellSolid.waiting.splice(0)) task()
  }

  /**
   * Run `task` once settings are installed:  now, if they are.
   * - Tasks run in the order they came, as `install()` runs.
   * - Still waiting after `WAIT_WARNING_SECONDS`:  one console warning, naming how many wait.
   */
  static whenInstalled(task: () => void) {
    if (SpellSolid.installed) {
      task()
      return
    }
    SpellSolid.waiting.push(task)
    if (SpellSolid.waiting.length > 1) return
    void E.after(WAIT_WARNING_SECONDS, () => {
      if (!SpellSolid.waiting.length) return
      console.warn(
        `[@spell-app/spell-element] SpellSolid:  ${SpellSolid.waiting.length} element(s) wait to be defined, and no ` +
          "settings are installed;  load a component set's runtime (Spell UI's `$/ui/core`)"
      )
    })
  }

  /**
   * The settings installed.
   * - throws an `Error` when none are:  nothing has loaded a runtime for the elements (import `$/ui/core` first)
   */
  static get settings(): E.SpellSolidSettings {
    if (SpellSolid.installed) return SpellSolid.installed
    throw new Error(
      "SpellSolid.settings:  no settings installed;  a component set's runtime installs them as it loads " +
        "(Spell UI's, as `$/ui/core` loads):  import it before defining an element"
    )
  }

  /** Have settings been installed? */
  static get isInstalled(): boolean {
    return SpellSolid.installed !== undefined
  }

  /** What `install()` was handed. */
  private static installed: E.SpellSolidSettings | undefined

  /** What waits for `install()` (`whenInstalled()`). */
  private static readonly waiting: Array<() => void> = []
}

/** How long tags may wait for settings before `whenInstalled()` warns, in seconds. */
const WAIT_WARNING_SECONDS = 5
