import { For, Show, createEffect, createMemo, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { docsTocVocabulary } from "./ui-docs-toc.vocabulary.en"
import { DocsTocFallback } from "./ui-docs-toc.fallback"
import { TocIndex } from "./TocIndex"
import {
  DEFAULT_SIZE,
  type DocsTocVocabulary,
  type FollowedContent,
  type TocEntry,
  type TocSection
} from "./ui-docs-toc.types"

import tocCSS from "./ui-docs-toc.css?inline"

/****************
 * ### `<ui-docs-toc>`
 * Fomantic's docs "On this page" menu (`ui vertical following fluid accordion text menu` in the right rail):
 * `<div class="ui [size] toc" part="toc">` holding an optional `<ui-header part="header">` and ONE
 * `<ui-menu vertical text fluid part="menu">` (the landmark) of section links;  under the section in view, an item
 * holding a `<ui-menu part="entries">` of its entries' links.
 * - Lists the FOLLOWED content (`for`;  a `<ui-tabs>`:  its shown pane) by `TocIndex.scan()`:  level 2 headings and
 *   top-level `<ui-section>`s are sections, examples with a `header` and level 3 headings their entries;  what a
 *   `<ui-section>` nests (sections, examples, headings) are ITS entries, as deep as it goes, each level opening on
 *   the way to the entry in view.  Light DOM only.
 * - SIDE EFFECT:  gives each listed heading / example without an `id` one (a slug of its text), so its link works.
 * - Follows the scroll:  the entry whose top passed the reading line (`TocIndex.current()`) is `selected`, its
 *   section opens;  `ui-change { value }` when that changes.
 * - Links are plain `#id` links:  the browser scrolls (below the document's `scroll-padding-top`).  A hash naming an
 *   element in a HIDDEN pane of the followed tabs (a link from elsewhere, or a page opened on it) shows that pane
 *   first, then scrolls to it:  `<ui-tabs history>` ignores hashes that aren't pane values.
 * - Rescans when the tabs show another pane (`ui-show`), and when the followed content changes (a
 *   `MutationObserver`:  children, `header` / `level` / `id`);  re-follows when it resizes (a `ResizeObserver`:
 *   components drawing late move the headings without any scroll).
 * - SIDE EFFECTS while connected:  `window` `scroll` / `resize` / `hashchange` listeners, the two observers.
 ****************/
export class UIDocsToc extends E.UIElement<DocsTocVocabulary> {
  @E.proto static vocabulary = docsTocVocabulary
  @E.proto static styles = { "docs-toc": tocCSS }
  @E.proto static Fallback = DocsTocFallback
  @E.proto static delegatesFocus = false

  ////////////////
  // ## State
  ////////////////

  /** The listed sections, from the last scan. */
  readonly sections = new E.Cell<readonly TocSection[]>([])

  /** Id of the entry in view. */
  readonly currentId = new E.Cell<string | undefined>(undefined)

  /** Ids from the top-level section down to the entry in view:  the entries open on the way. */
  readonly currentPath = createMemo(() => TocIndex.pathTo(this.sections.get(), this.currentId.get()))

  /** Id of the top-level section holding the entry in view. */
  readonly currentSection = createMemo(() => this.currentPath()[0])

  /** Scheduled frame of a pending scan / follow, if any. */
  private frame = 0

  /** What the scheduled `frame` does:  a rescan wins over a follow. */
  private queued: TocUpdate | undefined

  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
    super(...args)
    if (isServer) return
    // SIDE EFFECT:  page listeners and the observer, while connected
    createEffect(
      () => this.isConnected.get(),
      (isConnected) => {
        if (isConnected) return this.watch()
      }
    )
  }

  ////////////////
  // ## Element hooks
  ////////////////

  protected override hostStates() {
    return { empty: this.sections.get().length === 0 }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("toc")}>
        <Show when={this.attrs.header}>
          <ui-header part={this.part("header")}>{this.attrs.header}</ui-header>
        </Show>
        <ui-menu
          part={this.part("menu")}
          vertical=""
          text=""
          fluid=""
          size={this.size()}
          aria-label={this.text("label")}
        >
          <For each={this.sections.get()}>{(section) => this.section(section)}</For>
        </ui-menu>
      </div>
    )
  }

  /** One section's link, and its entries while it's open. */
  private section(section: TocSection): JSX.Element {
    return (
      <>
        <ui-item
          part={this.part("section")}
          class={SECTION}
          href={`#${section.id}`}
          selected={this.currentSection() === section.id ? "" : undefined}
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
    const isOpen = () => !!parent.entries.length && (!!this.attrs.expanded || this.currentPath().includes(parent.id))
    return (
      <Show when={isOpen()}>
        <ui-item class={ENTRIES} fitted="vertically">
          <ui-menu part={this.part("entries")} vertical="" text="" fluid="" size={this.size()}>
            <For each={parent.entries}>
              {(entry) => (
                <>
                  <ui-item
                    part={this.part("entry")}
                    href={`#${entry.id}`}
                    selected={this.currentId.get() === entry.id ? "" : undefined}
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

  /** `size`, else the default. */
  private size(): string {
    return this.attrs.size || DEFAULT_SIZE
  }

  ////////////////
  // ## Following the page
  ////////////////

  /** Start following:  the first scan, the hash, listeners and the observers;  returns their cleanup. */
  private watch(): () => void {
    const document = this.host.ownerDocument
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
      cancelAnimationFrame(this.frame)
      this.frame = 0
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
    if (update === "rescan") this.queued = update
    else this.queued ??= update
    if (this.frame) return
    this.frame = requestAnimationFrame(() => this.runQueued())
  }

  /** The scheduled frame:  do what's queued. */
  private runQueued(): void {
    this.frame = 0
    const update = this.queued
    this.queued = undefined
    if (update === "rescan") this.rescan()
    else this.follow()
  }

  /** Scan the followed content again, then follow the scroll. */
  private rescan(): void {
    const followed = this.followedContent()
    const root = followed?.tabs ? TocIndex.shownPane(followed.tabs) : followed?.root
    const sections = root ? TocIndex.scan(root, UIDocsToc.reservedIdsFor(followed?.tabs)) : []
    this.sections.set(sections)
    this.emit("ui-render", { ids: TocIndex.flatten(sections).map((entry) => entry.id) })
    this.follow(sections)
  }

  /** Mark the entry in view;  `ui-change` when it moved. */
  private follow(sections = untrack(() => this.sections.get())): void {
    const id = TocIndex.current(sections, this.host.ownerDocument)
    if (id === untrack(() => this.currentId.get())) return
    this.currentId.set(id)
    if (id) this.emit("ui-change", { value: id })
  }

  /**
   * Show what `location.hash` names:  its pane first when it's in a hidden pane of the followed tabs, then scroll to
   * it.  On `"page load"`, scroll again once the page's root is ready (components arriving move the target down).
   */
  private reveal(moment: RevealMoment): void {
    const document = this.host.ownerDocument
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
    if (isPageLoad) TocIndex.whenReady(this.host, scroll)
  }

  /** What `for` names (else the page's `main`), and its tabs;  `undefined` while it doesn't exist. */
  private followedContent(): FollowedContent | undefined {
    return TocIndex.followed(this.host.ownerDocument, this.attrs.for || undefined)
  }

  /** Ids a new heading id must not take:  the followed tabs' pane values (the URL hash names those too). */
  private static reservedIdsFor(tabs: Element | undefined): ReadonlySet<string> {
    if (!tabs) return new Set()
    return new Set([...tabs.children].map((pane, index) => pane.getAttribute("value") ?? String(index)))
  }
}

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
