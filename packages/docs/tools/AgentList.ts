/**
 * The RUNNING-AGENTS LIST of an epic or a checkout (epic `skillz`):  every background agent a Claude session started
 * (`/bg`, or on its own), by name, while it runs.
 * - the file:
 *   - in an epic:  `epics/<epic>/agents.json`, beside the plan doc (shared content;  git-ignored in the shared repo)
 *   - else:  `<checkout root>/.spell-agents.json` (git-ignored in spell-app)
 * - names carry a PREFIX:  the epic's name, else the worktree's, else `main`;  `add("aaa")` in epic `skillz` is
 *   `skillz-aaa`.  Every method takes the short name or the full one.
 * - writers:  `spell dev agents` (`agents.ts`;  sessions and their helpers, at the same time) and, from P3, the page
 *   server's route.  Every write is under the file's lock (`SRV.FileLock`), and atomic (a temp file renamed over it),
 *   as the review inbox's (`inbox.js`).
 * - an agent leaves the list when it finishes (`done()`):  the list is what's RUNNING;  empty, the file goes
 * - NOT in the record:  the plan doc says what agents DID;  this says what they're doing now
 */
import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import { SRV } from "$/server"

export class AgentList {
  /** the list's file */
  readonly file: string

  /** what every agent's name starts with, before its `-`:  the epic's name, else the worktree's, else `main` */
  readonly prefix: string

  /**
   * The list for checkout `root`.
   * - `epic`:  the epic it's for;  default:  the worktree's name, when `epics/<name>/<name>.plan.html` is there
   */
  constructor(root: string, { epic }: { epic?: string } = {}) {
    const worktree = WORKTREE_ROOT.exec(root)?.[1]
    epic ??= worktree && existsSync(join(root, "epics", worktree, `${worktree}.plan.html`)) ? worktree : undefined
    this.file = epic ? join(root, "epics", epic, LIST_FILE) : join(root, CHECKOUT_LIST_FILE)
    this.prefix = epic ?? worktree ?? "main"
  }

  /** `name` with the prefix:  `aaa` -> `skillz-aaa`;  already prefixed:  as it is. */
  fullName(name: string): string {
    return name.startsWith(`${this.prefix}-`) ? name : `${this.prefix}-${name}`
  }

  /** The agents running, oldest first;  none (no file):  `[]`. */
  get agents(): RunningAgent[] {
    if (!existsSync(this.file)) return []
    return JSON.parse(readFileSync(this.file, "utf8")) as RunningAgent[]
  }

  /**
   * Add agent `name`, doing `task`;  returns its entry (its full name).
   * - throws if an agent of that name is running
   */
  add(name: string, task: string, { status = "active", taskId }: { status?: string; taskId?: string } = {}) {
    checkStatus(status)
    const entry: RunningAgent = { name: this.fullName(name), task, status, started: new Date().toISOString() }
    if (taskId) entry.taskId = taskId
    this.update((agents) => {
      if (agents.some((agent) => agent.name === entry.name)) {
        throw new AgentListError(`AgentList.add():  \`${entry.name}\` is running already;  pick another name`)
      }
      agents.push(entry)
    })
    return entry
  }

  /**
   * Change agent `name`'s entry:  its `status` (`active`, `blocked on <name>`), and / or its `taskId`.
   * - throws if no such agent is running
   */
  set(name: string, change: { status?: string; taskId?: string }): RunningAgent {
    if (change.status) checkStatus(change.status)
    return this.update((agents) => Object.assign(this.find(agents, name), change))
  }

  /**
   * Agent `name` finished:  off the list (the file goes with the last one);  returns its entry.
   * - throws if no such agent is running
   */
  done(name: string): RunningAgent {
    return this.update((agents) => {
      const agent = this.find(agents, name)
      agents.splice(agents.indexOf(agent), 1)
      return agent
    })
  }

  /** `name`'s entry in `agents`;  throws, naming the ones running, if it isn't there. */
  private find(agents: RunningAgent[], name: string): RunningAgent {
    const agent = agents.find((it) => it.name === this.fullName(name))
    if (agent) return agent
    const running = agents.map((it) => it.name).join(", ") || "none"
    throw new AgentListError(`AgentList:  no agent \`${this.fullName(name)}\` is running (running:  ${running})`)
  }

  /**
   * Change the list with `change`, under the file's lock, and write it back atomically;  returns what `change` does.
   * - SIDE EFFECT:  removes the file once the list is empty
   */
  private update<T>(change: (agents: RunningAgent[]) => T): T {
    return SRV.FileLock.run(this.file, () => {
      const agents = this.agents
      const result = change(agents)
      if (agents.length === 0) {
        rmSync(this.file, { force: true })
      } else {
        writeFileSync(`${this.file}.tmp`, `${JSON.stringify(agents, null, 2)}\n`)
        renameSync(`${this.file}.tmp`, this.file)
      }
      return result
    })
  }
}

/** Throws unless `status` is one `AgentList` knows:  `active`, or `blocked on <name>`. */
function checkStatus(status: string) {
  if (!STATUS.test(status)) {
    throw new AgentListError(`AgentList:  status \`${status}\` isn't \`active\` or \`blocked on <name>\``)
  }
}

/** An epic's list, in `epics/<epic>/`. */
export const LIST_FILE = "agents.json"

/** A checkout's list, at its root, when it has no epic. */
export const CHECKOUT_LIST_FILE = ".spell-agents.json"

/** A worktree's root:  `.../.claude/worktrees/<name>`. */
const WORKTREE_ROOT = /[/\\]\.claude[/\\]worktrees[/\\]([^/\\]+)[/\\]?$/

/** The statuses an agent can have. */
const STATUS = /^(active|blocked on \S+)$/

/** One agent on the list. */
export type RunningAgent = {
  /** its full name, prefixed:  `skillz-aaa` */
  name: string
  /** what it does, a sentence or less */
  task: string
  /** `active`, or `blocked on <name>`:  waiting for that agent to finish first (same files) */
  status: string
  /** when it was added, ISO */
  started: string
  /** Claude Code's id for its background task:  what `/bg stop` stops */
  taskId?: string
}

/** A caller's mistake:  a name that's taken or isn't running, a status `AgentList` doesn't know. */
export class AgentListError extends Error {}
AgentListError.prototype.name = "AgentListError"
