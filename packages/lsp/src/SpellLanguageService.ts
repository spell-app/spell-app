import {
  CodeActionKind,
  CompletionItemKind,
  DiagnosticSeverity,
  DocumentHighlightKind,
  FoldingRangeKind,
  InsertTextFormat,
  MarkupKind,
  SemanticTokensBuilder,
  SymbolKind,
  type CodeAction,
  type CodeLens,
  type CompletionItem,
  type Diagnostic,
  type DocumentHighlight,
  type DocumentSymbol,
  type FoldingRange,
  type FormattingOptions,
  type Hover,
  type Location,
  type MarkupContent,
  type ParameterInformation,
  type Position,
  type Range,
  type SelectionRange,
  type SemanticTokens,
  type SemanticTokensDelta,
  type SemanticTokensLegend,
  type SignatureHelp,
  type TextEdit,
  type WorkspaceEdit,
  type WorkspaceSymbol
} from "vscode-languageserver"

import { instanceCase, typeCase } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
import type { LSP } from "$/lsp"

/**
 * Answers editor questions about parsed spell files, in Language Server Protocol shapes -- one method per request.
 * - Works from each file's current `match`, as kept up to date by `SpellProject.updateText()`.
 * - Positions come from match / token OFFSETS in `file.parseText`, turned into line + character here.
 *   NEVER from `token.line` / `ch`:  offsets are what incremental parsing keeps exact.
 * - `character` counts UTF-16 code units, as JS strings do, which is the protocol's default encoding.
 */
export class SpellLanguageService {
  /** How the editor addresses the files we answer about. */
  declare addresses: LSP.FileAddresses
  /** Line-start offsets of each file, with the text they were worked out from. */
  #lineStartsCache = new WeakMap<SP.SpellFile, { text: string; lineStarts: number[] }>()
  /** Whole-file semantic tokens builder per file, remembering what it built last -- see `semanticTokensDelta()`. */
  #tokenBuilders = new WeakMap<SP.SpellFile, SemanticTokensBuilder>()
  /** Docstrings of each file's declarations, by statement -- keyed by the file's `match`, so one per parse. */
  #docsCache = new WeakMap<P.Match, Map<P.Match, SP.DocComment>>()

  constructor(addresses: LSP.FileAddresses) {
    this.addresses = addresses
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
    if (!file.isActive) {
      const message = `Not parsed:  '${file.file}' isn't active in this project's .imports.json`
      return [{ range: top, severity: DiagnosticSeverity.Information, source: "spell", message }]
    }
    const problem = file.project.parseError
    if (problem) {
      const message = `Parser crashed, will try again after the next edit:  ${problem}`
      return [{ range: top, severity: DiagnosticSeverity.Error, source: "spell", message }]
    }
    if (!file.match) return []

    return (SP.Block.getParseErrors(file.match) ?? []).flatMap((error) => {
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

  /** Declarations in every project we've parsed (see `SP.SpellProject.registry`) whose names contain `query`'s characters in order, ignoring case. */
  workspaceSymbols(query: string): WorkspaceSymbol[] {
    const results: WorkspaceSymbol[] = []
    for (const project of SP.SpellProject.registry.values()) {
      for (const file of project.spellFiles) {
        const uri = this.addresses.uriFor(file)
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

  /**
   * Semantic token legend, sent on `initialize`.  Modifier bits:  `declaration` = 1, `defaultLibrary` = 2,
   * then `heading1` = 4 ... `heading4` = 32.
   * - `heading<N>` are ours, for a heading comment with N `#`s -- `##` => `heading2`, and 4 or more => `heading4`.
   *   A modifier is a flag, not a value, so one per level.  The VS Code extension declares them, and shows them bold.
   */
  static TOKEN_LEGEND: SemanticTokensLegend = {
    tokenTypes: SpellLanguageService.HIGHLIGHT_KINDS,
    tokenModifiers: ["declaration", "defaultLibrary", "heading1", "heading2", "heading3", "heading4"]
  }

  /** Deepest heading level with its own `heading<N>` modifier -- deeper ones share it.  See `TOKEN_LEGEND`. */
  static MAX_HEADING = 4

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
    if (range) {
      const builder = new SemanticTokensBuilder()
      this.pushTokens(builder, file, this.offsetAt(file, range.start), this.offsetAt(file, range.end))
      return builder.build()
    }
    const builder = this.tokensBuilderFor(file)
    // NOTE: a builder keeps what was pushed until `previousResult()` starts afresh -- `build()` doesn't.
    // An id that matches nothing starts afresh with nothing to diff against.
    builder.previousResult("")
    this.pushTokens(builder, file)
    return builder.build()
  }

  /**
   * `file`'s semantic tokens as EDITS to what we sent as `previousResultId` -- or all of them, if that isn't the
   * last whole-file result we sent for it, e.g. after a restart.
   * - Diffs the token data, so an edit to one line sends that line's tokens, not the file's.
   */
  semanticTokensDelta(file: SP.SpellFile, previousResultId: string): SemanticTokens | SemanticTokensDelta {
    const builder = this.tokensBuilderFor(file)
    builder.previousResult(previousResultId)
    this.pushTokens(builder, file)
    return builder.canBuildEdits() ? builder.buildEdits() : builder.build()
  }

  /** Builder for `file`'s whole-file tokens:  kept, as it remembers what it built last, for `semanticTokensDelta()`. */
  private tokensBuilderFor(file: SP.SpellFile): SemanticTokensBuilder {
    let builder = this.#tokenBuilders.get(file)
    if (!builder) this.#tokenBuilders.set(file, (builder = new SemanticTokensBuilder()))
    return builder
  }

  /** Push `file`'s tokens from offset `from` up to `to` onto `builder`. */
  private pushTokens(builder: SemanticTokensBuilder, file: SP.SpellFile, from = 0, to = Infinity): void {
    for (const span of this.highlightSpans(file)) {
      if (span.end <= from || span.start >= to) continue
      const kind = SpellLanguageService.HIGHLIGHT_KINDS.indexOf(span.kind)
      const heading = span.heading ? 1 << (1 + Math.min(span.heading, SpellLanguageService.MAX_HEADING)) : 0
      const modifiers = (span.declaration ? 1 : 0) | (span.defaultLibrary ? 2 : 0) | heading
      for (const [start, end] of this.splitByLine(file, span.start, span.end)) {
        const { line, character } = this.positionAt(file, start)
        builder.push(line, character, end - start, kind, modifiers)
      }
    }
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
          defaultLibrary: this.isBuiltIn(match),
          heading:
            item instanceof P.CommentToken && item.commentSymbol.startsWith("#") ? item.commentSymbol.length : undefined
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
    // a paren-free argument's type, e.g. `card` in `to give a card to a pile`:  the whole of it is a parameter
    if (kind === "type" && parent?.rule.highlightAs === "parameter") return "parameter"
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

  /**
   * Markdown for `match`'s rule:  its name, syntax, and the first example from its tests -- then, for a built-in
   * rule which spells a built-in type's member, e.g. `list_shuffle`, that member and its docs.  See
   * `SP.BUILT_IN_TYPE_TABLE`.
   */
  private describeRule(match: P.Match): string {
    const { rule } = match
    const syntax = SpellLanguageService.truncate(rule.toRulexSyntax(), 160)
    const lines = [syntax ? `**${rule.name}** \`${syntax}\`` : `**${rule.name}**`]
    const example = SpellLanguageService.firstExample(rule)
    if (example) lines.push(`e.g. \`${example}\``)
    const members = rule.name ? SP.builtInMembersOfRule(rule.name) : []
    const builtIn = members.map(({ type, member }) =>
      [`built in:  **${member.words}** of ${type.name}`, member.doc].filter(Boolean).join("\n\n")
    )
    return [lines.join("  \n"), ...builtIn].join("\n\n")
  }

  /** Markdown for what `subject` is, and where it was declared. */
  private describeSubject(subject: LSP.SpellSubject): string {
    const lines: string[] = []
    if (subject.kind === "variable") {
      const { name, output, kind, datatype, isAlias } = subject.record
      // what it holds, e.g. `card: Card` for an argument `(a card)`, a loop's item, `it` in a method
      const bits = [`variable **${name}**${datatype ? `: ${datatype}` : ""}`]
      if (output && output !== name) bits.push(`as \`${output}\``)
      if (kind) bits.push(kind)
      if (isAlias) bits.push("alias")
      lines.push(bits.join(" · "))
    } else if (subject.kind === "type") {
      const { name, superType, stub, classVariables } = subject.record
      lines.push(`type **${name}**${superType ? ` is a ${superType}` : ""}${stub ? " (stub)" : ""}`)
      const properties = SpellLanguageService.propertiesOf(subject.record).map((it) =>
        SpellLanguageService.memberWords(it.name, it)
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
      const words = SpellLanguageService.memberWords(subject.name, record)
      const bits = [`property **${words}**${type ? ` of ${type.name}` : ""}`]
      if (record?.datatype) bits.push(`a ${record.datatype}`)
      if (record?.auto) bits.push("declared where it's first set")
      // `the pile of a card`:  from `a pile is an exclusive list of cards`, which "declared in" links to
      if (record?.exclusive)
        bits.push(`the ${record.datatype} holding it, read-only:  ${record.datatype}s are exclusive`)
      lines.push(bits.join(" · "))
    }
    const declared = this.declarationsOf(subject)
      .map((it) => this.linkTo(it))
      .join(", ")
    if (declared) lines.push(`declared in ${declared}`)
    // docstring as its own paragraph, just under the name
    const [title, ...rest] = lines
    const docs = this.docsOf(subject)
    return [title, docs, rest.join("  \n")].filter(Boolean).join("\n\n")
  }

  /**
   * Scope record `subject` described as hover does, with no cursor -- e.g. for `ScopeExplorer`:
   * - `hover`:  all of it, as markdown
   * - `summary`:  just what it is, e.g. `type **Card** is a Thing` -- the hover's first paragraph
   * - `description`:  its docstring, as markdown -- see `docMarkdown()`
   * - `location`:  where it was declared
   * - NOTE: `describeSubject()` only reads `nameMatch` for a property WITHOUT a record, which a `ScopeRecord` can't be.
   */
  describeRecord(subject: LSP.ScopeRecord): {
    hover: string
    summary: string
    description?: string
    location?: Location
  } {
    const full = subject as LSP.SpellSubject
    const [declared] = this.declarationsOf(full)
    const hover = this.describeSubject(full)
    return {
      hover,
      summary: hover.split("\n\n")[0]!,
      description: this.docMarkdownOf(full),
      location: declared && this.locationOf(declared)
    }
  }

  /**
   * Edits making `text` the docstring of what the statement starting on `line` of `file`, from 1, declares -- see
   * `SP.Block.getDocComments()`.  `null` if no declaring statement starts there.
   * - `text` is markdown, as `docMarkdown()` gives:  a `#`, `##` ... line becomes that heading comment,
   *   any other line a `// ` comment -- indented like the statement.  Empty `text` removes the docstring.
   * - Replaces the comment lines above it -- a heading directly above included -- or else the comment at the end
   *   of its line.  With neither, adds lines directly above it.
   */
  descriptionEdits(file: SP.SpellFile, line: number, text: string): TextEdit[] | null {
    const found = file.match && this.declarationStartingOn(file, line)
    if (!found) return null
    const { statement, doc } = found
    const lineStart = { line: this.positionAt(file, statement.start!).line, character: 0 }
    const indent = file.parseText.slice(this.offsetAt(file, lineStart), statement.start).match(/^[ \t]*/)![0]
    const block = SpellLanguageService.commentLines(text, indent)
    const comments = doc?.comments
    if (!comments?.length) return block ? [{ range: { start: lineStart, end: lineStart }, newText: block }] : []
    const first = this.rangeOf(file, comments[0]!)!
    const last = this.rangeOf(file, comments.at(-1)!)!
    // a comment at the end of the statement's own line:  drop it, and its space before
    if (first.start.line === lineStart.line) {
      const before = file.parseText.slice(0, comments[0]!.start).match(/[ \t]*$/)![0].length
      const range = { start: this.positionAt(file, comments[0]!.start! - before), end: last.end }
      return [
        { range, newText: "" },
        ...(block ? [{ range: { start: lineStart, end: lineStart }, newText: block }] : [])
      ]
    }
    // whole comment lines above it
    const range = { start: { line: first.start.line, character: 0 }, end: { line: last.end.line + 1, character: 0 } }
    return [{ range, newText: block }]
  }

  /**
   * Docstring of `file`, as markdown:  the comment lines at its very top, if the first is a `#` heading --
   * e.g. `# Solitaire cards`.  See `docMarkdown()`.
   */
  fileDescription(file: SP.SpellFile): string | undefined {
    const doc = this.fileDocComment(file)
    return doc && SpellLanguageService.docMarkdown(doc)
  }

  /**
   * Edits making `text` the docstring of `file` -- see `fileDescription()`.
   * - Replaces its comment lines at the top, or adds them there.  Empty `text` removes them.
   * - Its first line becomes a `#` heading if it isn't a heading already, or it wouldn't read as the file's.
   */
  fileDescriptionEdits(file: SP.SpellFile, text: string): TextEdit[] {
    const heading = text.trim() && !/^#/.test(text.trimStart()) ? `# ${text.trimStart()}` : text
    const block = SpellLanguageService.commentLines(heading, "")
    const top = { line: 0, character: 0 }
    const doc = this.fileDocComment(file)
    if (!doc) return block ? [{ range: { start: top, end: top }, newText: block }] : []
    const last = this.rangeOf(file, doc.comments.at(-1)!)!
    return [{ range: { start: top, end: { line: last.end.line + 1, character: 0 } }, newText: block }]
  }

  /**
   * Heading comments in `file`, in order, e.g. `## actions` -- NOT those of its docstring, see `fileDescription()`.
   * - Each's `text` without its `#`s.  One with no text, e.g. a `##########` rule, is left out.
   * - Found as `highlightSpans()` colours them, so what reads as a heading in the editor is one here.
   */
  headingsOf(file: SP.SpellFile): Array<{ start: number; level: number; text: string }> {
    const docEnd = this.fileDocComment(file)?.comments.at(-1)?.end ?? -1
    return this.highlightSpans(file)
      .filter((span) => span.heading && span.start >= docEnd)
      .map((span) => ({
        start: span.start,
        level: span.heading!,
        text: file.parseText
          .slice(span.start, span.end)
          .replace(/^\s*#+/, "")
          .trim()
      }))
      .filter((heading) => heading.text)
  }

  /** Comment-only lines at the very top of `file`, if the first is a `#` heading -- see `fileDescription()`. */
  private fileDocComment(file: SP.SpellFile): SP.DocComment | undefined {
    const comments: P.Match[] = []
    for (const item of file.match?.matched ?? []) {
      const only = item instanceof P.Match && item.matched.length === 1 ? item.matched[0] : undefined
      if (!(only instanceof P.Match) || only.tokens.length !== 1 || !(only.tokens[0] instanceof P.CommentToken)) break
      comments.push(only)
    }
    const first = comments[0]?.tokens[0] as P.CommentToken | undefined
    if (first?.commentSymbol !== "#") return undefined
    return { comments, lines: comments.map((comment) => (comment.tokens[0] as P.CommentToken).value) }
  }

  /**
   * Markdown `text` as spell comment lines, each ending in a newline:  a `#`, `##` ... line as that heading
   * comment, any other as a `// ` one, all indented `indent`.  `""` for empty `text`.
   */
  static commentLines(text: string, indent: string): string {
    if (!text.trim()) return ""
    return text
      .trimEnd()
      .split("\n")
      .map((line) => {
        const heading = /^(#+)\s*(.*)$/.exec(line.trim())
        return `${indent}${heading ? `${heading[1]} ${heading[2]}` : `// ${line}`}`.trimEnd() + "\n"
      })
      .join("")
  }

  /**
   * Statement starting on `line` of `file`, from 1, that declares something -- and its docstring if any.
   * - Asks each block for its docstrings, as they're per block -- see `SP.Block.getDocComments()`.
   * - A line holds one statement, so its line is enough to find it.
   */
  private declarationStartingOn(
    file: SP.SpellFile,
    line: number
  ): { statement: P.Match; doc?: SP.DocComment } | undefined {
    let found: { statement: P.Match; doc?: SP.DocComment } | undefined
    this.walk(file.match!, (match) => {
      if (found || !(match.rule instanceof SP.Block)) return
      const docs = match.rule.getDocComments(match)
      for (const blockLine of match.matched) {
        const statement = blockLine instanceof P.Match ? blockLine.data.statement : undefined
        if (
          statement instanceof P.Match &&
          statement.start !== undefined &&
          this.positionAt(file, statement.start).line === line - 1 &&
          statement.rule.getDeclaration(statement)
        ) {
          found = { statement, doc: docs.get(statement) }
        }
      }
    })
    return found
  }

  /**
   * Docstring of what `subject` names:  the comments documenting its declaration -- see `SP.Block.getDocComments()`.
   * - Only if that declaration really names it:  an argument's `declaredBy` is its METHOD, whose docs aren't its own.
   * - Properties only when we know which type they're on.
   */
  docsOf(subject: LSP.SpellSubject): string | undefined {
    const builtIn = SpellLanguageService.builtInDoc(subject)
    if (builtIn) return builtIn
    return subject.record && this.docsOfRecord(subject.record, subject.kind === "method")
  }

  /** Docstring of what `subject` names, as markdown -- see `docMarkdown()`. */
  docMarkdownOf(subject: LSP.SpellSubject): string | undefined {
    const builtIn = SpellLanguageService.builtInDoc(subject)
    if (builtIn) return builtIn
    const doc = subject.record && this.docCommentOfRecord(subject.record, subject.kind === "method")
    return doc && SpellLanguageService.docMarkdown(doc)
  }

  /**
   * Docs of a built-in type's member, e.g. a list's `length` -- from its record, as `SP.BUILT_IN_TYPE_TABLE` gave
   * them:  there's no statement to read them from.
   */
  private static builtInDoc(subject: LSP.SpellSubject): string | undefined {
    const { record } = subject
    return record instanceof P.ScopeVariable && !record.declaredBy ? record.doc : undefined
  }

  /** Docstring of scope record `record`, if its declaration names it -- or always for a method's rule. */
  private docsOfRecord(record: { name: string; declaredBy?: P.Match }, isMethod = false): string | undefined {
    return this.docCommentOfRecord(record, isMethod)?.lines.join("\n")
  }

  /** Doc comment of scope record `record`, if its declaration names it -- or always for a method's rule. */
  private docCommentOfRecord(
    record: { name: string; declaredBy?: P.Match },
    isMethod = false
  ): SP.DocComment | undefined {
    const { declaredBy } = record
    const file = declaredBy && this.fileOf(declaredBy)
    const declaration = declaredBy?.rule.getDeclaration(declaredBy)
    if (!file || !declaration) return undefined
    const isNamed = isMethod || SpellLanguageService.sameName(`${this.nameLeaf(declaration).raw}`, record.name)
    return isNamed ? this.docCommentsIn(file).get(declaredBy) : undefined
  }

  /**
   * `doc` as markdown:  a heading comment as a heading of its level -- `# Cards` => `# Cards` -- the rest as is.
   * - Round-trips through `descriptionEdits()`, which turns each line back into its comment.
   */
  static docMarkdown(doc: SP.DocComment): string {
    return doc.comments
      .map((comment, index) => {
        const { commentSymbol } = comment.tokens[0] as P.CommentToken
        return commentSymbol.startsWith("#") ? `${commentSymbol} ${doc.lines[index]}` : doc.lines[index]
      })
      .join("\n")
  }

  /** `text` as markdown for an editor, e.g. completion `documentation`. */
  private markdown(text: string | undefined): MarkupContent | undefined {
    return text ? { kind: MarkupKind.Markdown, value: text } : undefined
  }

  /** Doc comment of each declaration in `file`, by its statement -- worked out once per parse of `file`. */
  private docCommentsIn(file: SP.SpellFile): Map<P.Match, SP.DocComment> {
    if (!file.match) return new Map()
    let docs = this.#docsCache.get(file.match)
    if (!docs) {
      const found = new Map<P.Match, SP.DocComment>()
      this.walk(file.match, (match) => {
        if (!(match.rule instanceof SP.Block)) return
        for (const [statement, doc] of match.rule.getDocComments(match)) found.set(statement, doc)
      })
      docs = found
      this.#docsCache.set(file.match, docs)
    }
    return docs
  }

  /** Markdown link to `match` in `file`, as `File.spell:12`. */
  private linkTo({ file, match }: LSP.FileMatch): string {
    const line = match.start === undefined ? 1 : this.positionAt(file, match.start).line + 1
    return `[${file.file}:${line}](${this.addresses.uriFor(file)}#L${line})`
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
      if (range) (changes[this.addresses.uriFor(at)] ??= []).push({ range, newText: newName })
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
   * Type of `variable`, looked up in `scope` -- see `P.Scope.getType()`:  its `datatype`, else the type a method's
   * `it` / `this` stands for, e.g. `card` in `to turn (a card) over`.
   */
  private typeOfVariable(variable: P.ScopeVariable, scope: P.Scope): P.TypeScope | undefined {
    const { datatype, output } = variable
    const methodScope = variable.scope instanceof P.MethodScope ? variable.scope : undefined
    return scope.getType(datatype ?? (output === "this" ? methodScope?.thisVar : undefined))
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
    for (const file of project.spellFiles) {
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
      if (subject.kind === "method") return subject.record.instance === SP.SpellStatement.statementRuleOf(match.rule)
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
    return !owner || owner.isA(type)
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
      files: project.spellFiles.map((it) => ({
        uri: this.addresses.uriFor(it),
        file: it.file ?? it.path,
        errors: (it.match && SP.Block.getParseErrors(it.match)?.length) ?? 0
      })),
      problem: project.parseError,
      compiledUri: this.addresses.uriFor(project.outputFile)
    }
  }

  ////////////////
  // ## Completion
  ////////////////

  /**
   * What could be typed at `position`:
   * - mid-statement:  what can come NEXT, if the parser can say -- see `expectedNext()`
   * - otherwise, names visible there:  variables declared before it, types, constants
   * - at the start of a statement:  the first words of every kind of statement (`to`, `if`, `set`...),
   *   and calls to the project's own methods, as snippets
   * - mid-statement, if `expectedNext()` has nothing:  calls to methods usable as expressions
   */
  completion(file: SP.SpellFile, position: Position): CompletionItem[] {
    if (!file.match) return []
    const offset = this.offsetAt(file, position)
    const text = file.parseText
    const lineText = text.slice(text.lastIndexOf("\n", offset - 1) + 1, offset)
    const atStatementStart = /^\s*[\w-]*$/.test(lineText)
    if (!atStatementStart) {
      const expected = this.expectedNext(file, position)
      if (expected.length) return expected
    }
    const scope = this.scopeAt(file, offset)
    const items = [
      ...this.variableItems(file, scope, offset),
      ...this.typeItems(file, scope, offset),
      ...this.constantItems(file, scope, offset),
      ...this.methodItems(file, scope, offset, atStatementStart ? "statement" : "expression")
    ]
    if (atStatementStart && scope.parser) {
      for (const word of this.statementWords(scope.parser, file.project)) {
        items.push({ label: word, kind: CompletionItemKind.Keyword, detail: "statement" })
      }
    }
    return items
  }

  /**
   * What can come NEXT in the statement being typed at `position`, e.g. `to` after `set x` -- `[]` if nothing
   * is typed yet, or the parser can't say.
   * - Parses the line up to the cursor in expecting mode -- see `P.Parser.expectedAfter()`.
   *   A word the cursor is touching is still being typed:  it's what the editor filters by, NOT input.
   * - Each expectation offers:
   *   - partway through a call to one of the project's methods:  the REST of it, as a snippet -- see `methodTail()`
   *   - the names that fit it, by the `highlightAs` of the rules it can start with -- see `firstKinds()`:
   *     `{type}` => types, `{expression}` => variables, constants, methods...
   *   - the words it can start with, e.g. `to`, or `the` / `a` / `its`... for an `{expression}`
   * - What only EXTENDS something complete (`continues`), e.g. an operator after `x`, only if the word being
   *   typed starts it:  `if x a` => `and`, but `if x ` offers no operators.
   * - Ranked by `sortText`:  what's needed before what continues, shallower before deeper, then snippet, names,
   *   words.
   */
  expectedNext(file: SP.SpellFile, position: Position): CompletionItem[] {
    if (!file.match) return []
    const offset = this.offsetAt(file, position)
    const text = file.parseText
    const beforeCursor = text.slice(text.lastIndexOf("\n", offset - 1) + 1, offset)
    const typed = /[\w-]*$/.exec(beforeCursor)![0]
    const input = beforeCursor.slice(0, beforeCursor.length - typed.length).trim()
    const scope = this.scopeAt(file, offset)
    if (!input || !scope.parser) return []

    const items = new Map<string, CompletionItem>()
    for (const expectation of scope.parser.expectedAfter(input, "statement", scope)) {
      // partway through something, not what's next -- see `signatureHelp()`
      if (expectation.within) continue
      const rank = `${expectation.continues ? 1 : 0}${String(expectation.depth).padStart(2, "0")}`
      for (const [order, item] of this.expectedItems(expectation, file, scope, offset)) {
        if (expectation.continues && (!typed || !item.label.startsWith(typed))) continue
        const key = `${item.kind}:${item.label}`
        if (!items.has(key)) items.set(key, { ...item, sortText: `${rank}${order}:${item.label}` })
      }
    }
    return [...items.values()]
  }

  /**
   * Completions for one `expectation`, each with its order within it:  `0` snippet, `1` names, `2` words.
   * - see `expectedNext()`
   */
  private expectedItems(
    { rule, sequence, index }: P.Expectation,
    file: SP.SpellFile,
    scope: P.Scope,
    offset: number
  ): Array<[order: number, item: CompletionItem]> {
    const parser = scope.parser!
    const items: Array<[number, CompletionItem]> = []
    const tail = sequence && index !== undefined ? this.methodTail(file.project, parser, sequence, index) : undefined
    if (tail) items.push([0, tail])
    for (const kind of SpellLanguageService.firstKinds(rule, parser, new Set())) {
      const names =
        kind === "type"
          ? this.typeItems(file, scope, offset)
          : kind === "variable"
            ? this.variableItems(file, scope, offset)
            : kind === "enumMember"
              ? this.constantItems(file, scope, offset)
              : kind === "property"
                ? this.propertyItems(scope)
                : this.methodItems(file, scope, offset, "expression")
      for (const name of names) items.push([1, name])
    }
    // Words from categories too, e.g. `{expression}` => `the`, `a`, `its`... -- NOT `Card` when there's `card`
    const words = new Set(SpellLanguageService.firstWords(rule, parser, new Set(), true))
    for (const word of words) {
      if (word !== word.toLowerCase() && words.has(word.toLowerCase())) continue
      items.push([2, { label: word, kind: CompletionItemKind.Keyword, detail: "next" }])
    }
    return items
  }

  /**
   * The rest of a call to one of `project`'s methods, from child `index` of its call rule `sequence`, as a
   * snippet, e.g. `to ${1:pile}` after `move the card` for `to move (a card) to (a pile)`.
   * - `undefined` if `sequence` isn't a method's call rule.
   * - Leaves out optional parts;  placeholders are named for the method's parameters -- see `slotNames()`.
   */
  private methodTail(
    project: SP.SpellProject,
    parser: P.Parser,
    sequence: P.Sequence,
    index: number
  ): CompletionItem | undefined {
    const scopeRule = this.generatedRules(project).get(sequence)
    const declaration = scopeRule?.declaredBy?.rule.getDeclaration(scopeRule.declaredBy)
    if (!scopeRule || !declaration) return undefined
    const argNames = SpellLanguageService.slotNames(sequence, SpellLanguageService.methodOf(scopeRule))
    let argIndex = sequence.rules.slice(0, index).filter((rule) => rule instanceof P.Subrule).length
    const label: string[] = []
    const snippet: string[] = []
    let placeholder = 0
    for (const rule of sequence.rules.slice(index)) {
      if (rule.optional) continue
      if (rule instanceof P.Subrule) {
        const name = argNames[argIndex++] ?? rule.matchGroup ?? rule.rule
        label.push(`(${name})`)
        snippet.push(`\${${++placeholder}:${name}}`)
      } else {
        const word = SpellLanguageService.firstWords(rule, parser, new Set())[0] ?? rule.toRulexSyntax()
        label.push(word)
        snippet.push(word.replace(/[$}\\]/g, "\\$&"))
      }
    }
    if (!snippet.length) return undefined
    return {
      label: label.join(" "),
      kind: declaration.kind === "method" ? CompletionItemKind.Method : CompletionItemKind.Function,
      detail: declaration.name,
      documentation: this.markdown(this.docsOfRecord(scopeRule, true)),
      insertText: snippet.join(" "),
      insertTextFormat: InsertTextFormat.Snippet
    }
  }

  ////////////////
  // ## Signature help
  ////////////////

  /**
   * The call to one of the project's methods being typed at `position`, e.g. `move (a card) to (a pile)`, with
   * the argument being typed -- or next -- as `activeParameter`.  `null` if not in one.
   * - Parses the line up to the cursor in expecting mode, as `expectedNext()` does, then takes the INNERMOST
   *   method call rule anything was waiting in:  what comes next in it, or what we're partway `within`.
   * - Its arguments are the call rule's `{subrules}`, in order:  the signature's arguments, `(a card)` or paren-free
   *   `a card`, where its `method_signature` found them -- see `argRanges()`.
   */
  signatureHelp(file: SP.SpellFile, position: Position): SignatureHelp | null {
    if (!file.match) return null
    const offset = this.offsetAt(file, position)
    const text = file.parseText
    const input = text.slice(text.lastIndexOf("\n", offset - 1) + 1, offset).trim()
    const scope = this.scopeAt(file, offset)
    if (!input || !scope.parser) return null

    const generated = this.generatedRules(file.project)
    let call: P.Expectation | undefined
    for (const expectation of scope.parser.expectedAfter(input, "statement", scope)) {
      const { sequence, continues, depth } = expectation
      if (continues || !sequence || !generated.has(sequence)) continue
      if (!call || depth > call.depth) call = expectation
    }
    const scopeRule = call && generated.get(call.sequence!)
    const declaration = scopeRule?.declaredBy?.rule.getDeclaration(scopeRule.declaredBy)
    if (!call || !scopeRule || !declaration) return null

    const label = declaration.name
    const parameters: ParameterInformation[] = SpellLanguageService.argRanges(label, declaration.nameMatch).map(
      (range) => ({ label: range })
    )
    // args before `index`:  the one we're in, or the next one after a word like `to`
    const activeParameter = call.sequence!.rules.slice(0, call.index).filter((rule) => rule instanceof P.Subrule).length
    return {
      signatures: [{ label, documentation: this.markdown(this.docsOfRecord(scopeRule, true)), parameters }],
      activeSignature: 0,
      activeParameter: Math.min(activeParameter, Math.max(parameters.length - 1, 0))
    }
  }

  /**
   * Where each argument is in `label`, a method's signature as written, e.g. `[5, 11]` for `a card` in
   * `move a card to a pile` -- in order, as its `method_signature` match (`signature`) found them:  `(a card)` or
   * `a card`.  NOT a `(with ...)` clause:  its call takes it as an optional extra.
   */
  static argRanges(label: string, signature: P.Match | undefined): Array<[number, number]> {
    const args = (signature?.data as { argMatches?: P.Match[] } | undefined)?.argMatches ?? []
    const ranges: Array<[number, number]> = []
    let from = 0
    for (const arg of args) {
      const text = arg.inputText.trim()
      const start = label.indexOf(text, from)
      if (start === -1) continue
      ranges.push([start, start + text.length])
      from = start + text.length
    }
    return ranges
  }

  ////////////////
  // ## Code lens
  ////////////////

  /**
   * Command a code lens runs to show references, with arguments `uri`, `position`, `locations`.
   * - The EDITOR defines it:  `vscode-extension/src/extension.ts`, `SpellLanguageFeatures` in the app.
   */
  static SHOW_REFERENCES = "spell.showReferences"

  /** Kinds of declaration that get a code lens. */
  static LENS_KINDS: P.DeclarationKind[] = ["type", "method", "function"]

  /**
   * An "N references" lens above each type and method `file` declares, on its name.
   * - Unresolved:  no count yet -- `resolveCodeLens()` counts, so an editor only pays for the lenses on screen.
   *   Counting walks every file of the project.
   * - `data` carries what resolving needs:  the file's URI, and the name's position.
   */
  codeLens(file: SP.SpellFile): CodeLens[] {
    if (!file.match) return []
    const uri = this.addresses.uriFor(file)
    const lenses: CodeLens[] = []
    this.walk(file.match, (match) => {
      const declaration = match.rule.getDeclaration(match)
      if (!declaration || !SpellLanguageService.LENS_KINDS.includes(declaration.kind)) return
      const range = this.rangeOf(file, declaration.nameMatch)
      if (range) lenses.push({ range, data: { uri, position: range.start } satisfies CodeLensData })
    })
    return lenses
  }

  /** `lens` from `codeLens()`, with its count:  "3 references", which shows them when clicked. */
  resolveCodeLens(file: SP.SpellFile, lens: CodeLens): CodeLens {
    const { uri, position } = lens.data as CodeLensData
    const locations = this.references(file, position, false)
    const count = locations.length
    return {
      ...lens,
      command: {
        title: `${count} reference${count === 1 ? "" : "s"}`,
        command: SpellLanguageService.SHOW_REFERENCES,
        arguments: [uri, position, locations]
      }
    }
  }

  ////////////////
  // ## Code actions
  ////////////////

  /**
   * Quick fixes for `range` of `file`:  for each WHOLE line in it that didn't parse, "Define `to <phrase>`" --
   * a method whose signature is the line's words, so the line becomes a call to it.
   * - The phrase is the whole line -- or, for words left over after a statement that parsed, that statement AND
   *   its leftovers:  `shuffle the deck 3 times`, where `shuffle the deck` parsed, => `to shuffle a deck (number) times`.
   *   Once defined, the line parses as the new method:  it matches every word, and the longest match wins.
   * - NOT for a line that's just unfinished, e.g. `set x to` -- see `isUnfinished()`.
   * - Goes just above the top-level statement the line is in, as a method is only visible to lines AFTER it.
   * - See `methodSignatureFor()` for how the words become a signature.
   */
  codeActions(file: SP.SpellFile, range: Range): CodeAction[] {
    if (!file.match) return []
    const text = file.parseText
    const from = this.offsetAt(file, range.start)
    const to = this.offsetAt(file, range.end)
    const actions: CodeAction[] = []
    for (const error of SP.Block.getParseErrors(file.match) ?? []) {
      const { start, end } = error
      if (start === undefined || end === undefined || end < from || start > to) continue
      const lineStart = text.lastIndexOf("\n", start - 1) + 1
      const scope = this.scopeAt(file, start)
      // after a statement that parsed, from its start -- else only a WHOLE line
      const before = this.statementBefore(file, start)
      if (!before && text.slice(lineStart, start).trim()) continue
      const phraseStart = before?.start ?? start
      const words = text.slice(phraseStart, end)
      if (this.isUnfinished(words, scope)) continue
      const signature = this.methodSignatureFor(words, scope)
      const at = this.topLevelLineStart(file, start)
      const diagnostic = this.diagnostics(file).find((it) => this.offsetAt(file, it.range.start) === start)
      if (!signature || at === undefined) continue
      const newText = `${signature}:\n\t// TODO\n\n`
      const position = this.positionAt(file, at)
      actions.push({
        title: `Define \`${signature}\``,
        kind: CodeActionKind.QuickFix,
        diagnostics: diagnostic ? [diagnostic] : undefined,
        isPreferred: true,
        edit: { changes: { [this.addresses.uriFor(file)]: [{ range: { start: position, end: position }, newText }] } }
      })
    }
    return actions
  }

  /**
   * Method signature a line of `words` would call, e.g. `shuffle the deck twice` => `to shuffle a deck twice`.
   * - The first word stays a word:  it's the method's name.
   * - After that, the LONGEST run of words that parses as a whole expression in `scope` becomes a parameter:
   *   - a type's name, e.g. `the deck` if there's a type `deck` => `a deck`, paren-free:  a known type after `a`
   *     is a parameter -- see spell's `bare_type_arg`
   *   - a number => `(number)`, text => `(text)`
   *   - otherwise its last word => `(deck)`, numbered if it's already taken -- a type's name too, the second time
   * - `undefined` if there are no words, or `scope` has no parser.
   */
  private methodSignatureFor(words: string, scope: P.Scope): string | undefined {
    const parser = scope.parser
    const tokens = parser?.tokenize(words.trim())?.filter((token) => !(token instanceof P.WhitespaceToken)) ?? []
    if (!parser || !tokens.length) return undefined
    const types = new Set(SpellLanguageService.visible(scope.types).map((type) => type.instanceName))
    const bits: string[] = [tokens[0]!.raw ?? ""]
    const names = new Set<string>()
    for (let index = 1; index < tokens.length;) {
      let length = tokens.length - index
      for (; length > 0; length--) {
        const match = parser.parse(tokens.slice(index, index + length), "expression", scope)
        if (match?.length === length) break
      }
      if (!length) {
        bits.push(tokens[index++]!.raw ?? "")
        continue
      }
      const expression = tokens.slice(index, index + length)
      index += length
      const last = expression.at(-1)!
      const word = (last.raw ?? "").toLowerCase()
      if (types.has(word) && !names.has(word)) {
        names.add(word)
        bits.push(`a ${word}`)
        continue
      }
      const param = last instanceof P.NumberToken ? "number" : last instanceof P.TextToken ? "text" : word
      let name = param
      for (let count = 2; names.has(name); count++) name = `${param}${count}`
      names.add(name)
      bits.push(`(${name})`)
    }
    return `to ${bits.join(" ")}`
  }

  /**
   * Statement that parsed just before `offset` on its line, if any, e.g. `shuffle the deck` before leftover `3 times`.
   * - The innermost match there whose rule is a `statement`, ending before `offset`.
   */
  private statementBefore(file: SP.SpellFile, offset: number): P.Match | undefined {
    const text = file.parseText
    let before = offset - 1
    while (before >= 0 && /[ \t]/.test(text[before]!)) before--
    if (before < 0 || text[before] === "\n") return undefined
    const stack = this.deepestMatchesAt(file.match!, before)
    for (let index = stack.length - 1; index >= 0; index--) {
      const match = stack[index]!
      if ([match.rule.alias].flat().includes("statement") && match.end! <= offset) return match
    }
    return undefined
  }

  /** Is `words` the start of a statement, just not finished?  i.e. does any statement need more after it? */
  private isUnfinished(words: string, scope: P.Scope): boolean {
    const expected = scope.parser?.expectedAfter(words.trim(), "statement", scope) ?? []
    return expected.some(({ continues, within, depth }) => !continues && !within && depth === 0)
  }

  /** Offset of the start of the top-level line `offset` is in -- its own, if it's top-level. */
  private topLevelLineStart(file: SP.SpellFile, offset: number): number | undefined {
    const item = file.match!.matched.find((it) => it instanceof P.Match && it.start! <= offset && offset <= it.end!)
    const start = item instanceof P.Match ? item.start : undefined
    return start === undefined ? undefined : file.parseText.lastIndexOf("\n", start - 1) + 1
  }

  ////////////////
  // ## Completion helpers
  ////////////////

  /** Variables visible in `scope`, declared before `offset`. */
  private variableItems(file: SP.SpellFile, scope: P.Scope, offset: number): CompletionItem[] {
    return SpellLanguageService.visible(scope.variables).flatMap((variable) => {
      if (this.isLater(file, offset, variable.declaredBy)) return []
      const { name, kind, output } = variable
      const detail = [kind ?? "variable", output && output !== name ? `as ${output}` : ""].filter(Boolean).join(" ")
      const documentation = this.markdown(this.docsOfRecord(variable))
      return [{ label: SpellLanguageService.asWritten(name), kind: CompletionItemKind.Variable, detail, documentation }]
    })
  }

  /** Types visible in `scope`, declared before `offset`. */
  private typeItems(file: SP.SpellFile, scope: P.Scope, offset: number): CompletionItem[] {
    return SpellLanguageService.visible(scope.types).flatMap((type) => {
      if (this.isLater(file, offset, type.declaredBy)) return []
      const label = SpellLanguageService.asWritten(type.instanceName)
      const documentation = this.markdown(this.docsOfRecord(type))
      return [{ label, kind: CompletionItemKind.Class, detail: `type ${type.name}`, documentation }]
    })
  }

  /**
   * Properties of every type visible in `scope`, as written, e.g. `short rank` -- once each, with the types
   * declaring it.
   * - Every type's:  what's being typed, e.g. `the short`, doesn't know yet what it'll be read from.
   * - NOT an enumeration's values, e.g. `suits`:  `card suits` reads those.
   */
  private propertyItems(scope: P.Scope): CompletionItem[] {
    const owners = new Map<string, Array<{ type: string; doc?: string }>>()
    for (const type of SpellLanguageService.visible(scope.types)) {
      for (const property of SpellLanguageService.propertiesOf(type)) {
        const words = SpellLanguageService.memberWords(property.name, property)
        const doc = property.declaredBy ? undefined : property.doc
        owners.set(words, [...(owners.get(words) ?? []), { type: type.name, doc }])
      }
    }
    return [...owners].map(([label, of]) => {
      // a built-in's docs, e.g. a text's and a list's `length` -- each type's, if more than one says
      const docs = of.filter((it) => it.doc).map((it) => (of.length > 1 ? `**${it.type}**:  ${it.doc}` : it.doc))
      return {
        label,
        kind: CompletionItemKind.Property,
        detail: `property of ${of.map((it) => it.type).join(", ")}`,
        ...(docs.length ? { documentation: this.markdown(docs.join("\n\n")) } : {})
      }
    })
  }

  /** Constants visible in `scope`, declared before `offset`. */
  private constantItems(file: SP.SpellFile, scope: P.Scope, offset: number): CompletionItem[] {
    return SpellLanguageService.visible(scope.constants).flatMap((constant) => {
      if (this.isLater(file, offset, constant.declaredBy)) return []
      return [{ label: constant.name, kind: CompletionItemKind.EnumMember, detail: "constant" }]
    })
  }

  /** Calls to the project's methods visible in `scope` which are `alias`es, e.g. `"expression"`, as snippets. */
  private methodItems(file: SP.SpellFile, scope: P.Scope, offset: number, alias: string): CompletionItem[] {
    return SpellLanguageService.visible(scope.rules).flatMap((scopeRule) => {
      // Ask the BUILT rule -- `alias` usually lives on its class (`@proto static`), not in `definition`.
      const ruleAlias = scopeRule.instance?.alias
      if (this.isLater(file, offset, scopeRule.declaredBy) || ![ruleAlias].flat().includes(alias)) return []
      const item = this.methodCompletion(scopeRule)
      return item ? [{ ...item, documentation: this.markdown(this.docsOfRecord(scopeRule, true)) }] : []
    })
  }

  /** Was `declaredBy` later in `file` than `offset`, so not usable there yet? */
  private isLater(file: SP.SpellFile, offset: number, declaredBy: P.Match | undefined): boolean {
    return !!declaredBy && this.fileOf(declaredBy) === file && declaredBy.start! > offset
  }

  /** Scope at `offset` in `file`:  of the deepest match there. */
  private scopeAt(file: SP.SpellFile, offset: number): P.Scope {
    return this.deepestMatchesAt(file.match!, offset).at(-1)!.scope
  }

  /**
   * Snippet calling the method `scopeRule` matches, e.g. `turn ${1:card} face up` for `to turn a card face up`.
   * - Placeholders are named for the method's parameters, in order -- see `slotNames()`.
   */
  private methodCompletion(scopeRule: P.ScopeRule): CompletionItem | undefined {
    const { declaredBy, definition, instance } = scopeRule
    const { syntax } = definition
    const declaration = declaredBy?.rule.getDeclaration(declaredBy)
    if (!syntax || !declaration) return undefined
    const method = SpellLanguageService.methodOf(scopeRule)
    const argNames = instance instanceof P.Sequence ? SpellLanguageService.slotNames(instance, method) : []
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
  // ## Project lookups
  ////////////////

  /** Spell file `match` is in, by its `FileScope`'s path. */
  fileOf(match: P.Match): SP.SpellFile | undefined {
    const path = match.getScopeOfType(P.FileScope)?.path
    if (!path) return undefined
    const file = SP.SpellFile.registry.get(path)
    return file?.isActive ? file : undefined
  }

  /**
   * Every rule `project`'s files generated while parsing, e.g. a method's call-site rule, to the record of it.
   * - A call's expression twin finds its statement rule's record too -- see `GeneratedRules`.
   */
  generatedRules(project: SP.SpellProject): Map<P.Rule, P.ScopeRule> {
    const generated = new GeneratedRules()
    for (const scopeRule of SpellLanguageService.visible(project.scope?.rules)) {
      if (scopeRule.instance) generated.set(scopeRule.instance, scopeRule)
    }
    return generated
  }

  /**
   * Record of the method `scopeRule`'s call rule calls -- its `P.ScopeMethod`, which its declaring statement noted --
   * or `undefined` if it has none, e.g. it was imported, or it's a property's rule.
   */
  static methodOf(scopeRule: P.ScopeRule): P.ScopeMethod | undefined {
    const declared = (scopeRule.declaredBy?.data as { declared?: unknown[] } | undefined)?.declared ?? []
    return declared.find((item): item is P.ScopeMethod => item instanceof P.ScopeMethod)
  }

  /**
   * Name of each argument slot of `method`'s call rule `sequence`, in order -- `move a card to a pile` =>
   * `card`, `pile`:
   * - its receiver (`{thisArg}`) by its type, e.g. `card`
   * - each other by its parameter's name, from the method's record (`P.ScopeMethod.params`), e.g. `pile`
   * - else the slot's own group or rule name
   */
  static slotNames(sequence: P.Sequence, method: P.ScopeMethod | undefined): string[] {
    const params = method?.params ?? []
    let param = 0
    return sequence.rules
      .filter((rule): rule is P.Subrule => rule instanceof P.Subrule)
      .map((slot) => {
        if (slot.matchGroup === "thisArg" && method?.of) return instanceCase(method.of)
        return params[param++]?.name ?? slot.matchGroup ?? slot.rule
      })
  }

  /** What every statement in the project of `match` declares, in file order. */
  private allDeclarations(match: P.Match): Array<{ file: SP.SpellFile; declaration: P.Declaration }> {
    const project = this.fileOf(match)?.project
    if (!project) return []
    const declarations: Array<{ file: SP.SpellFile; declaration: P.Declaration }> = []
    for (const file of project.spellFiles) {
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
    return { uri: this.addresses.uriFor(file), range }
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
   * - Follows a `{subrule}` only to a single rule, NOT a category like `{expression}`, which could start with
   *   anything -- unless `followGroups`, e.g. for operators, filtered by what's being typed.
   */
  static firstWords(rule: P.Rule, parser: P.Parser, visited: Set<P.Rule>, followGroups = false): string[] {
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
        words.push(...SpellLanguageService.firstWords(child, parser, visited, followGroups))
        if (!child.optional) break
      }
    } else if (rule instanceof P.Choice) {
      words = rule.rules.flatMap((child) => SpellLanguageService.firstWords(child, parser, visited, followGroups))
    } else if (rule instanceof P.Repeat) {
      words = SpellLanguageService.firstWords(rule.rule, parser, visited, followGroups)
    } else if (rule instanceof P.Subrule) {
      const target = parser.rules[rule.rule]
      if (target && (followGroups || !(target instanceof P.Group))) {
        words = SpellLanguageService.firstWords(target, parser, visited, followGroups)
      }
    }
    return words.filter((word) => /^[a-z][\w-]*$/i.test(word))
  }

  /** Kinds of NAME a completion can offer, by the `highlightAs` of the rule that matches them -- see `firstKinds()`. */
  static NAME_KINDS: P.HighlightKind[] = ["type", "variable", "enumMember", "function", "property"]

  /**
   * Kinds of name `rule` can start with, e.g. `{type}` => `type`, `{expression}` => `variable`, `enumMember`...
   * - By the `highlightAs` of the rules it can start with -- NOT by rule names -- through sequences, choices,
   *   repeats and subrules, categories too.
   */
  static firstKinds(rule: P.Rule, parser: P.Parser, visited: Set<P.Rule>, kinds = new Set<P.HighlightKind>()) {
    if (visited.has(rule)) return kinds
    visited.add(rule)
    if (rule.highlightAs && SpellLanguageService.NAME_KINDS.includes(rule.highlightAs)) kinds.add(rule.highlightAs)
    if (rule instanceof P.Sequence) {
      for (const child of rule.rules) {
        SpellLanguageService.firstKinds(child, parser, visited, kinds)
        if (!child.optional) break
      }
    } else if (rule instanceof P.Choice) {
      for (const child of rule.rules) SpellLanguageService.firstKinds(child, parser, visited, kinds)
    } else if (rule instanceof P.Repeat) {
      SpellLanguageService.firstKinds(rule.rule, parser, visited, kinds)
    } else if (rule instanceof P.Subrule) {
      const target = parser.rules[rule.rule]
      if (target) SpellLanguageService.firstKinds(target, parser, visited, kinds)
    }
    return kinds
  }

  /**
   * Record of property `name` on `type`, or on the nearest super-type declaring it -- see `P.TypeScope.getMember()`.
   * - A property only:  `undefined` if the member is a method.
   */
  static propertyOf(type: P.TypeScope, name: string): P.ScopeVariable | undefined {
    const member = type.getMember(name)
    return member instanceof P.ScopeVariable ? member : undefined
  }

  /** Properties declared on `type` itself -- NOT the enumerations `define_property_has` also files there. */
  static propertiesOf(type: P.TypeScope): P.ScopeVariable[] {
    return type.variables.get().filter((variable) => !("enumeration" in variable))
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

  /**
   * `name` normalized for comparing:  lower case, dashes and spaces as underscores, e.g. `short-suit` or
   * `short suit` => `short_suit`.
   */
  static propertyKey(name: string): string {
    return name.toLowerCase().replace(/[-\s]+/g, "_")
  }

  /**
   * Member `name` as it's written in spell, e.g. `short rank` for `short_rank` -- its record's `words`, if it has
   * some, else its name with spaces.
   * - Hover AND the Type Explorer show this, so a member reads the same in both.
   */
  static memberWords(name: string, record?: P.ScopeVariable): string {
    return record?.words ?? (record?.name ?? name).replace(/_/g, " ")
  }
}

/** What a code lens from `codeLens()` carries until it's resolved. */
type CodeLensData = {
  /** URI of the file it's in. */
  uri: string
  /** Where the declared name starts. */
  position: Position
}

/**
 * Generated rules to their records -- see `SpellLanguageService.generatedRules()`.
 * - A call rule's expression twin (`SP.SpellStatement.operandInExpressions`) finds its statement rule's record:
 *   the twin is what a call INSIDE an expression matched, e.g. `double x` in `if double x is 4`.
 */
class GeneratedRules extends Map<P.Rule, P.ScopeRule> {
  /** Record of `rule`, or of the statement rule it's the twin of. */
  get(rule: P.Rule): P.ScopeRule | undefined {
    return super.get(SP.SpellStatement.statementRuleOf(rule))
  }

  /** Is `rule`, or the statement rule it's the twin of, generated? */
  has(rule: P.Rule): boolean {
    return super.has(SP.SpellStatement.statementRuleOf(rule))
  }
}
