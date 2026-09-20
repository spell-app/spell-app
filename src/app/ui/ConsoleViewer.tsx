import classnames from "classnames"
import global from "global"

import { view, Observable } from "~/util"
import { P } from "~/parser"
import { spellCore } from "~/spellCore"
import type { ConsoleLine as ConsoleLineData, SpellConsoleGroup } from "~/spellCore/console"
import { SP } from "~/languages/spell"

import { store } from "~/app/store"

import { UI } from "~/app/ui"
import { Actions } from "./Actions"
import { ErrorHandler, type ErrorHandlerWrapperProps } from "./ErrorHandler"

import "./ConsoleViewer.less"

/****************
 * ### `<ConsoleRoot>`
 * Root element to show the `<ConsoleViewer/>` in `SpellEditor`.
 ****************/
export const ConsoleRoot = view(function ConsoleRoot({ showToolbar = true, scrolling = true }: ConsoleRootProps) {
  return (
    <div className="ConsoleRoot">
      {!!showToolbar && <ConsoleToolbar />}
      <ConsoleViewer scrolling={scrolling} />
    </div>
  )
})

/** Props for `<ConsoleRoot>`. */
export type ConsoleRootProps = {
  /** Show `<ConsoleToolbar>` above viewer. */
  showToolbar?: boolean
  /** Pass through to `<ConsoleViewer>`. */
  scrolling?: boolean
}

/****************
 * ### `<ConsoleToolbar>`
 * Toolbar above `<ConsoleViewer>`: header plus alert/confirm/prompt/choose demo actions and `clearConsole`.
 ****************/
export function ConsoleToolbar() {
  return (
    <UI.PanelMenu>
      <UI.Submenu left spring>
        <UI.MenuHeader content="Program Output" />
      </UI.Submenu>
      <UI.Submenu right spring>
        <Actions.alert title="" header="Header" message="Yo!" />
        <Actions.confirm title="" message="Yah?" ok="Yep" cancel="Nope" />
        <Actions.prompt title="" message="What is your name?" defaultValue="Bob" />
        <Actions.promptForNumber
          title=""
          header="Quantity needed:"
          message="How many did you want?"
          inputProps={{ min: 10, max: 100, step: 1, placeholder: "Between 10 and 100" }}
          callback={(value: unknown) => console.log(value, typeof value)}
        />
        <Actions.choose title="" header="Pick one" message="Message" options={["A", "B", "C"]} />
        <Actions.choose
          title=""
          header="Pick many"
          message="Message"
          options={{ a: "Option A", b: "Option B", c: "Option C" }}
          multiple
          defaultValue={["a", "b"]}
        />
        <Actions.clearConsole />
        <UI.MoreMenu stub />
      </UI.Submenu>
    </UI.PanelMenu>
  )
}

/****************
 * ### `<ConsoleViewer>`
 * Top-level error-handling wrapper around `spellCore.console`'s rendered lines.
 ****************/
export class ConsoleViewer extends ErrorHandler<ConsoleViewerProps> {
  /**
   * NOTE: doesn't actually clear `state.error` on any prop change -- just returns `oldState`
   * unchanged (or `{}` on the first call).  Unlike `MatchViewer`/`ASTViewer`'s versions of this
   * method, `ConsoleViewerProps` has no data prop to key off of, so there's nothing to compare.
   * TODO: is this needed at all, or can we drop it along with `ErrorHandlerState`'s reset behavior?
   */
  static getDerivedStateFromProps(_props: unknown, oldState: unknown) {
    return oldState || {}
  }

  /** Show error in UI when caught. */
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
   * Top-level viewer for the console: reads `spellCore.console.lines` (reactively, via `view()`)
   * and hands them to `<ConsoleLines>`.
   * NOTE: was previously worded as if for a `spellFile.match` producing `<ConsoleView>`/`<TokenView>`
   * elements -- stale, copy-pasted from `MatchViewer`'s equivalent field.  Corrected here.
   */
  Component = view(() => {
    const lines = spellCore.console.lines
    return <ConsoleLines lines={lines} indent={0} />
  })
}

/** Props for `<ConsoleViewer>`. */
export type ConsoleViewerProps = {
  /** Add scrolling className to wrapper. */
  scrolling?: boolean
  /** Called with caught render error, e.g. to surface it in a toast. */
  showError?: (error: unknown) => void
}
/** Left padding, in px, for a non-group console line (group lines get 0 -- their toggle icon fills the space). */
const NORMAL_LINE_SPACE = 20
/** Extra left padding, in px, per nesting `indent` level. */
const INDENT_WIDTH = 12
/** Horizontal offset, in px, of the vertical `.ConsoleGroupSpan` guide line relative to its indent. */
const SPAN_OFFSET = -4

/****************
 * ### `<ConsoleLines>`
 * Renders a list of console `lines` -- `group` lines recurse via `<ConsoleGroup>`, others via `<ConsoleLine>`.
 * Also draws the `.ConsoleGroupSpan` vertical guide line for this indent level.
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
 * - Clicking an `observable` value inspects it via `onObservableClick`.
 ****************/
export function ConsoleValue({ type, display, observable }: ConsoleValueProps) {
  const onClick = observable ? () => onObservableClick(observable) : () => {}
  return (
    <span className={`ConsoleValue ${type}${observable ? " observable" : ""}`} onClick={onClick}>
      {display}
    </span>
  )
}

/**
 * Click handler for an observable value shown in the console.
 * - SIDE EFFECT: stashes `thing` on `global.it` and logs it, so it can be poked at in devtools.
 * - Selects the matching source text when `thing` is a `P.Match`.
 */
// TODO: ObjectInspector popup or modal
function onObservableClick(thing: unknown): void {
  if (!thing) return
  // Always log to the browser console for debugging
  global.it = thing
  console.log(`it =`, thing)

  // If we got a match, try to select the text in the editor
  if (thing instanceof P.Match) void store.showMatch(thing)
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
 * appropriate to its runtime type (primitive, function, `Date`, `Array`, `P.Match`, or generic object).
 ****************/
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
      else if (obj instanceof P.Match) {
        // Special display for ParseError matches
        if (obj.rule instanceof SP.ParseError) display = "ParseError"
        else display = "Match {...}"
      } else {
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

      return <ConsoleValue observable={obj} type={type} display={display} />
    }
  }
}

/** Props for `<ConsoleObject>`. */
export type ConsoleObjectProps = {
  /** Logged value to render -- any type is accepted since `console.log` accepts anything. */
  thing: unknown
}
