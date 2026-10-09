import { Show, createMemo, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import {
  after,
  aria,
  Cell,
  DOMElement,
  IconGlyph,
  proto,
  protoMerged,
  UIComponent,
  type CancelablePromise,
  type ElementSetup,
  type AttributeValues
} from "$/ui/core"
import { Palette } from "$/brand"

import { brandColorVocabulary } from "./UIBrandColor.en"
import {
  AA_RATIO,
  BRAND,
  CLASSES,
  COPIED_ICON,
  COPIED_MS,
  LABELLED,
  LARGE_RATIO,
  TIP_ID,
  WHITE,
  type BrandColorVocabulary,
  type CopyFormat
} from "./UIBrandColor.types"

import colorCSS from "./UIBrandColor.css?inline"

/****************
 * ### `DOMBrandColorElement`
 * The DOM element of `<ui-brand-color>`:  it adds `choice`,
 * which a selectable `<ui-brand-color-set>` sets on the chips it holds.
 *
 * - A choice is a RADIO, and the DOM element is that radio:
 *   it takes the role, the checked state and the name (through `internals`),
 *   and the set moves focus between its chips (a roving `tabindex`).
 *   The chip inside draws no button of its own and ignores `copy`,
 *   so nothing clickable sits inside the radio.
 *
 * - On the DOM element, not the component:  the set may reach a chip before the chip has drawn.
 * - `choice` is not an attribute:  `DOMElement` refuses a member named like one.
 * - Above the component:  its `elementSetup` reads this class while the component is defined.
 ****************/
export class DOMBrandColorElement extends DOMElement<UIBrandColor> {
  /** Is this chip one choice of a selectable set?  Written by the set;  reading it in JSX follows it. */
  readonly choice = new Cell(false)
}

/****************
 * ### `UIBrandColor`
 * The component behind `<ui-brand-color>`:  a square colour CHIP, as the brand's Color Palette and
 * Color Set Chooser pages draw them (the brand's rule:  `aspect-ratio: 1`, an 8px radius).
 *
 * - Its shadow DOM:  `<button class="… color brand" part="chip">` with `copy`, else `<span role="img">`,
 *   holding the label, the AA mark and, after a copy, a check;
 *   then a hidden status line, and the details tip.
 *
 * - `value`:  any colour `Palette.parse()` reads, drawn as `#RRGGBB`.
 *   The text inside is white or the brand's ink, whichever contrasts more (`Palette.ink()`).
 *
 * - `copy`:  a click copies the colour (`navigator.clipboard`) and sends `ui-copy`.
 *   A check shows for `COPIED_MS`, and a status line announces "Copied …".
 *   If the browser refuses the write (no permission), nothing happens.
 *
 * - `details`:  a tip under the chip on hover and keyboard focus,
 *   describing the colour (CSS only:  anchor-positioned, flipping at the window's edges).
 *   A chip without `copy` becomes focusable for it.
 *
 * - A CHOICE of a selectable `<ui-brand-color-set>` (`DOMBrandColorElement.choice`):
 *   the DOM element is the radio (its role, checked state and name, through `internals`;  the set moves focus),
 *   and the chip inside is plain:  no button, no `copy`.
 *
 * - Tokens (`--ui-brand-color-*`, read through private aliases on `:host`):
 *   the size, radius, border, ring colour and gap, and the tip's background, colour and width.
 *   - An owner makes its chips fill their cell with the private `--_ui-brand-color-fit: 100%` on each chip,
 *     which a page's `--ui-brand-color-size` still beats.
 ****************/
export class UIBrandColor extends UIComponent<BrandColorVocabulary> {
  @proto static vocabulary = brandColorVocabulary
  @protoMerged static elementSetup = {
    styleSheets: { color: colorCSS },
    DOMElement: DOMBrandColorElement,
    delegatesFocus: false
  } satisfies Partial<ElementSetup>

  /** The DOM element, with the `choice` the set writes (`DOMBrandColorElement`);  `declare`, a type only. */
  declare readonly domElement: DOMBrandColorElement

  /** The brand's ink, the dark text colour `Palette.ink()` picks:  what it picks for white. */
  private static readonly INK = Palette.ink(WHITE)

  ////////////////
  // ## State
  ////////////////

  /** What was just copied, `""` once the check has gone. */
  readonly copied = new Cell("")

  /** Timer clearing `copied`. */
  private copiedTimer: CancelablePromise<unknown> | undefined

  ////////////////
  // ## Derived state
  ////////////////

  /** `value` as `#RRGGBB`, or `undefined` when it isn't a colour. */
  readonly hex = createMemo(() => Palette.parse(this.value ?? ""))

  /** Is it one choice of a selectable set?  (The set writes `choice` on the DOM element.) */
  readonly isChoice = createMemo(() => this.domElement.choice?.get() ?? false)

  /** What a click copies, or `undefined`:  not copyable, or a choice (the set takes the click). */
  readonly copyFormat = createMemo((): CopyFormat | undefined => {
    const copy = this.copy
    if (!copy || this.isChoice()) return undefined
    return copy === true ? "hex" : copy
  })

  /** The check shown after a copy;  loaded once the chip can copy. */
  readonly glyph = new IconGlyph({ owner: this, name: () => (this.copyFormat() ? COPIED_ICON : undefined) })

  /** The colour's facts:  ink, contrast of white and ink text, OKLCH;  `undefined` without a colour. */
  readonly facts = createMemo(() => {
    const hex = this.hex()
    if (!hex) return undefined
    const ink = Palette.ink(hex)
    return {
      hex,
      ink,
      ratio: Palette.contrast(ink, hex),
      onWhite: Palette.contrast(WHITE, hex),
      onInk: Palette.contrast(UIBrandColor.INK, hex),
      oklch: Palette.format(hex, "oklch")
    }
  })

  /** Does white or ink text pass AA on it? */
  readonly passes = createMemo(() => (this.facts()?.ratio ?? 0) >= AA_RATIO)

  /** What names the chip:  `name`, else the colour, else `value` as written. */
  readonly displayName = createMemo(() => this.name || this.hex() || this.value || "")

  /** The chip's accessible name:  name, colour and the AA mark when it shows. */
  readonly accessibleName = createMemo(() => {
    const words = [this.name, this.hex() ?? this.value]
    if (this.contrast && this.passes()) words.push(this.translationForKey("aa"))
    return words.filter(Boolean).join(" ")
  })

  /** Text inside the chip (`label`), or `undefined`. */
  readonly labelText = createMemo((): string | undefined => {
    const hex = this.hex()
    switch (this.label) {
      case "hex":
        return hex?.slice(1)
      case "oklch":
        return hex && UIBrandColor.shortOklch(hex)
      case "name":
        return this.name || undefined
      case "step":
        return UIBrandColor.stepOf(this.name)
      default:
        return undefined
    }
  })

  ////////////////
  // ## A choice's ARIA
  //
  // A choice's DOM element is the radio:  its role, checked state and name, through internals.
  ////////////////

  /** `radio` while a choice. */
  @aria("role")
  protected get ariaRole(): string | undefined {
    return this.isChoice() ? "radio" : undefined
  }

  /** `"true"` / `"false"` while a choice:  a radio's "not checked" is spoken. */
  @aria("ariaChecked")
  protected get checkedText(): string | undefined {
    return this.isChoice() ? String(this.selected) : undefined
  }

  /** The chip's name, while a choice. */
  @aria("ariaLabel")
  protected get choiceName(): string | undefined {
    return this.isChoice() ? this.accessibleName() : undefined
  }

  ////////////////
  // ## Element hooks
  ////////////////

  /** `brand`, and `labelled` while text shows inside (the AA mark moves up). */
  protected get extraClass(): string | undefined {
    return this.labelText() ? `${BRAND} ${LABELLED}` : BRAND
  }

  protected cssStates() {
    return { copied: !!this.copied.get(), choice: this.isChoice() }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <>
        <Show when={this.copyFormat()} fallback={this.renderImage()}>
          {this.renderButton()}
        </Show>
        <span class={CLASSES.status} role="status">
          {this.copied.get() ? this.translationForKey("copied", { value: this.copied.get() }) : ""}
        </span>
        <Show when={this.details && this.facts()}>{this.renderTip()}</Show>
      </>
    )
  }

  /** The chip as a copy button. */
  private renderButton(): JSX.Element {
    return (
      <button
        type="button"
        class={this.rootClass}
        part={this.partForName("chip")}
        style={this.chipStyle()}
        aria-label={this.translationForKey("copy", { name: this.displayName() })}
        aria-describedby={this.details ? TIP_ID : undefined}
        onClick={this.onCopy}
      >
        {this.renderInside()}
      </button>
    )
  }

  /** The chip as an image;  plain for a choice, whose DOM element is the radio. */
  private renderImage(): JSX.Element {
    return (
      <span
        class={this.rootClass}
        part={this.partForName("chip")}
        style={this.chipStyle()}
        role={this.isChoice() ? undefined : "img"}
        aria-label={this.isChoice() ? undefined : this.accessibleName() || undefined}
        tabindex={this.details && !this.isChoice() ? "0" : undefined}
        aria-describedby={this.details && !this.isChoice() ? TIP_ID : undefined}
      >
        {this.renderInside()}
      </span>
    )
  }

  /** Inside the chip:  the label, the AA mark, and the check after a copy. */
  private renderInside(): JSX.Element {
    return (
      <>
        <Show when={this.labelText()}>
          <span class={CLASSES.label} part={this.partForName("label")}>
            {this.labelText()}
          </span>
        </Show>
        <Show when={this.contrast && this.passes()}>
          <span class={CLASSES.mark} part={this.partForName("mark")} aria-hidden="true">
            {this.translationForKey("aa")}
          </span>
        </Show>
        <Show when={this.copied.get()}>
          <span class={CLASSES.copied} part={this.partForName("copied")} aria-hidden="true">
            {this.glyph.svg}
          </span>
        </Show>
      </>
    )
  }

  /** The details tip:  name, hex, OKLCH, contrast of white and ink text, and what the shade is good for. */
  private renderTip(): JSX.Element {
    return (
      <div id={TIP_ID} class={CLASSES.tip} part={this.partForName("tip")} role="tooltip">
        <div class={CLASSES.title}>
          <span class={CLASSES.swatch} style={this.chipStyle()} />
          <b>{this.displayName()}</b>
        </div>
        <dl class={CLASSES.rows}>
          <dt>{this.translationForKey("hex")}</dt>
          <dd>{this.facts()?.hex}</dd>
          <dt>{this.translationForKey("oklch")}</dt>
          <dd>{this.facts()?.oklch}</dd>
          <dt>{this.translationForKey("onWhite")}</dt>
          <dd>{this.ratioText(this.facts()?.onWhite)}</dd>
          <dt>{this.translationForKey("onInk")}</dt>
          <dd>{this.ratioText(this.facts()?.onInk)}</dd>
        </dl>
        <div class={CLASSES.note}>{this.note()}</div>
      </div>
    )
  }

  /** The chip's colours:  the colour behind, white or ink in front. */
  private chipStyle(): JSX.CSSProperties | undefined {
    const facts = this.facts()
    return facts && { "background-color": facts.hex, color: facts.ink }
  }

  /** `4.6:1`, plus ` AA` when it passes. */
  private ratioText(ratio: number | undefined): string {
    if (ratio === undefined) return ""
    const text = this.translationForKey("ratio", { ratio: ratio.toFixed(1) })
    return ratio >= AA_RATIO ? `${text} ${this.translationForKey("aa")}` : text
  }

  /** What the shade is good for, by the better of white and ink text (the Chooser's note). */
  private note(): string {
    const facts = this.facts()
    if (!facts) return ""
    if (facts.ratio >= AA_RATIO) {
      return this.translationForKey("goodText", { ink: this.translationForKey(facts.ink === WHITE ? "white" : "dark") })
    }
    return this.translationForKey(facts.ratio >= LARGE_RATIO ? "largeText" : "noText")
  }

  ////////////////
  // ## Copying
  ////////////////

  /** What a click copies as `format`:  the hex, OKLCH, `var(--name)` or `--name: #hex;` (no `name`:  the hex). */
  private copyText(format: CopyFormat): string {
    const hex = this.hex() ?? this.value ?? ""
    const name = this.name
    if (format === "oklch" && this.hex()) return Palette.format(hex, "oklch")
    if (format === "token" && name) return `var(--${name})`
    if (format === "css" && name) return `--${name}: ${hex};`
    return hex
  }

  /**
   * A click:  copy, then `ui-copy` and the check.
   * - SIDE EFFECT:  writes the clipboard.
   */
  private readonly onCopy = async (event: MouseEvent) => {
    const format = untrack(this.copyFormat)
    if (!format) return
    const value = untrack(() => this.copyText(format))
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      return
    }
    this.copied.set(value)
    this.send("ui-copy", { value, originalEvent: event })
    this.copiedTimer?.cancel()
    this.copiedTimer = after(COPIED_MS / 1000, () => this.copied.set(""))
  }

  ////////////////
  // ## Labels
  ////////////////

  /** OKLCH as the Color Palette page labels a chip:  `68 0.05 274` (L %, C to 2 places, H degrees). */
  private static shortOklch(hex: string): string {
    const { l, c, h } = Palette.hexToOklch(hex)
    return `${Math.round(l * 100)} ${c.toFixed(2)} ${Math.round(h)}`
  }

  /** The step of a token name:  its last number (`brand-500` => `500`), or `undefined`. */
  private static stepOf(name: string | undefined): string | undefined {
    return name?.match(/(\d+)$/)?.[1]
  }
}

export interface UIBrandColor extends AttributeValues<BrandColorVocabulary> {}
