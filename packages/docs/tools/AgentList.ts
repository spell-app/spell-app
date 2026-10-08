/**
 * The RUNNING-AGENTS LIST of an epic or a checkout (epic `skillz`):  every background agent a Claude session started
 * (`/bg`, or on its own), by name, while it runs.
 * - the file:
 *   - in an epic:  `epics/<epic>/agents.json`, beside the plan doc (shared content;  git-ignored in the shared repo)
 *   - else:  `<checkout root>/.spell-agents.json` (git-ignored in spell-app)
 * - names carry a PREFIX:  the epic's name, else the worktree's, else `main`;  `add("aaa")` in epic `skillz` is
 *   `skillz-aaa`.  Every method takes the short name or the full one.
 * - writers:  `spell dev agents` (`agents.ts`;  sessions and their helpers, at the same time) and the page server's
 *   route (`agentRoutes.ts`:  Owen's redirect notes from the plan doc's Agents box).  Every write is under the
 *   file's lock (`SRV.FileLock`), and atomic (a temp file renamed over it), as the review inbox's (`inbox.js`).
 * - REDIRECTS:  a note Owen sends a running agent from the page waits in its entry, untold, until a session waiting
 *   on the list (`spell dev agents wait`) passes it on (`SendMessage`) and marks it `told()`
 * - an agent leaves the list when it finishes (`done()`):  the list is what's RUNNING;  empty, the file goes
 * - NOT in the record:  the plan doc says what agents DID;  this says what they're doing now
 */
import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { basename, dirname, join, resolve } from "node:path"

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

  /**
   * The list beside plan doc `file`, `<root>/epics/<epic>/<epic>.plan.html`:  that epic's (the page server's route).
   * - `epics/` is a link into the shared content repo, so every checkout's copy of the doc names the same file
   */
  static forPlanDoc(file: string): AgentList {
    const epic = basename(file, ".plan.html")
    return new AgentList(resolve(dirname(file), "..", ".."), { epic })
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
    // Only the fields given:  `{ status: undefined }` (no `--status` flag) mustn't erase the status.
    const given = Object.fromEntries(Object.entries(change).filter(([, value]) => value !== undefined))
    return this.update((agents) => Object.assign(this.find(agents, name), given))
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

  ////////////////
  // ## Redirects
  ////////////////

  /**
   * Owen's notes for running agents that no session has passed on yet, oldest first:  `{ name, note, at }` each.
   * - a session waiting on the list (`spell dev agents wait`) sends each to its agent, then marks it `told()`
   */
  get untold(): Untold[] {
    return this.agents.flatMap((agent) =>
      (agent.redirects ?? []).filter((it) => !it.told).map(({ note, at }) => ({ name: agent.name, note, at }))
    )
  }

  /**
   * Owen's `note` for agent `name`, from the plan doc's Agents box (`agentRoutes.ts`):  added to its `redirects`,
   * untold;  returns the list after.
   * - async:  the page server waits for the lock with timers, so it keeps serving meanwhile
   * - throws if the note is empty or too long, or no such agent is running
   */
  async redirect(name: string, note: string): Promise<RunningAgent[]> {
    note = note.trim()
    if (!note) throw new AgentListError("AgentList.redirect():  an empty note")
    if (note.length > MAX_NOTE) throw new AgentListError(`AgentList.redirect():  a note over ${MAX_NOTE} characters`)
    return SRV.FileLock.runAsync(this.file, async () => {
      const agents = this.agents
      const agent = this.find(agents, name)
      ;(agent.redirects ??= []).push({ note, at: new Date().toISOString() })
      this.write(agents)
      return agents
    })
  }

  /**
   * Agent `name`'s untold redirects were passed on (`SendMessage`):  each marked `told` now;  returns how many.
   * - throws if no such agent is running
   */
  told(name: string): number {
    return this.update((agents) => {
      const untold = (this.find(agents, name).redirects ?? []).filter((it) => !it.told)
      const now = new Date().toISOString()
      for (const redirect of untold) redirect.told = now
      return untold.length
    })
  }

  ////////////////
  // ## The file
  ////////////////

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
      this.write(agents)
      return result
    })
  }

  /**
   * Write `agents` atomically (a temp file renamed over it);  none:  remove the file.
   * - call it under the lock, or two writers may lose each other's changes
   */
  private write(agents: RunningAgent[]) {
    if (agents.length === 0) {
      rmSync(this.file, { force: true })
    } else {
      writeFileSync(`${this.file}.tmp`, `${JSON.stringify(agents, null, 2)}\n`)
      renameSync(`${this.file}.tmp`, this.file)
    }
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
  /** Owen's notes to steer it, from the plan doc's Agents box, oldest first */
  redirects?: Redirect[]
}

/** One of Owen's notes to a running agent. */
export type Redirect = {
  /** what he typed */
  note: string
  /** when he sent it, ISO */
  at: string
  /** when a session passed it on to the agent, ISO;  none yet:  absent */
  told?: string
}

/** A redirect no session has passed on yet, with its agent's full name (`AgentList.untold`). */
export type Untold = { name: string; note: string; at: string }

/** Longest redirect note:  a few paragraphs. */
const MAX_NOTE = 4000

/** A caller's mistake:  a name that's taken or isn't running, a status `AgentList` doesn't know. */
export class AgentListError extends Error {}
AgentListError.prototype.name = "AgentListError"
