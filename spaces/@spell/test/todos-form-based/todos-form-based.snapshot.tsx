import { core, Thing, List, App, prop, derived, drawn } from "@spell/core"
import { E, SpellElement } from "@spell/elements"

core.heading("Todo app example")
/** Todo app example */
export class Task extends Thing {
  // a task has a title as text
  @prop({ type: "text" })
  accessor title!: string

  // a task has a property completed as yes or no
  @prop({ type: "choice" })
  accessor completed!: boolean

  get isComplete() {
    return this.completed
  }

  get isActive() {
    return !this.completed
  }
}

export type Filter = (typeof TodosApp.Filters)[number]

export class TodosApp extends App {
  static elementTag = core.defineElement(this, "test-project", "App")

  // a todos-app has a property tasks as a new list of tasks
  @prop({ itemType: "Task", init: () => new List<Task>({ instanceType: "Task" }) })
  accessor tasks!: List<Task>

  // a todos-app has a property newTaskName as text
  @prop({ type: "text" })
  accessor newTaskName!: string

  // a todos-app has a filter as one of all, active or completed
  static Filters = ["all", "active", "completed"] as const
  @prop({ oneOf: () => TodosApp.Filters })
  accessor filter!: Filter

  @derived get shownTasks() {
    if (this.filter === "active") return core.filter(this.tasks, (task: Task) => task.isActive)
    if (this.filter === "completed") return core.filter(this.tasks, (task: Task) => task.isComplete)
    return this.tasks
  }

  @drawn draw() {
    return (
      <ui-container>
        <ui-segment>
          <ui-menu inverted={true} color="violet" borderless={true}>
            <ui-item type="header">To Do:</ui-item>
            <ui-menu position="right">
              <ui-item>Show:</ui-item>
              <ui-item onClick={() => (app.filter = "all")} selected={app.filter === "all"} style="cursor:pointer;user-select:none">
                All
              </ui-item>
              <ui-item onClick={() => (app.filter = "active")} selected={app.filter === "active"} style="cursor:pointer;user-select:none">
                Active
              </ui-item>
              <ui-item onClick={() => (app.filter = "completed")} selected={app.filter === "completed"} style="cursor:pointer;user-select:none">
                Completed
              </ui-item>
            </ui-menu>
          </ui-menu>
          <ui-form debug={true} prop:value={app}>
            <ui-repeat prop:items={app.shownTasks}>
              <ui-fields>
                <ui-field width="1">
                  <ui-checkbox name="completed" aria-label="Done" />
                </ui-field>
                <ui-field width="10">
                  <ui-input name="title" aria-label="Task" />
                </ui-field>
              </ui-fields>
            </ui-repeat>
            <ui-fields>
              <ui-field width="11">
                <ui-input name="newTaskName" placeholder="New task name" label="New task:" />
              </ui-field>
              <ui-field>
                <ui-button disabled={app.newTaskName === ""} onClick={() => createANewTask()} style="cursor:pointer;user-select:none">
                  Add Task
                </ui-button>
              </ui-field>
            </ui-fields>
          </ui-form>
          <br />
          <br />
          <ui-menu inverted={true} color="grey">
            <ui-item type="header">Test:</ui-item>
            <ui-item onClick={() => createANewTask({ title: "Moar" })} style="cursor:pointer;user-select:none">
              Add Item
            </ui-item>
            <ui-item onClick={() => core.removeItemAt(app.tasks, 0)} style="cursor:pointer;user-select:none">
              Remove Item
            </ui-item>
            <ui-item onClick={() => (core.getItemAt(app.tasks, 0)!.title = "New title")} style="cursor:pointer;user-select:none">
              Change name
            </ui-item>
            <ui-item onClick={() => core.removeWhere(app.tasks, (item: Task) => item.isComplete)} style="cursor:pointer;user-select:none">
              Remove Completed
            </ui-item>
          </ui-menu>
        </ui-segment>
      </ui-container>
    )
  }
}

/**
 * `<test-project-app>`:  a todos app, drawn in its own element, e.g. by `draw the todos app`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its todos app's properties;  its methods call its todos app's.
 * - What every view's element does, e.g. drawing its todos app, is `SpellElement`'s.
 */
export class TodosAppElement extends SpellElement<TodosApp> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-app", "todos app", [
    { name: "tasks", kind: "json", description: "Its tasks." },
    { name: "new-task-name", kind: "string", description: "Its newTaskName." },
    { name: "filter", kind: "string", description: "Its filter." }
  ])
}
core.useElement(TodosApp, TodosAppElement)

export const app = new TodosApp()
app.filter = "all"
app.newTaskName = ""

export function createANewTask(props: { title?: string; completed?: boolean } = {}) {
  let { title, completed } = props
  if (title === undefined) {
    if (app.newTaskName === "") return
    title = app.newTaskName
    app.newTaskName = ""
  }
  const it = new Task({ title: title, completed: completed || false })
  core.append(app.tasks, it)
}

createANewTask({ title: "Create todos app", completed: true })
createANewTask({ title: "Teach it to draw" })
createANewTask({ title: "Test app" })

if (!core.isCarryingOver) app.start()
core.console.log(app)

// each view type's tag, for the JSX
declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      /** `TodosAppElement` */
      "test-project-app": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
    }
  }
}
