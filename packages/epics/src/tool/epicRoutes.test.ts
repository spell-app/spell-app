/**
 * Tests of the New epic route's work, in a scratch checkout:  a future epic made from the page.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, expect, test, vi } from "vite-plus/test"

import { FROM_PAGE, epicName, newEpic } from "./epicRoutes"

const root = mkdtempSync(join(tmpdir(), "epic-routes-"))
mkdirSync(join(root, "epics"))
// the scratch checkout has no docs tools:  the docs index isn't rebuilt, and says so on stderr
vi.spyOn(process.stderr, "write").mockImplementation(() => true)

afterAll(() => rmSync(root, { recursive: true, force: true }))

test("an epic's name:  the title, lower-kebab-cased;  a reserved word gets `-epic`", () => {
  expect(epicName("Docs Index:  the Second Go!")).toBe("docs-index-the-second-go")
  expect(epicName("Review")).toBe("review-epic")
  expect(() => epicName("!!!")).toThrow(/nothing to name/)
})

test("makes a future epic with the prompt quoted, its log saying it came from the page;  a taken name gets `-2`", async () => {
  expect(await newEpic(root, "Phone Review", "Review plan docs from my phone.")).toBe("phone-review")
  const html = readFileSync(join(root, "epics", "phone-review", "phone-review.plan.html"), "utf8")
  expect(html).toMatch(/<epic-page[^>]*\bfuture\b/)
  expect(html).toContain("Review plan docs from my phone.")
  expect(readFileSync(join(root, "epics", "phone-review", "parts", "log.html"), "utf8")).toContain(FROM_PAGE)
  expect(await newEpic(root, "Phone Review", "")).toBe("phone-review-2")
})
