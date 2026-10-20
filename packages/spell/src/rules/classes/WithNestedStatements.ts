import { P } from "$/parser"
import { classes } from "./classes.parser"

/**
 * `with_nested_statements` rule:  `where:`, `with:` or a bare `:` ending a line -- then the indented block under it is
 * the statement's body, e.g. a type's outline body (epic page `outline-spell` Q7).
 * - A body keyword which matches words on the line (`leadIn`, see `BODY_KEYWORDS`):
 *   it ends a statement's `syntax`, e.g. `(a|an) {type} is (a|an) {superType:type} {with_nested_statements}?`.
 *   - The statement takes the block only when this matched,
 *     except a type's heading, which takes it anyway (`TypeDeclaration`, P10).
 * - `where` needs no colon (P10);  `with` does, as `with jokers` could start a name.
 */
export class WithNestedStatements extends P.Sequence {}
classes.addRule(WithNestedStatements, {
  syntax: "(where|with)? :",
  tests: [
    {
      // matched only:  its statement compiles, never this
      compileAs: "with_nested_statements",
      tests: [
        ["where:", "where :"],
        ["with:", "with :"],
        [":", ":"]
      ]
    }
  ]
})
// ... and `where` with no colon (P10)
classes.addRule(WithNestedStatements, {
  syntax: "where",
  tests: [{ compileAs: "with_nested_statements", tests: [["where", "where"]] }]
})
