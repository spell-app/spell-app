// ----------------------------
// Runtime setup.
// TODOC
// ----------------------------
import React from "react"
import { isNode } from "browser-or-node"

import { spellCore } from "."

Object.assign(spellCore, {
  // Set to true to show debug messages for spellCore.RUNTIME actions
  DEBUG_RUNTIME: false, // !isNode,

  //----------------------------
  // Runtime state
  //--------

  /** Global runtime state root. */
  RUNTIME: undefined,

  /**
   * Reset `spellCore.RUNTIME`, e.g. when a project starts or a test is run.
   * Returns the new runtime.
   */
  resetRuntime() {
    if (spellCore.DEBUG_RUNTIME) console.info("Resetting spellCore.RUNTIME")
    spellCore.RUNTIME = {}
    return spellCore.RUNTIME
  },

  /** Clear the `spellCore.RUNTIME` */
  clearRuntime() {
    if (spellCore.DEBUG_RUNTIME) console.info("Clearing spellCore.RUNTIME")
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
      if (spellCore.DEBUG_RUNTIME) console.warn(`spellCore.getRuntimeState(${name}): spellCore.RUNTIME is not set up!`)
      return initializer()
    }
    if (!(name in spellCore.RUNTIME)) {
      spellCore.RUNTIME[name] = initializer()
      if (spellCore.DEBUG_RUNTIME)
        console.info(`spellCore.getRuntimeState(${name}): reset state to `, spellCore.RUNTIME[name])
    }
    return spellCore.RUNTIME[name]
  },

  /**
   * Reset (clear) `name`d state in our `RUNTIME`.
   * Warns if RUNTIME is not set up.
   */

  clearRuntimeState(name) {
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
    const wasRunning = flags[name]
    if (exclusively) flags[name] = "!"
    else flags[name] = flags[name]++ || 1
    if (spellCore.DEBUG_RUNTIME)
      console.warn("startProcess", { name, wasRunning, isRunning: flags[name], flags: { ...flags } })
  },

  /**
   * Is a given a process running?
   * TODO: second `exclusively` parameter so we can tell if it's running exclusively?
   */
  processIsRunning(name) {
    const flags = spellCore.getProcessFlags()
    const isRunning = flags[name] === "!" || (typeof flags[name] === "number" && flags[name] > 0)
    if (spellCore.DEBUG_RUNTIME) console.warn("processIsRunning", { name, isRunning, flags: { ...flags } })
    return isRunning
  },

  /**
   * Stop a given process.
   * If the process was not stopped exclusively, this decrements its counter.
   * Returns `true` if the process is still running.
   */
  stopProcess(name) {
    const flags = spellCore.getProcessFlags()
    let wasRunning = !!flags[name]
    if (wasRunning) {
      if (flags[name] === "!") delete flags[name]
      else if (flag[name] > 0) flags[name]--
    }
    if (spellCore.DEBUG_RUNTIME)
      console.warn("stopProcess", { name, wasRunning, isRunning: flags[name], flags: { ...flags } })
    return !!flags[name]
  }
})
