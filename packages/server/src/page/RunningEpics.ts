import { existsSync, readdirSync, readFileSync, realpathSync, watch, type FSWatcher } from "node:fs"
import { basename, join, relative, sep } from "node:path"

import type { SRV } from "$/server"

/****************
 * ### `RunningEpics`
 * The main checkout's page server showing every RUNNING epic's plan doc:  the ones still in their worktree
 * (`.claude/worktrees/<w>/epics/<name>/<name>.plan.html`, or an old `<name>.html`), not yet merged into the main
 * checkout.
 * - a worktree on older code keeps its plan docs in `packages/docs/content/epics/` (before 2026-10-05) or
 *   `packages/docs/epics/` (before 2026-10-04):  found there too (`EPICS_DIRS`)
 * - Why:  each worktree has its own page server (its own port), and the main one refuses `.claude/...` (a dot
 *   path), so the epics list couldn't show an epic until it merged.
 * - `/worktrees/<w>/...` serves worktree `<w>`'s files (`StaticHandler` mount, dot files still refused), so a plan
 *   doc's relative assets come from its own worktree.
 * - `/_server/epics`:  the list, as JSON (`RunningEpic[]`).
 * - The Epics list page (`epics/index.html`;  the docs home until claude-design P5):  its `<!-- running-epics -->`
 *   marker, first in the Epics card list, becomes the running epics' cards, rendered on each request:  running and
 *   merged epics in ONE list, each card's title after its state (`stateMark()`).  None running:  nothing.  Opened
 *   from disk:  the marker stays a comment.
 * - Live:  a plan doc's change reloads its page and the list page (`watch()`).
 * - Which docs:  `<name>` === `<w>` (the epic the worktree is for), or any `<name>` the main checkout lacks.  The
 *   rest are stale copies of epics merged before the worktree was cut.
 * - NOTE:  edit mode on a worktree's page isn't offered through here:  `PageEditor` refuses dot paths too.  Its
 *   own worktree's server edits it.
 ****************/
export class RunningEpics {
  /** the main checkout */
  readonly root: string

  /** `<root>/.claude/worktrees` */
  readonly worktrees: string

  /** the Epics list page, `epics/index.html`, whose marker becomes the list (`spell dev docs index` writes it) */
  readonly index: string

  /** the watcher `watch()` started, closed by `close()` */
  private watcher: FSWatcher | undefined

  constructor(root: string) {
    this.root = root
    this.worktrees = join(root, ".claude", "worktrees")
    this.index = join(root, "epics", "index.html")
  }

  /**
   * every running epic, by worktree then name
   * - shared content (a worktree's epics folder IS the main checkout's, through a link into `../spell-app-dev`):  the
   *   card links the main checkout's own URL, so edit mode and live reload work there
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
   * `page` (the Epics list page) with the running epics' cards at its `<!-- running-epics -->` marker:  first in the
   * Epics list (`spell dev docs index` puts the marker there);  none running, or no marker:  as is.
   * - a merged epic's card of the same name (`data-epic`) goes:  the worktree's doc is the live one
   * - SAME card markup as `packages/docs/tools/index.js` `epicCard()`:  change both
   */
  render(page: string): string {
    const epics = this.list()
    if (!epics.length || !page.includes(MARKER)) return page
    let html = page
    for (const epic of epics) {
      html = html.replace(
        // oxfmt splits a closing tag over lines (`</ui-card\n  >`)
        new RegExp(`<ui-card\\b[^>]*\\bdata-epic="${escapeRegExp(epic.name)}"[\\s\\S]*?</ui-card\\s*>`),
        ""
      )
    }
    const cards = epics.map((epic) => {
      const { done, mark } = stateMark(epic)
      const where = text(relative(this.root, join(this.worktrees, epic.worktree)))
      return (
        `<ui-card data-epic="${attr(epic.name)}" data-status="${done ? "done" : "open"}"><ui-content>` +
        `<ui-header>${mark} <a href="${attr(epic.url)}" target="${attr(epic.name)}">${text(epic.title)}</a>` +
        `</ui-header><ui-meta>${epic.active ? `${text(epic.active)} · ` : ""}${where}</ui-meta>` +
        `</ui-content></ui-card>`
      )
    })
    return html.replace(MARKER, cards.join(""))
  }
}

/**
 * One running epic.
 * - `name`:  the epic;  `worktree`:  the worktree it's in;  `url`:  its plan doc on the main page server
 * - `title`:  the doc's `<title>`
 * - `done` / `total`:  phases;  `active`:  the active phase's header (`P2 · Name`), if any
 * - `updated`:  the doc's "updated" date (`YYYY-MM-DD`), if any:  an epic with phases left and no update for a
 *   few days shows as stalled
 * - `future`:  written down with `/epic future`, not planned yet;  `followUps`:  what it still asks of Owen, one kind
 *   name per open question, judgement call, issue, todo and test (`FOLLOW_UPS`):  with no phase under way, it sleeps
 */
export type RunningEpic = {
  name: string
  worktree: string
  url: string
  title: string
  done: number
  total: number
  active?: string
  updated?: string
  future?: boolean
  followUps?: string[]
}

/** The marker on the Epics list page that becomes the running epics' cards. */
export const MARKER = "<!-- running-epics -->"

/**
 * Where a checkout keeps its plan docs, relative to its root, newest layout first.
 * - `epics`:  since 2026-10-05 (epic `claude-design`, P4)
 * - `packages/docs/content/epics`:  since 2026-10-04 (epic `shared-content`, P2);  a link into the shared repo's
 *   old-path links, so the same folder as `epics`
 * - `packages/docs/epics`:  a worktree cut before that, until it merges `main`
 */
const EPICS_DIRS = ["epics", "packages/docs/content/epics", "packages/docs/epics"]

/**
 * A plan doc's path inside `.claude/worktrees`:  `<w>/epics/<name>/<name>.plan.html`, or (a worktree on older code)
 * the same under `packages/docs/content/` or `packages/docs/`, or with the old name `<name>.html`.
 */
const EPIC_FILE = /^[^/]+\/(?:packages\/docs\/(?:content\/)?)?epics\/([^/]+)\/\1(?:\.plan)?\.html$/

/**
 * Epic `name`'s plan doc in folder `dir`:  `<name>.plan.html`, else an old `<name>.html` that is a plan doc
 * (`<body class="... plan-doc">`);  `undefined` when neither.
 * - why both:  plan docs were renamed on 2026-10-04 (`review-review` P4);  worktrees cut before keep the old name
 *   until they merge `main`.  `packages/docs/tools/pages.js` `planDocIn()` is the same:  change both
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
 * Title, phases and follow-ups of the plan doc at `file`, by pattern:  the server is a leaf, so no HTML parser or
 * plan-doc tool.
 * - either markup (attributes in any order, across lines):
 *   - `<epic-*>`:  each `<epic-phase id="pN" title="..." status="S">` (the label `PN · <title>`), `<epic-page
 *     updated future>`, each `<epic-item id="q3" status="open">`
 *   - the old:  each `<ui-section ... data-phase="N" ... data-status="S" ... header="...">`, `#plan-updated`,
 *     `<body data-future>`, each item `id="q3" data-status="open"`.  REFACTOR: drop old markup after the switch (P12)
 * - follow-ups as `packages/docs/tools/index.js` `followUpsIn()` and `packages/cli/src/dev/worktrees.ts`
 *   `planFollowUps()` find them:  change all three
 */
function read(
  file: string
): Pick<RunningEpic, "title" | "done" | "total" | "active" | "updated" | "future" | "followUps"> {
  const html = readFileSync(file, "utf8")
  // without the `Epic: ` plan docs' titles start with since 2026-10-04:  the card is in Epics already
  const title = (/<title>([^<]*)<\/title>/.exec(html)?.[1]?.trim() ?? "").replace(/^Epic:\s*/, "")
  const attribute = (tag: string, name: string) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1]
  const page = /<epic-page\b[^>]*>/.exec(html)?.[0]
  const phases = page
    ? [...html.matchAll(/<epic-phase\b[^>]*>/g)].map(([tag]) => ({
        status: attribute(tag, "status") ?? "todo",
        header: `${(attribute(tag, "id") ?? "").toUpperCase()} · ${attribute(tag, "title") ?? ""}`
      }))
    : [...html.matchAll(/<ui-section\b[^>]*\bdata-phase="\d+"[^>]*>/g)].map(([tag]) => ({
        status: attribute(tag, "data-status") ?? "todo",
        header: attribute(tag, "header") ?? ""
      }))
  const active = phases.find((phase) => phase.status === "active")?.header
  const updated = page
    ? /^\d{4}-\d\d-\d\d$/.exec(attribute(page, "updated") ?? "")?.[0]
    : /\bid="plan-updated"[^>]*>\s*(\d{4}-\d\d-\d\d)/.exec(html)?.[1]
  const future = page ? /\sfuture(?=[\s=>])/.test(page) : /<body\b[^>]*\sdata-future\b/.test(html)
  const status = page ? "status" : "data-status"
  const followUps = [...html.matchAll(page ? /<epic-item\b[^>]*>/g : /<[a-z][\w-]*\b[^>]*\sid="[qjitv]\d+"[^>]*>/g)]
    .map(([tag]) => tag)
    .filter((tag) => attribute(tag, status) === "open")
    .map((tag) => FOLLOW_UPS[attribute(tag, "id")?.match(/^([qjitv])\d+$/)?.[1] ?? ""])
    .filter((kind): kind is string => Boolean(kind))
  return {
    title: decode(title),
    done: phases.filter((phase) => phase.status === "done").length,
    total: phases.length,
    ...(active && { active: decode(active) }),
    ...(updated && { updated }),
    ...(future && { future }),
    ...(followUps.length > 0 && { followUps })
  }
}

/** An open item's kind, by its id's letter:  what an epic still asks of Owen (`index.js` has the same). */
const FOLLOW_UPS: Record<string, string> = { q: "question", j: "judgement call", i: "issue", t: "todo", v: "test" }

/**
 * `epic`'s state:  `{ done, mark }`, `mark` the HTML before its card's title.  Its colours are the colour scheme's
 * (Q20 of epic `epic-components`;  `templates/epics/plan-doc.md`, "Colours").
 * - future:  written down with `/epic future`, not planned yet (a grey seedling:  not started)
 * - sleeping:  open follow-ups (`followUps`) and no phase under way:  😴, what's open on hover
 * - planning:  no phases yet (a yellow thought bubble:  open, still undecided)
 * - done:  every phase done (a green check)
 * - stalled:  phases left, no update for more than `STALLED_DAYS` (an orange pause, a warning;  the date on hover)
 * - in progress:  `[3/6]`, phases done of all, outlined in blue (under way)
 * - SAME as `packages/docs/tools/index.js` `epicState()`:  change both
 */
function stateMark(epic: RunningEpic, now = Date.now()): { done: boolean; mark: string } {
  if (epic.future && !epic.total)
    return { done: false, mark: stateIcon("seedling", "grey", "future:  not planned yet") }
  if (epic.total && epic.followUps?.length && !epic.active) {
    const tip = `sleeping:  ${followUpWords(epic.followUps)} to follow up`
    return { done: false, mark: `<span class="spell-epic-state" title="${attr(tip)}">😴</span>` }
  }
  if (!epic.total) return { done: false, mark: stateIcon("comment dots", "yellow", "planning") }
  if (epic.done === epic.total) return { done: true, mark: stateIcon("circle check", "green", "done") }
  const idle = epic.updated ? (now - new Date(`${epic.updated}T00:00`).getTime()) / 86_400_000 : 0
  if (idle > STALLED_DAYS) {
    return { done: false, mark: stateIcon("circle pause", "orange", `stalled:  no update since ${epic.updated}`) }
  }
  const count = `${epic.done}/${epic.total}`
  return { done: false, mark: `<ui-label class="spell-epic-state" size="mini" color="blue" basic>${count}</ui-label>` }
}

/** `kinds` (`RunningEpic.followUps`) as words:  `2 issues, 1 test` (`index.js` has the same). */
function followUpWords(kinds: string[]): string {
  const counts = new Map<string, number>()
  for (const kind of kinds) counts.set(kind, (counts.get(kind) ?? 0) + 1)
  return [...counts].map(([kind, n]) => `${n} ${kind}${n === 1 ? "" : "s"}`).join(", ")
}

/** An epic state's icon:  `name` (in the docs bundle's `ICONS`), `color`, `title` on hover. */
function stateIcon(name: string, color: string, title: string): string {
  return `<ui-icon class="spell-epic-state" name="${name}" color="${color}" title="${attr(title)}"></ui-icon>`
}

/** `value` with RegExp syntax escaped. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Days without an update after which an epic with phases left shows as stalled (`index.js` has the same). */
const STALLED_DAYS = 3

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
