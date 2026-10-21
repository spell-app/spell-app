import { spawn, spawnSync } from "child_process"
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync
} from "fs"
import { createServer } from "net"
import { tmpdir } from "os"
import { basename, resolve } from "path"
import { afterAll, beforeAll, describe, test, expect, vi } from "vite-plus/test"

import { SRV } from "spell-kit/server"
import { buildFolderFor } from "$/spaces/server/node/projects/project-utils"
import { SP } from "@spell-app/spell"
import { fixturePath } from "@spell-app/spell/test"

/**
 * The real `spell` command, end to end:  `bin/spell.mjs` run as a separate process, as a user would.
 * - No terminal:  stdin / stdout are pipes, so nothing asks questions or draws screens.
 * - NEVER writes into a fixture:  compiles use `--stdout`.
 *   Projects to break live in a temp folder -- see `tempProject()`.
 */
const SPELL = resolve(import.meta.dirname, "../../../cli/bin/spell.mjs")

// each `spell` run starts node and loads spell's source through `tsx`, ~2s;
// a test making two or three runs is over vitest's 5s default, worse under the load of every test file at once
vi.setConfig({ testTimeout: 30_000 })

/** This checkout:  its page server is the one `spell serve` uses. */
const REPO_ROOT = resolve(import.meta.dirname, "..", "..", "..")

/**
 * Whether this checkout runs the epic engine:
 * spell-epic, through its `spell-epic` link, and the epic pages (epic `epic-eject` I5).
 * - Without them (CI), the tests of what `spell` hands on to `epic` are skipped.
 */
const HAS_ENGINE =
  existsSync(resolve(REPO_ROOT, "spell-epic", "bin", "epic")) && existsSync(resolve(REPO_ROOT, "epics"))
/** Temp folder holding `tempProject()`s -- its REAL path:  on macOS `tmpdir()` is a symlink, and spell reports real paths. */
const TEMP = realpathSync(mkdtempSync(resolve(tmpdir(), "spell-cli-")))
afterAll(() => rmSync(TEMP, { recursive: true, force: true }))

/** Each file in `folder`, by name, with when it last changed:  to see a run wrote nothing there.  None if it isn't there. */
function filesIn(folder: string): Record<string, number> {
  if (!existsSync(folder)) return {}
  return Object.fromEntries(readdirSync(folder).map((name) => [name, statSync(resolve(folder, name)).mtimeMs]))
}

/** Each file in fixture `name`'s folder AND its build folder (`buildFolderFor()`), by path:  see `filesIn()`. */
function fixtureFiles(name: string): Record<string, number> {
  const built = buildFolderFor(fixturePath(name))
  return { ...filesIn(fixturePath(name)), ...prefixed("build/", filesIn(built)) }
}

/** `files`, each name starting with `prefix`. */
function prefixed(prefix: string, files: Record<string, number>): Record<string, number> {
  return Object.fromEntries(Object.entries(files).map(([name, modified]) => [`${prefix}${name}`, modified]))
}

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

// the old spelling of `epic plan-doc`, spell-epic's:  the `epic` command's own tests are spell-epic's
describe.skipIf(!HAS_ENGINE)("spell dev plan-doc", () => {
  test("alone, lists the tool's commands", () => {
    const { status, stderr } = spell(["dev", "plan-doc"])
    expect(status).toBe(2)
    expect(stderr).toMatch(/usage: .*plan-doc <command> <name>/)
  })

  test("summarizes an epic page", () => {
    const { status, stdout } = spell(["dev", "plan-doc", "summary", "unified-server"])
    expect(status).toBe(0)
    expect(stdout).toMatch(/^Unified Server\n {2}\[x\] P1 · Library Core/)
  })

  test("spell plan-doc, the old top-level alias, is gone", () => {
    expect(spell(["plan-doc", "summary", "unified-server"]).status).not.toBe(0)
  })

  test("spell epic <verb>, the epic command's own old spelling, runs it", () => {
    expect(spell(["epic", "summary", "unified-server"]).stdout).toMatch(/^Unified Server\n/)
  })
})

describe("spell dev", () => {
  test("--help lists the plumbing, the pass-throughs too, and points to epic for the epic tools", () => {
    const { status, stdout } = spell(["dev", "--help"])
    expect(status).toBe(0)
    for (const noun of ["docs", "server", "vscode", "commands", "wwod"]) {
      expect(stdout).toMatch(new RegExp(`^ {2}${noun} `, "m"))
    }
    // the old spellings still run, but aren't listed
    const moved = ["plan-doc", "goals", "details", "choices", "comments", "notes", "agents", "airplane"]
    // epic `epic-eject` P5
    moved.push("window", "session", "worktree", "park", "stock", "shared")
    for (const noun of moved) {
      expect(stdout).not.toMatch(new RegExp(`^ {2}${noun} `, "m"))
    }
    expect(stdout).toContain("The epic tools moved to their own command, `epic` (epic --help)")
  })

  test("spell --help lists dev, and epic as moved", () => {
    const { stdout } = spell(["--help"])
    expect(stdout).toMatch(/^ {2}dev /m)
    expect(stdout).toMatch(/^ {2}epic .*moved to their own command/m)
    expect(stdout).not.toMatch(/^ {2}plan-doc /m)
  })

  test.skipIf(!HAS_ENGINE)(
    "the epic verbs' old spellings run epic:  spell dev worktree status, spell dev session bogus",
    () => {
      const { status, stdout } = spell(["dev", "worktree", "status", "no-such-name-at-all"], REPO_ROOT)
      expect(status).toBe(0)
      expect(JSON.parse(stdout)).toMatchObject({ name: "no-such-name-at-all", worktree: null })
      const bogus = spell(["dev", "session", "bogus"])
      expect(bogus.status).toBe(1)
      expect(bogus.stderr).toContain("epic session bogus?  no such verb.")
    }
  )

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
  // the epic tools (`window`, `details`, the docs tools ...):  `epic`'s, spell-epic's;
  // here a fake `epic` in the checkout's `spell-epic` link, reporting what it was handed
  /** A fake checkout, each tool a script reporting what it got:  `{ tool, args, cwd, tsconfig }`, exiting 3. */
  const CHECKOUT = resolve(TEMP, "checkout")
  /** A folder inside it, to run from:  the tools must still be found. */
  const INSIDE = resolve(CHECKOUT, "app")
  beforeAll(() => {
    // a tool's path from the checkout:  inside it, or beside it (`../server/...`, the kit's, epic `repo-split` P8, P9)
    const report = `const url = import.meta.url
const tool = url.includes("/checkout/") ? url.split("/checkout/")[1] : "../" + url.split("/${basename(TEMP)}/")[1]
console.log(JSON.stringify({ tool, args: process.argv.slice(2), cwd: process.cwd(), tsconfig: process.env.TSX_TSCONFIG_PATH }))
process.exit(3)
`
    for (const tool of ["scripts/serve.mjs", "../server/src/page/cli.ts", "spell-epic/src/tools/design.js"]) {
      mkdirSync(resolve(CHECKOUT, tool, ".."), { recursive: true })
      writeFileSync(resolve(CHECKOUT, tool), report)
    }
    // `bin/epic` has no extension:  plain CommonJS, which node runs either way
    mkdirSync(resolve(CHECKOUT, "spell-epic/bin"), { recursive: true })
    writeFileSync(
      resolve(CHECKOUT, "spell-epic/bin/epic"),
      `console.log(JSON.stringify({ tool: __filename.split("/checkout/")[1], args: process.argv.slice(2), cwd: process.cwd() }))
process.exit(3)
`
    )
    writeFileSync(resolve(CHECKOUT, "../server/tsconfig.json"), "{}")
    // a repo beside the checkout is ES modules, as every repo's package is ("type": "module")
    writeFileSync(resolve(CHECKOUT, "../server/package.json"), `{ "type": "module" }`)
    mkdirSync(INSIDE, { recursive: true })
  })

  /** Run `spell dev ...args` in `INSIDE`:  its exit code, and what the fake tool reported. */
  function passThrough(args: string[]) {
    const { status, stdout, stderr } = spell(["dev", ...args], INSIDE)
    return { status, stderr, ...(stdout ? JSON.parse(stdout) : {}) }
  }

  test("docs <verb>:  epic pages <verb>, the checkout's spell-epic, in THIS folder (epic-eject I5)", () => {
    const open = passThrough(["docs", "open", "solid/solid-2", "--vs"])
    expect(open).toMatchObject({
      status: 3,
      tool: "spell-epic/bin/epic",
      args: ["pages", "open", "solid/solid-2", "--vs"]
    })
    expect(realpathSync(open.cwd)).toBe(INSIDE)
    const fuss = passThrough(["docs", "fuss", "src", "--json"])
    expect(fuss).toMatchObject({ status: 3, args: ["pages", "fuss", "src", "--json"] })
  })

  test("the epic verbs' old spellings:  epic <verb>, their arguments verbatim", () => {
    expect(passThrough(["plan-doc", "add", "seo", "judgement", "A call", "--calm"])).toMatchObject({
      status: 3,
      tool: "spell-epic/bin/epic",
      args: ["plan-doc", "add", "seo", "judgement", "A call", "--calm"]
    })
    expect(passThrough(["details", "new", "x", "--all"])).toMatchObject({ args: ["ask", "new", "x", "--all"] })
    expect(passThrough(["worktree", "status", "seo"])).toMatchObject({ args: ["worktree", "status", "seo"] })
    const { status, stdout } = spell(["--verbose", "epic", "summary", "seo"], INSIDE)
    expect(status).toBe(3)
    expect(JSON.parse(stdout)).toMatchObject({ tool: "spell-epic/bin/epic", args: ["summary", "seo"] })
  })

  test("design sync:  the engine's design tool, through the link, in THIS folder", () => {
    const sync = passThrough(["design", "pushed", "a.html"])
    expect(sync).toMatchObject({ status: 3, tool: "spell-epic/src/tools/design.js", args: ["pushed", "a.html"] })
    expect(realpathSync(sync.cwd)).toBe(INSIDE)
  })

  test("server <verb>:  the page server's cli, under tsx;  start --all:  serve.mjs", () => {
    const status = passThrough(["server", "status", "--root", "."])
    expect(status).toMatchObject({
      status: 3,
      tool: "../server/src/page/cli.ts",
      args: ["status", "--root", "."]
    })
    expect(status.tsconfig).toBe(resolve(CHECKOUT, "../server/tsconfig.json"))
    expect(passThrough(["server", "start"])).toMatchObject({
      tool: "../server/src/page/cli.ts",
      args: ["start"]
    })
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
  // one retry:  vite's first start, in a busy run, once timed out (epic page I3)
  const options = { timeout: 180_000, retry: 1 }
  test(
    "--headless:  the page server's editor (on --port if it starts the page server), /api through it, the project",
    options,
    async () => {
      // the editor is the page server's child:  a page server already running (a developer's) keeps its own port
      const running = Boolean(await new SRV.PidFile(REPO_ROOT).status())
      // well away from the app's own 3000, so a running `yarn start` doesn't clash
      const port = 3700 + Math.floor(Math.random() * 200) * 2
      const child = spawn(
        process.execPath,
        [SPELL, "serve", "@spell/test/solitaire", "--headless", "--port", String(port)],
        {
          cwd: TEMP,
          stdio: ["ignore", "pipe", "pipe"]
        }
      )
      let out = ""
      let err = ""
      child.stdout.on("data", (data) => (out += data))
      child.stderr.on("data", (data) => (err += data))
      await until(() => out.includes("http://") || child.exitCode !== null, 120_000)
      expect(out, err).toMatch(/^http:\/\/localhost:\d+\/edit\/@spell\/test\/solitaire\n$/)
      const editor = new URL(out.trim()).origin
      if (!running) expect(editor).toBe(`http://localhost:${port}`)
      expect(await (await fetch(`${editor}/`)).text()).toContain("<html")
      const projects = await (await fetch(`${editor}/api/projects/list/@spell/test`)).text()
      expect(projects).toContain("@spell/test/solitaire")
      // a file by its URL, `/spaces/<address>`, through vite's proxy
      const card = await fetch(`${editor}/spaces/@spell/test/solitaire/Card.spell`)
      expect(card.status).toBe(200)

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
    expect(spell(["check"], here).stderr).toContain("✓ @local/")
    expect(spell(["compile"], here).stderr).toContain("wrote Here.spell.js")
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
    const { status, stdout, stderr } = spell(["compile", "@spell/test/fizzbuzz", "--stdout"])
    expect(stderr).toContain("✓ @spell/test/fizzbuzz")
    expect(status).toBe(0)
    expect(stdout).toBe(readFileSync(fixturePath("fizzbuzz", `FizzBuzz${SP.SNAPSHOT_JS_SUFFIX}`), "utf8"))
  })

  test("a spell file prints its javascript", () => {
    const { status, stdout } = spell(["compile", "Card.spell"], fixturePath("solitaire"))
    expect(status).toBe(0)
    // after the file's heading and docstring;  just code:  declarations go in the project's declarations file
    expect(stdout).toMatch(/^core\.heading\(.*\n.*\nexport class Card extends Thing \{/)
    expect(stdout).not.toContain("SPELL:")
  })

  test("a bare root, with no terminal to ask on, lists its projects", () => {
    const { status, stdout, stderr } = spell(["compile", "@spell/test"])
    expect(status).toBe(2)
    expect(stdout).toBe("")
    expect(stderr).toContain(
      "@spell/test holds several projects -- name one, or pass --all:\n  @spell/test/card-table\n"
    )
  })

  test("an unknown project", () => {
    const { status, stderr } = spell(["compile", "@nope"])
    expect(status).toBe(2)
    expect(stderr).toContain("'@nope' isn't a project")
  })

  // NOTE: written by `SpellDiskWorkspace.writeScopes()`, as the language server and `yarn scopes` write theirs --
  // which `yarn scopes` can't show here:  it takes a root's project id, not a temp folder.
  test("a clean project writes its words and scope pack too", () => {
    const copy = resolve(TEMP, "Solitaire")
    cpSync(fixturePath("solitaire"), copy, { recursive: true })
    const { status, stderr } = spell(["compile", "."], copy)
    expect(status).toBe(0)
    const wrote = [SP.COMPILED_JS_SUFFIX, SP.DECLARATIONS_JSON_SUFFIX, SP.WORDS_JS_SUFFIX, SP.SCOPES_JS_SUFFIX]
    expect(stderr).toContain(`wrote ${wrote.map((suffix) => `Solitaire${suffix}`).join(", ")}`)
    const pack = readFileSync(resolve(copy, `Solitaire${SP.SCOPES_JS_SUFFIX}`), "utf8")
    expect(pack).toContain("type:Card")
    expect(pack).not.toContain("file://")
    const words = readFileSync(resolve(copy, `Solitaire${SP.WORDS_JS_SUFFIX}`), "utf8")
    expect(words).toContain('moveToPile: "move (a card) to (a pile)"')
  }, 30_000)

  test("a project with errors writes no scope pack", () => {
    const broken = tempProject("BrokenPack", 'print "fine"\nflibbertigibbet the wombat\n')
    expect(spell(["compile", "."], broken).status).toBe(1)
    expect(existsSync(resolve(broken, `BrokenPack${SP.SCOPES_JS_SUFFIX}`))).toBe(false)
  })

  test("a warning is listed, but no error:  exit 0, and its scope pack written", () => {
    const untyped = tempProject("Untyped", "a calculator is an app\na calculator has an input\n")
    const { status, stderr } = spell(["compile", "."], untyped)
    expect(stderr).toContain("✓ @local/")
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
    const { status, stdout, stderr } = spell(["check", "@spell/test/solitaire"])
    expect(stderr).toContain("✓ @spell/test/solitaire")
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

describe("spell check:  editor pages (epic property-editor P6, Q17)", () => {
  /** A project declaring `Card`, whose editor page names a gone property, misses one, and has a misfit `as`. */
  let paged: string
  beforeAll(() => {
    paged = tempProject(
      "Paged",
      "a card is a thing\na card has a rank as one of ace, king or queen\na card has a label as text\n" +
        "a card has a count as number\n"
    )
    writeFileSync(resolve(paged, "Card.editor.html"), CARD_PAGE)
  })

  test("lists each problem as path:line:col, at its property's name or the editor, exit 1;  writes nothing", () => {
    const { status, stdout, stderr } = spell(["check", "."], paged)
    expect(stderr).toContain("(editor pages)  1 page · 3 errors")
    expect(stdout).toBe(
      [
        'Card.editor.html:3:16  `as="select"` doesn\'t fit `label`, a text',
        "Card.editor.html:4:16  Card has no `suit` any more",
        "Card.editor.html:1:1  Card's `count` isn't on the page",
        ""
      ].join("\n")
    )
    expect(status).toBe(1)
    expect(readFileSync(resolve(paged, "Card.editor.html"), "utf8")).toBe(CARD_PAGE)
    expect(existsSync(resolve(paged, `Paged${SP.DECLARATIONS_JSON_SUFFIX}`))).toBe(false)
  })

  test("--fix puts the page right and says what it did, exit 0;  then a check is clean", () => {
    const { status, stdout } = spell(["check", ".", "--fix"], paged)
    expect(stdout).toBe(
      [
        "Card.editor.html:3:16  fixed:  `as=\"select\"` doesn't fit `label`, a text -- took its `as` off, back to its type's own control",
        "Card.editor.html:4:16  fixed:  Card has no `suit` any more -- took it off the page",
        "Card.editor.html:1:1  fixed:  Card's `count` isn't on the page -- added it to the \"Other\" group",
        ""
      ].join("\n")
    )
    expect(status).toBe(0)
    const fixed = readFileSync(resolve(paged, "Card.editor.html"), "utf8")
    expect(fixed).toContain('<ui-property name="label"></ui-property>')
    expect(fixed).not.toContain("suit")
    expect(fixed).toContain('<ui-property name="count"></ui-property>')

    const again = spell(["check", "."], paged)
    expect(again.stderr).toContain("(editor pages)  1 page\n")
    expect(again.stdout).toBe("")
    expect(again.status).toBe(0)
  }, 30_000)

  test("a page whose schema names no type of the project:  one problem, which --fix can't fix", () => {
    const typo = tempProject("TypoPage", "a card is a thing\na card has a label as text\n")
    writeFileSync(resolve(typo, "Card.editor.html"), CARD_PAGE.replace('schema="Card"', 'schema="Crad"'))
    const { status, stdout } = spell(["check", ".", "--fix", "--json"], typo)
    expect(JSON.parse(stdout)).toEqual([
      expect.objectContaining({
        path: resolve(typo, "Card.editor.html"),
        line: 1,
        column: 21,
        message: '`schema="Crad"` names no type of TypoPage (it has Card)'
      })
    ])
    expect(status).toBe(1)
  })
})

describe("spell compile:  editor pages (epic property-editor P7, Q19)", () => {
  test("writes each page as a module defining its <type-editor>, beside the program's own output", () => {
    const compiled = tempProject("Compiled", "a card is a thing\na card has a rank as one of ace, king or queen\n")
    writeFileSync(
      resolve(compiled, "Card.editor.html"),
      CARD_PAGE.replace(/\s*<ui-property name="(suit|label)"[^\n]*\n/g, "\n")
    )
    const { status, stderr } = spell(["compile", "."], compiled)
    expect(status).toBe(0)
    expect(stderr).toContain("Card.editor.js")
    const module = readFileSync(resolve(compiled, "Card.editor.js"), "utf8")
    expect(module).toContain('import "@spell-app/ui/ui-property-editor"')
    expect(module).toContain('customElements.define("card-editor", CardEditor)')
    expect(module).not.toContain("source=")
  }, 30_000)
})

/** An editor page for the `Card` of the editor-page tests, as written by hand. */
const CARD_PAGE = `<ui-property-editor schema="Card" label="Card">
  <ui-property name="rank"></ui-property>
  <ui-property name="label" as="select"></ui-property>
  <ui-property name="suit"></ui-property>
</ui-property-editor>
`

describe("spell describe", () => {
  test("a file:  what it declares", () => {
    const { status, stdout } = spell(["describe", "Card.spell"], fixturePath("solitaire"))
    expect(status).toBe(0)
    expect(stdout).toMatch(/^Card\.spell\n {2}type Card {2}is a Thing\n/)
  })

  test("one thing, by name -- ignoring case, and spaces ~== `_`", () => {
    const { status, stdout } = spell(["describe", ".", "STOCK pile"], fixturePath("solitaire"))
    expect(status).toBe(0)
    expect(stdout).toMatch(/^type StockPile is a Pile\nSolitaire\.spell:\d+\n/)
  })

  test("a member of a thing", () => {
    const { stdout } = spell(["describe", "@spell/test/solitaire", "card", "color"])
    expect(stdout).toMatch(/^property color of Card\n/)
  })

  test("an unknown name", () => {
    const { status, stderr } = spell(["describe", "@spell/test/solitaire", "wombat"])
    expect(status).toBe(2)
    expect(stderr).toContain("Nothing called 'wombat' in @spell/test/solitaire")
  })
})

describe("spell run", () => {
  test("runs the program:  its prints on stdout -- and writes nothing into the project, or its build folder", () => {
    const before = fixtureFiles("fizzbuzz")
    const { status, stdout } = spell(["run", "@spell/test/fizzbuzz"])
    expect(stdout).toMatch(/^1\n2\n3 fizz\n4\n5 buzz\n/)
    expect(stdout).toContain("15 fizzbuzz\n")
    expect(status).toBe(0)
    expect(fixtureFiles("fizzbuzz")).toEqual(before)
  })

  test("--target py and ts:  the same prints, from the Python and the TypeScript -- writing nothing into the project, or its build folder", () => {
    const before = fixtureFiles("fizzbuzz")
    const javascript = spell(["run", "@spell/test/fizzbuzz"]).stdout
    for (const target of ["py", "ts"]) {
      const { status, stdout } = spell(["run", "@spell/test/fizzbuzz", "--target", target])
      expect(stdout, target).toBe(javascript)
      expect(status, target).toBe(0)
    }
    expect(fixtureFiles("fizzbuzz")).toEqual(before)
  })

  test("--target ts on a program that draws:  runs what it can, and says it can't open in a browser yet", () => {
    const { status, stderr } = spell(["run", "@spell/test/solitaire", "--target", "ts", "--seed", "1"])
    expect(stderr).toContain("solitaire draws:  its ts/solid can't open in a browser yet")
    expect(status).toBe(0)
  })

  test("--target with a name no target has:  says which there are, exit 1", () => {
    const { status, stderr } = spell(["run", "@spell/test/fizzbuzz", "--target", "rust"])
    expect(stderr).toContain('--target takes js, ts or py, not "rust"')
    expect(status).not.toBe(0)
  })

  test("--no-browser:  skips what needs a browser, and says so", () => {
    const { status, stderr } = spell(["run", "@spell/test/solitaire", "--no-browser"])
    expect(stderr).toContain("solitaire shows a UI (start the game), which needs a browser")
    expect(status).toBe(0)
  })

  test("a UI project runs in the browser, in <spell-app>, until interrupted -- writing nothing into it", async () => {
    // the fixture's files and its build folder's, each by when it last changed:  none added or written by the run
    const before = fixtureFiles("solitaire")
    const child = spawn(process.execPath, [SPELL, "run", "@spell/test/solitaire"], {
      cwd: fixturePath(),
      env: { ...process.env, SPELL_NO_BROWSER: "1" },
      stdio: ["ignore", "pipe", "pipe"]
    })
    let out = ""
    child.stdout.on("data", (data) => (out += data))
    // after what the program printed as it ran under node
    await until(() => /http:\/\/localhost:\d+\/\n/.test(out), 120_000)
    const url = /http:\/\/localhost:\d+\//.exec(out)![0]
    expect(await (await fetch(url)).text()).toContain('<spell-app src="app/solitaire.spell.js" toolbar>')
    expect(await (await fetch(new URL("app/solitaire.spell.js", url))).text()).toContain("class Card")
    expect(await (await fetch(new URL("app/solitaire.scopes.js", url))).text()).toContain("type:Card")
    expect((await fetch(new URL("element/spell-app.js", url))).status).toBe(200)
    expect((await fetch(new URL("element/../../package.json", url))).status).toBe(404)

    child.kill("SIGINT")
    expect(await new Promise((done) => child.on("exit", done))).toBe(0)
    expect(fixtureFiles("solitaire")).toEqual(before)
  }, 180_000)
})

describe("spell test", () => {
  test("reports each test -- counting one the project ran itself only once", () => {
    const { status, stdout } = spell(["test", "@spell/test/solitaire"])
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
    const { status, stderr } = spell(["test", "@spell/test/fizzbuzz"])
    expect(stderr).toContain("fizzbuzz has no tests")
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
    // `@local/<folder>` is the group `resolveProject()` makes for TEMP
    const lib = tempProject("Lib", "a widget is a thing\n")
    const app = resolve(TEMP, "App")
    mkdirSync(app)
    const imports = [
      { path: `@local/${basename(TEMP)}/Lib`, active: true },
      { path: "/App.spell", active: true }
    ]
    writeFileSync(resolve(app, SP.PROJECT_FILE), JSON.stringify({ imports }))
    writeFileSync(resolve(app, "App.spell"), "print a new widget\n")
    const { child, log } = watching(["watch", lib, app], TEMP)

    await until(() => log().split("✓").length > 2)
    writeFileSync(resolve(lib, "Lib.spell"), "a gadget is a thing\n")
    await until(() => /✗ @local\/\S+\/App .*1 error/.test(log()))
    writeFileSync(resolve(lib, "Lib.spell"), "a widget is a thing\n")
    await until(() => log().split("✓ @local/").length > 4)

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
      { path: `@local/${basename(TEMP)}/ForcedLib`, active: true },
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

describe("spell compile --stale", () => {
  test("compiles only what's out of date:  never built, a source changed, or what it imports changed", () => {
    const lib = tempProject("StaleLib", "a widget is a thing\n")
    const app = resolve(TEMP, "StaleApp")
    mkdirSync(app)
    const imports = [
      { path: `@local/${basename(TEMP)}/StaleLib`, active: true },
      { path: "/StaleApp.spell", active: true }
    ]
    writeFileSync(resolve(app, SP.PROJECT_FILE), JSON.stringify({ imports }))
    writeFileSync(resolve(app, "StaleApp.spell"), "print a new widget\n")

    const first = spell(["compile", ".", "--stale"], app).stderr
    expect(first).toMatch(/✓ @local\/\S+\/StaleLib {2}\(imported by StaleApp\) {2}no StaleLib\.spell\.js · wrote /)
    expect(first).toMatch(/✓ @local\/\S+\/StaleApp {2}no StaleApp\.spell\.js · wrote /)

    const again = spell(["compile", ".", "--stale"], app).stderr
    expect(again).toMatch(/✓ @local\/\S+\/StaleApp {2}up to date\n/)
    expect(again).not.toContain("imported by")

    // saved, even unchanged, counts as changed
    writeFileSync(resolve(app, "StaleApp.spell"), "print a new widget\n")
    const edited = spell(["compile", ".", "--stale"], app).stderr
    expect(edited).toMatch(/✓ @local\/\S+\/StaleApp {2}StaleApp\.spell changed since · wrote /)
    expect(edited).not.toContain("imported by")

    // the import's rebuilt first, so its declarations are newer than the app's build
    writeFileSync(resolve(lib, "StaleLib.spell"), "a widget is a thing\n")
    const imported = spell(["compile", ".", "--stale"], app).stderr
    expect(imported).toMatch(/StaleLib {2}\(imported by StaleApp\) {2}StaleLib\.spell changed since · wrote /)
    expect(imported).toMatch(/✓ @local\/\S+\/StaleApp {2}@local\/\S+\/StaleLib's declarations changed since/)
  }, 60_000)

  test("with --stdout:  says they don't go together, exit 2", () => {
    const { status, stderr } = spell(["compile", "@spell/test/fizzbuzz", "--stale", "--stdout"])
    expect(stderr).toContain("--stale writes only what's out of date;  --stdout writes nothing")
    expect(status).toBe(2)
  })
})

describe("spell test --name", () => {
  test("only tests whose names contain it", () => {
    const { status, stdout } = spell(["test", "@spell/test/solitaire", "--name", "deck"])
    expect(status).toBe(0)
    expect(stdout).toMatch(/^✓ test deck creation {2}\(\d+ checks\)\n\n1 passed\n$/)
  })
})

describe("spell projects", () => {
  test("lists the groups, each by its address", () => {
    const { status, stdout } = spell(["projects"])
    expect(status).toBe(0)
    expect(stdout).toMatch(/^@spell\/test +Test fixtures +11 projects$/m)
    expect(stdout).toMatch(/^owen@spell +Projects /m)
  })

  test("one group's projects, as JSON", () => {
    const { stdout } = spell(["projects", "@spell/test", "--json"])
    expect(JSON.parse(stdout)).toEqual([
      { name: "card-table", id: "@spell/test/card-table" },
      { name: "cards", id: "@spell/test/cards" },
      { name: "cards-from-zero", id: "@spell/test/cards-from-zero" },
      { name: "drawable-solitaire", id: "@spell/test/drawable-solitaire" },
      { name: "fizzbuzz", id: "@spell/test/fizzbuzz" },
      { name: "klondike", id: "@spell/test/klondike" },
      { name: "outline-solitaire", id: "@spell/test/outline-solitaire" },
      { name: "people", id: "@spell/test/people" },
      { name: "solitaire", id: "@spell/test/solitaire" },
      { name: "thing-references", id: "@spell/test/thing-references" },
      { name: "todos-form-based", id: "@spell/test/todos-form-based" }
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
    const { status, stderr } = spell(["format", "@spell/test/solitaire"])
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
        '    expression: operand › text  "hi"\n\ncore.console.log("hi")\n'
    )
  })

  test("--in a project knows its types", () => {
    expect(spell(["parse", "a new card"]).status).toBe(1)
    const { status, stdout } = spell(["parse", "a new card", "--in", "@spell/test/solitaire"])
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
    expect(stdout).toContain("=> export const x = 3\n")
    expect(stdout).toContain("lhs: operand › known_variable  x\n")
    expect(stdout).toMatch(/=> core\.console\.log\(x \+ 1\)\n$/)
  })
})

describe("spell explain", () => {
  test("a rule:  its syntax and an example", () => {
    const { status, stdout } = spell(["explain", "print"])
    expect(status).toBe(0)
    expect(stdout).toMatch(/^print {2}print .*\ne\.g\. print /)
  })

  test("--in a project:  what it declares, as the editor's hover shows it", () => {
    const { status, stdout } = spell(["explain", "card", "--in", "@spell/test/solitaire"])
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
