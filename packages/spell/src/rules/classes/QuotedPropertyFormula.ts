import { pluralize, proto, singularize, upperFirst } from "$/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
import { getKnownType } from "$/spell/rules/types"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { classes } from "./classes.parser"
import { placeholderData, type QuotedPropertyFormulaBits } from "./classes.shared"
import { QuotedPropertyRule } from "./QuotedPropertyRule"

/**
 * `quoted_property_formula` rule:  `a card "is a (rank) of (suits)" for its ranks and its suits`.
 * - Defines a templated boolean method from a quoted phrase with `(placeholder)`s,
 *   plus a matching quoted-expression rule to call it, e.g. `a card is the queen of spades`.
 * - NOTE: the first word in quotes must be `"is"` !!
 * - `Priority.declaration`, so this wins over plainer statement rules that could otherwise partially match.
 * - SIDE EFFECT: `getBits()` derives (and caches in `match.data.bits`) what `mutateScope()` / `getAST()` use below:
 *   rulex `syntax`, per-placeholder `ruleData`, `vars` and the generated `property` name.
 * - SIDE EFFECT: `mutateScope()` registers a `QuotedPropertyRule` for the quoted phrase,
 *   e.g. `is (not)? a queen`, so it can be used like `card is a club`.
 * - Compiles to an instance method testing each placeholder against its property:
 *   e.g. `a card "is the (rank) of (suits)" for its ranks and its suits`
 *   => an `isTheRankOfSuits(rank, suit)` method returning `this.rank === rank && this.suit === suit`.
 */
export class QuotedPropertyFormula extends SpellStatement<"type|alias|sources?", QuotedPropertyFormulaMatchData> {
  @proto static priority = Priority.declaration
  @proto static alias = "statement"
  @proto static declares: P.DeclaresSpec = { kind: "method", name: "alias", of: "type" }

  /**
   * Reject the match unless `alias`'s first quoted word is `"is"`:  see rule NOTE above.
   * - No `for its ...` (an outline body's `it "is a (suit)"`, plan doc `outline-spell` P3, J9):
   *   INFER what each blank reads (see `inferPlaceholders()`).
   * - Only when the line is the phrase and nothing more, and then (J9, option A):
   *   - no blank at all, e.g. `it "is a suit"`:  an error, not an empty method (the parens are required)
   *   - a blank naming no property with a list of values, e.g. `it "is a (color)"`:  an error naming it
   *   - a blank of several words, e.g. `it "is near (another as a card)"`:  not ours, a `quoted_type_expression`
   */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    // If first word of `alias` is not `is`, forget it
    const phrase = `${match.groups.alias.value}`.replace(/^["']|["']$/g, "")
    const alias = phrase.split(" ")
    if (alias[0] !== "is") return undefined
    if (match.groups.sources) return QuotedPropertyFormula.resolveSources(match)
    // more after the phrase, e.g. `it "is face up" if ...`:  not ours, a `quoted_type_expression`
    if (tokens.slice(match.length).join("").trim()) return undefined
    const typeWords = SpellStatement.subjectWords(match) ?? "thing"
    if (!phrase.includes("(")) {
      return SpellStatement.refuse(
        match,
        `"${phrase}" has no blank:  put the word that varies in parens, e.g. "is a (suit)", ` +
          `or say when it's true, "${phrase}" if ...`
      )
    }
    const inferred = QuotedPropertyFormula.inferPlaceholders(alias, getKnownType(match.groups.type))
    if (!inferred) return undefined
    if ("unlisted" in inferred) {
      return SpellStatement.refuse(
        match,
        `"(${inferred.unlisted})" names no property of a ${typeWords} with a list of values, ` +
          `e.g. its "suit" is one of clubs, diamonds, hearts or spades`
      )
    }
    match.data.inferred = inferred
    return match
  }

  /**
   * `match`, its `for its ...` properties found while parsing (into `data.sources`);
   * or a parse error naming the first with no list of values.
   * - As written, else by its singular:
   *   `for its suits` is a value kind's `suit` (plan doc I5), or the sentence style's own `suits` list.
   */
  private static resolveSources(match: P.MatchFor<QuotedPropertyFormula>): P.Match {
    const type = getKnownType(match.groups.type)
    const sources: string[] = []
    for (const source of match.groups.sources!.items) {
      const name = `${(source.groups.property as P.Match | undefined)?.value}`
      const listed = QuotedPropertyFormula.listedProperty(type, [name, singularize(name)])
      if (!listed) {
        return SpellStatement.refuse(
          match,
          `"its ${name}" isn't a property of a ${match.groups.type.raw} with a list of values, ` +
            `e.g. its "suit" is one of clubs, diamonds, hearts or spades`
        )
      }
      sources.push(listed)
    }
    match.data.sources = sources
    return match
  }

  /**
   * The first of `names` which is a property of `type` with a list of values:
   * its own (`as one of ...`), or a value kind's (`its "suit" is a suit`),
   * maybe declared further down (a stub, so far).
   */
  private static listedProperty(type: P.TypeScope, names: string[]): string | undefined {
    for (const name of names) {
      const variable = type.variables.get(name)
      if (!variable) continue
      // its own list of values is kept as its plural, e.g. `Suits` for `its "suit" is one of ...`
      if (QuotedPropertyFormula.enumerationOf(type, name)) return variable.name
      const kind = type.getType(variable.datatype)
      if (kind?.valueKind || kind?.stub) return variable.name
    }
    return undefined
  }

  /**
   * `it "is a (suit)"` => `a card "is a (suit)" for its suits`:  the sources it inferred, written out.
   * See `SpellStatement.getLongForm()`.
   */
  getLongForm(match: P.MatchFor<this>): string | undefined {
    const typeWords = SpellStatement.subjectWords(match)
    const { inferred } = match.data
    if (!typeWords || !inferred) return super.getLongForm(match)
    const sources = inferred.sources.map((source) => `its ${pluralize(source)}`).join(" and ")
    return `a ${typeWords} "${inferred.words.join(" ")}" for ${sources}`
  }

  /**
   * `alias`'s blanks (its words in parens), and the property each reads:
   * e.g. `is the (rank) of (suits)` on a card => `["rank", "suit"]`, what `for its ranks and its suits` would say.
   * - ONLY a word in parens is a blank;  a bare word is always just a word (plan doc J9, Owen:  "require the parens").
   * - A blank names a property by its singular, e.g. `(suits)` => `suit`, as `for its suits` does.
   * - Only a property with a list of values:  its own (`as one of ...`), or a value kind's (`its "suit" is a suit`).
   * - `{ unlisted }`:  the first blank naming no such property, e.g. `color` for `is a (color)`.
   * - `undefined` if there's no one-word blank.
   *   Then it's a phrase method's argument, e.g. `it "nerds out with (another as a thing)"` (`quoted_type_expression`).
   */
  private static inferPlaceholders(
    alias: string[],
    type: P.TypeScope
  ): InferredPlaceholders | { unlisted: string } | undefined {
    const sources: string[] = []
    for (const word of alias) {
      // only a blank in parens:  a bare word is always just a word (plan doc J9:  "require the parens")
      const blank = /^\((.+)\)$/.exec(word)?.[1]
      if (!blank) continue
      const listed = QuotedPropertyFormula.listedProperty(type, [singularize(blank)])
      if (!listed) return { unlisted: blank }
      sources.push(listed)
    }
    return sources.length ? { words: alias, sources } : undefined
  }

  /**
   * Property `name`'s own list of values on `type`, if it has one:
   * kept on the property, or as its plural class variable's instance twin,
   * e.g. `Suits` for `suit` (`define_property_has`).
   */
  private static enumerationOf(type: P.TypeScope, name: string): Array<string | number> | undefined {
    return type.variables.get(name)?.enumeration ?? type.variables.get(pluralize(upperFirst(name)))?.enumeration
  }

  /** Compute (and cache in `match.data.bits`) `bits` for making rules and AST nodes -- see the type. */
  getBits(match: P.MatchFor<this>): QuotedPropertyFormulaBits {
    return (match.data.bits ??= this.computeBits(match))
  }

  /** Actual work for `getBits()` -- see rule SIDE EFFECTs above. */
  private computeBits(match: P.MatchFor<this>): QuotedPropertyFormulaBits {
    const { groups } = match
    const alias = `${groups.alias.value}`
    const type = groups.type.value
    const { inferred } = match.data
    // the source properties' names, written (`for its suits`, found by `resolveSources()`) or inferred
    const sourceNames = inferred?.sources ?? match.data.sources ?? []

    const words: string[] = inferred?.words ?? alias.replace(/^["']|["']$/g, "").split(" ")
    const syntaxParts: string[] = []
    const ruleData: QuotedPropertyFormulaBits["ruleData"] = []
    const vars: string[] = []
    let sourceNum = 0
    const property = words
      .map((word) => {
        // output keywords directly into words/keywords immediately
        if (!word.startsWith("(")) {
          // transform `a` to `(a|an)` for flexbility
          if (word === "a" || word === "an") syntaxParts.push("(a|an)")
          else syntaxParts.push(word)
          return word
        }
        const instanceVar = word.slice(1, -1)
        vars.push(singularize(instanceVar))

        // Try to find the enumeration:  the property's own, or its value kind's
        const propertyName = sourceNames[sourceNum]
        const typeScope = match.scope.types?.get(type)
        const variable = typeScope?.variables.get(propertyName)
        const kindType = variable?.datatype ? typeScope?.getType(variable.datatype) : undefined
        const enumeration =
          (typeScope && QuotedPropertyFormula.enumerationOf(typeScope, `${propertyName}`)) ??
          kindType?.valueKind?.values
        // set up enumeration matcher
        if (variable && enumeration) {
          const placeholder = placeholderData(instanceVar, variable.enumerationValues || enumeration)
          ruleData.push(placeholder)
          syntaxParts.push(`(expression:${placeholder.enumeration.join("|")})`)
        }
        // a value kind declared further down:  checked where the phrase is used -- see `QuotedPropertyRule`
        else if (kindType?.stub) {
          ruleData.push(placeholderData(instanceVar, [], kindType.name))
          syntaxParts.push("(expression:{constant}|{number})")
        } else {
          // FIXME: this routine is (somehow) geting called twice, once when type/variable IS NOT set up (???)
          // and then once later, when it IS set up.  Figure out why!
          // TODO: parse error instead?
          console.warn("couldn't figure out enumeration for ", type, propertyName)
        }
        sourceNum++
        return `$${instanceVar}`
      })
      .join("_")
    // `is` => every form of it, e.g. `isn't`, which negates -- see `Negatable`
    syntaxParts.splice(0, 1, "{operator:is}")
    const syntax = syntaxParts.join(" ")
    return { type, syntax, ruleData, vars, property }
  }

  /** Register the quoted-phrase's generated `expression_suffix` rule -- see rule SIDE EFFECTs above. */
  mutateScope(match: P.MatchFor<this>) {
    const { syntax, property, ruleData, type } = this.getBits(match)

    // Create an expression suffix to match the quoted statement, e.g. `is not? a queen`.
    // See `scope.addRule()` -- registers on the parser and records the pair for export.
    const kinds = ruleData.filter(({ kind }) => kind).map(({ instanceVar, kind }) => [instanceVar, kind!])
    match.scope.addRule(
      QuotedPropertyRule.specialize({
        output: property,
        of: type,
        values: Object.fromEntries(ruleData.map(({ instanceVar, values }) => [instanceVar, values])),
        ...(kinds.length ? { kinds: Object.fromEntries(kinds) } : {})
      }),
      { syntax },
      match
    )
  }

  getAST(match: P.MatchFor<this>): P.ASTStatementGroup {
    const { type } = match.groups
    const { vars, property } = this.getBits(match)
    // Return AST for the instance method
    const args = vars.map((varName) => new P.ASTVariableExpression(match, { name: varName }))
    const properties = vars.map((varName) => new P.ASTPropertyLiteral(match, varName))
    const expressions = args.map(
      (variable, index) =>
        new P.ASTInfixExpression(match, {
          lhs: new P.ASTPropertyExpression(match, {
            object: new P.ASTSelfLiteral(match),
            property: properties[index]
          }),
          operator: "exactly equals",
          rhs: variable
        })
    )
    const statements: Array<P.ASTStatement | P.ASTExpression | P.ASTComment | P.ASTBlankLine> = [
      new P.ASTPropertyDefinition(match, {
        type: P.matchAST<P.ASTTypeExpression>(type),
        property,
        method: new P.ASTMethodDefinition(match, {
          args,
          body: new P.ASTReturnStatement(match, {
            value: P.ASTMultiInfixExpression(match, { expressions, operator: "and" })
          }),
          datatype: "choice"
        })
      })
    ]
    return new P.ASTStatementGroup(match, { statements })
  }
}
classes.addRule(QuotedPropertyFormula, {
  syntax: "(a|an) {type} {alias:text} for [sources:(its {property:member_words}) and]",
  tests: [
    {
      beforeEach(scope: P.Scope) {
        scope.parse(
          [
            "a card is a thing",
            "a card has a rank as one of ace, 2, 3, 4, 5, 6, 7, 8, 9, 10, jack, queen, king",
            "a card has a suit as one of clubs, diamonds, hearts, spades"
          ].join("\n"),
          "block"
        )
      },
      compileAs: "block",
      tests: [
        [
          'a card "is a (rank)" for its ranks',
          ["Card.prototype.isARank = function (rank) {", "  return this.rank === rank", "}"],
          [
            "export interface Card { isARank(rank: any /* spell: type unknown */): boolean }",
            "Card.prototype.isARank = function (this: Card, rank: any /* spell: type unknown */) {",
            "  return this.rank === rank",
            "}"
          ]
        ],
        [
          'a card "is the (rank) of (suits)" for its ranks and its suits',
          [
            "Card.prototype.isTheRankOfSuits = function (rank, suit) {",
            "  return this.rank === rank && this.suit === suit",
            "}"
          ],
          [
            "export interface Card { isTheRankOfSuits(rank: any /* spell: type unknown */, suit: any /* spell: type unknown */): boolean }",
            "Card.prototype.isTheRankOfSuits = function (this: Card, rank: any /* spell: type unknown */, suit: any /* spell: type unknown */) {",
            "  return this.rank === rank && this.suit === suit",
            "}"
          ]
        ]
      ]
    },
    {
      beforeEach(scope: P.Scope) {
        scope.parse(
          [
            "a card is a thing",
            "a card has a rank as one of ace, 2, 3, 4, 5, 6, 7, 8, 9, 10, jack, queen, king",
            "a card has a suit as one of clubs, diamonds, hearts, spades",
            'a card "is a (suit)" for its suits',
            'a card "is the (rank) of (suits)" for its ranks and its suits',
            "card = a new card"
          ].join("\n"),
          "block"
        )
      },
      compileAs: "statement",
      tests: [
        [
          "print card is a club",
          "spellCore.console.log(card.isASuit('clubs'))",
          'spellCore.console.log(card.isASuit("clubs"))'
        ],
        [
          "print card is the 2 of hearts",
          "spellCore.console.log(card.isTheRankOfSuits(2, 'hearts'))",
          'spellCore.console.log(card.isTheRankOfSuits(2, "hearts"))'
        ]
      ]
    }
  ]
})
// in an outline body:  `- it "is a (suit)" for its suits` -- tests in `parserTests/outline.test.ts`
classes.addRule(QuotedPropertyFormula, {
  syntax: "{type:subject_it} {alias:text} for [sources:(its {property:member_words}) and]"
})
// ... and with the placeholders inferred (P3):  `- it "is a suit"`, `- it "is the rank of suits"` -- see `parse()`
classes.addRule(QuotedPropertyFormula, {
  syntax: "{type:subject_it} {alias:text}"
})

/** What `quoted_property_formula` stashes in `match.data`. */
type QuotedPropertyFormulaMatchData = {
  /** Cached result of `getBits()` -- see the type above. */
  bits?: QuotedPropertyFormulaBits
  /** Placeholders worked out while parsing, for a phrase with no `for its ...` -- see `inferPlaceholders()`. */
  inferred?: InferredPlaceholders
  /** The properties `for its ...` names, found while parsing, e.g. `["suit"]` -- see `resolveSources()`. */
  sources?: string[]
}

/** What `QuotedPropertyFormula.inferPlaceholders()` works out. */
type InferredPlaceholders = {
  /** The phrase's words, a placeholder in parens, e.g. `["is", "a", "(suit)"]`. */
  words: string[]
  /** Each placeholder's property, in order, e.g. `["suit"]`. */
  sources: string[]
}
