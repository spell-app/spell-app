#!/usr/bin/env node
/**
 * Claude Code's `Stop` hook (`.claude/settings.json`):  move a session to another window once its turn ends:
 * a worktree's, or back from it.
 * - `/isolate` arms it with `node scripts/window.mjs handoff <name>` (`--back`:  no skill uses it now), which
 *   writes the move to `<registry>/handoffs/<session id>.json`.  See `scripts/window.mjs`, "A worktree's window".
 * - stdin `{ session_id, transcript_path, ... }`.  No pending move for this session (every other turn):  exits at once.
 * - Else renames the record (`<session id>.running.json`, so the next turn won't move it again) and starts
 *   `window.mjs resume` on it, DETACHED, its output in `<registry>/handoffs/<session id>.log`.  Why detached:
 *   `resume` closes this session's old tab or window, which ends the `claude` process this hook runs under.
 * - Never fails the turn:  every error exits 0 (it's logged, or written to stderr).
 */
import { spawn } from "node:child_process"
import { existsSync, openSync, readFileSync, renameSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { Window } from "../../scripts/window.mjs"

try {
  const { session_id: sessionId, transcript_path: transcript } = JSON.parse(readFileSync(0, "utf8") || "{}")
  const file = sessionId && Window.handoffFile(sessionId)
  if (file && existsSync(file)) {
    const running = join(Window.handoffs, `${sessionId}.running.json`)
    renameSync(file, running)
    const script = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "scripts", "window.mjs")
    const args = [script, "resume", running]
    for (const title of sessionTitles(transcript)) args.push("--title", title)
    const log = openSync(join(Window.handoffs, `${sessionId}.log`), "a", 0o600)
    spawn(process.execPath, args, { detached: true, stdio: ["ignore", log, log] }).unref()
  }
} catch (error) {
  console.error(`handoff hook:  ${error.message}`)
}

/**
 * The titles the session's tab may show, most likely first:  the last `/rename` (`custom-title`, which the prompt
 * hook `prompt-gate.mjs` sets on `/isolate <name>`), then Claude's own (`ai-title`);  `[]` if none.
 * - both, since the tab's label may lag a rename
 */
function sessionTitles(transcript) {
  if (!transcript || !existsSync(transcript)) return []
  let custom = null
  let ai = null
  for (const line of readFileSync(transcript, "utf8").split("\n")) {
    if (!line.includes('"custom-title"') && !line.includes('"ai-title"')) continue
    try {
      const entry = JSON.parse(line)
      if (entry.type === "custom-title" && entry.customTitle) custom = entry.customTitle
      if (entry.type === "ai-title" && entry.aiTitle) ai = entry.aiTitle
    } catch {
      // a half-written last line
    }
  }
  return [...new Set([custom, ai].filter(Boolean))]
}
