//
//  ## Master import file for spell language.
//  All other files MUST only import from here
//  or risk circular import problems.
//

export * from "../../parser/all"

export * from "./Spell"
export * from "./scope/all"

// Export the entire language as `spell` and as the `default` export.
import { spellParser } from "./rules/_spell"
export { spellParser }
export default spellParser
