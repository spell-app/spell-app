/*! SPELL: PROJECT { spellVersion: "0.8.0", provides: ["play_fizzbuzz"] } */
import { spellCore, Thing, List, App } from "@spell/core"

/*! SPELL: DECLARES {
  syntax: "play fizzbuzz", output: "play_fizzbuzz", rule: "method_call",
  alias: ["statement", "expression"], kind: "function",
  line: [2, 7], defined: "/FizzBuzz.spell:23-331",
} */
/** File FizzBuzz.spell */
export function play_fizzbuzz() {
	spellCore.map(spellCore.getRange(1, 100), (number) => {
		if (spellCore.isOfType(number / 15, 'integer')) { spellCore.console.log(number, "fizzbuzz") }
		else if (spellCore.isOfType(number / 3, 'integer')) { spellCore.console.log(number, "fizz") }
		else if (spellCore.isOfType(number / 5, 'integer')) { spellCore.console.log(number, "buzz") }
		else { spellCore.console.log(number) }
	})
}

play_fizzbuzz()
