import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

import { EpicConfig } from "$/epics/config/EpicConfig"

import {
  EXIT,
  EpicCommandError,
  parseVerbArgs,
  type ParkedNote,
  type WaitCandidate,
  type WaitResult
} from "./command.types"
import { Sessions } from "./Sessions"
import { Worktrees } from "./Worktrees"

/****************
 * ### `Parking`
 * `epic park <verb> ...`:  parked and waiting work, for `/park`, `/unpark` and `/wait-for` (was `status.py`).
 * - The verbs (`run()`):
 *   - `list`:  JSON:  every parked worktree's note (`PARKED-<name>.md`):  name, file, state, where it stopped
 *   - `candidates`:  JSON:  what `/wait-for ?` offers:  unfinished worktrees and epics, running sessions
 *   - `wait <name> [--every 60] [--max 7140]`:  poll until `<name>` finishes, then print its status JSON.  Exits `0`
 *     finished, `2` `--max` seconds passed (run it again), `3` nothing named `<name>`.
 * - Where a name stands, without waiting:  `epic worktree status <name>`.
 ****************/
export class Parking {
  /** the worktrees, and where each name stands:  STATIC for the object's life */
  readonly worktrees: Worktrees

  /** - `worktrees`:  default the current folder's repo's */
  constructor({ worktrees = new Worktrees() }: { worktrees?: Worktrees } = {}) {
    this.worktrees = worktrees
  }

  /** the repo's main checkout */
  get main(): string {
    return this.worktrees.main
  }

  /** the sessions the worktrees are read with */
  get sessions(): Sessions {
    return this.worktrees.sessions
  }

  ////////////////
  // ## The verbs
  ////////////////

  /** Run `epic park <args>`;  resolves to the exit code.  Throws `EpicCommandError` for a bad command line. */
  async run(args: string[]): Promise<number> {
    const { positional, flags } = parseVerbArgs(args)
    const [verb, name] = positional
    switch (verb) {
      case "list":
        out(JSON.stringify(this.notes(), null, 2))
        return EXIT.OK
      case "candidates":
        out(JSON.stringify(this.candidates(), null, 2))
        return EXIT.OK
      case "wait": {
        if (!name) throw new EpicCommandError("wait:  which name?")
        const result = await this.waitFor(name, Number(flags.every ?? 60), Number(flags.max ?? 7140))
        out(result.status ? JSON.stringify(result.status, null, 2) : (result.message ?? ""))
        return result.code
      }
      default:
        throw new EpicCommandError(`unknown verb '${verb ?? ""}':  list, candidates or wait`)
    }
  }

  ////////////////
  // ## Parked and waiting work
  ////////////////

  /**
   * What `/wait-for ?` offers, each `{ name, label }`:  unfinished worktrees and epics, then running sessions outside
   * any worktree.  The session that ran this is left out.
   * - a worktree or epic counts while it isn't finished and has a worktree or commits of its own
   */
  candidates(): WaitCandidate[] {
    const config = new EpicConfig(this.main)
    const names = new Set([...folders(config.worktreesFolder), ...folders(Worktrees.epicsDir(this.main))])
    const found: WaitCandidate[] = []
    for (const name of [...names].sort()) {
      const status = this.worktrees.nameStatus(name, [])
      if (status.finished || !(status.ahead || status.worktree)) continue
      const ahead = status.ahead ? `${status.ahead} commits not in ${config.baseBranch}` : "nothing committed yet"
      const bits = [status.branch ? ahead : null, status.plan ? "epic page" : null].filter(Boolean)
      found.push({ name, label: bits.join(", ") || "worktree" })
    }
    const mine = Sessions.ancestorPids()
    for (const record of this.worktrees.repoSessions()) {
      if (mine.has(record.pid) || config.worktreeNameOf(record.cwd)) continue
      const name = this.sessions.title(record.sessionId) || record.name || record.sessionId.slice(0, 8)
      found.push({ name, label: `running session (${record.status ?? "?"})` })
    }
    return found
  }

  /** Every parked worktree's note, `.claude/worktrees/<name>/PARKED-<name>.md`, sorted by path. */
  notes(): ParkedNote[] {
    const config = new EpicConfig(this.main)
    const found: ParkedNote[] = []
    for (const name of folders(config.worktreesFolder).sort()) {
      const dir = config.worktreeFolder(name)
      for (const file of readdirSync(dir).sort()) {
        if (!/^PARKED-.*\.md$/.test(file)) continue
        const lines = readFileSync(join(dir, file), "utf8").split("\n")
        const state = lines.length
          ? lines[0]!
              .replace(/^<!-- park:/, "")
              .replace(/-->$/, "")
              .trim()
          : "?"
        const at = lines.indexOf("## Where it stopped")
        const stopped = at < 0 ? "" : (lines.slice(at + 1).find((line) => line.trim()) ?? "")
        found.push({ name, file: join(dir, file), state, stopped: stopped.replace(/^[- ]+|[- ]+$/g, "") })
      }
    }
    return found
  }

  /**
   * Poll `name` every `every` seconds until it finishes, or `most` seconds pass (was `status.py --wait`).
   * - finished:  `nameStatus()`'s `merged` / `planDone`, or, compared with when it started:  the worktree went
   *   away, or every session of `name` that was running has exited.  NEVER "idle":  a session idles each time it
   *   waits for Owen.
   * - returns `{ code, status?, message? }`:  `0` finished (with the status, `why` saying which);  `2` time's up
   *   (run it again:  a background Bash command is stopped after 2 hours);  `3` `name` matches nothing to wait on
   */
  async waitFor(name: string, every: number, most: number): Promise<WaitResult> {
    const first = this.worktrees.nameStatus(name)
    if (!(first.worktree || first.branch || first.plan || first.sessions.length)) {
      return { code: 3, message: `nothing named ${name}:  no worktree, branch, epic page or session` }
    }
    const ids = first.sessions.map((it) => it.id)
    const hadWorktree = !!first.worktree
    const wasRunning = first.sessions.some((it) => it.running)
    const deadline = Date.now() + most * 1000
    for (let now = first; ; now = this.worktrees.nameStatus(name, ids)) {
      if (!now.why && hadWorktree && !now.worktree) now.why = "worktree removed"
      if (!now.why && wasRunning && !now.sessions.some((it) => it.running)) now.why = "session exited"
      if (now.why) return { code: 0, status: { ...now, finished: true } }
      if (Date.now() + every * 1000 > deadline)
        return { code: 2, message: `still waiting for ${name} after ${most}s:  run again` }
      await new Promise((done) => setTimeout(done, every * 1000))
    }
  }
}

/** Write `text` to stdout, on its own line. */
function out(text: string): void {
  process.stdout.write(text.endsWith("\n") ? text : `${text}\n`)
}

/** The folder names directly in `dir`, or none when it doesn't exist. */
function folders(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter((name) => statSync(join(dir, name)).isDirectory())
}
