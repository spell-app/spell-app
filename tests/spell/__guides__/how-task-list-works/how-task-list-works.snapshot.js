import { core, Thing, List, App, Drawable, DrawableList, h } from "@spell/core"

core.heading("How the Task List works")
/////////////////////////////
// ## How the Task List works
/////////////////////////////
// The Task List example is a to-do list:  type a task, tick it off when it's done,
// and choose whether to see them all, only the ones to do, or only the ones done.
// Three ideas do the work:
// - each task is a THING of its own, which draws itself as a row with a checkbox
// - the list picks tasks out with "where":  "tasks in its tasks where it is active"
// - the list draws each task, or skips it, as its filter says
//
// This guide keeps those three, and leaves out dragging, selecting and the property editor.
// Open Task List, in the Examples, for all of it.  Lista de tareas is the same list, written in Spanish.

core.heading("A task")
/** A task */
export class Task extends Drawable {
  static elementTag = core.defineElement(this, "test-project")

  // - its "title" is text
  static { this.declareProp("title", { type: "text" }) }
  get title() { return this.getProp("title") }
  set title(value) { this.setProp("title", value) }

  // - its "done" is yes or no
  static { this.declareProp("done", { type: "choice" }) }
  get done() { return this.getProp("done") }
  set done(value) { this.setProp("done", value) }

  get isDone() {
    return this.done
  }

  get isActive() {
    return !this.done
  }

  /** a form of its own, bound to the task:  ticking the box changes its "done" */
  draw() {
    return h("ui-form", { value: this },
      h("div", { part: "row" },
        h("ui-checkbox", { name: "done", "aria-label": "Done" }),
        h("span", { part: "title" }, () => this.title)
      )
    )
  }

  get checklist() {
    return Checklist.ownerOf(this)
  }
}

core.heading("The checklist:  the tasks, shown as its filter says")
/** The checklist:  the tasks, shown as its filter says */
export class Checklist extends DrawableList {
  static instanceType = Task
  static elementTag = core.defineElement(this, "test-project")

  /** what it shows:  every task, the ones still to do, or the ones done */
  // - its "showing" is one of all, active or done
  static Showings = ["all", "active", "done"]
  static { this.declareProp("showing", { oneOf: Checklist.Showings }) }
  get showing() { return this.getProp("showing") }
  set showing(value) { this.setProp("showing", value) }

  // each task in turn, unless the filter hides it:  "return nothing" draws nothing
  drawEachItem(item) {
    if (this.showing === "active" && item.isDone) return undefined
    if (this.showing === "done" && item.isActive) return undefined
    return core.drawThing(item)
  }

  static exclusive = true
}


core.heading("The app")
/** The app */
export class TaskList extends App {
  // - its "tasks" is a new checklist
  static { this.declareProp("tasks", { init: () => new Checklist(), early: true }) }
  get tasks() { return this.getProp("tasks") }
  set tasks(value) { this.setProp("tasks", value) }

  /** how many are left:  the tasks picked out with "where", counted */
  get activeCount() {
    return this.tasks.filter((task) => task.isActive).length
  }

  draw() {
    return h("ui-container", { class: "TaskList" },
      h("ui-menu", { secondary: true },
        h("ui-item", { type: "header" }, () => `${this.activeCount} to do`),
        h("ui-item", {
          selected: () => this.tasks.showing === "all",
          onClick: () => (this.tasks.showing = "all"),
          style: "cursor:pointer;user-select:none"
        }, "All"),
        h("ui-item", {
          selected: () => this.tasks.showing === "active",
          onClick: () => (this.tasks.showing = "active"),
          style: "cursor:pointer;user-select:none"
        }, "To do"),
        h("ui-item", {
          selected: () => this.tasks.showing === "done",
          onClick: () => (this.tasks.showing = "done"),
          style: "cursor:pointer;user-select:none"
        }, "Done")
      ),
      () => core.drawThing(this.tasks)
    )
  }
}
export const taskList = new TaskList()

core.heading("Start:  three tasks, one of them done")
//## Start:  three tasks, one of them done
taskList.tasks.showing = "all"
taskList.tasks.append(new Task({ title: "Read this guide", done: true }))
taskList.tasks.append(new Task({ title: "Tick a box on the right" }))
taskList.tasks.append(new Task({ title: "Try the To do filter" }))
if (!core.isCarryingOver) taskList.start()

core.heading("A check")
/** A check */
export function testCountingTheTasksToDo() {
  return core.test("test counting the tasks to do", function testCountingTheTasksToDo() {
    core.echoTestAction(`set the list to a new checklist`)
    const list = new Checklist()
    core.echoTestAction(`add (a new task with title = "a", done = yes) to the list`)
    list.append(new Task({ title: "a", done: true }))
    core.echoTestAction(`add (a new task with title = "b") to the list`)
    list.append(new Task({ title: "b" }))
    core.expect(list.filter((task) => task.isActive).length, `the length of (tasks in the list where it is active)`, 1, `1`)
  })
}

core.heading("Try it")
////////////
// ## Try it
////////////
// - Tick "Tick a box on the right":  the count in the menu drops to 1.
// - Click "To do", then "Done":  the list shows only the tasks that fit.
// - Add a task:  copy one of the "add" lines under Start, and change its title.
// - Count the done ones too:  add a line under "its active count" that says
//       - its "done count" is the length of (tasks in its tasks where it is done)
//   and show it in the menu, the way the active count is.
//
// Where next:  Task List, in the Examples, where you type new tasks in, drag them into order,
// and select a few to change them all at once.
// -----------
core.installStyles(undefined, `/* File styles.css:  how the list looks -- a menu over the tasks, each a row:  its checkbox, then its title. */¬¬.TaskList {¬  max-width: 30em;¬  padding-block: 1.5em;¬}¬¬how-task-list-works-task::part(row) {¬  display: flex;¬  align-items: center;¬  gap: 0.75em;¬  padding-block: 0.4em;¬}¬`)
// -----------
if (!core.isCarryingOver) testCountingTheTasksToDo()
