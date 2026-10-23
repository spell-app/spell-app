import { core, Thing, List, App, Drawable, DrawableList, h, sendCall } from "@spell/core"

/////////////////////////////////////////////////////////////////////////////////////////
// ## A task:  something to do -- in the outline style:  its name, then what's true of it
/////////////////////////////////////////////////////////////////////////////////////////
/** A drawable thing:  each task is its own element on the page, `<task-list-task>`. */
export class Task extends Drawable {
  static elementTag = core.defineElement(this, "test-project")

  // - its "title" is text
  static { this.declareProp("title", { type: "text" }) }
  get title() { return this.getProp("title") }
  set title(value) { this.setProp("title", value) }

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
  draw() {
    return h("ui-form", { value: this },
      h("div", { part: "row" },
        h("ui-icon", { part: "grip", name: "grip vertical", "aria-label": "Drag" }),
        h("ui-checkbox", { name: "done", "aria-label": "Done" }),
        h("ui-input", { part: "title", name: "title", "aria-label": "Task", transparent: true }),
        h("ui-label", { part: "priority", size: "tiny", color: () => this.priorityColor },
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

// on the page, a click selects it;  shift and command (ctrl) select more,
// so the property editor beside the list changes them all at once
// and dragged, by its grip, to another place in its list:  the selected ones go with it

/** Tests */
export function testTasks(...args) {
  return sendCall("test_tasks", args)
}
// -----------
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

///////////////////////////////////////////////////////////////
// ## The checklist:  the tasks, each its own element inside it
///////////////////////////////////////////////////////////////
/** a drawable list:  `<task-list-checklist>`, around its tasks' `<task-list-task>`s */
export class Checklist extends DrawableList {
  static instanceType = Task
  static elementTag = core.defineElement(this, "test-project")

  /** what it shows:  every task, the ones still to do, or the ones done */
  // - its "showing" is one of all, active or done
  static Showings = ["all", "active", "done"]
  static { this.declareProp("showing", { oneOf: Checklist.Showings }) }
  get showing() { return this.getProp("showing") }
  set showing(value) { this.setProp("showing", value) }

  // each task, unless the filter hides it
  drawEachItem(item) {
    if (this.showing === "active" && item.isDone) return undefined
    if (this.showing === "done" && item.isActive) return undefined
    return core.drawThing(item)
  }

  // empty:  says so
  drawItsPlaceholder() {
    return h("div", { part: "placeholder" }, "Nothing to do")
  }

  static reorderItemsAfter = 0

  static exclusive = true
}
// on the page, its tasks can be dragged to another place:  they move as the pointer does, gliding there

/** a task is in one checklist at a time */

/** The app:  its menu, the new task's field, the list, and the property editor */
export class TaskList extends App {
  // - its "tasks" is a new checklist
  static { this.declareProp("tasks", { init: () => new Checklist(), early: true }) }
  get tasks() { return this.getProp("tasks") }
  set tasks(value) { this.setProp("tasks", value) }

  /** what the new task's field holds:  the next task's title */
  // - its "draft" is text
  static { this.declareProp("draft", { type: "text" }) }
  get draft() { return this.getProp("draft") }
  set draft(value) { this.setProp("draft", value) }

  get activeCount() {
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
  draw() {
    return h("ui-container", { class: "TaskList" },
      h("ui-menu",
        h("ui-item", { type: "header" }, "Task List"),
        h("ui-item", () => `${this.activeCount} to do`),
        h("ui-menu", { position: "right" },
          h("ui-item", {
            "aria-label": "All",
            selected: () => this.tasks.showing === "all",
            onClick: () => (this.tasks.showing = "all"),
            style: "cursor:pointer;user-select:none"
          },
            h("ui-icon", { name: "list" }),
            h("ui-popup", { content: "All", inverted: true, size: "small" })
          ),
          h("ui-item", {
            "aria-label": "To do",
            selected: () => this.tasks.showing === "active",
            onClick: () => (this.tasks.showing = "active"),
            style: "cursor:pointer;user-select:none"
          },
            h("ui-icon", { name: "square outline" }),
            h("ui-popup", { content: "To do", inverted: true, size: "small" })
          ),
          h("ui-item", {
            "aria-label": "Done",
            selected: () => this.tasks.showing === "done",
            onClick: () => (this.tasks.showing = "done"),
            style: "cursor:pointer;user-select:none"
          },
            h("ui-icon", { name: "check square outline" }),
            h("ui-popup", { content: "Done", inverted: true, size: "small" })
          ),
          h("ui-item", {
            "aria-label": "Remove done",
            onClick: () => sendCall("remove_the_done_tasks", [], this),
            style: "cursor:pointer;user-select:none"
          },
            h("ui-icon", { name: "trash alternate outline" }),
            h("ui-popup", { content: "Remove the done tasks", inverted: true, size: "small" })
          )
        )
      ),
      h("ui-form", { value: this },
        h("div", { class: "NewTask" },
          h("ui-input", { name: "draft", placeholder: "Something to do", "aria-label": "New task", fluid: true }),
          h("ui-button", {
            primary: true,
            disabled: () => this.draft === "",
            onClick: () => sendCall("add_the_draft", [], this),
            style: "cursor:pointer;user-select:none"
          }, "Add")
        )
      ),
      h("ui-grid", { columns: "2", stackable: true },
        () => core.drawThing(this.tasks),
        h("ui-property-editor", { label: "Selected tasks", schema: "task-list-task", "prop:value": () => this.tasks.selection },
          h("ui-property", { name: "title" }),
          h("ui-property", { name: "priority" }),
          h("ui-property", { name: "done" }),
          h("ui-property", { name: "notes" })
        )
      )
    )
  }
}
export let taskList

//## Start

/** Tests */
export function testTheFilter(...args) {
  return sendCall("test_the_filter", args)
}
// -----------
core.installStyles(undefined, `/* File styles.css:  how the task list looks.¬   - The list and each task are elements of their own, so these rules reach them all:¬     - the list, <task-list-checklist>, and its tasks inside it, each a <task-list-task>¬     - inside a task, by its parts:  its row, ::part(row);  its grip, ::part(grip);  its title, ::part(title);¬       its priority label, ::part(priority)¬     - an empty list's placeholder, which it draws itself, by its part:  ::part(placeholder) */¬¬/****************¬ * The app:  its menu, the new task's field, then the list beside the property editor¬ ****************/¬¬.TaskList {¬  padding-block: 1em;¬}¬¬/* the field and its button on one line */¬.NewTask {¬  display: flex;¬  gap: 0.5em;¬  margin-block: 1em;¬}¬¬.NewTask > ui-input {¬  flex: 1;¬}¬¬/****************¬ * The list:  one task a line¬ ****************/¬¬task-list-checklist {¬  display: flex;¬  flex-direction: column;¬  gap: 0.25em;¬}¬¬task-list-checklist::part(placeholder) {¬  padding: 1em;¬  color: grey;¬  text-align: center;¬}¬¬/****************¬ * A task:  its checkbox, its title, and its priority -- shown only when it isn't normal¬ ****************/¬¬task-list-task {¬  display: block;¬  padding: 0.25em 0.5em;¬  border-radius: 0.3em;¬}¬¬/* its checkbox, its title filling the line, then its priority */¬task-list-task::part(row) {¬  display: flex;¬  align-items: center;¬  gap: 0.5em;¬}¬¬/* its grip:  what a drag starts from */¬task-list-task::part(grip) {¬  flex: none;¬  color: grey;¬}¬¬task-list-task::part(title) {¬  flex: 1;¬}¬¬task-list-task::part(priority) {¬  flex: none;¬}¬¬task-list-task[priority="normal"]::part(priority),¬task-list-task:not([priority])::part(priority) {¬  display: none;¬}¬¬/* selected:  a soft purple band, in place of the outline every selected thing has */¬task-list-task:state(selected) {¬  --spell-selected-outline: none;¬  background: rgb(150 80 255 / 0.12);¬}¬¬/* done:  its title fades */¬task-list-task[done] {¬  opacity: 0.6;¬}¬`)
// -----------

/** Binds each thing the program keeps, from Python's state. */
export function adopt(state) {
  taskList = state["task_list"]
}

