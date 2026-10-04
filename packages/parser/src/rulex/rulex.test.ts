import { describe, expect, it } from "vitest"
import { P } from "$/parser"
import { unitTestModuleRules } from "$/parser/test"
import { rulex } from "$/parser/rulex"

describe("testing language rulex", () => {
  unitTestModuleRules(rulex, "rulex")

  describe("compile()", () => {
    it("throws when part of the syntax is left unread, naming it", () => {
      expect(() => rulex.compile("x (a|b")).toThrow("rulex couldn't read `(a|b` in `x (a|b`")
      expect(() => rulex.compile("a {b} )")).toThrow("rulex couldn't read `)`")
      expect(() => P.Rule.compileSyntax("give {thing} |")).toThrow("rulex couldn't read `|`")
    })

    it("throws on an unescaped [ { ( that doesn't open a list / subrule / choice", () => {
      expect(() => rulex.compile("[{sub}]")).toThrow("rulex couldn't read `[{sub}]` in `[{sub}]`")
      expect(() => rulex.compile("a {b")).toThrow("rulex couldn't read `{b`")
      expect(() => rulex.compile("[{a},")).toThrow("rulex couldn't read `[{a},`")
      expect(rulex.compile("\\[ {a} \\]")).toBeInstanceOf(P.Sequence)
    })

    it("still compiles a syntax it reads whole", () => {
      expect(rulex.compile("give {thing:expression} (to {recipient})?")).toBeInstanceOf(P.Sequence)
    })
  })
})
