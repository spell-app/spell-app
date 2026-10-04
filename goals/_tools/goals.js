/**
 * `yarn goals <command> ...` (and `spell goals ...`):  the goals tool.  Edits the structured parts of goals pages,
 * and starts what goes with them:  the goals server, a browser window, VS Code's preview, Claude sessions.
 * - Rules, ids and markup:  `goals/AGENTS.md`.  Used by the /goals skills and the agents they hand work to.
 * - Pages are named by TARGET:  `[set/]topic[/anchor]`, e.g. `spell/motivation/G1` (`targets.js`).
 * - Every edit:  takes the page's lock (parallel agents queue instead of clobbering each other), parses it,
 *   changes it through `GoalsPage` (`page.js`), stamps "updated", writes it, tidies it (code links, oxfmt), then
 *   rewrites the contents pages' cards and numbers.
 * - Reuses `packages/docs/scripts/pages.js` (`tidy()`):  the pages ARE spell docs, kept outside `packages/docs`.
 */
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"
import { pathToFileURL } from "node:url"

import { DOCS, openInVSCode, tidy } from "../../packages/docs/scripts/pages.js"
import { Window } from "../../scripts/window.mjs"
import { SRV } from "$/server"
import { PageServer } from "$/server/page"
import { LaunchError, claudeCommand, claudeStatus, runInTerminal } from "./launch.js"
import {
  ACCENTS,
  GoalsError,
  GoalsPage,
  HORIZONS,
  KINDS,
  STATUS,
  attr,
  contentsParts,
  homeParts,
  isoDate,
  replaceBetween
} from "./page.js"
import {
  GOALS,
  ITEM_ID,
  ROOT,
  TargetError,
  goalSets,
  preferences,
  resolveTarget,
  setPreference,
  topicsOf
} from "./targets.js"

/** The goals templates in the docs:  laid out as a goals folder is (home, set, topic). */
const TEMPLATES = join(DOCS, "templates/goals")
/** The goals home page. */
const HOME = join(GOALS, "index.html")

////////////////
// ## Pages on disk
////////////////

/** The goals page at `file`, parsed. */
export function readPage(file) {
  if (!existsSync(file)) throw new GoalsError(`no page ${relative(ROOT, file)}`)
  return GoalsPage.parse(readFileSync(file, "utf8"))
}

/**
 * Change the page at `file` with `change(page)`, under its lock;  returns what `change` returned.
 * - stamps "updated", writes, tidies, then rewrites the contents pages
 */
export function editPage(file, change) {
  const result = SRV.FileLock.run(file, () => {
    const page = readPage(file)
    const value = change(page)
    page.touch()
    page.retarget()
    writeFileSync(file, page.toString())
    tidyOrFail([file])
    return value
  })
  writeIndexes()
  return result
}

/**
 * Code links and oxfmt on `files`, through the docs' `tidy()`.
 * - ABSOLUTE paths:  `tidy()` runs in `packages/docs`, and oxfmt refuses a path with `..` in it
 */
export function tidyOrFail(files) {
  if (!tidy(files.map((file) => resolve(file)))) throw new GoalsError("tidy failed (see above)")
}

/** Every topic summary of `set`. */
function summariesOf(set) {
  return topicsOf(set).map((topic) => readPage(topic.file).summary())
}

/**
 * Rewrite the generated parts of every contents page:  each set's topic cards and numbers, then the home page's
 * set cards (making the home page from its template if there is none).
 */
export function writeIndexes() {
  const sets = goalSets()
  const written = []
  const home = []
  for (const set of sets) {
    const topics = summariesOf(set.name)
    const page = readPage(set.index)
    home.push({ ...set, icon: page.meta.icon, accent: page.meta.accent, topics })
    let html = readFileSync(set.index, "utf8")
    if (!html.includes("<!-- topics:start -->")) continue
    const parts = contentsParts(topics)
    html = replaceBetween(replaceBetween(html, "topics", parts.topics), "stats", parts.stats)
    writeFileSync(set.index, html)
    written.push(set.index)
  }
  if (!existsSync(HOME)) writeFileSync(HOME, fromTemplate("index.html", HOME, {}))
  const parts = homeParts(home)
  writeFileSync(
    HOME,
    replaceBetween(replaceBetween(readFileSync(HOME, "utf8"), "sets", parts.sets), "stats", parts.stats)
  )
  written.push(HOME)
  tidyOrFail(written)
}

/**
 * A template's text (`path` under `templates/goals/`), for a page at `dest`:  `{{placeholders}}` filled from
 * `fill`, asset paths fixed for `dest`'s depth, the template's own title and description replaced.
 * - the site header's `root`:  the path from `dest` up to the project root (`ROOT`), for its `file://` links
 */
function fromTemplate(path, dest, fill) {
  const assets = relative(dirname(dest), join(DOCS, "_assets")).split("\\").join("/")
  const root = relative(dirname(dest), ROOT).split("\\").join("/") || "."
  let html = readFileSync(join(TEMPLATES, path), "utf8")
    .replace(/((?:href|src)=")(?:\.\.\/)*_assets\//g, `$1${assets}/`)
    .replace(/(<spell-site-header\b[^>]*?\broot=")[^"]*"/, `$1${root}"`)
    .replace(/\{\{(\w+)\}\}/g, (whole, key) => (key in fill ? attr(fill[key]) : whole))
  if (fill.title) html = html.replace(/<title>[^<]*<\/title>/, `<title>${attr(fill.title)}</title>`)
  if (fill.description)
    html = html.replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
      `<meta name="description" content="${attr(fill.description)}" />`
    )
  if (path === "index.html")
    html = html
      .replace(/<title>[^<]*<\/title>/, "<title>Goals</title>")
      .replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
        `<meta name="description" content="Every goal set in this project, one card each." />`
      )
  return html
}

////////////////
// ## Command line
////////////////

/** Usage, printed with no command or a bad one. */
const USAGE = `usage:  yarn goals <command> ...     (spell goals ... works too)
A TARGET is [set/]topic[/anchor], e.g. spell/motivation/G1;  the set may be left out for the active set.

Reading
  sets                                 goal sets (* marks the active one)
  use <set>                            make <set> the active set
  resolve <target> [--json]            what a target means:  set, topic, anchor, page
  summary [target] [--json]            status and open items
  thoughts [target] [--all] [--json]   thoughts waiting to be digested (--all:  digested ones too)

Editing
  new-set <set> --title "Title" --description "One line." [--icon name] [--accent hue]
  new <set/topic> --n N --title "Title" --description "One line." --icon "icon name" --accent hue [--short label]
  add <target> goal|idea|question|risk|decision|work "title" [--horizon now|next|someday] [--note text]
                                       [--tag text] [--details html]     prints the new id
  close <target/ID>  /  reopen <target/ID>    strike / unstrike an item (never delete one)
  log <target> "text" [--icon name]    history entry, newest first, dated today
  status <target> draft|dialog|agreed|building|shipped
  thought <target> "text" | -          a thought for Claude, on a page, section or item (-:  from stdin)
  digest <target/T3> "what came of it" mark a thought digested
  index                                rewrite every contents page's cards and numbers
  check [target] [--no-browser]        ids, links, status;  then check-spell.js in a real browser

Showing and talking
  serve                                run the goals server here (Ctrl-C stops it)
  server start|stop|status             the goals server, in the background
  open [target]                        start the server if need be, show the page in a NEW browser window
  open-vs [target]                     show the page in VS Code's side bar;  not in VS Code:  as \`open\`
  talk [target] [--window]             a /goals dialog with Claude (--window:  in a new terminal window)
  update [target] [--print] [--window] /goals-update with Claude (--print:  headless, no questions)
  claude                               is Claude Code installed and logged in?`

/** Run one command. */
async function main(argv) {
  const { positional, flags } = parseArgs(argv)
  const [command, ...rest] = positional
  const prefs = preferences()
  switch (command) {
    case "sets":
      return printSets(prefs)
    case "use":
      return useSet(need(rest[0], "a goal set"))
    case "resolve": {
      const target = resolveTarget(rest[0] ?? "", prefs)
      return console.log(flags.json ? JSON.stringify(target, null, 2) : describe(target))
    }
    case "summary":
      return printSummary(summaries(rest[0], prefs), flags.json)
    case "thoughts":
      return printThoughts(rest[0], prefs, flags)
    case "new-set":
      return createSet(need(rest[0], "a set name"), flags)
    case "new":
      return createTopic(need(rest[0], "a set/topic"), flags, prefs)
    case "add": {
      const target = topicTarget(rest[0], prefs)
      const kind = need(rest[1], "a kind")
      const id = editPage(target.file, (page) => page.addItem(kind, need(rest[2], "a title"), flags))
      return console.log(`${target.set}/${target.topic}/${id.toUpperCase()}`)
    }
    case "close":
    case "reopen": {
      const target = itemTarget(rest, prefs)
      return editPage(target.file, (page) => {
        const title = page.setItem(target.anchor, command === "close" ? "done" : "open")
        page.log(
          `${target.anchor.toUpperCase()} ${command === "close" ? "closed" : "reopened"}:  ${title}`,
          "pen to square"
        )
      })
    }
    case "log": {
      const target = resolveTarget(need(rest[0], "a target"), prefs)
      return editPage(target.file, (page) => page.log(need(rest[1], "the text"), flags.icon))
    }
    case "status": {
      const target = topicTarget(rest[0], prefs)
      return editPage(target.file, (page) => page.setStatus(need(rest[1], "a status")))
    }
    case "thought": {
      const target = resolveTarget(need(rest[0], "a target"), prefs)
      // `-`:  the text from stdin, so any quotes or backticks survive a shell
      const words = need(rest[1] === "-" ? readFileSync(0, "utf8") : rest.slice(1).join(" "), "the thought")
      const id = addThought(target, words)
      return console.log(
        `${target.name
          .split("/")
          .slice(0, target.topic ? 2 : 1)
          .join("/")}/${id.toUpperCase()}`
      )
    }
    case "digest": {
      const target = resolveTarget(need(rest[0], "a thought, e.g. spell/motivation/T3"), prefs)
      if (target.kind !== "thought") throw new GoalsError(`${target.name} is not a thought`)
      return editPage(target.file, (page) => page.digestThought(target.anchor, rest[1] ?? ""))
    }
    case "index":
      return writeIndexes()
    case "check":
      return check(rest[0], prefs, flags)
    case "serve": {
      const server = await new PageServer({ root: ROOT }).start({ port: Number(flags.port) || prefs.server.port })
      console.log(`page server:  ${server.web.url}/${relative(ROOT, HOME)}`)
      return SRV.untilInterrupted(server.web.server, () => server.stop())
    }
    case "server":
      return server(rest[0] ?? "status", prefs)
    case "open":
    case "open-vs": {
      const target = resolveTarget(rest[0] ?? "", prefs)
      // in VS Code:  the side bar's doc preview, in THIS session's window;  else a browser window
      if (command === "open-vs" && Window.inVSCode) {
        await openInVSCode(target.file, { hash: target.anchor })
        return console.log(`opened ${target.name} in VS Code`)
      }
      const { base } = await PageServer.ensure(ROOT, prefs.server.port)
      const how = SRV.openInNewWindow(`${base}${target.path}`, prefs.browser)
      return console.log(`opened ${target.name} in ${how}`)
    }
    case "talk":
    case "update":
      return claude(command === "talk" ? "goals" : "goals-update", rest[0], prefs, flags)
    case "claude":
      return console.log(JSON.stringify(claudeStatus(prefs), null, 2))
    case "help":
      return console.log(USAGE)
    default:
      return usage()
  }
}

/** Flags that never take a value:  `--all spell` is a switch and a target, not `all = "spell"`. */
const SWITCHES = new Set(["all", "json", "no-browser", "print", "window"])

/** `--key value` flags and `--key` switches, plus everything else in order. */
function parseArgs(argv) {
  const positional = []
  const flags = {}
  for (let i = 0; i < argv.length; i++) {
    const match = argv[i].match(/^--([\w-]+)$/)
    if (!match) positional.push(argv[i])
    else if (!SWITCHES.has(match[1]) && i + 1 < argv.length && !argv[i + 1].startsWith("--"))
      flags[camel(match[1])] = argv[++i]
    else flags[camel(match[1])] = true
  }
  return { positional, flags }
}

/** `no-browser` -> `noBrowser`. */
function camel(flag) {
  return flag.replace(/-(\w)/g, (_, letter) => letter.toUpperCase())
}

/** `value`, or a usage error naming what's missing. */
function need(value, what) {
  if (value === undefined || value === "") throw new GoalsError(`missing ${what}\n${USAGE}`)
  return value
}

/** Print usage and fail. */
function usage() {
  console.error(USAGE)
  process.exit(2)
}

/** The topic `text` names (no anchor allowed). */
function topicTarget(text, prefs) {
  const target = resolveTarget(need(text, "a topic"), prefs)
  if (target.kind !== "topic") throw new GoalsError(`${target.name} is not a topic`)
  return target
}

/** The item `rest` names:  `<target/ID>`, or the older `<topic> <ID>`. */
function itemTarget(rest, prefs) {
  const text = rest[1] && ITEM_ID.test(rest[1]) ? `${rest[0]}/${rest[1]}` : need(rest[0], "an item, e.g. app/Q3")
  const target = resolveTarget(text, prefs)
  if (target.kind !== "item") throw new GoalsError(`${target.name} is not an item`)
  return target
}

/** A target in a line:  name, kind, page. */
function describe(target) {
  return `${target.name}  (${target.kind})\n  page:  ${relative(process.cwd(), target.file)}${
    target.anchor ? `#${target.anchor}` : ""
  }${target.notes ? `\n  notes:  ${relative(process.cwd(), target.notes)}` : ""}`
}

////////////////
// ## Commands
////////////////

/** `sets`:  one line per set, the active one starred. */
function printSets(prefs) {
  const sets = goalSets()
  if (!sets.length) return console.log(`no goal sets yet:  yarn goals new-set <name> --title ... --description ...`)
  for (const set of sets)
    console.log(
      `${set.name === prefs.activeSet ? "*" : " "} ${set.name.padEnd(16)} ${set.title}  (${topicsOf(set.name).length} topics)`
    )
}

/** `use`:  remember `name` as the active set. */
function useSet(name) {
  const names = goalSets().map((set) => set.name)
  if (!names.includes(name)) throw new TargetError(`no goal set "${name}"`, names)
  setPreference("activeSet", name)
  console.log(`active goal set:  ${name}`)
}

/** Summaries for `text`:  one topic, or every topic of a set (default:  the active set). */
function summaries(text, prefs) {
  const target = resolveTarget(text ?? "", prefs)
  if (target.topic) return [readPage(target.file).summary()]
  return summariesOf(target.set)
}

/** `summary`:  bullets for a reply (or JSON for a script). */
function printSummary(list, json) {
  if (json) return console.log(JSON.stringify(list, null, 2))
  const lines = []
  for (const topic of list.sort((a, b) => a.n - b.n)) {
    lines.push(
      `${topic.n}. ${topic.set}/${topic.name} [${STATUS[topic.status]?.label ?? topic.status}]  ${topic.title}`
    )
    for (const kind of ["thoughts", "questions", "work", "risks"]) {
      if (!topic[kind].length) continue
      lines.push(`   ${kind === "thoughts" ? "new thoughts" : `open ${kind}`}:`)
      for (const item of topic[kind])
        lines.push(
          `     - ${item.id.toUpperCase()}  ${kind === "thoughts" ? `(${item.label})  ${item.text}` : item.title}`
        )
    }
  }
  console.log(lines.join("\n"))
}

/**
 * `thoughts`:  thoughts waiting to be digested under `text` (a set, topic, section or item), with their targets.
 * - `--all`:  digested ones too;  `--json`:  for a skill
 */
function printThoughts(text, prefs, flags) {
  const target = resolveTarget(text ?? "", prefs)
  const pages = target.topic
    ? [{ file: target.file, prefix: `${target.set}/${target.topic}` }]
    : [
        { file: target.file, prefix: target.set },
        ...topicsOf(target.set).map((topic) => ({ file: topic.file, prefix: `${target.set}/${topic.name}` }))
      ]
  const found = []
  for (const { file, prefix } of pages) {
    for (const thought of readPage(file).thoughts({ all: Boolean(flags.all) })) {
      if (target.anchor && target.kind !== "set" && thought.for !== target.anchor && thought.id !== target.anchor)
        continue
      found.push({
        ...thought,
        target: `${prefix}/${thought.id.toUpperCase()}`,
        about: `${prefix}${thought.for === "page" ? "" : `/${thought.for}`}`
      })
    }
  }
  if (flags.json) return console.log(JSON.stringify(found, null, 2))
  if (!found.length) return console.log(`no ${flags.all ? "" : "new "}thoughts under ${target.name}`)
  for (const thought of found) {
    console.log(
      `${thought.target}  [${thought.status}]  on ${thought.label}  (${thought.date.slice(0, 16).replace("T", " ")})`
    )
    console.log(`  ${thought.text.replace(/\n/g, "\n  ")}`)
    if (thought.result) console.log(`  -> ${thought.result}`)
  }
}

/** Add thought `words` at `target`;  returns its id.  Shared with the server. */
export function addThought(target, words) {
  const anchor = target.kind === "item" || target.kind === "section" ? target.anchor : undefined
  return editPage(target.file, (page) => page.addThought(anchor, words))
}

/** `new-set`:  a set's contents page from the template, then the contents pages. */
function createSet(name, { title, description, icon = "bullseye", accent = "violet" }) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) throw new GoalsError(`set "${name}" must be lower-kebab-case`)
  if (!ACCENTS.includes(accent)) throw new GoalsError(`accent must be one of ${ACCENTS.join(" / ")}`)
  const file = join(GOALS, name, "index.html")
  if (existsSync(file)) throw new GoalsError(`${relative(ROOT, file)} already exists`)
  mkdirSync(dirname(file), { recursive: true })
  const fill = {
    set: name,
    title: need(title, "--title"),
    description: need(description, "--description"),
    icon,
    accent
  }
  writeFileSync(file, fromTemplate("set/index.html", file, fill))
  writeIndexes()
  console.log(relative(process.cwd(), file))
}

/** `new`:  a topic page and its agent notes from the templates, then the contents pages. */
function createTopic(text, { n, title, description, icon, accent = "violet", short }, prefs) {
  const [setName, name, ...extra] = text.split("/")
  const set = name ? setName : prefs.activeSet
  const topic = name ?? setName
  if (extra.length || !set) throw new GoalsError(`name the topic as <set>/<topic>, e.g. spell/website`)
  if (!goalSets().some((it) => it.name === set))
    throw new TargetError(
      `no goal set "${set}"`,
      goalSets().map((it) => it.name)
    )
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(topic)) throw new GoalsError(`topic "${topic}" must be lower-kebab-case`)
  if (!ACCENTS.includes(accent)) throw new GoalsError(`accent must be one of ${ACCENTS.join(" / ")}`)
  const file = join(GOALS, set, topic, `${topic}.html`)
  const notes = join(GOALS, set, topic, `${topic}.md`)
  if (existsSync(file)) throw new GoalsError(`${relative(ROOT, file)} already exists`)
  const fill = {
    set,
    name: topic,
    short: short ?? topic,
    n: need(n, "--n"),
    title: need(title, "--title"),
    description: need(description, "--description"),
    icon: need(icon, "--icon"),
    accent,
    today: isoDate(),
    ...prefs.horizons
  }
  mkdirSync(dirname(file), { recursive: true })
  const html = fromTemplate("set/topic/topic.html", file, fill).replace('href="topic.md"', `href="${topic}.md"`)
  const page = GoalsPage.parse(html)
  page.log("Page made", "pen to square")
  page.retarget()
  writeFileSync(file, page.toString())
  tidyOrFail([file])
  if (!existsSync(notes))
    writeFileSync(
      notes,
      readFileSync(join(TEMPLATES, "set/topic/topic.md"), "utf8").replace(
        /\{\{(\w+)\}\}/g,
        (whole, key) => fill[key] ?? whole
      )
    )
  writeIndexes()
  console.log(relative(process.cwd(), file))
}

/**
 * `check`:  structural problems in each page, links that point nowhere, then the browser check;  exits 1 on any.
 * - `text`:  one topic or set page;  default every goals page
 */
function check(text, prefs, { noBrowser }) {
  let files
  if (text) files = [resolveTarget(text, prefs).file]
  else files = [HOME, ...goalSets().flatMap((set) => [set.index, ...topicsOf(set.name).map((topic) => topic.file)])]
  let failed = false
  for (const file of files.filter((it) => existsSync(it))) {
    const problems = readPage(file).check()
    const links = spawnSync("node", ["scripts/doc-links.js", "--check", file], { cwd: DOCS, encoding: "utf8" })
    if (links.status !== 0)
      problems.push(
        ...links.stdout
          .split("\n")
          .slice(1)
          .map((line) => line.trim())
          .filter(Boolean)
      )
    for (const problem of problems) console.error(`PROBLEM:  ${relative(ROOT, file)}:  ${problem}`)
    if (!problems.length) console.log(`${relative(ROOT, file)}:  structure ok`)
    failed ||= problems.length > 0
    if (noBrowser) continue
    const run = spawnSync("node", ["scripts/check-spell.js", file], { cwd: DOCS, encoding: "utf8" })
    process.stderr.write(run.stderr ?? "")
    console.log(run.status === 0 ? "  check-spell:  ok" : "  check-spell:  FAILED (problems above)")
    failed ||= run.status !== 0
  }
  if (failed) process.exit(1)
}

/** `server start|stop|status`:  this checkout's page server (`yarn server`), which serves the goals pages. */
async function server(action, prefs) {
  if (action === "start") {
    const { base, launched } = await PageServer.ensure(ROOT, prefs.server.port)
    return console.log(`${launched ? "started" : "already running"}:  ${base}/${relative(ROOT, HOME)}`)
  }
  const pidFile = new SRV.PidFile(ROOT)
  if (action === "stop") return console.log((await pidFile.stop()) ? "stopped" : "not running")
  const running = await pidFile.status()
  console.log(running ? `running (pid ${running.pid}):  ${running.base}/${relative(ROOT, HOME)}` : "not running")
}

/**
 * `talk` / `update`:  Claude Code on `/<skill> <target>`, from the project root.
 * - here, in this terminal, by default;  `--window`:  in a new terminal window;  `--print`:  headless
 * - not installed, or not logged in:  says what to do instead
 */
function claude(skill, text, prefs, { window, print }) {
  const target = text ? resolveTarget(text, prefs) : undefined
  const status = claudeStatus(prefs)
  if (!status.installed)
    throw new GoalsError("Claude Code isn't installed:  curl -fsSL https://claude.ai/install.sh | bash")
  if (!status.loggedIn) throw new GoalsError(`Claude Code isn't logged in:  ${status.path} auth login`)
  const line = claudeCommand(skill, target?.name, prefs, { print: Boolean(print) })
  if (window) return console.log(`started in ${runInTerminal(line, prefs)}:  ${line}`)
  const run = spawnSync("/bin/sh", ["-c", line], { cwd: ROOT, stdio: "inherit" })
  process.exitCode = run.status ?? 1
}

export { HORIZONS, KINDS, STATUS }

// Last, so every `const` above is initialized before `main()` runs (top-level `await`)
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try {
    await main(process.argv.slice(2))
  } catch (error) {
    if (error instanceof TargetError) {
      console.error(`goals:  ${error.message}`)
      if (error.choices.length) console.error(`  maybe:  ${error.choices.join("  ")}`)
      process.exit(1)
    }
    if (!(error instanceof GoalsError) && !(error instanceof LaunchError)) throw error
    console.error(`goals:  ${error.message}`)
    if (error.command) console.error(`  run it yourself:  ${error.command}`)
    process.exit(1)
  }
}
