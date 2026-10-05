#!/usr/bin/env node
/**
 * Claude Code's `Stop` hook (`.claude/settings.json`):  after every turn, commit whatever changed in the shared
 * content repo (epic `shared-content`):  `spell dev shared commit`, run in the session's checkout.
 * - stdin `{ session_id, cwd, ... }`.  Exits at once when the shared repo doesn't exist (before the cutover, or a
 *   fresh clone without it).
 * - The commit runs DETACHED, its output appended to `<shared repo>/.git/spell-shared.log`:  the turn never waits
 *   for git, and a failed commit never shows as a failed hook.  The next turn's commit picks up anything left.
 * - Always exits 0.
 */
import { spawn } from "node:child_process"
import { existsSync, openSync, readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

/**
 * The MAIN checkout:  this hook's (`.claude/hooks/` is two folders down), or the one above it when the hook is a
 * worktree's copy (`<main>/.claude/worktrees/<w>`).  The shared repo's `dir` is relative to it.
 */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..").replace(/[\\/]\.claude[\\/]worktrees[\\/][^\\/]+$/, "")

try {
  const { session_id: session, cwd } = JSON.parse(readFileSync(0, "utf8") || "{}")
  const dir = resolve(ROOT, sharedDir())
  if (existsSync(join(dir, ".git"))) {
    const log = openSync(join(dir, ".git", "spell-shared.log"), "a")
    const args = [join(ROOT, "packages/cli/bin/spell.mjs"), "dev", "shared", "commit", "--quiet"]
    if (session) args.push("--session", session)
    spawn(process.execPath, args, { cwd: cwd ?? ROOT, detached: true, stdio: ["ignore", log, log] }).unref()
  }
} catch {
  // never block a turn
}
process.exit(0)

/** The shared repo, relative to `ROOT`:  `"shared": { "dir" }` in the root `package.json`, else `../spell-app-dev`. */
function sharedDir() {
  try {
    return JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).shared?.dir ?? "../spell-app-dev"
  } catch {
    return "../spell-app-dev"
  }
}
