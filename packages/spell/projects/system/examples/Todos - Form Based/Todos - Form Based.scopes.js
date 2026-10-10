/*! SPELL: SCOPES @system:examples:Todos - Form Based */
;(globalThis.SPELL_SCOPES ??= {})[document.currentScript.src] = {
  id: "@system:examples:Todos - Form Based",
  entries: [
    { path: "project:Todos - Form Based" },
    {
      path: "project:Todos - Form Based/file:todo.spell",
      uri: "spell:/@system:examples:Todos%20-%20Form%20Based/todo.spell"
    },
    {
      path: "project:Todos - Form Based/file:todo.spell/type:Task", line: 2,
      super: "type:Thing",
      section: "Todo app example",
      description: "## Todo app example"
    },
    {
      path: "project:Todos - Form Based/file:todo.spell/type:Task/property:title", line: 3,
      detail: "text",
      section: "Todo app example"
    },
    {
      path: "project:Todos - Form Based/file:todo.spell/type:Task/property:completed", line: 4,
      detail: "choice",
      section: "Todo app example"
    },
    {
      path: "project:Todos - Form Based/file:todo.spell/type:Task/method:is complete", line: 5,
      section: "Todo app example",
      rules: [
        { name: "is_complete", syntax: "{operator:is} complete" }
      ]
    },
    {
      path: "project:Todos - Form Based/file:todo.spell/type:Task/method:is active", line: 6,
      section: "Todo app example",
      rules: [
        { name: "is_active", syntax: "{operator:is} active" }
      ]
    },
    {
      path: "project:Todos - Form Based/file:todo.spell/type:Task_List", line: 7,
      super: "type:List",
      section: "Todo app example"
    },
    {
      path: "project:Todos - Form Based/file:todo.spell/type:Todos_App", line: 9,
      super: "type:App",
      section: "Todo app example"
    },
    {
      path: "project:Todos - Form Based/file:todo.spell/type:Todos_App/property:tasks", line: 10,
      detail: "Task_List",
      section: "Todo app example"
    },
    {
      path: "project:Todos - Form Based/file:todo.spell/type:Todos_App/property:newTaskName", line: 11,
      detail: "text",
      section: "Todo app example"
    },
    {
      path: "project:Todos - Form Based/file:todo.spell/type:Todos_App/property:filter", line: 12,
      section: "Todo app example"
    },
    {
      path: "project:Todos - Form Based/file:todo.spell/type:Todos_App/enumeration:Filters", line: 12,
      section: "Todo app example"
    },
    {
      path: "project:Todos - Form Based/file:todo.spell/type:Todos_App/constant:all", line: 12,
      section: "Todo app example"
    },
    {
      path: "project:Todos - Form Based/file:todo.spell/type:Todos_App/constant:active", line: 12,
      section: "Todo app example"
    },
    {
      path: "project:Todos - Form Based/file:todo.spell/type:Todos_App/constant:completed", line: 12,
      section: "Todo app example"
    },
    {
      path: "project:Todos - Form Based/file:todo.spell/type:Todos_App/method:draw (a todos-app)", line: [30, 65],
      section: "Todo app example",
      rules: [
        { name: "draw", syntax: "draw {thisArg:expression}" }
      ]
    },
    {
      path: "project:Todos - Form Based/file:todo.spell/variable:app", line: 14,
      detail: "Todos_App",
      section: "Todo app example"
    },
    {
      path: "project:Todos - Form Based/file:todo.spell/function:create a new task (with title as text, completed as a choice)", line: [18, 24],
      section: "Todo app example",
      rules: [
        { name: "create_a_new_task", syntax: "create a new task (with {props:object_literal_properties})?" }
      ]
    }
  ]
}
