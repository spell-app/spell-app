import { E, UI, UIT } from "$/ui/core"
import { toastVocabulary } from "./UIToast.en"
import { ACTIONS, ATTACHED, INVERTED, UI_WORD, VERTICAL, type Vocabulary } from "./UIToast.types"

import containerCSS from "./UIToast.container.css?inline"

/****************
 * ### `ToastStack`
 * The toasts behind `UI.toast({…})` / `UI.toasts.show()` (Fomantic's `$.toast({…})`):
 * a `<ui-toast>` built for the call, put in the container for its `position`, removed once it has hidden.
 *
 * - Containers:  one `<div popover="manual" class="ui [position] toast-container" role="region">` per position
 *   (and `horizontal`), in `<body>`, styled by the page sheet `toast-container` (`UIToast.container.css`).
 *   - Shown (or re-shown, to be lifted above anything opened since) for each new toast, unless focus is inside it.
 *   - Removed when its last toast goes.
 * - Options map onto attributes (`title` => `header`, `showProgress` => `progress` …);
 *   `displayTime` defaults to Fomantic's `3000`.
 * - `class` words sort themselves:  a `type` word, a hue (`color`) or `inverted`.
 *   Every word also stays on the `<ui-toast>`,
 *   so a page can theme one toast by its own class (the `--ui-toast-*` tokens).
 * - Actions become `<ui-button slot="actions">`s:  Fomantic's `class` on the button
 *   (so `.positive` / `.deny` … still approve / deny), its button words and hue as attributes.
 *   - `attached` layouts wrap them in a `<ui-buttons>`.
 *   - An action's `click()` returning `false` prevents the click's default, which keeps the toast.
 * - Replacing:  `show({ id })` with the id of a showing toast removes that one first (its `closed` resolves).
 * - Everything is light DOM built with `createElement` / `textContent`:  never `innerHTML` with caller text.
 * - Registered by the family barrel as `UI.toasts`' provider;  the runtime never imports it.
 ****************/
export class ToastStack implements E.ToastProvider {
  /** Page the toasts and their containers are made in;  a test passes its own. */
  readonly document: Document

  /** Showing toasts by id, with what settles their `closed`. */
  private readonly showingToasts = new Map<string, ToastRecord>()

  /** Containers by position key. */
  private readonly containers = new Map<string, HTMLElement>()

  constructor({ document = globalThis.document }: ToastStackProps = {}) {
    this.document = document
  }

  /** Show a `<ui-toast>` for `options`, replacing a showing one with the same `id`. */
  show(options: E.ToastOptions): E.ToastHandle {
    const id = options.id ?? UI.ids.next(ID_PREFIX)
    this.remove(id)
    const toast = this.toastFor(options, id)
    const container = this.containerFor(options)
    if (options.newestOnTop) container.prepend(toast)
    else container.append(toast)
    ToastStack.raise(container)
    let settle!: () => void
    const closed = new Promise<void>((resolve) => (settle = resolve))
    this.showingToasts.set(id, { element: toast, settle })
    toast.addEventListener(HIDE_EVENT, () => this.remove(id), { once: true })
    return { id, closed, element: toast }
  }

  /** Close toast `id` as `domElement.close()` does (the cancelable `ui-close` first);  nothing for an unknown id. */
  dismiss(id: string) {
    const record = this.showingToasts.get(id)
    ;(record?.element as { close?: () => boolean } | undefined)?.close?.()
  }

  ////////////////
  // ## Building
  ////////////////

  /** The `<ui-toast>` for `options`. */
  private toastFor(options: E.ToastOptions, id: string): HTMLElement {
    const toast = this.document.createElement(toastVocabulary.tag)
    toast.id = id
    // keys checked against the vocabulary
    const attributes: Partial<Record<E.AttributeNameOf<Vocabulary>, string>> = {
      header: options.title,
      message: options.message,
      "display-time": String(options.displayTime ?? DEFAULT_DISPLAY_TIME),
      icon: options.showIcon === true ? "" : options.showIcon || undefined,
      progress: options.showProgress || undefined,
      "progress-up": options.progressUp ? "" : undefined,
      "pause-on-hover": options.pauseOnHover === false ? "false" : undefined,
      closable: options.closeIcon ? "" : undefined,
      "close-on-click": options.closeOnClick === false ? "false" : undefined,
      compact: options.compact === false ? "false" : undefined,
      actions: options.actions?.length ? options.classActions : undefined,
      type: options.type
    }
    const words = (options.class ?? "").split(UIT.WHITESPACE).filter(Boolean)
    for (const word of words) {
      if (TYPE_WORDS.includes(word)) attributes.type = word
      else if (E.ValueSets.has(HUES, word)) attributes.color = word
      else if (word === INVERTED) attributes.inverted = ""
    }
    for (const [name, value] of Object.entries(attributes)) if (value !== undefined) toast.setAttribute(name, value)
    // every word stays on the DOM element too (Fomantic's `class`):  the page themes this one toast by it
    if (words.length) toast.className = words.join(" ")
    if (options.actions?.length) toast.append(this.actionsFor(options.actions, options.classActions ?? ""))
    return toast
  }

  /**
   * The actions:  `<ui-button slot="actions">`s, or one `<ui-buttons slot="actions">` around them for `attached`
   * layouts (`vertical` with `vertical attached`).
   */
  private actionsFor(actions: readonly E.ToastAction[], layout: string): Node {
    const words = layout.split(UIT.WHITESPACE)
    const buttons = actions.map((action) => this.buttonFor(action))
    const group = ToastStack.definitionFor(GROUP_NOUN)
    if (!words.includes(ATTACHED) || !group) {
      const fragment = this.document.createDocumentFragment()
      for (const button of buttons) {
        button.slot = ACTIONS
        fragment.append(button)
      }
      return fragment
    }
    const buttonsElement = this.document.createElement(group.tag)
    buttonsElement.slot = ACTIONS
    buttonsElement.setAttribute(words.includes(VERTICAL) ? VERTICAL : UIT.FLUID, "")
    buttonsElement.append(...buttons)
    return buttonsElement
  }

  /**
   * One action as a `<ui-button>`:  `class` kept on the DOM element (approve / deny classes), its words that are button
   * attributes (`positive`, `basic` ...) or hues (`color`) set as attributes;
   * `click` wired, `false` keeping the toast open.
   */
  private buttonFor(action: E.ToastAction): HTMLElement {
    const definition = ToastStack.definitionFor(UIT.BUTTON)
    const button = this.document.createElement(definition?.tag ?? "button")
    const words = (action.class ?? "").split(UIT.WHITESPACE).filter(Boolean)
    if (words.length) button.className = words.join(" ")
    const known = new Set(
      definition?.vocabulary.attributes.filter(({ kind }) => kind === KEY_ONLY).map(({ name }) => name)
    )
    for (const word of words) {
      if (known.has(word)) button.setAttribute(word, "")
      else if (E.ValueSets.has(HUES, word)) button.setAttribute(COLOR, word)
    }
    if (action.icon && definition) button.setAttribute(UIT.ICON, action.icon)
    if (action.text) button.textContent = action.text
    else if (action.icon) button.setAttribute("aria-label", action.icon)
    const click = action.click
    if (click) {
      button.addEventListener("click", (event) => {
        if (click(event) === false) event.preventDefault()
      })
    }
    return button
  }

  /**
   * The registered definition whose vocabulary noun is `noun` (`<ui-button>`, or a translated tag).
   * - Static:  it reads the page-wide registry, `UIComponent.definitions`, nothing of this stack's.
   */
  private static definitionFor(noun: string) {
    for (const definition of E.UIComponent.definitions.values()) {
      if (definition.vocabulary.noun === noun) return definition
    }
    return undefined
  }

  ////////////////
  // ## Containers
  ////////////////

  /** The container for `options`' position (and `horizontal`), made (and its sheet registered) on first use. */
  private containerFor(options: E.ToastOptions): HTMLElement {
    let position = options.position ?? DEFAULT_POSITION
    if (!ToastPositions.includes(position as ToastPosition)) {
      E.Warnings.devWarn("UI.toast()", `unknown position "${position}";  using "${DEFAULT_POSITION}"`)
      position = DEFAULT_POSITION
    }
    const key = options.horizontal ? `${position} horizontal` : position
    const existing = this.containers.get(key)
    if (existing?.isConnected) return existing
    if (!UI.styles.has(CONTAINER_SHEET)) UI.styles.register(CONTAINER_SHEET, containerCSS, { page: true })
    const container = this.document.createElement("div")
    container.popover = "manual"
    const words = [UI_WORD, position, CONTAINER_CLASS, ...(options.horizontal ? ["horizontal"] : [])]
    container.className = words.join(" ")
    container.setAttribute("role", "region")
    container.setAttribute("aria-label", UI.i18n.t(NOTIFICATIONS))
    this.document.body.append(container)
    this.containers.set(key, container)
    return container
  }

  /**
   * Show `container` on top of the top layer;  left alone while focus is inside (re-showing would drop it).
   * - Static:  it touches only the container it's given.
   */
  private static raise(container: HTMLElement) {
    const open = container.matches(":popover-open")
    if (open && container.matches(":focus-within")) return
    if (open) container.hidePopover()
    container.showPopover()
  }

  /** Forget toast `id`:  remove its element, settle its `closed`, drop an emptied container. */
  private remove(id: string) {
    const record = this.showingToasts.get(id)
    if (!record) return
    this.showingToasts.delete(id)
    const container = record.element.parentElement
    record.element.remove()
    record.settle()
    if (container && !container.children.length) {
      if (container.matches(":popover-open")) container.hidePopover()
      container.remove()
      for (const [key, value] of this.containers) if (value === container) this.containers.delete(key)
    }
  }
}

/** Constructor props for `ToastStack`. */
export type ToastStackProps = {
  /** page to build in.  Default:  the global `document`. */
  document?: Document
}

/** A showing toast. */
type ToastRecord = {
  /** its `<ui-toast>` */
  element: HTMLElement
  /** resolves the handle's `closed` */
  settle: () => void
}

/** The event that ends a toast:  the stack removes its toasts on it. */
const HIDE_EVENT: E.EventName<Vocabulary> = "ui-hide"

/** Positions a toast container takes (Fomantic's);  the first is the default. */
const ToastPositions = [
  "top right",
  "top left",
  "top center",
  "bottom right",
  "bottom left",
  "bottom center",
  "centered"
] as const

/** One of `ToastPositions`. */
type ToastPosition = (typeof ToastPositions)[number]

/** Position of a toast that names none. */
const DEFAULT_POSITION: ToastPosition = ToastPositions[0]

/** `UI.ids` prefix of toast ids. */
const ID_PREFIX = toastVocabulary.tag

/** Fomantic's default `displayTime`, in ms. */
const DEFAULT_DISPLAY_TIME = 3000

/** `type` words (the vocabulary's):  a `class` word among them becomes `type`. */
const TYPE_WORDS = (toastVocabulary.attributes.find(({ name }) => name === "type") as E.AttributeSpec)
  .values as readonly string[]

/** Value set of the hues:  a `class` word among them becomes `color`. */
const HUES = "hues"

/** Attribute kind of a button's words (`positive`, `basic` ...):  a `class` word of that kind becomes an attribute. */
const KEY_ONLY = "keyOnly"

/** `<ui-button>`'s hue attribute (canonical). */
const COLOR = "color"

/** Noun of the button group (`<ui-buttons>`) that holds `attached` actions. */
const GROUP_NOUN = "buttons"

/** Page sheet of the containers (`UIToast.container.css`). */
const CONTAINER_SHEET = "toast-container"

/** Class word of a container. */
const CONTAINER_CLASS = "toast-container"

/** Text key of the containers' name. */
const NOTIFICATIONS = "notifications"
