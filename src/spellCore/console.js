// ----------------------------
// SpellCore console
// ----------------------------
import { Observable } from "~/util/Observable.js"
import { spellCore } from "./core.js"

export class SpellConsoleGroup extends Observable {
  /*@proto*/ get level() {
    return "group"
  }
  set level(level) {
    this.override("level", level)
  }
  // REFACTOR: can we make this `state`?
  /*@prop*/
  get lines() {
    return this.getProp("lines", () => [])
  }
  set lines(lines) {
    return this.setProp("lines", lines)
  }

  /*@prop*/
  get collapsed() {
    return this.getProp("collapsed", () => false)
  }
  set collapsed(collapsed) {
    return this.setProp("collapsed", collapsed)
  }
}

export class SpellConsole extends Observable {
  // Logged `lines`.  Note that `group` lines will have their own `lines`.
  // REFACTOR: can we make this `state`?
  /*@prop*/
  get lines() {
    return this.getProp("lines", () => [])
  }
  set lines(lines) {
    return this.setProp("lines", lines)
  }

  // Reverse stack of active groups.
  // Internal use only, not observable. (???)
  groups = []

  _addLogLine(line) {
    line.logged = Date.now()
    const activeGroup = this.groups[0] || this
    activeGroup.lines = [...activeGroup.lines, line]

    // if we got a `group`, push it into our `groups`.
    if (line.level === "group") this.groups.unshift(line)

    spellCore.trigger("console-log", line)
  }

  /** Log at `debug` level. */
  log(...message) {
    this._addLogLine({ message, level: "debug" })
    console.log(...message)
  }

  /** Log at `info` level. */
  info(...message) {
    this._addLogLine({ message, level: "info" })
    console.info(...message)
  }

  /** Log at `info` level. */
  warn(...message) {
    this._addLogLine({ message, level: "warn" })
    console.warn(...message)
  }

  /** Log at `info` level. */
  error(...message) {
    this._addLogLine({ message, level: "error" })
    console.error(...message)
  }

  /** Log at `group` level. */
  group(...message) {
    const group = new SpellConsoleGroup({ message })
    this._addLogLine(group)
    console.group(...message)
  }

  /** Log at `group` level, but collapsed. */
  groupCollapsed(...message) {
    const group = new SpellConsoleGroup({ message, collapsed: true })
    this._addLogLine(group)
    console.groupCollapsed(...message)
  }

  groupEnd() {
    const group = this.groups.shift()
    if (group) spellCore.trigger("console-log", { ...group, level: "groupEnd" })
    console.groupEnd()
  }

  clear() {
    this.lines = []
    this.groups = []
    spellCore.trigger("console-clear")
    // console.clear()
  }
}

// Create a `console` instance.
Object.assign(spellCore, {
  console: new SpellConsole()
})
