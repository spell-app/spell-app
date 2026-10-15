import { EpicAddress } from "./EpicAddress"
import type { Landing, PagePhase } from "./links.types"

/****************
 * ### `PageTargets`
 * What a link can land on in ONE page:  its ids, their titles, its phases in order.
 * - Reads any DOM:  the browser's (`<epic-link>`, on the page it's in) or linkedom's (the epic tool and the page
 *   server, on a page they read from disk).
 * - An id held by a part not loaded yet (`<epic-section source part-ids="...">`) counts as there:  the page loads
 *   the part on the way (the docs runtime's landing).
 * - Node-safe at import:  it touches only the DOM it's given.
 ****************/
export class PageTargets {
  /** the page's document, or whatever holds its markup */
  readonly root: ParentNode

  constructor(root: ParentNode) {
    this.root = root
  }

  /**
   * Where `address`'s phase or item lands on this page;  `undefined` when it isn't there.
   * - an address with no id:  `undefined` too (it's the page itself)
   */
  find(address: EpicAddress): Landing | undefined {
    if (address.phase) {
      const found = EpicAddress.findPhase(this.phases, address.phase)
      return found && { id: found.phase.id, title: found.phase.title, number: found.number }
    }
    const id = address.id
    if (!id) return undefined
    const element = this.byId(id) ?? this.byId(address.item ?? id)
    if (element) return { id: element.id, title: PageTargets.titleOf(element) || undefined, ...this.numberOf(element) }
    const host = this.hostHolding(id)
    return host ? { id } : undefined
  }

  /** The page's phases, in page order:  each `<epic-phase>`'s id and title. */
  get phases(): PagePhase[] {
    return Array.from(this.root.querySelectorAll(PHASE), (phase) => ({
      id: phase.id,
      title: PageTargets.titleOf(phase)
    }))
  }

  /** The saga the page's epic names (`<epic-page saga>`);  `undefined` for none, or no epic page. */
  get saga(): string | undefined {
    return this.root.querySelector(PAGE)?.getAttribute("saga") ?? undefined
  }

  /** The element with id `id`, if any. */
  private byId(id: string): Element | null {
    return this.root.querySelector(`[id="${id.replace(/"/g, "")}"]`)
  }

  /** A part host that will load `id` with its part, if any. */
  private hostHolding(id: string): Element | undefined {
    return Array.from(this.root.querySelectorAll(PART_HOSTS)).find((host) =>
      (host.getAttribute("part-ids") ?? host.getAttribute("data-part-ids") ?? "").split(/\s+/).includes(id)
    )
  }

  /** A phase's number (its place among the page's phases), for an element that is one. */
  private numberOf(element: Element): { number?: number } {
    if (element.localName !== PHASE) return {}
    const index = Array.from(this.root.querySelectorAll(PHASE)).indexOf(element)
    return index >= 0 ? { number: index + 1 } : {}
  }

  /**
   * The checkout's root of the page `document` is (a URL ending `/`), from its address and what it loads:
   * `EpicAddress.rootUrl()`;  `undefined` when neither says.
   * - its assets:  each `<ui-components source>` (the epics pack) and `<script src>` (the docs bundle), resolved
   */
  static rootUrlOf(document: Document): string | undefined {
    const assets = Array.from(document.querySelectorAll("ui-components[source], script[src]"), (asset) => {
      const path = asset.getAttribute("source") ?? asset.getAttribute("src") ?? ""
      return new URL(path, document.baseURI).href
    })
    return EpicAddress.rootUrl(document.URL, assets)
  }

  /**
   * `element`'s title, as text:  its `slot="title"` child's text, else `title`, else `header` (a `<ui-section>`),
   * else `""`;  white space collapsed.
   */
  static titleOf(element: Element): string {
    const slotted = Array.from(element.children).find((child) => child.getAttribute("slot") === "title")?.textContent
    return (slotted ?? element.getAttribute("title") ?? element.getAttribute("header") ?? "")
      .replace(/\s+/g, " ")
      .trim()
  }
}

/** A phase. */
const PHASE = "epic-phase"

/** An epic page's root element, whose `saga` names its saga. */
const PAGE = "epic-page"

/** Elements whose body is a part file, loaded when opened, listing the ids the part holds. */
const PART_HOSTS = "[source][part-ids], [source][data-part-ids]"
