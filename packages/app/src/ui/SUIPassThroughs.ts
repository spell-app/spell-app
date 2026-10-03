//
//  ## `semantic-ui-react` pass-throughs for spell programs:  `<UI.Button>`, `<UI.Grid>` ...
//
//  NOTE: its own file, importing nothing of the editor's, so the VS Code runner (`$/app/runner`)
//  can offer them without pulling in the editor.  The `UI` barrel re-exports them as usual.
//

import * as SUI from "semantic-ui-react"

/**
 * `semantic-ui-react` components re-exported onto `UI` for spell programs to use.
 * - NEVER wrap these in `view()` (`$/util`'s React bridge).  As of v3 every SUI component is a `forwardRef`
 *   OBJECT, and `view()` renders only functions and classes.
 * - Going bare costs nothing:  a leaf's props are computed in its PARENT's render, which follows the spell cells
 *   it read and re-renders, handing the leaf new props -- e.g. spell's
 *   `<UI.Button disabled={the newTaskName of the app is ""}>`.
 *   - With `easy-state`, a leaf could also follow a nested object mutated IN PLACE that only it read.  Spell cells
 *     never follow in-place changes (`$/util`'s `extend.ts`), so wrapping wouldn't restore that either.
 * - NOTE: children are immune -- React validates child keys by ITERATING them inside the PARENT's render, which
 *   follows them whether we wrap the leaf or not.
 * - NEVER "fix" anything by wrapping in a function component:  `SUI.Button` still renders in its own fiber,
 *   outside the reaction -- and it drops statics (`UI.Button.Group`) and refs.
 */
export const Button = SUI.Button
export const Card = SUI.Card
export const Column = SUI.Grid.Column
export const Container = SUI.Container
export const Grid = SUI.Grid
export const Icon = SUI.Icon
export const Row = SUI.Grid.Row
export const Segment = SUI.Segment
