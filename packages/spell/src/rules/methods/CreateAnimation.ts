import { proto } from "$/util"
import { P } from "$/parser"
import { MethodDefinition } from "./MethodDefinition"
import { methods } from "./methods.parser"

/**
 * `create_animation` rule:  defines an animation method:
 * `animation deal the cards`, or `create animation deal the cards`.
 * - `create` is optional filler:  `asAnimation` just records that the `animation` keyword matched,
 *   it doesn't distinguish the two spellings.
 * - `inlineInitialType` is `true`, same promotion-to-instance-method behavior as `to_do_something`.
 * - SIDE EFFECT: `MethodDefinition.getAST()`'s `asAnimation` handling makes the method `async`,
 *   and wraps its body in `StartProcessInvocation` (`exclusive: true`)
 *   and `try { ... } finally { StopProcessInvocation }`.
 *   - That makes re-invoking a running animation a no-op
 *     (see `spellCore.processIsRunning()` in the compiled output).
 *   - And it always stops the process on the way out.
 */
export class CreateAnimation extends MethodDefinition<"asAnimation|signature|body?"> {
  @proto static alias = "statement"
  // promote the first captured type arg (e.g. `(a card)`) to an instance-method receiver
  @proto static inlineInitialType = true
}
methods.addRule(CreateAnimation, {
  syntax: `(asAnimation:create? animation) {signature:method_signature} :? {statement_body}?`,
  tests: [
    {
      title: "inline method signatures & variables",
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        scope.types?.add("card")
        scope.types?.add("pile")
        scope.types?.add("deck")
        scope.constants?.add("up")
        scope.constants?.add("down")
      },
      tests: [
        {
          input: "animation deal the cards",
          js: [
            "export async function dealTheCards() {",
            "  if (spellCore.processIsRunning('deal_the_cards')) { return }",
            "  spellCore.startProcess('deal_the_cards', 'EXCLUSIVE')",
            "  try {}",
            "  finally {",
            "    spellCore.stopProcess('deal_the_cards')",
            "  }",
            "}"
          ],
          ts: [
            "export async function dealTheCards() {",
            '  if (spellCore.processIsRunning("deal_the_cards")) return',
            '  spellCore.startProcess("deal_the_cards", "EXCLUSIVE")',
            "  try {}",
            "  finally {",
            '    spellCore.stopProcess("deal_the_cards")',
            "  }",
            "}"
          ]
        },
        {
          input: ["animation deal the cards", "\tpause for 10 seconds"],
          js: [
            "export async function dealTheCards() {",
            "  if (spellCore.processIsRunning('deal_the_cards')) { return }",
            "  spellCore.startProcess('deal_the_cards', 'EXCLUSIVE')",
            "  try {",
            "    await spellCore.pauseFor(10, 'seconds')",
            "  }",
            "  finally {",
            "    spellCore.stopProcess('deal_the_cards')",
            "  }",
            "}"
          ],
          ts: [
            "export async function dealTheCards() {",
            '  if (spellCore.processIsRunning("deal_the_cards")) return',
            '  spellCore.startProcess("deal_the_cards", "EXCLUSIVE")',
            "  try {",
            '    await spellCore.pauseFor(10, "seconds")',
            "  }",
            "  finally {",
            '    spellCore.stopProcess("deal_the_cards")',
            "  }",
            "}"
          ]
        }
      ]
    }
  ]
})
