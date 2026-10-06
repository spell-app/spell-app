import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"

import { ApiError } from "$/ui/runtime"

import { Api } from "./Api"

describe("Api.url()", () => {
  const api = new Api()

  it("fills required {name} slots, encoded", () => {
    expect(api.url("/users/{id}/posts/{slug}", { id: 7, slug: "a b/c" })).toBe("/users/7/posts/a%20b%2Fc")
  })

  it("throws on a missing required slot", () => {
    expect(() => api.url("/users/{id}", {})).toThrow(TypeError)
    expect(() => api.url("/users/{id}", {})).toThrow(
      "Api.url():  no value for {id} in /users/{id};  pass it in the URL data"
    )
  })

  it("fills or removes optional {/name} slots with their slash", () => {
    expect(api.url("/search/{query}/{/page}", { query: "x", page: 2 })).toBe("/search/x/2")
    expect(api.url("/search/{query}/{/page}", { query: "x" })).toBe("/search/x")
    expect(api.url("/users{/id}", { id: 5 })).toBe("/users/5")
    expect(api.url("/users{/id}")).toBe("/users")
  })
})

describe("Api.request()", () => {
  const api = new Api()
  let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>(async (_input, init) => {
      if (init?.signal?.aborted) throw init.signal.reason
      return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } })
    })
    vi.stubGlobal("fetch", fetchMock)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it("GETs a templated URL with data as query parameters and parses JSON", async () => {
    const result = await api.request({
      url: "/api/{kind}",
      urlData: { kind: "users" },
      data: { q: "ann", tag: ["a", "b"] }
    })
    expect(result).toEqual({ ok: true })
    expect(fetchMock.mock.calls[0]![0]).toBe("/api/users?q=ann&tag=a&tag=b")
  })

  it("POSTs plain objects as JSON", async () => {
    await api.request({ url: "/api", method: "POST", data: { name: "x" } })
    const init = fetchMock.mock.calls[0]![1]!
    expect(init.body).toBe(`{"name":"x"}`)
    expect(new Headers(init.headers).get("Content-Type")).toBe("application/json")
  })

  it("rejects non-2xx responses with ApiError", async () => {
    fetchMock.mockResolvedValueOnce(new Response("nope", { status: 404, statusText: "Not Found" }))
    const error = await api.request({ url: "/missing" }).catch((caught: unknown) => caught)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(404)
  })

  it("throttles:  a newer request with the same key supersedes a waiting one", async () => {
    vi.useFakeTimers()
    const first = api.request({ url: "/search/{q}", urlData: { q: "a" }, throttle: 100 })
    const firstResult = first.catch((error: unknown) => error)
    await vi.advanceTimersByTimeAsync(50)
    const second = api.request({ url: "/search/{q}", urlData: { q: "ab" }, throttle: 100 })
    await vi.advanceTimersByTimeAsync(99)
    expect(fetchMock).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    await expect(second).resolves.toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock.mock.calls[0]![0]).toBe("/search/ab")
    expect((await firstResult) as DOMException).toMatchObject({ name: "AbortError" })
  })

  it("honours the caller's AbortSignal", async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(api.request({ url: "/x", signal: controller.signal })).rejects.toMatchObject({ name: "AbortError" })
  })
})
