import { proto } from "$/util"
import { P } from "$/parser"
import { MARKDOWN_TAG, rawTextOf } from "$/spell/rules/JSX/JSX.shared"
import { Priority } from "$/spell/rules/rules.types"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { classes } from "./classes.parser"

/**
 * `markdown_description` rule:  a type's description, as markdown, in its outline (epic `drawable-thing`, P14).
 *
 * ```spell
 * a card is a thing
 *   <markdown>
 *     A playing card:  a **rank** and a **suit**.
 *   </markdown>
 *   - it has a rank as a number
 * ```
 *
 * - The markdown is never read as spell:  the tokenizer takes a `<markdown>` element's contents as raw text
 *   (`rawTextTags`), and the indent its lines share comes off.
 * - Shown where the type's docstring shows, when it has no comment docstring:
 *   hover, and the Type Explorer's description -- see lsp's `SpellLanguageService.docsOf()`.
 * - Compiles to its class's `static description = "..."`:  the program has it too.
 * - Plain text:  a `{...}` in it is NOT a hole, since there's no thing to read it from.
 * - Only in a type's outline:  anywhere else, a parse error that says where it goes.
 *   - In a drawing, a `<markdown>` block is drawn instead:  `markdown_block`.
 */
export class MarkdownDescription extends P.TokenType<never, MarkdownDescriptionData> {
  @proto static alias = "statement"
  @proto static tokenType = P.JSXElementToken
  @proto static priority = Priority.declaration

  /** A `<markdown>` element, alone on its line -- refused outside a type's outline. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const [element] = tokens
    if (!(element instanceof P.JSXElementToken) || element.tagName !== MARKDOWN_TAG) return undefined
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const type = scope instanceof P.SubjectScope ? scope.subjectType : undefined
    if (!type) {
      return SpellStatement.refuse(
        match,
        "A <markdown> block goes in a type's outline, as its description, or in a drawing:  return <markdown>...</markdown>"
      )
    }
    match.data.typeName = type.name
    match.data.markdown = rawTextOf(element)
    return match
  }

  /** `static description = "..."` in the type's class. */
  getAST(match: P.MatchFor<this>) {
    const { typeName = "", markdown = "" } = match.data
    return new P.ASTStaticDefinition(match, {
      type: new P.ASTTypeExpression(match, { name: typeName }),
      name: "description",
      value: new P.ASTStringLiteral(match, { value: markdown, quote: '"' })
    })
  }

  /** The description in `match`, if it's a `markdown_description` match:  for editors, e.g. hover. */
  static descriptionOf(match: P.Match | undefined): string | undefined {
    return match?.is(MarkdownDescription) ? match.data.markdown : undefined
  }
}
classes.addRule(MarkdownDescription, {
  tests: [
    {
      compileAs: "block",
      tests: [
        [
          ["a card is a thing:", "\t<markdown>", "\t\tA playing card:  **{rank}** of *suit*.", "\t</markdown>"],
          ["export class Card extends Thing {", '  static description = "A playing card:  **{rank}** of *suit*."', "}"]
        ],
        // not in an outline:  says where it goes
        [
          ["<markdown>", "\tHello", "</markdown>"],
          "/* PARSE ERROR: A <markdown> block goes in a type's outline, as its description, or in a drawing:  return <markdown>...</markdown> */"
        ]
      ]
    }
  ]
})

/** What `markdown_description` keeps on its match. */
type MarkdownDescriptionData = {
  /** Name of the type it describes, e.g. `Card`. */
  typeName?: string
  /** Its markdown, e.g. `A playing card:  a **rank** and a **suit**.` */
  markdown?: string
}
