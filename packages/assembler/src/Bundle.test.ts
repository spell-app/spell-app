import { existsSync, mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { afterAll, describe, expect, test } from "vite-plus/test"

import { AS } from "$/assembler"

/** Write `text` at `path` under `root`, making folders. */
function put(root: string, path: string, text: string): void {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), text)
}

/** A bundle whose build is a `node -e` script:  it writes `out/entry.js`, or fails when `src/FAIL` exists. */
const SPEC: AS.BundleSpec = {
  name: "demo",
  title: "a demo bundle",
  cwd: "pkg",
  run: [
    process.execPath,
    "-e",
    `const fs = require("fs");  if (fs.existsSync("src/FAIL")) process.exit(3);  fs.mkdirSync("out", { recursive: true });  fs.writeFileSync("out/entry.js", "built")`
  ],
  output: "pkg/out",
  entry: "entry.js",
  sources: ["pkg/src", "pkg/config.ts", "pkg/missing.ts"]
}

describe("Bundle", () => {
  const root = mkdtempSync(join(tmpdir(), "assembler-bundle-"))
  put(root, "pkg/src/a.ts", "a")
  put(root, "pkg/src/deep/b.tsx", "b")
  put(root, "pkg/src/a.test.ts", "test")
  put(root, "pkg/src/deep/b.browser.test.tsx", "test")
  put(root, "pkg/src/__snapshots__/a.test.ts.snap", "snap")
  put(root, "pkg/src/.hidden", "dot")
  put(root, "pkg/src/icons/icon-packs/pack/x.svg", "<svg/>")
  put(root, "pkg/config.ts", "config")
  const bundle = new AS.Bundle(root, SPEC)

  afterAll(() => rmSync(root, { recursive: true, force: true }))

  test("its sources:  every file under them, sorted;  NEVER tests, snapshots, dot files or the icon packs", () => {
    expect(bundle.sourceFiles()).toEqual(["pkg/config.ts", "pkg/src/a.ts", "pkg/src/deep/b.tsx"])
  })

  test("stale until built, current after;  stale again when a source changes, or its entry goes", () => {
    expect(bundle.check()).toEqual({
      name: "demo",
      output: "pkg/out",
      sources: bundle.sourcesHash(),
      stale: "never built"
    })
    const built = bundle.build({ stdio: "ignore" })
    expect(built).toMatchObject({ name: "demo", sources: bundle.sourcesHash() })
    expect(bundle.record()).toMatchObject({ sources: built.sources })
    expect(bundle.isStale).toBe(false)

    put(root, "pkg/src/a.test.ts", "a test changed")
    expect(bundle.isStale).toBe(false)
    put(root, "pkg/src/a.ts", "a changed")
    expect(bundle.check().stale).toBe("built from older sources")
    bundle.build({ stdio: "ignore" })
    expect(bundle.isStale).toBe(false)

    put(root, "pkg/missing.ts", "now there")
    expect(bundle.check().stale).toBe("built from older sources")
    bundle.build({ stdio: "ignore" })
    const later = new Date(Date.now() + 60_000)
    utimesSync(join(root, "pkg/out/entry.js"), later, later)
    expect(bundle.check().stale).toBe("entry.js changed since")
    rmSync(join(root, "pkg/out/entry.js"))
    expect(bundle.check().stale).toBe("no entry.js")
  })

  test("a failed build throws, naming the command, and records nothing", () => {
    rmSync(join(root, "pkg/out"), { recursive: true, force: true })
    put(root, "pkg/src/FAIL", "")
    expect(() => bundle.build({ stdio: "ignore" })).toThrow(/^Bundle\.build\(\):  `.+` \(in pkg\) failed:  exit 3$/)
    expect(existsSync(bundle.recordFile)).toBe(false)
    expect(bundle.check().stale).toBe("never built")
  })
})

describe("Bundle.all()", () => {
  test("every bundle, or the ones named, in that order;  an unknown name says which there are", () => {
    expect(AS.Bundle.all("/repo").map((bundle) => bundle.name)).toEqual(["ui-site", "brand"])
    expect(AS.Bundle.all("/repo", ["brand", "ui-site"]).map((bundle) => bundle.outputDir)).toEqual([
      "/repo/packages/brand/_assets/ui",
      "/repo/packages/ui/site/_assets"
    ])
    expect(() => AS.Bundle.all("/repo", ["nope"])).toThrow("Bundle.all():  no bundle 'nope';  bundles:  ui-site, brand")
  })
})
