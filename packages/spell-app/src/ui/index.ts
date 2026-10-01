//
//  ## Master import file for the app UI.
//

/** Import genric spell styles */
import "./spell.css"

/** Import syntax coloring custom properties, used by ASTViewer / MatchViewer. */
import "./syntax.css"

/** Import SUI-additions for spell */
import "./SUI-additions.css"

export * from "./ui.types"

export * from "./Actions"
export * from "./ASTViewer"
export * from "./AppContainer"
export * from "./AppRoot"
export * from "./chrome"
export * from "./ConsoleLines"
export * from "./SUIPassThroughs"
export * from "./ConsoleViewer"
export * from "./ErrorHandler"
export * from "./ErrorNotice"
export * from "./FileDropdown"
export * from "#spell-app/ui/forms"
export * from "./InputEditor"
export * from "./Markdown"
export * from "./LazyMonaco"
export * from "./MatchView"
export * from "./MatchViewer"
export * from "./Notice"
export * from "./OutputEditor"
export * from "./ProjectDropdown"
export * from "./ScopeDetailsPane"
export * from "./SpellPage"
export * from "./SplitPanel"
export * from "./ThingExplorer"
export * from "./TypeExplorer"
export * from "./modals"

/**
 * Everything above as the `UI` barrel.
 * - SIDE EFFECT: importing this pulls in every component.
 * - NOTE: `#spell-app/ui/monaco` is deliberately left out:  Monaco loads on first use -- see `LazyMonaco`.  Import a single component directly when that weight matters.
 * - NOTE: files in THIS folder may use `UI` too, but only inside render bodies
 *   -- the barrel imports them back, so the binding is still in its TDZ at module-evaluation time.
 *   NEVER dereference `UI.x` at the top level of a file in this folder.
 */
export * as UI from "./"
