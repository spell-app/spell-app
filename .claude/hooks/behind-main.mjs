#!/usr/bin/env node
/**
 * Claude Code's `SessionStart` and `PostToolUse` (`EnterWorktree`) hooks (`.claude/settings.json`):
 * says when the session's worktree is behind `main` (epic `epic-eject` P1):  the base branch, `baseBranch` in the
 * repo's `.epic/config.json5` (`EpicConfig`).
 * - Why:  a worktree runs its OWN copy of the epic tools and page code, as old as its branch.
 *   Nothing told anyone, and windows sat 54-154 commits behind:  new epic features showed up half-done there.
 * - stdin `{ cwd, hook_event_name, tool_input, ... }`.
 *   The folder checked:  `tool_input.path` (an `EnterWorktree` into an existing worktree), else `cwd`.
 * - On `main`, outside git, or not behind:  nothing.
 * - Behind:  a line for Owen (`systemMessage`), and one for Claude (`additionalContext`):  offer the merge.
 * - Always exits 0, within a few seconds:  never blocks a session.
 */
import { spawnSync } from "node:child_process"
import { readFileSync } from "node:fs"

try {
  const input = JSON.parse(readFileSync(0, "utf8") || "{}")
  const dir = input.tool_input?.path ?? input.cwd
  // loaded in here, so a config that won't read never fails the hook
  const { EpicConfig } = await import("../../packages/epics/src/config/EpicConfig.ts")
  const main = dir && EpicConfig.of(dir).baseBranch
  const behind = dir && behindMain(dir, main)
  if (behind) {
    const { branch, count } = behind
    const commits = count === 1 ? "1 commit" : `${count} commits`
    console.log(
      JSON.stringify({
        systemMessage: `⎇ ${branch} is ${commits} behind ${main}:  its epic tools and pages are that old.`,
        hookSpecificOutput: {
          hookEventName: input.hook_event_name ?? "SessionStart",
          additionalContext:
            `This worktree (branch ${branch}) is ${commits} behind ${main}, so its epic tools, skills' helpers and ` +
            `plan-doc pages are that old.  Tell Owen in one line, and offer (AskUserQuestion) to merge ${main} in ` +
            `now:  \`spell dev worktree merge-main\`, "Merge ${main} now (Recommended)" / "Not now".`
        }
      })
    )
  }
} catch {
  // never block a session
}
process.exit(0)

/** How far `dir`'s branch is behind branch `main`, when it's another branch and behind at all;  else `undefined`. */
function behindMain(dir, main) {
  const branch = git(dir, "rev-parse", "--abbrev-ref", "HEAD")
  if (!branch || branch === main || branch === "HEAD") return undefined
  const count = Number(git(dir, "rev-list", "--count", `HEAD..${main}`))
  return count > 0 ? { branch, count } : undefined
}

/** `git -C dir ...args`, trimmed;  `""` on any failure. */
function git(dir, ...args) {
  const run = spawnSync("git", ["-C", dir, ...args], { encoding: "utf8", timeout: 3000 })
  return run.status === 0 ? run.stdout.trim() : ""
}
