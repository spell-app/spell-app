import { spawnSync } from "child_process"
import { existsSync } from "fs"
import { basename, join, relative, resolve } from "path"
import { pathToFileURL } from "url"

import { CLI } from "$/cli"

////////////////
// ## Where sessions work
////////////////

/**
 * Every live session on this machine and the checkout it works in, plus each repo's worktrees no session is in.
 * - a session's folder:  the LAST `cwd` in its transcript (it may have moved), else where it started
 * - `idle`:  `{ repo:  main checkout, worktrees:  [{ path, branch }] }` per repo a session was seen in
 */
export function sessionPlaces(): {
  sessions: CLI.SessionPlace[]
  idle: { repo: string; worktrees: { path: string; branch: string }[] }[]
} {
  const mine = CLI.ancestorPids()
  const sessions: CLI.SessionPlace[] = []
  const used = new Map<string, Set<string>>()
  for (const record of CLI.runningSessions().values()) {
    const cwd = CLI.lastCwd(record.sessionId) ?? record.cwd ?? ""
    const place = checkoutOf(cwd)
    if (place.root) {
      const repo = CLI.mainRoot(place.root)
      if (!used.has(repo)) used.set(repo, new Set())
      used.get(repo)!.add(place.root)
    }
    sessions.push({
      name: record.name ?? "?",
      id: record.sessionId.slice(0, 8),
      status: `${record.status ?? "?"}${record.waitingFor ? ` (${record.waitingFor})` : ""}`,
      where: CLI.ENTRYPOINT_PLACES[record.entrypoint ?? ""] ?? record.entrypoint ?? "?",
      worktree: place.label,
      branch: place.branch,
      folder: place.root ? place.inside : cwd,
      this: mine.has(record.pid)
    })
  }
  const idle = [...used].map(([repo, roots]) => ({
    repo,
    worktrees: worktreesOf(repo).filter((it) => !roots.has(it.path))
  }))
  return { sessions, idle: idle.filter((it) => it.worktrees.length) }
}

/**
 * The checkout holding `cwd`:  `{ root, label, branch, inside }`.
 * - `label`:  `main checkout` or `worktree <name>`;  outside git, `root` is `undefined` and `label` `(not in git)`
 * - `inside`:  `cwd` relative to the root, `""` at the root
 */
export function checkoutOf(cwd: string): { root?: string; label: string; branch: string; inside: string } {
  const top = CLI.git(["rev-parse", "--show-toplevel"], cwd)
  if (!top.ok) return { label: "(not in git)", branch: "", inside: cwd }
  const root = top.out
  const label = resolve(root) === resolve(CLI.mainRoot(cwd)) ? "main checkout" : `worktree ${basename(root)}`
  const branch = CLI.git(["branch", "--show-current"], cwd).out || "(detached)"
  const inside = relative(root, cwd)
  return { root, label, branch, inside }
}

/** Every worktree of the repo at `root`, main checkout first:  `{ path, branch }` (`(detached)` without one). */
export function worktreesOf(root: string): { path: string; branch: string }[] {
  const found: { path: string; branch: string }[] = []
  for (const line of CLI.git(["worktree", "list", "--porcelain"], root).out.split("\n")) {
    if (line.startsWith("worktree ")) found.push({ path: line.slice(9), branch: "(detached)" })
    else if (line.startsWith("branch ") && found.length)
      found.at(-1)!.branch = line.slice(7).replace(/^refs\/heads\//, "")
  }
  return found
}

////////////////
// ## Where a name stands
////////////////

/**
 * Where session / worktree / plan `name` stands, for `/park`, `/unpark`, `/wait-for` (was `status.py <name>`).
 * - `name` resolves as `/wtf <name>` does:  worktree `.claude/worktrees/<name>`, branch `<name>`, plan doc
 *   `packages/docs/epics/<name>/`, and the sessions titled `<name>` or that worked in that worktree
 * - `ids`:  its session ids when already known:  finding them reads every transcript, so `park wait` finds them once
 * - git runs in the MAIN checkout:  branches are shared, so every worktree gets the same answer
 */
export function nameStatus(name: string, ids?: string[], main = CLI.mainRoot()): CLI.NameStatus {
  const worktree = join(main, ".claude", "worktrees", name)
  const branch = CLI.git(["rev-parse", "--verify", "--quiet", `refs/heads/${name}`], main).ok ? name : null
  const ahead = branch ? Number(CLI.git(["rev-list", "--count", `main..${name}`], main).out || 0) : 0
  const reflog = branch ? CLI.git(["reflog", "show", "--format=%H", `refs/heads/${name}`], main).out : ""
  const moved = reflog.split("\n").filter(Boolean).length > 1
  const merged = !!branch && moved && ahead === 0
  const plan = planStatus(name, worktree, main)
  const live = repoSessions(main)
  if (ids === undefined) {
    ids = CLI.sessionsNamed(name).map((it) => it.id)
    for (const record of live) if (!ids.includes(record.sessionId) && goesBy(record, name)) ids.push(record.sessionId)
  }
  const pids = new Map(live.map((record) => [record.sessionId, record.pid]))
  const why = merged ? "merged into main" : plan.done ? "plan all done" : null
  return {
    name,
    worktree: existsSync(worktree) ? worktree : null,
    branch,
    ahead,
    merged,
    plan: plan.folder,
    planDone: plan.done,
    sessions: ids.map((id) => ({ id, title: CLI.sessionTitle(id), running: pids.has(id), pid: pids.get(id) ?? null })),
    finished: !!why,
    why
  }
}

/**
 * Plan doc `name`:  its folder, and whether every phase is done, from the plan-doc tool's `summary --json`.
 * - read from the worktree when it has `node_modules/` (its copy of the plan is the live one), else the main checkout
 */
export function planStatus(
  name: string,
  worktree: string,
  main = CLI.mainRoot()
): { folder: string | null; done: boolean } {
  for (const root of [worktree, main]) {
    const folder = join(root, "packages", "docs", "epics", name)
    if (!existsSync(folder) || !existsSync(join(root, "node_modules"))) continue
    const loader = pathToFileURL(join(CLI.REPO_ROOT, "node_modules", "tsx", "dist", "loader.mjs")).href
    const run = spawnSync(
      process.execPath,
      ["--import", loader, join(root, "packages", "docs", "scripts", "plan-doc.js"), "summary", name, "--json"],
      {
        cwd: root,
        encoding: "utf8",
        env: { ...process.env, TSX_TSCONFIG_PATH: join(root, "packages", "docs", "tsconfig.json") }
      }
    )
    try {
      const phases = (JSON.parse(run.stdout) as { phases?: { status?: string }[] }).phases ?? []
      return { folder, done: phases.length > 0 && phases.every((phase) => phase.status === "done") }
    } catch {
      return { folder, done: false }
    }
  }
  return { folder: null, done: false }
}

/** The live sessions that started in the repo at `main` (its main checkout or a worktree), by registry file. */
export function repoSessions(main = CLI.mainRoot()): CLI.RunningSession[] {
  return [...CLI.runningSessions().values()].filter(
    (record) => record.cwd === main || record.cwd?.startsWith(`${main}/`)
  )
}

/** Whether running session `record` goes by `name`:  its title, its registry name, or its id's start. */
function goesBy(record: CLI.RunningSession, name: string): boolean {
  return CLI.sessionTitle(record.sessionId) === name || record.name === name || record.sessionId.startsWith(name)
}
