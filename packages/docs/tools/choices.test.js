/**
 * Tests of `spell dev choices`' functions (`tools/choices.js`), in a scratch checkout:  the real template, a scratch
 * `details/` and an epic.
 */
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
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
import { TEMPLATES } from "./pages.js"

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
  mkdirSync(join(docs, "templates"))
  for (const name of ["syntax-choices.html", "details.html"])
    copyFileSync(join(TEMPLATES, name), join(docs, "templates", name))
  mkdirSync(join(docs, "epics/big"), { recursive: true })
})

afterAll(() => rmSync(docs, { recursive: true, force: true }))

test("new:  the page and its rows beside it, assets fixed for its depth", () => {
  const file = createPage(docs, "names", { epic: "big", data: DATA })
  expect(file).toBe(join(docs, "epics/big/details/names.html"))
  const html = readFileSync(file, "utf8")
  expect(html).toContain("<title>Boolean names</title>")
  expect(html).toContain('<script src="../../../packages/docs/tools/_assets/syntax-choices.js">')
  expect(html).toContain('root="../../.."')
  expect(html).toContain("Which <b>names</b> change?")
  expect(html).toContain("<li><b>Just now:</b>  counted them</li>")
  expect(html).toContain("<code>names.rows.json</code>")
  expect(html).toMatch(/data-choices-asked[^>]*>Asked:  \d{4}-\d\d-\d\d</)
  expect(html).not.toContain("TEMPLATE:")
  const { sections, rows } = readRows(file)
  expect(sections).toHaveLength(2)
  expect(rows.map((row) => row.id)).toEqual(["q1-A-7", "q1-A-9", "direct"])
  expect(isChoicesPage(file)).toBe(true)
  expect(() => createPage(docs, "names", { epic: "big", data: DATA })).toThrow(/already exists/)
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

test("wait:  wakes on the answer, never on a draft", async () => {
  const file = join(docs, "epics/big/details/names.html")
  const since = Date.now() - 1
  writeFileSync(draftFile(file), "{}")
  expect(await waitForAnswer(file, { since, timeout: 50, poll: 10 })).toBeUndefined()
  setTimeout(() => writeFileSync(answerFile(file), JSON.stringify({ values: {} })), 20)
  expect(await waitForAnswer(file, { since, timeout: 2000, poll: 10 })).toEqual({ values: {} })
})
