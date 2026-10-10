import { P } from "$/parser"
// Import directly:  the barrel's `camelCaseOf` would be read as the module loads
import { camelCaseOf } from "./WriterProject"

/****************
 * ### `Naming`
 * How an output language writes spell's names:  a case for each KIND of name (epic `drawable-thing` P11).
 *
 * ```ts
 * new Naming({ type: "PascalCase", method: "camelCase", variable: "camelCase" })   // javascript
 * new Naming({ all: "snake_case" })                                              // Python, later
 * ```
 *
 * - The kinds:  `type`, `method` (methods, getters, functions), `variable`, `property` (a stored property), `constant`.
 *   `all` is the case of any kind not named.  A kind with neither is written as spell names it.
 * - spell's own names are the input:  a type in PascalCase (`BankAccount`), anything else in snake_case
 *   (`turn_face_up`, `is_set_up`).
 * - A built-in class keeps its runtime's name, e.g. `Thing`, `DrawableList`:  the runtime's code names it, not ours.
 * - Each writer has one (`P.Writer.naming`);  a writer reads names through it, never writes a case itself.
 ****************/
export class Naming {
  /** javascript's (and TypeScript's) map. */
  static readonly JAVASCRIPT: NamingMap = {
    type: "PascalCase",
    method: "camelCase",
    variable: "camelCase",
    property: "camelCase",
    constant: "as written"
  }

  /** Its map:  a case per kind. */
  readonly map: NamingMap

  constructor(map: NamingMap = {}) {
    this.map = map
  }

  /** The case `kind`'s names are written in. */
  caseOf(kind: NameKind): NameCase {
    return this.map[kind] ?? this.map.all ?? "as written"
  }

  /**
   * spell's `name` of kind `kind`, as this language writes it, e.g. `turn_face_up` => `turnFaceUp`.
   * - A built-in class's name, e.g. `Thing`, as it is -- see the class docs.
   */
  nameOf(name: string, kind: NameKind): string {
    if (kind === "type" && P.BUILT_IN_CLASSES.some((datatype) => P.BUILT_IN_CLASS_NAMES[datatype] === name)) return name
    const nameCase = this.caseOf(kind)
    if (nameCase === "as written") return name
    // spell's own way to camelCase, so javascript's output is what it always was
    if (nameCase === "camelCase") return camelCaseOf(name)
    const words = Naming.wordsOf(name)
    if (nameCase === "PascalCase") return words.map(upperFirst).join("")
    if (nameCase === "snake_case") return words.map((word) => word.toLowerCase()).join("_")
    /* if (nameCase === "SCREAMING_SNAKE_CASE") */ return words.map((word) => word.toUpperCase()).join("_")
  }

  /** The words of spell's `name`:  split at `_`, `$` and a capital, e.g. `BankAccount` => `Bank`, `Account`. */
  static wordsOf(name: string): string[] {
    return name
      .split(/[_$]+/)
      .flatMap((part) => part.split(/(?<=[a-z0-9])(?=[A-Z])/))
      .filter(Boolean)
  }
}

/** A word with its first letter upper case. */
function upperFirst(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

/** The kinds of name a language may write in a case of its own -- see `Naming`. */
export type NameKind = "type" | "method" | "variable" | "property" | "constant"

/** The cases a name may be written in -- see `Naming`. */
export type NameCase = "PascalCase" | "camelCase" | "snake_case" | "SCREAMING_SNAKE_CASE" | "as written"

/** A language's case for each kind of name, `all` for any not named -- see `Naming`. */
export type NamingMap = Partial<Record<NameKind | "all", NameCase>>
