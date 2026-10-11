/**
 * The core's method list:  what every core must have, so another target's core can check itself against it.
 * - Written to `spellCore.declarations.json`, at the package's root, by `yarn gen:declarations`
 *   (`writeCoreDeclarations.ts`).
 *   - `coreDeclarations.test.ts` fails when that file and the core differ.
 *   - Python's core reads it in a test, to find what it hasn't ported yet (`py/tests/test_core_declarations.py`).
 * - In the format projects write their own declarations in (`<Project>.declarations.json`),
 *   see `SP.SpellDeclarationsData`, with one key more, `module`:  the core's file that has it.
 * - Read from the core itself, as it runs:  each module's methods object, so nothing is listed by hand.
 *   - Parameters by name, from each function's own source:  `getItemAt(collection, position, startAt)`.
 * - Left out:
 *   - `deprecated.ts`:  old names, for programs compiled before they changed.  A new core has none.
 *   - members starting with `_`, e.g. `_randomKeyOf()`:  the core's own helpers, which compiled code never calls.
 *   - the decorators only compiled TypeScript imports (`prop`, `derived`, `drawn` ...).
 * - Imports the barrel and each module's methods:  NOT in the barrel itself, so no runtime bundle carries it.
 */
import { App, Drawable, DrawableList, h, List, off, on, once, positionOf, spellCore, Thing, trigger } from "$/core"
import { coreMethods } from "./core"
import { collectionCoreMethods } from "./collection-core"
import { collectionOtherMethods } from "./collection-other"
import { stringMethods } from "./string"
import { uiMethods } from "./ui"
import { drawingMethods } from "./drawing"
import { elementsMethods } from "./elements"
import { pathMethods } from "./paths"
import { testMethods } from "./tests"
import { consoleMethods } from "./console"
import { runtimeMethods } from "./runtime"
import { thingsMethods } from "./things"
import { jsonMethods } from "./json"
import { classesMethods } from "./classes"
import { deprecatedMethods } from "./deprecated"

/**
 * Each part of `spellCore`, by the file it's in (under `src/`):
 * every module `SC.SpellCore` is made from, except `deprecated`.
 */
const CORE_MODULES: Record<string, object> = {
  core: coreMethods,
  "collection-core": collectionCoreMethods,
  "collection-other": collectionOtherMethods,
  string: stringMethods,
  ui: uiMethods,
  drawing: drawingMethods,
  elements: elementsMethods,
  paths: pathMethods,
  tests: testMethods,
  console: consoleMethods,
  runtime: runtimeMethods,
  things: thingsMethods,
  json: jsonMethods,
  classes: classesMethods
}

/**
 * What compiled code imports from `@spell/core` by name, besides `spellCore`, by the file each is in:
 * `import { spellCore, Thing, List, h, trigger } from "@spell/core"`.
 */
const CORE_EXPORTS: Record<string, { value: unknown; module: string }> = {
  Thing: { value: Thing, module: "classes/Thing" },
  List: { value: List, module: "classes/List" },
  App: { value: App, module: "classes/App" },
  Drawable: { value: Drawable, module: "classes/Drawable" },
  DrawableList: { value: DrawableList, module: "classes/DrawableList" },
  h: { value: h, module: "drawing" },
  positionOf: { value: positionOf, module: "collection-core" },
  on: { value: on, module: "runtime" },
  off: { value: off, module: "runtime" },
  once: { value: once, module: "runtime" },
  trigger: { value: trigger, module: "runtime" }
}

/** The name compiled code calls the core by:  `spellCore.getItemAt(...)`. */
const SPELL_CORE = "spellCore"

/**
 * The core's method list, as `spellCore.declarations.json` holds it.
 * - `provides`:  what compiled code imports by name, `spellCore` first.
 * - `statements`:  one per member of `spellCore`, by module, in the order each module lists them;
 *   then one per name in `provides` after `spellCore`.
 * - NEVER throws.
 */
export function coreDeclarations(): CoreDeclarationsData {
  const statements: CoreDeclaration[] = []
  for (const [module, methods] of Object.entries(CORE_MODULES)) {
    for (const [name, value] of Object.entries(methods)) {
      if (name.startsWith("_")) continue
      statements.push(memberDeclaration(name, value, module))
    }
  }
  for (const [name, { value, module }] of Object.entries(CORE_EXPORTS)) {
    statements.push(exportDeclaration(name, value, module))
  }
  return { provides: [SPELL_CORE, ...Object.keys(CORE_EXPORTS)], statements }
}

/**
 * Names on the running `spellCore` that the method list must NOT have:
 * the old names `deprecated.ts` keeps, and the core's own `_` helpers.
 * - So a test can check every other name is listed:  a module added to `SC.SpellCore`
 *   but not to `CORE_MODULES` fails it.
 */
export function unlistedCoreNames(): string[] {
  return Object.keys(spellCore).filter((name) => name.startsWith("_") || Object.hasOwn(deprecatedMethods, name))
}

/** One member of `spellCore`:  a method with its parameters, or a property. */
function memberDeclaration(name: string, value: unknown, module: string): CoreDeclaration {
  if (typeof value !== "function") return { property: name, of: SPELL_CORE, module }
  return withParams({ kind: "method", name, of: SPELL_CORE, module }, value as AnyFunction)
}

/** One name compiled code imports:  a class, as a type, or a function. */
function exportDeclaration(name: string, value: unknown, module: string): CoreDeclaration {
  if (isClass(value)) {
    const superType = Object.getPrototypeOf(value) as { name?: string }
    const isProvided = superType.name !== undefined && CORE_EXPORTS[superType.name]?.value === superType
    return { type: name, ...(isProvided && { superType: superType.name }), module }
  }
  return withParams({ kind: "function", name, module }, value as AnyFunction)
}

/** `declaration`, with `method`'s parameters, by name -- when it has any. */
function withParams(declaration: CoreDeclaration, method: AnyFunction): CoreDeclaration {
  const params = paramNamesOf(method)
  return params.length ? { ...declaration, params: params.map((param) => ({ name: param })) } : declaration
}

/** Is `value` a class, rather than a function?  Its source starts `class`. */
function isClass(value: unknown): value is AnyFunction {
  return typeof value === "function" && /^class\b/.test(Function.prototype.toString.call(value))
}

/**
 * The names of `method`'s parameters, from its source:
 * `getItemAt(collection, position, startAt = 1)` => `["collection", "position", "startAt"]`.
 * - A rest parameter keeps its dots, as javascript writes it:  `...things`.
 * - A destructured one has no name:  `options`.
 * - Defaults are dropped, with everything nested in them, e.g. `units = "seconds"`.
 */
export function paramNamesOf(method: AnyFunction): string[] {
  const source = Function.prototype.toString.call(method)
  // NOTE: misses an arrow function's bare parameter, `card => ...`:  the formatter always writes `(card) => ...`
  const open = source.indexOf("(")
  if (open < 0) return []

  const params: string[] = []
  let depth = 0
  let quote = ""
  let current = ""
  for (let index = open + 1; index < source.length; index++) {
    const char = source[index]!
    if (quote) {
      if (char === "\\") index++
      else if (char === quote) quote = ""
      if (depth === 0) current += char
      continue
    }
    if (char === '"' || char === "'" || char === "`") quote = char
    else if ("([{".includes(char)) depth++
    else if (")]}".includes(char)) {
      if (depth === 0) break
      depth--
    } else if (char === "," && depth === 0) {
      params.push(current)
      current = ""
      continue
    }
    current += char
  }
  params.push(current)
  return params.map(paramName).filter((name) => name !== "")
}

/** One parameter's name, from its source:  `startAt = 1` => `startAt`, `{ capture }` => `options`. */
function paramName(source: string): string {
  const [declared = ""] = source.split("=", 1)
  const name = declared.trim()
  return /^[[{]/.test(name) ? DESTRUCTURED_PARAM : name
}

/** What a destructured parameter is called, having no name of its own. */
const DESTRUCTURED_PARAM = "options"

/** Any function or class, whose source we read. */
type AnyFunction = (...args: never[]) => unknown

/**
 * What `spellCore.declarations.json` holds:  `SP.SpellDeclarationsData`'s shape, without its versions.
 * - The core can't import the language's `SPELL_VERSION`, and no project imports this file.
 */
export type CoreDeclarationsData = {
  /** What compiled code imports from `@spell/core` by name, `spellCore` first. */
  provides: string[]
  /** One per member of `spellCore`, then one per other name in `provides`. */
  statements: CoreDeclaration[]
}

/**
 * One of the core's names, as a project's declarations write one (`SP.SpellDeclaration`).
 * - A method of `spellCore`:  `{ kind: "method", name: "getItemAt", of: "spellCore", params: [...] }`
 * - A property of `spellCore`:  `{ property: "console", of: "spellCore" }`
 * - A class compiled code imports:  `{ type: "App", superType: "Thing" }`
 * - A function compiled code imports:  `{ kind: "function", name: "trigger", params: [...] }`
 */
export type CoreDeclaration = {
  /** a class's name, e.g. `List` */
  type?: string
  /** the class it extends, when compiled code imports that too, e.g. `Thing` */
  superType?: string
  /** a property's name, e.g. `console` */
  property?: string
  /** `method` or `function` */
  kind?: string
  /** a method's or function's name, e.g. `getItemAt` */
  name?: string
  /** what it's a member of:  `spellCore` */
  of?: string
  /** its parameters, by name, in order */
  params?: Array<{ name: string }>
  /** the core's file it's in, under `src/` without `.ts`, e.g. `collection-core` */
  module: string
}
