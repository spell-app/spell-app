import { describe, expect, it } from "vitest"
import { P } from "$/parser"
import { unitTestModuleRules } from "$/parser/test"
import { rulex } from "$/parser/rulex"

describe("testing language rulex", () => {
  unitTestModuleRules(rulex, "rulex")

  describe("compile()", () => {
    it("throws when part of the syntax is left unread, naming it", () => {
      expect(() => rulex.compile("(a|b")).toThrow("rulex couldn't read `|b` in `(a|b`")
      expect(() => rulex.compile("a {b} )")).toThrow("rulex couldn't read `)`")
      expect(() => P.Rule.compileSyntax("give {thing} |")).toThrow("rulex couldn't read `|`")
    })

    it("still compiles a syntax it reads whole", () => {
      expect(rulex.compile("give {thing:expression} (to {recipient})?")).toBeInstanceOf(P.Sequence)
    })
  })
})
