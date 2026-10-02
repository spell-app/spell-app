//
//  ## Types shared by the AST classes (`AST.ts`) and their drawing backend (`renderAST.ts`).
//

////////////////
// ## Markup
////////////////

/**
 * What an `ASTNode` draws itself as:  a framework-free description of DOM, built by `render.h()` / `render.span()`.
 * - Strings and numbers are text;  `null`, `undefined` and booleans draw nothing (as in JSX), so
 *   `!!x && render.SPACE` works;  arrays are fragments, nested freely.
 * - `render.toDOM()` draws it in a browser, fresh nodes each call;  `render.toText()` reads its text anywhere.
 * - Why not JSX:  `AST.ts` loads wherever the parser does -- node tools run its SOURCE through `tsx` / `esbuild`,
 *   which can't compile Solid's JSX -- and only the app's AST viewer ever draws it.
 * - NEVER mutate one:  the constants in `renderAST.ts` (`SPACE`, `COMMA` ...) are shared by every drawing.
 */
export type Markup = MarkupElement | string | number | boolean | null | undefined | Markup[]

/**
 * One element of `Markup`, e.g. `<span class="keyword let">let </span>`.
 * - Make with `render.h()` or `render.span()`.
 */
export type MarkupElement = {
  /** Tag name, e.g. `span`. */
  tag: string
  /** Attributes in the order they're set, e.g. `class`, `title`, `data-match`;  `undefined` ones are skipped. */
  attrs: Record<string, string | number | undefined>
  /** Contents. */
  children: Markup[]
}
