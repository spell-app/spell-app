import { afterEach, describe, expect, it, vi } from "vite-plus/test"

import { SourceError } from "$/ui/runtime"

import { Sources } from "./Sources"

/** A fixture file the test server serves. */
const HELLO = "/test/fixtures/sources/hello.txt"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("Sources.resolve()", () => {
  const sources = new Sources()

  it("makes a same-origin URL absolute, against the document", () => {
    expect(sources.resolve(HELLO).href).toBe(new URL(HELLO, location.href).href)
    expect(sources.resolve("x.md", "http://" + location.host + "/a/b/").pathname).toBe("/a/b/x.md")
  })

  it("refuses another origin before fetching", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch")
    expect(() => sources.resolve("https://example.com/x.md")).toThrow(SourceError)
    try {
      sources.resolve("https://example.com/x.md")
    } catch (error) {
      expect((error as SourceError).kind).toBe("cross-origin")
    }
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

describe("Sources.load()", () => {
  it("fetches the text, with its type", async () => {
    const loaded = await new Sources().load(HELLO)
    expect(loaded.text).toBe("Hello, source!\n")
    expect(loaded.url).toBe(new URL(HELLO, location.href).href)
    expect(loaded.type).toMatch(/text\/plain/)
  })

  it("shares one fetch per URL;  `fresh` fetches again", async () => {
    const sources = new Sources()
    const fetchSpy = vi.spyOn(globalThis, "fetch")
    await Promise.all([sources.load(HELLO), sources.load(HELLO), sources.load(new URL(HELLO, location.href).href)])
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    await sources.load(HELLO, { fresh: true })
    expect(fetchSpy).toHaveBeenCalledTimes(2)
    sources.forget(HELLO)
    await sources.load(HELLO)
    expect(fetchSpy).toHaveBeenCalledTimes(3)
  })

  it("rejects a missing file with `load` and its status, and doesn't cache the failure", async () => {
    const sources = new Sources()
    const failure = await sources.load("/test/fixtures/sources/missing.txt").catch((error: unknown) => error)
    expect(failure).toBeInstanceOf(SourceError)
    expect((failure as SourceError).kind).toBe("load")
    expect((failure as SourceError).status).toBe(404)
    const fetchSpy = vi.spyOn(globalThis, "fetch")
    await sources.load("/test/fixtures/sources/missing.txt").catch(() => undefined)
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it("keeps a network failure as `cause.error`", async () => {
    const offline = new TypeError("Failed to fetch")
    vi.spyOn(globalThis, "fetch").mockRejectedValue(offline)
    const failure = (await new Sources().load(HELLO).catch((error: unknown) => error)) as SourceError
    expect(failure.kind).toBe("load")
    expect(failure.cause?.error).toBe(offline)
    expect(failure.message).toMatch(/Failed to fetch/)
  })

  it("rejects another origin with `cross-origin`, without fetching", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch")
    const failure = await new Sources().load("https://example.com/x.md").catch((error: unknown) => error)
    expect((failure as SourceError).kind).toBe("cross-origin")
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("a caller's abort rejects only its own wait", async () => {
    const sources = new Sources()
    const controller = new AbortController()
    const aborted = sources.load(HELLO, { signal: controller.signal })
    const other = sources.load(HELLO)
    controller.abort()
    await expect(aborted).rejects.toThrow()
    expect((await other).text).toBe("Hello, source!\n")
  })
})

describe("Sources.save()", () => {
  it("rejects with `no-saver` when the page registered none", async () => {
    const failure = await new Sources().save({ url: HELLO, text: "x" }).catch((error: unknown) => error)
    expect((failure as SourceError).kind).toBe("no-saver")
  })

  it("hands the saver an absolute URL and the version, then caches the saved text", async () => {
    const sources = new Sources()
    const saver = vi.fn(async () => ({ etag: '"v2"' }))
    sources.saver = saver
    const fetchSpy = vi.spyOn(globalThis, "fetch")
    const result = await sources.save({ url: HELLO, text: "New text", etag: '"v1"' })
    expect(result).toEqual({ etag: '"v2"' })
    expect(saver).toHaveBeenCalledWith({ url: new URL(HELLO, location.href).href, text: "New text", etag: '"v1"' })
    expect(await sources.load(HELLO)).toMatchObject({ text: "New text", etag: '"v2"' })
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("passes a saver's `SourceError` through;  anything else becomes `save`", async () => {
    const sources = new Sources()
    sources.saver = async () => {
      throw new SourceError("saver:  changed", { cause: { kind: "conflict", status: 409 } })
    }
    expect(((await sources.save({ url: HELLO, text: "x" }).catch((e: unknown) => e)) as SourceError).kind).toBe(
      "conflict"
    )
    const diskFull = new Error("disk full")
    sources.saver = async () => {
      throw diskFull
    }
    const failure = (await sources.save({ url: HELLO, text: "x" }).catch((e: unknown) => e)) as SourceError
    expect(failure.kind).toBe("save")
    expect(failure.message).toMatch(/disk full/)
    expect(failure.cause?.error).toBe(diskFull)
  })

  it("takes a `{ kind }`-shaped error from a saver that can't import SourceError", async () => {
    const sources = new Sources()
    sources.saver = async () => {
      throw { kind: "conflict", message: "changed on disk", status: 409 }
    }
    const failure = (await sources.save({ url: HELLO, text: "x" }).catch((e: unknown) => e)) as SourceError
    expect(failure).toBeInstanceOf(SourceError)
    expect(failure.kind).toBe("conflict")
    expect(failure.status).toBe(409)
  })

  it("a fragment save drops the cache entry instead", async () => {
    const sources = new Sources()
    sources.saver = async () => ({ etag: '"v3"' })
    await sources.load(HELLO)
    await sources.save({ url: HELLO, text: "<p>part</p>", fragment: "intro" })
    expect((await sources.load(HELLO)).text).toBe("Hello, source!\n")
  })
})
