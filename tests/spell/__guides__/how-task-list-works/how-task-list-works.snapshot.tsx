import { core, List, App, View, ViewableList, prop, derived, drawn } from "@spell/core"
import { E, SpellElement } from "@spell/elements"

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
export class Task extends View {
  static elementTag = core.defineElement(this, "test-project")

  // - its "title" is text
  @prop({ type: "text" })
  accessor title!: string

  // - its "done" is yes or no
  @prop({ type: "choice" })
  accessor done!: boolean

  get isDone() {
    return this.done
  }

  get isActive() {
    return !this.done
  }

  /** a form of its own, bound to the task:  ticking the box changes its "done" */
  @drawn draw() {
    return (
      <ui-form value={this}>
        <div part="row">
          <ui-checkbox name="done" aria-label="Done" />
          <span part="title">{this.title}</span>
        </div>
      </ui-form>
    )
  }

  get checklist() {
    return Checklist.ownerOf(this)!
  }
}

/**
 * `<test-project-task>`:  a task, drawn in its own element, e.g. by `draw the task`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its task's properties;  its methods call its task's.
 * - What every view's element does, e.g. drawing its task, is `SpellElement`'s.
 */
export class TaskElement extends SpellElement<Task> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-task", "task", [
    { name: "done", kind: "boolean", description: "Its done." }
  ])
}
core.useElement(Task, TaskElement)

core.heading("The checklist:  the tasks, shown as its filter says")
export type Showing = (typeof Checklist.Showings)[number]

/** The checklist:  the tasks, shown as its filter says */
export class Checklist extends ViewableList<Task> {
  static instanceType = Task
  static elementTag = core.defineElement(this, "test-project")

  /** what it shows:  every task, the ones still to do, or the ones done */
  // - its "showing" is one of all, active or done
  static Showings = ["all", "active", "done"] as const
  @prop({ oneOf: () => Checklist.Showings })
  accessor showing!: Showing

  // each task in turn, unless the filter hides it:  "return nothing" draws nothing
  drawEachItem(item: Task) {
    if (this.showing === "active" && item.isDone) return undefined
    if (this.showing === "done" && item.isActive) return undefined
    return core.drawThing(item)
  }

  static exclusive = true
}

/**
 * `<test-project-checklist>`:  a checklist, drawn in its own element, e.g. by `draw the checklist`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its checklist's properties;  its methods call its checklist's.
 * - What every view's element does, e.g. drawing its checklist, is `SpellElement`'s.
 */
export class ChecklistElement extends SpellElement<Checklist> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-checklist", "checklist", [
    { name: "showing", kind: "string", description: "Its showing." }
  ])

  drawEachItem(item: Task) {
    return this.currentThing?.drawEachItem(item)
  }
}
core.useElement(Checklist, ChecklistElement)


core.heading("The app")
/** The app */
export class TaskList extends App {
  static elementTag = core.defineElement(this, "test-project", "App")

  // - its "tasks" is a new checklist
  @prop({ init: () => new Checklist(), early: true })
  accessor tasks!: Checklist

  /** how many are left:  the tasks picked out with "where", counted */
  @derived get activeCount() {
    return this.tasks.filter((task) => task.isActive).length
  }

  @drawn draw() {
    return (
      <ui-container class="TaskList">
        <ui-menu secondary={true}>
          <ui-item type="header">{`${this.activeCount} to do`}</ui-item>
          <ui-item selected={this.tasks.showing === "all"} onClick={() => (this.tasks.showing = "all")} style="cursor:pointer;user-select:none">
            All
          </ui-item>
          <ui-item selected={this.tasks.showing === "active"} onClick={() => (this.tasks.showing = "active")} style="cursor:pointer;user-select:none">
            To do
          </ui-item>
          <ui-item selected={this.tasks.showing === "done"} onClick={() => (this.tasks.showing = "done")} style="cursor:pointer;user-select:none">
            Done
          </ui-item>
        </ui-menu>
        {core.drawThing(this.tasks)}
      </ui-container>
    )
  }
}

/**
 * `<test-project-app>`:  a task list, drawn in its own element, e.g. by `draw the task list`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its task list's properties;  its methods call its task list's.
 * - What every view's element does, e.g. drawing its task list, is `SpellElement`'s.
 */
export class TaskListElement extends SpellElement<TaskList> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-app", "task list", [
    { name: "tasks", kind: "json", description: "Its tasks." }
  ])
}
core.useElement(TaskList, TaskListElement)
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

// each view type's tag, for the JSX
declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      /** `TaskElement` */
      "test-project-task": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `ChecklistElement` */
      "test-project-checklist": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `TaskListElement` */
      "test-project-app": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
    }
  }
}
