import JSON5 from "json5"
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test"

import { SRV } from "$/server"
import { ask, serveHandler, type Served } from "$/server/test/serve"

describe("compilePattern()", () => {
  it("matches `:name` to one segment, decoded", () => {
    const match = SRV.compilePattern("/projects/list/:domainId")
    expect(match("/projects/list/%40user%3Aprojects")).toEqual({ domainId: "@user:projects" })
    expect(match("/projects/list/a/b")).toBeUndefined()
    expect(match("/Projects/List/x/")).toEqual({ domainId: "x" })
  })

  it("matches `:name*` to the whole rest, `/`s included", () => {
    const match = SRV.compilePattern("/projects/file/:projectId/:filePath*")
    expect(match("/projects/file/P/folder/sub/file.spell")).toEqual({
      projectId: "P",
      filePath: "folder/sub/file.spell"
    })
    expect(match("/projects/file/P")).toBeUndefined()
  })

  it("matches `*` to anything, in params 0", () => {
    expect(SRV.compilePattern("*")("/a/b?")).toEqual({ "0": "/a/b?" })
    expect(SRV.compilePattern("/files/*")("/files/a/b")).toEqual({ "0": "a/b" })
    expect(SRV.compilePattern("/files/*")("/files")).toEqual({ "0": "" })
  })

  it("throws a 400 on bad encoding", () => {
    expect(() => SRV.compilePattern("/:x")("/%E0%A4%A")).toThrow(SRV.HttpError)
  })
})

describe("Router", () => {
  let served: Served
  const order: string[] = []

  beforeAll(async () => {
    const api = new SRV.Router()
    api.use((request, _reply, next) => {
      order.push(`api ${request.url} ${request.baseUrl}`)
      next()
    })
    api.get("/hello/:name", (request, reply) => reply.json({ hi: request.params.name, query: request.query }))
    api.post("/echo", (request, reply) => reply.json({ body: request.body, type: typeof request.body }))
    api.delete("/echo", (request, reply) => reply.json({ deleted: request.body }))
    api.get("/file/:projectId/:filePath*", (request, reply) => reply.send(request.params))
    api.get("/boom", () => {
      throw new Error("boom")
    })
    api.get("/async-boom", async () => {
      throw new SRV.HttpError(418, "teapot")
    })
    api.get("/text", (_request, reply) => reply.status(404).send("Nothing to see here."))
    api.get("*", (request, reply) => reply.status(404).send(`not defined:  '${request.url}'`))

    const root = new SRV.Router()
    root.use(SRV.parseBodies({ limit: 64, parseJson: JSON5.parse }))
    root.get("/top", (_request, reply) => reply.send("top"))
    root.use("/api", api)
    served = await serveHandler(root.handle)
  })

  afterAll(() => served.close())

  it("routes by method and path, with params and query", async () => {
    const answer = await ask(served.port, "GET", "/api/hello/Ann?x=1&x=2&y=3")
    expect(answer.status).toBe(200)
    expect(JSON.parse(answer.text)).toEqual({ hi: "Ann", query: { x: ["1", "2"], y: "3" } })
    expect(order.at(-1)).toBe("api /hello/Ann?x=1&x=2&y=3 /api")
  })

  it("answers HEAD from GET routes, without a body", async () => {
    const answer = await ask(served.port, "HEAD", "/top")
    expect(answer.status).toBe(200)
    expect(answer.text).toBe("")
    expect(answer.headers["content-length"]).toBe("3")
  })

  it("restores url and baseUrl after a mounted router passes", async () => {
    expect((await ask(served.port, "GET", "/top")).text).toBe("top")
  })

  it("gives `:name*` the whole rest", async () => {
    const answer = await ask(served.port, "GET", "/api/file/P/a/b/c.spell")
    expect(JSON.parse(answer.text)).toEqual({ projectId: "P", filePath: "a/b/c.spell" })
  })

  it("sends strings as text/html, as Express", async () => {
    const answer = await ask(served.port, "GET", "/api/text")
    expect(answer.status).toBe(404)
    expect(answer.headers["content-type"]).toBe("text/html; charset=utf-8")
    expect(answer.text).toBe("Nothing to see here.")
  })

  it("falls to a `*` route with the mount-relative url", async () => {
    const answer = await ask(served.port, "GET", "/api/nope?x=1")
    expect(answer.text).toBe("not defined:  '/nope?x=1'")
  })

  it("answers 404 text when nothing matches", async () => {
    const answer = await ask(served.port, "PUT", "/nowhere")
    expect(answer.status).toBe(404)
    expect(answer.text).toBe("Not found:  /nowhere\n")
  })

  it("answers a throw with 500 JSON, an HttpError with its status", async () => {
    const boom = await ask(served.port, "GET", "/api/boom")
    expect(boom.status).toBe(500)
    expect(JSON.parse(boom.text)).toEqual({ error: "boom" })
    const teapot = await ask(served.port, "GET", "/api/async-boom")
    expect(teapot.status).toBe(418)
    expect(JSON.parse(teapot.text)).toEqual({ error: "teapot" })
  })

  describe("bodies", () => {
    it.each([
      ["application/json", `{"a":1}`, { a: 1 }],
      ["application/json", `{a: 1, b: 'two',}`, { a: 1, b: "two" }],
      ["application/json5", `{a: 1}`, { a: 1 }],
      ["application/x-www-form-urlencoded", "a=1&a=2&b=3", { a: ["1", "2"], b: "3" }],
      ["text/plain; charset=utf-8", "just text", "just text"]
    ])("parses %s", async (type, body, expected) => {
      const answer = await ask(served.port, "POST", "/api/echo", { body, headers: { "content-type": type } })
      expect(JSON.parse(answer.text).body).toEqual(expected)
    })

    it("leaves `{}` with no body, or an unknown type", async () => {
      expect(JSON.parse((await ask(served.port, "POST", "/api/echo")).text).body).toEqual({})
      const other = await ask(served.port, "POST", "/api/echo", {
        body: "xx",
        headers: { "content-type": "application/octet-stream" }
      })
      expect(JSON.parse(other.text).body).toEqual({})
    })

    it("reads a body once, however many parsers run", async () => {
      const twice = new SRV.Router().use(SRV.parseBodies(), SRV.parseBodies())
      twice.post("/x", (request, reply) => reply.json(request.body))
      const again = await serveHandler(twice.handle)
      const answer = await ask(again.port, "POST", "/x", {
        body: `{"a":1}`,
        headers: { "content-type": "application/json" }
      })
      expect(JSON.parse(answer.text)).toEqual({ a: 1 })
      await again.close()
    })

    it("parses DELETE bodies too", async () => {
      const answer = await ask(served.port, "DELETE", "/api/echo", {
        body: `{filePath: "x"}`,
        headers: { "content-type": "application/json" }
      })
      expect(JSON.parse(answer.text)).toEqual({ deleted: { filePath: "x" } })
    })

    it("refuses bad JSON with 400, and big bodies with 413", async () => {
      const bad = await ask(served.port, "POST", "/api/echo", {
        body: "{nope",
        headers: { "content-type": "application/json" }
      })
      expect(bad.status).toBe(400)
      const big = await ask(served.port, "POST", "/api/echo", {
        body: "x".repeat(100),
        headers: { "content-type": "text/plain" }
      })
      expect(big.status).toBe(413)
    })
  })
})
