/**
 * Starting a review from the plan doc (epic `airplane` P12):  `POST /api/review/start` (`reviewRoutes`).
 * - Owen clicks the "No Claude session is reviewing" pill, or the review line.
 * - The page server looks for the ONE running Claude session titled for the epic (`🚧 <epic>`, or the epic's name
 *   as a word in its title:  `$/server/page`'s `sessionsTitledFor()`).
 * - Found one:  it asks the VS Code window that session runs in (the spell extension's window bridge,
 *   `~/.spell/windows/<pid>.json`) to open the session's tab with `/epic review <epic>` typed into its input.
 *   The bridge can only TYPE a prompt (Claude Code's extension has no "send"):  Owen presses Enter.
 * - None, or several:  sends nothing, and says which sessions it found.
 */
import { spawnSync } from "node:child_process"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

import { RunningEpics, sessionsTitledFor, type LiveSession } from "$/server/page"

/** How long a window's bridge gets to answer, in ms. */
const BRIDGE_TIMEOUT = 5000

/**
 * What a start came to.
 * - `sent`:  typed into the one session's tab
 * - `none` / `several`:  nothing sent;  `sessions` the titles found (several:  the matching ones)
 * - `no-window`:  one session, but no window bridge for it (a terminal session, or no spell extension):
 *   type `command` there by hand
 */
export type StartResult = {
  state: "sent" | "none" | "several" | "no-window"
  command: string
  /** the matching sessions' titles */
  sessions: string[]
  /** what came of it, in words, for the page's notice */
  message: string
}

/** A window bridge's registry entry (`packages/vscode/src/WindowBridge.ts`). */
type WindowEntry = { pid: number; port: number; token: string }

export class ReviewStart {
  /** the main checkout, whose `RunningEpics` reads the sessions */
  readonly root: string

  constructor(root: string) {
    this.root = root
  }

  /** Start `/epic review <epic>` in the session titled for `epic`, or say why not. */
  async start(epic: string): Promise<StartResult> {
    const command = `/epic review ${epic}`
    const found = sessionsTitledFor(epic, this.sessions())
    const titles = found.map((session) => session.title)
    if (!found.length) {
      return {
        state: "none",
        command,
        sessions: [],
        message: `No running Claude session is titled for ${epic}:  nothing sent.  Type ${command} in its session.`
      }
    }
    if (found.length > 1) {
      return {
        state: "several",
        command,
        sessions: titles,
        message: `${found.length} sessions are titled for ${epic} (${titles.join(", ")}):  nothing sent.`
      }
    }
    const session = found[0]!
    const window = this.windowOf(session.pid)
    if (!window) {
      return {
        state: "no-window",
        command,
        sessions: titles,
        message: `Found ${session.title}, but not its VS Code window:  type ${command} there.`
      }
    }
    await ReviewStart.request(window, "open-session", { sessionId: session.sessionId, prompt: command })
    const busy = session.status && session.status !== "idle" ? "  It starts once its turn ends." : ""
    return {
      state: "sent",
      command,
      sessions: titles,
      message: `Typed ${command} into ${session.title}:  press Enter there.${busy}`
    }
  }

  /** The live Claude sessions (`RunningEpics.liveSessions()`). */
  sessions(): LiveSession[] {
    return new RunningEpics(this.root).liveSessions()
  }

  /**
   * The window bridge entry of the VS Code window session process `pid` runs in:  the nearest of it and its
   * ancestors with a registry file;  `undefined` for none.
   */
  windowOf(pid: number): WindowEntry | undefined {
    const entries = ReviewStart.windows()
    if (!entries.size) return undefined
    const parents = ReviewStart.parentPids()
    const seen = new Set<number>()
    for (let at = pid; at > 1 && !seen.has(at); at = parents.get(at) ?? 0) {
      const entry = entries.get(at)
      if (entry) return entry
      seen.add(at)
    }
    return undefined
  }

  /** Every window bridge's registry entry, by pid:  `$SPELL_WINDOWS_DIR`, else `~/.spell/windows`. */
  static windows(): Map<number, WindowEntry> {
    const entries = new Map<number, WindowEntry>()
    const dir = process.env.SPELL_WINDOWS_DIR || join(homedir(), ".spell", "windows")
    if (!existsSync(dir)) return entries
    for (const name of readdirSync(dir)) {
      if (!/^\d+\.json$/.test(name)) continue
      try {
        const entry = JSON.parse(readFileSync(join(dir, name), "utf8")) as WindowEntry
        if (Number.isInteger(entry.pid) && entry.port && entry.token) entries.set(entry.pid, entry)
      } catch {
        // half-written:  skip it
      }
    }
    return entries
  }

  /** Every process's parent, by pid:  one `ps` call;  empty if it fails. */
  static parentPids(): Map<number, number> {
    const parents = new Map<number, number>()
    const run = spawnSync("ps", ["-axo", "pid=,ppid="], { encoding: "utf8" })
    for (const line of (run.stdout ?? "").split("\n")) {
      const match = /^\s*(\d+)\s+(\d+)/.exec(line)
      if (match) parents.set(Number(match[1]), Number(match[2]))
    }
    return parents
  }

  /** Ask `window`'s bridge to run `op` with `body`;  throws saying what went wrong. */
  static async request(window: WindowEntry, op: string, body: object): Promise<void> {
    const response = await fetch(`http://127.0.0.1:${window.port}/${op}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${window.token}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(BRIDGE_TIMEOUT)
    }).catch((error: Error) => {
      throw new Error(`the session's window didn't answer (${error.message})`)
    })
    const reply = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string }
    if (!response.ok || !reply.ok) throw new Error(`the session's window refused:  ${reply.error ?? response.status}`)
  }
}
