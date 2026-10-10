/**
 * "Run Project":  runs a spell project in a webview beside its code, re-running each time the project compiles.
 * - The webview's code is `app`'s runner bundle (`yarn build:runner` => `dist-runner/`,
 *   from `src/app/runner/`), with Semantic UI + Lato straight from its `static/`.
 * - Server compiles, NOT us:  `spell/compileProject`, answered by `spell/projectCompiled` with the javascript.
 * - Also re-runs when the project's `<Project>.compiled.js` changes on disk, e.g. compiled by the web app.
 * - Sends its words, `<Project>.en.js` beside it, after each run:  the Thing Explorer's labels.
 */
import { existsSync } from "fs"
import JSON5 from "json5"
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
 * - Remembers how the runner shows the project -- console, tab, Type Explorer -- in the project's
 *   `settings.json5`, and sends it back on `ready`.  See `readSettings()`.
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
  /** The project's `settings.json5`, beside its `project.json` -- see `readSettings()`. */
  declare settingsUri: vscode.Uri
  /** The project's words, `<Project>.en.js`, beside its compiled javascript -- see `sendWords()`. */
  declare wordsUri: vscode.Uri
  /** Its settings, as last read or saved. */
  #settings: ProjectSettings = {}
  /** Pending write of `#settings` -- see `saveSettings()`. */
  #settingsTimer: ReturnType<typeof setTimeout> | undefined
  /** Javascript we last ran -- see `run()`. */
  #lastRun: string | undefined
  /** Run the next `spell/projectCompiled` even if it's what we last ran:  Restart, or the webview is new. */
  #forceRun = false

  constructor(client: LanguageClient, repoRoot: string, info: ProjectInfo, uri: string) {
    this.client = client
    this.project = info.project
    this.uri = uri
    // the compiled file is in the project's folder too
    this.settingsUri = vscode.Uri.joinPath(vscode.Uri.parse(info.compiledUri), "..", SETTINGS_FILE)
    this.wordsUri = vscode.Uri.parse(info.compiledUri.replace(/\.compiled\.js$/, WORDS_JS))
    const runner = vscode.Uri.file(resolve(repoRoot, "packages/app/dist-runner"))
    const statics = vscode.Uri.file(resolve(repoRoot, "packages/app/static"))
    this.panel = vscode.window.createWebviewPanel(
      "spell.runner",
      `Run ${info.project.split(":").pop()}`,
      { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
      { enableScripts: true, retainContextWhenHidden: true, localResourceRoots: [runner, statics] }
    )
    this.panel.webview.html = RunnerPanel.html(this.panel.webview, runner, statics)
    this.panel.webview.onDidReceiveMessage((message: FromRunnerMessage) => {
      if (message.type === "ready") {
        void this.readSettings().then((settings) => {
          this.post({ type: "settings", settings })
          void this.compile()
        })
      } else if (message.type === "restart") void this.compile()
      else if (message.type === "saveSettings") this.saveSettings(message.settings)
      else if (message.type === "details") void this.sendDetails(message.path)
      else if (message.type === "refreshScopes") void this.sendScopes()
      else if (message.type === "open") void RunnerPanel.open(message.href)
      else if (message.type === "setDescription") void this.setDescription(message)
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
  static register(context: vscode.ExtensionContext, client: LanguageClient, repoRoot: string): void {
    context.subscriptions.push(
      vscode.commands.registerCommand("spell.runProject", () => RunnerPanel.show(client, repoRoot)),
      client.onNotification("spell/projectCompiled", ({ project, compiled }: ProjectCompiled) => {
        const panel = RunnerPanel.panels.get(project)
        panel?.run(compiled, panel.#forceRun)
      }),
      vscode.workspace.onDidSaveTextDocument((document) => RunnerPanel.saved(client, document))
    )
  }

  /** Run the active spell file's project beside it, or bring its panel forward if it's already running. */
  static async show(client: LanguageClient, repoRoot: string): Promise<void> {
    const document = vscode.window.activeTextEditor?.document
    if (document?.languageId !== "spell") return
    const spellApp = resolve(repoRoot, "packages/app")
    if (!existsSync(resolve(spellApp, "dist-runner/runner.js"))) {
      void vscode.window.showErrorMessage(`Spell:  no runner bundle.  Run \`yarn build:runner\` in '${spellApp}'.`)
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
    else new RunnerPanel(client, repoRoot, info, uri)
  }

  /**
   * Spell `document` was saved:
   * - its project's panel compiles, unless nothing else will -- `spell.compileOnSave` makes the server compile
   *   every save itself, and we hear `spell/projectCompiled` anyway
   * - every OTHER panel fetches fresh scopes:  it may be a file of a project it imports
   */
  static async saved(client: LanguageClient, document: vscode.TextDocument): Promise<void> {
    if (document.languageId !== "spell" || !RunnerPanel.panels.size) return
    const compileOnSave = vscode.workspace.getConfiguration("spell").get<boolean>("compileOnSave")
    const info = await client.sendRequest<ProjectInfo | null>("spell/project", { uri: document.uri.toString() })
    for (const panel of RunnerPanel.panels.values()) {
      if (panel.project !== info?.project) void panel.sendScopes()
      else if (!compileOnSave) void panel.compile()
    }
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
   * Run `compiled`, the project's javascript, afresh in the webview -- then send its Type Explorer the scopes.
   * - Skipped if it's what we last ran, unless `force`.
   */
  run(compiled: string, force = false): void {
    if (!force && compiled === this.#lastRun) return
    this.#lastRun = compiled
    this.post({ type: "run", compiled })
    void this.sendWords()
    void this.sendScopes()
  }

  /**
   * Send the webview the project's words, as text:  `<Project>.en.js`, which compiling wrote beside its javascript.
   * - None, e.g. compiled before words had a file:  sends none, and the Thing Explorer shows names as they are.
   */
  async sendWords(): Promise<void> {
    const words = await vscode.workspace.fs.readFile(this.wordsUri).then(
      (bytes) => new TextDecoder().decode(bytes),
      () => undefined
    )
    this.post({ type: "words", words })
  }

  /** Send the webview the project's live scope tree, from the server's `spell/scopes`, for its Type Explorer. */
  async sendScopes(): Promise<void> {
    const tree = await this.client.sendRequest<unknown>("spell/scopes", { uri: this.uri })
    if (tree) this.post({ type: "scopes", tree })
  }

  /**
   * Make `text` the docstring of what's declared on `line` of `uri` -- then send fresh scopes to show it.
   * - The server works out the edit (`spell/setDescription`);  WE apply it, so it's in the editor, undoable, unsaved.
   */
  async setDescription({ uri, line, file, text }: SetDescriptionParams): Promise<void> {
    const edit = await this.client.sendRequest<object | null>("spell/setDescription", { uri, line, file, text })
    if (!edit) {
      void vscode.window.showWarningMessage("Spell:  couldn't find that declaration to describe -- has it moved?")
      return
    }
    await vscode.workspace.applyEdit(await this.client.protocol2CodeConverter.asWorkspaceEdit(edit))
    await this.sendScopes()
  }

  /**
   * Our project's `settings.json5`, read afresh -- how it's shown in the runner, and more to come.
   * - `{}` if it's missing or won't parse:  it's a convenience, so it just starts afresh.
   */
  async readSettings(): Promise<ProjectSettings> {
    try {
      const text = new TextDecoder().decode(await vscode.workspace.fs.readFile(this.settingsUri))
      this.#settings = JSON5.parse(text) as ProjectSettings
    } catch {
      this.#settings = {}
    }
    return this.#settings
  }

  /**
   * Remember the `changed` sections of our project's settings -- each replaces that section whole.
   * - Writes `settings.json5` a moment after the last change, so a flurry of clicks writes once.
   * - NOTE: written from what we hold, so a hand edit made while the runner's open is overwritten.
   */
  saveSettings(changed: ProjectSettings): void {
    this.#settings = { ...this.#settings, ...changed }
    clearTimeout(this.#settingsTimer)
    this.#settingsTimer = setTimeout(() => void this.writeSettings(), SETTINGS_DELAY)
  }

  /** Write `settings.json5` from what we hold -- errors just show in the status bar, as it's a convenience. */
  private async writeSettings(): Promise<void> {
    const text = `${SETTINGS_HEADER}\n${JSON5.stringify(this.#settings, null, 2)}\n`
    try {
      await vscode.workspace.fs.writeFile(this.settingsUri, new TextEncoder().encode(text))
    } catch (error) {
      vscode.window.setStatusBarMessage(`Spell:  couldn't save ${SETTINGS_FILE} -- ${error}`, 5000)
    }
  }

  /** Send the webview the details of its Type Explorer's node or member `path`, from the server's `spell/scopeDetails`. */
  async sendDetails(path: string): Promise<void> {
    const details = await this.client.sendRequest<unknown>("spell/scopeDetails", { uri: this.uri, path })
    this.post({ type: "details", path, details })
  }

  /** Send `message` to the webview. */
  post(message: ToRunnerMessage): void {
    void this.panel.webview.postMessage(message)
  }

  /**
   * Open link `href` from the webview in an editor, e.g. `file:///…/Card.spell#L12` at line 12.
   * - Beside the runner:  in the column of a spell editor, if one's showing.
   */
  static async open(href: string): Promise<void> {
    const uri = vscode.Uri.parse(href)
    const line = Number(/^L(\d+)$/.exec(uri.fragment)?.[1] ?? 1) - 1
    const column = vscode.window.visibleTextEditors.find(({ document }) => document.languageId === "spell")?.viewColumn
    await vscode.window.showTextDocument(uri.with({ fragment: "" }), {
      viewColumn: column ?? vscode.ViewColumn.One,
      selection: new vscode.Range(line, 0, line, 0)
    })
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
   * - The runner draws in Solid on `@spell-app/ui`;  programs still draw with React + Semantic UI, so its CSS stays.
   * - `<ui-root icons="fomantic">` around `#runner-root`:  the runner's icon names are Fomantic's (as the web app's
   *   `index.html`).  Its packs load from `runner`'s `icon-packs/`, beside `@spell-app/ui`'s chunks.
   * - CSP allows, all from `runner` (inside `localResourceRoots`):
   *   - `blob:` scripts:  how the runner imports its copy of the spell runtime and the project's javascript
   *   - scripts:  the bundle's lazy chunks -- `@spell-app/ui`'s families and runtime, emoji data, each icon pack's
   *     `pack.js`
   *   - fetching:  the runtime's source, for its copy, and the icons' SVG files
   *   - inline styles:  `spellCore.installStyles()` adds them, and `<ui-*>` elements set inline styles (their sheets
   *     are constructable, adopted by their shadow roots)
   * - NOTE: `semantic.min.css` `@import`s Lato from Google, which the CSP blocks -- harmless, we load our own.
   */
  static html(webview: vscode.Webview, runner: vscode.Uri, statics: vscode.Uri): string {
    const source = webview.cspSource
    const csp = [
      "default-src 'none'",
      `script-src ${source} blob:`,
      // the runner fetches its own copy of the spell runtime -- see `loadRuntime()` in `app`
      `connect-src ${source}`,
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
    <ui-root icons="fomantic" display="immediately"><div id="runner-root"></div></ui-root>
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

/** End of a project's words file's name, in place of `.compiled.js`:  `SP.WORDS_JS_SUFFIX`, which we can't import. */
const WORDS_JS = ".en.js"

////////////////
// ## Protocol types
//  NOTE: restated from `app` (`runner.types.ts`), which this project can't import -- change both together.
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

/**
 * Message to the runner webview, as `ToRunnerMessage` in `src/app/runner/runner.types.ts`.
 * - `tree` is an `LSP.ScopeNode`, passed through as is.
 */
type ToRunnerMessage =
  | { type: "run"; compiled: string }
  | { type: "words"; words?: string }
  | { type: "scopes"; tree: unknown }
  | { type: "settings"; settings: ProjectSettings }
  | { type: "details"; path: string; details: unknown }

/** Message from the runner webview, as `FromRunnerMessage` in `src/app/runner/runner.types.ts`. */
type FromRunnerMessage =
  | { type: "ready" }
  | { type: "restart" }
  | { type: "open"; href: string }
  | ({ type: "setDescription" } & SetDescriptionParams)
  | { type: "saveSettings"; settings: ProjectSettings }
  | { type: "details"; path: string }
  | { type: "refreshScopes" }

/** Params of `spell/setDescription`, as `LSP.SetDescriptionParams` -- `file` for the file's own docstring. */
type SetDescriptionParams = { uri: string; line?: number; file?: boolean; text: string }

/**
 * A project's `settings.json5`, as `ProjectSettings` in `src/app/runner/runner.types.ts` -- its top-level sections,
 * which we just hold and write, NOT read.
 */
type ProjectSettings = Record<string, unknown>

/** Name of a project's settings file, beside its `project.json`.  Git-ignored, and not one of its files in the editor. */
const SETTINGS_FILE = "settings.json5"

/** First line of `settings.json5`, saying what it is. */
const SETTINGS_HEADER =
  "// How this project shows in the spell runner -- written by the spell extension.  Safe to delete."

/** How long after the last change to write `settings.json5`, in msec. */
const SETTINGS_DELAY = 500
