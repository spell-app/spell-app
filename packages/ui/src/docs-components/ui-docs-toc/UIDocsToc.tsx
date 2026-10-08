import { For, Show, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { docsTocVocabulary } from "./UIDocsToc.en"
import { TocIndex } from "./TocIndex"
import {
  DEFAULT_SIZE,
  type DocsTocVocabulary,
  type FollowedContent,
  type TocEntry,
  type TocSection
} from "./UIDocsToc.types"

import tocCSS from "./UIDocsToc.css?inline"

/****************
 * ### `UIDocsToc`
 * The component behind `<ui-docs-toc>`:  Fomantic's docs "On this page" menu
 * (`ui vertical following fluid accordion text menu`, in the right rail).
 *
 * - Its shadow DOM:  `<div class="ui [size] toc" part="toc">` holding an optional `<ui-header part="header">`
 *   and ONE `<ui-menu vertical text fluid part="menu">` (the landmark) of section links.
 *   Under the section in view, an item holds a `<ui-menu part="entries">` of its entries' links.
 * - It lists the FOLLOWED content (`for`;  of a `<ui-tabs>`, its shown pane) by `TocIndex.scan()`:
 *   - level 2 headings and top-level `<ui-section>`s are sections;
 *     examples with a `header`, and level 3 headings, are their entries
 *   - what a `<ui-section>` nests (sections, examples, headings) are ITS entries, as deep as it goes,
 *     each level opening on the way to the entry in view
 *   - light DOM only.
 * - It follows the scroll:  the entry whose top passed the reading line (`TocIndex.current()`) is `selected`,
 *   and its section opens;  `ui-change { value }` when that changes.
 * - Links are plain `#id` links:  the browser scrolls (below the document's `scroll-padding-top`).
 *   A hash naming an element in a HIDDEN pane of the followed tabs (a link from elsewhere, or a page opened on it)
 *   shows that pane first, then scrolls to it:  `<ui-tabs history>` ignores hashes that aren't pane values.
 * - It scans again when the tabs show another pane (`ui-show`),
 *   and when the followed content changes (a `MutationObserver`:  children, `header` / `level` / `id`).
 *   It re-follows when that content resizes (a `ResizeObserver`:  components drawing late move the headings
 *   without any scroll).
 * - SIDE EFFECTS:
 *   - gives each listed heading / example without an `id` one (a slug of its text), so its link works
 *   - while connected:  `window` `scroll` / `resize` / `hashchange` listeners, and the two observers.
 ****************/
export class UIDocsToc extends E.UIComponent<DocsTocVocabulary> {
  @E.proto static vocabulary = docsTocVocabulary
  @E.proto static styleSheets = { "docs-toc": tocCSS }
  @E.proto static elementSetup = { delegatesFocus: false } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## The sections
  ////////////////

  /** The listed sections, from the last scan. */
  @E.state accessor sections: readonly TocSection[] = []

  /** Nothing listed:  `:state(empty)`. */
  @E.cssState("empty")
  get isEmpty(): boolean {
    return !this.sections.length
  }

  ////////////////
  // ## The entry in view
  ////////////////

  /** Id of the entry in view. */
  @E.state accessor idInView: string | undefined = undefined

  /** Ids from the top-level section down to the entry in view:  the entries open on the way. */
  @E.derived
  get pathInView(): string[] {
    return TocIndex.pathTo(this.sections, this.idInView)
  }

  /** Id of the top-level section holding the entry in view. */
  get sectionIdInView(): string | undefined {
    return this.pathInView[0]
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("toc")}>
        <Show when={this.header}>
          <ui-header part={this.partForName("header")}>{this.header}</ui-header>
        </Show>
        <ui-menu
          part={this.partForName("menu")}
          vertical=""
          text=""
          fluid=""
          size={this.menuSize}
          aria-label={this.translationForKey("label")}
        >
          <For each={this.sections}>{(section) => this.section(section)}</For>
        </ui-menu>
      </div>
    )
  }

  /** One section's link, and its entries while it's open. */
  private section(section: TocSection): JSX.Element {
    return (
      <>
        <ui-item
          part={this.partForName("section")}
          class={SECTION}
          href={`#${section.id}`}
          selected={this.sectionIdInView === section.id ? "" : undefined}
        >
          {section.text}
        </ui-item>
        {this.entries(section)}
      </>
    )
  }

  /**
   * `parent`'s entries, while it's open (`expanded`, or on the way to the entry in view):  a menu of their links,
   * each followed by its own entries the same way (nested `<ui-section>`s).
   */
  private entries(parent: TocEntry): JSX.Element {
    const isOpen = () => !!parent.entries.length && (!!this.expanded || this.pathInView.includes(parent.id))
    return (
      <Show when={isOpen()}>
        <ui-item class={ENTRIES} fitted="vertically">
          <ui-menu part={this.partForName("entries")} vertical="" text="" fluid="" size={this.menuSize}>
            <For each={parent.entries}>
              {(entry) => (
                <>
                  <ui-item
                    part={this.partForName("entry")}
                    href={`#${entry.id}`}
                    selected={this.idInView === entry.id ? "" : undefined}
                  >
                    {entry.text}
                  </ui-item>
                  {this.entries(entry)}
                </>
              )}
            </For>
          </ui-menu>
        </ui-item>
      </Show>
    )
  }

  /** `size`, else the default (an empty or unknown `size` too). */
  private get menuSize(): string {
    return this.size || DEFAULT_SIZE
  }

  ////////////////
  // ## Following the page
  ////////////////

  /** Scheduled frame of a pending scan / follow, if any. */
  private scheduledFrame = 0

  /** What the `scheduledFrame` does:  a rescan wins over a follow. */
  private queuedUpdate: TocUpdate | undefined

  /** SIDE EFFECT:  page listeners and the observers, while connected. */
  @E.onChange("isConnected")
  protected onConnectedChanged(isConnected: boolean) {
    return isConnected ? this.watch() : undefined
  }

  /** Start following:  the first scan, the hash, listeners and the observers;  returns their cleanup. */
  private watch(): () => void {
    const document = this.domElement.ownerDocument
    const view = document.defaultView!
    const observer = new MutationObserver(() => this.schedule("rescan"))
    // components drawing (or a pane switching) move the headings without a scroll
    const resized = new ResizeObserver(() => this.schedule("follow"))
    const onScroll = () => this.schedule("follow")
    const onShow = () => this.schedule("rescan")
    const onHash = () => this.reveal("hash change")
    let followed: FollowedContent | undefined
    const start = () => (followed = this.observe({ observer, resized, onShow }))
    view.addEventListener("scroll", onScroll, { passive: true })
    view.addEventListener("resize", onScroll, { passive: true })
    view.addEventListener("hashchange", onHash)
    // the toc may come before what it follows:  look again once the page is parsed
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true })
    else queueMicrotask(start)
    return () => {
      observer.disconnect()
      resized.disconnect()
      followed?.tabs?.removeEventListener(UI_SHOW, onShow)
      document.removeEventListener("DOMContentLoaded", start)
      view.removeEventListener("scroll", onScroll)
      view.removeEventListener("resize", onScroll)
      view.removeEventListener("hashchange", onHash)
      cancelAnimationFrame(this.scheduledFrame)
      this.scheduledFrame = 0
    }
  }

  /**
   * Follow what `for` names, once it exists:  observe it, hear its tabs show a pane, scan it, land on the hash.
   * Returns what it follows (`watch()` undoes the tabs' listener), or `undefined` while it doesn't exist.
   */
  private observe({ observer, resized, onShow }: Observers): FollowedContent | undefined {
    const followed = this.followedContent()
    if (!followed) return undefined
    observer.observe(followed.root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: OBSERVED_ATTRIBUTES
    })
    resized.observe(followed.root)
    followed.tabs?.addEventListener(UI_SHOW, onShow)
    this.rescan()
    this.reveal("page load")
    return followed
  }

  /** Do `update` on the next frame, once:  a rescan queued meanwhile wins over a follow. */
  private schedule(update: TocUpdate): void {
    if (update === "rescan") this.queuedUpdate = update
    else this.queuedUpdate ??= update
    if (this.scheduledFrame) return
    this.scheduledFrame = requestAnimationFrame(() => this.onFrame())
  }

  /** The scheduled frame:  do what's queued. */
  private onFrame(): void {
    this.scheduledFrame = 0
    const update = this.queuedUpdate
    this.queuedUpdate = undefined
    if (update === "rescan") this.rescan()
    else this.followScroll()
  }

  /** Scan the followed content again, then follow the scroll. */
  private rescan(): void {
    const followed = this.followedContent()
    const root = followed?.tabs ? TocIndex.shownPane(followed.tabs) : followed?.root
    const sections = root ? TocIndex.scan(root, UIDocsToc.reservedIdsFor(followed?.tabs)) : []
    this.sections = sections
    this.send("ui-render", { ids: TocIndex.flatten(sections).map((entry) => entry.id) })
    this.followScroll(sections)
  }

  /** Mark the entry in view;  `ui-change` when it moved. */
  private followScroll(sections = untrack(() => this.sections)): void {
    const id = TocIndex.current(sections, this.domElement.ownerDocument)
    if (id === untrack(() => this.idInView)) return
    this.idInView = id
    if (id) this.send("ui-change", { value: id })
  }

  /**
   * Show what `location.hash` names:  its pane first when it's in a hidden pane of the followed tabs,
   * then scroll to it.  On `"page load"`, scroll again once the page's root is ready (components arriving move the
   * target down).
   */
  private reveal(moment: RevealMoment): void {
    const document = this.domElement.ownerDocument
    const hash = document.defaultView!.location.hash.slice(1)
    if (!hash) return
    const target = document.getElementById(TocIndex.decode(hash))
    if (!target) return
    const tabs = this.followedContent()?.tabs
    const pane = tabs && TocIndex.paneOf(tabs, target)
    const scroll = () => target.scrollIntoView({ block: "start" })
    const isPageLoad = moment === "page load"
    if (tabs && pane && TocIndex.shownPane(tabs) !== pane) {
      ;(tabs as HTMLElement & { value?: string }).value = TocIndex.paneValue(tabs, pane)
      requestAnimationFrame(() => requestAnimationFrame(scroll))
    } else if (isPageLoad || !target.getClientRects().length) requestAnimationFrame(scroll)
    if (isPageLoad) TocIndex.whenReady(this.domElement, scroll)
  }

  /** What `for` names (else the page's `main`), and its tabs;  `undefined` while it doesn't exist. */
  private followedContent(): FollowedContent | undefined {
    return TocIndex.followed(this.domElement.ownerDocument, this.for || undefined)
  }

  /** Ids a new heading id must not take:  the followed tabs' pane values (the URL hash names those too). */
  private static reservedIdsFor(tabs: Element | undefined): ReadonlySet<string> {
    if (!tabs) return new Set()
    return new Set([...tabs.children].map((pane, index) => pane.getAttribute("value") ?? String(index)))
  }
}

/** The vocabulary getters, typed (`UIComponent`'s doc). */
export interface UIDocsToc extends E.AttributeValues<DocsTocVocabulary> {}

/** What a scheduled frame does:  scan the followed content again, or just re-follow the scroll. */
type TocUpdate = "rescan" | "follow"

/** When `reveal()` runs:  as the page opens (scroll again once it's ready), or on a hash change. */
type RevealMoment = "page load" | "hash change"

/** What `observe()` hooks the followed content up to:  `watch()`'s observers and tabs listener. */
type Observers = {
  /** rescans on changes to the content */
  observer: MutationObserver
  /** re-follows when the content resizes */
  resized: ResizeObserver
  /** rescans when the tabs show another pane */
  onShow: () => void
}

/** The attributes whose changes rescan:  a section's title, a heading's level, an id. */
const OBSERVED_ATTRIBUTES = ["header", "level", "id"]

/** `<ui-tabs>`' event as it shows another pane. */
const UI_SHOW = "ui-show"

/** Class word of a section's link item. */
const SECTION = "section"

/** Class word of the item holding a section's entries. */
const ENTRIES = "entries"
