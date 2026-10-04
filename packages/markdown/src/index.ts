/**
 * Barrel for `@spell-app/markdown` -- GitHub-flavoured markdown on the generic parser.
 * - `import { MD } from "$/markdown"`, then `MD.toHTML()`, `MD.BlockScanner`, `MD.MarkdownTokenizer` ...
 * - Pipeline:  `blocks/` (text => `MD.Block` tree), `render/` (blocks => `P.Markup` => HTML).
 */
export * as MD from "."

export * from "./markdown.types"
export * from "./MarkdownTokenizer"
export * from "./MarkdownParser"
export * from "./blocks"
export * from "./render"
export * from "./toHTML"
