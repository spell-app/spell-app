import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { expect, test } from "vite-plus/test"

/** This package's folder. */
const PACKAGE = fileURLToPath(new URL("../../../packages/brand/", import.meta.url))

test("`components/__pack/` is CURRENT:  built from the vocabularies and sources as they are -- `yarn pack:build` if not", () => {
  // its own script:  Spell UI's pack tooling (`spell-ui-pack check`), which the brand uses as any pack does
  const check = spawnSync("yarn", ["pack:check"], { cwd: PACKAGE, encoding: "utf8" })
  expect(check.status, check.stdout + check.stderr).toBe(0)
}, 30_000)
