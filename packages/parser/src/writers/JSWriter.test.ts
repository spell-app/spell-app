import { describe, expect, test } from "vite-plus/test"

import { P } from "$/parser"

/**
 * `JSWriter` finds its methods by class NAME (`P.Writer`):  pin that every AST class finds one, so a renamed class or
 * method fails here, not in a project's compile.  Its OUTPUT is pinned by spell's rule tests and fixture snapshots.
 */

/** AST classes `JSWriter` never writes on their own:  bases, and JSX pieces written through their `output`. */
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

/** Class members, written in their class's body by `<class>AsMember()`. */
const MEMBERS = ["ASTPropertyDefinition", "ASTReactiveProperty", "ASTStaticDefinition"]

/** `JSWriter` with its method lookup open to the test. */
class ProbeWriter extends P.JSWriter {
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

describe("JSWriter", () => {
  const writer = new ProbeWriter()

  test("finds a method for every AST class it writes", () => {
    const missing = AST_CLASSES.filter(([name]) => !NEVER_WRITTEN.has(name)).filter(([, type]) => {
      try {
        writer.find(bare(type))
        return false
      } catch {
        return true
      }
    })
    expect(missing.map(([name]) => name)).toEqual([])
  })

  test("a class with no method of its own uses its nearest base class's", () => {
    expect(writer.find(bare(P.ASTCoreMethodInvocation))).toBe(P.JSWriter.prototype.ASTScopedMethodInvocation)
    expect(writer.find(bare(P.ASTParseError))).toBe(P.JSWriter.prototype.ASTParserAnnotation)
    expect(writer.find(bare(P.ASTNumericLiteral))).toBe(P.JSWriter.prototype.ASTLiteral)
  })

  test("class members are written in their class's body by `<class>AsMember()`", () => {
    for (const name of MEMBERS) {
      const type = (P as unknown as Record<string, new (...args: never[]) => P.ASTNode>)[name]!
      expect(typeof writer.find(bare(type), "AsMember")).toBe("function")
    }
  })

  test("a class nothing writes throws, naming it", () => {
    expect(() => writer.find(bare(P.ASTJSXText))).toThrow(/ASTJSXText/)
  })
})
