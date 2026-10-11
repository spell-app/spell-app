import { proto } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
import { type FillInParts, parseFillIn } from "$/spell/rules/core"
import { Priority } from "$/spell/rules/rules.types"
import { JSX } from "./JSX.parser"
import { MARKDOWN_TAG, rawTextOf } from "./JSX.shared"

/**
 * `markdown_block` rule:  formatted text in a drawing, drawn by Spell UI's `<ui-markdown>` (epic `drawable-thing`, P14).
 *
 * ```spell
 * to draw a rules panel:
 *   return <div className="rules">
 *     <markdown>
 *       ## Klondike
 *       Build each pile **down**.  Score:  **{the score of the game}**
 *     </markdown>
 *   </div>
 * ```
 *
 * - The markdown is never read as spell:  the tokenizer takes a `<markdown>` element's contents as raw text
 *   (`rawTextTags`), so its `*`, `#`, `<` reach the page as written.
 * - The indent its lines share comes off, so the block can sit indented in a drawing.
 * - A `{hole}` shows a LIVE value, as a `<spell-app>` layout's text does:  the markdown is drawn again
 *   when a value it shows changes.
 *   - A hole is a spell expression, read as a text fill-in is (`parseFillIn()`):  `{rank}` ~== `{its rank}`
 *     in a card's drawing;  one that doesn't read is tried again with `the` before it, as a layout's is.
 *   - A hole that still doesn't read is a parse error:  write `\{` for a real brace (markdown shows `{`).
 *   - Code keeps its braces:  a fenced code block, or a `` `code` `` span.
 * - Compiles to `<ui-markdown>` with the markdown as its TEXT (Q24:  no markdown parser in the compiler):
 *   `h("ui-markdown", "## Klondike\n...")`, or a template string inside `() => ...` with holes.
 * - In a type's outline, a `<markdown>` block is the type's description instead:  `markdown_description`.
 */
export class MarkdownBlock extends P.TokenType<never, MarkdownBlockData> {
  @proto static alias = ["jsxChild", "expression"]
  @proto static tokenType = P.JSXElementToken
  // beats `jsxElement`, which would draw a `<markdown>` tag
  @proto static priority = Priority.preferred

  /** A `<markdown>` element:  its text split into plain markdown and parsed holes. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const [element] = tokens
    if (!(element instanceof P.JSXElementToken) || element.tagName !== MARKDOWN_TAG) return undefined
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const errors: P.Match[] = []
    match.data.parts = MarkdownBlock.partsOf(rawTextOf(element)).map((part) => {
      if (typeof part === "string") return part
      const hole = parseFillIn(scope, part.hole) ?? parseFillIn(scope, `the ${part.hole}`)
      if (hole) return hole
      const error = SP.spellParser.createParseError(
        scope,
        [element],
        `Don't understand "{${part.hole}}" in <markdown>:  a hole is spell, e.g. {the score of the game};  write \\{ for a brace`
      )
      errors.push(error)
      return error
    })
    if (errors.length) match.data.errors = errors
    return match
  }

  /**
   * `<ui-markdown>`, its markdown as its one child:
   * - no holes:  the text, as is
   * - with holes:  a template string, which the drawing reads again when a hole's value changes
   */
  getAST(match: P.MatchFor<this>) {
    const { parts = [] } = match.data
    const plain = parts.every((part) => typeof part === "string") ? parts.join("") : undefined
    const child =
      plain === undefined
        ? new P.ASTJSXExpression(match, {
            expression: new P.ASTTemplateString(match, {
              parts: parts.map((part) => (typeof part === "string" ? MarkdownBlock.escaped(part) : holeAST(part)))
            })
          })
        : new P.ASTJSXExpression(match, {
            expression: new P.ASTStringLiteral(match, { value: plain, quote: '"' })
          })
    return new P.ASTJSXElement(match, { tagName: UI_MARKDOWN_TAG, attrs: [], children: [child] })
  }

  /**
   * `markdown` split into plain markdown and the spell of each `{hole}`, in order.
   * - `\{` is a real brace:  kept as written, for markdown to show as `{`.
   * - Code keeps its braces:  every line of a fenced code block (` ``` ` or `~~~`), and each `` `code` `` span.
   * - A hole is on one line, with no braces inside;  `{}` and `{ }` are plain.
   * - Static:  pure text, no scope needed.
   */
  static partsOf(markdown: string): Array<string | { hole: string }> {
    const parts: Array<string | { hole: string }> = []
    let plain = ""
    let fence: string | undefined
    for (const line of markdown.split(/(?<=\n)/)) {
      const mark = FENCE.exec(line)?.[1]
      if (fence) {
        if (mark && mark[0] === fence[0] && mark.length >= fence.length) fence = undefined
        plain += line
        continue
      }
      if (mark) {
        fence = mark
        plain += line
        continue
      }
      let index = 0
      while (index < line.length) {
        const rest = line.slice(index)
        const code = CODE_SPAN.exec(rest)?.[0]
        const hole = HOLE.exec(rest)
        if (rest.startsWith("\\{")) {
          plain += "\\{"
          index += 2
        } else if (code) {
          plain += code
          index += code.length
        } else if (hole) {
          if (plain) parts.push(plain)
          parts.push({ hole: hole[1]!.trim() })
          plain = ""
          index += hole[0].length
        } else {
          plain += line[index]
          index++
        }
      }
    }
    if (plain) parts.push(plain)
    return parts
  }

  /**
   * Plain markdown as a template string's part:  backslashes kept, line breaks as `\n`,
   * so the compiled template is ONE line and keeps every character of the markdown.
   * - The writer escapes back ticks and `${` itself:  see `P.JSWriter.ASTTemplateString()`.
   */
  static escaped(markdown: string): string {
    return markdown.replace(/\\/g, "\\\\").replace(/\n/g, "\\n")
  }
}
JSX.addRule(MarkdownBlock, {
  tests: [
    {
      title: "Markdown, as written",
      compileAs: "expression",
      tests: [
        [
          ["<markdown>", "\t## Klondike", "\tBuild each pile **down**, alternating colours.", "</markdown>"],
          'h("ui-markdown", "## Klondike\\nBuild each pile **down**, alternating colours.")',
          '<ui-markdown>{"## Klondike\\nBuild each pile **down**, alternating colours."}</ui-markdown>'
        ],
        // `*`, `#`, `<`, back ticks and braces in code, an escaped brace:  all untouched
        [
          [
            "<markdown>",
            "\t# Rules <small>v2</small>",
            "\t* a *list* with `{code}` and \\{braces\\}",
            "\t```css",
            "\t.red { color: crimson }",
            "\t```",
            "</markdown>"
          ],
          [
            'h("ui-markdown",',
            '  "# Rules <small>v2</small>\\n* a *list* with `{code}` and \\\\{braces\\\\}\\n```css\\n.red { color: crimson }\\n```"',
            ")"
          ],
          [
            "<ui-markdown>",
            '  {"# Rules <small>v2</small>\\n* a *list* with `{code}` and \\\\{braces\\\\}\\n```css\\n.red { color: crimson }\\n```"}',
            "</ui-markdown>"
          ]
        ],
        // inside a drawing, indented with it
        [
          ["<div>", "\t<markdown>", "\t\tHello **there**", "\t</markdown>", "</div>"],
          'h("div", h("ui-markdown", "Hello **there**"))',
          ["<div>", '  <ui-markdown>{"Hello **there**"}</ui-markdown>', "</div>"]
        ]
      ]
    },
    {
      title: "Holes, live",
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("card")
      },
      tests: [
        [
          ["<markdown>", "\tRank:  **{the rank of the card}**", "</markdown>"],
          'h("ui-markdown", () => `Rank:  **${card.rank}**`)',
          "<ui-markdown>{`Rank:  **${card.rank}**`}</ui-markdown>"
        ],
        // `the` before it, as a layout's hole;  a back tick and `${` in the text stay text
        [
          ["<markdown>", "\t`${x}` and {rank of the card}!", "</markdown>"],
          'h("ui-markdown", () => `\\`\\${x}\\` and ${card.rank}!`)',
          "<ui-markdown>{`\\`\\${x}\\` and ${card.rank}!`}</ui-markdown>"
        ],
        // a hole that doesn't read:  a parse error
        [
          ["<markdown>", "\tHi {foo bar baz}", "</markdown>"],
          [
            'h("ui-markdown",',
            '  () => `Hi ${null /* PARSE ERROR: Don\'t understand "{foo bar baz}" in <markdown>:  a hole is spell, e.g. {the score of the game};  write \\{ for a brace */}`',
            ")"
          ],
          [
            "<ui-markdown>",
            '  {`Hi ${null /* PARSE ERROR: Don\'t understand "{foo bar baz}" in <markdown>:  a hole is spell, e.g. {the score of the game};  write \\{ for a brace */}`}',
            "</ui-markdown>"
          ]
        ]
      ]
    }
  ]
})

/** What `markdown_block` keeps on its match. */
type MarkdownBlockData = {
  /** Its markdown, in order:  plain text, and each hole's parsed expression (or its parse error). */
  parts?: FillInParts
  /** A parse error for each hole that doesn't read -- see `SpellJSX.parseErrorsIn()`, which reports them. */
  errors?: P.Match[]
}

/** A hole's value in the template:  its expression, or `null` with its parse error beside it. */
function holeAST(part: P.Match): P.ASTExpression {
  if (part.rule.name !== "parse_error") return P.matchAST<P.ASTExpression>(part)
  return new P.ASTExpressionWithComment(part, {
    expression: new P.ASTMissingExpression(part),
    comment: P.matchAST<P.ASTParseError>(part)
  })
}

/** Spell UI's markdown element, which draws it. */
const UI_MARKDOWN_TAG = "ui-markdown"

/** A line opening or closing a fenced code block, its fence captured:  ` ``` `, `~~~js`. */
const FENCE = /^\s*(`{3,}|~{3,})/

/** A `` `code` `` span at the head of the text:  a run of back ticks, up to the same run. */
const CODE_SPAN = /^(`+).*?[^`]\1(?!`)/

/** A hole at the head of the text, its spell captured:  `{the score of the game}`. */
const HOLE = /^\{([^{}\n]*[^{}\s][^{}\n]*)\}/
