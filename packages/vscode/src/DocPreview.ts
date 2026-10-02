/**
 * Shows an `.html` doc (`packages/docs`) rendered, in VS Code's Simple Browser beside the editor.
 * - Opened by URI:  `vscode://spell-app.spell-language/doc-preview?file=<absolute path>` -- what
 *   `packages/docs/scripts/pages.js` `openInVSCode()` opens (`yarn plan-doc open`, `yarn plan-doc phase`).
 * - Or `?url=<http://127.0.0.1:port/...>`:  a page some local server already serves, shown as is -- the goals
 *   server's live pages (`goals/_tools/launch.js` `openInVSCode()`, `/goals-open-vs`).  Loopback URLs only;  with
 *   a `file` too, the file is the fallback when the URL isn't loopback.
 * - Simple Browser loads only http(s), so the doc's git root (the repo, or the worktree it's in) is served from a
 *   local server on `127.0.0.1`, one per root, for as long as the extension runs.  Served from the ROOT, not the
 *   doc's folder:  docs link to source files all over the repo.
 * - Or by `WindowBridge`'s `show-doc`:  a session asks ITS window (not the focused one) to show the doc.
 * - Simple Browser keeps ONE tab:  each open loads the doc there afresh (a `?t=` stamp), as a reload.
 */
import { existsSync, readFile, stat } from "fs"
import { createServer, type Server } from "http"
import type { AddressInfo } from "net"
import { dirname, extname, resolve, sep } from "path"
import * as vscode from "vscode"

/** The URI handler's path:  `vscode://spell-app.spell-language/doc-preview?file=...`. */
const PATH = "/doc-preview"

/** Content types by extension;  anything else is served as plain text. */
const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".woff2": "font/woff2"
}

/****************
 * ### `DocPreview`
 * The URI handler, and the local servers it starts.
 ****************/
export class DocPreview {
  /** Port of each git root's server, once listening. */
  static readonly ports = new Map<string, Promise<number>>()
  /** Every server started, so `register()`'s disposable can close them. */
  static readonly servers: Server[] = []

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
      { dispose: () => DocPreview.servers.forEach((server) => server.close()) }
    )
  }

  /** Show `file` in Simple Browser, beside the editor, serving its git root first if need be. */
  static async show(file: string): Promise<void> {
    if (!existsSync(file)) {
      void vscode.window.showErrorMessage(`Spell doc preview:  no file '${file}'.`)
      return
    }
    const root = gitRoot(file)
    let port = DocPreview.ports.get(root)
    if (!port) {
      port = serve(root, DocPreview.servers)
      DocPreview.ports.set(root, port)
    }
    const path = file.slice(root.length).split(sep).map(encodeURIComponent).join("/")
    await DocPreview.showUrl(`http://127.0.0.1:${await port}${path}`)
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

/**
 * Serve `root`'s files on `127.0.0.1`, on a free port;  resolves to the port.
 * - files only, never outside `root`;  never cached, so a reload shows what's on disk
 */
function serve(root: string, servers: Server[]): Promise<number> {
  const server = createServer((request, response) => {
    const send = (status: number, body: string) => {
      response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" })
      response.end(body)
    }
    let path: string
    try {
      path = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname)
    } catch {
      return send(400, "bad path")
    }
    const target = resolve(root, `.${path}`)
    if (target !== root && !target.startsWith(root + sep)) return send(403, "outside the served folder")
    stat(target, (statError, stats) => {
      if (statError || !stats.isFile()) return send(404, `no file ${path}`)
      readFile(target, (readError, body) => {
        if (readError) return send(500, String(readError))
        response.writeHead(200, {
          "Content-Type": TYPES[extname(target).toLowerCase()] ?? "text/plain; charset=utf-8",
          "Cache-Control": "no-store"
        })
        response.end(body)
      })
    })
  })
  servers.push(server)
  return new Promise((done, fail) => {
    server.once("error", fail)
    server.listen(0, "127.0.0.1", () => done((server.address() as AddressInfo).port))
  })
}
