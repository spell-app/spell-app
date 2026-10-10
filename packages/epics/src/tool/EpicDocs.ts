import { spawnSync } from "node:child_process"
import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync, statSync } from "node:fs"
import { dirname, join, relative, resolve, sep } from "node:path"

import { KINDS, type ItemKind } from "./planDoc.types"

import type { PlanDoc } from "./PlanDoc"
import type { PlanDocFiles } from "./PlanDocFiles"
import { PlanItem } from "./PlanItem"
import { PlanMarkup } from "./PlanMarkup"

/****************
 * ### `EpicDocs`
 * The docs an epic wrote besides its plan doc, and what its plan doc settled:
 * the two lists `/docs-check` works from (epic `airplane`, P10).
 * - `find()`:  `spell dev plan-doc docs <name>`, every doc the epic wrote or touched, each with why it's listed
 *   - `wrote`:  the durable doc (and the files in its own folder), the docs its commits changed,
 *     and the shared pages its turns changed whose path has its name (`guides/epic-components/...`)
 *   - `related`:  a doc that names the epic ("epic `airplane`", "airplane P3", `epics/airplane/`),
 *     or a shared page its turns changed that the plan doc links to
 *   - `linked`:  a doc the plan doc links to, and nothing else:  often one it only read
 *   - `swept`:  any other shared page its turns changed (a turn commits every session's edits:  maybe not its own)
 *   - and its changelog entry, `guides/changelog.html#<name>`
 * - `decisions()`:  `spell dev plan-doc decisions <name>`, what the docs must agree with:
 *   each phase's Done list and Updated notes, and every item with its status, its chosen option and answer
 * - Why several ways to find docs:  the shared folders (`guides/`, `templates/`, `ui/`) aren't in spell-app's git,
 *   so a commit can't show them;  the shared repo's own commits name the checkout whose turn swept them up
 *   (`Turn-end:`), and the pages themselves name the epic.
 * - Node only (git, `node:fs`):  NOT in the `$/epics` barrel, imported by path.  Reads, never writes.
 ****************/
export class EpicDocs {
  /** the checkout's plan docs, and its git */
  readonly files: PlanDocFiles

  /** the epic's name:  `airplane` */
  readonly name: string

  /** its plan doc's path */
  readonly file: string

  /** its plan doc, read whole (a split doc assembled) */
  readonly plan: PlanDoc

  constructor({ files, name }: { files: PlanDocFiles; name: string }) {
    this.files = files
    this.name = name
    this.file = files.findDoc(name)
    this.plan = files.read(this.file)
  }

  ////////////////
  // ## Finding docs
  ////////////////

  /**
   * Every doc epic `name` wrote or touched besides its plan doc, `wrote` first, then `related`, then `linked`;
   * and its changelog entry.
   * - only files that exist now, in this checkout:  a doc renamed since is listed under its new name only when a
   *   later commit or a mention finds it
   * - never the plan doc's own folder, nor any other plan doc (`epics/`), nor generated pages:  `isDocPath()`
   */
  find(): EpicDocList {
    const { root } = this.files
    const found = new Map<string, EpicDoc>()
    const add = (path: string, reason: DocReason, sha?: string) => {
      if (!EpicDocs.isDocPath(path) || !isFile(join(root, path))) return
      const doc = found.get(path) ?? { path, group: "linked", reasons: [], commits: [] }
      if (!doc.reasons.includes(reason)) doc.reasons.push(reason)
      if (sha && !doc.commits.includes(sha)) doc.commits.push(sha)
      found.set(path, doc)
    }
    for (const path of this.durablePaths()) {
      add(path, "durable")
      for (const beside of this.besideDurable(path)) add(beside, "beside-durable")
    }
    for (const [sha, paths] of this.commitFiles()) for (const path of paths) add(path, "commit", sha.slice(0, 7))
    for (const path of this.sharedTurnFiles()) add(path, "shared-turn")
    for (const path of this.mentioningFiles()) add(path, "mention")
    for (const path of this.linkedPaths()) add(path, "link")
    const docs = [...found.values()]
    for (const doc of docs) doc.group = EpicDocs.groupOf(doc, this.name)
    docs.sort((a, b) => GROUPS.indexOf(a.group) - GROUPS.indexOf(b.group) || a.path.localeCompare(b.path))
    const counts = Object.fromEntries(
      GROUPS.map((group) => [group, docs.filter((doc) => doc.group === group).length])
    ) as Record<DocGroup, number>
    return {
      epic: this.name,
      planDoc: this.relative(this.file),
      docs,
      counts,
      changelog: this.changelogEntry()
    }
  }

  /** The durable doc(s) the plan doc names, `<a slot="durable" href>`, as checkout paths. */
  durablePaths(): string[] {
    const links = this.plan.document.querySelectorAll('epic-page > a[slot="durable"][href]')
    return Array.from(links, (link) => this.pathOf(link.getAttribute("href")!)).filter((path) => path !== undefined)
  }

  /**
   * The other pages in a durable doc's OWN folder:  `guides/seo/seo.html` has `guides/seo/*`;
   * a page alone in a shared folder (`guides/airplane.html`) has none.
   */
  besideDurable(path: string): string[] {
    const parts = path.split("/")
    const folder = parts.at(-2)
    if (parts.length < 3 || `${folder}.html` !== parts.at(-1)) return []
    return walk(join(this.files.root, dirname(path)))
      .map((file) => this.relative(file))
      .filter((each) => each !== path)
  }

  /**
   * The files each of the epic's commits changed, by sha:
   * the commits its plan doc lists (`<epic-commit sha>`), and the ones its history names (`PlanDocFiles.docLog()`).
   * - a history commit another epic's doc lists is that epic's:  `P6:  Doc Review -- ...` reads the same for every
   *   epic with a P6 called Doc Review
   * - one `git log --no-walk` for them all, in the doc's checkout;  a sha git doesn't have is skipped
   * - a merge lists no files:  merging `main` in would list everything `main` changed
   */
  commitFiles(): Map<string, string[]> {
    const listed = EpicDocs.commitShas(this.plan.toString())
    const others = this.otherEpicsCommits()
    const logged = this.files
      .docLog(this.file)
      .map((entry) => entry.sha)
      .filter((sha) => !others.has(sha))
    const shas = [...new Set([...listed, ...logged])]
    if (!shas.length) return new Map()
    const raw = gitOutput(this.files.checkoutOf(this.file), [
      "-c",
      "core.quotepath=off",
      "log",
      "--no-walk=unsorted",
      "--ignore-missing",
      "--format=%x01%H",
      "--name-only",
      ...shas
    ])
    return EpicDocs.parseNameLog(raw)
  }

  /** Every commit the OTHER epics' plan docs list (`<epic-commit sha>`), skeletons and parts:  full shas. */
  otherEpicsCommits(): Set<string> {
    const own = dirname(this.file)
    const shas = new Set<string>()
    for (const file of walk(this.files.epics)) {
      if (file.startsWith(`${own}${sep}`) || !file.endsWith(".html")) continue
      for (const sha of EpicDocs.commitShas(readFileSync(file, "utf8"))) shas.add(sha)
    }
    return shas
  }

  /**
   * The shared pages changed by the shared repo's commits whose `Turn-end:` is this epic's checkout
   * (`<name>`, or one of its agents' worktrees, `<name>-agent-<hex>`).
   * - the shared repo:  where the checkout's `guides/` link points;  none (no link):  nothing
   * - a turn commits EVERY session's pending edits, so a page here may be another session's:  `/docs-check` reads
   *   it and finds nothing of this epic's in it, at worst
   */
  sharedTurnFiles(): string[] {
    const shared = this.sharedRoot()
    if (!shared) return []
    const raw = gitOutput(shared, [
      "-c",
      "core.quotepath=off",
      "log",
      "-E",
      `--grep=^Turn-end: ${escapeRegex(this.name)}(-agent-[0-9a-f]+)?$`,
      "--format=",
      "--name-only"
    ])
    return [...new Set(raw.split("\n").filter(Boolean))]
  }

  /**
   * The docs that name the epic (`mentions()`):  every page in the shared doc folders (`SHARED_DOC_DIRS`), and
   * every doc file spell-app tracks (`git ls-files`, `isDocPath()`).
   */
  mentioningFiles(): string[] {
    const { root } = this.files
    const shared = SHARED_DOC_DIRS.flatMap((dir) => walk(join(root, dir)).map((file) => this.relative(file)))
    const tracked = this.files.git("-c", "core.quotepath=off", "ls-files").split("\n").filter(Boolean)
    const candidates = [...new Set([...shared, ...tracked])].filter((path) => EpicDocs.isDocPath(path))
    return candidates.filter((path) => {
      const file = join(root, path)
      return isFile(file) && EpicDocs.mentions(readFileSync(file, "utf8"), this.name)
    })
  }

  /** The checkout paths the plan doc links to (`<a href>`), anywhere in it:  its Files fields, items, log. */
  linkedPaths(): string[] {
    const links = this.plan.document.querySelectorAll("a[href]")
    return [...new Set(Array.from(links, (link) => this.pathOf(link.getAttribute("href")!)))].filter(
      (path) => path !== undefined
    )
  }

  /** The epic's changelog entry:  `guides/changelog.html`, its `<ui-section id="<name>">`, and whether it's there. */
  changelogEntry(): ChangelogEntry {
    const file = join(this.files.root, CHANGELOG)
    const html = existsSync(file) ? readFileSync(file, "utf8") : ""
    const found = new RegExp(`<ui-section\\b[^>]*\\bid="${escapeRegex(this.name)}"`).test(html)
    return { path: CHANGELOG, anchor: this.name, found }
  }

  ////////////////
  // ## What the plan doc settled
  ////////////////

  /**
   * What the epic's docs must agree with:  its phases (Done lists, Updated notes) and its items, in page order.
   * - an item's `text`:  its current text, its Original Discussion left out (`PlanDoc.textOf()`)
   * - `chosen`:  the option picked on any of its card sets, `B · Keep it`;  `answer`:  its answer card's text
   */
  decisions(): EpicDecisions {
    const { plan } = this
    const phases = plan.phaseElements.map((phase, index) => {
      const { n, name, status } = plan.phases[index]!
      const done = phase.querySelector(':scope > epic-field[name="done"]')
      return {
        n,
        name,
        status,
        done: done ? PlanMarkup.squeeze(done.textContent ?? "") : null,
        updates: Array.from(phase.querySelectorAll(":scope > epic-updated"), (update) => ({
          at: update.getAttribute("at") ?? "",
          text: PlanMarkup.squeeze(update.textContent ?? "")
        }))
      }
    })
    const items = ITEM_KINDS.flatMap((kind) =>
      plan.itemsOf(kind).map((item): SettledItem => {
        const { id, title, status } = plan.facts(item)
        const answer = PlanItem.currentText(item).querySelector("epic-answer")
        return {
          id: id.toUpperCase(),
          kind,
          status,
          title,
          chosen: chosenOption(item),
          answer: answer ? answerText(answer) : null,
          text: plan.textOf(item).details
        }
      })
    )
    return { epic: this.name, planDoc: this.relative(this.file), phases, items }
  }

  ////////////////
  // ## Paths
  ////////////////

  /**
   * Does checkout path `path` (`/`-separated) hold a doc a person reads?
   * - yes:  any `.md` (`AGENTS.md`, `README.md`, a skill's `SKILL.md`, notes beside code);
   *   in the shared doc folders (`SHARED_DOC_DIRS`) also `.html` pages and `.json` page data
   * - no:  plan docs (`epics/`), the docs home (`pages/`), the logs (`agents/*.md`), the changelog (listed apart),
   *   a shared folder's generated `index.html`, a session's own notes (`PARKED-*.md`, `MORNING-*.md`),
   *   fixtures, assets, dependencies
   * - STATIC:  pure
   */
  static isDocPath(path: string): boolean {
    if (SKIPPED.test(path) || path === CHANGELOG) return false
    const top = path.split("/")[0]!
    if (SHARED_DOC_DIRS.some((dir) => path.startsWith(`${dir}/`))) {
      if (path === `${top}/index.html`) return false
      return /\.(html|md|json)$/.test(path)
    }
    return path.endsWith(".md")
  }

  /**
   * Does `text` name epic `name`?  "epic `airplane`" (or `<code>airplane</code>`), "airplane P3" / "J14" ...,
   * or a path into its folder, `epics/airplane/`.
   * - whole names only:  `airplane-scratch` is not `airplane`
   * - STATIC:  pure
   */
  static mentions(text: string, name: string): boolean {
    const n = escapeRegex(name)
    const quote = "(?:<code>|</code>|[`'\"*])*"
    const patterns = [
      `\\b[Ee]pics?\\s+${quote}${n}(?![\\w-])`,
      `\\bepics/${n}/`,
      `(?<![\\w/-])${n}${quote}\\s+[PIJQCTV]\\d+\\b`
    ]
    return patterns.some((pattern) => new RegExp(pattern).test(text))
  }

  /**
   * Doc `doc`'s group, for epic `name`:
   * - `wrote`:  a reason in `WROTE`, or a `shared-turn` page whose path has the name (`guides/airplane.html`,
   *   `guides/epic-components/tool.html`)
   * - `related`:  a `mention`, or a `shared-turn` page the plan doc links to
   * - `linked`:  a `link` alone
   * - `swept`:  a `shared-turn` page alone:  a turn commits every session's edits, and a tool run over every page
   *   (`docs offline --fix`) changes them all, so most of these are noise.  Counted, listed only by `--json`.
   * - STATIC:  pure
   */
  static groupOf({ path, reasons }: Pick<EpicDoc, "path" | "reasons">, name: string): DocGroup {
    const named = new RegExp(`(^|/)${escapeRegex(name)}([./]|$)`).test(path)
    const turn = reasons.includes("shared-turn")
    if (reasons.some((reason) => WROTE.includes(reason)) || (named && turn)) return "wrote"
    if (reasons.includes("mention") || (turn && reasons.includes("link"))) return "related"
    return turn ? "swept" : "linked"
  }

  /** The commits plan-doc markup `html` lists, `<epic-commit sha="...">`, in order, once each.  STATIC:  pure. */
  static commitShas(html: string): string[] {
    return [...new Set(Array.from(html.matchAll(/<epic-commit\b[^>]*\bsha="([0-9a-f]{7,40})"/g), (m) => m[1]!))]
  }

  /**
   * `git log --format=%x01%H --name-only` output as sha => the files it changed.  STATIC:  pure.
   * - a commit with no files (a merge) is left out
   */
  static parseNameLog(raw: string): Map<string, string[]> {
    const commits = new Map<string, string[]>()
    for (const chunk of raw.split("\x01")) {
      const [sha, ...paths] = chunk.split("\n").map((line) => line.trim())
      const changed = paths.filter(Boolean)
      if (sha && changed.length) commits.set(sha, changed)
    }
    return commits
  }

  /** `file` as a checkout path, `/`-separated. */
  private relative(file: string): string {
    return relative(this.files.root, file).split(sep).join("/")
  }

  /**
   * Link `href`, written in the plan doc's folder, as a checkout path;  `undefined` for a link out of the checkout,
   * to another site, or within the page.
   */
  private pathOf(href: string): string | undefined {
    const bare = href.replace(/[?#].*$/, "")
    if (!bare || /^[a-z][\w+.-]*:/i.test(bare) || bare.startsWith("/")) return undefined
    const path = this.relative(resolve(dirname(this.file), decodeURI(bare)))
    return path.startsWith("..") ? undefined : path
  }

  /** The shared content repo:  the folder the checkout's `guides/` link points into;  `undefined` without one. */
  private sharedRoot(): string | undefined {
    const guides = join(this.files.root, "guides")
    if (!lstatSync(guides, { throwIfNoEntry: false })?.isSymbolicLink()) return undefined
    return dirname(realpathSync(guides))
  }
}

////////////////
// ## Types
////////////////

/** Why a doc is on `EpicDocs.find()`'s list. */
export type DocReason =
  /** the plan doc's durable doc, `<a slot="durable">` */
  | "durable"
  /** a page in the durable doc's own folder */
  | "beside-durable"
  /** one of the epic's commits changed it */
  | "commit"
  /** a shared-repo commit of the epic's turns changed it */
  | "shared-turn"
  /** it names the epic */
  | "mention"
  /** the plan doc links to it */
  | "link"

/** How sure `EpicDocs.find()` is that the epic wrote a doc, most sure first:  `GROUPS`. */
export type DocGroup = (typeof GROUPS)[number]

/** One doc on `EpicDocs.find()`'s list. */
export type EpicDoc = {
  /** its checkout path:  `guides/airplane.html` */
  path: string
  /** `wrote`, `related`, `linked` or `swept`:  from its reasons (`EpicDocs.groupOf()`) */
  group: DocGroup
  /** why it's listed */
  reasons: DocReason[]
  /** the epic's commits that changed it, short shas */
  commits: string[]
}

/** An epic's changelog entry. */
export type ChangelogEntry = {
  /** `guides/changelog.html` */
  path: string
  /** its section's id:  the epic's name */
  anchor: string
  /** is the entry there? */
  found: boolean
}

/** `EpicDocs.find()`'s answer:  `plan-doc docs <name> --json`. */
export type EpicDocList = {
  /** the epic's name */
  epic: string
  /** its plan doc, as a checkout path */
  planDoc: string
  /** the docs, `wrote` first */
  docs: EpicDoc[]
  /** how many docs in each group */
  counts: Record<DocGroup, number>
  /** its changelog entry */
  changelog: ChangelogEntry
}

/** One phase, as `EpicDocs.decisions()` gives it. */
export type SettledPhase = {
  /** its number */
  n: number
  /** its short name */
  name: string
  /** `todo`, `active` or `done` */
  status: string
  /** its Done field's text:  what was built;  `null` without one */
  done: string | null
  /** its Updated notes, oldest first:  how its plan changed */
  updates: { at: string; text: string }[]
}

/** One item, as `EpicDocs.decisions()` gives it. */
export type SettledItem = {
  /** `Q3`, `J5` ... */
  id: string
  /** `question`, `judgement` ... */
  kind: ItemKind
  /** `open`, `done`, `decided` or `canceled` */
  status: string
  /** its title:  an answered question's is its answer */
  title: string
  /** the option chosen, `B · Keep it`;  `null` when none is */
  chosen: string | null
  /** its answer card's title, then its text:  `Right it is:  because ...`;  `null` while unanswered */
  answer: string | null
  /** its current text, its Original Discussion left out */
  text: string
}

/** `EpicDocs.decisions()`'s answer:  `plan-doc decisions <name> --json`. */
export type EpicDecisions = {
  /** the epic's name */
  epic: string
  /** its plan doc, as a checkout path */
  planDoc: string
  /** its phases, in order */
  phases: SettledPhase[]
  /** its items, by kind (`ITEM_KINDS`), in page order */
  items: SettledItem[]
}

/** `EpicDoc`'s groups, most sure first. */
export const GROUPS = ["wrote", "related", "linked", "swept"] as const

/** The shared folders whose pages are docs:  searched for mentions, and their `.html` / `.json` listed. */
export const SHARED_DOC_DIRS = ["guides", "templates", "ui", "agents/wwod"]

/** The changelog:  listed apart, as `changelog`, never as a doc. */
const CHANGELOG = "guides/changelog.html"

/** The item kinds `decisions()` lists, in that order (`decision` is a question). */
const ITEM_KINDS = (Object.keys(KINDS) as ItemKind[]).filter((kind) => kind !== "decision")

/** Paths that are never docs:  `isDocPath()`. */
const SKIPPED =
  /^(epics|pages|brand)\/|^agents\/[^/]+\.md$|^(PARKED|MORNING)-[^/]*\.md$|(^|\/)(node_modules|fixtures|_assets|_data|vendor|graphify-out)\//

/** The reasons that say the epic wrote a doc, whatever its path. */
const WROTE: DocReason[] = ["durable", "beside-durable", "commit"]

/** The option chosen in any of `item`'s card sets, `B · Keep it`;  `null` when none is. */
function chosenOption(item: Element): string | null {
  for (const set of PlanItem.choiceSets(item)) {
    const letter = set.getAttribute("chosen")
    const option = letter && PlanItem.optionsIn(set).find((each) => each.letter === letter)
    if (option) return `${option.letter} · ${option.title}`
  }
  return null
}

/** An `<epic-answer>`'s title, then its own text (its slotted title left out):  `Right it is:  because ...`. */
function answerText(answer: Element): string {
  const title = PlanItem.titleOf(answer)
  const own = Array.from(answer.childNodes).filter(
    (node) => !(PlanMarkup.isElement(node) && node.getAttribute("slot") === "title")
  )
  const text = PlanMarkup.squeeze(own.map((node) => node.textContent ?? "").join(""))
  return [title === answer.id ? "" : title, text].filter(Boolean).join(":  ")
}

/** Is there a file (not a folder) at `file`? */
function isFile(file: string): boolean {
  return statSync(file, { throwIfNoEntry: false })?.isFile() ?? false
}

/** Every file under folder `dir`, through links;  none when it's missing. */
function walk(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .map((entry) => join(dir, entry))
    .filter((file) => isFile(file))
}

/** `text` safe inside a `RegExp`. */
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** `git <args>` in folder `cwd`, stdout ("" on failure);  big output welcome (`maxBuffer`). */
function gitOutput(cwd: string, args: string[]): string {
  const run = spawnSync("git", args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
  return run.status === 0 ? run.stdout : ""
}
