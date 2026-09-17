//
//  ## Master import file for spell language.
//  All other files MUST only import from here
//  or risk circular import problems.
//

/**
 * All SpellParser code as `SP` barrel.
 *
 * Prefer importing as `import { SP } from "~/languages/spell" when possible.
 */
export * as SP from "."

export * from "./SpellLocation"
export * from "./SpellProjectRoot"
export * from "./SpellProject"
export * from "./SpellFile"
export * from "./SpellJSFile"
export * from "./SpellCSSFile"
export * from "./SpellSetup"
export * from "./SpellParser"

// Base parser class
// Instance of parser with "core" rules applied
export { spellParser, ParseError, parseExpression } from "./rules"
