import { execFileSync } from "node:child_process"
import path from "node:path"

import { describe, expect, test } from "vite-plus/test"

/** spell-app's checkout. */
const ROOT = path.resolve(import.meta.dirname, "../..")

/**
 * The example apps' table, in `README-examples.md`, is made from the example projects (`yarn examples:readme`):
 * a new example, or a changed `description` in a project file, fails this until the page is made again.
 * - The script's own `--check`:  it compares the table cell by cell, and looks for each example's picture.
 */
describe("README-examples.md", () => {
  test("lists every example and library project, each example with its picture", () => {
    const run = () =>
      execFileSync(process.execPath, ["--import", "tsx", "scripts/examples-readme.ts", "--check"], {
        cwd: ROOT,
        encoding: "utf8",
        stdio: "pipe"
      })
    expect(run).not.toThrow()
  })
})
