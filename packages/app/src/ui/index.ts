//
//  ## Master import file for the app UI.
//

/** Import genric spell styles */
import "./spell.css"

/** Import SUI-additions for spell */
import "./SUI-additions.css"

export * from "./ui.types"

export * from "./Actions"
export * from "./AppContainer"
export * from "./AppRoot"
export * from "./chrome"
export * from "./SUIPassThroughs"
export * from "./FileDropdown"
export * from "$/app/ui/forms"
export * from "./ProjectDropdown"
export * from "./SpellPage"
export * from "./SplitPanel"
export * from "./islands"

/**
 * Everything above as the `UI` barrel:  the React shell (pages' chrome, menus, layout) and spell's React UI kit.
 * - SIDE EFFECT: importing this pulls in every component.
 * - The panes are Solid (`$/app/solid`, P6):  `./islands` mounts them under their old names (`UI.InputRoot` ...).
 * - `syntax.css` (the syntax colours) is imported by the Solid viewers that use it.
 * - NOTE: `$/app/ui/monaco` is deliberately left out:  it's Monaco's plumbing, loaded on first use through
 *   `$/app/solid`'s `LazyMonaco`.
 * - NOTE: files in THIS folder may use `UI` too, but only inside render bodies
 *   -- the barrel imports them back, so the binding is still in its TDZ at module-evaluation time.
 *   NEVER dereference `UI.x` at the top level of a file in this folder.
 */
export * as UI from "./"
