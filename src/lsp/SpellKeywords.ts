import { P } from "spell-lang/parser"
import { SP } from "spell-lang/spell"

/****************
 * ### `SpellKeywords`
 * A language pack's keywords, as editors want them (epic `spanish` P10).
 * - Accent fixes:  a keyword typed without its written accent, and the accented word to put back,
 *   e.g. Spanish's `numero` => `número` -- see `accentFixFor()`.
 * - Its words for an editor's coarse colouring, before the language server's arrive:
 *   what a statement starts with (`if`, `si`), and the little words between (`and`, `the`, `y`, `el`) --
 *   see `statementPhrases`, `operatorPhrases`, and `grammarKeywords()`, which writes them for VS Code.
 * - From the pack's own rules, so a new keyword is picked up with no list to keep in step.
 * - Browser-safe:  the app's Monaco editor uses it too, through `LSP.SpellLanguageService`.
 ****************/
export class SpellKeywords {
  /** The pack. */
  readonly language: SP.Language
  /**
   * Each of the pack's keyword rules whose words take an accent fix, with its fixes:  `numero` => `número`.
   * - Keyed by rule:  a project's parser shares its pack's keyword rules, so a parse's match points at these.
   */
  private readonly fixesByRule = new Map<P.Rule, Map<string, string>>()

  constructor(language: SP.Language) {
    this.language = language
    this.findAccentFixes()
  }

  /** The keywords of `language`, worked out once per pack. */
  static of(language: SP.Language): SpellKeywords {
    let keywords = SpellKeywords.#byLanguage.get(language)
    if (!keywords) SpellKeywords.#byLanguage.set(language, (keywords = new SpellKeywords(language)))
    return keywords
  }
  static #byLanguage = new Map<SP.Language, SpellKeywords>()

  ////////////////
  // ## Accent fixes
  ////////////////

  /** Does the pack have any accent fixes at all?  English has none. */
  get hasAccentFixes(): boolean {
    return this.fixesByRule.size > 0
  }

  /**
   * The accented word to write for `word`, which keyword `rule` matched in a parse -- `undefined` for none.
   * - e.g. `número` for `numero`, when `el numero de cartas` parsed with `(número|numero|cantidad)`.
   * - Keeps a capital first letter:  `Numero` => `Número`.
   * - Only when it's UNAMBIGUOUS:
   *   - `rule` is one of the pack's, NOT a person's method name:  a method called `numero` stays as declared
   *   - the syntax lists the unaccented word only as a stand-in for its accented one, nowhere on its own:
   *     `si` is never fixed to `sí` (yes), as `si` is also `if`
   */
  accentFixFor(rule: P.Rule, word: string): string | undefined {
    const fixed = this.fixesByRule.get(rule)?.get(word.toLowerCase())
    if (!fixed) return undefined
    return word[0] === word[0]!.toUpperCase() ? fixed[0]!.toUpperCase() + fixed.slice(1) : fixed
  }

  /**
   * How completion offers keyword `word`:  the `label` it shows and writes, and the `filterText` it's found by.
   * - A word with an accent fix is offered WITH its accent, and found as typed without it:
   *   `esta` and `está` are both offered as `está`, found by `esta`,
   *   so typing `esta` and accepting the suggestion writes `está` (epic `spanish` I7).
   * - Any of the pack's keyword rules:  completion offers words, not a parse's matches -- see `accentFixFor()`.
   * - Never a word the pack also has on its own:  `si` (`if`) is offered as `si`, never `sí`.
   */
  completionSpelling(word: string): { label: string; filterText?: string } {
    this.accentedWords ??= new Map([...this.fixesByRule.values()].flatMap((pairs) => [...pairs]))
    const accented = this.accentedWords.get(word)
    if (accented) return { label: accented, filterText: word }
    const plain = withoutAccents(word)
    return plain !== word && this.accentedWords.get(plain) === word
      ? { label: word, filterText: plain }
      : { label: word }
  }
  /** Every rule's fixes as one, `esta` => `está`, worked out on first use -- see `completionSpelling()`. */
  private accentedWords?: Map<string, string>

  /**
   * Fill `fixesByRule` from every keyword rule of the pack -- see `accentFixFor()`.
   * - A word pairs with its accented form when both are alternatives in ONE place:
   *   - in a keyword's own list, `(número|numero)`, or one place of a phrase, `la (posición|posicion) de`
   *   - as two alternative phrases, accents apart, `(más grande|mas grande)`
   * - A word written anywhere WITHOUT its accented partner beside it is a keyword in its own right, e.g. `si`:
   *   never fixed, anywhere.
   */
  private findAccentFixes() {
    const rules = this.keywordRules()
    // alternative phrases, accents apart:  the unaccented one's words get fixes
    const phrasePairs = new Map<P.Rule, Map<string, string>>()
    for (const choice of this.allRules().filter((rule) => rule instanceof P.Choice)) {
      const phrases = choice.rules
        .filter((rule) => rules.includes(rule))
        .map((rule) => ({ rule, words: wordsOf(rule) }))
      for (const plain of phrases) {
        for (const accented of phrases) {
          if (plain === accented || plain.words.length !== accented.words.length) continue
          if (!plain.words.every((word, index) => word === withoutAccents(accented.words[index]!))) continue
          plain.words.forEach((word, index) => {
            if (word !== accented.words[index]) addFix(phrasePairs, plain.rule, word, accented.words[index]!)
          })
        }
      }
    }
    // each place's alternatives, and which words stand on their own
    const standalone = new Set<string>()
    const fixes = new Map<P.Rule, Map<string, string>>()
    for (const rule of rules) {
      for (const alternatives of placesOf(rule)) {
        for (const word of alternatives) {
          const accented = alternatives.find((it) => it !== word && withoutAccents(it) === word)
          if (accented) addFix(fixes, rule, word, accented)
          else if (!phrasePairs.get(rule)?.has(word)) standalone.add(word)
        }
      }
    }
    for (const [rule, pairs] of phrasePairs) for (const [word, accented] of pairs) addFix(fixes, rule, word, accented)
    for (const [rule, pairs] of fixes) {
      for (const word of pairs.keys()) if (standalone.has(word)) pairs.delete(word)
      if (pairs.size) this.fixesByRule.set(rule, pairs)
    }
  }

  ////////////////
  // ## Words for colouring
  ////////////////

  /**
   * Phrases a statement starts with, e.g. `if`, `for each`, `si`, `de lo contrario` -- longest first.
   * - Leaves out the articles:  `the card is ...` starts with an operator word, see `operatorPhrases`.
   */
  get statementPhrases(): string[] {
    const articles = new Set(this.articlePhrases)
    return byLength(this.leadingPhrasesOf("statement").filter((phrase) => !articles.has(phrase)))
  }

  /**
   * The little words between names, e.g. `and`, `is not`, `the`, `y`, `no es`, `el` -- longest first.
   * - What can come after an expression (`expression_suffix`), and the articles.
   */
  get operatorPhrases(): string[] {
    return byLength([...this.leadingPhrasesOf("expression_suffix"), ...this.articlePhrases])
  }

  /** The articles, and `its`:  `a`, `the`, `its`;  `un`, `el`, `su` ... */
  private get articlePhrases(): string[] {
    return ARTICLE_RULES.flatMap((name) => this.leadingPhrasesOf(name))
  }

  /** Phrases the rules named `name` start with, a category's too:  each one's leading keywords, e.g. `else`'s. */
  leadingPhrasesOf(name: string): string[] {
    const { parser } = this.language
    const rule = parser.rules[name]
    const rules = rule instanceof P.Choice ? rule.rules : rule ? [rule] : []
    const phrases = new Set(rules.flatMap((it) => leadingPhrases(it, parser, new Set())))
    return [...phrases].filter((phrase) => PHRASE.test(phrase))
  }

  /**
   * The keyword patterns of a TextMate grammar (VS Code's `spell.tmLanguage.json`) for `languages`, as one:
   * - `keyword.control.spell`:  what statements start with, at a line's start
   * - `keyword.operator.word.spell`:  the little words, anywhere
   * - A word inside a name (`is-ready`, `está-preparado`) isn't one:  names have dashes.
   * - What `scripts/vscode-grammar.ts` writes;  a test checks the grammar is up to date.
   */
  static grammarKeywords(languages: SP.Language[]): TextMateKeywords {
    const control = byLength([...new Set(languages.flatMap((it) => SpellKeywords.of(it).statementPhrases))])
    const operator = byLength([...new Set(languages.flatMap((it) => SpellKeywords.of(it).operatorPhrases))])
    return {
      comment: `Generated by scripts/vscode-grammar.ts from the language packs:  ${languages.map((it) => it.name).join(", ")}.`,
      patterns: [
        { name: "keyword.control.spell", match: `^\\s*(${alternation(control)})${WORD_END}` },
        { name: "keyword.operator.word.spell", match: `${WORD_START}(${alternation(operator)})${WORD_END}` }
      ]
    }
  }

  /**
   * A line that goes back out a level as it's typed:  `else`, in every language spell reads.
   * - Spanish's `si no` only before `:` or `si`:  on its own it may be `if no ...`, e.g. `si no hay cartas:`.
   * - Monaco's (`SpellMonaco`) and VS Code's (`language-configuration.json`, by hand):  a test checks they match,
   *   and that it knows every pack's `else`.
   */
  static DECREASE_INDENT =
    /^\s*(?:otherwise|else|sino|de\s+lo\s+contrario|si\s+no(?=\s*:|\s+si\b))(?![\p{L}\p{M}\d_-])/u

  ////////////////
  // ## Helpers
  ////////////////

  /** Every rule of the pack, nested ones too -- each once. */
  private allRules(): P.Rule[] {
    const found = new Set<P.Rule>()
    const visit = (rule: P.Rule | undefined) => {
      if (!rule || found.has(rule)) return
      found.add(rule)
      if (rule instanceof P.Choice || rule instanceof P.Sequence) rule.rules.forEach(visit)
      else if (rule instanceof P.Repeat) visit(rule.rule)
    }
    Object.values(this.language.parser.rules).forEach(visit)
    return [...found]
  }

  /** The pack's keyword rules:  single keywords, and phrases. */
  private keywordRules(): P.Rule[] {
    return this.allRules().filter((rule) => rule instanceof P.Keyword || rule instanceof P.Keywords)
  }
}

/** The VS Code grammar's `keyword` entry:  see `SpellKeywords.grammarKeywords()`. */
export type TextMateKeywords = {
  comment: string
  patterns: Array<{ name: string; match: string }>
}

/** Rules of the articles, and `its`, by name. */
const ARTICLE_RULES = ["definite_article", "indefinite_article", "subject_its"]

/** A phrase an editor can colour:  words and spaces. */
const PHRASE = /^[\p{L}][\p{L}\p{M}'-]*(?: [\p{L}][\p{L}\p{M}'-]*)*$/u

/** In a TextMate pattern:  not inside a word, or a dashed name. */
const WORD_START = "(?<![\\p{L}\\p{M}\\d_-])"
const WORD_END = "(?![\\p{L}\\p{M}\\d_-])"

/** The most phrases one keyword rule expands to, e.g. `(el|la) (número|numero|cantidad) de`. */
const MAX_PHRASES = 64

/** `word` with its written accents off:  `número` => `numero`;  `ñ` and `ü` kept. */
function withoutAccents(word: string): string {
  return word
    .normalize("NFD")
    .replace(/\u0301/g, "")
    .normalize("NFC")
}

/** Each place of keyword `rule` and the words that may go there:  `[["la"], ["posición", "posicion"], ["de"]]`. */
function placesOf(rule: P.Rule): string[][] {
  if (rule instanceof P.Keyword) return [[rule.literal].flat().map(String)]
  if (rule instanceof P.Keywords) return rule.literals.map(({ literal }) => [literal].flat().map(String))
  return []
}

/** Keyword `rule`'s words, the first alternative at each place:  `más grande`. */
function wordsOf(rule: P.Rule): string[] {
  return placesOf(rule).map((alternatives) => alternatives[0]!)
}

/** Note that keyword `rule` fixes `word` to `accented` -- the first one listed wins. */
function addFix(fixes: Map<P.Rule, Map<string, string>>, rule: P.Rule, word: string, accented: string) {
  let pairs = fixes.get(rule)
  if (!pairs) fixes.set(rule, (pairs = new Map()))
  if (!pairs.has(word)) pairs.set(word, accented)
}

/**
 * Keyword phrases `rule` can start with:  its leading keywords, through sequences, choices and repeats.
 * - A phrase's optional words are left out, its alternatives each make a phrase:
 *   `(si no|sino) :?` => `si no`, `sino`.
 * - Follows a `{subrule}` only to a single rule, NOT a category like `{expression}`, which could start with anything.
 */
function leadingPhrases(rule: P.Rule, parser: P.Parser, visited: Set<P.Rule>): string[] {
  if (visited.has(rule)) return []
  visited.add(rule)
  if (rule instanceof P.Keyword || rule instanceof P.Keywords) {
    const places = rule instanceof P.Keywords ? rule.literals.filter((it) => !it.optional) : undefined
    const alternatives = places ? places.map(({ literal }) => [literal].flat().map(String)) : placesOf(rule)
    let phrases = [""]
    for (const words of alternatives) {
      phrases = phrases.flatMap((phrase) => words.map((word) => (phrase ? `${phrase} ${word}` : word)))
      if (phrases.length > MAX_PHRASES) break
    }
    return phrases.slice(0, MAX_PHRASES)
  }
  if (rule instanceof P.Sequence) {
    const phrases: string[] = []
    for (const child of rule.rules) {
      phrases.push(...leadingPhrases(child, parser, visited))
      if (!child.optional) break
    }
    return phrases
  }
  if (rule instanceof P.Choice) return rule.rules.flatMap((child) => leadingPhrases(child, parser, visited))
  if (rule instanceof P.Repeat) return leadingPhrases(rule.rule, parser, visited)
  if (rule instanceof P.Subrule) {
    const target = parser.rules[rule.rule]
    if (target && !(target instanceof P.Group)) return leadingPhrases(target, parser, visited)
  }
  return []
}

/** `phrases`, each once, longest first:  so a pattern tries `is not` before `is`. */
function byLength(phrases: string[]): string[] {
  return [...new Set(phrases)].sort((a, b) => b.length - a.length || a.localeCompare(b))
}

/** `phrases` as a regex alternation, any run of spaces between words. */
function alternation(phrases: string[]): string {
  return phrases.map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+")).join("|")
}
