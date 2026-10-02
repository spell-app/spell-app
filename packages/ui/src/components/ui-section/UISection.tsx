import { Show, createEffect, createMemo, untrack } from "solid-js"
import { Dynamic, type JSX } from "@solidjs/web"

import {
  Cell,
  IconGlyph,
  PartContext,
  proto,
  SlotContent,
  StickyWatch,
  UI,
  UIElement,
  UIT,
  type UIHost
} from "$/ui/core"

import { sectionVocabulary } from "./ui-section.vocabulary.en"
import { SectionFallback } from "./ui-section.fallback"
import {
  ACTIONS,
  BADGE,
  BEFORE_MATCH,
  CONTENT,
  CONTENT_ID,
  DEPTH_PROPERTY,
  FOLD_ICON,
  FOLD_ICON_CLASS,
  HEADER,
  HEADING,
  HEADING_TAG,
  HEIGHT_PROPERTY,
  MAX_LEVEL,
  SCROLLING,
  SENTINEL,
  STATIC_TOGGLE_TAG,
  TOGGLE_BUTTON,
  CONTROLS,
  STICK_TOP_PROPERTY,
  SUBHEAD,
  TITLE,
  TOGGLE,
  TOP_LEVEL,
  UNTIL_FOUND,
  type SectionVocabulary
} from "./ui-section.types"

import sectionCSS from "./ui-section.css?inline"

/****************
 * ### `<ui-section>`
 * A titled section:  `<section class="ui ... section" part="section">` holding a 1px sentinel, the title bar
 * (`<header class="title">` > `<hN class="heading">` > the toggle around the fold icon, icon and header;  then the
 * badge and actions), the subhead, then `<div class="content">` around the default slot.
 * - Wrappers that would be empty (icon, badge, actions, subhead) aren't rendered:  `SlotContent` watches the
 *   light children.
 * - Level:  `level`, else the enclosing section's level + 1 (at most `h6`), else 2.  The enclosing section comes
 *   from `PartContext` (`ownsParts:  section`, `:state(in-section)`) WITHOUT barriers, so a section in a segment in
 *   a section still nests;  its level, depth and sticky stack are read from its controller (signals across
 *   elements), so they follow its attributes and re-nesting.
 * - Folding (`collapsible`):  the toggle is a `<button>` (its accessible name is the header;  its `title`, the
 *   `fold` / `unfold` text by state, only a tooltip / description, as the fallback's);  click / Enter /
 *   Space go through the cancelable `ui-open` / `ui-close`, then `collapsed` flips (controlled, like accordion's
 *   `open`).  Folded content is `hidden="until-found"`, so find-in-page reveals a match:  `beforematch` unfolds it
 *   and announces `ui-open` after the fact (not cancelable).  Not collapsible:  `collapsed` is ignored.
 * - Sticky:  the title bar is `position: sticky` inside the section box, at `top` ~== the top-level `offset`, or
 *   the bottom of the enclosing sticky titles (enclosing section's `stackBottom()`), so nested titles stack.  A
 *   `scrolling` / `height` section's content starts a fresh stack (its own scroll box).  `StickyWatch` reports
 *   `:state(stuck)` and reserves the title's room for Page Down, exactly as `<ui-sticky>` does.
 * - SIDE EFFECT:  with `sticky`, a `ResizeObserver` keeps the title's height (`titleHeight`) for the stack, and the
 *   `StickyWatch` writes the scroll container's inline `scroll-padding-top` while stuck.
 ****************/
export class UISection extends UIElement<SectionVocabulary> {
  @proto static vocabulary = sectionVocabulary
  @proto static styles = { section: sectionCSS }
  @proto static Fallback = SectionFallback
  // a container:  a click on its text must not jump to the fold button or a link inside
  @proto static delegatesFocus = false

  ////////////////
  // ## State
  ////////////////

  /** Enclosing section, when nested (`:state(in-section)`);  climbs through any other component. */
  readonly context = new PartContext(this.host, this.vocabulary.noun, { barrier: PartContext.noBarrier })

  /** Light-DOM slot occupancy:  icon, badge, subhead, actions. */
  readonly slots = new SlotContent(this.host)

  /** Glyph of the `icon` shorthand. */
  readonly glyph = new IconGlyph(() => this.attrs.icon)

  /** Glyph of the fold button, while `collapsible`. */
  readonly foldGlyph = new IconGlyph(() => (this.attrs.collapsible ? FOLD_ICON : undefined))

  /** `collapsed`:  the host's (a boolean is always the host's, see `Controlled`). */
  readonly collapsedState = this.controlled("collapsed", false)

  /** Title bar's height in pixels, while `sticky` (for the stack below it). */
  readonly titleHeight = new Cell(0)

  /** Title bar is stuck. */
  readonly stuck = new Cell(false)

  /** The title bar. */
  private title?: HTMLElement

  /** Sentinel where the title bar's top would be, unstuck. */
  private sentinel?: HTMLDivElement

  /** Observes the stuck title and reserves its room. */
  private readonly watch = new StickyWatch(({ edge }) => this.stuck.set(edge !== null))

  ////////////////
  // ## Derived state
  ////////////////

  /** Enclosing section's controller, or `undefined` at the top (or before it has one). */
  readonly parent = createMemo((): UISection | undefined => {
    const controller = (this.context.owner.get()?.owner as UIHost | undefined)?.controller
    return controller instanceof UISection ? controller : undefined
  })

  /** Heading level, 1 ... 6. */
  readonly level = createMemo((): number => {
    const own = Number(this.attrs.level)
    if (Number.isInteger(own) && own >= 1 && own <= MAX_LEVEL) return own
    const parent = this.parent()
    return parent ? Math.min(parent.level() + 1, MAX_LEVEL) : TOP_LEVEL
  })

  /** Nesting depth:  0 at the top. */
  readonly depth = createMemo((): number => {
    const parent = this.parent()
    return parent ? parent.depth() + 1 : 0
  })

  /** Pixels from the scroll container's top where the title sticks:  `offset` at the top, else the stack above. */
  readonly stickTop = createMemo((): number => {
    const parent = this.parent()
    return parent ? parent.innerStackTop() : (this.attrs.offset ?? 0)
  })

  /** Bottom of the stack of stuck titles, through this one, in pixels. */
  readonly stackBottom = createMemo((): number => this.stickTop() + (this.attrs.sticky ? this.titleHeight.get() : 0))

  /** Where nested titles stick:  below the stack, or 0 in this section's own scroll box (`scrolling` / `height`). */
  readonly innerStackTop = createMemo((): number => (this.scrolls() ? 0 : this.stackBottom()))

  /** Folded:  `collapsible` and `collapsed`. */
  readonly folded = createMemo(() => !!this.attrs.collapsible && !!this.collapsedState.get())

  /** Has an icon (shorthand or `icon` slot)? */
  readonly hasIcon = createMemo(() => !!this.attrs.icon || this.slots.has(this.slot("icon")))

  /** Has a badge (shorthand or `badge` slot)? */
  readonly hasBadge = createMemo(() => !!this.attrs.badge || this.slots.has(this.slot("badge")))

  /** Has a subhead (shorthand or `subhead` slot)? */
  readonly hasSubhead = createMemo(() => !!this.attrs.subhead || this.slots.has(this.slot("subhead")))

  /** Has actions (`actions` slot)? */
  readonly hasActions = createMemo(() => this.slots.has(this.slot("actions")))

  /** Is the content its own scroll box? */
  scrolls(): boolean {
    return !!this.attrs.scrolling || !!this.attrs.height
  }

  isDisabled(): boolean {
    return !!this.attrs.disabled
  }

  ////////////////
  // ## Element hooks
  ////////////////

  /** `height` without `scrolling`:  `scrolling` after the noun (`height` implies it). */
  protected extraClasses(): string | undefined {
    return this.attrs.height && !this.attrs.scrolling ? SCROLLING : undefined
  }

  protected hostStates() {
    const { inverted, loading, disabled } = this.attrs
    return {
      collapsed: this.folded(),
      stuck: !!this.attrs.sticky && this.stuck.get(),
      animated: this.loaded() && UI.browser.supports.interpolateSize,
      inverted,
      loading,
      disabled
    }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    this.effects()
    return (
      <section class={this.classes()} part={this.part("section")} aria-busy={this.attrs.loading ? UIT.TRUE : undefined}>
        <div ref={(element) => (this.sentinel = element)} class={SENTINEL} aria-hidden={UIT.TRUE} />
        {this.renderTitle()}
        <Show when={this.hasSubhead()}>
          <div class={SUBHEAD} part={this.part("subhead")}>
            <slot name={this.slot("subhead")}>{this.attrs.subhead}</slot>
          </div>
        </Show>
        <div
          ref={(element) => element.addEventListener(BEFORE_MATCH, this.onBeforeMatch)}
          id={CONTENT_ID}
          class={CONTENT}
          part={this.part("content")}
          hidden={this.folded() ? UNTIL_FOUND : undefined}
          tabindex={this.scrolls() ? 0 : undefined}
          style={this.attrs.height ? { [HEIGHT_PROPERTY]: this.attrs.height } : undefined}
        >
          <slot />
        </div>
        <Show when={this.attrs.loading}>
          <span class={UIT.VISUALLY_HIDDEN} role={UIT.STATUS}>
            {this.text("loading")}
          </span>
        </Show>
      </section>
    )
  }

  /** `<header class="title">`:  the heading around the toggle, then the badge and actions. */
  private renderTitle(): JSX.Element {
    return (
      <header
        ref={(element) => (this.title = element)}
        class={TITLE}
        part={this.part("title")}
        style={{ [STICK_TOP_PROPERTY]: `${this.stickTop()}px`, [DEPTH_PROPERTY]: String(this.depth()) }}
      >
        <Dynamic component={`${HEADING_TAG}${this.level()}`} class={HEADING} part={this.part("heading")}>
          <Dynamic
            component={this.attrs.collapsible ? UIT.BUTTON : STATIC_TOGGLE_TAG}
            type={this.attrs.collapsible ? UIT.BUTTON : undefined}
            class={TOGGLE}
            part={this.part("toggle")}
            aria-expanded={this.attrs.collapsible ? (this.folded() ? UIT.FALSE : UIT.TRUE) : undefined}
            aria-controls={this.attrs.collapsible ? CONTENT_ID : undefined}
            title={this.attrs.collapsible ? this.text(this.folded() ? "unfold" : "fold") : undefined}
            disabled={this.attrs.collapsible && this.attrs.disabled ? true : undefined}
            onClick={this.onToggleClick}
          >
            <Show when={this.attrs.collapsible}>
              <span class={FOLD_ICON_CLASS} part={this.part("fold-icon")} aria-hidden={UIT.TRUE}>
                {this.foldGlyph.svg()}
              </span>
            </Show>
            <Show when={this.hasIcon()}>
              <span class={UIT.ICON} part={this.part("icon")}>
                <slot name={this.slot("icon")}>{this.glyph.svg()}</slot>
              </span>
            </Show>
            <span class={HEADER} part={this.part("header")}>
              <slot name={this.slot("header")}>{this.attrs.header}</slot>
            </span>
          </Dynamic>
        </Dynamic>
        <Show when={this.hasBadge()}>
          <span class={BADGE} part={this.part("badge")}>
            <slot name={this.slot("badge")}>{this.attrs.badge}</slot>
          </span>
        </Show>
        <Show when={this.hasActions()}>
          <span class={ACTIONS} part={this.part("actions")}>
            <slot name={this.slot("actions")} />
          </span>
        </Show>
      </header>
    )
  }

  /**
   * While connected and `sticky`:  measure the title (for the stack) and watch it stick, again whenever its
   * `top` changes;  unstuck otherwise.
   */
  private effects() {
    createEffect(
      () => ({ watching: this.connected.get() && !!this.attrs.sticky, offset: this.stickTop() }),
      ({ watching, offset }) => {
        const { title, sentinel } = this
        if (!watching || !title || !sentinel) {
          this.watch.reset()
          return undefined
        }
        const resizes = new ResizeObserver(() => this.titleHeight.set(title.getBoundingClientRect().height))
        resizes.observe(title)
        const unwatch = this.watch.observe({ host: this.host, top: sentinel, box: title }, { offset })
        return () => {
          resizes.disconnect()
          unwatch()
        }
      }
    )
  }

  ////////////////
  // ## Folding
  ////////////////

  /**
   * Fold or unfold as the user would:  the cancelable `ui-open` / `ui-close` first, then `collapsed`.  True when
   * applied.
   * - Does nothing unless `collapsible`, or while `disabled`.
   */
  toggle(originalEvent?: Event): boolean {
    if (!untrack(() => this.attrs.collapsible) || untrack(() => this.isDisabled())) return false
    const opening = untrack(this.folded)
    const detail: UIT.SectionToggleDetail = { open: opening, section: this.host, originalEvent }
    return this.collapsedState.request(!opening, () => this.emit(opening ? "ui-open" : "ui-close", detail))
  }

  /** A click on the toggle (Enter / Space on the button click it too). */
  private readonly onToggleClick = (event: MouseEvent) => {
    // a link or control inside a rich `slot="header"` title acts on its own, as in an accordion's title
    if (UISection.fromControl(event)) return
    this.toggle(event)
  }

  /** Did the click land on a control inside the title, before reaching the fold button? */
  private static fromControl(event: Event): boolean {
    for (const target of event.composedPath()) {
      if (!(target instanceof Element)) continue
      if (target.matches(TOGGLE_BUTTON)) return false
      if (target.matches(CONTROLS)) return true
    }
    return false
  }

  /**
   * Find-in-page matched inside the folded content:  the browser has already revealed it, so announce `ui-open`
   * after the fact (not cancelable) and adopt it.
   */
  private readonly onBeforeMatch = () => {
    if (!untrack(this.folded)) return
    const detail: UIT.SectionToggleDetail = { open: true, section: this.host }
    const init = { bubbles: true, composed: true, cancelable: false, detail }
    this.host.dispatchEvent(new CustomEvent(this.definition.event("ui-open"), init))
    this.collapsedState.set(false)
  }
}
