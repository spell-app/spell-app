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

  draw() {
    if (this.isComplete && (app.filter == "active")) { return false }
    if (this.isActive && (app.filter == "completed")) { return false }
    return h("tr",
      h("td", { width: "8%" },
        h("input", {
          type: "checkbox",
          checked: () => this.isComplete,
          onChange: (event) => {
            this.completed = (this.isActive ? true : false)
          }
        })
      ),
      h("td", { width: "82%" }, () => this.title),
      h("td", { width: "10%" },
        h("button", {
          onClick: (event) => {
            return spellCore.remove(app.tasks, this)
          }
        }, "x")
      )
    )
  }
}

export class Todos_App extends App {
  static { this.declareProp('tasks', { init: () => new List({ instanceType: "Task" }) }) }
  get tasks() { return this.getProp('tasks') }
  set tasks(value) { this.setProp('tasks', value) }

  static Filters = ['all', 'active', 'completed']
  static { this.declareProp('filter', { oneOf: Todos_App.Filters }) }
  get filter() { return this.getProp('filter') }
  set filter(value) { this.setProp('filter', value) }

  draw() {
    return h("div",
      h("h2", "To Do:"),
      h("div",
        h("input", {
          type: "text",
          onBlur: (event) => {
            return createANewTask({ title: event.target.value })
          }
        })
      ),
      h("br"),
      h("table", { style: "width: 50%" }, h("tbody", () => spellCore.drawItems(app.tasks))),
      h("br"),
      h("div",
        "Show:",
        h("button", {
          onClick: (event) => {
            app.filter = 'all'
          }
        }, "All"),
        h("button", {
          onClick: (event) => {
            app.filter = "active"
          }
        }, "Active"),
        h("button", {
          onClick: (event) => {
            app.filter = "completed"
          }
        }, "Completed")
      ),
      h("br"),
      h("div",
        h("button", {
          onClick: (event) => {
            return createANewTask({ title: "Moar" })
          }
        }, "+ Add"),
        h("button", {
          onClick: (event) => {
            return spellCore.removeItemAt(app.tasks, 1)
          }
        }, "- Remove"),
        h("button", {
          onClick: (event) => {
            spellCore.getItemAt(app.tasks, 1).title = "New title"
          }
        }, "Change name"),
        h("button", {
          onClick: (event) => {
            return spellCore.removeWhere(app.tasks, (item) => {
              return item.isComplete
            })
          }
        }, "Remove Completed")
      )
    )
  }
}

export let app = new Todos_App()
app.filter = "all"

export function createANewTask(props = {}) {
  let { title } = props
  let it = new Task({ title: title, completed: false })
  spellCore.append(app.tasks, it)
}

createANewTask({ title: "Create todos app" })
createANewTask({ title: "Teach it to draw" })
createANewTask({ title: "Test app" })

app.start()
spellCore.console.log(app)