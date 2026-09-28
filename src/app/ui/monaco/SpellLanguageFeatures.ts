import type { SP } from "~/languages/spell"
import { LSP } from "~/lsp"
import type * as UIT from "~/app/ui/ui.types"
import { monaco } from "./monaco"
import { AppAddresses } from "./AppAddresses"
import { LspToMonaco } from "./LspToMonaco"
import type { SpellModels } from "./SpellModels"

/**
 * Monaco's language features for spell, answered IN-PROCESS by `LSP.SpellLanguageService` --
 * the same service the VS Code extension talks to over the Language Server Protocol.
 * - Hover, completion, definition / type definition, references, highlights, rename, outline,
 *   folding, expand selection, formatting and semantic colouring.
 * - Answers from each file's current parse, kept up to date by `SpellModels` + `project.updateText()`.
 *   Asks nothing of a model whose file hasn't parsed, or whose text isn't its file's.
 * - A rename saves every file it touched -- see `SpellModels.saveAfterEdit()`.
 * - Going to a declaration in another file asks `open` to show it, as do links in hovers.
 */
export class SpellLanguageFeatures {
  declare service: LSP.SpellLanguageService
  declare addresses: AppAddresses
  declare models: SpellModels
  /** Show the file at `path`, selecting `selection` -- e.g. `editor.selectPath()`. */
  declare open: (path: string, selection?: UIT.EditorSelection) => void

  constructor(props: SpellLanguageFeaturesProps) {
    Object.assign(this, props)
  }

  /** Register everything with Monaco for `language`.  Returns what unregisters it all. */
  register(language: string): monaco.IDisposable[] {
    const { languages, editor } = monaco
    return [
      languages.registerDocumentSemanticTokensProvider(language, {
        onDidChange: this.models.onDidParse,
        getLegend: () => LSP.SpellLanguageService.TOKEN_LEGEND,
        provideDocumentSemanticTokens: (model) => this.semanticTokens(model),
        releaseDocumentSemanticTokens: () => {}
      }),
      languages.registerHoverProvider(language, {
        provideHover: (model, position) => this.hover(model, position)
      }),
      languages.registerCompletionItemProvider(language, {
        triggerCharacters: [" "],
        provideCompletionItems: (model, position) => this.completion(model, position)
      }),
      languages.registerDefinitionProvider(language, {
        provideDefinition: (model, position) => this.locations(model, position, "definition")
      }),
      languages.registerTypeDefinitionProvider(language, {
        provideTypeDefinition: (model, position) => this.locations(model, position, "typeDefinition")
      }),
      languages.registerReferenceProvider(language, {
        provideReferences: (model, position, context) =>
          this.locations(model, position, "references", context.includeDeclaration)
      }),
      languages.registerDocumentHighlightProvider(language, {
        provideDocumentHighlights: (model, position) => this.documentHighlights(model, position)
      }),
      languages.registerRenameProvider(language, {
        resolveRenameLocation: (model, position) => this.renameLocation(model, position),
        provideRenameEdits: (model, position, newName) => this.rename(model, position, newName)
      }),
      languages.registerDocumentSymbolProvider(language, {
        provideDocumentSymbols: (model) => this.documentSymbols(model)
      }),
      languages.registerFoldingRangeProvider(language, {
        provideFoldingRanges: (model) => this.foldingRanges(model)
      }),
      languages.registerSelectionRangeProvider(language, {
        provideSelectionRanges: (model, positions) => this.selectionRanges(model, positions)
      }),
      languages.registerDocumentFormattingEditProvider(language, {
        provideDocumentFormattingEdits: (model, options) => this.formatting(model, options)
      }),
      languages.registerDocumentRangeFormattingEditProvider(language, {
        provideDocumentRangeFormattingEdits: (model, range, options) => this.formatting(model, options, range)
      }),
      editor.registerEditorOpener({
        openCodeEditor: (_source, resource, selectionOrPosition) => this.openAt(resource, selectionOrPosition)
      }),
      editor.registerLinkOpener({ open: (resource) => this.openLink(resource) })
    ]
  }

  ////////////////
  // ## Answers
  ////////////////

  /**
   * `model`'s spell file, if we can answer about it:  parsed, and its text is `model`'s.
   * - Always true straight after an edit, which `SpellModels` parses on the spot -- but NOT while a full parse
   *   is under way, e.g. after the incremental parse couldn't cope.
   */
  private fileOf(model: monaco.editor.ITextModel): SP.SpellFile | undefined {
    const file = this.addresses.fileFor(model.uri.toString())
    return file?.match && file.contents === model.getValue() ? file : undefined
  }

  /** Semantic colouring of `model`, from its parse. */
  private semanticTokens(model: monaco.editor.ITextModel): monaco.languages.SemanticTokens | null {
    const file = this.fileOf(model)
    if (!file) return null
    return { data: Uint32Array.from(this.service.semanticTokens(file).data) }
  }

  /** Hover at `position`, e.g. what a word is and its docstring. */
  private hover(model: monaco.editor.ITextModel, position: monaco.Position): monaco.languages.Hover | null {
    const file = this.fileOf(model)
    const hover = file && this.service.hover(file, LspToMonaco.lspPosition(position))
    return hover ? LspToMonaco.hover(hover) : null
  }

  /** Completions at `position`, replacing the word being typed. */
  private completion(model: monaco.editor.ITextModel, position: monaco.Position): monaco.languages.CompletionList {
    const file = this.fileOf(model)
    if (!file) return { suggestions: [] }
    const word = model.getWordUntilPosition(position)
    const range = {
      startLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endLineNumber: position.lineNumber,
      endColumn: word.endColumn
    }
    const items = this.service.completion(file, LspToMonaco.lspPosition(position))
    return { suggestions: items.map((item) => LspToMonaco.completion(item, range)) }
  }

  /** Locations the service's `method` finds for the thing at `position`, e.g. its `definition`. */
  private locations(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    method: "definition" | "typeDefinition" | "references",
    includeDeclaration = true
  ): monaco.languages.Location[] {
    const file = this.fileOf(model)
    if (!file) return []
    const at = LspToMonaco.lspPosition(position)
    const locations =
      method === "references" ? this.service.references(file, at, includeDeclaration) : this.service[method](file, at)
    return locations.map((location) => LspToMonaco.location(location))
  }

  /** Other uses of the thing at `position` in `model`, as reads or writes. */
  private documentHighlights(
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ): monaco.languages.DocumentHighlight[] {
    const file = this.fileOf(model)
    if (!file) return []
    const highlights = this.service.documentHighlights(file, LspToMonaco.lspPosition(position))
    return highlights.map((highlight) => LspToMonaco.documentHighlight(highlight))
  }

  /** What renaming at `position` would rename, or why it can't. */
  private renameLocation(
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ): monaco.languages.RenameLocation & monaco.languages.Rejection {
    const file = this.fileOf(model)
    const prepared = file && this.service.prepareRename(file, LspToMonaco.lspPosition(position))
    if (!prepared) {
      return { range: new monaco.Range(1, 1, 1, 1), text: "", rejectReason: "Can't rename this" }
    }
    return { range: LspToMonaco.range(prepared.range), text: prepared.placeholder }
  }

  /**
   * Edits renaming the thing at `position` to `newName`, in every file.
   * - SIDE EFFECT:  each file it touches saves once its model takes the edit.
   */
  private rename(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    newName: string
  ): (monaco.languages.WorkspaceEdit & monaco.languages.Rejection) | null {
    const file = this.fileOf(model)
    const edit = file && this.service.rename(file, LspToMonaco.lspPosition(position), newName)
    if (!edit) return { edits: [], rejectReason: `Can't rename to '${newName}'` }
    const files = Object.keys(edit.changes ?? {}).flatMap((uri) => this.addresses.fileFor(uri) ?? [])
    this.models.saveAfterEdit(files)
    return LspToMonaco.workspaceEdit(edit)
  }

  /** Outline of `model`:  what it declares, nested. */
  private documentSymbols(model: monaco.editor.ITextModel): monaco.languages.DocumentSymbol[] {
    const file = this.fileOf(model)
    return file ? this.service.documentSymbols(file).map((symbol) => LspToMonaco.documentSymbol(symbol)) : []
  }

  /** Foldable blocks of `model`. */
  private foldingRanges(model: monaco.editor.ITextModel): monaco.languages.FoldingRange[] {
    const file = this.fileOf(model)
    return file ? this.service.foldingRanges(file).map((range) => LspToMonaco.foldingRange(range)) : []
  }

  /** "Expand selection" steps at each of `positions`. */
  private selectionRanges(
    model: monaco.editor.ITextModel,
    positions: monaco.Position[]
  ): monaco.languages.SelectionRange[][] {
    const file = this.fileOf(model)
    if (!file) return []
    const ranges = this.service.selectionRanges(
      file,
      positions.map((position) => LspToMonaco.lspPosition(position))
    )
    return ranges.map((range) => LspToMonaco.selectionRanges(range))
  }

  /** Whitespace edits formatting `model`, or just `range` of it -- always with tabs. */
  private formatting(
    model: monaco.editor.ITextModel,
    options: monaco.languages.FormattingOptions,
    range?: monaco.IRange
  ): monaco.languages.TextEdit[] {
    const file = this.fileOf(model)
    if (!file) return []
    const { tabSize, insertSpaces } = options
    const edits = this.service.formatting(file, { tabSize, insertSpaces }, range && LspToMonaco.lspRange(range))
    return edits.map((edit) => LspToMonaco.textEdit(edit))
  }

  ////////////////
  // ## Opening other files
  ////////////////

  /** Show `resource`, e.g. a declaration in another file, at `selectionOrPosition`.  `false` if it isn't ours. */
  private openAt(resource: monaco.Uri, selectionOrPosition?: monaco.IRange | monaco.IPosition): boolean {
    const path = AppAddresses.pathOf(resource)
    if (path === undefined) return false
    if (!selectionOrPosition) this.open(path)
    else {
      const start =
        "startLineNumber" in selectionOrPosition
          ? monaco.Range.getStartPosition(selectionOrPosition)
          : selectionOrPosition
      const end = "startLineNumber" in selectionOrPosition ? monaco.Range.getEndPosition(selectionOrPosition) : start
      this.open(path, {
        anchor: { line: start.lineNumber - 1, ch: start.column - 1 },
        head: { line: end.lineNumber - 1, ch: end.column - 1 }
      })
    }
    return true
  }

  /** Follow a link in a hover to one of our files, e.g. `spell:/<path>#L12`. */
  private openLink(resource: monaco.Uri): boolean {
    const line = Number(resource.fragment.match(/^L(\d+)/)?.[1] ?? 1)
    return this.openAt(resource.with({ fragment: "" }), { lineNumber: line, column: 1 })
  }
}

/** Constructor props for `SpellLanguageFeatures`. */
export type SpellLanguageFeaturesProps = {
  /** Answers every question. */
  service: LSP.SpellLanguageService
  /** How our models' URIs map to files. */
  addresses: AppAddresses
  /** Our models, e.g. to save after a rename. */
  models: SpellModels
  /** Show the file at `path`, selecting `selection`. */
  open: (path: string, selection?: UIT.EditorSelection) => void
}
