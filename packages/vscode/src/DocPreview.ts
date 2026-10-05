/**
 * Shows an `.html` doc (`packages/docs`, goals, epics) rendered:  in one of the right side bar's doc views
 * (`DocView`), or in VS Code's Simple Browser beside the editor -- setting `spell.docPreview.location`.
 * - Which view:  `docs` (the "Spell Docs" tab, the default) or `review` (the "Review" tab:  `/epic review`).
 *   `review` is ALWAYS the side bar's "Review" tab:  the setting moves only `docs`.
 * - Opened by URI:  `vscode://spell-app.spell-language/doc-preview?file=<absolute path>[&view=review]` -- what
 *   `packages/docs/tools/pages.js` `openInVSCode()` opens (`spell dev plan-doc open`, `spell dev plan-doc phase`).
 * - Or `?url=<http://127.0.0.1:port/...>`:  a page some local server already serves, shown as is -- the page
 *   server's live pages (`/goals-open-vs`).  Loopback URLs only;  with a `file` too, the file is the fallback when
 *   the URL isn't loopback.
 * - Simple Browser loads only http(s).  For a `file`, the doc's checkout (git root:  the repo, or the worktree it's
 *   in) is served by:
 *   - its PAGE SERVER (`spell dev server`), when one runs:  found by its pid file, `<root>/.spell-server.json`.  Live
 *     reload, page edits, goals' buttons, `/ui/`.
 *   - else a server of our own, in-process, on `127.0.0.1`, one per root, for as long as the extension runs:  the
 *     same `$/server` `WebServer`, with live reload, but no route modules (no goals buttons, no `/ui/`).
 *   NEVER starts the page server itself:  a GUI VS Code may have no `node` / `yarn` on its PATH.  The scripts that
 *   open docs start it first (`pages.js` `ensurePageServer()`).
 * - Served from the ROOT, not the doc's folder:  docs link to source files all over the repo.
 * - Or by `WindowBridge`'s `show-doc`:  a session asks ITS window (not the focused one) to show the doc.
 * - ONE place per view (its side bar tab, or Simple Browser's one tab).  Simple Browser loads the doc afresh on
 *   each open (a `?t=` stamp);  a side bar view loads only ANOTHER page, the same one isn't reloaded
 *   (`DocView.show()`).
 */
import { existsSync } from "fs"
import { dirname, join, resolve, sep } from "path"
import * as vscode from "vscode"

import { SRV } from "$/server"

import { DocView, docsIndex, stamped, type DocViewName } from "./DocView"

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
    DocView.register(context)
    DocView.home = async () => {
      const index = docsIndex()
      return index && (await DocPreview.urlOf(index))
    }
    context.subscriptions.push(
      vscode.window.registerUriHandler({
        handleUri: (uri) => {
          if (uri.path !== PATH) return
          const query = new URLSearchParams(uri.query)
          const url = query.get("url")
          const view = query.get("view") === "review" ? "review" : "docs"
          if (url && isLoopback(url)) return void DocPreview.showUrl(url, view)
          const file = query.get("file")
          if (file) void DocPreview.show(resolve(file), undefined, view)
        }
      }),
      { dispose: () => DocPreview.servers.forEach((server) => void server.then((each) => each.close())) }
    )
  }

  /** Show `file` in doc view `view`, from its page server, else from one of our own;  at id `hash` on it, if given. */
  static async show(file: string, hash?: string, view: DocViewName = "docs"): Promise<void> {
    if (!existsSync(file)) {
      void vscode.window.showErrorMessage(`Spell doc preview:  no file '${file}'.`)
      return
    }
    const url = new URL(await DocPreview.urlOf(file))
    if (hash) url.hash = hash
    await DocPreview.showUrl(url.href, view)
  }

  /**
   * `file`'s URL on its checkout's page server, else on a server of our own (started if need be).
   * - a worktree's file:  on the MAIN checkout's page server first, when it serves worktrees
   *   (`SRV.mainServerUrl()`), so a running epic's plan doc shows on the one port every link uses
   */
  static async urlOf(file: string): Promise<string> {
    const main = await SRV.mainServerUrl(file)
    if (main) return main
    const root = gitRoot(file)
    const path = file.slice(root.length).split(sep).map(encodeURIComponent).join("/")
    const running = await new SRV.PidFile(root).status()
    const base = running?.base ?? (await DocPreview.serverFor(root)).url
    return `${base}${path}`
  }

  /**
   * Our own server for `root`, started once:  static files with live reload, on a free port.
   * - watches `DOC_FOLDERS` if there, else the whole root
   */
  static serverFor(root: string): Promise<SRV.WebServer> {
    let server = DocPreview.servers.get(root)
    if (!server) {
      server = start(root)
      DocPreview.servers.set(root, server)
    }
    return server
  }

  /**
   * Show `url`, stamped (`?t=`):  in the right side bar's doc view `view` (where the page already in view isn't
   * reloaded:  `DocView.show()`), or, for `docs`, in Simple Browser beside the editor (`spell.docPreview.location`),
   * afresh.
   */
  static async showUrl(url: string, view: DocViewName = "docs"): Promise<void> {
    const fresh = stamped(url)
    const location = vscode.workspace.getConfiguration("spell").get<string>("docPreview.location")
    if (view === "review" || location !== "beside") return DocView.of(view).show(fresh)
    await vscode.commands.executeCommand("simpleBrowser.api.open", vscode.Uri.parse(fresh), {
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
  const watched = DOC_FOLDERS.map((dir) => join(root, dir)).filter((dir) => existsSync(dir))
  for (const dir of watched.length ? watched : [root]) server.live!.watch(dir)
  await server.listen()
  return server
}

/** Folders our own server live-reloads, relative to the root:  docs pages, their bundle, goals. */
const DOC_FOLDERS = ["packages/docs/content", "packages/docs/tools/_assets", "goals"]
