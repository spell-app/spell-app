/**
 * Warnings about a spell program:  something it should say, which doesn't stop it parsing or running.
 * - e.g. a property declared with no type, `a calculator has an input`:
 *   "Say what "input" is, e.g. "a calculator has an input as text"".
 * - Parse errors are the other kind of problem:  a line spell can't read (`SP.Block.getParseErrors()`).
 *   A line with a warning compiles as it is.
 * - Plain matches and their `data`, no scope of its own:  imports only `$/parser`, and `$/spell` (read at call time).
 */
import { P } from "$/parser"
import { SP } from "$/spell"

/**
 * Notes warnings on matches while parsing, and gathers a file's back up.
 * - A rule notes one on its OWN match's `data.warnings` (`note()`), WHILE PARSING:  in `parse()`, or `mutateScope()`
 *   for what it only knows then.  NEVER in `getAST()`, which is pure.
 * - Shown under their text by editors (`SpellLanguageService.diagnostics()`, as `DiagnosticSeverity.Warning`), and
 *   listed by `spell compile` after its errors, which they never count as.
 * - STATIC and instance-free on purpose:  what it knows is on the matches, which incremental parsing keeps or
 *   replaces line by line.  So `in()` walks the file's match as it is now, never a list kept beside it.
 */
export class SpellWarnings {
  /**
   * Note `message` on `match`, about `at` (default `match` itself):  editors show it under `at`'s text.
   * - e.g. a method's untyped parameter, `(digit)` in `to append (digit) to (a calculator)`.
   * - SIDE EFFECT:  adds it to `match.data.warnings` -- once:  the same message about the same match again is ignored,
   *   e.g. a `mutateScope()` run twice.
   */
  static note(match: P.Match, message: string, at: P.Match = match): void {
    const data = match.data as WarningsData
    if (data.warnings?.some((warning) => warning.at === at && warning.message === message)) return
    ;(data.warnings ??= []).push({ message, at })
  }

  /**
   * Every warning noted on `match` and the matches below it, in the order of their text.
   * - `match` is a file's or a block's, e.g. `file.match`.
   * - Walks what each match `matched`, and the matches rules keep in their `data`, e.g. a statement's parsed body, or
   *   what JSX parses out of `{...}`.
   * - Only those about `match`'s own TOKENS:  a rule's `data` may point at a match in another file,
   *   or at one parsed from a string, e.g. the signature in `a card "is the (color) joker" if ...`,
   *   whose positions are in that string.  Such a rule notes its warnings again, about its own text.
   */
  static in(match: P.Match): SP.SpellWarning[] {
    const tokens = new Set<P.Token>()
    P.Tokenizer.forEachToken(match.tokens, (token) => tokens.add(token))
    const found = new Set<SP.SpellWarning>()
    const seen = new Set<P.Match>()
    const visit = (each: P.Match) => {
      if (seen.has(each)) return
      seen.add(each)
      const { warnings } = each.data as WarningsData
      for (const warning of warnings ?? []) found.add(warning)
      for (const item of each.matched) if (item instanceof P.Match) visit(item)
      for (const value of Object.values(each.data)) {
        for (const item of [value].flat()) if (item instanceof P.Match) visit(item)
      }
    }
    visit(match)
    return [...found]
      .filter(({ at }) => tokens.has(at.tokens[0]!))
      .sort((one, other) => (one.at.start ?? 0) - (other.at.start ?? 0))
  }

  /**
   * A type to suggest for something called `words`, as a program would write it after `as`:
   * - `a deck` when `words` names a type `scope` knows, e.g. a property called `deck`
   * - else `text`, the most common
   * - Only a guess, for a warning's example:  spell doesn't type anything by its name.
   */
  static exampleType(scope: P.Scope, words: string): string {
    if (/^text$/i.test(words) || !scope.getType(SP.typeName(words))) return "text"
    return `${/^[aeiou]/i.test(words) ? "an" : "a"} ${words}`
  }

  /**
   * A list's item type to suggest for something called `words`, as written after `a new list of`:
   * - `words` itself, e.g. `tasks`, when it names a type `scope` knows
   * - else `text`
   */
  static exampleItemType(scope: P.Scope, words: string): string {
    return scope.getType(SP.typeName(words)) ? words : "text"
  }
}

/** What a match holding warnings has in its `data` -- see `SpellWarnings.note()`. */
type WarningsData = {
  /** Warnings noted on it, in the order noted. */
  warnings?: SP.SpellWarning[]
}
