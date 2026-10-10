import { spellCore, Thing, List, App, h } from "@spell/core"

spellCore.heading("Todo app example")
/** Todo app example */
export class Task extends Thing {
  static { this.declareProp('title', { type: 'text' }) }
  get title() { return this.getProp('title') }
  set title(value) { this.setProp('title', value) }

  static { this.declareProp('completed', { type: 'choice' }) }
  get completed() { return this.getProp('completed') }
  set completed(value) { this.setProp('completed', value) }

  get isComplete() {
    return (this.completed)
  }

  get isActive() {
    return (!this.completed)
  }
}

export class Todos_App extends App {
  static { this.declareProp('tasks', { init: () => new List({ instanceType: "Task" }) }) }
  get tasks() { return this.getProp('tasks') }
  set tasks(value) { this.setProp('tasks', value) }

  static { this.declareProp('newTaskName', { type: 'text' }) }
  get newTaskName() { return this.getProp('newTaskName') }
  set newTaskName(value) { this.setProp('newTaskName', value) }

  static Filters = ['all', 'active', 'completed']
  static { this.declareProp('filter', { oneOf: Todos_App.Filters }) }
  get filter() { return this.getProp('filter') }
  set filter(value) { this.setProp('filter', value) }

  get shownTasks() {
    if (this.filter == "active") { return spellCore.filter(this.tasks, (task) => {
      return task.isActive
    }) }
    if (this.filter == "completed") { return spellCore.filter(this.tasks, (task) => {
      return task.isComplete
    }) }
    return this.tasks
  }

  draw() {
    return h("ui-container",
      h("ui-segment",
        h("ui-menu", { inverted: true, color: "violet", borderless: true },
          h("ui-item", { type: "header" }, "To Do:"),
          h("ui-menu", { position: "right" },
            h("ui-item", "Show:"),
            h("ui-item", {
              onClick: (event) => {
                app.filter = "all"
              },
              "prop:selected": () => (app.filter == "all")
            }, "All"),
            h("ui-item", {
              onClick: (event) => {
                app.filter = "active"
              },
              "prop:selected": () => (app.filter == "active")
            }, "Active"),
            h("ui-item", {
              onClick: (event) => {
                app.filter = "completed"
              },
              "prop:selected": () => (app.filter == "completed")
            }, "Completed")
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
              h("ui-button", {
                "prop:disabled": () => (app.newTaskName === ""),
                onClick: (event) => {
                  return createANewTask()
                }
              }, "Add Task")
            )
          )
        ),
        h("br"),
        h("br"),
        h("ui-menu", { inverted: true, color: "grey" },
          h("ui-item", { type: "header" }, "Test:"),
          h("ui-item", {
            onClick: (event) => {
              return createANewTask({ title: "Moar" })
            }
          }, "Add Item"),
          h("ui-item", {
            onClick: (event) => {
              return spellCore.removeItemAt(app.tasks, 1)
            }
          }, "Remove Item"),
          h("ui-item", {
            onClick: (event) => {
              spellCore.getItemAt(app.tasks, 1).title = "New title"
            }
          }, "Change name"),
          h("ui-item", {
            onClick: (event) => {
              return spellCore.removeWhere(app.tasks, (item) => {
                return item.isComplete
              })
            }
          }, "Remove Completed")
        )
      )
    )
  }
}

export let app = new Todos_App()
app.filter = "all"
app.newTaskName = ""

export function createANewTask(props = {}) {
  let { title, completed } = props
  if (title === undefined) {
    if (app.newTaskName === "") { return }
    title = app.newTaskName
    app.newTaskName = ""
  }
  let it = new Task({ title: title, completed: (completed || false) })
  spellCore.append(app.tasks, it)
}

createANewTask({ title: "Create todos app", completed: true })
createANewTask({ title: "Teach it to draw" })
createANewTask({ title: "Test app" })

app.start()
spellCore.console.log(app)