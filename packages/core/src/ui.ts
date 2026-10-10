import { spellCore } from "./core"
import { defineSpellCoreModule } from "./spellCore.types"

/**
 * Assembled `spellCore` UI-interaction methods:
 * - time (`pauseFor`)
 * - talking to the person running the program:  `notify`, `alert`, `confirm`, `prompt` (spell's `rules/UI/`), on
 *   Spell UI's toasts and dialogs
 * - stylesheet installation (`installStyles`)
 * - Drawing (`element()`, `drawThing()` ...) is `drawing.ts`.
 */
export const uiMethods = defineSpellCoreModule({
  ////////////////
  // ## Time
  ////////////////

  /** Multiplier from a unit name to milliseconds, e.g. `spellCore.TIME_UNITS_MAP.tick`. */
  TIME_UNITS_MAP: {
    second: 1000,
    seconds: 1000,
    sec: 1000,

    millisecond: 1,
    milliseconds: 1,
    msec: 1,
    // a "tick" (from hypercard) is 1/60th of a second
    tick: 1000 / 60,
    ticks: 1000 / 60
  } as Record<string, number>,

  /**
   * Return promise which resolves after `number` `units` have elapsed.
   * - `units` looked up in `TIME_UNITS_MAP`; unrecognized `units` fall back to seconds.
   * - Compiles from spell `pause for {number} {units}` (see `rules/async/Pause.ts`); caller `await`s it.
   */
  pauseFor(number: number, units = "seconds"): Promise<void> {
    const multiplier = spellCore.TIME_UNITS_MAP[units] || 1000
    // default to 0 if `isNaN`
    const delay = Math.round(number * multiplier) || 0
    return new Promise((resolve) => setTimeout(resolve, delay))
  },

  ////////////////
  // ## Talking to the person
  //
  // On the page's Spell UI (its runtime, one per page):  a toast, or a dialog.  With no Spell UI -- under node,
  // `spell run` -- each prints on the program's console instead, and a question takes its default answer.
  ////////////////

  /**
   * Show `message` for a moment, in a toast -- compiled from `notify "Saved!"`.
   * - `closeText`:  `notify "..." with "Got it"` -- the toast stays until it's closed.
   * - Shown once Spell UI's runtime has loaded:  NOT awaited, as `notify` isn't.
   */
  notify(message: unknown, closeText?: string): void {
    const ui = pageUI()
    if (!ui) return spellCore.console.info(String(message))
    void ui
      .load()
      .then((loaded) => loaded.toast({ message: String(message), displayTime: closeText ? 0 : "auto" }))
      .catch((error) => spellCore.console.error("notify:  can't show a toast", error))
  },

  /** Show `message` in a dialog, and wait until it's closed -- compiled from `alert "Yo!"` (`await`ed). */
  async alert(message: unknown, okText?: string): Promise<void> {
    const ui = pageUI()
    if (!ui) return spellCore.console.info(String(message))
    await (await ui.load()).modals.alert({ message: String(message), okText })
  },

  /**
   * Ask a yes / no question in a dialog:  `true` for ok -- compiled from `confirm "Delete?"` (`await`ed).
   * - No Spell UI:  `true`, printed with the question.
   */
  async confirm(message: unknown, okText?: string, cancelText?: string): Promise<boolean> {
    const ui = pageUI()
    if (!ui) return (spellCore.console.info(`${String(message)} (yes)`), true)
    return (await ui.load()).modals.confirm({ message: String(message), okText, cancelText })
  },

  /**
   * Ask for some text in a dialog:  what was typed, or `undefined` if cancelled -- compiled from
   * `prompt "Name?" with "Untitled"` (`await`ed), `value` its starting text.
   * - No Spell UI:  `value`, printed with the question.
   */
  async prompt(message: unknown, value?: string): Promise<string | undefined> {
    const ui = pageUI()
    if (!ui) return (spellCore.console.info(`${String(message)} (${value ?? ""})`), value)
    return (await ui.load()).modals.prompt({ message: String(message), value })
  },

  ////////////////
  // ## Styles
  ////////////////

  /**
   * Create/initialize a `name`d stylesheet with specified `css` text.
   * - If you call this a second time with same `name`, it'll replace the element with that `name`.
   * - Compiles from a bare (unquoted) CSS text literal, e.g. a spell `.css` file's contents; newlines
   *   in `css` arrive escaped as `¬` (see the `css` rule, `rules/UI/CSSStyles.ts`), since they survived being embedded
   *   in a backtick template literal -- unmunged back to `\n` here before use.
   * - Goes in `spellCore.domRoot()`:  the app's shadow root if it's in one, so its styles stay inside it --
   *   else `document`'s `<head>`.
   */
  installStyles(name = "anonymous-css", safeCSS = ""): void {
    // UN-munge `¬` back to return character
    const css = safeCSS.replace(/¬/g, "\n")

    const id = `--spell-styles--${name}--`
    const newElement = document.createElement("style")
    newElement.id = id
    newElement.type = "text/css"
    newElement.appendChild(document.createTextNode(css))
    const root = spellCore.domRoot()
    const oldElement = root.getElementById(id)
    if (oldElement) {
      oldElement.parentNode!.replaceChild(newElement, oldElement)
    } else {
      const parent = root === document ? (document.head ?? document.body) : root
      parent.appendChild(newElement)
    }
  }
})
Object.assign(spellCore, uiMethods)

/**
 * What core uses of the page's Spell UI runtime (`UI`, `@spell-app/ui`):  typed here, as core never imports `ui`.
 * - Its `modals` work once the `ui-modal` family is defined:  a runner's page defines every family.
 */
type PageUI = {
  /** resolves with the runtime once its services are in:  `UI.load()` */
  load(): Promise<PageUI>
  /** a toast:  `UI.toast()` */
  toast(options: { message: string; displayTime?: number | "auto" }): unknown
  /** dialogs that answer with a promise:  `UI.modals` */
  modals: {
    alert(options: { message: string; okText?: string }): Promise<void>
    confirm(options: { message: string; okText?: string; cancelText?: string }): Promise<boolean>
    prompt(options: { message: string; value?: string }): Promise<string | undefined>
  }
}

/**
 * The page's Spell UI runtime, if there is one -- `undefined` under node, or on a page without Spell UI.
 * - Where Spell UI keeps it, so every bundle on the page shares it (`RUNTIME_KEY`, `ui`'s `runtime.types.ts`).
 */
function pageUI(): PageUI | undefined {
  return (globalThis as Record<symbol, PageUI | undefined>)[UI_RUNTIME_KEY]
}

/** Spell UI's `RUNTIME_KEY`:  a copy, as core never imports `ui`. */
const UI_RUNTIME_KEY = Symbol.for("@spell-app/ui:runtime")
