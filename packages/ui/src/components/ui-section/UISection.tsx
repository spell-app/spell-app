import { Show, createEffect, untrack } from "solid-js"
import { Dynamic, isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { sectionVocabulary } from "./ui-section.vocabulary.en"
import { SectionFallback } from "./ui-section.fallback"
import { UISections } from "./UISections"
import {
  ACTIONS,
  BADGE,
  BEFORE_MATCH,
  CONTENT_ID,
  FOLD_ICON_CLASS,
  FoldIconPlace,
  HEADING,
  HEADING_TAG,
  HEIGHT_PROPERTY,
  MAX_LEVEL,
  SCROLLING,
  STATIC_TOGGLE_TAG,
  STICK_TOP_PROPERTY,
  SUBHEAD,
  TIP,
  TIP_ID,
  TOGGLE,
  TOOLTIP,
  TOP_LEVEL,
  UNTIL_FOUND,
  type SectionVocabulary
} from "./ui-section.types"

import sectionCSS from "./ui-section.css?inline"

/****************
 * ### `<ui-section>`
 * A titled section:  `<section class="ui ... section" part="section">` holding a 1px sentinel, the title bar
 * (`<header class="title">` > `<hN class="heading">` > the toggle around the fold icon, icon and header;  then the
 * badge, actions, an end fold icon and the info tip), the subhead, then `<div class="content">` around the default
 * slot.
 * - Wrappers that would be empty (icon, badge, actions, subhead, tip) aren't rendered:  `SlotContent` watches the
 *   light children.
 * - `fold-icon="end"`:  the chevron leaves the fold button for the far end of the title bar, after the actions.  It
 *   stays `aria-hidden` (the button is still the control);  a click on it folds as the button does.  A subclass
 *   moves the default with `defaultFoldIcon` (`<ui-panel>`:  `end`).
 * - `info` / `slot="info"`:  a CSS tooltip under the title bar (`role="tooltip"`), shown while the pointer is on the
 *   heading or the end chevron, or the fold button has keyboard focus.  It describes the fold button
 *   (`aria-describedby`), else the heading.
 * - Level:  `level`, else the enclosing section's level + 1 (at most `h6`), else 2.  The enclosing section comes
 *   from `PartContext` (`ownsParts:  section`, `:state(in-section)`) WITHOUT barriers, so a section in a segment in
 *   a section still nests;  its level, depth and sticky stack are read from its controller (reactive members across
 *   elements), so they follow its attributes and re-nesting.
 * - Folding (`collapsible`):  the toggle is a `<button>` (its accessible name is the header;  its `title`, the
 *   `fold` / `unfold` text by state, only a tooltip / description, as the fallback's);  click / Enter /
 *   Space go through the cancelable `ui-open` / `ui-close`, then `collapsed` flips (controlled, like accordion's
 *   `open`).  Folded content is `hidden="until-found"`, so find-in-page reveals a match:  `beforematch` unfolds it
 *   and announces `ui-open` after the fact (not cancelable).  Not collapsible:  `collapsed` is ignored.
 * - Groups:  without its own `collapsible` attribute, a section folds when its nearest `<ui-sections>` (around it,
 *   or around an enclosing section) is `collapsing` (`group`, `isCollapsible`).  The group also owns `section`
 *   parts, so `parent` climbs through it.
 * - Sticky:  the title bar is `position: sticky` inside the section box, at `top` ~== the top-level `offset`, or
 *   the bottom of the enclosing sticky titles (enclosing section's `stackBottom`), so nested titles stack.  A
 *   `scrolling` / `height` section's content starts a fresh stack (its own scroll box).  `StickyWatch` reports
 *   `:state(stuck)` and reserves the title's room for Page Down, exactly as `<ui-sticky>` does.
 * - Source (`source`, `select`):  the content comes from a file the first time the section unfolds -- by any route:
 *   a click, `collapsed` removed by the page (a `#id` link's unfold), or starting unfolded (then at once).
 *   `SourceBody` fetches it (`UI.sources`), and puts its `<body>` in the LIGHT DOM in place of the placeholder
 *   (children without a `slot`).  While it's on its way the content box stays hidden (`isVeiled`, at most
 *   `SOURCE_BODY_HOLD_MS`, then the `loading` look over the placeholder), so the unfold shows the body.
 *   `load()` / `reload()` on the host (`SourceBodyHost`);  `:state(loaded)`, `:state(error)`.  Lives in the CLASS,
 *   so subclasses (`<ui-panel>`) get it with the vocabulary they reuse.
 * - SIDE EFFECT:  with `sticky`, a `ResizeObserver` keeps the title's height (`titleHeight`) for the stack, and the
 *   `StickyWatch` writes the scroll container's inline `scroll-padding-top` while stuck.
 * - SIDE EFFECT:  with `source`, replaces its own light children (the placeholder) with the file's body.
 ****************/
export class UISection extends E.UIElement<SectionVocabulary> {
  @E.proto static vocabulary = sectionVocabulary
  @E.proto static styleSheets = { section: sectionCSS }
  @E.proto static elementSetup: Partial<E.ElementSetup> = {
    Fallback: SectionFallback,
    Host: E.SourceBodyHost,
    // a container:  a click on its text must not jump to the fold button or a link inside
    delegatesFocus: false
  }
  @E.proto static defaultFoldIcon: FoldIconPlace = FoldIconPlace.start

  /** Where the fold chevron sits without a `fold-icon` attribute:  `start`;  a subclass may move it. */
  declare defaultFoldIcon: FoldIconPlace

  ////////////////
  // ## Nesting
  ////////////////

  /** Enclosing section, when nested (`:state(in-section)`);  climbs through any other component. */
  readonly context = new E.PartContext({
    host: this.host,
    noun: this.vocabulary.noun,
    barrier: E.PartContext.noBarrier
  })

  /**
   * Enclosing section's controller, or `undefined` at the top (or before it has one).
   * - Climbs through `<ui-sections>` groups (owners of `section` parts too):  a section in a group in a section is
   *   still nested.
   */
  @E.derived
  get parent(): UISection | undefined {
    let owner = this.context.ownerController<UISection | UISections>()
    while (owner instanceof UISections) owner = owner.context.ownerController<UISection | UISections>()
    return owner instanceof UISection ? owner : undefined
  }

  /** Nearest `<ui-sections>` group's controller, directly or through enclosing sections, or `undefined`. */
  get group(): UISections | undefined {
    const owner = this.context.ownerController<UISection | UISections>()
    if (owner instanceof UISections) return owner
    return owner instanceof UISection ? owner.group : undefined
  }

  /** Heading level, 1 ... 6. */
  get headingLevel(): number {
    const own = Number(this.level)
    if (Number.isInteger(own) && own >= 1 && own <= MAX_LEVEL) return own
    const parent = this.parent
    return parent ? Math.min(parent.headingLevel + 1, MAX_LEVEL) : TOP_LEVEL
  }

  /** Nesting depth:  0 at the top. */
  get depth(): number {
    const parent = this.parent
    return parent ? parent.depth + 1 : 0
  }

  ////////////////
  // ## Folding
  ////////////////

  /** `collapsed`:  the host's (a boolean is always the host's, see `@controlled`);  folds only `isCollapsible`. */
  @E.controlled("collapsed") accessor isCollapsed = false

  /**
   * Folds:  the host's own `collapsible` when written (`collapsible="false"` opts out), else the nearest group's
   * `collapsing`.
   * - The attribute raw:  its getter reads absent and `"false"` alike (false), but only absent takes the group's
   *   default.
   * - NOTE: a PROPERTY write of `false` removes the attribute (booleans never reflect as `"false"`), which brings the
   *   group's default back;  opt out from code with `setAttribute("collapsible", "false")`.
   */
  get isCollapsible(): boolean {
    const own = this.attributes.collapsible
    if (own !== null) return E.Converters.boolean(own, this.elementDefinition.attribute("collapsible").attribute)
    return !!this.collapsible || !!this.group?.collapsing
  }

  /** Folded:  `isCollapsible` and `isCollapsed`. */
  @E.cssState("collapsed")
  get isFolded(): boolean {
    return this.isCollapsible && !!this.isCollapsed
  }

  /** Glyph of the fold button, while `isCollapsible`. */
  readonly foldGlyph = new E.IconGlyph({ owner: this, name: () => (this.isCollapsible ? FOLD_ICON : undefined) })

  /** The fold chevron sits at the far end of the title bar:  `fold-icon`, else the class's `defaultFoldIcon`. */
  get foldIconIsAtEnd(): boolean {
    return (this.foldIcon ?? this.defaultFoldIcon) === FoldIconPlace.end
  }

  /**
   * Fold or unfold as a person would:  the cancelable `ui-open` / `ui-close` first, then `collapsed`.  True when
   * applied.
   * - Does nothing unless `collapsible`, or while `disabled`.
   */
  toggle(originalEvent?: Event): boolean {
    if (!untrack(() => this.isCollapsible) || untrack(() => this.isDisabled)) return false
    const opening = untrack(() => this.isFolded)
    const detail: UIT.SectionToggleDetail = { open: opening, section: this.host, originalEvent }
    return this.requestChange("isCollapsed", !opening, () => this.send(opening ? "ui-open" : "ui-close", detail))
  }

  /** A click on the toggle (Enter / Space on the button click it too). */
  private readonly onToggleClick = (event: MouseEvent) => {
    // a link or control inside a rich `slot="header"` title acts on its own, as in an accordion's title
    if (UIT.TitleControls.isClicked(event, TOGGLE_BUTTON)) return
    this.toggle(event)
  }

  /** A click on the END chevron, outside the button:  folds as the button does. */
  private readonly onFoldIconClick = (event: MouseEvent) => {
    this.toggle(event)
  }

  /**
   * Find-in-page matched inside the folded content:  the browser has already revealed it, so announce `ui-open`
   * after the fact (not cancelable) and adopt it.
   */
  private readonly onBeforeMatch = () => {
    if (!untrack(() => this.isFolded)) return
    const detail: UIT.SectionToggleDetail = { open: true, section: this.host }
    const init = { bubbles: true, composed: true, cancelable: false, detail }
    this.host.dispatchEvent(new CustomEvent(this.elementDefinition.event("ui-open"), init))
    this.isCollapsed = false
  }

  ////////////////
  // ## The sticky title
  ////////////////

  /** Title bar's height in pixels, while `sticky` (for the stack below it). */
  @E.state accessor titleHeight = 0

  /** Title bar is stuck. */
  @E.state accessor isStuck = false

  /** Stuck, and `sticky`. */
  @E.cssState("stuck")
  get titleIsStuck(): boolean {
    return !!this.sticky && this.isStuck
  }

  /** The title bar. */
  private title?: HTMLElement

  /** Sentinel where the title bar's top would be, unstuck. */
  private sentinel?: HTMLDivElement

  /** Observes the stuck title and reserves its room. */
  private readonly stickyWatch = new E.StickyWatch(({ edge }) => (this.isStuck = edge !== undefined))

  /** Pixels from the scroll container's top where the title sticks:  `offset` at the top, else the stack above. */
  get stickTop(): number {
    const parent = this.parent
    return parent ? parent.innerStackTop : (this.offset ?? 0)
  }

  /** Bottom of the stack of stuck titles, through this one, in pixels. */
  get stackBottom(): number {
    return this.stickTop + (this.sticky ? this.titleHeight : 0)
  }

  /** Where nested titles stick:  below the stack, or 0 in this section's own scroll box (`scrolling` / `height`). */
  get innerStackTop(): number {
    return this.contentScrolls ? 0 : this.stackBottom
  }

  /** Is the content its own scroll box? */
  get contentScrolls(): boolean {
    return !!this.scrolling || !!this.height
  }

  /**
   * The title's inline tokens:  stick offset and nesting depth.
   * - A getter, not an inline object:  Solid's server compile (rc.11) drops the `;` between an inline style
   *   object's COMPUTED keys (`--a:1px--b:2`), and the browser then ignores both.
   */
  private get titleStyle(): Record<string, string> {
    return { [STICK_TOP_PROPERTY]: `${this.stickTop}px`, [DEPTH_PROPERTY]: String(this.depth) }
  }

  /**
   * While connected and `sticky`:  measure the title (for the stack) and watch it stick, again whenever its
   * `top` changes;  unstuck otherwise.
   * - Stays an explicit effect:  conditional, and it observes the DOM (`ResizeObserver`, `StickyWatch`).
   */
  private watchTitle() {
    createEffect(
      () => ({ watching: this.isConnected && !!this.sticky, offset: this.stickTop }),
      ({ watching, offset }) => {
        const { title, sentinel } = this
        if (!watching || !title || !sentinel) {
          this.stickyWatch.reset()
          return undefined
        }
        const resizes = new ResizeObserver(() => (this.titleHeight = title.getBoundingClientRect().height))
        resizes.observe(title)
        const unwatch = this.stickyWatch.observe({ host: this.host, top: sentinel, box: title }, { offset })
        return () => {
          resizes.disconnect()
          unwatch()
        }
      }
    )
  }

  ////////////////
  // ## Title bar pieces
  ////////////////

  /** Light-DOM slot occupancy:  icon, badge, subhead, actions. */
  readonly slots = new E.SlotContent(this.host)

  /** Glyph of the `icon` shorthand. */
  readonly iconGlyph = new E.IconGlyph({ owner: this, name: () => this.icon })

  /** Has an icon (shorthand or `icon` slot)? */
  get hasIcon(): boolean {
    return !!this.icon || this.slots.hasContent(this.slotForName("icon"))
  }

  /** Has a badge (shorthand or `badge` slot)? */
  get hasBadge(): boolean {
    return !!this.badge || this.slots.hasContent(this.slotForName("badge"))
  }

  /** Has a subhead (shorthand or `subhead` slot)? */
  get hasSubhead(): boolean {
    return !!this.subhead || this.slots.hasContent(this.slotForName("subhead"))
  }

  /** Has actions (`actions` slot)? */
  get hasActions(): boolean {
    return this.slots.hasContent(this.slotForName("actions"))
  }

  /** Has an info tip (`info`, or `slot="info"`)? */
  get hasInfo(): boolean {
    return !!this.info || this.slots.hasContent(this.slotForName("info"))
  }

  ////////////////
  // ## Source (`SourceBodyHost`)
  ////////////////

  /** The content from `source`, loaded on first unfold;  into the host's light DOM. */
  readonly body = new E.SourceBody({
    host: this.host,
    source: () => untrack(() => this.source) || undefined,
    select: () => untrack(() => this.select) || undefined,
    target: () => this.host,
    send: (name, detail) => this.send(name as never, detail)
  })

  /** Content box held closed while the `source` body is on its way (never in a server render:  nothing loads). */
  get isVeiled(): boolean {
    return !isServer && !!this.source && this.body.isVeiled
  }

  /** Busy:  `loading`, or a `source` body slow to arrive. */
  @E.cssState("loading")
  get isLoading(): boolean {
    return !!this.loading || this.body.isBusy
  }

  /** The `source` body arrived. */
  @E.cssState("loaded")
  get bodyIsLoaded(): boolean {
    return this.body.loadStatus === E.SourceStatus.loaded
  }

  /** The `source` body failed. */
  @E.cssState("error")
  get bodyFailed(): boolean {
    return this.body.loadStatus === E.SourceStatus.error
  }

  /** The error line's text, when the `source` body failed;  else `undefined`. */
  get bodyFailureText(): string | undefined {
    const failure = this.body.loadError
    if (!failure) return undefined
    const key = E.SOURCE_FAILURE_KEYS[failure.kind] ?? E.SOURCE_FAILURE_KEYS.load
    return this.translationForKey(key as never, { source: this.source ?? "" })
  }

  /**
   * Load the `source` body whenever the section is unfolded, connected and has one (`SourceBody.load()` is once per
   * `source` + `select`).
   * - An effect, not in `render()`:  a subclass drawing its own markup still loads its body.
   */
  @E.onChange("source", "select", "isFolded", "isConnected")
  protected onBodyWanted(
    source: string | undefined,
    _select: string | undefined,
    isFolded: boolean,
    isConnected: boolean
  ) {
    if (source && !isFolded && isConnected) this.body.load().catch(() => undefined)
  }

  /** Fetch and insert the `source` body now, folded or not;  once per `source` + `select`. */
  loadBody(): Promise<void> {
    return this.body.load()
  }

  /** Fetch the `source` body again past the cache, and replace it. */
  reloadBody(): Promise<void> {
    return this.body.reload()
  }

  ////////////////
  // ## Looks
  ////////////////

  /** Transitions the fold:  styled, in a browser that animates to `auto` heights. */
  @E.cssState("animated")
  get isAnimated(): boolean {
    return this.isReady && UI.browser.supports.interpolateSize
  }

  /** `inverted`, as a state. */
  @E.cssState("inverted")
  get isInverted(): boolean {
    return !!this.inverted
  }

  /** Disabled by its attribute. */
  @E.cssState("disabled")
  get isDisabled(): boolean {
    return !!this.disabled
  }

  /**
   * Words after the noun:  `scrolling` for `height` without it (`height` implies it);  `loading` while a `source`
   * body is slow to arrive (the `loading` look, over the placeholder).
   */
  protected get extraClasses(): string | undefined {
    const scrolling = this.height && !this.scrolling ? SCROLLING : undefined
    const loading = !this.loading && this.body.isBusy ? LOADING : undefined
    return [scrolling, loading].filter(Boolean).join(" ") || undefined
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    this.watchTitle()
    return (
      <section
        class={this.rootClasses}
        part={this.partForName("section")}
        aria-busy={this.isLoading ? UIT.TRUE : undefined}
      >
        <div ref={(element) => (this.sentinel = element)} class={SENTINEL} aria-hidden={UIT.TRUE} />
        {this.titleBar()}
        <Show when={this.hasSubhead}>
          <div class={SUBHEAD} part={this.partForName("subhead")}>
            <slot name={this.slotForName("subhead")}>{this.subhead}</slot>
          </div>
        </Show>
        <div
          ref={(element) => element.addEventListener(BEFORE_MATCH, this.onBeforeMatch)}
          id={CONTENT_ID}
          class={UIT.CONTENT}
          part={this.partForName("content")}
          hidden={this.isFolded || this.isVeiled ? UNTIL_FOUND : undefined}
          tabindex={this.contentScrolls ? 0 : undefined}
          style={this.height ? { [HEIGHT_PROPERTY]: this.height } : undefined}
        >
          <Show when={this.bodyFailureText}>
            <p class={SOURCE_ERROR} part={this.partForName("error")} role={UIT.ALERT}>
              {this.bodyFailureText}
            </p>
          </Show>
          <slot />
        </div>
        <Show when={this.isLoading}>
          <span class={UIT.VISUALLY_HIDDEN} role={UIT.STATUS}>
            {this.translationForKey("loading")}
          </span>
        </Show>
      </section>
    )
  }

  /** `<header class="title">`:  the heading around the toggle, then the badge and actions. */
  private titleBar(): JSX.Element {
    return (
      <header
        ref={(element) => (this.title = element)}
        class={UIT.TITLE}
        part={this.partForName("title")}
        style={this.titleStyle}
      >
        <Dynamic
          component={`${HEADING_TAG}${this.headingLevel}`}
          class={HEADING}
          part={this.partForName("heading")}
          aria-describedby={this.hasInfo && !this.isCollapsible ? TIP_ID : undefined}
        >
          <Dynamic
            component={this.isCollapsible ? UIT.BUTTON : STATIC_TOGGLE_TAG}
            type={this.isCollapsible ? UIT.BUTTON : undefined}
            class={TOGGLE}
            part={this.partForName("toggle")}
            aria-expanded={this.isCollapsible ? (this.isFolded ? UIT.FALSE : UIT.TRUE) : undefined}
            aria-controls={this.isCollapsible ? CONTENT_ID : undefined}
            title={this.isCollapsible ? this.translationForKey(this.isFolded ? "unfold" : "fold") : undefined}
            disabled={this.isCollapsible && this.disabled ? true : undefined}
            aria-describedby={this.hasInfo && this.isCollapsible ? TIP_ID : undefined}
            onClick={this.onToggleClick}
          >
            <Show when={this.isCollapsible && !this.foldIconIsAtEnd}>{this.foldChevron()}</Show>
            <Show when={this.hasIcon}>
              <span class={UIT.ICON} part={this.partForName("icon")}>
                <slot name={this.slotForName("icon")}>{this.iconGlyph.svg}</slot>
              </span>
            </Show>
            <span class={UIT.HEADER} part={this.partForName("header")}>
              <slot name={this.slotForName("header")}>{this.header}</slot>
            </span>
          </Dynamic>
        </Dynamic>
        <Show when={this.hasBadge}>
          <span class={BADGE} part={this.partForName("badge")}>
            <slot name={this.slotForName("badge")}>{this.badge}</slot>
          </span>
        </Show>
        <Show when={this.hasActions}>
          <span class={ACTIONS} part={this.partForName("actions")}>
            <slot name={this.slotForName("actions")} />
          </span>
        </Show>
        <Show when={this.isCollapsible && this.foldIconIsAtEnd}>{this.foldChevron(this.onFoldIconClick)}</Show>
        <Show when={this.hasInfo}>
          <span id={TIP_ID} class={TIP} part={this.partForName("tip")} role={TOOLTIP}>
            <slot name={this.slotForName("info")}>{this.info}</slot>
          </span>
        </Show>
      </header>
    )
  }

  /** The fold chevron, `aria-hidden` (the button is the control):  in the button, or at the bar's end with `onClick`. */
  private foldChevron(onClick?: (event: MouseEvent) => void): JSX.Element {
    return (
      <span class={FOLD_ICON_CLASS} part={this.partForName("fold-icon")} aria-hidden={UIT.TRUE} onClick={onClick}>
        {this.foldGlyph.svg}
      </span>
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UISection extends E.AttributeValues<SectionVocabulary> {}

/** Glyph of the fold button (rotated by CSS while folded). */
const FOLD_ICON = "chevron down"

/** Class word of the 1px sentinel before the title, which `StickyWatch` observes with `sticky`. */
const SENTINEL = "sentinel"

/** The fold button, in the shadow root:  where a click's path stops counting as one on a control in the title. */
const TOGGLE_BUTTON = "button.toggle"

/** Private custom property of a title's nesting depth (0 at the top), inline:  deeper titles slide under. */
const DEPTH_PROPERTY = "--_ui-section-depth"

/** Class words of the line saying a `source` body failed (`part="error"`, inside the content box). */
const SOURCE_ERROR = "source error"

/** Class word after the noun while a `source` body is slow to arrive:  the `loading` look. */
const LOADING = "loading"
