import { proto } from "@spell-app/util"
import { P } from "$/parser"
import { JSX } from "./JSX.parser"
import { SpellJSX } from "./SpellJSX"

/**
 * `jsxFragment` rule:  several elements drawn side by side, with no element around them, `<>...</>`.
 * - e.g. `<><a/><b/></>`
 * - So a `to draw` can return two elements:
 *
 *   ```spell
 *   to draw a game:
 *     return <>
 *       <ui-container>...</ui-container>
 *       <ui-grid>...</ui-grid>
 *     </>
 *   ```
 *
 * - Or IMPLICIT:  elements written one after another are one fragment, as if wrapped in `<>...</>`.
 *   - `return <ui-container>...</ui-container>`, then `<ui-grid>...</ui-grid>` on the line below
 *   - On the same line, or the next lines, indented at least as far as the line the first one starts on:
 *     see `P.Tokenizer.matchJSXElements()`.
 * - `P.JSXFragmentToken` does the tokenizing;  its children are parsed as an element's are (`SpellJSX.parse()`).
 * - Compiles to a list of its children in javascript, `[h("a"), h("b")]`, as Solid's `h()` takes a fragment;
 *   `<>...</>` in TypeScript:  see `P.JSWriter`, `P.TSWriter`.
 */
export class SpellJSXFragment extends SpellJSX {
  static ruleName = "jsxFragment"
  @proto static tokenType = P.JSXFragmentToken

  /** `P.ASTJSXFragment`, of its children. */
  getAST(match: P.MatchFor<this>) {
    return new P.ASTJSXFragment(match, { children: this.childASTs(match) })
  }
}
JSX.addRule(SpellJSXFragment, {
  tests: [
    {
      title: "Explicit fragments:  <>...</>",
      compileAs: "expression",
      tests: [
        [`<><a/><b/></>`, ["[", '  h("a"),', '  h("b")', "]"], ["<>", "  <a />", "  <b />", "</>"]],
        [`<></>`, "[]", "<></>"],
        [`<>Hello</>`, '["Hello"]', "<>Hello</>"],
        [
          `<>\n\t<a>A</a>\n\t<b>B</b>\n</>`,
          ["[", '  h("a", "A"),', '  h("b", "B")', "]"],
          ["<>", "  <a>A</a>", "  <b>B</b>", "</>"]
        ],
        // inside an element, and an element inside it
        [
          `<div><><a/>{1 + 2}</></div>`,
          ['h("div",', "  [", '    h("a"),', "    () => 1 + 2", "  ]", ")"],
          ["<div>", "  <>", "    <a />", "    {1 + 2}", "  </>", "</div>"]
        ]
      ]
    },
    {
      title: "Implicit fragments:  elements one after another",
      compileAs: "expression",
      tests: [
        // on one line
        [`<a>A</a> <b>B</b>`, ["[", '  h("a", "A"),', '  h("b", "B")', "]"], ["<>", "  <a>A</a>", "  <b>B</b>", "</>"]],
        // on the next line
        [
          `<ui-container>\n\tA\n</ui-container>\n<ui-grid>\n\tB\n</ui-grid>`,
          ["[", '  h("ui-container", "A"),', '  h("ui-grid", "B")', "]"],
          ["<>", "  <ui-container>A</ui-container>", "  <ui-grid>B</ui-grid>", "</>"]
        ]
      ]
    }
  ]
})
