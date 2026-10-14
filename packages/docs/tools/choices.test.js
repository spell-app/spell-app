/**
 * Tests of `spell dev choices`' functions (`tools/choices.js`), in a scratch checkout:  the real template, a scratch
 * `details/` and an epic.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, beforeAll, expect, test } from "vite-plus/test"

import {
  checkData,
  createPage,
  draftFile,
  findChoicesPage,
  formatAnswer,
  isChoicesPage,
  readRows,
  rowsFile
} from "./choices.js"
import { answerFile, createPage as createDetailsPage, waitForAnswer } from "./details.js"

let docs

/** Rows as `new --rows` takes them:  two sections, a rename, one that stays, one without a note */
const DATA = {
  title: "Boolean names",
  lede: "Which <b>names</b> change?",
  askedBy: "session <code>w</code>, while proposing",
  where: { epic: "<code>big</code>", justNow: "counted them", decides: "the rename list" },
  sections: [
    { id: "q1", title: "Q1 · Members", description: "`is` / `has`" },
    { id: "q2", title: "Q2 · Settings" }
  ],
  rows: [
    {
      section: "q1",
      file: "packages/ui/src/A.tsx",
      line: 7,
      purpose: "menu open",
      current: "this.open",
      recommended: "this.isOpen"
    },
    {
      section: "q1",
      file: "packages/ui/src/A.tsx",
      line: 9,
      purpose: "dark",
      current: "UI.isDark",
      recommended: "UI.isDark",
      note: "stays"
    },
    {
      id: "direct",
      section: "q2",
      file: "packages/ui/src/B.ts",
      line: 3,
      purpose: "direct",
      current: "{ isDirect }",
      recommended: "{ direct }"
    }
  ]
}

beforeAll(() => {
  docs = mkdtempSync(join(tmpdir(), "choices-cli-"))
  mkdirSync(join(docs, "epics/big"), { recursive: true })
})

afterAll(() => rmSync(docs, { recursive: true, force: true }))

test("new:  the page, its rows in it as elements and beside it as JSON, fixed for its depth", () => {
  const file = createPage(docs, "names", { epic: "big", data: DATA })
  expect(file).toBe(join(docs, "epics/big/details/names.html"))
  const html = readFileSync(file, "utf8")
  expect(html).toContain("<title>Boolean names</title>")
  expect(html).toContain('<script src="../../../packages/docs/tools/_assets/spell-ui.js">')
  expect(html).toContain('source="../../../packages/epics/pack/epics.pack.js"')
  expect(html).not.toContain("syntax-choices.js")
  expect(html).toContain('root="../../.."')
  expect(html).toContain("Which <b>names</b> change?")
  expect(html).toContain('<epic-field label="Just now">counted them</epic-field>')
  expect(html).toContain("<code>names.rows.json</code>")
  expect(html).toMatch(/<epic-field label="Asked" data-choices-asked>\d{4}-\d\d-\d\d</)
  expect(html).not.toContain("TEMPLATE:")
  expect(html).not.toContain("q1-example-1")
  // one section per section of the rows, its rule with its code, its rows by file then line
  expect(html).toContain(
    '<ui-section id="q1" header="Q1 · Members" sticky collapsible dividing collapsed><ui-icon slot="icon" name="list check"></ui-icon><p class="spell-choices-rule"><code>is</code> / <code>has</code></p><epic-choice-rows>'
  )
  expect(html).toContain(
    '<epic-choice-row name="q1-A-7" file="packages/ui/src/A.tsx" line="7" purpose="menu open" current="this.open" recommended="this.isOpen"></epic-choice-row>'
  )
  expect(html).toContain('note="stays"')
  expect(html).toContain("<epic-choices-bar></epic-choices-bar>")
  const { sections, rows } = readRows(file)
  expect(sections).toHaveLength(2)
  expect(rows.map((row) => row.id)).toEqual(["q1-A-7", "q1-A-9", "direct"])
  expect(isChoicesPage(file)).toBe(true)
  expect(() => createPage(docs, "names", { epic: "big", data: DATA })).toThrow(/already exists/)
})

test("new:  fileColumn false is kept beside the rows, so the page drops its File column;  shown by default", () => {
  const file = createPage(docs, "no-file", { epic: "big", data: { ...DATA, fileColumn: false } })
  const kept = readRows(file)
  expect(kept.fileColumn).toBe(false)
  expect(kept.rows[0].file).toBe("packages/ui/src/A.tsx")
  expect(readFileSync(file, "utf8")).toContain("<epic-choice-rows no-file>")
  expect("fileColumn" in readRows(join(docs, "epics/big/details/names.html"))).toBe(false)
  const shown = createPage(docs, "file-shown", { epic: "big", data: { ...DATA, fileColumn: true } })
  expect("fileColumn" in readRows(shown)).toBe(false)
  expect(() => checkData({ ...DATA, fileColumn: "no" })).toThrow(/fileColumn is true or false/)
})

test("new:  stacked true is kept beside the rows (one Syntax column);  two columns by default", () => {
  const file = createPage(docs, "stacked", { epic: "big", data: { ...DATA, fileColumn: false, stacked: true } })
  expect(readRows(file)).toMatchObject({ fileColumn: false, stacked: true })
  expect(readFileSync(file, "utf8")).toContain("<epic-choice-rows stacked no-file>")
  const plain = createPage(docs, "not-stacked", { epic: "big", data: { ...DATA, stacked: false } })
  expect("stacked" in readRows(plain)).toBe(false)
  expect(() => checkData({ ...DATA, stacked: "yes" })).toThrow(/stacked is true or false/)
})

test("new:  a scratch page, the --title flag beating the data's", () => {
  const file = createPage(docs, "scratch-names", { title: "Other", data: DATA })
  expect(file).toBe(join(docs, "pages/details/scratch-names.html"))
  expect(readFileSync(file, "utf8")).toContain("<h1>Other</h1>")
})

test("rows are checked:  each problem named", () => {
  expect(() => checkData({ rows: [] })).toThrow(/no sections/)
  expect(() => checkData({ sections: [{ id: "q1" }], rows: [] })).toThrow(/an id and a title/)
  const base = { sections: [{ id: "q1", title: "Q1" }] }
  const row = { section: "q1", file: "a.ts", line: 1, purpose: "p", current: "a", recommended: "b" }
  expect(() => checkData({ ...base, rows: [{ ...row, line: 0 }] })).toThrow(/needs a line/)
  expect(() => checkData({ ...base, rows: [{ ...row, recommended: undefined }] })).toThrow(/needs recommended/)
  expect(() => checkData({ ...base, rows: [{ ...row, section: "q9" }] })).toThrow(/no section 'q9'/)
  expect(() =>
    checkData({
      ...base,
      rows: [
        { ...row, id: "x" },
        { ...row, id: "x" }
      ]
    })
  ).toThrow(/two rows are 'x'/)
  expect(checkData({ ...base, rows: [row, row] }).rows.map((each) => each.id)).toEqual(["q1-a-1", "q1-a-1-2"])
})

test("find:  by <epic>/<slug>, refusing a details page", () => {
  expect(findChoicesPage(docs, "big/names")).toBe(join(docs, "epics/big/details/names.html"))
  createDetailsPage(docs, "a-question", { title: "Q" })
  expect(() => findChoicesPage(docs, "a-question")).toThrow(/not a syntax-choices page/)
})

test("the answer as text:  changed rows by section, the count accepted, the feedback", () => {
  const file = join(docs, "epics/big/details/names.html")
  const text = formatAnswer(file, {
    page: "/epics/big/details/names.html",
    answered: "2026-10-06T21:00:00.000Z",
    changes: 1,
    values: { "q1-A-9": "UI.dark", direct: "", gone: "x" },
    feedback: "good\nmostly"
  })
  expect(text).toBe(
    [
      `Choices on "Boolean names" (${file}), sent 2026-10-06T21:00:00.000Z:  (sent 2×)`,
      `  Rows:  ${rowsFile(file)}`,
      "  Changed (2):",
      "    Q1 · Members",
      "      packages/ui/src/A.tsx:9  UI.isDark -> UI.isDark  =>  UI.dark",
      "    Q2 · Settings",
      "      packages/ui/src/B.ts:3  { isDirect } -> { direct }  =>  (blank)",
      "  Rows no longer on the page, ignored:  gone",
      "  Unchanged (accepted as recommended):  1 -- 1 to rename, 0 to stay",
      "  Feedback:",
      "    good",
      "    mostly"
    ].join("\n")
  )
})

test("a docs page naming its own rows:  found by its path, its boxes printed by row", () => {
  mkdirSync(join(docs, "guides/syntax"), { recursive: true })
  const file = join(docs, "guides/syntax/syntax.html")
  writeFileSync(file, '<body data-choices-rows="../../rules.json"><h1>Spell syntax</h1></body>')
  expect(isChoicesPage(file)).toBe(true)
  expect(findChoicesPage(docs, "guides/syntax/syntax.html")).toBe(file)
  const text = formatAnswer(file, {
    page: "/guides/syntax/syntax.html",
    answered: "2026-10-12T21:00:00.000Z",
    changes: 0,
    values: { "IsGtLt.py": "salary > expenses", "IsGtLt.name": "IsGreaterOrLess", "Plus.js": " " },
    feedback: ""
  })
  expect(text).toBe(
    [
      `Choices on "Spell syntax" (${file}), sent 2026-10-12T21:00:00.000Z:`,
      `  Rows:  ${join(docs, "rules.json")}`,
      "  Changed (3):",
      "    IsGtLt",
      "      py  =>  salary > expenses",
      "      name  =>  IsGreaterOrLess",
      "    Plus",
      "      js  =>  (blank)",
      "  Feedback:  (none)"
    ].join("\n")
  )
})

test("wait:  wakes on the answer, never on a draft", async () => {
  const file = join(docs, "epics/big/details/names.html")
  const since = Date.now() - 1
  writeFileSync(draftFile(file), "{}")
  expect(await waitForAnswer(file, { since, timeout: 50, poll: 10 })).toBeUndefined()
  setTimeout(() => writeFileSync(answerFile(file), JSON.stringify({ values: {} })), 20)
  expect(await waitForAnswer(file, { since, timeout: 2000, poll: 10 })).toEqual({ values: {} })
})
