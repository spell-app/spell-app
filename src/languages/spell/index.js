//
//  ## Master import file for spell language.
//  All other files MUST only import from here
//  or risk circular import problems.
//

export * from "../../parser"

export { default as SpellParser } from "./SpellParser"
export { AST } from "./ast/index"

// Export the entire language as `spell` and as the `default` export.
export { default as spellParser } from "./rules/_spellParser"

export * from "./SpellFileLocation"
export * from "./SpellProjectList"
export * from "./SpellProject"
export * from "./SpellProjectManifest"
export * from "./SpellProjectIndex"
export * from "./SpellFile"
