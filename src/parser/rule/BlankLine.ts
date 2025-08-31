import { Symbol, type LiteralProps } from "./Literal.js"

/**
 * Single blank line representation in parser output.
 */
export class BlankLine extends Symbol {
  constructor(props: LiteralProps) {
    super({ literal: "\n", ...props })
  }
  compile() {
    return "\n"
  }
}
