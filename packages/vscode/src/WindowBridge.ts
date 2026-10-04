/**
 * Lets a Claude Code session (or any script it runs) talk to ITS OWN VS Code window:  add or remove a folder
 * (a worktree), show a doc in a side bar doc view, close the session's tab;  or to a worktree's window
 * (`yarn window open`):  open the session there, close the window.  The client is the repo root's
 * `scripts/window.mjs` (`yarn window`).
 * - Why not a `vscode://` URI:  macOS hands it to whichever window is FOCUSED, often not the session's.
 * - How a session finds its window:  by PID.  A session's process tree is `claude` -> `Code Helper (Plugin)` (the
 *   window's EXTENSION HOST, one per window) -> `Code`, and this code runs in that extension host.  So
 *   `process.pid` here is an ancestor of every command the window's sessions run:  `scripts/window.mjs` walks up
 *   its parent pids until one has a registry file.
 * - Registry file:  `~/.spell/windows/<process.pid>.json` (`SPELL_WINDOWS_DIR` overrides the folder, for tests)
 *   ~== `{ pid, port, token, workspaceFile, folders }`;  folder 700, file 600, since `token` is the password.
 *   - rewritten when the window's folders change;  deleted on dispose
 *   - files of dead pids (a crashed window) are deleted when any window starts
 * - Server:  http on `127.0.0.1`, a free port.  `POST /<op>`, JSON body, `Authorization: Bearer <token>`;
 *   answers `{ ok: true, ... }`, or `{ ok: false, error }` with a 4xx / 5xx status.  Ops:
 *   - `add-folder { path, name? }`:  add `path` as the window's last folder;  already there:  ok, no-op
 *   - `remove-folder { path }`:  remove it;  never folder 0 (the repo root);  not there:  ok, no-op
 *   - `show-doc { file, hash?, view? }`:  `DocPreview.show(file, hash, view)`;  `hash` an id on the page to land
 *     on;  `view` the side bar tab:  `"docs"` ("Spell Docs", the default) or `"review"` ("Review")
 *   - `close-window {}`:  close this window, just after answering (`/isolate done` closes the worktree's window)
 *   - `open-session { sessionId, prompt? }`:  open Claude Code session `sessionId` in an editor tab (never the
 *     sidebar), `prompt` typed into its input (not sent:  Owen presses enter);  `/isolate` hands its session to
 *     the worktree's window this way
 *   - `close-session-tab { titles }`:  close the ONE Claude Code tab labelled with the first of `titles` that
 *     exactly one tab shows;  none (or only several-tab matches):  ok, `closed: false`, `matches` per title.
 *     Closing the tab ends that tab's `claude` process.  (`{ title }`, one title, still works.)
 * - NEVER adds a folder unless the window was opened from a SAVED workspace file (`workspaces/<pkg>.code-workspace`):
 *   in a one-folder or untitled window, the change re-opens the window as a new workspace, which restarts every
 *   extension -- including the Claude panel whose session asked.  `remove-folder` has no such rule:  it only ever
 *   takes away a folder `add-folder` put there.
 * - NOTE:  a saved workspace's folders live in its file:  adding and removing a folder rewrites
 *   `<pkg>.code-workspace` on disk (VS Code does it, not us).
 */
import { randomBytes, timingSafeEqual } from "crypto"
import { chmodSync, existsSync, mkdirSync, readdirSync, renameSync, statSync, unlinkSync, writeFileSync } from "fs"
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "http"
import type { AddressInfo } from "net"
import { homedir } from "os"
import { join, resolve } from "path"
import * as vscode from "vscode"

import { DocPreview } from "./DocPreview"

/** Largest request body accepted, in bytes:  ops carry a path or two. */
const MAX_BODY = 64 * 1024

/** A Claude Code session id:  a uuid. */
const SESSION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** The Claude Code extension's editor tabs' webview type;  VS Code prefixes it (`mainThreadWebview-...`). */
const CLAUDE_PANEL = "claudeVSCodePanel"

/** Longest Claude tab label before it's cut, `…` included (extension 2.1.287). */
const TAB_TITLE_LENGTH = 25

/****************
 * ### `WindowBridge`
 * This window's registry file, and the server behind it.
 ****************/
export class WindowBridge {
  /** The server, once `register()` has started it. */
  static server: Server | undefined
  /** Its port, once listening. */
  static port = 0
  /** Random hex every request must carry:  other users' and browsers' requests can't read the registry file. */
  static readonly token = randomBytes(24).toString("hex")

  /** The registry folder:  `$SPELL_WINDOWS_DIR`, else `~/.spell/windows`. */
  static get dir(): string {
    return process.env.SPELL_WINDOWS_DIR || join(homedir(), ".spell", "windows")
  }

  /** This window's registry file. */
  static get file(): string {
    return join(WindowBridge.dir, `${process.pid}.json`)
  }

  /**
   * Start the server and write the registry file -- call once from `activate()`.
   * - SIDE EFFECT:  deletes dead windows' registry files;  ours goes when the extension deactivates.
   * - Never throws:  a window without a bridge still works, its sessions just can't reach it.
   */
  static register(context: vscode.ExtensionContext): void {
    try {
      WindowBridge.sweep()
    } catch (error) {
      console.error("spell window bridge:  sweeping stale registry files failed", error)
    }
    const server = createServer((request, response) => void WindowBridge.handle(request, response))
    WindowBridge.server = server
    server.on("error", (error) => console.error("spell window bridge:", error))
    server.listen(0, "127.0.0.1", () => {
      WindowBridge.port = (server.address() as AddressInfo).port
      WindowBridge.write()
    })
    context.subscriptions.push(
      vscode.workspace.onDidChangeWorkspaceFolders(() => WindowBridge.write()),
      { dispose: () => WindowBridge.dispose() }
    )
  }

  /** Close the server and delete our registry file. */
  static dispose(): void {
    WindowBridge.server?.close()
    WindowBridge.server = undefined
    try {
      unlinkSync(WindowBridge.file)
    } catch {
      // already gone
    }
  }

  /**
   * (Re)write our registry file, atomically (a temp file renamed over it), mode 600.
   * - Not before the server listens:  the file's `port` must answer.
   */
  static write(): void {
    if (!WindowBridge.port) return
    try {
      const dir = WindowBridge.dir
      mkdirSync(dir, { recursive: true, mode: 0o700 })
      chmodSync(dir, 0o700)
      const workspaceFile = vscode.workspace.workspaceFile
      const entry: WindowEntry = {
        pid: process.pid,
        port: WindowBridge.port,
        token: WindowBridge.token,
        workspaceFile: workspaceFile?.scheme === "file" ? workspaceFile.fsPath : null,
        folders: (vscode.workspace.workspaceFolders ?? []).map((folder) => folder.uri.fsPath)
      }
      const temp = `${WindowBridge.file}.tmp`
      writeFileSync(temp, `${JSON.stringify(entry, null, 2)}\n`, { mode: 0o600 })
      renameSync(temp, WindowBridge.file)
    } catch (error) {
      console.error("spell window bridge:  writing the registry file failed", error)
    }
  }

  /** Delete the registry files of windows whose pid is dead. */
  static sweep(): void {
    const dir = WindowBridge.dir
    if (!existsSync(dir)) return
    for (const name of readdirSync(dir)) {
      const match = name.match(/^(\d+)\.json(\.tmp)?$/)
      if (!match || isAlive(Number(match[1]))) continue
      const path = join(dir, name)
      if (statSync(path).isFile()) unlinkSync(path)
    }
  }

  ////////////////
  // ## Requests
  ////////////////

  /** Answer one request:  check it, run its op, reply JSON. */
  static async handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    try {
      if (request.method !== "POST") throw new BridgeError(405, "POST only")
      if (!WindowBridge.authorized(request.headers.authorization)) throw new BridgeError(401, "bad or missing token")
      const op = (request.url ?? "/").replace(/^\//, "").replace(/\?.*$/, "")
      const body = await readBody(request)
      const result = await WindowBridge.run(op, body)
      reply(response, 200, { ok: true, ...result })
    } catch (error) {
      if (error instanceof BridgeError) return reply(response, error.status, { ok: false, error: error.message })
      reply(response, 500, { ok: false, error: String((error as Error)?.message ?? error) })
    }
  }

  /** Whether `header` is `Bearer <our token>` (compared in constant time). */
  static authorized(header: string | undefined): boolean {
    const given = Buffer.from(header ?? "")
    const expected = Buffer.from(`Bearer ${WindowBridge.token}`)
    return given.length === expected.length && timingSafeEqual(given, expected)
  }

  /** Run `op` with `body`;  returns what goes in the reply beside `ok`. */
  static async run(op: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
    switch (op) {
      case "add-folder":
        return WindowBridge.addFolder(path(body, "path"), typeof body.name === "string" ? body.name : undefined)
      case "remove-folder":
        return WindowBridge.removeFolder(path(body, "path"))
      case "show-doc": {
        const file = path(body, "file")
        if (!existsSync(file) || !statSync(file).isFile()) throw new BridgeError(404, `no file '${file}'`)
        const view = body.view ?? "docs"
        if (view !== "docs" && view !== "review") throw new BridgeError(400, `bad view '${String(view)}'`)
        await DocPreview.show(file, typeof body.hash === "string" ? body.hash : undefined, view)
        return { file, view }
      }
      case "close-window":
        // after the reply is on its way:  closing ends this extension host, and the server with it
        setTimeout(() => void vscode.commands.executeCommand("workbench.action.closeWindow"), 200)
        return { closing: true }
      case "open-session": {
        const sessionId = typeof body.sessionId === "string" ? body.sessionId : ""
        if (!SESSION_ID.test(sessionId)) throw new BridgeError(400, `bad session id '${sessionId}'`)
        // 2nd argument:  the extension's `initialPrompt` (2.1.287), typed in, not sent
        const prompt = typeof body.prompt === "string" && body.prompt ? body.prompt : undefined
        await vscode.commands.executeCommand("claude-vscode.primaryEditor.open", sessionId, prompt)
        return { sessionId }
      }
      case "close-session-tab": {
        const titles = Array.isArray(body.titles) ? body.titles : [body.title]
        return WindowBridge.closeSessionTab(titles.filter((title): title is string => typeof title === "string"))
      }
      default:
        throw new BridgeError(404, `unknown op '${op}'`)
    }
  }

  /**
   * `add-folder`:  add `folder` after the window's last folder.
   * - refused unless the window has a SAVED workspace file:  see the header
   * - SIDE EFFECT:  VS Code writes the folder into that workspace file
   */
  static addFolder(folder: string, name?: string): Record<string, unknown> {
    if (WindowBridge.indexOf(folder) >= 0) return { added: false, path: folder }
    if (vscode.workspace.workspaceFile?.scheme !== "file") {
      throw new BridgeError(
        409,
        "this window isn't a saved workspace:  adding a folder would restart its extensions (and the Claude panel)." +
          "  Open it from workspaces/<pkg>.code-workspace."
      )
    }
    if (!existsSync(folder) || !statSync(folder).isDirectory()) throw new BridgeError(404, `no folder '${folder}'`)
    const count = vscode.workspace.workspaceFolders?.length ?? 0
    const uri = vscode.Uri.file(folder)
    if (!vscode.workspace.updateWorkspaceFolders(count, 0, name ? { uri, name } : { uri })) {
      throw new BridgeError(500, `VS Code refused to add '${folder}'`)
    }
    return { added: true, path: folder }
  }

  /**
   * `remove-folder`:  remove `folder` from the window.
   * - NEVER folder 0:  the window's repo root
   * - SIDE EFFECT:  VS Code writes the change into the workspace file
   */
  static removeFolder(folder: string): Record<string, unknown> {
    const index = WindowBridge.indexOf(folder)
    if (index < 0) return { removed: false, path: folder }
    if (index === 0) throw new BridgeError(400, `'${folder}' is the window's first folder:  never removed`)
    if (!vscode.workspace.updateWorkspaceFolders(index, 1)) {
      throw new BridgeError(500, `VS Code refused to remove '${folder}'`)
    }
    return { removed: true, path: folder }
  }

  /**
   * `close-session-tab`:  close the Claude Code tab labelled with the first of `titles` exactly one tab shows.
   * - HACK:  a Claude tab says nothing of its session but its label, the session's title cut to
   *   `TAB_TITLE_LENGTH` characters with a trailing `…`
   * - several titles:  the label may be the session's `/rename` title or Claude's own, whichever the tab caught
   * - a title several tabs show (sessions opened from one worktree's window share it):  never guessed between
   */
  static async closeSessionTab(titles: string[]): Promise<Record<string, unknown>> {
    titles = titles.map((title) => title.trim()).filter(Boolean)
    if (!titles.length) throw new BridgeError(400, "no title")
    const claudeTabs = vscode.window.tabGroups.all
      .flatMap((group) => group.tabs)
      .filter((tab) => tab.input instanceof vscode.TabInputWebview && tab.input.viewType.endsWith(CLAUDE_PANEL))
    const matches: Record<string, number> = {}
    for (const title of titles) {
      const tabs = claudeTabs.filter((tab) => tabShows(tab.label, title))
      matches[title] = tabs.length
      if (tabs.length !== 1) continue
      await vscode.window.tabGroups.close(tabs[0])
      return { closed: true, title }
    }
    return { closed: false, matches }
  }

  /** Index of `folder` among the window's folders, or -1. */
  static indexOf(folder: string): number {
    return (vscode.workspace.workspaceFolders ?? []).findIndex((each) => resolve(each.uri.fsPath) === folder)
  }
}

/** A window's registry file, `~/.spell/windows/<pid>.json`:  what `scripts/window.mjs` reads. */
export type WindowEntry = {
  /** The window's extension host:  an ancestor of every process its sessions run. */
  pid: number
  /** The bridge's port, on `127.0.0.1`. */
  port: number
  /** `Authorization: Bearer <token>` on every request. */
  token: string
  /** The saved `.code-workspace` the window was opened from;  `null` for a folder or untitled window. */
  workspaceFile: string | null
  /** The window's folders, in order:  folder 0 is the repo root in a package window. */
  folders: string[]
}

/** An op's failure, with its http status. */
class BridgeError extends Error {
  /** http status to reply with. */
  declare status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** Whether a process `pid` exists:  signal 0 checks without signalling;  EPERM means it exists, someone else's. */
function isAlive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "EPERM"
  }
}

/** The body's `key`, a non-empty string, as an absolute path;  else a 400. */
function path(body: Record<string, unknown>, key: string): string {
  const value = body[key]
  if (typeof value !== "string" || !value) throw new BridgeError(400, `missing '${key}'`)
  return resolve(value)
}

/** The request's JSON body (`{}` when empty);  a 400 when it isn't a JSON object, a 413 when too big. */
function readBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((done, fail) => {
    const chunks: Buffer[] = []
    let size = 0
    request.on("data", (chunk: Buffer) => {
      size += chunk.length
      if (size > MAX_BODY) {
        fail(new BridgeError(413, "body too big"))
        request.destroy()
      } else chunks.push(chunk)
    })
    request.on("error", fail)
    request.on("end", () => {
      const text = Buffer.concat(chunks).toString("utf8").trim()
      if (!text) return done({})
      try {
        const body = JSON.parse(text)
        if (body && typeof body === "object" && !Array.isArray(body)) return done(body)
      } catch {
        // fall through
      }
      fail(new BridgeError(400, "body isn't a JSON object"))
    })
  })
}

/** Send `body` as JSON with `status`. */
function reply(response: ServerResponse, status: number, body: Record<string, unknown>): void {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" })
  response.end(JSON.stringify(body))
}

/**
 * Whether a Claude tab labelled `label` shows session title `title`.
 * - the label is the title, or its first `TAB_TITLE_LENGTH - 1` characters plus `…`
 */
function tabShows(label: string, title: string): boolean {
  const full = title.trim()
  if (label === full) return true
  return full.length > TAB_TITLE_LENGTH && label === `${full.substring(0, TAB_TITLE_LENGTH - 1)}…`
}
