// ## Messages
//  between `<VSCodeRunner>` and the VS Code extension's `RunnerPanel`.
//  NOTE: the extension is its own project and can't import these, so it restates them -- change both together.

/** Message from the extension to the runner webview. */
export type ToRunnerMessage = {
  /** Run `compiled`, the project's javascript, afresh. */
  type: "run"
  compiled: string
}

/**
 * Message from the runner webview to the extension.
 * - `ready`:  listening now, so compile and send `run`
 * - `restart`:  the Restart button -- compile again and send `run`
 */
export type FromRunnerMessage = { type: "ready" } | { type: "restart" }
