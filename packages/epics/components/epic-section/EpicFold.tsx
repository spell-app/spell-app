import { Show, createEffect, createMemo, onSettled, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, proto, SourceBody, SourceBodyHost, UIElement, type ComponentVocabulary, type UIHost } from "$/ui/core"

// Import directly:  the page's signals, not its family's barrel (which would define `<epic-page>` here)
import { EpicPage } from "$/epics/components/epic-page/EpicPage"

import {
  BODY,
  FILE_PROTOCOL,
  FOLD_TAGS,
  NOTE,
  STACK_PROPERTY,
  type ContentsEntry,
  type FoldAttributes,
  type FoldToggleDetail,
  type SectionStack
} from "./epic-section.types"

/****************
 * ### `EpicFoldHost`
 * The host of a folding element:  `SourceBodyHost` (`load()`, `reload()`), plus `contentsEntry`, what the page's
 * contents list and rail show for it.
 * - Before its first render (no controller yet):  `undefined`;  the runtime falls back on its attributes.
 ****************/
export class EpicFoldHost extends SourceBodyHost {
  get contentsEntry(): ContentsEntry | undefined {
    return untrack(() => (this.controller as unknown as { contentsEntry?(): ContentsEntry })?.contentsEntry?.())
  }
}

/****************
 * ### `EpicFold`
 * Base of the plan doc's FOLDING blocks -- `<epic-overview>`, `<epic-section>`, `<epic-phase>`:  a title bar that
 * sticks and folds, over the element's own children.
 * - The chrome is a `<ui-section sticky collapsible fold-icon="end">` in the shadow root (`renderFold()`), its title
 *   bar drawn from the subclass's pieces;  the element's light children show through a `<slot>` inside it, wrapped in
 *   the `body` part.  So Spell UI's section brings the sticky stack (nested titles stack below their parents', across
 *   these shadow roots:  its owner lookup climbs the flat tree), the fold chevron, `hidden="until-found"` (find-in-page
 *   and `#links` unfold it).
 * - Folding:  `open` (page state, never in a doc:  plan docs open folded), controlled.  The inner section's own
 *   `ui-open` / `ui-close` are CANCELLED and stopped there:  the host announces its own (cancelable), then `open`
 *   changes and the inner section follows.  Find-in-page (`beforematch`, not cancelable) is adopted.
 * - Sticky line:  a top-level fold sticks below the page header (`EpicPage.signalsOf(page).top`);  a nested one
 *   below its parent's title (the inner sections stack themselves).  Its children get `--epic-stack`, the bottom of
 *   the stuck titles above them (px from the viewport top), for their own sticky lines (`<epic-item>`'s).
 * - Source:  `source="parts/p3.html"` is fetched the first time it opens (`SourceBody`, as `<ui-section source>`),
 *   into the host's LIGHT children, replacing any placeholder;  `ui-load` then.  The inner section stays folded
 *   while the part is on its way (`veiled()`), so it opens on the body.  From `file://` it can't load:  the
 *   `Loads from parts/x.html when opened (needs the page server)` note, as today.
 * - Links:  the page's `#hash` naming it, an element inside it, or an id in its `part-ids` opens it (loading its
 *   part), then lands there, below the stuck titles -- unless a deeper folding element holds the target, which lands
 *   it itself.
 * - The host's own `title` (a phase's, a sub-section's) would be a browser tooltip over all its content:  the
 *   wrapper's EMPTY `title` stops it there (T8).
 * - Contents:  its host's `contentsEntry` (`EpicFoldHost`) is what the page's contents list and rail show for it
 *   (`spell-doc-runtime.js` reads it):  its title as drawn, its icon, a section's count.
 * - SIDE EFFECT:  with `source`, replaces its own light children (a placeholder) with the part;  listens for
 *   `hashchange` while connected.
 * - Position in the import graph:  `$/ui/core` and `EpicPage` (for the page's signals) only;  subclasses in other
 *   families import THIS file directly, never the `epic-section` barrel.
 ****************/
export abstract class EpicFold<V extends ComponentVocabulary> extends UIElement<V> {
  @proto static Host = EpicFoldHost
  // a container:  a click on its text must not jump to the fold button or a link inside
  @proto static delegatesFocus = false

  ////////////////
  // ## State
  ////////////////

  /** `open`:  the host's when set, else internal (starts folded). */
  readonly openState = this.controlled("open" as never, false as never)

  /** The inner `<ui-section>`'s controller, once it has rendered:  its sticky line and stack. */
  readonly inner = new Cell<SectionStack | undefined>(undefined)

  /** The children from `source`, loaded the first time it opens;  into the host's light DOM. */
  readonly body = new SourceBody({
    host: this.host,
    source: () => untrack(() => this.foldAttrs.source) || undefined,
    select: () => undefined,
    target: () => this.host,
    emit: (name, detail) => this.emit(name as never, detail)
  })

  /** The `<epic-page>` around it, once connected;  `null` outside one. */
  readonly page = createMemo(() => (this.connected.get() ? this.host.closest(EpicPage.TAG) : null))

  ////////////////
  // ## Derived state
  ////////////////

  /** Unfolded. */
  readonly isOpen = createMemo(() => !!this.openState.get())

  /** Inner section held folded while the `source` part is on its way. */
  readonly veiled = createMemo(() => !isServer && !!this.foldAttrs.source && this.body.veiled())

  /** Where a top-level title sticks:  below the site header and the page header, px from the viewport top. */
  readonly offset = createMemo(() => {
    const page = this.page()
    return page ? EpicPage.signalsOf(page).top.get() : 0
  })

  /** The bottom of the stuck titles over its children, px from the viewport top. */
  readonly stack = createMemo(() => this.inner.get()?.innerStackTop() ?? this.offset())

  /** The note when the `source` part failed;  else `undefined`. */
  readonly failureText = createMemo(() => {
    const failure = this.body.failure.get()
    if (!failure) return undefined
    const source = this.foldAttrs.source ?? ""
    return this.text((failure.kind === FILE_PROTOCOL ? "partNote" : "partError") as never, { source })
  })

  /** The page's layout counter:  bumped when sections come or go, or a phase changes (`EpicPage`). */
  readonly layout = createMemo(() => {
    const page = this.page()
    return page ? EpicPage.signalsOf(page).layout.get() : 0
  })

  /** Its attributes as fold code reads them, whatever the vocabulary. */
  protected get foldAttrs(): FoldAttributes {
    return this.attrs as FoldAttributes
  }

  ////////////////
  // ## Element hooks
  ////////////////

  protected hostStates() {
    const status = this.body.status.get()
    return { open: this.isOpen(), loaded: status === "loaded", error: status === "error" } as never
  }

  ////////////////
  // ## Rendering
  ////////////////

  /**
   * Load the `source` part whenever it's open and connected;  follow links to it.
   * - In `mount()`, not `render()`:  effects outside the drawing.
   */
  mount(): JSX.Element {
    if (!isServer) {
      createEffect(
        () => ({ source: this.foldAttrs.source, open: this.isOpen(), connected: this.connected.get() }),
        ({ source, open, connected }) => {
          if (source && open && connected) this.body.load().catch(() => undefined)
        }
      )
      onSettled(() => {
        window.addEventListener("hashchange", this.followHash)
        this.followHash()
        return () => window.removeEventListener("hashchange", this.followHash)
      })
    }
    return super.mount()
  }

  /**
   * The fold:  the inner `<ui-section>` around the subclass's title pieces, the part note and the children.
   * - `title`:  the header's content (`slot="header"` of the inner section);  `icon` its icon;  `tools` what goes
   *   at the title's end (`slot="actions"`);  `badge` its badge text;  `before` content above
   *   the children (the Overview's summary)
   */
  protected renderFold(pieces: FoldPieces): JSX.Element {
    return (
      // an EMPTY title:  the host's `title` would otherwise be a tooltip over all of it (T8)
      <div class={this.classes()} part={this.part("base" as never)} title="" style={this.foldStyle()}>
        <ui-section
          ref={this.watchInner}
          part={this.part("section" as never)}
          sticky=""
          collapsible=""
          fold-icon="end"
          collapsed={!this.isOpen() || this.veiled() ? "" : undefined}
          loading={this.body.busy() ? "" : undefined}
          offset={String(this.offset())}
          badge={pieces.badge?.() || undefined}
        >
          <Show when={pieces.icon}>
            <span slot="icon" class="icon">
              {pieces.icon!()}
            </span>
          </Show>
          <span slot="header" class="header">
            {pieces.title()}
          </span>
          <Show when={pieces.tools}>
            <span slot="actions" class="tools" part={this.part("tools" as never)}>
              {pieces.tools!()}
            </span>
          </Show>
          <div class={BODY} part={this.part("body" as never)} style={{ [STACK_PROPERTY]: `${this.stack()}px` }}>
            <Show when={this.failureText()}>
              <p class={NOTE} part={this.part("note" as never)}>
                {this.failureText()}
              </p>
            </Show>
            {pieces.before?.()}
            <slot />
            {pieces.after?.()}
          </div>
        </ui-section>
      </div>
    )
  }

  /** Inline style of the base box:  custom properties its children inherit;  none by default. */
  protected foldStyle(): Record<string, string> | undefined {
    return undefined
  }

  /**
   * What the page's contents list and rail show for it (`EpicFoldHost.contentsEntry`):  by default its title, its
   * id when it has none.  Read by the runtime, outside any render, right after a live update patched the page:  so
   * from the page as it is NOW (attributes, children), never a memo that hasn't caught up.
   */
  contentsEntry(): ContentsEntry {
    return { label: EpicFold.titleText(this.host) }
  }

  /** `host`'s title as text, as it is now:  its `slot="title"` child's text, else `title`, else its id. */
  protected static titleText(host: Element): string {
    const slotted = host.querySelector(':scope > [slot="title"]')?.textContent
    return (slotted ?? host.getAttribute("title") ?? host.id).replace(/\s+/g, " ").trim()
  }

  ////////////////
  // ## Source (`SourceBodyHost`)
  ////////////////

  /** Fetch and insert the `source` part now, folded or not;  once per `source`. */
  loadBody(): Promise<void> {
    return this.body.load()
  }

  /** Fetch the `source` part again past the cache, and replace it (the live update). */
  reloadBody(): Promise<void> {
    return this.body.reload()
  }

  ////////////////
  // ## Folding
  ////////////////

  /**
   * Fold or unfold as the user would:  the cancelable `ui-open` / `ui-close` first, then `open`.  True when applied.
   */
  toggle(originalEvent?: Event): boolean {
    const opening = !untrack(this.isOpen)
    const detail: FoldToggleDetail = { open: opening, element: this.host, originalEvent }
    return this.openState.request(opening as never, () =>
      this.emit((opening ? "ui-open" : "ui-close") as never, detail)
    )
  }

  /**
   * Unfold for a link or find-in-page, and load its part:  `ui-open` after the fact (not cancelable).  Resolves once
   * the part is in (at once without one).
   * - NEVER rejects:  a part that can't load shows its note.
   */
  reveal(): Promise<void> {
    if (!untrack(this.isOpen)) {
      const detail: FoldToggleDetail = { open: true, element: this.host }
      const init = { bubbles: true, composed: true, cancelable: false, detail }
      this.host.dispatchEvent(new CustomEvent(this.definition.event("ui-open" as never), init))
      this.openState.set(true as never)
    }
    return this.foldAttrs.source ? this.body.load().catch(() => undefined) : Promise.resolve()
  }

  /** The inner section, as it's drawn:  take over its folding, and read its stack once it's ready. */
  private readonly watchInner = (element: HTMLElement) => {
    element.addEventListener("ui-open", this.onInnerToggle)
    element.addEventListener("ui-close", this.onInnerToggle)
    const host = element as UIHost
    void host.ready.then(() => this.inner.set(host.controller as unknown as SectionStack))
  }

  /**
   * The inner section's own `ui-open` / `ui-close` (the title clicked, or find-in-page):  this host's instead.
   * - a nested fold's events bubble through here too (its host is slotted inside):  only the inner section's own
   * - cancelable (a click):  cancelled and stopped, then `toggle()`;  not (find-in-page):  adopted, and stopped
   */
  private readonly onInnerToggle = (event: Event) => {
    const detail = (event as CustomEvent<{ section?: Element; originalEvent?: Event }>).detail
    if (event.target !== event.currentTarget || detail?.section !== event.currentTarget) return
    event.stopPropagation()
    if (!event.cancelable) {
      void this.reveal()
      return
    }
    event.preventDefault()
    this.toggle(detail.originalEvent)
  }

  ////////////////
  // ## Links
  ////////////////

  /**
   * The page's `#hash` names this element, an element inside it, or an id in its `part-ids`:  open it, loading its
   * part, then land there -- unless a deeper folding element holds the target (it lands it).
   */
  private readonly followHash = () => {
    const id = decodeURIComponent(location.hash.slice(1))
    if (!id) return
    const partIds = (untrack(() => this.foldAttrs.partIds) ?? "").split(/\s+/)
    const element = document.getElementById(id)
    const inside = !!element && element !== this.host && this.host.contains(element)
    if (element !== this.host && !inside && !partIds.includes(id)) return
    void this.reveal().then(() => this.land(id))
  }

  /** Scroll `id`'s element to just below the titles stuck over it, if this is the folding element holding it. */
  private land(id: string) {
    const target = document.getElementById(id)
    if (!target) return
    const holder = target === this.host ? this.host : target.parentElement?.closest(FOLD_TAGS)
    if (holder !== this.host) return
    // the folds above it may still be opening (Spell UI animates them):  follow the target until it stays put
    let frames = 0
    let still = 0
    const step = () => {
      const line = target === this.host ? (this.inner.get()?.stickTop() ?? this.offset()) : this.stack() + LAND_GAP
      const off = target.getBoundingClientRect().top - line
      if (Math.abs(off) >= 1) window.scrollTo({ top: window.scrollY + off })
      still = Math.abs(off) < 1 ? still + 1 : 0
      if (still < LAND_STILL_FRAMES && ++frames < LAND_MAX_FRAMES) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }
}

/** What a subclass draws in its fold (`EpicFold.renderFold()`);  each a function, read where it's drawn. */
export type FoldPieces = {
  /** The title:  number, id and text. */
  title: () => JSX.Element
  /** The icon before it. */
  icon?: () => JSX.Element
  /** Controls at the title's end. */
  tools?: () => JSX.Element
  /** The badge text (a phase's estimate). */
  badge?: () => string | undefined
  /** Content above the children. */
  before?: () => JSX.Element
  /** Content below the children. */
  after?: () => JSX.Element
}

/** Space between the stuck titles and an element a link lands on, px. */
const LAND_GAP = 8

/** Frames a landing target must stay put before landing stops. */
const LAND_STILL_FRAMES = 3

/** Frames landing follows its target at most (~1s):  folds animating open above it. */
const LAND_MAX_FRAMES = 60
