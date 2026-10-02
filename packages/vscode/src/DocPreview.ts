/**
 * Shows an `.html` doc (`packages/docs`, goals, plans) rendered, in VS Code's Simple Browser beside the editor.
 * - Opened by URI:  `vscode://spell-app.spell-language/doc-preview?file=<absolute path>` -- what
 *   `packages/docs/scripts/pages.js` `openInVSCode()` opens (`yarn plan-doc open`, `yarn plan-doc phase`).
 * - Or `?url=<http://127.0.0.1:port/...>`:  a page some local server already serves, shown as is -- the page
 *   server's live pages (`/goals-open-vs`).  Loopback URLs only;  with a `file` too, the file is the fallback when
 *   the URL isn't loopback.
 * - Simple Browser loads only http(s).  For a `file`, the doc's checkout (git root:  the repo, or the worktree it's
 *   in) is served by:
 *   - its PAGE SERVER (`yarn server`), when one runs:  found by its pid file, `<root>/.spell-server.json`.  Live
 *     reload, page edits, goals' buttons, `/ui/`.
 *   - else a server of our own, in-process, on `127.0.0.1`, one per root, for as long as the extension runs:  the
 *     same `$/server` `WebServer`, with live reload, but no route modules (no goals buttons, no `/ui/`).
 *   NEVER starts the page server itself:  a GUI VS Code may have no `node` / `yarn` on its PATH.  The scripts that
 *   open docs start it first (`pages.js` `ensurePageServer()`).
 * - Served from the ROOT, not the doc's folder:  docs link to source files all over the repo.
 * - Or by `WindowBridge`'s `show-doc`:  a session asks ITS window (not the focused one) to show the doc.
 * - Simple Browser keeps ONE tab:  each open loads the doc there afresh (a `?t=` stamp), as a reload.
 */
import { existsSync } from "fs"
import { dirname, join, resolve, sep } from "path"
import * as vscode from "vscode"

import { SRV } from "$/server"

/** The URI handler's path:  `vscode://spell-app.spell-language/doc-preview?file=...`. */
const PATH = "/doc-preview"

/****************
 * ### `DocPreview`
 * The URI handler, and the local servers it starts.
 ****************/
export class DocPreview {
  /** Our own server for each git root without a page server, once listening. */
  static readonly servers = new Map<string, Promise<SRV.WebServer>>()

  /**
   * Set up the URI handler -- call once, first thing in `activate()`, so it works even when the language server
   * can't start.
   * - SIDE EFFECT:  servers close when the extension deactivates.
   */
  static register(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
      vscode.window.registerUriHandler({
        handleUri: (uri) => {
          if (uri.path !== PATH) return
          const query = new URLSearchParams(uri.query)
          const url = query.get("url")
          if (url && isLoopback(url)) return void DocPreview.showUrl(url)
          const file = query.get("file")
          if (file) void DocPreview.show(resolve(file))
        }
      }),
      { dispose: () => DocPreview.servers.forEach((server) => void server.then((each) => each.close())) }
    )
  }

  /** Show `file` in Simple Browser, beside the editor:  from its page server, else from one of our own. */
  static async show(file: string): Promise<void> {
    if (!existsSync(file)) {
      void vscode.window.showErrorMessage(`Spell doc preview:  no file '${file}'.`)
      return
    }
    const root = gitRoot(file)
    const path = file.slice(root.length).split(sep).map(encodeURIComponent).join("/")
    const running = await new SRV.PidFile(root).status()
    const base = running?.base ?? (await DocPreview.serverFor(root)).url
    await DocPreview.showUrl(`${base}${path}`)
  }

  /**
   * Our own server for `root`, started once:  static files with live reload, on a free port.
   * - watches `packages/docs` and `goals` if there, else the whole root
   */
  static serverFor(root: string): Promise<SRV.WebServer> {
    let server = DocPreview.servers.get(root)
    if (!server) {
      server = start(root)
      DocPreview.servers.set(root, server)
    }
    return server
  }

  /** Show `url` in Simple Browser, beside the editor, afresh:  a `?t=` stamp makes each open a reload. */
  static async showUrl(url: string): Promise<void> {
    const fresh = new URL(url)
    fresh.searchParams.set("t", String(Date.now()))
    await vscode.commands.executeCommand("simpleBrowser.api.open", vscode.Uri.parse(fresh.href), {
      viewColumn: vscode.ViewColumn.Beside,
      preserveFocus: true
    })
  }
}

/** Whether `url` is plain http on this machine (`127.0.0.1` / `localhost`):  never open anything else. */
function isLoopback(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === "http:" && ["127.0.0.1", "localhost"].includes(parsed.hostname)
  } catch {
    return false
  }
}

/** The folder holding `.git` (a folder, or a worktree's file) above `file`;  its own folder if there's none. */
function gitRoot(file: string): string {
  for (let folder = dirname(file); ; folder = dirname(folder)) {
    if (existsSync(resolve(folder, ".git"))) return folder
    if (dirname(folder) === folder) return dirname(file)
  }
}

/** Start serving `root`:  see `DocPreview.serverFor()`. */
async function start(root: string): Promise<SRV.WebServer> {
  const server = new SRV.WebServer({ root, live: true, mounts: [{ prefix: "/", dir: root }] })
  const watched = ["packages/docs", "goals"].map((dir) => join(root, dir)).filter((dir) => existsSync(dir))
  for (const dir of watched.length ? watched : [root]) server.live!.watch(dir)
  await server.listen()
  return server
}
