/**
 * Starting a review from the epic page, and WAKING an epic nobody is listening for.
 *
 * Starting (epic `airplane` P12):  `POST /api/review/start` (`reviewRoutes`), `start()`.
 * - Owen clicks the "No Claude session is reviewing" pill, or the review line.
 * - The page server looks for the ONE running Claude session titled for the epic (`🚧 <epic>`, or the epic's name
 *   as a word in its title:  `$/server/page`'s `sessionsTitledFor()`).
 * - Found one:  it asks the VS Code window that session runs in (the spell extension's window bridge,
 *   `~/.spell/windows/<pid>.json`) to open the session's tab with `/epic review <epic>` typed into its input.
 *   The bridge can only TYPE a prompt (Claude Code's extension has no "send"):  Owen presses Enter.
 * - None, or several:  sends nothing, and says which sessions it found.
 *
 * Waking (epic `epic-workflow` P16):  Send, Review Now or Do Now pressed while NO session listens, `changeAndWake()`.
 * - The page server wakes the epic inside that request:  no process runs while Owen isn't working.
 * - Who, first match wins (`wake()`):
 *   1. the ONE running session titled for the epic:  the command typed into its tab, as `start()` does
 *   2. the epic's worktree (`.claude/worktrees/<epic>`) has a window open:  a NEW session there, the command typed in,
 *      through that window's bridge (never `window launch`, which rewrites the window file and its colours:  J48)
 *   3. a worktree, its window closed:  `spell dev window launch <epic> --prompt ...`, as `/send` opens one (P4)
 *   4. no worktree (an epic run in the main checkout, a future epic, a goal):  a new session in a main window
 *   5. no VS Code window at all:  nothing;  the page gives the command to type
 * - Never:  a new worktree;  two wakes for one epic (the inbox's `woken`, `ReviewInbox.claimWake()`);
 *   a wake while several sessions are titled for the epic, in airplane mode, or for a Send with nothing new (J47).
 * - Any page kind wakes its epic the same way:  a guide's or saga page's Send calls `wakeFor()` with the epic page of
 *   the epic it belongs to, so the epic page and its guides share one wake record.
 */
import { spawn, spawnSync } from "node:child_process"
import { existsSync, mkdirSync, openSync, readdirSync, readFileSync, realpathSync } from "node:fs"
import { homedir } from "node:os"
import { join, resolve, sep } from "node:path"

import { AirplaneMode, RunningEpics, sessionsTitledFor, type LiveSession } from "$/server/page"

import { ReviewInbox, type InboxWoken, type PageInbox, type WakeClaim, type WokenState } from "./ReviewInbox"

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

/**
 * What a wake came to (`ReviewStart.wake()`, `wakeFor()`), for the page's notice.
 * - did something, kept in the inbox for the cooldown:  `typed`, `opened`, `launched` (`WokenState`)
 * - did nothing:
 *   - `several`:  several sessions are titled for the epic (`sessions`):  guessing could type into the wrong tab
 *   - `no-window`:  the one session titled for it has no window bridge (a terminal session)
 *   - `no-vscode`:  no VS Code window is open to start a session in
 *   - `failed`:  a window's bridge didn't answer, or refused
 * - didn't try (`wakeFor()`'s claim):  `airplane`, `nothing-new`, or `already` (woken at `at`, nobody listening since)
 */
export type WakeResult = {
  state: WokenState | "several" | "no-window" | "no-vscode" | "failed" | "airplane" | "nothing-new" | "already"
  command: string
  /** the sessions titled for the epic, when that's why */
  sessions: string[]
  /** what it did, as words to follow "Already ":  `typed /epic review x into 🚧 x`;  `""` when it did nothing */
  did: string
  /** what came of it, in words */
  message: string
  /** `already`:  when the wake it stands for happened (ISO) */
  at?: string
}

/** A Send's or Do Now's answer once the epic may have been woken:  the inbox, plus what the wake did. */
export type WokenInbox = PageInbox & { wake: WakeResult | null }

/** What a `ReviewStart` may be given in place of the real world:  tests. */
export type ReviewStartOptions = {
  /** start `spell dev window launch` with `args`, in folder `cwd`, and let it run;  default:  detached `node` */
  launch?: (args: string[], cwd: string) => void
  /** is airplane mode on?  Default:  `AirplaneMode.isOn` */
  airplane?: () => boolean
}

/** A window bridge's registry entry (`packages/vscode/src/WindowBridge.ts`). */
type WindowEntry = { pid: number; port: number; token: string; workspaceFile?: string | null; folders?: string[] }

export class ReviewStart {
  /** the page server's checkout (the main one, or a worktree) */
  readonly root: string

  /** the main checkout:  where the worktrees and window files are */
  readonly mainRoot: string

  /** the real world, or a test's stand-ins */
  private readonly options: ReviewStartOptions

  constructor(root: string, options: ReviewStartOptions = {}) {
    this.root = root
    this.mainRoot = root.split(`${sep}.claude${sep}worktrees${sep}`)[0]!
    this.options = options
  }

  /** Start `/epic review <epic>` in the session titled for `epic`, or say why not. */
  async start(epic: string): Promise<StartResult> {
    const command = ReviewStart.commandFor(epic)
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
    if (found.length > 1) return { ...ReviewStart.several(epic, titles), state: "several" }
    const session = found[0]!
    const window = this.windowOf(session.pid)
    if (!window) return { ...ReviewStart.noWindow(session, command), state: "no-window" }
    await ReviewStart.request(window, "open-session", { sessionId: session.sessionId, prompt: command })
    const busy = session.status && session.status !== "idle" ? "  It starts once its turn ends." : ""
    return {
      state: "sent",
      command,
      sessions: titles,
      message: `Typed ${command} into ${session.title}:  press Enter there.${busy}`
    }
  }

  ////////////////
  // ## Waking (P16)
  ////////////////

  /**
   * Change epic page `planDoc`'s inbox with `change` (a Send, a Do Now) under its lock, then wake its epic `epic`
   * if nobody listens (`wakeFor()`'s rules);  the inbox as the page reads it, plus `wake`, what the wake did.
   * - `change` returns whether the request handed over anything new (`ReviewInbox.hasUnsent`, read before the send)
   * - the change and the wake's claim share ONE lock:  two Sends at once wake once
   * - `wake`:  `null` when a session listens (it takes the work as always)
   * - throws what `change` throws
   */
  async changeAndWake(planDoc: string, epic: string, change: (inbox: ReviewInbox) => boolean): Promise<WokenInbox> {
    const file = ReviewInbox.pathFor(planDoc)
    let claim: WakeClaim = { state: "listening" }
    await ReviewInbox.updateAsync(file, (inbox) => {
      claim = inbox.claimWake({ fresh: change(inbox), airplane: this.isAirplane() })
    })
    const wake = await this.settle(file, epic, claim)
    return { ...ReviewInbox.read(file).forPage(), wake }
  }

  /**
   * Wake epic `epic` (epic page `planDoc`, whose inbox keeps the wake) after a Send or Do Now on ANY page of it
   * (a guide, a saga page) that handed over `fresh` work;  what the wake did, or `null` when a session listens.
   * - for a page whose request was written elsewhere (a guide's own inbox):  the epic page's is `changeAndWake()`
   * - SIDE EFFECT:  may type into a session, open a session or a window;  writes the epic's inbox (`woken`)
   */
  async wakeFor(planDoc: string, epic: string, { fresh }: { fresh: boolean }): Promise<WakeResult | null> {
    const file = ReviewInbox.pathFor(planDoc)
    let claim: WakeClaim = { state: "listening" }
    await ReviewInbox.updateAsync(file, (inbox) => {
      claim = inbox.claimWake({ fresh, airplane: this.isAirplane() })
    })
    return this.settle(file, epic, claim)
  }

  /**
   * Wake `epic` now, first match wins (the module's "Who");  what came of it.
   * - NEVER throws:  a bridge that fails is `failed`, in words
   * - SIDE EFFECT:  types into a session's tab, opens a session or a window
   */
  async wake(epic: string): Promise<WakeResult> {
    const command = ReviewStart.commandFor(epic)
    const result = (state: WakeResult["state"], did: string, message: string, sessions: string[] = []) => ({
      state,
      command,
      sessions,
      did,
      message
    })
    try {
      const found = sessionsTitledFor(epic, this.sessions())
      if (found.length > 1)
        return {
          ...ReviewStart.several(
            epic,
            found.map((session) => session.title)
          ),
          did: ""
        }
      const session = found[0]
      if (session) {
        const window = this.windowOf(session.pid)
        if (!window) return { ...ReviewStart.noWindow(session, command), did: "" }
        await ReviewStart.request(window, "open-session", { sessionId: session.sessionId, prompt: command })
        const did = `typed ${command} into ${session.title}`
        const busy = session.status && session.status !== "idle" ? "  It reads it once its turn ends." : ""
        return result("typed", did, `${sentence(did)}:  press Enter there.${busy}`, [session.title])
      }
      if (existsSync(this.worktreeOf(epic))) {
        const window = this.worktreeWindowOf(epic)
        if (window) {
          await ReviewStart.request(window, "open-session", { prompt: command })
          const did = `opened a new session in ${epic}'s window, ${command} typed in`
          return result("opened", did, `${sentence(did)}:  press Enter there.`)
        }
        this.launch(["launch", epic, "--prompt", command])
        const did = `opened ${epic}'s window`
        return result("launched", did, `${sentence(did)}:  press Enter on ${command} there.`)
      }
      const main = this.mainWindow()
      if (!main) {
        return result("no-vscode", "", `No VS Code window is open:  type ${command} in a new session.`)
      }
      await ReviewStart.request(main, "open-session", { prompt: command })
      const did = `opened a new session in a main window, ${command} typed in`
      return result("opened", did, `${sentence(did)}:  press Enter there.`)
    } catch (error) {
      const why = (error as Error).message
      return result("failed", "", `Couldn't wake ${epic}:  ${why}.  Type ${command} in its session.`)
    }
  }

  /**
   * Act on `claim` (made under `file`'s lock):  wake when it's `due` and record what came of it;  else say why not.
   * - `null` when a session listens
   */
  private async settle(file: string, epic: string, claim: WakeClaim): Promise<WakeResult | null> {
    const command = ReviewStart.commandFor(epic)
    switch (claim.state) {
      case "listening":
        return null
      case "airplane":
        return {
          state: "airplane",
          command,
          sessions: [],
          did: "",
          message: "Airplane mode:  queued for when you land (/airplane land)."
        }
      case "nothing-new":
        return {
          state: "nothing-new",
          command,
          sessions: [],
          did: "",
          message: `Nothing new to hand over, so no session was woken:  type ${command} to start one.`
        }
      case "already":
        return ReviewStart.already(claim.woken, command)
      case "due": {
        const wake = await this.wake(epic)
        const kept = isWoken(wake.state) ? { state: wake.state, did: wake.did, message: wake.message } : null
        await ReviewInbox.updateAsync(file, (inbox) => inbox.recordWake(claim.at, kept))
        return wake
      }
    }
  }

  ////////////////
  // ## Sessions and windows
  ////////////////

  /** The live Claude sessions (`RunningEpics.liveSessions()`). */
  sessions(): LiveSession[] {
    return new RunningEpics(this.mainRoot).liveSessions()
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

  /** Epic `epic`'s worktree:  `.claude/worktrees/<epic>` in the main checkout (`/epic` names it for the epic). */
  worktreeOf(epic: string): string {
    return join(this.mainRoot, ".claude", "worktrees", epic)
  }

  /**
   * The open window of epic `epic`'s worktree, else `undefined`:  the one opened from its window file
   * (`workspaces/ongoing/<epic>.code-workspace`, `spell dev window open`), else one showing its folder.
   */
  worktreeWindowOf(epic: string): WindowEntry | undefined {
    const file = real(join(this.mainRoot, "workspaces", "ongoing", `${epic}.code-workspace`))
    const folder = real(this.worktreeOf(epic))
    const entries = [...ReviewStart.windows().values()]
    return (
      entries.find((entry) => entry.workspaceFile && real(entry.workspaceFile) === file) ??
      entries.find((entry) => entry.folders?.some((each) => real(each) === folder))
    )
  }

  /**
   * An open window of the MAIN checkout:  its first folder the main root, no worktree among its folders;
   * the oldest such window (the lowest pid), else `undefined`.
   * - NOTE:  the page server can't tell which window shows the page:  any main window will do
   */
  mainWindow(): WindowEntry | undefined {
    const main = real(this.mainRoot)
    const worktrees = `${real(join(this.mainRoot, ".claude", "worktrees"))}${sep}`
    return [...ReviewStart.windows().values()]
      .filter((entry) => entry.folders?.length && real(entry.folders[0]!) === main)
      .filter((entry) => !entry.folders!.some((folder) => real(folder).startsWith(worktrees)))
      .sort((a, b) => a.pid - b.pid)[0]
  }

  /** Every window bridge's registry entry, by pid:  `$SPELL_WINDOWS_DIR`, else `~/.spell/windows`. */
  static windows(): Map<number, WindowEntry> {
    const entries = new Map<number, WindowEntry>()
    const dir = ReviewStart.windowsDir
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

  /** The window bridges' registry folder:  `$SPELL_WINDOWS_DIR`, else `~/.spell/windows`. */
  static get windowsDir(): string {
    return process.env.SPELL_WINDOWS_DIR || join(homedir(), ".spell", "windows")
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

  ////////////////
  // ## Helpers
  ////////////////

  /** The command a review starts with:  `/epic review <epic>`. */
  static commandFor(epic: string): string {
    return `/epic review ${epic}`
  }

  /** Is airplane mode on (or the test's word for it)? */
  private isAirplane(): boolean {
    return this.options.airplane ? this.options.airplane() : AirplaneMode.isOn
  }

  /**
   * Run `spell dev window launch` with `args`, from the main checkout, detached:  the request doesn't wait for the
   * window to come up (up to 30s).
   * - its output goes to `wake.log` in the bridges' registry folder, where a failed launch can be read
   */
  private launch(args: string[]) {
    if (this.options.launch) return this.options.launch(args, this.mainRoot)
    const dir = ReviewStart.windowsDir
    mkdirSync(dir, { recursive: true, mode: 0o700 })
    const log = openSync(join(dir, "wake.log"), "a")
    const script = join(this.mainRoot, "scripts", "window.mjs")
    spawn(process.execPath, [script, ...args], { cwd: this.mainRoot, detached: true, stdio: ["ignore", log, log] })
      .on("error", (error) => console.error("ReviewStart:  window launch failed", error))
      .unref()
  }

  /** Several sessions are titled for `epic` (`titles`):  nothing typed, and says which. */
  private static several(epic: string, titles: string[]) {
    return {
      state: "several" as const,
      command: ReviewStart.commandFor(epic),
      sessions: titles,
      message: `${titles.length} sessions are titled for ${epic} (${titles.join(", ")}):  nothing sent.`
    }
  }

  /** `session` is titled for the epic, but has no window bridge:  type `command` there by hand. */
  private static noWindow(session: LiveSession, command: string) {
    return {
      state: "no-window" as const,
      command,
      sessions: [session.title],
      message: `Found ${session.title}, but not its VS Code window:  type ${command} there.`
    }
  }

  /** A wake inside the cooldown:  says what `woken` did, and when. */
  private static already(woken: InboxWoken, command: string): WakeResult {
    const did = woken.did || `woke it`
    return {
      state: "already",
      command,
      sessions: [],
      did,
      at: woken.at,
      message: `Already ${did} at ${clockOf(woken.at)}:  press Enter there.`
    }
  }
}

/** Is `state` a wake that did something, kept for the cooldown? */
function isWoken(state: WakeResult["state"]): state is WokenState {
  return state === "typed" || state === "opened" || state === "launched"
}

/** `words` with a capital first:  `typed ...` -> `Typed ...`. */
function sentence(words: string): string {
  return `${words[0]!.toUpperCase()}${words.slice(1)}`
}

/** ISO time `iso` as this machine's clock time, 24-hour:  `17:32`. */
function clockOf(iso: string): string {
  const date = new Date(iso)
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
}

/** `path` with its links resolved, else as given (it may not exist). */
function real(path: string): string {
  try {
    return realpathSync(path)
  } catch {
    return resolve(path)
  }
}
