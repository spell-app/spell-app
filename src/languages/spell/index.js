//
//  ## Master import file for spell language.
//  All other files MUST only import from here
//  or risk circular import problems.
//

export { AST } from "./ast"
// Base parser class
export { SpellParser } from "./SpellParser"
// Instance of parser with "core" rules applied
export { spellParser, ParseError } from "./rules"
// spellCore library
export { spellCore } from "./spell-core"

export * from "./SpellLocation"
export * from "./SpellProjectRoot"
export * from "./SpellProject"
export * from "./SpellFile"
export * from "./SpellJSFile"
export * from "./SpellCSSFile"
export * from "./projectSetup"
