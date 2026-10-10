import { proto } from "$/util"
import { P } from "$/parser"
import { JSX } from "./JSX.parser"
import type { JSXMatchData } from "./JSX.shared"
import { SpellJSXContent } from "./SpellJSXContent"

/**
 * `jsxElement` rule:  match a JSX element (`<tag attr=.../>` or `<tag>...</tag>`) as an `expression`/`jsxChild`.
 * - e.g. `<a/>`
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
        [`<a/>`, `spellCore.element({ tag: "a" })`, "<a />"],
        [`<a></a>`, `spellCore.element({ tag: "a" })`, "<a />"],
        [`<a b=1 c="ccc"/>`, `spellCore.element({ tag: "a", props: { b: 1, c: "ccc" } })`, '<a b={1} c="ccc" />'],
        [
          `<a b=1 c="ccc" d></a>`,
          [
            `spellCore.element({`,
            `  tag: "a",`,
            `  props: {`,
            `    b: 1,`,
            `    c: "ccc",`,
            `    d: true`,
            `  }`,
            `})`
          ],
          '<a b={1} c="ccc" d={true} />'
        ],

        [
          `<a><b/></a>`,
          [`spellCore.element({ tag: "a", children: [`, `  spellCore.element({ tag: "b" })`, `] })`],
          ["<a>", "  <b />", "</a>"]
        ],
        [
          `<a><b></b></a>`,
          [`spellCore.element({ tag: "a", children: [`, `  spellCore.element({ tag: "b" })`, `] })`],
          ["<a>", "  <b />", "</a>"]
        ],
        [
          `<a A=1><b c=1>foo</b></a>`,
          [
            `spellCore.element({ tag: "a", props: { A: 1 }, children: [`,
            `  spellCore.element({ tag: "b", props: { c: 1 }, children: [`,
            `    "foo"`,
            `  ] })`,
            `] })`
          ],
          ["<a A={1}>", "  <b c={1}>foo</b>", "</a>"]
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
          ],
          ["<a>", "  <b>", "    <c>d</c>", "  </b>", "</a>"]
        ],
        [
          `<a>\n\tBBB\n\t<c/>\n\tDDD</a>`,
          [
            'spellCore.element({ tag: "a", children: [',
            '  "BBB",',
            '  spellCore.element({ tag: "c" }),',
            '  "DDD"',
            "] })"
          ],
          ["<a>", "  BBB", "  <c />", "  DDD", "</a>"]
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
          ],
          "<ui-button hidden={1} onPress={() => spellCore.console.log(2)} />"
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
            `    expression: () => (1 + 1),`,
            `    onClick: (event) => {`,
            `      return spellCore.console.log(event.target.value)`,
            `    }`,
            `  }`,
            `})`
          ],
          '<input attronly={true} text="text" number={1} boolean={true} expression={1 + 1} onClick={(event) => spellCore.console.log(event.target.value)} />'
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
        [`<div foo/>`, `spellCore.element({ tag: "div", props: { foo: true } })`, "<div foo={true} />"],
        [
          `<div rank={the rank of the card} value={1 + 2 + 3}/>`,
          `spellCore.element({ tag: "div", props: { rank: () => card.rank, value: () => ((1 + 2) + 3) } })`,
          "<div rank={card.rank} value={1 + 2 + 3} />"
        ],
        [
          `<div rank={unknown expression} value={another unknown expression}/>`,
          `spellCore.element({ tag: "div", props: { rank: undefined /* PARSE ERROR: Don't understand "unknown expression" */, value: undefined /* PARSE ERROR: Don't understand "another unknown expression" */ } })`,
          "<div />"
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
          ],
          "<div on-click={() => spellCore.console.log(1024)} />"
        ],
        // don't match attribute expressions that don't eat the entire text
        [
          "<div foo={true true}/>",
          `spellCore.element({ tag: "div", props: { foo: undefined /* PARSE ERROR: Don't understand "true true" */ } })`,
          "<div />"
        ],
        // ignore newlines in attribute expression
        // NOTE: this was previously a comma expression `(a, b)` instead of a `[a, b]` tuple, which JS
        // silently evaluated to a single-element array (the comma operator discards `a`) -- a latent
        // bug surfaced by `RuleTest`'s tuple typing. Fixed to the evidently-intended 2-tuple.
        [
          "<div foo={\n1 + \n\t2\n\t}/>",
          `spellCore.element({ tag: "div", props: { foo: () => (1 + 2) } })`,
          "<div foo={1 + 2} />"
        ]
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
          ],
          ["<div foo={<a>", "  <b>", "    <c>{1}</c>", "  </b>", "</a>} />"]
        ],
        // compound expression
        [
          `<div>{1 + 2 + 3}</div>`,
          ['spellCore.element({ tag: "div", children: [', "  () => ((1 + 2) + 3)", "] })"],
          "<div>{1 + 2 + 3}</div>"
        ],
        // multi-line expression is fine
        [
          "<div>{\n\t1 + \n2 + 3\t\n}</div>",
          ['spellCore.element({ tag: "div", children: [', "  () => ((1 + 2) + 3)", "] })"],
          "<div>{1 + 2 + 3}</div>"
        ],
        //
        [
          `<div>{the rank of the card}</div>`,
          ['spellCore.element({ tag: "div", children: [', "  () => card.rank", "] })"],
          "<div>{card.rank}</div>"
        ],
        // fail if we don't eat entire expression
        [
          `<div>{true true}</div>`,
          [
            'spellCore.element({ tag: "div", children: [',
            '  null /* PARSE ERROR: Don\'t understand "true true" */',
            "] })"
          ],
          '<div>{null /* PARSE ERROR: Don\'t understand "true true" */}</div>'
        ],
        // fail on unknown expression
        [
          `<div>{unknown expression}</div>`,
          [
            'spellCore.element({ tag: "div", children: [',
            '  null /* PARSE ERROR: Don\'t understand "unknown expression" */',
            "] })"
          ],
          '<div>{null /* PARSE ERROR: Don\'t understand "unknown expression" */}</div>'
        ],
        // DO NOT parse a inline statement as a JSXExpression
        [
          `<div>{print 1024}</div>`,
          [
            'spellCore.element({ tag: "div", children: [',
            '  null /* PARSE ERROR: Don\'t understand "print 1024" */',
            "] })"
          ],
          '<div>{null /* PARSE ERROR: Don\'t understand "print 1024" */}</div>'
        ]
      ]
    }
  ]
})
