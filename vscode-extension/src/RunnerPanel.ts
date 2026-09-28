/**
 * "Run Project":  runs a spell project in a webview beside its code, re-running each time the project compiles.
 * - The webview's code is the parser repo's runner bundle (`yarn build:runner` => `dist-runner/`,
 *   from `src/app/runner/`), with Semantic UI + Lato straight from its `static/`.
 * - Server compiles, NOT us:  `spell/compileProject`, answered by `spell/projectCompiled` with the javascript.
 * - Also re-runs when the project's `<Project>.compiled.js` changes on disk, e.g. compiled by the web app.
 */
import { existsSync } from "fs"
import { resolve } from "path"
import * as vscode from "vscode"
import type { LanguageClient } from "vscode-languageclient/node"

/****************
 * ### `RunnerPanel`
 * One webview per project, keyed by project id.
 * - Webview says `ready`, or Restart is pressed:  ask the server to compile.
 * - Every `spell/projectCompiled` for its project:  post `run` to the webview, with the javascript.
 * - Saving one of the project's spell files compiles too, unless `spell.compileOnSave` already does.
 * - `<Project>.compiled.js` changing on disk runs it too, unless it has parse errors -- see `compiledChanged()`.
 * - A failed compile sends nothing, so the last good app keeps running.
 * - Runs the same javascript only ONCE, unless asked to -- a compile both notifies AND rewrites the file.
 ****************/
export class RunnerPanel {
  /** Open panels, by project id. */
  static panels = new Map<string, RunnerPanel>()

  /** Client for the language server. */
  declare client: LanguageClient
  /** Webview panel we draw in. */
  declare panel: vscode.WebviewPanel
  /** Project id, as `LSP.ProjectInfo.project`. */
  declare project: string
  /** One of the project's spell files, to name the project in requests. */
  declare uri: string
  /** Javascript we last ran -- see `run()`. */
  #lastRun: string | undefined
  /** Run the next `spell/projectCompiled` even if it's what we last ran:  Restart, or the webview is new. */
  #forceRun = false

  constructor(client: LanguageClient, parserRoot: string, info: ProjectInfo, uri: string) {
    this.client = client
    this.project = info.project
    this.uri = uri
    const runner = vscode.Uri.file(resolve(parserRoot, "dist-runner"))
    const statics = vscode.Uri.file(resolve(parserRoot, "static"))
    this.panel = vscode.window.createWebviewPanel(
      "spell.runner",
      `Run ${info.project.split(":").pop()}`,
      { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
      { enableScripts: true, retainContextWhenHidden: true, localResourceRoots: [runner, statics] }
    )
    this.panel.webview.html = RunnerPanel.html(this.panel.webview, runner, statics)
    this.panel.webview.onDidReceiveMessage((message: FromRunnerMessage) => {
      if (message.type === "ready" || message.type === "restart") void this.compile()
    })
    const watcher = RunnerPanel.watch(vscode.Uri.parse(info.compiledUri))
    watcher.onDidChange((uri) => void this.compiledChanged(uri))
    watcher.onDidCreate((uri) => void this.compiledChanged(uri))
    this.panel.onDidDispose(() => {
      watcher.dispose()
      RunnerPanel.panels.delete(this.project)
    })
    RunnerPanel.panels.set(this.project, this)
  }

  /**
   * Set up "Run Project" -- call once, from `activate()`, before the client starts.
   * - SIDE EFFECT: registers the `spell.runProject` command, and listeners for compiles and saves.
   */
  static register(context: vscode.ExtensionContext, client: LanguageClient, parserRoot: string): void {
    context.subscriptions.push(
      vscode.commands.registerCommand("spell.runProject", () => RunnerPanel.show(client, parserRoot)),
      client.onNotification("spell/projectCompiled", ({ project, compiled }: ProjectCompiled) => {
        const panel = RunnerPanel.panels.get(project)
        panel?.run(compiled, panel.#forceRun)
      }),
      vscode.workspace.onDidSaveTextDocument((document) => RunnerPanel.saved(client, document))
    )
  }

  /** Run the active spell file's project beside it, or bring its panel forward if it's already running. */
  static async show(client: LanguageClient, parserRoot: string): Promise<void> {
    const document = vscode.window.activeTextEditor?.document
    if (document?.languageId !== "spell") return
    if (!existsSync(resolve(parserRoot, "dist-runner/runner.js"))) {
      void vscode.window.showErrorMessage(`Spell:  no runner bundle.  Run \`yarn build:runner\` in '${parserRoot}'.`)
      return
    }
    const uri = document.uri.toString()
    const info = await client.sendRequest<ProjectInfo | null>("spell/project", { uri })
    if (!info) {
      void vscode.window.showErrorMessage("Spell:  this file isn't in a spell project.")
      return
    }
    const open = RunnerPanel.panels.get(info.project)
    if (open) open.panel.reveal(undefined, true)
    else new RunnerPanel(client, parserRoot, info, uri)
  }

  /**
   * Spell `document` was saved:  compile its project if it's running and nothing else will.
   * - `spell.compileOnSave` makes the server compile every save itself, and we hear `spell/projectCompiled` anyway.
   */
  static async saved(client: LanguageClient, document: vscode.TextDocument): Promise<void> {
    if (document.languageId !== "spell" || !RunnerPanel.panels.size) return
    if (vscode.workspace.getConfiguration("spell").get<boolean>("compileOnSave")) return
    const info = await client.sendRequest<ProjectInfo | null>("spell/project", { uri: document.uri.toString() })
    if (info) void RunnerPanel.panels.get(info.project)?.compile()
  }

  /**
   * Ask the server to compile our project -- we re-run when its `spell/projectCompiled` comes back.
   * - Says so in the status bar if it didn't compile, as nothing re-runs then.
   */
  async compile(): Promise<void> {
    // The server notifies BEFORE it answers, so this covers exactly our own compile's notification.
    this.#forceRun = true
    try {
      const { ok } = await this.client.sendRequest<{ ok: boolean }>("spell/compileProject", { uri: this.uri })
      if (!ok) vscode.window.setStatusBarMessage("Spell:  project didn't compile -- still running the last one", 5000)
    } finally {
      this.#forceRun = false
    }
  }

  /**
   * Our `<Project>.compiled.js` at `uri` changed on disk:  run it, unless it has parse errors.
   * - Catches compiles from anywhere, e.g. the web app.  Our own compiles rewrite it too -- `run()` skips those.
   * - NOTE: spots parse errors by the `PARSE ERROR` comment they compile to -- whoever compiled it,
   *   that's all the file can tell us.
   */
  async compiledChanged(uri: vscode.Uri): Promise<void> {
    const compiled = new TextDecoder().decode(await vscode.workspace.fs.readFile(uri))
    if (compiled.includes(PARSE_ERROR_MARKER)) return
    this.run(compiled)
  }

  /**
   * Run `compiled`, the project's javascript, afresh in the webview.
   * - Skipped if it's what we last ran, unless `force`.
   */
  run(compiled: string, force = false): void {
    if (!force && compiled === this.#lastRun) return
    this.#lastRun = compiled
    const message: ToRunnerMessage = { type: "run", compiled }
    void this.panel.webview.postMessage(message)
  }

  /**
   * Watch file `uri`, even outside the workspace's folders.
   * - SIDE EFFECT: caller MUST `dispose()` it.
   */
  static watch(uri: vscode.Uri): vscode.FileSystemWatcher {
    const folder = vscode.Uri.joinPath(uri, "..")
    const name = uri.path.split("/").pop()!
    return vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(folder, name))
  }

  /**
   * Webview HTML:  Semantic UI + Lato from `statics`, then the runner bundle from `runner`.
   * - CSP allows `blob:` scripts, which is how the runner imports the project's javascript,
   *   and inline styles, which `spellCore.installStyles()` adds.
   * - NOTE: `semantic.min.css` `@import`s Lato from Google, which the CSP blocks -- harmless, we load our own.
   */
  static html(webview: vscode.Webview, runner: vscode.Uri, statics: vscode.Uri): string {
    const source = webview.cspSource
    const csp = [
      "default-src 'none'",
      `script-src ${source} blob:`,
      `style-src ${source} 'unsafe-inline'`,
      `font-src ${source} data:`,
      `img-src ${source} data: https:`
    ].join("; ")
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="${csp}" />
    <link rel="stylesheet" href="${url(statics, "semantic-ui-css/semantic.min.css")}" />
    <link rel="stylesheet" href="${url(statics, "lato/index.css")}" />
    <link rel="stylesheet" href="${url(runner, "runner.css")}" />
    <style>
      body {
        font-family: Lato, Arial, sans-serif;
        background: white;
      }
    </style>
  </head>
  <body>
    <div id="runner-root"></div>
    <script type="module" src="${url(runner, "runner.js")}"></script>
  </body>
</html>`

    /** Webview URL of file `path` under `base`. */
    function url(base: vscode.Uri, path: string): string {
      return webview.asWebviewUri(vscode.Uri.joinPath(base, path)).toString()
    }
  }
}

/** Start of what a line which doesn't parse compiles to:  a comment, `PARSE ERROR: Don't understand "foo"`. */
const PARSE_ERROR_MARKER = "/* PARSE ERROR:"

////////////////
// ## Protocol types
//  NOTE: restated from the parser repo, which this project can't import -- change both together.
////////////////

/** Answer to `spell/project`, as `LSP.ProjectInfo` -- just what we read. */
type ProjectInfo = {
  /** Project id, e.g. `@system:examples:Solitaire`. */
  project: string
  /** URI of its compiled javascript, `<Project>.compiled.js`. */
  compiledUri: string
}

/** `spell/projectCompiled` notification, as `LSP.ProjectCompiled`. */
type ProjectCompiled = {
  /** Project id, as `ProjectInfo.project`. */
  project: string
  /** Project's javascript. */
  compiled: string
}

/** Message to the runner webview, as `ToRunnerMessage` in `src/app/runner/runner.types.ts`. */
type ToRunnerMessage = { type: "run"; compiled: string }

/** Message from the runner webview, as `FromRunnerMessage` in `src/app/runner/runner.types.ts`. */
type FromRunnerMessage = { type: "ready" } | { type: "restart" }
