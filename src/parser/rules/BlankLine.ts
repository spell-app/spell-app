import { Symbol, type LiteralProps } from "./Literal"

/**
 * Single blank line representation in parser output.
 */
export class BlankLine extends Symbol {
  constructor(props: Partial<LiteralProps>) {
    super({ ...props, literal: props.literal ?? "\n" })
  }
  compile() {
    return this.literal
  }
}
