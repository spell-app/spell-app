/**
 * Tests of `EpicDocs` (`spell dev plan-doc docs | decisions`):  its pure rules, then a scratch checkout with git,
 * a shared content repo behind a `guides/` link, and two epics' plan docs.
 */
import { spawnSync } from "node:child_process"
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test"

import { EpicDocs } from "./EpicDocs"
import { PlanDoc } from "./PlanDoc"
import { PlanDocFiles } from "./PlanDocFiles"

/** The tool's test fixtures:  `epic-plan.html`, a fresh doc in `<epic-*>` markup. */
const FIXTURES = fileURLToPath(new URL("fixtures", import.meta.url))

describe("EpicDocs rules", () => {
  test("isDocPath():  Markdown anywhere, shared pages and data;  never plan docs, logs, generated pages", () => {
    const docs = [
      "README.md",
      "packages/epics/AGENTS.md",
      ".claude/skills/airplane/SKILL.md",
      "packages/epics/src/tool/PLAN-DOC.md",
      "guides/airplane.html",
      "guides/dev/commands/commands.json",
      "templates/epics/plan-doc.md",
      "ui/button.html",
      "agents/wwod/WWOD.md"
    ]
    const not = [
      "epics/x/x.plan.html",
      "pages/index.html",
      "agents/PAPERCUTS.md",
      "guides/changelog.html",
      "guides/index.html",
      "PARKED-x.md",
      "MORNING-vite-plus.md",
      "packages/epics/src/convert/fixtures/a.md",
      "guides/x/_assets/a.css",
      "packages/docs/tools/airplane.ts",
      "node_modules/a/README.md"
    ]
    expect(docs.filter((path) => !EpicDocs.isDocPath(path))).toEqual([])
    expect(not.filter((path) => EpicDocs.isDocPath(path))).toEqual([])
  })

  test("mentions():  the epic by name, its ids and its folder;  whole names only", () => {
    const yes = [
      "epic `airplane`",
      "Epic <code>airplane</code>, P3",
      "(epics airplane and seo)",
      "airplane P3 built it",
      "`airplane` J14",
      "see epics/airplane/airplane.plan.html"
    ]
    const no = ["epic `airplane-scratch`", "airplane-scratch P3", "an airplane", "epic airplanes", "my-airplane P3"]
    expect(yes.filter((text) => !EpicDocs.mentions(text, "airplane"))).toEqual([])
    expect(no.filter((text) => EpicDocs.mentions(text, "airplane"))).toEqual([])
  })

  test("groupOf():  wrote, related, linked, swept", () => {
    const group = (path: string, ...reasons: Parameters<typeof EpicDocs.groupOf>[0]["reasons"]) =>
      EpicDocs.groupOf({ path, reasons }, "seo")
    expect(group("README.md", "commit", "link")).toBe("wrote")
    expect(group("guides/seo/a.html", "shared-turn")).toBe("wrote")
    expect(group("guides/seo.html", "shared-turn")).toBe("wrote")
    expect(group("guides/seosoon.html", "shared-turn")).toBe("swept")
    expect(group("guides/seosoon.html", "shared-turn", "link")).toBe("related")
    expect(group("guides/a.html", "mention", "link")).toBe("related")
    expect(group("guides/a.html", "link")).toBe("linked")
  })

  test("commitShas() and parseNameLog()", () => {
    expect(EpicDocs.commitShas('<epic-commit sha="abc1234">a</epic-commit><epic-commit sha="abc1234">')).toEqual([
      "abc1234"
    ])
    const log = "\x01aaa\n\nREADME.md\ndocs/a.md\n\x01bbb\n\n\x01ccc\n\nx.md\n"
    expect([...EpicDocs.parseNameLog(log)]).toEqual([
      ["aaa", ["README.md", "docs/a.md"]],
      ["ccc", ["x.md"]]
    ])
  })
})

describe("EpicDocs on a scratch checkout", () => {
  const scratch = mkdtempSync(join(tmpdir(), "epic-docs-"))
  const root = join(scratch, "checkout")
  const shared = join(scratch, "shared")
  const files = new PlanDocFiles({ root })

  beforeAll(async () => {
    for (const dir of [root, shared]) {
      mkdirSync(dir, { recursive: true })
      git(dir, "init", "-q")
    }
    write(root, ".gitignore", "epics\nguides\n")
    for (const dir of ["epics", "guides"]) mkdirSync(join(shared, dir))
    symlinkSync(join(shared, "epics"), join(root, "epics"))
    symlinkSync(join(shared, "guides"), join(root, "guides"))
    // spell-app's commits:  x's by its subject, y's by y's doc listing it, one listed in x's doc only
    const xs = commit(root, "x P1:  One -- the readme", { "README.md": "# r", "packages/a/AGENTS.md": "a", "a.ts": "" })
    const ys = commit(root, "P1:  One -- y's, named like x's", { "y-notes.md": "y" })
    const listed = commit(root, "a subject naming nobody", { "listed.md": "l" })
    commit(root, "z P1:  someone else", { "z.md": "z" })
    // the shared repo's pages, and its turn commits
    write(shared, "guides/changelog.html", '<ui-section id="x" header="2026-10-01 · X"></ui-section>')
    write(shared, "guides/index.html", "epic `x`")
    write(shared, "guides/x/x.html", "durable")
    write(shared, "guides/x/extra.html", "beside it")
    write(shared, "guides/x/_assets/a.css", "")
    write(shared, "guides/mention.html", "<p>Built by epic <code>x</code>.</p>")
    write(shared, "guides/xylophone.html", "epic `xylophone`, xylophone P1")
    write(shared, "guides/linked.html", "nothing about it")
    write(shared, "guides/swept.html", "swept")
    write(shared, "guides/other.html", "another turn's")
    commit(shared, "auto: guides\n\nTurn-end: x-agent-ab12\nSession: s1", ["guides/swept.html"])
    commit(shared, "auto: guides\n\nTurn-end: xylophone\nSession: s2", ["guides/other.html"])
    // the plan docs:  y's lists its commit, x's links its durable doc and a page, and lists `listed`
    const y = PlanDoc.parse(readFileSync(join(FIXTURES, "epic-plan.html"), "utf8"))
    y.addPhase("One")
    y.addCommit({ phase: 1 }, ys, "y's work", { base: null })
    await files.writeDoc(join(root, "epics", "y", "y.plan.html"), y, true)
    const x = PlanDoc.parse(readFileSync(join(FIXTURES, "epic-plan.html"), "utf8"))
    const durable = x.document.createElement("a")
    durable.setAttribute("slot", "durable")
    durable.setAttribute("href", "../../guides/x/x.html")
    durable.textContent = "X"
    x.page.prepend(durable)
    x.addPhase("One", { goal: "<ul><li>one</li></ul>" })
    x.setPhase(1, "done", { done: "<ul><li>built one</li></ul>" })
    x.addPhaseUpdate(1, "<p>one changed</p>")
    x.addCommit({ phase: 1 }, listed, "listed", { base: null })
    x.addItem("caveat", "see a page", { details: '<p><a href="../../guides/linked.html">linked</a></p>' })
    x.addItem("question", "which way?", {
      details:
        '<epic-choices><epic-option letter="A" title="Left"></epic-option>' +
        '<epic-option letter="B" title="Right"></epic-option></epic-choices>'
    })
    x.decide("q1", "Right it is", { option: "B", details: "<p>Because right.</p>" })
    x.addItem("judgement", "kept it small")
    x.setItem("j1", "done")
    await files.writeDoc(join(root, "epics", "x", "x.plan.html"), x, true)
    expect(xs).toMatch(/^[0-9a-f]{40}$/)
  })

  afterAll(() => rmSync(scratch, { recursive: true, force: true }))

  test("find():  each doc once, by group, with why;  the changelog entry", () => {
    const list = new EpicDocs({ files, name: "x" }).find()
    const shown = list.docs.map(({ path, group, reasons }) => `${group} ${path} ${reasons.join(",")}`)
    expect(shown).toEqual([
      "wrote guides/x/extra.html beside-durable",
      "wrote guides/x/x.html durable,link",
      "wrote listed.md commit",
      "wrote packages/a/AGENTS.md commit",
      "wrote README.md commit",
      "related guides/mention.html mention",
      "linked guides/linked.html link",
      "swept guides/swept.html shared-turn"
    ])
    expect(list.counts).toEqual({ wrote: 5, related: 1, linked: 1, swept: 1 })
    expect(list.docs.find((doc) => doc.path === "README.md")!.commits).toHaveLength(1)
    expect(list.changelog).toEqual({ path: "guides/changelog.html", anchor: "x", found: true })
    expect(list.planDoc).toBe("epics/x/x.plan.html")
  })

  test("decisions():  phases with Done and Updated, items with status, chosen option, answer", () => {
    const { phases, items } = new EpicDocs({ files, name: "x" }).decisions()
    expect(phases).toEqual([
      {
        n: 1,
        name: "One",
        status: "done",
        done: "built one",
        updates: [{ at: expect.any(String), text: "one changed" }]
      }
    ])
    const q1 = items.find((item) => item.id === "Q1")!
    expect(q1).toMatchObject({
      kind: "question",
      status: "decided",
      title: "which way?",
      chosen: "B · Right",
      answer: "Right it is:  Because right."
    })
    expect(items.find((item) => item.id === "J1")).toMatchObject({ kind: "judgement", status: "done" })
    expect(items.find((item) => item.id === "C1")!.text).toContain("linked")
  })
})

/** Write `text` to `path` under `dir`, making its folders. */
function write(dir: string, path: string, text: string): void {
  mkdirSync(dirname(join(dir, path)), { recursive: true })
  writeFileSync(join(dir, path), text)
}

/** `git <args>` in `cwd`, as a test author;  its trimmed stdout.  Throws when git fails. */
function git(cwd: string, ...args: string[]): string {
  const run = spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...args], { cwd, encoding: "utf8" })
  if (run.status !== 0) throw new Error(`git ${args.join(" ")}:  ${run.stderr}`)
  return run.stdout.trim()
}

/** Commit `files` (path => text, written first;  or paths already written) in `cwd` as `message`;  its sha. */
function commit(cwd: string, message: string, files: Record<string, string> | string[]): string {
  const paths = Array.isArray(files) ? files : Object.keys(files)
  if (!Array.isArray(files)) for (const [path, text] of Object.entries(files)) write(cwd, path, text)
  git(cwd, "add", ...paths)
  git(cwd, "commit", "-q", "-m", message)
  return git(cwd, "rev-parse", "HEAD")
}
