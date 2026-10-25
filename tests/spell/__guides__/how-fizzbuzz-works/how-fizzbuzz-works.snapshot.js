import { core } from "@spell/core"

core.heading("How FizzBuzz works")
////////////////////////
// ## How FizzBuzz works
////////////////////////
// FizzBuzz is a counting game for a classroom.
// Count up from 1, but say "fizz" instead of a number you can share out in threes,
// "buzz" for one you can share out in fives, and "fizzbuzz" for one you can share out both ways.
//
// The FizzBuzz example plays it to 100.  Here is the same program, playing to 20, with every line explained.
// It has no page of its own:  what it says appears in Program Output, below the editor.

core.heading("The program")
/////////////////
// ## The program
/////////////////
/**
 * The first line names something the program can do:  "play fizzbuzz".
 * The indented lines under it are how to do it.
 */
export function playFizzbuzz() {
  // say each number in turn, from 1 to 20:  this kind of line is called a LOOP
  core.getRange(1, 20).forEach((number) => {
    // "divided by 15 is an integer" means 15 goes into it with nothing left over
    // - 15 first, because a number that 15 goes into is one that 3 and 5 both go into
    if (core.isOfType(number / 15, "integer")) core.console.log(number, "fizzbuzz")
    else if (core.isOfType(number / 3, "integer")) core.console.log(number, "fizz")
    else if (core.isOfType(number / 5, "integer")) core.console.log(number, "buzz")
    else core.console.log(number)
  })
}

// and this line does it
playFizzbuzz()

core.heading("What you'll see")
/////////////////////
// ## What you'll see
/////////////////////
// Program Output shows twenty lines, one for each number:
// 3 fizz, 5 buzz, 15 fizzbuzz, and the rest as they are.
//
// The four lines that start with "if" and "otherwise" are a CHOICE:
// the program tries them in order, and does only the first one that fits.
// That's why 15 says "fizzbuzz" and not "fizz":  the fizzbuzz line comes first.

core.heading("Try it")
////////////
// ## Try it
////////////
// - Play further:  change the 20 to 100, as the example does.
// - Change the game:  make it "fizz" for sevens instead of threes.  Which TWO numbers need to change?
// - Swap the order:  move the fizzbuzz line below the buzz line, and look at 15 again.
//   (Keep "if" on the first of the four lines, and "otherwise if" on the others.)

core.heading("A check")
/////////////
// ## A check
/////////////
/** A TEST tries a line and says what should happen;  Program Output shows a green tick when it does. */
export function testTheRule() {
  return core.test("test the rule", function testTheRule() {
    core.expect(core.isOfType(15 / 3, "integer"), `15 divided by 3 is an integer`, true, `yes`)
    core.expect(core.isOfType(16 / 3, "integer"), `16 divided by 3 is an integer`, false, `no`)
  })
}

core.heading("Where next")
////////////////
// ## Where next
////////////////
// - A tour of Spell:  the four ideas that bigger programs, with pages of their own, are made of.
// - Calculator, in the Examples:  numbers again, this time on buttons you can press.
// -----------
if (!core.isCarryingOver) testTheRule()
