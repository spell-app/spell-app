import { core, Thing, List, App, Drawable, DrawableList, h } from "@spell/core"

core.heading("A tour of Spell")
/////////////////////
// ## A tour of Spell
/////////////////////
// What is a program, when it's written in sentences?
//
// Think of the labels on the pots in a garden centre.
// Each one names a plant, says a few things about it, and says how to look after it:
// "Basil.  Water every 2 days.  Needs sun."
//
// A spell is labels like that, which the computer can follow.
// This file is a small one:  a windowsill of plants, on the right, that tell you when they need water.
// It's made of four ideas, one per part below:  things, properties, rules and drawing.

core.heading("1. Things")
///////////////
// ## 1. Things
///////////////
/**
 * A THING is anything your program is about:  a plant, a card, a task, a person.
 * You say what kind of thing it is once, and then you can make as many of them as you like.
 * "Drawable" means it can show itself on the page;  more on that in part 4.
 */
export class Plant extends Drawable {
  static elementTag = core.defineElement(this, "test-project")

  ///////////////////
  // ## 2. Properties
  ///////////////////
  /**
   * A PROPERTY is something a thing keeps:  a plant has a name, and so on.
   * Each line says the property's name, in quotes, then what kind of value it holds:
   * text, a number, or yes or no.
   */
  // - its "name" is text
  static { this.declareProp("name", { type: "text" }) }
  get name() { return this.getProp("name") }
  set name(value) { this.setProp("name", value) }

  // - its "days between waterings" is a number
  static { this.declareProp("daysBetweenWaterings", { type: "number" }) }
  get daysBetweenWaterings() { return this.getProp("daysBetweenWaterings") }
  set daysBetweenWaterings(value) { this.setProp("daysBetweenWaterings", value) }

  // - its "days since watered" is a number
  static { this.declareProp("daysSinceWatered", { type: "number" }) }
  get daysSinceWatered() { return this.getProp("daysSinceWatered") }
  set daysSinceWatered(value) { this.setProp("daysSinceWatered", value) }

  //////////////
  // ## 3. Rules
  //////////////
  /**
   * A RULE is a property the program works out for itself, from the others.
   * You never set it:  it's always up to date, so when a plant is watered, it stops being thirsty.
   */
  get isThirsty() {
    return this.daysSinceWatered >= this.daysBetweenWaterings
  }

  get status() {
    if (this.isThirsty) return "needs water!"
    return "fine for now"
  }

  /** A rule can also be something the thing DOES, when asked:  an ACTION. */
  water() {
    this.daysSinceWatered = 0
  }

  ////////////////
  // ## 4. Drawing
  ////////////////
  /**
   * DRAWING is how a thing shows itself on the page.
   * The lines in <angle brackets> are the page's pieces;  {curly brackets} fill in a property.
   * Because the page is drawn from the properties, it changes by itself whenever they do.
   */
  draw() {
    return h("ui-segment", { color: () => this.isThirsty ? "orange" : "green" },
      h("h3", () => this.name),
      h("p", () => this.status),
      h("ui-button", {
        basic: true,
        size: "small",
        icon: "tint",
        onClick: () => this.water(),
        style: "cursor:pointer;user-select:none"
      }, "Water")
    )
  }

  get windowsill() {
    return Windowsill.ownerOf(this)
  }
}

core.heading("Many things together:  a windowsill")
/////////////////////////////////////////
// ## Many things together:  a windowsill
/////////////////////////////////////////
/** A list of things can be drawable too:  it draws each one in turn. */
export class Windowsill extends DrawableList {
  static instanceType = Plant
  static elementTag = core.defineElement(this, "test-project")

  static exclusive = true
}

/** a plant sits on one windowsill */

/** the app:  the page on the right */
export class Garden extends App {
  // - its "sill" is a new windowsill
  static { this.declareProp("sill", { init: () => new Windowsill(), early: true }) }
  get sill() { return this.getProp("sill") }
  set sill(value) { this.setProp("sill", value) }

  /** a day goes by:  every plant is one day drier */
  waitADay() {
    this.sill.forEach((plant) => (plant.daysSinceWatered = plant.daysSinceWatered + 1))
  }

  draw() {
    return h("div", { class: "Garden" },
      h("ui-button", { primary: true, onClick: () => this.waitADay(), style: "cursor:pointer;user-select:none" },
        "A day goes by"
      ),
      () => core.drawThing(this.sill)
    )
  }
}
export const garden = new Garden()

core.heading("Start:  three plants, one of them thirsty")
//## Start:  three plants, one of them thirsty
garden.sill.append(new Plant({
  name: "Basil",
  daysBetweenWaterings: 2,
  daysSinceWatered: 2
}))
garden.sill.append(new Plant({
  name: "Cactus",
  daysBetweenWaterings: 14,
  daysSinceWatered: 3
}))
garden.sill.append(new Plant({
  name: "Fern",
  daysBetweenWaterings: 3,
  daysSinceWatered: 1
}))
if (!core.isCarryingOver) garden.start()

core.heading("Tests:  the rule, checked")
///////////////////////////////
// ## Tests:  the rule, checked
///////////////////////////////
/** Each time the spell runs, these lines run too, and Program Output shows a tick if they came out right. */
export function testThirst() {
  return core.test("test thirst", function testThirst() {
    core.echoTestAction(`set the pot to a new plant with name = "Mint", days between waterings = 2, days since watered = 2`)
    const pot = new Plant({
      name: "Mint",
      daysBetweenWaterings: 2,
      daysSinceWatered: 2
    })
    core.expect(pot.isThirsty, `the pot is thirsty`, true, `yes`)
    core.echoTestAction(`water the pot`)
    pot.water()
    core.expect(pot.isThirsty, `the pot is thirsty`, false, `no`)
    core.expect(pot.status, `the status of the pot`, "fine for now", `"fine for now"`)
  })
}

core.heading("What it means for you")
///////////////////////////
// ## What it means for you
///////////////////////////
// Every spell, from this windowsill to the Solitaire example, is these four ideas:
// - things:  what it's about
// - properties:  what each thing keeps
// - rules:  what each thing works out, or does
// - drawing:  how each thing looks
//
// Try it:
// - Click "A day goes by" on the right a few times, and watch which plants get thirsty first.
// - Add a fourth plant:  copy one of the lines under Start, and change its name and its numbers.
// - Make the Cactus thirsty sooner:  change its 14 to a 4.
//
// Where it stops:  the words Spell knows are growing, and not every sentence you'd write is one it reads yet.
// When it can't read a line, it puts a wavy red line under it and says so in Program Output.
//
// Where next:  the Examples.  Each has a "how it works" guide beside this one.
// -----------
core.installStyles(undefined, `/* File styles.css:  how the windowsill looks -- the plants side by side. */¬¬.Garden {¬  max-width: 40em;¬  margin-inline: auto;¬  padding-block: 1.5em;¬}¬¬.Garden > ui-button {¬  margin-block-end: 1em;¬}¬¬/* the windowsill, <a-tour-of-spell-windowsill>:  its plants side by side */¬a-tour-of-spell-windowsill {¬  display: grid;¬  grid-template-columns: repeat(auto-fill, minmax(10em, 1fr));¬  gap: 1em;¬}¬`)
// -----------
if (!core.isCarryingOver) testThirst()
