/**
 * Tests of `spell dev docs fuss` (`fuss.ts`):  each kind of miss found at its line, what it skips, and the files it
 * walks.  Owen's own before / after (epic `skillz`, P7's goal) are the fixtures.
 */
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, describe, expect, test, vi } from "vite-plus/test"

import { Fuss, run } from "./fuss"

const SCRATCH = realpathSync(mkdtempSync(join(tmpdir(), "fuss-")))
afterAll(() => rmSync(SCRATCH, { recursive: true, force: true }))

/** Owen's BEFORE:  a phrase begun at the end of a line, and one whose end is alone on the next. */
const BEFORE = [
  "- For an element whose content must never wait:  `<ui-root>`, which holds the whole page.  Its `render()` MUST",
  "look right unstyled (inline styles only) until `isReady`.",
  "- Not the same as a source element's loading (`SourceElement.loadStatus`):  this is the element itself being",
  "  styled and drawn."
]

/** Owen's "Should be":  each line broken at a phrase. */
const SHOULD_BE = [
  "- For an element whose content must never wait:  `<ui-root>`, which holds the whole page.",
  "  Its `render()` MUST look right unstyled (inline styles only) until `isReady`.",
  "- Not the same as a source element's loading (`SourceElement.loadStatus`):",
  "  this is the element itself being styled and drawn."
]

/** `lines` as a docstring above a declaration, its first line at line 1. */
function docstring(lines: string[]): string {
  return ["/**", ...lines.map((line) => ` * ${line}`), " */", "export const isReady = false", ""].join("\n")
}

/** The misses in `text` as `[line, kind]` pairs, for a short `toEqual()`. */
function found(file: string, text: string): [number, string][] {
  return Fuss.check(file, text).map((miss) => [miss.line, miss.kind])
}

////////////////
// ## Owen's before and after
////////////////

describe("Owen's isReady bullets", () => {
  test("BEFORE, in a docstring:  both bullets split a phrase, at their first lines", () => {
    const misses = Fuss.check("a.ts", docstring(BEFORE))
    expect(misses.map((miss) => [miss.line, miss.kind, miss.why])).toEqual([
      [2, "phrase-split", "ends in 3 words of a new phrase:  start it on the next line"],
      [4, "phrase-split", "the next line is short:  move the whole phrase down"]
    ])
    expect(misses[0].text).toBe(BEFORE[0])
  })

  test("Should be, in a docstring:  clean", () => {
    expect(found("a.ts", docstring(SHOULD_BE))).toEqual([])
  })

  test("in Markdown too:  BEFORE flagged, Should be clean", () => {
    expect(found("a.md", ["# Ready", "", ...BEFORE].join("\n"))).toEqual([
      [3, "phrase-split"],
      [5, "phrase-split"]
    ])
    expect(found("a.md", ["# Ready", "", ...SHOULD_BE].join("\n"))).toEqual([])
  })

  test("in `//` comments:  a run of lines is one comment", () => {
    const source = ["function f() {", ...BEFORE.map((line) => `  // ${line}`), "}"].join("\n")
    expect(found("a.ts", source)).toEqual([
      [2, "phrase-split"],
      [4, "phrase-split"]
    ])
  })
})

////////////////
// ## Each kind
////////////////

describe("phrase-split", () => {
  test("after `:`, `;`, `.` and ` --`, 1-4 words;  5 words, with a long next line, pass", () => {
    const lines = [
      "One:  two three four five six seven eight nine ten eleven twelve;  thirteen",
      "fourteen fifteen sixteen -- seventeen eighteen nineteen twenty",
      "twenty-one.  Twenty-two twenty-three twenty-four twenty-five twenty-six",
      "twenty-seven twenty-eight twenty-nine thirty thirty-one thirty-two thirty-three"
    ]
    expect(found("a.ts", docstring(lines))).toEqual([
      [2, "phrase-split"],
      [3, "phrase-split"]
    ])
  })

  test("only within a paragraph or bullet:  never across a blank line, or into the next bullet", () => {
    const lines = ["- the first bullet:  its last words", "- the second;  ends", "", "A paragraph:  of one line"]
    expect(found("a.ts", docstring(lines))).toEqual([])
  })

  test("NOT across two comments with code between", () => {
    const source = ["// first:  the end of", "const x = 1", "// the other comment", ""].join("\n")
    expect(found("a.ts", source)).toEqual([])
  })

  test("a `:` in a code span or a URL, or `e.g.` and `...`, starts no phrase", () => {
    const lines = [
      "Read `{ a: 1, b: 2 }` from https://example.com/a:b/c as e.g. JSON or YAML ... and then",
      "carry on to the end."
    ]
    expect(found("a.ts", docstring(lines))).toEqual([])
  })

  test("a code span going on into the next line still hides its punctuation", () => {
    expect(found("a.ts", docstring(["Posts `{ page, id,", "note? }` and on", "to the end."]))).toEqual([])
  })

  test("NOT in HTML:  the formatter wraps its lines", () => {
    const page = ["<p>", "  A paragraph:  of", "  one sentence.", "</p>"].join("\n")
    expect(found("a.html", page)).toEqual([])
  })
})

describe("dense", () => {
  test("a bullet or paragraph of 3 sentences, at its first line;  2 pass", () => {
    const lines = [
      "One sentence.  Two sentences.",
      "",
      "- A bullet.  Then its second sentence, a long one,",
      "  going on and on.  And a third.",
      "- `x`:  one.  `y`:  two."
    ]
    expect(found("a.ts", docstring(lines))).toEqual([[4, "dense"]])
  })

  test("in an HTML page, per block element, at its first line", () => {
    const page = [
      "<ul>",
      "  <li>One.  Two.</li>",
      "  <li>One.  <code>Two</code> is code.",
      "  And three.</li>",
      "</ul>"
    ].join("\n")
    expect(found("a.html", page)).toEqual([[3, "dense"]])
  })

  test("not in quoted text:  Owen's own words, kept as he wrote them (T2 of `skillz`)", () => {
    const words = "<p>One.  Two.  Three.</p>"
    const page = [
      `<blockquote>${words}</blockquote>`,
      `<epic-original>${words}</epic-original>`,
      `<epic-answer>${words}</epic-answer>`,
      words
    ].join("\n")
    expect(found("a.html", page)).toEqual([[4, "dense"]])
  })

  test("a section's number (`§6. Comments`) ends no sentence", () => {
    expect(found("a.md", "See WWOD §6. Comments and 3. Plan, then 6. Doc Review.\n")).toEqual([])
  })
})

describe("jargon", () => {
  test('`packages/ui` bans "the fork", in any case;  other packages don\'t', () => {
    const source = "/* The fork's instance API */\nexport const api = {}\n"
    expect(Fuss.check("/repo/packages/ui/src/a.ts", source)).toMatchObject([
      { line: 1, kind: "jargon", why: 'says "the fork", "fork\'s"' }
    ])
    expect(found("/repo/packages/server/src/a.ts", source)).toEqual([])
  })

  test("never inside a code span;  in HTML pages too", () => {
    expect(found("/repo/packages/ui/a.md", "Made by `the fork` itself.\n")).toEqual([])
    expect(found("/repo/packages/ui/a.html", "<p>Made by the fork.</p>\n")).toEqual([[1, "jargon"]])
  })
})

/** Owen's "Built / Checked" lines (epic `airplane`, 2026-10-10), as a plan doc held them:  a path, and four facts' settings. */
const BUILT_BEFORE = [
  "<p>Built:  <code>buildTsx()</code>, <code>packages/spell/src/node/buildTsx.ts:40</code></p>",
  "<p>Checked:  <code>tsc</code> with <code>jsx: preserve</code>, <code>jsxImportSource</code>, paths from tsconfig.base.json.</p>"
]

/** The rewrite he approved:  the path a tooltip, a plain lead line, one fact per bullet. */
const BUILT_AFTER = [
  '<p>Built:  <code title="packages/spell/src/node/buildTsx.ts">buildTsx()</code></p>',
  "<p>Checked:  the type check now understands Spell UI pages.</p>",
  "<ul>",
  "  <li>It reads JSX the way app and ui do.</li>",
  "  <li>It adds app's types for <code>&lt;ui-*&gt;</code> tags, because <code>@spell-app/ui</code> doesn't ship any.</li>",
  "</ul>"
]

describe("path-in-prose", () => {
  test("Owen's BEFORE:  the path after the name;  AFTER, the path a tooltip, is clean", () => {
    expect(Fuss.check("a.html", BUILT_BEFORE.join("\n"))).toMatchObject([
      { line: 1, kind: "path-in-prose", why: expect.stringContaining('"packages/spell/src/node/buildTsx.ts:40"') },
      { line: 2, kind: "code-dense" }
    ])
    expect(found("a.html", BUILT_AFTER.join("\n"))).toEqual([])
  })

  test("a path in the text, or a code span that is a whole path;  in Markdown too, where the fix is a link", () => {
    expect(
      found("a.html", "<p>See packages/docs/tools/fuss.ts for it.</p>\n<p>At <code>fuss.ts:12</code>.</p>")
    ).toEqual([
      [1, "path-in-prose"],
      [2, "path-in-prose"]
    ])
    const misses = Fuss.check("a.md", "Run it from `packages/docs/tools`.\n")
    expect(misses).toMatchObject([{ line: 1, kind: "path-in-prose", why: expect.stringContaining("[`name`](path)") }])
  })

  test("NOT where a path belongs:  an href, a title, a Markdown link's target, a code block", () => {
    const page = [
      '<p>See <a href="../../packages/docs/tools/fuss.ts">the checker</a>.</p>',
      '<p>Built:  <code title="packages/docs/tools/fuss.ts">Fuss</code>.</p>',
      "<pre>packages/docs/tools/fuss.ts</pre>"
    ].join("\n")
    expect(found("a.html", page)).toEqual([])
    expect(
      found("a.md", "See [`Fuss`](packages/docs/tools/fuss.ts).\n\n```\npackages/docs/tools/fuss.ts\n```\n")
    ).toEqual([])
  })

  test("NOT a name:  a folder, a package, an alias, a file alone, a route, a URL, a date, a command naming a file", () => {
    const text = [
      "In `packages/docs/`, `@spell-app/ui`, `$/epics/tool/PlanParts`, `fuss.ts`, `/api/review/inbox`,",
      "https://example.com/a/b/c.html, 10/9/26, read/write/check, `yarn tsx tools/doc-links.js page`."
    ].join("\n")
    expect(found("a.md", text).filter(([, kind]) => kind === "path-in-prose")).toEqual([])
  })

  test("NOT in code comments:  a docstring cites the file it means", () => {
    expect(found("a.ts", docstring(["From `packages/docs/tools/fuss.ts`."]))).toEqual([])
  })
})

describe("code-dense", () => {
  test("3+ code spans in one sentence, at the line it starts on;  2 a sentence pass", () => {
    const lines = ["Two:  `a` and `b`.", "Three:  `a`, `b` and `c`.", "", "- `x` then `y`.  And `z`."]
    expect(Fuss.check("a.md", lines.join("\n"))).toMatchObject([
      { line: 2, kind: "code-dense", why: expect.stringContaining("3 code spans in one sentence") }
    ])
  })

  test("in a page, `<code>` counts;  not in code comments", () => {
    expect(found("a.html", "<li><code>a</code>, <code>b</code>, <code>c</code></li>")).toEqual([[1, "code-dense"]])
    expect(found("a.ts", docstring(["Calls `a()`, `b()` and `c()`."]))).toEqual([])
  })
})

////////////////
// ## What it skips
////////////////

describe("what it skips", () => {
  test("strings, template literals and regexes holding comment marks", () => {
    const source = [
      'const url = "http://a.b/c:  d e // f"',
      "const re = /\\/\\/ a:  b c/g",
      "const t = `// x:  ${'/* y:  z */'} w`",
      ""
    ].join("\n")
    expect(found("a.ts", source)).toEqual([])
  })

  test("`@param`-style tags, lint directives, license headers", () => {
    const source = [
      "/**",
      " * @param name the name:  a b",
      " *   it goes on.  And on.  And on.",
      " */",
      "// oxlint-disable-next-line no-console -- reason:  a b c d",
      "/* Copyright 2026.  All rights reserved:  one two",
      " * three.  Four.  Five. */",
      ""
    ].join("\n")
    expect(found("a.ts", source)).toEqual([])
  })

  test("code fences and indented examples in a docstring;  fences in Markdown", () => {
    const docs = [
      "An example:",
      "",
      "    spell dev docs fuss a:  b c",
      "    more. Lines. Here.",
      "",
      "```ts",
      "a:  b",
      "c",
      "```"
    ]
    expect(found("a.ts", docstring(docs))).toEqual([])
    expect(found("a.md", ["```", "A:  b c", "d.  E.  F.", "```"].join("\n"))).toEqual([])
  })

  test("a file it doesn't read:  nothing", () => {
    expect(found("a.css", "/* a:  b c\n d */")).toEqual([])
  })
})

////////////////
// ## Files and the command
////////////////

describe("Fuss.filesUnder()", () => {
  test("walks folders, skipping dot folders, `node_modules` and formats it doesn't read", () => {
    const root = join(SCRATCH, "walk")
    for (const folder of ["src/deep", ".hidden", "node_modules/x"]) mkdirSync(join(root, folder), { recursive: true })
    for (const file of ["src/a.ts", "src/deep/b.md", "src/c.json", ".hidden/d.ts", "node_modules/x/e.ts"]) {
      writeFileSync(join(root, file), "")
    }
    expect(Fuss.filesUnder(["src"], { cwd: root })).toEqual([join(root, "src/a.ts"), join(root, "src/deep/b.md")])
    expect(() => Fuss.filesUnder(["nope"], { cwd: root })).toThrow(/no such file or folder:  nope/)
  })
})

describe("run()", () => {
  test("exits 1 with misses, listed by file and line;  0 when clean;  2 on a usage error", () => {
    const root = join(SCRATCH, "run")
    mkdirSync(root, { recursive: true })
    writeFileSync(join(root, "before.ts"), docstring(BEFORE))
    writeFileSync(join(root, "after.ts"), docstring(SHOULD_BE))
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    try {
      expect(run(["before.ts"], { cwd: root })).toBe(1)
      expect(log.mock.calls.map(([line]) => line)).toEqual([
        `before.ts:2  phrase-split  ${BEFORE[0]}`,
        `before.ts:4  phrase-split  ${BEFORE[2]}`,
        "2 misses in 1 of 1 files:  2 phrase-split"
      ])
      log.mockClear()
      expect(run(["after.ts", "--json"], { cwd: root })).toBe(0)
      expect(JSON.parse(log.mock.calls[0][0])).toEqual({
        files: 1,
        misses: [],
        counts: { "phrase-split": 0, dense: 0, jargon: 0, "path-in-prose": 0, "code-dense": 0 }
      })
      expect(run([], { cwd: root })).toBe(2)
      expect(run(["a.ts", "--branch"], { cwd: root })).toBe(2)
      expect(run(["a.ts", "--loud"], { cwd: root })).toBe(2)
    } finally {
      log.mockRestore()
      error.mockRestore()
    }
  })
})
