import type { P } from "~/parser"
// Import directly to avoid circular import
import { Symbol } from "./Symbol"

/**
 * Single blank line representation in parser output.
 * - ASSUMES blank line is `\n`, pass `literal: "x"` on construction for something else.
 */
export class BlankLine extends Symbol {
  constructor(props: Partial<P.LiteralProps>) {
    super({ ...props, literal: props.literal ?? "\n" })
  }
  compile() {
    return this.literal
  }
}
