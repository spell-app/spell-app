import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { dirname, join } from "node:path"

import { parseHTML } from "linkedom"

import { EpicAddress, PageTargets, SAGA_SCHEME, type Landing, type TargetAnswer } from "$/epics/links"

import { Sagas } from "./Sagas"

/****************
 * ### `EpicTargets`
 * What a link to a saga, an epic, a phase or an item finds in ONE checkout (epic `epic-workflow` P15):  the page, the
 * id on it, its title, and what's broken.
 * - Used by the page server (`GET /api/epics/target` and `/saga/...`, `linkRoutes.ts`), the link check (`epic check`,
 *   `doc-links.js --check`:  `problemsIn()`) and the openers (`spell dev docs open | link SAGA:/...`).
 * - Broken:  a saga not in `sagas/sagas.json5`, a page that isn't there, an id not on its page, and an epic under a
 *   saga it doesn't name (its `<epic-page saga>`).  The last still LINKS:  only the check minds.
 * - Reads pages from disk with linkedom;  each kept while its file is unchanged (by mtime), so a page server asking
 *   for twenty links on a page reads each page once.
 * - Node only (`node:fs`):  never in a barrel.
 ****************/
export class EpicTargets {
  /** the checkout's root */
  readonly root: string

  /** the sagas' list */
  readonly sagas: Sagas

  /** pages read, by file:  their mtime, and what they hold */
  private read = new Map<string, { mtime: number; targets: PageTargets; title: string }>()

  constructor(root: string) {
    this.root = root
    this.sagas = new Sagas(root)
  }

  /**
   * What `address` finds, from the page `from` (from the checkout's root) whose markup is `html` (default:  read
   * from disk;  `epic check` passes the whole doc, parts in).
   * - `href`:  from the root, `#id` kept (`epics/seo/seo.plan.html#j3`);  on the page it's in, `<page>#id`
   * - `problem`:  why it's broken, in a few words;  `undefined` when it isn't
   * - NEVER throws:  a page that won't read is a problem
   */
  resolve(address: EpicAddress, { from, html }: { from?: string; html?: string } = {}): ResolvedTarget {
    const samePage = !address.page || address.page === from
    const page = address.page ?? from
    const problems: string[] = []
    if (address.saga && !this.sagas.find(address.saga)) problems.push(`no saga "${address.saga}" in sagas/sagas.json5`)
    let read: { targets: PageTargets; title: string } | undefined
    if (samePage && html !== undefined) read = this.parse(html)
    else if (page && existsSync(join(this.root, page))) read = this.pageAt(page)
    else if (page)
      problems.push(
        address.epic || !address.saga ? `no page ${page}` : `saga ${address.saga} has no page yet (${page})`
      )
    else problems.push("no page:  a link with no saga or epic must be on the page it points into")
    if (read && address.epic && address.saga) {
      const named = read.targets.saga
      if (named !== address.saga)
        problems.push(
          named
            ? `epic ${address.epic} names saga "${named}", not "${address.saga}"`
            : `epic ${address.epic} names no saga`
        )
    }
    let landing: Landing | undefined
    if (read && address.hasId) {
      landing = read.targets.find(address) ?? (page ? this.inParts(page, address.id!) : undefined)
      if (!landing) problems.push(`no ${address.phase ? `phase "${address.phase}"` : `#${address.id}`} on ${page}`)
    }
    const id = landing?.id ?? address.id
    return {
      href: `${page ?? ""}${id ? `#${id}` : ""}`,
      title: landing?.title ?? read?.title,
      label: address.labelFor({ samePage, landing }),
      // the saga's words are the check's business:  the page and the id are what a click needs
      found: !!read && (!address.hasId || !!landing),
      ...(problems.length && { problem: problems.join(";  ") })
    }
  }

  /**
   * Every short-address link (`<a href="SAGA:/...">`) and `<epic-link>` in `html`, a page at `from` (from the
   * checkout's root), that's broken:  one line each, `broken link:  <the link> -- <why>`.
   * - `<pre>` and `<script>` blocks are skipped (as `Linker.check()` skips `<pre>`):  examples, not links
   */
  problemsIn(html: string, from?: string): string[] {
    const body = html.replace(PRE, "")
    const problems: string[] = []
    const report = (written: string, make: () => EpicAddress) => {
      let address: EpicAddress
      try {
        address = make()
      } catch (error) {
        problems.push(`broken link:  ${written} -- ${(error as Error).message}`)
        return
      }
      const { problem } = this.resolve(address, { from, html })
      if (problem) problems.push(`broken link:  ${written} -- ${problem}`)
    }
    for (const match of body.matchAll(A_HREF)) {
      const href = decodeEntities(match[1])
      if (SAGA_SCHEME.test(href)) report(href, () => EpicAddress.parse(href))
    }
    for (const match of body.matchAll(EPIC_LINK)) {
      const attributes = Object.fromEntries(
        Array.from(match[1].matchAll(ATTRIBUTE), ([, name, value]) => [name, decodeEntities(value ?? "")])
      ) as Record<string, string>
      const { saga, epic, item, phase } = attributes
      report(match[0], () => new EpicAddress({ saga, epic, item, phase }))
    }
    return problems
  }

  /**
   * An answer for the page server (`TargetAnswer`):  `resolve()`'s, without the problem's words.
   */
  answerFor(address: EpicAddress): TargetAnswer {
    const { href, title, label, found } = this.resolve(address)
    return { href, ...(title && { title }), label, found }
  }

  ////////////////
  // ## Reading pages
  ////////////////

  /** The page at `page` (from the root), read once while unchanged. */
  private pageAt(page: string): { targets: PageTargets; title: string } | undefined {
    const file = join(this.root, page)
    try {
      const mtime = statSync(file).mtimeMs
      const kept = this.read.get(file)
      if (kept?.mtime === mtime) return kept
      const read = { mtime, ...this.parse(readFileSync(file, "utf8")) }
      this.read.set(file, read)
      return read
    } catch {
      return undefined
    }
  }

  /** `html`'s targets and its title (`<title>`);  the last one kept, as `problemsIn()` asks for one page per link. */
  private parse(html: string): { targets: PageTargets; title: string } {
    if (this.parsed?.html !== html) {
      const { document } = parseHTML(html)
      const title = document.querySelector("title")?.textContent?.trim() ?? ""
      this.parsed = { html, targets: new PageTargets(document), title }
    }
    return this.parsed
  }

  /** the last markup `parse()` read, and what it holds */
  private parsed?: { html: string; targets: PageTargets; title: string }

  /**
   * `id` in one of the page's part files (`parts/*.html` beside it), for a page whose skeleton doesn't list what its
   * parts hold:  an Overview heading, an old answer card.
   */
  private inParts(page: string, id: string): Landing | undefined {
    const dir = join(this.root, dirname(page), "parts")
    if (!existsSync(dir)) return undefined
    const wanted = new RegExp(`\\bid="${id}"`, "i")
    for (const name of readdirSync(dir))
      if (name.endsWith(".html") && wanted.test(readFileSync(join(dir, name), "utf8"))) return { id }
    return undefined
  }
}

/** What `EpicTargets.resolve()` finds:  the page server's answer, plus why it's broken. */
export type ResolvedTarget = TargetAnswer & {
  /** why it's broken, in a few words;  absent when it isn't */
  problem?: string
}

/** A `<pre>` or `<script>` block (a `<ui-code>`'s `text/plain` source):  examples, never checked. */
const PRE = /<(pre|script)[\s>][\s\S]*?<\/\1>/gi

/** An `<a>` with an `href`:  `[1]` the href, as written. */
const A_HREF = /<a\s[^>]*?href="([^"]*)"/gi

/** An `<epic-link>` start tag:  `[1]` its attributes. */
const EPIC_LINK = /<epic-link\b([^>]*)>/gi

/** One attribute:  `[1]` its name, `[2]` its value. */
const ATTRIBUTE = /([a-z-]+)(?:="([^"]*)")?/gi

/** `text` with the entities a page's attributes use decoded. */
function decodeEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
}
