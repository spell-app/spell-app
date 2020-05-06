import { Rule } from "."

// Blank line representation in parser output.
Rule.BlankLine = class blank_line extends Rule {
  compile(match) {
    return "\n"
  }
}
