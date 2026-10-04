import { Show, createMemo, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import { Cell, IconGlyph, proto, UIElement } from "$/ui/core"
import { Palette } from "$/brand"

import { brandColorVocabulary } from "./ui-brand-color.vocabulary.en"
import { BrandColorFallback } from "./ui-brand-color.fallback"
import { BrandColorHost } from "./BrandColorHost"
import {
  AA_RATIO,
  BRAND,
  CLASSES,
  COPIED_ICON,
  COPIED_MS,
  LABELLED,
  LARGE_RATIO,
  RADIO,
  TIP_ID,
  WHITE,
  type BrandColorVocabulary,
  type CopyFormat
} from "./ui-brand-color.types"

import colorCSS from "./ui-brand-color.css?inline"

/****************
 * ### `<ui-brand-color>`
 * A square colour CHIP (the brand's rule:  aspect-ratio 1, 8px radius), as the Color Palette and Color Set Chooser
 * pages draw them:  `<button class="... color brand" part="chip">` with `copy`, else `<span role="img">`, holding the
 * label, the AA mark and, after a copy, a check;  then a hidden status line and the details tip.
 * - `value`:  any colour `Palette.parse()` reads;  drawn as `#RRGGBB`.  Text inside is white or the brand's ink,
 *   whichever contrasts more (`Palette.ink()`).
 * - `copy`:  a click copies (`navigator.clipboard`), dispatches `ui-copy`, shows a check for `COPIED_MS` and
 *   announces "Copied ..." (a status line).  A failed write (no permission) does nothing.
 * - `details`:  a CSS tip under the chip on hover and keyboard focus (anchor-positioned, flipping at the window's
 *   edges), describing the chip;  a chip with no `copy` becomes focusable for it.
 * - A CHOICE of a selectable `<ui-brand-color-set>` (`BrandColorHost.choice`):  the host is the radio (role,
 *   checked, name through internals;  the set moves focus), and the chip inside is plain:  no button, no `copy`.
 * - Tokens (`--ui-brand-color-*`, read through private aliases on `:host`):  size, radius, border, ring colour and
 *   gap, the tip's background, colour and width.  Owners make chips fill their cell with the private
 *   `--_ui-brand-color-fit: 100%` on the host, which a page's `--ui-brand-color-size` still beats.
 ****************/
export class UIBrandColor extends UIElement<BrandColorVocabulary> {
  @proto static vocabulary = brandColorVocabulary
  @proto static styles = { color: colorCSS }
  @proto static Host = BrandColorHost
  @proto static Fallback = BrandColorFallback
  @proto static delegatesFocus = false

  /** The brand's ink, the dark text colour `Palette.ink()` picks:  what it picks for white. */
  private static readonly INK = Palette.ink(WHITE)

  ////////////////
  // ## State
  ////////////////

  /** What was just copied, `""` once the check has gone. */
  readonly copied = new Cell("")

  /** Timer clearing `copied`. */
  private copiedTimer: ReturnType<typeof setTimeout> | undefined

  ////////////////
  // ## Derived state
  ////////////////

  /** `value` as `#RRGGBB`, or `undefined` when it isn't a colour. */
  readonly hex = createMemo(() => Palette.parse(this.attrs.value ?? ""))

  /** One choice of a selectable set?  (The set writes the host's `choice`.) */
  readonly isChoice = createMemo(() => (this.host as BrandColorHost).choice?.get() ?? false)

  /** What a click copies, or `undefined`:  not copyable, or a choice (the set takes the click). */
  readonly copyFormat = createMemo((): CopyFormat | undefined => {
    const copy = this.attrs.copy
    if (!copy || this.isChoice()) return undefined
    return copy === true ? "hex" : copy
  })

  /** The check shown after a copy;  loaded once the chip can copy. */
  readonly glyph = new IconGlyph(this, () => (this.copyFormat() ? COPIED_ICON : undefined))

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
  readonly displayName = createMemo(() => this.attrs.name || this.hex() || this.attrs.value || "")

  /** The chip's accessible name:  name, colour and the AA mark when it shows. */
  readonly accessibleName = createMemo(() => {
    const words = [this.attrs.name, this.hex() ?? this.attrs.value]
    if (this.attrs.contrast && this.passes()) words.push(this.text("aa"))
    return words.filter(Boolean).join(" ")
  })

  /** Text inside the chip (`label`), or `undefined`. */
  readonly labelText = createMemo((): string | undefined => {
    const hex = this.hex()
    switch (this.attrs.label) {
      case "hex":
        return hex?.slice(1)
      case "oklch":
        return hex && UIBrandColor.shortOklch(hex)
      case "name":
        return this.attrs.name || undefined
      case "step":
        return UIBrandColor.stepOf(this.attrs.name)
      default:
        return undefined
    }
  })

  constructor(...args: ConstructorParameters<typeof UIElement>) {
    super(...args)
    // SIDE EFFECT:  a choice's host is the radio:  role, checked and name through internals
    this.hostEffect(
      () => (this.isChoice() ? { checked: this.attrs.selected, label: this.accessibleName() } : undefined),
      (choice) => {
        const { internals } = this.host
        internals.role = choice ? RADIO : null
        internals.ariaChecked = choice ? String(choice.checked) : null
        internals.ariaLabel = choice ? choice.label : null
      }
    )
  }

  ////////////////
  // ## Element hooks
  ////////////////

  /** `brand`, and `labelled` while text shows inside (the AA mark moves up). */
  protected extraClasses(): string | undefined {
    return this.labelText() ? `${BRAND} ${LABELLED}` : BRAND
  }

  protected hostStates() {
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
          {this.copied.get() ? this.text("copied", { value: this.copied.get() }) : ""}
        </span>
        <Show when={this.attrs.details && this.facts()}>{this.renderTip()}</Show>
      </>
    )
  }

  /** The chip as a copy button. */
  private renderButton(): JSX.Element {
    return (
      <button
        type="button"
        class={this.classes()}
        part={this.part("chip")}
        style={this.chipStyle()}
        aria-label={this.text("copy", { name: this.displayName() })}
        aria-describedby={this.attrs.details ? TIP_ID : undefined}
        onClick={this.onCopy}
      >
        {this.renderInside()}
      </button>
    )
  }

  /** The chip as an image (a choice:  plain, the host is the radio). */
  private renderImage(): JSX.Element {
    return (
      <span
        class={this.classes()}
        part={this.part("chip")}
        style={this.chipStyle()}
        role={this.isChoice() ? undefined : "img"}
        aria-label={this.isChoice() ? undefined : this.accessibleName() || undefined}
        tabindex={this.attrs.details && !this.isChoice() ? "0" : undefined}
        aria-describedby={this.attrs.details && !this.isChoice() ? TIP_ID : undefined}
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
          <span class={CLASSES.label} part={this.part("label")}>
            {this.labelText()}
          </span>
        </Show>
        <Show when={this.attrs.contrast && this.passes()}>
          <span class={CLASSES.mark} part={this.part("mark")} aria-hidden="true">
            {this.text("aa")}
          </span>
        </Show>
        <Show when={this.copied.get()}>
          <span class={CLASSES.copied} part={this.part("copied")} aria-hidden="true">
            {this.glyph.svg()}
          </span>
        </Show>
      </>
    )
  }

  /** The details tip:  name, hex, OKLCH, contrast of white and ink text, and what the shade is good for. */
  private renderTip(): JSX.Element {
    return (
      <div id={TIP_ID} class={CLASSES.tip} part={this.part("tip")} role="tooltip">
        <div class={CLASSES.title}>
          <span class={CLASSES.swatch} style={this.chipStyle()} />
          <b>{this.displayName()}</b>
        </div>
        <dl class={CLASSES.rows}>
          <dt>{this.text("hex")}</dt>
          <dd>{this.facts()?.hex}</dd>
          <dt>{this.text("oklch")}</dt>
          <dd>{this.facts()?.oklch}</dd>
          <dt>{this.text("onWhite")}</dt>
          <dd>{this.ratioText(this.facts()?.onWhite)}</dd>
          <dt>{this.text("onInk")}</dt>
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
    const text = this.text("ratio", { ratio: ratio.toFixed(1) })
    return ratio >= AA_RATIO ? `${text} ${this.text("aa")}` : text
  }

  /** What the shade is good for, by the better of white and ink text (the Chooser's note). */
  private note(): string {
    const facts = this.facts()
    if (!facts) return ""
    if (facts.ratio >= AA_RATIO) {
      return this.text("goodText", { ink: this.text(facts.ink === WHITE ? "white" : "dark") })
    }
    return this.text(facts.ratio >= LARGE_RATIO ? "largeText" : "noText")
  }

  ////////////////
  // ## Copying
  ////////////////

  /** What a click copies as `format`:  the hex, OKLCH, `var(--name)` or `--name: #hex;` (no `name`:  the hex). */
  private copyText(format: CopyFormat): string {
    const hex = this.hex() ?? this.attrs.value ?? ""
    const name = this.attrs.name
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
    this.emit("ui-copy", { value, originalEvent: event })
    clearTimeout(this.copiedTimer)
    this.copiedTimer = setTimeout(() => this.copied.set(""), COPIED_MS)
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
