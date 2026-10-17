#!/usr/bin/env node
/**
 * Claude Code's `Stop` hook (`.claude/settings.json`):  after every turn, commit whatever changed in the shared
 * content repo (epic `shared-content`):  `epic shared commit`, run in the session's checkout.
 * - stdin `{ session_id, cwd, ... }`.  Exits at once when the shared repo doesn't exist (before the cutover, or a
 *   fresh clone without it).
 * - The commit runs DETACHED, its output appended to `<shared repo>/.git/spell-shared.log`:  the turn never waits
 *   for git, and a failed commit never shows as a failed hook.  The next turn's commit picks up anything left.
 * - Always exits 0.
 */
import { spawn } from "node:child_process"
import { existsSync, openSync, readFileSync } from "node:fs"
import { join } from "node:path"

try {
  const { session_id: session, cwd } = JSON.parse(readFileSync(0, "utf8") || "{}")
  // the MAIN checkout's config, from this hook's checkout (a worktree's copy too):  the shared repo is its
  // `contentFolder`.  Loaded in here, so a config that won't read never fails the hook
  const { EpicConfig } = await import("../../packages/epics/src/config/EpicConfig.ts")
  const config = EpicConfig.of(import.meta.dirname)
  const main = config.main
  const dir = config.contentFolder
  if (existsSync(join(dir, ".git"))) {
    const log = openSync(join(dir, ".git", "spell-shared.log"), "a")
    // the MAIN checkout's `epic`:  it has its packages installed, whichever checkout's turn ended
    const args = [join(main, "packages/cli/bin/epic.mjs"), "shared", "commit", "--quiet"]
    if (session) args.push("--session", session)
    spawn(process.execPath, args, { cwd: cwd ?? main, detached: true, stdio: ["ignore", log, log] }).unref()
  }
} catch {
  // never block a turn
}
process.exit(0)
