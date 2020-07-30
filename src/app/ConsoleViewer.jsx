/* eslint-disable react/prop-types */
import React from "react"
import classnames from "classnames"
import * as SUI from "semantic-ui-react"

import { view } from "~/util"
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

// export function XConsoleValue({value}) {
//   let type = value === null ? "null" : typeof value
//   if (Array.isArray(thing)) {
//     type = "array"
//     value = `Array(${value.length})`
//   } else if (type === "object") {
//     type = value.constructor.name
//     value = `{...}`
//   } else if (type === "function") {
//     value = `ƒ ${value.name || "anoymous"} {...}`
//   }
//  return <span className={`ConsoleValue ${type}`}>{value}</span>
// }

// export function ConsoleProp({prop, value}) {
//   return <span className="ConsoleProp">{prop}{": "}<ConsoleValue value={value}/></span>
// }

function ConsoleValue({ type, display }) {
  return <span className={`ConsoleValue ${type}`}>{display}</span>
}

export function ConsoleObject({ thing }) {
  if (thing === null) return <ConsoleValue type="null" display="null" />
  if (Array.isArray(thing)) return <ConsoleValue type="array" display={`Array(${thing.length})`} />
  let type = typeof thing
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
      const keys = Object.keys(thing)
      return <ConsoleValue type={type} display={`${type} {${keys.length ? "..." : ""}}`} />
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
  console.info("group", line, lines, collapsed)
  const toggle = () => (line.collapsed = !line.collapsed)
  const icon = <SUI.Icon name={collapsed ? "caret right" : "caret down"} onClick={toggle} />
  return (
    <>
      <ConsoleLine line={line} icon={icon} />
      <ConsoleLines lines={lines} collapsed={collapsed} />
    </>
  )
})
