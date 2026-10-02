/** @jsxImportSource react */
//
//  ## Lines of `spellCore.console`, drawn as a collapsible tree
//
//  NOTE: its own file, importing nothing of the editor's or the parser's, so the VS Code runner
//  (`$/app/runner`) can show a console without pulling them in.  What the editor knows beyond plain
//  values -- e.g. parser `Match`es -- comes in through `ConsoleInspectorContext`, see `<ConsoleViewer>`.
//

import classnames from "classnames"
import global from "global"
import React from "react"

import { view, Observable } from "$/util"
import type { ConsoleLine as ConsoleLineData, SpellConsoleGroup } from "$/core/console"

import "./ConsoleLines.css"

/** Left padding, in px, for a non-group console line (group lines get 0 -- their toggle icon fills the space). */
const NORMAL_LINE_SPACE = 20
/** Extra left padding, in px, per nesting `indent` level. */
const INDENT_WIDTH = 12
/** Horizontal offset, in px, of the vertical `.ConsoleGroupSpan` guide line relative to its indent. */
const SPAN_OFFSET = -4

/**
 * What the console knows beyond plain values, for `<ConsoleObject>` / `<ConsoleValue>` below.
 * - Default knows nothing extra.  `<ConsoleViewer>` provides the editor's, which knows parser `Match`es.
 */
export const ConsoleInspectorContext = React.createContext<ConsoleInspector>({})

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
 * - NOTE: styles assume it's inside a `.ConsoleViewer`, e.g. `<div className="ConsoleViewer scrolling">`.
 ****************/
export function ConsoleLines({ indent = 0, lines, collapsed = false, className = "ConsoleLines" }: ConsoleLinesProps) {
  return (
    <div className={className}>
      {!collapsed &&
        lines.map((line, index) => {
          if (line.level === "group")
            return <ConsoleGroup key={index} line={line as SpellConsoleGroup} indent={indent} />
          return <ConsoleLine key={index} line={line} indent={indent} />
        })}
      {!collapsed && <div className="ConsoleGroupSpan" style={{ left: SPAN_OFFSET + indent * INDENT_WIDTH }} />}
    </div>
  )
}

/** Props for `<ConsoleLines>`. */
export type ConsoleLinesProps = {
  /** Nesting depth, used for left padding and to compute the child `indent` for a `group`. */
  indent?: number
  /** Lines to render, in order -- a mix of plain lines and `group` lines. */
  lines: (ConsoleLineData | SpellConsoleGroup)[]
  /** When `true`, render nothing (used for a collapsed `group`'s children). */
  collapsed?: boolean
  /** Wrapper className. */
  className?: string
}

/****************
 * ### `<ConsoleLine>`
 * Single console line for anything that is NOT a `group`.
 ****************/
export function ConsoleLine({ line, icon, indent }: ConsoleLineProps) {
  const { message, level } = line
  const left = indent * INDENT_WIDTH + (level !== "group" ? NORMAL_LINE_SPACE : 0)
  return (
    <div className={classnames(level, "ConsoleLine")} style={{ paddingLeft: left }}>
      {icon}
      {/* {indent}{" "} */}
      {message.map((thing, index) => (
        <ConsoleObject key={index} thing={thing} />
      ))}
    </div>
  )
}

/** Props for `<ConsoleLine>`. */
export type ConsoleLineProps = {
  /** Line data -- for a `group` line this is passed by `<ConsoleGroup>`, `icon` included. */
  line: ConsoleLineData | SpellConsoleGroup
  /** Group-toggle disclosure triangle, passed in by `<ConsoleGroup>`; absent for a plain line. */
  icon?: ReactNode
  /** Nesting depth, for left padding. */
  indent: number
}

/****************
 * ### `<ConsoleGroup>`
 * Console `group` line: a toggleable disclosure triangle plus its (possibly collapsed) child `lines`.
 * - SIDE EFFECT: `toggle` mutates `line.collapsed` directly (the console line objects are observable).
 ****************/
export const ConsoleGroup = view(function ConsoleGroup({ line, indent }: ConsoleGroupProps) {
  const { lines, collapsed } = line
  // console.info("group", line, lines, collapsed)
  const toggle = () => (line.collapsed = !line.collapsed)
  const icon = (
    <span className="ConsoleGroupIcon" style={{ width: NORMAL_LINE_SPACE }}>
      <span style={{ cursor: "pointer" }} onClick={toggle}>
        {collapsed ? "▶" : "▼"}
      </span>
    </span>
  )
  return (
    <>
      <ConsoleLine line={line} icon={icon} indent={indent} />
      <ConsoleLines lines={lines} collapsed={collapsed} indent={indent + 1} />
    </>
  )
})

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
export function ConsoleValue({ type, display, observable }: ConsoleValueProps) {
  const inspector = React.useContext(ConsoleInspectorContext)
  const onClick = observable ? () => onObservableClick(observable) : () => {}
  return (
    <span className={`ConsoleValue ${type}${observable ? " observable" : ""}`} onClick={onClick}>
      {display}
    </span>
  )

  /**
   * Click handler for an observable value shown in the console.
   * - SIDE EFFECT: stashes `thing` on `global.it` and logs it, so it can be poked at in devtools.
   */
  // TODO: ObjectInspector popup or modal
  function onObservableClick(thing: unknown): void {
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
  display: ReactNode
  /** Underlying value, if clicking should inspect it via `onObservableClick`. */
  observable?: unknown
}

/****************
 * ### `<ConsoleObject>`
 * Renders one logged `thing` as a `<ConsoleValue>`, picking a `type` label and `display` string
 * appropriate to its runtime type (primitive, function, `Date`, `Array`, or generic object).
 * - `ConsoleInspector.describe()` gets first say on any other object, e.g. a parser `Match`.
 ****************/
export function ConsoleObject({ thing }: ConsoleObjectProps) {
  const inspector = React.useContext(ConsoleInspectorContext)
  if (thing === null) return <ConsoleValue type="null" display="null" />
  switch (typeof thing) {
    case "undefined":
    case "string":
    case "number":
    case "boolean":
      return <ConsoleValue type={typeof thing} display={thing} />
    case "function":
      return <ConsoleValue type="function" display="ƒ {...}" observable={thing} />
    default: {
      const obj = thing as object
      const type = (obj as { constructor?: { name?: string } })?.constructor?.name || "object???"
      let display: string
      // TODO: `List`, `match`
      if (obj instanceof Date) display = `Date (${obj})`
      else if (Array.isArray(obj)) display = `Array(${obj.length})`
      else {
        const described = inspector.describe?.(obj)
        if (described !== undefined) display = described
        else {
          try {
            const tagged = obj as Record<PropertyKey, unknown>
            // exotic objects sometimes have `Symbol.toStringTag` property as their name
            if (Symbol.toStringTag in obj) display = `${tagged[Symbol.toStringTag]} {...}`
            // If it has a custom toString, use that
            // NOTE: guarded -- only interpolate when the object has its OWN `toString`,
            // so this can never produce '[object Object]'.
            // oxlint-disable-next-line typescript/no-base-to-string
            else if (tagged.toString && tagged.toString !== Object.prototype.toString) display = `${obj}`
            // `Object {...}` or `Object {}` for empty object
            else display = `${type} {${Object.keys(obj).length || obj instanceof Observable ? "..." : ""}}`
          } catch (e) {
            display = "Unknown Thinger???"
          }
        }
      }

      return <ConsoleValue observable={obj} type={type} display={display} />
    }
  }
}

/** Props for `<ConsoleObject>`. */
export type ConsoleObjectProps = {
  /** Logged value to render -- any type is accepted since `console.log` accepts anything. */
  thing: unknown
}
