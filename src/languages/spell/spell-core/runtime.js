// ----------------------------
// Runtime setup.
// TODOC
// ----------------------------
import React from "react"

import { spellCore } from "."

Object.assign(spellCore, {
  //----------------------------
  // Runtime state
  //--------

  /** Global runtime state */
  RUNTIME: undefined,

  /**
   * Reset `spellCore.RUNTIME`, e.g. when a project starts or a test is run.
   * Returns the new runtime.
   */
  resetRuntime() {
    spellCore.RUNTIME = {}
    return spellCore.RUNTIME
  },

  /** Clear the `spellCore.RUNTIME` */
  clearRuntime() {
    spellCore.RUNTIME = undefined
  },

  /**
   * Return `name`d section of state in our `RUNTIME` environment:
   *  - if `RUNTIME[name]` is already set up, returns that.
   *  - if not, runs `initializer()` to set the value and returns that.
   * If RUNTIME is not set up, warns and runs `initializer` each time.
   */
  getRuntimeState(name, initializer) {
    if (!spellCore.RUNTIME) {
      console.warn("spellCore.initializeRuntimeState(): spellCore.RUNTIME is not set up!")
      return initializer()
    }
    if (!Object.hasOwnProperty(spellCore.RUNTIME, name)) {
      spellCore.RUNTIME[name] = initializer()
    }
    return spellCore.RUNTIME[name]
  },

  /**
   * Reset (clear) `name`d state in our `RUNTIME`.
   * Warns if RUNTIME is not set up.
   */

  clearRuntimeState(name) {
    if (!spellCore.RUNTIME) {
      console.warn("spellCore.clearRuntimeState(): spellCore.RUNTIME is not set up!")
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
  getProcessFlags() {
    function initializer() {
      return {}
    }
    return spellCore.getRuntimeState("processFlags", initializer)
  },

  /**
   * Start a conceptual process by `name`.
   */
  startProcess(name, exclusively) {
    const flags = spellCore.getProcessFlags()
    if (exclusively) flags[name] = "!"
    else flags[name] = flags[name]++ || 1
    return flags
  },

  /**
   * Is a given a process running?
   * TODO: second `exclusively` parameter so we can tell if it's running exclusively?
   */
  processIsRunning(name) {
    const flags = spellCore.getProcessFlags()
    return flags[name] === "!" || (typeof flags[name] === "number" && flags[name] > 0)
  },

  /**
   * Stop a given process.
   * If the process was not stopped exclusively, this decrements its counter.
   * Returns `true` if the process is still running.
   */
  stopProcess(name) {
    const flags = spellCore.getProcessFlags()
    if (flags[name]) {
      if (flags[name] === "!") delete flags[name]
      else if (flag[name] > 0) flags[name]--
    }
    return !!flags[name]
  }
})
