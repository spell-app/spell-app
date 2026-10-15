//
//  ## Barrel / circular-import smoke tests for `$/parser`.
//
//  NOTE: the barrel re-exports itself as `P`, and nearly every leaf under it imports `P`
//  back out again -- so `$/parser/index.ts` sits in a cycle with ~24 of its own files.
//  Nothing catches a break here: `tsc` and the bundler both stay silent when a cycle
//  resolves to an empty namespace.  These tests enter the barrel by every route and
//  assert the bindings are actually live.
//
//  NOTE: `rulex` is OPT-IN -- `$/parser` does NOT export it.  A language that needs rulex
//  syntax does `import "$/parser/rulex"`, which registers it on `Parser.rulexParser`.
//  That took `$/parser/rulex` out of this cycle completely, so the barrel's statement
//  order no longer matters -- `export * as P from "./"` may sit anywhere in the file.
//
import { describe, expect, test, vi } from "vite-plus/test"
import { proto } from "$/util"

/** Values the barrel MUST expose -- a representative slice, not the whole surface. */
const VALUES = [
  // `./parser.types`
  "ParserError",
  "normalizeRuleTest",
  // `./tokenizer`
  "Token",
  "WordToken",
  "Tokenizer",
  // `./Match`
  "Match",
  // `./rules`
  "Rule",
  "Choice",
  "Pattern",
  "Repeat",
  "Sequence",
  "Subrule",
  // `./Parser`
  "Parser",
  // `./scope`
  "Scope",
  "BlockScope",
  "RootScope",
  "ScopeVariable",
  // `./ast`
  "ASTNode",
  "ASTExpression",
  "JSWriter",
  "jsText",
  // self-namespace
  "P"
] as const

/** Rules `rulex` defines at module scope -- the canary for the opt-in actually landing. */
const RULEX_RULES = ["matchGroup", "repeatFlag", "symbol", "keyword", "subrule", "sequence"]

/**
 * Modules which are safe to import BEFORE `$/parser`.
 * - each one still leaves the barrel fully populated
 * - see `BROKEN_ENTRIES` for the ones which don't
 */
const ENTRIES = [
  "$/parser",
  "$/parser/parser.types",
  "$/parser/Match",
  "$/parser/Parser",
  "$/parser/tokenizer/Tokens",
  "$/parser/scope/Scope",
  "$/parser/ast/AST"
]

/**
 * Modules which CORRUPT the barrel if imported before it -- known broken, pinned below
 * so the damage is recorded rather than rediscovered.
 *
 * Cause: every one of these is reached from a leaf that imports the barrel as a VALUE
 * (`import { P } from "$/parser"`), so entering here starts the `index` -> sub-barrel ->
 * leaf -> `index` cycle before the leaf's own bindings exist.  Two shapes of damage:
 * - a leaf throws outright -- entering at `$/parser/rules/Rule` re-enters `./rules/index`
 *   while `Rule.ts` is still mid-body, so `Literal extends Rule` extends `undefined`
 * - a sub-barrel silently truncates -- entering at `$/parser/scope` re-enters `./scope/index`
 *   after only `Scope` has been assigned, so the barrel never sees `BlockScope` and friends
 *
 * NOTE: `export * from` is what makes the truncation permanent.  A named re-export
 * (`export { X } from "./X"`) compiles to a LAZY getter, so the key exists on the sub-barrel
 * even while the leaf is mid-body -- but `export *` has to read the leaf's key list EAGERLY,
 * and a leaf that is mid-body still has none.  `$/parser/ast` moved here when its AST classes
 * were flattened from `export * as AST` to `export *`; `$/parser/tokenizer` was already here.
 *
 * NOTE: importing `$/parser` itself is always safe, which is why this is a latent hazard
 * rather than a live bug -- every consumer outside the barrel goes through `$/parser`.
 */
const BROKEN_ENTRIES = [
  "$/parser/rules",
  "$/parser/rules/Rule",
  "$/parser/rules/Literal",
  "$/parser/tokenizer",
  "$/parser/scope",
  "$/parser/ast"
]

/**
 * Import `$/parser` fresh, as an indexable record.
 * - pass `entryFirst` modules to import ahead of it, to vary where the cycle is entered
 * - SIDE EFFECT: resets the module registry
 */
async function freshBarrel(...entryFirst: string[]) {
  vi.resetModules()
  for (const path of entryFirst) await import(/* @vite-ignore */ path)
  return (await import("$/parser")) as Record<string, any>
}

/** Names from `VALUES` which `barrel` failed to expose, both flattened and under `P`. */
function missingFrom(barrel: Record<string, any>) {
  const missing = VALUES.filter((name) => barrel[name] === undefined)
  const underP = barrel.P ? VALUES.filter((name) => barrel.P[name] === undefined) : ["<P is not bound>"]
  return { missing, underP }
}

describe("$/parser barrel contents", () => {
  test("every expected value is live when entered via the barrel", async () => {
    expect(missingFrom(await freshBarrel())).toEqual({ missing: [], underP: [] })
  })

  test("`export * as P` hands back the same bindings as the flattened exports", async () => {
    const barrel = await freshBarrel()
    const { P } = barrel
    expect(P.Parser).toBe(barrel.Parser)
    expect(P.Rule).toBe(barrel.Rule)
    expect(P.Match).toBe(barrel.Match)
    expect(P.Scope).toBe(barrel.Scope)
  })

  test("barrel and direct-file imports resolve to one identity", async () => {
    vi.resetModules()
    const { Rule, Parser } = (await import("$/parser")) as Record<string, any>
    // Two copies of a class compare `!==` and break every `instanceof` downstream.
    expect(Rule).toBe((await import("$/parser/rules/Rule")).Rule)
    expect(Parser).toBe((await import("$/parser/Parser")).Parser)
  })

  test("classes are real constructors, not empty re-export shells", async () => {
    const { P, Rule, Parser, Match, Scope, BlockScope } = await freshBarrel()
    // `instanceof` is what silently breaks when a circular barrel hands back a different binding.
    // `Rule` is abstract, so go through a concrete subclass; `Symbol` needs no valid props here
    // because we never compile or parse it.
    expect(new P.Symbol({} as any)).toBeInstanceOf(Rule)
    expect(new Match({ rule: new P.Symbol({} as any), matched: [] } as any)).toBeInstanceOf(Match)
    expect(new BlockScope({} as any)).toBeInstanceOf(Scope)
    expect(new Parser()).toBeInstanceOf(Parser)
  })

  test("namespaced sub-barrels stay separate and populated", async () => {
    const barrel = await freshBarrel()
    const { ASTNode, ASTExpression, jsText, Token, WordToken } = barrel
    // `jsText`'s generic names (`Block`, `SPACE` ...) stay namespaced, never flattened
    expect(jsText.SPACE).toBe(" ")
    expect(typeof jsText.Block).toBe("function")
    expect("Block" in barrel).toBe(false)
    // AST nodes and tokens are NOT namespaced -- their `ASTXxx` / `XxxToken` affixes
    // keep them collision-free, so both must arrive flattened and correctly wired.
    expect(ASTExpression.prototype).toBeInstanceOf(ASTNode)
    expect(WordToken.prototype).toBeInstanceOf(Token)
  })
})

describe("rulex is opt-in", () => {
  test("`$/parser` alone does NOT install a rulex parser", async () => {
    const { Parser } = await freshBarrel()
    expect(Parser.rulexParser).toBeUndefined()
  })

  test("defining a `syntax` rule without rulex fails with a pointed error", async () => {
    // `Sequence` must come from the SAME fresh barrel as `Parser` -- a statically-imported
    // one would carry its own, possibly already-rulex-equipped, `Parser.rulexParser`.
    const { Parser, Sequence } = await freshBarrel()
    class foo extends Sequence {
      @proto static syntax = "bar"
    }
    expect(() => new Parser().addRule(foo)).toThrow(/rulex/i)
  })

  test("`import $/parser/rulex` registers a fully-ruled parser on `Parser`", async () => {
    const { Parser } = await freshBarrel()
    const { rulex } = await import("$/parser/rulex")
    expect(Parser.rulexParser).toBe(rulex)
    // Zero rules here means `addRule()` threw at module scope and got swallowed.
    expect(RULEX_RULES.filter((name) => rulex.rules[name] === undefined)).toEqual([])
  })

  test("rulex registers no matter which side is imported first", async () => {
    vi.resetModules()
    const { rulex } = await import("$/parser/rulex")
    const { Parser } = (await import("$/parser")) as Record<string, any>
    expect(Parser.rulexParser).toBe(rulex)
    expect(RULEX_RULES.filter((name) => rulex.rules[name] === undefined)).toEqual([])
  })
})

describe("$/parser barrel entry order", () => {
  test.each(ENTRIES)("importing %s first still yields a complete barrel", async (entry) => {
    expect(missingFrom(await freshBarrel(entry))).toEqual({ missing: [], underP: [] })
  })

  // NOTE: `test.fails` pins the CURRENT breakage -- see `BROKEN_ENTRIES`.  These go red once
  // the cycle is untangled, which is the signal to promote them into `ENTRIES` above.
  test.fails.each(BROKEN_ENTRIES)("importing %s first corrupts the barrel (known broken)", async (entry) => {
    expect(missingFrom(await freshBarrel(entry))).toEqual({ missing: [], underP: [] })
  })
})
