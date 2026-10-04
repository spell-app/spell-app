import { Derivative } from "$/util"
import type { P } from "$/parser"
// Import directly to avoid circular import:  a VALUE import of `P` here would make `$/parser/scope/Scope` an
// entry which breaks the barrel -- see `barrel.test.ts`
import { itemTypeOf } from "$/parser/parser.types"

/**
 * We create a `Scope` when starting a parse run, so parser can keep state as it descends up and down.
 * - Scopes can be nested.
 * - Base scope is basically just a wrapper around `parser`.
 */
export class Scope extends Derivative {
  /** Pointer to our parent scope, if any, set on construction. */
  declare parentScope: Scope | undefined
  /** Pointer to our parser, if any, set on construction. */
  declare _parser: P.Parser | undefined
  /** Name for this scope. */
  declare name: string
  /** Path for this scope, e.g. file path where it was defined. */
  // TODO: how is this used?
  declare path: string

  constructor({ parser, ...props }: ScopeProps) {
    super()
    Object.assign(this, props)
    if (parser) this._parser = parser
  }

  /**
   * NOTE: `.methods`, `.variables`, `.types`, `.constants` and `.rules` all forward to `parentScope` by
   * default.  Subclasses may choose to implement these directly, generally as `ScopeList`s (see
   * `BlockScope`, `RootScope`).
   */
  /** Forwards to `parentScope.methods`. */
  get methods(): P.ScopeList<P.ScopeMethod, P.ScopeMethod | P.ScopeMethodProps> | undefined {
    return this.parentScope?.methods
  }
  /** Forwards to `parentScope.variables`. */
  get variables(): P.ScopeList<P.ScopeVariable, string | P.ScopeVariable | P.ScopeVariableProps> | undefined {
    return this.parentScope?.variables
  }
  /** Forwards to `parentScope.types`. */
  get types(): P.ScopeList<P.TypeScope, string | P.TypeScope | P.TypeScopeProps> | undefined {
    return this.parentScope?.types
  }
  /** Forwards to `parentScope.constants`. */
  get constants(): P.ScopeList<P.ScopeConstant, string | P.ScopeConstant | P.ScopeConstantProps> | undefined {
    return this.parentScope?.constants
  }
  /** Forwards to `parentScope.rules`. */
  get rules(): P.ScopeList<P.ScopeRule> | undefined {
    return this.parentScope?.rules
  }

  /**
   * Register `rule` on our `parser` and record the pair in `this.rules`, so the scope knows what it created.
   * - Use this for rules built WHILE PARSING, e.g. the call-site rule for a method the file just defined.
   * - `definition` is ONLY `syntax` + `tests` -- everything else goes on `rule`, computed values included,
   *   via `P.Rule.specialize()`, e.g. `DynamicMethodRule.specialize({ ruleName: methodName, ... })`.
   *   See "Ways to make a rule" 3. in `Rule.ts`.
   * - `declaredBy` is the match declaring it (the method definition, say), kept for go-to-definition etc.
   * - `declared` instead, for a rule IMPORTED from another project's compiled declarations -- see
   *   `P.ScopeRule.declared`.
   * - Returns what `parser.addRule()` returned:  the rule instance, or `undefined` if `rule` has `static skip`.
   */
  addRule(
    rule: Class<P.Rule>,
    definition?: P.SyntaxAndTests,
    declaredBy?: P.Match,
    declared?: P.ImportedRuleDeclared
  ): P.Rule | undefined {
    const { parser } = this
    if (!parser) throw new TypeError(`scope.addRule(): called on scope without a parser.`)
    const instance = parser.addRule(rule, definition)
    if (!instance) return undefined
    // NOTE: `definition` may be undefined -- store an empty object so an export can always spread it.
    this.rules?.add({ name: instance.name!, rule, definition: definition ?? {}, declaredBy, declared, instance })
    return instance
  }

  ////////////////
  // ## Types
  ////////////////

  /**
   * `TypeScope` for `datatype`, as seen from here -- `undefined` if unknown, or `datatype` is.
   * - Any spelling `P.typeName()` takes, e.g. `Card`, `cards`, `text`;  a `list of cards` is a `list`.
   * - A lookup:  call it WHILE PARSING, never from `getAST()` / `getDatatype()`.
   */
  getType(datatype: P.Datatype | undefined): P.TypeScope | undefined {
    if (!datatype) return undefined
    const name = itemTypeOf(datatype) ? "list" : datatype
    return this.types?.get(name)
  }

  /**
   * What a list of `datatype` holds, e.g. `Card` for `list of cards`, or for `Deck` (`a deck is a list of cards`)
   * -- the first `itemType` up its type's super-type chain.  `undefined` if we can't tell.
   * - A lookup:  call it WHILE PARSING, never from `getAST()` / `getDatatype()`.
   */
  getItemType(datatype: P.Datatype | undefined): P.Datatype | undefined {
    const fromWords = itemTypeOf(datatype)
    if (fromWords) return fromWords
    return this.getType(datatype)
      ?.chain()
      .find((type) => type.itemType)?.itemType
  }

  ////////////////
  // ## Parsing
  ////////////////

  /** Default to our parent `scope`'s `parser` if one was not explicitly set up. */
  get parser(): P.Parser | undefined {
    return this._parser || this.parentScope?.parser
  }

  set parser(parser: P.Parser | undefined) {
    this._parser = parser
  }

  /** Return named rule from our `parser`, throwing if there is no parser or no such rule. */
  getRuleOrDie(ruleName: string): P.Rule {
    const { parser } = this
    if (!parser) throw new TypeError(`Scope '${this.name}' has no parser, can't get rule '${ruleName}'`)
    return parser.getRuleOrDie(ruleName)
  }

  /** Parse `text` using `parser` for this scope. */
  parse(text: string, ruleName?: string, scope = this) {
    return this.parser?.parse(text, ruleName, scope)
  }

  /** Compile `text` using `parser` for this scope. */
  compile(text: string, ruleName?: string, scope = this) {
    return this.parser?.compile(text, ruleName, scope)
  }
}

/** Constructor props for `Scope` (and subclasses, via `...props` spread). */
export type ScopeProps = {
  /** Name for this scope. */
  name?: string
  /** Path for this scope, e.g. file path where it was defined. */
  path?: string
  /** Parser this scope belongs to.  Defaults to `parentScope.parser` if not set here. */
  parser?: P.Parser
  /** Parent scope, if any. */
  parentScope?: Scope
}

/** Constructor signature for any `Scope` subclass, e.g. for `Match.getScopeOfType()`. */
export type ScopeConstructor = new (args: any) => P.Scope
