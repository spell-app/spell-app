import { proto, Warnings } from "$/ui/util"

import { PAGE_SCOPE, type Disposer, type KeyHandler, type KeyRegistrationOptions } from "./runtime.types"
import { Chord } from "./Chord"

/**
 * Keyboard shortcut registry with scopes, as `UI.keyboard`.
 * - Why one registry:  with every component listening for keys on its own, an open modal can't stop
 *   the page's `/` search shortcut, and two components claiming `Escape` both fire.
 * - Scopes form a STACK:  `page` at the bottom, then one per open overlay (`Overlays` pushes / pops them).
 *   Only registrations in the TOPMOST scope fire, plus any registered `{ global: true }`.
 * - ONE capture-phase `keydown` listener on `document`, added on first `register()`:  capture so a shortcut
 *   sees the key before a component's own handler can `stopPropagation()` it.
 * - Dispatch order within a scope:  most recently registered first, so a nested component's `Escape`
 *   beats its container's.  The first handler that doesn't return `false` wins.
 * - Keys from editable targets (`<input>`, `<textarea>`, contenteditable) are ignored unless the chord has
 *   Ctrl / Meta / Alt or the registration says `{ inEditable: true }`, so typing never triggers shortcuts.
 */
export class Keyboard {
  /** warn when two active registrations in one scope claim the same chord;  on in dev builds */
  declare warnConflicts: boolean
  @proto static warnConflicts = import.meta.env.DEV

  /** decides what `Mod` means in chords */
  private readonly apple: boolean
  /** every live registration, oldest first */
  private readonly registrations: Registration[] = []
  /** scope ids, bottom first;  `page` is always at the bottom */
  private readonly scopes: string[] = [PAGE_SCOPE]
  /** document the listener is on, once connected */
  private connected?: Document

  constructor({ apple = false }: KeyboardProps = {}) {
    this.apple = apple
  }

  /**
   * Parse `text` with this keyboard's platform (`Mod` -> Meta on Apple).
   * - Exposed so components can match chords in their own handlers without importing `Chord`.
   */
  chord(text: string): Chord {
    return Chord.parse(text, { apple: this.apple })
  }

  ////////////////
  // ## Registration
  ////////////////

  /**
   * Call `handler` when `chord` is pressed while `scope` is the topmost scope.
   * - `scope`:  `"page"` for page-level shortcuts, or an overlay's scope id.
   * - Returns a disposer;  call it on disconnect.
   * - SIDE EFFECT:  first call installs the document listener.
   */
  register(scope: string, chord: string | Chord, handler: KeyHandler, options: KeyRegistrationOptions = {}): Disposer {
    const registration: Registration = {
      scope,
      chord: typeof chord === "string" ? this.chord(chord) : chord,
      handler,
      options
    }
    if (this.warnConflicts) this.checkConflict(registration)
    this.registrations.push(registration)
    this.connect()
    return () => {
      const index = this.registrations.indexOf(registration)
      if (index >= 0) this.registrations.splice(index, 1)
    }
  }

  ////////////////
  // ## Scopes
  ////////////////

  /** Topmost scope id:  the only one (besides `global` registrations) that receives keys. */
  get activeScope(): string {
    return this.scopes[this.scopes.length - 1] ?? PAGE_SCOPE
  }

  /** Push `id` on top, e.g. when a modal opens.  Its registrations now shadow everything below. */
  pushScope(id: string) {
    this.scopes.push(id)
  }

  /**
   * Remove `id` from the stack -- the topmost occurrence, wherever it is, since overlays can close out of order.
   * - NEVER removes the `page` scope.
   */
  popScope(id: string) {
    if (id === PAGE_SCOPE) return
    const index = this.scopes.lastIndexOf(id)
    if (index > 0) this.scopes.splice(index, 1)
  }

  /** Remove the document listener and every registration;  for tests and teardown. */
  dispose() {
    this.connected?.removeEventListener("keydown", this.onKeyDown, { capture: true })
    this.connected = undefined
    this.registrations.length = 0
    this.scopes.length = 1
  }

  ////////////////
  // ## Dispatch
  ////////////////

  /** Capture-phase `keydown` on `document`:  find the winning registration and run it. */
  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.isComposing) return
    const scope = this.activeScope
    const path = event.composedPath()
    const editable = isEditable(path[0])
    for (let index = this.registrations.length - 1; index >= 0; index--) {
      const { chord, handler, options, scope: own } = this.registrations[index]!
      if (own !== scope && !options.global) continue
      if (!chord.matches(event)) continue
      if (editable && !chord.hasCommandModifier && !options.inEditable) continue
      if (options.target && !path.includes(options.target)) continue
      if (handler(event) === false) continue
      if (options.preventDefault !== false) event.preventDefault()
      if (options.stopPropagation) event.stopPropagation()
      return
    }

    /** Is `target` somewhere typing happens? */
    function isEditable(target: EventTarget | undefined): boolean {
      if (!(target instanceof HTMLElement)) return false
      if (target.isContentEditable || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
        return true
      }
      return target instanceof HTMLInputElement && !NON_TEXT_INPUTS.has(target.type)
    }
  }

  /** Install the document listener once. */
  private connect() {
    if (this.connected || typeof document === "undefined") return
    this.connected = document
    document.addEventListener("keydown", this.onKeyDown, { capture: true })
  }

  /** Dev warning when `registration` claims a chord another registration in its scope already has. */
  private checkConflict(registration: Registration) {
    const text = registration.chord.toString()
    const clash = this.registrations.find(
      (other) =>
        other.scope === registration.scope &&
        other.chord.toString() === text &&
        other.options.target === registration.options.target
    )
    if (clash) {
      Warnings.warn(
        "UI.keyboard",
        `"${text}" registered twice in scope "${registration.scope}";  the newer handler wins:`,
        { existing: clash.handler, added: registration.handler }
      )
    }
  }
}

/** Constructor props for `Keyboard`. */
export type KeyboardProps = {
  /** Apple platform:  `Mod` means Meta.  The runtime passes `UI.browser.isApple`. */
  apple?: boolean
}

/** One `register()` call. */
type Registration = {
  /** scope it's active in */
  scope: string
  /** parsed chord */
  chord: Chord
  /** what to run */
  handler: KeyHandler
  /** as passed to `register()` */
  options: KeyRegistrationOptions
}

/** `<input type>`s where typing doesn't happen, so shortcuts stay live. */
const NON_TEXT_INPUTS = new Set(["button", "checkbox", "radio", "range", "reset", "submit", "color", "file", "image"])
