/**
 * What today's grammar does with the phrasings `precedence.html` discusses -- the evidence behind its tables.
 * - Run from `packages/docs`:  `yarn tsx precedence/experiments/grammar-today.mts`
 * - Parses scratch files in memory with `parseSpellProject()`, exactly as a project compile does;  writes nothing.
 * - The "cards" probes parse against the FROZEN Solitaire fixture's Card / Deck / Pile (`projects/test/Solitaire/`),
 *   which predates jokers -- so no joker phrasing here.
 * - NOTE: MUST be `.mts`:  a `.ts` script outside `src/` is compiled as CommonJS and trips the `$/parser`
 *   circular-import trap (`Class extends value undefined`) -- see PAPERCUTS.md.
 */
import { parseSpellProject, loadFixtureProject } from "$/spell/test"

/**
 * Parse `lines` as one spell file, after `setup`, and print what they compiled to.
 * - `setup` MUST end with `SETUP_END`:  output is everything after what that line compiled to.
 */
function probe(title: string, setup: string[], ...lines: string[]) {
  const contents = [...setup, ...lines].join("\n")
  const { files } = parseSpellProject([...cards, { path: "/Probe.spell", contents }])
  const file = files.at(-1)!
  const compiled = file.compiled
    .split("\n")
    .filter(
      (line) => !/^\s*(\/\*! SPELL|type:|syntax:|defined:|alias:|name:|output:|rule:|of:|kind:|\} \*\/)/.test(line)
    )
  const output = compiled.slice(compiled.lastIndexOf(SETUP_END_COMPILED) + 1)
  console.log(`\n### ${title}`)
  for (const line of lines) console.log(`    | ${line}`)
  console.log(`  => ${output.join("\n  => ")}`)
  if (file.errors.length) console.log(`  => errors: ${JSON.stringify(file.errors)}`)
}

/** The frozen cards library:  `Card`, `Deck`, `Pile` -- not `Solitaire.spell`, which runs a game. */
const cards = loadFixtureProject("Solitaire").filter((file) => !file.path.endsWith("Solitaire.spell"))

/** Last line of every `setup`, and what it compiles to -- `probe()` prints what follows it. */
const SETUP_END = "set y to 2"
const SETUP_END_COMPILED = "export let y = 2"

/** Types and variables the probes below refer to. */
const setup = [
  "a chip is a thing",
  "a pot is a list of chips",
  "the card is a new card",
  "the deck is a new deck",
  "the pile is a new pile",
  "the chip is a new chip",
  "the pot is a new pot",
  "set x to 1",
  SETUP_END
]

////////////////
// ## P1:  greedy operands, no backtracking
////////////////

probe("P1a  trailing operand takes the operator", setup, "print the first card of the deck is face up")
probe("P1b  count vs comparison", setup, "print the number of cards in the deck is 52")
probe("P1c  count vs arithmetic", setup, "print the number of cards in the deck + 1")
probe("P1d  property of a position", setup, "print the suit of the first card of the deck is hearts")
probe("P1e  `of` after an argument", setup, "to remove (a card) of (a pile): print 1", "remove the card of the pile")

////////////////
// ## P2 / P3:  precedence before length;  postfix binds tightest
////////////////

probe("P2a  enumeration beats a longer compound", setup, "print card suits includes x")
probe("P2b  unset precedence on `ends with`", setup, "print x ends with y and 1")
probe("P3   postfix applied immediately", setup, "print x + y is empty")

////////////////
// ## P4:  type-blind call rules
////////////////

probe(
  "P4a  two same-shaped methods on different types",
  setup,
  "to put (a card) on (a pile): print 1",
  "to put (a chip) on (a pot): print 2",
  "put the chip on the pot"
)
probe("P4b  built-in list add", setup, "add the card to the deck")
probe(
  "P4c  a user `add` shadows it for a deck",
  setup,
  "to add (a card) to (a pile): print 1",
  "add the card to the deck"
)

////////////////
// ## P5 / P6 / P7:  signatures, property names, `is a`
////////////////

probe("P5   paren-free signature", setup, "to give a card to a pile: print 1")
probe("P5b  a/an before a word that is NOT a type", setup, "to make a mess: print 1", "make a mess")
probe("P6a  multi-word getter", setup, "the short rank of a card is: return 1")
probe("P6b  multi-word property read", setup, "print the short-rank of the card", "print the short rank of the card")
probe("P7   `is a` accepts any word as a type", setup, "print the card is a new card")

////////////////
// ## P8:  Solitaire's parens -- which are load-bearing?
////////////////

probe("P8a  Deck.spell:40-41 as one line", setup, "expect the first card of the deck is the ace of clubs to be yes")
probe("P8b  Solitaire:105 without its parens", setup, "turn the bottom card of the deck face up")
probe("P8c  Solitaire:166 without its parens", setup, "if x is a king and x is the first card of the pile return")
probe("P8d  Card.spell:46 without its parens", setup, "print the first character of the name of the card as uppercase")
