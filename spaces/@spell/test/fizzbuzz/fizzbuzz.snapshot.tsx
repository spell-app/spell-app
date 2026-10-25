import { core } from "@spell/core"

core.heading("File FizzBuzz.spell")
/** File FizzBuzz.spell */
export function playFizzbuzz() {
  core.getRange(1, 100).forEach((number) => {
    if (core.isOfType(number / 15, "integer")) core.console.log(number, "fizzbuzz")
    else if (core.isOfType(number / 3, "integer")) core.console.log(number, "fizz")
    else if (core.isOfType(number / 5, "integer")) core.console.log(number, "buzz")
    else core.console.log(number)
  })
}

playFizzbuzz()
