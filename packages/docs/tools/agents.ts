/**
 * `spell dev agents <verb> ...`:  the running-agents list of this checkout's epic, else of the checkout (epic
 * `skillz`;  `AgentList.ts`).  Claude sessions call it as they start and finish background agents (`/bg`, the root
 * `CLAUDE.md`'s rule), and so do the agents they start.
 *
 *     spell dev agents add aaa "docstrings in string.ts" [--status "blocked on skillz-bbb"] [--task-id <id>]
 *     skillz-aaa
 *     spell dev agents list
 *     skillz-aaa  active  3m  docstrings in string.ts
 *
 * - `add <name> "<task>"`:  prints the full name (`skillz-aaa`);  exits 1 if it's running already
 * - `set <name> [--status active | "blocked on <name>"] [--task-id <id>]`, `done <name>`:  exit 1 if it isn't running
 * - `list [--json]` (default):  one line each, oldest first (`--json`:  the entries)
 * - `wait [--every <s>] [--max <s>] [--json]`:  run in the BACKGROUND (Bash `run_in_background`) while agents run;
 *   exits when Owen has sent one a note from the plan doc's Agents box (`agentRoutes.ts`), which wakes the session:
 *   - 0:  untold redirects, printed `skillz-aaa:  <note>` (`--json`:  `[{ name, note, at }]`);  the session sends
 *     each to its agent (`SendMessage`), then `told <name>`
 *   - 3:  no agents running any more:  nothing to wait for
 *   - 2:  `--max` seconds passed (default 3600);  polls every `--every` (default 2)
 * - `told <name>`:  its redirects were passed on;  the page shows them "told"
 * - `--epic <name>`, any verb:  that epic's list, e.g. from the main checkout;  default:  the worktree's epic, if any
 * - Which checkout:  the one this file is in, which `spell dev` picks from the current folder (`runTool()`)
 */
import { setTimeout as sleep } from "node:timers/promises"

import { AgentList, AgentListError, type RunningAgent, type Untold } from "./AgentList"
import { ROOT, parseArgs } from "./pages.js"

const { positional, flags } = parseArgs(process.argv.slice(2))
process.exitCode = await run(positional, flags)

/** Run verb `positional[0]` with its arguments;  returns the exit code. */
async function run([verb = "list", name, task]: string[], flags: Record<string, string | true>): Promise<number> {
  const list = new AgentList(ROOT, { epic: stringFlag(flags.epic) })
  const status = stringFlag(flags.status)
  const taskId = stringFlag(flags["task-id"])
  try {
    if (verb === "list") {
      const agents = list.agents
      if (flags.json) console.log(JSON.stringify(agents, null, 2))
      else if (!agents.length) console.log(`no agents running (${list.prefix})`)
      else for (const agent of agents) console.log(agentLine(agent))
      return 0
    }
    if (verb === "wait") return await waitForRedirects(list, flags)
    if (!name || (verb === "add" && !task)) return usage()
    if (verb === "add") console.log(list.add(name, task!, { status, taskId }).name)
    else if (verb === "set") list.set(name, { status, taskId })
    else if (verb === "done") list.done(name)
    else if (verb === "told") list.told(name)
    else return usage()
    return 0
  } catch (error) {
    if (!(error instanceof AgentListError)) throw error
    console.error(error.message)
    return 1
  }
}

/**
 * `wait`:  poll `list` until a redirect is untold (0, printed), no agent runs (3), or `--max` passes (2).
 * - reads the file without its lock:  writes are atomic renames, so a read never sees half a file
 */
async function waitForRedirects(list: AgentList, flags: Record<string, string | true>): Promise<number> {
  const every = Number(stringFlag(flags.every) ?? 2) * 1000
  const deadline = Date.now() + Number(stringFlag(flags.max) ?? 3600) * 1000
  for (;;) {
    const untold = list.untold
    if (untold.length) {
      console.log(flags.json ? JSON.stringify(untold, null, 2) : untold.map(redirectLines).join("\n"))
      return 0
    }
    if (!list.agents.length) {
      console.log(`no agents running (${list.prefix}):  nothing to wait for`)
      return 3
    }
    if (Date.now() > deadline) return 2
    await sleep(every)
  }
}

/** An untold redirect as `wait` prints it:  `skillz-aaa:  <note>`, a note's later lines indented. */
function redirectLines({ name, note }: Untold): string {
  return `${name}:  ${note.replace(/\n/g, "\n  ")}`
}

/** One agent as `list` prints it:  `skillz-aaa  active  3m  docstrings in string.ts`. */
function agentLine(agent: RunningAgent, now = Date.now()): string {
  return `${agent.name}  ${agent.status}  ${age(now - Date.parse(agent.started))}  ${agent.task}`
}

/** `ms` as a short age:  `40s`, `3m`, `2h 5m`. */
function age(ms: number): string {
  const minutes = Math.floor(ms / 60_000)
  if (minutes < 1) return `${Math.max(0, Math.floor(ms / 1000))}s`
  if (minutes < 60) return `${minutes}m`
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

/** A flag's value when it was given one;  a bare `--flag` or none:  `undefined`. */
function stringFlag(value: string | true | undefined): string | undefined {
  return typeof value === "string" ? value : undefined
}

/** Print how to call it;  exit code 1. */
function usage(): number {
  console.error(
    'usage:  spell dev agents add <name> "<task>" [--status ...] [--task-id <id>] | set <name> [--status ...] ' +
      "[--task-id <id>] | done <name> | list [--json] | wait [--every <s>] [--max <s>] [--json] | told <name>   " +
      "(any verb:  [--epic <name>])"
  )
  return 1
}
