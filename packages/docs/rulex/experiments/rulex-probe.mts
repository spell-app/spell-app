/**
 * What rulex really does with a syntax string -- the evidence behind `rulex/rulex.html`'s tables.
 * - Run from `packages/docs`:  `yarn tsx rulex/experiments/rulex-probe.mts`
 * - For each syntax:  the tokens rulex sees, how much of them it consumed, the rule it compiled to (as a
 *   constructor tree), and that rule's `toRulexSyntax()` round trip.
 * - Then parses sample inputs against compiled rules, to show what they match.
 * - NOTE: MUST be `.mts`:  a `.ts` script outside `src/` is compiled as CommonJS and trips the `$/parser`
 *   circular-import trap -- see PAPERCUTS.md.
 */
import { P } from "$/parser"

import "$/parser/rulex"

const rulex = P.Parser.rulexParser!

////////////////
// ## Compiling syntax
////////////////

/**
 * Compile `syntax` and print what rulex saw and built.
 * - "consumed" < "tokens" means rulex silently DROPPED the rest of the syntax.
 */
function compile(syntax: string, note = "") {
  const tokens = rulex.tokenize(syntax) ?? []
  const match = rulex.parse(syntax)
  const consumed = match?.length ?? 0
  let built = "(nothing)"
  let roundTrip = ""
  try {
    const rule = P.Rule.compileSyntax(syntax)
    built = describe(rule)
    roundTrip = rule.toRulexSyntax()
  } catch (error) {
    built = `THROWS: ${(error as Error).message}`
  }
  const dropped = consumed < tokens.length ? `  DROPPED: ${tokens.slice(consumed).map(showToken).join(" ")}` : ""
  console.log(`\n${JSON.stringify(syntax)}${note ? `   -- ${note}` : ""}`)
  console.log(`  tokens:   ${tokens.map(showToken).join(" ")}`)
  console.log(`  consumed: ${consumed}/${tokens.length}${dropped}`)
  console.log(`  rule:     ${built}`)
  if (roundTrip) console.log(`  back:     ${JSON.stringify(roundTrip)}`)
}

////////////////
// ## Matching input
////////////////

/** A throwaway parser for matching probes:  rules registered under `name`, tokenized as spell does. */
const probeParser = new P.Parser({ module: "probe" })

/** Register `syntax` as rule `name` (a `Sequence`), plus any `subrules` it needs, on `probeParser`. */
function define(name: string, syntax: string) {
  probeParser.addRule(new P.Sequence({ name, syntax }) as P.Rule)
}

/** Parse each of `inputs` against rule `name`;  print how many tokens matched and the matched text. */
function match(name: string, ...inputs: string[]) {
  console.log(`\nmatch {${name}}  (${probeParser.rules[name]?.toRulexSyntax()})`)
  for (const input of inputs) {
    const tokens = probeParser.tokenize(input) ?? []
    const result = probeParser.parse(input, name)
    const verdict = !result ? "no match" : result.length === tokens.length ? "ALL" : `${result.length}/${tokens.length}`
    console.log(
      `  ${JSON.stringify(input).padEnd(22)} ${verdict.padEnd(9)} ${result ? JSON.stringify(result.inputText) : ""}`
    )
  }
}

////////////////
// ## Probes
////////////////

console.log("\n# 1. Basics")
compile("aa bb cc")
compile("give {thing:expression} (to {recipient})?")
compile("(a|an) {type} has {property} {specifier}?")
compile("[{item},]", "list:  item, delimiter")
compile("[{item}{comma}]", "list:  two subrules")
compile("word+")
compile("{sub}*")
compile(">=")
compile("(>|<) (=)?")
compile("(op:+|-)", "named choice")
compile("1", "number")

console.log("\n# 2. Escapes")
for (const char of ["?", "*", "+", "(", ")", "[", "]", "{", "}", "|", ":", "\\"]) compile(`a \\${char} b`)

console.log("\n# 3. Characters the tokenizer claims first")
compile("# {text}", "# at start of line:  heading comment")
compile("a # b", "# mid-line")
compile("\\# {text}", "escaped # at start")
compile("a -- b", "-- anywhere:  comment")
compile("a \\-- b", "escaped --")
compile("---", "thematic break")
compile("\\-\\-\\-", "each - escaped")
compile("a // b", "// anywhere:  comment")
compile("a \\/\\/ b", "each / escaped")
compile('a "b c" d', "double quotes:  TextToken")
compile('a \\"b c\\" d', "escaped double quotes")
compile("\\'{x}\\'", "escaped single quotes")
compile("it's {x}", "lone apostrophe")
compile("'{x}'", "single-quoted")
compile("1. {item}", "number then .")
compile("-1", "negative number")
compile("1.1", "decimal")
compile("1.1.1", "version-like")
compile(".5", "leading dot")
compile("a-1", "word then dash-digit")
compile("<b> {text} </b>", "angle brackets:  JSX?")
compile("< {x} >", "spaced angle brackets")
compile("`{code}`", "backticks")
compile("~~{text}~~", "tildes")
compile("**{text}**", "double star")
compile("\\*\\*{text}\\*\\*", "escaped double star")
compile("\\[{text}\\]\\({url}\\)", "markdown link, escaped")
compile("![{alt}]", "image start")
compile("¬", "¬ is rewritten to newline")

console.log("\n# 4. Matching")
define("bold", "\\*\\*{word}\\*\\*")
define("word", "(hello|world)")
match("bold", "**hello**", "* *hello* *", "**hello", "**world**")
define("stars", "\\* \\*")
match("stars", "**", "* *")
define("greeting", "hello world")
match("greeting", "hello world", "Hello world", "hello   world", "hello\nworld")
define("listOf", "[{word},]")
match("listOf", "hello", "hello, world", "hello, world,", "hello world")
define("link", "\\[{word}\\]\\({word}\\)")
match("link", "[hello](world)", "[ hello ] ( world )")
define("apostrophe", "{word} ' s")
match("apostrophe", "hello's", "hello 's")

console.log("\n# 5. Markdown line kinds in rulex")
compile("\\#+ {text}", "ATX heading")
compile("(\\-\\-\\-+|\\*\\*\\*+|___+)", "thematic break, 3 or more")
compile("(\\-|\\*|\\+) {text}", "bullet item")
compile("{digits} (.|\\)) {text}", "ordered item")
compile("```+ {info}?", "fence open")
compile("~~~+ {info}?", "tilde fence")
compile("> {text}?", "block quote")
compile("\\|? [{cell}\\|] \\|?", "table row")
compile("\\|? [{align}\\|] \\|?", "table delimiter row")
compile(":? \\-+ :?", "table align cell")
compile("!\\[{alt}\\]\\({url}\\)", "image")
compile("<{url}>", "autolink")
compile("(\\-|\\*) \\[ (x|X)? \\] {text}", "task item")
compile("> \\[ ! (NOTE|TIP|IMPORTANT|WARNING|CAUTION) \\]", "GFM alert")
define("dashes", "(\\-\\-\\-+|\\*\\*\\*+|___+)")
match("dashes", "---", "------", "- - -", "--", "***", "___", "-*-")
define("bullet", "(\\-|\\*|\\+) {word}")
match("bullet", "- hello", "-hello", "* world")

////////////////
// ## Helpers
////////////////

/** `Word(hello)`-style label for a token:  type minus `Token`, then its value. */
function showToken(token: P.Token) {
  return `${token.constructor.name.replace(/Token$/, "")}(${JSON.stringify(token.value)})`
}

/** One-line constructor tree of `rule`, e.g. `Sequence[Keyword(give) Subrule(thing:expression)]`. */
function describe(rule: P.Rule): string {
  const flags = `${rule.matchGroup ? `${rule.matchGroup}:` : ""}`
  const optional = rule.optional ? "?" : ""
  const name = rule.constructor.name
  const r = rule as unknown as Record<string, unknown>
  if (r.rules) return `${name}${optional}[${(r.rules as P.Rule[]).map(describe).join(" ")}]`
  if (r.literals)
    return `${name}${optional}(${JSON.stringify((r.literals as P.LiteralMatcher[]).map((l) => (l.optional ? `${l.literal}?` : l.literal)))})`
  if (r.literal !== undefined) return `${name}(${flags}${JSON.stringify(r.literal)})${optional}`
  if (name === "Subrule") return `Subrule(${flags}${r.rule as string})${optional}`
  if (name === "Repeat") {
    const delimiter = r.delimiter ? ` / ${describe(r.delimiter as P.Rule)}` : ""
    return `Repeat${optional}(${flags}${describe(r.rule as P.Rule)}${delimiter})`
  }
  return `${name}(${flags})${optional}`
}
