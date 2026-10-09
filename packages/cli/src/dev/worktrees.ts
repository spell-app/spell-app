import { spawnSync } from "child_process"
import { existsSync, readFileSync } from "fs"
import { basename, dirname, join, relative, resolve } from "path"
import { pathToFileURL } from "url"

import { CLI } from "$/cli"

////////////////
// ## Where sessions work
////////////////

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
 *   `epics/<name>/`, and the sessions titled `<name>` or that worked in that worktree
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
 * Plan doc `file`'s state from its skeleton's markup, with no parsing library:  `{ future, active, phases,
 * followUps }`, `followUps` its OPEN questions, judgement calls, issues, todos and tests (caveats are limits
 * accepted, open for good).  The same as `packages/docs/tools/index.js` `followUpsIn()` and the page runtime's
 * `wireFollowUps()`:  a SLEEPING epic has follow-ups and no phase under way.
 * - `<epic-phase status>`, `<epic-item status>`, `<epic-page future>`;  a doc still in the old markup (one restored
 *   from an old backup) reads as empty:  the plan-doc tool refuses it until it's converted (epic `epic-components` P15)
 */
export function planFollowUps(file: string): { future: boolean; active: boolean; phases: number; followUps: number } {
  const html = readFileSync(file, "utf8")
  const tags = (name: string) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "g"))].map((match) => match[0])
  const phases = tags("epic-phase")
  const followUps = tags("epic-item").filter((tag) => /\sid="[qjitv]\d+"/.test(tag) && /\sstatus="open"/.test(tag))
  return {
    future: tags("epic-page").some((tag) => /\sfuture\b/.test(tag)),
    active: phases.some((tag) => /\sstatus="active"/.test(tag)),
    phases: phases.length,
    followUps: followUps.length
  }
}

/**
 * Plan doc `name`:  its folder, and whether every phase is done, from `planSummaries()`.
 * - its live copy:  the worktree's when it has one, else the main checkout's (`planFile()`)
 */
export function planStatus(
  name: string,
  worktree: string,
  main = CLI.mainRoot()
): { folder: string | null; done: boolean } {
  const file = planFile(name, worktree, main)
  if (!file) return { folder: null, done: false }
  const phases = planSummaries([file], main).get(file)?.phases ?? []
  return { folder: dirname(file), done: phases.length > 0 && phases.every((phase) => phase.status === "done") }
}

/**
 * Plan doc `name`'s live copy:  the worktree's when it has one, else the main checkout's;  or `null`.
 * - in each:  `<name>.plan.html`, else an old `<name>.html` that is a plan doc (`<body class="... plan-doc">`):
 *   plan docs were renamed on 2026-10-04, and worktrees cut before keep the old name until they merge `main`
 *   (`packages/docs/tools/pages.js` `planDocIn()` is the same)
 * - which folder:  `epicsDir()`, old layout included
 */
export function planFile(name: string, worktree: string, main = CLI.mainRoot()): string | null {
  for (const root of [worktree, main]) {
    const folder = join(epicsDir(root), name)
    const file = join(folder, `${name}.plan.html`)
    if (existsSync(file)) return file
    const old = join(folder, `${name}.html`)
    if (existsSync(old) && /<body\b[^>]*\bclass="[^"]*\bplan-doc\b/.test(readFileSync(old, "utf8"))) return old
  }
  return null
}

/**
 * The folder checkout `root` keeps its plan docs in:  `epics` (since 2026-10-05, claude-design P4), else the first
 * older place that's there (a worktree on older code, until it merges `main`):  `packages/docs/content/epics`, then
 * `packages/docs/epics`.
 */
export function epicsDir(root: string): string {
  const places = [["epics"], ["packages", "docs", "content", "epics"], ["packages", "docs", "epics"]]
  const epics = join(root, "epics")
  return places.map((parts) => join(root, ...parts)).find((dir) => existsSync(dir)) ?? epics
}

/**
 * The summaries of the plan docs at `files` (absolute), the ones not read yet in ONE `plan-doc summaries` run;
 * a file it can't read is left out.
 * - runs the plan-doc tool of THIS checkout when it's installed, else the main checkout's:  a worktree's copy
 *   needn't be installed, and the tool reads by path from any checkout
 * - `<epic-*>` docs only:  the tool refuses a doc in the old markup, which comes back `{ error }` and is left out,
 *   as is any other doc it can't read
 * - SIDE EFFECT:  cached in `PLAN_SUMMARIES` for the rest of the run;  pass every file up front to read them in
 *   one go (the tool takes ~0.5s to start)
 */
export function planSummaries(files: string[], main = CLI.mainRoot()): Map<string, CLI.PlanSummary> {
  const todo = files.filter((file) => !PLAN_SUMMARIES.has(file))
  const root = [CLI.REPO_ROOT, main].find((it) => existsSync(join(it, "node_modules")))
  if (todo.length && root) {
    const loader = pathToFileURL(join(root, "node_modules", "tsx", "dist", "loader.mjs")).href
    const run = spawnSync(
      process.execPath,
      ["--import", loader, join(root, "packages", "docs", "tools", "plan-doc.js"), "summaries", ...todo],
      {
        cwd: root,
        encoding: "utf8",
        env: { ...process.env, TSX_TSCONFIG_PATH: join(root, "packages", "docs", "tsconfig.json") }
      }
    )
    try {
      const found = JSON.parse(run.stdout) as Record<string, CLI.PlanSummary | { error: string }>
      for (const [file, summary] of Object.entries(found)) if (!("error" in summary)) PLAN_SUMMARIES.set(file, summary)
    } catch {
      // the tool failed:  every plan reads as not done
    }
  }
  return new Map(files.filter((file) => PLAN_SUMMARIES.has(file)).map((file) => [file, PLAN_SUMMARIES.get(file)!]))
}

/** `planSummaries()`'s cache:  `{ file:  summary }`, for this process. */
const PLAN_SUMMARIES = new Map<string, CLI.PlanSummary>()

/** The live sessions that started in the repo at `main` (its main checkout or a worktree), by registry file. */
export function repoSessions(main = CLI.mainRoot()): CLI.RunningSession[] {
  return [...CLI.runningSessions().values()].filter(
    (record) => record.cwd === main || record.cwd?.startsWith(`${main}/`)
  )
}

/**
 * Whether running session `record` goes by `name`:  its title (its icon left out:  `🚧 <name>`), its registry
 * name, or its id's start.
 */
function goesBy(record: CLI.RunningSession, name: string): boolean {
  const title = CLI.sessionTitle(record.sessionId)
  return (title !== null && CLI.bareTitle(title) === name) || record.name === name || record.sessionId.startsWith(name)
}
