import { core, App, View, ViewableList, prop, derived, drawn } from "@spell/core"
import { E, SpellElement } from "@spell/elements"

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
  @prop({ type: "text" })
  accessor name!: string

  // - its "monday" is yes or no
  @prop({ type: "choice" })
  accessor monday!: boolean

  // - its "tuesday" is yes or no
  @prop({ type: "choice" })
  accessor tuesday!: boolean

  // - its "wednesday" is yes or no
  @prop({ type: "choice" })
  accessor wednesday!: boolean

  // - its "thursday" is yes or no
  @prop({ type: "choice" })
  accessor thursday!: boolean

  // - its "friday" is yes or no
  @prop({ type: "choice" })
  accessor friday!: boolean

  // - its "saturday" is yes or no
  @prop({ type: "choice" })
  accessor saturday!: boolean

  // - its "sunday" is yes or no
  @prop({ type: "choice" })
  accessor sunday!: boolean

  /** its week, Monday first */
  get days() {
    return [this.monday, this.tuesday, this.wednesday, this.thursday, this.friday, this.saturday, this.sunday]
  }

  /** how many days this week it was done */
  @derived get count() {
    return core.itemCountOf(core.filter(this.days, (day: boolean) => day))
  }

  /** the most days in a row it was done */
  @derived get streak() {
    let run: number = 0
    let best: number = 0
    this.days.forEach((day: boolean) => {
      if (day) {
        run = run + 1
        if (run > best) best = run
      } else run = 0
    })
    return best
  }

  /** a form of its own, bound to it:  ticking a day, or typing a name, changes the habit */
  @drawn draw() {
    return (
      <ui-form value={this}>
        <div part="row">
          <ui-input part="name" name="name" aria-label="Habit" transparent={true} />
          <ui-checkbox name="monday" aria-label="Monday" />
          <ui-checkbox name="tuesday" aria-label="Tuesday" />
          <ui-checkbox name="wednesday" aria-label="Wednesday" />
          <ui-checkbox name="thursday" aria-label="Thursday" />
          <ui-checkbox name="friday" aria-label="Friday" />
          <ui-checkbox name="saturday" aria-label="Saturday" />
          <ui-checkbox name="sunday" aria-label="Sunday" />
          <div part="count">{this.count}</div>
          <div part="streak">{this.streak}</div>
        </div>
      </ui-form>
    )
  }

  get week() {
    return Week.ownerOf(this)!
  }
}

/**
 * `<test-project-habit>`:  a habit, drawn in its own element, e.g. by `draw the habit`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its habit's properties;  its methods call its habit's.
 * - What every view's element does, e.g. drawing its habit, is `SpellElement`'s.
 */
export class HabitElement extends SpellElement<Habit> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-habit", "habit", [
    { name: "name", kind: "string", description: "Its name." },
    { name: "monday", kind: "boolean", description: "Its monday." },
    { name: "tuesday", kind: "boolean", description: "Its tuesday." },
    { name: "wednesday", kind: "boolean", description: "Its wednesday." },
    { name: "thursday", kind: "boolean", description: "Its thursday." },
    { name: "friday", kind: "boolean", description: "Its friday." },
    { name: "saturday", kind: "boolean", description: "Its saturday." },
    { name: "sunday", kind: "boolean", description: "Its sunday." }
  ])
}
core.useElement(Habit, HabitElement)

core.heading("The week:  the habits, one a row")
/** The week:  the habits, one a row */
export class Week extends ViewableList<Habit> {
  static instanceType = Habit
  static elementTag = core.defineElement(this, "test-project")

  drawItsPlaceholder() {
    return <div part="placeholder">No habits yet:  add one above</div>
  }

  static reorderItemsAfter = 0

  static exclusive = true
}

/**
 * `<test-project-week>`:  a week, drawn in its own element, e.g. by `draw the week`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its week's properties;  its methods call its week's.
 * - What every view's element does, e.g. drawing its week, is `SpellElement`'s.
 */
export class WeekElement extends SpellElement<Week> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-week", "week", [])

  drawItsPlaceholder() {
    return this.currentThing?.drawItsPlaceholder()
  }
}
core.useElement(Week, WeekElement)

/** a habit is in one week */

core.heading("The tracker")
/** The tracker */
export class HabitTracker extends App {
  static elementTag = core.defineElement(this, "test-project", "App")

  // - its "habits" is a new week
  @prop({ init: () => new Week(), early: true })
  accessor habits!: Week

  /** what the new habit's field holds */
  // - its "draft" is text
  @prop({ type: "text" })
  accessor draft!: string

  /** the draft, as a new habit at the end;  the field empties */
  addTheDraft() {
    if (this.draft === "") return
    this.habits.append(new Habit({ name: this.draft }))
    this.draft = ""
  }

  /** the new habit's field, the days' names, then a row per habit */
  @drawn draw() {
    return (
      <div class="HabitTracker">
        <h2>This week</h2>
        <ui-form value={this}>
          <div class="NewHabit">
            <ui-input name="draft" placeholder="A habit to keep, e.g. Read" aria-label="New habit" fluid={true} />
            <ui-button primary={true} disabled={this.draft === ""} onClick={() => this.addTheDraft()} style="cursor:pointer;user-select:none">
              Add
            </ui-button>
          </div>
        </ui-form>
        <div class="Days">
          <div>Habit</div>
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
          <div>S</div>
          <div>Days</div>
          <div>Streak</div>
        </div>
        {core.drawThing(this.habits)}
      </div>
    )
  }
}

/**
 * `<test-project-app>`:  a habit tracker, drawn in its own element, e.g. by `draw the habit tracker`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its habit tracker's properties;  its methods call its habit tracker's.
 * - What every view's element does, e.g. drawing its habit tracker, is `SpellElement`'s.
 */
export class HabitTrackerElement extends SpellElement<HabitTracker> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-app", "habit tracker", [
    { name: "habits", kind: "json", description: "Its habits." },
    { name: "draft", kind: "string", description: "Its draft." }
  ])

  addTheDraft() {
    return this.currentThing?.addTheDraft()
  }
}
core.useElement(HabitTracker, HabitTrackerElement)
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

// each view type's tag, for the JSX
declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      /** `HabitElement` */
      "test-project-habit": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `WeekElement` */
      "test-project-week": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `HabitTrackerElement` */
      "test-project-app": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
    }
  }
}
