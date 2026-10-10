import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UI } from "$/ui/core"
import { F } from "$/ui/forms"

import { brandComposerVocabulary } from "./UIBrandComposer.en"
import { BrandComposerFallback } from "./UIBrandComposer.fallback"
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
} from "./UIBrandComposer.types"

import composerCSS from "./UIBrandComposer.css?inline"

/****************
 * ### `DOMBrandComposerElement`
 * The DOM element of `<ui-brand-composer>`:  a form control's DOM element (`DOMFormControl`), plus `cast()`,
 * so a page can cast what it just put in `value` (the marketing hero's idea chips fill the box and cast at once).
 *
 * - `DOMElement` refuses a member named like an attribute's property:  `cast` is no attribute (`casting` is).
 * - Above the component:  its `elementSetup` reads this class while the component is defined.
 ****************/
export class DOMBrandComposerElement extends F.DOMFormControl<UIBrandComposer> {
  /**
   * Cast the current text, as the Cast button does:  `ui-cast`, then the form's submit.
   * - Returns false when nothing was cast:  empty text, `casting`, `disabled`, not rendered yet, or cancelled.
   */
  cast(): boolean {
    return this.component?.cast() ?? false
  }
}

/****************
 * ### `UIBrandComposer`
 * The component behind `<ui-brand-composer>`:  the brand's "describe your app" box
 * (Spell App's Build form, Spell Marketing's "Try a spell").
 *
 * - Its shadow DOM:  `<div class="composer brand" part="composer">` > the eyebrow (`eyebrow` slot or attribute),
 *   a borderless serif `<textarea part="textarea">`, then the bar:
 *   the `tools` slot (chips), the hint, the round Cast button.
 *
 * - `value` is controlled (`@E.controlled`, as `text`), as `<ui-textarea>`'s:  typing sends `ui-input` first,
 *   and a handler that sets `el.value` again wins.  The ATTRIBUTE is the starting value, which a form reset restores;
 *   no reflection.  Leaving the box edited sends `ui-change`.
 *
 * - Cast:  the button, Cmd / Ctrl+Enter in the box (either key, on any platform), or the DOM element's `cast()`.
 *   - Plain Enter types a new line.
 *   - Nothing happens with blank text, while `casting`, or `disabled`:
 *     the button stays focusable then, `aria-disabled`.
 *   - `ui-cast` is CANCELABLE:  unless cancelled, a composer inside a `<form>` submits it (`requestSubmit()`),
 *     so `name` / `value` reach the form's `submit` handler.
 * - `readonly`:  as `<ui-textarea>`'s, the text box's own `readonly`:  it can't be typed in,
 *   yet casts and submits its text (`:state(readonly)`, `FormComponent.isReadOnly`).
 * - `casting`:  the PAGE sets it while it builds and clears it;  the button spins (still, with reduced motion),
 *   the card is `aria-busy`, and "Casting your spell…" is announced.  The text stays editable.
 * - Grows with its text (`field-sizing: content`, where the browser has it) from `rows` lines,
 *   up to `--ui-brand-composer-max-height`;  elsewhere it stays `rows` tall and scrolls.
 * - The box's name:  `label`, else what names the DOM element (`aria-label`, `<label for>`), else `eyebrow`,
 *   else "Your spell".  The hint is its description (`aria-describedby`), the shortcut its `aria-keyshortcuts`.
 * - A form control:  it submits `value` under `name`.
 ****************/
@E.cssStates("casting")
export class UIBrandComposer extends F.FormComponent<BrandComposerVocabulary> {
  @E.proto static vocabulary = brandComposerVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { composer: composerCSS },
    Fallback: BrandComposerFallback,
    DOMElement: DOMBrandComposerElement
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## The text
  ////////////////

  /**
   * The text:  `value` set by the page, or typed in;  `""` until either.
   * - Named for what it is (epic `spell-element`, J13):  `this.value` stays the attribute.
   */
  @E.controlled("value") accessor text = ""

  /** Nothing to cast:  empty, or only blanks. */
  @E.cssState("empty")
  get isBlank(): boolean {
    return !this.text.trim()
  }

  /** Can't cast now:  blank, `casting` or disabled. */
  get isBlocked(): boolean {
    return this.isBlank || !!this.casting || this.isDisabled
  }

  /** The native text box. */
  private control?: HTMLTextAreaElement

  /** The text box shows the text again, e.g. after a cancelled `ui-input`, or a set from outside. */
  @E.onChange("text", "isReady")
  protected onTextChanged() {
    this.syncControl()
  }

  /** The text box shows the text, if it doesn't already. */
  @E.untracked
  private syncControl() {
    const { control, text } = this
    if (control && control.value !== text) control.value = text
  }

  /** Typing:  `ui-input` first, then the text (unless a handler took over:  the box shows the text again). */
  private readonly onInput = (event: Event) => {
    const next = (event.currentTarget as HTMLTextAreaElement).value
    const applied = this.requestChange("text", next, () => this.send("ui-input", { value: next, originalEvent: event }))
    if (!applied) this.syncControl()
  }

  /** Left the box edited:  `ui-change`. */
  @E.untracked
  private readonly onChange = (event: Event) => {
    this.send("ui-change", { value: this.text, originalEvent: event })
  }

  ////////////////
  // ## Form
  ////////////////

  get formValue(): E.FieldValue {
    return this.text
  }

  /** Back to the `value` ATTRIBUTE (native `defaultValue`). */
  onFormReset() {
    this.text = this.attributes.value ?? ""
  }

  ////////////////
  // ## Casting
  ////////////////

  /**
   * Cast the current text (the button, Cmd / Ctrl+Enter, the DOM element's `cast()`):
   * send `ui-cast`, then, unless cancelled, submit the form.
   * - Reads the members fresh:  a page may set `value` (or `casting`) and cast in one go.
   * - Returns false when nothing was cast (see the class doc), or `ui-cast` was cancelled.
   * - SIDE EFFECT:  `requestSubmit()` on the DOM element's form.
   */
  @E.untracked
  cast(originalEvent?: Event): boolean {
    if (this.isBlocked) return false
    if (!this.send("ui-cast", { value: this.text, originalEvent })) return false
    this.domElement.internals.form?.requestSubmit()
    return true
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

  ////////////////
  // ## Rendering
  ////////////////

  /** Which slots have light-DOM children:  `eyebrow`, `tools`. */
  readonly slots = new E.SlotContent(this.domElement)

  /** The Cast button's arrow, and the spinner it shows while `casting`;  loaded up front, so neither flashes in. */
  readonly glyphs = {
    cast: new E.IconGlyph({ owner: this, name: () => CAST_ICON }),
    casting: new E.IconGlyph({ owner: this, name: () => CASTING_ICON })
  }

  protected get extraClass(): string | undefined {
    return this.size === LARGE ? `${BRAND} ${LARGE}` : BRAND
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("composer")} aria-busy={this.casting ? "true" : undefined}>
        <Show when={this.eyebrow || this.slots.hasContent(this.slotForName("eyebrow"))}>
          <div class={CLASSES.eyebrow} part={this.partForName("eyebrow")}>
            <slot name={this.slotForName("eyebrow")}>{this.eyebrow}</slot>
          </div>
        </Show>
        <textarea
          ref={(element) => (this.control = element)}
          class={CLASSES.textarea}
          part={this.partForName("textarea")}
          rows={this.rowCount}
          style={this.rowsStyle()}
          placeholder={this.placeholder ?? this.translationForKey("placeholder")}
          spellcheck="true"
          aria-label={this.boxName()}
          aria-describedby={this.shownHint ? IDS.hint : undefined}
          aria-keyshortcuts={this.shortcut()}
          disabled={this.isDisabled}
          readonly={this.isReadOnly}
          onInput={this.onInput}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
        />
        <div class={CLASSES.bar} part={this.partForName("bar")}>
          <Show when={this.slots.hasContent(this.slotForName("tools"))}>
            <div class={CLASSES.tools} part={this.partForName("tools")}>
              <slot name={this.slotForName("tools")} />
            </div>
          </Show>
          <Show when={this.shownHint}>
            <span id={IDS.hint} class={CLASSES.hint} part={this.partForName("hint")}>
              {this.shownHint}
            </span>
          </Show>
          <button
            type="button"
            class={CLASSES.cast}
            part={this.partForName("cast")}
            aria-label={this.translationForKey("cast")}
            aria-keyshortcuts={this.shortcut()}
            aria-disabled={this.isBlocked ? "true" : undefined}
            disabled={this.isDisabled}
            onClick={this.onCastClick}
          >
            <Show when={this.casting} fallback={<span class={CLASSES.icon}>{this.glyphs.cast.svg}</span>}>
              <span class={[CLASSES.icon, CLASSES.spin]}>{this.glyphs.casting.svg}</span>
            </Show>
          </button>
        </div>
        <span class={CLASSES.status} role="status">
          {this.casting ? this.translationForKey("casting") : ""}
        </span>
      </div>
    )
  }

  /** `rows`, else `DEFAULT_ROWS`;  at least 1. */
  get rowCount(): number {
    const rows = this.rows
    return typeof rows === "number" && Number.isFinite(rows) ? Math.max(1, Math.round(rows)) : DEFAULT_ROWS
  }

  /** The hint:  `hint`, else the platform's;  `""` hides it. */
  get shownHint(): string {
    return this.hint ?? this.translationForKey(UI.browser.isApple ? "hintApple" : "hintOther")
  }

  /**
   * The text box's inline token:  its `rows`, its least height while it grows with its text.
   * - A method, not an inline object:  Solid's server compile drops the `;` between COMPUTED keys.
   */
  private rowsStyle(): Record<string, string> {
    return { [ROWS_VAR]: String(this.rowCount) }
  }

  /** The text box's name (see the class doc);  tracked. */
  private boxName(): string {
    return this.label || this.labels.accessibleName || this.eyebrow || this.translationForKey("label")
  }

  /** `aria-keyshortcuts` of the cast shortcut, the platform's. */
  private shortcut(): string {
    return UI.browser.isApple ? SHORTCUTS.apple : SHORTCUTS.other
  }
}

export interface UIBrandComposer extends E.AttributeValues<BrandComposerVocabulary> {}
