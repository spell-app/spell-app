import { Derivative, IndexedList } from "~/util"
import { Parser, Rule } from "~/parser"
import type { RuleDefinition } from "~/parser/Parser"
import type {
  TypeScope,
  TypeScopeProps,
  ScopeConstant,
  ScopeConstantProps,
  MethodScope,
  MethodScopeProps,
  ScopeVariable,
  ScopeVariableProps
} from "."

export type ScopeConstructor = new (args: any) => Scope

export type ScopeProps = {
  name?: string
  path?: string
  parser?: Parser
  parentScope?: Scope
}

/**
 * We create a `Scope` when starting a parse run to allow the parser
 * to keep state as it descends up and down.
 *
 * Scopes can be nested.
 *
 * The base scope is basically just a wrapper to the `parser`.
 */
export class Scope extends Derivative {
  /** Pointer to our parent scope, if any, set on construction. */
  declare parentScope: Scope | undefined
  /** Pointer to our parser, if any, set on construction. */
  declare _parser: Parser | undefined
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
   * Pointer to our parent scope, if any, set on construction.
   *
   * Note: We forward `.methods`, `.variables.`, `.types`, `.constants` and `.rules` to our parent scope.
   *       Subclasses may choose to implement these directly, generally as `IndexedList`s.
   */
  get methods(): IndexedList<MethodScope, MethodScope | MethodScopeProps> | undefined {
    return this.parentScope?.methods
  }
  get variables(): IndexedList<ScopeVariable, string | ScopeVariable | ScopeVariableProps> | undefined {
    return this.parentScope?.variables
  }
  get types(): IndexedList<TypeScope, string | TypeScope | TypeScopeProps> | undefined {
    return this.parentScope?.types
  }
  get constants(): IndexedList<ScopeConstant, string | ScopeConstant | ScopeConstantProps> | undefined {
    return this.parentScope?.constants
  }
  get rules(): IndexedList<RuleDefinition> | undefined {
    return this.parentScope?.rules
  }

  //----------------------------
  // Parsing

  // Default to our parent `scope`'s `parser` if one was not explicitly set up.
  get parser(): Parser | undefined {
    return this._parser || this.parentScope?.parser
  }

  set parser(parser: Parser | undefined) {
    this._parser = parser
  }

  /** Return named rule from our `parser`, throwing if there is no parser or no such rule. */
  getRuleOrDie(ruleName: string): Rule {
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
