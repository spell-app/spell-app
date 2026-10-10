import { existsSync, readdirSync, readFileSync, realpathSync, watch, type FSWatcher } from "node:fs"
import { homedir } from "node:os"
import { basename, join, relative, sep } from "node:path"

import type { SRV } from "$/server"
// Import directly:  the `$/server/site` barrel is browser code (the site header)
import { URGENT_STATES, epicStateFor, epicStateMark, type EpicFacts } from "$/server/site/EpicState"

/****************
 * ### `RunningEpics`
 * Lets the main checkout's page server show every RUNNING epic's plan doc:
 * the ones still in their worktree, not yet merged into the main checkout.
 * - where:  `.claude/worktrees/<w>/epics/<name>/<name>.plan.html`, or an old `<name>.html`
 *   - a worktree on older code keeps its plan docs in `packages/docs/content/epics/` (before 2026-10-05)
 *     or `packages/docs/epics/` (before 2026-10-04):  found there too (`EPICS_DIRS`)
 * - Why:  each worktree has its own page server (its own port),
 *   and the main one refuses `.claude/...` (a dot path), so the epics list couldn't show an epic until it merged.
 * - `/worktrees/<w>/...` serves worktree `<w>`'s files (`StaticHandler` mount, dot files still refused),
 *   so a plan doc's relative assets come from its own worktree.
 * - `/_server/epics`:  the list, as JSON (`RunningEpic[]`).
 * - The Epics list page (`epics/index.html`;  the docs home until claude-design P5):
 *   - its `<!-- running-epics -->` marker, first in the Epics card list, becomes the running epics' cards,
 *     rendered on each request
 *   - running and merged epics in ONE list, each card's title after its state's mark (`$/server/site/EpicState`)
 *   - EVERY card marked again as the page is served (`render()`):  a session running for it, and today's date,
 *     decide in progress or paused, which the docs index can't know when it writes the page
 *   - none running:  no cards added
 *   - opened from disk:  the marker stays a comment, the marks as the docs index wrote them
 * - Live:  a plan doc's change reloads its page and the list page (`watch()`).
 * - Which docs:  `<name>` === `<w>` (the epic the worktree is for), or any `<name>` the main checkout lacks.
 *   The rest are stale copies of epics merged before the worktree was cut.
 * - NOTE:  edit mode on a worktree's page isn't offered through here:  `PageEditor` refuses dot paths too.
 *   Its own worktree's server edits it.
 ****************/
export class RunningEpics {
  /** the main checkout */
  readonly root: string

  /** `<root>/.claude/worktrees` */
  readonly worktrees: string

  /** the Epics list page, `epics/index.html`, whose marker becomes the list (`spell dev docs index` writes it) */
  readonly index: string

  /**
   * Claude Code's own folder, whose `sessions/<pid>.json` say which sessions run (`runningNames()`):
   * `~/.claude`, or `SPELL_CLAUDE_HOME` (as the CLI's `claudeHome()`;  tests point it at a fixture)
   */
  readonly claudeHome: string

  /** the watcher `watch()` started, closed by `close()` */
  private watcher: FSWatcher | undefined

  constructor(
    root: string,
    { claudeHome = process.env.SPELL_CLAUDE_HOME || join(homedir(), ".claude") }: { claudeHome?: string } = {}
  ) {
    this.root = root
    this.worktrees = join(root, ".claude", "worktrees")
    this.index = join(root, "epics", "index.html")
    this.claudeHome = claudeHome
  }

  /**
   * every running epic, by worktree then name
   * - shared content (a worktree's epics folder IS the main checkout's, through a link into `../spell-app-dev`):
   *   the card links the main checkout's own URL, so edit mode and live reload work there
   */
  list(): RunningEpic[] {
    const found: RunningEpic[] = []
    const mainEpics = EPICS_DIRS.find((epics) => existsSync(join(this.root, epics)))
    const mainReal = mainEpics && realOrSelf(join(this.root, mainEpics))
    for (const worktree of folders(this.worktrees)) {
      const checkout = join(this.worktrees, worktree)
      const dir = EPICS_DIRS.find((epics) => existsSync(join(checkout, epics)))
      if (!dir) continue
      const shared = realOrSelf(join(checkout, dir)) === mainReal
      for (const name of folders(join(checkout, dir))) {
        const file = planFile(join(checkout, dir, name), name)
        if (!file) continue
        if (name !== worktree && EPICS_DIRS.some((epics) => existsSync(join(this.root, epics, name)))) continue
        found.push({
          name,
          worktree,
          url: shared
            ? `/${mainEpics}/${name}/${basename(file)}`
            : `/worktrees/${worktree}/${dir}/${name}/${basename(file)}`,
          ...read(file)
        })
      }
    }
    return found
  }

  /**
   * Serve the worktrees, the JSON list, and the list on the Epics page, on `web`.
   * - SIDE EFFECT:  adds a mount, a route and an html hook to `web`
   */
  route(web: SRV.WebServer): this {
    web.files.mount({ prefix: "/worktrees/", dir: this.worktrees })
    web.router.get("/_server/epics", (_request, reply) => reply.set("Cache-Control", "no-store").json(this.list()))
    web.files.html.push((page, served) => (served.file === this.index ? this.render(page) : page))
    return this
  }

  /**
   * Reload pages when a worktree's plan doc changes:  that doc's own page, and the Epics page (its list).
   * - SIDE EFFECT:  one recursive `fs.watch` on `.claude/worktrees`, if it exists;  `close()` ends it
   */
  watch(live: SRV.LiveReload): this {
    if (!existsSync(this.worktrees)) return this
    try {
      this.watcher = watch(this.worktrees, { recursive: true }, (_event, name) => {
        if (!name || !EPIC_FILE.test(name.split(sep).join("/"))) return
        live.changed(join(this.worktrees, name))
        live.changed(this.index)
      })
      this.watcher.on("error", () => {})
    } catch {
      // can't watch:  pages just don't reload by themselves
    }
    return this
  }

  /** stop watching */
  close(): void {
    this.watcher?.close()
    this.watcher = undefined
  }

  /**
   * `page` (the Epics list page) with every card marked as of now, and the running epics' cards at its
   * `<!-- running-epics -->` marker.
   * - no marker:  as is
   * - each card the docs index wrote (its `data-phases` ...):  its state's mark again, with a session running for it
   *   (`runningNames()`) and today's date;  a card without them (an older index) as is
   * - the marker is first in the Epics list (`spell dev docs index` puts it there);  none running:  it stays
   * - a merged epic's card of the same name (`data-epic`) goes:  the worktree's doc is the live one
   * - SAME card markup as `packages/docs/tools/index.js` `epicCard()`:  change both
   */
  render(page: string, now: Date = new Date()): string {
    if (!page.includes(MARKER)) return page
    const running = this.runningNames()
    const epics = this.list()
    let html = page.replace(CARD, (card: string, name: string) => remark(card, running.has(name), now))
    for (const epic of epics) {
      html = html.replace(
        // oxfmt splits a closing tag over lines (`</ui-card\n  >`)
        new RegExp(`<ui-card\\b[^>]*\\bdata-epic="${escapeRegExp(epic.name)}"[\\s\\S]*?</ui-card\\s*>`),
        ""
      )
    }
    if (!epics.length) return html
    const cards = epics.map((epic) => {
      const facts: EpicFacts = {
        ...epic,
        running: running.has(epic.name) || running.has(epic.worktree)
      }
      const state = epicStateFor(facts, now)
      const where = text(relative(this.root, join(this.worktrees, epic.worktree)))
      return (
        `<ui-card data-epic="${attr(epic.name)}" data-status="${state.name === "done" ? "done" : "open"}"><ui-content>` +
        `<ui-header>${epicStateMark(state)} <a href="${attr(epic.url)}" target="${attr(epic.name)}">` +
        `${text(epic.title)}</a></ui-header><ui-meta>${epic.active ? `${text(epic.active)} · ` : ""}${where}</ui-meta>` +
        `</ui-content></ui-card>`
      )
    })
    return html.replace(MARKER, cards.join(""))
  }

  /**
   * The names live Claude sessions run for:  for each session whose process is alive (`sessions/<pid>.json`),
   * the worktree it works in (its `cwd` under `.claude/worktrees/<w>`), and its title without its icon
   * (`🚧 airplane` -> `airplane`:  `/isolate` and `/epic` title a session for its epic).
   * - NEVER throws:  an unreadable record is skipped
   */
  runningNames(): Set<string> {
    const names = new Set<string>()
    const folder = join(this.claudeHome, "sessions")
    if (!existsSync(folder)) return names
    for (const file of readdirSync(folder)) {
      if (!file.endsWith(".json")) continue
      try {
        const record = JSON.parse(readFileSync(join(folder, file), "utf8")) as SessionRecord
        if (typeof record.pid !== "number" || !isAlive(record.pid)) continue
        if (record.cwd?.startsWith(this.worktrees + sep))
          names.add(record.cwd.slice(this.worktrees.length + 1).split(sep)[0]!)
        const title = record.name?.replace(/^[^\p{L}\p{N}]+/u, "").trim()
        if (title) names.add(title)
      } catch {
        // a record being written, or not JSON:  not a running session we can read
      }
    }
    return names
  }
}

/** The fields `RunningEpics.runningNames()` reads of a session's record, `~/.claude/sessions/<pid>.json`. */
type SessionRecord = { pid?: number; cwd?: string; name?: string }

/** An epic's card on the Epics page:  its whole markup, `$1` its name. */
const CARD = /<ui-card\b[^>]*\bdata-epic="([^"]*)"[\s\S]*?<\/ui-card\s*>/g

/** The state's mark in a card's header:  `<ui-icon class="spell-epic-state" ...>`, a label, or an old emoji `<span>`. */
const MARK = /<(ui-icon|ui-label|span)\b[^>]*\bclass="spell-epic-state"[^>]*>[\s\S]*?<\/\1\s*>/

/**
 * Epic card `card` (as the docs index wrote it) with its state's mark and `data-status` as of `now`;
 * as is without its facts (`data-phases`:  an index written before 2026-10-10).
 */
function remark(card: string, running: boolean, now: Date): string {
  const open = /^<ui-card\b[^>]*>/.exec(card)?.[0] ?? ""
  const data = (name: string) => new RegExp(`\\sdata-${name}(?:="([^"]*)")?(?=[\\s>])`).exec(open)
  const phases = data("phases")
  if (!phases) return card
  const state = epicStateFor(
    {
      phases: (phases[1] ?? "").split(" ").filter(Boolean),
      updated: data("updated")?.[1],
      urgent: (data("urgent")?.[1] ?? "").split(" ").filter(Boolean),
      future: !!data("future"),
      // the meta line:  `P2 · Site Map · epics/seo/seo.plan.html`
      // (oxfmt may break it over lines)
      active: decode(/<ui-meta>([^<]*) · /.exec(card)?.[1]?.replace(/\s+/g, " ").trim() ?? "") || undefined,
      running
    },
    now
  )
  const status = state.name === "done" ? "done" : "open"
  return card
    .replace(open, open.replace(/\sdata-status="[^"]*"/, ` data-status="${status}"`))
    .replace(MARK, epicStateMark(state))
}

/** Whether process `pid` is alive:  signal 0 checks without sending anything;  `EPERM`:  alive, not ours. */
function isAlive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "EPERM"
  }
}

/**
 * One running epic.
 * - `name`:  the epic;  `worktree`:  the worktree it's in;  `url`:  its plan doc on the main page server
 * - `title`:  the doc's `<title>`
 * - `phases`:  each phase's status, in order;  `done` / `total`:  how many phases are done, of all
 * - `active`:  the active phase's header (`P2 · Name`), if any
 * - `updated`:  the doc's "updated" date (`YYYY-MM-DD`), if any:  with phases left, no session running and no update
 *   for a few days, it's paused (`$/server/site/EpicState`)
 * - `future`:  written down with `/epic future`, not planned yet
 * - `urgent`:  the ids of the items that need Owen (red and orange chips:  `URGENT_STATES`):
 *   every phase done with some left, it has errors
 */
export type RunningEpic = {
  name: string
  worktree: string
  url: string
  title: string
  phases: string[]
  done: number
  total: number
  active?: string
  updated?: string
  future?: boolean
  urgent?: string[]
}

/** The marker on the Epics list page that becomes the running epics' cards. */
export const MARKER = "<!-- running-epics -->"

/**
 * Where a checkout keeps its plan docs, relative to its root, newest layout first.
 * - `epics`:  since 2026-10-05 (epic `claude-design`, P4)
 * - `packages/docs/content/epics`:  since 2026-10-04 (epic `shared-content`, P2)
 *   - a link into the shared repo's old-path links, so the same folder as `epics`
 * - `packages/docs/epics`:  a worktree cut before that, until it merges `main`
 */
const EPICS_DIRS = ["epics", "packages/docs/content/epics", "packages/docs/epics"]

/**
 * A plan doc's path inside `.claude/worktrees`:  `<w>/epics/<name>/<name>.plan.html`.
 * - a worktree on older code:  the same under `packages/docs/content/` or `packages/docs/`,
 *   or with the old name `<name>.html`
 */
const EPIC_FILE = /^[^/]+\/(?:packages\/docs\/(?:content\/)?)?epics\/([^/]+)\/\1(?:\.plan)?\.html$/

/**
 * Epic `name`'s plan doc in folder `dir`;  `undefined` when neither:
 * - `<name>.plan.html`
 * - else an old `<name>.html` that is a plan doc (`<body class="... plan-doc">`)
 * - why both:  plan docs were renamed on 2026-10-04 (`review-review` P4);
 *   worktrees cut before keep the old name until they merge `main`
 * - SAME as `packages/docs/tools/pages.js` `planDocIn()`:  change both
 */
function planFile(dir: string, name: string): string | undefined {
  const file = join(dir, `${name}.plan.html`)
  if (existsSync(file)) return file
  const old = join(dir, `${name}.html`)
  if (!existsSync(old)) return undefined
  return /<body\b[^>]*\bclass="[^"]*\bplan-doc\b/.test(readFileSync(old, "utf8")) ? old : undefined
}

/** `path` with every link resolved, or `path` itself when it doesn't exist. */
function realOrSelf(path: string): string {
  try {
    return realpathSync(path)
  } catch {
    return path
  }
}

/** The sub-folders of `dir`, sorted;  none if it's missing. */
function folders(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort()
}

/**
 * Title, phases and urgent items of the plan doc at `file`, by pattern:  the server is a leaf, so no HTML parser or
 * plan-doc tool.
 * - attributes in any order, across lines:  each `<epic-phase id="pN" title="..." status="S">` (the label
 *   `PN · <title>`), `<epic-page updated future>`, each `<epic-item id="q3" state="attention">`
 * - a doc still in the old markup (no `<epic-page>`:  one restored from an old backup) reads as an empty plan:  the
 *   plan-doc tool refuses it until it's converted (epic `epic-components` P15)
 * - urgent items as `$/server/site/EpicState` `URGENT_SELECTOR` finds them (the docs index, `<epic-page>`)
 */
function read(
  file: string
): Pick<RunningEpic, "title" | "phases" | "done" | "total" | "active" | "updated" | "future" | "urgent"> {
  const html = readFileSync(file, "utf8")
  // drop the `Epic: ` plan docs' titles start with (since 2026-10-04):  the card is in the Epics list already
  const title = (/<title>([^<]*)<\/title>/.exec(html)?.[1]?.trim() ?? "").replace(/^Epic:\s*/, "")
  const attribute = (tag: string, name: string) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1]
  const page = /<epic-page\b[^>]*>/.exec(html)?.[0] ?? ""
  const tags = (pattern: RegExp) => (page ? [...html.matchAll(pattern)].map(([tag]) => tag) : [])
  const phases = tags(/<epic-phase\b[^>]*>/g).map((tag) => ({
    status: attribute(tag, "status") ?? "todo",
    header: `${(attribute(tag, "id") ?? "").toUpperCase()} · ${attribute(tag, "title") ?? ""}`
  }))
  const active = phases.find((phase) => phase.status === "active")?.header
  const updated = /^\d{4}-\d\d-\d\d$/.exec(attribute(page, "updated") ?? "")?.[0]
  const future = /\sfuture(?=[\s=>])/.test(page)
  const urgent = tags(/<epic-item\b[^>]*>/g)
    .filter((tag) => (URGENT_STATES as readonly string[]).includes(attribute(tag, "state") ?? ""))
    .map((tag) => attribute(tag, "id") ?? "")
    .filter(Boolean)
  return {
    title: decode(title),
    phases: phases.map((phase) => phase.status),
    done: phases.filter((phase) => phase.status === "done").length,
    total: phases.length,
    ...(active && { active: decode(active) }),
    ...(updated && { updated }),
    ...(future && { future }),
    ...(urgent.length > 0 && { urgent })
  }
}

/** `value` with RegExp syntax escaped. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** `value` as HTML text. */
function text(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/** `value` as a double-quoted attribute. */
function attr(value: string): string {
  return text(value).replace(/"/g, "&quot;")
}

/** The few entities a plan doc's `<title>` and headers hold, back to text. */
function decode(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
}
