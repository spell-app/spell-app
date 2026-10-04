// Solid 2 experiment for solid-2.html -- run (from `packages/docs`):  node solid/experiments/cells-vs-notifiers.mjs [dev|prod]
// Imports @solidjs/signals by path from the repo root's node_modules, or from $SOLID_NODE_MODULES (another Solid version);  re-run on every Solid RC bump.
// Prototype:  (N) record + per-prop Solid notifier signals, derived = plain getter
//             (X) record + tiny SYNC reactive core, derived = auto-memo, bridged into Solid via enableExternalSource
// oxlint-disable no-unused-expressions -- bare reads ARE the experiment:  each runs a getter, to count recomputes
const mode = process.argv[2] ?? "prod"
const S = await import(
  `${process.env.SOLID_NODE_MODULES ?? new URL("../../../../node_modules", import.meta.url).pathname}/@solidjs/signals/dist/${mode === "dev" ? "dev.js" : "prod/index.js"}`
)
console.log("mode", mode)
const { createSignal, createMemo, createRoot, createRenderEffect, flush, getObserver, enableExternalSource, untrack } =
  S
const log = (...a) => console.log(...a)

// ---------- (N) notifier design
class NThing {
  #rec
  #n = null
  constructor(props) {
    this.#rec = Object.create(this.constructor.defaults)
    for (const k in props) this.setProp(k, props[k])
  }
  getProp(p) {
    if (getObserver()) this.#notifier(p)[0]()
    return this.#rec[p]
  }
  setProp(p, v) {
    this.#rec[p] = v
    const s = this.#n?.get(p)
    if (s) s[1]((x) => x + 1)
  }
  #notifier(p) {
    this.#n ??= new Map()
    let s = this.#n.get(p)
    if (!s) this.#n.set(p, (s = createSignal(0, { ownedWrite: true })))
    return s
  }
}
class NCard extends NThing {
  static defaults = { suit: "hearts", rank: 1 }
  get suit() {
    return this.getProp("suit")
  }
  set suit(v) {
    this.setProp("suit", v)
  }
  get rank() {
    return this.getProp("rank")
  }
  set rank(v) {
    this.setProp("rank", v)
  }
  get color() {
    return this.suit === "hearts" || this.suit === "diamonds" ? "red" : "black"
  }
  get label() {
    return this.rank + " of " + this.suit + " (" + this.color + ")"
  }
}

// ---------- (X) sync core
let collector = null // the Derived or Bridge currently computing
const link = (src) => {
  if (collector) {
    src.subs.add(collector)
    collector.srcs.add(src)
  }
}
const unlinkAll = (node) => {
  for (const s of node.srcs) s.subs.delete(node)
  node.srcs.clear()
}
const notify = (src) => {
  for (const sub of [...src.subs]) sub.stale()
}
class Cell {
  subs = new Set()
}
class Derived {
  subs = new Set()
  srcs = new Set()
  dirty = true
  value
  constructor(fn, self) {
    this.fn = fn
    this.self = self
  }
  stale() {
    if (!this.dirty) {
      this.dirty = true
      notify(this)
    }
  }
  get() {
    link(this)
    if (this.dirty) {
      unlinkAll(this)
      const prev = collector
      collector = this
      try {
        this.value = this.fn.call(this.self)
      } finally {
        collector = prev
      }
      this.dirty = false
    }
    return this.value
  }
}
enableExternalSource({
  factory(fn, trigger) {
    const node = {
      subs: null,
      srcs: new Set(),
      stale() {
        unlinkAll(node)
        trigger()
      }
    }
    return {
      track(prev) {
        unlinkAll(node)
        const p = collector
        collector = node
        try {
          return fn(prev)
        } finally {
          collector = p
        }
      },
      dispose() {
        unlinkAll(node)
      }
    }
  },
  untrack(fn) {
    const p = collector
    collector = null
    try {
      return fn()
    } finally {
      collector = p
    }
  }
})
class XThing {
  #rec
  #cells = null
  #derived = null
  constructor(props) {
    this.#rec = Object.create(this.constructor.defaults)
    for (const k in props) this.setProp(k, props[k])
  }
  getProp(p) {
    if (collector) link(this.#cell(p))
    return this.#rec[p]
  }
  setProp(p, v) {
    if (this.#rec[p] === v && Object.hasOwn(this.#rec, p)) return
    this.#rec[p] = v
    const c = this.#cells?.get(p)
    if (c) notify(c)
  }
  derive(name, fn) {
    this.#derived ??= new Map()
    let d = this.#derived.get(name)
    if (!d) this.#derived.set(name, (d = new Derived(fn, this)))
    return d.get()
  }
  #cell(p) {
    this.#cells ??= new Map()
    let c = this.#cells.get(p)
    if (!c) this.#cells.set(p, (c = new Cell()))
    return c
  }
}
let colorRuns = 0
class XCard extends XThing {
  static defaults = { suit: "hearts", rank: 1 }
  get suit() {
    return this.getProp("suit")
  }
  set suit(v) {
    this.setProp("suit", v)
  }
  get rank() {
    return this.getProp("rank")
  }
  set rank(v) {
    this.setProp("rank", v)
  }
  get color() {
    return this.derive("color", function () {
      colorRuns++
      return this.suit === "hearts" || this.suit === "diamonds" ? "red" : "black"
    })
  }
  get label() {
    return this.derive("label", function () {
      return this.rank + " of " + this.suit + " (" + this.color + ")"
    })
  }
}

// ---------- correctness
for (const [name, Card] of [
  ["N", NCard],
  ["X", XCard]
]) {
  const c = new Card({ rank: 7 })
  const drawn = []
  createRoot(() =>
    createRenderEffect(
      () => c.label,
      (v) => {
        drawn.push(v)
      }
    )
  )
  flush()
  c.suit = "spades"
  const immediate = c.label
  flush()
  log(`${name}: set->read immediate "${immediate}", DOM after flush "${drawn.at(-1)}", draws ${drawn.length}`)
}
{
  colorRuns = 0
  const c = new XCard({})
  c.color
  c.color
  c.color
  c.suit = "clubs"
  c.color
  c.color
  log("X memo: color computed", colorRuns, "times for 5 reads + 1 write (expect 2)")
}

// ---------- perf
function perf(name, Card) {
  let t = performance.now()
  const cards = []
  for (let i = 0; i < 20000; i++) cards.push(new Card({ rank: (i % 13) + 1, suit: i % 2 ? "clubs" : "hearts" }))
  const tNew = performance.now() - t
  t = performance.now()
  let n = 0
  for (let r = 0; r < 10; r++) for (const c of cards) n += c.label.length
  const tRead = performance.now() - t
  t = performance.now()
  for (const c of cards) c.rank = c.rank + 1
  const tWrite = performance.now() - t
  t = performance.now()
  for (const c of cards) n += c.label.length
  const tReread = performance.now() - t
  let dispose
  t = performance.now()
  createRoot((d) => {
    dispose = d
    for (const c of cards)
      createRenderEffect(
        () => c.label,
        () => {}
      )
  })
  flush()
  const tMount = performance.now() - t
  t = performance.now()
  for (const c of cards) c.suit = c.suit === "clubs" ? "diamonds" : "clubs"
  flush()
  const tUpdate = performance.now() - t
  dispose()
  log(
    `${name}: new 20k ${tNew.toFixed(1)}ms | 200k label reads ${tRead.toFixed(1)}ms | 20k writes ${tWrite.toFixed(1)}ms | 20k re-reads ${tReread.toFixed(1)}ms | mount 20k effects ${tMount.toFixed(1)}ms | update+flush 20k ${tUpdate.toFixed(1)}ms`
  )
}
for (let i = 0; i < 2; i++) {
  perf("N notifier+plain getters", NCard)
  perf("X sync core+memo       ", XCard)
}

// ---------- aggregate:  "the number of incomplete tasks", 1000 tasks, read 1000x with a write every 50 reads
class NTask extends NThing {
  static defaults = { done: false }
  get done() {
    return this.getProp("done")
  }
  set done(v) {
    this.setProp("done", v)
  }
}
class XTask extends XThing {
  static defaults = { done: false }
  get done() {
    return this.getProp("done")
  }
  set done(v) {
    this.setProp("done", v)
  }
}
class NTodos extends NThing {
  static defaults = {}
  constructor(tasks) {
    super({})
    this.tasks = tasks
  }
  get incomplete() {
    let n = 0
    for (const t of this.tasks) if (!t.done) n++
    return n
  }
}
class XTodos extends XThing {
  static defaults = {}
  constructor(tasks) {
    super({})
    this.tasks = tasks
  }
  get incomplete() {
    return this.derive("incomplete", function () {
      let n = 0
      for (const t of this.tasks) if (!t.done) n++
      return n
    })
  }
}
for (const [name, Todos, Task] of [
  ["N plain getter", NTodos, NTask],
  ["X memo        ", XTodos, XTask],
  ["N plain getter", NTodos, NTask],
  ["X memo        ", XTodos, XTask]
]) {
  const tasks = Array.from({ length: 1000 }, () => new Task({}))
  const todos = new Todos(tasks)
  let s = 0
  const t = performance.now()
  for (let i = 0; i < 1000; i++) {
    if (i % 50 === 0) tasks[i].done = !tasks[i].done
    s += todos.incomplete
  }
  log(`aggregate ${name}: ${(performance.now() - t).toFixed(1)} ms (sum ${s})`)
}
// X under dev:  spell write INSIDE a render effect compute (a draw that writes) -- no Solid signal written, so no owned-scope throw
{
  const c = new XCard({})
  let seen
  createRoot(() =>
    createRenderEffect(
      () => {
        c.rank = 9
        return c.label
      },
      (v) => {
        seen = v
      }
    )
  )
  flush()
  log("X dev write inside effect compute:", seen)
}
// X entanglement immunity
{
  const [a, setA] = createSignal(1)
  const rs = []
  createRoot(() => {
    const m = createMemo(() => {
      const v = a()
      return new Promise((res) => rs.push(() => res(v)))
    })
    createRenderEffect(
      () => m(),
      () => {}
    )
  })
  flush()
  rs.splice(0).forEach((r) => r())
  await new Promise((r) => setTimeout(r, 0))
  flush()
  setA(2)
  const c = new XCard({})
  c.suit = "clubs"
  log("X with queued async-feeding write, read-after-write:", c.suit, c.color)
}
