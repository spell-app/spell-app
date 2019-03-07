//
//  ## Master import file for spell language.
//  All other files MUST only import from here
//  or risk circular import problems.
//

export * from "../../parser/all.js";

export * from "./SpellParser.js"
export * from "./Block.js"
export * from "./BlockLine.js"
export * from "./Statement.js"
export * from "./BlockStatement.js"
export * from "./StatementParseError.js"
export * from "./inflection.js";

// Export the entire language as `spell` and as the `default` export.
import { spell } from "./spell.js";
export { spell }
export default spell;
