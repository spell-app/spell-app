import { Show } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { EpicAddress, PageTargets, TARGET_API, type Landing, type TargetAnswer } from "$/epics/links"

import { epicLinkVocabulary } from "./EpicLink.en"

import linkCSS from "./EpicLink.css?inline"

/****************
 * ### `<epic-link>`
 * A link to a saga, an epic, a phase or an item, written by what it points at (epic `epic-workflow` P15, J32):
 * `<epic-link epic="seo" item="J3">`, or `<epic-link item="T3">` for one on the page it's in.
 * - Its address (`EpicAddress`) says the page and the `#id`;  the link is from the checkout's root
 *   (`EpicAddress.rootUrl()`:  the server's address, or where the page's pack was loaded from on `file://`).
 * - On the page it points into:  a `#id` link, which the docs runtime lands on as any (unfolding, opening the item);
 *   its title and a phase's number read from the page itself (`PageTargets`).
 * - Another page:  that page's address and `#id`;  the page server says the title, the short form and whether it's
 *   there (`GET /api/epics/target`).  From `file://`:  the short form as written, no tooltip.
 * - No text inside:  draws the short form (`seo J3`, `T3`, `P7 · Epic Migrate`).
 * - Broken (no such page or id):  `:state(broken)`, struck through, saying so in its tooltip.
 ****************/
export class EpicLink extends E.UIComponent<typeof epicLinkVocabulary> {
  @E.proto static vocabulary = epicLinkVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "epic-link": linkCSS }
  } satisfies Partial<E.ElementSetup>

  /** What the page server said of it (another page only);  `undefined` until it has. */
  @E.state accessor answer: TargetAnswer | undefined = undefined

  /** Where it points;  `undefined` for attributes that make no address (a bad name, an item AND a phase). */
  get address(): EpicAddress | undefined {
    try {
      return new EpicAddress({ saga: this.saga, epic: this.epic, item: this.item, phase: this.phase })
    } catch {
      return undefined
    }
  }

  /** The checkout's root, as a URL ending `/`;  `undefined` when the page doesn't say. */
  get rootUrl(): string | undefined {
    return isServer ? undefined : PageTargets.rootUrlOf(document)
  }

  /** Whether it points into the page it's on:  no saga or epic, or that page's own. */
  get isSamePage(): boolean {
    const page = this.address?.page
    if (!page) return true
    const root = this.rootUrl
    return !!root && !isServer && EpicAddress.pageOf(location.href, root) === page
  }

  /** On the page it points into:  where it lands there;  `undefined` elsewhere, or when it isn't there. */
  get landing(): Landing | undefined {
    const address = this.address
    if (isServer || !address?.hasId || !this.isSamePage) return undefined
    return new PageTargets(document).find(address)
  }

  /** Where a click goes;  `undefined`:  nowhere (no address, or no root to build it from). */
  get href(): string | undefined {
    const address = this.address
    if (!address) return undefined
    if (this.isSamePage) return address.hrefFrom("", this.landing?.id)
    const root = this.rootUrl
    if (!root) return undefined
    // the server read the page:  its id for a phase written by name;  else the best guess
    const id = this.answer?.href.split("#")[1] ?? address.id
    return address.hrefFrom(root, id)
  }

  /** The tab another page opens in:  the epic's (as every link to an epic page), or the saga page's. */
  get linkTarget(): string | undefined {
    const address = this.address
    if (!address || this.isSamePage) return undefined
    return address.epic ?? `saga-${address.saga}`
  }

  /** The short form, drawn when it holds no text. */
  get label(): string {
    const address = this.address
    if (!address) return [this.saga, this.epic, this.item ?? this.phase].filter(Boolean).join(" ")
    if (!this.isSamePage && this.answer) return this.answer.label
    return address.labelFor({ samePage: this.isSamePage, landing: this.landing })
  }

  /** What it points at, not found:  on its page, a missing id;  elsewhere, as the server said. */
  @E.cssState("broken")
  get broken(): boolean {
    const address = this.address
    if (!address) return true
    if (this.isSamePage) return address.hasId && !this.landing
    return this.answer?.found === false
  }

  /** Its tooltip:  the target's title, or why it's broken. */
  get tooltip(): string | undefined {
    if (this.broken) return this.translationForKey("broken", { target: this.address?.toString() ?? this.label })
    return this.isSamePage ? this.landing?.title : this.answer?.title
  }

  /** Ask the page server about another page's target as it connects. */
  @E.whileConnected
  protected followTarget() {
    if (isServer || !/^https?:$/.test(location.protocol)) return undefined
    const address = this.address
    if (!address || this.isSamePage) return undefined
    void this.loadAnswer(address)
    return undefined
  }

  /** Ask the page server what `address` points at;  no server, or no route:  no answer (the short form stands). */
  @E.untracked
  private async loadAnswer(address: EpicAddress) {
    const query = new URLSearchParams(
      Object.entries({ saga: address.saga, epic: address.epic, item: address.item, phase: address.phase }).filter(
        (entry): entry is [string, string] => !!entry[1]
      )
    )
    try {
      const answer = await fetch(`${TARGET_API}?${query}`)
      if (answer.ok) this.answer = (await answer.json()) as TargetAnswer
    } catch {
      // no page server:  the short form, no tooltip
    }
  }

  render(): JSX.Element {
    return (
      <Show
        when={this.href}
        fallback={
          <span class={this.rootClass} part={this.partForName("base")} title={this.tooltip}>
            <slot>{this.label}</slot>
          </span>
        }
      >
        <a
          class={this.rootClass}
          part={this.partForName("base")}
          href={this.href}
          target={this.linkTarget}
          title={this.tooltip}
        >
          <slot>{this.label}</slot>
        </a>
      </Show>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicLink extends E.AttributeValues<typeof epicLinkVocabulary> {}
