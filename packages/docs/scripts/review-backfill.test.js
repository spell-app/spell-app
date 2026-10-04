import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { describe, expect, it } from "vite-plus/test"

import { findEvidence, projectSlug, sessionsOf } from "./review-backfill.js"

/** The repo's main root, as the fixture's sessions name it. */
const ROOT = "/Users/someone/repo"

/** A transcript line:  a user entry saying `content`, plus `extra` fields. */
function user(content, extra = {}) {
  return JSON.stringify({
    type: "user",
    timestamp: "2026-10-02T17:00:00.000Z",
    cwd: ROOT,
    message: { content },
    ...extra
  })
}

/** A projects folder holding `sessions` (`{ [folder]: { [id]: lines } }`);  returns its path. */
function projects(sessions) {
  const dir = mkdtempSync(join(tmpdir(), "backfill-"))
  for (const [folder, files] of Object.entries(sessions)) {
    mkdirSync(join(dir, folder))
    for (const [id, lines] of Object.entries(files)) writeFileSync(join(dir, folder, `${id}.jsonl`), lines.join("\n"))
  }
  return dir
}

describe("review backfill", () => {
  const slug = projectSlug(ROOT)

  it("finds an epic's sessions:  by title, by its worktree, by its worktree's own project folder", () => {
    const dir = projects({
      [slug]: {
        titled: [JSON.stringify({ type: "custom-title", customTitle: "seo" }), user("hi")],
        moved: [user("go", { cwd: `${ROOT}/.claude/worktrees/seo` })],
        other: [JSON.stringify({ type: "custom-title", customTitle: "seo-two" }), user("hi")]
      },
      [`${slug}--claude-worktrees-seo`]: { old: [user("x")] },
      "-somewhere-else": { stray: [JSON.stringify({ type: "custom-title", customTitle: "seo" })] }
    })
    const ids = sessionsOf("seo", ROOT, dir).map((session) => session.id)
    expect(ids.sort()).toEqual(["moved", "old", "titled"])
  })

  it("counts Owen's messages and modal answers;  never skill bodies, agent notices or summaries", () => {
    const dir = projects({
      [slug]: {
        s: [
          JSON.stringify({ type: "custom-title", customTitle: "seo" }),
          user("<command-name>/epic</command-name><command-args>fix I7 first</command-args>"),
          user([{ type: "text", text: "Base directory for this skill: ... I8 ..." }]),
          user("<task-notification>agent T1 done</task-notification>"),
          user("summary mentions C2", { isCompactSummary: true }),
          user("meta C3", { isMeta: true }),
          user([{ type: "tool_result", content: "answered" }], {
            toolUseResult: {
              questions: [{ header: "seo", question: "Fix the caveat C4 now?" }],
              answers: { "Fix the caveat C4 now?": "Later" }
            }
          })
        ]
      }
    })
    const evidence = findEvidence(sessionsOf("seo", ROOT, dir), ["I7", "I8", "T1", "C2", "C3", "C4"])
    expect(Object.keys(evidence).sort()).toEqual(["C4", "I7"])
    expect(evidence.I7[0]).toMatchObject({
      session: "s",
      kind: "message",
      quote: expect.stringContaining("fix I7 first")
    })
    expect(evidence.C4[0].kind).toBe("answer")
    // the local date, not UTC's
    const local = new Date("2026-10-02T17:00:00.000Z")
    expect(evidence.I7[0].date).toBe(
      `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, "0")}-${String(local.getDate()).padStart(2, "0")}`
    )
  })

  it("matches whole ids only, any case", () => {
    const dir = projects({
      [slug]: {
        s: [JSON.stringify({ type: "custom-title", customTitle: "seo" }), user("see i7, not I7x, AI7 or I70x")]
      }
    })
    expect(Object.keys(findEvidence(sessionsOf("seo", ROOT, dir), ["I7", "I70"]))).toEqual(["I7"])
  })
})
