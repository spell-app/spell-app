/*! SPELL: PROJECT { spellVersion: "0.8.0", provides: ["Task", "Todos_App", "create_a_task"] } */
import { spellCore, Thing, List, App } from "@spell/core"

/*! SPELL: DECLARES {
  type: "Task", superType: "Thing",
  line: 2, defined: "/Todo.spell:20-37",
} */
/** Todo app example */
export class Task extends Thing {}
/*! SPELL: DECLARES {
  property: "title", of: "Task", datatype: "text",
  line: 3, defined: "/Todo.spell:38-64",
} */
spellCore.defineProperty(Task.prototype, { property: 'title', type: 'text' })
/*! SPELL: DECLARES {
  property: "completed", of: "Task", datatype: "choice",
  line: 4, defined: "/Todo.spell:65-109",
} */
spellCore.defineProperty(Task.prototype, { property: 'completed', type: 'choice' })
/*! SPELL: DECLARES {
  syntax: "{operator:is} complete", output: "is_complete", rule: "method_postfix", of: "Task",
  kind: "method", name: '"is complete"',
  line: 5, defined: "/Todo.spell:110-154",
} */
spellCore.define(Task.prototype, 'is_complete', {
	get() {
		return (this.completed == true)
	}
})
/*! SPELL: DECLARES {
  syntax: "{operator:is} active", output: "is_active", rule: "method_postfix", of: "Task",
  kind: "method", name: '"is active"',
  line: 6, defined: "/Todo.spell:155-196",
} */
spellCore.define(Task.prototype, 'is_active', {
	get() {
		return (this.completed == false)
	}
})

/*! SPELL: DECLARES {
  type: "Todos_App", superType: "App",
  line: 8, defined: "/Todo.spell:198-219",
} */
export class Todos_App extends App {}
/*! SPELL: DECLARES {
  property: "tasks", of: "Todos_App",
  line: 9, defined: "/Todo.spell:220-266",
} */
spellCore.defineProperty(Todos_App.prototype, {
	property: 'tasks',
	initializer() {
		return new List()
	}
})
/*! SPELL: DECLARES {
  property: "filter", classVariable: "Filters", rule: "enumeration", of: "Todos_App",
  enumeration: ["'all'", "'active'", "'completed'"],
  line: 10, defined: "/Todo.spell:267-326",
} */
spellCore.defineProperty(Todos_App.prototype, {
	property: 'filter',
	enumeration: ['all', 'active', 'completed'],
	enumerationProp: 'Filters'
})

export let app = new Todos_App()
app.filter = "all"

/*! SPELL: DECLARES {
  syntax: "create a task (with {props:object_literal_properties})?", output: "create_a_task",
  rule: "method_call", alias: ["statement", "expression"], kind: "function",
  name: "create a task (with title as text)",
  line: [15, 17], defined: "/Todo.spell:391-518",
} */
export function create_a_task(props = {}) {
	let { title } = props
	let it = new Task({ title: title, completed: false })
	spellCore.append(app.tasks, it)
}

create_a_task({ title: "Create todos app" })
create_a_task({ title: "Teach it to draw" })
create_a_task({ title: "Test app" })

/*! SPELL: DECLARES {
  syntax: "draw {thisArg:expression}", output: "draw", rule: "method_call", of: "Task",
  alias: ["statement", "expression"], kind: "method", name: "draw (a task)",
  line: [23, 35], defined: "/Todo.spell:651-1104",
} */
spellCore.define(Task.prototype, 'draw', {
	value() {
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
})

/*! SPELL: DECLARES {
  syntax: "draw {thisArg:expression}", output: "draw", rule: "method_call", of: "Todos_App",
  alias: ["statement", "expression"], kind: "method", name: "draw (a todos-app)",
  line: [37, 62], defined: "/Todo.spell:1106-2064",
} */
spellCore.define(Todos_App.prototype, 'draw', {
	value() {
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
							return create_a_task({ title: event.target.value })
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
							return create_a_task({ title: "Moar" })
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
})

app.start()
spellCore.console.log(app)