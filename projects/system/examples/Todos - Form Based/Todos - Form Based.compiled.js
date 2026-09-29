/*! SPELL: PROJECT { spellVersion: "0.8.0", provides: ["Task", "Todos_App", "create_a_task"] } */
import { spellCore, Thing, List, App } from "@spell/core"

/*! SPELL: DECLARES {
  type: "Task", superType: "Thing",
  defined: "/todo.spell:20-37",
} */
/** Todo app example */
export class Task extends Thing {}
/*! SPELL: DECLARES {
  property: "title", of: "Task", datatype: "text",
  defined: "/todo.spell:38-64",
} */
spellCore.defineProperty(Task.prototype, { property: 'title', type: 'text' })
/*! SPELL: DECLARES {
  property: "completed", of: "Task", datatype: "choice",
  defined: "/todo.spell:65-109",
} */
spellCore.defineProperty(Task.prototype, { property: 'completed', type: 'choice' })
/*! SPELL: DECLARES {
  syntax: "{operator:is} complete", output: "is_complete", rule: "method_postfix", of: "Task",
  kind: "method", name: '"is complete"',
  defined: "/todo.spell:110-154",
} */
spellCore.define(Task.prototype, 'is_complete', {
	get() {
		return (this.completed == true)
	}
})
/*! SPELL: DECLARES {
  syntax: "{operator:is} active", output: "is_active", rule: "method_postfix", of: "Task",
  kind: "method", name: '"is active"',
  defined: "/todo.spell:155-196",
} */
spellCore.define(Task.prototype, 'is_active', {
	get() {
		return (this.completed == false)
	}
})

/*! SPELL: DECLARES {
  type: "Todos_App", superType: "App",
  defined: "/todo.spell:198-219",
} */
export class Todos_App extends App {}
/*! SPELL: DECLARES {
  property: "tasks", of: "Todos_App",
  defined: "/todo.spell:220-266",
} */
spellCore.defineProperty(Todos_App.prototype, {
	property: 'tasks',
	initializer() {
		return new List()
	}
})
/*! SPELL: DECLARES {
  property: "newTaskName", of: "Todos_App",
  defined: "/todo.spell:267-305",
} */
spellCore.defineProperty(Todos_App.prototype, { property: 'newTaskName' })
/*! SPELL: DECLARES {
  property: "filter", classVariable: "Filters", rule: "enumeration", of: "Todos_App",
  enumeration: ["'all'", "'active'", "'completed'"],
  defined: "/todo.spell:306-365",
} */
spellCore.defineProperty(Todos_App.prototype, {
	property: 'filter',
	enumeration: ['all', 'active', 'completed'],
	enumerationProp: 'Filters'
})

export let app = new Todos_App()
app.filter = "all"
app.newTaskName = ""

/*! SPELL: DECLARES {
  syntax: "create a task (with {props:object_literal_properties})?", output: "create_a_task",
  rule: "method_call", alias: ["statement", "expression"], kind: "function",
  name: "create a task (with title as text, completed as a choice)",
  defined: "/todo.spell:467-788",
} */
export function create_a_task(props = {}) {
	let { title, completed } = props
	if (!spellCore.isDefined(title)) {
		if (app.newTaskName == "") { return }
		title = app.newTaskName
		app.newTaskName = ""
	}
	let it = new Task({ title: title, completed: (completed || false) })
	spellCore.append(app.tasks, it)
}

create_a_task({ title: "Create todos app", completed: true })
create_a_task({ title: "Teach it to draw" })
create_a_task({ title: "Test app" })

/*! SPELL: DECLARES {
  syntax: "draw {thisArg:expression}", output: "draw", rule: "method_call", of: "Todos_App",
  alias: ["statement", "expression"], kind: "method", name: "draw (a todos-app)",
  defined: "/todo.spell:938-2595",
} */
spellCore.define(Todos_App.prototype, 'draw', {
	value() {
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
								return create_a_task()
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
								return create_a_task({ title: "Moar" })
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
})

app.start()
spellCore.console.log(app)