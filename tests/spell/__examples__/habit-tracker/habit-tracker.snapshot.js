import { core, Thing, List, App, View, Page, TwoSidedView, ViewableList, h } from "@spell/core"

core.heading("Habit Tracker")
///////////////////
// ## Habit Tracker
///////////////////
// A week of checkboxes for each habit:  tick a day when you did it.
// Each habit counts its days, and its streak:  the most days in a row you kept it up.
// What's where, top to bottom:
//   a habit:  its name, its seven days, its count and its streak
//   the tracker:  its habits, the new habit's field, and its drawing
//   start
//   tests

core.heading("A habit:  its name, a yes or no for each day of the week")
/** A habit:  its name, a yes or no for each day of the week */
export class Habit extends View {
  static elementTag = core.defineElement(this, "test-project")

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

  /** its week, Monday first */
  get days() {
    return [this.monday, this.tuesday, this.wednesday, this.thursday, this.friday, this.saturday, this.sunday]
  }

  /** how many days this week it was done */
  get count() {
    return core.itemCountOf(core.filter(this.days, (day) => day))
  }

  /** the most days in a row it was done */
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

  /** a form of its own, bound to it:  ticking a day, or typing a name, changes the habit */
  draw() {
    return h("ui-form", { value: this },
      h("div", { part: "row" },
        h("ui-input", { part: "name", name: "name", "aria-label": "Habit", transparent: true }),
        h("ui-checkbox", { name: "monday", "aria-label": "Monday" }),
        h("ui-checkbox", { name: "tuesday", "aria-label": "Tuesday" }),
        h("ui-checkbox", { name: "wednesday", "aria-label": "Wednesday" }),
        h("ui-checkbox", { name: "thursday", "aria-label": "Thursday" }),
        h("ui-checkbox", { name: "friday", "aria-label": "Friday" }),
        h("ui-checkbox", { name: "saturday", "aria-label": "Saturday" }),
        h("ui-checkbox", { name: "sunday", "aria-label": "Sunday" }),
        h("div", { part: "count" }, () => this.count),
        h("div", { part: "streak" }, () => this.streak)
      )
    )
  }

  get week() {
    return Week.ownerOf(this)
  }
}

core.heading("The week:  the habits, one a row")
/** The week:  the habits, one a row */
export class Week extends ViewableList {
  static instanceType = Habit
  static elementTag = core.defineElement(this, "test-project")

  drawItsPlaceholder() {
    return h("div", { part: "placeholder" }, "No habits yet:  add one above")
  }

  static reorderItemsAfter = 0

  static exclusive = true
}

/** a habit is in one week */

core.heading("The tracker")
/** The tracker */
export class HabitTracker extends App {
  // - its "habits" is a new week
  static { this.declareProp("habits", { init: () => new Week(), early: true }) }
  get habits() { return this.getProp("habits") }
  set habits(value) { this.setProp("habits", value) }

  /** what the new habit's field holds */
  // - its "draft" is text
  static { this.declareProp("draft", { type: "text" }) }
  get draft() { return this.getProp("draft") }
  set draft(value) { this.setProp("draft", value) }

  /** the draft, as a new habit at the end;  the field empties */
  addTheDraft() {
    if (this.draft === "") return
    this.habits.append(new Habit({ name: this.draft }))
    this.draft = ""
  }

  /** the new habit's field, the days' names, then a row per habit */
  draw() {
    return h("div", { class: "HabitTracker" },
      h("h2", "This week"),
      h("ui-form", { value: this },
        h("div", { class: "NewHabit" },
          h("ui-input", { name: "draft", placeholder: "A habit to keep, e.g. Read", "aria-label": "New habit", fluid: true }),
          h("ui-button", {
            primary: true,
            disabled: () => this.draft === "",
            onClick: () => this.addTheDraft(),
            style: "cursor:pointer;user-select:none"
          }, "Add")
        )
      ),
      h("div", { class: "Days" },
        h("div", "Habit"),
        h("div", "M"),
        h("div", "T"),
        h("div", "W"),
        h("div", "T"),
        h("div", "F"),
        h("div", "S"),
        h("div", "S"),
        h("div", "Days"),
        h("div", "Streak")
      ),
      () => core.drawThing(this.habits)
    )
  }
}
export const habitTracker = new HabitTracker()

core.heading("Start")
//## Start
habitTracker.habits.append(new Habit({
  name: "Read",
  monday: true,
  tuesday: true,
  wednesday: true,
  friday: true
}))
habitTracker.habits.append(new Habit({
  name: "Walk",
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true
}))
habitTracker.habits.append(new Habit({
  name: "Stretch",
  monday: true,
  saturday: true
}))
if (!core.isCarryingOver) habitTracker.start()

core.heading("Tests")
/** Tests */
export function testStreaks() {
  return core.test("test streaks", function testStreaks() {
    core.echoTestAction(`set the habit to a new habit with name = "Read", monday = yes, tuesday = yes, thursday = yes`)
    const habit = new Habit({
      name: "Read",
      monday: true,
      tuesday: true,
      thursday: true
    })
    core.expect(habit.count, `the count of the habit`, 3, `3`)
    core.expect(habit.streak, `the streak of the habit`, 2, `2`)
    core.echoTestAction(`set the wednesday of the habit to yes`)
    habit.wednesday = true
    core.expect(habit.streak, `the streak of the habit`, 4, `4`)
  })
}
// -----------
core.installStyles(undefined, `/* File styles.css:  how the tracker looks.¬   - The days' names and every habit's row share one grid:  the name, seven days, its count and its streak.¬   - The week, <habit-tracker-week>, holds a <habit-tracker-habit> a row;  inside one, its row is ::part(row). */¬¬.HabitTracker {¬  --columns: 1fr repeat(7, 2.25rem) 3.5rem 3.5rem;¬  max-width: 38em;¬  margin-inline: auto;¬  padding-block: 1.5em;¬}¬¬/* the field and its button on one line */¬.NewHabit {¬  display: flex;¬  gap: 0.5em;¬  margin-block: 1em 1.5em;¬}¬¬.NewHabit > ui-input {¬  flex: 1;¬}¬¬/****************¬ * The days' names, over the checkboxes¬ ****************/¬¬.Days {¬  display: grid;¬  grid-template-columns: var(--columns);¬  padding-inline: 0.75em;¬  opacity: 0.6;¬  font-size: 0.85em;¬  font-weight: bold;¬  text-align: center;¬}¬¬.Days > :first-child {¬  text-align: start;¬}¬¬/****************¬ * A habit:  a row of the same grid¬ ****************/¬¬habit-tracker-week {¬  display: flex;¬  flex-direction: column;¬  gap: 0.25em;¬  margin-top: 0.5em;¬}¬¬habit-tracker-week::part(placeholder) {¬  padding: 1em;¬  opacity: 0.6;¬  text-align: center;¬}¬¬habit-tracker-habit {¬  display: block;¬  padding: 0.25em 0.75em;¬  border-radius: 0.5em;¬  background: rgb(127 127 127 / 0.08);¬}¬¬habit-tracker-habit::part(row) {¬  display: grid;¬  grid-template-columns: var(--columns);¬  align-items: center;¬  justify-items: center;¬}¬¬habit-tracker-habit::part(name) {¬  justify-self: stretch;¬}¬¬habit-tracker-habit::part(count),¬habit-tracker-habit::part(streak) {¬  font-weight: bold;¬  font-variant-numeric: tabular-nums;¬}¬`)
// -----------
if (!core.isCarryingOver) testStreaks()
