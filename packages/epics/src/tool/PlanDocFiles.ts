import { spawnSync } from "node:child_process"
import { existsSync, lstatSync, readdirSync, readFileSync, rmSync } from "node:fs"
import { basename, dirname, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

import { parseHTML } from "linkedom"

import { AS } from "$/assembler"
import { SRV } from "$/server"

import { PlanDocError, type CommitLogEntry, type PlanDocOptions, type PlanDocParts } from "./planDoc.types"

import { EpicParts } from "./EpicParts"
import { OldPlanReader } from "./OldPlanReader"
import { PlanCommits } from "./PlanCommits"
import { PlanDoc } from "./PlanDoc"
import { PlanMarkup } from "./PlanMarkup"
import { PART_SOURCE, PARTS_DIR, PlanParts } from "./PlanParts"
import type { PlanReader } from "./PlanReader"

/****************
 * ### `PlanDocFiles`
 * The plan docs of ONE spell-app checkout, on disk:  where each epic's doc is, reading it whole, editing it under its
 * lock, writing it back tidy, and the git facts the tool needs about it.
 * - the doc is the checkout's `epics/<name>/`:  a link to the one shared copy every checkout edits (`findDoc()`)
 * - a doc is FOUND under either name (`planDocIn()`):  `<name>.plan.html` since 2026-10-04, else the old
 *   `<name>.html`, which worktrees cut before then still have
 * - TWO markups until the switch (P12):  `<epic-*>` (a `PlanDoc`, read and edited) and the old `ui-*` (an
 *   `OldPlanReader`, read only).  `readAny()` reads either;  `read()` and `edit()` take the new markup only, and
 *   REFUSE an old doc, writing nothing:  "convert it first"
 * - every edit (`edit()`):  takes the doc's lock (parallel agents queue instead of clobbering each other), parses
 *   it, changes it through `PlanDoc`, recolours every item (`updateStates()`), stamps "updated", checks it against the
 *   definitions (an edit that breaks the markup is refused), tidies it in memory (link targets, oxfmt) and writes
 *   each file once, atomically (`writeDoc()`)
 * - a doc may be SPLIT:  a skeleton plus part files, `parts/<id>.html` (`EpicParts`).  Reading assembles it into one
 *   document, `writeDoc()` splits it again:  every command works on either shape, and a part file is written only
 *   when its body changed.
 * - Node only (`node:fs`, git, `$/server`'s lock, `$/assembler`'s linker and formatter):  NOT in the `$/epics`
 *   barrel, imported by path.  Knows nothing of the command line (`PlanDocCommands`), nor of `docs`, which `epics`
 *   may not import:  the docs index is rebuilt by running its tool (`reindex()`).
 ****************/
export class PlanDocFiles {
  /**
   * the checkout's root:  its `epics/`, `pages/` and docs tools.  STATIC for the object's life;  the command line
   * makes one for the checkout it runs in (a worktree's, while the code may be main's)
   */
  readonly root: string

  /** `epics/`:  plan docs, `epics/<name>/<name>.plan.html`, their inboxes and details pages */
  readonly epics: string

  /**
   * the template `new` copies:  the tool's OWN, in `<epic-*>` markup (`templates/plan.html` beside this), tracked
   * with the code that writes it.  NOT the shared `templates/epics/plan.html`, which `main`'s tool still copies until
   * the switch (P12)
   */
  readonly template: string

  /** `pages/details/`:  scratch details pages (`spell dev details new`), where the item picker's page lives */
  readonly details: string

  /** `packages/docs`:  where the docs tools run (`index.js`, `check-spell.js`, `open.js`) */
  readonly docsPackage: string

  /** `packages/docs/tools`:  the docs tools this runs as children, never imports */
  readonly docsTools: string

  /** link targets for the checkout's pages:  its bare-name index is built once per process */
  readonly linker: AS.Linker

  constructor({ root = CHECKOUT, template = TEMPLATE }: { root?: string; template?: string } = {}) {
    this.root = root
    this.epics = join(root, "epics")
    this.template = template
    this.details = join(root, "pages", "details")
    this.docsPackage = join(root, "packages", "docs")
    this.docsTools = join(this.docsPackage, "tools")
    this.linker = new AS.Linker(root)
  }

  ////////////////
  // ## Finding docs
  ////////////////

  /**
   * The doc `new` makes for plan `name`, in this checkout:  `epics/<name>/<name>.plan.html`;  names are
   * lower-kebab-case, as the folder.
   */
  docPath(name: string): string {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) throw new PlanDocError(`name "${name}" must be lower-kebab-case`)
    return join(this.epics, name, `${name}.plan.html`)
  }

  /**
   * The doc of epic `name`:  THIS checkout's `epics/<name>/`, either name (`planDocIn()`);  throws when there's none.
   * - this checkout's path, not another's:  tidying and the URLs stay inside it (a path through another worktree,
   *   made relative here, starts `../../.claude/...`, which oxfmt refuses)
   */
  findDoc(name: string): string {
    this.docPath(name)
    const found = PlanDocFiles.planDocIn(join(this.epics, name), name)
    if (!found) throw new PlanDocError(`no plan doc for "${name}" (${relative(this.root, join(this.epics, name))}/)`)
    return found
  }

  /**
   * Epic `name`'s plan doc in folder `dir` (`epics/<name>/`):  `<name>.plan.html`, else `<name>.html` when that is a
   * plan doc (`<body class="... plan-doc">`, or an `<epic-page>`);  `undefined` when there's neither.
   * - why both names:  plan docs were renamed `<name>.plan.html` on 2026-10-04 (`review-review` P4), and a worktree
   *   cut before then still has `<name>.html` until it merges `main`
   * - STATIC:  a folder's answer, whichever checkout it's in
   * - a private copy of `packages/docs/tools/pages.js` `planDocIn()`:  `epics` may not import `docs`
   */
  static planDocIn(dir: string, name: string): string | undefined {
    const file = join(dir, `${name}.plan.html`)
    if (existsSync(file)) return file
    const old = join(dir, `${name}.html`)
    if (!existsSync(old)) return undefined
    const html = readFileSync(old, "utf8")
    return /<body\b[^>]*\bclass="[^"]*\bplan-doc\b/.test(html) || /<epic-page\b/.test(html) ? old : undefined
  }

  /**
   * Every epic, once each:  `{ name, title, status, checkout, notReviewed, total, file }`, in progress first, then
   * future, then done;  most not reviewed first in each.
   * - `status`:  `in progress` while any phase isn't done (or there are none yet), `future` for an epic not planned
   *   yet, else `done`
   * - `checkout`:  `main`, or `.claude/worktrees/<name>`:  where it runs (`epicCheckout()`)
   * - either markup (`readAny()`)
   */
  listEpics(): EpicListing[] {
    const main = this.mainRoot()
    const dir = this.epics
    const names = existsSync(dir)
      ? readdirSync(dir, { withFileTypes: true })
          .filter((entry) => entry.isDirectory() && PlanDocFiles.planDocIn(join(dir, entry.name), entry.name))
          .map((entry) => entry.name)
      : []
    const epics = names.map((name): EpicListing => {
      const file = this.findDoc(name)
      const plan = this.readAny(file)
      const sections = plan.reviewSections()
      const phases = plan.phases
      return {
        name,
        title: plan.title || name,
        status: plan.future
          ? "future"
          : phases.length && phases.every((phase) => phase.status === "done")
            ? "done"
            : "in progress",
        checkout: this.epicCheckout(name, main),
        notReviewed: sections.reduce((sum, section) => sum + section.notReviewed, 0),
        total: sections.reduce((sum, section) => sum + section.total, 0),
        file
      }
    })
    // in progress, then future, then done
    const rank = { "in progress": 0, future: 1, done: 2 }
    return epics.sort(
      (a, b) => rank[a.status] - rank[b.status] || b.notReviewed - a.notReviewed || a.name.localeCompare(b.name)
    )
  }

  ////////////////
  // ## Reading and writing
  ////////////////

  /**
   * The plan doc at `file`, parsed, whichever markup:  a `PlanDoc` (`<epic-*>`), else an `OldPlanReader`.  For the
   * commands that only read (`summary`, `list`, `items`, `check`, the inbox's listings).
   * - a SPLIT doc comes back WHOLE:  every part read into its host;  `plan.parts` says how it was stored
   * - SIDE EFFECT:  names each missing part on stderr
   */
  readAny(file: string, options?: PlanDocOptions): PlanReader {
    if (!existsSync(file))
      throw new PlanDocError(`no plan doc ${relative(this.root, file)}:  \`spell dev plan-doc new\` first`)
    const plan = PlanDocFiles.readerOf(readFileSync(file, "utf8"), options)
    plan.parts =
      plan instanceof PlanDoc
        ? assembleEpic(plan.document, file)
        : new PlanParts(plan.document).assemble(PlanParts.reader(file))
    for (const id of plan.parts.missing)
      process.stderr.write(
        `plan-doc:  ${relative(this.root, PlanParts.partFile(file, id))} is missing:  #${id} has no body\n`
      )
    return plan
  }

  /**
   * The plan doc at `file`, parsed, to EDIT:  a `PlanDoc`.  `options` as its constructor's.
   * - throws a `PlanDocError` for a doc in the old markup, before anything is written:  "convert it first"
   */
  read(file: string, options?: PlanDocOptions): PlanDoc {
    const plan = this.readAny(file, options)
    if (!(plan instanceof PlanDoc)) throw this.oldMarkup(file)
    return plan
  }

  /**
   * Refuse the doc at `file` unless it's in the `<epic-*>` markup:  what an editing command checks before it touches
   * anything (the inbox, say) besides the doc.  Reads only the skeleton's text.
   */
  requireNewMarkup(file: string): void {
    if (existsSync(file) && !isEpicMarkup(readFileSync(file, "utf8"))) throw this.oldMarkup(file)
  }

  /**
   * Change the doc at `file` with `change(plan)`, under its lock (`SRV.FileLock`:  parallel agents, and the page
   * server's page edits, take turns);  resolves with what `change` returned.
   * - then the whole-doc pass (`updateStates()`), with the page's `recent-since` from the doc's checkout
   *   (`recentSince()`), stamps "updated", and writes it (`writeDoc()`)
   * - REFUSES, writing nothing:  a doc in the old markup (`read()`);  an edit after which `Markup.validate()` finds a
   *   problem the doc didn't have before
   * - `split`:  how to store it:  `true` a skeleton and parts, `false` one file;  default as it was
   */
  edit<T>(file: string, change: (plan: PlanDoc) => T, { split }: { split?: boolean } = {}): Promise<T> {
    return SRV.FileLock.runAsync(file, async () => {
      const plan = this.read(file, { recentSince: this.recentSince(file) })
      const before = new Set(plan.check())
      const result = change(plan)
      plan.updateStates()
      plan.touch()
      const broken = plan.check().filter((problem) => !before.has(problem))
      if (broken.length)
        throw new PlanDocError(
          `${relative(this.root, file)}:  nothing written:  the edit would break the doc:\n  ${broken.join("\n  ")}`
        )
      await this.writeDoc(file, plan, split ?? plan.parts!.split)
      return result
    })
  }

  /**
   * Write `plan` to `file`, tidied as a page must be (link targets, oxfmt), each file ONCE and atomically:  links
   * and formatting happen in memory (`AS.Linker.link()`, `PlanParts.formatHTML()`).
   * - `split`:  a skeleton plus part files (`EpicParts.split()`):  parts first, then the skeleton, so a page that
   *   sees the new skeleton finds its new parts;  only files whose text changed are written
   *   (`PlanParts.writeChanged()`), so an edit to one item rewrites its part (if its details changed) and the
   *   skeleton, and the page re-fetches that part alone
   * - one file:  as is, plus the parts folder of a doc that was split gone (`join`)
   * - links are made against the whole doc, at the page's folder:  a part's URLs are rebased to `parts/` after
   */
  async writeDoc(file: string, plan: PlanDoc, split: boolean): Promise<void> {
    const linked = this.linker.link(plan.toString(), dirname(file)).text
    if (!split) {
      PlanParts.writeChanged([[file, await PlanParts.formatHTML(file, linked)]])
      if (plan.parts?.split) rmSync(join(dirname(file), PARTS_DIR), { recursive: true, force: true })
      return
    }
    const { document } = parseHTML(linked)
    // linkedom writes `&` in attribute values bare (I2):  escaped in this throwaway copy, as the converter does,
    // since the parts are serialized inside `split()`
    PlanMarkup.escapeAmpersands(document as unknown as Document)
    const parts = new EpicParts(document as unknown as Document).split({ docName: basename(file) })
    const outputs = await Promise.all(
      [...parts].map(async ([id, html]): Promise<[string, string]> => {
        const part = PlanParts.partFile(file, id)
        return [part, await PlanParts.formatHTML(part, html)]
      })
    )
    outputs.push([file, await PlanParts.formatHTML(file, PlanMarkup.serialize(document as unknown as Document))])
    PlanParts.writeChanged(outputs)
  }

  /**
   * A parsed doc of HTML text, as the reader for its markup:  `PlanDoc` for `<epic-*>`, `OldPlanReader` before.
   * - STATIC:  any text, any checkout's
   */
  static readerOf(html: string, options?: PlanDocOptions): PlanReader {
    return isEpicMarkup(html) ? PlanDoc.parse(html, undefined, options) : OldPlanReader.parse(html, undefined, options)
  }

  /**
   * Rewrite the docs index:  a plan's status badge follows its phases.
   * - by running `packages/docs/tools/index.js`, a child `node`:  `epics` may not import `docs`
   * - shared content (`pages` a link):  ONE `pages/index.html` for every checkout, not tracked by spell-app, so a
   *   worktree rewrites it too:  nothing to conflict on merge
   * - a checkout WITHOUT the link (its own tracked home) in a worktree:  left alone, or two epics' worktrees would
   *   conflict on merge
   * - SIDE EFFECT:  says on stderr when it failed
   */
  reindex(): void {
    const pages = join(this.root, "pages")
    const shared = lstatSync(pages, { throwIfNoEntry: false })?.isSymbolicLink()
    if (!shared && /[\\/]\.claude[\\/]worktrees[\\/]/.test(pages)) return
    const run = spawnSync("node", [join(this.docsTools, "index.js")], { cwd: this.docsPackage, encoding: "utf8" })
    if (run.status !== 0) process.stderr.write(`plan-doc:  docs index not updated\n${run.stdout}${run.stderr}`)
  }

  /** The error an editing command gives for a doc in the old markup. */
  private oldMarkup(file: string): PlanDocError {
    return new PlanDocError(
      `${relative(this.root, file)} is in the old markup:  convert it first (spell dev plan-doc convert)`
    )
  }

  ////////////////
  // ## Git
  ////////////////

  /**
   * `git <args>` in this checkout, trimmed stdout ("" on failure).
   * - NEVER in a content folder (`epics/` ...):  each is a link into the shared content repo, and git run there sees
   *   THAT repo, not spell-app
   */
  git(...args: string[]): string {
    return PlanDocFiles.gitIn(this.root, ...args)
  }

  /**
   * `git <args>` in folder `cwd` (a checkout:  the doc's own, which may be another worktree), trimmed stdout (""
   * on failure).  STATIC:  any checkout's.
   */
  static gitIn(cwd: string, ...args: string[]): string {
    const run = spawnSync("git", args, { cwd, encoding: "utf8" })
    return run.status === 0 ? run.stdout.trim() : ""
  }

  /** The main checkout's root:  the parent of git's common dir (`.git`), the same from any worktree. */
  mainRoot(): string {
    const common = this.git("rev-parse", "--path-format=absolute", "--git-common-dir")
    return common ? dirname(common) : this.root
  }

  /**
   * Where epic `name` runs:  `.claude/worktrees/<name>` while that worktree exists, else `main`.
   * - `list`'s `checkout`, which `/epics` reads;  the doc itself is the shared one either way (`findDoc()`)
   */
  epicCheckout(name: string, main = this.mainRoot()): string {
    const own = join(main, ".claude/worktrees", name)
    return existsSync(own) ? relative(main, own) : "main"
  }

  /**
   * The spell-app checkout a doc belongs to:  its path up to `/epics/<name>/` (another worktree's, maybe;  or an
   * old one's `/epics/`), else this one.  Git for a doc runs there, never in the doc's folder (`git()`).
   */
  checkoutOf(file: string): string {
    const m = /^(.+?)[\\/](?:packages[\\/]docs[\\/](?:content[\\/])?)?epics[\\/][^\\/]+[\\/][^\\/]+$/.exec(file)
    return m ? m[1]! : this.root
  }

  /**
   * When "recent" starts for the doc at `file` (D2):  the commit time of `HEAD~2` in its checkout, ISO with offset;
   * `null` without one (no git, or a history that short).
   * - so green means changed in this commit or the last:  everything since the commit before those
   */
  recentSince(file: string): string | null {
    return PlanDocFiles.gitIn(this.checkoutOf(file), "log", "-1", "--format=%cI", "HEAD~2") || null
  }

  /** The GitHub page of the doc's repo (`PlanCommits.githubBase()` of `origin`), or `null`. */
  commitBase(file: string): string | null {
    return PlanCommits.githubBase(PlanDocFiles.gitIn(this.checkoutOf(file), "remote", "get-url", "origin"))
  }

  /**
   * The doc's commits, newest first:  its git history when the checkout tracks it, else `sharedDocLog()`.
   * - a doc spell-app tracks:  `git log --follow` (every phase commit touches the plan doc);  the doc as HEAD has
   *   it:  a rename to `<name>.plan.html` not committed yet has no history of its own, so follow the old name;  once
   *   committed, `--follow` goes through the rename
   * - a SHARED doc (`epics` a link into the shared content repo):  spell-app has no history of it
   */
  docLog(file: string): CommitLogEntry[] {
    const checkout = this.checkoutOf(file)
    const path = relative(checkout, file).split(sep).join("/")
    const names = [path, path.replace(/\.plan\.html$/, ".html")]
    const tracked = names.find(
      (name) => spawnSync("git", ["cat-file", "-e", `HEAD:${name}`], { cwd: checkout }).status === 0
    )
    return tracked
      ? PlanDocFiles.parseLog(PlanDocFiles.gitIn(checkout, "log", "--follow", "--format=%H%x09%s", "--", tracked))
      : PlanDocFiles.sharedDocLog(file, checkout)
  }

  /**
   * A shared doc's commits:  `checkout`'s commits since the doc was started whose subject names THIS epic's work,
   * newest first.
   * - the start:  `<epic-page started>`, or an old doc's `#plan-started` date
   * - `<epic> ...` (`shared-content P3:`, `shared-content I3:`)
   * - `P3:  <P3's name> -- ...`:  the phase name must match, since other epics have a P3 too
   * - a bare `Fix I3:` could be any epic's:  left out (write `<epic> I3:` instead)
   * - STATIC:  any checkout's, for any doc
   */
  static sharedDocLog(file: string, checkout: string): CommitLogEntry[] {
    const html = readFileSync(file, "utf8")
    const name = basename(file).replace(/(\.plan)?\.html$/, "")
    const since = (/<epic-page\b[^>]*\bstarted="(\d{4}-\d\d-\d\d)"/.exec(html) ??
      /\bid="plan-started"[^>]*>\s*(\d{4}-\d\d-\d\d)/.exec(html))?.[1]
    const phases = PlanDocFiles.readerOf(html).phases
    // a bare date means that day at the CURRENT time to git:  midnight, so the start day's commits count
    const raw = PlanDocFiles.gitIn(checkout, "log", "--format=%H%x09%s", ...(since ? [`--since=${since} 00:00`] : []))
    return PlanDocFiles.parseLog(raw).filter(({ subject }) => {
      if (subject.startsWith(`${name} `)) return true
      const parsed = PlanCommits.parseCommitSubject(subject)
      return Boolean(
        parsed?.phases.length &&
        parsed.phases.every((n) => {
          const phase = phases.find((each) => each.n === n)
          return phase && subject.includes(phase.name)
        })
      )
    })
  }

  /** `git log --format=%H%x09%s` output as `{ sha, subject }`s, newest first.  STATIC:  pure. */
  static parseLog(raw: string): CommitLogEntry[] {
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [sha, ...subject] = line.split("\t")
        return { sha: sha!, subject: subject.join("\t") }
      })
  }
}

/** One epic, as `PlanDocFiles.listEpics()` lists it (and `list --json` prints it, for `/epics`). */
export type EpicListing = {
  /** its name, the folder's:  `seo` */
  name: string
  /** its title, without `Epic: ` */
  title: string
  /** `in progress`, `future` or `done` */
  status: EpicStatus
  /** where it runs:  `main`, or `.claude/worktrees/<name>` */
  checkout: string
  /** how many of its items aren't reviewed */
  notReviewed: number
  /** how many items it has in all */
  total: number
  /** its doc */
  file: string
}

/** Where an epic stands, as `list` groups it, in order. */
export const EPIC_STATUSES = ["in progress", "future", "done"] as const
/** One of `EPIC_STATUSES`. */
export type EpicStatus = (typeof EPIC_STATUSES)[number]

/** The checkout this file is in (`packages/epics/src/tool/` is four folders down):  the default root. */
const CHECKOUT = resolve(fileURLToPath(import.meta.url), "..", "..", "..", "..", "..")

/** The tool's own template, in `<epic-*>` markup:  `templates/plan.html` beside this file. */
const TEMPLATE = fileURLToPath(new URL("templates/plan.html", import.meta.url))

/** Is plan doc text `html` in the `<epic-*>` markup:  does it have an `<epic-page>`? */
function isEpicMarkup(html: string): boolean {
  return /<epic-page\b/.test(html)
}

/**
 * Put a split `<epic-*>` doc's parts back (`EpicParts.assemble()`), reading them beside `file`;  what was there:
 * `{ split, hosts, missing, inline }`, as `PlanParts.assemble()` reports an old doc's.
 * - `inline`:  a host holding a body of its own beside its `source` (a hand edit in the skeleton):  kept, the part's
 *   after it;  the next write moves both into the part
 */
function assembleEpic(document: Document, file: string): PlanDocParts {
  const hosts = Array.from(document.querySelectorAll("[source]")).filter(
    (host) => host.localName.startsWith("epic-") && PART_SOURCE.test(host.getAttribute("source") ?? "")
  )
  const ids = hosts.map((host) => PART_SOURCE.exec(host.getAttribute("source")!)![1]!)
  const inline = hosts
    .filter((host) =>
      Array.from(host.childNodes).some(
        (node) =>
          (node.nodeType === 1 && !(node as Element).hasAttribute("slot")) ||
          (node.nodeType === 3 && Boolean(node.textContent?.trim()))
      )
    )
    .map((host) => host.id)
  const missing = new EpicParts(document).assemble(PlanParts.reader(file))
  return { split: hosts.length > 0, hosts: ids, missing, inline }
}
