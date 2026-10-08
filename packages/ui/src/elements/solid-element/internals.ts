/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/**
 * FIX 5 -- `ElementInternals` and form association (`component-register` issue #15).
 * - `formAssociated: true` (or `internals: true`) attaches `element.internals` in the constructor -- the only
 *   time `attachInternals()` is allowed before the element is defined elsewhere -- unless the base class
 *   already did.
 * - The platform's form callbacks are forwarded to hooks the component registers during setup, like
 *   `onCleanup`:  `onFormAssociated`, `onFormDisabled`, `onFormReset`, `onFormStateRestore`.  A base class's own
 *   callbacks still run first.
 */

import { addHook } from "./current"
import type { SolidElement } from "./solid-element.types"

/** Constructor step:  `element.internals`, when asked for and not attached by the base class already. */
export function attachInternals(element: SolidElement, wanted: boolean) {
  if (wanted && !element.internals) element.internals = element.attachInternals()
}

/** `formAssociatedCallback`:  the form owner changed (`null` when none). */
export function onFormAssociated(fn: (form: HTMLFormElement | null) => void) {
  addHook("formAssociated", fn)
}

/** `formDisabledCallback`:  an ancestor `<fieldset disabled>` (or own `disabled`) changed. */
export function onFormDisabled(fn: (disabled: boolean) => void) {
  addHook("formDisabled", fn)
}

/** `formResetCallback`:  the form was reset;  restore the starting value. */
export function onFormReset(fn: () => void) {
  addHook("formReset", fn)
}

/**
 * `formStateRestoreCallback`:  back / forward cache or autofill restored a value.
 * - `mode` is `"restore"` or `"autocomplete"`.
 */
export function onFormStateRestore(fn: (state: File | string | FormData | null, mode: string) => void) {
  addHook("formStateRestore", fn)
}
