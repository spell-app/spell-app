import { core, List, App, View, ViewableList, prop, derived, drawn } from "@spell/core"
import { E, SpellElement } from "@spell/elements"

core.heading("A task:  something to do -- in the outline style:  its name, then what's true of it")
/////////////////////////////////////////////////////////////////////////////////////////
// ## A task:  something to do -- in the outline style:  its name, then what's true of it
/////////////////////////////////////////////////////////////////////////////////////////
export type Priority = (typeof Task.Priorities)[number]

/** A view:  each task is its own element on the page, `<task-list-task>`. */
export class Task extends View {
  static elementTag = core.defineElement(this, "test-project")

  // - its "title" is text
  @prop({ type: "text" })
  accessor title!: string

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

  /** "task is done" */
  get isDone() {
    return this.done
  }

  /** "task is active" */
  get isActive() {
    return !this.done
  }

  /** its priority label's color:  red when it's high */
  get priorityColor() {
    if (this.priority === "high") return "red"
    return "grey"
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // ## drawing:  its grip, a checkbox, its title, and its priority -- styles.css shows it only when it isn't normal
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /**
   * a form of its own, bound to it:  checking the box, or typing a title, changes the task
   * - its row and its title are parts:  styles.css lays them out
   */
  @drawn draw() {
    return (
      <ui-form value={this}>
        <div part="row">
          <ui-icon part="grip" name="grip vertical" aria-label="Drag" />
          <ui-checkbox name="done" aria-label="Done" />
          <ui-input part="title" name="title" aria-label="Task" transparent={true} />
          <ui-label part="priority" size="tiny" color={this.priorityColor}>{this.priority}</ui-label>
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

// on the page, a click selects it;  shift and command (ctrl) select more,
// so the property editor beside the list changes them all at once
// and dragged, by its grip, to another place in its list:  the selected ones go with it

core.heading("Tests")
/** Tests */
export function testTasks() {
  return core.test("test tasks", function testTasks() {
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
// The tasks are this project's own:  Task.
// This file adds their list, and the app:  adding a task, filtering the list, and editing what's selected.
// What's where, top to bottom:
//   the checklist:  the tasks, shown as the filter says
//   the app:  its menu, the new task's field, the list and the property editor
//   start
//   tests

core.heading("The checklist:  the tasks, each its own element inside it")
///////////////////////////////////////////////////////////////
// ## The checklist:  the tasks, each its own element inside it
///////////////////////////////////////////////////////////////
export type Showing = (typeof Checklist.Showings)[number]

/** a viewable list:  `<task-list-checklist>`, around its tasks' `<task-list-task>`s */
export class Checklist extends ViewableList<Task> {
  static instanceType = Task
  static elementTag = core.defineElement(this, "test-project")

  /** what it shows:  every task, the ones still to do, or the ones done */
  // - its "showing" is one of all, active or done
  static Showings = ["all", "active", "done"] as const
  @prop({ oneOf: () => Checklist.Showings })
  accessor showing!: Showing

  // each task, unless the filter hides it
  drawEachItem(item: Task) {
    if (this.showing === "active" && item.isDone) return undefined
    if (this.showing === "done" && item.isActive) return undefined
    return core.drawThing(item)
  }

  // empty:  says so
  drawItsPlaceholder() {
    return <div part="placeholder">Nothing to do</div>
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

  drawEachItem(item: Task) {
    return this.currentThing?.drawEachItem(item)
  }

  drawItsPlaceholder() {
    return this.currentThing?.drawItsPlaceholder()
  }
}
core.useElement(Checklist, ChecklistElement)
// on the page, its tasks can be dragged to another place:  they move as the pointer does, gliding there

/** a task is in one checklist at a time */

core.heading("The app:  its menu, the new task's field, the list, and the property editor")
/** The app:  its menu, the new task's field, the list, and the property editor */
export class TaskList extends App {
  static elementTag = core.defineElement(this, "test-project", "App")

  // - its "tasks" is a new checklist
  @prop({ init: () => new Checklist(), early: true })
  accessor tasks!: Checklist

  /** what the new task's field holds:  the next task's title */
  // - its "draft" is text
  @prop({ type: "text" })
  accessor draft!: string

  @derived get activeCount() {
    return this.tasks.filter((task) => task.isActive).length
  }

  /** the draft, as a new task at the end of the list;  the field empties */
  addTheDraft() {
    if (this.draft === "") return
    this.tasks.append(new Task({ title: this.draft, priority: "normal" }))
    this.draft = ""
  }

  removeTheDoneTasks() {
    this.tasks.removeWhere((task) => task.isDone)
  }

  /**
   * its menu, the new task's field, then the list beside the property editor
   * - the menu's buttons are icons, each with a tooltip
   * - the property editor edits every selected task at once:  a property they disagree on shows "Mixed"
   */
  @drawn draw() {
    return (
      <ui-container class="TaskList">
        <ui-menu>
          <ui-item type="header">Task List</ui-item>
          <ui-item>{`${this.activeCount} to do`}</ui-item>
          <ui-menu position="right">
            <ui-item aria-label="All" selected={this.tasks.showing === "all"} onClick={() => (this.tasks.showing = "all")} style="cursor:pointer;user-select:none">
              <ui-icon name="list" />
              <ui-popup content="All" inverted={true} size="small" />
            </ui-item>
            <ui-item aria-label="To do" selected={this.tasks.showing === "active"} onClick={() => (this.tasks.showing = "active")} style="cursor:pointer;user-select:none">
              <ui-icon name="square outline" />
              <ui-popup content="To do" inverted={true} size="small" />
            </ui-item>
            <ui-item aria-label="Done" selected={this.tasks.showing === "done"} onClick={() => (this.tasks.showing = "done")} style="cursor:pointer;user-select:none">
              <ui-icon name="check square outline" />
              <ui-popup content="Done" inverted={true} size="small" />
            </ui-item>
            <ui-item aria-label="Remove done" onClick={() => this.removeTheDoneTasks()} style="cursor:pointer;user-select:none">
              <ui-icon name="trash alternate outline" />
              <ui-popup content="Remove the done tasks" inverted={true} size="small" />
            </ui-item>
          </ui-menu>
        </ui-menu>
        <ui-form value={this}>
          <div class="NewTask">
            <ui-input name="draft" placeholder="Something to do" aria-label="New task" fluid={true} />
            <ui-button primary={true} disabled={this.draft === ""} onClick={() => this.addTheDraft()} style="cursor:pointer;user-select:none">
              Add
            </ui-button>
          </div>
        </ui-form>
        <ui-grid columns="2" stackable={true}>
          {core.drawThing(this.tasks)}
          <ui-property-editor label="Selected tasks" schema="task-list-task" prop:value={this.tasks.selection}>
            <ui-property name="title" />
            <ui-property name="priority" />
            <ui-property name="done" />
            <ui-property name="notes" />
          </ui-property-editor>
        </ui-grid>
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
    { name: "tasks", kind: "json", description: "Its tasks." },
    { name: "draft", kind: "string", description: "Its draft." }
  ])

  addTheDraft() {
    return this.currentThing?.addTheDraft()
  }

  removeTheDoneTasks() {
    return this.currentThing?.removeTheDoneTasks()
  }
}
core.useElement(TaskList, TaskListElement)
export const taskList = new TaskList()

core.heading("Start")
//## Start
taskList.tasks.showing = "all"
taskList.tasks.append(new Task({
  title: "Write the Task List example",
  priority: "high",
  done: true
}))
taskList.tasks.append(new Task({ title: "Teach it to draw", priority: "normal" }))
taskList.tasks.append(new Task({ title: "Select some tasks, then edit them together", priority: "normal" }))
taskList.tasks.append(new Task({ title: "Drag tasks to reorder them", priority: "low" }))
if (!core.isCarryingOver) taskList.start()

core.heading("Tests")
/** Tests */
export function testTheFilter() {
  return core.test("test the filter", function testTheFilter() {
    core.echoTestAction(`set the tasks to a new checklist`)
    const tasks = new Checklist()
    core.echoTestAction(`add (a new task with title = "a", done = yes) to the tasks`)
    tasks.append(new Task({ title: "a", done: true }))
    core.echoTestAction(`add (a new task with title = "b") to the tasks`)
    tasks.append(new Task({ title: "b" }))
    core.expect(tasks.filter((task) => task.isActive).length, `the length of (tasks in the tasks where it is active)`, 1, `1`)
  })
}
// -----------
core.installStyles(undefined, `/* File styles.css:  how the task list looks.¬   - The list and each task are elements of their own, so these rules reach them all:¬     - the list, <task-list-checklist>, and its tasks inside it, each a <task-list-task>¬     - inside a task, by its parts:  its row, ::part(row);  its grip, ::part(grip);  its title, ::part(title);¬       its priority label, ::part(priority)¬     - an empty list's placeholder, which it draws itself, by its part:  ::part(placeholder) */¬¬/****************¬ * The app:  its menu, the new task's field, then the list beside the property editor¬ ****************/¬¬.TaskList {¬  padding-block: 1em;¬}¬¬/* the field and its button on one line */¬.NewTask {¬  display: flex;¬  gap: 0.5em;¬  margin-block: 1em;¬}¬¬.NewTask > ui-input {¬  flex: 1;¬}¬¬/****************¬ * The list:  one task a line¬ ****************/¬¬task-list-checklist {¬  display: flex;¬  flex-direction: column;¬  gap: 0.25em;¬}¬¬task-list-checklist::part(placeholder) {¬  padding: 1em;¬  color: grey;¬  text-align: center;¬}¬¬/****************¬ * A task:  its checkbox, its title, and its priority -- shown only when it isn't normal¬ ****************/¬¬task-list-task {¬  display: block;¬  padding: 0.25em 0.5em;¬  border-radius: 0.3em;¬}¬¬/* its checkbox, its title filling the line, then its priority */¬task-list-task::part(row) {¬  display: flex;¬  align-items: center;¬  gap: 0.5em;¬}¬¬/* its grip:  what a drag starts from */¬task-list-task::part(grip) {¬  flex: none;¬  color: grey;¬}¬¬task-list-task::part(title) {¬  flex: 1;¬}¬¬task-list-task::part(priority) {¬  flex: none;¬}¬¬task-list-task[priority="normal"]::part(priority),¬task-list-task:not([priority])::part(priority) {¬  display: none;¬}¬¬/* selected:  a soft purple band, in place of the outline every selected thing has */¬task-list-task:state(selected) {¬  --spell-selected-outline: none;¬  background: rgb(150 80 255 / 0.12);¬}¬¬/* done:  its title fades */¬task-list-task[done] {¬  opacity: 0.6;¬}¬`)
// -----------
if (!core.isCarryingOver) testTasks()
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
