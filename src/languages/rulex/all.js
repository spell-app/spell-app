//
//  ## Master import file for rulex language.
//  All other files MUST only import from here
//  or risk circular import problems.
//

// Pull in everything from `parser`
export * from "../../parser/all"

// Pull in parser/constructor
export { rulex, RulexParser } from "./rulex"

// export rulex parser as the default
import { rulex } from "./rulex"
export default rulex
