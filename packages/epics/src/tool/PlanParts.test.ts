/**
 * Tests of `PlanParts`:  reading a part file, and rebasing a part's URLs.  Splitting and writing:
 * `PlanDocFiles.test.ts` (`EpicParts`);  an old-markup doc's parts:  `$/epics/convert` `OldParts.test.ts`.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { describe, expect, test } from "vite-plus/test"

import { PlanParts } from "./PlanParts"

describe("PlanParts", () => {
  test("reader():  `parts/<id>.html`;  `undefined` for none, or an old `.htm` (read no more since P15)", () => {
    const dir = mkdtempSync(join(tmpdir(), "plan-parts-"))
    try {
      mkdirSync(join(dir, "parts"))
      writeFileSync(join(dir, "parts", "p1.html"), "new")
      writeFileSync(join(dir, "parts", "c1.htm"), "old")
      const read = PlanParts.reader(join(dir, "x.plan.html"))
      expect(["p1", "c1", "log"].map(read)).toEqual(["new", undefined, undefined])
      expect(PlanParts.partFile(join(dir, "x.plan.html"), "p1")).toBe(join(dir, "parts", "p1.html"))
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test("rebasing to a part and back is exact", () => {
    for (const url of ["a/b.html", "../../x.ts", "parts/q1.html", "./y", "../z#h"])
      expect(PlanParts.toPage(PlanParts.toPart(url))).toBe(url)
    expect(PlanParts.toPart("../../guides/x.html")).toBe("../../../guides/x.html")
  })
})
