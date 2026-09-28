//
//  ## Master import file for the app UI.
//

/** Import genric spell styles */
import "./spell.less"

/** Import SUI-additions for spell */
import "./SUI-additions.less"

export * from "./ui.types"

export * from "./Actions"
export * from "./ASTViewer"
export * from "./AppContainer"
export * from "./chrome"
export * from "./ConsoleViewer"
export * from "./ErrorHandler"
export * from "./ErrorNotice"
export * from "./FileDropdown"
export * from "~/app/ui/forms"
export * from "./InputEditor"
export * from "./LazyMonaco"
export * from "./MatchView"
export * from "./MatchViewer"
export * from "./Notice"
export * from "./OutputEditor"
export * from "./ProjectDropdown"
export * from "./SpellPage"
export * from "./SplitPanel"
export * from "./modals"

/**
 * Everything above as the `UI` barrel.
 * - SIDE EFFECT: importing this pulls in every component.
 * - NOTE: `~/app/ui/monaco` is deliberately left out:  Monaco loads on first use -- see `LazyMonaco`.  Import a single component directly when that weight matters.
 * - NOTE: files in THIS folder may use `UI` too, but only inside render bodies
 *   -- the barrel imports them back, so the binding is still in its TDZ at module-evaluation time.
 *   NEVER dereference `UI.x` at the top level of a file in this folder.
 */
export * as UI from "."
