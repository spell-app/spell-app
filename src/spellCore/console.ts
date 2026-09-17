// ----------------------------
// SpellCore console
// ----------------------------
import { Observable } from "~/util/Observable"
import { spellCore } from "./core"
import { defineSpellCoreModule } from "./SpellCore"

export type ConsoleLevel = "debug" | "info" | "warn" | "error" | "group" | "groupEnd"

export type ConsoleLine = {
  message: unknown[]
  level: ConsoleLevel
  logged?: number
}

export class SpellConsoleGroup extends Observable<
  { message: unknown[] },
  { lines: ConsoleLine[]; collapsed: boolean }
> {
  /** `message` is assigned directly (not through an accessor) via the `Observable` constructor. */
  declare message: unknown[]

  /*@proto*/ get level(): "group" {
    return "group"
  }
  set level(level: "group") {
    this.override("level", level)
  }
  // REFACTOR: can we make this `state`?
  /*@prop*/
  get lines(): ConsoleLine[] {
    return this.getProp<ConsoleLine[]>("lines", () => [])
  }
  set lines(lines: ConsoleLine[]) {
    this.setProp<ConsoleLine[]>("lines", lines)
  }

  /*@prop*/
  get collapsed(): boolean {
    return this.getProp<boolean>("collapsed", () => false)
  }
  set collapsed(collapsed: boolean) {
    this.setProp<boolean>("collapsed", collapsed)
  }
}

export class SpellConsole extends Observable<Record<string, unknown>, { lines: ConsoleLine[] }> {
  constructor(props: Partial<{ lines: ConsoleLine[] }> = {}) {
    super(props)
  }

  // Logged `lines`.  Note that `group` lines will have their own `lines`.
  // REFACTOR: can we make this `state`?
  /*@prop*/
  get lines(): ConsoleLine[] {
    return this.getProp<ConsoleLine[]>("lines", () => [])
  }
  set lines(lines: ConsoleLine[]) {
    this.setProp<ConsoleLine[]>("lines", lines)
  }

  // Reverse stack of active groups.
  // Internal use only, not observable. (???)
  groups: SpellConsoleGroup[] = []

  _addLogLine(line: ConsoleLine | SpellConsoleGroup): void {
    ;(line as { logged?: number }).logged = Date.now()
    const activeGroup: SpellConsole | SpellConsoleGroup = this.groups[0] || this
    activeGroup.lines = [...activeGroup.lines, line as ConsoleLine]

    // if we got a `group`, push it into our `groups`.
    if ((line as ConsoleLine).level === "group") this.groups.unshift(line as SpellConsoleGroup)

    spellCore.trigger("console-log", line)
  }

  /** Log at `debug` level. */
  log(...message: unknown[]): void {
    this._addLogLine({ message, level: "debug" })
    console.log(...message)
  }

  /** Log at `info` level. */
  info(...message: unknown[]): void {
    this._addLogLine({ message, level: "info" })
    console.info(...message)
  }

  /** Log at `info` level. */
  warn(...message: unknown[]): void {
    this._addLogLine({ message, level: "warn" })
    console.warn(...message)
  }

  /** Log at `info` level. */
  error(...message: unknown[]): void {
    this._addLogLine({ message, level: "error" })
    console.error(...message)
  }

  /** Log at `group` level. */
  group(...message: unknown[]): void {
    const group = new SpellConsoleGroup({ message })
    this._addLogLine(group)
    console.group(...message)
  }

  /** Log at `group` level, but collapsed. */
  groupCollapsed(...message: unknown[]): void {
    const group = new SpellConsoleGroup({ message, collapsed: true })
    this._addLogLine(group)
    console.groupCollapsed(...message)
  }

  groupEnd(): void {
    const group = this.groups.shift()
    if (group) spellCore.trigger("console-log", { ...group, level: "groupEnd" })
    console.groupEnd()
  }

  clear(): void {
    this.lines = []
    this.groups = []
    spellCore.trigger("console-clear")
    // console.clear()
  }
}

// Create a `console` instance.
export const consoleMethods = defineSpellCoreModule({
  console: new SpellConsole()
})
Object.assign(spellCore, consoleMethods)
