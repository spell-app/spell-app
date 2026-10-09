/**
 * `forms` lib entry (`@spell-app/ui/forms`):  what only form controls with a VALUE need,
 * split from `core` so a page without one never loads it.
 * - `FormComponent` (form value, validity, reset) on a `DOMFormControl` (the form-control API)
 * - `Validator` (Fomantic's rules)
 * - `MenuOptions` (search, additions, keyboard navigation of an option list)
 * - `ControlLabels` (the DOM element's `<label>`s as the inner control's name)
 * - Imported by the families with a value:
 *   `checkbox`, `dropdown`, `form`, `input`, `select`, `search`, `calendar`, `rating` and `slider`.
 *   - `ui-button` is form-associated too (submit / reset), but through `elementSetup.isAFormControl` alone:
 *     it needs no value, validity or form API, so it stays on `core`.
 * - NOTE: re-exports `$/ui/elements` leaves one by one, for the reason given in `core.ts`.
 * - NOTE: every `forms` file imports the element core through the `$/ui/core` ENTRY (`E`), never its leaves,
 *   or Rolldown hoists what `core` and `forms` share into a third, hashed chunk.
 *   - They reach each other through `F`,
 *     except what a class definition reads (`FormComponent`'s `DOMFormControl`, `Validator`):
 *     that comes directly (WWOD §4 › "Circular imports").
 */

export * from "$/ui/elements/Validator"
export * from "$/ui/elements/MenuOptions"
export * from "$/ui/elements/DOMFormControl"
export * from "$/ui/elements/FormComponent"
export * from "$/ui/elements/ControlLabels"

/** The `forms` namespace:  `import { F } from "$/ui/forms"`, then `F.FormComponent` (`AGENTS.md`). */
export * as F from "$/ui/forms"
