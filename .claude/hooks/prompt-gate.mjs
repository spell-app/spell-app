#!/usr/bin/env node
/**
 * Claude Code's `UserPromptSubmit` hook (`.claude/settings.json`):  checks `/isolate`, `/epic` and `/unpark`
 * prompts BEFORE Claude reads them.  Every other prompt passes untouched.
 * - The rules are the epic code's, `PromptGate` (`packages/epics/src/command/PromptGate.ts`):  what it refuses, how
 *   it renames the session, what it saves.  This hook is its thin caller (epic `epic-eject` P5).
 * - stdin `{ prompt, cwd, session_id, session_title, permission_mode, ... }`;  stdout `PromptGate.gate()`'s answer,
 *   JSON, or nothing to let the prompt through.
 * - Plain `node`:  `PromptGate.ts` loads with its types stripped, before a worktree's `yarn install`.
 * - Never fails a prompt:  any error exits 0, the prompt untouched.
 * - Its tests:  `tests/epics/src/command/PromptGate.test.ts`, which runs this file as the hook too.
 */
import { readFileSync } from "node:fs"

try {
  const input = JSON.parse(readFileSync(0, "utf8") || "{}")
  // loaded in here, so a gate that won't load never fails the prompt
  const { PromptGate } = await import("../../packages/epics/src/command/PromptGate.ts")
  const { Window } = await import("../../scripts/window.mjs")
  const output = PromptGate.gate(input, Window.current())
  if (output) console.log(JSON.stringify(output))
} catch (error) {
  console.error(`prompt-gate hook:  ${error.message}`)
}
