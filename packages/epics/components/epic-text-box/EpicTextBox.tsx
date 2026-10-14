import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { AnswerForm, type AnswerPart, type PageAnswer, type SentAnswer } from "$/epics/answers"

import { epicTextBoxVocabulary } from "./EpicTextBox.en"

import textBoxCSS from "./EpicTextBox.css?inline"

/****************
 * ### `DOMTextBoxElement`
 * The DOM element of `<epic-text-box>`:  its script API, `value`, as a `<textarea>`'s.
 * - The elements that draw a box in their shadow roots read and set it so:
 *   `<epic-ask>` (Other), `<epic-choices-bar>` (the feedback).
 * - Above the component:  its `elementSetup` reads this class while the component is defined.
 ****************/
export class DOMTextBoxElement extends E.DOMElement<EpicTextBox> {
  /** A value set before its component was built:  the component starts with it. */
  startValue = ""

  /** What's typed in it. */
  get value(): string {
    return this.component?.text ?? this.startValue
  }

  /** Put `value` in it (a sent answer coming back):  no `input` event, as a `<textarea>`'s `value`. */
  set value(value: string) {
    if (this.component) this.component.text = value
    else this.startValue = value
  }
}

/****************
 * ### `EpicTextBox`
 * The component behind `<epic-text-box>`:  a box Owen types in, on a page he answers on (epic `epic-workflow` P12).
 * - A `<textarea>`, one line to start, growing with its text to a third of the window (Owen, 2026-10-06:  every
 *   "tell me more" field grows).
 * - What's typed is part of the page's answer, by `type`:
 *   - `notes`:  the page's notes;  `comment`:  the comment on what `for` names (a section, an option `q1-B`);
 *     `other`:  question `for`'s Other
 *   - those three register with the page's `AnswerForm` while connected:  gathered for Send, and shown again from
 *     the answer sent (`gatherInto()`, `showAnswer()`)
 *   - `feedback`:  a syntax-choices page's, which its `<epic-choices-bar>` reads itself (`value`)
 * - Its `input` events are the `<textarea>`'s own:  they bubble out of its shadow root, so the element that draws
 *   it hears them (`onInput`).
 ****************/
export class EpicTextBox extends E.UIComponent<typeof epicTextBoxVocabulary> implements AnswerPart {
  @E.proto static vocabulary = epicTextBoxVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "epic-text-box": textBoxCSS },
    DOMElement: DOMTextBoxElement
  } satisfies Partial<E.ElementSetup>

  /** What's typed in it;  to start with, a `value` set before it was built. */
  @E.state accessor text = (this.domElement as DOMTextBoxElement).startValue ?? ""

  /** Something is typed. */
  @E.cssState("filled")
  get isFilled(): boolean {
    return !!this.text.trim()
  }

  /** Its placeholder:  its own, else its type's. */
  get hint(): string {
    return this.placeholder ?? this.translationForKey(this.type ?? "comment")
  }

  /** The page's form, while it's registered there (a `notes`, `comment` or `other` box). */
  private form: AnswerForm | undefined

  /** While connected, a `notes`, `comment` or `other` box is part of the page's answer;  returns the undo. */
  @E.whileConnected
  protected joinForm() {
    if ((this.type ?? "comment") === "feedback") return undefined
    this.form = AnswerForm.forPage()
    const leave = this.form.add(this)
    return () => {
      leave()
      this.form = undefined
    }
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("base")}>
        <textarea
          class={FIELD}
          part={this.partForName("field")}
          rows="1"
          placeholder={this.hint}
          aria-label={this.label ?? this.hint}
          value={this.text}
          onInput={this.onInput}
        />
      </div>
    )
  }

  /** A keystroke:  the text, and the page's form told. */
  private readonly onInput = (event: InputEvent) => {
    this.text = (event.currentTarget as HTMLTextAreaElement).value
    this.form?.changed()
  }

  ////////////////
  // ## Its part of the answer
  ////////////////

  /** Add what's typed to `page`, by its type:  the notes, a comment, a question's Other;  nothing when blank. */
  gatherInto(page: PageAnswer) {
    const text = this.text.trim()
    const type = this.type ?? "comment"
    if (type === "notes") page.notes = text
    else if (type === "other") {
      if (!this.for) return
      const answer = (page.answers[this.for] ??= { picked: [] })
      if (text) answer.other = text
    } else if (type === "comment" && text && this.for) page.comments[this.for] = text
  }

  /** Show its share of `answer`, as sent. */
  showAnswer(answer: SentAnswer) {
    const type = this.type ?? "comment"
    const id = this.for ?? ""
    if (type === "notes") this.text = answer.notes ?? ""
    else if (type === "other") this.text = answer.answers?.[id]?.other ?? ""
    else if (type === "comment") this.text = answer.comments?.[id] ?? ""
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicTextBox extends E.AttributeValues<typeof epicTextBoxVocabulary> {}

/** Class of the `<textarea>`. */
const FIELD = "field"
