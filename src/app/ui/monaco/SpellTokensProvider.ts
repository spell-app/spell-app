import { P } from "spell-parser/parser"
import { SP } from "spell-parser/spell"
import { LSP } from "spell-app/lsp"

import { monaco } from "./monaco"

/**
 * Instant colouring for spell, line by line, from its TOKENS:  words, symbols, numbers, comments, text.
 * - Needs no parse, so it's there from the first keystroke;  colouring from the parse (semantic tokens) goes on top.
 * - Each spell line tokenizes on its own.
 * - Code spell (`Card.spell`) by spell's own tokenizer;  spellx (`Card.spellx`) by its `SP.SpellxTokenizer`,
 *   a provider of its own:  see `forSpellx()`.
 *   - A tag line colours as its code-spell twin does (`SP.SpellxTwin`):  `<property "rank" one-of="...">` reads as
 *     `its "rank" is one of ...`, so `"rank"` is a string and `ace` a word.
 *   - The tag's own words, which its twin never holds:  `property` a keyword, `one-of` an attribute name,
 *     and `<`, `>`, `/>`, `</>` punctuation.
 *   - A line of prose, or a note's, is a comment.
 * - Blocks of another language are coloured as that language, by Monaco's own colouring (`EMBEDDED_BLOCKS`):
 *   - a type's `<css>` block as CSS -- see `LSP.SpellCSS`
 *   - a `<markdown>` block as markdown, in a drawing or a type's outline -- see spell's `markdown_block`
 * - The only state carried between lines is which block we're in, if any (`SPELL_LINE`, `CSS_LINE` ...),
 *   and in spellx, the tags open (`SpellxLineState`).
 * - A block's lines are each coloured on their own too,
 *   so a CSS comment or a fenced code block over several lines colours its first line only.
 * - NEVER throws:  a line the tokenizer chokes on just goes uncoloured.
 */
export class SpellTokensProvider implements monaco.languages.TokensProvider {
  /**
   * A spellx parser, when we colour spellx:  its tokenizer reads the lines, its twins colour the tags.
   * - `undefined` for code spell.
   * - NOT the project's:  colouring needs no project, so this one reads English's spellx words.
   */
  readonly spellx: SP.SpellParser | undefined

  constructor(spellx?: SP.SpellParser) {
    this.spellx = spellx
  }

  /**
   * A provider for spellx files, `Card.spellx`:  read by a spellx parser, English's.
   * - CONSIDER:  each file's own language (`Carta.es.spellx`):  a tokens provider is asked for lines, never a file.
   */
  static forSpellx(): SpellTokensProvider {
    const props = { module: "spellx colouring", form: "spellx" } as P.ParserProps
    return new SpellTokensProvider(SP.Language.default.parser.clone(props) as SP.SpellParser)
  }

  /** State after a line of spell. */
  static SPELL_LINE = SpellTokensProvider.lineState()
  /** State after a `<css>` line, or a line of CSS in its block. */
  static CSS_LINE = SpellTokensProvider.lineState()
  /** State after a `<markdown>` line, or a line of markdown in its block. */
  static MARKDOWN_LINE = SpellTokensProvider.lineState()

  /**
   * The blocks of another language spell holds, each alone on its lines:  `<css>` ... `</css>`.
   * - `tag`:  its tag
   * - `language`:  Monaco's language that colours it
   * - `state`:  the state inside it
   * - `open` / `close`:  its first and last lines
   */
  static EMBEDDED_BLOCKS: EmbeddedBlock[] = [
    {
      tag: "css",
      language: "css",
      state: SpellTokensProvider.CSS_LINE,
      open: LSP.SpellCSS.OPEN_LINE,
      close: LSP.SpellCSS.CLOSE_LINE
    },
    {
      tag: "markdown",
      language: "markdown",
      state: SpellTokensProvider.MARKDOWN_LINE,
      open: /^\s*<markdown>\s*$/,
      close: /^\s*<\/markdown>\s*$/
    }
  ]

  getInitialState(): monaco.languages.IState {
    return this.spellx ? SpellxLineState.NONE_OPEN : SpellTokensProvider.SPELL_LINE
  }

  /**
   * Tokens of `line`, by where each starts, and the state the next line starts in.
   * - `<css>` alone on a line starts a CSS block, `</css>` ends it;  likewise `<markdown>`.
   */
  tokenize(line: string, state: monaco.languages.IState): monaco.languages.ILineTokens {
    const { SPELL_LINE, EMBEDDED_BLOCKS } = SpellTokensProvider
    // CONSIDER:  a spellx file goes back to no tags open after a `<css>` / `<markdown>` block;  none of the examples
    // has one.  And a tag's head over several lines is read a line at a time (`SP.SpellxTokenizer.tokenizeLine()`).
    const lineState = this.spellx ? SpellxLineState.NONE_OPEN : SPELL_LINE
    const inside = EMBEDDED_BLOCKS.find((block) => block.state === state)
    if (inside) {
      if (inside.close.test(line)) return { tokens: this.tagTokens(line, inside.tag), endState: lineState }
      return { tokens: this.embeddedTokens(line, inside.language), endState: inside.state }
    }
    const opened = EMBEDDED_BLOCKS.find((block) => block.open.test(line))
    if (opened) return { tokens: this.tagTokens(line, opened.tag), endState: opened.state }
    if (this.spellx) return this.spellxTokens(this.spellx, line, state as SpellxLineState)
    return { tokens: this.spellTokens(line), endState: SPELL_LINE }
  }

  /**
   * Tokens of a line of spellx, read after the tags open in `state`, and the state with the tags open after it.
   * - A tag's name, values and phrase colour as its twin's tokens;  its own words as `spellxTagPieces()` says.
   */
  private spellxTokens(parser: SP.SpellParser, line: string, state: SpellxLineState): monaco.languages.ILineTokens {
    try {
      const tokenizer = parser.tokenizer as SP.SpellxTokenizer
      const { tokens, open } = tokenizer.tokenizeLine(line, state.open)
      const pieces: Piece[] = []
      for (const token of tokens) {
        if (token instanceof SP.SpellxTagToken) pieces.push(...this.spellxTagPieces(parser, tokens, token))
        else if (token instanceof SP.SpellxCloserToken)
          pieces.push({ start: token.start, end: token.end, scopes: "delimiter" })
        else if (token instanceof SP.SpellxProseToken)
          pieces.push({ start: token.start, end: token.end, scopes: "comment" })
        else {
          const scopes = this.scopesFor(token)
          if (scopes) pieces.push({ start: token.start, end: token.end, scopes })
        }
      }
      return { tokens: this.piecesToTokens(pieces), endState: new SpellxLineState(open) }
    } catch (error) {
      console.warn("SpellTokensProvider.tokenize():  couldn't tokenize spellx", { line, error })
      return { tokens: [], endState: state }
    }
  }

  /**
   * Pieces of a spellx tag's head, `tag`, on a line of `tokens`:
   * - its name, values and phrase:  as its code-spell twin's tokens (`SP.SpellxTwin`), where the twin has them
   * - its word:  `keyword`;  its attributes' names:  `attribute.name`
   * - `<`, `=`, quotes, `>` and `/>`:  `delimiter`, under the rest
   */
  private spellxTagPieces(parser: SP.SpellParser, tokens: P.Token[], tag: SP.SpellxTagToken): Piece[] {
    const { word, name, attributes, phrase, selfClosing } = tag.tag
    const pieces: Piece[] = [{ start: tag.start, end: tag.end, scopes: "delimiter" }]
    const add = (start: number, end: number, scopes: string | undefined) => {
      if (scopes && end > start) pieces.push({ start, end, scopes })
    }
    const addTokens = (from: P.Token[]) => from.forEach((token) => add(token.start, token.end, this.scopesFor(token)))
    add(tag.start + 1, tag.start + 1 + word.length, "keyword")
    // what the tag holds of spell, as its twin would colour it;  else as it's written
    const twin = this.twinTokens(parser, tokens).filter((token) => token.start >= tag.start && token.start < tag.end)
    if (twin.length) addTokens(twin)
    else {
      if (name?.quoted) addTokens([name.quoted])
      else if (name) addTokens(name.tokens ?? [])
      for (const attribute of attributes) addTokens(attribute.tokens ?? [])
      if (phrase) addTokens(phrase.tokens ?? [])
    }
    for (const attribute of attributes) add(attribute.start, attribute.start + attribute.word.length, "attribute.name")
    if (!tag.raw?.endsWith(">")) return pieces
    add(tag.end - (selfClosing ? 2 : 1), tag.end, "delimiter")
    return pieces
  }

  /**
   * The tokens of the twin of a line of spellx `tokens` that are the line's own:  none of the twin's own words.
   * - None when it's no tag line, or its tag has no twin.
   */
  private twinTokens(parser: SP.SpellParser, tokens: P.Token[]): P.Token[] {
    const [root] = parser.tokenizer.breakIntoIndentedBlocks(tokens)
    const line = root && firstLineIn(root)
    const twin = line && SP.SpellxTwin.lineOf(line, undefined, parser)
    if (!twin) return []
    const own: P.Token[] = []
    P.Tokenizer.forEachToken([twin.line, ...(twin.body ? [twin.body] : [])], (token) => {
      if (!SP.SpellxTwin.isSynthetic(token) && !(token instanceof P.LineToken)) own.push(token)
    })
    return own
  }

  /**
   * Monaco's tokens for `pieces`, each from its `start` to its `end`, uncoloured between them.
   * - A piece starting inside another, longer one is drawn over it, and the longer one picks up after it:
   *   a tag's head is `delimiter` under its words.
   */
  private piecesToTokens(pieces: Piece[]): monaco.languages.IToken[] {
    const ends = pieces.flatMap((piece) => [piece.start, piece.end])
    const points = [...new Set([0, ...ends])].sort((a, b) => a - b)
    const tokens: monaco.languages.IToken[] = []
    for (const point of points) {
      // the innermost piece covering `point`:  the shortest
      const covering = pieces
        .filter((piece) => piece.start <= point && point < piece.end)
        .sort((a, b) => a.end - a.start - (b.end - b.start))[0]
      const scopes = covering?.scopes ?? ""
      if (tokens.at(-1)?.scopes !== scopes) tokens.push({ startIndex: point, scopes })
    }
    return tokens
  }

  /**
   * Tokens of a line of spell.
   * - `""` rule name:  tokenize the line as-is, NOT as a `"block"`, which would break it into indented blocks.
   */
  private spellTokens(line: string): monaco.languages.IToken[] {
    const tokens: monaco.languages.IToken[] = []
    try {
      let end = 0
      for (const token of SP.spellParser.tokenize(line, "") ?? []) {
        // whitespace between tokens is uncoloured
        if (token.start > end) tokens.push({ startIndex: end, scopes: "" })
        tokens.push({ startIndex: token.start, scopes: this.scopesFor(token) ?? "" })
        end = token.end
      }
    } catch (error) {
      console.warn("SpellTokensProvider.tokenize():  couldn't tokenize", { line, error })
    }
    return tokens
  }

  /**
   * Tokens of a line of an embedded block, from Monaco's colouring of `language`:
   * its token types (`attribute.name.css` ...) as scopes.
   * - Markdown's line is coloured without its indent:  a `#` heading or a `>` quote counts only at the start.
   */
  private embeddedTokens(line: string, language: string): monaco.languages.IToken[] {
    const indent = language === "markdown" ? line.length - line.trimStart().length : 0
    try {
      const tokens = (monaco.editor.tokenize(line.slice(indent), language)[0] ?? []).map(({ offset, type }) => ({
        startIndex: offset + indent,
        scopes: type
      }))
      return indent ? [{ startIndex: 0, scopes: "" }, ...tokens] : tokens
    } catch (error) {
      console.warn(`SpellTokensProvider.tokenize():  couldn't tokenize ${language}`, { line, error })
      return []
    }
  }

  /** Tokens of a block's opening or closing line, e.g. `<css>` or `</css>`, coloured as a tag. */
  private tagTokens(line: string, tag: string): monaco.languages.IToken[] {
    const open = line.indexOf("<")
    const close = line.indexOf(">")
    const name = line.indexOf(tag, open)
    return [
      { startIndex: 0, scopes: "" },
      { startIndex: open, scopes: "delimiter" },
      { startIndex: name, scopes: "tag" },
      { startIndex: close, scopes: "delimiter" },
      { startIndex: close + 1, scopes: "" }
    ]
  }

  /** Theme scope to colour `token` with, or `undefined` for none. */
  private scopesFor(token: P.Token): string | undefined {
    if (token instanceof P.CommentToken) return token.commentSymbol.startsWith("#") ? "comment.header" : "comment"
    if (token instanceof P.TextToken) return "string"
    if (token instanceof P.NumberToken) return "number"
    if (token instanceof P.SymbolToken) return "operator"
    if (token instanceof P.WordToken) return "identifier"
    return undefined
  }

  /** A state that's equal only to itself:  lines carry nothing else between them. */
  private static lineState(): monaco.languages.IState {
    const state: monaco.languages.IState = { clone: () => state, equals: (other) => other === state }
    return state
  }
}

/** A block of another language in spell, coloured as that language -- see `SpellTokensProvider.EMBEDDED_BLOCKS`. */
type EmbeddedBlock = {
  /** Its tag, e.g. `css`. */
  tag: string
  /** Monaco's language which colours it, e.g. `css`. */
  language: string
  /** The state inside it. */
  state: monaco.languages.IState
  /** Its first line:  its tag alone, e.g. `<css>`. */
  open: RegExp
  /** Its last line, e.g. `</css>`. */
  close: RegExp
}

/** A piece of a line, coloured `scopes` from `start` to `end`:  see `SpellTokensProvider.piecesToTokens()`. */
type Piece = { start: number; end: number; scopes: string }

/**
 * State after a line of spellx:  the tags open after it, which the next line is read with.
 * - Two states are equal when the same tags are open, at the same indents:  so Monaco stops re-colouring
 *   the lines below an edit once they'd start the same as before.
 */
class SpellxLineState implements monaco.languages.IState {
  /** No tag open:  a file's start. */
  static NONE_OPEN = new SpellxLineState([])

  constructor(readonly open: readonly SP.SpellxOpenTag[]) {}

  /** Never changed, so it's its own clone. */
  clone(): monaco.languages.IState {
    return this
  }

  equals(other: monaco.languages.IState): boolean {
    if (!(other instanceof SpellxLineState) || other.open.length !== this.open.length) return false
    return this.open.every((tag, index) => {
      const theirs = other.open[index]!
      return tag.indent === theirs.indent && tag.kind === theirs.kind && tag.chain === theirs.chain
    })
  }
}

/** The first line in `block`, however deep:  a line alone, indented, is a line in a block in the root. */
function firstLineIn(block: P.Token): P.LineToken | undefined {
  if (block instanceof P.LineToken) return block
  for (const item of (block as P.BlockToken).tokens ?? []) {
    const line = firstLineIn(item)
    if (line) return line
  }
  return undefined
}
