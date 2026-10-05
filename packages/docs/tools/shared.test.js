import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { afterAll, describe, expect, it } from "vite-plus/test"

import { DOCS, findPages } from "./pages.js"
import { PlanDoc, sharedDocLog } from "./plan-doc.js"
import { repairCheckout } from "./relocate.js"

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

describe("repairCheckout", () => {
  it("moves stray pages into content with their links relocated, and repairs old links in content", () => {
    const root = join(temp, "checkout-repair")
    mkdirSync(root)
    execFileSync("git", ["init", "-q"], { cwd: root })
    put("checkout-repair/packages/server/src/a.ts", "export {}\n")
    put("checkout-repair/packages/docs/package.json", "{}\n")
    put("checkout-repair/packages/docs/content/index.html", "<p>index</p>\n")
    // a page a branch from before the move added at the old place, linking the old way
    put("checkout-repair/packages/docs/stray.html", '<a href="../server/src/a.ts">a</a> <a href="index.html">i</a>\n')
    // the same page already in content:  its old copy is just dropped;  a different one:  a conflict
    put("checkout-repair/packages/docs/dup.html", "<p>dup</p>\n")
    put("checkout-repair/packages/docs/content/dup.html", "<p>dup</p>\n")
    put("checkout-repair/packages/docs/clash.html", "<p>old</p>\n")
    put("checkout-repair/packages/docs/content/clash.html", "<p>new</p>\n")
    // a content page an old-layout edit gave an old-relative link
    put("checkout-repair/packages/docs/content/old-link.html", '<a href="../server/src/a.ts">a</a>\n')
    put("checkout-repair/PAPERCUTS.md", "# Papercuts\n")
    execFileSync("git", ["add", "-A"], { cwd: root })

    expect(repairCheckout(root, { dryRun: true })).toEqual({
      moved: ["packages/docs/stray.html"],
      same: ["packages/docs/dup.html"],
      conflicts: ["packages/docs/clash.html"],
      linked: ["packages/docs/content/old-link.html"],
      leftovers: ["PAPERCUTS.md"]
    })
    expect(existsSync(join(root, "packages/docs/content/stray.html"))).toBe(false)

    repairCheckout(root)
    expect(readFileSync(join(root, "packages/docs/content/stray.html"), "utf8")).toBe(
      '<a href="../../server/src/a.ts">a</a> <a href="index.html">i</a>\n'
    )
    expect(readFileSync(join(root, "packages/docs/content/old-link.html"), "utf8")).toBe(
      '<a href="../../server/src/a.ts">a</a>\n'
    )
    expect(existsSync(join(root, "packages/docs/stray.html"))).toBe(false)
    expect(existsSync(join(root, "packages/docs/dup.html"))).toBe(false)
    expect(readFileSync(join(root, "packages/docs/clash.html"), "utf8")).toBe("<p>old</p>\n")
    const tracked = execFileSync("git", ["ls-files", "packages/docs/stray.html", "packages/docs/dup.html"], {
      cwd: root,
      encoding: "utf8"
    })
    expect(tracked).toBe("")
  })
})
