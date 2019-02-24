//
//  ## Master import file for rulex language.
//  All other files MUST only import from here
//  or risk circular import problems.
//

export * from "../../parser/all.js";
export * from "./RulexParser.js"

// Export the entire language as `rulex` and as the `default` export.
import { rulex } from "./rulex.js";
export { rulex }
export default rulex;
