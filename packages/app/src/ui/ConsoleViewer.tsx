/** @jsxImportSource react */
import { view } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"

import { editor, runtimeConsole } from "$/app/editor"

import { UI } from "$/app/ui"
import { Actions } from "./Actions"
import { ConsoleInspectorContext, ConsoleLines, type ConsoleInspector } from "./ConsoleLines"
import { ErrorHandler, type ErrorHandlerWrapperProps } from "./ErrorHandler"

import "./ConsoleViewer.css"

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
 * Top-level error-handling wrapper around `runtimeConsole()`'s rendered lines -- the console of the runtime programs
 * run on, which shows once it's loaded.
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
   * Top-level viewer for the console: reads `runtimeConsole().lines` (reactively, via `view()`)
   * and hands them to `<ConsoleLines>`.
   * NOTE: was previously worded as if for a `spellFile.match` producing `<ConsoleView>`/`<TokenView>`
   * elements -- stale, copy-pasted from `MatchViewer`'s equivalent field.  Corrected here.
   */
  Component = view(() => {
    const lines = runtimeConsole()?.lines ?? []
    return (
      <ConsoleInspectorContext.Provider value={EDITOR_INSPECTOR}>
        <ConsoleLines lines={lines} indent={0} />
      </ConsoleInspectorContext.Provider>
    )
  })
}

/** Props for `<ConsoleViewer>`. */
export type ConsoleViewerProps = {
  /** Add scrolling className to wrapper. */
  scrolling?: boolean
  /** Called with caught render error, e.g. to surface it in a toast. */
  showError?: (error: unknown) => void
}

/**
 * What the editor's console knows beyond plain values:  parser `Match`es.
 * - Shows a `Match` as `Match {...}`, or `ParseError` for one that didn't parse.
 * - Clicking a `Match` selects its source text in the editor.
 */
const EDITOR_INSPECTOR: ConsoleInspector = {
  describe(thing) {
    if (!(thing instanceof P.Match)) return undefined
    return thing.rule instanceof SP.ParseError ? "ParseError" : "Match {...}"
  },
  inspect(thing) {
    if (thing instanceof P.Match) void editor.showMatch(thing)
  }
}
