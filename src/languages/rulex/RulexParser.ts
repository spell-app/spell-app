//
//  # Core `rules` -- simple datatypes, etc.
//
// NOTE: many of the below are created as custom Pattern subclasses for debugging.
//

import { P } from "~/parser"
// Import directly to avoid circular import
import { Parser } from "~/parser/Parser"

export class RulexParser extends Parser {
  static {
    Object.defineProperty(this.prototype, "defaultRule", { value: "sequence", writable: true })
  }

  /** Compiling rulex syntax always yields a `Rule`. */
  compile(input: string | P.Token | P.Token[], ruleName?: string, scope?: P.Scope): P.Rule {
    const rule = super.compile(input, ruleName, scope)
    if (!(rule instanceof P.Rule)) {
      throw new P.ParserError({
        message: "rulex.compile() did not produce a Rule",
        context: this,
        activity: "compile",
        params: { input, ruleName, result: rule }
      })
    }
    return rule
  }

  // Apply flags from `match` to the `rule` passed in, possibly returning a new rule!
  applyFlags(rule: P.Rule, match: P.Match<P.FlagGroups>): P.Rule {
    const repeatFlag = match.groups.repeatFlag?.compile()
    const argument = match.groups.argument?.compile()
    const testLocation = match.groups.testLocation?.compile()

    // handle repeat, which may nest the rule in a repeat
    if (repeatFlag === "?") rule.optional = true
    else if (repeatFlag === "+") rule = new P.Repeat({ rule })
    else if (repeatFlag === "*") rule = new P.Repeat({ rule, optional: true })

    if (typeof argument === "string" && argument) rule.argument = argument
    if (testLocation === P.ANYWHERE || testLocation === P.AT_START) rule.testLocation = testLocation

    return rule
  }

  // Consolidate runs of literals in `rules` of type `constructor` together.
  consolidateLiterals(
    rules: P.Rule[],
    constructor: Class<P.Literal>,
    literalKey: "literal",
    GroupConstructor: Class<P.Rule> = constructor
  ): P.Rule[] {
    if (rules.length === 1) return rules

    const output: P.Rule[] = []
    for (let start = 0, rule: P.Rule | undefined; (rule = rules[start]); start++) {
      // TODO: inline `isAdorned`
      if (rule instanceof constructor && !rule.isAdorned) {
        // find the end of the run
        let end = start
        for (let next: P.Rule | undefined; (next = rules[end + 1]); end++) {
          if (!(next instanceof constructor && !next.isAdorned)) break
        }
        if (end > start) {
          // combine literals into a single map
          const literals: Array<string | string[] | P.LiteralMatcher> = rules.slice(start, end + 1).map((nextRule) => {
            const literal = (nextRule as P.Literal)[literalKey]
            if (!nextRule.optional) return literal

            // make sure optionals are arrays and add the optional flag to the array
            return { literal, optional: true }
          })
          rule = new GroupConstructor(literals)
          start = end
        }
      }
      output.push(rule)
    }
    return output
  }

  /** Compile a rulex sub-`match`, which must yield a `Rule`. */
  static compileMatchOrDie(match: P.Match | undefined): P.Rule {
    const rule = match?.compile()
    if (!(rule instanceof P.Rule)) {
      throw new P.ParserError({
        message: "Expected rulex match to compile to a Rule",
        context: "rulex",
        activity: "compileMatchOrDie",
        params: { match, result: rule }
      })
    }
    return rule
  }
}
