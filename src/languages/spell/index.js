//
//  ## Master import file for spell language.
//  All other files MUST only import from here
//  or risk circular import problems.
//

export * from "../../parser"

export { default as Spell } from "./Spell"
export * as AST from "./AST"

// Export the entire language as `spell` and as the `default` export.
export { default as spellParser } from "./rules/_spellParser"

export * from "./SpellFileLocation"
export * from "./SpellFile"
export * from "./SpellProject"
export * from "./SpellProjectManifest"
