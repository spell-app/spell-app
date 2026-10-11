import { proto } from "$/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { classes } from "./classes.parser"

/**
 * `css_block` rule:  a drawable type's own styles, in its outline (epic `drawable-thing`, P4).
 *
 * ```spell
 * a card is a drawable thing
 *   - it has a rank as a number
 *   <css>
 *     :host { display: inline-block }
 *     .red { color: crimson }
 *   </css>
 * ```
 *
 * - The CSS is never read as spell:  the tokenizer takes a `<css>` element's contents as raw text (`rawTextTags`).
 * - Compiles to its class's `static css = css`...``, `@spell/core`'s tag:  its element adopts it in its shadow root,
 *   after the page's theme -- see app's `SpellElement`.
 * - Only in a DRAWABLE type's outline:  anywhere else, a parse error that says where it goes.
 * - Editors colour it, complete it and check it as CSS:  see lsp's `SpellCSS`.
 */
export class CSSBlock extends P.TokenType<never, CSSBlockData> {
  @proto static alias = "statement"
  @proto static tokenType = P.JSXElementToken
  @proto static priority = Priority.declaration

  /** A `<css>` element, alone on its line -- refused outside a drawable type's outline. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const [element] = tokens
    if (!(element instanceof P.JSXElementToken) || element.tagName !== CSS_TAG) return undefined
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const type = scope instanceof P.SubjectScope ? scope.subjectType : undefined
    if (!type || !DRAWABLE_TYPES.some((base) => type.isA(base))) {
      const where = type
        ? `"${type.name}" isn't drawable:  say "a ... is a drawable thing"`
        : "put it in a type's outline"
      return SpellStatement.refuse(match, `Only a drawable type has its own <css>:  ${where}`)
    }
    match.data.typeName = type.name
    match.data.css = CSSBlock.cssOf(element)
    return match
  }

  /**
   * `static css = css`...`` in the type's class:  its own style sheet, as `@spell/core`'s `css` tag hands it back.
   * - The sheet starts on a line of its own, indented a step:  the tag takes that indent off again.
   */
  getAST(match: P.MatchFor<this>) {
    const { typeName = "", css = "" } = match.data
    const indented = css
      .split("\n")
      .map((line) => (line ? `${CSS_INDENT}${line}` : line))
      .join("\n")
    return new P.ASTStaticDefinition(match, {
      type: new P.ASTTypeExpression(match, { name: typeName }),
      name: "css",
      value: new P.ASTTaggedTemplate(match, { tag: "css", parts: [`\n${indented}\n`] })
    })
  }

  /** The CSS inside `element`, its common indent taken off, blank lines at either end dropped. */
  static cssOf(element: P.JSXElementToken): string {
    const text = ((element.children ?? []) as P.Token[])
      .filter((child): child is P.JSXTextToken => child instanceof P.JSXTextToken)
      .map((child) => `${child.value}`)
      .join("")
    const lines = text.split("\n")
    while (lines.length && !lines[0]!.trim()) lines.shift()
    while (lines.length && !lines.at(-1)!.trim()) lines.pop()
    const indent = Math.min(...lines.filter((line) => line.trim()).map((line) => /^\s*/.exec(line)![0].length))
    return lines.map((line) => line.slice(Number.isFinite(indent) ? indent : 0)).join("\n")
  }
}
classes.addRule(CSSBlock, {
  tests: [
    {
      compileAs: "block",
      tests: [
        [
          ["a card is a drawable thing:", "\t<css>", "\t\t.red { color: crimson }", "\t</css>"],
          [
            "export class Card extends Drawable {",
            '  static elementTag = spellCore.defineElement(this, "test_classes")',
            "",
            "  static css = css`",
            "    .red { color: crimson }",
            "  `",
            "}"
          ]
        ]
      ]
    }
  ]
})

/** What `css_block` keeps on its match. */
type CSSBlockData = {
  /** Name of the type it styles, e.g. `Card`. */
  typeName?: string
  /** Its CSS, e.g. `.red { color: crimson }`. */
  css?: string
}

/** The tag of a type's own styles. */
const CSS_TAG = "css"

/** How far a type's sheet is indented inside its `css` template, under `static css = ...`. */
const CSS_INDENT = "  "

/** The built-in types whose sub-types have their own styles:  they draw as their own elements. */
const DRAWABLE_TYPES = ["drawable", "drawable list"]
