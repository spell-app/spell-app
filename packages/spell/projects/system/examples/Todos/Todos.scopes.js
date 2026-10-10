/*! SPELL: SCOPES @system:examples:Todos */
;(globalThis.SPELL_SCOPES ??= {})[document.currentScript.src] = {
  id: "@system:examples:Todos",
  entries: [
    { path: "project:Todos" },
    {
      path: "project:Todos/file:Todo.spell",
      uri: "spell:/@system:examples:Todos/Todo.spell"
    },
    {
      path: "project:Todos/file:Todo.spell/type:Task", line: 2,
      super: "type:Thing",
      section: "Todo app example",
      description: "## Todo app example"
    },
    {
      path: "project:Todos/file:Todo.spell/type:Task/property:title", line: 3,
      detail: "text",
      section: "Todo app example"
    },
    {
      path: "project:Todos/file:Todo.spell/type:Task/property:completed", line: 4,
      detail: "choice",
      section: "Todo app example"
    },
    {
      path: "project:Todos/file:Todo.spell/type:Task/method:is complete", line: 5,
      section: "Todo app example",
      rules: [
        { name: "is_complete", syntax: "{operator:is} complete" }
      ]
    },
    {
      path: "project:Todos/file:Todo.spell/type:Task/method:is active", line: 6,
      section: "Todo app example",
      rules: [
        { name: "is_active", syntax: "{operator:is} active" }
      ]
    },
    {
      path: "project:Todos/file:Todo.spell/type:Task/method:draw (a task)", line: [24, 36],
      section: "Todo app example",
      rules: [
        { name: "draw", syntax: "draw {thisArg:expression}" }
      ]
    },
    {
      path: "project:Todos/file:Todo.spell/type:Task_List", line: 7,
      super: "type:List",
      section: "Todo app example"
    },
    {
      path: "project:Todos/file:Todo.spell/type:Todos_App", line: 9,
      super: "type:App",
      section: "Todo app example"
    },
    {
      path: "project:Todos/file:Todo.spell/type:Todos_App/property:tasks", line: 10,
      detail: "Task_List",
      section: "Todo app example"
    },
    {
      path: "project:Todos/file:Todo.spell/type:Todos_App/property:filter", line: 11,
      section: "Todo app example"
    },
    {
      path: "project:Todos/file:Todo.spell/type:Todos_App/enumeration:Filters", line: 11,
      section: "Todo app example"
    },
    {
      path: "project:Todos/file:Todo.spell/type:Todos_App/constant:all", line: 11,
      section: "Todo app example"
    },
    {
      path: "project:Todos/file:Todo.spell/type:Todos_App/constant:active", line: 11,
      section: "Todo app example"
    },
    {
      path: "project:Todos/file:Todo.spell/type:Todos_App/constant:completed", line: 11,
      section: "Todo app example"
    },
    {
      path: "project:Todos/file:Todo.spell/type:Todos_App/method:draw (a todos-app)", line: [38, 63],
      section: "Todo app example",
      rules: [
        { name: "draw", syntax: "draw {thisArg:expression}" }
      ]
    },
    {
      path: "project:Todos/file:Todo.spell/variable:app", line: 13,
      detail: "Todos_App",
      section: "Todo app example"
    },
    {
      path: "project:Todos/file:Todo.spell/function:create a new task (with title as text)", line: [16, 18],
      section: "Todo app example",
      rules: [
        { name: "create_a_new_task", syntax: "create a new task (with {props:object_literal_properties})?" }
      ]
    }
  ]
}
