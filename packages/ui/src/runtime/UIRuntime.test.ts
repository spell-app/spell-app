import { describe, expect, it } from "vite-plus/test"

import { RUNTIME_KEY, UI, loadUI, type RuntimeGlobal } from "$/ui/runtime"

import { Modals } from "./Modals"
import { Toasts } from "./Toasts"
import { UIRuntime } from "./UIRuntime"

////////////////
// ## The instance
////////////////

describe("UIRuntime.instance", () => {
  it("is one instance per page, stored on globalThis", () => {
    expect(UIRuntime.instance).toBe(UIRuntime.instance)
    expect((globalThis as RuntimeGlobal)[RUNTIME_KEY]).toBe(UIRuntime.instance)
  })

  it("a second copy of the module (duplicate bundle) shares the instance", async () => {
    // a query string makes Vite evaluate the module again:  a distinct `UIRuntime` class, as a second bundle has
    const path = "./UIRuntime.ts?duplicate-bundle"
    const duplicate = (await import(/* @vite-ignore */ path)) as { UIRuntime: typeof UIRuntime }
    expect(duplicate.UIRuntime).not.toBe(UIRuntime)
    expect(duplicate.UIRuntime.instance).toBe(UIRuntime.instance)
  })
})

describe("UIRuntime.load()", () => {
  it("load() / UI.load() / UIRuntime.load() resolve with the instance", async () => {
    const [a, b, c] = await Promise.all([loadUI(), UI.load(), UIRuntime.load()])
    expect(a).toBe(UIRuntime.instance)
    expect(b).toBe(a)
    expect(c).toBe(a)
  })

  // TODO: assert the runtime is a separate chunk in `dist/` (a node-side check after `yarn build`).
  //  Browser-mode tests can't read `dist/`, and `src/index.ts` doesn't import the runtime yet, so the
  //  library build has nothing to split.  Verified by hand with a scratch build of `src/runtime/index.ts`.
  it.todo("code-splits the runtime into its own chunk")
})

////////////////
// ## Services
////////////////

describe("UI.keyboard / version / i18n", () => {
  it("UI forwards to the instance's services", async () => {
    const runtime = await UI.load()
    expect(UI.keyboard).toBe(runtime.keyboard)
    expect(UI.version).toBe(runtime.version)
    expect("overlays" in UI).toBe(true)
    expect(UI.i18n.t("ok")).toBe("OK")
    expect(runtime.version).toMatch(/^\d+\.\d+\.\d+/)
  })
})

describe("UIRuntime.toast() / modals", () => {
  it("toasts and modals throw until their component registers a provider", async () => {
    const runtime = await UI.load()
    expect(() => runtime.toast({ message: "hi" })).toThrow(/ui-toast not registered/)
    expect(() => runtime.modals.confirm("sure?")).toThrow(/ui-modal not registered/)
    Modals.provider = {
      confirm: async ({ message }) => message === "sure?",
      alert: async () => {},
      prompt: async ({ value }) => value
    }
    Toasts.provider = { show: ({ id = "t1" }) => ({ id, closed: Promise.resolve() }), dismiss: () => {} }
    try {
      await expect(runtime.modals.confirm("sure?")).resolves.toBe(true)
      expect(runtime.toast({ message: "hi" }).id).toBe("t1")
    } finally {
      Modals.provider = undefined
      Toasts.provider = undefined
    }
  })
})
