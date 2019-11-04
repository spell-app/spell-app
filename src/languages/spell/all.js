//
//  ## Master import file for spell language.
//  All other files MUST only import from here
//  or risk circular import problems.
//

export * from "../../parser/all"

export { default as Spell } from "./Spell"
export * from "./scope/all"

// Export the entire language as `spell` and as the `default` export.
export { spellParser } from "./rules/_spell"
export { spellParser as default } from "./rules/_spell"
