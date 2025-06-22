//
//  # Rules for variables
//
import { singularize, pluralize } from "~/util"
import { Pattern } from "~/parser/rule/Pattern"
import { Rules } from "~/parser"
import { AST, SpellParser } from "~/languages/spell"
import { identifierBlacklist } from "./identifier-blacklist"
import { Sequence } from "~/parser/rule/Sequence"
import { SpellStatement } from "./Statement"
import { SpellExpression } from "./expressions"

// Alpha-numeric word, including dashes or underscores.
const WORD = /^[a-zA-Z][\w\-]*$/

// Single word variable name, known or unknown.
// NOTE: when compiling, we'll look for `scope.variables.get(varName)`:
//        - if we find one, you can override what's output with `variable.ouput`.
// TODO: type based on scope variable type?
// TODO: higher precedence if variable is known?
class VariableIdentifier extends Pattern {
  /*@proto*/ get pattern() {
    return WORD
  }
  set pattern(pattern) {
    this.override("pattern", pattern)
  }
  /*@proto*/ get blacklist() {
    return identifierBlacklist
  }
  set blacklist(blacklist) {
    this.override("blacklist", blacklist)
  }

  /** Map value by converting dashes and whitespace to underscores. */
  mapValue(value) {
    return `${value}`.replace(/-/g, "_").replace(/\s/g, "_")
  }

  getAST(match) {
    // Get scope Variable, if there is one
    const variable = match.scope.variables.get(match.value)
    // Allow variable to override name if it wants to (e.g. "it")
    const name = variable && variable.output ? variable.output : match.value
    return new AST.VariableExpression(match, { raw: match.raw, name, variable })
  }
}
SpellParser.Rules.VariableIdentifier = VariableIdentifier

export const variables = new SpellParser({
  module: "variables",
  rules: [
    // Variable identifier with no adornments.
    // You won't generally use this, use `variable` or `unknown_variable` instead.
    {
      name: "variable_identifier",
      constructor: VariableIdentifier
    },

    // VariableIdentifier which may or may not be known, with optional `the` prefix.
    {
      name: "variable",
      syntax: "the? {identifier:variable_identifier}",
      constructor: class variable extends Rules.Sequence {
        parse(scope, tokens) {
          const match = super.parse(scope, tokens)
          if (!match) return undefined
          // Set `match.variable` to the scope variable, if there is one.
          match.variable = scope.variables.get(match.groups.identifier.value) || null
          return match
        }
        getAST(match) {
          return match.groups.identifier.AST
        }
      },
      tests: [
        {
          tests: [
            { title: "single word", input: "thing", output: "thing" },
            { title: "single word with the", input: "the thing", output: "thing" },
            { title: "multi-word", input: "bank-account", output: "bank_account" },
            { title: "multi-word with the", input: "the bank-account", output: "bank_account" },
            { title: "blacklisted word", input: "if", output: undefined }
          ]
        }
      ]
    },

    // Single word variable which is already known by our scope, with optional `the` prefix
    // Note that we match this as an "expression".
    {
      name: "known_variable",
      alias: "expression",
      // NOTE: `match` returned is the `{variable_identifier}`, not this sequence.
      syntax: "the? {identifier:variable_identifier}",
      constructor: class known_variable extends Rules.Sequence {
        parse(scope, tokens) {
          const match = super.parse(scope, tokens)
          if (!match) return undefined
          // Try to find the scope Variable associated with the identifier in canonical form
          match.variable = scope.variables.get(match.groups.identifier.value)
          if (!match.variable) return undefined
          return match
        }
        getAST(match) {
          return match.groups.identifier.AST
        }
      },
      tests: [
        {
          compileAs: "known_variable", // TODO: "expression"
          beforeEach(scope) {
            scope.variables.add("thing")
            scope.variables.add("bank-account")
          },
          tests: [
            { title: "single word", input: "thing", output: "thing" },
            { title: "multi-word", input: "bank-account", output: "bank_account" },
            { title: "not defined", input: "nothing", output: undefined }
          ]
        }
      ]
    },

    // Possibly unknown variable identifier which MUST be singular, WITHOUT `the`.
    {
      name: "singular_variable",
      constructor: class singular_variable extends VariableIdentifier {
        parse(scope, tokens) {
          const match = super.parse(scope, tokens)
          if (match && match.raw === singularize(match.raw)) return match
          return undefined
        }
        getAST(match) {
          const variable = super.getAST(match)
          variable.plurality = "singular"
          return variable
        }
      },
      tests: [
        {
          tests: [
            { title: "singular, single word", input: "thing", output: "thing" },
            { title: "singular, multi-word", input: "bank-account", output: "bank_account" },
            { title: "plural, single word", input: "things", output: undefined },
            { title: "plural, multi-word", input: "bank-accounts", output: undefined }
          ]
        }
      ]
    },

    // Possibly unknown variable identifier which MUST be plural, WITHOUT `the`.
    {
      name: "plural_variable",
      constructor: class plural_variable extends VariableIdentifier {
        parse(scope, tokens) {
          const match = super.parse(scope, tokens)
          if (match && match.raw === pluralize(match.raw)) return match
          return undefined
        }
        getAST(match) {
          const variable = super.getAST(match)
          variable.plurality = "plural"
          return variable
        }
      },
      tests: [
        {
          tests: [
            { title: "plural, single word", input: "things", output: "things" },
            { title: "plural, multi-word", input: "bank-accounts", output: "bank_accounts" },
            { title: "singular, single word", input: "thing", output: undefined },
            { title: "singular, multi-word", input: "bank-account", output: undefined }
          ]
        }
      ]
    }
  ]
})
