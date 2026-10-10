import { spellCore } from "./core"
import { Eventful, type EventCallback, type SpellEvent } from "./SpellEvent"
import { defineSpellCoreModule } from "./spellCore.types"

/**
 * Class backing `spellCore.RUNTIME` -- a live per-project state bag (see `SpellRuntimeState`) that's
 * also eventful:  a program's events are ITS runtime's, so they end with it.
 * - Reach them through `on()` / `trigger()` (below), which find the CURRENT runtime.
 * - Programs compiled before those still call `spellCore.RUNTIME.on(...)` / `.trigger(...)` -- the same lists.
 */
export class SpellRuntime extends Eventful() {}

/**
 * Call `callback` each time the running program triggers `eventType` -- `on card-click with a card: ...`.
 * - `Payload`:  what the event brings, e.g. `on<{ card: Card }>("card-click", ({ card }) => card.play())`.
 *   Types only:  nothing checks it.
 * - `eventType` is case-insensitive.
 * - On the CURRENT `spellCore.RUNTIME`, found as it's called:  a new one is made each time a program starts, so a
 *   listener ends with its run.
 * - throws if no program is running (`resetRuntime()` not called yet).
 */
export function on<Payload extends object = object>(eventType: string, callback: EventCallback<Payload>): void {
  runtimeFor("on").on(eventType, callback)
}

/** Stop calling `callback` for `eventType` -- see `on()`.  Nothing running:  nothing to stop. */
export function off<Payload extends object = object>(eventType: string, callback: EventCallback<Payload>): void {
  spellCore.RUNTIME?.off(eventType, callback)
}

/** Call `callback` the NEXT time the running program triggers `eventType`, then forget it -- see `on()`. */
export function once<Payload extends object = object>(eventType: string, callback: EventCallback<Payload>): void {
  runtimeFor("once").once(eventType, callback)
}

/**
 * Trigger `event` in the running program -- `trigger card-click with the card` =>
 * `trigger("card-click", { card: this })`.
 * - `props` are copied onto the event, so a listener reads `event.card`.
 * - Returns what each listener returned, in the order they were added.
 * - Nothing running:  nobody hears it, `[]`.  NEVER throws:  `spellCore.console` triggers its lines before then.
 */
export function trigger(event: SpellEvent | string, props?: object): unknown[] {
  return spellCore.RUNTIME?.trigger(event, props) ?? []
}

/** `spellCore.RUNTIME`, for `on()` / `once()` -- throws, naming `method`, if no program is running. */
function runtimeFor(method: string): SpellRuntimeState {
  if (!spellCore.RUNTIME) {
    throw new TypeError(`${method}():  no program is running;  call spellCore.resetRuntime() first`)
  }
  return spellCore.RUNTIME
}

/** `spellCore.RUNTIME`: the `SpellRuntime` instance, used as a dynamic keyed state bag. */
export type SpellRuntimeState = SpellRuntime & { [key: string]: unknown }

/** Per-process running flags: `"!"` means "running exclusively", a number is a running count. */
export type ProcessFlags = Record<string, number | "!" | undefined>

export const runtimeMethods = defineSpellCoreModule({
  /** Set to `true` to show debug messages for `spellCore.RUNTIME` actions. */
  DEBUG_RUNTIME: false, // !isNode,
  /** Set to `true` to show debug messages for process start/stop actions. */
  DEBUG_PROCESSES: false, // !isNode,

  ////////////////
  // ## Events -- the running program's, on `RUNTIME`
  ////////////////

  /** `spellCore.on(...)`:  compiled JavaScript's spelling of `on()` -- see `on()`. */
  on,
  /** `spellCore.off(...)` -- see `off()`. */
  off,
  /** `spellCore.once(...)` -- see `once()`. */
  once,
  /** `spellCore.trigger(...)` -- see `trigger()`. */
  trigger,

  ////////////////
  // ## Runtime State
  ////////////////

  /**
   * Global runtime state root.
   * - Typed as always set:  every runner calls `resetRuntime()` before a program runs (`runCompiled()`, the
   *   `cli`'s `runProject.ts`, tests), so compiled spell reads it bare, e.g. `spellCore.RUNTIME.trigger(...)`.
   * - NOTE:  `undefined` until then, or after `clearRuntime()`:  `getRuntimeState()` / `clearRuntimeState()` check.
   */
  RUNTIME: undefined as unknown as SpellRuntimeState,

  /**
   * Reset `spellCore.RUNTIME`, e.g. when a project starts or a test is run.
   * Returns the new runtime.
   * - SIDE EFFECT:  forgets the last run's things too -- see `spellCore.things`.
   */
  resetRuntime(): SpellRuntimeState {
    if (spellCore.DEBUG_RUNTIME) console.info("Resetting spellCore.RUNTIME")
    spellCore.things.clear()
    spellCore.RUNTIME = new SpellRuntime() as SpellRuntimeState
    return spellCore.RUNTIME
  },

  /** Clear `spellCore.RUNTIME`:  unset again, as before the first `resetRuntime()` -- see `RUNTIME`. */
  clearRuntime(): void {
    if (spellCore.DEBUG_RUNTIME) console.info("Clearing spellCore.RUNTIME")
    spellCore.RUNTIME = undefined as unknown as SpellRuntimeState
  },

  /**
   * Return `name`d section of state in our `RUNTIME` environment:
   *  - if `RUNTIME[name]` is already set up, returns that.
   *  - if not, runs `initializer()` to set the value and returns that.
   * If RUNTIME is not set up, warns and runs `initializer` each time.
   */
  getRuntimeState<T>(name: string, initializer: () => T): T {
    if (!spellCore.RUNTIME) {
      if (spellCore.DEBUG_RUNTIME) console.warn(`spellCore.getRuntimeState(${name}): spellCore.RUNTIME is not set up!`)
      return initializer()
    }
    const runtime = spellCore.RUNTIME
    if (!(name in runtime)) {
      runtime[name] = initializer()
      if (spellCore.DEBUG_RUNTIME) console.info(`spellCore.getRuntimeState(${name}): reset state to `, runtime[name])
    }
    return runtime[name] as T
  },

  /**
   * Reset (clear) `name`d state in our `RUNTIME`.
   * Warns if RUNTIME is not set up.
   */

  clearRuntimeState(name: string): void {
    if (!spellCore.RUNTIME) {
      if (spellCore.DEBUG_RUNTIME)
        console.warn(`spellCore.clearRuntimeState(${name}): spellCore.RUNTIME is not set up!`)
    } else {
      delete spellCore.RUNTIME[name]
    }
  },

  ////////////////
  // ## Process Management
  ////////////////

  /**
   * Initialize and return process flags for the current `spellCore.RUNTIME`.
   * If `RUNTIME` is not set up, warns and returns a new object each time.
   */
  getProcessFlags(): ProcessFlags {
    function initializer(): ProcessFlags {
      return {}
    }
    return spellCore.getRuntimeState("processFlags", initializer)
  },

  /**
   * Start a conceptual process by `name`.
   * - Compiles from spell `start process X` / `start animation X` (see `rules/async/StartProcess.ts`).
   * - `exclusively`: pass `'EXCLUSIVE'` to flag it exclusive -- this unconditionally (re)flags the
   *   process, so exclusive callers MUST check `processIsRunning()` first if they want re-entry guarded
   *   (compiled `start exclusive process X` does this for you).
   * - Non-exclusive calls instead bump a running count.
   */
  startProcess(name: string, exclusively?: "EXCLUSIVE"): void {
    const flags = spellCore.getProcessFlags()
    const wasRunning = flags[name]
    if (exclusively) flags[name] = "!"
    // NOTE: `flags[name]++ || 1` in the original always reassigns the PRE-increment value,
    // so the increment's side effect is immediately overwritten -- this is the equivalent.
    else flags[name] = Number(flags[name]) || 1
    if (spellCore.DEBUG_PROCESSES)
      console.warn("startProcess", { name, wasRunning, isRunning: flags[name], flags: { ...flags } })
  },

  /**
   * Is a given process running?
   * - Compiles from spell `X is running` / `X isn't running` (see `check_process`, `rules/async/CheckProcess.ts`);
   *   the `isn't` form wraps this in a `NotExpression` rather than negating here.
   * TODO: second `exclusively` parameter so we can tell if it's running exclusively?
   */
  processIsRunning(name: string): boolean {
    const flags = spellCore.getProcessFlags()
    const isRunning = flags[name] === "!" || (typeof flags[name] === "number" && (flags[name] as number) > 0)
    if (spellCore.DEBUG_PROCESSES) console.warn("processIsRunning", { name, isRunning, flags: { ...flags } })
    return isRunning
  },

  /**
   * Stop a given process.
   * - Compiles from spell `stop`/`end`/`finish`/`cancel` `process`/`animation` `X` (see `rules/async/StopProcess.ts`).
   * - If process was not started exclusively, this decrements its counter instead of clearing it.
   * - Returns `true` if process is still running (non-exclusive counter still `> 0`).
   */
  stopProcess(name: string): boolean {
    const flags = spellCore.getProcessFlags()
    const wasRunning = !!flags[name]
    if (wasRunning) {
      if (flags[name] === "!") delete flags[name]
      // BUGFIX: was `flag[name]` (undefined global) instead of `flags[name]`, which threw a ReferenceError.
      else if (typeof flags[name] === "number" && (flags[name] as number) > 0) flags[name] = (flags[name] as number) - 1
    }
    if (spellCore.DEBUG_PROCESSES)
      console.warn("stopProcess", { name, wasRunning, isRunning: flags[name], flags: { ...flags } })
    return !!flags[name]
  }
})
Object.assign(spellCore, runtimeMethods)
