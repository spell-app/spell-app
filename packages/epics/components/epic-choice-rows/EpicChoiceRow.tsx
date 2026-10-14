import { For, Show } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { ChoicesForm, type ChoiceRowPart } from "$/epics/answers"

import { epicChoiceRowVocabulary } from "./EpicChoiceRow.en"
import { ROW_TAG, ROWS_TAG } from "./EpicChoiceRows.types"

import rowsCSS from "./EpicChoiceRows.css?inline"

/****************
 * ### `EpicChoiceRow`
 * The component behind `<epic-choice-row>`:  one row of a syntax-choices page (epic `epic-workflow` P12).
 * - Its cells, on its `<epic-choice-rows>`' columns (the table's `no-file`, `stacked` and `reorder` say which):
 *   - Order, with `reorder` (epic `epic-workflow` P15):  its place, and move up / move down, which swap it with the
 *     row above or below.  The neighbour is the element moved, so this row keeps the focus for the next press.
 *   - File:  the file's name and line, a link into VS Code (`vscode://file/...:<line>`);  its folder under it.
 *     In VS Code's side bar the page's frame can't follow `vscode://`, so a click there goes to the view as
 *     `{ spell: "open", kind: "external" }`, which hands it to VS Code (`packages/vscode/src/DocView.ts`).
 *   - Purpose:  the purpose, `stays` when Claude would keep it, the note under it
 *   - Current:  today's text, as code
 *   - Recommended:  the box, pre-filled with Claude's call;  one line of text that wraps and grows (Enter adds no
 *     line, a pasted line break goes);  changed, it's orange, with a round button putting the recommendation back
 * - Registered with the page's `ChoicesForm` while connected:  its box is saved in the draft, and sent with
 *   "Do it" when it differs from the recommendation.
 ****************/
export class EpicChoiceRow extends E.UIComponent<typeof epicChoiceRowVocabulary> implements ChoiceRowPart {
  @E.proto static vocabulary = epicChoiceRowVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "epic-choice-rows": rowsCSS },
    delegatesFocus: false,
    aria: { role: "row" }
  } satisfies Partial<E.ElementSetup>

  /** What Owen typed (or a draft brought back);  `undefined` until then:  the recommendation. */
  @E.state accessor typed: string | undefined = undefined

  /** What its box holds now. */
  get value(): string {
    return this.typed ?? this.recommended ?? ""
  }

  /** Its id:  its box's key. */
  get rowName(): string {
    return this.name ?? ""
  }

  /** Its box differs from the recommendation (trimmed). */
  @E.cssState("changed")
  get isChanged(): boolean {
    return this.value.trim() !== (this.recommended ?? "")
  }

  /** Claude would keep it as it is. */
  @E.cssState("stays")
  get isKept(): boolean {
    return this.recommended === this.current
  }

  /** Its table's layout:  no File column, Current and Recommended stacked, rows in order.  Read again as it connects. */
  @E.state accessor layout = EpicChoiceRow.layoutOf(this.domElement)

  /** The page's form's `version`, as last heard:  `place` reads it, so a move elsewhere redraws it. */
  @E.state accessor version = 0

  /** Its table's key when Owen puts its rows in order:  its section's id (`ChoiceRowPart`). */
  get orderKey(): string | undefined {
    if (isServer || !this.layout.reorder) return undefined
    return this.domElement.closest("ui-section")?.id ?? ROWS_TAG
  }

  /** Its place among its table's rows, from 0. */
  get orderIndex(): number {
    if (isServer) return 0
    return this.siblings.indexOf(this.domElement)
  }

  /** Its place, from 1, for the Order cell. */
  get place(): number {
    void this.version
    return this.orderIndex + 1
  }

  /** It's the last of its table's rows:  no move down. */
  get isLast(): boolean {
    void this.version
    const siblings = this.siblings
    return siblings.at(-1) === this.domElement
  }

  /** Its table's rows' elements, itself among them. */
  private get siblings(): Element[] {
    return Array.from(this.domElement.parentElement?.children ?? []).filter((each) => each.localName === ROW_TAG)
  }

  /** Its box, as drawn. */
  private box: HTMLTextAreaElement | undefined

  /** The page's form, while it's registered there. */
  private form: ChoicesForm | undefined

  /**
   * While connected:  its table's layout read, its box part of the page's form, and the form followed (a move redraws
   * every place);  returns the undo.
   */
  @E.whileConnected
  protected joinForm() {
    this.layout = EpicChoiceRow.layoutOf(this.domElement)
    const form = ChoicesForm.forPage()
    this.form = form
    const leave = form.add(this)
    this.version = form.version
    const unsubscribe = form.subscribe(() => (this.version = form.version))
    return () => {
      unsubscribe()
      leave()
      this.form = undefined
    }
  }

  /** Put `value` in its box:  a draft or an answer coming back. */
  showValue(value: string) {
    this.typed = value
  }

  ////////////////
  // ## Drawing
  ////////////////

  render(): JSX.Element {
    return (
      <div class={[this.rootClass, ROW_BOX]} part={this.partForName("base")}>
        <Show when={this.layout.reorder}>{this.orderCell()}</Show>
        <Show when={!this.layout.noFile}>{this.fileCell()}</Show>
        <div class={[CELL, PURPOSE]} part={this.partForName("purpose")} role="cell">
          {this.purpose}
          <Show when={this.isKept}>
            {" "}
            <ui-label class={STAYS} size="mini" basic="">
              {this.translationForKey("stays")}
            </ui-label>
          </Show>
          <Show when={this.note}>
            <div class={NOTE}>{this.withCode(this.note ?? "")}</div>
          </Show>
        </div>
        <Show when={!this.layout.stacked}>
          <div class={[CELL, CURRENT]} part={this.partForName("current")} role="cell">
            <code>{this.current}</code>
          </div>
        </Show>
        <div class={[CELL, PICK]} part={this.partForName("pick")} role="cell">
          <Show when={this.layout.stacked}>
            <code class={WAS}>{this.current}</code>
          </Show>
          <div class={FIELD}>
            <textarea
              ref={(element) => (this.box = element)}
              class={BOX}
              part={this.partForName("box")}
              rows="1"
              spellcheck={false}
              autocomplete="off"
              aria-label={this.translationForKey("boxLabel", { current: this.current ?? "" })}
              value={this.value}
              onInput={this.onInput}
              onKeyDown={this.onKeyDown}
            />
            <Show when={this.isChanged}>
              <button
                type="button"
                class={RESET}
                part={this.partForName("reset")}
                aria-label={this.translationForKey("reset")}
                title={this.translationForKey("resetTip", { recommended: this.recommended ?? "" })}
                onClick={this.onReset}
              >
                <ui-icon name="clock rotate left" />
              </button>
            </Show>
          </div>
        </div>
      </div>
    )
  }

  /** The Order cell:  its place, then move up and move down (none past either end). */
  private orderCell(): JSX.Element {
    return (
      <div class={[CELL, ORDER]} part={this.partForName("order")} role="cell">
        <span class={PLACE}>{this.place}</span>
        <button
          type="button"
          class={MOVE}
          part={this.partForName("up")}
          aria-label={this.translationForKey("up")}
          title={this.translationForKey("up")}
          disabled={this.place === 1}
          onClick={this.onUp}
        >
          <ui-icon name="chevron up" />
        </button>
        <button
          type="button"
          class={MOVE}
          part={this.partForName("down")}
          aria-label={this.translationForKey("down")}
          title={this.translationForKey("down")}
          disabled={this.isLast}
          onClick={this.onDown}
        >
          <ui-icon name="chevron down" />
        </button>
      </div>
    )
  }

  /** The File cell:  name and line as a link into VS Code, the folder under it (`packages/` left off). */
  private fileCell(): JSX.Element {
    const file = this.file ?? ""
    const slash = file.lastIndexOf("/")
    return (
      <div class={[CELL, FILE]} part={this.partForName("file")} role="cell">
        <a
          class={LINK}
          href={this.fileUrl}
          title={this.translationForKey("openTip", { file, line: String(this.line ?? 1) })}
          onClick={this.onOpenFile}
        >
          {file.slice(slash + 1)}
          <span class={LINE}>:{this.line}</span>
        </a>
        <div class={FOLDER}>{file.slice(0, Math.max(slash, 0)).replace(/^packages\//, "")}</div>
      </div>
    )
  }

  /** Its file at its line, for VS Code;  `#` off the page server. */
  get fileUrl(): string {
    if (isServer) return "#"
    const server = (window as { SPELL_SERVER?: { root?: string } }).SPELL_SERVER
    return ChoicesForm.fileUrl(this.file ?? "", this.line ?? 1, { root: server?.root, pathname: location.pathname })
  }

  /** `text` with its `` `code` `` spans as code. */
  private withCode(text: string): JSX.Element {
    const pieces = text.split(/`([^`]+)`/)
    return (
      <For each={pieces} keyed={false}>
        {(piece, index) => (index % 2 ? <code>{piece()}</code> : piece())}
      </For>
    )
  }

  ////////////////
  // ## Events
  ////////////////

  /** A keystroke in the box:  one line of text (a pasted line break goes);  the form told. */
  private readonly onInput = (event: InputEvent) => {
    const box = event.currentTarget as HTMLTextAreaElement
    if (/\n/.test(box.value)) box.value = box.value.replace(/\s*\n\s*/g, " ")
    this.typed = box.value
    this.form?.changed()
  }

  /** Enter in the box adds no line. */
  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") event.preventDefault()
  }

  /** Move up:  the row above goes below this one;  the form told. */
  private readonly onUp = () => {
    const above = this.domElement.previousElementSibling
    if (above?.localName !== ROW_TAG) return
    this.domElement.after(above)
    this.form?.changed()
  }

  /** Move down:  the row below goes above this one;  the form told. */
  private readonly onDown = () => {
    const below = this.domElement.nextElementSibling
    if (below?.localName !== ROW_TAG) return
    this.domElement.before(below)
    this.form?.changed()
  }

  /** The reset button:  the recommendation back in the box, the cursor in it. */
  private readonly onReset = () => {
    this.typed = undefined
    this.form?.changed()
    this.box?.focus()
  }

  /** In VS Code's side bar the frame can't follow `vscode://`:  the view opens it (`DocView.open()`). */
  private readonly onOpenFile = (event: MouseEvent) => {
    if (window.parent === window) return
    event.preventDefault()
    window.parent.postMessage({ spell: "open", url: this.fileUrl, kind: "external" }, "*")
  }

  /** Its table's layout, from the `<epic-choice-rows>` it's in. */
  private static layoutOf(element: Element): { noFile: boolean; stacked: boolean; reorder: boolean } {
    const rows = element.closest(ROWS_TAG)
    return {
      noFile: !!rows?.hasAttribute("no-file"),
      stacked: !!rows?.hasAttribute("stacked"),
      reorder: !!rows?.hasAttribute("reorder")
    }
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicChoiceRow extends E.AttributeValues<typeof epicChoiceRowVocabulary> {}

/** Classes of the shadow markup. */
/** Its cells' box:  out of the way (`display: contents`), so the cells sit on the table's columns. */
const ROW_BOX = "row-box"
const CELL = "cell"
const ORDER = "order"
const PLACE = "place"
const MOVE = "move"
const FILE = "file"
const LINK = "link"
const LINE = "line"
const FOLDER = "folder"
const PURPOSE = "purpose"
const STAYS = "stays"
const NOTE = "note"
const CURRENT = "current"
const PICK = "pick"
const WAS = "was"
const FIELD = "field"
const BOX = "box"
const RESET = "reset"
