/**
 * Tests of `tools/pages.js`' helpers for the docs tools' command lines.
 */
import { expect, test } from "vite-plus/test"

import { pageAndId } from "../../../packages/epics/tools/pages.js"

// epic `epic-workflow` P19:  a docs page's comment named as an epic page's is, `seo#M3`
test("pageAndId():  `<page>#<id>` is the page and the id;  the two words read the same", () => {
  expect(pageAndId(["guides/x.html#M3", "on"])).toEqual(["guides/x.html", "M3", "on"])
  expect(pageAndId(["guides/x.html", "cm3", "on"])).toEqual(["guides/x.html", "cm3", "on"])
  expect(pageAndId(["guides/x.html#n3"])).toEqual(["guides/x.html", "n3"])
  expect(pageAndId([])).toEqual([])
})
