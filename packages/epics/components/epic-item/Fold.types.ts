/**
 * The ACTIONS SLOT every `<epic-*>` element with a title row shares (epic `epic-workflow` P25):
 * a page's own buttons in that row, `<ui-button slot="actions">`.
 * - Who has one:  `<epic-section>`, `<epic-overview>`, `<epic-phase>`, `<epic-item>`, `<epic-aside>`, `<epic-code>`,
 *   `<epic-update>` (drawn as a block)
 * - Where its buttons go:  after the title, BEFORE the element's own buttons
 *   (the fold chevron, collapse-all, review pills, the state chips, the date)
 * - A click on one never folds or unfolds the element (`CONTROLS`, in `Fold.tsx`).
 * - The docs runtime puts a block's bullhorn there too (`spell-doc-runtime.js`, `addBullhorn()`).
 * - Data only:  vocabularies import it, so nothing here runs, and nothing is imported.
 *   `Fold.actions()` draws the slot's box.
 */

/** The slot's name. */
export const ACTIONS_SLOT = "actions"

/** The slot, as each vocabulary lists it. */
export const ACTIONS_SLOT_SPEC = {
  name: ACTIONS_SLOT,
  description:
    'Buttons of the page\'s own in its title row (`<ui-button slot="actions">`):  after the title, before its own ' +
    "buttons;  a click on one never folds it.  The docs runtime puts the block's bullhorn here too."
} as const

/** The slot, as each vocabulary's `children` (the content model) allows it. */
export const ACTIONS_CHILD = {
  tag: "flow",
  slot: ACTIONS_SLOT,
  description: 'Buttons for its title row (`<ui-button slot="actions">`), before its own.'
} as const

/** The slot's box in a title row, a part of each element that draws it (`Fold.actions()`). */
export const ACTIONS_PART_SPEC = {
  name: "actions",
  description: "In its title row, after the title and before its own buttons:  the `actions` slot."
} as const
