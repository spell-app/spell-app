/**
 * Loose constants, types and helpers of `<ui-toast>`:  its element classes and native fallback import them from here.
 */

import { toastVocabulary } from "./ui-toast.vocabulary.en"
import type { AttributeSpec, EventName } from "$/ui/core"

////////////////
// ## ToastStack
////////////////

/** A showing toast. */
export type ToastRecord = {
  element: HTMLElement
  /** resolves the handle's `closed` */
  settle: () => void
}

/** `UI.ids` prefix of toast ids. */
export const ID_PREFIX = "ui-toast"

/** Fomantic's default `displayTime`. */
export const DEFAULT_DISPLAY_TIME = 3000

/** Positions (Fomantic's), and the default. */
export const DEFAULT_POSITION = "top right"
export const POSITIONS = [
  "top right",
  "top left",
  "top center",
  "bottom right",
  "bottom left",
  "bottom center",
  "centered"
]

/** `type` words, from the vocabulary. */
export const TYPES: readonly string[] = (
  toastVocabulary.attributes.find(({ name }) => name === "type") as AttributeSpec
).values as readonly string[]

/** Value set of the hues. */
export const HUES = "hues"
export const INVERTED = "inverted"
export const ATTACHED = "attached"
export const KEY_ONLY = "keyOnly"

/** Attributes it sets on buttons (canonical `<ui-button>` names) and containers. */
export const COLOR = "color"
export const ROLE = "role"
export const REGION = "region"

/** Slot of the actions (canonical). */
export const SLOT_ACTIONS = "actions"

/** Nouns of the button family's elements. */
export const BUTTON_NOUN = "button"
export const GROUP_NOUN = "buttons"

/** Event that ends a toast. */
export const HIDE_EVENT = "ui-hide"

/** Text key of the containers' name. */
export const NOTIFICATIONS = "notifications"

/** Container markup (`ui-toast.container.css`). */
export const CONTAINER_SHEET = "toast-container"
export const UI_WORD = "ui"
export const CONTAINER_CLASS = "toast-container"
export const FOCUS_WITHIN = ":focus-within"

////////////////
// ## UIToast
////////////////

/** ToastVocabulary type, for brevity. */
export type ToastVocabulary = typeof toastVocabulary

/** Allowed words of the `actions` attribute, from its spec. */
export const ACTION_WORDS: readonly string[] = (
  toastVocabulary.attributes.find(({ name }) => name === "actions") as AttributeSpec
).values as readonly string[]

/** Icons of a bare `icon`, by type (Fomantic's `icons` setting, in Font Awesome names). */
export const TYPE_ICONS: Readonly<Record<string, string>> = {
  info: "circle-info",
  success: "circle-check",
  warning: "triangle-exclamation",
  error: "circle-xmark"
}

/** `display-time="auto"`:  reading speed and floor (Fomantic's `wordsPerMinute`, `minDisplayTime`). */
export const WORDS_PER_MINUTE = 120
export const MIN_DISPLAY_TIME = 1000

/** Values it reads. */
export const ERROR = "error"
export const NEUTRAL = "neutral"

/** Close reasons it names itself. */
export const TIMEOUT = "timeout"
export const ESCAPE = "escape"
export const APPROVE = "approve"
export const DENY = "deny"
export const ACTION = "action"
export const DISMISS = "dismiss"
export const CLOSE_ALL = "close-all"

/** Roles of the toast. */
export const ALERT = "alert"

/** Class words of the markup contract (`ui-toast.css`) -- grammar, not attributes, so not in the vocabulary. */
export const FLOATING = "floating"
export const TOAST_BOX = "toast-box"
export const COMPACT = "compact"
export const UNCLICKABLE = "unclickable"
export const ACTIONS = "actions"
export const UI_BUTTONS = "ui buttons"
export const ICON_CLASS = "centered icon"
export const PROGRESS = "progress"
export const UP = "up"
export const DOWN = "down"
export const PROGRESSING = "progressing"

/** `data-ui-motion` value that keeps the bar running under reduced motion (`reset.css`). */
export const ESSENTIAL = "essential"

/** `UI.transitions` animation (Fomantic's `showMethod` / `hideMethod`). */
export const SCALE = "scale"

/** Key that closes it from inside. */
export const ESCAPE_KEY = "Escape"

/** Buttons an action click can come from, besides `<ui-button>`s. */
export const BUTTONS = "button, a[href], [role=button], input[type=button], input[type=submit]"

/** A click on one of these doesn't close a `close-on-click` toast (Fomantic's `selector.clickable`). */
export const CLICKABLE = "a, button, details, summary, label, input, select, textarea, [role=button], [tabindex]"

/** Form controls that turn `close-on-click` off (Fomantic's `selector.input`). */
export const FORM_CONTROLS = "input:not([type=hidden]), textarea, select, button"

////////////////
// ## UIToastHost
////////////////

/** What the host asks of its controller (`UIToast`). */
export type ToastController = {
  close(): boolean
}

////////////////
// ## ui-toast.fallback
////////////////

/** Event it still fires, checked against the vocabulary. */
export const HIDE: EventName<typeof toastVocabulary> = "ui-hide"
