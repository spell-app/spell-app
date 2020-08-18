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
spellCore.defineProperty(Todos_App.prototype, { property: 'newTaskName' })
/* SPELL: added rule: '(Todos_App|todos_app) (Filters|filters)' */
spellCore.defineProperty(Todos_App.prototype, {
	property: 'filter',
	enumeration: ['all', 'active', 'completed'],
	enumerationProp: 'Filters'
})

export let app = new Todos_App()
app.filter = "all"
app.newTaskName = ""

/* SPELL: added rule: `create a task (with {props:object_literal_properties})?` */
function create_a_task(props = {}) {
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

/* SPELL: added rule: `draw {thisArg:expression}` */
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