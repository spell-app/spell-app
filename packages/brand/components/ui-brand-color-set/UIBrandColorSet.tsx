import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { Palette } from "$/brand"
import { DOMBrandColorElement } from "$/brand/components/ui-brand-color"

import { brandColorSetVocabulary } from "./UIBrandColorSet.en"
import {
  ARROWS,
  CHIP_ATTRIBUTES,
  CHIP_TAG,
  CHOOSE_KEYS,
  type BrandColorSetVocabulary,
  type SetChip
} from "./UIBrandColorSet.types"

import setCSS from "./UIBrandColorSet.css?inline"

/**
 * Same chips, same keys, same `selected`?  A rescan finding them again changes nothing (`UIBrandColorSet.chips`).
 * - Above the class:  `@watches({ equals })` reads it while the class is defined.
 */
function isSameChips(a: readonly SetChip[], b: readonly SetChip[]): boolean {
  return (
    a.length === b.length &&
    a.every(
      (chip, index) =>
        chip.chip === b[index]!.chip &&
        chip.name === b[index]!.name &&
        chip.color === b[index]!.color &&
        chip.selected === b[index]!.selected
    )
  )
}

/****************
 * ### `UIBrandColorSet`
 * The component behind `<ui-brand-color-set>`:  a group of `<ui-brand-color>` chips, its light-DOM children.
 * The Color Set Chooser's presets, the Theme Creator's set pickers, or a laid-out row.
 *
 * - Its shadow DOM:  `<div class="[selectable] [grid] set color brand" part="set">` around the `<slot>`.
 * - Layout:  one row, each chip at its own size, all shrinking alike when the row is too narrow.
 *   `columns`:  a grid of equal cells, each chip filling its cell (`--_ui-brand-color-fit` on the chip).
 *
 * - `value`:  the chosen chip's `name`, else its colour
 *   (a colour matches whatever way it's written:  `#8e96b5` finds `142 150 181`).
 *   Controlled (`@E.controlled`):  setting it marks the matching chip `selected`, and every other one not;
 *   unset, the chips' own `selected` stand, and the first of them is the chosen one.
 *
 * - `selectable`:  an APG radio group.
 *   - The DOM element is the `radiogroup` (through internals, so its own `aria-label` names it).
 *   - Each chip's DOM element is a radio (`DOMBrandColorElement.choice`), with one Tab stop:
 *     the chosen chip, else the first (a roving `tabindex`).
 *   - Click, Enter or Space chooses;  the arrows move and choose (wrapping;  left / right swap right-to-left);
 *     Home / End go to the ends.
 *   - A choice sends `ui-change`, then sets `value`, unless a handler set it first.
 * - Watches its children and their `name` / `value` / `selected` (`@watches`), so chips added,
 *   removed or recoloured later just work.
 * - SIDE EFFECT:  writes its chips' `selected` (while `value` is set), `choice` and `tabindex` (while `selectable`);
 *   a chip that leaves the set gets its `choice` and `tabindex` back.
 ****************/
export class UIBrandColorSet extends E.UIComponent<BrandColorSetVocabulary> {
  @E.proto static vocabulary = brandColorSetVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { set: setCSS },
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## The chips
  ////////////////

  /**
   * The chips, as read from the light DOM:  its children and their `name` / `value` / `selected`;
   * changed only when one of them changes.
   */
  @E.watches({ childList: true, subtree: true, attributeFilter: CHIP_ATTRIBUTES, equals: isSameChips })
  get chips(): readonly SetChip[] {
    return this.scan()
  }

  /** Chips this set has made choices of, or given a `tabindex`:  handed back when they leave. */
  private readonly members = new Set<HTMLElement>()

  /** The chips' sync:  chosen, choice and Tab stop. */
  @E.onChange("chips", "chosen", "selectable", "value")
  protected onChipsChanged(chips: readonly SetChip[], chosen: number, selectable: boolean, value: string | undefined) {
    this.syncChips(chips, chosen, selectable, !!value)
  }

  /**
   * Bring the chips in step:  `selected` on the chosen one only (while `value` is set), `choice` and the roving
   * `tabindex` (while `selectable`);  hand back what chips that left had.
   * - SIDE EFFECT:  writes chip properties and attributes;  only what differs, so the observer settles.
   */
  private syncChips(chips: readonly SetChip[], chosen: number, selectable: boolean, valued: boolean) {
    const stop = chosen >= 0 ? chosen : 0
    const present = new Set(chips.map(({ chip }) => chip))
    for (const member of this.members) {
      if (present.has(member)) continue
      UIBrandColorSet.release(member)
      this.members.delete(member)
    }
    chips.forEach(({ chip }, index) => {
      // a chip not upgraded yet has no `choice` or `selected` of its own:  a write would hide them once it upgrades
      const upgraded =
        chip instanceof DOMBrandColorElement ? (chip as DOMBrandColorElement & { selected?: boolean }) : undefined
      if (valued && upgraded && upgraded.selected !== (index === chosen)) upgraded.selected = index === chosen
      if (selectable) {
        if (upgraded) upgraded.choice = true
        const tabIndex = index === stop ? 0 : -1
        if (chip.tabIndex !== tabIndex || !chip.hasAttribute("tabindex")) chip.tabIndex = tabIndex
        this.members.add(chip)
      } else if (this.members.has(chip)) {
        UIBrandColorSet.release(chip)
        this.members.delete(chip)
      }
    })
  }

  /** Every `<ui-brand-color>` child, keyed. */
  private scan(): SetChip[] {
    const chips: SetChip[] = []
    for (const child of this.domElement.children) {
      if (child.localName !== CHIP_TAG) continue
      const value = child.getAttribute("value") ?? ""
      chips.push({
        chip: child as HTMLElement,
        name: child.getAttribute("name") ?? "",
        color: Palette.parse(value) ?? value,
        selected: E.Converters.boolean(child.getAttribute("selected"), "selected")
      })
    }
    return chips
  }

  /** Hand a chip back:  no longer a choice, no `tabindex` of ours. */
  private static release(chip: HTMLElement) {
    if (chip instanceof DOMBrandColorElement) chip.choice = false
    chip.removeAttribute("tabindex")
  }

  ////////////////
  // ## Choosing
  ////////////////

  /** `value`:  set by the page, or chosen;  none until either. */
  @E.controlled("value") accessor value: string | undefined = undefined

  /** Index of the chosen chip, `-1` for none:  the one `value` names, else the first `selected` one. */
  get chosen(): number {
    const chips = this.chips
    const value = this.value
    if (value) return chips.findIndex((chip) => UIBrandColorSet.matches(chip, value))
    return chips.findIndex((chip) => chip.selected)
  }

  /** The DOM element is the radio group while `selectable`. */
  @E.aria("role")
  protected get ariaRole(): string | undefined {
    return this.selectable ? "radiogroup" : undefined
  }

  /**
   * A user choice of chip `index`:  focus it, then (unless it's the chosen one already) `ui-change` and `value`.
   * - Returns true when `value` changed.
   */
  @E.untracked
  choose(index: number, originalEvent?: Event): boolean {
    const chip = this.chips[index]
    if (!chip) return false
    chip.chip.focus()
    if (index === this.chosen && this.value) return false
    const value = UIBrandColorSet.keyOf(chip)
    return this.requestChange("value", value, () => this.send("ui-change", { value, originalEvent }))
  }

  /** A click on a chip chooses it (`selectable`). */
  @E.on("click")
  protected onClick(event: MouseEvent) {
    if (!this.selectable) return
    const index = this.indexOf(event)
    if (index >= 0) this.choose(index, event)
  }

  /** The radio group's keys (`selectable`):  arrows, Home / End, Enter / Space. */
  @E.on("keydown")
  protected onKeyDown(event: KeyboardEvent) {
    if (!this.selectable || event.altKey || event.ctrlKey || event.metaKey) return
    const index = this.indexOf(event)
    if (index < 0) return
    const count = this.chips.length
    const target = this.keyTarget(event, index, count)
    if (target === undefined) return
    event.preventDefault()
    this.choose(target, event)
  }

  /** Index of the chip `event` happened in, else `-1`. */
  @E.untracked
  private indexOf(event: Event): number {
    const path = event.composedPath()
    return this.chips.findIndex(({ chip }) => path.includes(chip))
  }

  /** Where key `event` goes from chip `index` of `count`, or `undefined` for a key the group doesn't take. */
  private keyTarget(event: KeyboardEvent, index: number, count: number): number | undefined {
    const { key } = event
    if (key === UIT.Key.home) return 0
    if (key === UIT.Key.end) return count - 1
    if (CHOOSE_KEYS.has(key)) return index
    let step = ARROWS[key]
    if (!step || event.shiftKey) return undefined
    const horizontal = key === "ArrowLeft" || key === "ArrowRight"
    if (horizontal && getComputedStyle(this.domElement).direction === "rtl") step = step === 1 ? -1 : 1
    return (index + step + count) % count
  }

  /** What chip `chip` is chosen as:  its `name`, else its colour. */
  private static keyOf(chip: SetChip): string {
    return chip.name || chip.color
  }

  /** Does `value` name `chip`:  its `name`, or its colour however written? */
  private static matches(chip: SetChip, value: string): boolean {
    if (chip.name && chip.name === value) return true
    return !!chip.color && chip.color === (Palette.parse(value) ?? value)
  }

  ////////////////
  // ## Layout
  ////////////////

  /** `color brand`, and `grid` with `columns`. */
  protected get extraClass(): string | undefined {
    return this.columnCount ? `${GRID} ${BRAND_COLOR}` : BRAND_COLOR
  }

  /** Whole chips per row, or `undefined` for one row. */
  get columnCount(): number | undefined {
    const columns = Math.floor(this.columns ?? 0)
    return columns > 0 ? columns : undefined
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("set")} style={this.layoutStyle()}>
        <slot />
      </div>
    )
  }

  /** The grid's column count, as the private switch the sheet reads. */
  private layoutStyle(): JSX.CSSProperties | undefined {
    const columns = this.columnCount
    return columns ? { [COLUMNS_PROPERTY]: String(columns) } : undefined
  }
}

export interface UIBrandColorSet extends E.AttributeValues<BrandColorSetVocabulary> {}

/** The class words the component adds before the noun:  `color brand set`. */
const BRAND_COLOR = "color brand"

/** The class word of a set with `columns`:  a grid of equal cells. */
const GRID = "grid"

/** The private switch on `columns`:  chips per row (inline, on the set's box). */
const COLUMNS_PROPERTY = "--_ui-brand-color-set-columns"
