// Solid 2 experiment for solid-2.html -- run (from `packages/docs`):  yarn tsx solid/experiments/decorators.ts [dev|prod]
// Strategy D:  HAND-WRITTEN spell classes (spellCore, `SP.*`, the editor) declare the same spell cells with
// standard (TC39) decorators, lowered by esbuild as `vite.decorators.ts` / `tsx` do.  Compiled spell can't:  it runs
// from a `blob:` URL with no transpile step, so it keeps emitting the lowered form (A).  Both must build the SAME
// runtime shape -- record, cells, schema, derived values.
// - `@prop({ type, default })  accessor x!: T` -- schema from decorator ARGS, not initializers
// - `@derived get y()` -- memoized with the equality cutoff, via `derive()`
// - `@thing` -- class decorator:  runs `create()` AFTER every field initializer (fixes the plain-field hazard)
// - `Symbol.metadata`:  polyfilled, so field decorators can reach their class's schema at definition time

import {
  CardA,
  RECORD,
  Schema,
  ThingA,
  createRenderEffect,
  createRoot,
  flushAll,
  log,
  PERF_HEADER,
  perf,
  type PropInfo
} from "./spell-cells.core"

;(Symbol as { metadata?: symbol }).metadata ??= Symbol("Symbol.metadata")

////////////////
// ## Decorators
////////////////

type PropOptions = PropInfo & { init?: () => unknown }
type Metadata = { props?: Record<string, PropOptions> }

/** `@prop({ type, default }) accessor name!: T` -- routes to the record through `getProp` / `setProp`. */
export function prop(options: PropOptions = {}) {
  return function <This extends ThingD, V>(
    _target: ClassAccessorDecoratorTarget<This, V>,
    context: ClassAccessorDecoratorContext<This, V>
  ): ClassAccessorDecoratorResult<This, V> {
    const name = String(context.name)
    const metadata = context.metadata as Metadata
    // NOTE:  own props object per class -- `metadata` inherits from the parent's through its prototype
    if (!Object.hasOwn(metadata, "props")) metadata.props = { ...metadata.props }
    metadata.props![name] = options
    return {
      get() {
        if (options.init && !this[RECORD].has(name)) this.setProp(name, options.init())
        return this.getProp(name)
      },
      set(value) {
        this.setProp(name, value)
      },
      init(value) {
        if (value !== undefined) log(`  warning:  @prop ${name} has an initializer -- use { default }`)
        return value
      }
    }
  }
}

/** `@derived get name()` -- memoized:  current on the next line, readers re-run only on a real change. */
export function derived<This extends ThingA, V>(
  getter: (this: This) => V,
  context: ClassGetterDecoratorContext<This, V>
) {
  const name = String(context.name)
  return function (this: This): V {
    return this.derive(name, getter as (this: ThingA) => V) as V
  }
}

/** `@thing` -- run `create()` once, after the MOST-derived class's field initializers. */
export function thing<C extends new (...args: any[]) => ThingD>(Base: C, _context: ClassDecoratorContext<C>) {
  const Wrapped = class extends Base {
    constructor(...args: any[]) {
      super(...args)
      if (new.target === Wrapped) this.create()
    }
  }
  Object.defineProperty(Wrapped, "name", { value: Base.name })
  return Wrapped
}

const SCHEMAS = new WeakMap<Function, Schema>()

/** Base for decorated Things:  its schema comes from `@prop` metadata, chained to the parent class's. */
class ThingD extends ThingA {
  static override get schema(): Schema {
    let schema = SCHEMAS.get(this)
    if (!schema) {
      const own = (this as unknown as Record<symbol, Metadata>)[Symbol.metadata]?.props ?? {}
      const parent = Object.getPrototypeOf(this)
      schema = new Schema(own, parent && parent !== ThingA ? parent.schema : undefined)
      SCHEMAS.set(this, schema)
    }
    return schema
  }
  static override set schema(_value) {}

  create() {}
}

////////////////
// ## Hand-written classes
////////////////

let colorRuns = 0

@thing
class Card extends ThingD {
  @prop({ type: "text", default: "hearts" }) accessor suit!: string
  @prop({ type: "number", default: 1 }) accessor rank!: number
  @prop({ init: () => [] }) accessor notes!: string[]
  created = "" // a PLAIN field:  safe only because `@thing` runs create() after it

  create() {
    this.created = `${this.rank} of ${this.suit}`
  }

  get color() {
    return this.suit === "hearts" || this.suit === "diamonds" ? "red" : "black"
  }

  /** Same as `color`, memoized -- the cutoff check reads this;  the benchmark reads plain `color`, as A does. */
  @derived get cachedColor() {
    colorRuns++
    return this.suit === "hearts" || this.suit === "diamonds" ? "red" : "black"
  }

  get label() {
    return `${this.rank} of ${this.suit} (${this.color})`
  }

  turnOver() {
    return this.rank
  }
}

/** What `Thing` does today:  the BASE constructor calls create() -- before any subclass field initializer runs. */
class BaseCallsCreate extends ThingD {
  constructor(props: Record<string, unknown> = {}) {
    super(props)
    this.create()
  }
}

/** A plain field + create(), WITHOUT `@thing`:  the field initializer runs last and wins. */
class Clobbered extends BaseCallsCreate {
  created = ""

  create() {
    this.created = "set in create()"
  }
}

@thing
class FaceCard extends Card {
  @prop({ type: "text" }) accessor face!: string
}

////////////////
// ## Correctness
////////////////

{
  const card = new Card({ rank: 7 })
  const drawn: string[] = []
  createRoot(() =>
    createRenderEffect(
      () => card.label,
      (value: string) => {
        drawn.push(value)
      }
    )
  )
  flushAll()
  card.suit = "spades"
  const immediate = card.label
  flushAll()
  log(`D: set->read "${immediate}", DOM after flush "${drawn.at(-1)}", draws ${drawn.length}`)
  log(`D: create() saw "${card.created}" (plain field kept, thanks to @thing);  keys ${JSON.stringify(card.keys())}`)
  card.notes.push("lucky")
  log(`D: lazy object default:  notes ${JSON.stringify(card.notes)}, per instance:  ${new Card().notes.length === 0}`)
}

log(`D: without @thing, a plain field set in create() ends up ${JSON.stringify(new Clobbered().created)} -- clobbered`)

{
  colorRuns = 0
  const card = new Card({})
  let readerRuns = 0
  createRoot(() =>
    createRenderEffect(
      () => (readerRuns++, card.cachedColor),
      () => {}
    )
  )
  flushAll()
  card.suit = "diamonds" // still red
  flushAll()
  const afterSame = readerRuns
  card.suit = "clubs"
  flushAll()
  log(`D: @derived cutoff:  reader ran ${afterSame}x after a same-color write, ${readerRuns}x after a real change`)
}

{
  const face = new FaceCard({ face: "king", rank: 13 })
  face.setProp("rank", "thirteen")
  log(
    `D: inherited schema:  FaceCard knows ${JSON.stringify(["suit", "rank", "face"].map((n) => FaceCard.schema.typeOf(n)))};  ` +
      `"thirteen" in a declared number:  ${FaceCard.schema.typeWarnings} warning`
  )
}

////////////////
// ## Performance:  decorated (D) vs hand-lowered accessors (A, what compiled spell emits)
////////////////

log(PERF_HEADER)
perf("A", CardA)
perf("D", Card as unknown as typeof CardA)
