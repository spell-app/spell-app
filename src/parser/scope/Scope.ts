import { Derivative } from "~/util"
import { P } from "~/parser"

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
  get methods(): P.ScopeList<P.MethodScope, P.MethodScope | P.MethodScopeProps> | undefined {
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
   * - `definition` is type-checked against `rule`'s own props, exactly as `parser.addRule()` is.
   * - `declaredBy` is the match declaring it (the method definition, say), kept for go-to-definition etc.
   * - Returns what `parser.addRule()` returned:  the rule instance(s), or `undefined` if `definition.skip`.
   */
  addRule<RuleType extends P.Rule>(
    rule: Class<RuleType>,
    definition?: P.DefinitionFor<RuleType>,
    declaredBy?: P.Match
  ): P.Rule | P.Rule[] | undefined {
    const { parser } = this
    if (!parser) throw new TypeError(`scope.addRule(): called on scope without a parser.`)
    const added = parser.addRule(rule, definition)
    // NOTE: `definition` may be undefined -- store an empty object so an export can always spread it.
    if (!added) return undefined
    const instances = Array.isArray(added) ? added : [added]
    this.rules?.add({ name: instances[0]!.name!, rule, definition: definition ?? {}, declaredBy, instances })
    return added
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
