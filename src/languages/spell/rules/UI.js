//
//  # Rules for creating variables, property access, etc
//

import { Token } from "~/parser"
import { SpellParser, AST } from "~/languages/spell"
import { NumericLiteral } from "../ast/AST"

export const UI = new SpellParser({
  module: "UI",
  rules: [
    /** Delay for a certain amount of time. */
    {
      name: "wait",
      alias: "statement",
      // TODO: "a second", "a little bit", "a while", "a noticeable amount"
      syntax: "pause for {number:expression} (units:second|seconds|sec|millisecond|milliseconds|msec|tick|ticks)",
      constructor: "Statement",
      getAST(match) {
        const { number, units } = match.groups
        return new AST.AwaitMethodInvocation(match, {
          method: new AST.CoreMethodInvocation(match, {
            methodName: "pauseFor",
            args: [number.AST, new AST.QuotedExpression(units, units.value)]
          })
        })
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            [`pause for 1 second"`, `await spellCore.pauseFor(1, 'second')`],
            [`pause for 2 seconds"`, `await spellCore.pauseFor(2, 'seconds')`],
            [`pause for 500 msec"`, `await spellCore.pauseFor(500, 'msec')`],
            [`pause for 10 ticks"`, `await spellCore.pauseFor(10, 'ticks')`],
            [`pause for (10 + 10) sec`, `await spellCore.pauseFor(10 + 10, 'sec')`]
          ]
        }
      ]
    },

    /** Start a conceptual animation or process. */
    {
      name: "start_process",
      alias: "statement",
      syntax: "start (operator:exclusive|non-exclusive|nonexclusive)? (animation|process) {name:constant}",
      constructor: "Statement",
      getAST(match) {
        const { operator, name } = match.groups
        const exclusive = operator?.value === "exclusive"

        const nameArg = new AST.QuotedExpression(match, name.value)
        const args = [nameArg]
        if (exclusive) args.push(new AST.QuotedExpression(match, "EXCLUSIVE"))

        const startStatement = new AST.CoreMethodInvocation(match, {
          methodName: "startProcess",
          args
        })
        if (!exclusive) return startStatement

        return new AST.StatementGroup(match, {
          statements: [
            new AST.IfStatement(match, {
              condition: new AST.CoreMethodInvocation(match, {
                methodName: "processIsRunning",
                args: [nameArg]
              }),
              statements: new AST.ReturnStatement(match)
            }),
            startStatement
          ]
        })
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            [`start process dealing`, `spellCore.startProcess('dealing')`],
            [`start animation dealing`, `spellCore.startProcess('dealing')`],
            [`start non-exclusive animation dealing`, `spellCore.startProcess('dealing')`],
            [`start nonexclusive process dealing`, `spellCore.startProcess('dealing')`],
            [
              `start exclusive process dealing`,
              [
                `if (spellCore.processIsRunning('dealing')) { return }`,
                `spellCore.startProcess('dealing', 'EXCLUSIVE')`
              ]
            ]
          ]
        }
      ]
    },

    /** Stop a conceptual animation or process. */
    {
      name: "stop_process",
      alias: "statement",
      syntax: "(stop|end|finish|cancel) (animation|process) {name:constant}",
      constructor: "Statement",
      getAST(match) {
        const { operator, name } = match.groups
        const args = [new AST.QuotedExpression(match, name.value)]
        return new AST.CoreMethodInvocation(match, {
          methodName: "stopProcess",
          args
        })
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            [`stop process dealing`, `spellCore.stopProcess('dealing')`],
            [`stop animation dealing`, `spellCore.stopProcess('dealing')`],
            [`end process dealing`, `spellCore.stopProcess('dealing')`],
            [`finish process dealing`, `spellCore.stopProcess('dealing')`],
            [`cancel process dealing`, `spellCore.stopProcess('dealing')`]
          ]
        }
      ]
    },

    /** Check a conceptual animation or process. */
    {
      name: "check_process",
      alias: "expression",
      syntax: "(animation|process) {name:constant} (operator:is|is not|isn't|isnt) (running|active)",
      getAST(match) {
        const { operator, name } = match.groups
        const expression = new AST.CoreMethodInvocation(match, {
          methodName: "processIsRunning",
          args: [new AST.QuotedExpression(match, name.value)]
        })
        if (operator.value === "is") return expression
        return new AST.NotExpression(match, { expression })
      },
      tests: [
        {
          compileAs: "expression",
          tests: [[`animation dealing is running`, `spellCore.processIsRunning('dealing')`]]
        }
      ]
    },

    /** Print an expression (to the console currently) */
    {
      name: "print",
      alias: "statement",
      syntax: "print (operator:warning|error|collapsed? group)?{expression}",
      constructor: "Statement",
      operatorMap: {
        warning: "warn",
        error: "error",
        group: "group",
        "collapsed group": "groupCollapsed",
        default: "log"
      },
      getAST(match) {
        const { operator, expression } = match.groups
        const methodName = this.operatorMap[operator?.value || "default"]
        return new AST.ConsoleMethodInvocation(match, {
          methodName,
          args: [expression.AST]
        })
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            [`print "Yo!"`, `console.log("Yo!")`],
            [`print warning "Yo!"`, `console.warn("Yo!")`],
            [`print error "Yo!"`, `console.error("Yo!")`],
            [`print group "Yo!"`, `console.group("Yo!")`],
            [`print collapsed group "Yo!"`, `console.groupCollapsed("Yo!")`]
          ]
        }
      ]
    },

    /** Stop a previous `print group...` */
    {
      name: "end_print_group",
      alias: "statement",
      syntax: "end print group",
      constructor: "Statement",
      getAST(match) {
        return new AST.ConsoleMethodInvocation(match, { methodName: "groupEnd" })
      },
      tests: [
        {
          compileAs: "statement",
          tests: [[`end print group"`, `console.groupEnd()`]]
        }
      ]
    },

    // Notify user about `message` in a non-modal (popup?) interface.
    // Returns a promise which `resolve()`s when notice is hidden (manually or otherwise).
    // NOTE: we DO NOT actually `await` the promise! ???
    {
      name: "notify",
      alias: ["statement", "async"],
      syntax: "notify {message:expression} (with {okButton:text})?", // TODO: "with close" ?
      testRule: "notify",
      constructor: "Statement",
      getAST(match) {
        const { message, okButton } = match.groups
        const args = [message.AST]
        if (okButton) args.push(okButton.AST)
        return new AST.CoreMethodInvocation(match, {
          methodName: "notify",
          args
        })
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            [`notify "Yo!"`, `spellCore.notify("Yo!")`],
            [`notify "Yo!" with "gotcha"`, `spellCore.notify("Yo!", "gotcha")`]
          ]
        }
      ]
    },

    // Show user a `message` in a modal alert.
    // Returns a promise which resolves when they click `ok`.
    // NOTE: we'll `await` the promise!
    // TODO: `the result = await ...` ?
    {
      name: "alert",
      alias: ["statement", "async"],
      syntax: "alert {message:expression} (with {okButton:text})?",
      testRule: "alert",
      constructor: "Statement",
      getAST(match) {
        match.scope.async = true // TODO!!!
        const { message, okButton } = match.groups
        const args = [message.AST]
        if (okButton) args.push(okButton.AST)
        return new AST.AwaitMethodInvocation(match, {
          method: new AST.CoreMethodInvocation(match, {
            methodName: "alert",
            args
          })
        })
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            [`alert "Yo!"`, `await spellCore.alert("Yo!")`],
            [`alert "Yo!" with "yep"`, `await spellCore.alert("Yo!", "yep")`]
          ]
        }
      ]
    },

    // Warning message -- like alert but more dire.
    // Returns a promise which resolves when they click `ok`.
    // NOTE: we'll `await` the promise!
    // TODO: `the result = await ...` ?
    {
      name: "warn",
      alias: "statement",
      syntax: "warn {message:expression} (with {okButton:text})?",
      testRule: "warn",
      constructor: "Statement",
      getAST(match) {
        match.scope.async = true // TODO!!!
        const { message, okButton } = match.groups
        const args = [message.AST]
        if (okButton) args.push(okButton.AST)
        return new AST.AwaitMethodInvocation(match, {
          method: new AST.CoreMethodInvocation(match, {
            methodName: "warn",
            args
          })
        })
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            [`warn "Yo!"`, `await spellCore.warn("Yo!")`],
            [`warn "Yo!" with "yep"`, `await spellCore.warn("Yo!", "yep")`]
          ]
        }
      ]
    },

    // Confirm message -- present a question with two answers.
    // Returns a promise which `resolve()`s when they `ok`, `reject()`s if they `cancel`.
    // NOTE: we'll `await` the promise!
    // TODO: `the result = await ...` ?
    {
      name: "confirm",
      alias: "statement",
      syntax: "confirm {message:expression} (with {okButton:text} ((and|or) {cancelButton:text})?)?",
      testRule: "confirm",
      constructor: "Statement",
      getAST(match) {
        match.scope.async = true // TODO!!!
        const { message, okButton, cancelButton } = match.groups
        const args = [message.AST]
        if (okButton) args.push(okButton.AST)
        if (cancelButton) args.push(cancelButton.AST)
        return new AST.AwaitMethodInvocation(match, {
          method: new AST.CoreMethodInvocation(match, {
            methodName: "confirm",
            args
          })
        })
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            [`confirm "Yo!"`, `await spellCore.confirm("Yo!")`],
            [`confirm "Yo!" with "yep"`, `await spellCore.confirm("Yo!", "yep")`],
            [`confirm "Yo!" with "yep" and "nope"`, `await spellCore.confirm("Yo!", "yep", "nope")`]
          ]
        }
      ]
    },

    // Prompt user to specify a value in response to `message` with `defaultValue`.
    // Returns a promise which `resolve()`s if they "OK", `reject()`s if they "cancel".
    // TODO: `as number`, `as date`, etc?
    // NOTE: we'll `await` the promise!
    // TODO: `the result = await ...` ?
    {
      name: "prompt",
      alias: "statement",
      syntax: "prompt {message:expression} (with {defaultValue:expression})?",
      testRule: "prompt",
      constructor: "Statement",
      getAST(match) {
        match.scope.async = true // TODO!!!
        const { message, defaultValue } = match.groups
        const args = [message.AST]
        if (defaultValue) args.push(defaultValue.AST)
        return new AST.AwaitMethodInvocation(match, {
          method: new AST.CoreMethodInvocation(match, {
            methodName: "prompt",
            args
          })
        })
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            [`prompt "Name for the new baby?"`, `await spellCore.prompt("Name for the new baby?")`],
            [`prompt "File name:" with "Untitled"`, `await spellCore.prompt("File name:", "Untitled")`]
          ]
        }
      ]
    },

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

    /** Parse CSS from a `Text` token WITHOUT quotes. */
    {
      name: "css",
      alias: ["expression", "single_expression"],
      tokenType: Token.Text,
      getAST(match) {
        // HACK: `name` comes from SpellCSSFile
        const { value, fileName } = match
        // munge returns to `¬`
        const safeValue = value.replace(/\n/g, "¬")
        return new AST.CoreMethodInvocation(match, {
          methodName: "installStyles",
          args: [
            fileName ? new AST.QuotedExpression(match, fileName) : new AST.UndefinedLiteral(match),
            new AST.BackTickExpression(match, safeValue)
          ]
        })
      },
      tests: [
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
  ]
})
