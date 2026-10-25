import { core, Thing, List, App, View, Page, TwoSidedView, ViewableList, h } from "@spell/core"

core.heading("Your first spell")
//////////////////////
// ## Your first spell
//////////////////////
// These lines in italics are for you to read.  The plain ones are a working program.
// Together they make a SPELL:  a program written in sentences, which this editor runs beside it.
//
// What you'll have at the end:  the sign on the right, saying hello in your own words,
// with a button that counts how many people waved back.
//
// What you need:  nothing but this page.  There's nothing to install.
//
// How it goes:  you change one sentence, and a second or two later the app on the right changes.
// Turning your sentences into a working app is called COMPILING:
// the editor does it each time you stop typing.

core.heading("Step 1:  read the sign")
////////////////////////////
// ## Step 1:  read the sign
////////////////////////////
/**
 * Here is all there is to the sign.  Read it line by line, as you would a recipe.
 * - It's an APP:  a program with a page of its own, the one on the right.
 * - Each line starting with a dash says one thing about it:  a PROPERTY, something it keeps, like its greeting.
 */
export class HelloSign extends App {
  // - its "greeting" is text
  static { this.declareProp("greeting", { type: "text" }) }
  get greeting() { return this.getProp("greeting") }
  set greeting(value) { this.setProp("greeting", value) }

  // - its "name" is text
  static { this.declareProp("name", { type: "text" }) }
  get name() { return this.getProp("name") }
  set name(value) { this.setProp("name", value) }

  // - its "waves" is a number
  static { this.declareProp("waves", { type: "number" }) }
  get waves() { return this.getProp("waves") }
  set waves(value) { this.setProp("waves", value) }

  /** two lines worked out from the three above:  they change whenever those do */
  get message() {
    return `${this.greeting}, ${this.name}!`
  }

  get count() {
    return `${this.waves} waves so far`
  }

  /** what the button does:  one more wave */
  waveBack() {
    this.waves = this.waves + 1
  }

  /**
   * what it looks like:  the greeting, a button, and the count
   * - the parts in <angle brackets> are the page's pieces:  a heading, a button, a line of text
   * - a part in {curly brackets} is filled in from the sign, so it changes when the sign does
   */
  draw() {
    return h("div", { class: "Sign" },
      h("h1", () => this.message),
      h("ui-button", { primary: true, onClick: () => this.waveBack(), style: "cursor:pointer;user-select:none" },
        "Wave back"
      ),
      h("p", () => this.count)
    )
  }
}
export const helloSign = new HelloSign()

core.heading("Step 2:  change one sentence")
//////////////////////////////////
// ## Step 2:  change one sentence
//////////////////////////////////
// These two lines set the sign up.  The words inside the quotes are what it shows.
//
// Your move:  change "Maya" below to your own name.  Keep the quotes around it.
// What you'll see:  the big line on the right says hello to you instead.
//
// Then try the greeting:  "Hello" could be "Good morning", or "Hola".
helloSign.greeting = "Hello"
helloSign.name = "Maya"

core.heading("Step 3:  click, then change what a click does")
///////////////////////////////////////////////////
// ## Step 3:  click, then change what a click does
///////////////////////////////////////////////////
// Click "Wave back" on the right a few times:  the count goes up by one each time.
//
// Your move:  in Step 1, find the line under "to wave back", and change the 1 to a 10.
// What you'll see:  each click now adds ten.
// You'll see a red cross appear in Program Output, below the editor, too:
// that's the check in Step 5, which still expects three clicks to make 3.
// Change the 10 back to 1, and the cross goes back to a green tick.

core.heading("Step 4:  break it on purpose")
//////////////////////////////////
// ## Step 4:  break it on purpose
//////////////////////////////////
// Everybody types something the editor can't read.  Here's what that looks like, so it won't scare you later.
//
// Your move:  in Step 1, find {wave back} on the button's line, and change it to {wave bak}.
// What you'll see:
// - a wavy red line under that line;  point at it, and a note says it doesn't understand "wave bak"
// - on the right, the button goes blank:  the app shows what it can, and leaves out what it can't read
//
// Put the c back, and the red line goes away and the button comes back.

core.heading("Step 5:  a check that runs by itself")
//////////////////////////////////////////
// ## Step 5:  a check that runs by itself
//////////////////////////////////////////
/**
 * A TEST is a few lines that try the program and say what should happen.
 * Each time the spell compiles, its tests run,
 * and Program Output shows a green tick for each one that passed.
 * 
 * Your move:  in the line that says "should be 3", change the 3 to a 4.
 * What you'll see:  a red cross in Program Output.
 * Click the small arrow beside it, and it says the waves should be 4 but are actually 3.
 * Change it back, and the tick comes back.
 */
export function testWavingBack() {
  return core.test("test waving back", function testWavingBack() {
    core.echoTestAction(`set the waves of hello sign to 0`)
    helloSign.waves = 0
    core.echoTestAction(`wave back`)
    helloSign.waveBack()
    core.echoTestAction(`wave back`)
    helloSign.waveBack()
    core.echoTestAction(`wave back`)
    helloSign.waveBack()
    core.expect(helloSign.waves, `the waves of hello sign`, 3, `3`)
    core.echoTestAction(`set the waves of hello sign to 0`)
    helloSign.waves = 0
  })
}

core.heading("Start:  show the sign on the right")
//## Start:  show the sign on the right
if (!core.isCarryingOver) helloSign.start()

core.heading("If something went wrong")
/////////////////////////////
// ## If something went wrong
/////////////////////////////
// - The app on the right didn't change:  look for a wavy red line, and point at it.
//   A missing quote mark, or a line pushed left or right, are the usual reasons.
// - A quote mark went missing:  everything after it turns into one long piece of text,
//   and the app on the right goes blank.  Put the quote back.
// - A line in Step 1 moved:  the lines under "hello sign is an app where:" must stay pushed in by one step,
//   and the lines under "- to draw it:" by two.  That's how the spell knows what belongs to what.
// - Lost track of your changes:  choose Reload, at the top of this file, to go back to the last saved version.
//   In the online preview, Reset Guide, at the top of the page, puts the whole guide back as it first was.

core.heading("Where next")
////////////////
// ## Where next
////////////////
// - A tour of Spell, the next guide:
//   things, properties, rules and drawing, the four ideas every spell is made of.
// - Tic-Tac-Toe, in the Examples:  a small game to change, once the tour has shown you around.
// -----------
core.installStyles(undefined, `/* File styles.css:  how the sign looks -- centred, the greeting big. */¬¬.Sign {¬  max-width: 28em;¬  margin-inline: auto;¬  padding-block: 2em;¬  text-align: center;¬}¬¬.Sign h1 {¬  font-size: 2.5em;¬}¬`)
// -----------
if (!core.isCarryingOver) testWavingBack()
