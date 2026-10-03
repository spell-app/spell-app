import { Show } from "solid-js"

import { P } from "$/parser"
import { SP } from "$/spell"
import { editor, runtimeConsole } from "$/app/editor"
import { Actions, ErrorBoundary, MenuHeader, MoreMenu, PanelMenu, Submenu, tracked } from "$/app/solid"
import { ConsoleInspectorContext, ConsoleLines, type ConsoleInspector } from "./ConsoleLines"

import "./ConsoleViewer.css"

/****************
 * ### `<ConsoleRoot>`
 * Root element to show the `<ConsoleViewer/>` in `SpellEditor`.
 ****************/
export function ConsoleRoot(props: ConsoleRootProps) {
  return (
    <div class="ConsoleRoot">
      <Show when={props.showToolbar ?? true}>
        <ConsoleToolbar />
      </Show>
      <ConsoleViewer scrolling={props.scrolling ?? true} />
    </div>
  )
}

/** Props for `<ConsoleRoot>`. */
export type ConsoleRootProps = {
  /** Show `<ConsoleToolbar>` above viewer.  Default:  `true`. */
  showToolbar?: boolean
  /** Pass through to `<ConsoleViewer>`.  Default:  `true`. */
  scrolling?: boolean
}

/****************
 * ### `<ConsoleToolbar>`
 * Toolbar above `<ConsoleViewer>`:  header plus alert/confirm/prompt/choose demo actions and `clearConsole`.
 ****************/
export function ConsoleToolbar() {
  return (
    <PanelMenu>
      <Submenu left spring>
        <MenuHeader>Program Output</MenuHeader>
      </Submenu>
      <Submenu right spring>
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
        <MoreMenu stub />
      </Submenu>
    </PanelMenu>
  )
}

/****************
 * ### `<ConsoleViewer>`
 * `runtimeConsole()`'s lines, in a scrolling box -- the console of the runtime programs run on, which shows once
 * it's loaded.
 * - Lines are spell cells:  read through `tracked()`.  Logging REPLACES the console's `lines` array with one more
 *   line, and `<ConsoleLines>` keys rows by line, so only the new line's row is drawn.
 * - An error drawing the lines shows in place of them (`<ErrorBoundary>`), and goes to `showError`.
 ****************/
export function ConsoleViewer(props: ConsoleViewerProps) {
  const lines = tracked(() => runtimeConsole()?.lines ?? [])
  return (
    <div class={["ConsoleViewer", { scrolling: !!props.scrolling }]}>
      <div class="stretcher">
        <ErrorBoundary onError={(error) => props.showError?.(error)}>
          <ConsoleInspectorContext value={EDITOR_INSPECTOR}>
            <ConsoleLines lines={lines()} indent={0} />
          </ConsoleInspectorContext>
        </ErrorBoundary>
      </div>
    </div>
  )
}

/** Props for `<ConsoleViewer>`. */
export type ConsoleViewerProps = {
  /** Add `scrolling` class to wrapper. */
  scrolling?: boolean
  /** Called with caught render error, e.g. to surface it in a toast. */
  showError?: (error: unknown) => void
}

/**
 * What the editor's console knows beyond plain values:  parser `Match`es.
 * - Shows a `Match` as `Match {...}`, or `ParseError` for one that didn't parse.
 * - Clicking a `Match` selects its source text in the editor.
 */
export const EDITOR_INSPECTOR: ConsoleInspector = {
  describe(thing) {
    if (!(thing instanceof P.Match)) return undefined
    return thing.rule instanceof SP.ParseError ? "ParseError" : "Match {...}"
  },
  inspect(thing) {
    if (thing instanceof P.Match) void editor.showMatch(thing)
  }
}
