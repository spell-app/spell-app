import { describe, test, expect } from "vite-plus/test"

import { proto } from "$/util"
import { P, Parser, Tokenizer, WhitespacePolicy } from "$/parser"
import { SP } from "$/spell"
import { loadFixtureProject, parseSpellProject } from "$/spell/test"
// These tests define rules with rulex `syntax`, so they must opt into the rulex parser.
import "$/parser/rulex"

/** Each expectation as `rulex syntax`, `+` in front if it only `continues` something complete. */
function describeAll(expectations: P.Expectation[]): string[] {
  return expectations.map(({ rule, continues }) => `${continues ? "+" : ""}${rule.toRulexSyntax()}`)
}

/**
 * `Parser.expectedAfter()`:  what a half-typed rule could go on with -- see `P.Expectations`.
 */
describe("expectedAfter()", () => {
  describe("generic rules", () => {
    const { tokenize } = new Tokenizer({ whitespacePolicy: WhitespacePolicy.NONE })
    const parser = new Parser()
    const scope = parser.getScope()
    parser.addRule(new P.Keyword({ name: "noun", literal: ["cat", "dog"] }))
    class greet extends P.Sequence {
      @proto static syntax = "hello {noun} (and {noun})? please"
    }
    parser.addRule(greet)
    class animal extends P.Sequence {
      @proto static syntax = "cat"
    }
    class noisy_animal extends P.Sequence {
      @proto static syntax = "cat {noun}"
    }
    parser.addRule(animal, { alias: "pet" })
    parser.addRule(noisy_animal, { alias: "pet" })
    class nouns extends P.Sequence {
      // spaced before the comma:  the input below spaces it (`cat , dog ,`)
      @proto static syntax = "[{noun} ,]"
    }
    parser.addRule(nouns)
    const expected = (text: string, ruleName: string) =>
      describeAll(parser.expectedAfter(tokenize(text), ruleName, scope))

    test("a sequence expects the child it ran out of tokens before", () => {
      expect(expected("hello", "greet")).toEqual(["{noun}"])
    })

    test("...and each optional child after it, up to the first it can't do without", () => {
      expect(expected("hello cat", "greet")).toEqual(["(and {noun})?", "please"])
    })

    test("a complete match expects nothing more", () => {
      expect(expected("hello cat please", "greet")).toEqual([])
    })

    test("words that DON'T fit expect nothing", () => {
      expect(expected("hello cow", "greet")).toEqual([])
      expect(expected("goodbye", "greet")).toEqual([])
    })

    test("what knows where it sits:  sequence + index", () => {
      const [please] = parser.expectedAfter(tokenize("hello cat and dog"), "greet", scope)
      expect(please!.rule.toRulexSyntax()).toBe("please")
      expect(please!.sequence).toBeInstanceOf(greet)
      expect(please!.index).toBe(3)
    })

    test("once one alternative matched every token, what the others wanted only continues it", () => {
      expect(expected("cat", "pet")).toEqual(["+{noun}"])
    })

    test("more of a repeat only continues it", () => {
      expect(expected("cat", "nouns")).toEqual(["+,"])
      expect(expected("cat , dog ,", "nouns")).toEqual(["+{noun}"])
    })

    test("nothing typed => the rule itself", () => {
      expect(expected("", "greet")).toEqual([parser.rules.greet!.toRulexSyntax()])
    })

    test("normal parsing is untouched:  a short line still doesn't match", () => {
      expect(parser.parse(tokenize("hello cat"), "greet", scope)).toBeUndefined()
      expect(P.Expectations.current).toBeUndefined()
    })
  })

  describe("spell", () => {
    const scope = SP.spellParser.getScope("expectedAfter")
    SP.spellParser.parse(
      [
        "set c to 1",
        "set p to 2",
        "a card is a thing",
        "a pile is a list of cards",
        "to move (a card) to (a pile): print 1"
      ].join("\n"),
      "block",
      scope
    )
    /** What a statement starting `text` needs, and what would only continue it. */
    const expected = (text: string) => {
      const all = SP.spellParser.expectedAfter(text, "statement", scope)
      return {
        needs: all.filter((it) => !it.continues),
        continues: all.filter((it) => it.continues),
        /** Needs of the statement itself, not of something inside it, e.g. an expression. */
        own: all.filter((it) => !it.continues && !it.within && it.depth === 0),
        /** What we're partway THROUGH. */
        within: all.filter((it) => it.within)
      }
    }

    test("`set y` => `to`", () => {
      expect(describeAll(expected("set y").own)).toEqual(["to"])
    })

    test("`set y to` => an expression", () => {
      expect(describeAll(expected("set y to").own)).toEqual(["{value:expression}"])
    })

    test("`a deck is a` => a type", () => {
      // once per `create_type` syntax which reads `a deck is a` -- with an outline body or without;
      // completion keeps one item per label (`SpellLanguageService.completions()`)
      expect(new Set(describeAll(expected("a deck is a").own))).toEqual(new Set(["{superType:type}"]))
    })

    test("`if c` => `then` or `:`, and operators only as continuations", () => {
      const { own, continues } = expected("if c")
      expect(describeAll(own)).toEqual(["(then|:)?"])
      expect(describeAll(continues)).toContain("+{rhsChain:expression_suffix}*")
    })

    test("`move c` => `to`, where it sits in the method's call rule", () => {
      const [to] = expected("move c").own
      expect(to!.rule.toRulexSyntax()).toBe("to")
      expect(to!.sequence!.toRulexSyntax()).toMatch(/^move \{thisArg:expression\} to \{callArgs:expression\}/)
      expect(to!.index).toBe(2)
    })

    test("partway through an argument of `move` => `within` it, where it sits in the call rule", () => {
      const inMove = expected("move c +").within.find((it) => it.sequence?.toRulexSyntax().startsWith("move "))
      expect(inMove?.index).toBe(1)
      expect(inMove?.rule.toRulexSyntax()).toBe("{thisArg:expression}")
    })

    test("a whole statement needs nothing of its own", () => {
      expect(expected("move c to p").own).toEqual([])
    })
  })

  test("quick enough for every keystroke, on every line of Solitaire", () => {
    const project = parseSpellProject(loadFixtureProject("Solitaire"))
    let calls = 0
    const start = performance.now()
    for (const file of project.files) {
      for (const line of file.contents.split("\n")) {
        const words = line.trim().split(/\s+/).filter(Boolean)
        for (let count = 1; count <= words.length; count++) {
          file.scope.parser!.expectedAfter(words.slice(0, count).join(" "), "statement", file.scope)
          calls++
        }
      }
    }
    const average = (performance.now() - start) / calls
    // ~0.2 msec each when written;  WITHOUT `Expectations.memoized()` it was ~9 msec, and over a second at worst
    expect(average).toBeLessThan(2)
    // the AVERAGE is the guard:  the whole loop takes ~1s here but over 5s on a busy CI runner
  }, 30_000)
})
