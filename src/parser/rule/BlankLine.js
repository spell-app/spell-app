import { proto } from "~/util"
import { Rule } from "."

// Blank line representation in parser output.
export class BlankLine extends Rule {
  @proto name = "BlankLine"
  compile(match) {
    return "\n"
  }
}
