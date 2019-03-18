//
//  ## Master import file for spell language.
//  All other files MUST only import from here
//  or risk circular import problems.
//

export * from "../../parser/all.js";

export * from "./Spell.js"
export * from "./Scope.js"
import "./Block.js"
import "./BlockLine.js"
import "./Statement.js"
import "./StatementParseError.js"
export * from "./inflection.js";

// Export the entire language as `spell` and as the `default` export.
import { spell } from "./rules/_spell.js";
export { spell }
export default spell;
