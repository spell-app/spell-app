import { For, Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { NEW_KINDS, NEW_TITLE_MAX, type NewItem, type NewKind } from "$/epics/review"
// the page's view of the review inbox, as the review controls': its file, not `epic-review`'s barrel
import { ReviewState } from "$/epics/components/epic-review/ReviewState"

import { epicNewItemVocabulary } from "./EpicNewItem.en"
import {
  NEW_ACTIONS,
  NEW_BUTTON,
  NEW_CLOSED,
  NEW_FORM,
  NEW_INPUT,
  NEW_KIND_LOOKS,
  NEW_KINDS_GROUP,
  type EpicNewItemVocabulary
} from "./EpicNewItem.types"

import newItemCSS from "./EpicNewItem.css?inline"

/****************
 * ### `EpicNewItem`
 * The component behind `<epic-new-item>`:  NEW ITEMS from the page (epic `airplane` P2) -- Owen asks for a new todo or
 * question while he reads, with no Claude session needed.
 * - `<epic-page>` draws one in its header while its toolbar button is pressed (`open`:  the form alone, on a row of
 *   its own), and lets go of it once it closes (`epic-new-closed`);
 *   a Todos or Questions `<epic-section>` at its end (`adds`:  the `+` and its words, the form in its place), after
 *   the waiting items it lists itself.
 * - What's asked for is a mark in the review inbox, `{ action: "new", kind, title, note?, near? }` under a key of its
 *   own (`new1` ...):  sent with the next Send, made into an item by `plan-doc inbox apply`.
 * - Shown only while the page is reviewed:  the family that draws it wraps it in `<Show>`.
 * - SIDE EFFECT:  follows the review inbox while connected.
 ****************/
export class EpicNewItem extends E.UIComponent<EpicNewItemVocabulary> {
  @E.proto static vocabulary = epicNewItemVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "epic-new-item": newItemCSS },
    // the form's fields take the focus themselves
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  /** The page's view of the review inbox:  its client, and the waiting item being changed. */
  readonly review = new ReviewState(() => undefined)

  /** Follow the inbox while connected (kept alive:  a removed one must stop listening). */
  @E.whileConnected
  protected followReviews() {
    return this.review.connect()
  }

  /** The form shows:  `open`, the DOM element's when set (`<epic-section>` opens it on a waiting item). */
  @E.cssState("open")
  @E.controlled("open")
  accessor isOpen = false

  render(): JSX.Element {
    return (
      <span class="base" part={this.partForName("base")}>
        <Show when={!this.isOpen}>{this.button()}</Show>
        {/* a new object each time it opens, or opens on another item:  the form is drawn anew */}
        <Show when={this.isOpen ? { item: this.waitingItem(this.editing) } : undefined} keyed>
          {(form) => this.form(form.item)}
        </Show>
      </span>
    )
  }

  ////////////////
  // ## The button
  ////////////////

  /** The button that opens the form:  the `+` and its words (a section's "New todo"). */
  private button(): JSX.Element {
    const words = () => this.translationForKey(this.adds ? NEW_KIND_LOOKS[this.adds].add : "newButton")
    return (
      <button
        type="button"
        class={NEW_BUTTON}
        part={this.partForName("button")}
        data-words=""
        aria-expanded={this.isOpen ? "true" : "false"}
        title={words()}
        onClick={() => (this.isOpen = !this.isOpen)}
      >
        <ui-icon name="plus" />
        <span>{words()}</span>
      </button>
    )
  }

  ////////////////
  // ## The form
  ////////////////

  /** The kind the form is on (its kind buttons). */
  @E.state accessor formKind: NewKind = "todo"

  /** A save on its way:  Add waits. */
  @E.state accessor isSaving = false

  /** The form's fields, as drawn. */
  private titleInput: HTMLInputElement | undefined
  private noteInput: HTMLTextAreaElement | undefined
  private nearInput: HTMLInputElement | undefined

  /**
   * The form for a new todo or question (`item`:  changing a waiting one):  what it is (Todo | Question), its title,
   * a note that grows as it's typed in, what it's about (an id, if any), then Add (Save, when changing one) and Cancel.
   * - Enter in the title, or Ctrl / Cmd + Enter anywhere, adds it;  Escape cancels
   * - saved to the inbox (`ReviewClient.saveNew()`):  the client says it's saved, and where it waits;
   *   a refused one (a bad id in About) says why, and the form stays open with what was typed
   * - a title is needed:  without one, the title takes the focus and the notice line says so
   * - the title takes the focus as it opens (`onOpened()`)
   * - drawn anew each time it opens, or opens on another item:  its fields start from `item`, `adds` and `near`
   */
  private form(item: NewItem | undefined): JSX.Element {
    return (
      <form
        class={NEW_FORM}
        part={this.partForName("form")}
        aria-label={this.translationForKey("newForm")}
        onSubmit={(event) => {
          event.preventDefault()
          void this.save(item)
        }}
        onKeyDown={(event: KeyboardEvent) => this.onFormKey(event, item)}
      >
        <span class={NEW_KINDS_GROUP} role="group" aria-label={this.translationForKey("newKind")}>
          <For each={NEW_KINDS}>
            {(each) => (
              <button
                type="button"
                data-kind={each}
                aria-pressed={this.formKind === each ? "true" : "false"}
                onClick={() => (this.formKind = each)}
              >
                <ui-icon name={NEW_KIND_LOOKS[each].icon} />
                {this.translationForKey(NEW_KIND_LOOKS[each].label)}
              </button>
            )}
          </For>
        </span>
        <input
          ref={(element) => {
            this.titleInput = element
            element.value = item?.title ?? ""
          }}
          class={NEW_INPUT}
          data-field="title"
          type="text"
          maxlength={String(NEW_TITLE_MAX)}
          placeholder={this.translationForKey("newTitle")}
          aria-label={this.translationForKey("newTitle")}
        />
        <textarea
          ref={(element) => {
            this.noteInput = element
            element.value = item?.note ?? ""
          }}
          class={NEW_INPUT}
          data-field="note"
          rows="2"
          placeholder={this.translationForKey("newNote")}
          aria-label={this.translationForKey("newNote")}
        />
        <span class={NEW_ACTIONS}>
          <input
            ref={(element) => this.onNearDrawn(element, item)}
            class={NEW_INPUT}
            data-field="near"
            type="text"
            placeholder={this.translationForKey("newNear")}
            aria-label={this.translationForKey("newNear")}
          />
          <button type="submit" data-color="green" disabled={this.isSaving}>
            <ui-icon name="check" />
            {this.translationForKey(item ? "newSave" : "newAdd")}
          </button>
          <button type="button" onClick={() => this.close()}>
            {this.translationForKey("newCancel")}
          </button>
        </span>
      </form>
    )
  }

  /** The About field, as drawn:  it starts with `item`'s, else `near`. */
  @E.untracked
  private onNearDrawn(element: HTMLInputElement, item: NewItem | undefined) {
    this.nearInput = element
    element.value = (item?.near ?? this.near ?? "").toUpperCase()
  }

  /**
   * The waiting item `editing` names;  `undefined` for a new one.
   * - Untracked:  the form is drawn anew when `editing` changes, never when the inbox does.
   */
  @E.untracked
  private waitingItem(key: string | undefined): NewItem | undefined {
    return key ? this.review.newItems().find((it) => it.id === key) : undefined
  }

  /**
   * The form opened (or opened on another item):  its kind is the item's, else the section's own, else a todo;
   * nothing saving;  its title takes the focus, once it's drawn.
   */
  @E.onChange("isOpen", "editing")
  protected onOpened(open: boolean, editing: string | undefined) {
    if (!open) return
    this.formKind = this.waitingItem(editing)?.kind ?? this.adds ?? "todo"
    this.isSaving = false
    E.afterSolidUpdate(() => this.titleInput?.focus({ preventScroll: true }))
  }

  /** Enter in the title, or Ctrl / Cmd + Enter:  add it;  Escape:  cancel. */
  @E.untracked
  private onFormKey(event: KeyboardEvent, item: NewItem | undefined) {
    if (event.key === "Escape") {
      event.stopPropagation()
      this.close()
    } else if (event.key === "Enter" && (event.metaKey || event.ctrlKey || event.target === this.titleInput)) {
      event.preventDefault()
      void this.save(item)
    }
  }

  /** Save what's in the form:  asked for, or (`item`) changed;  closed once saved. */
  @E.untracked
  private async save(item: NewItem | undefined) {
    const client = this.review.client
    if (!client || this.isSaving) return
    const words = this.titleInput!.value.trim()
    if (!words) {
      this.titleInput!.focus()
      client.notify(this.translationForKey("newNeedsTitle"))
      return
    }
    const more = this.noteInput!.value.trim()
    const about = this.nearInput!.value.trim().toLowerCase()
    this.isSaving = true
    const saved = await client.saveNew(
      { kind: this.formKind, title: words, ...(more ? { note: more } : {}), ...(about ? { near: about } : {}) },
      item?.id
    )
    this.isSaving = false
    if (saved) this.close({ saved: true })
  }

  /** Saved, or cancelled:  the form closes, no longer on a waiting item;  `epic-new-closed` says so. */
  @E.untracked
  private close({ saved = false } = {}) {
    this.isOpen = false
    if (this.editing) this.editing = undefined
    this.send(NEW_CLOSED, { saved })
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicNewItem extends E.AttributeValues<EpicNewItemVocabulary> {}
