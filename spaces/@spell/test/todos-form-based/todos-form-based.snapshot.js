import { core, Thing, List, App, Drawable, DrawableList, h } from "@spell/core"

core.heading("Todo app example")
/** Todo app example */
export class Task extends Thing {
  // a task has a title as text
  static { this.declareProp("title", { type: "text" }) }
  get title() { return this.getProp("title") }
  set title(value) { this.setProp("title", value) }

  // a task has a property completed as yes or no
  static { this.declareProp("completed", { type: "choice" }) }
  get completed() { return this.getProp("completed") }
  set completed(value) { this.setProp("completed", value) }

  get isComplete() {
    return this.completed
  }

  get isActive() {
    return !this.completed
  }
}

export class TodosApp extends App {
  // a todos-app has a property tasks as a new list of tasks
  static { this.declareProp("tasks", { itemType: "Task", init: () => new List({ instanceType: "Task" }) }) }
  get tasks() { return this.getProp("tasks") }
  set tasks(value) { this.setProp("tasks", value) }

  // a todos-app has a property newTaskName as text
  static { this.declareProp("newTaskName", { type: "text" }) }
  get newTaskName() { return this.getProp("newTaskName") }
  set newTaskName(value) { this.setProp("newTaskName", value) }

  // a todos-app has a filter as one of all, active or completed
  static Filters = ["all", "active", "completed"]
  static { this.declareProp("filter", { oneOf: TodosApp.Filters }) }
  get filter() { return this.getProp("filter") }
  set filter(value) { this.setProp("filter", value) }

  get shownTasks() {
    if (this.filter == "active") return core.filter(this.tasks, (task) => task.isActive)
    if (this.filter == "completed") return core.filter(this.tasks, (task) => task.isComplete)
    return this.tasks
  }

  draw() {
    return h("ui-container",
      h("ui-segment",
        h("ui-menu", { inverted: true, color: "violet", borderless: true },
          h("ui-item", { type: "header" }, "To Do:"),
          h("ui-menu", { position: "right" },
            h("ui-item", "Show:"),
            h("ui-item", { onClick: () => (app.filter = "all"), selected: () => app.filter == "all" }, "All"),
            h("ui-item", { onClick: () => (app.filter = "active"), selected: () => app.filter == "active" },
              "Active"
            ),
            h("ui-item", { onClick: () => (app.filter = "completed"), selected: () => app.filter == "completed" },
              "Completed"
            )
          )
        ),
        h("ui-form", { debug: true, "prop:value": () => app },
          h("ui-repeat", { "prop:items": () => app.shownTasks },
            h("ui-fields",
              h("ui-field", { width: "1" }, h("ui-checkbox", { name: "completed", "aria-label": "Done" })),
              h("ui-field", { width: "10" }, h("ui-input", { name: "title", "aria-label": "Task" }))
            )
          ),
          h("ui-fields",
            h("ui-field", { width: "11" },
              h("ui-input", { name: "newTaskName", placeholder: "New task name", label: "New task:" })
            ),
            h("ui-field",
              h("ui-button", { disabled: () => app.newTaskName === "", onClick: () => createANewTask() },
                "Add Task"
              )
            )
          )
        ),
        h("br"),
        h("br"),
        h("ui-menu", { inverted: true, color: "grey" },
          h("ui-item", { type: "header" }, "Test:"),
          h("ui-item", { onClick: () => createANewTask({ title: "Moar" }) }, "Add Item"),
          h("ui-item", { onClick: () => core.removeItemAt(app.tasks, 0) }, "Remove Item"),
          h("ui-item", { onClick: () => (core.getItemAt(app.tasks, 0).title = "New title") }, "Change name"),
          h("ui-item", { onClick: () => core.removeWhere(app.tasks, (item) => item.isComplete) },
            "Remove Completed"
          )
        )
      )
    )
  }
}

export const app = new TodosApp()
app.filter = "all"
app.newTaskName = ""

export function createANewTask(props = {}) {
  let { title, completed } = props
  if (title === undefined) {
    if (app.newTaskName === "") return
    title = app.newTaskName
    app.newTaskName = ""
  }
  const it = new Task({ title: title, completed: completed || false })
  core.append(app.tasks, it)
}

createANewTask({ title: "Create todos app", completed: true })
createANewTask({ title: "Teach it to draw" })
createANewTask({ title: "Test app" })

if (!core.isCarryingOver) app.start()
core.console.log(app)
