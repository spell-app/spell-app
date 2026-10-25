import { core, App, h } from "@spell/core"

core.heading("How the Habit Tracker works")
/////////////////////////////////
// ## How the Habit Tracker works
/////////////////////////////////
// The Habit Tracker example is a week of checkboxes:  one row per habit, a box per day.
// Tick a day, and the row counts how many days you did it, and your STREAK:
// the most days in a row you kept it up.
//
// This guide is one habit, with the same lines as the example, so you can see how the streak is worked out.
// Open Habit Tracker, in the Examples, to add habits of your own.

core.heading("A habit:  its name, and a yes or no for each day of the week")
/** A habit:  its name, and a yes or no for each day of the week */
export class Habit extends App {
  static elementTag = core.defineElement(this, "test-project", "App")

  // - its "name" is text
  static { this.declareProp("name", { type: "text" }) }
  get name() { return this.getProp("name") }
  set name(value) { this.setProp("name", value) }

  // - its "monday" is yes or no
  static { this.declareProp("monday", { type: "choice" }) }
  get monday() { return this.getProp("monday") }
  set monday(value) { this.setProp("monday", value) }

  // - its "tuesday" is yes or no
  static { this.declareProp("tuesday", { type: "choice" }) }
  get tuesday() { return this.getProp("tuesday") }
  set tuesday(value) { this.setProp("tuesday", value) }

  // - its "wednesday" is yes or no
  static { this.declareProp("wednesday", { type: "choice" }) }
  get wednesday() { return this.getProp("wednesday") }
  set wednesday(value) { this.setProp("wednesday", value) }

  // - its "thursday" is yes or no
  static { this.declareProp("thursday", { type: "choice" }) }
  get thursday() { return this.getProp("thursday") }
  set thursday(value) { this.setProp("thursday", value) }

  // - its "friday" is yes or no
  static { this.declareProp("friday", { type: "choice" }) }
  get friday() { return this.getProp("friday") }
  set friday(value) { this.setProp("friday", value) }

  // - its "saturday" is yes or no
  static { this.declareProp("saturday", { type: "choice" }) }
  get saturday() { return this.getProp("saturday") }
  set saturday(value) { this.setProp("saturday", value) }

  // - its "sunday" is yes or no
  static { this.declareProp("sunday", { type: "choice" }) }
  get sunday() { return this.getProp("sunday") }
  set sunday(value) { this.setProp("sunday", value) }

  /** its week as one LIST, Monday first:  [square brackets] put things in a list, in order */
  get days() {
    return [this.monday, this.tuesday, this.wednesday, this.thursday, this.friday, this.saturday, this.sunday]
  }

  /** how many days this week it was done:  the days in the list that are yes */
  get count() {
    return core.itemCountOf(core.filter(this.days, (day) => day))
  }

  /**
   * the most days in a row it was done
   * - walk through the week, keeping two numbers:  the run so far, and the best run seen
   * - a yes makes the run one longer;  a no starts it again from 0
   */
  get streak() {
    let run = 0
    let best = 0
    this.days.forEach((day) => {
      if (day) {
        run = run + 1
        if (run > best) best = run
      } else run = 0
    })
    return best
  }

  /** a checkbox per day, bound to the habit:  ticking one changes that day */
  draw() {
    return h("div", { class: "Habit" },
      h("ui-segment",
        h("h3", () => this.name),
        h("ui-form", { value: this },
          h("div", { class: "Days" },
            h("ui-checkbox", { name: "monday", label: "M" }),
            h("ui-checkbox", { name: "tuesday", label: "T" }),
            h("ui-checkbox", { name: "wednesday", label: "W" }),
            h("ui-checkbox", { name: "thursday", label: "T" }),
            h("ui-checkbox", { name: "friday", label: "F" }),
            h("ui-checkbox", { name: "saturday", label: "S" }),
            h("ui-checkbox", { name: "sunday", label: "S" })
          )
        ),
        h("p", () => `Days:  ${this.count}    Streak:  ${this.streak}`)
      )
    )
  }
}
export const habit = new Habit()

core.heading("Start:  read on Monday, Tuesday and Thursday")
//## Start:  read on Monday, Tuesday and Thursday
habit.name = "Read"
habit.monday = true
habit.tuesday = true
habit.thursday = true
if (!core.isCarryingOver) habit.start()

core.heading("A check:  ticking Wednesday joins the two runs into one")
/** A check:  ticking Wednesday joins the two runs into one */
export function testStreaks() {
  return core.test("test streaks", function testStreaks() {
    core.echoTestAction(`set walking to a new habit with name = "Walk", monday = yes, tuesday = yes, thursday = yes`)
    const walking = new Habit({
      name: "Walk",
      monday: true,
      tuesday: true,
      thursday: true
    })
    core.expect(walking.count, `the count of walking`, 3, `3`)
    core.expect(walking.streak, `the streak of walking`, 2, `2`)
    core.echoTestAction(`set the wednesday of walking to yes`)
    walking.wednesday = true
    core.expect(walking.streak, `the streak of walking`, 4, `4`)
  })
}

core.heading("Try it")
////////////
// ## Try it
////////////
// - On the right, the streak is 2:  Monday and Tuesday.  Tick Wednesday, and it jumps to 4.
// - Untick Tuesday:  the streak drops to 2, Wednesday and Thursday.
// - Count only the weekdays:  in "its days", take out "its saturday" and "its sunday", with their commas.
//
// Where next:  Habit Tracker, in the Examples, which keeps a list of habits, one row each,
// with a box to add new ones.
// -----------
core.installStyles(undefined, `/* File styles.css:  how the habit looks -- its name, a row of seven checkboxes, then its count and streak. */¬¬.Habit {¬  max-width: 24em;¬  margin: 2em auto;¬}¬¬.Days {¬  display: flex;¬  justify-content: space-between;¬}¬¬.Habit p {¬  margin-block-start: 1em;¬  white-space: pre;¬}¬`)
// -----------
if (!core.isCarryingOver) testStreaks()
