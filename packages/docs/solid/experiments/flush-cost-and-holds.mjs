// Solid 2 experiment for solid-2.html -- run (from `packages/docs`):  node solid/experiments/flush-cost-and-holds.mjs [dev|prod]
// Imports @solidjs/signals by path from the repo root's node_modules, or from $SOLID_NODE_MODULES (another Solid version);  re-run on every Solid RC bump.
const mode = process.argv[2] ?? "prod"
const S = await import(
  `${process.env.SOLID_NODE_MODULES ?? new URL("../../../../node_modules", import.meta.url).pathname}/@solidjs/signals/dist/${mode === "dev" ? "dev.js" : "prod/index.js"}`
)
const {
  createSignal,
  createMemo,
  createRoot,
  createRenderEffect,
  createEffect,
  flush,
  isPending,
  latest,
  getObserver
} = S
const log = (...a) => console.log(...a)

// A) read-after-write inside flush(fn)
{
  const [x, setX] = createSignal(1)
  flush(() => {
    setX(2)
    log("A inside flush(fn) read", x())
  })
  log("A after", x())
}

// B) cost: flush per write vs batched.  N things x 3 props, each prop has a render effect (a "text node")
function bench(label, perWriteFlush, N = 2000, W = 20000) {
  const sigs = []
  let effectRuns = 0
  createRoot(() => {
    for (let i = 0; i < N; i++) {
      const [g, s] = createSignal(0, { ownedWrite: true })
      sigs.push(s)
      createRenderEffect(
        () => g(),
        (v) => {
          effectRuns++
        }
      )
    }
  })
  flush()
  effectRuns = 0
  const t = performance.now()
  for (let w = 0; w < W; w++) {
    const s = sigs[w % N]
    if (perWriteFlush) flush(() => s(w))
    else s(w)
  }
  if (!perWriteFlush) flush()
  const ms = performance.now() - t
  log(`B ${label}: ${W} writes over ${N} signals: ${ms.toFixed(1)} ms, effect runs ${effectRuns}`)
}
bench("batched", false)
bench("flush-per-write", true)
// plain object write baseline
{
  const rec = {}
  const t = performance.now()
  for (let w = 0; w < 20000; w++) rec["p" + (w % 2000)] = w
  log(`B plain record: ${(performance.now() - t).toFixed(2)} ms`)
}

// C) async hold: does a pending async memo hold unrelated writes / entangled writes?
{
  const [a, setA] = createSignal(1)
  const [b, setB] = createSignal(1)
  let resolve
  const r = createRoot(() => {
    const m = createMemo(() => {
      const v = a()
      return new Promise((res) => {
        resolve = () => res(v * 100)
      })
    })
    createRenderEffect(
      () => m(),
      () => {}
    )
    return m
  })
  flush()
  resolve?.()
  await new Promise((r) => setTimeout(r, 0))
  flush()
  setA(2)
  setB(2)
  flush()
  log(
    "C after setA/setB + flush while async pending:  a()",
    a(),
    " b()",
    b(),
    " isPending(a)",
    isPending(a),
    " latest(a)",
    latest(a)
  )
  resolve()
  await new Promise((r) => setTimeout(r, 0))
  flush()
  log(
    "C after resolve: a()",
    a(),
    " m()",
    (() => {
      try {
        return r()
      } catch (e) {
        return e.constructor.name
      }
    })()
  )
}
