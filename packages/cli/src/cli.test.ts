import { spawn, spawnSync } from "child_process"
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "fs"
import { createServer } from "net"
import { tmpdir } from "os"
import { basename, resolve } from "path"
import { afterAll, beforeAll, describe, test, expect } from "vite-plus/test"

import { SRV } from "$/server"
import { SP } from "$/spell"
import { fixturePath } from "$/spell/test"

/**
 * The real `spell` command, end to end:  `bin/spell.mjs` run as a separate process, as a user would.
 * - No terminal:  stdin / stdout are pipes, so nothing asks questions or draws screens.
 * - NEVER writes into a fixture:  compiles use `--stdout`.  Projects to break live in a temp folder -- see `tempProject()`.
 */
const SPELL = resolve(import.meta.dirname, "..", "bin", "spell.mjs")

/** This checkout:  its page server is the one `spell serve` uses. */
const REPO_ROOT = resolve(import.meta.dirname, "..", "..", "..")
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

describe("spell help", () => {
  test("lists the commands", () => {
    const { status, stdout } = spell(["help"])
    expect(status).toBe(0)
    expect(stdout).toMatch(/^Usage: spell \[options\] \[command\]\n/)
    expect(stdout).toMatch(/^ {2}compile \[options\] \[projects\.\.\.\]/m)
  })

  test("one command", () => {
    const { status, stdout } = spell(["help", "compile"])
    expect(status).toBe(0)
    expect(stdout).toMatch(/^Usage: spell compile \[options\] \[projects\.\.\.\]\n/)
  })

  test("an unknown command", () => {
    const { status, stderr } = spell(["help", "nope"])
    expect(status).toBe(2)
    expect(stderr).toContain("No command 'nope'")
  })
})

describe("spell dev plan-doc", () => {
  test("alone, lists the tool's commands", () => {
    const { status, stderr } = spell(["dev", "plan-doc"])
    expect(status).toBe(2)
    expect(stderr).toMatch(/usage: .*plan-doc <command> <name>/)
  })

  test("summarizes a plan doc", () => {
    const { status, stdout } = spell(["dev", "plan-doc", "summary", "unified-server"])
    expect(status).toBe(0)
    expect(stdout).toMatch(/^Unified Server\n {2}\[x\] P1 · Library Core/)
  })

  test("spell plan-doc:  the deprecated alias, still working", () => {
    const { status, stdout } = spell(["plan-doc", "summary", "unified-server"])
    expect(status).toBe(0)
    expect(stdout).toMatch(/^Unified Server\n/)
  })
})

describe("spell dev", () => {
  test("--help lists its nouns, the pass-throughs too", () => {
    const { status, stdout } = spell(["dev", "--help"])
    expect(status).toBe(0)
    const nouns = [
      "plan-doc",
      "goals",
      "docs",
      "details",
      "choices",
      "server",
      "window",
      "vscode",
      "commands",
      "session"
    ]
    for (const noun of nouns) {
      expect(stdout).toMatch(new RegExp(`^ {2}${noun} `, "m"))
    }
  })

  test("spell --help still lists dev, and the aliases as deprecated", () => {
    const { stdout } = spell(["--help"])
    expect(stdout).toMatch(/^ {2}dev /m)
    expect(stdout).toMatch(/^ {2}plan-doc \[args\.\.\.\] +deprecated: {2}spell dev plan-doc$/m)
  })

  test("a command that loads spell runs through main.ts, as before", () => {
    const { status, stdout } = spell(["dev", "commands", "--json"], REPO_ROOT)
    expect(status).toBe(0)
    expect(JSON.parse(stdout).commands.length).toBeGreaterThan(10)
  })

  test("docs:  no verb, or an unknown one, lists the verbs", () => {
    for (const args of [
      ["dev", "docs"],
      ["dev", "docs", "nope"]
    ]) {
      const { status, stderr } = spell(args)
      expect(status).toBe(2)
      expect(stderr).toContain("update, index, new, open, link")
    }
  })
})

describe("spell dev pass-throughs", () => {
  /** A fake checkout, each tool a script reporting what it got:  `{ tool, args, cwd, tsconfig }`, exiting 3. */
  const CHECKOUT = resolve(TEMP, "checkout")
  /** A folder inside it, to run from:  the tools must still be found. */
  const INSIDE = resolve(CHECKOUT, "packages", "app")
  beforeAll(() => {
    const report = `console.log(JSON.stringify({ tool: import.meta.url.split("/checkout/")[1], args: process.argv.slice(2), cwd: process.cwd(), tsconfig: process.env.TSX_TSCONFIG_PATH }))
process.exit(3)
`
    for (const tool of [
      "scripts/window.mjs",
      "scripts/serve.mjs",
      "packages/docs/tools/open.js",
      "packages/docs/tools/link.ts",
      "packages/docs/tools/fuss.ts",
      "packages/docs/tools/details.js",
      "packages/docs/tools/choices.js",
      "packages/docs/tools/notes.ts",
      "packages/server/src/page/cli.ts"
    ]) {
      mkdirSync(resolve(CHECKOUT, tool, ".."), { recursive: true })
      writeFileSync(resolve(CHECKOUT, tool), report)
    }
    writeFileSync(resolve(CHECKOUT, "packages/docs/tsconfig.json"), "{}")
    writeFileSync(resolve(CHECKOUT, "packages/server/tsconfig.json"), "{}")
    mkdirSync(INSIDE, { recursive: true })
  })

  /** Run `spell dev ...args` in `INSIDE`:  its exit code, and what the fake tool reported. */
  function passThrough(args: string[]) {
    const { status, stdout, stderr } = spell(["dev", ...args], INSIDE)
    return { status, stderr, ...(stdout ? JSON.parse(stdout) : {}) }
  }

  test("window:  the nearest checkout's script, args verbatim, in this folder, its exit code", () => {
    // a checkout with no node_modules, as a worktree before its `yarn install`
    const run = passThrough(["window", "open", "x", "--all", "--json"])
    expect(run).toMatchObject({ status: 3, tool: "scripts/window.mjs", args: ["open", "x", "--all", "--json"] })
    expect(realpathSync(run.cwd)).toBe(INSIDE)
    expect(run.tsconfig).toBeUndefined()
  })

  test("docs <verb>:  its tool, in packages/docs as yarn ran it;  link under tsx", () => {
    const open = passThrough(["docs", "open", "solid/solid-2", "--vs"])
    expect(open).toMatchObject({ status: 3, tool: "packages/docs/tools/open.js", args: ["solid/solid-2", "--vs"] })
    expect(realpathSync(open.cwd)).toBe(resolve(CHECKOUT, "packages/docs"))
    const link = passThrough(["docs", "link", "a.html", "--hash", "b"])
    expect(link).toMatchObject({ status: 3, tool: "packages/docs/tools/link.ts", args: ["a.html", "--hash", "b"] })
    expect(link.tsconfig).toBe(resolve(CHECKOUT, "packages/docs/tsconfig.json"))
  })

  test("docs fuss:  under tsx, in THIS folder, so its paths are from here", () => {
    const fuss = passThrough(["docs", "fuss", "src", "--json"])
    expect(fuss).toMatchObject({ status: 3, tool: "packages/docs/tools/fuss.ts", args: ["src", "--json"] })
    expect(realpathSync(fuss.cwd)).toBe(INSIDE)
    expect(fuss.tsconfig).toBe(resolve(CHECKOUT, "packages/docs/tsconfig.json"))
  })

  test("details, choices", () => {
    expect(passThrough(["details", "list"])).toMatchObject({ status: 3, tool: "packages/docs/tools/details.js" })
    const choices = passThrough(["choices", "new", "x", "--rows", "r.json"])
    expect(choices).toMatchObject({
      status: 3,
      tool: "packages/docs/tools/choices.js",
      args: ["new", "x", "--rows", "r.json"]
    })
    expect(realpathSync(choices.cwd)).toBe(resolve(CHECKOUT, "packages/docs"))
  })

  test("notes:  under tsx, in THIS folder, so `answer --file` is from here", () => {
    const notes = passThrough(["notes", "answer", "guides/x.html", "n3", "--file", "reply.html"])
    expect(notes).toMatchObject({
      status: 3,
      tool: "packages/docs/tools/notes.ts",
      args: ["answer", "guides/x.html", "n3", "--file", "reply.html"]
    })
    expect(realpathSync(notes.cwd)).toBe(INSIDE)
    expect(notes.tsconfig).toBe(resolve(CHECKOUT, "packages/docs/tsconfig.json"))
  })

  test("server <verb>:  the page server's cli, under tsx;  start --all:  serve.mjs", () => {
    const status = passThrough(["server", "status", "--root", "."])
    expect(status).toMatchObject({
      status: 3,
      tool: "packages/server/src/page/cli.ts",
      args: ["status", "--root", "."]
    })
    expect(status.tsconfig).toBe(resolve(CHECKOUT, "packages/server/tsconfig.json"))
    expect(passThrough(["server", "start"])).toMatchObject({ tool: "packages/server/src/page/cli.ts", args: ["start"] })
    expect(passThrough(["server", "start", "--all"])).toMatchObject({ status: 3, tool: "scripts/serve.mjs", args: [] })
  })
})

describe("spell icons", () => {
  test("finds icons by name, with their packs", () => {
    const { status, stdout } = spell(["icons", "bell", "slash", "--pack", "fomantic"])
    expect(status).toBe(0)
    expect(stdout).toMatch(/^bell slash +fomantic {2}also alarm mute\nbell slash outline {2}fomantic\n$/)
  })

  test("--open serves a gallery until interrupted -- the page, and each icon's svg", async () => {
    const child = spawn(process.execPath, [SPELL, "icons", "bell", "--open"], {
      cwd: TEMP,
      env: { ...process.env, SPELL_NO_BROWSER: "1" },
      stdio: ["ignore", "pipe", "pipe"]
    })
    let out = ""
    child.stdout.on("data", (data) => (out += data))
    await until(() => out.includes("http://"))
    const url = out.trim()
    expect(await (await fetch(url)).text()).toContain("<figcaption>bell<small>fa7-free</small></figcaption>")
    const svg = await fetch(new URL("svg/0.svg", url))
    expect(svg.headers.get("content-type")).toBe("image/svg+xml")
    expect((await fetch(new URL("svg/99999.svg", url))).status).toBe(404)

    child.kill("SIGINT")
    expect(await new Promise((done) => child.on("exit", done))).toBe(0)
  }, 30_000)
})

describe("spell serve", () => {
  // one retry:  vite's first start, in a busy run, once timed out (plan doc I3)
  const options = { timeout: 180_000, retry: 1 }
  test(
    "--headless:  the page server's editor (on --port if it starts the page server), /api through it, the project",
    options,
    async () => {
      // the editor is the page server's child:  a page server already running (a developer's) keeps its own port
      const running = Boolean(await new SRV.PidFile(REPO_ROOT).status())
      // well away from the app's own 3000, so a running `yarn start` doesn't clash
      const port = 3700 + Math.floor(Math.random() * 200) * 2
      const child = spawn(process.execPath, [SPELL, "serve", "@test/Solitaire", "--headless", "--port", String(port)], {
        cwd: TEMP,
        stdio: ["ignore", "pipe", "pipe"]
      })
      let out = ""
      let err = ""
      child.stdout.on("data", (data) => (out += data))
      child.stderr.on("data", (data) => (err += data))
      await until(() => out.includes("http://") || child.exitCode !== null, 120_000)
      expect(out, err).toMatch(/^http:\/\/localhost:\d+\/edit\/fixtures\/Solitaire\n$/)
      const editor = new URL(out.trim()).origin
      if (!running) expect(editor).toBe(`http://localhost:${port}`)
      expect(await (await fetch(`${editor}/`)).text()).toContain("<html")
      const projects = await (await fetch(`${editor}/api/projects/list/@test:fixtures`)).text()
      expect(projects).toContain("Solitaire")

      child.kill("SIGINT")
      expect(await new Promise((done) => child.on("exit", done))).toBe(0)
      // the editor stops with the page server -- if `spell serve` started it;  else both run on
      let editorUp = true
      for (let tries = 0; editorUp === !running && tries < 40; tries++) {
        await new Promise((done) => setTimeout(done, 250))
        editorUp = await fetch(`${editor}/`).then(
          () => true,
          () => false
        )
      }
      expect(editorUp).toBe(running)
    }
  )

  test("a port in use:  refused, when it would start the page server", async (context) => {
    // with the page server running, `--port` doesn't apply:  `spell serve` would just run
    if (await new SRV.PidFile(REPO_ROOT).status()) context.skip()
    const busy = createServer()
    await new Promise<void>((done) => busy.listen(0, done))
    const port = (busy.address() as { port: number }).port
    const { status, stderr } = spell(["serve", "--headless", "--port", String(port)], TEMP)
    busy.close()
    expect(status).toBe(2)
    expect(stderr).toContain(`Port ${port} is in use`)
  })
})

describe("no project named", () => {
  test("in a project's folder:  that project -- for every command", () => {
    const here = tempProject("Here", 'print "here"\n')
    expect(spell(["check"], here).stderr).toContain("✓ @workspace:")
    expect(spell(["compile"], here).stderr).toContain("wrote Here.compiled.js")
    expect(spell(["run"], here).stdout).toBe("here\n")
    expect(spell(["describe"], here).stdout).toMatch(/^Here\n/)
  })

  test("outside a project, with no terminal to ask on:  says to name one", () => {
    const { status, stderr } = spell(["check"], TEMP)
    expect(status).toBe(2)
    expect(stderr).toContain("No spell project here -- name one")
  })
})

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
    // after the file's heading and docstring;  just code:  declarations go in the project's declarations file
    expect(stdout).toMatch(/^spellCore\.heading\(.*\n.*\nexport class Card extends Thing \{/)
    expect(stdout).not.toContain("SPELL:")
  })

  test("a bare root, with no terminal to ask on, lists its projects", () => {
    const { status, stdout, stderr } = spell(["compile", "@test"])
    expect(status).toBe(2)
    expect(stdout).toBe("")
    expect(stderr).toContain("@test holds several projects -- name one, or pass --all:\n  @test:fixtures:Cards\n")
  })

  test("an unknown project", () => {
    const { status, stderr } = spell(["compile", "@nope"])
    expect(status).toBe(2)
    expect(stderr).toContain("'@nope' isn't a project")
  })

  // NOTE: written by `SpellDiskWorkspace.writeScopes()`, as the language server and `yarn scopes` write theirs --
  // which `yarn scopes` can't show here:  it takes a root's project id, not a temp folder.
  test("a clean project writes its scope pack too", () => {
    const copy = resolve(TEMP, "Solitaire")
    cpSync(fixturePath("Solitaire"), copy, { recursive: true })
    const { status, stderr } = spell(["compile", "."], copy)
    expect(status).toBe(0)
    expect(stderr).toContain(
      `wrote Solitaire${SP.COMPILED_JS_SUFFIX}, Solitaire${SP.DECLARATIONS_JSON_SUFFIX}, Solitaire${SP.SCOPES_JS_SUFFIX}`
    )
    const pack = readFileSync(resolve(copy, `Solitaire${SP.SCOPES_JS_SUFFIX}`), "utf8")
    expect(pack).toContain("type:Card")
    expect(pack).not.toContain("file://")
  }, 30_000)

  test("a project with errors writes no scope pack", () => {
    const broken = tempProject("BrokenPack", 'print "fine"\nflibbertigibbet the wombat\n')
    expect(spell(["compile", "."], broken).status).toBe(1)
    expect(existsSync(resolve(broken, `BrokenPack${SP.SCOPES_JS_SUFFIX}`))).toBe(false)
  })

  test("a warning is listed, but no error:  exit 0, and its scope pack written", () => {
    const untyped = tempProject("Untyped", "a calculator is an app\na calculator has an input\n")
    const { status, stderr } = spell(["compile", "."], untyped)
    expect(stderr).toContain("✓ @workspace")
    expect(stderr).toContain("1 warning")
    expect(stderr).toContain(
      'Untyped.spell:2:1  warning:  Say what "input" is, e.g. "a calculator has an input as text"'
    )
    expect(status).toBe(0)
    expect(existsSync(resolve(untyped, `Untyped${SP.SCOPES_JS_SUFFIX}`))).toBe(true)
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

  test("--no-browser:  skips what needs a browser, and says so", () => {
    const { status, stderr } = spell(["run", "@test/Solitaire", "--no-browser"])
    expect(stderr).toContain("Solitaire shows a UI (start the game), which needs a browser")
    expect(status).toBe(0)
  })

  test("a UI project runs in the browser, in <spell-app>, until interrupted -- writing nothing into it", async () => {
    // the fixture keeps a compiled copy:  it must come out untouched
    const output = fixturePath("Solitaire", `Solitaire${SP.COMPILED_JS_SUFFIX}`)
    const before = readFileSync(output, "utf8")
    const child = spawn(process.execPath, [SPELL, "run", "@test/Solitaire"], {
      cwd: fixturePath(),
      env: { ...process.env, SPELL_NO_BROWSER: "1" },
      stdio: ["ignore", "pipe", "pipe"]
    })
    let out = ""
    child.stdout.on("data", (data) => (out += data))
    // after what the program printed as it ran under node
    await until(() => /http:\/\/localhost:\d+\/\n/.test(out), 120_000)
    const url = /http:\/\/localhost:\d+\//.exec(out)![0]
    expect(await (await fetch(url)).text()).toContain('<spell-app src="app/Solitaire.compiled.js" toolbar>')
    expect(await (await fetch(new URL("app/Solitaire.compiled.js", url))).text()).toContain("class Card")
    expect(await (await fetch(new URL("app/Solitaire.scopes.js", url))).text()).toContain("type:Card")
    expect((await fetch(new URL("element/spell-app.js", url))).status).toBe(200)
    expect((await fetch(new URL("element/../../package.json", url))).status).toBe(404)

    child.kill("SIGINT")
    expect(await new Promise((done) => child.on("exit", done))).toBe(0)
    expect(readFileSync(output, "utf8")).toBe(before)
  }, 180_000)
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
    expect(existsSync(resolve(watched, `Watched${SP.SCOPES_JS_SUFFIX}`))).toBe(true)

    child.kill("SIGINT")
    expect(await new Promise((done) => child.on("exit", done))).toBe(0)
  }, 30_000)

  test("rebuilds a project when one it imports changes", async () => {
    // `@workspace:<folder>` is the root `resolveProject()` makes for TEMP
    const lib = tempProject("Lib", "a widget is a thing\n")
    const app = resolve(TEMP, "App")
    mkdirSync(app)
    const imports = [
      { path: `@workspace:${basename(TEMP)}:Lib`, active: true },
      { path: "/App.spell", active: true }
    ]
    writeFileSync(resolve(app, SP.PROJECT_FILE), JSON.stringify({ imports }))
    writeFileSync(resolve(app, "App.spell"), "print a new widget\n")
    const { child, log } = watching(["watch", lib, app], TEMP)

    await until(() => log().split("✓").length > 2)
    writeFileSync(resolve(lib, "Lib.spell"), "a gadget is a thing\n")
    await until(() => /✗ @workspace:\S+:App .*1 error/.test(log()))
    writeFileSync(resolve(lib, "Lib.spell"), "a widget is a thing\n")
    await until(() => log().split("✓ @workspace").length > 4)

    child.kill("SIGINT")
    expect(await new Promise((done) => child.on("exit", done))).toBe(0)
  }, 30_000)

  test("--test runs the tests after each clean rebuild, showing what failed", async () => {
    const tested = tempProject("Tested", "to test math\n\texpect 1 + 1 to be 2\n")
    const { child, log } = watching(["watch", ".", "--test"], tested)

    await until(() => log().includes("1 passed"))
    writeFileSync(resolve(tested, "Tested.spell"), "to test math\n\texpect 1 + 1 to be 3\n")
    await until(() => log().includes("0 passed, 1 failed"))
    expect(log()).toContain("    ✗ test math")

    child.kill("SIGINT")
    expect(await new Promise((done) => child.on("exit", done))).toBe(0)
  }, 30_000)
})

/** Start `spell ...args` in `cwd`, collecting its stderr -- where `watch` logs -- as it comes. */
function watching(args: string[], cwd: string) {
  const child = spawn(process.execPath, [SPELL, ...args], { cwd, stdio: ["ignore", "pipe", "pipe"] })
  let log = ""
  child.stderr.on("data", (data) => (log += data))
  return { child, log: () => log }
}

describe("spell compile --force", () => {
  test("recompiles what a project imports, even when already compiled", () => {
    const lib = tempProject("ForcedLib", "a widget is a thing\n")
    const app = resolve(TEMP, "ForcedApp")
    mkdirSync(app)
    const imports = [
      { path: `@workspace:${basename(TEMP)}:ForcedLib`, active: true },
      { path: "/ForcedApp.spell", active: true }
    ]
    writeFileSync(resolve(app, SP.PROJECT_FILE), JSON.stringify({ imports }))
    writeFileSync(resolve(app, "ForcedApp.spell"), "print a new widget\n")

    expect(spell(["compile", "."], app).stderr).toContain("ForcedLib  (imported by ForcedApp)")
    expect(spell(["compile", "."], app).stderr).not.toContain("imported by")
    expect(spell(["compile", ".", "--force"], app).stderr).toContain("ForcedLib  (imported by ForcedApp)")
    expect(existsSync(resolve(lib, `ForcedLib${SP.COMPILED_JS_SUFFIX}`))).toBe(true)
  })
})

describe("spell test --name", () => {
  test("only tests whose names contain it", () => {
    const { status, stdout } = spell(["test", "@test/Solitaire", "--name", "deck"])
    expect(status).toBe(0)
    expect(stdout).toMatch(/^✓ test deck creation {2}\(\d+ checks\)\n\n1 passed\n$/)
  })
})

describe("spell projects", () => {
  test("lists the roots, with the name to type for each", () => {
    const { status, stdout } = spell(["projects"])
    expect(status).toBe(0)
    expect(stdout).toMatch(/^@test +@test:fixtures +Test fixtures +5 projects$/m)
    expect(stdout).toMatch(/^@user +@user:projects /m)
  })

  test("one root's projects, as JSON", () => {
    const { stdout } = spell(["projects", "@test", "--json"])
    expect(JSON.parse(stdout)).toEqual([
      { name: "@test/Cards", id: "@test:fixtures:Cards" },
      { name: "@test/FizzBuzz", id: "@test:fixtures:FizzBuzz" },
      { name: "@test/Klondike", id: "@test:fixtures:Klondike" },
      { name: "@test/OutlineSolitaire", id: "@test:fixtures:OutlineSolitaire" },
      { name: "@test/Solitaire", id: "@test:fixtures:Solitaire" }
    ])
  })
})

describe("spell format", () => {
  test("--check lists what would change, exit 1;  then format fixes it, and --check passes", () => {
    const messy = tempProject("Messy", 'print   "hello"  \n\n\n\n\nprint "bye"')
    const check = spell(["format", "--check", "."], messy)
    expect(check.stdout).toBe("Messy.spell\n")
    expect(check.status).toBe(1)
    expect(readFileSync(resolve(messy, "Messy.spell"), "utf8")).toContain("print   ")

    expect(spell(["format", "."], messy).status).toBe(0)
    expect(readFileSync(resolve(messy, "Messy.spell"), "utf8")).toBe('print "hello"\n\n\nprint "bye"\n')
    expect(spell(["format", "--check", "."], messy).status).toBe(0)
  })

  test("never writes into a test project", () => {
    const { status, stderr } = spell(["format", "@test/Solitaire"])
    expect(status).toBe(2)
    expect(stderr).toContain("Won't format test projects")
  })
})

describe("spell speed", () => {
  test("times one module's rules:  a table and the pass count", () => {
    const { status, stdout } = spell(["speed", "if", "--runs", "1"])
    expect(status).toBe(0)
    expect(stdout).toMatch(/^\| +\| Average \|.*\n.*\n\| \*\*Current\*\* \| +\d+ \|/)
    expect(stdout).toMatch(/Current: {2}\d+ passed, 0 failed\n$/)
  }, 60_000)
})

describe("spell parse", () => {
  test("a line:  its match tree, then its javascript", () => {
    const { status, stdout } = spell(["parse", 'print "hi"'])
    expect(status).toBe(0)
    expect(stdout).toBe(
      'statement › print  print "hi"\n  Keyword  print\n  expressions: Repeat  "hi"\n' +
        '    expression: operand › text  "hi"\n\nspellCore.console.log("hi")\n'
    )
  })

  test("--in a project knows its types", () => {
    expect(spell(["parse", "a new card"]).status).toBe(1)
    const { status, stdout } = spell(["parse", "a new card", "--in", "@test/Solitaire"])
    expect(status).toBe(0)
    expect(stdout).toMatch(/\nnew Card\(\)\n$/)
  })

  test("--json", () => {
    const { stdout } = spell(["parse", "1 + 2", "--json"])
    expect(JSON.parse(stdout)).toMatchObject({ rule: "expression", compiled: "(1 + 2)" })
  })

  test("--tree:  the spell tree, then its javascript;  --json its data;  --html a <ui-tree-diagram>", () => {
    const { status, stdout } = spell(["parse", "1 + 2", "--tree"])
    expect(status).toBe(0)
    expect(stdout).toBe("plus\n  lhs: Number 1\n  rhs: Number 2\n\n(1 + 2)\n")
    expect(JSON.parse(spell(["parse", "1 + 2", "--tree", "--json"]).stdout)).toEqual({
      label: "plus",
      children: [
        { label: "Number 1", slot: "lhs" },
        { label: "Number 2", slot: "rhs" }
      ]
    })
    const html = spell(["parse", "1 + 2", "--tree", "--html"]).stdout
    expect(html).toMatch(/^<ui-tree-diagram>\n<script type="application\/json">\n\{/)
    expect(html).toMatch(/<\/script>\n<\/ui-tree-diagram>\n$/)
  })
})

describe("spell repl", () => {
  test("piped:  each line in turn -- what one declares, the next knows", () => {
    const { status, stdout } = spawnSync(process.execPath, [SPELL, "repl"], {
      cwd: fixturePath(),
      input: "x is 3\nprint x + 1\n",
      encoding: "utf8"
    })
    expect(status).toBe(0)
    expect(stdout).toContain("=> export let x = 3\n")
    expect(stdout).toContain("lhs: operand › known_variable  x\n")
    expect(stdout).toMatch(/=> spellCore\.console\.log\(x \+ 1\)\n$/)
  })
})

describe("spell explain", () => {
  test("a rule:  its syntax and an example", () => {
    const { status, stdout } = spell(["explain", "print"])
    expect(status).toBe(0)
    expect(stdout).toMatch(/^print {2}print .*\ne\.g\. print /)
  })

  test("--in a project:  what it declares, as the editor's hover shows it", () => {
    const { status, stdout } = spell(["explain", "card", "--in", "@test/Solitaire"])
    expect(status).toBe(0)
    expect(stdout).toMatch(/Card\.spell:2\ntype Card is a Thing\n/)
  })

  test("nothing by that name", () => {
    const { status, stderr } = spell(["explain", "wombat"])
    expect(status).toBe(1)
    expect(stderr).toContain("Nothing called 'wombat'")
  })
})

describe("spell new", () => {
  test("makes a project that runs -- and won't overwrite it", () => {
    const { status, stdout } = spell(["new", "Snake", "--in", TEMP])
    expect(status).toBe(0)
    expect(stdout).toBe(`${resolve(TEMP, "Snake")}\n`)
    expect(JSON.parse(readFileSync(resolve(TEMP, "Snake", SP.PROJECT_FILE), "utf8"))).toEqual({
      imports: [{ path: "/Snake.spell", active: true }]
    })
    expect(spell(["run", "."], resolve(TEMP, "Snake")).stdout).toBe("hello from Snake\n")

    const again = spell(["new", "Snake", "--in", TEMP])
    expect(again.status).toBe(2)
    expect(again.stderr).toContain("already holds a project")
  })

  test("a name spell can't use", () => {
    expect(spell(["new", "9 lives", "--in", TEMP]).status).toBe(2)
  })
})

/** Resolve once `condition()` holds, checking every 50ms -- or reject after `ms`. */
async function until(condition: () => boolean, ms = 15_000): Promise<void> {
  const start = Date.now()
  while (!condition()) {
    if (Date.now() - start > ms) throw new Error("timed out")
    await new Promise((done) => setTimeout(done, 50))
  }
}
