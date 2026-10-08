import { P } from "$/parser"
// Import directly to avoid circular import
import { Scope } from "./Scope"

/**
 * `SubjectScope` -- a block of statements all about ONE type, its SUBJECT, e.g. the bulleted body of an
 * outline-style type, `a card is a thing where:` -- so a line can say `it has a deck` for `a card has a deck`.
 * - Owns nothing:  like `Scope`, every collection forwards to `parentScope`, so what its lines declare lands
 *   where the same lines would without the body, e.g. the file's variables, the project's types.
 * - `subject` is the type's NAME, e.g. `Card`:  `subjectType` looks it up, while parsing.
 * - A `MethodScope` inside one, e.g. a getter's body, is NOT about the subject:  there `it` is the instance --
 *   see `SubjectScope.of()`.
 * - Knows nothing of any language's rules:  a language's own `it` rule asks `SubjectScope.of(scope)`.
 */
export class SubjectScope extends Scope {
  /** Name of the type our statements are about, e.g. `Card`. */
  declare subject: string
  /** Statement match which made this scope, e.g. the type's declaration. */
  declare declaredBy: P.Match | undefined

  constructor(props: SubjectScopeProps) {
    super(props)
  }

  /** `TypeScope` our statements are about, as seen from here -- `undefined` if scope doesn't know it. */
  get subjectType(): P.TypeScope | undefined {
    return this.types?.get(this.subject)
  }

  /**
   * The `SubjectScope` whose statements `scope` holds, if any -- `undefined` once a `MethodScope` is in between,
   * e.g. in a getter's body, where `it` is the instance, not the type.
   */
  static of(scope: P.Scope | undefined): SubjectScope | undefined {
    for (let current = scope; current; current = current.parentScope) {
      if (current instanceof SubjectScope) return current
      if (current instanceof P.MethodScope) return undefined
    }
    return undefined
  }
}

/** Constructor props for `SubjectScope`. */
export type SubjectScopeProps = P.ScopeProps & {
  /** Name of the type the scope's statements are about, e.g. `Card`. */
  subject: string
  /** Statement match which made the scope. */
  declaredBy?: P.Match
}
