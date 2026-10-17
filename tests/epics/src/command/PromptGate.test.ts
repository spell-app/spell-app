/**
 * `PromptGate`:  what the `UserPromptSubmit` hook (`.claude/hooks/prompt-gate.mjs`) lets through, blocks and
 * renames;  and the hook itself, run as Claude Code runs it.
 * - Saved prompts go in a temp folder (`SPELL_PROMPTS_DIR`), never `~/.spell/prompts`;  window entries too
 *   (`SPELL_WINDOWS_DIR`, left empty:  no window).
 * - Was `.claude/hooks/prompt-gate.test.mjs` (`node --test`), until the gate moved into the epic code (epic
 *   `epic-eject` P5).
 */
import { spawnSync } from "node:child_process"
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { afterAll, beforeEach, describe, expect, test } from "vite-plus/test"

import { PromptGate, type GateAnswer, type GateInput, type GateWindow } from "$/epics/command/PromptGate"

/** The temp folders. */
const prompts = mkdtempSync(join(tmpdir(), "spell-prompts-"))
const windows = mkdtempSync(join(tmpdir(), "spell-windows-"))
process.env.SPELL_PROMPTS_DIR = prompts
process.env.SPELL_WINDOWS_DIR = windows

/** The hook, as `.claude/settings.json` runs it. */
const HOOK = resolve(import.meta.dirname, "../../../../.claude/hooks/prompt-gate.mjs")

/** A main checkout, and a worktree in it. */
const ROOT = "/repo"
const WORKTREE = `${ROOT}/.claude/worktrees/other/packages/ui`

/** A package window, and a worktree's window. */
const PACKAGE_WINDOW = { workspaceFile: `${ROOT}/workspaces/ui.code-workspace` }
const OTHER_WINDOW = { workspaceFile: `${ROOT}/workspaces/ongoing/other.code-workspace` }

beforeEach(() => {
  for (const name of readdirSync(prompts)) rmSync(join(prompts, name))
})

afterAll(() => {
  rmSync(prompts, { recursive: true, force: true })
  rmSync(windows, { recursive: true, force: true })
})

/** `PromptGate.gate()`, its answer loosely typed for the checks. */
function gate(input: GateInput, window: GateWindow | null): Answer {
  return PromptGate.gate(input, window) as Answer
}

/** Either shape of `GateAnswer`, every field optional. */
type Answer =
  | (Partial<Extract<GateAnswer, { decision: "block" }>> & {
      hookSpecificOutput?: { sessionTitle?: string; additionalContext?: string }
    })
  | null

describe("parseCommand()", () => {
  test("name, then the rest", () => {
    expect(PromptGate.parseCommand("/epic Docs-Index plan\nthe docs")).toEqual({
      skill: "epic",
      name: "docs-index",
      text: "plan\nthe docs",
      color: null
    })
    expect(PromptGate.parseCommand(`/epic "Docs Index" x`)).toEqual({
      skill: "epic",
      name: "docs-index",
      text: "x",
      color: null
    })
    expect(PromptGate.parseCommand("/isolate foo")).toEqual({ skill: "isolate", name: "foo", text: "", color: null })
    expect(PromptGate.parseCommand("/unpark foo")).toEqual({ skill: "unpark", name: "foo", text: "", color: null })
    expect(PromptGate.parseCommand("/epic resume Foo")).toEqual({
      skill: "epic resume",
      name: "foo",
      text: "",
      color: null
    })
  })

  test("ignores other prompts, no name, `/isolate done`, `/epic done`, `/epic review`, `/epic resume` alone", () => {
    const ignored = [
      "hello",
      "/epic",
      "/isolate  ",
      "/isolate done",
      "/epic done",
      "/epic Done",
      "/park foo",
      "/epicfoo"
    ]
    ignored.push("/unpark ?", "")
    ignored.push("/epic review", "/epic review seo", "/epic Review seo", "/epic resume", "/epic resume ?")
    // this session's epic:  a phase added or started
    ignored.push("/epic phase", "/epic phase J1 J5, t3\nfrom these", "/epic start P2", "/epic start J3 J4 T6 go")
    for (const prompt of ignored) expect(PromptGate.parseCommand(prompt), prompt).toBeNull()
  })

  test("a look right after the name is the window's, not the text;  `/epic color` passes", () => {
    expect(PromptGate.parseCommand("/epic new-thing -purple plan this")).toEqual({
      skill: "epic",
      name: "new-thing",
      text: "plan this",
      color: "purple"
    })
    expect(PromptGate.parseCommand("/isolate x -Teal")?.color).toBe("teal")
    // not a look:  part of the text
    expect(PromptGate.parseCommand("/epic x -verbose")).toEqual({
      skill: "epic",
      name: "x",
      text: "-verbose",
      color: null
    })
    expect(PromptGate.parseCommand("/epic color teal")).toBeNull()
    expect(PromptGate.parseCommand("/epic future foo-bar blah blah")).toEqual({
      skill: "epic future",
      name: "foo-bar",
      text: "blah blah",
      color: null
    })
  })

  test("kebab()", () => {
    expect(PromptGate.kebab("Docs Index")).toBe("docs-index")
    expect(PromptGate.kebab("vite+")).toBe("vite-plus")
    expect(PromptGate.kebab("--x--")).toBe("x")
  })
})

describe("otherWorktree()", () => {
  test("by cwd, else by window;  never the same name", () => {
    expect(PromptGate.otherWorktree(WORKTREE, null, "new")).toBe("other")
    expect(PromptGate.otherWorktree(WORKTREE, null, "other")).toBeNull()
    expect(PromptGate.otherWorktree(ROOT, OTHER_WINDOW, "new")).toBe("other")
    expect(PromptGate.otherWorktree(ROOT, OTHER_WINDOW, "other")).toBeNull()
    expect(PromptGate.otherWorktree(ROOT, PACKAGE_WINDOW, "new")).toBeNull()
    expect(PromptGate.otherWorktree(ROOT, null, "new")).toBeNull()
  })
})

describe("gate()", () => {
  test("renames, unless already named", () => {
    expect(gate({ prompt: "/epic foo plan", cwd: ROOT }, PACKAGE_WINDOW)).toEqual({
      hookSpecificOutput: { hookEventName: "UserPromptSubmit", sessionTitle: "🚧 foo" }
    })
    expect(gate({ prompt: "/epic foo plan", cwd: ROOT, session_title: "🚧 foo" }, PACKAGE_WINDOW)).toBeNull()
    // done (✅) or plain:  back to 🚧
    for (const session_title of ["✅ foo", "foo"])
      expect(
        gate({ prompt: "/isolate foo", cwd: ROOT, session_title }, PACKAGE_WINDOW)?.hookSpecificOutput?.sessionTitle
      ).toBe("🚧 foo")
    // a future epic:  📅, even in plan mode or another worktree
    const future = gate({ prompt: "/epic future bar an idea", cwd: ROOT, permission_mode: "plan" }, PACKAGE_WINDOW)
    expect(future?.hookSpecificOutput?.sessionTitle).toBe("📅 bar")
    expect(gate({ prompt: "fix the bug", cwd: ROOT }, PACKAGE_WINDOW)).toBeNull()
  })

  test("plan mode blocks, saving the text first", () => {
    const out = gate({ prompt: "/epic foo the plan\nline 2", cwd: ROOT, permission_mode: "plan" }, PACKAGE_WINDOW)
    expect(out?.decision).toBe("block")
    expect(out?.reason).toMatch(/Plan mode is on/)
    expect(out?.reason).toMatch(/the plan\nline 2/)
    expect(readFileSync(join(prompts, "foo.md"), "utf8")).toBe("the plan\nline 2\n")
  })

  test("plan mode, no text:  blocks, saves nothing", () => {
    const out = gate({ prompt: "/isolate foo", cwd: ROOT, permission_mode: "plan" }, PACKAGE_WINDOW)
    expect(out?.decision).toBe("block")
    expect(existsSync(join(prompts, "foo.md"))).toBe(false)
  })

  test("another worktree blocks `/isolate`, by cwd or window, saving the text", () => {
    const byCwd = gate({ prompt: "/isolate foo do it", cwd: WORKTREE }, null)
    expect(byCwd?.decision).toBe("block")
    expect(byCwd?.reason).toMatch(/worktree `other`/)
    const byWindow = gate({ prompt: "/isolate foo", cwd: ROOT }, OTHER_WINDOW)
    expect(byWindow?.decision).toBe("block")
    expect(readFileSync(join(prompts, "foo.md"), "utf8")).toBe("do it\n")
  })

  test("`/epic <name>` in another worktree:  through, not renamed, a note to ask;  text saved", () => {
    const places: [string, GateWindow | null][] = [
      [WORKTREE, null],
      [ROOT, OTHER_WINDOW]
    ]
    for (const [cwd, window] of places) {
      const out = gate({ prompt: "/epic foo do it", cwd }, window)
      expect(out?.decision).toBeUndefined()
      expect(out?.hookSpecificOutput?.sessionTitle).toBeUndefined()
      expect(out?.hookSpecificOutput?.additionalContext).toMatch(/worktree `other`.*open a new window for epic `foo`/s)
      expect(out?.hookSpecificOutput?.additionalContext).toMatch(/saved in .*foo\.md/)
    }
    expect(readFileSync(join(prompts, "foo.md"), "utf8")).toBe("do it\n")
    // no text:  nothing saved, nothing said about it
    rmSync(join(prompts, "foo.md"))
    expect(gate({ prompt: "/epic foo", cwd: WORKTREE }, null)?.hookSpecificOutput?.additionalContext).not.toMatch(
      /saved/
    )
    expect(existsSync(join(prompts, "foo.md"))).toBe(false)
  })

  test("re-entering the same worktree, `/unpark` and `/epic resume` aren't blocked", () => {
    expect(gate({ prompt: "/isolate other", cwd: WORKTREE }, null)?.decision).toBeUndefined()
    expect(gate({ prompt: "/unpark foo", cwd: WORKTREE }, OTHER_WINDOW)?.decision).toBeUndefined()
    const resume = gate({ prompt: "/epic resume foo", cwd: WORKTREE, permission_mode: "plan" }, OTHER_WINDOW)
    expect(resume?.hookSpecificOutput?.sessionTitle).toBe("🚧 foo")
  })

  test("never loses an older saved text", () => {
    gate({ prompt: "/epic foo first", cwd: ROOT, permission_mode: "plan" }, null)
    gate({ prompt: "/epic foo second", cwd: ROOT, permission_mode: "plan" }, null)
    const files = readdirSync(prompts).sort()
    expect(files.length).toBe(2)
    expect(readFileSync(join(prompts, "foo.md"), "utf8")).toBe("second\n")
    const older = files.find((name) => name !== "foo.md")!
    expect(readFileSync(join(prompts, older), "utf8")).toBe("first\n")
  })

  test("`/epic review <name>` in a session titled for ANOTHER epic is refused (airplane P12, Q10 B)", () => {
    const review = (prompt: string, session_title: string | undefined) =>
      gate({ prompt, cwd: ROOT, session_title }, PACKAGE_WINDOW)
    const refused = review("/epic review seo", "🚧 airplane")
    expect(refused?.decision).toBe("block")
    expect(refused?.reason).toMatch(/titled for epic `airplane`, not `seo`/)
    expect(review("/epic review seo", "⏸️ airplane")?.decision).toBe("block")
    // its own epic, `/epic review` alone, an untitled or main session:  through
    expect(review("/epic review airplane", "🚧 airplane")).toBeNull()
    expect(review("/epic review", "🚧 airplane")).toBeNull()
    expect(review("/epic review seo", undefined)).toBeNull()
    expect(review("/epic review seo", "Claude performance across top 10 languages")).toBeNull()
    expect(PromptGate.epicOfTitle("✅ output-targets")).toBe("output-targets")
    expect(PromptGate.epicOfTitle("main work")).toBeNull()
  })

  test("`/epic future <name>` in a session titled for ANOTHER epic leaves its title alone (epic-workflow I5)", () => {
    const future = (session_title: string | undefined) =>
      gate({ prompt: "/epic future wasm an idea", cwd: ROOT, session_title }, PACKAGE_WINDOW)
    expect(future("🚧 epic-workflow")).toBeNull()
    expect(future(undefined)?.hookSpecificOutput?.sessionTitle).toBe("📅 wasm")
    expect(future("some main work")?.hookSpecificOutput?.sessionTitle).toBe("📅 wasm")
  })

  test("`/epic request <epic> <rN>` renames the session for the epic, never blocks;  refused in another epic's", () => {
    expect(PromptGate.parseCommand("/epic request epic-workflow r3")).toEqual({
      skill: "epic request",
      name: "epic-workflow",
      text: "r3",
      color: null
    })
    expect(PromptGate.parseCommand("/epic request")).toBeNull()
    const asked = (prompt: string, session_title: string | undefined, extra: GateInput = {}) =>
      gate({ prompt, cwd: ROOT, session_title, ...extra }, OTHER_WINDOW)
    // a launched session (untitled), even in plan mode or another worktree's window:  only renamed
    const launched = asked("/epic request tooling r3", undefined, { permission_mode: "plan" })
    expect(launched?.hookSpecificOutput?.sessionTitle).toBe("🚧 tooling")
    expect(asked("/epic request tooling r3", "🚧 tooling")).toBeNull()
    const refused = asked("/epic request tooling r3", "🚧 python")
    expect(refused?.decision).toBe("block")
    expect(refused?.reason).toMatch(/titled for epic `python`, not `tooling`:  run `\/epic request tooling`/)
  })
})

describe("dropDoneTitle()", () => {
  test("a queued ✅ title goes when the work reopens;  any other queued title stays", () => {
    const dir = mkdtempSync(join(tmpdir(), "titles-"))
    process.env.SPELL_SESSION_TITLES_DIR = dir
    try {
      writeFileSync(join(dir, "s1"), "✅ seo")
      writeFileSync(join(dir, "s2"), "seo")
      PromptGate.dropDoneTitle("s1")
      PromptGate.dropDoneTitle("s2")
      PromptGate.dropDoneTitle("nope")
      expect(existsSync(join(dir, "s1"))).toBe(false)
      expect(readFileSync(join(dir, "s2"), "utf8")).toBe("seo")
    } finally {
      delete process.env.SPELL_SESSION_TITLES_DIR
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe("the hook", () => {
  test("plain node:  stdin in, JSON out;  bad input exits 0, silent", () => {
    const input = JSON.stringify({ prompt: "/isolate foo", cwd: ROOT, session_id: "x" })
    // no windows:  the window this test runs in (a worktree's, say) must not block the prompt
    const empty = mkdtempSync(join(tmpdir(), "windows-"))
    const env = { ...process.env, SPELL_WINDOWS_DIR: empty }
    const ok = spawnSync(process.execPath, [HOOK], { input, encoding: "utf8", env })
    rmSync(empty, { recursive: true, force: true })
    expect(ok.status).toBe(0)
    expect(JSON.parse(ok.stdout).hookSpecificOutput.sessionTitle).toBe("🚧 foo")
    const bad = spawnSync(process.execPath, [HOOK], { input: "{not json", encoding: "utf8" })
    expect(bad.status).toBe(0)
    expect(bad.stdout).toBe("")
  })
})
