//
//  # Rules for creating variables, property access, etc
//

import { Spell, AST } from "../all"

export default new Spell.Parser({
  module: "UI",
  rules: [
    // Print some value (to the console, I guess)
    {
      name: "print",
      alias: "statement",
      syntax: "print {expression}",
      constructor: Spell.Rule.Statement,
      getAST(match) {
        const { expression } = match.groups
        return new AST.ConsoleMethodInvocation(match, {
          method: "log",
          args: [expression.AST]
        })
      },
      tests: [
        {
          compileAs: "statement",
          tests: [[`print "Yo!"`, `console.log("Yo!")`]]
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
      constructor: Spell.Rule.Statement,
      getAST(match) {
        const { message, okButton } = match.groups
        const args = [message.AST]
        if (okButton) args.push(okButton.AST)
        return new AST.CoreMethodInvocation(match, {
          method: "notify",
          arguments: args
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
      constructor: Spell.Rule.Statement,
      getAST(match) {
        match.scope.async = true // TODO!!!
        const { message, okButton } = match.groups
        const args = [message.AST]
        if (okButton) args.push(okButton.AST)
        return new AST.AwaitMethodInvocation(match, {
          method: new AST.CoreMethodInvocation(match, {
            method: "alert",
            arguments: args
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
      constructor: Spell.Rule.Statement,
      getAST(match) {
        match.scope.async = true // TODO!!!
        const { message, okButton } = match.groups
        const args = [message.AST]
        if (okButton) args.push(okButton.AST)
        return new AST.AwaitMethodInvocation(match, {
          method: new AST.CoreMethodInvocation(match, {
            method: "warn",
            arguments: args
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
      constructor: Spell.Rule.Statement,
      getAST(match) {
        match.scope.async = true // TODO!!!
        const { message, okButton, cancelButton } = match.groups
        const args = [message.AST]
        if (okButton) args.push(okButton.AST)
        if (cancelButton) args.push(cancelButton.AST)
        return new AST.AwaitMethodInvocation(match, {
          method: new AST.CoreMethodInvocation(match, {
            method: "confirm",
            arguments: args
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
      constructor: Spell.Rule.Statement,
      getAST(match) {
        match.scope.async = true // TODO!!!
        const { message, defaultValue } = match.groups
        const args = [message.AST]
        if (defaultValue) args.push(defaultValue.AST)
        return new AST.AwaitMethodInvocation(match, {
          method: new AST.CoreMethodInvocation(match, {
            method: "prompt",
            arguments: args
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
  ]
})
