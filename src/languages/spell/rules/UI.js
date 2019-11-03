//
//  # Rules for creating variables, property access, etc
//

import { Rule, Spell, Token } from "../all.js"

export default new Spell.Parser({
  module: "UI",
  rules: [
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
        const statement = scope.addStatement(`await spell.notify(${message}, ${okButton})`)
        results.statements.push(statement)
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            [`notify "Yo!"`, `await spell.notify("Yo!", "OK")`],
            [`notify "Yo!"`, `await spell.notify("Yo!", "OK")`],
            [`notify "Yo!" with "gotcha"`, `await spell.notify("Yo!", "gotcha")`]
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
        const statement = scope.addStatement(`await spell.alert(${message}, ${okButton})`)
        results.statements.push(statement)
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            [`alert "Yo!"`, `await spell.alert("Yo!", "OK")`],
            [`alert "Yo!"`, `await spell.alert("Yo!", "OK")`],
            [`alert "Yo!" with "yep"`, `await spell.alert("Yo!", "yep")`]
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
        const statement = scope.addStatement(`await spell.warn(${message}, ${okButton})`)
        results.statements.push(statement)
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            [`warn "Yo!"`, `await spell.warn("Yo!", "OK")`],
            [`warn "Yo!" with "yep"`, `await spell.warn("Yo!", "yep")`],
            [`warn "Yo!"`, `await spell.warn("Yo!", "OK")`],
            [`warn "Yo!" with "yep"`, `await spell.warn("Yo!", "yep")`]
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
        const statement = scope.addStatement(`await spell.confirm(${message}, ${okButton}, ${cancelButton})`)
        results.statements.push(statement)
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            [`confirm "Yo!"`, `await spell.confirm("Yo!", "OK", "Cancel")`],
            [`confirm "Yo!" with "yep"`, `await spell.confirm("Yo!", "yep", "Cancel")`],
            [`confirm "Yo!" with "yep" and "nope"`, `await spell.confirm("Yo!", "yep", "nope")`]
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
        const statement = scope.addStatement(`await spell.prompt(${message}, ${defaultValue})`)
        results.statements.push(statement)
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            [`prompt "Name for the new baby?"`, `await spell.prompt("Name for the new baby?", undefined)`],
            [`prompt "File name:" with "Untitled"`, `await spell.prompt("File name:", "Untitled")`]
          ]
        }
      ]
    }

    // Chose one or more items from `collection` (of strings???)
    // Returns a promise which `resolve()`s if they "OK" with a value, `reject()`s if they "cancel".
    //TODO
    //     {
    //       name: "choose_one",
    //       alias: "statement",
    //       syntax: "choose ((a|an)? {singular_variable} (from|of)|one of) {collection:expression} with (prompt|message)? {message:expression}",
    //          => `await spell.chooseOne(message, list, defaultValue)`
    //     },

    // Chose one or more items from `collection` (of strings???)
    // Returns a promise which `resolve()`s if they "OK" with a value, `reject()`s if they "cancel".
    //TODO
    //     {
    //       name: "choose_multiple",
    //       alias: "statement",
    //       syntax: "choose multiple {plural_variable} (of|from) {collection:expression} with (prompt|message)? {message:expression}",
    //          => `await spell.chooseMultiple(message, list, defaultValues)`
    //     }
  ]
})
