import { For, Show, createSignal, onSettled, untrack } from "solid-js"

import { NEW_KINDS, NEW_TITLE_MAX, NOBODY_LISTENING, SUMMARY_ID, type NewItem, type NewKind } from "$/epics/review"

import {
  NEW_ACTIONS,
  NEW_BUTTON,
  NEW_CARD,
  NEW_FORM,
  NEW_INPUT,
  NEW_KIND_LOOKS,
  NEW_KINDS_GROUP,
  NEW_LIST,
  type NewText
} from "./EpicItem.types"
import type { ReviewState } from "./ReviewState"

/*
 * NEW ITEMS from the page (epic `airplane` P2):  Owen asks for a new todo or question while he reads, with no Claude
 * session needed.  `<epic-page>` draws the `+` in its header and the form under it;  a Todos or Questions section
 * draws its waiting items, its button and the form at its end.
 * - Plain Solid components, no element of their own, as the review controls (`ReviewControls.tsx`):  each takes its
 *   element's `ReviewState` and `text()`;  their look is `ReviewControls.css`'s.
 * - What's asked for is a mark in the review inbox, `{ action: "new", kind, title, note?, near? }` under a key of its
 *   own (`new1` ...):  sent with the next Send, made into an item by `plan-doc inbox apply`.
 * - Shown only while the page is reviewed:  the CALLER wraps them in `<Show when={review.reviewing()}>`.
 */

/****************
 * ### `<NewItemButton>`
 * The button that opens the form:  a round `+` (the page header's:  `label` its tooltip), or the `+` and the words
 * (`words`:  a section's "New todo").
 ****************/
export function NewItemButton(props: NewItemButtonProps) {
  return (
    <button
      type="button"
      class={NEW_BUTTON}
      part={props.part}
      data-words={props.words ? "" : undefined}
      aria-expanded={props.open ? "true" : "false"}
      aria-label={props.words ? undefined : props.label}
      title={props.label}
      onClick={() => props.onClick()}
    >
      <ui-icon name="plus" />
      <Show when={props.words}>{(words) => <span>{words()}</span>}</Show>
    </button>
  )
}

/** Props for `<NewItemButton>`. */
export type NewItemButtonProps = {
  /** its name:  the tooltip, and a screen reader's when it has no words */
  label: string
  /** words beside the `+`;  none:  a round icon button */
  words?: string
  /** the form it opens is open */
  open: boolean
  /** the `part` of the button */
  part: string
  /** clicked */
  onClick: () => void
}

/****************
 * ### `<NewItemForm>`
 * The form for a new todo or question:  what it is (Todo | Question), its title, a note that grows as it's typed in,
 * what it's about (an id, if any), then Add (Save, when changing one) and Cancel.
 * - Enter in the title, or Ctrl / Cmd + Enter anywhere, adds it;  Escape cancels
 * - saved to the inbox (`ReviewClient.saveNew()`):  the client says it's saved, and where it waits;  a refused one
 *   (a bad id in About) says why, and the form stays open with what was typed
 * - a title is needed:  without one, the title takes the focus and the notice line says so
 * - the title takes the focus as it opens
 ****************/
export function NewItemForm(props: NewItemFormProps) {
  const item = untrack(() => props.item)
  const [kind, setKind] = createSignal<NewKind>(item?.kind ?? untrack(() => props.kind) ?? "todo")
  const [busy, setBusy] = createSignal(false)
  let title: HTMLInputElement | undefined
  let note: HTMLTextAreaElement | undefined
  let near: HTMLInputElement | undefined
  onSettled(() => {
    title?.focus({ preventScroll: true })
  })
  return (
    <form
      class={NEW_FORM}
      part={props.part}
      aria-label={props.text("newForm")}
      onSubmit={(event) => {
        event.preventDefault()
        void save()
      }}
      onKeyDown={onKeyDown}
    >
      <span class={NEW_KINDS_GROUP} role="group" aria-label={props.text("newKind")}>
        <For each={NEW_KINDS}>
          {(each) => (
            <button
              type="button"
              data-kind={each}
              aria-pressed={kind() === each ? "true" : "false"}
              onClick={() => setKind(each)}
            >
              <ui-icon name={NEW_KIND_LOOKS[each].icon} />
              {props.text(each === "todo" ? "newTodo" : "newQuestion")}
            </button>
          )}
        </For>
      </span>
      <input
        ref={(element) => {
          title = element
          element.value = item?.title ?? ""
        }}
        class={NEW_INPUT}
        data-field="title"
        type="text"
        maxlength={String(NEW_TITLE_MAX)}
        placeholder={props.text("newTitle")}
        aria-label={props.text("newTitle")}
      />
      <textarea
        ref={(element) => {
          note = element
          element.value = item?.note ?? ""
        }}
        class={NEW_INPUT}
        data-field="note"
        rows="2"
        placeholder={props.text("newNote")}
        aria-label={props.text("newNote")}
      />
      <span class={NEW_ACTIONS}>
        <input
          ref={(element) => {
            near = element
            element.value = (item?.near ?? untrack(() => props.near) ?? "").toUpperCase()
          }}
          class={NEW_INPUT}
          data-field="near"
          type="text"
          placeholder={props.text("newNear")}
          aria-label={props.text("newNear")}
        />
        <button type="submit" data-color="green" disabled={busy()}>
          <ui-icon name="check" />
          {props.text(item ? "newSave" : "newAdd")}
        </button>
        <button type="button" onClick={() => props.onDone()}>
          {props.text("newCancel")}
        </button>
      </span>
    </form>
  )

  /** Enter in the title, or Ctrl / Cmd + Enter:  add it;  Escape:  cancel. */
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.stopPropagation()
      props.onDone()
    } else if (event.key === "Enter" && (event.metaKey || event.ctrlKey || event.target === title)) {
      event.preventDefault()
      void save()
    }
  }

  /** Save what's in the form:  asked for, or (editing) changed;  closed once saved. */
  async function save() {
    const client = props.review.client
    if (!client || busy()) return
    const words = title!.value.trim()
    if (!words) {
      title!.focus()
      client.notify(props.text("newNeedsTitle"))
      return
    }
    const more = note!.value.trim()
    const about = near!.value.trim().toLowerCase()
    setBusy(true)
    const saved = await client.saveNew(
      { kind: kind(), title: words, ...(more ? { note: more } : {}), ...(about ? { near: about } : {}) },
      item?.id
    )
    setBusy(false)
    if (saved) props.onDone()
  }
}

/** Props for `<NewItemForm>`. */
export type NewItemFormProps = {
  /** the element's view of the inbox */
  review: ReviewState
  /** the element's `text()` */
  text: NewText
  /** the kind it starts on (a section's own);  read once, as it opens.  Default:  `todo` */
  kind?: NewKind
  /** what it's about to start with (an id);  read once, as it opens */
  near?: string
  /** the waiting item being changed;  none:  a new one.  Read once, as it opens */
  item?: NewItem
  /** the `part` of the form */
  part: string
  /** saved, or cancelled:  the caller closes it */
  onDone: () => void
}

/****************
 * ### `<NewItemList>`
 * The new items of one kind waiting to be made, each a card:  its icon, "Todo" or "Question", its title, its note,
 * what it's about (a link), then Edit and Remove.
 * - the fill rule (decision Q20):  dashed until sent, outlined once sent;  its tooltip says which, and that it waits
 *   for a review while nobody is listening
 * - draws nothing while none waits
 ****************/
export function NewItemList(props: NewItemListProps) {
  const items = () => props.review.newItems(props.kind)
  return (
    <Show when={items().length}>
      <ul class={NEW_LIST} part={props.part}>
        <For each={items()} keyed={(it) => it.id}>
          {(it) => (
            <li class={NEW_CARD} data-fill={sent(it()) ? "outline" : "dashed"} title={tip(it())}>
              <ui-icon name={NEW_KIND_LOOKS[it().kind].icon} />
              <span class="what">{props.text(NEW_KIND_LOOKS[it().kind].label)}</span>
              <span class="title">{it().title}</span>
              <span class="tools">
                <button
                  type="button"
                  title={props.text("newEdit")}
                  aria-label={`${props.text("newEdit")}:  ${it().title}`}
                  onClick={() => props.onEdit(it())}
                >
                  <ui-icon name="pen" />
                </button>
                <button
                  type="button"
                  title={props.text("newRemove")}
                  aria-label={`${props.text("newRemove")}:  ${it().title}`}
                  onClick={() => void props.review.client?.removeNew(it().id)}
                >
                  <ui-icon name="trash can" />
                </button>
              </span>
              <Show when={it().note}>{(note) => <p class="note">{note()}</p>}</Show>
              <Show when={it().near}>
                {(near) => (
                  <a class="about" href={`#${near() === SUMMARY_ID ? SUMMARY_LINK : near()}`}>
                    {props.text("newAbout", { id: near() === SUMMARY_ID ? near() : near().toUpperCase() })}
                  </a>
                )}
              </Show>
            </li>
          )}
        </For>
      </ul>
    </Show>
  )

  /** Has `item` gone with a send? */
  function sent(item: NewItem): boolean {
    return props.review.client?.isSent(item) ?? false
  }

  /** A card's tooltip:  how far it got;  nobody listening, that it waits for a review. */
  function tip(item: NewItem): string {
    const state = props.text(sent(item) ? "newSent" : "newUnsent")
    return props.review.listening() ? state : `${state}.  ${NOBODY_LISTENING}`
  }
}

/** Props for `<NewItemList>`. */
export type NewItemListProps = {
  /** the element's view of the inbox */
  review: ReviewState
  /** the element's `text()` */
  text: NewText
  /** which kind it lists */
  kind: NewKind
  /** the `part` of the list */
  part: string
  /** Edit pressed on `item`:  the caller opens the form on it */
  onEdit: (item: NewItem) => void
}

/** Where a link to the summary goes:  it has no id, so the Overview it opens. */
const SUMMARY_LINK = "overview"
