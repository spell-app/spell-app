import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test"

import { after, afterSolidUpdate, beforeNextPaint, every, soon, type CancelablePromise } from "$/ui/util"

beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
})

describe("afterSolidUpdate()", () => {
  test("runs once the current code finishes, BEFORE any timer", async () => {
    const order: string[] = []
    soon(() => order.push("soon"))
    afterSolidUpdate(() => order.push("afterSolidUpdate"))
    expect(order).toEqual([])
    await Promise.resolve()
    expect(order).toEqual(["afterSolidUpdate"])
    await vi.advanceTimersByTimeAsync(0)
    expect(order).toEqual(["afterSolidUpdate", "soon"])
  })
})

describe("beforeNextPaint()", () => {
  test("runs on the next animation frame, with its timestamp", () => {
    const fn = vi.fn()
    beforeNextPaint(fn)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersToNextFrame()
    expect(fn).toHaveBeenCalledOnce()
    expect(fn.mock.calls[0]![0]).toBeTypeOf("number")
  })

  test("its cancel function stops it", () => {
    const fn = vi.fn()
    const cancel = beforeNextPaint(fn)
    cancel()
    vi.advanceTimersToNextFrame()
    expect(fn).not.toHaveBeenCalled()
  })
})

describe("soon()", () => {
  test("runs in the next task, not now", () => {
    const fn = vi.fn()
    soon(fn)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(0)
    expect(fn).toHaveBeenCalledOnce()
  })

  test("its cancel function stops it", () => {
    const fn = vi.fn()
    const cancel = soon(fn)
    cancel()
    vi.advanceTimersByTime(10)
    expect(fn).not.toHaveBeenCalled()
  })
})

describe("after()", () => {
  test("runs `fn` once, after SECONDS, and resolves with its result", async () => {
    const fn = vi.fn(() => "done")
    const timer = after(0.25, fn)
    await vi.advanceTimersByTimeAsync(249)
    expect(fn).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(fn).toHaveBeenCalledOnce()
    await expect(timer).resolves.toBe("done")
  })

  test("without `fn`, just waits:  `await after(1)`", async () => {
    let isDone = false
    void after(1).then(() => (isDone = true))
    await vi.advanceTimersByTimeAsync(999)
    expect(isDone).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect(isDone).toBe(true)
  })

  test("rejects with what `fn` throws", async () => {
    const timer = after(0.1, () => {
      throw new TypeError("bad")
    })
    const settled = expect(timer).rejects.toThrow("bad")
    await vi.advanceTimersByTimeAsync(100)
    await settled
  })

  test("`cancel()` stops `fn` and REJECTS with an AbortError, so an await never hangs", async () => {
    const fn = vi.fn()
    const timer = after(1, fn)
    timer.cancel()
    await expect(timer).rejects.toMatchObject({ name: "AbortError" })
    await vi.advanceTimersByTimeAsync(2000)
    expect(fn).not.toHaveBeenCalled()
  })

  test("a canceled timer nobody awaits reports NO unhandled rejection", async () => {
    const onUnhandled = vi.fn()
    window.addEventListener("unhandledrejection", onUnhandled)
    after(1, vi.fn()).cancel()
    vi.useRealTimers()
    await new Promise((resolve) => setTimeout(resolve, 10))
    window.removeEventListener("unhandledrejection", onUnhandled)
    expect(onUnhandled).not.toHaveBeenCalled()
  })

  test("`cancel()` does nothing once `fn` has started:  `fn` may cancel its own timer", async () => {
    const timer: CancelablePromise<string> = after(0.1, () => {
      timer.cancel()
      return "kept"
    })
    await vi.advanceTimersByTimeAsync(100)
    await expect(timer).resolves.toBe("kept")
  })
})

describe("every()", () => {
  test("runs every SECONDS until its stop function is called", () => {
    const fn = vi.fn()
    const stop = every(0.5, fn)
    vi.advanceTimersByTime(499)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1001)
    expect(fn).toHaveBeenCalledTimes(3)
    stop()
    vi.advanceTimersByTime(5000)
    expect(fn).toHaveBeenCalledTimes(3)
  })
})
