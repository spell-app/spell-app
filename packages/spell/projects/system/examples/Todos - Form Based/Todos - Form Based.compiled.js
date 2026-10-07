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

export class Todos_App extends App {
  static { this.declareProp('tasks', { init: () => new List() }) }
  get tasks() { return this.getProp('tasks') }
  set tasks(value) { this.setProp('tasks', value) }

  get newTaskName() { return this.getProp('newTaskName') }
  set newTaskName(value) { this.setProp('newTaskName', value) }

  static Filters = ['all', 'active', 'completed']
  static { this.declareProp('filter', { oneOf: Todos_App.Filters }) }
  get filter() { return this.getProp('filter') }
  set filter(value) { this.setProp('filter', value) }

  draw() {
    return spellCore.element({ tag: "SUI.Container", children: [
      spellCore.element({ tag: "SUI.Segment", children: [
        spellCore.element({
          tag: "SUI.Menu",
          props: {
            inverted: true,
            color: "violet",
            borderless: true
          },
          children: [
            spellCore.element({ tag: "SUI.Menu.Item", props: { header: true, content: "To Do:" } }),
            spellCore.element({ tag: "SUI.Menu.Menu", props: { position: "right" }, children: [
              spellCore.element({ tag: "SUI.Menu.Item", props: { content: "Show:" } }),
              spellCore.element({
                tag: "SUI.Menu.Item",
                props: {
                  content: "All",
                  onClick: (event) => {
                    app.filter = "all"
                  },
                  active: (app.filter == "all")
                }
              }),
              spellCore.element({
                tag: "SUI.Menu.Item",
                props: {
                  content: "Active",
                  onClick: (event) => {
                    app.filter = "active"
                  },
                  active: (app.filter == "active")
                }
              }),
              spellCore.element({
                tag: "SUI.Menu.Item",
                props: {
                  content: "Completed",
                  onClick: (event) => {
                    app.filter = "completed"
                  },
                  active: (app.filter == "completed")
                }
              })
            ] })
          ]
        }),
        spellCore.element({ tag: "UI.Form", props: { debug: true, value: app }, children: [
          spellCore.element({ tag: "UI.FormRepeat", props: { name: "tasks" }, children: [
            spellCore.element({ tag: "UI.Checkbox", props: { name: "completed", width: 1 } }),
            spellCore.element({ tag: "UI.Input", props: { name: "title", width: 10 } })
          ] }),
          spellCore.element({
            tag: "UI.Input",
            props: {
              name: "newTaskName",
              placeholder: "New task name",
              label: "New task:",
              width: 11
            }
          }),
          spellCore.element({
            tag: "UI.Button",
            props: {
              disabled: (app.newTaskName == ""),
              onClick: (event) => {
                return create_a_new_task()
              },
              content: "Add Task"
            }
          })
        ] }),
        spellCore.element({ tag: "br" }),
        spellCore.element({ tag: "br" }),
        spellCore.element({ tag: "SUI.Menu", props: { inverted: true, color: "grey" }, children: [
          spellCore.element({ tag: "SUI.Menu.Item", props: { header: true, content: "Test:" } }),
          spellCore.element({
            tag: "SUI.Menu.Item",
            props: {
              onClick: (event) => {
                return create_a_new_task({ title: "Moar" })
              },
              content: "Add Item"
            }
          }),
          spellCore.element({
            tag: "SUI.Menu.Item",
            props: {
              onClick: (event) => {
                return spellCore.removeItemOf(app.tasks, 1)
              },
              content: "Remove Item"
            }
          }),
          spellCore.element({
            tag: "SUI.Menu.Item",
            props: {
              onClick: (event) => {
                spellCore.getItemOf(app.tasks, 1).title = "New title"
              },
              content: "Change name"
            }
          }),
          spellCore.element({
            tag: "SUI.Menu.Item",
            props: {
              onClick: (event) => {
                return spellCore.removeWhere(app.tasks, (item) => {
                  return item.is_complete
                })
              },
              content: "Remove Completed"
            }
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