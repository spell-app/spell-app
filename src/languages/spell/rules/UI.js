//
//  # Rules for creating variables, property access, etc
//

import { Spell } from "../all"

export default new Spell.Parser({
  module: "UI",
  rules: [
    // Print some value (to the console, I guess)
    {
      name: "print",
      alias: "statement",
      syntax: "print {expression}",
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results }) {
        const statement = scope.addStatement(`console.log(${results.expression})`)
        results.statements.push(statement)
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
    {
      name: "notify",
      alias: ["statement", "async"],
      syntax: "notify {message:expression} (with {okButton:text})?", // TODO: "with close" ?
      testRule: "notify",
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results }) {
        const { message, okButton = `"OK"` } = results
        scope.async = true
        const statement = scope.addStatement(`await spellCore.notify(${message}, ${okButton})`)
        results.statements.push(statement)
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            [`notify "Yo!"`, `await spellCore.notify("Yo!", "OK")`],
            [`notify "Yo!"`, `await spellCore.notify("Yo!", "OK")`],
            [`notify "Yo!" with "gotcha"`, `await spellCore.notify("Yo!", "gotcha")`]
          ]
        }
      ]
    },

    // Show user a `message` in a modal alert.
    // Returns a promise which resolves when they click `ok`.
    {
      name: "alert",
      alias: ["statement", "async"],
      syntax: "alert {message:expression} (with {okButton:text})?",
      testRule: "alert",
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results }) {
        const { message, okButton = `"OK"` } = results
        scope.async = true
        const statement = scope.addStatement(`await spellCore.alert(${message}, ${okButton})`)
        results.statements.push(statement)
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            [`alert "Yo!"`, `await spellCore.alert("Yo!", "OK")`],
            [`alert "Yo!"`, `await spellCore.alert("Yo!", "OK")`],
            [`alert "Yo!" with "yep"`, `await spellCore.alert("Yo!", "yep")`]
          ]
        }
      ]
    },

    // Warning message -- like alert but more dire.
    // Returns a promise which resolves when they click `ok`.
    {
      name: "warn",
      alias: "statement",
      syntax: "warn {message:expression} (with {okButton:text})?",
      testRule: "warn",
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results }) {
        const { message, okButton = `"OK"` } = results
        scope.async = true
        const statement = scope.addStatement(`await spellCore.warn(${message}, ${okButton})`)
        results.statements.push(statement)
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            [`warn "Yo!"`, `await spellCore.warn("Yo!", "OK")`],
            [`warn "Yo!" with "yep"`, `await spellCore.warn("Yo!", "yep")`],
            [`warn "Yo!"`, `await spellCore.warn("Yo!", "OK")`],
            [`warn "Yo!" with "yep"`, `await spellCore.warn("Yo!", "yep")`]
          ]
        }
      ]
    },

    // Confirm message -- present a question with two answers.
    // Returns a promise which `resolve()`s when they `ok`, `reject()`s if they `cancel`.
    {
      name: "confirm",
      alias: "statement",
      syntax: "confirm {message:expression} (with {okButton:text} ((and|or) {cancelButton:text})?)?",
      testRule: "confirm",
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results }) {
        const { message, okButton = `"OK"`, cancelButton = `"Cancel"` } = results
        scope.async = true
        const statement = scope.addStatement(`await spellCore.confirm(${message}, ${okButton}, ${cancelButton})`)
        results.statements.push(statement)
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            [`confirm "Yo!"`, `await spellCore.confirm("Yo!", "OK", "Cancel")`],
            [`confirm "Yo!" with "yep"`, `await spellCore.confirm("Yo!", "yep", "Cancel")`],
            [`confirm "Yo!" with "yep" and "nope"`, `await spellCore.confirm("Yo!", "yep", "nope")`]
          ]
        }
      ]
    },

    // Prompt user to specify a value in response to `message` with `defaultValue`.
    // Returns a promise which `resolve()`s if they "OK", `reject()`s if they "cancel".
    // TODO: `as number`, `as date`, etc?
    {
      name: "prompt",
      alias: "statement",
      syntax: "prompt {message:expression} (with {defaultValue:expression})?",
      testRule: "prompt",
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results }) {
        const { message, defaultValue = "undefined" } = results
        scope.async = true
        const statement = scope.addStatement(`await spellCore.prompt(${message}, ${defaultValue})`)
        results.statements.push(statement)
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            [`prompt "Name for the new baby?"`, `await spellCore.prompt("Name for the new baby?", undefined)`],
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
