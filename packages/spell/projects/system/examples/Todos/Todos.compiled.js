/*! SPELL: PROJECT { spellVersion: "0.8.0", provides: ["Task", "Todos_App", "create_a_new_task"] } */
import { spellCore, Thing, List, App } from "@spell/core"

spellCore.heading("Todo app example")
/** Todo app example */
/*! SPELL: DECLARES {
  type: "Task", superType: "Thing",
  defined: "/Todo.spell:20-37",
} */
export class Task extends Thing {
  /*! SPELL: DECLARES {
    property: "title", of: "Task", datatype: "text",
    defined: "/Todo.spell:38-64",
  } */
  static { this.declareProp('title', { type: 'text' }) }
  get title() { return this.getProp('title') }
  set title(value) { this.setProp('title', value) }

  /*! SPELL: DECLARES {
    property: "completed", of: "Task", datatype: "choice",
    defined: "/Todo.spell:65-109",
  } */
  static { this.declareProp('completed', { type: 'choice' }) }
  get completed() { return this.getProp('completed') }
  set completed(value) { this.setProp('completed', value) }

  /*! SPELL: DECLARES {
    syntax: "{operator:is} complete", output: "is_complete", rule: "method_postfix", of: "Task",
    kind: "method", name: '"is complete"', returns: "choice",
    defined: "/Todo.spell:110-154",
  } */
  get is_complete() {
    return (this.completed == true)
  }

  /*! SPELL: DECLARES {
    syntax: "{operator:is} active", output: "is_active", rule: "method_postfix", of: "Task",
    kind: "method", name: '"is active"', returns: "choice",
    defined: "/Todo.spell:155-196",
  } */
  get is_active() {
    return (this.completed == false)
  }

  /*! SPELL: DECLARES {
    syntax: "draw {thisArg:expression}", output: "draw", rule: "method_call", of: "Task",
    alias: ["statement", "expression"], kind: "method", name: "draw (a task)",
    defined: "/Todo.spell:667-1120",
  } */
  draw() {
    if (this.is_complete && (app.filter == "active")) { return false }
    if (this.is_active && (app.filter == "completed")) { return false }
    return spellCore.element({ tag: "tr", children: [
      spellCore.element({ tag: "td", props: { width: "8%" }, children: [
        spellCore.element({
          tag: "input",
          props: {
            type: "checkbox",
            checked: this.is_complete,
            onChange: (event) => {
              this.completed = (this.is_active ? true : false)
            }
          }
        })
      ] }),
      spellCore.element({ tag: "td", props: { width: "82%" }, children: [
        this.title
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

/*! SPELL: DECLARES {
  type: "Todos_App", superType: "App",
  defined: "/Todo.spell:198-219",
} */
export class Todos_App extends App {
  /*! SPELL: DECLARES {
    property: "tasks", of: "Todos_App", datatype: "list",
    defined: "/Todo.spell:220-266",
  } */
  static { this.declareProp('tasks', { init: () => new List() }) }
  get tasks() { return this.getProp('tasks') }
  set tasks(value) { this.setProp('tasks', value) }

  /*! SPELL: DECLARES {
    property: "filter", classVariable: "Filters", rule: "enumeration", of: "Todos_App",
    enumeration: ["'all'", "'active'", "'completed'"],
    defined: "/Todo.spell:267-326",
  } */
  static Filters = ['all', 'active', 'completed']
  static { this.declareProp('filter', { oneOf: Todos_App.Filters }) }
  get filter() { return this.getProp('filter') }
  set filter(value) { this.setProp('filter', value) }

  /*! SPELL: DECLARES {
    syntax: "draw {thisArg:expression}", output: "draw", rule: "method_call", of: "Todos_App",
    alias: ["statement", "expression"], kind: "method", name: "draw (a todos-app)",
    defined: "/Todo.spell:1122-2088",
  } */
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
      spellCore.element({ tag: "table", props: { width: "50%" }, children: [
        spellCore.element({ tag: "tbody", children: [
          spellCore.drawItems(app.tasks)
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

/*! SPELL: DECLARES {
  syntax: "create a new task (with {props:object_literal_properties})?",
  output: "create_a_new_task", rule: "method_call", alias: ["statement", "expression"],
  kind: "function", name: "create a new task (with title as text)", params: [{ name: "props" }],
  defined: "/Todo.spell:391-522",
} */
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