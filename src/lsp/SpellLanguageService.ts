import {
  DiagnosticSeverity,
  FoldingRangeKind,
  SymbolKind,
  type Diagnostic,
  type DocumentSymbol,
  type FoldingRange,
  type Position,
  type Range,
  type SelectionRange,
  type WorkspaceSymbol
} from "vscode-languageserver"

import { typeCase } from "~/util"
import { P } from "~/parser"
import { SP } from "~/languages/spell"
import type { LSP } from "~/lsp"

/**
 * Answers editor questions about parsed spell files, in Language Server Protocol shapes -- one method per request.
 * - Works from each file's current `match`, as kept up to date by `SpellWorkspace`.
 * - Positions come from match / token OFFSETS in `file.parseText`, turned into line + character here.
 *   NEVER from `token.line` / `ch`:  offsets are what incremental parsing keeps exact.
 * - `character` counts UTF-16 code units, as JS strings do, which is the protocol's default encoding.
 */
export class SpellLanguageService {
  /** Workspace whose files we answer about. */
  declare workspace: LSP.SpellWorkspace
  /** Line-start offsets of each file, with the text they were worked out from. */
  #lineStartsCache = new WeakMap<SP.SpellFile, { text: string; lineStarts: number[] }>()

  constructor(workspace: LSP.SpellWorkspace) {
    this.workspace = workspace
  }

  ////////////////
  // ## Positions
  ////////////////

  /** Line + character of `offset` in `file`. */
  positionAt(file: SP.SpellFile, offset: number): Position {
    const { line, ch } = P.positionForOffset(this.lineStarts(file), offset)
    return { line, character: ch }
  }

  /** Offset of `position` in `file`, clamped to the end of its line. */
  offsetAt(file: SP.SpellFile, { line, character }: Position): number {
    const lineStarts = this.lineStarts(file)
    const { length } = file.parseText
    if (line >= lineStarts.length) return length
    const lineEnd = line + 1 < lineStarts.length ? lineStarts[line + 1]! - 1 : length
    return Math.min(lineStarts[line]! + character, lineEnd)
  }

  /** Range of `match`'s text in `file` -- up to its last character, NOT its trailing whitespace. */
  rangeOf(file: SP.SpellFile, match: P.Match): Range | undefined {
    const { start, end } = match
    if (start === undefined || end === undefined) return undefined
    return { start: this.positionAt(file, start), end: this.positionAt(file, end) }
  }

  /**
   * Every match at `position` in `file`, outermost (the file's) first.
   * - Descends through what rules keep in `match.data` too, e.g. what JSX parses out of `{...}`.
   * - A cursor just after a word counts as on it.
   */
  matchesAt(file: SP.SpellFile, position: Position): P.Match[] {
    if (!file.match) return []
    return this.deepestMatchesAt(file.match, this.offsetAt(file, position))
  }

  /** Line starts for `file`'s current text, worked out once per text. */
  private lineStarts(file: SP.SpellFile): number[] {
    const text = file.parseText
    let cached = this.#lineStartsCache.get(file)
    if (cached?.text !== text) {
      cached = { text, lineStarts: P.getLineStarts(text) }
      this.#lineStartsCache.set(file, cached)
    }
    return cached.lineStarts
  }

  ////////////////
  // ## Diagnostics
  ////////////////

  /**
   * Problems to show in `file`:  its parse errors, each under the text it couldn't make sense of.
   * - A file its project doesn't parse, or a project whose parse crashed, gets ONE diagnostic saying so, at the top.
   */
  diagnostics(file: SP.SpellFile): Diagnostic[] {
    const top: Range = { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } }
    if (!this.workspace.isActive(file)) {
      const message = `Not parsed:  '${file.file}' isn't active in this project's .imports.json`
      return [{ range: top, severity: DiagnosticSeverity.Information, source: "spell", message }]
    }
    const problem = this.workspace.problems.get(file.project)
    if (problem) {
      const message = `Parser crashed, will try again after the next edit:  ${problem}`
      return [{ range: top, severity: DiagnosticSeverity.Error, source: "spell", message }]
    }
    if (!file.match) return []

    return (SP.getParseErrors(file.match) ?? []).flatMap((error) => {
      const range = this.rangeOf(file, error)
      if (!range) return []
      const text = file.parseText.slice(error.start, error.end)
      const message = error.message || `Don't understand "${text}"`
      return [{ range, severity: DiagnosticSeverity.Error, source: "spell", message }]
    })
  }

  ////////////////
  // ## Structure
  ////////////////

  /**
   * Foldable regions of `file`:
   * - a statement with an indented body, e.g. a method definition or an `if`
   * - a JSX element spanning several lines
   * - a run of two or more comment-only lines
   */
  foldingRanges(file: SP.SpellFile): FoldingRange[] {
    if (!file.match) return []
    const ranges: FoldingRange[] = []
    const commentLines: number[] = []
    this.walk(file.match, (match) => {
      if (match.rule.name === "line") {
        if (match.tokens.length === 2) this.addFold(file, ranges, match.start, match.end)
        const isCommentOnly = !match.data.statement && match.matched.some((item) => this.isMatchOf(item, "comment"))
        if (isCommentOnly && match.start !== undefined) commentLines.push(this.positionAt(file, match.start).line)
      }
    })
    P.Tokenizer.forEachToken(file.match.tokens, (token) => {
      if (token instanceof P.JSXElementToken) this.addFold(file, ranges, token.start, token.end)
    })
    for (const [startLine, endLine] of this.runsOf(commentLines))
      ranges.push({ startLine, endLine, kind: FoldingRangeKind.Comment })
    return ranges
  }

  /** Add a fold from `start` to `end` to `ranges`, if they're on different lines. */
  private addFold(file: SP.SpellFile, ranges: FoldingRange[], start?: number, end?: number) {
    if (start === undefined || end === undefined) return
    const startLine = this.positionAt(file, start).line
    const endLine = this.positionAt(file, end).line
    if (endLine > startLine) ranges.push({ startLine, endLine })
  }

  /**
   * "Expand selection" steps at each of `positions`:  innermost match first, out to the whole file.
   * - Only ranges which contain the position, each strictly bigger than the last -- editors reject anything else.
   */
  selectionRanges(file: SP.SpellFile, positions: Position[]): SelectionRange[] {
    const whole: SelectionRange = {
      range: { start: { line: 0, character: 0 }, end: this.positionAt(file, file.parseText.length) }
    }
    return positions.map((position) => {
      let selection = whole
      for (const match of this.matchesAt(file, position)) {
        const range = this.rangeOf(file, match)
        if (!range || !this.rangeContains(range, position) || this.sameRange(range, selection.range)) continue
        selection = { range, parent: selection }
      }
      return selection === whole ? { range: { start: position, end: position }, parent: whole } : selection
    })
  }

  /**
   * Outline of `file`:  the types, properties, methods, event handlers and variables it declares.
   * - A property or method of a type this file declares nests under that type.
   * - A declaration's indented body contributes its own declarations as children.
   *   Other statements' bodies (`if`, loops...) don't:  their names aren't the file's.
   */
  documentSymbols(file: SP.SpellFile): DocumentSymbol[] {
    if (!file.match) return []
    return this.nestUnderTypes(this.symbolsIn(file, file.match))
  }

  /** Declarations in all loaded projects whose names contain `query`'s characters in order, ignoring case. */
  workspaceSymbols(query: string): WorkspaceSymbol[] {
    const results: WorkspaceSymbol[] = []
    for (const project of this.workspace.projects) {
      for (const file of this.workspace.spellFiles(project)) {
        const uri = this.workspace.uriFor(file)
        for (const { symbol, containerName } of this.allSymbols(this.documentSymbols(file))) {
          const { name, kind, selectionRange } = symbol
          if (this.isSubsequence(query, name))
            results.push({ name, kind, containerName, location: { uri, range: selectionRange } })
        }
      }
    }
    return results
  }

  /** Symbols for the declarations among `block`'s items, each with the ones in its own body as children. */
  private symbolsIn(file: SP.SpellFile, block: P.Match): LSP.SpellSymbol[] {
    return block.matched.flatMap((item) => {
      if (!(item instanceof P.Match)) return []
      if (item.rule.name === "block") return this.symbolsIn(file, item)
      const statement = item.data.statement as P.Match | undefined
      const found = statement && this.symbolFor(file, item, statement)
      if (!found) return []
      const body = statement.data.body as P.Match | undefined
      if (body?.rule.name === "block") found.symbol.children = this.nestUnderTypes(this.symbolsIn(file, body))
      return [found]
    })
  }

  /**
   * Symbol for `statement` on `line`, if it declares something -- asks its rule (`getDeclaration()`).
   * - `range` covers the whole line and any body;  `selectionRange` just the name.
   * - Type names show in Type_Case, as the compiled classes are named.
   */
  private symbolFor(file: SP.SpellFile, line: P.Match, statement: P.Match): LSP.SpellSymbol | undefined {
    const declaration = statement.rule.getDeclaration(statement)
    const range = this.rangeOf(file, line)
    if (!declaration || !range) return undefined
    const { kind, name, nameMatch, of, detail } = declaration
    return {
      symbol: {
        name: kind === "type" ? typeCase(name) : name,
        kind: SpellLanguageService.SYMBOL_KINDS[kind],
        detail,
        range,
        selectionRange: this.rangeOf(file, nameMatch) ?? range
      },
      typeName: of && typeCase(of)
    }
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** Editor symbol kind for each kind of declaration. */
  private static SYMBOL_KINDS: Record<P.DeclarationKind, SymbolKind> = {
    type: SymbolKind.Class,
    property: SymbolKind.Property,
    method: SymbolKind.Method,
    function: SymbolKind.Function,
    variable: SymbolKind.Variable,
    event: SymbolKind.Event
  }

  /**
   * Matches directly below `match`:  its `matched` ones, then any a rule keeps in `data`,
   * e.g. a statement's parsed `body`, or what JSX rules parse out of their tokens.
   * - Skips `data.errors`:  those are ALL the parse errors below, gathered up.
   */
  private childMatches(match: P.Match): P.Match[] {
    const children = new Set<P.Match>()
    for (const item of match.matched) if (item instanceof P.Match) children.add(item)
    for (const [key, value] of Object.entries(match.data)) {
      if (key === "errors") continue
      for (const item of [value].flat()) if (item instanceof P.Match && item !== match) children.add(item)
    }
    return [...children]
  }

  /** Call `visit` for `match` and every match below it, parents first -- see `childMatches()`. */
  private walk(match: P.Match, visit: (match: P.Match) => void, seen = new Set<P.Match>()) {
    if (seen.has(match)) return
    seen.add(match)
    visit(match)
    for (const child of this.childMatches(match)) this.walk(child, visit, seen)
  }

  /**
   * `match`, then the deepest chain of matches below it containing `offset`.
   * - Tries EVERY child containing `offset`, not just the first:
   *   a statement's body placeholder and its parsed body cover the same text, and only the parsed one goes deeper.
   */
  private deepestMatchesAt(match: P.Match, offset: number): P.Match[] {
    let deepest: P.Match[] = []
    for (const child of this.childMatches(match)) {
      if (!this.containsOffset(child, offset)) continue
      const stack = this.deepestMatchesAt(child, offset)
      if (stack.length > deepest.length) deepest = stack
    }
    return [match, ...deepest]
  }

  /** Is `offset` within `match`:  from its start, up to where the next token starts, or just after its text? */
  private containsOffset(match: P.Match, offset: number): boolean {
    const { start, end, next } = match
    if (start === undefined || start > offset) return false
    return (next !== undefined && offset < next) || (end !== undefined && offset <= end)
  }

  /** Is `item` a match of the rule named `ruleName`? */
  private isMatchOf(item: P.Match | P.Token, ruleName: string): boolean {
    return item instanceof P.Match && item.rule.name === ruleName
  }

  /** `[first, last]` of each run of 2 or more consecutive numbers in sorted `numbers`. */
  private runsOf(numbers: number[]): Array<[number, number]> {
    const runs: Array<[number, number]> = []
    let first = numbers[0]
    numbers.forEach((number, index) => {
      const next = numbers[index + 1]
      if (next === number + 1) return
      if (first !== undefined && number > first) runs.push([first, number])
      first = next
    })
    return runs
  }

  /** Does `range` contain `position`, ends included? */
  private rangeContains({ start, end }: Range, { line, character }: Position): boolean {
    const afterStart = line > start.line || (line === start.line && character >= start.character)
    const beforeEnd = line < end.line || (line === end.line && character <= end.character)
    return afterStart && beforeEnd
  }

  /** Do ranges `a` and `b` cover exactly the same text? */
  private sameRange(a: Range, b: Range): boolean {
    return (
      a.start.line === b.start.line &&
      a.start.character === b.start.character &&
      a.end.line === b.end.line &&
      a.end.character === b.end.character
    )
  }

  /**
   * `symbols` as sent to the editor, in order, with each property or method of a type declared among them
   * moved under that type's symbol.
   */
  private nestUnderTypes(symbols: LSP.SpellSymbol[]): DocumentSymbol[] {
    const types = new Map<string, DocumentSymbol>()
    for (const { symbol } of symbols) if (symbol.kind === SymbolKind.Class) types.set(symbol.name, symbol)
    return symbols.flatMap(({ symbol, typeName }) => {
      const type = typeName ? types.get(typeName) : undefined
      if (!type) return [symbol]
      ;(type.children ??= []).push(symbol)
      return []
    })
  }

  /** Every symbol in `symbols`, children included, with the name of the symbol it's under. */
  private *allSymbols(
    symbols: DocumentSymbol[] | undefined,
    containerName?: string
  ): Generator<{ symbol: DocumentSymbol; containerName?: string }> {
    for (const symbol of symbols ?? []) {
      yield { symbol, containerName }
      yield* this.allSymbols(symbol.children, symbol.name)
    }
  }

  /** Are `query`'s characters all in `name`, in order, ignoring case?  An empty `query` matches everything. */
  private isSubsequence(query: string, name: string): boolean {
    const lowerName = name.toLowerCase()
    let index = 0
    for (const char of query.toLowerCase()) {
      index = lowerName.indexOf(char, index) + 1
      if (index === 0) return false
    }
    return true
  }
}
