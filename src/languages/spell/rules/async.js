//
//  # Rules for dealing with lists
//  TODO: sort
//

import { AST, SpellParser } from "~/languages/spell"

export const _async = new SpellParser({
  module: "async",
  rules: [
    /**
     * Await some expression!
     * TODO: add test to make sure parents are made async properly,
     *       especially for `await` inside an if block, etc
     */
    {
      name: "await",
      alias: "statement",
      syntax: "(await|wait for|wait until) :? {expression}?",
      constructor: "Statement",
      getAST(match) {
        const { expression } = match.groups
        return new AST.AwaitExpression(match, {
          expression: expression?.AST || new AST.UndefinedLiteral(match)
        })
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("card")
            scope.variables.add("list")
          },
          tests: [
            ["await", "await undefined"],
            ["wait for 1", "await 1"],
            ["wait until the card exists", "await spellCore.isDefined(card)"],
            ["wait until: the list is not empty", "await !spellCore.isEmpty(list)"]
          ]
        }
      ]
    },

    /** Delay for a certain amount of time. */
    {
      name: "wait",
      alias: "statement",
      // TODO: "a second", "a little bit", "a while", "a noticeable amount"
      syntax: "pause for {number:expression} (units:second|seconds|sec|millisecond|milliseconds|msec|tick|ticks)",
      constructor: "Statement",
      getAST(match) {
        const { number, units } = match.groups
        return new AST.AwaitExpression(match, {
          expression: new AST.CoreMethodInvocation(match, {
            methodName: "pauseFor",
            args: [number.AST, new AST.QuotedExpression(units, units.value)]
          })
        })
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            [`pause for 1 second"`, `await spellCore.pauseFor(1, 'second')`],
            [`pause for 2 seconds"`, `await spellCore.pauseFor(2, 'seconds')`],
            [`pause for 500 msec"`, `await spellCore.pauseFor(500, 'msec')`],
            [`pause for 10 ticks"`, `await spellCore.pauseFor(10, 'ticks')`],
            [`pause for (10 + 10) sec`, `await spellCore.pauseFor(10 + 10, 'sec')`]
          ]
        }
      ]
    },

    /** Start a conceptual animation or process. */
    {
      name: "start_process",
      alias: "statement",
      syntax: "start (operator:exclusive|non-exclusive|nonexclusive)? (animation|process) {name:constant}",
      constructor: "Statement",
      getAST(match) {
        const { operator, name } = match.groups
        const exclusive = operator?.value === "exclusive"

        const nameArg = new AST.QuotedExpression(match, name.value)
        const args = [nameArg]
        if (exclusive) args.push(new AST.QuotedExpression(match, "EXCLUSIVE"))

        const startStatement = new AST.CoreMethodInvocation(match, {
          methodName: "startProcess",
          args
        })
        if (!exclusive) return startStatement

        return new AST.StatementGroup(match, {
          statements: [
            new AST.IfStatement(match, {
              condition: new AST.CoreMethodInvocation(match, {
                methodName: "processIsRunning",
                args: [nameArg]
              }),
              statements: new AST.ReturnStatement(match)
            }),
            startStatement
          ]
        })
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            [`start process dealing`, `spellCore.startProcess('dealing')`],
            [`start animation dealing`, `spellCore.startProcess('dealing')`],
            [`start non-exclusive animation dealing`, `spellCore.startProcess('dealing')`],
            [`start nonexclusive process dealing`, `spellCore.startProcess('dealing')`],
            [
              `start exclusive process dealing`,
              [
                `if (spellCore.processIsRunning('dealing')) { return }`,
                `spellCore.startProcess('dealing', 'EXCLUSIVE')`
              ]
            ]
          ]
        }
      ]
    },

    /** Stop a conceptual animation or process. */
    {
      name: "stop_process",
      alias: "statement",
      syntax: "(stop|end|finish|cancel) (animation|process) {name:constant}",
      constructor: "Statement",
      getAST(match) {
        const { operator, name } = match.groups
        const args = [new AST.QuotedExpression(match, name.value)]
        return new AST.CoreMethodInvocation(match, {
          methodName: "stopProcess",
          args
        })
      },
      tests: [
        {
          compileAs: "statement",
          tests: [
            [`stop animation dealing`, `spellCore.stopProcess('dealing')`],
            [`stop process dealing`, `spellCore.stopProcess('dealing')`],
            [`end process dealing`, `spellCore.stopProcess('dealing')`],
            [`finish process dealing`, `spellCore.stopProcess('dealing')`],
            [`cancel process dealing`, `spellCore.stopProcess('dealing')`]
          ]
        }
      ]
    },

    /** Check a conceptual animation or process. */
    {
      name: "check_process",
      alias: "expression",
      syntax: "(animation|process) {name:constant} (operator:is|is not|isn't|isnt) (running|active)",
      getAST(match) {
        const { operator, name } = match.groups
        const expression = new AST.CoreMethodInvocation(match, {
          methodName: "processIsRunning",
          args: [new AST.QuotedExpression(match, name.value)]
        })
        if (operator.value === "is") return expression
        return new AST.NotExpression(match, { expression })
      },
      tests: [
        {
          compileAs: "expression",
          tests: [[`animation dealing is running`, `spellCore.processIsRunning('dealing')`]]
        }
      ]
    }
  ]
})
