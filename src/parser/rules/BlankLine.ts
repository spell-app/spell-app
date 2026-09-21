import type { P } from "~/parser"
// Import directly to avoid circular import
import { Symbol } from "./Symbol"

/**
 * Single blank line representation in parser output.
 * - ASSUMES blank line is `\n`, pass `literal: "x"` on construction for something else.
 */
export class BlankLine<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends Symbol<Groups, MatchData> {
  /** Defaults `literal` to `"\n"` when not passed. */
  constructor(props: Partial<P.LiteralProps>) {
    super({ ...props, literal: props.literal ?? "\n" })
  }
  /** Output is `this.literal` directly, not `match.value` -- see `Literal.compile()` for the base behavior. */
  compile() {
    return this.literal
  }
}
