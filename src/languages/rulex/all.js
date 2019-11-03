//
//  ## Master import file for rulex language.
//  All other files MUST only import from here
//  or risk circular import problems.
//

// Pull in parser/constructor
import { rulex, RulexParser } from "./rulex"

// Pull in everything from `parser`
export * from "../../parser/all"

// export rulex parser as the default
export { rulex, RulexParser }
export default rulex
