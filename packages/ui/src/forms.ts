/**
 * `forms` lib entry (`@spell-app/ui/forms`):  what only form controls with a VALUE need, split from `core` so a page
 * without one never loads it.
 * - `FormElement` (form value, validity, reset) on a `FormHost` (the form-control API), `Validator` (Fomantic's
 *   rules), `MenuOptions` (search, additions, keyboard navigation of an option list) and `ControlLabels` (the
 *   host's `<label>`s as the inner control's name).
 * - Imported by `dropdown`, `input`, `checkbox` and `form`.  `ui-button` is form-associated too (submit / reset), but through the fork's
 *   `formAssociated` option alone:  it needs no value, validity or form API, so it stays on `core`.
 * - NOTE: `$/ui/elements` leaves directly, for the reason given in `core.ts`;  and `FormHost` / `FormElement` import
 *   the element core through the `$/ui/core` ENTRY, never its leaves, or Rolldown hoists what `core` and `forms`
 *   share into a third, hashed chunk.
 */

export * from "$/ui/elements/Validator"
export * from "$/ui/elements/MenuOptions"
export * from "$/ui/elements/FormHost"
export * from "$/ui/elements/FormElement"
export * from "$/ui/elements/ControlLabels"

/** The `forms` namespace:  `import { F } from "$/ui/forms"`, then `F.FormElement` (`AGENTS.md`). */
export * as F from "$/ui/forms"
