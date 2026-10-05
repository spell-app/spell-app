/**
 * Property types:  a schema per class, saying what each property holds.
 * - DECLARED props:  compiled spell's `static { this.declareProp("suit", { type: "text" }) }`, or a hand-written
 *   class's `@prop({ type: "text" })` -- both land HERE, the same runtime shape (`guides/solid/solid-2.md`).
 *   Declared types win.
 * - UNDECLARED props, e.g. a hand-written class's bare `setProp("contents", ...)`:  their types are OBSERVED, per
 *   class, and WIDENED on a mismatch (`number | text`) with a dev warning -- never thrown.  `nothing` never counts;
 *   an object counts by its class, compared with `instanceof` (a `UIError` where an `Error` was is no widening).
 */

////////////////
// ## `Symbol.metadata`
////////////////

/**
 * `Symbol.metadata`, polyfilled:  `@prop` keeps its options in its class's decorator metadata.
 * - `Symbol.for()`:  esbuild's lowered decorators fall back to `Symbol.for("Symbol.metadata")` when it's missing,
 *   so the polyfill and their output agree whichever loads first.
 * - SIDE EFFECT:  defines `Symbol.metadata` where the engine has none.
 */
;(Symbol as { metadata?: symbol }).metadata ??= Symbol.for("Symbol.metadata")

/** `Symbol.metadata`, now it surely exists. */
const METADATA = (Symbol as unknown as { metadata: symbol }).metadata

////////////////
// ## Schema
////////////////

/** Key of a class's OWN schema, on the class itself -- see `schemaOf()`. */
const SCHEMA = Symbol("schema")

/**
 * One class's property types:  declared ones, plus types observed for undeclared ones.  See the header.
 * - Chained to its parent class's:  a subclass knows what its superclasses declared.
 */
export class Schema {
  /** Props this class declares itself, by name. */
  declared = new Map<string, PropInfo>()
  /** Types seen in each undeclared prop of this class:  type names, or classes for objects. */
  observed = new Map<string, Array<string | Function>>()

  /** - `parent` is the schema of the class this one's class extends, if that's an `Observable` too. */
  constructor(public parent?: Schema) {}

  /** What `name` is declared as, here or up the chain -- `undefined` if it's undeclared. */
  info(name: string): PropInfo | undefined {
    return this.declared.get(name) ?? this.parent?.info(name)
  }

  /**
   * `name` was just set to `value`:  `name`'s declaration, if it declares a type or legal values, for its class to
   * check `value` against -- else observe `value`'s type, widening it with a dev warning if it's new.
   * - `nothing` (`undefined`, `null`) never counts.
   */
  observe(name: string, value: unknown, owner: string): PropInfo | undefined {
    const info = this.info(name)
    if (info && (info.type || info.oneOf)) return info
    if (value === undefined || value === null) return undefined
    let seen = this.observed.get(name)
    if (!seen) this.observed.set(name, (seen = []))
    if (seen.some((type) => (typeof type === "function" ? value instanceof type : type === spellTypeOf(value)))) {
      return undefined
    }
    const type = typeof value === "object" ? ((value as object).constructor ?? "object") : spellTypeOf(value)
    if (seen.length) warnInDev(`${owner}.${name}:  was ${typeNames(seen)}, now also ${typeName(type)}`)
    seen.push(type)
    return undefined
  }

  /** `name`'s type as a person would say it, e.g. `text`, `number | text` -- `unknown` if never set. */
  typeOf(name: string): string {
    const declared = this.info(name)?.type
    if (declared) return declared
    const seen = this.observedOf(name)
    return seen?.length ? typeNames(seen) : "unknown"
  }

  /** Types observed for `name`, here or up the chain. */
  private observedOf(name: string): Array<string | Function> | undefined {
    return this.observed.get(name) ?? this.parent?.observedOf(name)
  }
}

/**
 * `Class`'s OWN schema, made on first use and kept on the class.
 * - Starts with what `@prop` declared on it (its decorator metadata), chained to its parent class's schema.
 * - NOTE: `Object.hasOwn()`, NOT `in`:  a subclass would otherwise share its parent's.
 */
export function schemaOf(Class: Function): Schema {
  const holder = Class as unknown as Record<symbol, Schema | undefined>
  if (Object.hasOwn(Class, SCHEMA)) return holder[SCHEMA]!
  const Parent = Object.getPrototypeOf(Class) as Function | null
  const schema = new Schema(Parent && Parent !== Function.prototype && hasSchema(Parent) ? schemaOf(Parent) : undefined)
  for (const [name, info] of decoratedProps(Class)) schema.declared.set(name, info)
  Object.defineProperty(Class, SCHEMA, { value: schema })
  return schema
}

/**
 * Declare prop `name` of `Class`:  its type, default, legal values -- see `PropInfo`.
 * - What compiled spell calls, as `static { this.declareProp(...) }` in its class, or `Card.declareProp(...)` after it.
 * - Same runtime shape as `@prop(info)`:  both end up in `schemaOf(Class)`.
 */
export function declareProp(Class: Function, name: string, info: PropInfo): void {
  schemaOf(Class).declared.set(name, info)
}

/**
 * Record `@prop(info)` for prop `name` in its class's decorator `metadata` -- read by `schemaOf()`.
 * - NOTE: each class gets its OWN `props` map:  `metadata` inherits from its parent class's through its prototype.
 */
export function declareInMetadata(metadata: DecoratorMetadataObject, name: string, info: PropInfo): void {
  const holder = metadata as { [PROPS]?: Map<string, PropInfo> }
  if (!Object.hasOwn(holder, PROPS)) holder[PROPS] = new Map()
  holder[PROPS]!.set(name, info)
}

/**
 * Spell's name for `value`'s type:  `number`, `text`, `choice`, `list`, `action`, a class name, or `nothing`.
 * - The runtime's names, as `spellCore.typeOf()` gives them (`choice`, not `boolean`).
 */
export function spellTypeOf(value: unknown): string {
  if (value === null || value === undefined) return "nothing"
  switch (typeof value) {
    case "number":
      return "number"
    case "string":
      return "text"
    case "boolean":
      return "choice"
    case "function":
      return "action"
  }
  if (Array.isArray(value)) return "list"
  return (value as object).constructor?.name ?? "object"
}

/**
 * What a schema knows about a prop.
 * - Compiled spell declares `type` / `oneOf` (what its setter warns about) and `init`;  hand-written classes may use
 *   any of them through `@prop`.
 */
export type PropInfo = {
  /** Declared type, as the runtime names it, e.g. `text`, `number`, `choice`, `Card`. */
  type?: string
  /** Legal values, e.g. `Card.Suits`. */
  oneOf?: readonly unknown[]
  /** Its value while unset -- NOT stored, so it isn't one of `keys()`.  Primitives only:  objects use `init`. */
  default?: unknown
  /**
   * Makes its value on first read, once per instance, e.g. `() => new List()` -- stored, so it's one of `keys()`.
   * - Called with `this` ~== the instance.
   */
  init?: (this: any) => unknown
}

////////////////
// ## Helpers
////////////////

/** Key of `@prop`'s declarations in a class's decorator metadata. */
const PROPS = Symbol("props")

/** Does `Class` (or a superclass) have a schema to chain to:  is it below `Observable`?  Marked by `Observable`. */
function hasSchema(Class: Function): boolean {
  return (Class as { [HAS_SCHEMA]?: boolean })[HAS_SCHEMA] === true
}

/**
 * Marks a class whose instances keep a schema -- `Observable` sets it, statically, so every subclass inherits it.
 * - Exported for `Observable` only.
 */
export const HAS_SCHEMA = Symbol("hasSchema")

/** What `@prop` declared on `Class` ITSELF -- not inherited from its parent's metadata. */
function decoratedProps(Class: Function): Map<string, PropInfo> {
  const metadata = (Class as unknown as Record<symbol, Record<symbol, unknown> | undefined>)[METADATA]
  if (!metadata || !Object.hasOwn(metadata, PROPS)) return new Map()
  const Parent = Object.getPrototypeOf(Class) as Record<symbol, unknown> | null
  // a class without decorators of its own sees its parent's metadata as a static:  not its own
  if (Parent && Parent[METADATA] === metadata) return new Map()
  return metadata[PROPS] as Map<string, PropInfo>
}

/** `seen` as a person would say it, e.g. `number | text`. */
function typeNames(seen: Array<string | Function>): string {
  return seen.map(typeName).join(" | ")
}

/** A type name, or a class's name. */
function typeName(type: string | Function): string {
  return typeof type === "function" ? type.name || "object" : type
}

/**
 * `console.warn()`, in development only.
 * - NEVER `process.env.NODE_ENV`:  `vite.config.ts` replaces `process.env` with `{}` in the browser.
 */
function warnInDev(message: string): void {
  if (import.meta.env?.PROD) return
  console.warn(`spell property type widened:  ${message}`)
}
