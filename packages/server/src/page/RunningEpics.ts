import { existsSync, readdirSync, readFileSync, watch, type FSWatcher } from "node:fs"
import { basename, join, relative, sep } from "node:path"

import type { SRV } from "$/server"

/****************
 * ### `RunningEpics`
 * The main checkout's page server showing every RUNNING epic's plan doc:  the ones still in their worktree
 * (`.claude/worktrees/<w>/packages/docs/epics/<name>/<name>.plan.html`, or an old `<name>.html`), not yet merged
 * into the main checkout.
 * - Why:  each worktree has its own page server (its own port), and the main one refuses `.claude/...` (a dot
 *   path), so the docs index couldn't show an epic until it merged.
 * - `/worktrees/<w>/...` serves worktree `<w>`'s files (`StaticHandler` mount, dot files still refused), so a plan
 *   doc's relative assets come from its own worktree.
 * - `/_server/epics`:  the list, as JSON (`RunningEpic[]`).
 * - The docs index (`packages/docs/index.html`):  its `<!-- running-epics -->` marker, first in the Epics card
 *   list, becomes the running epics' cards, rendered on each request:  running and merged epics in ONE list, each
 *   card's title after its state (`stateMark()`).  None running:  nothing.  Opened from disk:  the marker stays a
 *   comment.
 * - Live:  a plan doc's change reloads its page and the index (`watch()`).
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

  /** the docs index, whose marker becomes the list */
  readonly index: string

  /** the watcher `watch()` started, closed by `close()` */
  private watcher: FSWatcher | undefined

  constructor(root: string) {
    this.root = root
    this.worktrees = join(root, ".claude", "worktrees")
    this.index = join(root, "packages", "docs", "index.html")
  }

  /** every running epic, by worktree then name */
  list(): RunningEpic[] {
    const found: RunningEpic[] = []
    for (const worktree of folders(this.worktrees)) {
      const epics = join(this.worktrees, worktree, "packages", "docs", "epics")
      for (const name of folders(epics)) {
        const file = planFile(join(epics, name), name)
        if (!file) continue
        if (name !== worktree && existsSync(join(this.root, "packages", "docs", "epics", name))) continue
        found.push({
          name,
          worktree,
          url: `/worktrees/${worktree}/packages/docs/epics/${name}/${basename(file)}`,
          ...read(file)
        })
      }
    }
    return found
  }

  /**
   * Serve the worktrees, the JSON list, and the list in the docs index, on `web`.
   * - SIDE EFFECT:  adds a mount, a route and an html hook to `web`
   */
  route(web: SRV.WebServer): this {
    web.files.mount({ prefix: "/worktrees/", dir: this.worktrees })
    web.router.get("/_server/epics", (_request, reply) => reply.set("Cache-Control", "no-store").json(this.list()))
    web.files.html.push((page, served) => (served.file === this.index ? this.render(page) : page))
    return this
  }

  /**
   * Reload pages when a worktree's plan doc changes:  that doc's own page, and the docs index (its list).
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
   * `page` (the docs index) with the running epics' cards at its `<!-- running-epics -->` marker:  first in the
   * Epics list (`yarn docs:index` puts the marker there);  none running, or no marker:  as is.
   * - a merged epic's card of the same name (`data-epic`) goes:  the worktree's doc is the live one
   * - SAME card markup as `packages/docs/scripts/index.js` `epicCard()`:  change both
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
}

/** The marker in the docs index that becomes the "Running epics" section. */
export const MARKER = "<!-- running-epics -->"

/**
 * A plan doc's path inside `.claude/worktrees`:  `<w>/packages/docs/epics/<name>/<name>.plan.html`, or (a worktree
 * cut before 2026-10-04) `<name>.html`.
 */
const EPIC_FILE = /^[^/]+\/packages\/docs\/epics\/([^/]+)\/\1(?:\.plan)?\.html$/

/**
 * Epic `name`'s plan doc in folder `dir`:  `<name>.plan.html`, else an old `<name>.html` that is a plan doc
 * (`<body class="... plan-doc">`);  `undefined` when neither.
 * - why both:  plan docs were renamed on 2026-10-04 (`review-review` P4);  worktrees cut before keep the old name
 *   until they merge `main`.  `packages/docs/scripts/pages.js` `planDocIn()` is the same:  change both
 */
function planFile(dir: string, name: string): string | undefined {
  const file = join(dir, `${name}.plan.html`)
  if (existsSync(file)) return file
  const old = join(dir, `${name}.html`)
  if (!existsSync(old)) return undefined
  return /<body\b[^>]*\bclass="[^"]*\bplan-doc\b/.test(readFileSync(old, "utf8")) ? old : undefined
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
 * Title and phases of the plan doc at `file`, by pattern:  the server is a leaf, so no HTML parser or `plan-doc.js`.
 * - phases:  each `<ui-section ... data-phase="N" ... data-status="S" ... header="...">` tag (attributes in any
 *   order, across lines)
 */
function read(file: string): Pick<RunningEpic, "title" | "done" | "total" | "active" | "updated"> {
  const html = readFileSync(file, "utf8")
  // without the `Epic: ` plan docs' titles start with since 2026-10-04:  the card is in Epics already
  const title = (/<title>([^<]*)<\/title>/.exec(html)?.[1]?.trim() ?? "").replace(/^Epic:\s*/, "")
  const phases = [...html.matchAll(/<ui-section\b[^>]*\bdata-phase="\d+"[^>]*>/g)].map(([tag]) => ({
    status: /\bdata-status="(\w+)"/.exec(tag)?.[1] ?? "todo",
    header: /\bheader="([^"]*)"/.exec(tag)?.[1] ?? ""
  }))
  const active = phases.find((phase) => phase.status === "active")?.header
  const updated = /\bid="plan-updated"[^>]*>\s*(\d{4}-\d\d-\d\d)/.exec(html)?.[1]
  return {
    title: decode(title),
    done: phases.filter((phase) => phase.status === "done").length,
    total: phases.length,
    ...(active && { active: decode(active) }),
    ...(updated && { updated })
  }
}

/**
 * `epic`'s state:  `{ done, mark }`, `mark` the HTML before its card's title.
 * - planning:  no phases yet (a blue thought bubble)
 * - done:  every phase done (a green check)
 * - stalled:  phases left, no update for more than `STALLED_DAYS` (a yellow pause;  the date on hover)
 * - in progress:  `[3/6]`, phases done of all
 * - SAME as `packages/docs/scripts/index.js` `epicState()`:  change both
 */
function stateMark(epic: RunningEpic, now = Date.now()): { done: boolean; mark: string } {
  if (!epic.total) return { done: false, mark: stateIcon("comment dots", "blue", "planning") }
  if (epic.done === epic.total) return { done: true, mark: stateIcon("circle check", "green", "done") }
  const idle = epic.updated ? (now - new Date(`${epic.updated}T00:00`).getTime()) / 86_400_000 : 0
  if (idle > STALLED_DAYS) {
    return { done: false, mark: stateIcon("circle pause", "yellow", `stalled:  no update since ${epic.updated}`) }
  }
  const count = `${epic.done}/${epic.total}`
  return { done: false, mark: `<ui-label class="spell-epic-state" size="mini" basic>${count}</ui-label>` }
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
