import { spellCore, Thing, List, App } from "@spell/core"

spellCore.heading("File FizzBuzz.spell")
/** File FizzBuzz.spell */
export function play_fizzbuzz() {
  spellCore.map(spellCore.getRange(1, 100), (number: any /* spell: type unknown */) => {
    if (spellCore.isOfType(number / 15, 'integer')) { spellCore.console.log(number, "fizzbuzz") }
    else if (spellCore.isOfType(number / 3, 'integer')) { spellCore.console.log(number, "fizz") }
    else if (spellCore.isOfType(number / 5, 'integer')) { spellCore.console.log(number, "buzz") }
    else { spellCore.console.log(number) }
  })
}

play_fizzbuzz()
