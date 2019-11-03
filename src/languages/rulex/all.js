//
//  ## Master import file for rulex language.
//  All other files MUST only import from here
//  or risk circular import problems.
//

// Pull in everything from `parser`
export * from "../../parser/all.js"

// Pull in parser/constructor
export { rulex, RulexParser } from "./rulex.js"

// export rulex parser as the default
import { rulex } from "./rulex.js"
export default rulex
