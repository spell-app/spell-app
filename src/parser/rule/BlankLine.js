import Rule from "./Rule"

// Blank line representation in parser output.
Rule.BlankLine = class blank_line extends Rule {
  compile(scope, match) {
    return "\n"
  }
}
