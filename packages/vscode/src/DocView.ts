/**
 * The doc views:  docs pages, live from their page server, docked in the RIGHT side bar (VS Code's secondary side
 * bar), beside the editor AND the Claude tab, instead of taking an editor column.  Two of them, each in its own
 * view container, so the side bar shows them as two tabs, each keeping its own page:
 * - "Spell Docs" (`spell.docView`, the spell hat):  where `DocPreview` shows pages by default
 *   (`spell.docPreview.location`:  `sidebar`):  `/spell-docs`, `spell dev plan-doc open`, `/goals-open-vs`
 * - "Review" (`spell.reviewView`, a circle-check):  the page being reviewed (`/epic review`,
 *   `spell dev docs open <page> --review`)
 * - Each is a webview holding ONE iframe of the page's loopback URL, as Simple Browser does.  The page's own live
 *   reload runs inside it.
 * - The webview's html is built ONCE, when VS Code resolves the view:  later shows NAVIGATE its iframe (a
 *   `navigate` message to the view's script), so the frame isn't rebuilt (a rebuilt frame flashes white).  The
 *   frame and body take the side bar's theme colour, so nothing white shows before a page paints.
 * - Showing the page ALREADY in view (same path, whatever its `?t=` stamp) doesn't reload it:  the page updates
 *   itself on file changes.  A `hash` asks it to scroll there instead (`{ spell: "go", hash }`).  The reload button
 *   and a server restart do reload.
 * - Opened by hand, before anything was shown:  "Spell Docs" shows the docs index of the window's first folder (the
 *   repo root);  "Review" a line saying how to fill it.
 * - Title-bar buttons:  back, forward, reload, restart the page server, open in the browser.  Home:  the page's own
 *   site header (its logo, or "Docs");  VS Code has no clickable view titles.  `spell.docView.home` stays a palette
 *   command.
 * - Links in the page:  docs pages open here;  other files on the page server in the editor;  other sites in the
 *   browser (`open()`, and the page's `followInFrame()`).  Why:  the sandbox blocks the tabs docs links ask for.
 * - The iframe is cross-origin, so the view can't read or move its history:  the page's live client
 *   (`packages/server/src/liveClient.ts`) posts its place (`{ spell: "place", url, canGoBack, canGoForward }`) and
 *   steps when asked (`{ spell: "history", go }`);  the view's own script relays both ways.  A page from no page
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

/** The page's iframe's `allow`:  the page may copy (a command line) and paste. */
const ALLOW = "clipboard-read; clipboard-write"

/** Each doc view by name:  its view id (as in `package.json` `contributes.views`), and what it says when empty. */
const VIEWS: Record<DocViewName, { id: string; empty: string }> = {
  docs: {
    id: "spell.docView",
    empty: "No docs page yet:  <code>spell dev docs open --vs</code>, or <code>/spell-docs</code>."
  },
  review: {
    id: "spell.reviewView",
    empty:
      "Nothing to review yet:  <code>/epic review &lt;name&gt;</code>, or <code>spell dev docs open &lt;page&gt; --review</code>."
  }
}

/** A checkout's own `spell` CLI, run from its root:  `restartServer()` runs it in a shell. */
const SPELL = "node packages/cli/bin/spell.mjs"

/** Each view's title-bar commands, `<view id>.<name>`:  each listed in `package.json` for both views. */
const COMMANDS = ["back", "forward", "reload", "restartServer", "openExternal"] as const

/****************
 * ### `DocView`
 * One doc view's provider, and the page it shows.
 ****************/
export class DocView implements vscode.WebviewViewProvider {
  /** Every doc view, by name:  made by `register()`. */
  static readonly all = new Map<DocViewName, DocView>()

  /** The docs index's URL, for the "Spell Docs" view's home and its empty state;  set by `DocPreview`. */
  static home: (() => Promise<string | undefined>) | undefined

  /** Which view:  `docs` or `review`. */
  declare readonly name: DocViewName

  /** The view's id, as in `package.json` `contributes.views`. */
  declare readonly id: string

  /** The resolved view;  `undefined` until VS Code first shows it, and again once it's disposed. */
  view: vscode.WebviewView | undefined

  /** URL of the page last shown, or asked for before the view resolved. */
  url: string | undefined

  /** URL of the page now in view, as its live client last reported;  `undefined` until it does. */
  current: string | undefined

  constructor(name: DocViewName) {
    this.name = name
    this.id = VIEWS[name].id
  }

  /**
   * Register both views and their title-bar commands -- call once, from `DocPreview.register()`.
   * - `retainContextWhenHidden`:  switching tabs keeps each view's page as it was, scroll and all
   */
  static register(context: vscode.ExtensionContext): void {
    for (const name of Object.keys(VIEWS) as DocViewName[]) {
      const docView = new DocView(name)
      DocView.all.set(name, docView)
      context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(docView.id, docView, {
          webviewOptions: { retainContextWhenHidden: true }
        }),
        ...COMMANDS.map((command) =>
          vscode.commands.registerCommand(`${docView.id}.${command}`, () => void docView.runCommand(command))
        )
      )
    }
    context.subscriptions.push(vscode.commands.registerCommand("spell.docView.home", () => DocView.goHome()))
  }

  /** The doc view called `name`;  `docs` for anything else. */
  static of(name: string | undefined): DocView {
    return DocView.all.get(name as DocViewName) ?? DocView.all.get("docs")!
  }

  /** Show the docs index, in the "Spell Docs" view. */
  static async goHome(): Promise<void> {
    const url = await DocView.home?.()
    if (url) await DocView.of("docs").show(url)
  }

  /** The page in view:  as last reported, else as last shown. */
  get here(): string | undefined {
    return this.current ?? this.url
  }

  /** Run title-bar command `command`. */
  async runCommand(command: (typeof COMMANDS)[number]): Promise<void> {
    const here = this.here
    switch (command) {
      case "back":
        return this.go(-1)
      case "forward":
        return this.go(1)
      case "reload":
        return void (here && (await this.show(stamped(here), { reload: true })))
      case "restartServer":
        return this.restartServer()
      case "openExternal":
        return void (here && (await vscode.env.openExternal(vscode.Uri.parse(here))))
    }
  }

  /** Step the page's history back (`-1`) or forward (`1`), through its live client. */
  go(step: -1 | 1): void {
    void this.view?.webview.postMessage({ spell: "history", go: step })
  }

  /**
   * Show `url` (a loopback page;  `DocPreview` stamps it with `?t=`) in this view, and reveal it.
   * - not resolved yet:  opens it, and `resolveWebviewView()` builds its html for `url`
   * - the page already in view (`samePage()`), and not `reload`:  left as is (the page updates itself);  `url`'s
   *   hash, if any, posted to the page to scroll to (`{ spell: "go", hash }`)
   * - else:  the view's iframe navigates to `url` (`{ spell: "navigate", url }`), never rebuilt
   */
  async show(url: string, { reload = false }: { reload?: boolean } = {}): Promise<void> {
    const here = this.here
    if (!this.view) {
      this.url = url
      this.current = undefined
      return void (await vscode.commands.executeCommand(`${this.id}.focus`))
    }
    if (!reload && here && samePage(here, url)) {
      const hash = new URL(url).hash.slice(1)
      if (hash) void this.view.webview.postMessage({ spell: "go", hash })
    } else {
      this.url = url
      this.current = undefined
      void this.view.webview.postMessage({ spell: "navigate", url })
    }
    this.view.show(true)
  }

  /**
   * Rebuild the view from scratch:  new html, so a new iframe, at the page in view (fresh `?t=` stamp);  resolves to
   * that URL, `undefined` when the view hasn't been shown yet (nothing to rebuild).
   * - for a view gone wrong in a way a reload doesn't fix (clicks no longer reaching the page, PAPERCUTS `vscode`,
   *   2026-10-06):  `spell dev window reload-view`.  The reload button only navigates the SAME iframe.
   * - NOT a fix for pages stuck on their placeholders (6 docs pages holding every connection to a host):  live reload
   *   moved to websockets for that (`packages/server/src/webSocket.ts`)
   */
  rebuild(): string | undefined {
    if (!this.view) return undefined
    const url = this.here && stamped(this.here)
    this.url = url
    this.current = undefined
    this.view.webview.html = this.html(url)
    this.view.show(true)
    return url
  }

  /**
   * Restart the page server behind the page in view, then show the same page from it again.
   * - which checkout:  the server's own `/_server/ping` says (`root`)
   * - runs `spell dev server stop`, then `spell dev server ensure`, in a LOGIN shell (`$SHELL -lc`):  a GUI VS Code's
   *   own `PATH` may have no `node`
   * - that checkout's own CLI (`node packages/cli/bin/spell.mjs`), never the `spell` on `PATH`:  another checkout's
   * - its port may change (a worktree's server takes any free one):  the page comes back on the new `base`
   */
  async restartServer(): Promise<void> {
    const here = this.here
    if (!here) return
    const page = new URL(here)
    const root = await serverRoot(page.origin)
    if (!root) {
      void vscode.window.showWarningMessage(
        `Spell Docs:  ${page.origin} isn't a page server, so there's nothing to restart.`
      )
      return
    }
    const output = await vscode.window.withProgress(
      { location: { viewId: this.id }, title: "Restarting the page server" },
      () => run(process.env.SHELL || "/bin/zsh", ["-lc", `${SPELL} dev server stop; ${SPELL} dev server ensure`], root)
    )
    const base = output.match(/"base":\s*"([^"]+)"/)?.[1]
    if (!base) {
      void vscode.window.showErrorMessage(
        `Spell Docs:  the page server in ${root} didn't come back:  ${output.slice(-300)}`
      )
      return
    }
    await this.show(stamped(`${base}${page.pathname}${page.hash}`), { reload: true })
  }

  /**
   * VS Code shows the view:  build its html, ONCE, for the page asked for;  else, in "Spell Docs", the docs index.
   * - MUST `enableScripts`:  without it the webview's frame is sandboxed WITHOUT `allow-scripts`, and the page's
   *   iframe inherits that, so no `ui-*` element ever defines itself
   * - SIDE EFFECT:  the page's `place` reports set `<view id>.canGoBack` / `.canGoForward`, which enable the back /
   *   forward buttons
   */
  async resolveWebviewView(view: vscode.WebviewView): Promise<void> {
    this.view = view
    view.webview.options = { enableScripts: true }
    view.onDidDispose(() => {
      if (this.view === view) this.view = undefined
    })
    view.webview.onDidReceiveMessage((message: Place | OpenLink) => {
      if (message?.spell === "open") return void DocView.open(message)
      if (message?.spell !== "place") return
      this.current = message.url
      void vscode.commands.executeCommand("setContext", `${this.id}.canGoBack`, !!message.canGoBack)
      void vscode.commands.executeCommand("setContext", `${this.id}.canGoForward`, !!message.canGoForward)
    })
    if (this.name === "docs") this.url ??= await DocView.home?.()
    view.webview.html = this.html(this.url)
  }

  /**
   * The view's html:  the page in a full-size iframe, or a line saying there's nothing to show.
   * - its script relays messages:  the page's `place` / `open` to the extension;  the extension's `history` and
   *   `go` to the page.  `navigate` points the iframe at a new URL, making it first if the view was empty.
   * - background:  the side bar's theme colour, on the body AND the iframe, so a page loading shows no white
   */
  html(url: string | undefined): string {
    const nonce = randomBytes(16).toString("base64")
    const csp = `default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'; frame-src http://127.0.0.1:* http://localhost:*`
    const body = url
      ? `<iframe src="${escapeAttribute(url)}" sandbox="${SANDBOX}" allow="${ALLOW}"></iframe>`
      : `<p>${VIEWS[this.name].empty}</p>`
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="${csp}" />
    <style>
      :root { --background: var(--vscode-sideBar-background, var(--vscode-editor-background)); }
      html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: var(--background); }
      iframe { display: block; border: 0; width: 100%; height: 100%; background: var(--background); }
      p { padding: 0 1em; }
    </style>
  </head>
  <body>${body}
    <script nonce="${nonce}">
      const vscode = acquireVsCodeApi()
      let frame = document.querySelector("iframe")
      addEventListener("message", (event) => {
        if (frame && event.source === frame.contentWindow) return vscode.postMessage(event.data)
        const data = event.data
        if (data?.spell === "navigate") return navigate(data.url)
        if (frame && (data?.spell === "history" || data?.spell === "go")) frame.contentWindow.postMessage(data, "*")
      })

      /** Point the frame at url:  the same frame, so the old page stays until the new one paints. */
      function navigate(url) {
        if (!frame) {
          frame = document.createElement("iframe")
          frame.setAttribute("sandbox", ${JSON.stringify(SANDBOX)})
          frame.setAttribute("allow", ${JSON.stringify(ALLOW)})
          document.querySelector("p")?.remove()
          document.body.prepend(frame)
        }
        frame.src = url
      }
    </script>
  </body>
</html>`
  }

  ////////////////
  // ## Links
  ////////////////

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
}

/** Which doc view:  the "Spell Docs" tab, or the "Review" tab. */
export type DocViewName = "docs" | "review"

/**
 * The docs home of the window's first folder (the repo root), `undefined` when it has none.
 * - `pages/index.html`;  a checkout from before the reorg (claude-design P4, 2026-10-05):  its old
 *   `pages/index.html`
 */
export function docsIndex(): string | undefined {
  const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
  if (!root) return undefined
  return [join(root, "pages", "index.html"), join(root, "packages", "docs", "content", "index.html")].find((file) =>
    existsSync(file)
  )
}

/** `url` with a fresh `?t=` stamp:  a URL no frame or browser has cached, so loading it is a reload. */
export function stamped(url: string): string {
  const fresh = new URL(url)
  fresh.searchParams.set("t", String(Date.now()))
  return fresh.href
}

/**
 * Whether URLs `a` and `b` are the same page:  same origin, path and query, ignoring the `?t=` stamp and the hash.
 * - the same page shown again isn't reloaded:  see `DocView.show()`
 */
export function samePage(a: string, b: string): boolean {
  const [first, second] = [new URL(a), new URL(b)]
  for (const url of [first, second]) {
    url.searchParams.delete("t")
    url.hash = ""
  }
  return first.href === second.href
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
