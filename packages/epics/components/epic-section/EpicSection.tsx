import { For, Show, createMemo, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import { Cell, IconGlyph, proto, SlotContent, UIT } from "$/ui/core"

import { epicSectionVocabulary } from "./epic-section.vocabulary.en"
import { EpicSectionFallback } from "./epic-section.fallback"
import { EpicFold } from "./EpicFold"
import {
  EMPTY,
  ITEM_KINDS,
  PHASE_TOGGLES,
  PHASE_TOGGLES_KEY,
  SECTION_LOOKS,
  TOGGLE,
  type EpicSectionVocabulary,
  type PhaseToggle,
  type SectionLook
} from "./epic-section.types"

import foldCSS from "./epic-fold.css?inline"
import sectionCSS from "./epic-section.css?inline"

/****************
 * ### `<epic-section>`
 * One section of a plan doc, by `kind`:  Phases, Questions ... Log, or one of the Overview's sub-sections.
 * - A fold (`EpicFold`):  its numbered title (`3. Questions`, by its place among the page's blocks;  `1.2 Why` for
 *   an Overview sub-section, its title its own), the kind's icon and tooltip (fixed per kind:  from the vocabulary),
 *   then its children:  phases, items, log events or prose.
 * - The Phases section's title holds the Files / Verify toggles:  each shows or hides that field in every phase,
 *   through `--epic-files-display` / `--epic-verify-display`, which the fields read;  remembered per page.
 * - An item section with no items says "None yet".
 * - The `tools` part at the title's end:  where P10's open / all count and state filter go.
 * - The Overview sub-sections get review notes in P9:  their controls go in `tools` too.
 ****************/
export class EpicSection extends EpicFold<EpicSectionVocabulary> {
  @proto static vocabulary = epicSectionVocabulary
  @proto static styles = { "epic-fold": foldCSS, "epic-section": sectionCSS }
  @proto static Fallback = EpicSectionFallback

  ////////////////
  // ## State
  ////////////////

  /** Light-DOM slot occupancy:  has it children (items, phases ...)? */
  readonly slots = new SlotContent(this.host)

  /** The Phases section's toggles:  which fields show. */
  readonly shown = new Cell<Record<string, boolean>>(untrack(() => EpicSection.savedToggles()))

  /** The toggles' icons, in `PHASE_TOGGLES`' order. */
  readonly toggleGlyphs = PHASE_TOGGLES.map((toggle) => new IconGlyph(this, () => toggle.icon))

  ////////////////
  // ## Derived state
  ////////////////

  /** The kind's look:  icon, title and tooltip keys;  `undefined` for an Overview sub-section. */
  readonly look = createMemo((): SectionLook | undefined => {
    const kind = this.attrs.kind
    return kind && kind !== "overview-part" ? SECTION_LOOKS[kind] : undefined
  })

  /** Its icon (after `look`, which it reads:  memos compute as they're made). */
  readonly glyph = new IconGlyph(this, () => this.look()?.icon)

  /** Its number, by its place:  `3` for the third block of the page;  `1.2` for the Overview's second part. */
  readonly number = createMemo(() => {
    this.layout()
    if (!this.connected.get()) return ""
    const parent = this.host.parentElement
    if (!parent) return ""
    if (this.attrs.kind === "overview-part") {
      const own = EpicSection.placeOf(this.host, ":scope > epic-section")
      const overview = EpicSection.placeOf(parent, ":scope > epic-overview, :scope > epic-section") || 1
      return `${overview}.${own}`
    }
    return String(EpicSection.placeOf(this.host, ":scope > epic-overview, :scope > epic-section"))
  })

  /** An item section with nothing in it, and no part on its way. */
  readonly empty = createMemo(
    () => (ITEM_KINDS as readonly string[]).includes(this.attrs.kind ?? "") && !this.slots.has("") && !this.attrs.source
  )

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    // read once:  a section never changes its kind
    const look = untrack(this.look)
    const kind = untrack(() => this.attrs.kind)
    return this.renderFold({
      title: () => this.title(),
      icon: look ? () => this.glyph.svg() : undefined,
      info: () => {
        const tip = this.look()?.tip
        return tip ? this.text(tip) : undefined
      },
      tools: kind === "phases" ? () => this.toggles() : undefined,
      after: () => (
        <Show when={this.empty()}>
          <p class={EMPTY} part={this.part("empty")}>
            {this.text("noneYet")}
          </p>
        </Show>
      )
    })
  }

  /** The title:  `3. Questions`, or an Overview sub-section's `1.2 <its title>`. */
  private title(): JSX.Element {
    const look = this.look()
    if (look) return `${this.number()}. ${this.text(look.title)}`
    return (
      <>
        <span class="number">{this.number()}</span> <slot name={this.slot("title")}>{this.attrs.title}</slot>
      </>
    )
  }

  /** The Phases title's toggles:  bare icons, the accent while pressed. */
  private toggles(): JSX.Element {
    return (
      <For each={PHASE_TOGGLES}>
        {(toggle, index) => {
          const on = () => !!this.shown.get()[toggle.field]
          const label = () => this.text(on() ? toggle.hide : toggle.show)
          return (
            <button
              type={UIT.BUTTON}
              class={TOGGLE}
              aria-pressed={on() ? UIT.TRUE : UIT.FALSE}
              aria-label={label()}
              title={label()}
              onClick={() => this.flip(toggle)}
            >
              {this.toggleGlyphs[index()]!.svg()}
            </button>
          )
        }}
      </For>
    )
  }

  /** The Phases section's fields to show:  each toggle's custom property, `block` while it's on. */
  protected foldStyle(): Record<string, string> | undefined {
    if (this.attrs.kind !== "phases") return undefined
    const shown = this.shown.get()
    const style: Record<string, string> = {}
    for (const toggle of PHASE_TOGGLES) if (shown[toggle.field]) style[toggle.property] = "block"
    return style
  }

  ////////////////
  // ## Behaviour
  ////////////////

  /** A toggle, clicked:  show or hide its field in every phase, and remember it. */
  private flip(toggle: PhaseToggle) {
    const shown = { ...untrack(() => this.shown.get()) }
    shown[toggle.field] = !shown[toggle.field]
    this.shown.set(shown)
    try {
      localStorage.setItem(PHASE_TOGGLES_KEY + location.pathname, JSON.stringify(shown))
    } catch {
      // private mode:  the choice lasts the visit
    }
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** `element`'s place, from 1, among its parent's children matching `selector`;  0 when it isn't one. */
  private static placeOf(element: Element, selector: string): number {
    const siblings = Array.from(element.parentElement?.querySelectorAll(selector) ?? [])
    return siblings.indexOf(element) + 1
  }

  /** The Phases toggles as last left on this page;  none without storage. */
  private static savedToggles(): Record<string, boolean> {
    try {
      return JSON.parse(localStorage.getItem(PHASE_TOGGLES_KEY + location.pathname) ?? "{}") as Record<string, boolean>
    } catch {
      return {}
    }
  }
}
