import { execFileSync } from "node:child_process"
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { afterAll, describe, expect, it } from "vite-plus/test"

import { DOCS, findPages } from "./pages.js"
import { PlanDoc, sharedDocLog } from "./plan-doc.js"

/**
 * The docs tools with SHARED content (epic `shared-content`):  `packages/docs/content` a link to a folder in the
 * content repo beside the checkout.  Real links in a temp folder.
 */
const temp = mkdtempSync(join(tmpdir(), "docs-shared-"))
afterAll(() => rmSync(temp, { recursive: true, force: true }))

/** Write `text` at `path` under `temp`, making folders. */
function put(path, text = "<!doctype html><title>x</title>\n") {
  const file = join(temp, path)
  mkdirSync(join(file, ".."), { recursive: true })
  writeFileSync(file, text)
  return file
}

describe("findPages", () => {
  it("walks a linked folder, keeping the link's paths", () => {
    put("peer/content/a.html")
    put("peer/content/epics/x/x.plan.html")
    put("peer/elsewhere/b.html")
    mkdirSync(join(temp, "checkout"))
    symlinkSync("../peer/content", join(temp, "checkout/content"))
    symlinkSync("../elsewhere", join(temp, "peer/content/more"))
    const link = join(temp, "checkout/content")
    expect(findPages(link)).toEqual([
      join(link, "a.html"),
      join(link, "epics/x/x.plan.html"),
      join(link, "more/b.html")
    ])
  })
})

describe("sharedDocLog", () => {
  it("keeps this epic's commits:  `<epic> ...`, or a phase number with that phase's name", () => {
    const checkout = join(temp, "repo")
    mkdirSync(checkout)
    const git = (...args) => execFileSync("git", args, { cwd: checkout, encoding: "utf8" })
    git("init", "-q")
    for (const subject of [
      "P1:  Spike -- the throwaway test",
      "P1:  Other Name -- another epic's P1",
      "P2:  Move Logic Out -- the move",
      "Fix I3:  could be any epic's",
      "demo I3:  this epic's fix",
      "unrelated work"
    ])
      git("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "--allow-empty", "-m", subject)

    const plan = PlanDoc.parse(readFileSync(join(DOCS, "templates/epics/plan.html"), "utf8"))
    plan.addPhase("Spike")
    plan.addPhase("Move Logic Out")
    const file = put("repo/packages/docs/content/epics/demo/demo.plan.html", plan.toString())

    expect(sharedDocLog(file, checkout).map((entry) => entry.subject)).toEqual([
      "demo I3:  this epic's fix",
      "P2:  Move Logic Out -- the move",
      "P1:  Spike -- the throwaway test"
    ])
  })
})
