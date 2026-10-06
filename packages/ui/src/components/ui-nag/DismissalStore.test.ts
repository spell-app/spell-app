import { afterEach, describe, expect, onTestFinished, test, vi } from "vite-plus/test"

import { DismissalStore, type DismissalStoreProps } from "./DismissalStore"

/** The item / cookie name every test stores under. */
const KEY = "dismissal-store-test"

/** The expiry item `local` storage keeps beside it. */
const EXPIRY_KEY = `${KEY}ExpirationDate`

/** A fixed "now" for the expiry tests. */
const START_TIME = new Date("2026-01-01T12:00:00Z")

/** Two days after `START_TIME`:  past a one-day dismissal. */
const TWO_DAYS_LATER = new Date(START_TIME.getTime() + 2 * 864e5)

afterEach(() => {
  for (const store of [localStorage, sessionStorage]) {
    store.removeItem(KEY)
    store.removeItem(EXPIRY_KEY)
  }
  document.cookie = `${KEY}=; expires=${new Date(0).toUTCString()}; path=/`
})

describe("DismissalStore.isDismissed()", () => {
  test.each(["local", "session", "cookie"] as const)(
    "is false until `dismiss()`, true after;  `clear()` forgets it (%s)",
    (storage) => {
      const store = dismissals({ storage })
      expect(store.isDismissed()).toBe(false)
      expect(store.dismiss()).toBe(true)
      expect(store.isDismissed()).toBe(true)
      store.clear()
      expect(store.isDismissed()).toBe(false)
    }
  )

  test("counts ONLY its own value", () => {
    localStorage.setItem(KEY, "other")
    expect(dismissals({ value: "seen" }).isDismissed()).toBe(false)
  })

  test("drops a `local` dismissal once it has expired", () => {
    vi.useFakeTimers({ toFake: ["Date"] })
    onTestFinished(() => {
      vi.useRealTimers()
    })
    vi.setSystemTime(START_TIME)
    const store = dismissals({ expires: 1 })
    store.dismiss()
    expect(store.isDismissed()).toBe(true)
    vi.setSystemTime(TWO_DAYS_LATER)
    expect(store.isDismissed()).toBe(false)
    expect([localStorage.getItem(KEY), localStorage.getItem(EXPIRY_KEY)]).toEqual([null, null])
  })

  test("reads a blocked storage (a throwing `localStorage`) as not dismissed;  `dismiss()` says it refused", () => {
    const descriptor =
      Object.getOwnPropertyDescriptor(window, "localStorage") ??
      Object.getOwnPropertyDescriptor(Window.prototype, "localStorage")!
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("blocked", "SecurityError")
      }
    })
    // restored before `afterEach`, which reads `localStorage`
    try {
      const store = dismissals()
      expect(store.isDismissed()).toBe(false)
      expect(store.dismiss()).toBe(false)
      expect(() => store.clear()).not.toThrow()
    } finally {
      Object.defineProperty(window, "localStorage", descriptor)
    }
  })
})

describe("DismissalStore.dismiss()", () => {
  test("keeps a `local` dismissal's expiry beside it;  none for `expires: 0`", () => {
    vi.useFakeTimers({ toFake: ["Date"] })
    onTestFinished(() => {
      vi.useRealTimers()
    })
    vi.setSystemTime(START_TIME)
    dismissals({ expires: 1 }).dismiss()
    expect(localStorage.getItem(EXPIRY_KEY)).toBe(new Date(START_TIME.getTime() + 864e5).toUTCString())
    localStorage.removeItem(EXPIRY_KEY)
    dismissals({ expires: 0 }).dismiss()
    expect(localStorage.getItem(EXPIRY_KEY)).toBeNull()
  })

  test("writes the cookie as `key=value`", () => {
    dismissals({ storage: "cookie", cookie: { sameSite: "lax" } }).dismiss()
    expect(document.cookie.split("; ")).toContain(`${KEY}=dismiss`)
  })
})

/** A store under `KEY`:  `local`, value `dismiss`, a day long, unless `props` says otherwise. */
function dismissals(props: Partial<DismissalStoreProps> = {}): DismissalStore {
  return new DismissalStore({ storage: "local", key: KEY, value: "dismiss", expires: 1, ...props })
}
