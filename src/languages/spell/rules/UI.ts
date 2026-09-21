/**
 * Rules for user-facing I/O statements -- `print`, `notify`, `alert`, `warn`, `confirm`, `prompt` --
 * plus inline `css` string installation.
 */

import { proto } from "~/util"
import { P } from "~/parser"
// Import directly to avoid circular import
import { SpellParser } from "~/languages/spell/SpellParser"
import { SpellStatement } from "./Statement"

/**
 * Narrow `node` (typed generically as `P.ASTNode | undefined`) to concrete AST subclass `T`.
 * - `T` is chosen by inspection: referenced sub-rule's `getAST()` is known to always produce it.
 */
function ast<T extends P.ASTNode>(node: P.ASTNode | undefined): T {
  return node as T
}

/**
 * Print an expression (to the console currently).
 * - `operator` (`info`/`warning`/`error`/`group`/`collapsed group`) selects the `console` method
 *   via `operatorMap`; omitted operator defaults to `log`.
 */
export class print extends SpellStatement<"operator?|expressions"> {
  @proto static alias = "statement"
  @proto static syntax = "print (operator:info|warning|error|collapsed? group)? [expressions: {expression} ,]"

  /** Maps `operator` group value to `console` method name; `default` is used when `operator` is absent. */
  operatorMap: Record<string, string> = {
    info: "info",
    warning: "warn",
    error: "error",
    group: "group",
    "collapsed group": "groupCollapsed",
    default: "log"
  }
  getAST(match: P.MatchFor<this>) {
    const { operator, expressions } = match.groups
    const methodName = this.operatorMap[operator?.value || "default"]
    return new P.ASTConsoleMethodInvocation(match, {
      methodName,
      args: expressions.items.map((item) => ast<P.ASTExpression>(item.AST))
    })
  }

  static tests: P.RuleTests = [
    {
      compileAs: "statement",
      tests: [
        [`print "Yo!"`, `spellCore.console.log("Yo!")`],
        [`print warning "Yo!"`, `spellCore.console.warn("Yo!")`],
        [`print error "Yo!"`, `spellCore.console.error("Yo!")`],
        [`print group "Yo!"`, `spellCore.console.group("Yo!")`],
        [`print collapsed group "Yo!"`, `spellCore.console.groupCollapsed("Yo!")`]
      ]
    }
  ]
}

/** Stop a previous `print group...` */
export class end_print_group extends SpellStatement {
  @proto static alias = "statement"
  @proto static syntax = "end print group"

  getAST(match: P.MatchFor<this>) {
    return new P.ASTConsoleMethodInvocation(match, { methodName: "groupEnd" })
  }

  static tests: P.RuleTests = [
    {
      compileAs: "statement",
      tests: [[`end print group"`, `spellCore.console.groupEnd()`]]
    }
  ]
}

/**
 * Notify user about `message` in a non-modal (popup?) interface.
 * - Returns a promise which `resolve()`s when notice is hidden (manually or otherwise).
 * - NOTE: we DO NOT actually `await` the promise!  ???
 */
export class notify extends SpellStatement<"message|okButton?"> {
  @proto static alias = ["statement", "async"]
  @proto static syntax = "notify {message:expression} (with {okButton:text})?" // TODO: "with close" ?
  @proto static testRule = "notify"

  getAST(match: P.MatchFor<this>) {
    const { message, okButton } = match.groups
    const args: P.ASTExpression[] = [ast<P.ASTExpression>(message.AST)]
    if (okButton) args.push(ast<P.ASTExpression>(okButton.AST))
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "notify",
      args
    })
  }

  static tests: P.RuleTests = [
    {
      compileAs: "statement",
      tests: [
        [`notify "Yo!"`, `spellCore.notify("Yo!")`],
        [`notify "Yo!" with "gotcha"`, `spellCore.notify("Yo!", "gotcha")`]
      ]
    }
  ]
}

/**
 * Show user a `message` in a modal alert.
 * - Returns a promise which resolves when they click `ok`.
 * - NOTE: we'll `await` the promise!
 * - TODO: `the result = await ...` ?
 */
export class alert extends SpellStatement<"message|okButton?"> {
  @proto static alias = ["statement", "async"]
  @proto static syntax = "alert {message:expression} (with {okButton:text})?"
  @proto static testRule = "alert"

  getAST(match: P.MatchFor<this>) {
    const { message, okButton } = match.groups
    const args: P.ASTExpression[] = [ast<P.ASTExpression>(message.AST)]
    if (okButton) args.push(ast<P.ASTExpression>(okButton.AST))
    return new P.ASTAwaitExpression(match, {
      expression: new P.ASTCoreMethodInvocation(match, {
        methodName: "alert",
        args
      })
    })
  }

  static tests: P.RuleTests = [
    {
      compileAs: "statement",
      tests: [
        [`alert "Yo!"`, `await spellCore.alert("Yo!")`],
        [`alert "Yo!" with "yep"`, `await spellCore.alert("Yo!", "yep")`]
      ]
    }
  ]
}

/**
 * Warning message -- like alert but more dire.
 * - Returns a promise which resolves when they click `ok`.
 * - NOTE: we'll `await` the promise!
 * - TODO: `the result = await ...` ?
 */
export class warn extends SpellStatement<"message|okButton?"> {
  @proto static alias = "statement"
  @proto static syntax = "warn {message:expression} (with {okButton:text})?"
  @proto static testRule = "warn"

  getAST(match: P.MatchFor<this>) {
    const { message, okButton } = match.groups
    const args: P.ASTExpression[] = [ast<P.ASTExpression>(message.AST)]
    if (okButton) args.push(ast<P.ASTExpression>(okButton.AST))
    return new P.ASTAwaitExpression(match, {
      expression: new P.ASTCoreMethodInvocation(match, {
        methodName: "warn",
        args
      })
    })
  }

  static tests: P.RuleTests = [
    {
      compileAs: "statement",
      tests: [
        [`warn "Yo!"`, `await spellCore.warn("Yo!")`],
        [`warn "Yo!" with "yep"`, `await spellCore.warn("Yo!", "yep")`]
      ]
    }
  ]
}

/**
 * Confirm message -- present a question with two answers.
 * - Returns a promise which `resolve()`s when they `ok`, `reject()`s if they `cancel`.
 * - NOTE: we'll `await` the promise!
 * - TODO: `the result = await ...` ?
 */
export class confirm extends SpellStatement<"message|okButton?|cancelButton?"> {
  @proto static alias = "statement"
  @proto static syntax = "confirm {message:expression} (with {okButton:text} ((and|or) {cancelButton:text})?)?"
  @proto static testRule = "confirm"

  getAST(match: P.MatchFor<this>) {
    const { message, okButton, cancelButton } = match.groups
    const args: P.ASTExpression[] = [ast<P.ASTExpression>(message.AST)]
    if (okButton) args.push(ast<P.ASTExpression>(okButton.AST))
    if (cancelButton) args.push(ast<P.ASTExpression>(cancelButton.AST))
    return new P.ASTAwaitExpression(match, {
      expression: new P.ASTCoreMethodInvocation(match, {
        methodName: "confirm",
        args
      })
    })
  }

  static tests: P.RuleTests = [
    {
      compileAs: "statement",
      tests: [
        [`confirm "Yo!"`, `await spellCore.confirm("Yo!")`],
        [`confirm "Yo!" with "yep"`, `await spellCore.confirm("Yo!", "yep")`],
        [`confirm "Yo!" with "yep" and "nope"`, `await spellCore.confirm("Yo!", "yep", "nope")`]
      ]
    }
  ]
}

/**
 * Prompt user to specify a value in response to `message` with `defaultValue`.
 * - Returns a promise which `resolve()`s if they "OK", `reject()`s if they "cancel".
 * - TODO: `as number`, `as date`, etc?
 * - NOTE: we'll `await` the promise!
 * - TODO: `the result = await ...` ?
 */
export class prompt extends SpellStatement<"message|defaultValue?"> {
  @proto static alias = "statement"
  @proto static syntax = "prompt {message:expression} (with {defaultValue:expression})?"
  @proto static testRule = "prompt"

  getAST(match: P.MatchFor<this>) {
    const { message, defaultValue } = match.groups
    const args: P.ASTExpression[] = [ast<P.ASTExpression>(message.AST)]
    if (defaultValue) args.push(ast<P.ASTExpression>(defaultValue.AST))
    return new P.ASTAwaitExpression(match, {
      expression: new P.ASTCoreMethodInvocation(match, {
        methodName: "prompt",
        args
      })
    })
  }

  static tests: P.RuleTests = [
    {
      compileAs: "statement",
      tests: [
        [`prompt "Name for the new baby?"`, `await spellCore.prompt("Name for the new baby?")`],
        [`prompt "File name:" with "Untitled"`, `await spellCore.prompt("File name:", "Untitled")`]
      ]
    }
  ]
}

// Chose one or more items from `collection` (of strings???)
// Returns a promise which `resolve()`s if they "OK" with a value, `reject()`s if they "cancel".
// TODO
//     {
//       name: "choose_one",
//       alias: "statement",
//       syntax: "choose ((a|an)? {singular_variable} (from|of)|one of) {collection:expression} with (prompt|message)? {message:expression}",
//          => `await spellCore.chooseOne(message, list, defaultValue)`
//     },

// Chose one or more items from `collection` (of strings???)
// Returns a promise which `resolve()`s if they "OK" with a value, `reject()`s if they "cancel".
// TODO
//     {
//       name: "choose_multiple",
//       alias: "statement",
//       syntax: "choose multiple {plural_variable} (of|from) {collection:expression} with (prompt|message)? {message:expression}",
//          => `await spellCore.chooseMultiple(message, list, defaultValues)`
//     }

/** What `css` rule expects on its matches. */
export type CSSMatchData = {
  /**
   * Name of file the CSS came from, first argument to `spellCore.installStyles()`.
   * - Meant to be set by whoever parsed the file, i.e. `SpellCSSFile.parse()`.
   * - TODO: nobody sets it, so we always output `undefined` -- see SUSPECTED-BUGS.md.
   */
  file?: string
}

/**
 * Parse CSS from a `TextToken` WITHOUT quotes.
 * - Compiles to `spellCore.installStyles(file, css)`; newlines in `css` are escaped to `¬` so the
 *   value survives being embedded in a backtick template literal.
 */
export class css extends P.TokenType<never, CSSMatchData> {
  @proto static alias = "expression"
  @proto static tokenType = P.TextToken

  getAST(match: P.MatchFor<this>) {
    // HACK: `file` is meant to come from `SpellCSSFile` -- see `CSSMatchData`.
    const { value } = match
    const { file } = match.data
    // munge returns to `¬`
    const safeValue = value.replace(/\n/g, "¬")
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "installStyles",
      args: [
        file ? new P.ASTQuotedExpression(match, file) : new P.ASTUndefinedLiteral(match),
        new P.ASTBackTickExpression(match, safeValue)
      ]
    })
  }

  static tests: P.RuleTests = [
    {
      title: "correctly matches css",
      tests: [
        [`""`, `spellCore.installStyles(undefined, \`""\`)`],
        [
          `".Card {\\n\\theight:30px;\\n}\\n"`,
          `spellCore.installStyles(undefined, \`".Card {\\n\\theight:30px;\\n}\\n"\`)`
        ]
      ]
    }
  ]
}

/** Rule module for UI rules (`print`, `end_print_group`, `notify`, `alert`, `warn`, `confirm`, `prompt`, `css`). */
export const UI = new SpellParser({
  module: "UI",
  rules: [print, end_print_group, notify, alert, warn, confirm, prompt, css]
})
