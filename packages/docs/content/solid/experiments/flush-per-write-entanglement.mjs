// Solid 2 experiment for solid-2.html -- run (from `packages/docs`):  node solid/experiments/flush-per-write-entanglement.mjs [dev|prod]
// Imports @solidjs/signals by path from the repo root's node_modules, or from $SOLID_NODE_MODULES (another Solid version);  re-run on every Solid RC bump.
const S = await import(
  `${process.env.SOLID_NODE_MODULES ?? new URL("../../../../node_modules", import.meta.url).pathname}/@solidjs/signals/dist/prod/index.js`
)
const { createSignal, createMemo, createRoot, createRenderEffect, flush, isPending } = S
const log = (...a) => console.log(...a)
const tick = () => new Promise((r) => setTimeout(r, 0))
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
await tick()
flush()
// app event handler queues a write feeding async (not flushed yet), then spell code runs a flush-per-write
setA(2)
const [b, setB] = createSignal(1)
flush(() => setB(2))
log("F entangled? b after flush(()=>setB(2)) with queued async-feeding write:", b())
const [c, setC] = createSignal(1)
flush(() => setC(2))
log("F next spell write c:", c())
rs.splice(0).forEach((r) => r())
await tick()
flush()
log("after resolve b", b(), "c", c())
