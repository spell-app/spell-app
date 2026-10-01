// Solid 2 experiment for solid-2.html -- run (from `packages/docs`):  node solid/experiments/entanglement.mjs [dev|prod]
// Imports @solidjs/signals by path from the repo root's node_modules, or from $SOLID_NODE_MODULES (another Solid version);  re-run on every Solid RC bump.
const S = await import(
  `${process.env.SOLID_NODE_MODULES ?? new URL("../../../../node_modules", import.meta.url).pathname}/@solidjs/signals/dist/prod/index.js`
)
const { createSignal, createMemo, createRoot, createRenderEffect, flush, isPending, latest } = S
const log = (...a) => console.log(...a)
const tick = () => new Promise((r) => setTimeout(r, 0))
function setup() {
  const [a, setA] = createSignal(1)
  const resolvers = []
  const m = createRoot(() => {
    const m = createMemo(() => {
      const v = a()
      return new Promise((res) => resolvers.push(() => res(v * 100)))
    })
    createRenderEffect(
      () => m(),
      () => {}
    )
    return m
  })
  return {
    a,
    setA,
    m,
    resolveAll: () => {
      resolvers.splice(0).forEach((r) => r())
    }
  }
}

{
  const { a, setA, resolveAll } = setup()
  flush()
  resolveAll()
  await tick()
  flush()
  const [b, setB] = createSignal(1)
  setA(2)
  flush()
  setB(2)
  flush()
  log("C2 separate batches: a", a(), "b", b())
  const [c, setC] = createSignal(1)
  setC(3)
  log("C2 new signal c written, no flush:", c())
  flush()
  log("C2 c after flush:", c())
  resolveAll()
  await tick()
  flush()
  log("C2 after resolve: a", a(), "b", b())
}

// C3 derived memo of b while held
{
  const { setA, resolveAll } = setup()
  flush()
  resolveAll()
  await tick()
  flush()
  const [b, setB] = createSignal(1)
  const db = createRoot(() => createMemo(() => b() * 2))
  setA(2)
  setB(5)
  flush()
  log("C3 same batch: b", b(), "db", db())
  resolveAll()
  await tick()
  flush()
  log("C3 after resolve: b", b(), "db", db())
}
