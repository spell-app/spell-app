//
//  ## Master import file for spell language.
//  All other files MUST only import from here
//  or risk circular import problems.
//

// Grab bits from `/parser` to ensure load order.
export {
  Parser,
  ParseError,
  Rule,
  Token,
  Tokenizer,
  WhitespacePolicy
} from "../../parser/all.js";

export * from "./SpellParser.js"

// Export the entire language as `spell` and as the `default` export.
import { spell } from "./spell.js";
export { spell }
export default spell;
