// Solid 2 experiment for solid-2.html -- run (from `packages/docs`):  node solid/experiments/flush-per-write.mjs [dev|prod]
// Imports @solidjs/signals by path from the repo root's node_modules, or from $SOLID_NODE_MODULES (another Solid version);  re-run on every Solid RC bump.
// (F) Solid-native:  one signal per prop, every spell write is flush(() => set(v)), derived = Solid createMemo per instance
// oxlint-disable no-unused-expressions -- bare reads ARE the experiment:  each runs a getter, to count recomputes
const S = await import(
  `${process.env.SOLID_NODE_MODULES ?? new URL("../../../../node_modules", import.meta.url).pathname}/@solidjs/signals/dist/prod/index.js`
)
const { createSignal, createMemo, createRoot, createRenderEffect, flush, runWithOwner } = S
const log = (...a) => console.log(...a)
class FThing {
  #sig = new Map()
  #memo = null
  constructor(props) {
    for (const k in props) this.setProp(k, props[k])
  }
  #s(p) {
    let s = this.#sig.get(p)
    if (!s) this.#sig.set(p, (s = createSignal(this.constructor.defaults[p], { ownedWrite: true })))
    return s
  }
  getProp(p) {
    return this.#s(p)[0]()
  }
  setProp(p, v) {
    const set = this.#s(p)[1]
    flush(() => set(() => v))
  }
  derive(name, fn) {
    this.#memo ??= new Map()
    let m = this.#memo.get(name)
    if (!m) this.#memo.set(name, (m = runWithOwner(null, () => createMemo(() => fn.call(this)))))
    return m()
  }
}
let colorRuns = 0
class FCard extends FThing {
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
{
  const c = new FCard({ rank: 7 })
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
  log(`F: set->read immediate "${immediate}", DOM already "${drawn.at(-1)}" (synchronously), draws ${drawn.length}`)
}
{
  colorRuns = 0
  const c = new FCard({})
  c.color
  c.color
  c.color
  c.suit = "clubs"
  c.color
  c.color
  log("F memo: color computed", colorRuns, "times for 5 reads + 1 write")
}
// write inside a memo (spell draw writing) with flush-per-write
{
  const c = new FCard({})
  const m = createRoot(() =>
    createMemo(() => {
      c.rank = 5
      return c.rank
    })
  )
  log("F write+read inside memo:", m())
}
function perf() {
  let t = performance.now()
  const cards = []
  for (let i = 0; i < 20000; i++) cards.push(new FCard({ rank: (i % 13) + 1, suit: i % 2 ? "clubs" : "hearts" }))
  const tNew = performance.now() - t
  t = performance.now()
  let n = 0
  for (let r = 0; r < 10; r++) for (const c of cards) n += c.label.length
  const tRead = performance.now() - t
  t = performance.now()
  for (const c of cards) c.rank = c.rank + 1
  const tWrite = performance.now() - t
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
    `F: new 20k ${tNew.toFixed(1)}ms | 200k label reads ${tRead.toFixed(1)}ms | 20k writes ${tWrite.toFixed(1)}ms | mount ${tMount.toFixed(1)}ms | update 20k (effects run per write) ${tUpdate.toFixed(1)}ms`
  )
}
perf()
perf()
