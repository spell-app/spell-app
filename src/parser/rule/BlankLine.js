import { Rule } from "./all.js"

// Blank line representation in parser output.
Rule.BlankLine = class blank_line extends Rule {
  compile(scope, match) {
    return "\n"
  }
}
