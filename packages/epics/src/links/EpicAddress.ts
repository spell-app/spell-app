import {
  LINK_ID,
  LINK_NAME,
  ROOT_ASSETS,
  SAGA_ADDRESS,
  SAGA_PATH,
  SAGA_PREFIX,
  SAGA_SCHEME,
  WORKTREE_PREFIX,
  type Landing,
  type LinkTarget,
  type PagePhase
} from "./links.types"

/****************
 * ### `EpicAddress`
 * Where a link points:  a saga page, an epic page, or an item or phase on one (epic `epic-workflow` P15, J32).
 * - Made from a short address Owen types (`parse("SAGA:/drawable-spell/python-target#T1")`), or from
 *   `<epic-link>`'s attributes (`new EpicAddress({ epic: "seo", item: "J3" })`).
 * - Says which page that is (`page`, from the checkout's root), the `#id` to land on, and the short form a link draws
 *   (`labelFor()`).
 * - Whether the page and the id are THERE is not its business:  the page knows (`PageTargets`), and so does the
 *   epic tool (`EpicTargets`, node only).
 * - Pure:  no DOM, no files.  The elements, the docs runtime and the node tools all import it (`$/epics/links`).
 ****************/
export class EpicAddress {
  /** the saga's id */
  readonly saga: string | undefined
  /** the epic's id */
  readonly epic: string | undefined
  /** an id on the page, as written (`T1`) */
  readonly item: string | undefined
  /** a phase, as written:  `7`, `P7`, `epic-migrate` */
  readonly phase: string | undefined

  /**
   * - throws `TypeError` for a saga or epic that isn't lower-kebab-case, an id that isn't one, or both an item and a
   *   phase
   */
  constructor({ saga, epic, item, phase }: LinkTarget) {
    for (const [name, value] of [
      ["saga", saga],
      ["epic", epic]
    ] as const)
      if (value !== undefined && !LINK_NAME.test(value))
        throw new TypeError(`EpicAddress:  ${name} "${value}" isn't lower-kebab-case, e.g. drawable-spell`)
    if (item !== undefined && !LINK_ID.test(item)) throw new TypeError(`EpicAddress:  "${item}" isn't an id, e.g. T1`)
    if (item !== undefined && phase !== undefined) throw new TypeError("EpicAddress:  an item or a phase, not both")
    if (phase !== undefined && !phase.trim()) throw new TypeError("EpicAddress:  an empty phase")
    this.saga = saga
    this.epic = epic
    this.item = item
    this.phase = phase
  }

  /**
   * Short address `text` as an address:  `SAGA:/<saga>[/<epic>][#<id>]`, or the colon form (`<saga>:<epic>`).
   * - throws `TypeError` when it isn't one
   */
  static parse(text: string): EpicAddress {
    const match = SAGA_ADDRESS.exec(text.trim())
    if (!match) throw new TypeError(`EpicAddress.parse():  "${text}" isn't a short address, e.g. SAGA:/saga/epic#T1`)
    const [, saga, epic, item] = match
    return new EpicAddress({ saga: saga.toLowerCase(), epic: epic?.toLowerCase(), item })
  }

  /** Whether `text` starts as a short address does (`SAGA:/`):  a link the docs runtime and the link check take. */
  static isAddress(text: string): boolean {
    return SAGA_SCHEME.test(text.trim())
  }

  /**
   * The address of the page server's typed path `path`, `/saga/<saga>[/<epic>]` (under `/worktrees/<w>/` too);
   * `undefined` when it isn't one.
   */
  static fromPath(path: string): EpicAddress | undefined {
    const rest = path.replace(WORKTREE_PREFIX, "")
    if (!rest.startsWith(`${SAGA_PATH}/`)) return undefined
    try {
      return EpicAddress.parse(SAGA_PREFIX + rest.slice(SAGA_PATH.length + 1))
    } catch {
      return undefined
    }
  }

  ////////////////
  // ## The page
  ////////////////

  /**
   * The page it points at, from the checkout's root;  `undefined`:  the page the link is in.
   * - an epic:  `epics/<epic>/<epic>.plan.html`, saga or not
   * - a saga alone:  `sagas/<saga>/<saga>.saga.html`
   */
  get page(): string | undefined {
    if (this.epic) return `epics/${this.epic}/${this.epic}.plan.html`
    if (this.saga) return `sagas/${this.saga}/${this.saga}.saga.html`
    return undefined
  }

  /**
   * The id to land on, before the page is read:  the item's, lower-cased (`T1` -> `t1`, as the pages' ids are);
   * a phase's best guess (`phaseIdFor()`);  `undefined` for the page itself.
   * - a page that's been read knows better:  `PageTargets.find()`
   */
  get id(): string | undefined {
    if (this.item) return this.item.toLowerCase()
    if (this.phase) return EpicAddress.phaseIdFor(this.phase)
    return undefined
  }

  /** Whether it points at a phase or an item, not at a page as a whole. */
  get hasId(): boolean {
    return !!(this.item || this.phase)
  }

  /**
   * The link to it from a page whose checkout's root is at `root` (a URL ending `/`), landing on `id`
   * (default:  `this.id`):  `<root>epics/seo/seo.plan.html#j3`;  on the page it's in, `#j3`.
   */
  hrefFrom(root: string, id = this.id): string {
    const hash = id ? `#${id}` : ""
    return this.page ? `${root}${this.page}${hash}` : hash
  }

  /** The page server's typed path for it (`/saga/drawable-spell/python-target`);  `undefined` without a saga. */
  get serverPath(): string | undefined {
    if (!this.saga) return undefined
    return `${SAGA_PATH}/${this.saga}${this.epic ? `/${this.epic}` : ""}`
  }

  /**
   * The short address, as the tools write it:  `SAGA:/drawable-spell/python-target#T1`.
   * - without a saga (an `<epic-link epic>`), its markup instead:  `<epic-link epic="seo" item="J3">`
   */
  toString(): string {
    if (this.saga && !this.phase)
      return `${SAGA_PREFIX}${this.saga}${this.epic ? `/${this.epic}` : ""}${this.item ? `#${this.item.toUpperCase()}` : ""}`
    const attributes = (["saga", "epic", "item", "phase"] as const)
      .filter((name) => this[name] !== undefined)
      .map((name) => ` ${name}="${this[name]}"`)
    return `<epic-link${attributes.join("")}>`
  }

  ////////////////
  // ## Drawing
  ////////////////

  /**
   * The short form a link draws when it holds no text:
   * - an item:  `python-target T1`;  on the page it's in, just `T1`
   * - a phase:  `P7 · Epic Migrate`, from where the page has it (`landing`);  else as written (`P7`, `epic-migrate`)
   * - a page:  its epic's or saga's id
   * - `samePage`:  the link is on the page it points at
   */
  labelFor({ samePage = false, landing }: { samePage?: boolean; landing?: Landing } = {}): string {
    const where = samePage ? "" : (this.epic ?? this.saga ?? "")
    let what = ""
    if (this.item) what = this.item.toUpperCase()
    else if (this.phase) {
      const number = landing?.number ?? EpicAddress.phaseNumber(this.phase)
      const title = landing?.number !== undefined ? landing.title : undefined
      what = number === undefined ? this.phase : `P${number}${title ? ` · ${title}` : ""}`
    }
    return [where, what].filter(Boolean).join(" ") || (this.epic ?? this.saga ?? "")
  }

  ////////////////
  // ## Phases
  ////////////////

  /** A phase written as a number (`7`, `P7`, `p7`):  that number;  else `undefined`. */
  static phaseNumber(phase: string): number | undefined {
    const match = /^p?(\d+)$/i.exec(phase.trim())
    return match ? Number(match[1]) : undefined
  }

  /**
   * A phase's id, best guessed from how it's written, for a page nobody has read (`file://`):
   * - a number:  `p7`, the id phases had before stable ids
   * - a name:  `p-epic-migrate`, its stable id (P15)
   */
  static phaseIdFor(phase: string): string {
    const number = EpicAddress.phaseNumber(phase)
    if (number !== undefined) return `p${number}`
    const slug = EpicAddress.slugOf(phase.replace(/^p-/i, ""))
    return `p-${slug}`
  }

  /**
   * `phase` among a page's `phases` (in page order), with its number (its place, from 1);  `undefined` if none:
   * - a number (`7`, `P7`):  the 7th
   * - else by id:  `phase` as an id (`p-epic-migrate`), or `p-` and its slug (`epic-migrate`, `Epic Migrate`)
   * - else by title:  the phase whose title slugifies to the same
   */
  static findPhase<P extends PagePhase>(phases: readonly P[], phase: string): { phase: P; number: number } | undefined {
    const number = EpicAddress.phaseNumber(phase)
    if (number !== undefined) return phases[number - 1] && { phase: phases[number - 1], number }
    const id = phase.trim().toLowerCase()
    const slug = EpicAddress.slugOf(phase.replace(/^p-/i, ""))
    const index = [
      (each: P) => each.id.toLowerCase() === id || each.id === `p-${slug}`,
      (each: P) => EpicAddress.slugOf(each.title) === slug
    ].reduce((found, test) => (found >= 0 ? found : phases.findIndex(test)), -1)
    return index >= 0 ? { phase: phases[index], number: index + 1 } : undefined
  }

  /** `title` as a slug:  lower case, a hyphen for every run of other characters (`Epic Migrate` -> `epic-migrate`). */
  static slugOf(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  ////////////////
  // ## The checkout's root
  ////////////////

  /**
   * The checkout's root, as a URL ending `/`, for a page at `href` that loads `assets` (absolute URLs);
   * `undefined` when neither says.
   * - served (`http:`):  the origin, under its worktree's prefix (`/worktrees/<w>/`) if any
   * - `file:`:  an asset that is one of `ROOT_ASSETS` (the epics pack, the docs bundle), minus that path
   */
  static rootUrl(href: string, assets: readonly string[]): string | undefined {
    const url = new URL(href)
    if (/^https?:$/.test(url.protocol)) return `${url.origin}${WORKTREE_PREFIX.exec(url.pathname)?.[0] ?? ""}/`
    for (const asset of assets) {
      const clean = asset.replace(/[?#].*$/, "")
      const known = ROOT_ASSETS.find((path) => clean.endsWith(`/${path}`))
      if (known) return clean.slice(0, -known.length)
    }
    return undefined
  }

  /** The page at `href`, from the checkout's `root` (`epics/seo/seo.plan.html`);  `undefined` outside it. */
  static pageOf(href: string, root: string): string | undefined {
    const clean = href.replace(/[?#].*$/, "")
    if (!clean.startsWith(root)) return undefined
    try {
      return decodeURIComponent(clean.slice(root.length))
    } catch {
      return clean.slice(root.length)
    }
  }
}
