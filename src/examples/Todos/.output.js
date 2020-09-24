//## Todo app example
export class Task extends Thing {}
spellCore.addExport('Task', Task)
spellCore.defineProperty(Task.prototype, { property: 'title', type: 'text' })
spellCore.defineProperty(Task.prototype, { property: 'completed', type: 'choice' })
/* SPELL: added expression `{thing:simple_expression} (operator:is not?|isn't|isnt) complete` */
spellCore.define(Task.prototype, 'is_complete', {
	get() {
		return (this.completed == true)
	}
})
/* SPELL: added expression `{thing:simple_expression} (operator:is not?|isn't|isnt) active` */
spellCore.define(Task.prototype, 'is_active', {
	get() {
		return (this.completed == false)
	}
})

export class Todos_App extends App {}
spellCore.addExport('Todos_App', Todos_App)
spellCore.defineProperty(Todos_App.prototype, {
	property: 'tasks',
	initializer() {
		return new List()
	}
})
/* SPELL: added rule: '(Todos_App|todos_app) (Filters|filters)' */
spellCore.defineProperty(Todos_App.prototype, {
	property: 'filter',
	enumeration: ['all', 'active', 'completed'],
	enumerationProp: 'Filters'
})

export let app = new Todos_App()
app.filter = "all"

/* SPELL: added rule: `create a task (with {props:object_literal_properties})?` */
function create_a_task(props = {}) {
	let { title } = props
	let it = new Task({ title: title, completed: false })
	spellCore.append(app.tasks, it)
}

create_a_task({ title: "Create todos app" })
create_a_task({ title: "Teach it to draw" })
create_a_task({ title: "Test app" })

/* SPELL: added rule: `draw {thisArg:expression}` */
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

/* SPELL: added rule: `draw {thisArg:expression}` */
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