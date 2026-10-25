/**
 * `yarn examples:readme [--check] [--no-pictures] [name...]`:  keeps the example apps' table in
 * [README-examples.md](../README-examples.md) true to the example projects themselves.
 * - Reads every project of the `@spell/examples` and `@spell/library` groups (`spaces/@spell/<group>/<project>/`).
 *   - What each shows:  its project file's `description`, else the first comment of its first spell file.
 *   - Its name:  its project file's `title`, else its folder's name, `lists-from-zero` => `Lists From Zero`.
 * - Takes a picture of each example open in the editor, its spell beside it running, into `docs/images/examples/`.
 *   - Headless Playwright, at the address the kit's editor answers on (`.spell-server.editor.json`, at the page
 *     server's root, the kit's):
 *     start it first, with `yarn start` or `spell app serve`.
 *   - A library has no app of its own, so no picture.
 * - Rewrites the table between the page's two marker comments, `<!-- examples:start -->` and `<!-- examples:end -->`;
 *   the rest of the page is written by hand.
 * - Options:
 *   - `--check`:  writes nothing;  exits 1 if the table is out of date, or an example has no picture
 *     (the spaces tests run this)
 *   - `--no-pictures`:  the table only, without a browser or the editor
 *   - `name...`:  only these examples' pictures, e.g. `calculator`
 * - Opening a project in the editor compiles it, which may rewrite its declarations and words files:
 *   check `git status` after.
 * - Plain node and `tsx`:  no `spell-app` imports, so it needs no alias hook.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import path from "node:path"

import JSON5 from "json5"

import { BrowserPage } from "spell/element-tools/BrowserPage"
import { pageServerRoot } from "spell/server/page/settings"

/** spell-app's checkout. */
const ROOT = path.resolve(import.meta.dirname, "..")

/** The page this keeps current. */
const README = path.join(ROOT, "README-examples.md")

/** Where the pictures go, and the page's path to them. */
const IMAGES = "docs/images/examples"

/** The built-in projects' folder:  `@spell/examples` is `spaces/@spell/examples/`. */
const SPACE = path.join(ROOT, "spaces", "@spell")

/** The groups listed, in order:  the examples have pictures, the libraries don't. */
const GROUPS = [
  { group: "examples", pictures: true },
  { group: "library", pictures: false }
] as const

/**
 * The examples in the order a newcomer should open them;  one not listed comes after these, by name.
 * - Add a new example here where it fits.
 */
const LEARNING_ORDER = [
  "fizzbuzz",
  "Counter",
  "calculator",
  "tic-tac-toe",
  "bill-splitter",
  "flash-cards",
  "habit-tracker",
  "TaskList",
  "ListaDeTareas",
  "Solitaire",
  "Solitario"
]

/** The comments the table sits between. */
const START = "<!-- examples:start -->"
const END = "<!-- examples:end -->"

/** The window the pictures are taken in:  the editor's own layout, its spell on the left and the app on the right. */
const WINDOW = { width: 1280, height: 800 }

/** How long a project gets to compile, run and draw, after the page's network is quiet. */
const SETTLE_MS = 5000

/** How wide the table draws each picture;  a click opens it whole. */
const THUMBNAIL_WIDTH = 360

const args = process.argv.slice(2)
const isCheck = args.includes("--check")
const withPictures = !isCheck && !args.includes("--no-pictures")
const only = new Set(args.filter((arg) => !arg.startsWith("--")))

const projects = readProjects()
const table = tableFor(projects)
if (isCheck) process.exitCode = check(table, projects) ? 0 : 1
else {
  if (withPictures) await takePictures(projects.filter((project) => project.hasPicture))
  writeTable(table)
}

////////////////
// ## The projects
////////////////

/** One built-in project, as the table lists it. */
type Project = {
  /** its address, e.g. `@spell/examples/fizzbuzz` */
  address: string
  /** its folder's name, e.g. `fizzbuzz`:  its picture's name too */
  name: string
  /** its name for people, e.g. `FizzBuzz` */
  title: string
  /** what it shows, one line */
  description: string
  /** its folder, from the page:  `spaces/@spell/examples/fizzbuzz` */
  folder: string
  /** an example with an app to picture;  a library has none */
  hasPicture: boolean
}

/** Every project of the listed groups, examples first, each group in its order. */
function readProjects(): Project[] {
  return GROUPS.flatMap(({ group, pictures }) => {
    const names = readdirSync(path.join(SPACE, group), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .toSorted(byLearningOrder)
    return names.map((name) => projectFor(group, name, pictures))
  })
}

/** Sort:  `LEARNING_ORDER` first, in its order, then the rest by name. */
function byLearningOrder(a: string, b: string): number {
  const rank = (name: string) => {
    const index = LEARNING_ORDER.indexOf(name)
    return index === -1 ? LEARNING_ORDER.length : index
  }
  return rank(a) - rank(b) || a.localeCompare(b)
}

/** What the table says of project `name` in `group`, from its folder. */
function projectFor(group: string, name: string, hasPicture: boolean): Project {
  const folder = path.join(SPACE, group, name)
  const file = JSON5.parse(readFileSync(path.join(folder, "__project.json5"), "utf8")) as ProjectFile
  return {
    address: `@spell/${group}/${name}`,
    name,
    title: file.title ?? titleFor(name),
    description: file.description ?? firstComment(folder, file) ?? "",
    folder: path.relative(ROOT, folder),
    hasPicture
  }
}

/** The parts of a project file this reads (spaces' `ProjectFileJSON` has them all). */
type ProjectFile = { title?: string; description?: string; imports?: { path: string }[] }

/** A folder's name as a title, as the editor makes it:  `lists-from-zero` => `Lists From Zero`. */
function titleFor(name: string): string {
  return name.replace(/(^|-)(\w)/g, (_match, dash: string, letter: string) => (dash ? " " : "") + letter.toUpperCase())
}

/** The first comment of the project's first spell file, without its `#` or `//`;  `undefined` if none. */
function firstComment(folder: string, file: ProjectFile): string | undefined {
  const first = file.imports?.find((entry) => entry.path.endsWith(".spell"))
  if (!first) return undefined
  const lines = readFileSync(path.join(folder, first.path), "utf8").split("\n")
  const comment = lines.find((line) => /^\s*(#|\/\/|--)/.test(line))
  return comment?.replace(/^\s*(#+|\/\/|--)\s*/, "").trim()
}

////////////////
// ## The table
////////////////

/** The table's Markdown:  one row per project, its address, what it shows and its picture. */
function tableFor(projects: Project[]): string {
  const rows = projects.map((project) => {
    const address = `[\`${project.address}\`](${project.folder}/)`
    const picture = project.hasPicture
      ? `<a href="${pictureOf(project)}"><img src="${pictureOf(project)}" width="${THUMBNAIL_WIDTH}" ` +
        `alt="${altFor(project)}"></a>`
      : "a library:  no app of its own"
    return `| ${project.title} | ${address} | ${project.description} | ${picture} |`
  })
  return ["| Example | Address | What it shows | Running |", "| --- | --- | --- | --- |", ...rows].join("\n")
}

/** A project's picture, from the page. */
function pictureOf(project: Project): string {
  return `${IMAGES}/${project.name}.png`
}

/** A picture's alt text. */
function altFor(project: Project): string {
  return `${project.title} open in the Spell editor:  its Spell on the left, the app running on the right`
}

/** The page with `table` between its markers;  throws if the page has no markers. */
function pageWith(table: string): string {
  const page = readFileSync(README, "utf8")
  const start = page.indexOf(START)
  const end = page.indexOf(END)
  if (start === -1 || end < start)
    throw new Error(`examples-readme:  ${README} has no ${START} ... ${END};  put them where the table goes`)
  return `${page.slice(0, start + START.length)}\n\n${table}\n\n${page.slice(end)}`
}

/** Write the table into the page. */
function writeTable(table: string): void {
  writeFileSync(README, pageWith(table))
  console.log(`${path.relative(process.cwd(), README)}:  ${projects.length} projects`)
}

/**
 * `true` if the page's table says what `table` does, and every example's picture is there;  else says why.
 * - Compares cell by cell, so the formatter's padding of the table's columns doesn't count.
 */
function check(table: string, projects: Project[]): boolean {
  const page = readFileSync(README, "utf8")
  const current = page.slice(page.indexOf(START) + START.length, page.indexOf(END))
  const cells = (text: string) =>
    text
      .split("\n")
      .filter((line) => line.trim().startsWith("|") && !/^\|[\s|:-]+\|$/.test(line.trim()))
      .map((line) =>
        line
          .split("|")
          .map((cell) => cell.trim())
          .join("|")
      )
      .join("\n")
  const missing = projects.filter((project) => project.hasPicture && !existsSync(path.join(ROOT, pictureOf(project))))
  if (cells(current) !== cells(table))
    console.error("README-examples.md's table is out of date:  run `yarn examples:readme` in spell-app")
  for (const project of missing) console.error(`no picture of ${project.address}:  run \`yarn examples:readme\``)
  return cells(current) === cells(table) && !missing.length
}

////////////////
// ## The pictures
////////////////

/** Open each project in this checkout's editor, headless, and save what it shows. */
async function takePictures(projects: Project[]): Promise<void> {
  // the page server's record of its editor, at its root:  the kit's (epic `repo-split` P16)
  const editorFile = path.join(pageServerRoot(ROOT), ".spell-server.editor.json")
  if (!existsSync(editorFile))
    throw new Error("examples-readme:  the editor isn't running here;  `yarn start` first, or pass --no-pictures")
  const editor = (JSON.parse(readFileSync(editorFile, "utf8")) as { url: string }).url
  mkdirSync(path.join(ROOT, IMAGES), { recursive: true })
  // `BrowserPage` loads Playwright only here:  `--check` and `--no-pictures` need no browser
  await BrowserPage.with(async (browser) => {
    for (const project of projects) {
      if (only.size && !only.has(project.name)) continue
      const page = await BrowserPage.newPage(browser, { viewport: WINDOW })
      await page.goto(new URL(`edit/${project.address}`, editor).href, { waitUntil: "networkidle" })
      await page.waitForTimeout(SETTLE_MS)
      const file = path.join(ROOT, pictureOf(project))
      await page.screenshot({ path: file })
      console.log(path.relative(process.cwd(), file))
      await page.close()
    }
  })
}
