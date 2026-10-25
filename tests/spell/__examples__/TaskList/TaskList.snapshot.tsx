import { core, List, App, View, ViewableList, prop, derived, thing, drawn } from "@spell/core"
import { E, SpellElement } from "@spell/elements"

core.heading("A task")
////////////
// ## A task
////////////
// Something to do:  its title, its priority, and whether it's done.
// Each task is its own element on the page, `<task-list-task>`.

export type Priority = (typeof Task.Priorities)[number]

export class Task extends View {
  static elementTag = core.defineElement(this, "test-project")

  /** What to do */
  // - its "title" is text
  @prop({ type: "text" })
  accessor title!: string

  /** Anything else about it */
  // - its "notes" is text
  @prop({ type: "text" })
  accessor notes!: string

  // - its "priority" is one of low, normal or high
  static Priorities = ["low", "normal", "high"] as const
  @prop({ oneOf: () => Task.Priorities })
  accessor priority!: Priority

  // - its "done" is yes or no
  @prop({ type: "choice" })
  accessor done!: boolean

  get isDone() {
    return this.done
  }

  get isActive() {
    return !this.isDone
  }

  /** A form of its own, bound to it:  checking the box, or typing a title, changes the task;  its priority shows only when it isn't normal */
  @drawn draw() {
    return (
      <ui-form value={this}>
        <div part="row">
          <ui-icon part="grip" name="grip vertical" aria-label="Drag" />
          <ui-checkbox name="done" aria-label="Done" />
          <ui-input part="title" name="title" aria-label="Task" appearance="transparent" />
          <ui-label part="priority" size="tiny" color={this.priority === "high" ? "red" : "grey"} hidden={this.priority !== "normal" ? undefined : true}>
            {this.priority}
          </ui-label>
        </div>
      </ui-form>
    )
  }

  static canBeSelected = true

  static canBeDragged = true

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
    { name: "notes", kind: "string", description: "Its notes." },
    { name: "priority", kind: "string", description: "Its priority." },
    { name: "done", kind: "boolean", description: "Its done." }
  ])
}
core.useElement(Task, TaskElement)

// A click selects it, shift and command (ctrl) more, for the property editor;  its grip drags it, the selected ones with it

export function testCheckingOneOff() {
  return core.test("test checking one off", function testCheckingOneOff() {
    const it = new Task()
    core.echoTestAction(`set the task to a new task with title = "Write the tests"`)
    const task = new Task({ title: "Write the tests" })
    core.expect(task.isActive, `the task is active`, true, `yes`)
    core.echoTestAction(`set the done of the task to yes`)
    task.done = true
    core.expect(task.isDone, `the task is done`, true, `yes`)
  })
}
// -----------
core.heading("Task List")
///////////////
// ## Task List
///////////////
// A to-do list:  add a task, check it off, filter the list, and edit the selected tasks together.
// Its tasks are this project's own `<spell-view "task">`;  this file holds their list, and the app.

core.heading("The checklist")
///////////////////
// ## The checklist
///////////////////
// The tasks, each its own element inside it:  `<task-list-checklist>`, around its `<task-list-task>`s.

export type Showing = (typeof Checklist.Showings)[number]

export class Checklist extends ViewableList<Task> {
  static instanceType = Task
  static elementTag = core.defineElement(this, "test-project")

  /** What it shows:  every task, the ones still to do, or the ones done */
  // - its "showing" is one of all, active or done
  //   - it "is showing (showing)"
  static Showings = ["all", "active", "done"] as const
  @prop({ oneOf: () => Checklist.Showings })
  accessor showing!: Showing
  isShowingShowing(showing: Showing) {
    return this.showing === showing
  }

  // each task, unless the filter hides it
  drawEachItem(item: Task) {
    if (this.isShowingShowing("active") && item.isDone) return undefined
    if (this.isShowingShowing("done") && item.isActive) return undefined
    return core.drawThing(item)
  }

  // What it shows while it's empty
  drawItsPlaceholder() {
    return <ui-text part="placeholder">Nothing to do</ui-text>
  }

  static reorderItemsAfter = 0

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

  isShowingShowing(showing: Showing) {
    return this.currentThing?.isShowingShowing(showing)
  }

  drawEachItem(item: Task) {
    return this.currentThing?.drawEachItem(item)
  }

  drawItsPlaceholder() {
    return this.currentThing?.drawItsPlaceholder()
  }
}
core.useElement(Checklist, ChecklistElement)

// on the page, its tasks can be dragged to another place:  they move as the pointer does, gliding there

export function testTheFilter() {
  return core.test("test the filter", function testTheFilter() {
    const it = new Checklist()
    core.echoTestAction(`set the tasks to a new checklist`)
    const tasks = new Checklist()
    core.echoTestAction(`add (a new task with title = "a", done = yes) to the tasks`)
    tasks.append(new Task({ title: "a", done: true }))
    core.echoTestAction(`add (a new task with title = "b") to the tasks`)
    tasks.append(new Task({ title: "b" }))
    core.expect(tasks.filter((task) => task.isActive).length, `the length of (tasks in the tasks where it is active)`, 1, `1`)
  })
}

/** a task is in one checklist at a time */

core.heading("The app")
/////////////
// ## The app
/////////////
// Its toolbar, the new task's field, then the list beside the property editor.

@thing
export class TaskList extends App {
  static elementTag = core.defineElement(this, "test-project", "App")

  // - its "checklist" is a new checklist
  @prop({ init: () => new Checklist(), early: true })
  accessor checklist!: Checklist

  /** The next task's title, as the new task's field holds it */
  // - its "draft" is text
  @prop({ type: "text" })
  accessor draft!: string

  @derived get activeCount() {
    return this.checklist.filter((task) => task.isActive).length
  }

  /** A new task list shows every task, and starts with a few */
  create() {
    this.checklist.showing = "all"
    this.checklist.append(new Task({
      title: "Write the Task List example",
      priority: "high",
      done: true
    }))
    this.checklist.append(new Task({ title: "Teach it to draw", priority: "normal" }))
    this.checklist.append(new Task({ title: "Select some tasks, then edit them together", priority: "normal" }))
    this.checklist.append(new Task({ title: "Drag tasks to reorder them", priority: "low" }))
  }

  /** The draft, as a new task at the end of the list;  the field empties */
  addTheDraft() {
    if (this.draft === "") return
    this.checklist.append(new Task({ title: this.draft, priority: "normal" }))
    this.draft = ""
  }

  /** The property editor edits every selected task at once:  a property they disagree on shows Mixed */
  @drawn draw() {
    return (
      <ui-container class="TaskList">
        <ui-toolbar menu="tasks menu" aria-label="Tasks">
          <ui-text slot="title" size="large">Task List</ui-text>
          <ui-text slot="right">
            <span hidden={this.activeCount === 0 ? undefined : "until-found"}>All done</span>
            <span hidden={!(this.activeCount === 0) ? undefined : "until-found"}>{this.activeCount} to do</span>
          </ui-text>
        </ui-toolbar>
        <ui-form value={this}>
          <ui-input name="draft" placeholder="Something to do" aria-label="New task" fluid={true} action={true}>
            <ui-button slot="action" color="primary" disabled={this.draft === ""} onClick={() => this.addTheDraft()} style="cursor:pointer;user-select:none">
              Add
            </ui-button>
          </ui-input>
        </ui-form>
        <ui-grid columns="2" stackable={true}>
          {core.drawThing(this.checklist)}
          <ui-property-editor label="Selected tasks" schema="task-list-task" prop:value={this.checklist.selection}>
            <ui-property name="title" />
            <ui-property name="priority" />
            <ui-property name="done" />
            <ui-property name="notes" />
          </ui-property-editor>
        </ui-grid>
      </ui-container>
    )
  }

  showAll() {
    this.checklist.showing = "all"
  }

  get showAllIsSelected() {
    return this.checklist.isShowingShowing("all")
  }

  showToDo() {
    this.checklist.showing = "active"
  }

  get showToDoIsSelected() {
    return this.checklist.isShowingShowing("active")
  }

  showDone() {
    this.checklist.showing = "done"
  }

  get showDoneIsSelected() {
    return this.checklist.isShowingShowing("done")
  }

  removeTheDoneTasks() {
    this.checklist.removeWhere((task) => task.isDone)
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
    { name: "checklist", kind: "json", description: "Its checklist." },
    { name: "draft", kind: "string", description: "Its draft." }
  ])

  create() {
    return this.currentThing?.create()
  }

  addTheDraft() {
    return this.currentThing?.addTheDraft()
  }

  showAll() {
    return this.currentThing?.showAll()
  }

  showToDo() {
    return this.currentThing?.showToDo()
  }

  showDone() {
    return this.currentThing?.showDone()
  }

  removeTheDoneTasks() {
    return this.currentThing?.removeTheDoneTasks()
  }
}
core.useElement(TaskList, TaskListElement)
export const taskList = new TaskList()

// Which tasks the list shows:  the toolbar ticks the one it's showing
core.describeAction(TaskList, "showAll", { title: "show all", icon: "list", selectedWhen: "showAllIsSelected" })
core.describeAction(TaskList, "showToDo", { title: "show to do", icon: "square outline", selectedWhen: "showToDoIsSelected" })
core.describeAction(TaskList, "showDone", { title: "show done", icon: "check square outline", selectedWhen: "showDoneIsSelected" })
core.describeAction(TaskList, "removeTheDoneTasks", { title: "remove the done tasks", icon: "trash alternate outline" })
// - its "tasks menu" is a menu of "show all" , "show to do" , "show done" , "-" and "remove the done tasks"
core.describeMenu(TaskList, "tasksMenu", { items: ["showAll", "showToDo", "showDone", "-", "removeTheDoneTasks"] })

if (!core.isCarryingOver) taskList.start()
// -----------
core.installStyles(undefined, `/* File styles.css:  how the task list looks.¬   - The list and each task are elements of their own, so these rules reach them all:¬     - the list, <task-list-checklist>, and its tasks inside it, each a <task-list-task>¬     - inside a task, by its parts:  its row, ::part(row);  its grip, ::part(grip);  its title, ::part(title);¬       its priority label, ::part(priority)¬     - an empty list's placeholder, which it draws itself, by its part:  ::part(placeholder) */¬¬/****************¬ * The app:  its toolbar, the new task's field, then the list beside the property editor¬ ****************/¬¬.TaskList {¬  padding-block: 1em;¬}¬¬/* the new task's field, between the toolbar and the list */¬.TaskList > ui-form {¬  display: block;¬  margin-block: 1em;¬}¬¬/****************¬ * The list:  one task a line¬ ****************/¬¬task-list-checklist {¬  display: flex;¬  flex-direction: column;¬  gap: 0.25em;¬}¬¬task-list-checklist::part(placeholder) {¬  display: block;¬  padding: 1em;¬  color: grey;¬  text-align: center;¬}¬¬/****************¬ * A task:  its checkbox, its title, and its priority -- its drawing shows that only when it isn't normal¬ ****************/¬¬task-list-task {¬  display: block;¬  padding: 0.25em 0.5em;¬  border-radius: 0.3em;¬}¬¬/* its checkbox, its title filling the line, then its priority */¬task-list-task::part(row) {¬  display: flex;¬  align-items: center;¬  gap: 0.5em;¬}¬¬/* its grip:  what a drag starts from */¬task-list-task::part(grip) {¬  flex: none;¬  color: grey;¬}¬¬task-list-task::part(title) {¬  flex: 1;¬}¬¬task-list-task::part(priority) {¬  flex: none;¬}¬¬/* selected:  a soft purple band, in place of the outline every selected thing has */¬task-list-task:state(selected) {¬  --spell-selected-outline: none;¬  background: rgb(150 80 255 / 0.12);¬}¬¬/* done:  its title fades */¬task-list-task[done] {¬  opacity: 0.6;¬}¬`)
// -----------
if (!core.isCarryingOver) testCheckingOneOff()
if (!core.isCarryingOver) testTheFilter()

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
