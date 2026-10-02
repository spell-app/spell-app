/**
 * HTTP-level CONTRACT tests for the app's server (`./index.ts` + `./api.ts`).
 * - Talk HTTP only:  spawn the server as a child process, never import the server framework, so the same
 *   file passes unchanged when the framework is swapped.
 * - Pins the CURRENT behaviour, quirks and all (marked `QUIRK`);  a deliberate change fails here on purpose.
 * - SIDE EFFECT: starts a server on a free port with `SPELL_PROJECTS_DIR` pointing at a temp dir, so the real
 *   `packages/spell/projects` is never written.  Deleted afterwards.
 * - Node environment (vitest's default;  this package's config sets none).
 */
import { type ChildProcess, spawn } from "node:child_process"
import fs from "node:fs"
import http from "node:http"
import net from "node:net"
import os from "node:os"
import path from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

/** Project used by every test, in the `@user:projects` root. */
const PROJECT = "@user:projects:Proj"
/** `app`'s folder:  where the server is launched from. */
const appDir = path.resolve(import.meta.dirname, "..", "..")

let server: ChildProcess
let baseUrl: string
let projectsDir: string

/** What `request()` returns. */
type Reply = { status: number; contentType: string | null; text: string; json: () => any }

/** Ask the OS for a free TCP port. */
function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = net.createServer()
    probe.once("error", reject)
    probe.listen(0, () => {
      const { port } = probe.address() as net.AddressInfo
      probe.close(() => resolve(port))
    })
  })
}

/**
 * Send one request to the server.
 * - Uses `node:http`, not `fetch`:  `fetch` (WHATWG URL) resolves `%2e%2e` segments before sending, which would
 *   hide the path-traversal cases.  `path` goes on the wire exactly as given.
 */
function request(method: string, path: string, body?: string, contentType?: string): Promise<Reply> {
  const { port } = new URL(baseUrl)
  return new Promise((resolve, reject) => {
    // `Content-Length` is explicit:  node sends a `DELETE` body unframed (no length, not chunked) otherwise
    const headers: Record<string, string> = {}
    if (contentType) headers["content-type"] = contentType
    if (body !== undefined) headers["content-length"] = String(Buffer.byteLength(body))
    const outgoing = http.request(
      { host: "localhost", port, method, path, headers },
      (incoming) => {
        let text = ""
        incoming.setEncoding("utf8")
        incoming.on("data", (chunk) => (text += chunk))
        incoming.on("end", () =>
          resolve({
            status: incoming.statusCode!,
            contentType: incoming.headers["content-type"] ?? null,
            text,
            json: () => JSON.parse(text)
          })
        )
      }
    )
    outgoing.on("error", reject)
    if (body !== undefined) outgoing.write(body)
    outgoing.end()
  })
}

/** Write `contents` at `file` (relative to the temp projects dir), making folders. */
function writeFixture(file: string, contents: string) {
  const full = path.join(projectsDir, file)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, contents)
}

/** Read a file in the temp projects dir, `undefined` if absent. */
function readFixture(file: string): string | undefined {
  const full = path.join(projectsDir, file)
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : undefined
}

beforeAll(async () => {
  projectsDir = fs.mkdtempSync(path.join(os.tmpdir(), "spell-api-test-"))
  fs.mkdirSync(path.join(projectsDir, "system"))
  fs.mkdirSync(path.join(projectsDir, "test"))
  writeFixture("user/Proj/project.json", JSON.stringify({ imports: [{ path: "/top.spell", active: true }] }))
  writeFixture("user/Proj/top.spell", "to do something\n")
  writeFixture("user/Proj/folder/sub/file.spell", "nested\n")
  writeFixture("user/Proj/Proj.compiled.js", "export default 1\n")

  const port = await freePort()
  baseUrl = `http://localhost:${port}`
  server = spawn(process.execPath, ["--import", "tsx", "src/server/index.ts"], {
    cwd: appDir,
    env: { ...process.env, PORT: String(port), SPELL_PROJECTS_DIR: projectsDir },
    stdio: "ignore"
  })
  for (let tries = 0; tries < 200; tries++) {
    try {
      await fetch(`${baseUrl}/hello`)
      return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }
  throw new Error("server did not start")
}, 60_000)

afterAll(() => {
  server?.kill()
  if (projectsDir) fs.rmSync(projectsDir, { recursive: true, force: true })
})

////////////////
// ## Liveness and canned routes
////////////////

describe("liveness and canned routes", () => {
  it("GET /hello => JSON", async () => {
    const reply = await request("GET", "/hello")
    expect(reply.status).toBe(200)
    expect(reply.contentType).toMatch(/^application\/json/)
    expect(reply.json()).toEqual({ message: "Hello from the API!" })
  })

  it("GET /api/test => 200 JSON, pretty-printed with 2 spaces", async () => {
    const reply = await request("GET", "/api/test")
    expect(reply.status).toBe(200)
    expect(reply.contentType).toMatch(/^application\/json/)
    expect(reply.text).toBe('{\n  "message": "YO!"\n}')
  })

  it("GET /api/missing => 404 with a plain string body", async () => {
    const reply = await request("GET", "/api/missing")
    expect(reply.status).toBe(404)
    // QUIRK:  `send(string)` defaults to text/html
    expect(reply.contentType).toMatch(/^text\/html/)
    expect(reply.text).toBe("Nothing to see here.")
  })

  it("GET /api/not-authorized => 403", async () => {
    const reply = await request("GET", "/api/not-authorized")
    expect(reply.status).toBe(403)
    expect(reply.contentType).toMatch(/^text\/html/)
    expect(reply.text).toBe("No can do.")
  })

  it("GET /api/error => 500", async () => {
    const reply = await request("GET", "/api/error")
    expect(reply.status).toBe(500)
    expect(reply.contentType).toMatch(/^text\/html/)
    expect(reply.text).toBe("No soup for you!")
  })

  it("unknown GET /api/nope => 404 text echoing the url (after `/api`, with query)", async () => {
    const reply = await request("GET", "/api/nope?x=1")
    expect(reply.status).toBe(404)
    expect(reply.contentType).toMatch(/^text\/html/)
    expect(reply.text).toBe("API routine not defined on server:   '/nope?x=1'")
  })

  it("unknown POST /api/nope => 404 text echoing the url", async () => {
    const reply = await request("POST", "/api/nope")
    expect(reply.status).toBe(404)
    expect(reply.text).toBe("API routine not defined on server:   '/nope'")
  })

  it("unknown DELETE /api/nope => falls through to the framework's own 404 (no catch-all for DELETE)", async () => {
    const reply = await request("DELETE", "/api/nope")
    expect(reply.status).toBe(404)
    expect(reply.text).not.toContain("API routine not defined")
  })
})

////////////////
// ## Project list and errors
////////////////

describe("projects list and sendError shape", () => {
  it("GET /api/projects/list/:domainId => JSON array of project paths", async () => {
    const reply = await request("GET", "/api/projects/list/@user:projects")
    expect(reply.status).toBe(200)
    expect(reply.contentType).toMatch(/^application\/json/)
    expect(reply.json()).toEqual([PROJECT])
  })

  it("sendError body is { errors: [{ message, trace }] } with status 500", async () => {
    const reply = await request("GET", "/api/projects/list/@bad:domain")
    expect(reply.status).toBe(500)
    expect(reply.contentType).toMatch(/^application\/json/)
    const body = reply.json()
    expect(Object.keys(body)).toEqual(["errors"])
    expect(body.errors).toHaveLength(1)
    expect(Object.keys(body.errors[0]).sort()).toEqual(["message", "trace"])
    expect(body.errors[0].message).toContain("Invalid path")
    // trace is the error's stack, leaked to the client
    expect(body.errors[0].trace).toMatch(/^TypeError: /)
  })
})

////////////////
// ## Project files:  GET / POST `:filePath*`
////////////////

describe("GET /api/projects/file/:projectId/:filePath*", () => {
  it("top-level file => 200, raw contents, content-type from the extension", async () => {
    const reply = await request("GET", `/api/projects/file/${PROJECT}/top.spell`)
    expect(reply.status).toBe(200)
    // `.spell` is unknown to the mime table
    expect(reply.contentType).toBe("application/octet-stream")
    expect(reply.text).toBe("to do something\n")
  })

  it("`.txt` file => text/plain", async () => {
    writeFixture("user/Proj/note.txt", "hello")
    const reply = await request("GET", `/api/projects/file/${PROJECT}/note.txt`)
    expect(reply.status).toBe(200)
    expect(reply.contentType).toMatch(/^text\/plain/)
    expect(reply.text).toBe("hello")
  })

  it("missing file => 404 JSON { errors: [{ message, trace }] }", async () => {
    const reply = await request("GET", `/api/projects/file/${PROJECT}/nope.spell`)
    expect(reply.status).toBe(404)
    expect(reply.contentType).toMatch(/^application\/json/)
    const body = reply.json()
    expect(body.errors).toHaveLength(1)
    expect(body.errors[0].message).toMatch(/^File not found: '.*nope\.spell'$/)
    expect(typeof body.errors[0].trace).toBe("string")
  })

  it("QUIRK:  `:filePath*` captures ONLY THE FIRST segment, so a nested file is not served", async () => {
    // express 4 (path-to-regexp 0.1) gives `filePath = "folder"` and the rest in `params[0]`, which
    // `request_getFile` ignores.  The handler serves the DIRECTORY `folder`, express's `sendFile` errors,
    // and the request falls through to the `/api` 404 catch-all.
    const reply = await request("GET", `/api/projects/file/${PROJECT}/folder/sub/file.spell`)
    expect(reply.status).toBe(404)
    expect(reply.contentType).toMatch(/^text\/html/)
    expect(reply.text).toBe(
      `API routine not defined on server:   '/projects/file/${PROJECT}/folder/sub/file.spell'`
    )
  })

  it("QUIRK:  a directory (single segment) also falls through to the catch-all 404", async () => {
    const reply = await request("GET", `/api/projects/file/${PROJECT}/folder`)
    expect(reply.status).toBe(404)
    expect(reply.text).toContain("API routine not defined on server")
  })

  it.each([
    ["encoded `..` segment", `/api/projects/file/${PROJECT}/%2e%2e`],
    ["encoded `../x`", `/api/projects/file/${PROJECT}/%2e%2e%2fx.spell`],
    ["encoded `..%2f`", `/api/projects/file/${PROJECT}/..%2fx.spell`],
    ["`..` as projectId", `/api/projects/file/%2e%2e/x.spell`]
  ])("path traversal (%s) => 500 sendError, 'Invalid path'", async (_name, url) => {
    const reply = await request("GET", url)
    expect(reply.status).toBe(500)
    expect(reply.contentType).toMatch(/^application\/json/)
    expect(reply.json().errors[0].message).toContain("Invalid path")
  })
})

describe("POST /api/projects/file/:projectId/:filePath*", () => {
  it("text/plain body => 200 `true`, file written, reads back", async () => {
    const post = await request("POST", `/api/projects/file/${PROJECT}/saved.txt`, "hi there", "text/plain")
    expect(post.status).toBe(200)
    expect(post.contentType).toMatch(/^application\/json/)
    expect(post.text).toBe("true")
    expect(readFixture("user/Proj/saved.txt")).toBe("hi there")

    const get = await request("GET", `/api/projects/file/${PROJECT}/saved.txt`)
    expect(get.status).toBe(200)
    expect(get.contentType).toMatch(/^text\/plain/)
    expect(get.text).toBe("hi there")
  })

  it("overwrites an existing file", async () => {
    await request("POST", `/api/projects/file/${PROJECT}/over.txt`, "one", "text/plain")
    await request("POST", `/api/projects/file/${PROJECT}/over.txt`, "two", "text/plain")
    expect(readFixture("user/Proj/over.txt")).toBe("two")
  })

  it("QUIRK:  nested path writes to the FIRST segment only, so a folder name => 500 EISDIR", async () => {
    const reply = await request("POST", `/api/projects/file/${PROJECT}/folder/new.txt`, "x", "text/plain")
    expect(reply.status).toBe(500)
    expect(reply.json().errors[0].message).toContain("EISDIR")
    expect(readFixture("user/Proj/folder/new.txt")).toBeUndefined()
  })

  it("JSON body => 500 (body is an object, file write wants a string)", async () => {
    const reply = await request("POST", `/api/projects/file/${PROJECT}/data.json`, '{"a":1}', "application/json")
    expect(reply.status).toBe(500)
    expect(reply.contentType).toMatch(/^application\/json/)
    expect(reply.json().errors[0].message).toContain('The "data" argument must be of type string')
    expect(readFixture("user/Proj/data.json")).toBeUndefined()
  })

  it("text body under application/json5 that is not JSON5 => 400 HTML error page", async () => {
    const reply = await request("POST", `/api/projects/file/${PROJECT}/bad.txt`, "hi there", "application/json5")
    expect(reply.status).toBe(400)
    expect(reply.contentType).toMatch(/^text\/html/)
    expect(reply.text).toContain("SyntaxError")
  })

  it("traversal in the path => 500 'Invalid path', nothing written", async () => {
    const reply = await request("POST", `/api/projects/file/${PROJECT}/%2e%2e`, "evil", "text/plain")
    expect(reply.status).toBe(500)
    expect(reply.json().errors[0].message).toContain("Invalid path")
  })
})

////////////////
// ## Body parsing:  JSON, JSON5, form, text
////////////////

describe("request body parsing on POST /api/projects/create/file", () => {
  /** A create-file body as source text, so tests can write it as JSON or JSON5. */
  const strict = (filePath: string) => JSON.stringify({ projectId: PROJECT, filePath, contents: "x" })
  const json5 = (filePath: string) => `{projectId: '${PROJECT}', filePath: "${filePath}", contents: "x",}`

  it("application/json, strict JSON => 200 ProjectIndexJSON including the new file", async () => {
    const reply = await request("POST", "/api/projects/create/file", strict("/c.spell"), "application/json")
    expect(reply.status).toBe(200)
    expect(reply.contentType).toMatch(/^application\/json/)
    const index = reply.json()
    expect(Object.keys(index).sort()).toEqual(["imports", "manifest"])
    expect(index.imports.map((item: any) => item.path)).toContain("/c.spell")
    expect(readFixture("user/Proj/c.spell")).toBe("x")
  })

  it("application/json with JSON5 syntax (unquoted keys, single quotes, trailing comma) => parsed", async () => {
    const reply = await request("POST", "/api/projects/create/file", json5("/j5-json.spell"), "application/json")
    expect(reply.status).toBe(200)
    expect(readFixture("user/Proj/j5-json.spell")).toBe("x")
  })

  it("application/json5 with JSON5 syntax => parsed", async () => {
    const reply = await request("POST", "/api/projects/create/file", json5("/j5-json5.spell"), "application/json5")
    expect(reply.status).toBe(200)
    expect(reply.json().imports.map((item: any) => item.path)).toContain("/j5-json5.spell")
    expect(readFixture("user/Proj/j5-json5.spell")).toBe("x")
  })

  it("application/x-www-form-urlencoded => parsed into body fields", async () => {
    const body = new URLSearchParams({ projectId: PROJECT, filePath: "/form.spell", contents: "x" }).toString()
    const reply = await request("POST", "/api/projects/create/file", body, "application/x-www-form-urlencoded")
    expect(reply.status).toBe(200)
    expect(readFixture("user/Proj/form.spell")).toBe("x")
  })

  it("text/plain JSON text is NOT parsed (body stays a string) => 500 from the missing projectId", async () => {
    const reply = await request("POST", "/api/projects/create/file", strict("/t.spell"), "text/plain")
    expect(reply.status).toBe(500)
    expect(reply.json().errors[0].message).toContain("Path must be a string")
    expect(readFixture("user/Proj/t.spell")).toBeUndefined()
  })

  it("traversal in the body's filePath => 500 'Invalid path'", async () => {
    const reply = await request("POST", "/api/projects/create/file", strict("/../evil.spell"), "application/json")
    expect(reply.status).toBe(500)
    expect(reply.json().errors[0].message).toContain("Invalid path")
    expect(readFixture("user/evil.spell")).toBeUndefined()
  })

  it("nested filePath in the BODY works (unlike the `:filePath*` url param)", async () => {
    const reply = await request("POST", "/api/projects/create/file", strict("/deep/er/ok.spell"), "application/json")
    expect(reply.status).toBe(200)
    expect(readFixture("user/Proj/deep/er/ok.spell")).toBe("x")
  })
})

////////////////
// ## DELETE with a body
////////////////

describe("DELETE /api/projects/remove/file", () => {
  it("JSON body is parsed on DELETE => 200 ProjectIndexJSON, file gone", async () => {
    writeFixture("user/Proj/doomed.spell", "bye")
    const body = JSON.stringify({ projectId: PROJECT, filePath: "/doomed.spell" })
    const reply = await request("DELETE", "/api/projects/remove/file", body, "application/json")
    expect(reply.status).toBe(200)
    expect(reply.contentType).toMatch(/^application\/json/)
    expect(reply.json().imports.map((item: any) => item.path)).not.toContain("/doomed.spell")
    expect(readFixture("user/Proj/doomed.spell")).toBeUndefined()
  })

  it("JSON5 body is parsed on DELETE too", async () => {
    writeFixture("user/Proj/doomed5.spell", "bye")
    const body = `{projectId: "${PROJECT}", filePath: "/doomed5.spell",}`
    const reply = await request("DELETE", "/api/projects/remove/file", body, "application/json5")
    expect(reply.status).toBe(200)
    expect(readFixture("user/Proj/doomed5.spell")).toBeUndefined()
  })

  it("missing filePath => 500 sendError", async () => {
    const reply = await request("DELETE", "/api/projects/remove/file", JSON.stringify({ projectId: PROJECT }), "application/json")
    expect(reply.status).toBe(500)
    expect(reply.json().errors[0].message).toContain("You must pass a valid filePath")
  })
})

////////////////
// ## Compiled and scopes
////////////////

describe("compiled and scopes files", () => {
  it("GET /api/projects/compiled/:projectId => 200 text/javascript, file contents", async () => {
    const reply = await request("GET", `/api/projects/compiled/${PROJECT}`)
    expect(reply.status).toBe(200)
    expect(reply.contentType).toMatch(/^text\/javascript/)
    expect(reply.text).toBe("export default 1\n")
  })

  it("GET /api/projects/scopes/:projectId => 200 text/javascript once the pack exists", async () => {
    writeFixture("user/Proj/Proj.scopes.js", "window.scopes = {}\n")
    const reply = await request("GET", `/api/projects/scopes/${PROJECT}`)
    expect(reply.status).toBe(200)
    expect(reply.contentType).toMatch(/^text\/javascript/)
    expect(reply.text).toBe("window.scopes = {}\n")
  })

  it("QUIRK:  not found => 404 with a JSON error body but a text/javascript content-type", async () => {
    const reply = await request("GET", "/api/projects/compiled/@user:projects:Nope")
    expect(reply.status).toBe(404)
    expect(reply.contentType).toMatch(/^text\/javascript/)
    const body = reply.json()
    expect(body.errors[0].message).toMatch(/^File not found: '.*Nope\.compiled\.js'$/)
    expect(typeof body.errors[0].trace).toBe("string")
  })

  it("scopes not found => same 404 shape", async () => {
    const reply = await request("GET", "/api/projects/scopes/@user:projects:Nope")
    expect(reply.status).toBe(404)
    expect(reply.contentType).toMatch(/^text\/javascript/)
    expect(reply.json().errors[0].message).toMatch(/^File not found: '.*Nope\.scopes\.js'$/)
  })
})
