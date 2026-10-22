/**
 * Types for the two Monaco modules `LspToMonaco` imports directly, which ship without `.d.ts` files.
 * - Both are DOM-free, so they load in node, and `LspToMonaco` unit-tests under plain vitest.
 * - In the browser they're the SAME modules `monaco-editor/editor/editor.api` re-exports, so values match.
 */
declare module "monaco-editor/editor/common/standalone/standaloneEnums" {
  import type * as monaco from "monaco-editor/editor/editor.api"
  export const CompletionItemInsertTextRule: typeof monaco.languages.CompletionItemInsertTextRule
  export const CompletionItemKind: typeof monaco.languages.CompletionItemKind
  export const DocumentHighlightKind: typeof monaco.languages.DocumentHighlightKind
  export const MarkerSeverity: typeof monaco.MarkerSeverity
  export const SymbolKind: typeof monaco.languages.SymbolKind
}

declare module "monaco-editor/base/common/uri" {
  import type * as monaco from "monaco-editor/editor/editor.api"
  export const URI: typeof monaco.Uri
}
