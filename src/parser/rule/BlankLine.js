import { Symbol } from "./Literal.js"

/**
 * Blank line representation in parser output.
 */
export class BlankLine extends Symbol {
  constructor(props) {
    super({ literal: "\n", ...props })
  }
  compile() {
    return "\n"
  }
}
