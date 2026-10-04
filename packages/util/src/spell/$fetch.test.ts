import { describe, test, expect } from "vite-plus/test"
import { merge$fetchParms } from "./$fetch"

describe("merge$fetchParms()", () => {
  test("merges headers across params, field-by-field", () => {
    const result = merge$fetchParms({ headers: { Accept: "text/plain" } }, { headers: { "X-Foo": "bar" } })
    expect(result.headers).toEqual({ Accept: "text/plain", "X-Foo": "bar" })
  })

  test("later value wins per key when headers collide", () => {
    const result = merge$fetchParms(
      { headers: { "Content-Type": "text/plain" } },
      { headers: { "Content-Type": "application/json" } }
    )
    expect(result.headers).toEqual({ "Content-Type": "application/json" })
  })

  test("does not mutate or alias caller's original header objects", () => {
    const first = { Accept: "text/plain" }
    const second = { "X-Foo": "bar" }
    const result = merge$fetchParms({ headers: first }, { headers: second })
    expect(result.headers).not.toBe(first)
    expect(result.headers).not.toBe(second)
    expect(first).toEqual({ Accept: "text/plain" })
    expect(second).toEqual({ "X-Foo": "bar" })
  })

  test("replaces non-object values with the later entry, rather than merging", () => {
    const result = merge$fetchParms({ method: "GET", url: "/a" }, { method: "POST" })
    expect(result.method).toBe("POST")
    expect(result.url).toBe("/a")
  })

  test("tolerates undefined and missing params entries", () => {
    const result = merge$fetchParms({ url: "/a", headers: undefined }, undefined as any, {
      headers: { "X-Foo": "bar" }
    })
    expect(result.url).toBe("/a")
    expect(result.headers).toEqual({ "X-Foo": "bar" })
  })

  test("later falsy/undefined value does not clobber an earlier object value", () => {
    const result = merge$fetchParms({ headers: { Accept: "text/plain" } }, { headers: undefined })
    expect(result.headers).toEqual({ Accept: "text/plain" })
  })
})
