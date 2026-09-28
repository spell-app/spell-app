//
//  ## `semantic-ui-react` pass-throughs for spell programs:  `<UI.Button>`, `<UI.Grid>` ...
//
//  NOTE: its own file, importing nothing of the editor's, so the VS Code runner (`~/app/runner`)
//  can offer them without pulling in the editor.  The `UI` barrel re-exports them as usual.
//

import * as SUI from "semantic-ui-react"

/**
 * `semantic-ui-react` components re-exported onto `UI` for spell programs to use.
 * - NEVER wrap these in `view()`.  As of v3 every SUI component is a `forwardRef` OBJECT, and
 *   `view()` observes by CALLING what you hand it -- so it throws "Function.prototype.apply was
 *   called on #<Object>" on anything that isn't a plain function.
 * - Going bare costs ONE narrow thing, measured.  A wrapped leaf ALSO subscribed to observables
 *   that only IT read:
 *
 *       const thing = createStore({ label: { content: "before" } })
 *       // parent passes `label` straight through -- only `SUI.Button` ever reads `.content`
 *       <UI.Button label={thing.label} />
 *       thing.label.content = "after"   // in place, so the parent's `label` value never changed
 *
 *   Wrapped, the button re-rendered and showed `after`.  Bare, it sits on `before` forever.
 * - Takes ALL THREE to bite:  observable object passed straight through, mutated IN PLACE, and a
 *   field the parent never read.  Nothing does this today -- every binding we have computes its
 *   value in the parent (e.g. spell's `<UI.Button disabled={the newTaskName of the app is ""}>`),
 *   so the parent re-renders and hands the leaf a new prop.
 * - NOTE: children are immune -- React validates child keys by ITERATING them inside the PARENT's
 *   render, which subscribes the parent whether we wrap the leaf or not.
 * - NEVER "fix" this by wrapping in a function component.  It does NOT restore tracking -- the
 *   wrapper only builds an element, and `SUI.Button` still renders in its own fiber, outside the
 *   reaction -- and it additionally drops statics (`UI.Button.Group`) and refs.
 * - To actually restore it, observe the component's OWN render fn so it runs inside the reaction:
 *
 *       const inner = SUI.Button.render          // `.type` instead, for a `memo` component
 *       const Reactive = view((props) => inner(props, props.__ref))
 *       export const Button = Object.assign(
 *         React.forwardRef((props, ref) => <Reactive {...props} __ref={ref} />),
 *         SUI.Button                             // carry `.Group` etc. across
 *       )
 */
export const Button = SUI.Button
export const Card = SUI.Card
export const Column = SUI.Grid.Column
export const Container = SUI.Container
export const Grid = SUI.Grid
export const Icon = SUI.Icon
export const Row = SUI.Grid.Row
export const Segment = SUI.Segment
