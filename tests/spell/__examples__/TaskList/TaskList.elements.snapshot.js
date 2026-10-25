import { core, List, App, View, ViewableList, h, sendCall } from "@spell/core"

////////////
// ## A task
////////////
// Something to do:  its title, its priority, and whether it's done.
// Each task is its own element on the page, `<task-list-task>`.

export class Task extends View {
  static elementTag = core.defineElement(this, "test-project")

  /** What to do */
  // - its "title" is text
  static { this.declareProp("title", { type: "text" }) }
  get title() { return this.getProp("title") }
  set title(value) { this.setProp("title", value) }

  /** Anything else about it */
  // - its "notes" is text
  static { this.declareProp("notes", { type: "text" }) }
  get notes() { return this.getProp("notes") }
  set notes(value) { this.setProp("notes", value) }

  // - its "priority" is one of low, normal or high
  static Priorities = ["low", "normal", "high"]
  static { this.declareProp("priority", { oneOf: Task.Priorities }) }
  get priority() { return this.getProp("priority") }
  set priority(value) { this.setProp("priority", value) }

  // - its "done" is yes or no
  static { this.declareProp("done", { type: "choice" }) }
  get done() { return this.getProp("done") }
  set done(value) { this.setProp("done", value) }

  get isDone() {
    return this.done
  }

  get isActive() {
    return !this.isDone
  }

  /** A form of its own, bound to it:  checking the box, or typing a title, changes the task */
  draw() {
    return h("ui-form", { value: this },
      h("div", { part: "row" },
        h("ui-icon", { part: "grip", name: "grip vertical", "aria-label": "Drag" }),
        h("ui-checkbox", { name: "done", "aria-label": "Done" }),
        h("ui-input", { part: "title", name: "title", "aria-label": "Task", appearance: "transparent" }),
        h("ui-label", { part: "priority", size: "tiny", color: () => this.priority === "high" ? "red" : "grey" },
          () => this.priority
        )
      )
    )
  }

  static canBeSelected = true

  static canBeDragged = true

  get checklist() {
    return Checklist.ownerOf(this)
  }
}

// A click selects it, shift and command (ctrl) more, for the property editor;  its grip drags it, the selected ones with it

export function testCheckingOneOff(...args) {
  return sendCall("test_checking_one_off", args)
}
// -----------
///////////////
// ## Task List
///////////////
// A to-do list:  add a task, check it off, filter the list, and edit the selected tasks together.
// Its tasks are this project's own `<spell-view "task">`;  this file holds their list, and the app.

///////////////////
// ## The checklist
///////////////////
// The tasks, each its own element inside it:  `<task-list-checklist>`, around its `<task-list-task>`s.

export class Checklist extends ViewableList {
  static instanceType = Task
  static elementTag = core.defineElement(this, "test-project")

  /** What it shows:  every task, the ones still to do, or the ones done */
  // - its "showing" is one of all, active or done
  //   - it "is showing (showing)"
  static Showings = ["all", "active", "done"]
  static { this.declareProp("showing", { oneOf: Checklist.Showings }) }
  get showing() { return this.getProp("showing") }
  set showing(value) { this.setProp("showing", value) }
  isShowingShowing(showing) {
    return this.showing === showing
  }

  // each task, unless the filter hides it
  drawEachItem(item) {
    if (this.isShowingShowing("active") && item.isDone) return undefined
    if (this.isShowingShowing("done") && item.isActive) return undefined
    return core.drawThing(item)
  }

  // What it shows while it's empty
  drawItsPlaceholder() {
    return h("ui-text", { part: "placeholder" }, "Nothing to do")
  }

  static reorderItemsAfter = 0

  static exclusive = true
}

// on the page, its tasks can be dragged to another place:  they move as the pointer does, gliding there

export function testTheFilter(...args) {
  return sendCall("test_the_filter", args)
}

/** a task is in one checklist at a time */

/////////////
// ## The app
/////////////
// Its toolbar, the new task's field, then the list beside the property editor.

export class TaskList extends App {
  static elementTag = core.defineElement(this, "test-project", "App")

  // - its "checklist" is a new checklist
  static { this.declareProp("checklist", { init: () => new Checklist(), early: true }) }
  get checklist() { return this.getProp("checklist") }
  set checklist(value) { this.setProp("checklist", value) }

  /** The next task's title, as the new task's field holds it */
  // - its "draft" is text
  static { this.declareProp("draft", { type: "text" }) }
  get draft() { return this.getProp("draft") }
  set draft(value) { this.setProp("draft", value) }

  get activeCount() {
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
  draw() {
    return h("ui-container", { class: "TaskList" },
      h("ui-toolbar", { menu: "tasks menu", "aria-label": "Tasks" },
        h("ui-text", { slot: "title", size: "large" }, "Task List"),
        h("ui-text", { slot: "right" }, () => this.activeCount, " to do")
      ),
      h("ui-form", { value: this },
        h("ui-input", { name: "draft", placeholder: "Something to do", "aria-label": "New task", fluid: true, action: true },
          h("ui-button", {
            slot: "action",
            color: "primary",
            disabled: () => this.draft === "",
            onClick: () => sendCall("add_the_draft", [], this),
            style: "cursor:pointer;user-select:none"
          }, "Add")
        )
      ),
      h("ui-grid", { columns: "2", stackable: true },
        () => core.drawThing(this.checklist),
        h("ui-property-editor", { label: "Selected tasks", schema: "task-list-task", "prop:value": () => this.checklist.selection },
          h("ui-property", { name: "title" }),
          h("ui-property", { name: "priority" }),
          h("ui-property", { name: "done" }),
          h("ui-property", { name: "notes" })
        )
      )
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
export let taskList

// Which tasks the list shows:  the toolbar ticks the one it's showing

// -----------
core.installStyles(undefined, `/* File styles.css:  how the task list looks.¬   - The list and each task are elements of their own, so these rules reach them all:¬     - the list, <task-list-checklist>, and its tasks inside it, each a <task-list-task>¬     - inside a task, by its parts:  its row, ::part(row);  its grip, ::part(grip);  its title, ::part(title);¬       its priority label, ::part(priority)¬     - an empty list's placeholder, which it draws itself, by its part:  ::part(placeholder) */¬¬/****************¬ * The app:  its toolbar, the new task's field, then the list beside the property editor¬ ****************/¬¬.TaskList {¬  padding-block: 1em;¬}¬¬/* the new task's field, between the toolbar and the list */¬.TaskList > ui-form {¬  display: block;¬  margin-block: 1em;¬}¬¬/****************¬ * The list:  one task a line¬ ****************/¬¬task-list-checklist {¬  display: flex;¬  flex-direction: column;¬  gap: 0.25em;¬}¬¬task-list-checklist::part(placeholder) {¬  display: block;¬  padding: 1em;¬  color: grey;¬  text-align: center;¬}¬¬/****************¬ * A task:  its checkbox, its title, and its priority -- shown only when it isn't normal¬ ****************/¬¬task-list-task {¬  display: block;¬  padding: 0.25em 0.5em;¬  border-radius: 0.3em;¬}¬¬/* its checkbox, its title filling the line, then its priority */¬task-list-task::part(row) {¬  display: flex;¬  align-items: center;¬  gap: 0.5em;¬}¬¬/* its grip:  what a drag starts from */¬task-list-task::part(grip) {¬  flex: none;¬  color: grey;¬}¬¬task-list-task::part(title) {¬  flex: 1;¬}¬¬task-list-task::part(priority) {¬  flex: none;¬}¬¬task-list-task[priority="normal"]::part(priority),¬task-list-task:not([priority])::part(priority) {¬  display: none;¬}¬¬/* selected:  a soft purple band, in place of the outline every selected thing has */¬task-list-task:state(selected) {¬  --spell-selected-outline: none;¬  background: rgb(150 80 255 / 0.12);¬}¬¬/* done:  its title fades */¬task-list-task[done] {¬  opacity: 0.6;¬}¬`)
// -----------

/** Binds each thing the program keeps, from Python's state. */
export function adopt(state) {
  taskList = state["task_list"]
}

