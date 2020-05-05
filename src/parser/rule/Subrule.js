import Rule from "./Rule"

// Subrule -- name of another rule to be called.
// `rule.rule` is the name of the rule in `scope.rules`.
//
// After parsing
//  we'll return the actual rule that was matched (rather than a clone of this rule)
Rule.Subrule = class subrule extends Rule {
  constructor(props) {
    if (typeof props === "string") props = { rule: props }
    super(props)
  }

  // Ask the subrule to figure out if a match is possible.
  test(scope, tokens, testLocation = this.testLocation) {
    const rule = scope.parser.getRuleOrDie(this.rule)
    return rule.test(scope, tokens, testLocation)
  }

  parse(scope, tokens) {
    if (!tokens.length) return undefined
    const rule = scope.parser.getRuleOrDie(this.rule)

    const match = rule.parse(scope, tokens)
    if (!match) return undefined
    if (this.argument) match.argument = this.argument
    return match
  }

  toSyntax() {
    const { testLocation, argument, optional } = this.getSyntaxFlags()
    return `${testLocation}{${argument}${this.rule}}${optional}`
  }
}
