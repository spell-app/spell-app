import { describe, expect, test } from "vite-plus/test"

import { P } from "$/parser"
import { PY } from "$/py"

/**
 * `PyWriter` (epic `python-target`):  which AST classes it writes so far, and Python's punctuation.
 * Its OUTPUT is pinned by the fixtures' `.snapshot.py`, and by the core contract running them.
 */

/** AST classes no writer writes on their own:  bases, and JSX pieces their element writes. */
const NEVER_WRITTEN = new Set([
  "ASTNode",
  "ASTExpression",
  "ASTComment",
  "ASTStatement",
  "ASTClassMember",
  "ASTJSXAttribute",
  "ASTJSXEndTag",
  "ASTJSXText",
  "ASTJSXExpression"
])

/**
 * What `PyWriter` can't write YET:  none since P10 (classes, members, objects, text, drawing).
 * - A new kind of tree node goes here until its phase writes it.
 * - The test fails if one is written that's still listed, so the list stays true.
 */
const NOT_YET = new Set<string>([])

/** `PyWriter` with its method lookup open to the test. */
class ProbeWriter extends PY.PyWriter {
  find(node: P.ASTNode, suffix: "" | "AsMember" = "") {
    return this.methodFor(node, suffix)
  }
}

/** Every AST class the barrel exports, by name. */
const AST_CLASSES = Object.entries(P).filter(
  ([name, value]) => typeof value === "function" && value.prototype instanceof P.ASTNode && name.startsWith("AST")
) as Array<[string, new (...args: never[]) => P.ASTNode]>

/** A node of `type` without running its constructor:  enough for a method lookup. */
function bare(type: new (...args: never[]) => P.ASTNode): P.ASTNode {
  return Object.create(type.prototype)
}

/** Does the writer find a method for `type`? */
function writes(writer: ProbeWriter, type: new (...args: never[]) => P.ASTNode): boolean {
  try {
    writer.find(bare(type))
    return true
  } catch {
    return false
  }
}

describe("PyWriter", () => {
  const writer = new ProbeWriter()

  test("writes every AST class but those still to come", () => {
    const missing = AST_CLASSES.filter(([name]) => !NEVER_WRITTEN.has(name) && !NOT_YET.has(name))
      .filter(([, type]) => !writes(writer, type))
      .map(([name]) => name)
    expect(missing).toEqual([])
  })

  test("the classes still to come aren't written yet:  take one off when it is", () => {
    const written = AST_CLASSES.filter(([name]) => NOT_YET.has(name))
      .filter(([, type]) => writes(writer, type))
      .map(([name]) => name)
    expect(written).toEqual([])
  })

  test("PEP 8's names", () => {
    expect(writer.nameOf("play_fizzbuzz")).toBe("play_fizzbuzz")
    expect(writer.typeNameOf("BankAccount")).toBe("BankAccount")
    expect(writer.nameOf("Ranks", "constant")).toBe("RANKS")
    expect(writer.nameOf("class", "variable")).toBe("class_")
  })

  test("another project's module, by its name in snake_case", () => {
    expect(PY.PyWriter.projectModule("@spell/project/@spell/test/cards")).toBe("cards")
    expect(PY.PyWriter.projectModule("@spell/project/@spell/library/card-games")).toBe("card_games")
  })

  test("the imports:  spell_core's `core`, then other projects';  only what the code uses;  two blank lines after", () => {
    const header = writer.importsHeader([
      { module: "@spell/core", names: ["spellCore", "Thing", "List"] },
      { module: "@spell/project/@spell/test/cards", names: ["Card", "Deck"] }
    ])
    expect(header).toBe("from spell_core import core, Thing, List\nfrom cards import Card, Deck\n\n\n")
    expect(writer.module(`${header}print(Thing)\n`)).toBe(
      "from spell_core import Thing\nfrom cards import Card, Deck\n\n\nprint(Thing)\n"
    )
  })
})

describe("pyText", () => {
  test("a block:  its header's colon, its body indented 4 spaces;  `pass` for none", () => {
    expect(PY.pyText.block("if x", "y = 1\nz = 2")).toBe("if x:\n    y = 1\n    z = 2")
    expect(PY.pyText.block("else", "")).toBe("else:\n    pass")
  })

  test("text in double quotes, escaped", () => {
    expect(PY.pyText.inQuotes('say "hi"\n')).toBe('"say \\"hi\\"\\n"')
  })

  test("a docstring:  one line, or its lines between the quotes", () => {
    expect(PY.pyText.docstring(["A card."])).toBe('"""A card."""')
    expect(PY.pyText.docstring(["A card.", "- red or black"])).toBe('"""\nA card.\n- red or black\n"""')
  })
})
