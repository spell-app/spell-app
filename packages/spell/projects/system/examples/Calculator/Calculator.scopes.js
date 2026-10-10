/*! SPELL: SCOPES @system:examples:Calculator */
;(globalThis.SPELL_SCOPES ??= {})[document.currentScript.src] = {
  id: "@system:examples:Calculator",
  entries: [
    { path: "project:Calculator" },
    {
      path: "project:Calculator/file:Calculator.spell",
      uri: "spell:/@system:examples:Calculator/Calculator.spell"
    },
    {
      path: "project:Calculator/file:Calculator.spell/type:Calculator", line: 9,
      super: "type:App"
    },
    {
      path: "project:Calculator/file:Calculator.spell/type:Calculator/property:input", line: 10,
      detail: "text"
    },
    {
      path: "project:Calculator/file:Calculator.spell/type:Calculator/property:output", line: 11,
      detail: "text"
    },
    {
      path: "project:Calculator/file:Calculator.spell/type:Calculator/property:left", line: 12,
      detail: "text"
    },
    {
      path: "project:Calculator/file:Calculator.spell/type:Calculator/property:right", line: 13,
      detail: "text"
    },
    {
      path: "project:Calculator/file:Calculator.spell/type:Calculator/property:total", line: 14,
      detail: "number"
    },
    {
      path: "project:Calculator/file:Calculator.spell/type:Calculator/property:operator", line: 15,
      detail: "text"
    },
    {
      path: "project:Calculator/file:Calculator.spell/type:Calculator/method:clear (a calculator)", line: [17, 23],
      rules: [
        { name: "clear", syntax: "clear {thisArg:expression}" }
      ]
    },
    {
      path: "project:Calculator/file:Calculator.spell/type:Calculator/method:update the total of (a calculator)", line: [25, 39],
      rules: [
        { name: "update_the_total_of_calculator", syntax: "update the total of {thisArg:expression}" }
      ]
    },
    {
      path: "project:Calculator/file:Calculator.spell/type:Calculator/method:append (digit as text) to (a calculator)", line: [41, 55],
      rules: [
        { name: "append_$digit_to_calculator", syntax: "append {callArgs:expression} to {thisArg:expression}" }
      ]
    },
    {
      path: "project:Calculator/file:Calculator.spell/type:Calculator/method:set the operator of (a calculator) to (op as text)", line: [57, 65],
      rules: [
        { name: "set_the_operator_of_calculator_to_$op", syntax: "set the operator of {thisArg:expression} to {callArgs:expression}" }
      ]
    },
    {
      path: "project:Calculator/file:Calculator.spell/type:Calculator/method:draw (a calculator)", line: [67, 106],
      rules: [
        { name: "draw", syntax: "draw {thisArg:expression}" }
      ]
    },
    {
      path: "project:Calculator/file:Calculator.spell/variable:calculator", line: 108,
      detail: "Calculator"
    }
  ]
}
