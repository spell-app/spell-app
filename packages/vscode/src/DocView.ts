/**
 * The "Spell Docs" view:  a docs page, live from its page server, docked in the RIGHT side bar (VS Code's
 * secondary side bar), beside the editor AND the Claude tab, instead of taking an editor column.
 * - Where `DocPreview` shows pages by default (`spell.docPreview.location`:  `sidebar`):  `/spell-docs`,
 *   `yarn plan-doc open`, `/goals-open-vs`.
 * - A webview holding ONE iframe of the page's loopback URL, as Simple Browser does.  The page's own live reload
 *   runs inside it.
 * - Opened by hand, before anything was shown:  the docs index of the window's first folder (the repo root).
 * - Title-bar buttons:  back, forward, reload, restart the page server, open in the browser.  Home:  the page's own
 *   site header (its logo, or "Docs");  VS Code has no clickable view titles.  `spell.docView.home` stays a palette
 *   command.
 * - Links in the page:  docs pages open here;  other files on the page server in the editor;  other sites in the
 *   browser (`open()`, and the page's `followInFrame()`).  Why:  the sandbox blocks the tabs docs links ask for.
 * - The iframe is cross-origin, so the view can't read or move its history:  the page's live client
 *   (`packages/server/src/liveClient.ts`) posts its place (`{ spell: "place", url, canGoBack, canGoForward }`) and
 *   steps when asked (`{ spell: "history", go }`);  this view's own script relays both ways.  A page from no page
 *   server never reports:  back / forward stay off, reload and "open in browser" use the page last SHOWN.
 * - NOTE:  the FIRST show in a window opens the side bar with focus on the view:  VS Code has no way to open a view
 *   without focusing it.  Later shows keep focus where it is.
 */
import { spawn } from "child_process"
import { randomBytes } from "crypto"
import { existsSync } from "fs"
import { join } from "path"
import * as vscode from "vscode"

/** The page's iframe's sandbox:  Simple Browser's.  Scripts need the webview's `enableScripts` too. */
const SANDBOX = "allow-scripts allow-forms allow-same-origin allow-downloads"

/****************
 * ### `DocView`
 * The view's provider, and the page it shows.
 ****************/
export class DocView implements vscode.WebviewViewProvider {
  /** The view's id, as in `package.json` `contributes.views`. */
  static readonly ID = "spell.docView"

  /** The resolved view;  `undefined` until VS Code first shows it, and again once it's disposed. */
  static view: vscode.WebviewView | undefined

  /** URL of the page last shown, or asked for before the view resolved. */
  static url: string | undefined

  /** URL of the page now in view, as its live client last reported;  `undefined` until it does. */
  static current: string | undefined

  /** The docs index's URL, for the "docs index" button and the empty view;  set by `DocPreview`. */
  static home: (() => Promise<string | undefined>) | undefined

  /** Register the view and its title-bar commands -- call once, from `DocPreview.register()`. */
  static register(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(DocView.ID, new DocView(), {
        webviewOptions: { retainContextWhenHidden: true }
      }),
      vscode.commands.registerCommand("spell.docView.back", () => DocView.go(-1)),
      vscode.commands.registerCommand("spell.docView.forward", () => DocView.go(1)),
      vscode.commands.registerCommand("spell.docView.home", () => DocView.goHome()),
      vscode.commands.registerCommand("spell.docView.reload", () => DocView.here && DocView.show(DocView.here)),
      vscode.commands.registerCommand("spell.docView.restartServer", () => DocView.restartServer()),
      vscode.commands.registerCommand(
        "spell.docView.openExternal",
        () => DocView.here && vscode.env.openExternal(vscode.Uri.parse(DocView.here))
      )
    )
  }

  /** The page in view:  as last reported, else as last shown. */
  static get here(): string | undefined {
    return DocView.current ?? DocView.url
  }

  /** Step the page's history back (`-1`) or forward (`1`), through its live client. */
  static go(step: -1 | 1): void {
    void DocView.view?.webview.postMessage({ spell: "history", go: step })
  }

  /**
   * A link the page couldn't follow in the frame (see `followInFrame()` in `liveClient.ts`):
   * - `external`:  in the browser
   * - `file`:  a file on the page server, opened in the editor;  a folder, revealed in the Explorer.  Which checkout:
   *   the server's `/_server/ping` (`root`);  a worktree's file on the main server is `/worktrees/<w>/...`
   */
  static async open({ url, kind }: OpenLink): Promise<void> {
    if (!url) return
    const target = new URL(url)
    if (kind !== "file") return void vscode.env.openExternal(vscode.Uri.parse(url))
    const root = await serverRoot(target.origin)
    if (!root) return void vscode.env.openExternal(vscode.Uri.parse(url))
    const parts = target.pathname.split("/").filter(Boolean).map(decodeURIComponent)
    const inside = parts[0] === "worktrees" ? [".claude", ...parts] : parts
    const file = vscode.Uri.file(join(root, ...inside))
    const stat = await vscode.workspace.fs.stat(file).then(
      (each) => each,
      () => undefined
    )
    if (!stat) return void vscode.window.showWarningMessage(`Spell Docs:  no file ${file.fsPath}`)
    if (stat.type & vscode.FileType.Directory) return void vscode.commands.executeCommand("revealInExplorer", file)
    await vscode.window.showTextDocument(file, { preview: true })
  }

  /**
   * Restart the page server behind the page in view, then show the same page from it again.
   * - which checkout:  the server's own `/_server/ping` says (`root`)
   * - runs `yarn server stop`, then `yarn server ensure`, in a LOGIN shell (`$SHELL -lc`):  a GUI VS Code's own `PATH`
   *   may have no `node` / `yarn`
   * - its port may change (a worktree's server takes any free one):  the page comes back on the new `base`
   */
  static async restartServer(): Promise<void> {
    const here = DocView.here
    if (!here) return
    const page = new URL(here)
    const root = await serverRoot(page.origin)
    if (!root) {
      void vscode.window.showWarningMessage(`Spell Docs:  ${page.origin} isn't a page server, so there's nothing to restart.`)
      return
    }
    const output = await vscode.window.withProgress(
      { location: { viewId: DocView.ID }, title: "Restarting the page server" },
      () => run(process.env.SHELL || "/bin/zsh", ["-lc", "yarn server stop; yarn server ensure"], root)
    )
    const base = output.match(/"base":\s*"([^"]+)"/)?.[1]
    if (!base) {
      void vscode.window.showErrorMessage(`Spell Docs:  the page server in ${root} didn't come back:  ${output.slice(-300)}`)
      return
    }
    await DocView.show(`${base}${page.pathname}${page.hash}`)
  }

  /**
   * Show `url` (a loopback page;  `DocPreview` stamps it with `?t=`, so each show reloads) in the view.
   * - not resolved yet:  opens it, and `resolveWebviewView()` renders `url`
   */
  static async show(url: string): Promise<void> {
    DocView.url = url
    DocView.current = undefined
    if (!DocView.view) return void (await vscode.commands.executeCommand(`${DocView.ID}.focus`))
    DocView.render()
    DocView.view.show(true)
  }

  /** Show the docs index. */
  static async goHome(): Promise<void> {
    const url = await DocView.home?.()
    if (url) await DocView.show(url)
  }

  /** (Re)write the view's html for `DocView.url`:  a new `html` reloads the iframe. */
  static render(): void {
    const view = DocView.view
    if (view) view.webview.html = DocView.html(DocView.url)
  }

  /**
   * The view's html:  the page in a full-size iframe, or a line saying there's nothing to show.
   * - its script relays messages:  the page's `place` reports to the extension, the extension's `history` steps to
   *   the page
   */
  static html(url: string | undefined): string {
    const nonce = randomBytes(16).toString("base64")
    const csp = `default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'; frame-src http://127.0.0.1:* http://localhost:*`
    const body = url
      ? `<iframe src="${escapeAttribute(url)}" sandbox="${SANDBOX}" allow="clipboard-read; clipboard-write"></iframe>`
      : `<p>No docs page yet:  <code>yarn docs:open --vs</code>, or <code>/spell-docs</code>.</p>`
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="${csp}" />
    <style>
      html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
      iframe { display: block; border: 0; width: 100%; height: 100%; background: white; }
      p { padding: 0 1em; }
    </style>
  </head>
  <body>${body}
    <script nonce="${nonce}">
      const vscode = acquireVsCodeApi()
      const frame = document.querySelector("iframe")
      addEventListener("message", (event) => {
        if (frame && event.source === frame.contentWindow) return vscode.postMessage(event.data)
        if (frame && event.data?.spell === "history") frame.contentWindow.postMessage(event.data, "*")
      })
    </script>
  </body>
</html>`
  }

  /**
   * VS Code shows the view:  render the page asked for, else the docs index.
   * - MUST `enableScripts`:  without it the webview's frame is sandboxed WITHOUT `allow-scripts`, and the page's
   *   iframe inherits that, so no `ui-*` element ever defines itself
   */
  async resolveWebviewView(view: vscode.WebviewView): Promise<void> {
    DocView.view = view
    view.webview.options = { enableScripts: true }
    view.onDidDispose(() => {
      if (DocView.view === view) DocView.view = undefined
    })
    view.webview.onDidReceiveMessage((message: Place | OpenLink) => {
      if (message?.spell === "open") return void DocView.open(message)
      if (message?.spell !== "place") return
      DocView.current = message.url
      void vscode.commands.executeCommand("setContext", "spell.docView.canGoBack", !!message.canGoBack)
      void vscode.commands.executeCommand("setContext", "spell.docView.canGoForward", !!message.canGoForward)
    })
    DocView.url ??= await DocView.home?.()
    DocView.render()
  }
}

/** The docs index of the window's first folder (the repo root), `undefined` when it has none. */
export function docsIndex(): string | undefined {
  const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
  const file = root && join(root, "packages", "docs", "index.html")
  return file && existsSync(file) ? file : undefined
}

/** The checkout the page server at `origin` serves (its `/_server/ping`'s `root`);  `undefined`:  not a page server. */
async function serverRoot(origin: string): Promise<string | undefined> {
  const info = await fetch(`${origin}/_server/ping`, { signal: AbortSignal.timeout(2000) })
    .then((answer) => (answer.ok ? (answer.json() as Promise<{ root?: string }>) : undefined))
    .catch(() => undefined)
  return info?.root
}

/**
 * Run `command` with `args` in `cwd`;  resolves to its stdout and stderr together, whatever its exit code.
 * - never rejects:  a failure's output is what the caller shows
 */
function run(command: string, args: string[], cwd: string): Promise<string> {
  return new Promise((done) => {
    const child = spawn(command, args, { cwd, stdio: ["ignore", "pipe", "pipe"] })
    let output = ""
    child.stdout.on("data", (chunk: Buffer) => (output += chunk.toString()))
    child.stderr.on("data", (chunk: Buffer) => (output += chunk.toString()))
    child.on("error", (error) => done(`${output}${error.message}`))
    child.on("close", () => done(output))
  })
}

/**
 * What a page's live client posts:  where it is now, and whether back / forward lead anywhere.
 * - `spell`:  `"place"`;  `"open"` is an `OpenLink`, anything else ignored
 */
type Place = { spell: "place"; url?: string; canGoBack?: boolean; canGoForward?: boolean }

/**
 * A link the page asks the view to open:  `{ spell: "open", url, kind }`.
 * - `kind`:  `"file"` (on the page server:  the editor) or `"external"` (the browser)
 */
type OpenLink = { spell: "open"; url?: string; kind?: "file" | "external" }

/** `text` safe inside a double-quoted html attribute. */
function escapeAttribute(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")
}
