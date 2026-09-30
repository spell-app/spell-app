/*! SPELL: PROJECT { spellVersion: "0.8.0", provides: ["play_fizzbuzz"] } */
import { spellCore, Thing, List, App } from "@spell/core"

spellCore.heading("File FizzBuzz.spell")
/** File FizzBuzz.spell */
/*! SPELL: DECLARES {
  syntax: "play fizzbuzz", output: "play_fizzbuzz", rule: "method_call",
  alias: ["statement", "expression"], kind: "function",
  defined: "/FizzBuzz.spell:23-331",
} */
export function play_fizzbuzz() {
  spellCore.map(spellCore.getRange(1, 100), (number) => {
    if (spellCore.isOfType(number / 15, 'integer')) { spellCore.console.log(number, "fizzbuzz") }
    else if (spellCore.isOfType(number / 3, 'integer')) { spellCore.console.log(number, "fizz") }
    else if (spellCore.isOfType(number / 5, 'integer')) { spellCore.console.log(number, "buzz") }
    else { spellCore.console.log(number) }
  })
}

play_fizzbuzz()
