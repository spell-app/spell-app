/* eslint-disable react/prop-types */
import React from "react"
import classnames from "classnames"

import { view, Observable } from "~/util"
import { Match } from "~/parser"
import { spellCore } from "~/languages/spell"

import { actions } from "./actions"
import { UI } from "./ui"
import { ErrorHandler } from "./ErrorHandler"
import "./ConsoleViewer.less"

/**
 *  Root element to show the `<ConsoleViewer/>` in `SpellEditor`
 */

export const ConsoleRoot = React.memo(function ConsoleRoot({ showToolbar = true, scrolling = true }) {
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
          callback={(value) => console.log(value, typeof value)}
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

export class ConsoleViewer extends ErrorHandler {
  /** Clear `state.error` if ...??? */
  static getDerivedStateFromProps(props, oldState) {
    return oldState || {}
  }

  /* Show error in UI when caught. */
  componentDidCatch(error, errorInfo) {
    this.props.showError(error)
  }

  /**
   * Wrapper class to manage scrolling.
   * This is automatically drawn by `ErrorHandler`,
   * and will be passed `Component` for the root `Console`.
   */
  Wrapper = ({ component, props }) => {
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

NORMAL_LINE_SPACE = 20
const INDENT_WIDTH = 12
const SPAN_OFFSET = -4
export function ConsoleLines({ indent = 0, lines, collapsed = false, className = "ConsoleLines" }) {
  return (
    <div className={className}>
      {!collapsed &&
        lines.map((line, index) => {
          if (line.level === "group") return <ConsoleGroup key={index} line={line} indent={indent} />
          return <ConsoleLine key={index} line={line} indent={indent} />
        })}
      {!collapsed && <div className="ConsoleGroupSpan" style={{ left: SPAN_OFFSET + indent * INDENT_WIDTH }} />}
    </div>
  )
}

/** Single console line for anything that is NOT a `group`. */
export function ConsoleLine({ line, icon, indent }) {
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

/** Console `group`. */
export const ConsoleGroup = view(function ConsoleGroup({ line, indent }) {
  const { lines, collapsed } = line
  // console.info("group", line, lines, collapsed)
  const toggle = () => (line.collapsed = !line.collapsed)
  const icon = (
    <span className="ConsoleGroupIcon" style={{ width: NORMAL_LINE_SPACE }}>
      <UI.Icon name={collapsed ? UI.ARROW_COLLAPSED_ICON : UI.ARROW_EXPANDED_ICON} onClick={toggle} />
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
export function onObservableClick(thing) {
  if (!thing) return
  // Always log to the browser console for debugging
  global.it = thing
  console.log(`it =`, thing)

  // If we got a match, try to select the text in the editor
  if (thing instanceof Match) store.showMatch(thing)
}

export function ConsoleValue({ type, display, observable }) {
  const onClick = observable ? onObservableClick.bind(null, observable) : Function.prototype
  return (
    <span className={`ConsoleValue ${type}${observable ? " observable" : ""}`} onClick={onClick}>
      {display}
    </span>
  )
}

export function ConsoleObject({ thing }) {
  if (thing === null) return <ConsoleValue type="null" display="null" />
  let type = typeof thing
  // TODO: these aren't spell names for types...
  switch (type) {
    case "undefined":
    case "string":
    case "number":
    case "boolean":
      return <ConsoleValue type={type} display={thing} />
    case "function":
      return <ConsoleValue type={type} display="ƒ {...}" observable={thing} />
    default:
      type = thing?.constructor?.name || "object???"
      let display
      // TODO: `List`, `match`
      if (thing instanceof Date) display = `Date (${thing})`
      else if (Array.isArray(thing)) display = `Array(${thing.length})`
      else if (thing instanceof Match) {
        // Special display for ParseError matches
        if (thing.rule instanceof SpellParser.Rule.ParseError) display = "ParseError"
        else display = "Match {...}"
      } else {
        try {
          // exotic objects sometimes have `Symbol.toStringTag` property as their name
          if (Symbol.toStringTag in thing) display = `${thing[Symbol.toStringTag]} {...}`
          // If it has a custom toString, use that
          else if (thing.toString && thing.toString !== Object.prototype.toString) display = `${thing}`
          // `Object {...}` or `Object {}` for empty object
          else display = `${type} {${Object.keys(thing).length || thing instanceof Observable ? "..." : ""}}`
        } catch (e) {
          display = "Unknown Thinger???"
        }
      }

      return <ConsoleValue observable={thing} type={type} display={display} />
  }
}
