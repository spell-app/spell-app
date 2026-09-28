import {
  CompletionItemKind as LspCompletionItemKind,
  DiagnosticSeverity,
  InsertTextFormat,
  type CodeAction,
  type CompletionItem,
  type Diagnostic,
  type DocumentHighlight,
  type DocumentSymbol,
  type FoldingRange,
  type Hover,
  type Location,
  type MarkedString,
  type MarkupContent,
  type Position,
  type Range,
  type SelectionRange,
  type SemanticTokens,
  type SemanticTokensDelta,
  type SignatureHelp,
  type TextEdit,
  type WorkspaceEdit
} from "vscode-languageserver"
import { URI } from "monaco-editor/base/common/uri"
import {
  CompletionItemInsertTextRule,
  CompletionItemKind,
  MarkerSeverity
} from "monaco-editor/editor/common/standalone/standaloneEnums"

import type { monaco } from "./monaco"

/**
 * Converts what `LSP.SpellLanguageService` answers, in Language Server Protocol shapes, to Monaco's.
 * - Positions:  LSP counts lines and characters from 0, Monaco lines and columns from 1.
 * - Kinds:  same names, different numbers -- mapped by NAME where the numbering differs.
 * - Imports Monaco's enums and `URI` from their own DOM-free modules, NOT `./monaco`, so this unit-tests in node.
 */
export class LspToMonaco {
  ////////////////
  // ## Positions
  ////////////////

  /** LSP position of Monaco `position`. */
  static lspPosition({ lineNumber, column }: monaco.IPosition): Position {
    return { line: lineNumber - 1, character: column - 1 }
  }

  /** LSP range of Monaco `range`. */
  static lspRange(range: monaco.IRange): Range {
    return {
      start: { line: range.startLineNumber - 1, character: range.startColumn - 1 },
      end: { line: range.endLineNumber - 1, character: range.endColumn - 1 }
    }
  }

  /** Monaco position of LSP `position`. */
  static position({ line, character }: Position): monaco.IPosition {
    return { lineNumber: line + 1, column: character + 1 }
  }

  /** Monaco range of LSP `range`. */
  static range({ start, end }: Range): monaco.IRange {
    return {
      startLineNumber: start.line + 1,
      startColumn: start.character + 1,
      endLineNumber: end.line + 1,
      endColumn: end.character + 1
    }
  }

  /** Monaco location of LSP `location`. */
  static location({ uri, range }: Location): monaco.languages.Location {
    return { uri: URI.parse(uri), range: LspToMonaco.range(range) }
  }

  ////////////////
  // ## Answers
  ////////////////

  /** Monaco marker for LSP `diagnostic`. */
  static marker(diagnostic: Diagnostic): monaco.editor.IMarkerData {
    const { range, message, source, severity = DiagnosticSeverity.Error } = diagnostic
    return {
      ...LspToMonaco.range(range),
      message: typeof message === "string" ? message : message.value,
      source,
      severity: LspToMonaco.SEVERITIES[severity] ?? MarkerSeverity.Error
    }
  }

  /** Monaco hover for LSP `hover`. */
  static hover({ contents, range }: Hover): monaco.languages.Hover {
    const list = Array.isArray(contents) ? contents : [contents]
    return {
      contents: list.map((content) => LspToMonaco.markdown(content)),
      range: range && LspToMonaco.range(range)
    }
  }

  /**
   * Monaco completion for LSP `item`, replacing `range`, e.g. the word being typed.
   * - A snippet stays a snippet:  `move ${1:card} to ${2:pile}`.
   */
  static completion(item: CompletionItem, range: monaco.IRange): monaco.languages.CompletionItem {
    const { label, kind, detail, documentation, insertText, insertTextFormat, sortText, filterText } = item
    return {
      label,
      kind: (kind && LspToMonaco.COMPLETION_KINDS[kind]) ?? CompletionItemKind.Text,
      detail,
      documentation: documentation === undefined ? undefined : LspToMonaco.markdown(documentation),
      insertText: insertText ?? label,
      insertTextRules:
        insertTextFormat === InsertTextFormat.Snippet ? CompletionItemInsertTextRule.InsertAsSnippet : undefined,
      sortText,
      filterText,
      range
    }
  }

  /** Monaco document highlight for LSP `highlight`.  Kinds are 1-based in LSP, 0-based in Monaco. */
  static documentHighlight({ range, kind }: DocumentHighlight): monaco.languages.DocumentHighlight {
    return { range: LspToMonaco.range(range), kind: kind === undefined ? undefined : kind - 1 }
  }

  /** Monaco symbol for LSP `symbol`, with its children.  Kinds are 1-based in LSP, 0-based in Monaco. */
  static documentSymbol(symbol: DocumentSymbol): monaco.languages.DocumentSymbol {
    const { name, detail, kind, range, selectionRange, children } = symbol
    return {
      name,
      detail: detail ?? "",
      kind: kind - 1,
      tags: [],
      range: LspToMonaco.range(range),
      selectionRange: LspToMonaco.range(selectionRange),
      children: children?.map((child) => LspToMonaco.documentSymbol(child))
    }
  }

  /** Monaco folding range for LSP `range`:  whole lines, 1-based. */
  static foldingRange({ startLine, endLine }: FoldingRange): monaco.languages.FoldingRange {
    return { start: startLine + 1, end: endLine + 1 }
  }

  /** Monaco "expand selection" steps for LSP `selection`:  a list, innermost first, instead of a `parent` chain. */
  static selectionRanges(selection: SelectionRange): monaco.languages.SelectionRange[] {
    const ranges: monaco.languages.SelectionRange[] = []
    for (let step: SelectionRange | undefined = selection; step; step = step.parent) {
      ranges.push({ range: LspToMonaco.range(step.range) })
    }
    return ranges
  }

  /** Monaco signature help for LSP `help`:  parameter labels as `[start, end]` offsets into the signature stay as they are. */
  static signatureHelp({
    signatures,
    activeSignature,
    activeParameter
  }: SignatureHelp): monaco.languages.SignatureHelp {
    return {
      signatures: signatures.map(({ label, documentation, parameters = [] }) => ({
        label,
        documentation: documentation === undefined ? undefined : LspToMonaco.markdown(documentation),
        parameters: parameters.map((parameter) => ({
          label: parameter.label,
          documentation:
            parameter.documentation === undefined ? undefined : LspToMonaco.markdown(parameter.documentation)
        }))
      })),
      activeSignature: activeSignature ?? 0,
      activeParameter: activeParameter ?? 0
    }
  }

  /** Monaco code action for LSP `action`, e.g. a quick fix:  its edit, and the diagnostics it fixes as markers. */
  static codeAction({ title, kind, diagnostics, edit, isPreferred }: CodeAction): monaco.languages.CodeAction {
    return {
      title,
      kind,
      isPreferred,
      diagnostics: diagnostics?.map((diagnostic) => LspToMonaco.marker(diagnostic)),
      edit: edit && LspToMonaco.workspaceEdit(edit)
    }
  }

  /**
   * Monaco semantic tokens for LSP `tokens` -- all of them, or edits to an earlier result (a delta).
   * - Same encoding either way:  just typed arrays, and `resultId` kept for the next delta.
   */
  static semanticTokens(
    tokens: SemanticTokens | SemanticTokensDelta
  ): monaco.languages.SemanticTokens | monaco.languages.SemanticTokensEdits {
    if ("edits" in tokens) {
      return {
        resultId: tokens.resultId,
        edits: tokens.edits.map(({ start, deleteCount, data }) => ({
          start,
          deleteCount,
          data: data && Uint32Array.from(data)
        }))
      }
    }
    return { resultId: tokens.resultId, data: Uint32Array.from(tokens.data) }
  }

  /** Monaco text edit for LSP `edit`. */
  static textEdit({ range, newText }: TextEdit): monaco.languages.TextEdit {
    return { range: LspToMonaco.range(range), text: newText }
  }

  /** Monaco workspace edit for LSP `edit`:  one text edit per change, by file. */
  static workspaceEdit({ changes = {} }: WorkspaceEdit): monaco.languages.WorkspaceEdit {
    return {
      edits: Object.entries(changes).flatMap(([uri, edits]) =>
        edits.map((edit) => ({ resource: URI.parse(uri), textEdit: LspToMonaco.textEdit(edit), versionId: undefined }))
      )
    }
  }

  /** Monaco markdown for LSP hover / completion `content`. */
  static markdown(content: MarkupContent | MarkedString | string): monaco.IMarkdownString {
    if (typeof content === "string") return { value: content }
    if ("kind" in content) return { value: content.value }
    return { value: `\`\`\`${content.language}\n${content.value}\n\`\`\`` }
  }

  ////////////////
  // ## Kinds
  ////////////////

  /** Monaco marker severity for each LSP diagnostic severity. */
  static SEVERITIES: Record<number, monaco.MarkerSeverity> = {
    [DiagnosticSeverity.Error]: MarkerSeverity.Error,
    [DiagnosticSeverity.Warning]: MarkerSeverity.Warning,
    [DiagnosticSeverity.Information]: MarkerSeverity.Info,
    [DiagnosticSeverity.Hint]: MarkerSeverity.Hint
  }

  /** Monaco completion kind for each LSP one, matched by name -- the numbering differs. */
  static COMPLETION_KINDS: Record<number, monaco.languages.CompletionItemKind> = Object.fromEntries(
    Object.entries(LspCompletionItemKind).flatMap(([name, value]) => {
      const kind = CompletionItemKind[name as keyof typeof CompletionItemKind]
      return typeof value === "number" && kind !== undefined ? [[value, kind]] : []
    })
  )
}
