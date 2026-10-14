import { camelCase, proto } from "$/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { classes } from "./classes.parser"

/**
 * `version_step` rule:  how a saved thing is brought up to a newer version of its type (epic `people-and-orgs` P6):
 * - `a person version 2 renames name to names`:  a file saved before version 2 has `name`;  read, it's `names`
 * - `a person version 3 drops nickname`:  a file saved before version 3 may have `nickname`;  read, it's gone
 * - A type's version is the highest any of its steps names (or its `to upgrade` methods, `upgrade_method`):
 *   a type with none is version 1.  Only renaming, dropping or changing a property needs one:  adding one doesn't.
 * - The saver writes a thing's type's version, `"$version": 3`, when it's past 1;  the loader reads a file of an
 *   older one step by step:  `SC.upgradeEntry()`.
 * - Compiles to a static the loader finds by its name, after the class:
 *   `Person.v2_renames_name = "names"`, `Person.v3_drops_nickname = true`.
 */
export class VersionStep extends SpellStatement<"type|version|from|to?|drops?"> {
  @proto static priority = Priority.declaration
  @proto static alias = "statement"

  /** Refused for a version below 2:  a file with no version is version 1. */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const version = VersionStep.versionOf(match)
    if (!Number.isInteger(version) || version < 2) {
      return SpellStatement.refuse(match, `A version step starts at version 2:  a file with no version is version 1`)
    }
    return match
  }

  getAST(match: P.MatchFor<this>): P.ASTPatchedMember {
    const { type, from, to } = match.groups
    const version = VersionStep.versionOf(match)
    const property = VersionStep.storedName(from)
    const step = new P.ASTStaticDefinition(match, {
      type: P.matchAST<P.ASTTypeExpression>(type),
      name: to ? `v${version}_renames_${property}` : `v${version}_drops_${property}`,
      value: to
        ? new P.ASTStringLiteral(match, { value: VersionStep.storedName(to), quote: '"' })
        : new P.ASTBooleanLiteral(match, true)
    })
    return new P.ASTPatchedMember(match, { member: step })
  }

  /** The name a property is saved under, as the writers name it:  `nick-name` => `nickName`. */
  static storedName(word: P.Match): string {
    return camelCase(`${word.value}`.replace(/_/g, "-"))
  }

  /** The version a step's match names, e.g. `2`. */
  static versionOf(match: P.MatchFor<VersionStep>): number {
    return Number(match.groups.version.value)
  }
}
classes.addRule(VersionStep, {
  syntax: "(a|an) {type:known_type} version {version:number} renames {from:identifier} to {to:identifier}",
  tests: [
    {
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        scope.parse("a person is a thing", "block")
      },
      tests: [
        ["a person version 2 renames name to names", 'Person.v2RenamesName = "names"'],
        ["a person version 4 renames nick-name to nickname", 'Person.v4RenamesNickName = "nickname"'],
        {
          title: "a version step starts at version 2",
          input: "a person version 1 renames name to names",
          js: "/* PARSE ERROR: A version step starts at version 2:  a file with no version is version 1 */"
        }
      ]
    }
  ]
})
classes.addRule(VersionStep, {
  syntax: "(a|an) {type:known_type} version {version:number} (drops:drops) {from:identifier}",
  tests: [
    {
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        scope.parse("a person is a thing", "block")
      },
      tests: [["a person version 3 drops nickname", "Person.v3DropsNickname = true"]]
    }
  ]
})
