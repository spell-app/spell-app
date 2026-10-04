/*! SPELL: PROJECT { spellVersion: "0.8.0", provides: ["Task", "Todos_App", "create_a_new_task"] } */
import { spellCore, Thing, List, App } from "@spell/core"

spellCore.heading("Todo app example")
/** Todo app example */
/*! SPELL: DECLARES {
  type: "Task", superType: "Thing",
  defined: "/todo.spell:20-37",
} */
export class Task extends Thing {
  /*! SPELL: DECLARES {
    property: "title", of: "Task", datatype: "text",
    defined: "/todo.spell:38-64",
  } */
  static { this.declareProp('title', { type: 'text' }) }
  get title() { return this.getProp('title') }
  set title(value) { this.setProp('title', value) }

  /*! SPELL: DECLARES {
    property: "completed", of: "Task", datatype: "choice",
    defined: "/todo.spell:65-109",
  } */
  static { this.declareProp('completed', { type: 'choice' }) }
  get completed() { return this.getProp('completed') }
  set completed(value) { this.setProp('completed', value) }

  /*! SPELL: DECLARES {
    syntax: "{operator:is} complete", output: "is_complete", rule: "method_postfix", of: "Task",
    kind: "method", name: '"is complete"', returns: "choice",
    defined: "/todo.spell:110-154",
  } */
  get is_complete() {
    return (this.completed == true)
  }

  /*! SPELL: DECLARES {
    syntax: "{operator:is} active", output: "is_active", rule: "method_postfix", of: "Task",
    kind: "method", name: '"is active"', returns: "choice",
    defined: "/todo.spell:155-196",
  } */
  get is_active() {
    return (this.completed == false)
  }
}

/*! SPELL: DECLARES {
  type: "Todos_App", superType: "App",
  defined: "/todo.spell:198-219",
} */
export class Todos_App extends App {
  /*! SPELL: DECLARES {
    property: "tasks", of: "Todos_App", datatype: "list",
    defined: "/todo.spell:220-266",
  } */
  static { this.declareProp('tasks', { init: () => new List() }) }
  get tasks() { return this.getProp('tasks') }
  set tasks(value) { this.setProp('tasks', value) }

  /*! SPELL: DECLARES {
    property: "newTaskName", of: "Todos_App",
    defined: "/todo.spell:267-305",
  } */
  get newTaskName() { return this.getProp('newTaskName') }
  set newTaskName(value) { this.setProp('newTaskName', value) }

  /*! SPELL: DECLARES {
    property: "filter", classVariable: "Filters", of: "Todos_App",
    enumeration: ["'all'", "'active'", "'completed'"],
    defined: "/todo.spell:306-365",
  } */
  static Filters = ['all', 'active', 'completed']
  static { this.declareProp('filter', { oneOf: Todos_App.Filters }) }
  get filter() { return this.getProp('filter') }
  set filter(value) { this.setProp('filter', value) }

  /*! SPELL: DECLARES {
    syntax: "draw {thisArg:expression}", output: "draw", rule: "method_call", of: "Todos_App",
    alias: ["statement", "expression"], kind: "method", name: "draw (a todos-app)",
    defined: "/todo.spell:954-2619",
  } */
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

/*! SPELL: DECLARES {
  syntax: "create a new task (with {props:object_literal_properties})?",
  output: "create_a_new_task", rule: "method_call", alias: ["statement", "expression"],
  kind: "function", name: "create a new task (with title as text, completed as a choice)",
  params: [{ name: "props" }], returns: "nothing",
  defined: "/todo.spell:467-792",
} */
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