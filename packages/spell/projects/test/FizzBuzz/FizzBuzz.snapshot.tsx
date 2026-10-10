import { spellCore, Thing, List, App } from "@spell/core"

spellCore.heading("File FizzBuzz.spell")
/** File FizzBuzz.spell */
export function playFizzbuzz() {
  spellCore.getRange(1, 100).forEach((number) => {
    if (spellCore.isOfType(number / 15, "integer")) spellCore.console.log(number, "fizzbuzz")
    else if (spellCore.isOfType(number / 3, "integer")) spellCore.console.log(number, "fizz")
    else if (spellCore.isOfType(number / 5, "integer")) spellCore.console.log(number, "buzz")
    else spellCore.console.log(number)
  })
}

playFizzbuzz()
