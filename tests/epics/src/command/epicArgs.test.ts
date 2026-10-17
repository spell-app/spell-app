import { describe, expect, test } from "vite-plus/test"

import { parseTarget, phaseOf, phaseRanges, planDocArgs } from "$/epics/command/epicArgs"

////////////////
// ## Owen's rows
////////////////

/**
 * The 26 rows Owen changed on the Command Review Page (2026-10-12), as the `epic` tool runs each:
 * `[epic command line, the tool's command lines]`.
 * - the two groups' rows (`epic choices list seo`, `epic comments list seo`)
 *   pass through to the docs tools verbatim:  `cli.test.ts` runs them
 */
const OWENS_ROWS: [string[], string[][]][] = [
  [["open", "seo"], [["open", "seo", "--docs"]]],
  [["open", "seo", "--review"], [["open", "seo"]]],
  [["update", "seo#P3", "--goal", "<p>g</p>"], [["phase-body", "seo", "3", "--goal", "<p>g</p>"]]],
  [["updated", "seo#3", "<p>u</p>"], [["updated", "seo", "3", "<p>u</p>"]]],
  [["update", "seo#P3", "--estimate", "1-2h"], [["estimate", "seo", "3", "1-2h"]]],
  [["phase", "seo#3", "done", "--done", "<ul></ul>"], [["phase", "seo", "3", "done", "--done", "<ul></ul>"]]],
  [["update", "epic-workflow", "--standing"], [["standing", "epic-workflow", "on"]]],
  [
    ["add-request", "seo#P7", "r3", "--from", "python", "--file", "r3.html"],
    [["request", "seo", "7", "r3", "--from", "python", "--file", "r3.html"]]
  ],
  [["commit", "seo#p3", "abc123", "what it did"], [["commit", "seo", "abc123", "what it did", "--phase", "3"]]],
  [["add", "seo#J", "Title", "--details", "<p>d</p>"], [["add", "seo", "judgement", "Title", "--details", "<p>d</p>"]]],
  [["decide", "seo#Q3", "yes", "--option", "A"], [["decide", "seo", "Q3", "yes", "--option", "A"]]],
  [["close", "seo#J3"], [["close", "seo", "J3"]]],
  [["reopen", "seo#J3"], [["reopen", "seo", "J3"]]],
  [["cancel", "seo#J3", "why"], [["cancel", "seo", "J3", "why"]]],
  [
    ["details", "seo#J3", "--file", "reply.html", "--append"],
    [["details", "seo", "J3", "--file", "reply.html", "--append"]]
  ],
  [["status", "seo#J3", "underway", "reading"], [["status", "seo", "J3", "underway", "reading"]]],
  [["restore", "seo#J3", "--file", "old.html"], [["original", "seo", "J3", "--file", "old.html"]]],
  [["review", "seo#J3", "outcome"], [["review", "seo", "J3", "outcome"]]],
  [["defer", "seo#J3"], [["defer", "seo", "J3"]]],
  [["queue", "seo#J3", "work"], [["queue", "seo", "J3", "work"]]],
  [["unqueue", "seo#J3"], [["unqueue", "seo", "J3"]]],
  [["inbox", "seo#J3", "working", "on"], [["inbox", "seo", "working", "J3", "on"]]],
  [["inbox", "seo#J3", "done"], [["inbox", "seo", "done", "J3"]]],
  [["inbox", "seo#J3", "clear"], [["inbox", "seo", "clear", "J3"]]],
  [["bedtime", "seo", "start", "P3-P6,P9"], [["bedtime", "seo", "start", "P3-P6,P9"]]]
]

describe("planDocArgs():  Owen's rows", () => {
  test.each(OWENS_ROWS)("epic %j", (epic, tool) => {
    const [verb, ...args] = epic
    expect(planDocArgs(verb!, args)).toEqual(tool)
  })
})

////////////////
// ## The rest
////////////////

describe("planDocArgs()", () => {
  // epic `epic-workflow` P19:  run silently, the old order taught agents the old shape
  test("the tool's old order, with no #, is refused, spelled right", () => {
    const refused = (verb: string, args: string[]) => () => planDocArgs(verb, args)
    expect(refused("close", ["seo", "J3"])).toThrow('close:  epic close seo#J3  (the id goes after a #, not "seo J3")')
    expect(refused("status", ["seo", "J3", "underway", "x"])).toThrow("epic status seo#J3 ...")
    expect(refused("phase", ["seo", "3", "done"])).toThrow("epic phase seo#P3 ...")
    expect(refused("updated", ["seo", "Epic Migrate", "<p>x</p>"])).toThrow('epic updated "seo#Epic Migrate" ...')
    expect(refused("add", ["seo", "todo", "T"])).toThrow("epic add seo#T ...")
    expect(refused("commit", ["seo", "abc", "s", "--phase", "3"])).toThrow("epic commit seo#P3 <sha>")
    expect(refused("commit", ["seo", "abc", "s", "--item", "J3"])).toThrow("epic commit seo#J3 <sha>")
    expect(refused("inbox", ["seo", "working", "J3", "on"])).toThrow("epic inbox seo#J3 working on")
    expect(refused("inbox", ["seo", "done", "cm3"])).toThrow("epic inbox seo#cm3 done")
    expect(refused("update", ["seo", "P3", "--goal", "g"])).toThrow("epic update seo#P3 --<field> <value> ...")
    expect(refused("add-request", ["seo", "7", "r3"])).toThrow("epic add-request seo#P7 ...")
  })

  test("an item or phase verb given only the epic:  which one, with an example", () => {
    expect(() => planDocArgs("close", ["seo"])).toThrow("close:  which item?  epic close seo#J3")
    expect(() => planDocArgs("status", ["seo"])).toThrow('which item?  epic status seo#J3 underway "<reading>"')
    expect(() => planDocArgs("phase", ["seo"])).toThrow("which phase?  epic phase seo#P3 todo | active | done")
    expect(() => planDocArgs("add", ["seo"])).toThrow('which kind of item?  epic add seo#J "Title"')
  })

  test("no epic at all:  which, pointing to the verb's help;  the verbs that take none run", () => {
    expect(() => planDocArgs("close", [])).toThrow("close:  which epic?  epic close --help")
    expect(() => planDocArgs("summary", ["--json"])).toThrow("summary:  which epic?")
    expect(planDocArgs("list", [])).toEqual([["list"]])
  })

  test("the page's own verbs, and inbox's, take the epic alone", () => {
    expect(planDocArgs("inbox", ["seo", "wait"])).toEqual([["inbox", "seo", "wait"]])
    expect(planDocArgs("inbox", ["seo", "apply", "J3"])).toEqual([["inbox", "seo", "apply", "J3"]])
    expect(planDocArgs("update", ["seo", "--standing"])).toEqual([["standing", "seo", "on"]])
  })

  test("verbs that take no epic, or several, pass through", () => {
    expect(planDocArgs("list", ["--json"])).toEqual([["list", "--json"]])
    expect(planDocArgs("split", ["--done", "--dry-run"])).toEqual([["split", "--done", "--dry-run"]])
    expect(planDocArgs("migrate", ["epic", "--all"])).toEqual([["migrate", "epic", "--all"]])
  })

  test("calm:  the first id after the #, the rest after it", () => {
    expect(planDocArgs("calm", ["seo#J3", "J4", "--loud"])).toEqual([["calm", "seo", "J3", "J4", "--loud"]])
  })

  test("add:  a kind's letter or word after the #, any case;  a decision is D", () => {
    expect(planDocArgs("add", ["seo#q", "Which?"])).toEqual([["add", "seo", "question", "Which?"]])
    expect(planDocArgs("add", ["seo#D", "Chose"])).toEqual([["add", "seo", "decision", "Chose"]])
    expect(planDocArgs("add", ["seo#issue", "Bug"])).toEqual([["add", "seo", "issue", "Bug"]])
    expect(() => planDocArgs("add", ["seo#J3", "T"])).toThrow(/a kind after the #/)
  })

  test("commit:  an item after the # is --item", () => {
    expect(planDocArgs("commit", ["seo#J3", "abc", "fixed"])).toEqual([
      ["commit", "seo", "abc", "fixed", "--item", "J3"]
    ])
  })

  test("inbox:  a comment's id (M3, as the page shows it;  the old cm3 too), and a flag after the inbox's verb", () => {
    expect(planDocArgs("inbox", ["seo#M3", "done", "--file", "a.html"])).toEqual([
      ["inbox", "seo", "done", "M3", "--file", "a.html"]
    ])
    expect(planDocArgs("inbox", ["seo#cm3", "done", "--file", "a.html"])).toEqual([
      ["inbox", "seo", "done", "cm3", "--file", "a.html"]
    ])
    expect(() => planDocArgs("inbox", ["seo#J3"])).toThrow(/working on \| off, done, clear/)
  })

  test("a phase verb refuses an item;  a page verb refuses any #", () => {
    expect(() => planDocArgs("phase", ["seo#J3", "done"])).toThrow(/a phase, e\.g\. seo#P3/)
    expect(() => planDocArgs("summary", ["seo#J3"])).toThrow(/takes an epic, not seo#J3/)
    expect(() => planDocArgs("open", ["seo#P3"])).toThrow(/takes an epic/)
  })

  // epic `epic-workflow` P15
  test("saga:  its own verbs and arguments, passed through as typed", () => {
    expect(planDocArgs("saga", ["set", "seo", "spell-ui"])).toEqual([["saga", "set", "seo", "spell-ui"]])
    expect(planDocArgs("saga", ["new", "x", "A # title", "--purpose", "p"])).toEqual([
      ["saga", "new", "x", "A # title", "--purpose", "p"]
    ])
  })

  test("bedtime:  phases written one way;  done passes through", () => {
    expect(planDocArgs("bedtime", ["seo", "start", "3-6, p9"])).toEqual([["bedtime", "seo", "start", "P3-P6,P9"]])
    expect(planDocArgs("bedtime", ["seo", "done", "slept"])).toEqual([["bedtime", "seo", "done", "slept"]])
  })
})

describe("planDocArgs():  update", () => {
  test("a phase:  body fields in one phase-body, then estimate, then rename", () => {
    expect(
      planDocArgs("update", ["seo#P3", "--goal", "g", "--verify", "", "--estimate", "2h", "--title", "New"])
    ).toEqual([
      ["phase-body", "seo", "3", "--goal", "g", "--verify", ""],
      ["estimate", "seo", "3", "2h"],
      ["rename", "seo", "P3", "New"]
    ])
  })

  test("an item:  --title renames it, --calm / --loud", () => {
    expect(planDocArgs("update", ["seo#J3", "--title", "<b>T</b>", "--html"])).toEqual([
      ["rename", "seo", "J3", "<b>T</b>", "--html"]
    ])
    expect(planDocArgs("update", ["seo#J3", "--calm"])).toEqual([["calm", "seo", "J3"]])
    expect(planDocArgs("update", ["seo#J3", "--loud"])).toEqual([["calm", "seo", "J3", "--loud"]])
  })

  test("the page:  standing on or off", () => {
    expect(planDocArgs("update", ["seo", "--standing", "off"])).toEqual([["standing", "seo", "off"]])
    expect(planDocArgs("update", ["seo", "--no-standing"])).toEqual([["standing", "seo", "off"]])
  })

  test("refuses no field, a field the target lacks, and a field with no value", () => {
    expect(() => planDocArgs("update", ["seo#P3"])).toThrow(/which fields\?  phase P3 has --symptom/)
    expect(() => planDocArgs("update", ["seo#J3", "--goal", "g"])).toThrow(/item J3 has no --goal/)
    expect(() => planDocArgs("update", ["seo", "--estimate", "2h"])).toThrow(/the page has no --estimate/)
    expect(() => planDocArgs("update", ["seo#P3", "--estimate"])).toThrow(/--estimate needs a value/)
    expect(() => planDocArgs("update", [])).toThrow(/update what\?/)
  })
})

describe("parseTarget()", () => {
  test("the epic, and what follows the #", () => {
    expect(parseTarget("seo")).toEqual({ epic: "seo" })
    expect(parseTarget("seo#J3")).toEqual({ epic: "seo", ref: "J3" })
    expect(() => parseTarget("#J3")).toThrow(/<epic>#<id>/)
    expect(() => parseTarget("seo#")).toThrow(/<epic>#<id>/)
  })

  test("phaseOf():  P3, p3 and 3 are phase 3;  a stable id is itself;  an item, or a name, isn't", () => {
    expect(["P3", "p3", "3", "p-epic-migrate", "J3", "epic-migrate"].map((ref) => phaseOf(ref))).toEqual([
      "3",
      "3",
      "3",
      "p-epic-migrate",
      undefined,
      undefined
    ])
  })

  test("a phase verb takes a phase's id or name too (the tool finds it);  update and commit its id", () => {
    expect(planDocArgs("phase", ["seo#epic-migrate", "done"])).toEqual([["phase", "seo", "epic-migrate", "done"]])
    expect(planDocArgs("updated", ["seo#Epic Migrate", "<p>x</p>"])).toEqual([
      ["updated", "seo", "Epic Migrate", "<p>x</p>"]
    ])
    expect(planDocArgs("update", ["seo#p-epic-migrate", "--estimate", "2h"])).toEqual([
      ["estimate", "seo", "p-epic-migrate", "2h"]
    ])
    expect(planDocArgs("commit", ["seo#p-epic-migrate", "abc1234", "did it"])).toEqual([
      ["commit", "seo", "abc1234", "did it", "--phase", "p-epic-migrate"]
    ])
  })
})

describe("phaseRanges()", () => {
  test("refuses what isn't phases, and a range that runs backwards", () => {
    expect(() => phaseRanges("P3-")).toThrow(/phases and ranges/)
    expect(() => phaseRanges("P6-P3")).toThrow(/runs backwards/)
  })
})
