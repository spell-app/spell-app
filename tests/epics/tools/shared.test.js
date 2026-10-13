import { execFileSync } from "node:child_process"
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { afterAll, describe, expect, it } from "vite-plus/test"

import { findPages } from "../../../packages/epics/tools/pages.js"
import { PlanDoc, PlanDocFiles, sharedDocLog } from "../../../packages/epics/tools/plan-doc.js"
import {
  docsEndMentions,
  docsEndPath,
  relinkDocsPackage,
  reorgShared,
  repairCheckout
} from "../../../packages/epics/tools/relocate.js"

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

    // the plan-doc tool's own template, in <epic-*> markup (epic `epic-components` P8)
    const plan = PlanDoc.parse(readFileSync(new PlanDocFiles().template, "utf8"))
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

describe("reorgShared", () => {
  it("splits the old content folder into root folders, leaves old-path links, fixes links;  re-runs move only what's new", () => {
    const dir = join(temp, "reorg/dev")
    const checkout = join(temp, "reorg/checkout")
    put("reorg/checkout/packages/ui/src/a.ts", "export {}\n")
    put("reorg/checkout/packages/epics/tools/_assets/spell-doc.css", "")
    put(
      "reorg/dev/packages/docs/content/index.html",
      '<link href="../tools/_assets/spell-doc.css"><spell-site-header root="../../.."></spell-site-header>' +
        '<a href="solid/solid-2.html" target="src-packages-docs-content-solid-solid-2-html">s</a> ' +
        '<a href="epics/x/x.plan.html" target="x">x</a>\n'
    )
    put(
      "reorg/dev/packages/docs/content/solid/solid-2.html",
      '<a href="../../../ui/src/a.ts" target="src-packages-ui-src-a-ts">a</a> <a href="../index.html">home</a> ' +
        "<code>packages/docs/content/solid/solid-2.md</code>\n"
    )
    put("reorg/dev/packages/docs/content/epics/x/x.plan.html", '<a href="../../solid/solid-2.html">s</a>\n')
    put("reorg/dev/packages/docs/content/details/d.html", "<p>d</p>\n")
    put("reorg/dev/goals/g.html", '<a href="../packages/docs/content/templates/t.html">t</a>\n')
    put("reorg/dev/packages/docs/content/templates/t.html", "<p>t</p>\n")

    const report = reorgShared(dir, checkout)
    expect(report.moved).toEqual([
      "packages/docs/content/details -> pages/details",
      "packages/docs/content/epics -> epics",
      "packages/docs/content/index.html -> pages/index.html",
      "packages/docs/content/solid -> guides/solid",
      "packages/docs/content/templates -> templates"
    ])
    expect(readlinkSync(join(dir, "packages/docs/content/epics"))).toBe("../../../epics")
    expect(readlinkSync(join(dir, "packages/docs/content/index.html"))).toBe("../../../pages/index.html")
    expect(readFileSync(join(dir, "pages/index.html"), "utf8")).toBe(
      '<link href="../packages/epics/tools/_assets/spell-doc.css"><spell-site-header root=".."></spell-site-header>' +
        '<a href="../guides/solid/solid-2.html" target="src-guides-solid-solid-2-html">s</a> ' +
        '<a href="../epics/x/x.plan.html" target="x">x</a>\n'
    )
    expect(readFileSync(join(dir, "guides/solid/solid-2.html"), "utf8")).toBe(
      '<a href="../../packages/ui/src/a.ts" target="src-packages-ui-src-a-ts">a</a> <a href="../../pages/index.html">home</a> ' +
        "<code>guides/solid/solid-2.md</code>\n"
    )
    expect(readFileSync(join(dir, "epics/x/x.plan.html"), "utf8")).toBe(
      '<a href="../../guides/solid/solid-2.html">s</a>\n'
    )
    expect(readFileSync(join(dir, "goals/g.html"), "utf8")).toBe('<a href="../templates/t.html">t</a>\n')
    expect(readFileSync(join(dir, ".gitignore"), "utf8")).toContain("pages/details/")
    expect(reorgShared(dir, checkout)).toEqual({ moved: [], merged: [], conflicts: [], links: [], rewritten: [] })

    // older code, through the old-path links:  a new guide at the old place, an old-depth link in a plan doc
    put("reorg/dev/packages/docs/content/new.html", '<a href="../../ui/src/a.ts">a</a>\n')
    writeFileSync(join(dir, "epics/x/x.plan.html"), '<a href="../../../../ui/src/a.ts">a</a>\n')
    const again = reorgShared(dir, checkout)
    expect(again.moved).toEqual(["packages/docs/content/new.html -> guides/new.html"])
    expect(lstatSync(join(dir, "packages/docs/content/new.html")).isSymbolicLink()).toBe(true)
    expect(readFileSync(join(dir, "guides/new.html"), "utf8")).toBe('<a href="../packages/ui/src/a.ts">a</a>\n')
    expect(readFileSync(join(dir, "epics/x/x.plan.html"), "utf8")).toBe('<a href="../../packages/ui/src/a.ts">a</a>\n')
    expect(existsSync(join(dir, "epics/x/x.plan.html.lock"))).toBe(false)
  })

  it("points links into Spell UI's pages at the shared ui/ (claude-design P6), a plan doc's parts included", () => {
    const dir = join(temp, "reorg-ui/dev")
    const checkout = join(temp, "reorg-ui/checkout")
    put("reorg-ui/checkout/packages/ui/site/_assets/site.js", "export {}\n")
    put(
      "reorg-ui/dev/guides/g.html",
      '<a href="../packages/ui/site/components/ui-card.html" target="src-packages-ui-site-components-ui-card-html">c</a> ' +
        '<a href="../packages/ui/site/_assets/site.js">js</a> <a href="../packages/ui/site/">site</a> ' +
        '<a href="../packages/ui/site/_data/search.json">s</a>\n'
    )
    put("reorg-ui/dev/epics/y/y.plan.html", "<p>y</p>\n")
    put(
      "reorg-ui/dev/epics/y/parts/c1.htm",
      '<a href="../../../packages/ui/site/README.md" target="src-packages-ui-site-readme-md">r</a>\n'
    )
    // a part named `.html` (Q12 of `epic-components`) is still a part:  its links retargeted, no page repairs
    put(
      "reorg-ui/dev/epics/y/parts/c2.html",
      '<a href="../../../packages/ui/site/README.md" target="src-packages-ui-site-readme-md">r</a>\n'
    )
    const report = reorgShared(dir, checkout)
    expect(report.rewritten).toEqual(["epics/y/parts/c1.htm", "epics/y/parts/c2.html", "guides/g.html"])
    expect(readFileSync(join(dir, "epics/y/parts/c2.html"), "utf8")).toBe(
      '<a href="../../../ui/README.md" target="src-ui-readme-md">r</a>\n'
    )
    expect(readFileSync(join(dir, "guides/g.html"), "utf8")).toBe(
      '<a href="../ui/components/ui-card.html" target="src-ui-components-ui-card-html">c</a> ' +
        '<a href="../packages/ui/site/_assets/site.js">js</a> <a href="../packages/ui/site/">site</a> ' +
        '<a href="../ui/_data/search.json">s</a>\n'
    )
    expect(readFileSync(join(dir, "epics/y/parts/c1.htm"), "utf8")).toBe(
      '<a href="../../../ui/README.md" target="src-ui-readme-md">r</a>\n'
    )
    expect(existsSync(join(dir, "epics/y/y.plan.html.lock"))).toBe(false)
  })

  it("points links into the docs package's tools at packages/epics/ (people-and-orgs P16), every turn", () => {
    const dir = join(temp, "reorg-docs/dev")
    const checkout = join(temp, "reorg-docs/checkout")
    // older code wrote a page the old way, linking the old tools folder
    put(
      "reorg-docs/dev/guides/g.html",
      '<script src="../packages/docs/tools/_assets/spell-ui.js"></script> ' +
        '<a href="../packages/docs/tools/pages.js" target="src-packages-docs-tools-pages-js">' +
        "<code>packages/docs/tools/pages.js</code></a>\n"
    )
    expect(reorgShared(dir, checkout).rewritten).toEqual(["guides/g.html"])
    // links and their tab names;  mentions are the one-off relink's (a page in place may tell history)
    expect(readFileSync(join(dir, "guides/g.html"), "utf8")).toBe(
      '<script src="../packages/epics/tools/_assets/spell-ui.js"></script> ' +
        '<a href="../packages/epics/tools/pages.js" target="src-packages-epics-tools-pages-js">' +
        "<code>packages/docs/tools/pages.js</code></a>\n"
    )
  })
})

describe("the docs package's end (people-and-orgs P16)", () => {
  it("maps the docs package's tools and own files into packages/epics/, a tool's test into tests/", () => {
    expect(docsEndPath("packages/docs/tools/_assets/spell-doc.css")).toBe("packages/epics/tools/_assets/spell-doc.css")
    expect(docsEndPath("packages/docs/tools/")).toBe("packages/epics/tools")
    expect(docsEndPath("packages/docs/AGENTS.md")).toBe("packages/epics/AGENTS.md")
    expect(docsEndPath("packages/docs/tools/index.test.js")).toBe("tests/epics/tools/index.test.js")
    // the old content layout's paths are the reorg's
    expect(docsEndPath("packages/docs/content/index.html")).toBeUndefined()
    expect(docsEndPath("packages/docs/solid/solid-2.md")).toBeUndefined()
  })

  it("rewrites mentions, but not inside a link, a URL, or a line telling the move's story", () => {
    expect(
      docsEndMentions(
        "<code>packages/docs/tools/pages.js</code> and `packages/docs/AGENTS.md` (`packages/docs/tools/`)\n" +
          '<a href="../packages/docs/tools/x.js">/packages/docs/tools/_assets/x.css</a>\n' +
          "moved from `packages/docs/tools/` to `packages/epics/tools/`\n" +
          "packages/docs/content/epics and packages/docs/toolsy stay\n"
      )
    ).toBe(
      "<code>packages/epics/tools/pages.js</code> and `packages/epics/AGENTS.md` (`packages/epics/tools/`)\n" +
        '<a href="../packages/docs/tools/x.js">/packages/docs/tools/_assets/x.css</a>\n' +
        "moved from `packages/docs/tools/` to `packages/epics/tools/`\n" +
        "packages/docs/content/epics and packages/docs/toolsy stay\n"
    )
  })

  it("relinks a shared repo once:  links, tab names and mentions;  the epic's own pages keep their story", () => {
    const dir = join(temp, "relink/dev")
    const page =
      '<link href="../../packages/docs/tools/_assets/spell-doc.css" />\n' +
      '<a href="../../packages/docs/tools/pages.js" target="src-packages-docs-tools-pages-js"\n' +
      '  ><code title="packages/docs/tools/pages.js">pages.js</code></a>\n' +
      '<a href="../../packages/docs/AGENTS.md#links" target="src-packages-docs-agents-md">rules</a>\n'
    put("relink/dev/epics/x/x.plan.html", page)
    put("relink/dev/epics/people-and-orgs/parts/p16.html", "<code>packages/docs/tools/</code> goes\n")
    put(
      "relink/dev/agents/PAPERCUTS.md",
      "- fixed in `packages/docs/tools/pages.js` ([it](../packages/docs/tools/pages.js))\n"
    )
    put("relink/dev/guides/commands.json", '{ "file": "packages/docs/tools/index.js" }\n')
    put("relink/dev/guides/same.html", "<p>nothing to do</p>\n")

    const dry = relinkDocsPackage(dir, { dryRun: true })
    expect(dry).toEqual({
      rewritten: ["agents/PAPERCUTS.md", "epics/x/x.plan.html", "guides/commands.json"],
      links: 4,
      targets: 2,
      mentions: 3
    })
    expect(readFileSync(join(dir, "epics/x/x.plan.html"), "utf8")).toBe(page)

    expect(relinkDocsPackage(dir)).toEqual(dry)
    expect(readFileSync(join(dir, "epics/x/x.plan.html"), "utf8")).toBe(
      '<link href="../../packages/epics/tools/_assets/spell-doc.css" />\n' +
        '<a href="../../packages/epics/tools/pages.js" target="src-packages-epics-tools-pages-js"\n' +
        '  ><code title="packages/epics/tools/pages.js">pages.js</code></a>\n' +
        '<a href="../../packages/epics/AGENTS.md#links" target="src-packages-epics-agents-md">rules</a>\n'
    )
    expect(readFileSync(join(dir, "agents/PAPERCUTS.md"), "utf8")).toBe(
      "- fixed in `packages/epics/tools/pages.js` ([it](../packages/epics/tools/pages.js))\n"
    )
    expect(readFileSync(join(dir, "guides/commands.json"), "utf8")).toBe(
      '{ "file": "packages/epics/tools/index.js" }\n'
    )
    expect(readFileSync(join(dir, "epics/people-and-orgs/parts/p16.html"), "utf8")).toBe(
      "<code>packages/docs/tools/</code> goes\n"
    )
    expect(existsSync(join(dir, "epics/x/x.plan.html.lock"))).toBe(false)
    // idempotent
    expect(relinkDocsPackage(dir)).toEqual({ rewritten: [], links: 0, targets: 0, mentions: 0 })
  })

  it("repairCheckout:  a checkout with no packages/docs has nothing to move;  a merged-back tools folder is reported", () => {
    const root = join(temp, "checkout-end")
    mkdirSync(join(root, "packages"), { recursive: true })
    const none = { moved: [], same: [], conflicts: [], linked: [], leftovers: [] }
    expect(repairCheckout(root, { dryRun: true })).toEqual(none)
    put("checkout-end/packages/docs/tools/pages.js", "export {}\n")
    expect(repairCheckout(root, { dryRun: true })).toEqual({ ...none, leftovers: ["packages/docs/tools"] })
  })
})
