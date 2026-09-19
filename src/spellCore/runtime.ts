// ----------------------------
// Runtime setup.
// TODOC
// ----------------------------
import { spellCore } from "./core"
import { Eventful } from "./SpellEvent"
import { defineSpellCoreModule, type SpellCore } from "./SpellCore"

export class SpellRuntime extends Eventful() {
  // Delegate events to `spellCore`.
  get eventParent(): SpellCore {
    return spellCore
  }
}

/** `spellCore.RUNTIME`: the `SpellRuntime` instance, used as a dynamic keyed state bag. */
export type SpellRuntimeState = SpellRuntime & { [key: string]: unknown }

/** Per-process running flags: `"!"` means "running exclusively", a number is a running count. */
export type ProcessFlags = Record<string, number | "!" | undefined>

export const runtimeMethods = defineSpellCoreModule({
  // Set to true to show debug messages for spellCore.RUNTIME actions
  DEBUG_RUNTIME: false, // !isNode,
  DEBUG_PROCESSES: false, // !isNode,

  //----------------------------
  // Runtime state
  //--------

  /** Global runtime state root. */
  RUNTIME: undefined as SpellRuntimeState | undefined,

  /**
   * Reset `spellCore.RUNTIME`, e.g. when a project starts or a test is run.
   * Returns the new runtime.
   */
  resetRuntime(): SpellRuntimeState {
    if (spellCore.DEBUG_RUNTIME) console.info("Resetting spellCore.RUNTIME")
    spellCore.RUNTIME = new SpellRuntime() as SpellRuntimeState
    return spellCore.RUNTIME
  },

  /** Clear the `spellCore.RUNTIME` */
  clearRuntime(): void {
    if (spellCore.DEBUG_RUNTIME) console.info("Clearing spellCore.RUNTIME")
    spellCore.RUNTIME = undefined
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

  //----------------------------
  // process management
  //--------

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
   */
  startProcess(name: string, exclusively?: boolean): void {
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
   * Is a given a process running?
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
   * If the process was not stopped exclusively, this decrements its counter.
   * Returns `true` if the process is still running.
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
