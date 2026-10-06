import { execFileSync } from "child_process"
import { mkdtempSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { join, resolve } from "path"
import { afterAll, beforeAll, describe, test, expect } from "vite-plus/test"

import environment from "$/spell/node/environment"
import { compiledFixture, fixturePath, fixtureProjectNames, tscBinary } from "$/spell/test"

/**
 * Every fixture project compiled as TypeScript (the `ts/solid` target, `P.TSWriter`), checked by `tsc` against
 * `@spell/core`'s own types -- what it reports, against `projects/test/<Project>/<Project>.snapshot.tsc.txt`.
 * - So every place the typed output falls short shows, as a line of that file:  a change is a diff to read.
 *   Blessed with the fixtures:  `yarn test:fixtures:bless`.
 * - `strict`, as `core` itself is -- but NOT `strictFunctionTypes`:  `core` types every callback's item `unknown`
 *   (`CollectionIterationCallback`), so a callback taking a `Card` couldn't be passed to it.
 * - Errors in `core`'s own files fail the test:  only the fixtures' may be listed.
 */
const REPO = resolve(environment.srcDir, "../../..")
const CORE = `${REPO}/packages/core`

let folder: string
/** `tsc`'s errors, by fixture:  `"<line>:<column> TS<code> <message>"`. */
const errors: Record<string, string[]> = {}
/** `tsc`'s errors outside the fixtures. */
const otherErrors: string[] = []

beforeAll(() => {
  folder = mkdtempSync(join(tmpdir(), "spell-tsc-"))
  const names = fixtureProjectNames()
  for (const name of names) {
    writeFileSync(join(folder, `${name}.ts`), compiledFixture(name, "ts/solid"))
    errors[name] = []
  }
  writeFileSync(join(folder, "tsconfig.json"), JSON.stringify(tsconfig(names), null, 2))
  for (const line of runTsc(folder)) {
    const found = line.match(/^(.*?)\((\d+),(\d+)\): error (TS\d+): (.*)$/)
    const name = found && names.find((it) => found[1] === `${it}.ts`)
    if (found && name) errors[name]!.push(`${found[2]}:${found[3]} ${found[4]} ${found[5]}`)
    else otherErrors.push(line)
  }
}, 60_000)

afterAll(() => rmSync(folder, { recursive: true, force: true }))

describe("fixture projects as TypeScript, checked by tsc", () => {
  test("core's own files check clean", () => {
    expect(otherErrors).toEqual([])
  })

  test("FizzBuzz checks clean", () => {
    expect(errors.FizzBuzz).toEqual([])
  })

  for (const name of fixtureProjectNames()) {
    test(name, async () => {
      const text = errors[name]!.map((error) => `${error}\n`).join("")
      await expect(text).toMatchFileSnapshot(fixturePath(name, `${name}.snapshot.tsc.txt`))
    })
  }
})

/** A `tsconfig.json` checking fixture `names`' `.ts` files, with `@spell/core` pointing at `core`'s source. */
function tsconfig(names: string[]) {
  return {
    extends: `${CORE}/tsconfig.json`,
    compilerOptions: {
      paths: {
        "@spell/core": [`${CORE}/src/index.ts`],
        "$/util": [`${REPO}/packages/util/src/index.ts`],
        "$/util/*": [`${REPO}/packages/util/src/*`],
        "$/core": [`${CORE}/src/index.ts`],
        "$/core/*": [`${CORE}/src/*`]
      },
      // `vite/client` isn't found from a temp folder:  `core` uses none of it
      types: ["node"],
      typeRoots: [`${REPO}/node_modules/@types`],
      noUnusedLocals: false,
      strictFunctionTypes: false
    },
    files: names.map((name) => `${name}.ts`),
    include: [`${REPO}/types`]
  }
}

/** `tsc`'s error lines for the project in `folder`, run there, so a fixture's are `Solitaire.ts(...)`;  none if clean. */
function runTsc(folder: string): string[] {
  try {
    execFileSync(tscBinary(), ["-p", "tsconfig.json", "--pretty", "false"], { cwd: folder, encoding: "utf8" })
    return []
  } catch (error) {
    const { stdout = "", stderr = "" } = error as { stdout?: string; stderr?: string }
    return `${stdout}${stderr}`.split("\n").filter((line) => line.includes("error TS"))
  }
}
