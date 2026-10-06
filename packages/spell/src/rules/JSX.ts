/**
 * Rules for JSX -- elements (`<tag attr=.../>`), attributes, text, end tags, and `{...}` expression
 * containers, all tokenized up front by `P.JSXElementToken` & friends and re-parsed here.
 */

import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"
import { commitStatement } from "./Statement"

/**
 * Rule module for JSX rules (`jsxElement`, `jsxAttribute`, `jsxText`, `jsxEndTag`, `jsxExpression`).
 * - Each rule class below is followed by the `JSX.addRule()` call which defines and registers it.
 */
export const JSX = new SpellParser({ module: "JSX" })

////////////////
// ## `jsxElement` rule
//    e.g. "<a/>"
////////////////

/**
 * Match a JSX element (`<tag attr=.../>` or `<tag>...</tag>`) as an `expression`/`jsxChild`.
 * - Delegates tokenizing entirely to `P.JSXElementToken`; `parse()` re-parses each attribute/child
 *   token through `jsxAttribute`/`jsxChild` (falling back to `parse_error` for unparseable children).
 * - Compiles to `spellCore.element({ tag, props, children })`.
 * - NOTE: rule name is `jsxElement`, kept distinct from class name `SpellJSX` (pre-existing convention).
 */
export class SpellJSX extends P.TokenType<never, JSXMatchData> {
  static ruleName = "jsxElement"
  @proto static alias = ["jsxChild", "expression"]
  @proto static tokenType = P.JSXElementToken

  /** Parse element's `attributes`/`children` tokens (see note below re: calling `parser.parse()` directly). */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    if (match.matched.length !== 1) throw new TypeError("Can only handle a single JSXElement at a time!")
    const [element] = match.matched as [P.JSXElementToken]
    // `Scope.parse()` only accepts a `string` for `text`, but we have actual `Token`s here -- call
    // `scope.parser.parse()` directly instead (same workaround `SpellCSSFile.parse()` uses).
    match.data.attributes = element.attributes?.map((attr) => scope.parser?.parse(attr, "jsxAttribute", scope))
    match.data.children = element.children?.map(
      (child) => scope.parser?.parse(child, "jsxChild", scope) || scope.parser?.parse(child, "parse_error", scope)
    )
    // console.warn(match)
    return match
  }

  /** Build `P.ASTJSXElement`; drops falsy child ASTs (e.g. blank `jsxText`) via `.filter(Boolean)`. */
  getAST(match: P.MatchFor<this>) {
    const { tagName } = match.matched[0] as P.JSXElementToken
    const attrs = match.data.attributes?.map((attr) => P.asAST<P.ASTJSXAttribute>(attr?.AST))
    const children =
      match.data.children
        ?.map((child) => P.asAST<P.ASTJSXElement | P.ASTJSXEndTag | P.ASTJSXText | P.ASTJSXExpression>(child?.AST))
        .filter(Boolean) ?? []
    return new P.ASTJSXElement(match, { tagName, attrs, children })
  }

  /**
   * Parse errors from JSX `{...}` contents anywhere in `statement`, e.g. `print <div>{foo bar}</div>`.
   * - JSX rules keep what they parse out of their tokens in `match.data`, not `matched`,
   *   so nothing else finds these.
   * - Looks through the statement's own matches and any inline body.
   *   NOT an indented body:  that's a `block`, which gathers its own errors.
   * - The errors still compile where they are, inside the JSX.  This is just so they're REPORTED.
   * - Static:  `BlockLine` asks, about any statement.
   */
  static parseErrorsIn(statement: P.Match): P.Match[] {
    const errors: P.Match[] = []
    visit(statement)
    return errors

    /** Collect `match`'s JSX error, if it has one, then look below it. */
    function visit(match: P.Match) {
      if (match.rule.name === "block") return
      const below: Array<P.Match | P.Token | undefined> = [...match.matched]
      if (match.is(SpellJSX)) below.push(...(match.data.attributes ?? []), ...(match.data.children ?? []))
      if (match.is(SpellJSXContent)) {
        if (match.data.error) errors.push(match.data.error)
        below.push(match.data.expression, match.data.statement)
      }
      below.push(match.data.body as P.Match | undefined)
      for (const item of below) if (item instanceof P.Match) visit(item)
    }
  }
}
JSX.addRule(SpellJSX, {
  tests: [
    {
      title: "Simple nested elements",
      compileAs: "expression",
      tests: [
        [`<a/>`, `spellCore.element({ tag: "a" })`],
        [`<a></a>`, `spellCore.element({ tag: "a" })`],
        [`<a b=1 c="ccc"/>`, `spellCore.element({ tag: "a", props: { b: 1, c: "ccc" } })`],
        [
          `<a b=1 c="ccc" d></a>`,
          [`spellCore.element({`, `  tag: "a",`, `  props: {`, `    b: 1,`, `    c: "ccc",`, `    d: true`, `  }`, `})`]
        ],

        [`<a><b/></a>`, [`spellCore.element({ tag: "a", children: [`, `  spellCore.element({ tag: "b" })`, `] })`]],
        [`<a><b></b></a>`, [`spellCore.element({ tag: "a", children: [`, `  spellCore.element({ tag: "b" })`, `] })`]],
        [
          `<a A=1><b c=1>foo</b></a>`,
          [
            `spellCore.element({ tag: "a", props: { A: 1 }, children: [`,
            `  spellCore.element({ tag: "b", props: { c: 1 }, children: [`,
            `    "foo"`,
            `  ] })`,
            `] })`
          ]
        ],
        [
          `<a><b><c>d</c></b></a>`,
          [
            `spellCore.element({ tag: "a", children: [`,
            `  spellCore.element({ tag: "b", children: [`,
            `    spellCore.element({ tag: "c", children: [`,
            `      "d"`,
            `    ] })`,
            `  ] })`,
            `] })`
          ]
        ],
        [
          `<a>\n\tBBB\n\t<c/>\n\tDDD</a>`,
          [
            'spellCore.element({ tag: "a", children: [',
            '  "BBB",',
            '  spellCore.element({ tag: "c" }),',
            '  "DDD"',
            "] })"
          ]
        ],
        [
          ["<ui-button ", "\thidden={1} ", "\tonPress={print 2}", "\t/>"],
          [
            "spellCore.element({",
            '  tag: "ui-button",',
            "  props: {",
            "    hidden: 1,",
            "    onPress: (event) => {",
            "      return spellCore.console.log(2)",
            "    }",
            "  }",
            "})"
          ]
        ],
        [
          '<input attrOnly text="text" number=1 boolean={yes} expression={1 + 1} onClick={print the value of the target of the event} />',
          [
            `spellCore.element({`,
            `  tag: "input",`,
            `  props: {`,
            `    attrOnly: true,`,
            `    text: "text",`,
            `    number: 1,`,
            `    boolean: true,`,
            `    expression: (1 + 1),`,
            `    onClick: (event) => {`,
            `      return spellCore.console.log(event.target.value)`,
            `    }`,
            `  }`,
            `})`
          ]
        ]
      ]
    },
    {
      title: "Attribute expressions",
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("card")
      },
      tests: [
        [`<div foo/>`, `spellCore.element({ tag: "div", props: { foo: true } })`],
        [
          `<div rank={the rank of the card} value={1 + 2 + 3}/>`,
          `spellCore.element({ tag: "div", props: { rank: card.rank, value: ((1 + 2) + 3) } })`
        ],
        [
          `<div rank={unknown expression} value={another unknown expression}/>`,
          `spellCore.element({ tag: "div", props: { rank: undefined /* PARSE ERROR: Don't understand "unknown expression" */, value: undefined /* PARSE ERROR: Don't understand "another unknown expression" */ } })`
        ],
        // DO parse a statement as an attribute expression
        [
          `<div on-click={print 1024}/>`,
          [
            `spellCore.element({`,
            `  tag: "div",`,
            `  props: {`,
            `    'on-click': (event) => {`,
            `      return spellCore.console.log(1024)`,
            `    }`,
            `  }`,
            `})`
          ]
        ],
        // don't match attribute expressions that don't eat the entire text
        [
          "<div foo={true true}/>",
          `spellCore.element({ tag: "div", props: { foo: undefined /* PARSE ERROR: Don't understand "true true" */ } })`
        ],
        // ignore newlines in attribute expression
        // NOTE: this was previously a comma expression `(a, b)` instead of a `[a, b]` tuple, which JS
        // silently evaluated to a single-element array (the comma operator discards `a`) -- a latent
        // bug surfaced by `RuleTest`'s tuple typing. Fixed to the evidently-intended 2-tuple.
        ["<div foo={\n1 + \n\t2\n\t}/>", `spellCore.element({ tag: "div", props: { foo: (1 + 2) } })`]
      ]
    },
    {
      title: "Inline expressions",
      compileAs: "expression",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("card")
      },
      tests: [
        [
          `<div foo={<a><b><c>{1}</c></b></a>}/>`,
          [
            'spellCore.element({ tag: "div", props: { foo: spellCore.element({ tag: "a", children: [',
            '  spellCore.element({ tag: "b", children: [',
            '    spellCore.element({ tag: "c", children: [',
            "      1",
            "    ] })",
            "  ] })",
            "] }) } })"
          ]
        ],
        // compound expression
        [`<div>{1 + 2 + 3}</div>`, ['spellCore.element({ tag: "div", children: [', "  ((1 + 2) + 3)", "] })"]],
        // multi-line expression is fine
        [
          "<div>{\n\t1 + \n2 + 3\t\n}</div>",
          ['spellCore.element({ tag: "div", children: [', "  ((1 + 2) + 3)", "] })"]
        ],
        //
        [`<div>{the rank of the card}</div>`, ['spellCore.element({ tag: "div", children: [', "  card.rank", "] })"]],
        // fail if we don't eat entire expression
        [
          `<div>{true true}</div>`,
          [
            'spellCore.element({ tag: "div", children: [',
            '  null /* PARSE ERROR: Don\'t understand "true true" */',
            "] })"
          ]
        ],
        // fail on unknown expression
        [
          `<div>{unknown expression}</div>`,
          [
            'spellCore.element({ tag: "div", children: [',
            '  null /* PARSE ERROR: Don\'t understand "unknown expression" */',
            "] })"
          ]
        ],
        // DO NOT parse a inline statement as a JSXExpression
        [
          `<div>{print 1024}</div>`,
          [
            'spellCore.element({ tag: "div", children: [',
            '  null /* PARSE ERROR: Don\'t understand "print 1024" */',
            "] })"
          ]
        ]
      ]
    }
  ]
})

////////////////
// ## `SpellJSXContent` base class
//    e.g. "{1}" or "onClick={fire event x}" -- JSX whose contents parse as spell
////////////////

/**
 * Base for JSX rules which parse spell out of their token's text:  `jsxAttribute` values and `jsxExpression`s.
 * - What they parse goes in `match.data` (`expression` / `statement` / `error`), NOT `matched` --
 *   see `SpellJSX.parseErrorsIn()`, which finds errors there.
 */
class SpellJSXContent extends P.TokenType<never, JSXMatchData> {
  /**
   * Move tokens `parsed` from a COPY of `jsxToken`'s `{...}` contents to where that text sits in the FILE,
   * so errors and positions inside JSX line up with the source.
   * - The copy is trimmed, with newlines collapsed to spaces:  same length, so one shift puts every token right.
   * - Copy's char 0 is the file's `{`, plus 1, plus whatever whitespace `trim()` dropped in front.
   * - `line` / `ch` come from `jsxToken`'s own, counting the newlines in its `raw` up to each inner token.
   *   The copy lost them, and we haven't got the file text here.
   * - SIDE EFFECT:  remembers the tokens as `jsxToken.innerTokens`,
   *   so `Tokenizer.forEachToken()` keeps them current after an edit.
   * - Losing candidates parse the same token too, so `innerTokens` may hold tokens of matches nobody kept.
   *   Moving those as well is harmless.
   */
  protected placeInFile(parsed: P.Match | undefined, jsxToken: P.JSXExpressionToken) {
    const { contents, raw, start, line = 0, ch = 0 } = jsxToken
    if (!parsed || typeof contents !== "string" || !raw) return
    const lead = contents.length - contents.trimStart().length
    P.Tokenizer.shiftTokens(parsed.tokens, start + raw.indexOf("{") + 1 + lead)
    P.Tokenizer.forEachToken(parsed.tokens, (token) => {
      const before = raw.slice(0, token.start - start)
      const lastNewline = before.lastIndexOf("\n")
      token.record.line = line + (before.split("\n").length - 1)
      token.record.ch = lastNewline === -1 ? ch + before.length : before.length - lastNewline - 1
    })
    ;(jsxToken.innerTokens ??= []).push(...parsed.tokens)
  }
}

////////////////
// ## `jsxAttribute` rule
//    e.g. "foo" (bare attribute), "foo=1", or "foo={expression}"
////////////////

/**
 * Match a single JSX attribute (`name`, `name=value`, or `name={expression}`).
 * - `on*` attribute names (e.g. `onClick`) parse `value` as a `statement` inside a `MethodScope` with
 *   an implicit `event` argument, producing an inline event-handler method rather than an expression.
 * - Falls back to `parse_error` if neither an `expression` nor `on*` `statement` consumes the whole value.
 * - NOTE: rule name is `jsxAttribute`, kept distinct from class name `SpellJSXAttribute` (pre-existing convention).
 */
class SpellJSXAttribute extends SpellJSXContent {
  static ruleName = "jsxAttribute"
  @proto static tokenType = P.JSXAttributeToken

  /**
   * Parse `value` as an expression, or (for `on*` attribute names) as a `statement` with an
   * implicit `event` argument -- falls back to a `parse_error` match if neither consumes it all.
   */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    if (match.matched.length !== 1) throw new TypeError("Can only handle a single JSXAttribute at a time!")
    // pull attribute name up to match
    const attributeToken = match.matched[0] as P.JSXAttributeToken
    match.data.attribute = attributeToken.name
    // parse `value` if as a number or JSXExpression
    const { value } = match
    if (value) {
      const inputIsExpression = value instanceof P.JSXExpressionToken
      // `JSXExpression.contents` is typed `string | Token` (a bare, un-braced attribute value is
      // tokenized via `matchJSXAttributeValueIdentifier`, which sets `contents` to a `Token`), but this
      // rule (as in the original JS) only ever handles the braced/string form here.
      const input = inputIsExpression ? (value.contents as string).trim().replace(/\n/g, " ") : value
      // parse "onXXX" as an inline method with an `event` argument
      if (match.data.attribute.startsWith("on")) {
        const methodScopeProps: P.MethodScopeProps = {
          parentScope: scope,
          args: ["event"],
          mapItTo: "this",
          declaredBy: match
        }
        const methodScope = new P.MethodScope(methodScopeProps)
        const statement = methodScope.parse(input, "statement")
        if (statement && statement.inputText.length === input.length) {
          // We're keeping it, so lock it in -- its scope changes happen now, in the handler's own scope.
          commitStatement(statement)
          match.data.statement = statement
        }
      } else {
        const expression = scope.parse(input, "expression")
        if (expression && (!inputIsExpression || expression.inputText.length === input.length)) {
          match.data.expression = expression
        }
      }
      // if neither worked, parse error
      if (!match.data.expression && !match.data.statement) match.data.error = scope.parse(input, "parse_error")
      // console.warn({ match, name: match.data.attribute, inputIsExpression, value, input })
      if (inputIsExpression) this.placeInFile(match.data.statement ?? match.data.expression ?? match.data.error, value)
    }
    return match
  }

  /**
   * Build `P.ASTJSXAttribute`.
   * - `statement` value becomes an inline `P.ASTMethodDefinition` (with an `event` arg for `on*` names).
   * - Missing `value` (bare attribute, e.g. `<input disabled/>`) becomes `true`.
   */
  getAST(match: P.MatchFor<this>) {
    const { attribute, expression, statement, error } = match.data
    const { value } = match
    let valueAST: P.ASTExpression | undefined
    if (expression) valueAST = P.asAST<P.ASTExpression>(expression.AST)
    else if (statement) {
      valueAST = new P.ASTMethodDefinition(match, {
        inline: true,
        // `attribute` is always set by `parse()` before this match can exist -- `!` because `JSXMatchData`
        // shares the field with `jsxElement`/`jsxExpression` matches, which never set it, so it stays optional.
        args: attribute!.toLowerCase().startsWith("on")
          ? [new P.ASTVariableExpression(match, { name: "event" })]
          : undefined,
        body: P.asAST<P.ASTStatementBlock | P.ASTStatement | P.ASTExpression>(statement.AST)
      })
    } else if (value === undefined) {
      valueAST = new P.ASTBooleanLiteral(match, { value: true })
    } else if (value instanceof P.TextToken) {
      valueAST = new P.ASTStringLiteral(match, { value: value.innerText, quote: '"', raw: value.value })
    } else if (!error) {
      console.warn("jsxAttribute.getAST: don't know how to render value", value, " for match ", match)
      valueAST = new P.ASTNothingLiteral(match)
    }
    return new P.ASTJSXAttribute(match, {
      name: attribute!,
      value: valueAST,
      error: error?.AST as P.ASTParseError | undefined
    })
  }
}
JSX.addRule(SpellJSXAttribute)

////////////////
// ## `jsxText` rule
//    e.g. "hello" (literal text between JSX tags)
////////////////

/**
 * Match literal text between JSX tags (`jsxChild`).  Blank text yields no AST node -- see below.
 * - NOTE: rule name is `jsxText`, kept distinct from class name `SpellJSXText` (pre-existing convention).
 */
class SpellJSXText extends P.TokenType {
  static ruleName = "jsxText"
  @proto static alias = "jsxChild"
  @proto static tokenType = P.JSXTextToken

  /** Build `P.ASTJSXText` of the trimmed text;  returns `undefined` for blank text since there's nothing to render. */
  getAST(match: P.MatchFor<this>) {
    const { raw, value } = match.matched[0] as P.JSXTextToken
    const text = value.trim()
    // Blank text has nothing to render -- return `undefined` for "no AST" (`Rule.getAST()`'s return
    // type already permits this; `Match.AST` treats a falsy return as "no AST").
    if (!text) return undefined
    return new P.ASTJSXText(match, { raw, value: text })
  }
}
JSX.addRule(SpellJSXText)

////////////////
// ## `jsxEndTag` rule
//    e.g. "</a>"
////////////////

/**
 * Match a JSX closing tag (`</tag>`), tracked as a `jsxChild` alongside element/text/expression children.
 * - NOTE: rule name is `jsxEndTag`, kept distinct from class name `SpellJSXEndTag` (pre-existing convention).
 */
class SpellJSXEndTag extends P.TokenType {
  static ruleName = "jsxEndTag"
  @proto static alias = "jsxChild"
  @proto static tokenType = P.JSXEndTagToken

  getAST(match: P.MatchFor<this>) {
    const { tagName } = match.matched[0] as P.JSXEndTagToken
    return new P.ASTJSXEndTag(match, { tagName })
  }
}
JSX.addRule(SpellJSXEndTag)

////////////////
// ## `jsxExpression` rule
//    e.g. "{1}"
////////////////

/**
 * Match a `{...}` JSX expression container (a `jsxChild`, e.g. `<div>{1 + 2}</div>`).
 * - Trims and collapses newlines in the raw contents before parsing as an `expression`.
 * - Falls back to `parse_error` if the expression doesn't consume the entire contents.
 * - NOTE: rule name is `jsxExpression`, kept distinct from class name `SpellJSXExpression` (pre-existing convention).
 */
class SpellJSXExpression extends SpellJSXContent {
  static ruleName = "jsxExpression"
  @proto static alias = "jsxChild"
  @proto static tokenType = P.JSXExpressionToken

  /** Parse `contents` as an `expression`; falls back to `parse_error` if it doesn't consume it all. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    // trim and remove newlines from expression (???)
    // See note above re: `JSXExpression.contents` being typed `string | Token`.
    const jsxToken = match.matched[0] as P.JSXExpressionToken
    const input = (jsxToken.contents as string).trim().replace(/\n/g, " ")
    // only match expression if we used all of the input
    const expression = scope.parse(input, "expression")
    if (expression && expression.inputText.length === input.length) {
      match.data.expression = expression
    } else {
      match.data.error = scope.parse(input, "parse_error")
    }
    this.placeInFile(match.data.expression ?? match.data.error, jsxToken)
    return match
  }
  getAST(match: P.MatchFor<this>) {
    const { expression, error } = match.data
    return new P.ASTJSXExpression(match, {
      expression: expression?.AST as P.ASTExpression | undefined,
      error: error?.AST as P.ASTParseError | undefined
    })
  }
}
JSX.addRule(SpellJSXExpression)

////////////////
// ## Shared types
////////////////

/**
 * What JSX rules (`jsxElement`, `jsxAttribute`, `jsxExpression`) stash on their matches.
 * - Shared by all three because they cross-reference each other's matches (e.g. `jsxElement` holds an
 *   array of `jsxAttribute` matches) -- splitting per-rule would just mean re-importing one another's type.
 */
export type JSXMatchData = {
  /** (`jsxAttribute`/`jsxExpression`) Sub-expression match parsed out of the attribute/expression value. */
  expression?: P.Match
  /** (`jsxAttribute`) Sub-statement match parsed out of an `on*` attribute value, e.g. an inline event handler. */
  statement?: P.Match
  /** (`jsxAttribute`/`jsxExpression`) `parse_error` match recorded when neither `expression` nor `statement` could be parsed. */
  error?: P.Match
  /** (`jsxElement`) Parsed `jsxAttribute` matches for the element. */
  attributes?: Array<P.Match | undefined>
  /** (`jsxAttribute`) Normalized attribute name. */
  attribute?: string
  /** (`jsxElement`) Parsed child matches (`jsxChild` or `parse_error`) for the element. */
  children?: Array<P.Match | undefined>
}
