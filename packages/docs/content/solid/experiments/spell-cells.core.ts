// Shared core for the spell-cells experiments (solid-2.html §2) -- imported by `spell-cells.ts` and `decorators.ts`.
// - cells, derived values with an equality cutoff, the `enableExternalSource` bridge, `flushAll()`
// - property types (`Schema`), the accessor strategy (A:  `ThingA`, `CardA`) and the benchmark row (`perf`)
// Imports @solidjs/signals by path from the repo root's node_modules:  `[dev|prod]` from the running script's argv.

export const mode = process.argv[2] ?? "prod"
export const S = await import(
  `${process.env.SOLID_NODE_MODULES ?? new URL("../../../../node_modules", import.meta.url).pathname}/@solidjs/signals/dist/${mode === "dev" ? "dev.js" : "prod/index.js"}`
)
export const { createRoot, createRenderEffect, flush, enableExternalSource } = S
export const log = console.log

////////////////
// ## Core:  cells, derived values, the Solid bridge
//    Push-pull with an equality cutoff:  a write marks direct readers DIRTY and everything further down CHECK;
//    a CHECK reader re-validates by pulling its derived sources, and only re-runs if one REALLY changed.
////////////////

export const CLEAN = 0
export const CHECK = 1
export const DIRTY = 2
export type State = typeof CLEAN | typeof CHECK | typeof DIRTY

/** Anything a computation can read:  a cell or a derived value.  `version` bumps on every REAL change. */
export type Source = { subs: Set<Observer>; version: number }

/** Anything that reads sources:  a derived value, or a Solid computation (via the bridge). */
export type Observer = { srcs: Map<Source, number>; mark(state: State): void }

export let collector: Observer | null = null

/** Subscribe the current collector to `src`, remembering the version it saw. */
export function link(src: Source) {
  if (!collector) return
  src.subs.add(collector)
  collector.srcs.set(src, src.version)
}

export function unlinkAll(observer: Observer) {
  for (const src of observer.srcs.keys()) src.subs.delete(observer)
  observer.srcs.clear()
}

/** Run `fn` with `observer` collecting what it reads. */
export function track<T>(observer: Observer, fn: () => T): T {
  unlinkAll(observer)
  const outer = collector
  collector = observer
  try {
    return fn()
  } finally {
    collector = outer
  }
}

/** Did any source change since `observer` read it?  Refreshes derived sources first (the "pull"). */
export function sourcesChanged(observer: Observer): boolean {
  for (const [src, seen] of observer.srcs) {
    if (src instanceof Derived) src.refresh()
    if (src.version !== seen) return true
  }
  return false
}

export class Cell implements Source {
  subs = new Set<Observer>()
  version = 0

  /** Call ONLY for a real change -- `setProp` already skips `===` writes. */
  changed() {
    this.version++
    for (const sub of [...this.subs]) sub.mark(DIRTY)
  }
}

export class Derived<T> implements Source, Observer {
  subs = new Set<Observer>()
  srcs = new Map<Source, number>()
  version = 0
  state: State = DIRTY
  value!: T

  constructor(
    private fn: (this: unknown) => T,
    private self: unknown
  ) {}

  mark(state: State) {
    if (this.state >= state) return
    const wasClean = this.state === CLEAN
    this.state = state
    if (wasClean) for (const sub of [...this.subs]) sub.mark(CHECK)
  }

  /** Bring `value` up to date;  bump `version` only if the new value differs. */
  refresh() {
    if (this.state === CHECK) this.state = sourcesChanged(this) ? DIRTY : CLEAN
    if (this.state !== DIRTY) return
    const next = track(this, () => this.fn.call(this.self))
    this.state = CLEAN
    if (this.version === 0 || next !== this.value) {
      this.value = next
      this.version++
    }
  }

  get(): T {
    this.refresh()
    link(this)
    return this.value
  }
}

/** One per Solid computation that reads spell state. */
export class BridgeNode implements Observer {
  srcs = new Map<Source, number>()

  constructor(private trigger: () => void) {}

  mark(state: State) {
    if (state === DIRTY) this.trigger() // a cell it read directly changed:  a real change
    else scheduleCheck(this) // only derived values it read MAY have changed
  }

  check() {
    if (sourcesChanged(this)) this.trigger()
  }
}

export const pendingChecks = new Set<BridgeNode>()
export let checkScheduled = false

export function scheduleCheck(node: BridgeNode) {
  pendingChecks.add(node)
  if (checkScheduled) return
  checkScheduled = true
  queueMicrotask(runChecks)
}

export function runChecks() {
  checkScheduled = false
  const nodes = [...pendingChecks]
  pendingChecks.clear()
  for (const node of nodes) node.check()
}

/** Spell's `flush()`:  settle pending derived checks, THEN Solid's queue.  Tests and imperative code call this. */
export function flushAll() {
  runChecks()
  flush()
}

enableExternalSource({
  factory(fn: (prev: unknown) => unknown, trigger: () => void) {
    const node = new BridgeNode(trigger)
    return {
      track: (prev: unknown) => track(node, () => fn(prev)),
      dispose() {
        unlinkAll(node)
        pendingChecks.delete(node)
      }
    }
  },
  untrack<T>(fn: () => T): T {
    const outer = collector
    collector = null
    try {
      return fn()
    } finally {
      collector = outer
    }
  }
})

////////////////
// ## Property types
////////////////

/** Spell's name for a value's type:  `number`, `text`, `yes/no`, `list`, a Thing class name, ... */
export function spellTypeOf(value: unknown): string {
  if (value === null || value === undefined) return "nothing"
  switch (typeof value) {
    case "number":
      return "number"
    case "string":
      return "text"
    case "boolean":
      return "yes/no"
    case "function":
      return "action"
  }
  if (Array.isArray(value)) return "list"
  return (value as object).constructor?.name ?? "object"
}

export type PropInfo = { type?: string; default?: unknown }

/** Per-class schema:  declared props (from the parser) + types observed for undeclared ones. */
export class Schema {
  observed = new Map<string, Set<string>>()
  typeWarnings = 0

  constructor(
    public declared: Record<string, PropInfo>,
    public parent?: Schema
  ) {}

  /** NOTE:  own keys only -- `{}["constructor"]` is inherited, and a proxy asks about EVERY key. */
  info(name: string): PropInfo | undefined {
    return Object.hasOwn(this.declared, name) ? this.declared[name] : this.parent?.info(name)
  }

  /** Check `value` against the declared type, else widen the observed type set.  Warn, never throw. */
  checkType(name: string, value: unknown) {
    if (value === undefined) return
    const type = spellTypeOf(value)
    const declared = this.info(name)?.type
    if (declared) {
      if (declared !== type) this.typeWarnings++
      return
    }
    let seen = this.observed.get(name)
    if (!seen) this.observed.set(name, (seen = new Set()))
    if (seen.size && !seen.has(type)) this.typeWarnings++
    seen.add(type)
  }

  typeOf(name: string): string {
    return this.info(name)?.type ?? ([...(this.observed.get(name) ?? [])].join(" | ") || "unknown")
  }
}

////////////////
// ## Strategy A:  accessors on the prototype, record in a `Map`
////////////////

export const RECORD = Symbol("record")
export const CELLS = Symbol("cells")
export const KEYS = Symbol("keys")
export const DERIVED = Symbol("derived")

export class ThingA {
  static schema = new Schema({});
  [RECORD] = new Map<string, unknown>();
  [CELLS]: Map<string, Cell> | null = null;
  [KEYS]: Cell | null = null;
  [DERIVED]: Map<string, Derived<unknown>> | null = null

  constructor(props: Record<string, unknown> = {}) {
    for (const key in props) this.setProp(key, props[key])
  }

  getProp<T>(name: string): T {
    if (collector) link(cellFor(this, name))
    const record = this[RECORD]
    if (record.has(name)) return record.get(name) as T
    return (this.constructor as typeof ThingA).schema.info(name)?.default as T
  }

  setProp(name: string, value: unknown) {
    const record = this[RECORD]
    if (value === undefined) return this.deleteProp(name)
    const added = !record.has(name)
    if (!added && record.get(name) === value) return
    ;(this.constructor as typeof ThingA).schema.checkType(name, value)
    record.set(name, value)
    notifyProp(this, name, added)
  }

  deleteProp(name: string) {
    if (!this[RECORD].delete(name)) return
    notifyProp(this, name, true)
  }

  /** Own keys in creation order.  Tracks the key SET only:  an overwrite doesn't re-run a reader. */
  keys(): string[] {
    if (collector) link((this[KEYS] ??= new Cell()))
    return [...this[RECORD].keys()]
  }

  derive<T>(name: string, fn: (this: this) => T): T {
    const derived = (this[DERIVED] ??= new Map())
    let d = derived.get(name)
    if (!d) derived.set(name, (d = new Derived(fn, this)))
    return d.get() as T
  }
}

export function cellFor(thing: ThingA, name: string): Cell {
  const cells = (thing[CELLS] ??= new Map())
  let cell = cells.get(name)
  if (!cell) cells.set(name, (cell = new Cell()))
  return cell
}

export function notifyProp(thing: ThingA, name: string, keysChanged: boolean) {
  thing[CELLS]?.get(name)?.changed()
  if (keysChanged) thing[KEYS]?.changed()
}

export class CardA extends ThingA {
  static schema = new Schema({ suit: { type: "text", default: "hearts" }, rank: { type: "number", default: 1 } })

  get suit(): string {
    return this.getProp("suit")
  }
  set suit(value: string) {
    this.setProp("suit", value)
  }
  get rank(): number {
    return this.getProp("rank")
  }
  set rank(value: number) {
    this.setProp("rank", value)
  }
  get color() {
    return this.suit === "hearts" || this.suit === "diamonds" ? "red" : "black"
  }
  get label() {
    return `${this.rank} of ${this.suit} (${this.color})`
  }
  /** Same as `color`, memoized -- the equality-cutoff test reads this. */
  get cachedColor() {
    return this.derive("cachedColor", function () {
      return this.suit === "hearts" || this.suit === "diamonds" ? "red" : "black"
    })
  }
  turnOver() {
    return this.rank
  }
}

////////////////
// ## Benchmark
////////////////

/** One benchmark row:  construct, read, call, write, derived read, mount effects, update.  Same columns for every strategy. */
export const PERF_HEADER =
  "\n       |   new  | 200k rd | 200k fn | 20k wr | 200k lbl | mount | update   (ms, median of runs)"

/** Median per column over `runs` benchmark rows -- single runs are too noisy to quote. */
export function perf(name: string, Card: new (props?: Record<string, unknown>) => CardA, runs = 9) {
  const rows = Array.from({ length: runs }, () => perfRow(Card))
  const medians = rows[0].map((_, col) => rows.map((row) => row[col]).sort((a, b) => a - b)[Math.floor(runs / 2)])
  log(`${name.padEnd(6)} | ${medians.map((ms) => ms.toFixed(1).padStart(6)).join(" | ")}`)
}

function perfRow(Card: new (props?: Record<string, unknown>) => CardA): number[] {
  let t = performance.now()
  const cards: CardA[] = []
  for (let i = 0; i < 20_000; i++) cards.push(new Card({ rank: (i % 13) + 1, suit: i % 2 ? "clubs" : "hearts" }))
  const tNew = performance.now() - t

  t = performance.now()
  let n = 0
  for (let r = 0; r < 10; r++) for (const card of cards) n += card.rank
  const tRead = performance.now() - t

  t = performance.now()
  for (let r = 0; r < 10; r++) for (const card of cards) n += card.turnOver()
  const tMethod = performance.now() - t

  t = performance.now()
  for (const card of cards) card.rank = card.rank + 1
  const tWrite = performance.now() - t

  t = performance.now()
  for (let r = 0; r < 10; r++) for (const card of cards) n += card.label.length
  const tLabel = performance.now() - t

  let dispose!: () => void
  t = performance.now()
  createRoot((d: () => void) => {
    dispose = d
    for (const card of cards)
      createRenderEffect(
        () => card.label,
        () => {}
      )
  })
  flushAll()
  const tMount = performance.now() - t

  t = performance.now()
  for (const card of cards) card.suit = card.suit === "clubs" ? "diamonds" : "clubs"
  flushAll()
  const tUpdate = performance.now() - t
  dispose()

  if (n < 0) log(n) // keep `n` live so the loops aren't optimized away
  return [tNew, tRead, tMethod, tWrite, tLabel, tMount, tUpdate]
}
