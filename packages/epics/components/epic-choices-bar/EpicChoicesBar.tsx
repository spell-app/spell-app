import { Show } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { ChoicesForm } from "$/epics/answers"
import type { DOMTextBoxElement } from "$/epics/components/epic-text-box/EpicTextBox"
// the feedback box:  its barrel first, so it's defined wherever the bar is
import "$/epics/components/epic-text-box"

import { epicChoicesBarVocabulary } from "./EpicChoicesBar.en"

import barCSS from "./EpicChoicesBar.css?inline"
import tooltipCSS from "$/epics/components/epic-item/Tooltip.css?inline"

/****************
 * ### `EpicChoicesBar`
 * The component behind `<epic-choices-bar>`:  a syntax-choices page's bar (epic `epic-workflow` P12), pinned to the
 * window's bottom while the rows scroll above it;  ivory, as the page's toolbar at the top (Owen, 2026-10-13).
 * - Draws the page's `ChoicesForm`:
 *   - the feedback box (it grows with its text), then "Do it", whose tooltip counts the changed boxes
 *   - under them:  Expand all, and the save status only when a save FAILED (Owen, 2026-10-13:  "Lose the `0 boxes
 *     saved` bit")
 *   - then why "Do it" failed, or what it sent ("Sent to Claude at 14:04 ...";  orange once changed since)
 * - SIDE EFFECT:  as it connects, the form brings back what was typed and sent before (`ChoicesForm.restore()`),
 *   and saves what's typed as the page goes away (`ChoicesForm.watch()`).
 ****************/
export class EpicChoicesBar extends E.UIComponent<typeof epicChoicesBarVocabulary> {
  @E.proto static vocabulary = epicChoicesBarVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "epic-tooltip": tooltipCSS, "epic-choices-bar": barCSS },
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  /** The page's form;  none in a server render. */
  readonly form = isServer ? undefined : ChoicesForm.forPage()

  /** The form's `version`, as last heard:  the getters below read it, so the bar redraws on each change. */
  @E.state accessor version = 0

  /** Every section of rows is open:  the button says Collapse all. */
  @E.state accessor isAllOpen = false

  /** Changed since the answer was sent. */
  @E.cssState("stale")
  get isStale(): boolean {
    void this.version
    return !!this.form?.isStale
  }

  /** The feedback brought back from the draft (or the answer):  it goes into the box, once. */
  @E.state accessor restoredFeedback = ""

  /** While connected:  follow the form, save as the page goes away, and bring back what was typed;  the undo. */
  @E.whileConnected
  protected followForm() {
    const form = this.form
    if (!form) return undefined
    this.version = form.version
    const unsubscribe = form.subscribe(() => (this.version = form.version))
    const unwatch = form.watch(window)
    void this.restore(form)
    return () => {
      unsubscribe()
      unwatch()
    }
  }

  /** What was typed and sent before, back:  the feedback into its box;  the Expand all button as the folds stand. */
  private async restore(form: ChoicesForm) {
    await form.restore()
    this.restoredFeedback = form.feedback
    // the docs runtime puts back the reader's folds by the frame after `<ui-section>` defines
    await customElements.whenDefined("ui-section")
    E.beforeNextPaint(() => (this.isAllOpen = ChoicesForm.isAllOpen(document)))
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("base")}>
        <div class={ROW}>
          <epic-text-box
            class={FEEDBACK}
            part={this.partForName("feedback")}
            type="feedback"
            prop:value={this.restoredFeedback}
            onInput={this.onFeedback}
          />
          <ui-button
            class={SEND}
            part={this.partForName("send")}
            primary=""
            circular=""
            icon="paper plane"
            loading={this.isSending ? "" : undefined}
            title={this.sendTip}
            onClick={this.onSend}
          >
            {this.translationForKey("doIt")}
          </ui-button>
        </div>
        <div class={META} part={this.partForName("meta")}>
          <Show when={this.saveError}>
            <span class={FAILED}>{this.saveError}</span>
          </Show>
          <ui-button
            class={EXPAND}
            part={this.partForName("expand")}
            size="mini"
            basic=""
            circular=""
            icon={this.isAllOpen ? "angles up" : "angles down"}
            onClick={this.onExpand}
          >
            {this.translationForKey(this.isAllOpen ? "collapseAll" : "expandAll")}
          </ui-button>
        </div>
        <Show when={this.error}>
          <p class={ERROR} part={this.partForName("error")} role="alert">
            {this.error}
          </p>
        </Show>
        <Show when={this.sentText}>
          <p class={SENT} part={this.partForName("sent")} role="status">
            {this.sentText}
          </p>
        </Show>
      </div>
    )
  }

  ////////////////
  // ## What it shows
  ////////////////

  /** "Do it"'s tooltip:  how many boxes changed, of how many. */
  get sendTip(): string {
    void this.version
    const { rows, changed } = this.form?.counts ?? { rows: 0, changed: 0 }
    return this.translationForKey("sendTip", { changed: String(changed), rows: String(rows) })
  }

  /** "Do it" on its way:  it spins. */
  get isSending(): boolean {
    void this.version
    return !!this.form?.isSending
  }

  /** The save status, only when a save failed;  else `""`. */
  get saveError(): string {
    void this.version
    return this.form?.isSaveError ? this.form.savedText : ""
  }

  /** Why "Do it" failed;  `""` for none. */
  get error(): string {
    void this.version
    return this.form?.error ?? ""
  }

  /** What was sent;  `""` before. */
  get sentText(): string {
    void this.version
    return this.form?.sentText ?? ""
  }

  ////////////////
  // ## Events
  ////////////////

  /** A keystroke in the feedback. */
  private readonly onFeedback = (event: InputEvent) => {
    this.form?.setFeedback((event.currentTarget as DOMTextBoxElement).value)
  }

  /** "Do it". */
  private readonly onSend = () => {
    void this.form?.send()
  }

  /** Expand all, or Collapse all. */
  private readonly onExpand = () => {
    this.isAllOpen = ChoicesForm.expandAll(document)
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicChoicesBar extends E.AttributeValues<typeof epicChoicesBarVocabulary> {}

/** Classes of the shadow markup. */
const ROW = "row"

const FEEDBACK = "feedback"
const SEND = "send"
const META = "meta"
const FAILED = "failed"
const EXPAND = "expand"
const ERROR = "error"
const SENT = "sent"
