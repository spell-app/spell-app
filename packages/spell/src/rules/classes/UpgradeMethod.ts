import { proto } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
import { Priority } from "$/spell/rules/rules.types"
import { getKnownType } from "$/spell/rules/types"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { classes } from "./classes.parser"
import { type MethodBody } from "./classes.shared"

/**
 * `upgrade_method` rule:  what bringing a saved thing up to a version takes, beyond renames and drops
 * (epic `people-and-orgs` P6):
 * - `to upgrade (a person) to version 4: set its full-name to its first-name`
 * - Its body runs on the thing just read from an OLDER file, after that version's renames and drops
 *   (`version_step`):  `it`, `its` and `the person` are the thing;  what the old file held that its type doesn't
 *   declare is there to read too, as the thing's plain fields (and saved with it, until a step drops it).
 * - Its version counts towards its type's version, as a step's does.
 * - Compiles to a method the loader finds by its name, `upgradeToVersion4()`:  `SC.upgradeEntry()`.
 */
export class UpgradeMethod extends SpellStatement<"type|version|body?"> {
  @proto static priority = Priority.declaration
  @proto static alias = "statement"

  /** The method we define, e.g. `upgrade a person to version 4` -- for editors' symbol lists. */
  getDeclaration(match: P.MatchFor<this>): P.Declaration {
    const { type, version } = match.groups
    return {
      kind: "method",
      name: `upgrade a ${type.raw} to version ${version.value}`,
      nameMatch: type,
      of: `${type.value}`,
      detail: `${UpgradeMethod.methodName(match)}()`
    }
  }

  /** Refused for a version below 2:  a file with no version is version 1. */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const version = Number(match.groups.version.value)
    if (!Number.isInteger(version) || version < 2) {
      return SpellStatement.refuse(match, `An upgrade starts at version 2:  a file with no version is version 1`)
    }
    return match
  }

  /** Nested scope for the body:  `it`, `its` and `the person` are the thing being upgraded. */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    const type = getKnownType(match.groups.type)
    return new P.MethodScope({
      parentScope: match.scope,
      thisVar: type.instanceName,
      mapItTo: "this",
      itDatatype: SP.typeName(type.name),
      declaredBy: match
    })
  }

  getAST(match: P.MatchFor<this>): P.ASTPropertyDefinition {
    return new P.ASTPropertyDefinition(match, {
      type: P.matchAST<P.ASTTypeExpression>(match.groups.type),
      property: UpgradeMethod.methodName(match),
      method: new P.ASTMethodDefinition(match, {
        args: [],
        body: P.matchAST<MethodBody>(this.getBody(match)),
        datatype: "nothing"
      })
    })
  }

  /** `upgradeToVersion4`, for version 4. */
  static methodName(match: P.MatchFor<UpgradeMethod>): string {
    return `upgradeToVersion${match.groups.version.value}`
  }
}
classes.addRule(UpgradeMethod, {
  syntax: "to upgrade \\( (a|an) {type:known_type} \\) to version {version:number} :? {statement_body}?",
  tests: [
    {
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        scope.parse(["a person is a thing", "a person has a name as text"].join("\n"), "block")
      },
      tests: [
        [
          'to upgrade (a person) to version 4: set its name to "x"',
          ["Person.prototype.upgradeToVersion4 = function () {", '  this.name = "x"', "}"],
          [
            "export interface Person { upgradeToVersion4(): undefined }",
            "Person.prototype.upgradeToVersion4 = function (this: Person) {",
            '  this.name = "x"',
            "}"
          ]
        ],
        {
          title: "an upgrade starts at version 2",
          input: 'to upgrade (a person) to version 1: set its name to "x"',
          js: "/* PARSE ERROR: An upgrade starts at version 2:  a file with no version is version 1 */"
        }
      ]
    }
  ]
})
