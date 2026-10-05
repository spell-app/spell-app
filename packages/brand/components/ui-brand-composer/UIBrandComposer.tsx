import { Show, createEffect, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import { IconGlyph, proto, SlotContent, UI, type AttributeName, type FieldValue } from "$/ui/core"
import { ControlLabels, FormElement } from "$/ui/forms"

import { brandComposerVocabulary } from "./ui-brand-composer.vocabulary.en"
import { BrandComposerFallback } from "./ui-brand-composer.fallback"
import { BrandComposerHost } from "./BrandComposerHost"
import {
  BRAND,
  CAST_ICON,
  CASTING_ICON,
  CLASSES,
  DEFAULT_ROWS,
  ENTER,
  IDS,
  LARGE,
  ROWS_VAR,
  SHORTCUTS,
  type BrandComposerVocabulary
} from "./ui-brand-composer.types"

import composerCSS from "./ui-brand-composer.css?inline"

/****************
 * ### `<ui-brand-composer>`
 * The brand's "describe your app" box (Spell App's Build form, Spell Marketing's "Try a spell"):
 * `<div class="composer brand" part="composer">` > the eyebrow (`eyebrow` slot or attribute), a borderless serif
 * `<textarea part="textarea">`, then the bar:  the `tools` slot (chips), the hint, the round Cast button.
 * - Value:  auto-controlled (`Controlled`), as `<ui-textarea>`'s:  typing dispatches `ui-input` first, and a handler
 *   that re-sets `el.value` wins;  the ATTRIBUTE is the starting value, restored by form reset;  no reflection.
 *   Leaving the box edited is `ui-change`.
 * - Cast:  the button, Cmd / Ctrl+Enter in the box (either key, on any platform), or the host's `cast()`.  Plain
 *   Enter types a newline.  Nothing happens with blank text, while `casting` or `disabled`:  the button stays
 *   focusable then, `aria-disabled`.  `ui-cast` is CANCELABLE:  unless vetoed, a host inside a `<form>` submits it
 *   (`requestSubmit()`), so `name` / `value` reach the form's `submit` handler.
 * - `casting`:  the PAGE sets it while it builds and clears it;  the button spins (still, with reduced motion), the
 *   card is `aria-busy`, and "Casting your spell…" is announced.  The text stays editable.
 * - Grows with its text (`field-sizing: content`, where the browser has it) from `rows` lines, up to
 *   `--ui-brand-composer-max-height`;  elsewhere it stays `rows` tall and scrolls.
 * - Name of the box:  `label`, else what names the host (`aria-label`, `<label for>`), else `eyebrow`, else
 *   "Your spell";  the hint is its description (`aria-describedby`), the shortcut its `aria-keyshortcuts`.
 * - Form:  `value` under `name`.
 ****************/
export class UIBrandComposer extends FormElement<BrandComposerVocabulary> {
  @proto static vocabulary = brandComposerVocabulary
  @proto static styles = { composer: composerCSS }
  @proto static Fallback = BrandComposerFallback
  @proto static Host = BrandComposerHost

  ////////////////
  // ## State
  ////////////////

  /** `value`:  the host's property, else `""`. */
  readonly valueState = this.controlled("value", "")

  /** Light-DOM slot occupancy:  `eyebrow`, `tools`. */
  readonly slots = new SlotContent(this.host)

  /** Host `<label>`s and `aria-label`, as the text box's name. */
  readonly labels = new ControlLabels(this.formHost)

  /** The Cast button's arrow, and the spinner it shows while `casting`;  loaded up front, so neither flashes in. */
  readonly glyphs = {
    cast: new IconGlyph(this, () => CAST_ICON),
    casting: new IconGlyph(this, () => CASTING_ICON)
  }

  /** The native text box. */
  private control?: HTMLTextAreaElement

  ////////////////
  // ## Values
  ////////////////

  /** The text;  tracked. */
  value(): string {
    return String(this.valueState.get() ?? "")
  }

  /** Nothing to cast:  empty, or only blanks;  tracked. */
  isBlank(): boolean {
    return !this.value().trim()
  }

  isDisabled(): boolean {
    return this.attrs.disabled || this.formDisabled.get()
  }

  /** Can't cast now:  blank, `casting` or disabled;  tracked. */
  isBlocked(): boolean {
    return this.isBlank() || this.attrs.casting || this.isDisabled()
  }

  protected classValue(name: AttributeName<BrandComposerVocabulary>): unknown {
    if (name === "disabled") return this.isDisabled()
    return super.classValue(name)
  }

  protected extraClasses(): string | undefined {
    return this.attrs.size === LARGE ? `${BRAND} ${LARGE}` : BRAND
  }

  protected hostStates() {
    return { empty: this.isBlank(), casting: this.attrs.casting, disabled: this.isDisabled() }
  }

  ////////////////
  // ## Form
  ////////////////

  formValue(): FieldValue {
    return this.value()
  }

  protected formName(): string | undefined {
    return this.attrs.name
  }

  /** Back to the `value` ATTRIBUTE (native `defaultValue`). */
  formReset() {
    const { attribute } = this.definition.attribute("value")
    this.valueState.set(this.host.getAttribute(attribute) ?? "")
  }

  ////////////////
  // ## Wiring
  ////////////////

  /** Adds the value sync (host value => text box, after DOM updates) and the labels' refresh. */
  mount(): JSX.Element {
    createEffect(
      () => [this.value(), this.loaded()],
      () => {
        this.syncControl()
      }
    )
    createEffect(
      () => this.connected.get(),
      (connected) => {
        if (connected) this.labels.refresh()
      }
    )
    return super.mount()
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("composer")} aria-busy={this.attrs.casting ? "true" : undefined}>
        <Show when={this.attrs.eyebrow || this.slots.has(this.slot("eyebrow"))}>
          <div class={CLASSES.eyebrow} part={this.part("eyebrow")}>
            <slot name={this.slot("eyebrow")}>{this.attrs.eyebrow}</slot>
          </div>
        </Show>
        <textarea
          ref={(element) => (this.control = element)}
          class={CLASSES.textarea}
          part={this.part("textarea")}
          rows={this.rows()}
          style={this.rowsStyle()}
          placeholder={this.attrs.placeholder ?? this.text("placeholder")}
          spellcheck="true"
          aria-label={this.boxName()}
          aria-describedby={this.hint() ? IDS.hint : undefined}
          aria-keyshortcuts={this.shortcut()}
          disabled={this.isDisabled()}
          onInput={this.onInput}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
        />
        <div class={CLASSES.bar} part={this.part("bar")}>
          <Show when={this.slots.has(this.slot("tools"))}>
            <div class={CLASSES.tools} part={this.part("tools")}>
              <slot name={this.slot("tools")} />
            </div>
          </Show>
          <Show when={this.hint()}>
            <span id={IDS.hint} class={CLASSES.hint} part={this.part("hint")}>
              {this.hint()}
            </span>
          </Show>
          <button
            type="button"
            class={CLASSES.cast}
            part={this.part("cast")}
            aria-label={this.text("cast")}
            aria-keyshortcuts={this.shortcut()}
            aria-disabled={this.isBlocked() ? "true" : undefined}
            disabled={this.isDisabled()}
            onClick={this.onCastClick}
          >
            <Show when={this.attrs.casting} fallback={<span class={CLASSES.icon}>{this.glyphs.cast.svg()}</span>}>
              <span class={[CLASSES.icon, CLASSES.spin]}>{this.glyphs.casting.svg()}</span>
            </Show>
          </button>
        </div>
        <span class={CLASSES.status} role="status">
          {this.attrs.casting ? this.text("casting") : ""}
        </span>
      </div>
    )
  }

  /** `rows`, else `DEFAULT_ROWS`;  at least 1. */
  private rows(): number {
    const rows = this.attrs.rows
    return typeof rows === "number" && Number.isFinite(rows) ? Math.max(1, Math.round(rows)) : DEFAULT_ROWS
  }

  /**
   * The text box's inline token:  its `rows`, its least height while it grows with its text.
   * - A method, not an inline object:  Solid's server compile drops the `;` between COMPUTED keys.
   */
  private rowsStyle(): Record<string, string> {
    return { [ROWS_VAR]: String(this.rows()) }
  }

  /** The text box's name (see the class doc);  tracked. */
  private boxName(): string {
    return this.attrs.label || this.labels.name() || this.attrs.eyebrow || this.text("label")
  }

  /** The hint:  `hint`, else the platform's;  `""` hides it.  Tracked. */
  private hint(): string {
    return this.attrs.hint ?? this.text(UI.browser.isApple ? "hintApple" : "hintOther")
  }

  /** `aria-keyshortcuts` of the cast shortcut, the platform's. */
  private shortcut(): string {
    return UI.browser.isApple ? SHORTCUTS.apple : SHORTCUTS.other
  }

  ////////////////
  // ## Casting
  ////////////////

  /**
   * Cast the current text (the button, Cmd / Ctrl+Enter, the host's `cast()`):  `ui-cast`, then, unless vetoed, the
   * host's form is submitted.
   * - Reads the host's PROPERTIES, not the signals:  a page may set `value` (or `casting`) and cast in one go, before
   *   the signals' writes land.
   * - Returns false when nothing was cast (see the class doc), or `ui-cast` was vetoed.
   * - SIDE EFFECT:  `requestSubmit()` on the host's form.
   */
  cast(originalEvent?: Event): boolean {
    const value = this.current()
    if (!value.trim() || this.hostFlag("casting") || this.hostFlag("disabled") || untrack(this.formDisabled.get)) {
      return false
    }
    if (!this.emit("ui-cast", { value, originalEvent })) return false
    this.formHost.internals.form?.requestSubmit()
    return true
  }

  /** The text now:  the host's `value` property (synchronous), else `""`. */
  private current(): string {
    const value = this.hostProperty("value")
    return typeof value === "string" ? value : ""
  }

  /** Boolean attribute `name`'s host property, now. */
  private hostFlag(name: "casting" | "disabled"): boolean {
    return !!this.hostProperty(name)
  }

  /** Attribute `name`'s host property, read synchronously (the fork's stored value, not the signal). */
  private hostProperty(name: AttributeName<BrandComposerVocabulary>): unknown {
    const { property } = this.definition.attribute(name)
    return (this.host as unknown as Record<string, unknown>)[property]
  }

  /** The text box shows the host's value again, e.g. after a vetoed `ui-input` or an outside set. */
  private syncControl() {
    const { control } = this
    const value = this.current()
    if (control && control.value !== value) control.value = value
  }

  ////////////////
  // ## Handlers
  ////////////////

  /** Typing:  `ui-input` first, then the value (unless a handler took over). */
  private readonly onInput = (event: Event) => {
    const next = (event.currentTarget as HTMLTextAreaElement).value
    const applied = this.valueState.request(next, () => this.emit("ui-input", { value: next, originalEvent: event }))
    if (!applied) queueMicrotask(() => this.syncControl())
  }

  /** Left the box edited:  `ui-change`. */
  private readonly onChange = (event: Event) => {
    this.emit("ui-change", { value: this.current(), originalEvent: event })
  }

  /** Cmd / Ctrl+Enter casts;  plain Enter (and Enter while composing) types as usual. */
  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== ENTER || !(event.metaKey || event.ctrlKey) || event.isComposing) return
    event.preventDefault()
    this.cast(event)
  }

  /** The Cast button. */
  private readonly onCastClick = (event: MouseEvent) => {
    this.cast(event)
  }
}
