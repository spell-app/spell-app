import { spellCore } from "./core"
import { Eventful } from "./SpellEvent"
import { defineSpellCoreModule, type SpellCore } from "./spellCore.types"

/**
 * Class backing `spellCore.RUNTIME` -- a live per-project state bag (see `SpellRuntimeState`) that's
 * also eventful, so compiled `trigger`/`on event` spell statements (see `events.ts`), which emit
 * `spellCore.RUNTIME.trigger(...)`/`spellCore.RUNTIME.on(...)`, work directly on it.
 */
export class SpellRuntime extends Eventful() {
  /** Delegate events to `spellCore`, so a listener registered via `spellCore.on(...)` also fires. */
  get eventParent(): SpellCore {
    return spellCore
  }
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
   * - Compiles from spell `start process X` / `start animation X` (see `async.ts`).
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
   * - Compiles from spell `X is running` / `X isn't running` (see `check_process` in `async.ts`);
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
   * - Compiles from spell `stop`/`end`/`finish`/`cancel` `process`/`animation` `X` (see `async.ts`).
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
