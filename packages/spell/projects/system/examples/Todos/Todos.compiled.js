import { spellCore, Thing, List, App } from "@spell/core"

spellCore.heading("Todo app example")
/** Todo app example */
export class Task extends Thing {
  static { this.declareProp('title', { type: 'text' }) }
  get title() { return this.getProp('title') }
  set title(value) { this.setProp('title', value) }

  static { this.declareProp('completed', { type: 'choice' }) }
  get completed() { return this.getProp('completed') }
  set completed(value) { this.setProp('completed', value) }

  get is_complete() {
    return (this.completed == true)
  }

  get is_active() {
    return (this.completed == false)
  }

  draw() {
    if (this.is_complete && (app.filter == "active")) { return false }
    if (this.is_active && (app.filter == "completed")) { return false }
    return spellCore.element({ tag: "tr", children: [
      spellCore.element({ tag: "td", props: { width: "8%" }, children: [
        spellCore.element({
          tag: "input",
          props: {
            type: "checkbox",
            checked: () => this.is_complete,
            onChange: (event) => {
              this.completed = (this.is_active ? true : false)
            }
          }
        })
      ] }),
      spellCore.element({ tag: "td", props: { width: "82%" }, children: [
        () => this.title
      ] }),
      spellCore.element({ tag: "td", props: { width: "10%" }, children: [
        spellCore.element({
          tag: "button",
          props: {
            onClick: (event) => {
              return spellCore.remove(app.tasks, this)
            }
          },
          children: [
            "x"
          ]
        })
      ] })
    ] })
  }
}
export class Task_List extends List {
  static instanceType = Task
}

export class Todos_App extends App {
  static { this.declareProp('tasks', { init: () => new Task_List() }) }
  get tasks() { return this.getProp('tasks') }
  set tasks(value) { this.setProp('tasks', value) }

  static Filters = ['all', 'active', 'completed']
  static { this.declareProp('filter', { oneOf: Todos_App.Filters }) }
  get filter() { return this.getProp('filter') }
  set filter(value) { this.setProp('filter', value) }

  draw() {
    return spellCore.element({ tag: "div", children: [
      spellCore.element({ tag: "h2", children: [
        "To Do:"
      ] }),
      spellCore.element({ tag: "div", children: [
        spellCore.element({
          tag: "input",
          props: {
            type: "text",
            onBlur: (event) => {
              return create_a_new_task({ title: event.target.value })
            }
          }
        })
      ] }),
      spellCore.element({ tag: "br" }),
      spellCore.element({ tag: "table", props: { style: "width: 50%" }, children: [
        spellCore.element({ tag: "tbody", children: [
          () => spellCore.drawItems(app.tasks)
        ] })
      ] }),
      spellCore.element({ tag: "br" }),
      spellCore.element({ tag: "div", children: [
        "Show:",
        spellCore.element({
          tag: "button",
          props: {
            onClick: (event) => {
              app.filter = 'all'
            }
          },
          children: [
            "All"
          ]
        }),
        spellCore.element({
          tag: "button",
          props: {
            onClick: (event) => {
              app.filter = "active"
            }
          },
          children: [
            "Active"
          ]
        }),
        spellCore.element({
          tag: "button",
          props: {
            onClick: (event) => {
              app.filter = "completed"
            }
          },
          children: [
            "Completed"
          ]
        })
      ] }),
      spellCore.element({ tag: "br" }),
      spellCore.element({ tag: "div", children: [
        spellCore.element({
          tag: "button",
          props: {
            onClick: (event) => {
              return create_a_new_task({ title: "Moar" })
            }
          },
          children: [
            "+ Add"
          ]
        }),
        spellCore.element({
          tag: "button",
          props: {
            onClick: (event) => {
              return spellCore.removeItemOf(app.tasks, 1)
            }
          },
          children: [
            "- Remove"
          ]
        }),
        spellCore.element({
          tag: "button",
          props: {
            onClick: (event) => {
              spellCore.getItemOf(app.tasks, 1).title = "New title"
            }
          },
          children: [
            "Change name"
          ]
        }),
        spellCore.element({
          tag: "button",
          props: {
            onClick: (event) => {
              return spellCore.removeWhere(app.tasks, (item) => {
                return item.is_complete
              })
            }
          },
          children: [
            "Remove Completed"
          ]
        })
      ] })
    ] })
  }
}

export let app = new Todos_App()
app.filter = "all"

export function create_a_new_task(props = {}) {
  let { title } = props
  let it = new Task({ title: title, completed: false })
  spellCore.append(app.tasks, it)
}

create_a_new_task({ title: "Create todos app" })
create_a_new_task({ title: "Teach it to draw" })
create_a_new_task({ title: "Test app" })

app.start()
spellCore.console.log(app)