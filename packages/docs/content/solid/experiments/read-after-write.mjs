// Solid 2 experiment for solid-2.html -- run (from `packages/docs`):  node solid/experiments/read-after-write.mjs [dev|prod]
// Imports @solidjs/signals by path from the repo root's node_modules, or from $SOLID_NODE_MODULES (another Solid version);  re-run on every Solid RC bump.
const mode = process.argv[2] ?? "dev"
const S = await import(
  `${process.env.SOLID_NODE_MODULES ?? new URL("../../../../node_modules", import.meta.url).pathname}/@solidjs/signals/dist/${mode === "dev" ? "dev.js" : "prod/index.js"}`
)
const {
  createSignal,
  createMemo,
  createRoot,
  createEffect,
  createRenderEffect,
  flush,
  latest,
  getObserver,
  untrack,
  createReaction
} = S
const log = (...a) => console.log(...a)
const tryIt = (name, fn) => {
  try {
    log(name, "=>", fn())
  } catch (e) {
    log(name, "THREW", e?.constructor?.name, String(e?.message).slice(0, 160))
  }
}
log("mode", mode)

// T1 plain read after write, top level (no owner)
{
  const [x, setX] = createSignal(1)
  setX(5)
  tryIt("T1 top-level x() after setX(5)", () => x())
  tryIt("T1 latest(x)", () => latest(x))
  flush()
  tryIt("T1 after flush", () => x())
}

// T2 memo derived, top-level
{
  const [x, setX] = createSignal(1)
  let runs = 0
  const d = createRoot(() =>
    createMemo(() => {
      runs++
      return x() * 10
    })
  )
  tryIt("T2 d() init", () => d())
  setX(2)
  tryIt("T2 d() after set, no flush", () => d())
  tryIt("T2 latest(d)", () => latest(d))
  flush()
  tryIt("T2 d() after flush", () => d())
  log("T2 runs", runs)
}

// T2b lazy memo
{
  const [x, setX] = createSignal(1)
  const d = createRoot(() => createMemo(() => x() * 10, { lazy: true }))
  setX(3)
  tryIt("T2b lazy memo first read after set", () => d())
  setX(4)
  tryIt("T2b lazy memo after second set", () => d())
}

// T2c memo outside root
tryIt("T2c memo outside root", () => {
  const [x] = createSignal(2)
  const m = createMemo(() => x() + 1)
  return m()
})

// T3 flush(fn)
{
  const [x, setX] = createSignal(1)
  const d = createRoot(() => createMemo(() => x() * 10))
  flush(() => setX(7))
  tryIt("T3 flush(fn) then d()", () => d())
}

// T4 getObserver in various places
{
  tryIt("T4 top-level getObserver", () => getObserver())
  createRoot(() => {
    tryIt("T4 root body getObserver", () => !!getObserver())
    const m = createMemo(() => !!getObserver())
    tryIt("T4 memo getObserver", () => m())
    createRenderEffect(
      () => {
        log("T4 renderEffect compute getObserver", !!getObserver())
      },
      () => {}
    )
  })
  flush()
}

// T5 write in owned scope
{
  const [x, setX] = createSignal(1)
  const [y, setY] = createSignal(1, { ownedWrite: true })
  createRoot(() => {
    const m = createMemo(() => {
      try {
        setX(2)
        return "wrote x"
      } catch (e) {
        return "x THREW " + String(e.message).slice(0, 100)
      }
    })
    tryIt("T5 plain write in memo", () => m())
    const m2 = createMemo(() => {
      try {
        setY(2)
        return "wrote y"
      } catch (e) {
        return "y THREW " + e.message
      }
    })
    tryIt("T5 ownedWrite in memo", () => m2())
  })
  flush()
  log("T5 x,y after", x(), y())
}

// T6 flush inside memo/effect
{
  const [x, setX] = createSignal(1, { ownedWrite: true })
  createRoot(() => {
    const m = createMemo(() => {
      try {
        setX(9)
        flush()
        return "flush ok, x=" + x()
      } catch (e) {
        return "flush THREW " + String(e.message).slice(0, 120)
      }
    })
    tryIt("T6 flush in memo", () => m())
  })
}

// T7 read-after-write INSIDE an event-handler-like untracked callback within root
{
  const [x, setX] = createSignal(1)
  tryIt("T7 write inside untrack in a root body", () =>
    createRoot(() =>
      untrack(() => {
        setX(8)
        return "read " + x()
      })
    )
  )
}

// T8 createReaction bridge
{
  const [x, setX] = createSignal(1)
  let fired = 0
  const track = createReaction(() => {
    fired++
  })
  track(() => x())
  setX(2)
  flush()
  log("T8 reaction fired", fired)
}
