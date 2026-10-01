/**
 * Shows an `.html` doc (`packages/docs`) rendered, in VS Code's Simple Browser beside the editor.
 * - Opened by URI:  `vscode://spell-app.spell-language/doc-preview?file=<absolute path>` -- what
 *   `packages/docs/scripts/pages.js` `openInVSCode()` opens (`yarn plan-doc open`, `yarn plan-doc phase`).
 * - Simple Browser loads only http(s), so the doc's git root (the repo, or the worktree it's in) is served from a
 *   local server on `127.0.0.1`, one per root, for as long as the extension runs.  Served from the ROOT, not the
 *   doc's folder:  docs link to source files all over the repo.
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

  /**
   * Set up the URI handler -- call once, first thing in `activate()`, so it works even when the language server
   * can't start.
   * - SIDE EFFECT:  servers close when the extension deactivates.
   */
  static register(context: vscode.ExtensionContext): void {
    const servers: Server[] = []
    context.subscriptions.push(
      vscode.window.registerUriHandler({
        handleUri: (uri) => {
          if (uri.path !== PATH) return
          const file = new URLSearchParams(uri.query).get("file")
          if (file) void DocPreview.show(resolve(file), servers)
        }
      }),
      { dispose: () => servers.forEach((server) => server.close()) }
    )
  }

  /** Show `file` in Simple Browser, beside the editor, serving its git root first if need be. */
  static async show(file: string, servers: Server[]): Promise<void> {
    if (!existsSync(file)) {
      void vscode.window.showErrorMessage(`Spell doc preview:  no file '${file}'.`)
      return
    }
    const root = gitRoot(file)
    let port = DocPreview.ports.get(root)
    if (!port) {
      port = serve(root, servers)
      DocPreview.ports.set(root, port)
    }
    const path = file.slice(root.length).split(sep).map(encodeURIComponent).join("/")
    const url = `http://127.0.0.1:${await port}${path}?t=${Date.now()}`
    await vscode.commands.executeCommand("simpleBrowser.api.open", vscode.Uri.parse(url), {
      viewColumn: vscode.ViewColumn.Beside,
      preserveFocus: true
    })
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
