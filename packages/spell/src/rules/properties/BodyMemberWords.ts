import { P } from "$/parser"
import { MemberWords } from "./MemberWords"
import { properties } from "./properties.parser"

/** Words which name a line's subject, not its property:  see `SubjectRule`. */
const SUBJECT_WORDS = new Set(["it", "its"])

/**
 * `body_member_words` rule:  a member's bare name starting a line of a type's outline body,
 * e.g. `suit` in `- suit is a suit of its deck` (epic page `outline-spell`, P9).
 * - As `member_words`, but NOT when its first word starts one of spell's statements, e.g. `return` or `print`:
 *   `- return x is 1` stays a `return`.
 *   A property named so keeps its quotes:  `- "return" is ...`.
 * - Nor `it` / `its`:  `- its rank is ...` names its subject, `rank` the property.
 * - Those words come from the statements themselves:  each `statement` rule's first fixed word.
 *   So a statement added later guards its word too.
 */
export class BodyMemberWords extends MemberWords {
  parse(scope: P.Scope, tokens: P.Token[]) {
    const word = `${tokens[0]?.value}`.toLowerCase()
    if (!tokens.length || SUBJECT_WORDS.has(word) || statementWordsFor(scope).has(word)) return undefined
    return super.parse(scope, tokens)
  }
}
properties.addRule(BodyMemberWords, {
  tests: [
    {
      tests: [
        { title: "a name", input: "short rank", js: "shortRank" },
        { title: "a statement's first word", input: "return x", js: undefined }
      ]
    }
  ]
})

/** Words a statement starts with, by the `statement` rule they were read from -- see `statementWordsFor()`. */
const STATEMENT_WORDS = new WeakMap<P.Rule, Set<string>>()

/**
 * The words any of `scope`'s statements starts with, lower case, e.g. `return`, `print`, `set`.
 * - Worked out once per `statement` rule, which changes when a rule is added.
 */
function statementWordsFor(scope: P.Scope): Set<string> {
  const statement = scope.getRuleOrDie("statement")
  let words = STATEMENT_WORDS.get(statement)
  if (!words) {
    words = new Set()
    addLeadingWords(statement, words)
    STATEMENT_WORDS.set(statement, words)
  }
  return words
}

/** Add the fixed words `rule` may start with to `words`:  none for a subrule, which could start with anything. */
function addLeadingWords(rule: P.Rule, words: Set<string>): void {
  if (rule instanceof P.Literal) {
    const [word] = [rule.literal].flat()
    if (word) words.add(word.toLowerCase())
  } else if (rule instanceof P.Literals) {
    for (const { literal } of rule.literals) {
      const [word] = [literal].flat()
      if (word) words.add(word.toLowerCase())
    }
  } else if (rule instanceof P.Choice) {
    for (const alternative of rule.rules) addLeadingWords(alternative, words)
  } else if (rule instanceof P.Sequence) {
    for (const child of rule.rules) {
      addLeadingWords(child, words)
      if (!child.optional) break
    }
  }
}
