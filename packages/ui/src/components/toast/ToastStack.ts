import {
  Converters,
  UI,
  UIElement,
  ValueSets,
  type AttributeNameOf,
  type AttributeSpec,
  type ToastAction,
  type ToastHandle,
  type ToastOptions,
  type ToastProvider
} from "$/core"

import { toastVocabulary } from "./toast.vocabulary.en"

import containerCSS from "./toast.container.css?inline"

/****************
 * ### `ToastStack`
 * `UI.toast({...})` / `UI.toasts.show()` (Fomantic's `$.toast({...})`):  a `<ui-toast>` built for the call, put in
 * the container for its `position`, removed once it has hidden.
 * - Containers:  one `<div popover="manual" class="ui [position] toast-container" role="region">` per position
 *   (and `horizontal`), in `<body>`, styled by the page sheet `toast-container` (`toast.container.css`).  Shown
 *   (re-shown, to be lifted above anything opened since) for each new toast, unless focus is inside it;  removed
 *   when its last toast goes.
 * - Options map onto attributes (`title` => `header`, `showProgress` => `progress` ...);  `displayTime` defaults to
 *   Fomantic's `3000`.  `class` words sort themselves:  a `type` word, a hue (`color`) or `inverted`.
 * - Actions become `<ui-button slot="actions">`s (Fomantic's `class` on the host, so `.positive` / `.deny` ... still
 *   approve / deny, and its button words and hue as attributes);  `attached` layouts wrap them in a
 *   `<ui-buttons>`.  An action's `click()` returning `false` prevents the click's default, which keeps the toast.
 * - Replacing:  `show({ id })` with the id of a showing toast removes that one first (its `closed` resolves).
 * - Everything is light DOM built with `createElement` / `textContent`:  never `innerHTML` with caller text.
 ****************/
export class ToastStack implements ToastProvider {
  /** Showing toasts by id, with what settles their `closed`. */
  private readonly toasts = new Map<string, ToastRecord>()

  /** Containers by position key. */
  private readonly containers = new Map<string, HTMLElement>()

  show(options: ToastOptions): ToastHandle {
    const id = options.id ?? UI.ids.next(ID_PREFIX)
    this.remove(id)
    const toast = this.build(options, id)
    const container = this.container(options)
    if (options.newestOnTop) container.prepend(toast)
    else container.append(toast)
    ToastStack.raise(container)
    let settle!: () => void
    const closed = new Promise<void>((resolve) => (settle = resolve))
    this.toasts.set(id, { element: toast, settle })
    toast.addEventListener(HIDE_EVENT, () => this.remove(id), { once: true })
    return { id, closed, element: toast }
  }

  dismiss(id: string) {
    const record = this.toasts.get(id)
    ;(record?.element as { close?: () => boolean } | undefined)?.close?.()
  }

  ////////////////
  // ## Building
  ////////////////

  /** The `<ui-toast>` for `options`. */
  private build(options: ToastOptions, id: string): HTMLElement {
    const toast = document.createElement(toastVocabulary.tag)
    toast.id = id
    // keys checked against the vocabulary
    const attributes: Partial<Record<AttributeNameOf<typeof toastVocabulary>, string>> = {
      header: options.title,
      message: options.message,
      "display-time": String(options.displayTime ?? DEFAULT_DISPLAY_TIME),
      icon: options.showIcon === true ? "" : options.showIcon || undefined,
      progress: options.showProgress || undefined,
      "progress-up": options.progressUp ? "" : undefined,
      "pause-on-hover": options.pauseOnHover === false ? FALSE : undefined,
      closable: options.closeIcon ? "" : undefined,
      "close-on-click": options.closeOnClick === false ? FALSE : undefined,
      compact: options.compact === false ? FALSE : undefined,
      actions: options.actions?.length ? options.classActions : undefined,
      type: options.type
    }
    for (const word of (options.class ?? "").split(/\s+/).filter(Boolean)) {
      if (TYPES.includes(word)) attributes.type = word
      else if (ValueSets.has(HUES, word)) attributes.color = word
      else if (word === INVERTED) attributes.inverted = ""
    }
    for (const [name, value] of Object.entries(attributes)) if (value !== undefined) toast.setAttribute(name, value)
    if (options.actions?.length) toast.append(ToastStack.actions(options.actions, options.classActions ?? ""))
    return toast
  }

  /**
   * The actions:  `<ui-button slot="actions">`s, or one `<ui-buttons slot="actions">` around them for `attached`
   * layouts (`vertical` with `vertical attached`).
   */
  private static actions(actions: readonly ToastAction[], layout: string): Node {
    const words = layout.split(/\s+/)
    const buttons = actions.map((action) => ToastStack.button(action))
    const group = ToastStack.definition(GROUP_NOUN)
    if (!words.includes(ATTACHED) || !group) {
      const fragment = document.createDocumentFragment()
      for (const button of buttons) {
        button.slot = SLOT_ACTIONS
        fragment.append(button)
      }
      return fragment
    }
    const buttonsElement = document.createElement(group.tag)
    buttonsElement.slot = SLOT_ACTIONS
    buttonsElement.setAttribute(words.includes(VERTICAL) ? VERTICAL : FLUID, "")
    buttonsElement.append(...buttons)
    return buttonsElement
  }

  /**
   * One action as a `<ui-button>`:  `class` kept on the host (approve / deny classes), its words that are button
   * attributes (`positive`, `basic` ...) or hues (`color`) set as attributes;  `click` wired, `false` keeping the
   * toast open.
   */
  private static button(action: ToastAction): HTMLElement {
    const definition = ToastStack.definition(BUTTON_NOUN)
    const button = document.createElement(definition?.tag ?? BUTTON_NOUN)
    const words = (action.class ?? "").split(/\s+/).filter(Boolean)
    if (words.length) button.className = words.join(" ")
    const known = new Set(
      definition?.vocabulary.attributes.filter(({ kind }) => kind === KEY_ONLY).map(({ name }) => name)
    )
    for (const word of words) {
      if (known.has(word)) button.setAttribute(word, "")
      else if (ValueSets.has(HUES, word)) button.setAttribute(COLOR, word)
    }
    if (action.icon && definition) button.setAttribute(ICON, action.icon)
    if (action.text) button.textContent = action.text
    else if (action.icon) button.setAttribute(ARIA_LABEL, action.icon)
    const click = action.click
    if (click) {
      button.addEventListener("click", (event) => {
        if (click(event) === false) event.preventDefault()
      })
    }
    return button
  }

  /** The registered definition whose vocabulary noun is `noun` (`<ui-button>`, or a translated tag). */
  private static definition(noun: string) {
    for (const definition of UIElement.definitions.values()) {
      if (definition.vocabulary.noun === noun) return definition
    }
    return undefined
  }

  ////////////////
  // ## Containers
  ////////////////

  /** The container for `options`' position (and `horizontal`), made (and its sheet registered) on first use. */
  private container(options: ToastOptions): HTMLElement {
    let position = options.position ?? DEFAULT_POSITION
    if (!POSITIONS.includes(position)) {
      Converters.warn(`UI.toast(): unknown position "${position}", using "${DEFAULT_POSITION}"`)
      position = DEFAULT_POSITION
    }
    const key = options.horizontal ? `${position} ${HORIZONTAL}` : position
    const existing = this.containers.get(key)
    if (existing?.isConnected) return existing
    if (!UI.styles.has(CONTAINER_SHEET)) UI.styles.register(CONTAINER_SHEET, containerCSS, { page: true })
    const container = document.createElement("div")
    container.popover = MANUAL
    container.className = [UI_WORD, position, CONTAINER_CLASS, ...(options.horizontal ? [HORIZONTAL] : [])].join(" ")
    container.setAttribute(ROLE, REGION)
    container.setAttribute(ARIA_LABEL, UI.i18n.t(NOTIFICATIONS))
    document.body.append(container)
    this.containers.set(key, container)
    return container
  }

  /** Show `container` on top of the top layer;  left alone while focus is inside (re-showing would drop it). */
  private static raise(container: HTMLElement) {
    const open = container.matches(POPOVER_OPEN)
    if (open && container.matches(FOCUS_WITHIN)) return
    if (open) container.hidePopover()
    container.showPopover()
  }

  /** Forget toast `id`:  remove its element, settle its `closed`, drop an emptied container. */
  private remove(id: string) {
    const record = this.toasts.get(id)
    if (!record) return
    this.toasts.delete(id)
    const container = record.element.parentElement
    record.element.remove()
    record.settle()
    if (container && !container.children.length) {
      if (container.matches(POPOVER_OPEN)) container.hidePopover()
      container.remove()
      for (const [key, value] of this.containers) if (value === container) this.containers.delete(key)
    }
  }
}

/** A showing toast. */
type ToastRecord = {
  element: HTMLElement
  /** resolves the handle's `closed` */
  settle: () => void
}

/** `UI.ids` prefix of toast ids. */
const ID_PREFIX = "ui-toast"

/** Fomantic's default `displayTime`. */
const DEFAULT_DISPLAY_TIME = 3000

/** Positions (Fomantic's), and the default. */
const DEFAULT_POSITION = "top right"
const POSITIONS = ["top right", "top left", "top center", "bottom right", "bottom left", "bottom center", "centered"]

/** `type` words, from the vocabulary. */
const TYPES: readonly string[] = (toastVocabulary.attributes.find(({ name }) => name === "type") as AttributeSpec)
  .values as readonly string[]

/** Value set of the hues. */
const HUES = "hues"

/** Attribute values it writes. */
const FALSE = "false"
const INVERTED = "inverted"
const ATTACHED = "attached"
const VERTICAL = "vertical"
const FLUID = "fluid"
const KEY_ONLY = "keyOnly"

/** Attributes it sets on buttons (canonical `<ui-button>` names) and containers. */
const COLOR = "color"
const ICON = "icon"
const ARIA_LABEL = "aria-label"
const ROLE = "role"
const REGION = "region"

/** Slot of the actions (canonical). */
const SLOT_ACTIONS = "actions"

/** Nouns of the button family's elements. */
const BUTTON_NOUN = "button"
const GROUP_NOUN = "buttons"

/** Event that ends a toast. */
const HIDE_EVENT = "ui-hide"

/** Text key of the containers' name. */
const NOTIFICATIONS = "notifications"

/** Container markup (`toast.container.css`). */
const CONTAINER_SHEET = "toast-container"
const UI_WORD = "ui"
const CONTAINER_CLASS = "toast-container"
const HORIZONTAL = "horizontal"
const MANUAL = "manual"
const POPOVER_OPEN = ":popover-open"
const FOCUS_WITHIN = ":focus-within"
