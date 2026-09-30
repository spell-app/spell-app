import { spawn, spawnSync } from "child_process"
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { resolve } from "path"
import { afterAll, beforeAll, describe, test, expect } from "vitest"

import { SP } from "~/languages/spell"
import { fixturePath } from "~/test"

/**
 * The real `spell` command, end to end:  `bin/spell.mjs` run as a separate process, as a user would.
 * - No terminal:  stdin / stdout are pipes, so nothing asks questions or draws screens.
 * - NEVER writes into a fixture:  compiles use `--stdout`.  Projects to break live in a temp folder -- see `tempProject()`.
 */
const SPELL = resolve(import.meta.dirname, "..", "bin", "spell.mjs")

/** Temp folder holding `tempProject()`s -- its REAL path:  on macOS `tmpdir()` is a symlink, and spell reports real paths. */
const TEMP = realpathSync(mkdtempSync(resolve(tmpdir(), "spell-cli-")))
afterAll(() => rmSync(TEMP, { recursive: true, force: true }))

/** A throwaway project `name` in `TEMP`, of one file `<name>.spell` holding `source`.  Returns its folder. */
function tempProject(name: string, source: string): string {
  const folder = resolve(TEMP, name)
  mkdirSync(folder)
  writeFileSync(
    resolve(folder, SP.PROJECT_FILE),
    JSON.stringify({ imports: [{ path: `/${name}.spell`, active: true }] })
  )
  writeFileSync(resolve(folder, `${name}.spell`), source)
  return folder
}

/** Run `spell ...args` from `cwd`. */
function spell(args: string[], cwd = fixturePath()) {
  const { status, stdout, stderr } = spawnSync(process.execPath, [SPELL, ...args], { cwd, encoding: "utf8" })
  return { status, stdout, stderr }
}

describe("spell compile", () => {
  test("--stdout prints exactly the fixture's snapshot", () => {
    const { status, stdout, stderr } = spell(["compile", "@test/FizzBuzz", "--stdout"])
    expect(stderr).toContain("✓ @test:fixtures:FizzBuzz")
    expect(status).toBe(0)
    expect(stdout).toBe(readFileSync(fixturePath("FizzBuzz", `FizzBuzz${SP.SNAPSHOT_JS_SUFFIX}`), "utf8"))
  })

  test("a spell file prints its javascript", () => {
    const { status, stdout } = spell(["compile", "Card.spell"], fixturePath("Solitaire"))
    expect(status).toBe(0)
    // after the file's heading and docstring
    expect(stdout).toMatch(/^spellCore\.heading\(.*\n.*\n\/\*! SPELL: DECLARES \{\n {2}type: "Card"/)
  })

  test("a bare root, with no terminal to ask on, lists its projects", () => {
    const { status, stdout, stderr } = spell(["compile", "@test"])
    expect(status).toBe(2)
    expect(stdout).toBe("")
    expect(stderr).toContain("@test holds several projects -- name one, or pass --all:\n  @test:fixtures:FizzBuzz\n")
  })

  test("an unknown target", () => {
    const { status, stderr } = spell(["compile", "@nope"])
    expect(status).toBe(2)
    expect(stderr).toContain("'@nope' isn't a project")
  })
})

describe("spell check", () => {
  /** A project with one bad line. */
  let broken: string
  beforeAll(() => {
    broken = tempProject("Broken", 'print "fine"\nflibbertigibbet the wombat\n')
  })

  test("a clean project:  nothing on stdout, exit 0", () => {
    const { status, stdout, stderr } = spell(["check", "@test/Solitaire"])
    expect(stderr).toContain("✓ @test:fixtures:Solitaire")
    expect(stdout).toBe("")
    expect(status).toBe(0)
  })

  test("errors on stdout as path:line:col, exit 1", () => {
    const { status, stdout, stderr } = spell(["check", "."], broken)
    expect(stderr).toContain("1 error")
    expect(stdout).toBe('Broken.spell:2:1  Don\'t understand "flibbertigibbet the wombat"\n')
    expect(status).toBe(1)
  })

  test("--json", () => {
    const { stdout } = spell(["check", "Broken.spell", "--json"], broken)
    expect(JSON.parse(stdout)).toEqual([
      expect.objectContaining({ path: resolve(broken, "Broken.spell"), line: 2, column: 1 })
    ])
  })
})

describe("spell describe", () => {
  test("a file:  what it declares", () => {
    const { status, stdout } = spell(["describe", "Card.spell"], fixturePath("Solitaire"))
    expect(status).toBe(0)
    expect(stdout).toMatch(/^Card\.spell\n {2}type Card {2}is a Thing\n/)
  })

  test("one thing, by name -- ignoring case, and spaces ~== `_`", () => {
    const { status, stdout } = spell(["describe", ".", "STOCK pile"], fixturePath("Solitaire"))
    expect(status).toBe(0)
    expect(stdout).toMatch(/^type Stock_Pile is a Pile\nSolitaire\.spell:\d+\n/)
  })

  test("a member of a thing", () => {
    const { stdout } = spell(["describe", "@test/Solitaire", "card", "color"])
    expect(stdout).toMatch(/^property color of Card\n/)
  })

  test("an unknown name", () => {
    const { status, stderr } = spell(["describe", "@test/Solitaire", "wombat"])
    expect(status).toBe(2)
    expect(stderr).toContain("Nothing called 'wombat' in @test/Solitaire")
  })
})

describe("spell run", () => {
  test("runs the program:  its prints on stdout -- and writes nothing into the project", () => {
    const { status, stdout } = spell(["run", "@test/FizzBuzz"])
    expect(stdout).toMatch(/^1\n2\n3 fizz\n4\n5 buzz\n/)
    expect(stdout).toContain("15 fizzbuzz\n")
    expect(status).toBe(0)
    expect(existsSync(fixturePath("FizzBuzz", `FizzBuzz${SP.COMPILED_JS_SUFFIX}`))).toBe(false)
  })

  test("skips what needs a browser, and says so", () => {
    const { status, stderr } = spell(["run", "@test/Solitaire"])
    expect(stderr).toContain("Solitaire shows a UI (start the game), which needs a browser")
    expect(status).toBe(0)
  })
})

describe("spell test", () => {
  test("reports each test -- counting one the project ran itself only once", () => {
    const { status, stdout } = spell(["test", "@test/Solitaire"])
    expect(stdout).toMatch(
      /^✓ test card setup {2}\(\d+ checks\)\n✓ test deck creation {2}\(\d+ checks\)\n\n2 passed\n$/
    )
    expect(status).toBe(0)
  })

  test("a failing check:  ✗, what failed, exit 1", () => {
    const failing = tempProject("Failing", "to test math\n\texpect 1 + 1 to be 2\n\texpect 2 + 2 to be 5\n")
    const { status, stdout } = spell(["test", "."], failing)
    expect(stdout).toContain("✗ test math  (2 checks)\n    ❌ Unexpected: `2 + 2` should be `5` but is actually `4`\n")
    expect(stdout).toContain("0 passed, 1 failed")
    expect(status).toBe(1)
  })

  test("a project with no tests says so", () => {
    const { status, stderr } = spell(["test", "@test/FizzBuzz"])
    expect(stderr).toContain("FizzBuzz has no tests")
    expect(status).toBe(0)
  })
})

describe("spell watch", () => {
  test("rebuilds as files change -- showing errors come and go -- until interrupted", async () => {
    const watched = tempProject("Watched", 'print "hello"\n')
    const child = spawn(process.execPath, [SPELL, "watch", "."], { cwd: watched, stdio: ["ignore", "pipe", "pipe"] })
    let log = ""
    child.stderr.on("data", (data) => (log += data))

    await until(() => log.includes("✓"))
    writeFileSync(resolve(watched, "Watched.spell"), 'print "hello"\nflibbertigibbet the wombat\n')
    await until(() => log.includes("1 error"))
    expect(log).toContain('    Watched.spell:2:1  Don\'t understand "flibbertigibbet the wombat"')
    writeFileSync(resolve(watched, "Watched.spell"), 'print "hello again"\n')
    await until(() => log.split("✓").length > 2)
    expect(readFileSync(resolve(watched, `Watched${SP.COMPILED_JS_SUFFIX}`), "utf8")).toContain("hello again")

    child.kill("SIGINT")
    expect(await new Promise((done) => child.on("exit", done))).toBe(0)
  }, 30_000)
})

/** Resolve once `condition()` holds, checking every 50ms -- or reject after `ms`. */
async function until(condition: () => boolean, ms = 15_000): Promise<void> {
  const start = Date.now()
  while (!condition()) {
    if (Date.now() - start > ms) throw new Error("timed out")
    await new Promise((done) => setTimeout(done, 50))
  }
}
