import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { join } from "path"
import { afterAll, describe, expect, test } from "vite-plus/test"

import { CLI } from "$/cli"

/** A fake `~/.claude`, and a folder that is NOT a git checkout to list sessions from. */
const HOME = mkdtempSync(join(tmpdir(), "claude-home-"))
const REPO = realpathSync(mkdtempSync(join(tmpdir(), "repo-")))
afterAll(() => {
  rmSync(HOME, { recursive: true, force: true })
  rmSync(REPO, { recursive: true, force: true })
})

const SLUG = CLI.projectSlug(REPO)
const WORKTREE = `${REPO}/.claude/worktrees/seo`
transcript(SLUG, "aaaa1111", [
  {
    type: "user",
    entrypoint: "claude-vscode",
    cwd: REPO,
    timestamp: "2026-10-01T10:00:00Z",
    message: { content: "fix the parser" }
  },
  { type: "ai-title", aiTitle: "Parser fix" },
  {
    type: "user",
    cwd: WORKTREE,
    timestamp: "2026-10-01T11:00:00Z",
    message: { content: "<system-reminder>x</system-reminder>" }
  }
])
transcript(`${SLUG}--claude-worktrees-seo`, "bbbb2222", [
  {
    type: "user",
    entrypoint: "cli",
    cwd: REPO,
    timestamp: "2026-10-02T10:00:00Z",
    message: { content: "<command-name>/epic</command-name><command-args>seo</command-args>" }
  },
  { type: "custom-title", customTitle: "seo" },
  {
    type: "assistant",
    message: {
      content: [{ type: "tool_use", name: "AskUserQuestion", input: { questions: [{ question: "Which?" }] } }]
    }
  }
])
transcript("-elsewhere", "cccc3333", [
  { type: "user", entrypoint: "sdk-ts", cwd: "/elsewhere", message: { content: "from the SDK" } }
])
mkdirSync(join(HOME, "sessions"), { recursive: true })
writeFileSync(
  join(HOME, "sessions", `${process.pid}.json`),
  JSON.stringify({ pid: process.pid, sessionId: "aaaa1111", status: "busy" })
)
writeFileSync(join(HOME, "sessions", "1.json"), JSON.stringify({ pid: 999_999_999, sessionId: "dead" }))

describe("savedSessions()", () => {
  const found = CLI.savedSessions({ cwd: REPO }, HOME)

  test("this repo's sessions, worktree folders too, newest first", () => {
    expect(found.map((it) => it.id).sort()).toEqual(["aaaa1111", "bbbb2222"])
  })
  test("title:  custom, else Claude's, else the first prompt;  cwd:  the latest", () => {
    const [parser] = found.filter((it) => it.id === "aaaa1111")
    expect(parser).toMatchObject({ title: "Parser fix", named: false, prompt: "fix the parser", cwd: WORKTREE })
    expect(found.find((it) => it.id === "bbbb2222")).toMatchObject({ title: "seo", named: true, prompt: "/epic seo" })
  })
  test("everywhere:  every project, but never SDK / web sessions", () => {
    expect(CLI.savedSessions({ cwd: REPO, everywhere: true }, HOME).map((it) => it.id)).not.toContain("cccc3333")
  })
})

describe("runningSessions()", () => {
  test("only records whose process is alive", () => {
    expect([...CLI.runningSessions(HOME).keys()]).toEqual(["aaaa1111"])
  })
})

describe("sessionsNamed()", () => {
  test("by title, or by having worked in that worktree", () => {
    expect(
      CLI.sessionsNamed("seo", HOME)
        .map((it) => it.id)
        .sort()
    ).toEqual(["aaaa1111", "bbbb2222"])
    expect(CLI.sessionsNamed("nope", HOME)).toEqual([])
  })
})

describe("promptText()", () => {
  test("slash commands, reminders, harness messages", () => {
    expect(CLI.promptText("<command-name>/park</command-name><command-args> later \n</command-args>")).toBe(
      "/park later"
    )
    expect(CLI.promptText("hi <system-reminder>noise</system-reminder>")).toBe("hi")
    expect(CLI.promptText("<task-notification>x</task-notification>")).toBeNull()
    expect(CLI.promptText("Another Claude session sent a message:\n...")).toBeNull()
    expect(CLI.promptText("Base directory for this skill: /x")).toBeNull()
    expect(CLI.promptText("two\n\nlines")).toBe("two\n\nlines")
  })
})

describe("digestTranscript()", () => {
  test("prompts, and a question still waiting", () => {
    const digest = CLI.digestTranscript("bbbb", HOME)!
    expect(digest.prompts.map((it) => it.text)).toEqual(["/epic seo"])
    expect(digest.pending).toEqual([{ question: "Which?" }])
    expect(CLI.digestTranscript("zzzz", HOME)).toBeUndefined()
  })
})

/** Write transcript `<id>.jsonl` of `entries` into project folder `slug`. */
function transcript(slug: string, id: string, entries: object[]) {
  mkdirSync(join(HOME, "projects", slug), { recursive: true })
  writeFileSync(join(HOME, "projects", slug, `${id}.jsonl`), entries.map((it) => JSON.stringify(it)).join("\n"))
}
