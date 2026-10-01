import type { CodeLens, Location, Position } from "vscode-languageserver"

import type { SP } from "$/spell"
import { LSP } from "$/lsp"
import type * as UIT from "$/app/ui/ui.types"
import { monaco } from "./monaco"
import { AppAddresses } from "./AppAddresses"
import { LspToMonaco } from "./LspToMonaco"
import type { SpellModels } from "./SpellModels"

/**
 * Monaco's language features for spell, answered IN-PROCESS by `LSP.SpellLanguageService` --
 * the same service the VS Code extension talks to over the Language Server Protocol.
 * - Hover, completion, signature help, quick fixes, "N references" code lenses, definition / type definition,
 *   references, highlights, rename, outline,
 *   folding, expand selection, formatting and semantic colouring.
 * - Answers from each file's current parse, kept up to date by `SpellModels` + `project.updateText()`.
 *   Asks nothing of a model whose file hasn't parsed, or whose text isn't its file's.
 * - A rename saves every file it touched -- see `SpellModels.saveAfterEdit()`.
 * - Going to a declaration in another file asks `open` to show it, as do links in hovers.
 */
export class SpellLanguageFeatures {
  declare service: LSP.SpellLanguageService
  /** The service's code lens behind each of ours, until it's resolved -- see `codeLenses()`. */
  #lspLenses = new WeakMap<monaco.languages.CodeLens, CodeLens>()
  declare addresses: AppAddresses
  declare models: SpellModels
  /** Show the file at `path`, selecting `selection` -- asked by editor `source`, if we know it.  `true` if shown. */
  declare open: (path: string, selection?: UIT.EditorSelection, source?: monaco.editor.ICodeEditor) => boolean

  constructor(props: SpellLanguageFeaturesProps) {
    Object.assign(this, props)
  }

  /** Register everything with Monaco for `language`.  Returns what unregisters it all. */
  register(language: string): monaco.IDisposable[] {
    const { languages, editor } = monaco
    const lensesChanged = new monaco.Emitter<monaco.languages.CodeLensProvider>()
    const lenses: monaco.languages.CodeLensProvider = {
      onDidChange: lensesChanged.event,
      provideCodeLenses: (model) => this.codeLenses(model),
      resolveCodeLens: (model, lens) => this.resolveCodeLens(model, lens)
    }
    return [
      languages.registerDocumentSemanticTokensProvider(language, {
        onDidChange: this.models.onDidParse,
        getLegend: () => LSP.SpellLanguageService.TOKEN_LEGEND,
        provideDocumentSemanticTokens: (model, lastResultId) => this.semanticTokens(model, lastResultId),
        releaseDocumentSemanticTokens: () => {}
      }),
      languages.registerCodeLensProvider(language, lenses),
      // lenses move as the parse does -- Monaco wants the provider itself with the change
      this.models.onDidParse(() => lensesChanged.fire(lenses)),
      languages.registerHoverProvider(language, {
        provideHover: (model, position) => this.hover(model, position)
      }),
      languages.registerCompletionItemProvider(language, {
        triggerCharacters: [" "],
        provideCompletionItems: (model, position) => this.completion(model, position)
      }),
      languages.registerSignatureHelpProvider(language, {
        signatureHelpTriggerCharacters: [" "],
        signatureHelpRetriggerCharacters: [" "],
        provideSignatureHelp: (model, position) => this.signatureHelp(model, position)
      }),
      languages.registerCodeActionProvider(
        language,
        { provideCodeActions: (model, range) => this.codeActions(model, range) },
        { providedCodeActionKinds: ["quickfix"] }
      ),
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
        openCodeEditor: (source, resource, selectionOrPosition) => this.openAt(resource, selectionOrPosition, source)
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
  /**
   * Semantic colouring of `model`, from its parse -- as edits to `lastResultId`, what we sent last, if we can.
   */
  private semanticTokens(
    model: monaco.editor.ITextModel,
    lastResultId: string | null
  ): monaco.languages.SemanticTokens | monaco.languages.SemanticTokensEdits | null {
    const file = this.fileOf(model)
    if (!file) return null
    const tokens = lastResultId
      ? this.service.semanticTokensDelta(file, lastResultId)
      : this.service.semanticTokens(file)
    return LspToMonaco.semanticTokens(tokens)
  }

  /** "N references" lenses above each type and method `model` declares -- counted in `resolveCodeLens()`. */
  private codeLenses(model: monaco.editor.ITextModel): monaco.languages.CodeLensList {
    const file = this.fileOf(model)
    const lenses = file ? this.service.codeLens(file) : []
    return {
      lenses: lenses.map((lens) => {
        const monacoLens = { range: LspToMonaco.range(lens.range) }
        this.#lspLenses.set(monacoLens, lens)
        return monacoLens
      }),
      dispose() {}
    }
  }

  /**
   * `lens`, counted:  "3 references", showing them in Monaco's own references peek when clicked.
   * - The service's `SHOW_REFERENCES` command is the editor's to define:  here it's Monaco's
   *   `editor.action.showReferences`, given Monaco's own URI, position and locations.
   */
  private resolveCodeLens(model: monaco.editor.ITextModel, lens: monaco.languages.CodeLens): monaco.languages.CodeLens {
    const file = this.fileOf(model)
    const lspLens = this.#lspLenses.get(lens)
    if (!file || !lspLens) return lens
    const { command } = this.service.resolveCodeLens(file, lspLens)
    if (!command) return lens
    const [uri, position, locations] = command.arguments as [string, Position, Location[]]
    return {
      ...lens,
      command: {
        id: "editor.action.showReferences",
        title: command.title,
        arguments: [
          monaco.Uri.parse(uri),
          LspToMonaco.position(position),
          locations.map((location) => LspToMonaco.location(location))
        ]
      }
    }
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

  /** The method call being typed at `position`, with the argument being typed highlighted. */
  private signatureHelp(
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ): monaco.languages.SignatureHelpResult | null {
    const file = this.fileOf(model)
    const help = file && this.service.signatureHelp(file, LspToMonaco.lspPosition(position))
    return help ? { value: LspToMonaco.signatureHelp(help), dispose() {} } : null
  }

  /** Quick fixes for `range`, e.g. "Define `to <phrase>`" on a line that didn't parse. */
  private codeActions(model: monaco.editor.ITextModel, range: monaco.Range): monaco.languages.CodeActionList {
    const file = this.fileOf(model)
    const actions = file ? this.service.codeActions(file, LspToMonaco.lspRange(range)) : []
    return { actions: actions.map((action) => LspToMonaco.codeAction(action)), dispose() {} }
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

  /**
   * Show `resource`, e.g. a declaration in another file, at `selectionOrPosition` -- asked by editor `source`, or
   * else the one with focus.  `false` if it isn't ours, or nobody showed it.
   */
  private openAt(
    resource: monaco.Uri,
    selectionOrPosition?: monaco.IRange | monaco.IPosition,
    source: monaco.editor.ICodeEditor | undefined = focusedEditor()
  ): boolean {
    const path = AppAddresses.pathOf(resource)
    if (path === undefined) return false
    if (!selectionOrPosition) return this.open(path, undefined, source)
    else {
      const start =
        "startLineNumber" in selectionOrPosition
          ? monaco.Range.getStartPosition(selectionOrPosition)
          : selectionOrPosition
      const end = "startLineNumber" in selectionOrPosition ? monaco.Range.getEndPosition(selectionOrPosition) : start
      return this.open(
        path,
        {
          anchor: { line: start.lineNumber - 1, ch: start.column - 1 },
          head: { line: end.lineNumber - 1, ch: end.column - 1 }
        },
        source
      )
    }
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
  /** Show the file at `path`, selecting `selection` -- asked by editor `source`, if we know it.  `true` if shown. */
  open: (path: string, selection?: UIT.EditorSelection, source?: monaco.editor.ICodeEditor) => boolean
}

/** Editor with focus, if any -- where a hover's link was clicked, say. */
function focusedEditor(): monaco.editor.ICodeEditor | undefined {
  return monaco.editor.getEditors().find((editor) => editor.hasTextFocus() || editor.hasWidgetFocus())
}
