import { getDerived, typeCase } from "$/util"
import { P } from "$/parser"
// Import directly, NOT through the `$/core` barrel:  the parser MUST NOT load `spellCore` itself -- each
// runner runs its own copy.  See `spellRuntime.ts`.
import { SPELL_BASE_TYPES } from "$/core/spellCore.types"
import { SP } from "$/spell"

// Registers `RulexParser` on `P.Parser.rulexParser` -- MUST load before any rule with a `syntax:` string.
import "$/parser/rulex"

/**
 * `P.Parser` subclass for the spell language.
 * - Holds spell's `tokenizer` (double-quote strings only, `LEADING_ONLY` whitespace so indentation stays
 *   significant) plus a `tokenize()` override that re-groups tokens into indented blocks for the `"block"`
 *   rule.
 * - `SpellParser.rootScope` is the single shared root every project/file scope descends from -- it carries
 *   spell's base types; see `getScope()` / `SpellFile.getScope()` / `SpellProject.getScope()` for how
 *   project-specific parsers `clone()` off of it.
 * - `SP.spellParser` (see `./rules`) is the actual shared instance used by both the client UI and the
 *   server's `compileFile()` (`src/server/project-utils.ts`) -- keep this class free of browser-only
 *   globals at module-evaluation time.
 */
export class SpellParser extends P.Parser {
  /**
   * Re-defines `defaultRule` as `"block"` directly on `SpellParser.prototype`.
   * - TODO: looks redundant -- `P.Parser`'s own static block already sets the same value on
   *   `Parser.prototype`, which `SpellParser` would inherit anyway.
   */
  static {
    Object.defineProperty(this.prototype, "defaultRule", { value: "block", writable: true })
  }

  /**
   * Tokenizer for spell source: double-quote strings only, keeping newlines/indents (`LEADING_ONLY`
   * whitespace policy) since block structure is significant.
   */
  get tokenizer() {
    return this.derived(
      "tokenizer",
      () =>
        new P.Tokenizer({
          // Only support double-quotes as quote symbols (so we can do contractions with single quotes)
          // TODO: backtick as alternative quote, for embedding double quotes?
          quoteSymbols: [`"`],
          // Remove "normal" whitespace (leaving newlines and indents) when parsing
          whitespacePolicy: P.WhitespacePolicy.LEADING_ONLY
        })
    )
  }

  /**
   * Register a rule class with ONLY its `syntax` + `tests` -- everything else lives on the class as `@proto static`.
   * - Why:  the class is the rule, reusable by another language's parser with its own `syntax`.
   * - TYPE-ONLY narrowing of `P.Parser.addRule()`, same behaviour.
   */
  addRule<RuleType extends P.Rule>(rule: Class<RuleType>, definition?: P.SyntaxAndTests): P.Rule | undefined
  addRule(rule: P.Rule | P.RuleConstructor, ruleName?: string | string[]): P.Rule | undefined
  addRule(
    rule: P.Rule | P.RuleConstructor,
    namesOrDefinition?: string | string[] | P.RuleDefinitionProps
  ): P.Rule | undefined {
    const definition =
      typeof namesOrDefinition === "object" && !Array.isArray(namesOrDefinition) ? namesOrDefinition : undefined
    // NOTE: duck-typed, not `instanceof SP.SpellStatement`:  rule modules register while the `SP` barrel loads
    if (typeof rule === "function" && definition && (rule.prototype as OperandTwinned).operandInExpressions) {
      const statement = this.addStatementAndOperand(rule as unknown as typeof P.Rule, definition)
      if (statement) return statement
    }
    // Overloads hide `super`'s implementation signature -- it takes either shape, so any overload will do.
    return super.addRule(rule as Class<P.Rule>, namesOrDefinition as P.DefinitionFor<P.Rule>)
  }

  /**
   * Register statement class `ruleClass`, which says `operandInExpressions` and is aliased both `statement` and
   * `expression`, as TWO rules -- see `SP.SpellStatement.operandInExpressions`:
   * - the statement:  its `definition` as is, e.g. `notify {callArgs:expression}`
   * - the expression (so an `operand`):  a twin whose LAST slot is an operand, `notify {callArgs:operand}`, its
   *   `statementRule` pointing back at the statement
   * - Returns the statement, which is what `scope.addRule()` records -- so a project's declarations write ONE
   *   rule, and loading it here makes both again.  `undefined` (nothing registered) if `ruleClass` isn't all that,
   *   or its syntax doesn't end in an `{expression}` slot.
   */
  private addStatementAndOperand(ruleClass: typeof P.Rule, definition: P.RuleDefinitionProps): P.Rule | undefined {
    const syntax = definition.syntax ?? (ruleClass.prototype as { syntax?: string }).syntax
    const operandSyntax =
      typeof syntax === "string"
        ? syntax.replace(SpellParser.LAST_EXPRESSION_SLOT, (_slot, name = "expression", optional) => {
            return `{${name}:operand}${optional}`
          })
        : undefined
    if (!operandSyntax || operandSyntax === syntax) return undefined
    // as `P.Parser.addRule()` instantiates a class
    const registered: P.RuleDefinitionProps = this.module ? { ...definition, module: this.module } : { ...definition }
    const statement = ruleClass.instantiate(registered)
    const names = statement?.names ?? []
    if (!statement || !names.includes("statement") || !names.includes("expression")) return undefined
    const operand = ruleClass.instantiate({
      ...registered,
      syntax: operandSyntax,
      tests: undefined,
      statementRule: statement
    } as P.RuleDefinitionProps)!
    const statementNames = names.filter((name) => name !== "expression")
    super.addRule(statement, statement.tests ? [...statementNames, "_testable_"] : statementNames)
    super.addRule(operand, ["expression"])
    return statement
  }

  /** A syntax's LAST slot, if it's an `{expression}` -- its group name and any `?` captured.  See `addStatementAndOperand()`. */
  static LAST_EXPRESSION_SLOT = /\{(?:(\w+):)?expression\}(\??)\s*$/

  /** Without the `/*! SPELL: DECLARES` comments -- a rule's tests are about its code.  See `SpellDeclarations`. */
  normalizeTestOutput(compiled: unknown): unknown {
    return typeof compiled === "string" ? SP.SpellDeclarations.stripComments(compiled) : compiled
  }

  /** Names a `{subrule}` parses an expression by -- see `getNamesForRule()`. */
  static EXPRESSION_RULES = ["expression", "operand"]

  /**
   * Every rule aliased `expression` is registered as an `operand` instead -- except `expression` itself,
   *   `compound_expression`, which is an operand plus any operators after it.
   * - So `{expression}` is a whole expression, operators and all;  `{operand}` is what an operator acts on:  one
   *   expression with no operator at its top, e.g. `5`, `the first card of the deck`, `(x + 1)`.
   * - Throws for an operand which STARTS with an expression:  it would recurse forever.  Something after
   *   an expression is an `expression_suffix` instead, e.g. `list_membership_test`.
   */
  protected getNamesForRule(rule: P.Rule, names: string[]): string[] {
    const isOperand = rule.name !== "expression" && names.includes("expression")
    const result = isOperand ? names.map((name) => (name === "expression" ? "operand" : name)) : names
    const first = rule instanceof P.Sequence ? rule.rules[0] : undefined
    if (isOperand && first instanceof P.Subrule && SpellParser.EXPRESSION_RULES.includes(first.rule)) {
      throw new P.ParserError({
        message: `Rule '${rule.name}' starts with an expression, so it would recurse forever.  Make it an expression_suffix.`,
        context: this,
        activity: "getNamesForRule",
        params: { rule, names }
      })
    }
    return result
  }

  /**
   * `rootScope` for all spellParsers -- contains base rules, types, constants.
   * - All project scopes point back to this.
   * - Its types:  spell's runtime classes (`SPELL_BASE_TYPES`:  `Object`, `Thing`, `List`, `App`), then every other
   *   built-in type's NAME (`P.BUILT_IN_TYPES`:  `text`, `number` ...), each with its super-type -- so `is a number`
   *   names a known type, and `integer` is a `number`.
   * - Their members -- `the length of the name` -- from `SP.BUILT_IN_TYPE_TABLE`, see `loadBuiltInTypes()`.
   */
  /*@memoize*/
  static get rootScope(): P.RootScope {
    return getDerived(this, "rootScope", (): P.RootScope => {
      const scope = new P.RootScope({ name: "spellRoot", parser: SP.spellParser })
      // spell's built-in types -- `spellCore.BASE_TYPES`
      SPELL_BASE_TYPES.forEach((type) => scope.types.add(type))
      for (const [name, superType] of Object.entries(P.BUILT_IN_TYPES)) {
        const existing = scope.types.get(name, "LOCAL_ONLY")
        if (!existing) scope.types.add({ name, superType })
        else if (superType) existing.superType = typeCase(superType)
      }
      // their members, docs and item types -- see `BUILT_IN_TYPE_TABLE`
      SP.loadBuiltInTypes(scope)
      return scope
    })
  }

  /**
   * Return a `P.ProjectScope` with a new parser that `clone()`s this one under `moduleName`.
   * - Lets us tweak rules/etc for that scope without touching the original (e.g. shared `rootScope`).
   */
  getScope(moduleName = "ad_hoc"): P.ProjectScope {
    const parser = this.clone({ module: moduleName })
    return new P.ProjectScope({
      name: moduleName,
      parser,
      parentScope: SpellParser.rootScope
    })
  }

  /**
   * Tokenize `input`, then re-group into indented blocks when `ruleName` is `"block"` -- spell's
   * significant-whitespace block structure isn't just a flat token stream.
   */
  tokenize(input: string, ruleName: string) {
    const tokens = super.tokenize(input)
    if (!tokens) return undefined
    if (typeof input === "string" && ruleName === "block") return this.tokenizer.breakIntoIndentedBlocks(tokens)
    return tokens
  }

  /**
   * Types `text` declares, by a scan of its lines -- `a card is a thing`, `a deck is a list of cards`,
   * `create a type called hand as a list of cards` -- so a line ABOVE one knows the type.  See `P.Parser.stubDeclaredTypes()`.
   * - Only a line STARTING that way, as `create_type` / `create_list_type` would read it:  a comment never does.
   * - `a card is` is enough:  a declaration being typed, e.g. `a card is a`, still declares `card`, so the editor
   *   keeps its last good version rather than re-parsing everything -- see `P.IncrementalProject.update()`.
   */
  typesDeclaredIn(text: string): string[] {
    return [...text.matchAll(SpellParser.TYPE_DECLARATION)].map(([, type, created]) => (type ?? created)!)
  }

  /** A line declaring a type, its name captured -- see `typesDeclaredIn()`. */
  static TYPE_DECLARATION =
    /^[ \t]*(?:an?[ \t]+([\w-]+)[ \t]+is\b|create[ \t]+a[ \t]+type[ \t]+(?:named|called)[ \t]+([\w-]+))/gim

  /** Commit a spell statement parsed on its own -- see `SP.commitStatement()`. */
  commit(match: P.Match) {
    SP.commitStatement(match)
  }

  /** Parse one item of a block:  a nested block, or a line plus any indented body it takes. */
  parseItem(scope: P.Scope, items: P.Token[]): P.Match | undefined {
    const [first] = items
    if (first instanceof P.BlockToken) return this.getRuleOrDie("block").parse(scope, [first])
    if (first instanceof P.LineToken) return this.parse(items, "line", scope)
    return undefined
  }

  /** A top-level item is broken if it didn't parse, or has parse errors -- its own or its body's. */
  isBrokenItem(item: P.Match | undefined): boolean {
    return !item || !!SP.Block.getParseErrors(item)?.length
  }

  /** Journal mark just before a `line`'s nested body was parsed -- see `commitStatement()`. */
  getBodyMark(item: P.Match): P.JournalMark | undefined {
    return item.is(SP.BlockLine) ? item.data.bodyMark : undefined
  }

  /** Re-parse a top-level `line`'s nested body -- see `BlockLine.reparseBody()`. */
  reparseBody(item: P.Match, body: P.BlockToken): P.Match | undefined {
    return item.is(SP.BlockLine) ? item.rule.reparseBody(item, body) : undefined
  }

  /** File match from its top-level item matches, as `Block.parse()` builds it -- see `Block.assembleBlock()`. */
  assembleFile(scope: P.Scope, root: P.BlockToken, items: P.Match[]): P.Match | undefined {
    const rule = this.getRuleOrDie("block")
    return rule instanceof SP.Block ? rule.assembleBlock(scope, root, items) : undefined
  }

  /**
   * Build a `P.Match` for the `parse_error` rule, so a failed parse still produces a `Match` in the tree
   * (rather than `undefined`) -- callers can inspect/report on it, e.g. `SpellFile.parse()`'s `errors` walk.
   */
  createParseError(scope: P.Scope, tokens: P.Token[], message: string) {
    const rule = this.getRuleOrDie("parse_error")
    return new P.Match({
      scope,
      rule,
      matched: tokens,
      tokens: [...tokens],
      message
    })
  }

  /**
   * `Parser.compile()` returns `unknown` (e.g. `rulex` compiles to `Rule` objects), but spell always
   * compiles down to a javascript source string -- narrow that here so `SpellFile`/`SpellProject` compile
   * paths can rely on `string`.
   * - Throws `P.ParserError` if `super.compile()` doesn't return a string.
   */
  compile(input: string | P.Token | P.Token[], ruleName?: string, scope?: P.Scope): string {
    const result = super.compile(input, ruleName, scope)
    if (typeof result !== "string") {
      throw new P.ParserError({
        message: "compile() did not return a string",
        context: this,
        activity: "compile",
        params: { input, ruleName, scope, result }
      })
    }
    return result
  }
}

/** A rule class's prototype, as `SpellParser.addRule()` reads it -- see `SP.SpellStatement.operandInExpressions`. */
type OperandTwinned = { operandInExpressions?: boolean }
