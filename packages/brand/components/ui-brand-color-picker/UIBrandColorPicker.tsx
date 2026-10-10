import { For, Show, createEffect, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import {
  after,
  Cell,
  IconGlyph,
  proto,
  protoMerged,
  SlotContent,
  untracked,
  type CancelablePromise,
  type FieldValue,
  type ElementSetup,
  type AttributeValues
} from "$/ui/core"
import { FormComponent } from "$/ui/forms"
import { Palette, type Hsl, type Oklch } from "$/brand"

import { brandColorPickerVocabulary } from "./UIBrandColorPicker.en"
import { BrandColorPickerFallback } from "./UIBrandColorPicker.fallback"
import {
  BRAND_COLOR,
  CLASSES,
  COPIED_ICON,
  COPIED_MS,
  COPY_ICON,
  DEFAULT_VALUE,
  GREY,
  KEYS,
  ROWS,
  STEPS,
  VARS,
  type BrandColorPickerVocabulary,
  type CopyFormat,
  type Drafts,
  type FieldKey,
  type Row,
  type RowField
} from "./UIBrandColorPicker.types"

import pickerCSS from "./UIBrandColorPicker.css?inline"

/****************
 * ### `UIBrandColorPicker`
 * The component behind `<ui-brand-color-picker>`:  the brand's inline colour picker
 * (the Color Set Chooser's "Choose a colour" popover, without its title and close button).
 *
 * - Its shadow DOM:  `<div class="picker brand color" part="picker">` > the head row
 *   (chip, `header` slot, hex, `actions` slot), the hue slider, the HSL SQUARE for that hue,
 *   the HSL / RGB / OKLCH rows (each with a copy button), then the default slot (e.g. family chips).
 *
 * - The square:  saturation 0 -> 100% across, lightness 100% (top) -> 0% down, for the current hue;
 *   every point is a real sRGB colour.  Drawn by CSS (`UIBrandColorPicker.css`):
 *   two gradients over the hue, exact, since HSL is linear in sRGB along both axes;
 *   a hue change repaints, nothing is computed per pixel.
 * - The colour being edited (`working`) is HSL, apart from `value` (`#RRGGBB`), so a grey keeps its hue (and black
 *   or white their saturation too):  the square and the hue slider don't jump when the colour passes through them.
 * - Keyboard (see the docs page):  the square is two visually hidden native range inputs,
 *   Saturation and Lightness (one tab stop:  the Lightness one is `tabindex=-1`);
 *   on either, Left / Right move S and Up / Down move L by 1% (10% with Shift),
 *   PageUp / PageDown L by 10%, Home / End S to 0 / 100%.
 *   - Each key is `ui-input` then `ui-change`.
 *   - An assistive technology's own increment arrives as their `input`.
 * - Pointer:  press on the square jumps the marker there and drags it (pointer capture);
 *   `ui-input` per new colour, `ui-change` on release.
 *   The hue slider:  `ui-input` per step, `ui-change` on its native `change`.
 * - Typing:  the hex field takes anything `Palette.parse()` reads;
 *   the HSL and OKLCH fields numbers (H in degrees, S / L in %, C plain).
 *   - An OKLCH colour a screen can't show is mapped in (`Palette.oklchToHex()`:  same L and H, less C).
 *   - A valid keystroke is `ui-input`;  unreadable text shows the field's `error` look and changes nothing.
 *   - Enter or leaving the field commits (`ui-change`) and shows the value again;  Escape drops the draft.
 * - Copy buttons:  `hsl(250 54% 55%)` (the HSL row as shown), `#RRGGBB`, `oklch(52.0% 0.181 286)` to the clipboard,
 *   then `ui-copy`, a check for `COPIED_MS`, and "Copied ..." announced.  A refused clipboard write does nothing.
 * - `value` is controlled (`Controlled`) and reflects;  a `ui-input` handler that sets it again wins.
 *   - Its FIRST attribute value is the form's reset value.
 *   - Changes from outside redraw without events.
 * - A form control:  it submits `value` under `name`.
 ****************/
export class UIBrandColorPicker extends FormComponent<BrandColorPickerVocabulary> {
  @proto static vocabulary = brandColorPickerVocabulary
  @protoMerged static elementSetup = {
    styleSheets: { picker: pickerCSS },
    Fallback: BrandColorPickerFallback
  } satisfies Partial<ElementSetup>

  ////////////////
  // ## State
  ////////////////

  /** `value`:  set by the page, or picked;  `DEFAULT_VALUE` until either. */
  readonly valueState = this.controlled("value", undefined)

  /** The colour being edited, HSL (see the class doc). */
  readonly working = new Cell<Hsl>(untrack(() => Palette.hexToHsl(this.hex())))

  /** Text typed in the fields and not committed yet. */
  readonly drafts = new Cell<Drafts>({})

  /** The square's marker is being dragged. */
  readonly dragging = new Cell(false)

  /** What was just copied (its row and text), `undefined` once the check has gone. */
  readonly copied = new Cell<{ format: CopyFormat; value: string } | undefined>(undefined)

  /** Light-DOM slot occupancy:  header, actions, the default slot. */
  readonly slots = new SlotContent(this.domElement)

  /** Each row's copy icon and check, loaded up front so the check shows at once. */
  readonly glyphs = {
    hsl: this.copyGlyphs(),
    hex: this.copyGlyphs(),
    oklch: this.copyGlyphs()
  }

  /** `value` when the element was created:  the form's reset value. */
  private readonly initialValue = untrack(() => this.value)

  // NOTE:  plain mirrors of the cells, for handlers:  a cell's write lands on a microtask, and two events can arrive
  // before it (a test, a fast drag)

  /** `working`, now. */
  private latest: Hsl = untrack(() => this.working.get())

  /** `value`, now. */
  private latestHex = untrack(() => this.hex())

  /** `value` at the last `ui-change` (or outside set):  a commit fires only when it differs. */
  private committedHex = this.latestHex

  /** `drafts`, now. */
  private latestDrafts: Drafts = {}

  /** The square:  pointer target, and what pointer positions are measured against. */
  private plane?: HTMLElement

  /** The square's Saturation slider:  its tab stop, focused on a press. */
  private saturationInput?: HTMLInputElement

  /** Pointer dragging the marker, if any. */
  private dragPointer?: number

  /** Timer clearing `copied`. */
  private copiedTimer: CancelablePromise<unknown> | undefined

  ////////////////
  // ## Values
  ////////////////

  /** The colour, `#RRGGBB`:  `value` read as `Palette.parse()` reads it, else `DEFAULT_VALUE`;  tracked. */
  hex(): string {
    const value = this.valueState.get()
    return (typeof value === "string" ? Palette.parse(value) : undefined) ?? DEFAULT_VALUE
  }

  protected get extraClass(): string | undefined {
    return BRAND_COLOR
  }

  protected cssStates() {
    return { dragging: this.dragging.get(), copied: !!this.copied.get() }
  }

  ////////////////
  // ## Form
  ////////////////

  get formValue(): FieldValue {
    return this.hex()
  }

  /** Back to the first `value`. */
  onFormReset() {
    this.valueState.set(this.initialValue)
  }

  ////////////////
  // ## Wiring
  ////////////////

  /** Adds following outside `value` changes. */
  onMount(): JSX.Element {
    createEffect(
      () => this.hex(),
      (hex) => {
        this.adopt(hex)
      }
    )
    return super.onMount()
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div
        class={this.rootClass}
        part={this.partForName("picker")}
        role="group"
        aria-label={this.groupName()}
        style={this.colorStyle()}
      >
        {this.renderHead()}
        {/* the hue first:  it picks the square's colour (Owen, 2026-10-04) */}
        {this.renderHue()}
        {this.renderPlane()}
        <div class={CLASSES.rows}>
          <For each={ROWS}>{(row) => this.renderRow(row)}</For>
        </div>
        <span class={CLASSES.status} role="status">
          {this.copied.get() ? this.translationForKey("copied", { value: this.copied.get()!.value }) : ""}
        </span>
        <Show when={this.slots.hasContent("")}>
          <div class={CLASSES.families} part={this.partForName("families")}>
            <slot />
          </div>
        </Show>
      </div>
    )
  }

  /** The head row:  chip, the `header` slot over the hex, the `actions` slot at the far end. */
  private renderHead(): JSX.Element {
    return (
      <div class={CLASSES.head} part={this.partForName("head")}>
        <span class={CLASSES.chip} part={this.partForName("chip")} aria-hidden="true" />
        <span class={CLASSES.readout}>
          <slot name={this.slotForName("header")} />
          <span class={CLASSES.hex} part={this.partForName("hex")}>
            {this.hex()}
          </span>
        </span>
        <Show when={this.slots.hasContent(this.slotForName("actions"))}>
          <span class={CLASSES.actions}>
            <slot name={this.slotForName("actions")} />
          </span>
        </Show>
      </div>
    )
  }

  /** The square:  heading + readout, the gradients, the marker, its two hidden sliders. */
  private renderPlane(): JSX.Element {
    return (
      <div class={CLASSES.section}>
        <span class={CLASSES.label}>
          <span id="plane-label">{this.translationForKey("plane")}</span>
          <span class={CLASSES.value} aria-hidden="true">
            {this.translationForKey("planeValue", {
              s: this.percent(this.working.get().s),
              l: this.percent(this.working.get().l)
            })}
          </span>
        </span>
        <div
          ref={(element) => (this.plane = element)}
          class={CLASSES.plane}
          part={this.partForName("plane")}
          role="group"
          aria-labelledby="plane-label"
          onPointerDown={this.onPointerDown}
          onPointerMove={this.onPointerMove}
          onPointerUp={this.onPointerUp}
          onPointerCancel={this.onPointerUp}
        >
          <span class={CLASSES.marker} part={this.partForName("marker")} aria-hidden="true" />
          {this.renderAxis("s")}
          {this.renderAxis("l")}
        </div>
      </div>
    )
  }

  /** One of the square's hidden sliders:  Saturation (the tab stop) or Lightness. */
  private renderAxis(axis: "s" | "l"): JSX.Element {
    const amount = () => this.percent(this.working.get()[axis])
    return (
      <input
        ref={axis === "s" ? (element: HTMLInputElement) => (this.saturationInput = element) : undefined}
        class={CLASSES.axis}
        type="range"
        min="0"
        max="100"
        step="1"
        tabindex={axis === "s" ? undefined : "-1"}
        value={String(amount())}
        aria-label={this.translationForKey(axis === "s" ? "saturation" : "lightness")}
        aria-valuetext={this.translationForKey("percent", { value: amount() })}
        aria-roledescription={this.translationForKey("planeRole")}
        disabled={this.isDisabled}
        onKeyDown={this.onPlaneKeyDown}
        onInput={(event) => this.onAxisInput(axis, event)}
        onChange={this.onCommit}
      />
    )
  }

  /** The hue slider, a native range on the HSL rainbow (the sheet's). */
  private renderHue(): JSX.Element {
    const hue = () => Math.round(this.working.get().h)
    return (
      <div class={CLASSES.section}>
        <span class={CLASSES.label} aria-hidden="true">
          <span>{this.translationForKey("hue")}</span>
          <span class={CLASSES.value}>{this.translationForKey("hueValue", { h: hue() % 360 })}</span>
        </span>
        <input
          class={CLASSES.hue}
          part={this.partForName("hue")}
          type="range"
          min="0"
          max="360"
          step="1"
          value={String(hue())}
          aria-label={this.translationForKey("hue")}
          aria-valuetext={this.translationForKey("hueValue", { h: hue() % 360 })}
          disabled={this.isDisabled}
          onInput={this.onHueInput}
          onChange={this.onCommit}
        />
      </div>
    )
  }

  /** A format row:  its label, its inputs joined in one box, its copy button. */
  private renderRow(row: Row): JSX.Element {
    const labelId = `${row.format}-label`
    const glyphs = this.glyphs[row.format]
    const justCopied = () => this.copied.get()?.format === row.format
    return (
      <div class={CLASSES.row} part={this.partForName("row")} role="group" aria-labelledby={labelId}>
        <span id={labelId} class={CLASSES.rowLabel}>
          {this.translationForKey(row.label)}
        </span>
        <span
          class={[
            CLASSES.field,
            row.format,
            { [CLASSES.error]: row.fields.some((field) => this.isInvalid(field.key)) }
          ]}
        >
          <For each={row.fields}>{(field) => this.renderField(row, field)}</For>
        </span>
        <button
          type="button"
          class={[CLASSES.copy, { [CLASSES.copied]: justCopied() }]}
          part={this.partForName("copy")}
          aria-label={this.translationForKey("copy", { format: this.translationForKey(row.label) })}
          disabled={this.isDisabled}
          onClick={(event) => void this.copy(row.format, event)}
        >
          <Show when={justCopied()} fallback={glyphs.copy.svg}>
            {glyphs.check.svg}
          </Show>
        </button>
      </div>
    )
  }

  /** One input of a row, and its unit. */
  private renderField(row: Row, field: RowField): JSX.Element {
    const key = field.key
    return (
      <span class={[CLASSES.segment, key, { [CLASSES.error]: this.isInvalid(key) }]}>
        <input
          class={CLASSES.input}
          part={this.partForName(row.format === "hex" ? "rgb" : row.format)}
          type="text"
          inputmode={key === "rgb" ? undefined : "decimal"}
          spellcheck="false"
          autocomplete="off"
          placeholder={key === "rgb" ? this.translationForKey("rgbPlaceholder") : undefined}
          aria-label={this.translationForKey(key === "rgb" ? "rgb" : key)}
          title={key === "rgb" ? undefined : this.translationForKey(key)}
          value={this.drafts.get()[key] ?? this.fieldText(key)}
          aria-invalid={this.isInvalid(key) ? "true" : undefined}
          disabled={this.isDisabled}
          onInput={(event) => this.onTextInput(key, event)}
          onKeyDown={(event) => this.onTextKeyDown(key, event)}
          onFocusOut={(event) => this.commitText(key, event)}
        />
        <Show when={field.suffix}>
          <span class={CLASSES.suffix} aria-hidden="true">
            {field.suffix}
          </span>
        </Show>
      </span>
    )
  }

  /**
   * The root's inline tokens:  the marker's place (ratios), the hue, the current colour.
   * - A method, not an inline object:  Solid's server compile drops the `;` between COMPUTED keys.
   */
  private colorStyle(): Record<string, string> {
    const { h, s, l } = this.working.get()
    return {
      [VARS.x]: String(s),
      [VARS.y]: String(1 - l),
      [VARS.hue]: String(h),
      [VARS.color]: this.hex()
    }
  }

  /** The group's name:  `label`, else what names the DOM element, else "Colour". */
  private groupName(): string {
    return this.label ?? this.labels.accessibleName ?? this.translationForKey("group")
  }

  /** What field `key` shows while not typed in:  HSL from `working`, the hex and OKLCH from `value`;  tracked. */
  private fieldText(key: FieldKey): string {
    const { h, s, l } = this.working.get()
    if (key === "hslH") return String(Math.round(h) % 360)
    if (key === "hslS") return String(this.percent(s))
    if (key === "hslL") return String(this.percent(l))
    const hex = this.hex()
    if (key === "rgb") return hex
    const oklch = Palette.hexToOklch(hex)
    if (key === "oklchL") return (oklch.l * 100).toFixed(1)
    // a grey's chroma is a rounding error away from 0:  never `-0.000`
    if (key === "oklchC") return (oklch.c < 0.0005 ? 0 : oklch.c).toFixed(3)
    return Math.round(oklch.h).toFixed(0)
  }

  /** Is field `key`'s draft unreadable?  Tracked. */
  private isInvalid(key: FieldKey): boolean {
    const draft = this.drafts.get()[key]
    if (draft === undefined) return false
    return key === "rgb" ? !Palette.parse(draft) : !Number.isFinite(UIBrandColorPicker.number(draft))
  }

  /** `amount` (0-1) as a whole percentage. */
  private percent(amount: number): number {
    return Math.round(amount * 100)
  }

  /** A copy icon and a check, for one row's button. */
  private copyGlyphs(): { copy: IconGlyph; check: IconGlyph } {
    return {
      copy: new IconGlyph({ owner: this, name: () => COPY_ICON }),
      check: new IconGlyph({ owner: this, name: () => COPIED_ICON })
    }
  }

  ////////////////
  // ## Changes
  ////////////////

  /**
   * Edit the colour to `next` as the user:  send `ui-input` when `value` changes, then set the DOM element's
   * property, unless a handler set it first (then the edit is undone).
   */
  private move(next: Hsl, originalEvent: Event) {
    const previous = this.latest
    this.setWorking(next)
    const hex = Palette.hslToHex(next)
    if (hex === this.latestHex) return
    const applied = this.valueState.request(hex, () => this.send("ui-input", { value: hex, originalEvent }))
    if (applied) this.latestHex = hex
    else this.setWorking(previous)
  }

  /** Commit:  `ui-change` if `value` differs from the last commit. */
  private commit(originalEvent: Event) {
    if (this.latestHex === this.committedHex) return
    this.committedHex = this.latestHex
    this.send("ui-change", { value: this.latestHex, originalEvent })
  }

  /** `value` changed:  from outside (not one of our own edits), follow it without events. */
  private adopt(hex: string) {
    if (hex === this.latestHex) return
    this.latestHex = hex
    this.committedHex = hex
    if (hex !== Palette.hslToHex(this.latest)) this.setWorking(UIBrandColorPicker.fromHex(hex, this.latest))
  }

  /** Write `working` and its mirror. */
  private setWorking(color: Hsl) {
    this.latest = color
    this.working.set(color)
  }

  /** Write `drafts` and its mirror. */
  private setDrafts(drafts: Drafts) {
    this.latestDrafts = drafts
    this.drafts.set(drafts)
  }

  ////////////////
  // ## Copying
  ////////////////

  /** What row `format`'s button copies:  the HSL row as shown, the hex, or `Palette.format()`'s OKLCH. */
  private copyText(format: CopyFormat): string {
    if (format === "hsl") return Palette.formatHsl(this.latest)
    return Palette.format(this.latestHex, format)
  }

  /**
   * A copy button:  write the clipboard, then `ui-copy`, the check and the announcement.
   * - SIDE EFFECT:  writes the clipboard;  a refused write (no permission) does nothing.
   */
  @untracked
  private async copy(format: CopyFormat, originalEvent: MouseEvent) {
    if (this.isDisabled) return
    const value = this.copyText(format)
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      return
    }
    this.copied.set({ format, value })
    this.send("ui-copy", { value, format, originalEvent })
    this.copiedTimer?.cancel()
    this.copiedTimer = after(COPIED_MS / 1000, () => this.copied.set(undefined))
  }

  ////////////////
  // ## Handlers
  ////////////////

  /** Press on the square:  the marker jumps there and is dragged;  the square takes focus. */
  @untracked
  private readonly onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || this.isDisabled || !this.plane) return
    event.preventDefault()
    this.dragPointer = event.pointerId
    try {
      this.plane.setPointerCapture(event.pointerId)
    } catch {
      // not an active pointer (a synthetic event):  moves arrive only while over the square
    }
    this.dragging.set(true)
    this.saturationInput?.focus({ preventScroll: true })
    this.pick(event)
  }

  /** Drag:  follow the pointer. */
  private readonly onPointerMove = (event: PointerEvent) => {
    if (this.dragPointer === event.pointerId) this.pick(event)
  }

  /** Release:  commit. */
  private readonly onPointerUp = (event: PointerEvent) => {
    if (this.dragPointer !== event.pointerId) return
    this.dragPointer = undefined
    if (this.plane?.hasPointerCapture(event.pointerId)) this.plane.releasePointerCapture(event.pointerId)
    this.dragging.set(false)
    this.commit(event)
  }

  /** The colour under the pointer:  S from across, L from up, the current hue. */
  private pick(event: PointerEvent) {
    const box = this.plane!.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width))
    const y = Math.min(1, Math.max(0, (event.clientY - box.top) / box.height))
    this.move({ h: this.latest.h, s: x, l: 1 - y }, event)
  }

  /** A key on the square's sliders (see the class doc):  `ui-input`, then `ui-change`. */
  @untracked
  private readonly onPlaneKeyDown = (event: KeyboardEvent) => {
    const next = this.keyMove(event)
    if (!next) return
    event.preventDefault()
    if (this.isDisabled) return
    this.move(next, event)
    this.commit(event)
  }

  /** Where key `event` moves the colour, or `undefined` for other keys. */
  private keyMove(event: KeyboardEvent): Hsl | undefined {
    const { h, s, l } = this.latest
    const step = event.shiftKey ? STEPS.big : STEPS.small
    const at = UIBrandColorPicker.onPlane
    switch (event.key) {
      case KEYS.up:
        return at(h, s, l + step)
      case KEYS.down:
        return at(h, s, l - step)
      case KEYS.right:
        return at(h, s + step, l)
      case KEYS.left:
        return at(h, s - step, l)
      case KEYS.pageUp:
        return at(h, s, l + STEPS.big)
      case KEYS.pageDown:
        return at(h, s, l - STEPS.big)
      case KEYS.home:
        return at(h, 0, l)
      case KEYS.end:
        return at(h, 1, l)
      default:
        return undefined
    }
  }

  /** A square slider's own `input` (an assistive technology's increment):  its axis to its value. */
  private onAxisInput(axis: "s" | "l", event: Event) {
    const value = (event.currentTarget as HTMLInputElement).valueAsNumber
    if (Number.isFinite(value)) this.move({ ...this.latest, [axis]: value / 100 }, event)
  }

  /** The hue slider moved;  `360` stays `360` (not `0`), so the thumb stays at the end it was dragged to. */
  private readonly onHueInput = (event: Event) => {
    const hue = (event.currentTarget as HTMLInputElement).valueAsNumber
    if (Number.isFinite(hue)) this.move({ ...this.latest, h: hue }, event)
  }

  /** A native `change` (the hue slider released, a square slider's increment):  commit. */
  private readonly onCommit = (event: Event) => {
    this.commit(event)
  }

  /** A keystroke in field `key`:  keep the draft;  if it reads as a colour, edit to it. */
  private onTextInput(key: FieldKey, event: Event) {
    const text = (event.currentTarget as HTMLInputElement).value
    this.setDrafts({ ...this.latestDrafts, [key]: text })
    const next = this.readDraft(key, text)
    if (next) this.move(next, event)
  }

  /** Enter commits field `key`;  Escape drops its draft. */
  private onTextKeyDown(key: FieldKey, event: KeyboardEvent) {
    if (event.key === KEYS.enter) {
      event.preventDefault()
      this.commitText(key, event)
    } else if (event.key === KEYS.escape && this.latestDrafts[key] !== undefined) {
      event.preventDefault()
      this.dropDraft(key)
    }
  }

  /** Commit field `key` (Enter, leaving it):  drop its draft (an unreadable one reverts), then commit. */
  private commitText(key: FieldKey, event: Event) {
    if (this.latestDrafts[key] === undefined) return
    this.dropDraft(key)
    this.commit(event)
  }

  /** Forget field `key`'s draft:  it shows the value again. */
  private dropDraft(key: FieldKey) {
    const { [key]: _dropped, ...rest } = this.latestDrafts
    this.setDrafts(rest)
  }

  /** The colour field `key`'s `text` asks for, or `undefined` if it can't be read. */
  private readDraft(key: FieldKey, text: string): Hsl | undefined {
    if (key === "rgb") {
      const hex = Palette.parse(text)
      return hex ? UIBrandColorPicker.fromHex(hex, this.latest) : undefined
    }
    const number = UIBrandColorPicker.number(text)
    if (!Number.isFinite(number)) return undefined
    const { h, s, l } = this.latest
    const at = UIBrandColorPicker.onPlane
    if (key === "hslH") return at(number, s, l)
    if (key === "hslS") return at(h, number / 100, l)
    if (key === "hslL") return at(h, s, number / 100)
    const oklch: Oklch = Palette.hexToOklch(this.latestHex)
    if (key === "oklchL") oklch.l = Math.min(100, Math.max(0, number)) / 100
    else if (key === "oklchC") oklch.c = Math.max(0, number)
    else oklch.h = ((number % 360) + 360) % 360
    return UIBrandColorPicker.fromHex(Palette.oklchToHex(oklch), this.latest)
  }

  ////////////////
  // ## Colour helpers
  ////////////////

  /**
   * `hex` as HSL, keeping what it can't say from `keep`:
   * - black and white:  `keep`'s hue and saturation (any would do)
   * - a grey:  `keep`'s hue (any would do), saturation 0
   */
  private static fromHex(hex: string, keep: Hsl): Hsl {
    const color = Palette.hexToHsl(hex)
    if (color.l <= 0 || color.l >= 1) return { h: keep.h, s: keep.s, l: color.l }
    return color.s < GREY ? { ...color, h: keep.h } : color
  }

  /** HSL with saturation and lightness kept to 0-1 and the hue to 0-360. */
  private static onPlane(hue: number, saturation: number, lightness: number): Hsl {
    return {
      h: ((hue % 360) + 360) % 360,
      s: Math.min(1, Math.max(0, saturation)),
      l: Math.min(1, Math.max(0, lightness))
    }
  }

  /** A typed number (`67.7`, `67,7`, ` 0.05 `), else `NaN`. */
  private static number(text: string): number {
    const trimmed = text.trim().replace(",", ".")
    return trimmed && /^[-+]?(\d+\.?\d*|\.\d+)$/.test(trimmed) ? Number(trimmed) : Number.NaN
  }
}

export interface UIBrandColorPicker extends AttributeValues<BrandColorPickerVocabulary> {}
