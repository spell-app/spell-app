import { existsSync, readFileSync, statSync } from "node:fs"
import { basename, dirname, join, resolve } from "node:path"

import type { Checkout } from "./server.types"

/**
 * The git checkout `path` is in:  its root, the MAIN checkout's root, and the worktree's name in a worktree;
 * `undefined` outside git.
 *
 * ```ts
 * SRV.checkoutOf("/repo/packages/ui")                    // => { root: "/repo", main: "/repo" }
 * SRV.checkoutOf("/repo/.claude/worktrees/seo/epics")    // => { root: ".../seo", main: "/repo", worktree: "seo" }
 * ```
 *
 * - Read from the disk, as git finds them, with no `git` run:
 *   - the nearest `.git` at or above `path`:  a FOLDER in the main checkout,
 *     a FILE in a worktree (`gitdir: <main>/.git/worktrees/<id>`)
 *   - a worktree's main checkout:  the folder holding git's common dir (that gitdir's `commondir`),
 *     the same answer as `git rev-parse --git-common-dir`
 *   - a `.git` file with no `commondir` (a submodule's):  a checkout of its own
 * - `path` itself needn't exist:  the folders above it are looked at
 * - `worktree`:  the worktree folder's name, which is how the main page server serves it (`/worktrees/<name>/`)
 * - paths as found, links not resolved:  a `cwd` inside a shared-content link (`epics/`) is still this checkout's
 * - NEVER throws:  a `.git` file it can't read counts as a checkout of its own
 * - Its position:  imports only node's own modules,
 *   so plain `node` loads it by path, types stripped (epics' `EpicConfig`, which the hooks and window script load)
 *   - NEVER an alias, an `enum` or a parameter property
 */
export function checkoutOf(path: string): Checkout | undefined {
  for (let dir = resolve(path); ; dir = dirname(dir)) {
    const git = join(dir, ".git")
    const stat = statSync(git, { throwIfNoEntry: false })
    if (stat?.isDirectory()) return { root: dir, main: dir }
    if (stat?.isFile()) return worktreeAt(dir, git) ?? { root: dir, main: dir }
    if (dirname(dir) === dir) return undefined
  }
}

/** Checkout `root`, whose `.git` is the file `git`, as a worktree of a main checkout;  `undefined` when it isn't one. */
function worktreeAt(root: string, git: string): Checkout | undefined {
  try {
    const gitdir = /^gitdir:\s*(.+)$/m.exec(readFileSync(git, "utf8"))?.[1]?.trim()
    if (!gitdir) return undefined
    const own = resolve(root, gitdir)
    const commondir = join(own, "commondir")
    if (!existsSync(commondir)) return undefined
    const common = resolve(own, readFileSync(commondir, "utf8").trim())
    return { root, main: dirname(common), worktree: basename(root) }
  } catch {
    return undefined
  }
}
