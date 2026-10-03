import { For, Show } from "solid-js"
import { render } from "@solidjs/web"

import { UI as SpellUI } from "$/ui"
import { uiReady } from "$/app/solid/loadUI"
import type { ChooserModalProps, ChooserOption, ChooserOptionInput } from "$/app/solid/modals"

/****************
 * ### `<Chooser>`
 * Modal which lets the user choose one (or many) values from a list:  a `<ui-modal>` of `<ui-radio>`s (or, with
 * `multiple`, `<ui-checkbox>`es), Cancel and OK.
 * - `onChoose()` gets, once the modal has HIDDEN:
 *   - OK:  the chosen option's value, `undefined` if none;  with `multiple`, an array of the chosen values
 *   - Cancel or Escape:  `undefined`
 * - Values are the caller's own (`ChooserOption.value`):  a number option resolves a number.
 * - Enter anywhere in it is OK, as the React one's form submit was.
 * - Same look as `UI.modals`' dialogs:
 *   - `size="tiny"`, Cancel first, the same translated button texts
 *   - `closedby="closerequest"`:  Escape cancels, a stray click on the dimmer does nothing
 *     (the React one cancelled on a dimmer click)
 * - The radios / checkboxes keep their own state:  OK reads their `selected` (a radio group settles a few
 *   microtasks after a click, long before a person reaches OK).
 * - NOTE: the React one was a SEARCHABLE dropdown:  this is a plain list, fine for the handful of options callers
 *   pass.  A long list would want `<ui-dropdown search>` instead.
 * - Show one with `openChooser()`, which mounts it and cleans up.
 ****************/
export function Chooser(props: ChooserProps) {
  let modal: HTMLElement | undefined
  let value: unknown
  const group = `Chooser-${++chooserCount}`
  return (
    <ui-modal
      class="Chooser"
      size="tiny"
      closedby="closerequest"
      header={props.header}
      aria-label={props.header ? undefined : props.message}
      open=""
      ref={(element: HTMLElement) => {
        modal = element
        modal.addEventListener("ui-approve", choose)
        modal.addEventListener("ui-hide", done, { once: true })
      }}
    >
      <ui-content>
        <p>{props.message}</p>
        <div class="choices" onKeyDown={submitOnEnter}>
          <For each={normalizeChooserOptions(props.options)}>
            {(option) => (
              <div class="choice">
                <Show
                  when={props.multiple}
                  fallback={
                    <ui-radio name={group} value={option.key} selected={isDefault(option)}>
                      {option.text}
                    </ui-radio>
                  }
                >
                  <ui-checkbox name={group} value={option.key} selected={isDefault(option)}>
                    {option.text}
                  </ui-checkbox>
                </Show>
              </div>
            )}
          </For>
        </div>
      </ui-content>
      <ui-actions>
        <ui-button class="cancel">{props.cancel ?? SpellUI.i18n.t("cancel")}</ui-button>
        <ui-button class="approve" primary="">
          {props.ok ?? SpellUI.i18n.t("ok")}
        </ui-button>
      </ui-actions>
    </ui-modal>
  )

  /** Is `option` chosen at first?  `defaultValue` is a value, or an array of them. */
  function isDefault(option: ChooserOption): boolean {
    const start = props.defaultValue
    return Array.isArray(start) ? start.includes(option.value) : start !== undefined && start === option.value
  }

  /** OK:  note the chosen value(s) now, while the choices are still in the page. */
  function choose() {
    const options = normalizeChooserOptions(props.options)
    const chosen = [...modal!.querySelectorAll<HTMLElement & { selected?: boolean }>("ui-radio, ui-checkbox")]
      .map((choice, index) => (choice.selected ? options[index] : undefined))
      .filter((option): option is ChooserOption => !!option)
      .map((option) => option.value)
    value = props.multiple ? chosen : chosen[0]
  }

  /** Hidden:  hand on the answer (`value` stays `undefined` unless OK ran `choose()`). */
  function done() {
    props.onChoose(value)
  }

  /** Enter is OK. */
  function submitOnEnter(event: KeyboardEvent) {
    if (event.key !== "Enter") return
    event.preventDefault()
    modal!.querySelector<HTMLElement>(".approve")!.click()
  }
}

/** Sequence for each `<Chooser>`'s radio group name. */
let chooserCount = 0

/** Props for `<Chooser>`. */
export type ChooserProps = ChooserModalProps & {
  /** Called once with the answer, after the modal has hidden. */
  onChoose: (value: unknown) => void
}

/**
 * Show a `<Chooser>` for `props`;  resolves with its answer (see `<Chooser>`).
 * - SIDE EFFECT:  a `<div class="ChooserRoot">` in `<body>` holding the modal, until it has hidden.
 * - Waits for `uiReady`:  `<ui-modal>` and the choices must be defined before it opens.
 */
export async function openChooser(props: ChooserModalProps): Promise<unknown> {
  await uiReady
  const root = document.createElement("div")
  root.className = "ChooserRoot"
  document.body.append(root)
  return new Promise((resolve) => {
    const dispose = render(() => <Chooser {...props} onChoose={finish} />, root)

    /** Unmount, then resolve. */
    function finish(value: unknown) {
      dispose()
      root.remove()
      resolve(value)
    }
  })
}

/**
 * Normalize `options` for `<Chooser>`:
 * - array of objects:  `{ value, text, key }`, `text` defaulting to the value, `key` to the index
 * - array of primitive values:  each is its own value and text
 * - map of `{ value: text }`:  one option per entry
 */
export function normalizeChooserOptions(options: ChooserOptionInput[] | Record<string, string>): ChooserOption[] {
  if (!Array.isArray(options)) return Object.entries(options).map(([value, text]) => ({ key: value, value, text }))
  return options.map((option, index) => {
    if (typeof option !== "object") return { key: String(index), value: option, text: String(option) }
    return { key: String(option.key ?? index), value: option.value, text: option.text ?? String(option.value) }
  })
}
