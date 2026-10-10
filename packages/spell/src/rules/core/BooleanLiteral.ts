import { assert, proto } from "$/util"
import { P } from "$/parser"
import { core } from "./core.parser"

/**
 * `boolean` rule:  boolean literal -- also accepts common synonyms like `yes`/`no`, `ok`/`cancel`, `always`/`never`.
 * - e.g. `true`, `yes`, `ok`, `always`
 * - Class named `BooleanLiteral`, not `Boolean`, which would hide javascript's `Boolean`.
 * - TODO: better name for this?  "flag"?  "truism"?
 */
export class BooleanLiteral extends P.Pattern {
  static ruleName = "boolean"
  @proto static alias = "expression"
  @proto static datatype = "choice"
  @proto static pattern = /^(true|false|yes|no|ok|cancel|always|never)$/
  @proto static VALUE_MAP = {
    true: true,
    false: false,
    yes: true,
    no: false,
    ok: true,
    cancel: false,
    always: true,
    never: false
  }

  getAST(match: P.MatchFor<this>): P.ASTBooleanLiteral {
    const { value, raw } = match
    return new P.ASTBooleanLiteral(match, { value: assert.boolean(value), raw })
  }
}
core.addRule(BooleanLiteral, {
  tests: [
    {
      title: "correctly matches booleans",
      tests: [
        ["", undefined],
        ["true", "true"],
        ["yes", "true"],
        ["ok", "true"],
        ["always", "true"],
        ["false", "false"],
        ["no", "false"],
        ["cancel", "false"],
        ["never", "false"]
      ]
    },
    {
      title: "doesn't match in the middle of a longer keyword",
      tests: [
        ["yessir", undefined],
        ["yes-sir", undefined],
        ["yes_sir", undefined]
      ]
    }
  ]
})
