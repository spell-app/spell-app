#!/usr/bin/env node
/**
 * Claude Code's `WorktreeCreate` / `WorktreeRemove` hooks (`.claude/settings.json`):  `worktree.mjs create|remove`,
 * the hook's JSON on stdin.  They replace Claude's own git worktree logic, for `EnterWorktree`, `claude -w` and
 * agents' `isolation: "worktree"`.
 *
 * ## Why a hook
 * - A session in a worktree Claude made itself is saved under the WORKTREE's folder, so it drops out of the VS Code
 *   Claude panel's list (which shows one folder's sessions) and is orphaned if it never leaves.  A session in a
 *   worktree a hook made stays saved where it started:  the repo root, which every window lists
 *   (`scripts/window.mjs`).  Checked with CLI 2.1.287.
 * - Names agree:  worktree `.claude/worktrees/<name>`, branch `<name>` (Claude's own adds `worktree-`).
 * - Branches from local `main` (unpushed work included), not `origin/main`.
 *
 * ## create
 * - stdin `{ name, cwd, session_id, transcript_path, ... }`  (CLI 2.1.287:  no branch or base field, whatever the
 *   docs say).  Prints the worktree's absolute path on stdout, the ONLY thing on stdout;  progress goes to stderr.
 * - An agent's worktree (`isolation: "worktree"`, name `agent-<id>`) started by a session in worktree `<owner>` (an
 *   epic's) is named `<owner>-agent-<id>`, worktree and branch:  `git worktree list` says whose it is, and `remove`
 *   and `/isolate done` know its work is safe once it's in `<owner>`'s branch (Owen, 2026-10-05).
 * - Reuses `.claude/worktrees/<name>` when it's already a worktree, and branch `<name>` when it exists.
 * - Then links the shared content in (`spell dev shared link`, epic `shared-content`), when the shared repo exists:
 *   a failure there is a warning, never a failed hook
 *
 * ## remove
 * - stdin `{ worktree_path, cwd, ... }`.  Runs on `ExitWorktree` `remove` (only with `discard_changes: true`), at
 *   session exit, and when an agent finishes.
 * - Never loses work:  a worktree with uncommitted changes, or whose branch has commits `main` lacks, is KEPT
 *   (exit 1 with the reason;  Claude shows stderr).  Otherwise removes the worktree and deletes its branch.
 * - An agent's `<owner>-agent-<id>` counts as merged when its commits are in `main` OR in branch `<owner>`.
 */
import { execFileSync } from "node:child_process"
import { existsSync, readFileSync, realpathSync } from "node:fs"
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path"

/** The branch new worktrees start from. */
const BASE = "main"

/** Allowed worktree / branch names. */
const NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/

/** Claude's name for an agent's worktree (`isolation: "worktree"`). */
const AGENT = /^agent-[0-9a-f]+$/

/** An agent's worktree once prefixed:  `<owner>-agent-<id>`;  `$1` is the owner. */
const OWNED_AGENT = /^(.+)-agent-[0-9a-f]+$/

/****************
 * ### `Worktree`
 ****************/
class Worktree {
  /** `git <args>` in `cwd`;  its trimmed stdout.  Git's own stderr goes to ours. */
  static git(cwd, ...args) {
    return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", 2] }).trim()
  }

  /** The main checkout's folder, from anywhere inside it or one of its worktrees. */
  static root(cwd) {
    return dirname(Worktree.git(cwd, "rev-parse", "--path-format=absolute", "--git-common-dir"))
  }

  /** Whether `branch` exists. */
  static hasBranch(root, branch) {
    try {
      Worktree.git(root, "rev-parse", "--verify", "--quiet", `refs/heads/${branch}`)
      return true
    } catch {
      return false
    }
  }

  /** The worktree `cwd` is in (`.claude/worktrees/<name>/...`):  its name, else `""` (the main checkout). */
  static owner(root, cwd) {
    // real paths:  git gives `root` with symlinks resolved (`/tmp` -> `/private/tmp`)
    const rest = relative(join(root, ".claude", "worktrees"), realpathSync(cwd))
    return rest && !rest.startsWith("..") && !isAbsolute(rest) ? rest.split(sep)[0] : ""
  }

  /** `create`:  make (or reuse) `.claude/worktrees/<name>` on branch `<name>`;  returns its path. */
  static create({ name, cwd }) {
    if (!NAME.test(name ?? "")) throw new Error(`worktree name must match ${NAME}:  got "${name}"`)
    const root = Worktree.root(cwd)
    const owner = AGENT.test(name) ? Worktree.owner(root, cwd) : ""
    if (owner) name = `${owner}-${name}`
    const path = join(root, ".claude", "worktrees", name)
    if (existsSync(join(path, ".git"))) {
      console.error(`worktree hook:  reusing ${path}`)
      return path
    }
    const args = Worktree.hasBranch(root, name) ? [path, name] : ["-b", name, path, BASE]
    console.error(`worktree hook:  git worktree add ${args.join(" ")}`)
    Worktree.git(root, "worktree", "add", "--quiet", ...args)
    Worktree.linkShared(root, path)
    return path
  }

  /**
   * Link the shared content into worktree `path`:  the main checkout's `spell dev shared link`, run in the worktree.
   * - only when the shared repo exists (`"shared": { "dir" }` in the root `package.json`, default
   *   `../spell-app-dev`):  before the cutover there's nothing to link
   * - its output goes to stderr (stdout is the worktree's path);  a failure is a warning
   */
  static linkShared(root, path) {
    let dir = "../spell-app-dev"
    try {
      dir = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).shared?.dir ?? dir
    } catch {
      // no manifest:  the default
    }
    if (!existsSync(join(resolve(root, dir), ".git"))) return
    try {
      execFileSync(process.execPath, [join(root, "packages/cli/bin/spell.mjs"), "dev", "shared", "link"], {
        cwd: path,
        stdio: ["ignore", 2, 2]
      })
    } catch (error) {
      console.error(`worktree hook:  shared content not linked (${error.message.split("\n")[0]});  run \`spell dev shared link\``)
    }
  }

  /**
   * The branch all of `branch`'s commits are in:  `main`, else (an agent's `<owner>-agent-<id>`) `<owner>`;  else
   * `""`.
   */
  static mergedInto(root, branch) {
    const owner = branch.match(OWNED_AGENT)?.[1]
    const intos = [BASE, ...(owner && Worktree.hasBranch(root, owner) ? [owner] : [])]
    return intos.find((into) => Worktree.git(root, "rev-list", "--count", `${into}..${branch}`) === "0") ?? ""
  }

  /** `remove`:  remove the worktree and its branch, unless that would lose work;  returns what happened. */
  static remove({ worktree_path: path }) {
    path = resolve(path)
    if (!existsSync(path)) return `${path} is already gone`
    const root = Worktree.root(path)
    const branch = Worktree.git(path, "branch", "--show-current")
    if (Worktree.git(path, "status", "--porcelain")) throw new Error(`kept ${path}:  it has uncommitted changes`)
    const into = branch && Worktree.mergedInto(root, branch)
    if (branch && !into) {
      const owner = branch.match(OWNED_AGENT)?.[1]
      throw new Error(`kept ${path}:  branch ${branch} has commits ${owner ?? BASE} doesn't;  merge it first`)
    }
    Worktree.git(root, "worktree", "remove", path)
    // `-d` checks against `main` only:  in its owner's branch alone (checked above) needs `-D`
    if (branch) Worktree.git(root, "branch", into === BASE ? "-d" : "-D", branch)
    return `removed ${path}${branch ? ` and branch ${branch}` : ""}`
  }
}

let input = ""
for await (const chunk of process.stdin) input += chunk
try {
  const data = JSON.parse(input)
  const command = process.argv[2]
  if (command === "create") console.log(Worktree.create(data))
  else if (command === "remove") console.error(`worktree hook:  ${Worktree.remove(data)}`)
  else throw new Error(`usage:  worktree.mjs create|remove  (got "${command}")`)
} catch (error) {
  console.error(`worktree hook:  ${error.message}`)
  process.exit(1)
}
