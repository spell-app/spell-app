import { OVERVIEW_PART_ID, type EpicData } from "$/epics/definitions"
import { PlanMarkup } from "$/epics/tool/PlanMarkup"

import { BODY_DATA, Chrome, COMMIT_URL, Old, PACK_SOURCE } from "./convert.types"

import type { Converter } from "./Converter"

/****************
 * ### `PageConverter`
 * The page and its Overview, for `Converter`:  `<body>`'s data, the h1 and the meta lines become `<epic-page>`'s
 * attributes;  the Overview, `<epic-overview>` with its summary and kickoff prompt slotted;  its sub-sections,
 * `<epic-section kind="overview-part">`;  the body goes inside `<ui-root>`, which loads the pack.
 * - Dropped, as chrome `<epic-page>` draws:  the sticky h1 and step label, the meta lines (the durable doc's link
 *   is kept, slotted), the `Plan hung?` and future-epic notices.
 * - Works on its owner's document, IN PLACE.
 ****************/
export class PageConverter {
  /** The converter it works for:  STATIC for its life. */
  readonly owner: Converter

  constructor(owner: Converter) {
    this.owner = owner
  }

  /** The working document. */
  get document(): Document {
    return this.owner.document
  }

  /**
   * `<epic-page>`, made from the page's header, meta lines and `<body>` data, put in `main` where its first section
   * was;  the header, meta lines and notices go.
   */
  convert(main: Element): Element {
    const body = this.document.body
    const meta = main.querySelector(`:scope > ${Old.meta}`)
    const data: EpicData<"epic-page"> = {
      epic: body.getAttribute("data-plan") || this.owner.name,
      title: this.title(main),
      ...this.metaData(meta),
      repo: this.repo()
    }
    for (const [name, key] of Object.entries(BODY_DATA)) {
      if (key === "epic" || !body.hasAttribute(name)) continue
      const value = body.getAttribute(name)!
      Object.assign(data, { [key]: key === "future" ? true : value })
    }
    for (const name of Object.keys(BODY_DATA)) body.removeAttribute(name)
    const durable = meta?.querySelector(':scope > ui-item[icon="book"] a')
    if (durable) durable.setAttribute("slot", "durable")
    const page = this.owner.element("epic-page", data, durable ? [durable] : [], main)
    const first = main.querySelector(":scope > ui-section")
    if (first) first.before(page)
    else main.append(page)
    for (const chrome of main.querySelectorAll(`:scope > :is(${Old.header}, ${Old.meta})`)) chrome.remove()
    for (const notice of main.querySelectorAll(`:scope > :is(${Old.hung}, ${Old.future})`)) {
      this.owner.note(
        `the \`${notice.matches(Old.hung) ? "Plan hung?" : "future epic"}\` notice:  drawn by <epic-page>`
      )
      notice.remove()
    }
    return page
  }

  /** `<ui-root>` around the body's content (not its scripts), the pack's `<ui-components>` first. */
  wrapBody(): void {
    const body = this.document.body
    const root = this.document.createElement("ui-root")
    const components = this.document.createElement("ui-components")
    components.setAttribute("source", PACK_SOURCE)
    const content = Array.from(body.childNodes).filter(
      (node) => !(PlanMarkup.isElement(node) && node.localName === "script")
    )
    const script = body.querySelector(":scope > script")
    if (script) script.before(root)
    else body.append(root)
    root.append(components, ...content.filter((node) => !PlanMarkup.isBlank(node)))
  }

  ////////////////
  // ## The Overview
  ////////////////

  /**
   * `<epic-overview>` from `section` (`#overview`):  its summary (`<p slot="summary">`), kickoff prompt
   * (`<blockquote slot="prompt">`), estimate (an attribute), older prose, then its sub-sections.
   * - prose after a sub-section moves to the end of that sub-section:  the content model puts prose first
   */
  overview(section: Element): Element {
    const flow: Node[] = []
    const parts: Element[] = []
    const slotted: Element[] = []
    let estimate: string | undefined
    for (const child of PlanMarkup.takeChildren(section)) {
      if (PlanMarkup.isBlank(child) || (PlanMarkup.isElement(child) && child.matches("ui-icon[slot='icon']"))) continue
      if (
        PlanMarkup.isElement(child) &&
        child.matches(Old.summary) &&
        !slotted.some((it) => it.getAttribute("slot") === "summary")
      ) {
        slotted.push(PlanMarkup.wrap(child, "p", PlanMarkup.takeChildren(child), { slot: "summary" }))
      } else if (PlanMarkup.isElement(child) && child.matches(`${Old.promptPanel}, ${Old.prompt}`)) {
        slotted.push(this.prompt(child, flow))
      } else if (PlanMarkup.isElement(child) && child.matches(Old.estimate)) estimate = this.estimate(child)
      else if (PlanMarkup.isElement(child) && child.localName === "ui-section") parts.push(this.part(child))
      else if (parts.length) {
        parts.at(-1)!.append(child)
        this.owner.note(`overview:  prose after #${parts.at(-1)!.id} moved to its end`)
      } else flow.push(child)
    }
    return this.owner.element("epic-overview", { id: "overview", estimate }, [...slotted, ...flow, ...parts], section)
  }

  /** `<epic-section kind="overview-part">` from an Overview sub-section:  its title without its number. */
  private part(section: Element): Element {
    const id = section.id
    if (!OVERVIEW_PART_ID.test(id)) throw this.owner.error("an Overview sub-section's id isn't `o<N>`", section)
    const header = section.querySelector(":scope > span[slot='header']")
    let title: { title?: string; slot?: Element } = {}
    if (header) {
      header.remove()
      PlanMarkup.stripEdges(header, { first: Chrome.partNumber })
      title = PlanMarkup.titleOf(header)
    } else {
      const text = PlanMarkup.squeeze((section.getAttribute("header") ?? "").replace(Chrome.partNumber, ""))
      if (text) title = { title: text }
    }
    const body = PlanMarkup.takeChildren(section).filter(
      (node) => !(PlanMarkup.isElement(node) && node.matches("ui-icon[slot='icon']"))
    )
    const children = title.slot ? [title.slot, ...body] : body
    return this.owner.element("epic-section", { id, kind: "overview-part", title: title.title }, children, section)
  }

  /**
   * `<blockquote slot="prompt">` from the folded Kickoff prompt (or a bare `blockquote.plan-prompt`):  the quote's
   * children.  Anything else in the panel goes to `flow`.
   */
  private prompt(element: Element, flow: Node[]): Element {
    const quote = element.matches(Old.prompt) ? element : element.querySelector(Old.prompt)
    const slot = PlanMarkup.wrap(element, "blockquote", quote ? PlanMarkup.takeChildren(quote) : [], { slot: "prompt" })
    if (quote !== element) {
      quote?.remove()
      const rest = element.querySelector(":scope > ui-content")
      const left = rest ? PlanMarkup.takeChildren(rest) : []
      if (left.some((node) => !PlanMarkup.isBlank(node))) {
        flow.push(...left)
        this.owner.note("overview:  more than the quote in the Kickoff prompt panel:  kept as prose")
      }
    }
    return slot
  }

  /** The total estimate's text, from `p.plan-estimate` (`<b>Estimate:</b>  4h in all`):  without its label. */
  private estimate(paragraph: Element): string | undefined {
    const label = paragraph.querySelector(":scope > b:first-child")
    if (label?.textContent?.trim() === "Estimate:") label.remove()
    return PlanMarkup.squeeze(paragraph.textContent ?? "") || undefined
  }

  ////////////////
  // ## The page's data
  ////////////////

  /** The epic's title:  the h1's (or `<title>`'s), without `Epic: `. */
  private title(main: Element): string {
    const text = main.querySelector(Old.title)?.textContent ?? this.document.title
    const title = PlanMarkup.squeeze(text.replace(Chrome.titlePrefix, ""))
    if (!title) throw this.owner.error("no title:  neither an h1 nor <title>")
    return title
  }

  /** `branch`, `worktree`, `started` and `updated`, from the meta lines. */
  private metaData(meta: Element | null): Partial<EpicData<"epic-page">> {
    if (!meta) return {}
    const branchLine = meta.querySelector(':scope > ui-item[icon="code branch"]')
    const branch = /\bbranch\b/.test(branchLine?.textContent ?? "")
      ? PlanMarkup.squeeze(branchLine!.querySelectorAll("code")[1]?.textContent ?? "")
      : ""
    const folderLine = meta.querySelector(':scope > ui-item[icon="folder"]')
    const worktree = PlanMarkup.squeeze(folderLine?.querySelector("code")?.textContent ?? "")
    const started = PlanMarkup.squeeze(meta.querySelector("#plan-started")?.textContent ?? "")
    const updated = PlanMarkup.squeeze(meta.querySelector("#plan-updated")?.textContent ?? "")
    for (const line of meta.querySelectorAll(":scope > ui-item")) {
      if (!KNOWN_META.includes(line.getAttribute("icon") ?? "")) {
        throw this.owner.error("a meta line <epic-page> doesn't draw", line)
      }
    }
    return {
      ...(branch && { branch }),
      ...(worktree && { worktree }),
      ...(started && { started }),
      ...(updated && { updated })
    }
  }

  /**
   * The repo the commit links point at (`https://github.com/spell-app/spell-app`):  `<epic-page repo>`, so each
   * `<epic-commit sha>` draws its link.  None when no commit links (or they disagree:  noted).
   */
  private repo(): string | undefined {
    const repos = new Set<string>()
    for (const link of this.document.querySelectorAll(`a${Old.commitLink}[href]`)) {
      const match = COMMIT_URL.exec(link.getAttribute("href")!)
      if (match) repos.add(match[1]!)
    }
    if (repos.size > 1) this.owner.note(`commit links point at ${repos.size} repos:  ${[...repos].join(", ")}`)
    return repos.size === 1 ? [...repos][0] : undefined
  }
}

/** The meta lines `<epic-page>` draws, by icon:  branch, worktree, dates, durable doc. */
const KNOWN_META = ["code branch", "folder", "calendar", "book"]
