import { Rule } from "."

// Blank line representation in parser output.
export class BlankLine extends Rule {
  compile(match) {
    return "\n"
  }
}
