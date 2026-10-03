/**
 * `node --test .claude/hooks/prompt-gate.test.mjs`:  what the `UserPromptSubmit` hook lets through, blocks and
 * renames.
 * - Saved prompts go in a temp folder (`SPELL_PROMPTS_DIR`), never `~/.spell/prompts`;  window entries too
 *   (`SPELL_WINDOWS_DIR`, left empty:  no window).
 */
import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { after, beforeEach, test } from "node:test"
import { fileURLToPath } from "node:url"

import { gate, kebab, otherWorktree, parseCommand } from "./prompt-gate.mjs"

/** The temp folders. */
const prompts = mkdtempSync(join(tmpdir(), "spell-prompts-"))
const windows = mkdtempSync(join(tmpdir(), "spell-windows-"))
process.env.SPELL_PROMPTS_DIR = prompts
process.env.SPELL_WINDOWS_DIR = windows

/** A main checkout, and a worktree in it. */
const ROOT = "/repo"
const WORKTREE = `${ROOT}/.claude/worktrees/other/packages/ui`

/** A package window, and a worktree's window. */
const PACKAGE_WINDOW = { workspaceFile: `${ROOT}/workspaces/ui.code-workspace` }
const OTHER_WINDOW = { workspaceFile: `${ROOT}/workspaces/ongoing/other.code-workspace` }

beforeEach(() => {
  for (const name of readdirSync(prompts)) rmSync(join(prompts, name))
})

after(() => {
  rmSync(prompts, { recursive: true, force: true })
  rmSync(windows, { recursive: true, force: true })
})

////////////////
// ## Parsing
////////////////

test("parseCommand:  name, then the rest", () => {
  assert.deepEqual(parseCommand("/epic Docs-Index plan\nthe docs"), {
    skill: "epic",
    name: "docs-index",
    text: "plan\nthe docs",
  })
  assert.deepEqual(parseCommand(`/epic "Docs Index" x`), { skill: "epic", name: "docs-index", text: "x" })
  assert.deepEqual(parseCommand("/isolate foo"), { skill: "isolate", name: "foo", text: "" })
  assert.deepEqual(parseCommand("/unpark foo"), { skill: "unpark", name: "foo", text: "" })
})

test("parseCommand:  ignores other prompts, no name, `/isolate done`", () => {
  for (const prompt of ["hello", "/epic", "/isolate  ", "/isolate done", "/park foo", "/epicfoo", "/unpark ?", ""]) {
    assert.equal(parseCommand(prompt), null, prompt)
  }
})

test("kebab", () => {
  assert.equal(kebab("Docs Index"), "docs-index")
  assert.equal(kebab("vite+"), "vite-plus")
  assert.equal(kebab("--x--"), "x")
})

////////////////
// ## Worktrees
////////////////

test("otherWorktree:  by cwd, else by window;  never the same name", () => {
  assert.equal(otherWorktree(WORKTREE, null, "new"), "other")
  assert.equal(otherWorktree(WORKTREE, null, "other"), null)
  assert.equal(otherWorktree(ROOT, OTHER_WINDOW, "new"), "other")
  assert.equal(otherWorktree(ROOT, OTHER_WINDOW, "other"), null)
  assert.equal(otherWorktree(ROOT, PACKAGE_WINDOW, "new"), null)
  assert.equal(otherWorktree(ROOT, null, "new"), null)
})

////////////////
// ## The gate
////////////////

test("gate:  renames, unless already named", () => {
  const renamed = gate({ prompt: "/epic foo plan", cwd: ROOT }, PACKAGE_WINDOW)
  assert.deepEqual(renamed, { hookSpecificOutput: { hookEventName: "UserPromptSubmit", sessionTitle: "foo" } })
  assert.equal(gate({ prompt: "/epic foo plan", cwd: ROOT, session_title: "foo" }, PACKAGE_WINDOW), null)
  assert.equal(gate({ prompt: "fix the bug", cwd: ROOT }, PACKAGE_WINDOW), null)
})

test("gate:  plan mode blocks, saving the text first", () => {
  const out = gate({ prompt: "/epic foo the plan\nline 2", cwd: ROOT, permission_mode: "plan" }, PACKAGE_WINDOW)
  assert.equal(out.decision, "block")
  assert.match(out.reason, /Plan mode is on/)
  assert.match(out.reason, /the plan\nline 2/)
  assert.equal(readFileSync(join(prompts, "foo.md"), "utf8"), "the plan\nline 2\n")
})

test("gate:  plan mode, no text:  blocks, saves nothing", () => {
  const out = gate({ prompt: "/isolate foo", cwd: ROOT, permission_mode: "plan" }, PACKAGE_WINDOW)
  assert.equal(out.decision, "block")
  assert.equal(existsSync(join(prompts, "foo.md")), false)
})

test("gate:  another worktree blocks, by cwd or window, saving the text", () => {
  const byCwd = gate({ prompt: "/epic foo do it", cwd: WORKTREE }, null)
  assert.equal(byCwd.decision, "block")
  assert.match(byCwd.reason, /worktree `other`/)
  const byWindow = gate({ prompt: "/isolate foo", cwd: ROOT }, OTHER_WINDOW)
  assert.equal(byWindow.decision, "block")
  assert.equal(readFileSync(join(prompts, "foo.md"), "utf8"), "do it\n")
})

test("gate:  re-entering the same worktree, and `/unpark`, aren't blocked", () => {
  assert.equal(gate({ prompt: "/isolate other", cwd: WORKTREE }, null).decision, undefined)
  assert.equal(gate({ prompt: "/unpark foo", cwd: WORKTREE }, OTHER_WINDOW).decision, undefined)
})

test("gate:  never loses an older saved text", () => {
  gate({ prompt: "/epic foo first", cwd: ROOT, permission_mode: "plan" }, null)
  gate({ prompt: "/epic foo second", cwd: ROOT, permission_mode: "plan" }, null)
  const files = readdirSync(prompts).sort()
  assert.equal(files.length, 2)
  assert.equal(readFileSync(join(prompts, "foo.md"), "utf8"), "second\n")
  const older = files.find((name) => name !== "foo.md")
  assert.equal(readFileSync(join(prompts, older), "utf8"), "first\n")
})

////////////////
// ## As a hook
////////////////

test("hook:  stdin in, JSON out;  bad input exits 0, silent", () => {
  const hook = join(dirname(fileURLToPath(import.meta.url)), "prompt-gate.mjs")
  const input = JSON.stringify({ prompt: "/isolate foo", cwd: ROOT, session_id: "x" })
  const ok = spawnSync(process.execPath, [hook], { input, encoding: "utf8" })
  assert.equal(ok.status, 0)
  assert.equal(JSON.parse(ok.stdout).hookSpecificOutput.sessionTitle, "foo")
  const bad = spawnSync(process.execPath, [hook], { input: "{not json", encoding: "utf8" })
  assert.equal(bad.status, 0)
  assert.equal(bad.stdout, "")
})
