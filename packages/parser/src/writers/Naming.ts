import { P } from "$/parser"
// Import directly:  the barrel's `camelCaseOf` would be read as the module loads
import { camelCaseOf } from "./WriterProject"

/****************
 * ### `Naming`
 * How an output language writes spell's names:  a case for each KIND of name (epic `drawable-thing` P11).
 *
 * ```ts
 * new Naming(Naming.JAVASCRIPT)                          // type PascalCase, members camelCase
 * new Naming(Naming.PYTHON, Naming.PYTHON_CLASHES)       // PEP 8:  snake_case, RANKS, `class_` for a keyword
 * ```
 *
 * - The kinds:
 *   - `type`
 *   - `method`:  methods, getters, functions
 *   - `variable`
 *   - `property`:  a stored property
 *   - `constant`
 *   - `all`:  the case of any kind not named
 *   - A kind with neither is written as spell names it.
 * - spell's own names are the input:
 *   a type in PascalCase (`BankAccount`), anything else in snake_case (`turn_face_up`, `is_set_up`).
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

  /**
   * javascript's names a spell name mustn't be:
   * the core's position helpers (`position`, `spellPosition` ...;  epic `python-target` P23).
   * - Compiled code imports them by name, so a variable of that name would hide them.
   * - Only a variable steps aside, as Python's builtins do:  `position_`.
   */
  static readonly JAVASCRIPT_CLASHES: NameClashes = {
    keywords: new Set(),
    builtins: new Set(["position", "spellPosition", "endPosition", "withSpellPositions"])
  }

  /**
   * Python's map, PEP 8's (epic `python-target` P7):
   * - classes `PascalCase`
   * - constants `SCREAMING_SNAKE_CASE` (`Card.RANKS`)
   * - everything else `snake_case` (`turn_face_up`, `is_set_up`)
   */
  static readonly PYTHON: NamingMap = {
    type: "PascalCase",
    constant: "SCREAMING_SNAKE_CASE",
    all: "snake_case"
  }

  /**
   * Python's names a spell name mustn't be, and how it steps aside:
   * PEP 8's single trailing underscore, "used by convention to avoid conflicts with Python keyword", e.g. `class_`.
   * - `keywords`:  never a name, of any kind (`class`, `is`, `None`).
   *   Not the soft ones (`match`, `case`, `type`):
   *   they're names everywhere but at the start of their own statements.
   * - `builtins`:  only a variable or parameter would hide them (`list`, `max`, `id`).
   *   - A member, `card.type`, hides nothing.
   *   - And `self` / `cls`, which a method's first parameter already is.
   * - Never a dunder (`__len__`):  PEP 8's "never invent such names".
   *   `wordsOf()` drops every `_` it splits at, so a spell name can't become one.
   * - SEE:  https://peps.python.org/pep-0008/
   */
  static readonly PYTHON_CLASHES: NameClashes = {
    keywords: new Set(
      (
        "False None True and as assert async await break class continue def del elif else except finally for " +
        "from global if import in is lambda nonlocal not or pass raise return try while with yield"
      ).split(" ")
    ),
    builtins: new Set(
      (
        "abs all any bool bytes callable chr dict dir divmod enumerate filter float format frozenset getattr " +
        "hasattr hash help hex id input int isinstance issubclass iter len list map max min next object oct open " +
        "ord pow print range repr reversed round set slice sorted str sum super tuple type vars zip self cls " +
        // and `spell_core`'s position helpers, which compiled code imports by name (epic `python-target` P23)
        "position spell_position end_position with_spell_positions"
      ).split(" ")
    )
  }

  /** Its map:  a case per kind. */
  readonly map: NamingMap

  /** The language's own words a name must step aside from, if any -- see `PYTHON_CLASHES`. */
  readonly clashes: NameClashes | undefined

  constructor(map: NamingMap = {}, clashes?: NameClashes) {
    this.map = map
    this.clashes = clashes
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
    const written = this.casedName(name, kind)
    return this.clashesWith(written, kind) ? `${written}_` : written
  }

  /**
   * Does `written`, a name of kind `kind`, clash with one of the language's own words -- see `clashes`?
   * - A keyword, as any kind;  a builtin, as a variable only.
   */
  clashesWith(written: string, kind: NameKind): boolean {
    if (!this.clashes) return false
    return this.clashes.keywords.has(written) || (kind === "variable" && this.clashes.builtins.has(written))
  }

  /** spell's `name` in `kind`'s case, before any clash -- see `nameOf()`. */
  private casedName(name: string, kind: NameKind): string {
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

/**
 * A language's own words a spell name steps aside from, with a trailing `_` -- see `Naming.PYTHON_CLASHES`.
 * - `keywords`:  as any kind of name;  `builtins`:  as a variable only.
 */
export type NameClashes = { keywords: Set<string>; builtins: Set<string> }
