import {
  CompletionItemKind,
  DiagnosticSeverity,
  DocumentHighlightKind,
  FoldingRangeKind,
  InsertTextFormat,
  MarkupKind,
  SemanticTokensBuilder,
  SymbolKind,
  type CompletionItem,
  type Diagnostic,
  type DocumentHighlight,
  type DocumentSymbol,
  type FoldingRange,
  type FormattingOptions,
  type Hover,
  type Location,
  type Position,
  type Range,
  type SelectionRange,
  type SemanticTokens,
  type SemanticTokensLegend,
  type TextEdit,
  type WorkspaceEdit,
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
  // ## Highlighting
  ////////////////

  /** Semantic token types we send, in legend order -- every `P.HighlightKind`. */
  static HIGHLIGHT_KINDS: P.HighlightKind[] = [
    "keyword",
    "operator",
    "variable",
    "parameter",
    "type",
    "enumMember",
    "function",
    "property",
    "number",
    "string",
    "comment"
  ]

  /** Semantic token legend, sent on `initialize`.  Modifier bits:  `declaration` = 1, `defaultLibrary` = 2. */
  static TOKEN_LEGEND: SemanticTokensLegend = {
    tokenTypes: SpellLanguageService.HIGHLIGHT_KINDS,
    tokenModifiers: ["declaration", "defaultLibrary"]
  }

  /**
   * Which highlight kinds of a declared name's tokens get the `declaration` modifier, for each kind of declaration.
   * - A method's name is its whole signature:  its words and argument names, NOT the types of its arguments.
   */
  static DECLARED_AS: Record<P.DeclarationKind, P.HighlightKind[]> = {
    type: ["type"],
    property: ["property"],
    method: ["function", "parameter"],
    function: ["function", "parameter"],
    variable: ["variable"],
    event: []
  }

  /**
   * Semantic tokens for `file`, or just those overlapping `range`:  how the editor should colour each word.
   * - A token running over several lines, e.g. a multi-line string, is sent once per line, as the protocol requires.
   */
  semanticTokens(file: SP.SpellFile, range?: Range): SemanticTokens {
    const builder = new SemanticTokensBuilder()
    const from = range ? this.offsetAt(file, range.start) : 0
    const to = range ? this.offsetAt(file, range.end) : Infinity
    for (const span of this.highlightSpans(file)) {
      if (span.end <= from || span.start >= to) continue
      const kind = SpellLanguageService.HIGHLIGHT_KINDS.indexOf(span.kind)
      const modifiers = (span.declaration ? 1 : 0) | (span.defaultLibrary ? 2 : 0)
      for (const [start, end] of this.splitByLine(file, span.start, span.end)) {
        const { line, character } = this.positionAt(file, start)
        builder.push(line, character, end - start, kind, modifiers)
      }
    }
    return builder.build()
  }

  /**
   * What to colour in `file`, in order, never overlapping.
   * - Each match's OWN tokens take its rule's `highlightAs`, e.g. `property` for `suit` in `its suit`.
   * - Refined from what the parse found:
   *   - the words of a call to a method the project defines are `function`, not `keyword`
   *   - an argument is a `parameter`
   *   - something built in, e.g. the `thing` type, is `defaultLibrary`
   *   - a name where it's declared, e.g. `card` in `a card is a thing`, is a `declaration`
   * - JSX tag names are `type`s, attribute names `property`s.
   */
  highlightSpans(file: SP.SpellFile): LSP.HighlightSpan[] {
    if (!file.match) return []
    const generated = this.generatedRules(file.project)
    // Kind of declaration each declared name's tokens are part of, by token start.
    const declared = new Map<number, P.DeclarationKind>()
    const spans: LSP.HighlightSpan[] = []
    this.walk(file.match, (match, parent) => {
      const declaration = match.rule.getDeclaration(match)
      if (declaration) {
        P.Tokenizer.forEachToken(declaration.nameMatch.tokens, (token) => {
          declared.set(token.start, declaration.kind)
        })
      }
      for (const item of match.matched) {
        if (item instanceof P.Match) continue
        if (item instanceof P.JSXToken) {
          spans.push(...this.jsxSpans(item))
          continue
        }
        const kind = match.rule.highlightAs && this.refineKind(match.rule.highlightAs, item, match, parent, generated)
        if (!kind || !SpellLanguageService.isColourable(item)) continue
        const declaredKind = declared.get(item.start)
        spans.push({
          start: item.start,
          end: item.end,
          kind,
          declaration: !!declaredKind && SpellLanguageService.DECLARED_AS[declaredKind].includes(kind),
          defaultLibrary: this.isBuiltIn(match)
        })
      }
    })
    spans.sort((a, b) => a.start - b.start)
    return spans.filter((span, index) => index === 0 || span.start >= spans[index - 1]!.end)
  }

  /** `kind` for `token`, which `match` holds directly, refined by what the parse found -- see `highlightSpans()`. */
  private refineKind(
    kind: P.HighlightKind,
    token: P.Token,
    match: P.Match,
    parent: P.Match | undefined,
    generated: Map<P.Rule, P.ScopeRule>
  ): P.HighlightKind {
    const isGenerated = generated.has(match.rule) || (!!parent && generated.has(parent.rule))
    if (kind === "keyword" && isGenerated && token instanceof P.WordToken) return "function"
    const { scopeVar } = match.data as { scopeVar?: unknown }
    if (kind === "variable" && scopeVar instanceof P.ScopeVariable && scopeVar.kind === "argument") return "parameter"
    return kind
  }

  /** Is `match` a reference to something built in, i.e. a scope record which wasn't declared in any file? */
  private isBuiltIn(match: P.Match): boolean {
    const record = this.recordOf(match)
    return !!record && !record.declaredBy
  }

  /** Spans for a JSX token's names:  tag names (`<div`, `</div>`) as `type`s, attribute names as `property`s. */
  private jsxSpans(token: P.JSXToken): LSP.HighlightSpan[] {
    if (token instanceof P.JSXElementToken) {
      return [{ start: token.start + 1, end: token.start + 1 + token.tagName.length, kind: "type" }]
    }
    if (token instanceof P.JSXEndTagToken) {
      return [{ start: token.start + 2, end: token.start + 2 + token.tagName.length, kind: "type" }]
    }
    if (token instanceof P.JSXAttributeToken) {
      return [{ start: token.start, end: token.start + token.name.length, kind: "property" }]
    }
    return []
  }

  /** `[start, end]` of each line's part of the text from `start` to `end`, leaving out newlines. */
  private splitByLine(file: SP.SpellFile, start: number, end: number): Array<[number, number]> {
    const lineStarts = this.lineStarts(file)
    const pieces: Array<[number, number]> = []
    let line = this.positionAt(file, start).line
    for (let from = start; from < end; line++) {
      const nextLineStart = lineStarts[line + 1]
      const to = nextLineStart === undefined ? end : Math.min(end, nextLineStart - 1)
      if (to > from) pieces.push([from, to])
      if (nextLineStart === undefined) break
      from = nextLineStart
    }
    return pieces
  }

  ////////////////
  // ## Hover
  ////////////////

  /**
   * What to show when hovering over `position`:
   * - the rule that matched there, its syntax and an example from its tests
   * - what the word refers to and where that was declared, e.g. a variable's kind and output name
   * - the javascript its statement compiles to
   * - TODO: tune for who's reading.  The rule + javascript sections are for parser developers, and for a method
   *   call the rule's syntax repeats `describeSubject()`'s.  Idea:  a `spell.hover` setting, read like
   *   `compileOnSave` -- `"simple"` shows only `describeSubject()`, in plain words;  `"full"` is today's.
   *   Or show a rule's `description` (none set yet) instead of its raw syntax.
   */
  hover(file: SP.SpellFile, position: Position): Hover | null {
    const stack = this.matchesAt(file, position)
    const offset = this.offsetAt(file, position)
    const described = [...stack]
      .reverse()
      .find((match) => match.rule.name && match.start !== undefined && match.start <= offset && offset <= match.end!)
    if (!described || described === file.match) return null
    const subject = this.subjectIn(file, stack, offset)
    const statement = [...stack].reverse().find((match) => match.data.statement instanceof P.Match)?.data.statement as
      | P.Match
      | undefined

    const sections = [
      this.describeRule(described.data.statement instanceof P.Match ? described.data.statement : described)
    ]
    if (subject) sections.push(this.describeSubject(subject))
    const compiled = statement && SpellLanguageService.compileQuietly(statement)
    if (compiled) sections.push(["```js", SpellLanguageService.truncateLines(compiled, 20), "```"].join("\n"))
    const range = subject ? this.rangeOf(file, subject.nameMatch) : this.rangeOf(file, described)
    return { contents: { kind: MarkupKind.Markdown, value: sections.join("\n\n---\n\n") }, range }
  }

  /** Markdown for `match`'s rule:  its name, syntax, and the first example from its tests. */
  private describeRule(match: P.Match): string {
    const { rule } = match
    const syntax = SpellLanguageService.truncate(rule.toRulexSyntax(), 160)
    const lines = [syntax ? `**${rule.name}** \`${syntax}\`` : `**${rule.name}**`]
    const example = SpellLanguageService.firstExample(rule)
    if (example) lines.push(`e.g. \`${example}\``)
    return lines.join("  \n")
  }

  /** Markdown for what `subject` is, and where it was declared. */
  private describeSubject(subject: LSP.SpellSubject): string {
    const lines: string[] = []
    if (subject.kind === "variable") {
      const { name, output, kind, datatype, isAlias } = subject.record
      const bits = [`variable **${name}**`]
      if (output && output !== name) bits.push(`as \`${output}\``)
      if (kind) bits.push(kind)
      if (datatype) bits.push(`a ${datatype}`)
      if (isAlias) bits.push("alias")
      lines.push(bits.join(" · "))
    } else if (subject.kind === "type") {
      const { name, superType, stub, classVariables } = subject.record
      lines.push(`type **${name}**${superType ? ` is a ${superType}` : ""}${stub ? " (stub)" : ""}`)
      const properties = SpellLanguageService.propertiesOf(subject.record).map((it) =>
        SpellLanguageService.asWritten(it.name)
      )
      if (properties.length) lines.push(`properties:  ${properties.join(", ")}`)
      const enumerations = classVariables.get().map((variable) => variable.name)
      if (enumerations.length) lines.push(`enumerations:  ${enumerations.join(", ")}`)
    } else if (subject.kind === "constant") {
      lines.push(`constant **${subject.record.name}** as \`${subject.record.output}\``)
    } else if (subject.kind === "method") {
      const declaration =
        subject.record.declaredBy && subject.record.declaredBy.rule.getDeclaration(subject.record.declaredBy)
      lines.push(`${declaration?.kind ?? "method"} **${declaration?.name ?? subject.record.name}**`)
      const { syntax } = subject.record.definition
      if (syntax) lines.push(`matches \`${[syntax].flat().join("` or `")}\``)
      if (declaration?.detail) lines.push(`compiles to \`${declaration.detail}\``)
    } else {
      const { record, owner } = subject
      const type = record?.scope instanceof P.TypeScope ? record.scope : owner
      const bits = [`property **${SpellLanguageService.asWritten(subject.name)}**${type ? ` of ${type.name}` : ""}`]
      if (record?.datatype) bits.push(`a ${record.datatype}`)
      lines.push(bits.join(" · "))
    }
    const declared = this.declarationsOf(subject)
      .map((it) => this.linkTo(it))
      .join(", ")
    if (declared) lines.push(`declared in ${declared}`)
    return lines.join("  \n")
  }

  /** Markdown link to `match` in `file`, as `File.spell:12`. */
  private linkTo({ file, match }: LSP.FileMatch): string {
    const line = match.start === undefined ? 1 : this.positionAt(file, match.start).line + 1
    return `[${file.file}:${line}](${this.workspace.uriFor(file)}#L${line})`
  }

  ////////////////
  // ## Navigation
  ////////////////

  /** Where the thing at `position` was declared -- several places for a property declared on several types. */
  definition(file: SP.SpellFile, position: Position): Location[] {
    const subject = this.subjectAt(file, position)
    return subject ? this.declarationsOf(subject).map((it) => this.locationOf(it)) : []
  }

  /**
   * Where the TYPE of the variable or property at `position` was declared -- see `typeOfVariable()`.
   */
  typeDefinition(file: SP.SpellFile, position: Position): Location[] {
    const subject = this.subjectAt(file, position)
    if (subject?.kind !== "variable" && subject?.kind !== "property") return []
    const type = subject.record && this.typeOfVariable(subject.record, subject.nameMatch.scope)
    if (!type) return []
    return this.declarationsOf({ kind: "type", record: type, nameMatch: subject.nameMatch }).map((it) =>
      this.locationOf(it)
    )
  }

  /**
   * Everywhere in the project the thing at `position` is used, and where it was declared if `includeDeclaration`.
   * - Variables, types and constants by the scope record each word resolved to while parsing -- exact.
   * - Methods by the rule a call matched.
   * - Properties by NAME:  a `suit` of one type and a `suit` of another are both found.
   */
  references(file: SP.SpellFile, position: Position, includeDeclaration = true): Location[] {
    const subject = this.subjectAt(file, position)
    if (!subject) return []
    return this.occurrencesOf(subject, includeDeclaration).map((it) => this.locationOf(it))
  }

  /** Other uses in `file` of the thing at `position`:  its declaration as `Write`, the rest as `Read`. */
  documentHighlights(file: SP.SpellFile, position: Position): DocumentHighlight[] {
    const subject = this.subjectAt(file, position)
    if (!subject) return []
    const declarations = new Set(this.declarationsOf(subject).map(({ match }) => match))
    return this.occurrencesOf(subject, true).flatMap(({ file: at, match }) => {
      const range = at === file ? this.rangeOf(file, match) : undefined
      if (!range) return []
      return [{ range, kind: declarations.has(match) ? DocumentHighlightKind.Write : DocumentHighlightKind.Read }]
    })
  }

  /**
   * Range and current name of what `position` would rename, or `null` if it can't be renamed.
   * - Only variables, types and constants -- NOT `it`, nor an alias like `its` for `this`.
   * - Only if every use of it is that one word, e.g. NOT a type written as both `card` and `cards`.
   */
  prepareRename(file: SP.SpellFile, position: Position): { range: Range; placeholder: string } | null {
    const subject = this.subjectAt(file, position)
    const occurrences = subject && this.renamable(subject)
    const range = occurrences && subject && this.rangeOf(file, subject.nameMatch)
    return range ? { range, placeholder: subject!.nameMatch.raw! } : null
  }

  /** Edits renaming the thing at `position` to `newName` wherever it's used, in every file -- see `prepareRename()`. */
  rename(file: SP.SpellFile, position: Position, newName: string): WorkspaceEdit | null {
    if (!SpellLanguageService.RENAMABLE_WORD.test(newName)) return null
    const subject = this.subjectAt(file, position)
    const occurrences = subject && this.renamable(subject)
    if (!occurrences) return null
    const changes: Record<string, TextEdit[]> = {}
    for (const { file: at, match } of occurrences) {
      const range = this.rangeOf(at, match)
      if (range) (changes[this.workspace.uriFor(at)] ??= []).push({ range, newText: newName })
    }
    return { changes }
  }

  /** A word a rename can produce:  what `identifier` / `type` / `constant` rules match. */
  static RENAMABLE_WORD = /^[A-Za-z][\w-]*$/

  /** Every occurrence of `subject`, declaration included, if they can ALL be renamed -- see `prepareRename()`. */
  private renamable(subject: LSP.SpellSubject): LSP.FileMatch[] | undefined {
    if (subject.kind === "method" || subject.kind === "property") return undefined
    if (subject.kind === "variable" && (subject.record.isAlias || subject.record.name === "it")) return undefined
    const word = subject.nameMatch.raw
    const occurrences = this.occurrencesOf(subject, true)
    const allSame = occurrences.every(({ match }) => match.tokens.length === 1 && match.raw === word)
    return allSame ? occurrences : undefined
  }

  /**
   * What's at `position` that was declared somewhere -- see `subjectIn()`.
   * - `undefined` for keywords, literals, and names nothing declared.
   */
  subjectAt(file: SP.SpellFile, position: Position): LSP.SpellSubject | undefined {
    return this.subjectIn(file, this.matchesAt(file, position), this.offsetAt(file, position))
  }

  /**
   * Innermost thing in `stack` (outermost first) that was declared somewhere:
   * - a word resolved to a scope record while parsing:  `data.scopeVar` / `scopeType` / `scopeConstant`
   * - a property name
   * - a call to a method the project defines
   * - the name in a declaration itself, e.g. `card` in `a card is a thing`, if `offset` is on it
   */
  private subjectIn(file: SP.SpellFile, stack: P.Match[], offset: number): LSP.SpellSubject | undefined {
    const generated = this.generatedRules(file.project)
    for (let index = stack.length - 1; index >= 0; index--) {
      const match = stack[index]!
      const record = match.rule.highlightAs ? this.recordOf(match) : undefined
      if (record instanceof P.ScopeVariable) return { kind: "variable", record, nameMatch: match }
      if (record instanceof P.TypeScope) return { kind: "type", record, nameMatch: match }
      if (record instanceof P.ScopeConstant) return { kind: "constant", record, nameMatch: match }
      if (match.rule.highlightAs === "property") {
        const owner = this.ownerOf(match, [stack[index - 1], stack[index - 2]])
        return this.propertySubject(match, owner)
      }
      const scopeRule = generated.get(match.rule)
      if (scopeRule) return { kind: "method", record: scopeRule, nameMatch: match }

      const declaration = match.rule.getDeclaration(match)
      const { nameMatch } = declaration ?? {}
      if (!declaration || !nameMatch || nameMatch.start === undefined) continue
      if (offset < nameMatch.start || offset > nameMatch.end!) continue
      const subject = this.subjectDeclaredBy(match, declaration, generated)
      if (subject) return subject
    }
    return undefined
  }

  /** What `statement` declares as `declaration`, as a subject named where it's declared. */
  private subjectDeclaredBy(
    statement: P.Match,
    declaration: P.Declaration,
    generated: Map<P.Rule, P.ScopeRule>
  ): LSP.SpellSubject | undefined {
    const nameMatch = this.nameLeaf(declaration)
    const { scope } = statement
    if (declaration.kind === "variable") {
      const record = SpellLanguageService.visible(scope.variables).find((it) => it.declaredBy === statement)
      return record && { kind: "variable", record, nameMatch }
    }
    if (declaration.kind === "type") {
      const record = SpellLanguageService.visible(scope.types).find((it) => it.declaredBy === statement)
      return record && { kind: "type", record, nameMatch }
    }
    if (declaration.kind === "method" || declaration.kind === "function") {
      const record = [...generated.values()].find((it) => it.declaredBy === statement)
      return record && { kind: "method", record, nameMatch }
    }
    if (declaration.kind === "property") {
      return this.propertySubject(nameMatch, declaration.of ? scope.types?.get(declaration.of) : undefined)
    }
    return undefined
  }

  /** Subject for property `nameMatch`, used on `owner` if known -- with its record, if `owner` has one. */
  private propertySubject(nameMatch: P.Match, owner: P.TypeScope | undefined): LSP.SpellSubject {
    const name = `${nameMatch.value}`
    const record = owner && SpellLanguageService.propertyOf(owner, name)
    return { kind: "property", name, nameMatch, owner, record }
  }

  /**
   * Type the property `property` is used on, from the matches around it (`ancestors`, innermost first):
   * - `its suit` in a method or getter:  the type its `it` stands for
   * - `the color of a card`:  the type named beside it
   * - `the suit of the card`:  the type of the variable beside it, if that's known
   * - `undefined` if nothing says, or the thing beside it has no known type.
   */
  private ownerOf(property: P.Match, ancestors: Array<P.Match | undefined>): P.TypeScope | undefined {
    for (const ancestor of ancestors) {
      if (!ancestor) continue
      const { itVar } = ancestor.data as { itVar?: unknown }
      if (itVar instanceof P.ScopeVariable) return this.typeOfVariable(itVar, property.scope)
      for (const child of ancestor.matched) {
        if (!(child instanceof P.Match) || child === property) continue
        const record = this.recordOf(child)
        if (record instanceof P.TypeScope) return record
        if (record instanceof P.ScopeVariable) return this.typeOfVariable(record, property.scope)
      }
    }
    return undefined
  }

  /**
   * Type of `variable`, looked up in `scope`:  its `datatype`, else the type a method's `it` / `this` stands for,
   * e.g. `card` in `to turn (a card) over`.
   */
  private typeOfVariable(variable: P.ScopeVariable, scope: P.Scope): P.TypeScope | undefined {
    const { datatype, output } = variable
    const methodScope = variable.scope instanceof P.MethodScope ? variable.scope : undefined
    const typeName = datatype ?? (output === "this" ? methodScope?.thisVar : undefined)
    return typeName ? scope.types?.get(typeName) : undefined
  }

  /**
   * Where `subject` was declared, as the match naming it there:
   * - a scope record:  the name in its `declaredBy` statement, e.g. `className` in `set className to ...`,
   *   or an argument's name in its method's signature
   * - a property:  its record's declaration, or if we can't tell which type it's on,
   *   every statement declaring a property of that name, in any file
   * - nothing for built-ins, e.g. the `thing` type
   */
  declarationsOf(subject: LSP.SpellSubject): LSP.FileMatch[] {
    if (subject.kind === "property" && subject.record) {
      const { declaredBy } = subject.record
      const file = declaredBy && this.fileOf(declaredBy)
      const declaration = declaredBy?.rule.getDeclaration(declaredBy)
      return file && declaration ? [{ file, match: this.nameLeaf(declaration) }] : []
    }
    if (subject.kind === "property") {
      const name = SpellLanguageService.propertyKey(subject.name)
      return this.allDeclarations(subject.nameMatch).flatMap(({ file, declaration }) => {
        if (declaration.kind !== "property" || SpellLanguageService.propertyKey(declaration.name) !== name) return []
        return [{ file, match: this.nameLeaf(declaration) }]
      })
    }
    const { declaredBy, name } = subject.record
    const file = declaredBy && this.fileOf(declaredBy)
    if (!declaredBy || !file) return []
    const declaration = declaredBy.rule.getDeclaration(declaredBy)
    if (declaration && (subject.kind === "method" || SpellLanguageService.sameName(declaration.name, name))) {
      return [{ file, match: subject.kind === "method" ? declaration.nameMatch : this.nameLeaf(declaration) }]
    }
    // e.g. an argument, declared inside its method's signature
    let named: P.Match | undefined
    this.walk(declaredBy, (match) => {
      if (!named && match.rule.highlightAs && SpellLanguageService.sameName(`${match.raw}`, name)) named = match
    })
    return [{ file, match: named ?? declaredBy }]
  }

  /** Every use of `subject` in its project, and its declarations if `includeDeclaration` -- see `references()`. */
  private occurrencesOf(subject: LSP.SpellSubject, includeDeclaration: boolean): LSP.FileMatch[] {
    const project = this.fileOf(subject.nameMatch)?.project
    if (!project) return []
    const occurrences: LSP.FileMatch[] = includeDeclaration ? this.declarationsOf(subject) : []
    const seen = new Set(occurrences.map(({ match }) => match))
    for (const file of this.workspace.spellFiles(project)) {
      if (!file.match) continue
      const parents = new Map<P.Match, P.Match | undefined>()
      this.walk(file.match, (match, parent) => {
        parents.set(match, parent)
        if (seen.has(match)) return
        const isUse =
          subject.kind === "property"
            ? this.isPropertyUse(subject, match, [parent, parent && parents.get(parent)])
            : isOccurrence(match)
        if (!isUse) return
        seen.add(match)
        occurrences.push({ file, match })
      })
    }
    return occurrences

    /** Is `match` a use of `subject`, which isn't a property? */
    function isOccurrence(match: P.Match): boolean {
      if (subject.kind === "method") return !!subject.record.instances?.includes(match.rule)
      if (!match.rule.highlightAs) return false
      const { scopeVar, scopeType, scopeConstant } = match.data as Record<string, unknown>
      return (scopeVar ?? scopeType ?? scopeConstant) === (subject as { record?: unknown }).record
    }
  }

  /**
   * Is `match` a use of property `subject`?  It must have the same name, and then:
   * - if we know `subject`'s type and `match`'s owner, the owner must be that type or a sub-type,
   *   e.g. NOT `its name` in a method on a pile, for a card's `name`
   * - otherwise we can't tell, so yes
   */
  private isPropertyUse(
    subject: Extract<LSP.SpellSubject, { kind: "property" }>,
    match: P.Match,
    ancestors: Array<P.Match | undefined>
  ): boolean {
    if (match.rule.highlightAs !== "property") return false
    if (!SpellLanguageService.sameName(`${match.value}`, subject.name)) return false
    const type = subject.record?.scope
    if (!(type instanceof P.TypeScope)) return true
    const owner = this.ownerOf(match, ancestors)
    return !owner || SpellLanguageService.isA(owner, type)
  }

  ////////////////
  // ## Custom requests
  ////////////////

  /** `spell/compiled`:  the javascript `file` compiles to, or a comment saying why it can't. */
  compiled(file: SP.SpellFile): string {
    if (!file.match) return `// ${file.file} hasn't been parsed`
    return SpellLanguageService.compileQuietly(file.match) ?? `// ${file.file} couldn't be compiled`
  }

  /** `spell/project`:  `file`'s project's spell files in parse order, with their error counts. */
  projectInfo(file: SP.SpellFile): LSP.ProjectInfo {
    const { project } = file
    return {
      project: project.projectId,
      files: this.workspace.spellFiles(project).map((it) => ({
        uri: this.workspace.uriFor(it),
        file: it.file ?? it.path,
        errors: (it.match && SP.getParseErrors(it.match)?.length) ?? 0
      })),
      problem: this.workspace.problems.get(project)
    }
  }

  ////////////////
  // ## Completion
  ////////////////

  /**
   * What could be typed at `position`:
   * - names visible there:  variables declared before it, types, constants
   * - at the start of a statement:  the first words of every kind of statement (`to`, `if`, `set`...),
   *   and calls to the project's own methods, as snippets
   * - mid-statement:  calls to methods usable as expressions
   * - NOTE: not what can follow the words typed so far -- see `expectedNext()`.
   */
  completion(file: SP.SpellFile, position: Position): CompletionItem[] {
    if (!file.match) return []
    const offset = this.offsetAt(file, position)
    const text = file.parseText
    const lineText = text.slice(text.lastIndexOf("\n", offset - 1) + 1, offset)
    const atStatementStart = /^\s*[\w-]*$/.test(lineText)
    const scope = this.deepestMatchesAt(file.match, offset).at(-1)!.scope
    const isLater = (declaredBy: P.Match | undefined) =>
      !!declaredBy && this.fileOf(declaredBy) === file && declaredBy.start! > offset

    const items: CompletionItem[] = []
    for (const variable of SpellLanguageService.visible(scope.variables)) {
      if (isLater(variable.declaredBy)) continue
      const { name, kind, output } = variable
      const detail = [kind ?? "variable", output && output !== name ? `as ${output}` : ""].filter(Boolean).join(" ")
      items.push({ label: SpellLanguageService.asWritten(name), kind: CompletionItemKind.Variable, detail })
    }
    for (const type of SpellLanguageService.visible(scope.types)) {
      if (isLater(type.declaredBy)) continue
      const label = SpellLanguageService.asWritten(type.instanceName)
      items.push({ label, kind: CompletionItemKind.Class, detail: `type ${type.name}` })
    }
    for (const constant of SpellLanguageService.visible(scope.constants)) {
      if (isLater(constant.declaredBy)) continue
      items.push({ label: constant.name, kind: CompletionItemKind.EnumMember, detail: "constant" })
    }
    const alias = atStatementStart ? "statement" : "expression"
    for (const scopeRule of SpellLanguageService.visible(scope.rules)) {
      if (isLater(scopeRule.declaredBy) || ![scopeRule.definition.alias].flat().includes(alias)) continue
      const item = this.methodCompletion(scopeRule)
      if (item) items.push(item)
    }
    if (atStatementStart && scope.parser) {
      for (const word of this.statementWords(scope.parser, file.project)) {
        items.push({ label: word, kind: CompletionItemKind.Keyword, detail: "statement" })
      }
    }
    return items
  }

  /**
   * Snippet calling the method `scopeRule` matches, e.g. `turn ${1:card} face up` for `to turn (a card) face up`.
   * - Placeholders are named for the signature's arguments, in order.
   */
  private methodCompletion(scopeRule: P.ScopeRule): CompletionItem | undefined {
    const { declaredBy, definition } = scopeRule
    const syntax = [definition.syntax].flat()[0]
    const declaration = declaredBy?.rule.getDeclaration(declaredBy)
    if (!syntax || !declaration) return undefined
    const argNames = [...declaration.name.matchAll(/\(([^)]*)\)/g)].map(([, arg]) =>
      arg!
        .replace(/^(a|an|the)\s+/i, "")
        .replace(/\s+as\s+.*$/, "")
        .trim()
    )
    let argIndex = 0
    const snippet = syntax
      .split(/\s+/)
      .map((bit) => {
        const arg = /^\{(?:(\w+):)?(\w+)\}\??$/.exec(bit)
        if (arg) return `\${${argIndex + 1}:${argNames[argIndex++] ?? arg[1] ?? arg[2]}}`
        const choice = /^\(([^|)]+)\|.*\)\??$/.exec(bit)
        return (choice ? choice[1]! : bit.replace(/\?$/, "")).replace(/\\(.)/g, "$1").replace(/[$}\\]/g, "\\$&")
      })
      .join(" ")
    return {
      label: declaration.name,
      kind: declaration.kind === "method" ? CompletionItemKind.Method : CompletionItemKind.Function,
      detail: declaration.detail,
      insertText: snippet,
      insertTextFormat: InsertTextFormat.Snippet
    }
  }

  /**
   * Words a statement can start with, e.g. `to`, `if`, `set`, `repeat` -- from each `statement` rule's syntax.
   * - Leaves out the project's own methods:  `methodCompletion()` offers those as snippets.
   */
  private statementWords(parser: P.Parser, project: SP.SpellProject): string[] {
    const generated = this.generatedRules(project)
    const statements = parser.rules.statement
    const rules = statements instanceof P.Choice ? statements.rules : statements ? [statements] : []
    const words = new Set<string>()
    for (const rule of rules) {
      if (generated.has(rule)) continue
      for (const word of SpellLanguageService.firstWords(rule, parser, new Set())) words.add(word)
    }
    return [...words].sort()
  }

  ////////////////
  // ## Formatting
  ////////////////

  /** Spacing around spell's punctuation -- see `P.TokenFormatter`. */
  static FORMAT_SPACING = {
    spaceAfter: [",", ":"],
    noSpaceBefore: [",", ":", ")", "]"],
    noSpaceAfter: ["(", "["]
  }

  /**
   * Edits formatting `file`, or just the lines overlapping `range` -- whitespace ONLY, see `P.TokenFormatter`:
   * - one TAB per level, ALWAYS -- spell indents with tabs, whatever the editor's `insertSpaces` says
   * - one space between words;  one after `,` and `:`, none before them or just inside brackets,
   *   and none at the end of a line
   * - at most 2 blank lines in a row;  comments, strings and JSX left as written
   * - `trimFinalNewlines` / `insertFinalNewline` if `options` ask, as VS Code settings of those names do
   * - One edit per changed line, so the editor keeps the cursor in place.  None if it can't format safely.
   */
  formatting(file: SP.SpellFile, options: FormattingOptions, range?: Range): TextEdit[] {
    const text = file.contents ?? ""
    if (!text.trim()) return []
    const formatter = new P.TokenFormatter({
      tokenizer: SP.spellParser.tokenizer,
      indent: "\t",
      trimFinalBlankLines: !range && !!options.trimFinalNewlines,
      ...SpellLanguageService.FORMAT_SPACING
    })
    const lines = formatter.formatLines(text)
    if (!lines) return []
    const from = range ? this.offsetAt(file, range.start) : 0
    const to = range ? this.offsetAt(file, range.end) : text.length
    const edits: TextEdit[] = []
    for (const { start, end, next, text: formatted } of lines) {
      if (start > to || next <= from) continue
      if (formatted === undefined) edits.push(this.editFor(file, start, next, ""))
      else if (formatted !== text.slice(start, end)) edits.push(this.editFor(file, start, end, formatted))
    }
    if (!range && options.insertFinalNewline && !text.endsWith("\n")) {
      edits.push(this.editFor(file, text.length, text.length, "\n"))
    }
    return edits
  }

  /** Edit replacing `file`'s text from offset `start` to `end` with `newText`. */
  private editFor(file: SP.SpellFile, start: number, end: number, newText: string): TextEdit {
    return { range: { start: this.positionAt(file, start), end: this.positionAt(file, end) }, newText }
  }

  ////////////////
  // ## Stubs
  ////////////////

  /**
   * STUB:  what can follow the words typed so far on the line at `position`, e.g. `to` after `set x`.
   * - Needs a parser-level `rule.expectedAfter(tokens)`:  `Sequence.test()`'s walk, returning the literals
   *   (and `{subrule}`s) that could come next instead of yes / no -- see `PARSING.md`.
   * - Until then `completion()` offers names and statement starts, not what fits the statement being typed.
   */
  expectedNext(_file: SP.SpellFile, _position: Position): null {
    return null
  }

  /**
   * STUB:  the syntax of the method call being typed at `position`, with the current argument highlighted.
   * - Needs `rule.expectedAfter(tokens)` too -- see `expectedNext()` -- to tell WHICH method's syntax the
   *   words so far are heading into, and how far along it they are.
   */
  signatureHelp(_file: SP.SpellFile, _position: Position): null {
    return null
  }

  /**
   * STUB:  quick fixes for `range`, e.g. "define `to <phrase>`" on a line that didn't parse.
   * - Could be built now from `SP.getParseErrors()`:  a `parse_error` line's words become a method signature.
   *   Left for later to keep the first release small.
   */
  codeActions(_file: SP.SpellFile, _range: Range): null {
    return null
  }

  /**
   * STUB:  "N references" above each declaration.
   * - Cheap now that `references()` exists:  one per `documentSymbols()` entry.  Left out to keep the first
   *   release small, and because counting walks every file of the project for each lens.
   */
  codeLens(_file: SP.SpellFile): null {
    return null
  }

  /**
   * STUB:  semantic tokens changed since `previousResultId`, rather than all of them.
   * - Needs result ids, and a diff of the `highlightSpans()` sent last time.  `semanticTokens()` for a whole
   *   file is fast enough without it:  one walk of the match tree.
   */
  semanticTokensDelta(_file: SP.SpellFile, _previousResultId: string): null {
    return null
  }

  ////////////////
  // ## Project lookups
  ////////////////

  /** Spell file `match` is in, by its `FileScope`'s path. */
  fileOf(match: P.Match): SP.SpellFile | undefined {
    const path = match.getScopeOfType(P.FileScope)?.path
    if (!path) return undefined
    for (const project of this.workspace.projects) {
      const file = this.workspace.spellFiles(project).find((it) => it.path === path)
      if (file) return file
    }
    return undefined
  }

  /** Every rule `project`'s files generated while parsing, e.g. a method's call-site rule, to the record of it. */
  generatedRules(project: SP.SpellProject): Map<P.Rule, P.ScopeRule> {
    const generated = new Map<P.Rule, P.ScopeRule>()
    for (const scopeRule of SpellLanguageService.visible(project.scope?.rules)) {
      for (const rule of scopeRule.instances ?? []) generated.set(rule, scopeRule)
    }
    return generated
  }

  /** What every statement in the project of `match` declares, in file order. */
  private allDeclarations(match: P.Match): Array<{ file: SP.SpellFile; declaration: P.Declaration }> {
    const project = this.fileOf(match)?.project
    if (!project) return []
    const declarations: Array<{ file: SP.SpellFile; declaration: P.Declaration }> = []
    for (const file of this.workspace.spellFiles(project)) {
      if (!file.match) continue
      this.walk(file.match, (item) => {
        const declaration = item.rule.getDeclaration(item)
        if (declaration) declarations.push({ file, declaration })
      })
    }
    return declarations
  }

  /**
   * Scope record `match` resolved to while parsing, if any -- see `SpellIdentifier` / `SpellType` / `SpellConstant`.
   * - NEVER looked up again now:  scope has moved on since.
   */
  private recordOf(match: P.Match): P.ScopeVariable | P.TypeScope | P.ScopeConstant | undefined {
    const { scopeVar, scopeType, scopeConstant } = match.data as Record<string, unknown>
    const record = scopeVar ?? scopeType ?? scopeConstant
    const isRecord =
      record instanceof P.ScopeVariable || record instanceof P.TypeScope || record instanceof P.ScopeConstant
    return isRecord ? record : undefined
  }

  /**
   * Single-word match naming what `declaration` declares, e.g. `deck` in `set the deck to ...`.
   * - A method's whole signature, which IS its name.
   */
  private nameLeaf(declaration: P.Declaration): P.Match {
    const { nameMatch, kind } = declaration
    if (kind === "method" || kind === "function") return nameMatch
    let leaf: P.Match | undefined
    this.walk(nameMatch, (match) => {
      const colour = match.rule.highlightAs
      if (!leaf && colour && colour !== "keyword" && colour !== "operator") leaf = match
    })
    return leaf ?? nameMatch
  }

  /** `Location` of `match` in `file`, for the editor. */
  private locationOf({ file, match }: LSP.FileMatch): Location {
    const range = this.rangeOf(file, match) ?? { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } }
    return { uri: this.workspace.uriFor(file), range }
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

  /**
   * Call `visit` for `match` and every match below it, parents first -- see `childMatches()`.
   * - `parent` is the match `visit`'s match was found under.
   */
  private walk(
    match: P.Match,
    visit: (match: P.Match, parent: P.Match | undefined) => void,
    parent?: P.Match,
    seen = new Set<P.Match>()
  ) {
    if (seen.has(match)) return
    seen.add(match)
    visit(match, parent)
    for (const child of this.childMatches(match)) this.walk(child, visit, match, seen)
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

  /**
   * Items of `list` and the lists it falls back to, innermost first -- each key once, as `list.get(key)` would find it.
   * - e.g. every variable visible in a method body:  its own, its file's, its project's.
   */
  static visible<T>(list: P.ScopeList<T, any> | undefined): T[] {
    const seen = new Set<string | undefined>()
    const items: T[] = []
    for (let at: P.ScopeList<T, any> | undefined = list; at; at = at.parent) {
      for (const item of at.get()) {
        const key = at.getKeyFor(item)
        if (seen.has(key)) continue
        seen.add(key)
        items.push(item)
      }
    }
    return items
  }

  /**
   * Words `rule` can start with:  its leading literals, through sequences, choices and repeats.
   * - Follows a `{subrule}` only to a single rule, NOT a category like `{expression}`, which could start with anything.
   */
  static firstWords(rule: P.Rule, parser: P.Parser, visited: Set<P.Rule>): string[] {
    if (visited.has(rule)) return []
    visited.add(rule)
    let words: string[] = []
    if (rule instanceof P.Literal) words = [rule.literal].flat()
    else if (rule instanceof P.Literals) {
      for (const { literal, optional } of rule.literals) {
        words.push(...[literal].flat())
        if (!optional) break
      }
    } else if (rule instanceof P.Sequence) {
      for (const child of rule.rules) {
        words.push(...SpellLanguageService.firstWords(child, parser, visited))
        if (!child.optional) break
      }
    } else if (rule instanceof P.Choice) {
      words = rule.rules.flatMap((child) => SpellLanguageService.firstWords(child, parser, visited))
    } else if (rule instanceof P.Repeat) {
      words = SpellLanguageService.firstWords(rule.rule, parser, visited)
    } else if (rule instanceof P.Subrule) {
      const target = parser.rules[rule.rule]
      if (target && !(target instanceof P.Group)) words = SpellLanguageService.firstWords(target, parser, visited)
    }
    return words.filter((word) => /^[a-z][\w-]*$/i.test(word))
  }

  /**
   * Record of property `name` on `type`, or on the nearest super-type declaring it.
   * - `LOCAL_ONLY` at each step:  a type's `variables` fall back to its parent SCOPE's, not its super-type's.
   */
  static propertyOf(type: P.TypeScope, name: string): P.ScopeVariable | undefined {
    for (const ancestor of SpellLanguageService.typeChain(type)) {
      const record = ancestor.variables.get(name, "LOCAL_ONLY")
      if (record) return record
    }
    return undefined
  }

  /** Properties declared on `type` itself -- NOT the enumerations `define_property_has` also files there. */
  static propertiesOf(type: P.TypeScope): P.ScopeVariable[] {
    return type.variables.get().filter((variable) => !("enumeration" in variable))
  }

  /** Is `type` the same as `ancestor`, or a sub-type of it? */
  static isA(type: P.TypeScope, ancestor: P.TypeScope): boolean {
    return SpellLanguageService.typeChain(type).includes(ancestor)
  }

  /** `type`, then its super-type, and so on up -- stopping at one we've seen, in case of a cycle. */
  static typeChain(type: P.TypeScope): P.TypeScope[] {
    const chain: P.TypeScope[] = []
    for (let at: P.TypeScope | undefined = type; at && !chain.includes(at);) {
      chain.push(at)
      at = at.superType ? at.parentScope?.types?.get(at.superType) : undefined
    }
    return chain
  }

  /** Is `token` one an editor should colour:  a word, symbol, number, string or comment -- NOT whitespace? */
  static isColourable(token: P.Token): boolean {
    return (
      token instanceof P.WordToken ||
      token instanceof P.SymbolToken ||
      token instanceof P.NumberToken ||
      token instanceof P.TextToken ||
      token instanceof P.CommentToken
    )
  }

  /** `match` compiled to javascript, or `undefined` if that throws, e.g. for a half-typed statement. */
  static compileQuietly(match: P.Match): string | undefined {
    try {
      const compiled = match.compile()
      return typeof compiled === "string" ? compiled : undefined
    } catch {
      return undefined
    }
  }

  /** Input of the first of `rule`'s tests, e.g. to show as an example of what it matches. */
  static firstExample(rule: P.Rule): string | undefined {
    for (const block of rule.tests ?? []) {
      for (const test of block.tests) {
        const input = Array.isArray(test) ? test[0] : test.input
        const text = [input].flat().join("\n")
        if (text) return SpellLanguageService.truncate(text.split("\n")[0]!, 80)
      }
    }
    return undefined
  }

  /** `text`, cut to `length` characters with `…` if longer. */
  static truncate(text: string, length: number): string {
    return text.length > length ? `${text.slice(0, length - 1)}…` : text
  }

  /** `text`, cut to `count` lines with `…` if longer. */
  static truncateLines(text: string, count: number): string {
    const lines = text.split("\n")
    return lines.length > count ? [...lines.slice(0, count), "…"].join("\n") : text
  }

  /** Do spell names `a` and `b` name the same thing, e.g. `Card` / `card`, `bank-account` / `bank_account`? */
  static sameName(a: string, b: string): boolean {
    return SpellLanguageService.propertyKey(a) === SpellLanguageService.propertyKey(b)
  }

  /**
   * Spell name `name` as it's written in spell, e.g. `all-piles` for variable `all_piles`.
   * - Scope records keep names as they compile, with underscores;  either spelling parses the same.
   */
  static asWritten(name: string): string {
    return name.replace(/_/g, "-")
  }

  /** `name` normalized for comparing:  lower case, dashes as underscores, e.g. `short-suit` => `short_suit`. */
  static propertyKey(name: string): string {
    return name.toLowerCase().replace(/-/g, "_")
  }
}
