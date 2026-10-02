import global from "global"
import { For, Show, createContext, createMemo, useContext } from "solid-js"
import type { JSX } from "@solidjs/web"

import { Observable } from "$/util"
import type { ConsoleLine as ConsoleLineData, SpellConsoleGroup } from "$/core/console"

// Import directly, NOT through the `$/app/solid` barrel, which pulls in the editor
import { tracked } from "./tracked"

import "./ConsoleLines.css"

//
//  ## Lines of `spellCore.console`, drawn as a collapsible tree
//
//  NOTE: imports nothing of the editor's, the parser's or `$/ui`'s, so the VS Code runner
//  (`$/app/runner`) can show a console without pulling them in.  What the editor knows beyond plain
//  values -- e.g. parser `Match`es -- comes in through `ConsoleInspectorContext`, see `<ConsoleViewer>`.
//

/** Left padding, in px, for a non-group console line (group lines get 0 -- their toggle icon fills the space). */
const NORMAL_LINE_SPACE = 20
/** Extra left padding, in px, per nesting `indent` level. */
const INDENT_WIDTH = 12
/** Horizontal offset, in px, of the vertical `.ConsoleGroupSpan` guide line relative to its indent. */
const SPAN_OFFSET = -4

/**
 * What the console knows beyond plain values, for `<ConsoleObject>` / `<ConsoleValue>` below.
 * - The context IS the provider:  `<ConsoleInspectorContext value={inspector}>...</ConsoleInspectorContext>`.
 * - Default knows nothing extra.  `<ConsoleViewer>` provides the editor's, which knows parser `Match`es.
 */
export const ConsoleInspectorContext = createContext<ConsoleInspector>({})

/** See `ConsoleInspectorContext`. */
export type ConsoleInspector = {
  /** Display for object `thing`, or `undefined` for the default. */
  describe?(thing: object): string | undefined
  /** Observable value `thing` was clicked -- after it's logged to devtools as `it`. */
  inspect?(thing: unknown): void
}

/****************
 * ### `<ConsoleLines>`
 * Renders a list of console `lines` -- `group` lines recurse via `<ConsoleGroup>`, others via `<ConsoleLine>`.
 * Also draws the `.ConsoleGroupSpan` vertical guide line for this indent level.
 * - `lines` is a VALUE:  the caller makes it reactive, e.g. `lines={lines()}` over `tracked(() => console.lines)`.
 *   A group's own `lines` are tracked here, by `<ConsoleGroup>`.
 * - Rows are keyed by line identity:  a line logged adds ONE row, the existing ones stay as they are.
 * - NOTE: styles assume it's inside a `.ConsoleViewer`, e.g. `<div class="ConsoleViewer scrolling">`.
 ****************/
export function ConsoleLines(props: ConsoleLinesProps) {
  const indent = () => props.indent ?? 0
  return (
    <div class={props.class ?? "ConsoleLines"}>
      <Show when={!props.collapsed}>
        <For each={props.lines}>
          {(line) =>
            line.level === "group" ? (
              <ConsoleGroup line={line as SpellConsoleGroup} indent={indent()} />
            ) : (
              <ConsoleLine line={line} indent={indent()} />
            )
          }
        </For>
        <div class="ConsoleGroupSpan" style={{ left: `${SPAN_OFFSET + indent() * INDENT_WIDTH}px` }} />
      </Show>
    </div>
  )
}

/** Props for `<ConsoleLines>`. */
export type ConsoleLinesProps = {
  /** Nesting depth, used for left padding and to compute the child `indent` for a `group`.  Default:  `0`. */
  indent?: number
  /** Lines to render, in order -- a mix of plain lines and `group` lines. */
  lines: readonly (ConsoleLineData | SpellConsoleGroup)[]
  /** When `true`, render nothing (used for a collapsed `group`'s children). */
  collapsed?: boolean
  /** Wrapper class.  Default:  `"ConsoleLines"`. */
  class?: string
}

/****************
 * ### `<ConsoleLine>`
 * Single console line for anything that is NOT a `group`.
 * - `message` is read once:  a logged line never changes.
 ****************/
export function ConsoleLine(props: ConsoleLineProps) {
  const left = () => props.indent * INDENT_WIDTH + (props.line.level !== "group" ? NORMAL_LINE_SPACE : 0)
  return (
    <div class={[props.line.level, "ConsoleLine"]} style={{ "padding-left": `${left()}px` }}>
      {props.icon}
      {/* by position:  a message may log the same value twice */}
      <For each={props.line.message} keyed={false}>
        {(thing) => <ConsoleObject thing={thing()} />}
      </For>
    </div>
  )
}

/** Props for `<ConsoleLine>`. */
export type ConsoleLineProps = {
  /** Line data -- for a `group` line this is passed by `<ConsoleGroup>`, `icon` included. */
  line: ConsoleLineData | SpellConsoleGroup
  /** Group-toggle disclosure triangle, passed in by `<ConsoleGroup>`;  absent for a plain line. */
  icon?: JSX.Element
  /** Nesting depth, for left padding. */
  indent: number
}

/****************
 * ### `<ConsoleGroup>`
 * Console `group` line:  a toggleable disclosure triangle plus its (possibly collapsed) child `lines`.
 * - Its `lines` and `collapsed` are `easy-state` (`SpellConsoleGroup` is an `Observable`):  read through `tracked()`.
 * - SIDE EFFECT: `toggle` mutates `line.collapsed` directly, from the click handler.
 ****************/
export function ConsoleGroup(props: ConsoleGroupProps) {
  const lines = tracked(() => props.line.lines)
  const collapsed = tracked(() => props.line.collapsed)
  const icon = (
    <span class="ConsoleGroupIcon" style={{ width: `${NORMAL_LINE_SPACE}px` }}>
      <span style={{ cursor: "pointer" }} onClick={toggle}>
        {collapsed() ? "▶" : "▼"}
      </span>
    </span>
  )
  return (
    <>
      <ConsoleLine line={props.line} icon={icon} indent={props.indent} />
      <ConsoleLines lines={lines()} collapsed={collapsed()} indent={props.indent + 1} />
    </>
  )

  /** Collapse / expand the group:  an `easy-state` write, so `collapsed()` follows. */
  function toggle() {
    props.line.collapsed = !props.line.collapsed
  }
}

/** Props for `<ConsoleGroup>`. */
export type ConsoleGroupProps = {
  /** Group line data, including its `lines` and `collapsed` state. */
  line: SpellConsoleGroup
  /** Nesting depth, for left padding. */
  indent: number
}

/****************
 * ### `<ConsoleValue>`
 * Single styled value within a console line's message (see `ConsoleObject`).
 * - Clicking an `observable` value logs it to devtools as `it`, then hands it to `ConsoleInspector.inspect()`.
 ****************/
export function ConsoleValue(props: ConsoleValueProps) {
  const inspector = useContext(ConsoleInspectorContext)
  return (
    <span class={["ConsoleValue", props.type, { observable: !!props.observable }]} onClick={onClick}>
      {props.display}
    </span>
  )

  /**
   * Click handler:  inspect the `observable` value, if any.
   * - SIDE EFFECT: stashes it on `global.it` and logs it, so it can be poked at in devtools.
   */
  // TODO: ObjectInspector popup or modal
  function onClick(): void {
    const thing = props.observable
    if (!thing) return
    global.it = thing
    console.log(`it =`, thing)
    inspector.inspect?.(thing)
  }
}

/** Props for `<ConsoleValue>`. */
export type ConsoleValueProps = {
  /** CSS class / kind tag for styling, e.g. `"string"`, `"number"`, a constructor name. */
  type: string
  /** Rendered content. */
  display: JSX.Element
  /** Underlying value, if clicking should inspect it via `ConsoleInspector.inspect()`. */
  observable?: unknown
}

/****************
 * ### `<ConsoleObject>`
 * Renders one logged `thing` as a `<ConsoleValue>`, picking a `type` label and `display` string
 * appropriate to its runtime type (primitive, function, `Date`, `Array`, or generic object).
 * - `ConsoleInspector.describe()` gets first say on any other object, e.g. a parser `Match`.
 ****************/
export function ConsoleObject(props: ConsoleObjectProps) {
  const inspector = useContext(ConsoleInspectorContext)
  const shown = createMemo(() => showThing(props.thing, inspector))
  return <ConsoleValue type={shown().type} display={shown().display} observable={shown().observable} />
}

/** Props for `<ConsoleObject>`. */
export type ConsoleObjectProps = {
  /** Logged value to render -- any type is accepted since `console.log` accepts anything. */
  thing: unknown
}

/** How `<ConsoleObject>` shows a value:  `<ConsoleValue>`'s props. */
type ShownThing = Pick<ConsoleValueProps, "type" | "display" | "observable">

/**
 * How to show logged `thing`, asking `inspector` first about objects it might know.
 * - NOTE: as React did, `true` / `false` / `undefined` show as NOTHING:  JSX draws no text for them.
 *   See `SUSPECTED-BUGS.md`, "app".
 */
function showThing(thing: unknown, inspector: ConsoleInspector): ShownThing {
  if (thing === null) return { type: "null", display: "null" }
  switch (typeof thing) {
    case "undefined":
    case "string":
    case "number":
    case "boolean":
      return { type: typeof thing, display: thing as JSX.Element }
    case "function":
      return { type: "function", display: "ƒ {...}", observable: thing }
    default: {
      const obj = thing as object
      const type = (obj as { constructor?: { name?: string } })?.constructor?.name || "object???"
      return { type, display: describeObject(obj, type, inspector), observable: obj }
    }
  }
}

/** Display string for object `obj` of class name `type`. */
function describeObject(obj: object, type: string, inspector: ConsoleInspector): string {
  // TODO: `List`, `match`
  if (obj instanceof Date) return `Date (${obj})`
  if (Array.isArray(obj)) return `Array(${obj.length})`
  const described = inspector.describe?.(obj)
  if (described !== undefined) return described
  try {
    const tagged = obj as Record<PropertyKey, unknown>
    // exotic objects sometimes have `Symbol.toStringTag` property as their name
    if (Symbol.toStringTag in obj) return `${tagged[Symbol.toStringTag] as string} {...}`
    // If it has a custom toString, use that
    // NOTE: guarded -- only interpolate when the object has its OWN `toString`,
    // so this can never produce '[object Object]'.
    // oxlint-disable-next-line typescript/no-base-to-string
    if (tagged.toString && tagged.toString !== Object.prototype.toString) return `${obj}`
    // `Object {...}` or `Object {}` for empty object
    return `${type} {${Object.keys(obj).length || obj instanceof Observable ? "..." : ""}}`
  } catch {
    return "Unknown Thinger???"
  }
}
