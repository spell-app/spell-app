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
}
export class Task_List extends List {
  static instanceType = Task
}

export class Todos_App extends App {
  static { this.declareProp('tasks', { init: () => new Task_List() }) }
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
      return task.is_active
    }) }
    if (this.filter == "completed") { return spellCore.filter(this.tasks, (task) => {
      return task.is_complete
    }) }
    return this.tasks
  }

  draw() {
    return spellCore.element({ tag: "ui-container", children: [
      spellCore.element({ tag: "ui-segment", children: [
        spellCore.element({
          tag: "ui-menu",
          props: {
            inverted: true,
            color: "violet",
            borderless: true
          },
          children: [
            spellCore.element({ tag: "ui-item", props: { type: "header" }, children: [
              "To Do:"
            ] }),
            spellCore.element({ tag: "ui-menu", props: { position: "right" }, children: [
              spellCore.element({ tag: "ui-item", children: [
                "Show:"
              ] }),
              spellCore.element({
                tag: "ui-item",
                props: {
                  onClick: (event) => {
                    app.filter = "all"
                  },
                  selected: () => (app.filter == "all")
                },
                children: [
                  "All"
                ]
              }),
              spellCore.element({
                tag: "ui-item",
                props: {
                  onClick: (event) => {
                    app.filter = "active"
                  },
                  selected: () => (app.filter == "active")
                },
                children: [
                  "Active"
                ]
              }),
              spellCore.element({
                tag: "ui-item",
                props: {
                  onClick: (event) => {
                    app.filter = "completed"
                  },
                  selected: () => (app.filter == "completed")
                },
                children: [
                  "Completed"
                ]
              })
            ] })
          ]
        }),
        spellCore.element({ tag: "ui-form", props: { debug: true, value: () => app }, children: [
          spellCore.element({ tag: "ui-repeat", props: { items: () => app.shownTasks }, children: [
            spellCore.element({ tag: "ui-fields", children: [
              spellCore.element({ tag: "ui-field", props: { width: "1" }, children: [
                spellCore.element({ tag: "ui-checkbox", props: { name: "completed", 'aria-label': "Done" } })
              ] }),
              spellCore.element({ tag: "ui-field", props: { width: "10" }, children: [
                spellCore.element({ tag: "ui-input", props: { name: "title", 'aria-label': "Task" } })
              ] })
            ] })
          ] }),
          spellCore.element({ tag: "ui-fields", children: [
            spellCore.element({ tag: "ui-field", props: { width: "11" }, children: [
              spellCore.element({
                tag: "ui-input",
                props: {
                  name: "newTaskName",
                  placeholder: "New task name",
                  label: "New task:"
                }
              })
            ] }),
            spellCore.element({ tag: "ui-field", children: [
              spellCore.element({
                tag: "ui-button",
                props: {
                  disabled: () => (app.newTaskName == ""),
                  onClick: (event) => {
                    return create_a_new_task()
                  }
                },
                children: [
                  "Add Task"
                ]
              })
            ] })
          ] })
        ] }),
        spellCore.element({ tag: "br" }),
        spellCore.element({ tag: "br" }),
        spellCore.element({ tag: "ui-menu", props: { inverted: true, color: "grey" }, children: [
          spellCore.element({ tag: "ui-item", props: { type: "header" }, children: [
            "Test:"
          ] }),
          spellCore.element({
            tag: "ui-item",
            props: {
              onClick: (event) => {
                return create_a_new_task({ title: "Moar" })
              }
            },
            children: [
              "Add Item"
            ]
          }),
          spellCore.element({
            tag: "ui-item",
            props: {
              onClick: (event) => {
                return spellCore.removeItemAt(app.tasks, 1)
              }
            },
            children: [
              "Remove Item"
            ]
          }),
          spellCore.element({
            tag: "ui-item",
            props: {
              onClick: (event) => {
                spellCore.getItemAt(app.tasks, 1).title = "New title"
              }
            },
            children: [
              "Change name"
            ]
          }),
          spellCore.element({
            tag: "ui-item",
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
    ] })
  }
}

export let app = new Todos_App()
app.filter = "all"
app.newTaskName = ""

export function create_a_new_task(props = {}) {
  let { title, completed } = props
  if (!spellCore.isDefined(title)) {
    if (app.newTaskName == "") { return }
    title = app.newTaskName
    app.newTaskName = ""
  }
  let it = new Task({ title: title, completed: (completed || false) })
  spellCore.append(app.tasks, it)
}

create_a_new_task({ title: "Create todos app", completed: true })
create_a_new_task({ title: "Teach it to draw" })
create_a_new_task({ title: "Test app" })

app.start()
spellCore.console.log(app)