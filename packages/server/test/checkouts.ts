import { mkdirSync, writeFileSync } from "node:fs"
import { basename, join } from "node:path"

/**
 * Make folder `main` look like a main git checkout to `SRV.checkoutOf()`:  a `.git` folder, nothing in it.
 * - no `git` run:  enough for code that finds checkouts the way `checkoutOf()` does;  returns `main`
 */
export function fakeMainCheckout(main: string): string {
  mkdirSync(join(main, ".git", "worktrees"), { recursive: true })
  return main
}

/**
 * Make folder `folder` look like a worktree of main checkout `main`, as `git worktree add` leaves one:
 * its `.git` FILE pointing at `<main>/.git/worktrees/<name>`, whose `commondir` leads back to `<main>/.git`.
 * - `main` is made a main checkout too (`fakeMainCheckout()`);  returns `folder`
 */
export function fakeWorktree(main: string, folder: string): string {
  const gitdir = join(fakeMainCheckout(main), ".git", "worktrees", basename(folder))
  mkdirSync(gitdir, { recursive: true })
  writeFileSync(join(gitdir, "commondir"), "../..\n")
  mkdirSync(folder, { recursive: true })
  writeFileSync(join(folder, ".git"), `gitdir: ${gitdir}\n`)
  return folder
}
