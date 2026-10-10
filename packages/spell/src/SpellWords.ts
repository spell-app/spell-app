import JSON5 from "json5"

import { P } from "$/parser"
import { SP } from "$/spell"

/**
 * A project's words:  spell's wording of each member of its types, by the name its compiled code uses --
 * `moveToPile` => `move (a card) to (a pile)`.  See `SP.SpellWordsData`.
 * - Why:  compiled code names a member in camelCase, which loses spell's wording, e.g. where a value goes.
 *   The Thing Explorer shows a thing's actions and properties in spell's words again by reading them here.
 * - Lives in `<Project>.en.js`, beside its compiled output -- see `SP.SpellProject.wordsFile`.
 *   - As a Spell UI element keeps its words in its own vocabulary file, e.g. `UIForm.en.ts`.
 *   - Another language is another file of the same shape, e.g. `Solitaire.es.js`:  NOT written yet.
 * - Written from the declarations the compiler already gathers (`of()`), keyed by the names the writer ACTUALLY
 *   writes (`P.JSWriter.nameOf()`):  a reader never works out how a name was camelCased.
 * - The compiled code doesn't import it:  a runner loads it beside the scope pack.
 * - `script()` writes it;  `read()` reads its text back, without running it.
 */
export class SpellWords {
  ////////////////
  // ## Writing
  ////////////////

  /**
   * The words of a project with `declarations`, in English:  each member of each of its types, by its compiled name.
   * - Methods by their wording, e.g. `move (a card) to (a pile)`;  one read as a property without its quotes,
   *   e.g. `is face up` for `"is face up"`.
   * - Properties by their words as written (`asWritten`), e.g. `is-set-up`, else their name, e.g. `rank`.
   * - Left out:  top-level functions, and class variables, e.g. `Ranks` -- the Thing Explorer shows neither.
   * - Types in the order they're declared;  one with no members is left out.
   * - `writer`:  whose names the compiled code uses -- javascript's, as that's what runs.
   */
  static of(declarations: SP.SpellDeclarationsData, writer: SpellWordsWriter = P.JSWriter.instance): SP.SpellWordsData {
    const types: Record<string, Record<string, string>> = {}
    for (const statement of declarations.statements) {
      if (statement.type) types[statement.type] ??= {}
      const member = SpellWords.memberOf(statement, writer)
      if (!member || !statement.of) continue
      const members = (types[statement.of] ??= {})
      members[member.name] ??= member.words
    }
    for (const [type, members] of Object.entries(types)) {
      if (!Object.keys(members).length) delete types[type]
    }
    return { lang: SpellWords.LANG, types }
  }

  /**
   * The member `statement` declares on its type, by its compiled name, with its words -- `undefined` if none.
   * - Every member by the name the writer gives it, stored properties too (Q56).
   * - A name that isn't an identifier is as spell has it:  the writer quotes it.
   */
  static memberOf(
    statement: SP.SpellDeclaration,
    writer: SpellWordsWriter = P.JSWriter.instance
  ): { name: string; words: string } | undefined {
    const { property, output, kind, name, syntax } = statement
    if (property) {
      return { name: compiledName(writer, property), words: statement.asWritten ?? property }
    }
    if (kind === "method" && output) {
      return { name: compiledName(writer, output), words: unquoted(name ?? syntax ?? output) }
    }
    return undefined
  }

  /**
   * `words` as the module `<Project>.en.js` holds, for project `projectName`:
   * ```
   * /*! SPELL: WORDS Solitaire en *\/
   * export const words = {
   *   lang: "en",
   *   types: {
   *     Card: {
   *       moveToPile: "move (a card) to (a pile)",
   * ```
   * - One member a line, so a diff shows which changed.  Keys bare where they're identifiers, as a person writes.
   * - Plain data, so `read()` reads it back with `JSON5`.
   */
  static script(words: SP.SpellWordsData, projectName: string): string {
    const types = Object.entries(words.types).map(([type, members]) => {
      const lines = Object.entries(members).map(([name, text]) => `      ${literalKey(name)}: ${JSON.stringify(text)}`)
      return `    ${literalKey(type)}: {\n${lines.join(",\n")}\n    }`
    })
    return [
      `/*! ${WORDS_MARKER} ${projectName} ${words.lang} */`,
      "export const words = {",
      `  lang: ${JSON.stringify(words.lang)},`,
      types.length ? `  types: {\n${types.join(",\n")}\n  }` : "  types: {}",
      "}",
      ""
    ].join("\n")
  }

  ////////////////
  // ## Reading
  ////////////////

  /**
   * Words in `text`, a project's `<Project>.en.js` as `script()` writes it -- `undefined` if it isn't one.
   * - Reads TEXT:  never runs it.  A runner, which has no `JSON5`, imports it instead.
   */
  static read(text: string): SP.SpellWordsData | undefined {
    const literal = text.match(WORDS_LITERAL)?.[1]
    if (!literal) return undefined
    try {
      const words = JSON5.parse<Partial<SP.SpellWordsData>>(literal)
      if (typeof words.lang !== "string" || !words.types || typeof words.types !== "object") return undefined
      return words as SP.SpellWordsData
    } catch {
      return undefined
    }
  }

  /**
   * Is `file` a words file of project `projectName`, in any language -- `Solitaire.en.js`, `Solitaire.pt-BR.js`?
   * - NEVER one of a project's own files:  the server leaves it out of the manifest, as its compiled output.
   */
  static isWordsFile(file: string, projectName: string): boolean {
    return file.startsWith(`${projectName}.`) && LANGUAGE_JS.test(file.slice(projectName.length + 1))
  }

  /** Language the compiler writes words in:  English, spell's own. */
  static LANG = "en"
}

/** What `SpellWords` needs of a writer:  how it names a member -- see `P.JSWriter.nameOf()`. */
export type SpellWordsWriter = Pick<P.JSWriter, "nameOf">

/** Marker starting a words file, as `/*! SPELL: SCOPES ... *\/` starts a scope pack. */
const WORDS_MARKER = "SPELL: WORDS"

/** The object literal a words file exports, for `read()`. */
const WORDS_LITERAL = /export const words = (\{[\s\S]*\})\s*$/

/** End of a words file's name after its project's, e.g. `en.js`, `pt-BR.js`. */
const LANGUAGE_JS = /^[a-z]{2}(-[A-Za-z]{2,4})?\.js$/

/** Spell's `name` as `writer` writes it;  as is if it isn't an identifier, which the writer quotes. */
function compiledName(writer: SpellWordsWriter, name: string): string {
  return IDENTIFIER.test(name) ? writer.nameOf(name) : name
}

/** Is it a javascript identifier, written bare? */
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/

/** `text` without the double quotes a method read as a property is named with:  `"is face up"` => `is face up`. */
function unquoted(text: string): string {
  return text.replace(/^"(.*)"$/, "$1")
}

/** `key` bare if it's an identifier, else quoted, e.g. `moveToPile` but `"is-a"`. */
function literalKey(key: string): string {
  return IDENTIFIER.test(key) ? key : JSON.stringify(key)
}
