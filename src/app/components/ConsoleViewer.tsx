import React from "react"
import classnames from "classnames"
import global from "global"

import { view, Observable } from "~/util"
import { Match } from "~/parser"
import { spellCore } from "~/spellCore"
import type { ConsoleLine, SpellConsoleGroup } from "~/spellCore/console"
import { ParseError } from "~/languages/spell"

import { actions } from "~/app/actions"
import { UI } from "./ui"
import { ErrorHandler } from "./ErrorHandler"
import type { ErrorHandlerWrapperProps } from "./ErrorHandler"
import { store } from "~/app/store"
import "./ConsoleViewer.less"

export type ConsoleRootProps = {
  showToolbar?: boolean
  scrolling?: boolean
}

/**
 *  Root element to show the `<ConsoleViewer/>` in `SpellEditor`
 */

export const ConsoleRoot = view(function ConsoleRoot({ showToolbar = true, scrolling = true }: ConsoleRootProps) {
  return (
    <div className="ConsoleRoot">
      {!!showToolbar && <ConsoleToolbar />}
      <ConsoleViewer scrolling={scrolling} />
    </div>
  )
})

export function ConsoleToolbar() {
  return (
    <UI.PanelMenu>
      <UI.Submenu left spring>
        <UI.MenuHeader content="Program Output" />
      </UI.Submenu>
      <UI.Submenu right spring>
        <actions.alert title="" header="Header" message="Yo!" />
        <actions.confirm title="" message="Yah?" ok="Yep" cancel="Nope" />
        <actions.prompt title="" message="What is your name?" defaultValue="Bob" />
        <actions.promptForNumber
          title=""
          header="Quantity needed:"
          message="How many did you want?"
          inputProps={{ min: 10, max: 100, step: 1, placeholder: "Between 10 and 100" }}
          callback={(value: unknown) => console.log(value, typeof value)}
        />
        <actions.choose title="" header="Pick one" message="Message" options={["A", "B", "C"]} />
        <actions.choose
          title=""
          header="Pick many"
          message="Message"
          options={{ a: "Option A", b: "Option B", c: "Option C" }}
          multiple
          defaultValue={["a", "b"]}
        />
        <actions.clearConsole />
        <UI.MoreMenu stub />
      </UI.Submenu>
    </UI.PanelMenu>
  )
}

export type ConsoleViewerProps = {
  scrolling?: boolean
  showError?: (error: unknown) => void
}

export class ConsoleViewer extends ErrorHandler<ConsoleViewerProps> {
  /** Clear `state.error` if ...??? */
  static getDerivedStateFromProps(_props: unknown, oldState: unknown) {
    return oldState || {}
  }

  /* Show error in UI when caught. */
  componentDidCatch(error: Error) {
    this.props.showError?.(error)
  }

  /**
   * Wrapper class to manage scrolling.
   * This is automatically drawn by `ErrorHandler`,
   * and will be passed `Component` for the root `Console`.
   */
  Wrapper = ({ component, props }: ErrorHandlerWrapperProps<ConsoleViewerProps>) => {
    const classNames = ["ConsoleViewer"]
    if (props.scrolling) classNames.push("scrolling")
    return (
      <div className={classNames.join(" ")}>
        <div className="stretcher">{component}</div>
      </div>
    )
  }

  /**
   * Memoized top-level viewer for a Console, e.g. for a `spellFile.match`.
   * Create one of these and it will create <ConsoleView>s and <TokenView>s underneath it.
   */
  Component = view(() => {
    const lines = spellCore.console.lines
    return <ConsoleLines lines={lines} indent={0} />
  })
}

const NORMAL_LINE_SPACE = 20
const INDENT_WIDTH = 12
const SPAN_OFFSET = -4

export type ConsoleLinesProps = {
  indent?: number
  lines: (ConsoleLine | SpellConsoleGroup)[]
  collapsed?: boolean
  className?: string
}
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

export type ConsoleLineProps = {
  line: ConsoleLine | SpellConsoleGroup
  icon?: React.ReactNode
  indent: number
}

/** Single console line for anything that is NOT a `group`. */
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

export type ConsoleGroupProps = {
  line: SpellConsoleGroup
  indent: number
}

/** Console `group`. */
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

// TODO: ObjectInspector popup or modal
export function onObservableClick(thing: unknown): void {
  if (!thing) return
  // Always log to the browser console for debugging
  global.it = thing
  console.log(`it =`, thing)

  // If we got a match, try to select the text in the editor
  if (thing instanceof Match) store.showMatch(thing)
}

export type ConsoleValueProps = {
  type: string
  display: React.ReactNode
  observable?: unknown
}
export function ConsoleValue({ type, display, observable }: ConsoleValueProps) {
  const onClick = observable ? () => onObservableClick(observable) : () => {}
  return (
    <span className={`ConsoleValue ${type}${observable ? " observable" : ""}`} onClick={onClick}>
      {display}
    </span>
  )
}

export type ConsoleObjectProps = { thing: unknown }
export function ConsoleObject({ thing }: ConsoleObjectProps) {
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
      else if (obj instanceof Match) {
        // Special display for ParseError matches
        if (obj.rule instanceof ParseError) display = "ParseError"
        else display = "Match {...}"
      } else {
        try {
          const tagged = obj as Record<PropertyKey, unknown>
          // exotic objects sometimes have `Symbol.toStringTag` property as their name
          if (Symbol.toStringTag in obj) display = `${tagged[Symbol.toStringTag]} {...}`
          // If it has a custom toString, use that
          else if (tagged.toString && tagged.toString !== Object.prototype.toString) display = `${obj}`
          // `Object {...}` or `Object {}` for empty object
          else display = `${type} {${Object.keys(obj).length || obj instanceof Observable ? "..." : ""}}`
        } catch (e) {
          display = "Unknown Thinger???"
        }
      }

      return <ConsoleValue observable={obj} type={type} display={display} />
    }
  }
}
