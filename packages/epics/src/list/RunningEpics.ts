import { existsSync, readdirSync, readFileSync, realpathSync, watch, type FSWatcher } from "node:fs"
import { homedir } from "node:os"
import { basename, dirname, join, relative, sep } from "node:path"

import { EpicConfig } from "$/epics/config/EpicConfig"
import { DataFile } from "$/epics/data/DataFile"
import type { SRV } from "$/server"

import { planDocIn } from "../../tools/pages.js"
import {
  EPIC_CARDS_END,
  EPIC_CARDS_START,
  FAVORITES_FILE,
  epicCardHtml,
  epicGroupsHtml,
  epicStarHtml,
  eventTimesIn,
  lastWorked,
  favoritesIn,
  type EpicGroupName,
  type PlacedCard,
  type SagaLook
} from "./EpicCards"
import { URGENT_STATES, epicStateFor, epicStateMark } from "./EpicState"

/****************
 * ### `RunningEpics`
 * Lets the main checkout's page server show every RUNNING epic's page:
 * the ones still in their worktree, not yet merged into the main checkout.
 * - where:  `.claude/worktrees/<w>/epics/<name>/<name>.plan.html`, or an old `<name>.html`
 *   - a worktree on older code keeps its epic pages in `packages/docs/content/epics/` (before 2026-10-05)
 *     or `packages/docs/epics/` (before 2026-10-04):  found there too (`EPICS_DIRS`)
 * - Why:  each worktree has its own page server (its own port),
 *   and the main one refuses `.claude/...` (a dot path), so the epics list couldn't show an epic until it merged.
 * - The page server serves worktree `<w>`'s files at `/worktrees/<w>/...` (dot files still refused),
 *   so an epic page's relative assets come from its own worktree.
 * - On the page server through epics' route module (`runningRoutes.ts`):
 *   - `/api/epics/running`:  the list, as JSON (`list()`:  `RunningEpic[]`)
 *   - the Epics list page, as below (`render()`), and live reload (`watch()`)
 * - The Epics list page (`epics/index.html`;  the home page until claude-design P5), on each request (`render()`):
 *   - running and merged epics in ONE list, in the page's five groups (`EpicCards`):
 *     Favorites, Active, Planning, Urgent, Done
 *   - each card's title after its state's mark (`EpicState`)
 *   - the running epics' cards join the written ones between its markers (`EPIC_CARDS_START` / `_END`)
 *   - EVERY card marked again, as `docs index` can't know when it writes the page:
 *     - in progress or paused:  decided by a session running for it, and today's date
 *     - its star:  from the favourites as they are now (`FAVORITES_FILE`), and the groups rebuilt by them
 *   - opened from disk:  the groups, marks and stars as `docs index` wrote them
 * - Live:  an epic page's change reloads its page and the list page (`watch()`).
 * - Which docs:  `<name>` === `<w>` (the epic the worktree is for), or any `<name>` the main checkout lacks.
 *   The rest are stale copies of epics merged before the worktree was cut.
 * - NOTE:  edit mode on a worktree's page isn't offered through here:  `PageEditor` refuses dot paths too.
 *   Its own worktree's server edits it.
 ****************/
export class RunningEpics {
  /** the main checkout */
  readonly root: string

  /** the folder holding the worktrees, `<root>/.claude/worktrees` (`worktreesFolder` in `.epic/config.json5`) */
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
    this.worktrees = new EpicConfig(root).worktreesFolder
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
        const file = planDocIn(join(checkout, dir, name), name)
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
   * Reload pages when a worktree's epic page changes:  that doc's own page, and the Epics page (its list).
   * - and a worktree's page assets (`ASSET_FILE`:  its docs runtime and bundle, its packs), so its pages served here
   *   (`/worktrees/<w>/...`) hot-reload when that worktree rebuilds them (the live client's `liveAction()`)
   * - SIDE EFFECT:  one recursive `fs.watch` on `.claude/worktrees`, if it exists;  `close()` ends it
   */
  watch(live: SRV.LiveReload): this {
    if (!existsSync(this.worktrees)) return this
    try {
      this.watcher = watch(this.worktrees, { recursive: true }, (_event, name) => {
        const path = name?.split(sep).join("/")
        if (!name || !path) return
        if (ASSET_FILE.test(path)) return live.changed(join(this.worktrees, name))
        if (!EPIC_FILE.test(path)) return
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
   * `page` (the Epics list page) as of now:
   * every card marked again, the running epics' cards added, and the cards grouped by the favourites as they are now.
   * - no `MARKER`:  as is
   * - each card `docs index` wrote (its `data-phases` ...):  its state's mark again, and its star (`favorites()`)
   *   - the mark from a session running for it (`runningNames()`) and today's date
   *   - a card without them (an older index):  as is
   * - a merged epic's card of the same name (`data-epic`) goes:  the worktree's doc is the live one
   *   - its last-worked moment (`data-worked`:  it may hold the branch's last commit) carries over to the running card
   *   - and so does its saga (`data-saga`, its title and purpose:  the page server can't read the sagas' list)
   * - between the markers (`EPIC_CARDS_START` / `_END`, `docs index` writes them):
   *   every card regrouped (`epicGroupsHtml()`)
   *   - a starred one under Favorites, else in its own group (`data-group`)
   * - an index without the end marker (written before the groups):  the running cards at the marker, as before
   * - the cards' markup:  `EpicCards` `epicCardHtml()`, as `docs index` draws them
   */
  render(page: string, now: Date = new Date()): string {
    if (!page.includes(MARKER)) return page
    const running = this.runningNames()
    const favorites = this.favorites()
    const epics = this.list()
    let html = page.replace(CARD, (card: string, name: string) =>
      remark(card, { running: running.has(name), favorite: favorites.has(name), now })
    )
    const workedBefore = new Map<string, string>()
    const sagaBefore = new Map<string, SagaLook>()
    for (const epic of epics) {
      // oxfmt splits a closing tag over lines (`</ui-card\n  >`)
      const merged = new RegExp(`<ui-card\\b[^>]*\\bdata-epic="${escapeRegExp(epic.name)}"[\\s\\S]*?</ui-card\\s*>`)
      html = html.replace(merged, (card) => {
        const worked = dataOf(card, "worked")
        if (worked) workedBefore.set(epic.name, worked)
        const saga = sagaOf(card)
        if (saga) sagaBefore.set(epic.name, saga)
        return ""
      })
    }
    const added = epics.map((epic) =>
      this.runningCard(epic, { running, favorites, now, worked: workedBefore, sagas: sagaBefore })
    )
    const from = html.indexOf(EPIC_CARDS_START)
    const to = html.indexOf(EPIC_CARDS_END, from)
    if (to < 0) return epics.length ? html.replace(MARKER, added.map((card) => card.html).join("")) : html
    const region = html.slice(from + EPIC_CARDS_START.length, to)
    const cards: PlacedCard[] = Array.from(region.matchAll(CARD), ([card, name]) => ({
      html: card,
      title: decode(dataOf(card, "title") ?? name!),
      group: favorites.has(name!) ? "favorites" : ((dataOf(card, "group") as EpicGroupName | undefined) ?? "active")
    }))
    return `${html.slice(0, from)}${EPIC_CARDS_START}\n${epicGroupsHtml([...cards, ...added])}\n${html.slice(to)}`
  }

  /**
   * Running epic `epic`'s card (`epicCardHtml()`), linking its epic page where it runs, its worktree in the meta line.
   * - `running`:  the names sessions run for
   * - `favorites`:  the starred epics
   * - `worked`:  the merged cards' `data-worked`, by name (`render()`)
   * - `sagas`:  the merged cards' sagas, by name;  used while the running doc still names that saga
   */
  private runningCard(
    epic: RunningEpic,
    context: {
      running: Set<string>
      favorites: Set<string>
      now: Date
      worked: Map<string, string>
      sagas: Map<string, SagaLook>
    }
  ): PlacedCard {
    const { running, favorites, now, worked, sagas } = context
    const saga = sagas.get(epic.name)
    const where = relative(this.root, join(this.worktrees, epic.worktree))
    return epicCardHtml(
      {
        name: epic.name,
        title: epic.title,
        href: epic.url,
        target: epic.name,
        meta: `${epic.active ? `${epic.active} · ` : ""}${where}`,
        facts: { ...epic, running: running.has(epic.name) || running.has(epic.worktree) },
        worked: lastWorked([epic.worked, worked.get(epic.name)]),
        favorite: favorites.has(epic.name),
        saga: saga && saga.id === epic.saga ? saga : undefined
      },
      now
    )
  }

  /** The starred epics' names (`FAVORITES_FILE`, shared:  the page server's `/api/epics/favorite` writes it). */
  favorites(): Set<string> {
    try {
      return favoritesIn(DataFile.read(join(this.root, FAVORITES_FILE)))
    } catch {
      // a file that won't read:  none starred, rather than no list page
      return new Set()
    }
  }

  /**
   * The names live Claude sessions run for.
   * - for each session whose process is alive (`sessions/<pid>.json`):
   *   - the worktree it works in (its `cwd` under `.claude/worktrees/<w>`)
   *   - its title without its icon (`🚧 airplane` -> `airplane`:  `/isolate` and `/epic` title a session for its epic)
   * - NEVER throws:  an unreadable record is skipped
   */
  runningNames(): Set<string> {
    const names = new Set<string>()
    for (const session of this.liveSessions()) {
      if (session.cwd.startsWith(this.worktrees + sep))
        names.add(session.cwd.slice(this.worktrees.length + 1).split(sep)[0]!)
      const title = bareTitle(session.title)
      if (title) names.add(title)
    }
    return names
  }

  /**
   * Every live Claude session (`sessions/<pid>.json`, its process alive):  its pid, id, title, status and folder.
   * - NEVER throws:  an unreadable record is skipped
   */
  liveSessions(): LiveSession[] {
    const sessions: LiveSession[] = []
    const folder = join(this.claudeHome, "sessions")
    if (!existsSync(folder)) return sessions
    for (const file of readdirSync(folder)) {
      if (!file.endsWith(".json")) continue
      try {
        const record = JSON.parse(readFileSync(join(folder, file), "utf8")) as SessionRecord
        if (typeof record.pid !== "number" || !isAlive(record.pid)) continue
        sessions.push({
          pid: record.pid,
          sessionId: record.sessionId ?? "",
          title: record.name ?? "",
          status: record.status ?? "",
          cwd: record.cwd ?? ""
        })
      } catch {
        // a record being written, or not JSON:  not a running session we can read
      }
    }
    return sessions
  }
}

/** A live Claude session, as `RunningEpics.liveSessions()` reads its record. */
export type LiveSession = {
  pid: number
  /** Claude Code's session id (a uuid) */
  sessionId: string
  /** its title, icon and all (`🚧 airplane`);  `""` when untitled */
  title: string
  /** `idle`, `busy` ...;  `""` when the record has none */
  status: string
  cwd: string
}

/** `title` without its leading icon:  `🚧 airplane` -> `airplane`. */
export function bareTitle(title: string): string {
  return title.replace(/^[^\p{L}\p{N}]+/u, "").trim()
}

/**
 * The sessions titled for epic `epic` (epic `airplane` P12), by `titleNames()`.
 */
export function sessionsTitledFor(epic: string, sessions: LiveSession[]): LiveSession[] {
  return sessions.filter((session) => titleNames(session.title, epic))
}

/**
 * Whether session title `title` names epic `epic`:  its title without its icon IS the name (`🚧 airplane`),
 * or holds it as a whole word (`airplane review`;  never `airplane-mode`).
 */
export function titleNames(title: string, epic: string): boolean {
  const bare = bareTitle(title).toLowerCase()
  const name = epic.toLowerCase()
  if (!name || !bare) return false
  if (bare === name) return true
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`(^|[^a-z0-9_-])${escaped}($|[^a-z0-9_-])`, "u").test(bare)
}

/** The fields `RunningEpics.liveSessions()` reads of a session's record, `~/.claude/sessions/<pid>.json`. */
type SessionRecord = { pid?: number; sessionId?: string; cwd?: string; name?: string; status?: string }

/** An epic's card on the Epics page:  its whole markup, `$1` its name. */
const CARD = /<ui-card\b[^>]*\bdata-epic="([^"]*)"[\s\S]*?<\/ui-card\s*>/g

/** The state's mark in a card's header:  `<ui-icon class="spell-epic-state" ...>`, a label, or an old emoji `<span>`. */
const MARK = /<(ui-icon|ui-label|span)\b[^>]*\bclass="spell-epic-state"[^>]*>[\s\S]*?<\/\1\s*>/

/** A card's star (`epicStarHtml()`), its closing tag maybe split over lines by oxfmt. */
const STAR = /<button\b[^>]*\bclass="spell-epic-star"[\s\S]*?<\/button\s*>/

/** The saga epic card `card` names (`data-saga`, `data-saga-title`, `data-saga-purpose`);  `undefined` for none. */
function sagaOf(card: string): SagaLook | undefined {
  const id = dataOf(card, "saga")
  if (!id) return undefined
  return { id, title: decode(dataOf(card, "saga-title") ?? id), purpose: decode(dataOf(card, "saga-purpose") ?? "") }
}

/** Attribute `data-<name>` of epic card `card`'s opening tag:  its value, `""` when bare;  `undefined` without it. */
function dataOf(card: string, name: string): string | undefined {
  const open = /^<ui-card\b[^>]*>/.exec(card)?.[0] ?? ""
  const match = new RegExp(`\\sdata-${name}(?:="([^"]*)")?(?=[\\s>])`).exec(open)
  return match ? (match[1] ?? "") : undefined
}

/**
 * Epic card `card` (as `docs index` wrote it) with its state's mark and `data-status` as of `now`,
 * a session `running` for it or not, and its star as `favorite` says.
 * - As is without its facts (`data-phases`:  an index written before 2026-10-10).
 */
function remark(card: string, { running, favorite, now }: { running: boolean; favorite: boolean; now: Date }): string {
  const phases = dataOf(card, "phases")
  if (phases === undefined) return card
  const open = /^<ui-card\b[^>]*>/.exec(card)?.[0] ?? ""
  const state = epicStateFor(
    {
      phases: phases.split(" ").filter(Boolean),
      updated: dataOf(card, "updated"),
      urgent: (dataOf(card, "urgent") ?? "").split(" ").filter(Boolean),
      future: dataOf(card, "future") !== undefined,
      standing: dataOf(card, "standing") !== undefined,
      // the meta line, which oxfmt may break over lines:  `P2 · Site Map · epics/seo/seo.plan.html`
      active: decode(/<ui-meta>([^<]*) · /.exec(card)?.[1]?.replace(/\s+/g, " ").trim() ?? "") || undefined,
      running
    },
    now
  )
  const status = state.name === "done" ? "done" : "open"
  const name = dataOf(card, "epic") ?? ""
  return card
    .replace(open, open.replace(/\sdata-status="[^"]*"/, ` data-status="${status}"`))
    .replace(MARK, epicStateMark(state))
    .replace(STAR, epicStarHtml(decode(name), favorite))
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
 * - `name`:  the epic
 * - `worktree`:  the worktree it's in
 * - `url`:  its epic page on the main page server
 * - `title`:  the doc's `<title>`
 * - `phases`:  each phase's status, in order
 * - `done` / `total`:  how many phases are done, of all
 * - `active`:  the active phase's header (`P2 · Name`), if any
 * - `updated`:  the doc's "updated" date (`YYYY-MM-DD`), if any
 *   - with phases left, no session running and no update for a few days, it's paused (`EpicState`)
 * - `future`:  written down with `/epic future`, not planned yet
 * - `standing`:  open for good, every phase merging on its own (epic `epic-workflow`)
 * - `saga`:  the saga its page names, its id (`<epic-page saga>`, epic `epic-workflow` P15)
 * - `urgent`:  the ids of the items that need Owen (red and orange chips:  `URGENT_STATES`):
 *   every phase done with some left, it has errors
 * - `worked`:  when it was last worked on, as the doc says:  the latest of its `updated` day and its log lines' times
 *   (`EpicCards` `lastWorked()`;  `docs index` adds the branch's last commit)
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
  standing?: boolean
  saga?: string
  urgent?: string[]
  worked?: string
}

/** The marker on the Epics list page where the running epics' cards go:  `EPIC_CARDS_START`. */
export const MARKER = EPIC_CARDS_START

/**
 * Where a checkout keeps its epic pages, relative to its root, newest layout first.
 * - `epics`:  since 2026-10-05 (epic `claude-design`, P4)
 * - `packages/docs/content/epics`:  since 2026-10-04 (epic `shared-content`, P2)
 *   - a link into the shared repo's old-path links, so the same folder as `epics`
 * - `packages/docs/epics`:  a worktree cut before that, until it merges `main`
 */
const EPICS_DIRS = ["epics", "packages/docs/content/epics", "packages/docs/epics"]

/**
 * An epic page's path inside `.claude/worktrees`:  `<w>/epics/<name>/<name>.plan.html`.
 * - a worktree on older code:  the same under `packages/docs/content/` or `packages/docs/`,
 *   or with the old name `<name>.html`
 */
const EPIC_FILE = /^[^/]+\/(?:packages\/docs\/(?:content\/)?)?epics\/([^/]+)\/\1(?:\.plan)?\.html$/

/**
 * A worktree's page asset, from `.claude/worktrees/`:  `<w>/packages/epics/tools/_assets/...` (the docs runtime, its
 * stylesheet, the docs bundle and its chunks) or a component pack (`<w>/packages/<pkg>/components/__pack/...`).
 * - a worktree on older code:  `packages/docs/tools/_assets/` and `packages/epics/pack/`
 */
const ASSET_FILE =
  /^[^/]+\/packages\/(?:epics\/tools\/_assets|docs\/tools\/_assets|[^/]+\/components\/__pack|epics\/pack)\/.+\.(?:m?js|css)$/

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
 * Title, phases and urgent items of the epic page at `file`, by pattern.
 * - why:  the Epics page is served on every request,
 *   and a pattern reads the few attributes it needs without parsing the whole doc
 * - attributes in any order, across lines:
 *   - each `<epic-phase title="..." status="S">`, labelled by its place (`P3 · <title>`):  its id is stable
 *     (`p-epic-migrate`, epic `epic-workflow` P15), never its number
 *   - `<epic-page updated future>`
 *   - each `<epic-item id="q3" state="attention">`
 * - a doc still in the old markup (no `<epic-page>`:  one restored from an old backup) reads as an empty plan:
 *   the epic tool refuses it until it's converted (epic `epic-components` P15)
 * - urgent items as `EpicState` `URGENT_SELECTOR` finds them (the Epics list page, `<epic-page>`)
 */
function read(
  file: string
): Pick<
  RunningEpic,
  "title" | "phases" | "done" | "total" | "active" | "updated" | "future" | "standing" | "saga" | "urgent" | "worked"
> {
  const html = readFileSync(file, "utf8")
  // drop the `Epic: ` epic pages' titles start with (since 2026-10-04):  the card is in the Epics list already
  const title = (/<title>([^<]*)<\/title>/.exec(html)?.[1]?.trim() ?? "").replace(/^Epic:\s*/, "")
  const attribute = (tag: string, name: string) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1]
  const page = /<epic-page\b[^>]*>/.exec(html)?.[0] ?? ""
  const tags = (pattern: RegExp) => (page ? [...html.matchAll(pattern)].map(([tag]) => tag) : [])
  const phases = tags(/<epic-phase\b[^>]*>/g).map((tag, index) => ({
    status: attribute(tag, "status") ?? "todo",
    header: `P${index + 1} · ${attribute(tag, "title") ?? ""}`
  }))
  const active = phases.find((phase) => phase.status === "active")?.header
  const updated = /^\d{4}-\d\d-\d\d$/.exec(attribute(page, "updated") ?? "")?.[0]
  const future = /\sfuture(?=[\s=>])/.test(page)
  const standing = /\sstanding(?=[\s=>])/.test(page)
  const saga = attribute(page, "saga")
  const urgent = tags(/<epic-item\b[^>]*>/g)
    .filter((tag) => (URGENT_STATES as readonly string[]).includes(attribute(tag, "state") ?? ""))
    .map((tag) => attribute(tag, "id") ?? "")
    .filter(Boolean)
  const log = join(dirname(file), "parts", "log.html")
  const events = [...eventTimesIn(html), ...(existsSync(log) ? eventTimesIn(readFileSync(log, "utf8")) : [])]
  const worked = lastWorked([updated, ...events])
  return {
    title: decode(title),
    phases: phases.map((phase) => phase.status),
    done: phases.filter((phase) => phase.status === "done").length,
    total: phases.length,
    ...(active && { active: decode(active) }),
    ...(updated && { updated }),
    ...(future && { future }),
    ...(standing && { standing }),
    ...(saga && { saga }),
    ...(urgent.length > 0 && { urgent }),
    ...(worked && { worked: worked.toISOString() })
  }
}

/** `value` with RegExp syntax escaped. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** The few entities an epic page's `<title>` and headers hold, back to text. */
function decode(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
}
