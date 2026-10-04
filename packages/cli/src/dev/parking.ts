import { existsSync, readFileSync, readdirSync, statSync } from "fs"
import { join } from "path"

import { CLI } from "$/cli"

/**
 * What `/wait-for ?` offers, each `{ name, label }`:  unfinished worktrees and epics, then running sessions outside
 * any worktree.  The session that ran this is left out.
 * - a worktree or epic counts while it isn't finished and has a worktree or commits of its own
 */
export function waitCandidates(main = CLI.mainRoot()): CLI.WaitCandidate[] {
  const names = new Set([...folders(join(main, ".claude", "worktrees")), ...folders(CLI.epicsDir(main))])
  const found: CLI.WaitCandidate[] = []
  for (const name of [...names].sort()) {
    const status = CLI.nameStatus(name, [], main)
    if (status.finished || !(status.ahead || status.worktree)) continue
    const ahead = status.ahead ? `${status.ahead} commits not in main` : "nothing committed yet"
    const bits = [status.branch ? ahead : null, status.plan ? "plan doc" : null].filter(Boolean)
    found.push({ name, label: bits.join(", ") || "worktree" })
  }
  const mine = CLI.ancestorPids()
  for (const record of CLI.repoSessions(main)) {
    if (mine.has(record.pid) || record.cwd?.includes("/.claude/worktrees/")) continue
    const name = CLI.sessionTitle(record.sessionId) || record.name || record.sessionId.slice(0, 8)
    found.push({ name, label: `running session (${record.status ?? "?"})` })
  }
  return found
}

/** Every parked worktree's note, `.claude/worktrees/<name>/PARKED-<name>.md`, sorted by path. */
export function parkedNotes(main = CLI.mainRoot()): CLI.ParkedNote[] {
  const found: CLI.ParkedNote[] = []
  for (const name of folders(join(main, ".claude", "worktrees")).sort()) {
    const dir = join(main, ".claude", "worktrees", name)
    for (const file of readdirSync(dir).sort()) {
      if (!/^PARKED-.*\.md$/.test(file)) continue
      const lines = readFileSync(join(dir, file), "utf8").split("\n")
      const state = lines.length
        ? lines[0]
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
export async function waitFor(
  name: string,
  every: number,
  most: number
): Promise<{ code: number; status?: CLI.NameStatus; message?: string }> {
  const first = CLI.nameStatus(name)
  if (!(first.worktree || first.branch || first.plan || first.sessions.length)) {
    return { code: 3, message: `nothing named ${name}:  no worktree, branch, plan doc or session` }
  }
  const ids = first.sessions.map((it) => it.id)
  const hadWorktree = !!first.worktree
  const wasRunning = first.sessions.some((it) => it.running)
  const deadline = Date.now() + most * 1000
  for (let now = first; ; now = CLI.nameStatus(name, ids)) {
    if (!now.why && hadWorktree && !now.worktree) now.why = "worktree removed"
    if (!now.why && wasRunning && !now.sessions.some((it) => it.running)) now.why = "session exited"
    if (now.why) return { code: 0, status: { ...now, finished: true } }
    if (Date.now() + every * 1000 > deadline)
      return { code: 2, message: `still waiting for ${name} after ${most}s:  run again` }
    await new Promise((done) => setTimeout(done, every * 1000))
  }
}

/** The folder names directly in `dir`, or none when it doesn't exist. */
function folders(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter((name) => statSync(join(dir, name)).isDirectory())
}
