import { Show } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { AnswerForm, type SendFill } from "$/epics/answers"

import { epicSendVocabulary } from "./EpicSend.en"

import sendCSS from "./EpicSend.css?inline"
import tooltipCSS from "$/epics/components/epic-item/Tooltip.css?inline"

/****************
 * ### `EpicSend`
 * The component behind `<epic-send>`:  a details page's Send (epic `epic-workflow` P12), in its sticky header.
 * - Draws the page's `AnswerForm`:
 *   - where the answer stands:  "Not sent", "Changes not sent", "Sent 10/8/26 14:34 · 5 of 17 decided"
 *   - the round Send, blue as every Send is, by the fill rule (`templates/epics/plan-doc.md`, "Colours"):
 *     a grey outline with nothing to send, dashed with changes not sent, an outline once sent;
 *     never solid, since the page can't tell when Claude is done with it
 *   - the draft's save, muted beside them ("draft saved 14:04";  orange when it can't save to the page server:
 *     the browser still keeps it;  epic `epic-workflow` P18)
 *   - why the last send failed, under them
 * - A click sends the whole page (`AnswerForm.send()`):  partial answers too, again whenever Owen likes.
 * - SIDE EFFECT:  as it connects, the page's form reads back the answer already sent (`AnswerForm.load()`), and any
 *   draft newer than it, which every question and box shows;  and saves the draft as the page goes away
 *   (`AnswerForm.watch()`).
 ****************/
export class EpicSend extends E.UIComponent<typeof epicSendVocabulary> {
  @E.proto static vocabulary = epicSendVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "epic-tooltip": tooltipCSS, "epic-send": sendCSS },
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  /** The page's form;  none in a server render. */
  readonly form = isServer ? undefined : AnswerForm.forPage()

  /** The form's `version`, as last heard:  every getter below reads it, so the bar redraws on each change. */
  @E.state accessor version = 0

  /** Where the answer stands, for Send's fill. */
  get fill(): SendFill {
    void this.version
    return this.form?.fill ?? "rest"
  }

  /** Something not sent yet. */
  @E.cssState("pending")
  get isPending(): boolean {
    return this.fill === "pending"
  }

  /** The page as sent. */
  @E.cssState("sent")
  get isSent(): boolean {
    return this.fill === "sent"
  }

  /** The words beside Send, and their colour. */
  get stateLine(): { text: string; color: string } {
    void this.version
    return this.form?.stateLine ?? { text: "", color: "grey" }
  }

  /** Why the last send failed;  `""` for none. */
  get error(): string {
    void this.version
    return this.form?.error ?? ""
  }

  /** The draft's save, and whether it failed (`AnswerForm.draftText`). */
  get draftLine(): { text: string; isError: boolean } {
    void this.version
    return { text: this.form?.draftText ?? "", isError: !!this.form?.isDraftError }
  }

  /** A send on its way:  Send spins. */
  get isSending(): boolean {
    void this.version
    return !!this.form?.isSending
  }

  /**
   * While connected:  follow the page's form, read back the answer already sent (and a draft), and save the draft as
   * the page goes away;  returns the undo.
   */
  @E.whileConnected
  protected followForm() {
    const form = this.form
    if (!form) return undefined
    this.version = form.version
    void form.load()
    const unwatch = form.watch(window)
    const unsubscribe = form.subscribe(() => (this.version = form.version))
    return () => {
      unsubscribe()
      unwatch()
    }
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("base")}>
        <div class={ROW}>
          <span class={STATE} part={this.partForName("state")} data-color={this.stateLine.color}>
            {this.stateLine.text}
          </span>
          <Show when={this.draftLine.text}>
            <span
              class={DRAFT}
              part={this.partForName("draft")}
              data-error={this.draftLine.isError ? "" : undefined}
              title={this.draftLine.text}
            >
              {this.draftLine.text}
            </span>
          </Show>
          <ui-button
            class={SEND}
            part={this.partForName("send")}
            basic=""
            circular=""
            icon="paper plane"
            color={this.fill === "rest" ? undefined : "blue"}
            data-fill={this.fill}
            loading={this.isSending ? "" : undefined}
            aria-label={this.translationForKey("send")}
            title={this.translationForKey("sendTip")}
            onClick={this.onSend}
          />
        </div>
        <Show when={this.error}>
          <p class={ERROR} part={this.partForName("error")} role="alert">
            {this.error}
          </p>
        </Show>
      </div>
    )
  }

  /** Send, clicked. */
  private readonly onSend = () => {
    void this.form?.send()
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicSend extends E.AttributeValues<typeof epicSendVocabulary> {}

/** Classes of the shadow markup. */
const ROW = "row"
const STATE = "state"
const DRAFT = "draft"
const SEND = "send"
const ERROR = "error"
