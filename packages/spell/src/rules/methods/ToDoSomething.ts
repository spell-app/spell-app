import { proto } from "$/util"
import { P } from "$/parser"
import { MethodDefinition } from "./MethodDefinition"
import { methods } from "./methods.parser"

/**
 * `to_do_something` rule:  defines a new method/statement:
 * e.g. `to foo the bar`, `to create a card`, `to create (a card)`, `to notify (message)`.
 * - Optional `test` keyword (`to test foo: ...`) marks the definition as a test method:
 *   see `MethodDefinition.processSignature()` / `getAST()`'s `asTest` handling.
 * - `inlineInitialType` is `true`:  the FIRST bare-type arg found, e.g. `(a card)` in `to create (a card)`,
 *   makes it an instance method on that type's prototype, instead of a call argument.
 * - Trailing `:` is optional,
 *   so both `to foo the bar` (no body) and `to foo the bar:` (body follows) parse.
 */
export class ToDoSomething extends MethodDefinition<"asTest?|signature|body?"> {
  @proto static alias = "statement"
  // promote the first captured type arg (e.g. `(a card)`) to an instance-method receiver
  @proto static inlineInitialType = true
}
methods.addRule(ToDoSomething, {
  // TODO: add tests for `test` case
  syntax: `to (asTest:test)? {signature:method_signature} :? {statement_body}?`,
  tests: [
    {
      title: "inline method signatures & variables",
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        scope.types?.add("card")
        scope.types?.add("pile")
        scope.types?.add("deck")
        scope.constants?.add("up")
        scope.constants?.add("down")
      },
      tests: [
        {
          title: "keyword-only signature",
          input: "to start the game",
          js: "export function startTheGame() {}"
        },
        {
          title: "keyword-only signature - `it` is not defined",
          input: "to start the game: print it",
          js: ["export function startTheGame() {}", '/* PARSE ERROR: Don\'t understand "print it" */']
        },
        {
          title: "paren-free type arg in signature:  a known type is a parameter",
          input: "to create a card",
          js: ["Card.prototype.create = function () {}"],
          ts: [
            "export interface Card { create(): any /* spell: type unknown */ }",
            "Card.prototype.create = function (this: Card) {}"
          ]
        },
        {
          title: "paren-free type arg in signature - it",
          input: "to create a card: print it",
          js: [`Card.prototype.create = function () {`, `  return spellCore.console.log(this)`, `}`],
          ts: [
            "export interface Card { create(): any /* spell: type unknown */ }",
            "Card.prototype.create = function (this: Card) {",
            "  return spellCore.console.log(this)",
            "}"
          ]
        },
        {
          title: "paren-free type args in signature ~== parenthesized",
          input: "to give a card to a pile: set its pile to the pile",
          js: ["Card.prototype.giveToPile = function (pile) {", "  this.pile = pile", "}"],
          ts: [
            "export interface Card { giveToPile(pile: Pile): any /* spell: type unknown */ }",
            "Card.prototype.giveToPile = function (this: Card, pile: Pile) {",
            "  this.pile = pile",
            "}"
          ]
        },
        {
          title: "paren-free:  a word that isn't a type stays words",
          input: "to make a mess",
          js: "export function makeAMess() {}"
        },
        {
          title: "paren-free:  `the` + a type stays words",
          input: "to shuffle the deck",
          js: "export function shuffleTheDeck() {}"
        },
        {
          title: "simple arg in signature - arg is defined",
          input: "to notify (message): print the message",
          js: ["export function notifyMessage(message) {", "  return spellCore.console.log(message)", "}"],
          ts: [
            "export function notifyMessage(message: any /* spell: type unknown */) {",
            "  return spellCore.console.log(message)",
            "}"
          ]
        },
        {
          title: "simple arg in signature - it is not defined",
          input: "to notify (message): print it",
          js: ["export function notifyMessage(message) {}", '/* PARSE ERROR: Don\'t understand "print it" */'],
          ts: [
            "export function notifyMessage(message: any /* spell: type unknown */) {}",
            '/* PARSE ERROR: Don\'t understand "print it" */'
          ]
        },
        {
          title: "typed simple arg in signature - arg is defined",
          input: "to notify (message as text): print the message",
          js: ["export function notifyMessage(message) {", "  return spellCore.console.log(message)", "}"],
          ts: ["export function notifyMessage(message: string) {", "  return spellCore.console.log(message)", "}"]
        },
        {
          title: "typed simple arg in signature - `it` is not defined",
          input: "to notify (message as text): print it",
          js: ["export function notifyMessage(message) {}", '/* PARSE ERROR: Don\'t understand "print it" */'],
          ts: ["export function notifyMessage(message: string) {}", '/* PARSE ERROR: Don\'t understand "print it" */']
        },
        {
          title: "valued simple arg in signature - arg is defined",
          input: 'to notify (message = "Really?"): print the message',
          js: ['export function notifyMessage(message = "Really?") {', "  return spellCore.console.log(message)", "}"],
          ts: [
            'export function notifyMessage(message: string = "Really?") {',
            "  return spellCore.console.log(message)",
            "}"
          ]
        },
        {
          title: "typed simple arg in signature - `it` is not defined",
          input: 'to notify (message = "Really?"): print it',
          js: [
            'export function notifyMessage(message = "Really?") {}',
            '/* PARSE ERROR: Don\'t understand "print it" */'
          ],
          ts: [
            'export function notifyMessage(message: string = "Really?") {}',
            '/* PARSE ERROR: Don\'t understand "print it" */'
          ]
        },
        {
          title: "type arg in signature - thisVar",
          input: "to create (a card): print the card",
          js: [`Card.prototype.create = function () {`, `  return spellCore.console.log(this)`, `}`],
          ts: [
            "export interface Card { create(): any /* spell: type unknown */ }",
            "Card.prototype.create = function (this: Card) {",
            "  return spellCore.console.log(this)",
            "}"
          ]
        },
        {
          title: "type arg in signature - it",
          input: "to create (a card): print it",
          js: [`Card.prototype.create = function () {`, `  return spellCore.console.log(this)`, `}`],
          ts: [
            "export interface Card { create(): any /* spell: type unknown */ }",
            "Card.prototype.create = function (this: Card) {",
            "  return spellCore.console.log(this)",
            "}"
          ]
        },
        {
          title: "type arg in signature - its",
          input: "to create (a card): set its number to 1",
          js: [`Card.prototype.create = function () {`, `  this.number = 1`, `}`],
          ts: [
            "export interface Card { create(): any /* spell: type unknown */ }",
            "Card.prototype.create = function (this: Card) {",
            "  this.number = 1",
            "}"
          ]
        },
        {
          title: "multiple type args in signature - thisVar",
          input: "to add (a card) to (a pile): set the pile of the card to the pile",
          js: ["Card.prototype.addToPile = function (pile) {", "  this.pile = pile", "}"],
          ts: [
            "export interface Card { addToPile(pile: Pile): any /* spell: type unknown */ }",
            "Card.prototype.addToPile = function (this: Card, pile: Pile) {",
            "  this.pile = pile",
            "}"
          ]
        },
        {
          title: "multiple type args in signature - it",
          input: "to add (a card) to (a pile): set the pile of it to the pile",
          js: ["Card.prototype.addToPile = function (pile) {", "  this.pile = pile", "}"],
          ts: [
            "export interface Card { addToPile(pile: Pile): any /* spell: type unknown */ }",
            "Card.prototype.addToPile = function (this: Card, pile: Pile) {",
            "  this.pile = pile",
            "}"
          ]
        },
        {
          title: "multiple type args in signature - its",
          input: "to add (a card) to (a pile): set its pile to the pile",
          js: ["Card.prototype.addToPile = function (pile) {", "  this.pile = pile", "}"],
          ts: [
            "export interface Card { addToPile(pile: Pile): any /* spell: type unknown */ }",
            "Card.prototype.addToPile = function (this: Card, pile: Pile) {",
            "  this.pile = pile",
            "}"
          ]
        },
        {
          title: "typed arg in signature -- arg name",
          input: "to show (thing as a card): print the thing",
          js: [`Card.prototype.show = function () {`, `  return spellCore.console.log(this)`, `}`],
          ts: [
            "export interface Card { show(): any /* spell: type unknown */ }",
            "Card.prototype.show = function (this: Card) {",
            "  return spellCore.console.log(this)",
            "}"
          ]
        },
        {
          title: "typed arg in signature -- thisVar",
          input: "to show (thing as a card): print the card",
          js: [`Card.prototype.show = function () {`, `  return spellCore.console.log(this)`, `}`],
          ts: [
            "export interface Card { show(): any /* spell: type unknown */ }",
            "Card.prototype.show = function (this: Card) {",
            "  return spellCore.console.log(this)",
            "}"
          ]
        },
        {
          title: "typed arg in signature -- it",
          input: "to show (thing as a card): print it",
          js: [`Card.prototype.show = function () {`, `  return spellCore.console.log(this)`, `}`],
          ts: [
            "export interface Card { show(): any /* spell: type unknown */ }",
            "Card.prototype.show = function (this: Card) {",
            "  return spellCore.console.log(this)",
            "}"
          ]
        },
        {
          title: "typed arg in signature -- its",
          input: "to show (thing as a card): print its name",
          js: [`Card.prototype.show = function () {`, `  return spellCore.console.log(this.name)`, `}`],
          ts: [
            "export interface Card { show(): any /* spell: type unknown */ }",
            "Card.prototype.show = function (this: Card) {",
            "  return spellCore.console.log(this.name)",
            "}"
          ]
        },
        {
          title: "typed var in signature: implicit `it` gets remapped after `get`",
          input: ["to show (thing as a card)", "\tprint it", "\tget its name", "\tprint it"],
          js: [
            "Card.prototype.show = function () {",
            "  spellCore.console.log(this)",
            "  const it = this.name",
            "  spellCore.console.log(it)",
            "}"
          ],
          ts: [
            "export interface Card { show(): any /* spell: type unknown */ }",
            "Card.prototype.show = function (this: Card) {",
            "  spellCore.console.log(this)",
            "  const it = this.name",
            "  spellCore.console.log(it)",
            "}"
          ]
        },
        {
          title: "mixed vars in signature",
          input: "to prompt (message as text) and (reply)",
          js: "export function promptMessageAndReply(message, reply) {}",
          ts: "export function promptMessageAndReply(message: string, reply: any /* spell: type unknown */) {}"
        }
      ]
    },
    {
      title: "calling signature arguments",
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        scope.types?.add("card")
        scope.types?.add("pile")
      },
      tests: [
        {
          title: "top level keyword-only method",
          input: ["to start the game", "\tprint 1", "start the game"],
          js: ["export function startTheGame() {", "  spellCore.console.log(1)", "}", "startTheGame()"]
        },
        {
          title: "top level simple argument method",
          input: ["to notify (message): print the message", "notify 1"],
          js: [
            "export function notifyMessage(message) {",
            "  return spellCore.console.log(message)",
            "}",
            "notifyMessage(1)"
          ],
          ts: [
            "export function notifyMessage(message: any /* spell: type unknown */) {",
            "  return spellCore.console.log(message)",
            "}",
            "notifyMessage(1)"
          ]
        },
        {
          title: "top level typed simple argument method",
          input: ["to notify (message as text): print the message", 'notify "hi"'],
          js: [
            "export function notifyMessage(message) {",
            "  return spellCore.console.log(message)",
            "}",
            'notifyMessage("hi")'
          ],
          ts: [
            "export function notifyMessage(message: string) {",
            "  return spellCore.console.log(message)",
            "}",
            'notifyMessage("hi")'
          ]
        },
        {
          title:
            "typed call:  an argument KNOWN to be the wrong type isn't a call to it -- here, the built-in `notify`",
          input: ["to notify (message as text): print the message", "notify 1"],
          js: [
            "export function notifyMessage(message) {",
            "  return spellCore.console.log(message)",
            "}",
            "spellCore.notify(1)"
          ],
          ts: [
            "export function notifyMessage(message: string) {",
            "  return spellCore.console.log(message)",
            "}",
            "spellCore.notify(1)"
          ]
        },
        {
          title: "typed call:  a sub-type fits, an unrelated type doesn't",
          input: [
            "a joker is a card",
            "to show (a card) on (a pile): print 1",
            "show a new joker on a new pile",
            "show a new card on a new card"
          ],
          js: [
            "export class Joker extends Card {}",
            "Card.prototype.showOnPile = function (pile) {",
            "  return spellCore.console.log(1)",
            "}",
            "(new Joker()).showOnPile(new Pile())",
            '/* PARSE ERROR: Don\'t understand "show a new card on a new card" */'
          ],
          ts: [
            "export class Joker extends Card {}",
            "export interface Card { showOnPile(pile: Pile): any /* spell: type unknown */ }",
            "Card.prototype.showOnPile = function (this: Card, pile: Pile) {",
            "  return spellCore.console.log(1)",
            "}",
            "(new Joker()).showOnPile(new Pile())",
            '/* PARSE ERROR: Don\'t understand "show a new card on a new card" */'
          ]
        },
        {
          title: "type arg in signature",
          input: ["to show (a card): print the card", "show a new card"],
          js: [
            "Card.prototype.show = function () {",
            "  return spellCore.console.log(this)",
            "}",
            "(new Card()).show()"
          ],
          ts: [
            "export interface Card { show(): any /* spell: type unknown */ }",
            "Card.prototype.show = function (this: Card) {",
            "  return spellCore.console.log(this)",
            "}",
            "(new Card()).show()"
          ]
        },
        {
          title: "multiple type args in signature",
          input: ["to play (a card) on (a pile): set its pile to the pile", "play a new card on a new pile"],
          js: [
            "Card.prototype.playOnPile = function (pile) {",
            "  this.pile = pile",
            "}",
            "(new Card()).playOnPile(new Pile())"
          ],
          ts: [
            "export interface Card { playOnPile(pile: Pile): any /* spell: type unknown */ }",
            "Card.prototype.playOnPile = function (this: Card, pile: Pile) {",
            "  this.pile = pile",
            "}",
            "(new Card()).playOnPile(new Pile())"
          ]
        },
        {
          title: "paren-free type args in signature",
          input: ["to play a card on a pile: set its pile to the pile", "play a new card on a new pile"],
          js: [
            "Card.prototype.playOnPile = function (pile) {",
            "  this.pile = pile",
            "}",
            "(new Card()).playOnPile(new Pile())"
          ],
          ts: [
            "export interface Card { playOnPile(pile: Pile): any /* spell: type unknown */ }",
            "Card.prototype.playOnPile = function (this: Card, pile: Pile) {",
            "  this.pile = pile",
            "}",
            "(new Card()).playOnPile(new Pile())"
          ]
        }
      ]
    },
    {
      title: "props",
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        scope.types?.add("card")
        scope.types?.add("pile")
      },
      tests: [
        {
          title: "signature with no keywords is not matched",
          input: "to (foo)",
          js: '/* PARSE ERROR: Don\'t understand "to (foo)" */'
        },
        {
          title: "with arg is optional when calling",
          input: ["to notify (with message):", "\tprint the message", "notify"],
          js: [
            "export function notify(props = {}) {",
            "  const { message } = props",
            "  spellCore.console.log(message)",
            "}",
            "notify()"
          ],
          ts: [
            "export function notify(props: Object = {}) {",
            "  const { message } = props",
            "  spellCore.console.log(message)",
            "}",
            "notify()"
          ]
        },

        {
          title: "simple variable props",
          input: ["to notify (with message):", "\tprint the message", 'notify with message = "It worked!"'],
          js: [
            "export function notify(props = {}) {",
            "  const { message } = props",
            "  spellCore.console.log(message)",
            "}",
            'notify({ message: "It worked!" })'
          ],
          ts: [
            "export function notify(props: Object = {}) {",
            "  const { message } = props",
            "  spellCore.console.log(message)",
            "}",
            'notify({ message: "It worked!" })'
          ]
        },
        {
          title: "typed variable props",
          input: [
            "to play (with a card):",
            "\tprint the card",
            "play with card = a new card",
            'play with card = a new card with suit of "hearts"'
          ],
          js: [
            "export function play(props = {}) {",
            "  const { card } = props",
            "  spellCore.console.log(card)",
            "}",
            "play({ card: new Card() })",
            'play({ card: new Card({ suit: "hearts" }) })'
          ],
          ts: [
            "export function play(props: { card?: Card } = {}) {",
            "  const { card } = props",
            "  spellCore.console.log(card)",
            "}",
            "play({ card: new Card() })",
            'play({ card: new Card({ suit: "hearts" }) })'
          ]
        },
        {
          title: "default value props",
          input: ['to notify (with message = "nope"):', "\tprint the message", 'notify with message = "Ship it!!"'],
          js: [
            "export function notify(props = {}) {",
            '  const { message = "nope" } = props',
            "  spellCore.console.log(message)",
            "}",
            'notify({ message: "Ship it!!" })'
          ],
          ts: [
            "export function notify(props: Object = {}) {",
            '  const { message = "nope" } = props',
            "  spellCore.console.log(message)",
            "}",
            'notify({ message: "Ship it!!" })'
          ]
        },
        {
          title: "multiple default value props",
          input: [
            'to notify (with message = "nope" and reply = "yep"):',
            "\tprint the message + the reply",
            'notify with message = "How many?"',
            'notify with message = "How many?" and reply = 2'
          ],
          js: [
            "export function notify(props = {}) {",
            '  const { message = "nope", reply = "yep" } = props',
            "  spellCore.console.log(message + reply)",
            "}",
            'notify({ message: "How many?" })',
            'notify({ message: "How many?", reply: 2 })'
          ],
          ts: [
            "export function notify(props: Object = {}) {",
            '  const { message = "nope", reply = "yep" } = props',
            "  spellCore.console.log(message + reply)",
            "}",
            'notify({ message: "How many?" })',
            'notify({ message: "How many?", reply: 2 })'
          ]
        },
        {
          title: "mixed props",
          input: [
            'to notify (with name, message as text and reply = "yep"):',
            "\tprint the name + the message + the reply",
            'notify with name = "Bob", message = "How many?" and reply = 2'
          ],
          js: [
            "export function notify(props = {}) {",
            '  const { name, message, reply = "yep" } = props',
            "  spellCore.console.log(name + message + reply)",
            "}",
            "notify({",
            '  name: "Bob",',
            '  message: "How many?",',
            "  reply: 2",
            "})"
          ],
          ts: [
            "export function notify(props: { name?: any /* spell?: type unknown */; message?: string; reply?: any /* spell?: type unknown */ } = {}) {",
            '  const { name, message, reply = "yep" } = props',
            "  spellCore.console.log(name + message + reply)",
            "}",
            "notify({",
            '  name: "Bob",',
            '  message: "How many?",',
            "  reply: 2",
            "})"
          ]
        },
        {
          title: "mixed props and signature",
          input: [
            'to notify (message) (with reply = "yep"):',
            "\tprint the message",
            "\tprint the reply",
            'notify "Really?" with reply = "yes"'
          ],
          js: [
            "export function notifyMessage(message, props = {}) {",
            '  const { reply = "yep" } = props',
            "  spellCore.console.log(message)",
            "  spellCore.console.log(reply)",
            "}",
            'notifyMessage("Really?", { reply: "yes" })'
          ],
          ts: [
            "export function notifyMessage(message: any /* spell: type unknown */, props: Object = {}) {",
            '  const { reply = "yep" } = props',
            "  spellCore.console.log(message)",
            "  spellCore.console.log(reply)",
            "}",
            'notifyMessage("Really?", { reply: "yes" })'
          ]
        },
        {
          title: "extra props passed in are OK",
          input: [
            "to notify (with message):",
            "\tprint the message",
            `notify with message = "It worked!" and reply = "No it didn't"`
          ],
          js: [
            "export function notify(props = {}) {",
            "  const { message } = props",
            "  spellCore.console.log(message)",
            "}",
            'notify({ message: "It worked!", reply: "No it didn\'t" })'
          ],
          ts: [
            "export function notify(props: Object = {}) {",
            "  const { message } = props",
            "  spellCore.console.log(message)",
            "}",
            'notify({ message: "It worked!", reply: "No it didn\'t" })'
          ]
        }
      ]
    }
  ]
})
