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
import { createRequire } from "module"
import { createServer } from "net"
import { tmpdir } from "os"
import { basename, dirname, resolve } from "path"
import { afterAll, beforeAll, describe, test, expect, onTestFinished, vi } from "vite-plus/test"

import { SRV } from "spell/server"
import { pageServerRoot } from "spell/server/page/settings"
import { buildFolderFor } from "spell-app/spaces/server/node/projects/project-utils"
import { SP } from "spell-parser/spell"
import { fixturePath, fixtureFolder } from "spell-app/spaces/test"

/**
 * The real `spell` command, end to end:  the kit's `bin/spell.mjs` run as a separate process, as a user would,
 * with every installed repo's commands:  spell-parser's (their work this repo's, through its `"language"` hook), and
 * this repo's own (`spell app ...`, `spell projects`).
 * - No terminal:  stdin / stdout are pipes, so nothing asks questions or draws screens.
 * - NEVER writes into a fixture:  compiles use `--stdout`.
 *   Projects to break live in a temp folder -- see `tempProject()`.
 * - The kit's own commands' tests are the kit's (`tests/cli/`), Spell UI's are Spell UI's.
 */
const SPELL = resolve(dirname(createRequire(import.meta.url).resolve("spell/package.json")), "bin/spell.mjs")

/**
 * How long a test may take, and so each `spell` run in one (`spell()`).
 * - each run starts node and loads spell's source through `tsx`, ~2s;
 *   a test making two or three runs is over vitest's 5s default, worse under the load of every test file at once
 */
const TEST_TIMEOUT_MS = 30_000
vi.setConfig({ testTimeout: TEST_TIMEOUT_MS })

/** This checkout:  its page server is the one `spell app serve` uses. */
const REPO_ROOT = resolve(import.meta.dirname, "..", "..")

/** The page server's root, where its pid file is:  the kit around this repo (epic `repo-split` P16). */
const SERVER_ROOT = pageServerRoot(REPO_ROOT)

/** The Solitaire example's folder:  its files are spell files a test can name, `Card.spell`. */
const SOLITAIRE = fixtureFolder("Solitaire")

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
  const built = buildFolderFor(fixtureFolder(name))
  return { ...filesIn(fixtureFolder(name)), ...prefixed("build/", filesIn(built)) }
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

/**
 * Run `spell ...args` from `cwd`, `input` on its stdin, and wait for it to end -- at most `TEST_TIMEOUT_MS`.
 * - throws if it's still running then, naming it and showing what it printed:  it's stopped (`SIGTERM`)
 * - Why the limit:  this waits SYNCHRONOUSLY, which vitest's test timeout can't interrupt.
 *   A run that never ends held the whole file, and so `yarn test`, with nothing reported, until CI was cancelled
 *   (epic `repo-split` I73).
 */
function spell(args: string[], cwd = fixturePath(), input?: string) {
  const { status, stdout, stderr, error } = spawnSync(process.execPath, [SPELL, ...args], {
    cwd,
    input,
    encoding: "utf8",
    timeout: TEST_TIMEOUT_MS
  })
  if ((error as NodeJS.ErrnoException | undefined)?.code === "ETIMEDOUT") {
    throw new Error(
      `\`spell ${args.join(" ")}\` was still running after ${TEST_TIMEOUT_MS / 1000}s, so it was stopped.\n` +
        `stdout:\n${stdout}\nstderr:\n${stderr}`
    )
  }
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

describe("every repo's commands, under one name (epic repo-split P13)", () => {
  test("help lists each installed repo's commands under its name:  the language's, and the app's under app", () => {
    const { stdout } = spell(["help"])
    for (const repo of ["spell", "spell-parser", "spell-app"]) expect(stdout).toMatch(new RegExp(`^${repo}:$`, "m"))
    for (const command of ["lint", "speedtest", "app", "projects"])
      expect(stdout).toMatch(new RegExp(`^ {2}${command} `, "m"))
    expect(spell(["help", "app"]).stdout).toMatch(/^ {2}create \[options\] <name>/m)
  })

  test("the old spellings are gone:  spell dev, spell epic, spell check, spell new, spell serve, spell explore", () => {
    for (const command of ["dev", "epic", "check", "new", "serve", "explore", "speed", "icons", "static"]) {
      const { status, stderr } = spell([command])
      expect(status, command).not.toBe(0)
      expect(stderr, command).toContain(`unknown command '${command}'`)
    }
  })
})

describe("spell icon (Spell UI's)", () => {
  test("finds icons by name, with their packs", () => {
    const { status, stdout } = spell(["icon", "bell", "slash", "--pack", "fomantic"])
    expect(status).toBe(0)
    expect(stdout).toMatch(/^bell slash +fomantic {2}also alarm mute\nbell slash outline {2}fomantic\n$/)
  })

  test("--open serves a gallery until interrupted -- the page, and each icon's svg", async () => {
    const child = spawn(process.execPath, [SPELL, "icon", "bell", "--open"], {
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

describe("spell app serve", () => {
  // one retry:  vite's first start, in a busy run, once timed out (epic page I3)
  const options = { timeout: 180_000, retry: 1 }
  test(
    "--headless:  the page server's editor (on --port if it starts the page server), /api through it, the project",
    options,
    async () => {
      // the editor is the page server's child:  a page server already running (a developer's) keeps its own port
      const running = Boolean(await new SRV.PidFile(SERVER_ROOT).status())
      // well away from the app's own 3000, so a running `yarn start` doesn't clash
      const port = 3700 + Math.floor(Math.random() * 200) * 2
      const child = spawn(
        process.execPath,
        [SPELL, "app", "serve", "@spell/examples/Solitaire", "--headless", "--port", String(port)],
        {
          cwd: TEMP,
          stdio: ["ignore", "pipe", "pipe"]
        }
      )
      // a failed check skips the Ctrl-C below:  stop it anyway, and so the page server it started
      onTestFinished(() => {
        if (child.exitCode === null && child.signalCode === null) child.kill("SIGINT")
      })
      let out = ""
      let err = ""
      child.stdout.on("data", (data) => (out += data))
      child.stderr.on("data", (data) => (err += data))
      await until(() => out.includes("http://") || child.exitCode !== null, 120_000)
      expect(out, err).toMatch(/^http:\/\/localhost:\d+\/edit\/@spell\/examples\/Solitaire\n$/)
      const editor = new URL(out.trim()).origin
      if (!running) expect(editor).toBe(`http://localhost:${port}`)
      expect(await (await fetch(`${editor}/`)).text()).toContain("<html")
      // the page it opens loads its app:  each module script, and what each imports, asked for as a browser asks
      const scripts = await moduleScripts(out.trim())
      // Vite stamps a source changed since it started (`index.tsx?t=...`):  compare the path alone
      expect(scripts.filter((script) => new URL(script).pathname.endsWith("/src/app/index.tsx"))).toHaveLength(1)
      for (const script of scripts) {
        const response = await fetch(script, { headers: SCRIPT_REQUEST })
        expect(`${response.status} ${response.headers.get("content-type")}`, script).toBe("200 text/javascript")
      }
      const projects = await (await fetch(`${editor}/api/projects/list/@spell/examples`)).text()
      expect(projects).toContain("@spell/examples/Solitaire")
      // a file by its URL, `/spaces/<address>`, through vite's proxy
      const file = await fetch(`${editor}/spaces/@spell/examples/Solitaire/Solitaire.spell`)
      expect(file.status).toBe(200)

      child.kill("SIGINT")
      expect(await new Promise((done) => child.on("exit", done))).toBe(0)
      // the editor stops with the page server -- if `spell app serve` started it;  else both run on
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
    // with the page server running, `--port` doesn't apply:  `spell app serve` would just run
    if (await new SRV.PidFile(SERVER_ROOT).status()) context.skip()
    const busy = createServer()
    await new Promise<void>((done) => busy.listen(0, done))
    const port = (busy.address() as { port: number }).port
    const { status, stderr } = spell(["app", "serve", "--headless", "--port", String(port)], TEMP)
    busy.close()
    expect(status).toBe(2)
    expect(stderr).toContain(`Port ${port} is in use`)
  })
})

describe("no project named", () => {
  test("in a project's folder:  that project -- for every command", () => {
    const here = tempProject("Here", 'print "here"\n')
    expect(spell(["lint"], here).stderr).toContain("✓ @local/")
    expect(spell(["compile"], here).stderr).toContain("wrote Here.spell.js")
    expect(spell(["run"], here).stdout).toBe("here\n")
    expect(spell(["describe"], here).stdout).toMatch(/^Here\n/)
  })

  test("outside a project, with no terminal to ask on:  says to name one", () => {
    const { status, stderr } = spell(["lint"], TEMP)
    expect(status).toBe(2)
    expect(stderr).toContain("No spell project here -- name one")
  })
})

describe("spell compile", () => {
  test("--stdout prints exactly the fixture's snapshot", () => {
    const { status, stdout, stderr } = spell(["compile", "@spell/test/fizzbuzz", "--stdout"])
    expect(stderr).toContain("✓ @spell/test/fizzbuzz")
    expect(status).toBe(0)
    expect(stdout).toBe(readFileSync(fixturePath("fizzbuzz", `fizzbuzz${SP.SNAPSHOT_JS_SUFFIX}`), "utf8"))
  })

  test("a spell file prints its javascript", () => {
    // Solitaire's card
    const { status, stdout } = spell(["compile", "Card.spell"], SOLITAIRE)
    expect(status).toBe(0)
    // after the file's heading and docstring;  just code:  declarations go in the project's declarations file
    expect(stdout).toMatch(/^core\.heading\([^]*\nexport class Card extends View \{/)
    expect(stdout).not.toContain("SPELL:")
  })

  test("a bare root, with no terminal to ask on, lists its projects", () => {
    const { status, stdout, stderr } = spell(["compile", "@spell/test"])
    expect(status).toBe(2)
    expect(stdout).toBe("")
    expect(stderr).toContain("@spell/test holds several projects -- name one, or pass --all:\n  @spell/test/counter\n")
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
    cpSync(fixtureFolder("Solitaire"), copy, { recursive: true })
    const { status, stderr } = spell(["compile", "."], copy)
    expect(status).toBe(0)
    const wrote = [SP.COMPILED_JS_SUFFIX, SP.DECLARATIONS_JSON_SUFFIX, SP.WORDS_JS_SUFFIX, SP.SCOPES_JS_SUFFIX]
    expect(stderr).toContain(`wrote ${wrote.map((suffix) => `Solitaire${suffix}`).join(", ")}`)
    const pack = readFileSync(resolve(copy, `Solitaire${SP.SCOPES_JS_SUFFIX}`), "utf8")
    expect(pack).toContain("type:Tableau")
    expect(pack).not.toContain("file://")
    const words = readFileSync(resolve(copy, `Solitaire${SP.WORDS_JS_SUFFIX}`), "utf8")
    expect(words).toContain('dealTheCards: "deal the cards"')
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

describe("spell lint", () => {
  /** A project with one bad line. */
  let broken: string
  beforeAll(() => {
    broken = tempProject("Broken", 'print "fine"\nflibbertigibbet the wombat\n')
  })

  test("a clean project:  nothing on stdout, exit 0", () => {
    const { status, stdout, stderr } = spell(["lint", "@spell/examples/Solitaire"])
    expect(stderr).toContain("✓ @spell/examples/Solitaire")
    expect(stdout).toBe("")
    expect(status).toBe(0)
  })

  test("errors on stdout as path:line:col, exit 1", () => {
    const { status, stdout, stderr } = spell(["lint", "."], broken)
    expect(stderr).toContain("1 error")
    expect(stdout).toBe('Broken.spell:2:1  Don\'t understand "flibbertigibbet the wombat"\n')
    expect(status).toBe(1)
  })

  test("--json", () => {
    const { stdout } = spell(["lint", "Broken.spell", "--json"], broken)
    expect(JSON.parse(stdout)).toEqual([
      expect.objectContaining({ path: resolve(broken, "Broken.spell"), line: 2, column: 1 })
    ])
  })
})

describe("spell lint:  retired words (epic elemental-spell, Q61)", () => {
  const SOURCE =
    'a "card" is a drawable thing where:\n\t- its "rank" is a number\na "pile" is a drawable list of cards\n'

  test("each one is an error naming its new word, exit 1;  writes nothing", () => {
    const retired = tempProject("Retired", SOURCE)
    const { status, stdout } = spell(["lint", "."], retired)
    expect(stdout).toBe(
      [
        'Retired.spell:1:15  "drawable thing" is now "view":  say "view" instead',
        'Retired.spell:3:15  "drawable list" is now "viewable list":  say "viewable list" instead',
        ""
      ].join("\n")
    )
    expect(status).toBe(1)
    expect(readFileSync(resolve(retired, "Retired.spell"), "utf8")).toBe(SOURCE)
  })

  test("--fix writes the new words and says what it did, exit 0;  then a check is clean", () => {
    const fixing = tempProject("Fixing", SOURCE)
    const { status, stdout } = spell(["lint", ".", "--fix"], fixing)
    expect(stdout).toBe(
      [
        'Fixing.spell:1:15  fixed:  "drawable thing" is now "view"',
        'Fixing.spell:3:15  fixed:  "drawable list" is now "viewable list"',
        ""
      ].join("\n")
    )
    expect(status).toBe(0)
    expect(readFileSync(resolve(fixing, "Fixing.spell"), "utf8")).toBe(
      'a "card" is a view where:\n\t- its "rank" is a number\na "pile" is a viewable list of cards\n'
    )
    expect(spell(["lint", "."], fixing).status).toBe(0)
  }, 30_000)
})

describe("spell lint:  editor pages (epic property-editor P6, Q17)", () => {
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
    const { status, stdout, stderr } = spell(["lint", "."], paged)
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
    const { status, stdout } = spell(["lint", ".", "--fix"], paged)
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

    const again = spell(["lint", "."], paged)
    expect(again.stderr).toContain("(editor pages)  1 page\n")
    expect(again.stdout).toBe("")
    expect(again.status).toBe(0)
  }, 30_000)

  test("a page whose schema names no type of the project:  one problem, which --fix can't fix", () => {
    const typo = tempProject("TypoPage", "a card is a thing\na card has a label as text\n")
    writeFileSync(resolve(typo, "Card.editor.html"), CARD_PAGE.replace('schema="Card"', 'schema="Crad"'))
    const { status, stdout } = spell(["lint", ".", "--fix", "--json"], typo)
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
    expect(module).toContain('import "spell-ui/ui-property-editor"')
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
    const { status, stdout } = spell(["describe", "Card.spell"], SOLITAIRE)
    expect(status).toBe(0)
    expect(stdout).toMatch(/^Card\.spell\n {2}template Card {2}is a View\n/)
  })

  test("one thing, by name -- ignoring case, and spaces ~== `_`", () => {
    const { status, stdout } = spell(["describe", ".", "STOCK pile"], fixtureFolder("Solitaire"))
    expect(status).toBe(0)
    expect(stdout).toMatch(/^template StockPile is a Pile\nSolitaire\.spell:\d+\n/)
  })

  test("a member of a thing", () => {
    const { stdout } = spell(["describe", "@spell/examples/Solitaire", "card", "color"])
    expect(stdout).toMatch(/^property color of Card\n/)
  })

  test("an unknown name", () => {
    const { status, stderr } = spell(["describe", "@spell/examples/Solitaire", "wombat"])
    expect(status).toBe(2)
    expect(stderr).toContain("Nothing called 'wombat' in @spell/examples/Solitaire")
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
    const { status, stderr } = spell(["run", "@spell/examples/Solitaire", "--target", "ts", "--seed", "1"])
    expect(stderr).toContain("Solitaire draws:  its ts/solid can't open in a browser yet")
    expect(status).toBe(0)
  })

  test("--target with a name no target has:  says which there are, exit 1", () => {
    const { status, stderr } = spell(["run", "@spell/test/fizzbuzz", "--target", "rust"])
    expect(stderr).toContain('--target takes js, ts or py, not "rust"')
    expect(status).not.toBe(0)
  })

  test("--no-browser:  skips what needs a browser, and says so", () => {
    const { status, stderr } = spell(["run", "@spell/examples/Solitaire", "--no-browser"])
    expect(stderr).toContain("Solitaire shows a UI (start the solitaire), which needs a browser")
    expect(status).toBe(0)
  })

  test("a UI project runs in the browser, in <spell-viewer>, until interrupted -- writing nothing into it", async () => {
    // the fixture's files and its build folder's, each by when it last changed:  none added or written by the run
    const before = fixtureFiles("Solitaire")
    const child = spawn(process.execPath, [SPELL, "run", "@spell/examples/Solitaire"], {
      cwd: fixturePath(),
      env: { ...process.env, SPELL_NO_BROWSER: "1" },
      stdio: ["ignore", "pipe", "pipe"]
    })
    let out = ""
    child.stdout.on("data", (data) => (out += data))
    // after what the program printed as it ran under node
    await until(() => /http:\/\/localhost:\d+\/\n/.test(out), 120_000)
    const url = /http:\/\/localhost:\d+\//.exec(out)![0]
    expect(await (await fetch(url)).text()).toContain('<spell-viewer src="app/Solitaire.spell.js" toolbar>')
    expect(await (await fetch(new URL("app/Solitaire.spell.js", url))).text()).toContain("class Tableau")
    expect(await (await fetch(new URL("app/Solitaire.scopes.js", url))).text()).toContain("type:Tableau")
    expect((await fetch(new URL("element/spell-viewer.js", url))).status).toBe(200)
    expect((await fetch(new URL("element/../../package.json", url))).status).toBe(404)

    child.kill("SIGINT")
    expect(await new Promise((done) => child.on("exit", done))).toBe(0)
    expect(fixtureFiles("Solitaire")).toEqual(before)
  }, 180_000)
})

describe("spell test", () => {
  test("reports each test -- its cards', deck's and piles', then its game's", () => {
    const { status, stdout } = spell(["test", "@spell/examples/Solitaire"])
    const tests = ["card setup", "jokers", "deck creation", "deck with jokers", "piles", "the moves"]
    expect(stdout).toBe(
      `${tests.map((name) => `✓ test ${name}  (${stdout.match(new RegExp(`test ${name}  \\((\\d+) checks`))?.[1]} checks)\n`).join("")}\n6 passed\n`
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
    const { status, stdout } = spell(["test", "@spell/examples/Solitaire", "--name", "deck"])
    expect(status).toBe(0)
    expect(stdout).toMatch(
      /^✓ test deck creation {2}\(\d+ checks\)\n✓ test deck with jokers {2}\(\d+ checks\)\n\n2 passed\n$/
    )
  })
})

describe("spell translate (epic spanish P24-P26)", () => {
  /** A small game, in English. */
  const GAME = [
    'a "card" is a thing where:',
    '\t- its "rank" is one of ace or king',
    '\t- it "is a (rank)"',
    "",
    "to test cards",
    "\tget a new card whose rank is ace",
    "\tit is an ace should be yes",
    "\tit is a king should be no",
    ""
  ].join("\n")

  /** Its names in Spanish, as a person (or `claude -p`) left them. */
  const NAMES = {
    types: { card: { name: "carta", gender: "feminine" }, game: { name: "juego" } },
    names: { rank: "rango", ace: "as", king: "rey", game: "juego" },
    phrases: { "is a (rank)": "es un (rango)", cards: "las cartas" }
  }

  test("writes the project in Spanish:  its files renamed, lint clean;  --update rewrites only the line that changed", () => {
    const folder = tempProject("Game", GAME)
    writeFileSync(resolve(folder, "Game.es.names.json5"), JSON.stringify(NAMES))
    const out = resolve(TEMP, "Juego")
    const first = spell(["translate", folder, "--to", "es", "--no-ai", "--out", out])
    expect(first.status).toBe(0)
    expect(first.stdout).toContain("9 of 9 lines translated")
    expect(readFileSync(resolve(out, "Juego.es.spell"), "utf8")).toBe(
      [
        'una "carta" es una cosa donde:',
        '\t- su "rango" es uno de as o rey',
        '\t- "es un (rango)"',
        "",
        "para probar las cartas",
        "\tobtener una nueva carta cuyo rango es as",
        "\tes un as debería ser sí",
        "\tes un rey debería ser no",
        ""
      ].join("\n")
    )
    expect(JSON.parse(readFileSync(resolve(out, SP.PROJECT_FILE), "utf8")).imports).toEqual([
      { path: "/Juego.es.spell", active: true }
    ])
    expect(spell(["lint", out]).status).toBe(0)

    // one line changed in English:  one line changed in Spanish, a hand edit elsewhere kept
    const spanish = resolve(out, "Juego.es.spell")
    writeFileSync(
      spanish,
      readFileSync(spanish, "utf8").replace("para probar las cartas", "para probar las cartas  // a mano")
    )
    writeFileSync(
      resolve(folder, "Game.spell"),
      GAME.replace("it is a king should be no", "it is not a king should be yes")
    )
    const update = spell(["translate", folder, "--to", "es", "--no-ai", "--update", "--out", out])
    expect(update.status).toBe(0)
    expect(update.stdout).toContain("1 of 9 lines translated")
    const lines = readFileSync(spanish, "utf8").split("\n")
    expect(lines[4]).toBe("para probar las cartas  // a mano")
    expect(lines[7]).toBe("\tno es un rey debería ser sí")
  })

  test("a name the dictionary lacks, with --no-ai:  kept as written, marked TODO in the line and the dictionary, exit 1", () => {
    // a word the shared glossary doesn't have either
    const folder = tempProject("Gizmo", 'a "gizmo" is a thing\n')
    const { status, stdout } = spell([
      "translate",
      folder,
      "--to",
      "es",
      "--no-ai",
      "--out",
      resolve(TEMP, "Artilugio")
    ])
    expect(status).toBe(1)
    // where the line to fix is:  in the translation
    expect(stdout).toContain('Gizmo.es.spell:1  types "gizmo"')
    expect(readFileSync(resolve(TEMP, "Artilugio", "Gizmo.es.spell"), "utf8")).toBe(
      'un "gizmo" es una cosa  // TODO: translate (types "gizmo")\n'
    )
    // the dictionary goes with the translation, into --out (epic spanish J186):  the project is never written to
    expect(readFileSync(resolve(TEMP, "Artilugio", "Gizmo.es.names.json5"), "utf8")).toContain(
      '"gizmo": {\n      "name": "TODO"'
    )
    expect(existsSync(resolve(folder, "Gizmo.es.names.json5"))).toBe(false)
  })

  test("a name the shared glossary has, with --no-ai:  no call, no TODO, the same word as every project (P26)", () => {
    const folder = tempProject("Deck", 'a "deck" is a thing\n')
    const { status, stdout } = spell(["translate", folder, "--to", "es", "--no-ai", "--out", resolve(TEMP, "Mazo")])
    expect(status).toBe(0)
    expect(stdout).toContain("1 from the glossary")
    expect(readFileSync(resolve(TEMP, "Mazo", "Mazo.es.spell"), "utf8")).toBe('un "mazo" es una cosa\n')
  })

  test("a language with no pack:  says which there are, exit 2", () => {
    const { status, stderr } = spell(["translate", tempProject("Klingon", "print 1\n"), "--to", "tlh"])
    expect(status).toBe(2)
    expect(stderr).toContain("No language pack 'tlh':  try en, es")
  })
})

describe("spell projects", () => {
  test("lists the groups, each by its address", () => {
    const { status, stdout } = spell(["projects"])
    expect(status).toBe(0)
    expect(stdout).toMatch(/^@spell\/test +Test fixtures +7 projects$/m)
    expect(stdout).toMatch(/^owen@spell +Projects /m)
  })

  test("one group's projects, as JSON", () => {
    const { stdout } = spell(["projects", "@spell/test", "--json"])
    expect(JSON.parse(stdout)).toEqual([
      { name: "counter", id: "@spell/test/counter" },
      { name: "counter-app", id: "@spell/test/counter-app" },
      { name: "fizzbuzz", id: "@spell/test/fizzbuzz" },
      { name: "lists-from-zero", id: "@spell/test/lists-from-zero" },
      { name: "people", id: "@spell/test/people" },
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
    const { status, stderr } = spell(["format", "@spell/test/fizzbuzz"])
    expect(status).toBe(2)
    expect(stderr).toContain("Won't format test projects")
  })
})

describe("spell speedtest", () => {
  test("times one module's rules:  a table and the pass count", () => {
    const { status, stdout } = spell(["speedtest", "if", "--runs", "1"])
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
    const { status, stdout } = spell(["parse", "a new card", "--in", "@spell/examples/Solitaire"])
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
    const { status, stdout } = spell(["repl"], fixturePath(), "x is 3\nprint x + 1\n")
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
    const { status, stdout } = spell(["explain", "tableau", "--in", "@spell/examples/Solitaire"])
    expect(status).toBe(0)
    expect(stdout).toMatch(/Solitaire\.spell:\d+\ntemplate Tableau is a Pile\n/)
  })

  test("--in a project:  what the projects it imports declare, too", () => {
    // the type `Counter` is the frozen counter library's, which counter-app imports
    const { status, stdout } = spell(["explain", "counter", "--in", "@spell/test/counter-app"])
    expect(status).toBe(0)
    expect(stdout).toMatch(/(^|[/\n])counter\/Counter\.spell:\d+\ntemplate Counter is a View\n/)
  })

  test("nothing by that name", () => {
    const { status, stderr } = spell(["explain", "wombat"])
    expect(status).toBe(1)
    expect(stderr).toContain("Nothing called 'wombat'")
  })
})

describe("spell app create", () => {
  test("makes a project that runs -- and won't overwrite it", () => {
    const { status, stdout } = spell(["app", "create", "Snake", "--in", TEMP])
    expect(status).toBe(0)
    expect(stdout).toBe(`${resolve(TEMP, "Snake")}\n`)
    expect(JSON.parse(readFileSync(resolve(TEMP, "Snake", SP.PROJECT_FILE), "utf8"))).toEqual({
      imports: [{ path: "/Snake.spell", active: true }]
    })
    expect(spell(["run", "."], resolve(TEMP, "Snake")).stdout).toBe("hello from Snake\n")

    const again = spell(["app", "create", "Snake", "--in", TEMP])
    expect(again.status).toBe(2)
    expect(again.stderr).toContain("already holds a project")
  })

  test("a name spell can't use", () => {
    expect(spell(["app", "create", "9 lives", "--in", TEMP]).status).toBe(2)
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

/**
 * The headers a browser sends for a module script.
 * - Vite answers a file it can't find with a 404 only when asked this way:
 *   any other request for it gets the editor's page, a 200 (its fallback for the app's own URLs, `/edit/...`).
 */
const SCRIPT_REQUEST = { accept: "*/*", "sec-fetch-dest": "script" }

/**
 * The module scripts the page at `url` loads, and the ones each of them imports by path, as full URLs.
 * - Only one level of imports:  the app's entry, under Vite's inline-script module, and Vite's own client's.
 * - Epic `repo-split` I72:  the editor's page asked for its entry outside Vite's root, `/src/app/index.tsx`,
 *   and drew nothing.
 */
async function moduleScripts(url: string): Promise<string[]> {
  const page = await (await fetch(url, { headers: { accept: "text/html" } })).text()
  const scripts = [...page.matchAll(/<script\b[^>]*\btype="module"[^>]*\bsrc="([^"]+)"/g)].map(
    ([, src]) => new URL(src!.replaceAll("&amp;", "&"), url).href
  )
  const imported = await Promise.all(
    scripts.map(async (script) => {
      const code = await (await fetch(script, { headers: SCRIPT_REQUEST })).text()
      return [...code.matchAll(/\b(?:from|import)\s*["'](\/[^"']+)["']/g)].map(([, path]) => new URL(path!, url).href)
    })
  )
  return [...new Set([...scripts, ...imported.flat()])]
}
