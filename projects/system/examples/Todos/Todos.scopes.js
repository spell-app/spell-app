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
      description: "## Todo app example"
    },
    {
      path: "project:Todos/file:Todo.spell/type:Task/property:completed", line: 4,
      detail: "choice"
    },
    {
      path: "project:Todos/file:Todo.spell/type:Task/property:title", line: 3,
      detail: "text"
    },
    {
      path: "project:Todos/file:Todo.spell/type:Task/method:draw (a task)", line: [23, 35],
      rules: [
        { name: "draw", syntax: "draw {thisArg:expression}" }
      ]
    },
    {
      path: "project:Todos/file:Todo.spell/type:Task/method:is active", line: 6,
      rules: [
        { name: "is_active", syntax: "{operator:is} active" }
      ]
    },
    {
      path: "project:Todos/file:Todo.spell/type:Task/method:is complete", line: 5,
      rules: [
        { name: "is_complete", syntax: "{operator:is} complete" }
      ]
    },
    {
      path: "project:Todos/file:Todo.spell/type:Todos_App", line: 8,
      super: "type:App"
    },
    {
      path: "project:Todos/file:Todo.spell/type:Todos_App/property:filter", line: 10,
      rules: [
        { name: "Todos_App_Filters", syntax: "(Todos_App|todos_app) (Filters|filters)" }
      ]
    },
    { path: "project:Todos/file:Todo.spell/type:Todos_App/property:tasks", line: 9 },
    {
      path: "project:Todos/file:Todo.spell/type:Todos_App/method:draw (a todos-app)", line: [37, 62],
      rules: [
        { name: "draw", syntax: "draw {thisArg:expression}" }
      ]
    },
    {
      path: "project:Todos/file:Todo.spell/type:Todos_App/enumeration:Filters", line: 10,
      rules: [
        { name: "Todos_App_Filters", syntax: "(Todos_App|todos_app) (Filters|filters)" }
      ]
    },
    {
      path: "project:Todos/file:Todo.spell/type:Todos_App/constant:all", line: 10,
      rules: [
        { name: "Todos_App_Filters", syntax: "(Todos_App|todos_app) (Filters|filters)" }
      ]
    },
    {
      path: "project:Todos/file:Todo.spell/type:Todos_App/constant:active", line: 10,
      rules: [
        { name: "Todos_App_Filters", syntax: "(Todos_App|todos_app) (Filters|filters)" }
      ]
    },
    {
      path: "project:Todos/file:Todo.spell/type:Todos_App/constant:completed", line: 10,
      rules: [
        { name: "Todos_App_Filters", syntax: "(Todos_App|todos_app) (Filters|filters)" }
      ]
    },
    { path: "project:Todos/file:Todo.spell/variable:app", line: 12 },
    {
      path: "project:Todos/file:Todo.spell/function:create a task (with title as text)", line: [15, 17],
      rules: [
        { name: "create_a_task", syntax: "create a task (with {props:object_literal_properties})?" }
      ]
    }
  ]
}
