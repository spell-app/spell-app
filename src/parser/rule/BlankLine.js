import { Rule } from "./Rule.js"

// Blank line representation in parser output.
export class BlankLine extends Rule {
  compile(match) {
    return "\n"
  }
}
