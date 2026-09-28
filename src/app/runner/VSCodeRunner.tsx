import React from "react"
import type { Root } from "react-dom/client"
import * as SUI from "semantic-ui-react"

import { view } from "~/util"
import { spellCore } from "~/spellCore"
import type { FromRunnerMessage, ToRunnerMessage } from "~/app/runner"
// Import directly, NOT through the `UI` barrel, which would pull in the whole editor.
import { AppContainer } from "~/app/ui/AppContainer"
import { ConsoleLines } from "~/app/ui/ConsoleLines"

import "./VSCodeRunner.less"

/****************
 * ### `<VSCodeRunner>`
 * Runs a spell project inside the VS Code extension's "Run Project" webview:  a toolbar, `<AppContainer>`,
 * then `spellCore.console` if shown.
 * - Runs whatever the extension sends in a `run` message, afresh each time -- see `runCompiled()`.
 * - Says `ready` once listening, so the extension knows to compile.  Messages sent before then are lost.
 ****************/
export function VSCodeRunner({ post }: VSCodeRunnerProps) {
  const [error, setError] = React.useState<string>()
  const [showConsole, setShowConsole] = React.useState(false)

  React.useEffect(() => {
    window.addEventListener("message", onMessage)
    post({ type: "ready" })
    return () => window.removeEventListener("message", onMessage)

    /** Run what a `run` message carries, showing any error it throws. */
    function onMessage({ data }: MessageEvent<ToRunnerMessage>) {
      if (data?.type === "run") void runCompiled(data.compiled).then(setError)
    }
  }, [post])

  return (
    <div className="VSCodeRunner">
      <VSCodeRunnerToolbar
        error={error}
        onRestart={() => post({ type: "restart" })}
        showConsole={showConsole}
        onToggleConsole={() => setShowConsole(!showConsole)}
      />
      <AppContainer scrolling padded />
      {showConsole && <VSCodeRunnerConsole />}
    </div>
  )
}

/** Props for `<VSCodeRunner>`. */
export type VSCodeRunnerProps = {
  /** Send a message to the extension -- `acquireVsCodeApi().postMessage`. */
  post: (message: FromRunnerMessage) => void
}

/****************
 * ### `<VSCodeRunnerToolbar>`
 * Restart button, the last run's error if it threw, then "Show Console" at the right.
 ****************/
function VSCodeRunnerToolbar({ error, onRestart, showConsole, onToggleConsole }: VSCodeRunnerToolbarProps) {
  return (
    <SUI.Menu attached="top" size="small" className="VSCodeRunnerToolbar">
      <SUI.Menu.Item icon="redo" content="Restart" onClick={onRestart} />
      {!!error && <SUI.Menu.Item className="error" icon="warning sign" content={error} />}
      <SUI.Menu.Menu position="right">
        <SUI.Menu.Item
          icon="terminal"
          content={showConsole ? "Hide Console" : "Show Console"}
          active={showConsole}
          onClick={onToggleConsole}
        />
      </SUI.Menu.Menu>
    </SUI.Menu>
  )
}

/** Props for `<VSCodeRunnerToolbar>`. */
type VSCodeRunnerToolbarProps = {
  /** Last run's error message, if it threw. */
  error?: string
  /** Restart button pressed. */
  onRestart: () => void
  /** Is the console showing? */
  showConsole: boolean
  /** "Show Console" / "Hide Console" pressed. */
  onToggleConsole: () => void
}

/****************
 * ### `<VSCodeRunnerConsole>`
 * `spellCore.console` below the app, e.g. what `print` statements say.
 * - `view()` so it redraws as lines are logged.
 ****************/
const VSCodeRunnerConsole = view(function VSCodeRunnerConsole() {
  return (
    <div className="VSCodeRunnerConsole ConsoleViewer scrolling">
      <div className="stretcher">
        <ConsoleLines lines={spellCore.console.lines} indent={0} />
      </div>
    </div>
  )
})

////////////////
// ## Running
////////////////

/**
 * Run `compiled` spell javascript afresh:  previous app unmounted, new `spellCore.RUNTIME`, empty console.
 * - Imports it as a module from a NEW `blob:` URL each time -- the browser caches modules by URL,
 *   so re-importing one would hand back the old module without running anything.
 * - Answers the error message if it threw, else `undefined`.
 * - Mirrors `SpellProject.executeCompiled()` + `editor.selectPath()`'s unmount, which fetch from the server instead.
 */
async function runCompiled(compiled: string): Promise<string | undefined> {
  const element = document.getElementById(spellCore.REACT_APP_ROOT_ID) as (HTMLElement & { REACT_ROOT?: Root }) | null
  element?.REACT_ROOT?.unmount()
  if (element) delete element.REACT_ROOT
  spellCore.resetRuntime()
  spellCore.console.clear()

  const url = URL.createObjectURL(new Blob([compiled], { type: "text/javascript" }))
  try {
    await import(/* @vite-ignore */ url)
    return undefined
  } catch (error) {
    // Log too, so the webview's devtools show the stack.
    console.error(error)
    return error instanceof Error ? error.message : String(error)
  } finally {
    URL.revokeObjectURL(url)
  }
}
