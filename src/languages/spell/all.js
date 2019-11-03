//
//  ## Master import file for spell language.
//  All other files MUST only import from here
//  or risk circular import problems.
//

export * from "../../parser/all.js"

export * from "./Spell.js"
export * from "./scope/all.js"

// Export the entire language as `spell` and as the `default` export.
import { spellParser } from "./rules/_spell.js"
export { spellParser }
export default spellParser
