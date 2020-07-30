/* eslint-disable react/prop-types */
import React from "react"
import classnames from "classnames"
import * as SUI from "semantic-ui-react"

import { view, Observable } from "~/util"
import { spellCore } from "~/languages/spell"

import { ErrorHandler } from "./ErrorHandler"

import "./ConsoleViewer.less"

/**
 *  Root element to show the `<ConsoleViewer/>` in `SpellEditor`
 */

export const ConsoleRoot = view(function ConsoleRoot() {
  return <ConsoleViewer lines={spellCore.console.lines} />
})

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
    return <div className="ConsoleRoot">{component}</div>
  }

  /**
   * Memoized top-level viewer for a Console, e.g. for a `spellFile.match`.
   * Create one of these and it will create <ConsoleView>s and <TokenView>s underneath it.
   */
  Component({ lines }) {
    // TODO: memoize?
    return <ConsoleLines lines={lines} className="ConsoleViewer" />
  }
}

export function ConsoleLines({ lines, collapsed = false, className = "ConsoleLines" }) {
  return (
    <div className={className}>
      {!collapsed &&
        lines.map((line, index) => {
          if (line.level === "group") return <ConsoleGroup key={index} line={line} />
          return <ConsoleLine key={index} line={line} />
        })}
    </div>
  )
}

export function ConsoleValue({ type, display, observable }) {
  // if they pass an `observable`, when they click:
  //    set as` global.it`
  //    log it to browser console
  const onClick = observable
    ? () => {
        global.it = observable
        console.log(`it =`)
        console.dir(observable)
      }
    : Function.prototype
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
      return <ConsoleValue type={type} display="ƒ {...}" />
    default:
      type = thing.constructor.name || "object???"
      let display
      if (thing instanceof Date) display = `Date (${thing})`
      else if (Array.isArray(thing)) display = `Array(${thing.length})`
      else if (thing.toString !== Object.prototype.toString) display = `${thing}`
      else display = `${type} {${Object.keys(thing).length || thing instanceof Observable ? "..." : ""}}`

      return <ConsoleValue observable={thing} type={type} display={display} />
  }
}

/** Single console line for anything that is NOT a `group`. */
export function ConsoleLine({ line, icon }) {
  const { message, level } = line
  return (
    <div className={classnames(level, "ConsoleLine")}>
      {icon}
      {message.map((thing, index) => (
        <ConsoleObject key={index} thing={thing} />
      ))}
    </div>
  )
}

/** Console `group`. */
export const ConsoleGroup = view(function ConsoleGroup({ line }) {
  const { lines, collapsed } = line
  // console.info("group", line, lines, collapsed)
  const toggle = () => (line.collapsed = !line.collapsed)
  const icon = <SUI.Icon name={collapsed ? "caret right" : "caret down"} onClick={toggle} />
  return (
    <>
      <ConsoleLine line={line} icon={icon} />
      <ConsoleLines lines={lines} collapsed={collapsed} />
    </>
  )
})
