import { Observable, prop } from "$/util"
import { spellCore } from "./core"
import { defineSpellCoreModule } from "./spellCore.types"

/** Kind of console line -- matches native `console.*` method names, plus `groupEnd` to close a group. */
export type ConsoleLevel = "debug" | "info" | "warn" | "error" | "group" | "groupEnd"

/** One logged line (or group), as tracked by `spellCore.console`. */
export type ConsoleLine = {
  /** Args passed to the log call, e.g. `spellCore.console.log(1, 2)` => `[1, 2]`. */
  message: unknown[]
  /** Which `console.*` method this line was logged at. */
  level: ConsoleLevel
  /** `Date.now()` timestamp set by `SpellConsole._addLogLine()` when line was recorded. */
  logged?: number
}

/**
 * A `group`/`groupCollapsed` console line -- besides its own `message`/`collapsed`, it also has its
 * own `lines` (nested log lines recorded while it's the active group), so it can render as a
 * collapsible tree in a UI.
 */
export class SpellConsoleGroup extends Observable<
  { message: unknown[] },
  { lines: ConsoleLine[]; collapsed: boolean }
> {
  /** `message` is assigned directly (not through an accessor) via the `Observable` constructor. */
  declare message: unknown[]

  /** Always `"group"` -- lets a `SpellConsoleGroup` satisfy `ConsoleLine`'s `level` field. */
  /*@proto*/ get level(): "group" {
    return "group"
  }
  set level(level: "group") {
    this.override("level", level)
  }
  /**
   * Nested lines logged while this group was the active group -- see `SpellConsole._addLogLine()`.
   * - Replaced, never changed in place:  a spell cell notifies on a new value only.
   */
  // REFACTOR: can we make this `state`?
  @prop({ type: "list", init: () => [] })
  accessor lines!: ConsoleLine[]

  /** Whether this group is collapsed:  starts so from `spellCore.console.groupCollapsed()`, a UI toggles it. */
  @prop({ type: "choice", default: false })
  accessor collapsed!: boolean
}

/**
 * `spellCore.console` -- structured, observable console log backing spell's `print` statements.
 * - Tracks `lines` (and nested `groups`) as `ConsoleLine`s on top of also forwarding to the native
 *   `console`, so a UI can render the log reactively (e.g. a debug panel) while it still shows up
 *   in devtools.
 * - Compiles from spell `print` / `print warning` / `print error` / `print group` /
 *   `print collapsed group` / `end print group` (see `rules/UI/`).
 * - A line holding a DUMP, e.g. of a thing (`print the card`), goes through `printDump()`:
 *   `spell run` sends it to stderr, so stdout holds only the program's data.
 */
export class SpellConsole extends Observable<Record<string, unknown>, { lines: ConsoleLine[] }> {
  constructor(props: Partial<{ lines: ConsoleLine[] }> = {}) {
    super(props)
  }

  /**
   * Where `log()` and `info()` print a line holding a DUMP:  a value that isn't plain data,
   * e.g. a thing or a spell list (`print the card`) -- see `isPlainValue()`.
   * - Default:  the native `console.log()`, so a page shows it as any other line:  a browser's console has no streams.
   * - `spell run` points it at stderr (`runProject.ts`), so stdout holds only text, numbers, yes / no and plain lists,
   *   as Python's core prints them (plan doc python-target, Q17).
   */
  printDump: (...message: unknown[]) => void = (...message) => console.log(...message)

  /**
   * Logged `lines` -- `group` lines have their own nested `lines`, not flattened in here.
   * - Replaced, never changed in place:  a spell cell notifies on a new value only.
   */
  // REFACTOR: can we make this `state`?
  @prop({ type: "list", init: () => [] })
  accessor lines!: ConsoleLine[]

  /** Reverse stack of active groups (most-nested first) -- internal use only, not observable. (???) */
  groups: SpellConsoleGroup[] = []

  /**
   * Record `line` into whichever `lines` array is active (nested inside current group, if any),
   * stamp it with `logged`, and fire a `console-log` event.
   * - SIDE EFFECT: pushes `line` onto `this.groups` if it's itself a `group` line, making it the new
   *   active group for subsequent lines.
   */
  _addLogLine(line: ConsoleLine | SpellConsoleGroup): void {
    ;(line as { logged?: number }).logged = Date.now()
    const activeGroup: SpellConsole | SpellConsoleGroup = this.groups[0] || this
    activeGroup.lines = [...activeGroup.lines, line as ConsoleLine]

    // if we got a `group`, push it into our `groups`.
    if ((line as ConsoleLine).level === "group") this.groups.unshift(line as SpellConsoleGroup)

    spellCore.trigger("console-log", line)
  }

  /** Log at `debug` level:  a dump through `printDump()`. */
  log(...message: unknown[]): void {
    this._addLogLine({ message, level: "debug" })
    if (message.every(isPlainValue)) console.log(...message)
    else this.printDump(...message)
  }

  /** Log at `info` level:  a dump through `printDump()`. */
  info(...message: unknown[]): void {
    this._addLogLine({ message, level: "info" })
    if (message.every(isPlainValue)) console.info(...message)
    else this.printDump(...message)
  }

  /** Log at `warn` level. */
  warn(...message: unknown[]): void {
    this._addLogLine({ message, level: "warn" })
    console.warn(...message)
  }

  /** Log at `error` level. */
  error(...message: unknown[]): void {
    this._addLogLine({ message, level: "error" })
    console.error(...message)
  }

  /**
   * Log at `group` level -- subsequent log calls nest inside this group until `groupEnd()`.
   * - A heading holding a dump goes through `printDump()`, before an unnamed group.
   */
  group(...message: unknown[]): void {
    const group = new SpellConsoleGroup({ message })
    this._addLogLine(group)
    if (message.every(isPlainValue)) {
      console.group(...message)
    } else {
      this.printDump(...message)
      console.group()
    }
  }

  /** Log at `group` level, but collapsed -- same nesting as `group()`. */
  groupCollapsed(...message: unknown[]): void {
    const group = new SpellConsoleGroup({ message, collapsed: true })
    this._addLogLine(group)
    if (message.every(isPlainValue)) {
      console.groupCollapsed(...message)
    } else {
      this.printDump(...message)
      console.groupCollapsed()
    }
  }

  /** Close current group (opened by `group()`/`groupCollapsed()`), popping back to its parent. */
  groupEnd(): void {
    const group = this.groups.shift()
    // oxlint-disable-next-line typescript/no-misused-spread
    if (group) spellCore.trigger("console-log", { ...group, level: "groupEnd" })
    console.groupEnd()
  }

  /** Clear all `lines` and `groups`, and fire a `console-clear` event. */
  clear(): void {
    this.lines = []
    this.groups = []
    spellCore.trigger("console-clear")
    // console.clear()
  }
}

/**
 * Is `value` plain data, which a program prints as its output:  text, a number, yes / no, nothing,
 * or a plain list or object (whatever is in it)?
 * - Anything else is a DUMP, e.g. of a thing, a spell list, a function:  see `SpellConsole.printDump()`.
 * - The same split as Python's core (`PLAIN_VALUES`, in `py/spell_core/console.py`).
 */
export function isPlainValue(value: unknown): boolean {
  if (value === null || value === undefined || Array.isArray(value)) return true
  const type = typeof value
  if (type === "string" || type === "number" || type === "boolean" || type === "bigint") return true
  if (type !== "object") return false
  const prototype = Object.getPrototypeOf(value) as object | null
  return prototype === Object.prototype || prototype === null
}

/** Assembled `spellCore.console` module -- a fresh `SpellConsole` instance shared by all consumers. */
export const consoleMethods = defineSpellCoreModule({
  /** The shared `SpellConsole` instance, exposed as `spellCore.console`. */
  console: new SpellConsole()
})
Object.assign(spellCore, consoleMethods)
