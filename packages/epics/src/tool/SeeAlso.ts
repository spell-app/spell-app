import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { dirname, join, posix, relative, resolve, sep } from "node:path"

/** The catch-all epic for comments on a page no epic owns (`spell dev comments gather`, `GuideChanges`). */
export const GUIDE_CHANGES = "guide-changes"

/****************
 * ### `SeeAlso`
 * An epic's SEE ALSO:  the pages it made or leans on, which `<epic-page>` lists in its See Also box, above its blocks.
 * GATHERED from the epic's own files every time, never kept by hand (Owen, Q13 and Q15 of epic `epic-workflow`):
 * - `durable`:  its durable doc, the epic page's `<a slot="durable">`
 * - `guide`:  every docs page under `guides/` its PHASES link to (the changelog too, when linked):  a phase's part
 *   file, `parts/p<N>.html`;  never an item's, or the Overview's, which only mention a guide in passing (Owen, J94:
 *   "Only links in phases count, not in items")
 * - `details` / `choices`:  every page in its `details/` folder:  details pages, choices pages (a `<slug>.rows.json`
 *   beside it), its analysis page
 * - NOT:  other epics' pages, nor changelog entries it doesn't link
 *
 * And which epic a page BELONGS to (`ownerOf()`, Q12):  where Owen's comments on it go when he presses its Send.
 * - a page in `epics/<name>/` (a details page):  epic `<name>`
 * - else the epic whose See Also lists it:
 *   1. one whose DURABLE doc it is, before one that only links it (J88:  the epic that wrote a guide knows it best,
 *      though a running one, the tooling home say, links it in passing)
 *   2. then an OPEN one (phases left, none yet, or standing) before one that's done
 *   3. then the one updated last (`<epic-page updated>`, then its file's time)
 * - none:  `undefined`;  the caller files it under `GUIDE_CHANGES`, as `spell dev comments gather` does
 * - never claimed:  the changelog and a folder's index (every epic links them), nor by `guide-changes` itself,
 *   whose phases link every page it gathered
 *
 * - Reads files only, never writes.  The claims of every epic are kept between calls (`CLAIMS`) while no epic page
 *   or part folder changed, and for at most `CLAIMS_MAX_AGE_MS`:  the page server asks on every guide's load.
 * - Node only (`node:fs`):  NOT in the `$/epics` barrel, imported by path:
 *   the page server's routes (`epicRoutes.ts`, docs' `commentsRoutes.ts`), `plan-doc inbox` (`InboxCommands`),
 *   docs' `GuideChanges`.
 ****************/
export class SeeAlso {
  /** the checkout's root:  its `epics/`, `guides/` */
  readonly root: string

  constructor(root: string) {
    this.root = root
  }

  ////////////////
  // ## An epic's See Also
  ////////////////

  /**
   * Epic `name`'s See Also, in its box's order:  the durable doc, then its own pages (details, choices) newest first,
   * then the guides it links, newest first.
   * - each `href` from the epic page's folder (`details/analysis.html`, `../../guides/x.html`)
   * - none for an epic with no files:  `[]`
   */
  linksOf(name: string): SeeAlsoLink[] {
    const epic = join(this.root, EPICS, name)
    if (!existsSync(epic)) return []
    const { durable, guides } = linksIn(this.root, name)
    const page = (path: string, kind: SeeAlsoKind): SeeAlsoLink => {
      const file = join(this.root, path)
      return {
        href: posix.relative(`${EPICS}/${name}`, path),
        title: titleOf(file),
        kind,
        updated: statSync(file).mtime.toISOString()
      }
    }
    const newestFirst = (a: SeeAlsoLink, b: SeeAlsoLink) => b.updated.localeCompare(a.updated)
    const own = detailsPages(this.root, name).map((path) =>
      page(path, existsSync(join(this.root, path.replace(/\.html$/, ".rows.json"))) ? "choices" : "details")
    )
    return [
      ...durable.map((path) => page(path, "durable")),
      ...own.sort(newestFirst),
      ...guides
        .filter((path) => !durable.includes(path))
        .map((path) => page(path, "guide"))
        .sort(newestFirst)
    ]
  }

  ////////////////
  // ## Which epic a page belongs to
  ////////////////

  /**
   * The epic page `page` (from the checkout's root:  `guides/python-target.html`) belongs to;  `undefined` for none.
   * - the rules:  this class's banner
   */
  ownerOf(page: string): string | undefined {
    const path = posix.normalize(page.split(sep).join("/"))
    const own = OWN_PAGE.exec(path)
    if (own) return existsSync(join(this.root, EPICS, own[1]!)) ? own[1] : undefined
    return this.claims().get(path)?.[0]?.epic
  }

  /**
   * Every page epic `name` owns that may take comments, from the checkout's root:
   * its `details/` pages, and every page whose owner it is (`ownerOf()`).
   */
  ownedBy(name: string): string[] {
    const owned = [...this.claims()]
      .filter(([, claims]) => claims[0]?.epic === name)
      .map(([path]) => path)
      .sort()
    return [...detailsPages(this.root, name), ...owned]
  }

  /**
   * Every page some epic's See Also claims, with its claims best first (the banner's order).
   * - kept in `CLAIMS` while the epics' files are as they were (`stampOf()`), for at most `CLAIMS_MAX_AGE_MS`
   */
  private claims(): Map<string, Claim[]> {
    const names = epicNames(this.root)
    const stamp = stampOf(this.root, names)
    const kept = CLAIMS.get(this.root)
    if (kept && kept.stamp === stamp && Date.now() - kept.at < CLAIMS_MAX_AGE_MS) return kept.claims
    const claims = new Map<string, Claim[]>()
    for (const name of names) {
      if (name === GUIDE_CHANGES) continue
      const facts = factsOf(this.root, name)
      if (!facts) continue
      const { durable, guides } = linksIn(this.root, name)
      for (const path of new Set([...durable, ...guides])) {
        if (NEVER_CLAIMED.test(path)) continue
        const claim = { epic: name, durable: durable.includes(path), ...facts }
        claims.set(path, [...(claims.get(path) ?? []), claim])
      }
    }
    for (const list of claims.values()) list.sort(byClaim)
    CLAIMS.set(this.root, { stamp, at: Date.now(), claims })
    return claims
  }
}

////////////////
// ## Types
////////////////

/** What a See Also entry is to its epic:  its durable doc, a guide it links, or one of its own pages. */
export type SeeAlsoKind = "durable" | "guide" | "details" | "choices"

/** One page in an epic's See Also, as `GET /api/epics/pages` lists it (`<epic-page>`'s `SeeAlsoLink`). */
export type SeeAlsoLink = {
  /** from the epic page's folder:  `details/analysis.html`, `../../guides/python-target.html` */
  href: string
  /** its `<title>` (without a site suffix), else its file's name */
  title: string
  kind: SeeAlsoKind
  /** when it last changed, ISO */
  updated: string
}

/** An epic's claim on a page:  why (`durable`), and the facts that rank it (`byClaim()`). */
type Claim = { epic: string; durable: boolean } & EpicFacts

/** What ranks an epic's claims:  is it open, and when was it updated. */
type EpicFacts = {
  /** phases left, none yet, or standing */
  open: boolean
  /** `<epic-page updated>`, `YYYY-MM-DD`;  `""` without one */
  updated: string
  /** its epic page's file time, ms:  the tie-break within a day */
  touched: number
}

////////////////
// ## Constants
////////////////

/** The epics' folder, from the checkout's root. */
const EPICS = "epics"

/** A page in an epic's own folder (not its plan doc, nor its parts):  `epics/<name>/details/x.html`. */
const OWN_PAGE = /^epics\/([^/]+)\/details\/[^/]+\.html$/

/** A phase's part file, whose links count toward the See Also (J94):  `p3.html`. */
const PHASE_PART = /^p\d+\.html$/

/** A docs page a See Also lists as a guide:  any `.html` under `guides/`. */
const GUIDE = /^guides\/.+\.html$/

/** Pages every epic links, so none owns:  the changelog, and a folder's index. */
const NEVER_CLAIMED = /^guides\/(?:changelog|(?:[^/]+\/)*index)\.html$/

/** How long the claims are kept, at most, ms:  a part edited in place leaves its folder's time as it was. */
const CLAIMS_MAX_AGE_MS = 30_000

/** Every checkout's claims, as last gathered:  by root. */
const CLAIMS = new Map<string, { stamp: string; at: number; claims: Map<string, Claim[]> }>()

////////////////
// ## Helpers
////////////////

/** Claims, best first:  a durable doc's epic, then an open one, then the one updated last. */
function byClaim(a: Claim, b: Claim): number {
  return (
    Number(b.durable) - Number(a.durable) ||
    Number(b.open) - Number(a.open) ||
    b.updated.localeCompare(a.updated) ||
    b.touched - a.touched
  )
}

/** Every epic's folder name in checkout `root`, sorted;  none without `epics/`. */
function epicNames(root: string): string[] {
  const folder = join(root, EPICS)
  if (!existsSync(folder)) return []
  return readdirSync(folder, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith(".") && (entry.isDirectory() || entry.isSymbolicLink()))
    .map((entry) => entry.name)
    .filter((name) => existsSync(planDocOf(root, name)))
    .sort()
}

/** Epic `name`'s plan doc file. */
function planDocOf(root: string, name: string): string {
  return join(root, EPICS, name, `${name}.plan.html`)
}

/**
 * What changes when an epic's links might:  each plan doc's time, and its `parts/` folder's (a part written through
 * the tool is renamed into it, which changes the folder's time).
 */
function stampOf(root: string, names: string[]): string {
  const time = (file: string) => statSync(file, { throwIfNoEntry: false })?.mtimeMs ?? 0
  return names
    .map((name) => `${name}:${time(planDocOf(root, name))}:${time(join(root, EPICS, name, "parts"))}`)
    .join(";")
}

/** Epic `name`'s facts, from its plan doc's markup:  open or done, when updated;  `undefined` without a plan doc. */
function factsOf(root: string, name: string): EpicFacts | undefined {
  const file = planDocOf(root, name)
  if (!existsSync(file)) return undefined
  const html = readFileSync(file, "utf8")
  const page = /<epic-page\b[^>]*>/.exec(html)?.[0] ?? ""
  const phases = Array.from(html.matchAll(/<epic-phase\b[^>]*>/g), ([tag]) => /\sstatus="([^"]*)"/.exec(tag)?.[1])
  const standing = /\sstanding(?:[\s=>]|$)/.test(page)
  return {
    open: standing || !phases.length || phases.some((status) => status !== "done"),
    updated: /\supdated="([^"]*)"/.exec(page)?.[1] ?? "",
    touched: statSync(file).mtimeMs
  }
}

/**
 * The pages epic `name`'s files link to, as checkout paths:
 * - `durable`:  its epic page's `<a slot="durable" href>`
 * - `guides`:  every page under `guides/` its phases' part files (`parts/p<N>.html`) link to, once each, sorted;
 *   an item's part, the Overview's or the summary's links never count (J94)
 * - each `href` read from its own file's folder (a part's from `parts/`);  a page that isn't there is left out
 */
function linksIn(root: string, name: string): { durable: string[]; guides: string[] } {
  const folder = join(root, EPICS, name)
  const doc = planDocOf(root, name)
  const parts = join(folder, "parts")
  const files = [
    ...(existsSync(doc) ? [doc] : []),
    ...(existsSync(parts) ? readdirSync(parts).filter((file) => PHASE_PART.test(file)) : []).map((file) =>
      join(parts, file)
    )
  ]
  const durable = new Set<string>()
  const guides = new Set<string>()
  for (const file of files) {
    const html = readFileSync(file, "utf8")
    for (const [tag] of html.matchAll(/<a\b[^>]*>/g)) {
      const href = /\shref="([^"]*)"/.exec(tag)?.[1]
      const path = href && pathOf(root, file, href)
      if (!path || !existsSync(join(root, path))) continue
      if (file === doc) {
        if (/\sslot="durable"/.test(tag)) durable.add(path)
      } else if (GUIDE.test(path)) guides.add(path)
    }
  }
  return { durable: [...durable], guides: [...guides].sort() }
}

/**
 * Link `href`, written in `file`, as a checkout path (`guides/x.html`);  `undefined` for a link within the page, to
 * another site, or out of the checkout.
 */
function pathOf(root: string, file: string, href: string): string | undefined {
  const bare = href.replace(/[?#].*$/, "")
  if (!bare || /^[a-z][\w+.-]*:/i.test(bare) || bare.startsWith("/")) return undefined
  let decoded: string
  try {
    decoded = decodeURI(bare)
  } catch {
    return undefined
  }
  const path = relative(root, resolve(dirname(file), decoded))
    .split(sep)
    .join("/")
  return path.startsWith("..") ? undefined : path
}

/** Epic `name`'s own pages, from the checkout's root:  every `.html` in its `details/` folder, sorted. */
function detailsPages(root: string, name: string): string[] {
  const folder = join(root, EPICS, name, "details")
  if (!existsSync(folder)) return []
  return readdirSync(folder)
    .filter((file) => file.endsWith(".html"))
    .sort()
    .map((file) => `${EPICS}/${name}/details/${file}`)
}

/** Page `file`'s `<title>`, without a site suffix (` · Spell docs`);  its file name when it has none. */
function titleOf(file: string): string {
  const title = /<title>([^<]*)<\/title>/i
    .exec(readFileSync(file, "utf8"))?.[1]
    ?.split(/\s+[·|—–]\s+/)[0]
    ?.replace(/&amp;/g, "&")
    .trim()
  return title || file.replace(/^.*\/|\.html$/g, "")
}
