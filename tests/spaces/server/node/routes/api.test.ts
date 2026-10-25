/**
 * HTTP-level CONTRACT tests for the app's server (`cli.ts` + `api.ts`, in spaces' `src/server/node/routes/`).
 * - Talk HTTP only:  spawn the server as a child process, never import the server framework,
 *   so the same file passes unchanged when the framework is swapped.
 * - Pins the behaviour, quirks and all (marked `QUIRK`);  a deliberate change fails here on purpose.
 * - Written against Express, kept for `spell/server`'s `SRV.Router` (unified-server P6).
 * - What changed ON PURPOSE is marked `CHANGED`:
 *   - nested `:filePath*` paths work
 *   - an unknown DELETE gets the API's 404
 *   - a `.spell` file is text
 *   - a bad body is JSON, not an HTML error page
 * - Files are named by URL, as spell names them (`SP.SpellUrls`, epic `people-and-orgs` P15):
 *   - read at `/spaces/<project>/<file>`
 *   - saved by `POST /api/projects/file/<project>/<file>`
 * - SIDE EFFECT:  starts a server on a free port, its folders in a temporary folder, deleted afterwards:
 *   so the repo and your spell-spaces are never written.
 *   - `SPELL_SPACES_DIR`, `SPELL_BUILTINS_DIR`, `SPELL_BUILD_DIR`
 * - Node environment (spaces' `vitest.config.ts`).
 */
import { type ChildProcess, spawn } from "node:child_process"
import fs from "node:fs"
import http from "node:http"
import net from "node:net"
import os from "node:os"
import path from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test"

/** Project used by every test, in the `owen@spell` group. */
const PROJECT = "owen@spell/Proj"
/** Its place:  your space (`SPACES.LOCAL_PERSON`), then its name. */
const PLACE = "owen@spell/Proj"
/** Where its files are read:  `/spaces/<project>/<file>`. */
const FILES = `/spaces/${PLACE}/`
/** Where its files are saved:  `/api/projects/file/<project>/<file>`. */
const SAVE = `/api/projects/file/${PLACE}/`
/** The repo's root:  where the server is launched from (its `tsconfig.json` gives `tsx` the settings). */
const repoDir = path.resolve(import.meta.dirname, "../../../../..")

let server: ChildProcess
let baseUrl: string
/** The temp folder:  `spaces/` (spell-spaces), `builtins/` and `build/`. */
let tempDir: string
/** The folders the server is pointed at, as env vars:  the disk reader is pointed at them too. */
let folders: Record<string, string>

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
 * - Uses `node:http`, not `fetch`:  `path` goes on the wire exactly as given.
 *   `fetch` (WHATWG URL) resolves `%2e%2e` segments before sending, which would hide the path-traversal cases.
 */
function request(method: string, path: string, body?: string, contentType?: string): Promise<Reply> {
  const { port } = new URL(baseUrl)
  return new Promise((resolve, reject) => {
    // `Content-Length` is explicit:  node sends a `DELETE` body unframed (no length, not chunked) otherwise
    const headers: Record<string, string> = {}
    if (contentType) headers["content-type"] = contentType
    if (body !== undefined) headers["content-length"] = String(Buffer.byteLength(body))
    const outgoing = http.request({ host: "localhost", port, method, path, headers }, (incoming) => {
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
    })
    outgoing.on("error", reject)
    if (body !== undefined) outgoing.write(body)
    outgoing.end()
  })
}

/**
 * Where `file` is in the temp folder:
 * - `user/...`:  your space's projects (`spaces/@spell/owen@/...`)
 * - `built/...`:  their build folders (`build/spell-spaces/@spell/owen@/...`)
 */
function fixturePath(file: string): string {
  const inside = file.replace(/^user\//, "spaces/@spell/owen@/").replace(/^built\//, "build/spell-spaces/@spell/owen@/")
  return path.join(tempDir, inside)
}

/** Write `contents` at `file` (see `fixturePath()`), making folders. */
function writeFixture(file: string, contents: string) {
  const full = fixturePath(file)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, contents)
}

/** Read a file in the temp folder (see `fixturePath()`), `undefined` if absent. */
function readFixture(file: string): string | undefined {
  const full = fixturePath(file)
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : undefined
}

beforeAll(async () => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "spell-api-test-"))
  folders = {
    SPELL_SPACES_DIR: path.join(tempDir, "spaces"),
    SPELL_BUILTINS_DIR: path.join(tempDir, "builtins"),
    SPELL_BUILD_DIR: path.join(tempDir, "build")
  }
  for (const folder of Object.values(folders)) fs.mkdirSync(folder)
  writeFixture("user/Proj/project.json", JSON.stringify({ imports: [{ path: "/top.spell", active: true }] }))
  writeFixture("user/Proj/top.spell", "to do something\n")
  writeFixture("user/Proj/folder/sub/file.spell", "nested\n")
  writeFixture("built/Proj/Proj.spell.js", "export default 1\n")

  const port = await freePort()
  baseUrl = `http://localhost:${port}`
  server = spawn(process.execPath, ["--import", "tsx", "src/spaces/server/node/routes/cli.ts"], {
    cwd: repoDir,
    env: { ...process.env, PORT: String(port), ...folders },
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
  if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true })
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

  it("CHANGED:  unknown DELETE /api/nope => the API's 404 too (Express had no catch-all for DELETE)", async () => {
    const reply = await request("DELETE", "/api/nope")
    expect(reply.status).toBe(404)
    expect(reply.text).toBe("API routine not defined on server:   '/nope'")
  })
})

////////////////
// ## Project list and errors
////////////////

describe("projects list and sendError shape", () => {
  it("GET /api/projects/list/<group> => each project's address, and its title if it has one (Q45)", async () => {
    const reply = await request("GET", "/api/projects/list/owen@spell")
    expect(reply.status).toBe(200)
    expect(reply.contentType).toMatch(/^application\/json/)
    expect(reply.json()).toEqual([{ path: PROJECT }])
  })

  it("a group whose folder doesn't exist yet lists no projects, e.g. guides before the first one", async () => {
    const reply = await request("GET", "/api/projects/list/@spell/guides")
    expect(reply.status).toBe(200)
    expect(reply.json()).toEqual([])
  })

  it("spaces' own folders (`__members/` ...) are never projects;  a `__x__` one still is", async () => {
    writeFixture("user/__members/owen.json5", "{}")
    writeFixture("user/__mine__/project.json", JSON.stringify({ imports: [] }))
    const reply = await request("GET", "/api/projects/list/owen@spell")
    const paths = reply.json().map(({ path }: { path: string }) => path)
    expect(paths.sort()).toEqual(["owen@spell/Proj", "owen@spell/__mine__"].sort())
    fs.rmSync(fixturePath("user/__mine__"), { recursive: true })
  })

  it("sendError body is { errors: [{ message, trace }] } with status 500", async () => {
    const reply = await request("GET", "/api/projects/list/@bad/domain")
    expect(reply.status).toBe(500)
    expect(reply.contentType).toMatch(/^application\/json/)
    const body = reply.json()
    expect(Object.keys(body)).toEqual(["errors"])
    expect(body.errors).toHaveLength(1)
    expect(Object.keys(body.errors[0]).sort()).toEqual(["message", "trace"])
    expect(body.errors[0].message).toContain("no project group there")
    // trace is the error's stack, leaked to the client
    expect(body.errors[0].trace).toMatch(/^TypeError: /)
  })
})

////////////////
// ## Project files:  read at `/spaces/<project>/<file>`, saved at `/api/projects/file/<project>/<file>`
////////////////

describe("GET /spaces/<project>/<file>", () => {
  it("top-level file => 200, raw contents, content-type from the extension", async () => {
    const reply = await request("GET", `${FILES}top.spell`)
    expect(reply.status).toBe(200)
    // CHANGED:  `.spell` is text in `SRV.TYPES` (Express:  `application/octet-stream`)
    expect(reply.contentType).toBe("text/plain; charset=utf-8")
    expect(reply.text).toBe("to do something\n")
  })

  it("`.txt` file => text/plain", async () => {
    writeFixture("user/Proj/note.txt", "hello")
    const reply = await request("GET", `${FILES}note.txt`)
    expect(reply.status).toBe(200)
    expect(reply.contentType).toMatch(/^text\/plain/)
    expect(reply.text).toBe("hello")
  })

  it("missing file => 404 JSON { errors: [{ message, trace }] }", async () => {
    const reply = await request("GET", `${FILES}nope.spell`)
    expect(reply.status).toBe(404)
    expect(reply.contentType).toMatch(/^application\/json/)
    const body = reply.json()
    expect(body.errors).toHaveLength(1)
    expect(body.errors[0].message).toMatch(/^File not found: '.*nope\.spell'$/)
    expect(typeof body.errors[0].trace).toBe("string")
  })

  it("a file in a folder:  everything after the project", async () => {
    const reply = await request("GET", `${FILES}folder/sub/file.spell`)
    expect(reply.status).toBe(200)
    expect(reply.text).toBe(readFixture("user/Proj/folder/sub/file.spell"))
  })

  it("a project and a file with spaces in their names:  each part encoded on its own", async () => {
    writeFixture("user/Two Words/project.json", JSON.stringify({ imports: [] }))
    writeFixture("user/Two Words/a folder/my file.spell", "spaced\n")
    const reply = await request("GET", "/spaces/owen@spell/Two%20Words/a%20folder/my%20file.spell")
    expect(reply.status).toBe(200)
    expect(reply.text).toBe("spaced\n")
  })

  it("a folder, or a name with no dot => 400:  not a file's address (decision Q41)", async () => {
    expect((await request("GET", `${FILES}folder/`)).status).toBe(400)
    expect((await request("GET", `${FILES}folder`)).status).toBe(400)
  })

  it.each([
    ["no file after the project", `/spaces/${PLACE}`, "no file after the project"],
    ["an unknown group", "/spaces/@nobody/Proj/top.spell", "no project group holds"],
    ["the two slashes from before decision Q41", `/spaces/${PLACE}//top.spell`, "an empty part"]
  ])("a URL that names no project's file (%s) => 400", async (_name, url, message) => {
    const reply = await request("GET", url)
    expect(reply.status).toBe(400)
    expect(reply.json().errors[0].message).toContain(message)
  })

  it.each([
    ["encoded `..` segment", `${FILES}%2e%2e`],
    ["encoded `../x`", `${FILES}%2e%2e%2fx.spell`],
    ["encoded `..%2f`", `${FILES}..%2fx.spell`],
    ["`..` as the project", "/spaces/owen@spell/%2e%2e/x.spell"]
  ])("path traversal (%s) => 400 sendError, 'Invalid path'", async (_name, url) => {
    const reply = await request("GET", url)
    expect(reply.status).toBe(400)
    expect(reply.contentType).toMatch(/^application\/json/)
    expect(reply.json().errors[0].message).toContain("Invalid path")
  })
})

describe("POST /api/projects/file/<project>/<file>", () => {
  it("text/plain body => 200 `true`, file written, reads back at its `/spaces/` URL", async () => {
    const post = await request("POST", `${SAVE}saved.txt`, "hi there", "text/plain")
    expect(post.status).toBe(200)
    expect(post.contentType).toMatch(/^application\/json/)
    expect(post.text).toBe("true")
    expect(readFixture("user/Proj/saved.txt")).toBe("hi there")

    const get = await request("GET", `${FILES}saved.txt`)
    expect(get.status).toBe(200)
    expect(get.contentType).toMatch(/^text\/plain/)
    expect(get.text).toBe("hi there")
  })

  it("overwrites an existing file", async () => {
    await request("POST", `${SAVE}over.txt`, "one", "text/plain")
    await request("POST", `${SAVE}over.txt`, "two", "text/plain")
    expect(readFixture("user/Proj/over.txt")).toBe("two")
  })

  it("a nested path writes the nested file", async () => {
    const reply = await request("POST", `${SAVE}folder/new.txt`, "x", "text/plain")
    expect(reply.status).toBe(200)
    expect(readFixture("user/Proj/folder/new.txt")).toBe("x")
  })

  it("JSON body => 500 (body is an object, a save wants text)", async () => {
    const reply = await request("POST", `${SAVE}data.json`, '{"a":1}', "application/json")
    expect(reply.status).toBe(500)
    expect(reply.contentType).toMatch(/^application\/json/)
    expect(reply.json().errors[0].message).toContain("its contents must be text or bytes, not object")
    expect(readFixture("user/Proj/data.json")).toBeUndefined()
  })

  it("CHANGED:  text body under application/json5 that is not JSON5 => 400 JSON { error } (Express:  an HTML page)", async () => {
    const reply = await request("POST", `${SAVE}bad.txt`, "hi there", "application/json5")
    expect(reply.status).toBe(400)
    expect(reply.contentType).toMatch(/^application\/json/)
    expect(reply.json().error).toMatch(/^bad JSON body:  JSON5:/)
  })

  it("traversal in the path => 500 'Invalid path', nothing written", async () => {
    const reply = await request("POST", `${SAVE}%2e%2e`, "evil", "text/plain")
    expect(reply.status).toBe(500)
    expect(reply.json().errors[0].message).toContain("Invalid path")
  })

  it("the old URL, a project id then its file, is gone:  404", async () => {
    const reply = await request("GET", `/api/projects/file/${PROJECT}/top.spell`)
    expect(reply.status).toBe(404)
  })
})

////////////////
// ## Body parsing:  JSON, JSON5, form, text
////////////////

describe("request body parsing on POST /api/projects/create/file", () => {
  /** A create-file body as source text, so tests can write it as JSON or JSON5. */
  const strict = (filePath: string) => JSON.stringify({ projectId: PROJECT, filePath, contents: "x" })
  const json5 = (filePath: string) => `{projectId: '${PROJECT}', filePath: "${filePath}", contents: "x",}`

  it("application/json, strict JSON => 200 ProjectIndexJSON including the new file, and where it builds", async () => {
    const reply = await request("POST", "/api/projects/create/file", strict("/c.spell"), "application/json")
    expect(reply.status).toBe(200)
    expect(reply.contentType).toMatch(/^application\/json/)
    const index = reply.json()
    expect(Object.keys(index).sort()).toEqual(["buildFolder", "imports", "manifest"])
    // your space's projects build in THIS checkout's `build/spell-spaces/`:  named inside `build/`, no `../` (J33)
    expect(index.buildFolder).toBe("spell-spaces/@spell/owen@/Proj")
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

describe("POST /api/projects/settings/project", () => {
  it("writes the settings into the project file, keeping its imports;  an empty one is removed", async () => {
    const body = (settings: object) => JSON.stringify({ projectId: PROJECT, settings })
    const saved = await request(
      "POST",
      "/api/projects/settings/project",
      body({ title: "My Project", version: "1.2.0", targets: ["ts/solid"], listsStartAt: 0 }),
      "application/json"
    )
    expect(saved.status).toBe(200)
    expect(saved.json()).toEqual({ title: "My Project", version: "1.2.0", targets: ["ts/solid"], listsStartAt: 0 })
    const file = readFixture("user/Proj/__project.json5")!
    expect(file).toContain('"listsStartAt": 0')
    expect(file).toContain("/top.spell")

    const cleared = await request(
      "POST",
      "/api/projects/settings/project",
      body({ title: "", targets: [] }),
      "application/json"
    )
    expect(cleared.json()).toEqual({ version: "1.2.0", listsStartAt: 0 })
  })
})

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
    const reply = await request(
      "DELETE",
      "/api/projects/remove/file",
      JSON.stringify({ projectId: PROJECT }),
      "application/json"
    )
    expect(reply.status).toBe(500)
    expect(reply.json().errors[0].message).toContain("You must pass a valid filePath")
  })
})

////////////////
// ## Compiled, scopes and words:  files too, at `/spaces/<project>/<file>`, found in `build/`
////////////////

describe("compiled, scopes and words files", () => {
  it("its compiled program => 200 text/javascript, from its build folder", async () => {
    const reply = await request("GET", `${FILES}Proj.spell.js`)
    expect(reply.status).toBe(200)
    expect(reply.contentType).toMatch(/^text\/javascript/)
    expect(reply.text).toBe("export default 1\n")
  })

  it("its scope pack => 200 text/javascript once the pack exists", async () => {
    writeFixture("built/Proj/Proj.scopes.js", "window.scopes = {}\n")
    const reply = await request("GET", `${FILES}Proj.scopes.js`)
    expect(reply.status).toBe(200)
    expect(reply.contentType).toMatch(/^text\/javascript/)
    expect(reply.text).toBe("window.scopes = {}\n")
  })

  it("not found, and no project to compile => 404 JSON", async () => {
    const reply = await request("GET", "/spaces/owen@spell/Nope/Nope.spell.js")
    expect(reply.status).toBe(404)
    expect(reply.contentType).toMatch(/^application\/json/)
    const body = reply.json()
    expect(body.errors[0].message).toMatch(/^File not found: '.*Nope\.spell\.js'$/)
    expect(typeof body.errors[0].trace).toBe("string")
  })

  // `ProjectBuild`:  a child `spell compile`, so it takes a few seconds
  it("a project never compiled:  compiled first, then served -- its scope pack too", async () => {
    writeFixture("user/Fresh/project.json", JSON.stringify({ imports: [{ path: "/Fresh.spell", active: true }] }))
    writeFixture("user/Fresh/Fresh.spell", 'print "fresh"\n')
    const reply = await request("GET", "/spaces/owen@spell/Fresh/Fresh.spell.js")
    expect(reply.status).toBe(200)
    expect(reply.contentType).toMatch(/^text\/javascript/)
    expect(reply.text).toContain('"fresh"')
    expect(readFixture("built/Fresh/Fresh.spell.js")).toBe(reply.text)
    const scopes = await request("GET", "/spaces/owen@spell/Fresh/Fresh.scopes.js")
    expect(scopes.status).toBe(200)
    expect(scopes.text).toBe(readFixture("built/Fresh/Fresh.scopes.js"))
  }, 60_000)

  it("its words => 200 text/javascript, its English words, from its build folder", async () => {
    writeFixture("built/Proj/Proj.en.js", 'export const words = { lang: "en", types: {} }\n')
    const reply = await request("GET", `${FILES}Proj.en.js`)
    expect(reply.status).toBe(200)
    expect(reply.contentType).toMatch(/^text\/javascript/)
    expect(reply.text).toBe('export const words = { lang: "en", types: {} }\n')
  })

  it("its declarations => 200, from its build folder", async () => {
    writeFixture("built/Proj/Proj.declarations.json5", '{ "provides": [] }\n')
    const reply = await request("GET", `${FILES}Proj.declarations.json5`)
    expect(reply.status).toBe(200)
    expect(reply.text).toBe('{ "provides": [] }\n')
  })

  it("a project's words, in any language, are NOT one of its files:  its index leaves them out", async () => {
    writeFixture("user/Proj/Proj.en.js", 'export const words = { lang: "en", types: {} }\n')
    writeFixture("user/Proj/Proj.es.js", 'export const words = { lang: "es", types: {} }\n')
    const reply = await request("GET", `/api/projects/index/${PLACE}`)
    expect(reply.status).toBe(200)
    const { manifest, imports } = reply.json() as { manifest: object; imports: Array<{ path: string }> }
    expect(Object.keys(manifest).filter((path) => /Proj\.(en|es)\.js$/.test(path))).toEqual([])
    expect(imports.map(({ path }) => path)).not.toContain("/Proj.en.js")
  })

  it("compiled output, by its names before people-and-orgs P11 too, is NOT one of its files", async () => {
    // A copy left from before the rename must never become an import of the project
    for (const file of ["Proj.compiled.js", "Proj.elements.js", "Proj.elements.spell.js", "Proj.spell.tsx"]) {
      writeFixture(`user/Proj/${file}`, "export default 2\n")
    }
    const reply = await request("GET", `/api/projects/index/${PLACE}`)
    expect(reply.status).toBe(200)
    const { manifest, imports } = reply.json() as { manifest: object; imports: Array<{ path: string }> }
    expect(Object.keys(manifest).filter((path) => /Proj\.(spell|compiled|elements)/.test(path))).toEqual([])
    expect(imports.map(({ path }) => path).filter((path) => path.startsWith("/Proj."))).toEqual([])
  })
})

////////////////
// ## Spaces' own names, and one set of URLs for the server and the disk reader
////////////////

describe("a project's file list", () => {
  it("leaves out spaces' own `__` names by spaces' list, but keeps `__init__.js` and the like (J52)", async () => {
    writeFixture("user/Proj/__init__.js", "export {}\n")
    writeFixture("user/Proj/__project.json5", JSON.stringify({ imports: [{ path: "/top.spell", active: true }] }))
    writeFixture("user/Proj/__pack.js", "export {}\n")
    const reply = await request("GET", `/api/projects/index/${PLACE}`)
    const files = Object.keys(reply.json().manifest)
    expect(files).toContain(`${PROJECT}/__init__.js`)
    expect(files).toContain(`${PROJECT}/__pack.js`)
    expect(files).not.toContain(`${PROJECT}/__project.json5`)
  })
})

describe("every URL spell builds is answered by the server and by spaces' disk reader alike", () => {
  it("a file, a file in a folder, a spaced name, the index and the group's list", async () => {
    // the disk reader, in this process, pointed at the same folders as the server
    Object.assign(process.env, folders)
    const { SP } = await import("spell-parser/spell")
    const { diskFetch } = await import("spell-app/spaces/server/node/projects/disk-fetch")
    const urls = [
      SP.SpellUrls.fileUrl(`${PROJECT}/top.spell`),
      SP.SpellUrls.fileUrl(`${PROJECT}/folder/sub/file.spell`),
      SP.SpellUrls.fileUrl("owen@spell/Two Words/a folder/my file.spell"),
      SP.SpellUrls.fileUrl(`${PROJECT}/Proj.spell.js`)
    ]
    expect(urls[0]).toBe(`${FILES}top.spell`)
    for (const url of urls) {
      const reply = await request("GET", url)
      expect(reply.status, url).toBe(200)
      expect(await diskFetch({ url }), url).toBe(reply.text)
    }
    const index = SP.SpellUrls.indexUrl(PROJECT)
    expect(index).toBe(`/api/projects/index/${PLACE}`)
    expect((await diskFetch({ url: index })).imports).toEqual((await request("GET", index)).json().imports)
    const list = SP.SpellUrls.listUrl("owen@spell")
    expect(await diskFetch({ url: list })).toEqual((await request("GET", list)).json())
    const saved = SP.SpellUrls.saveUrl(`${PROJECT}/both.txt`)
    expect((await request("POST", saved, "over HTTP", "text/plain")).text).toBe("true")
    expect(await diskFetch({ url: saved, contents: "from disk" })).toBe(true)
    expect(readFixture("user/Proj/both.txt")).toBe("from disk")
  })
})

////////////////
// ## People (epic `people-and-orgs` P9)
////////////////

describe("GET and POST /api/people/me", () => {
  it("GET:  this machine's person, their starter file written the first time;  their orgs;  no problems", async () => {
    const reply = await request("GET", "/api/people/me")
    expect(reply.status).toBe(200)
    const { person, orgs, problems } = reply.json()
    expect(person).toMatchObject({ id: "owen", address: "owen@spell", dates: [] })
    expect(orgs).toEqual([])
    expect(problems).toEqual([])
    expect(readFixture("user/__me.json5")).toContain("// You, as spell knows you")
  })

  it("POST:  their changes written, the file's comments kept;  answered as GET", async () => {
    const body = JSON.stringify({ nickname: "O", dates: [{ label: "birthday", day: "1970-01-01" }] })
    const reply = await request("POST", "/api/people/me", body, "application/json")
    expect(reply.status).toBe(200)
    expect(reply.json().person).toMatchObject({ nickname: "O", dates: [{ label: "birthday", day: "1970-01-01" }] })
    const text = readFixture("user/__me.json5")!
    expect(text).toContain("// You, as spell knows you")
    expect(text).toContain('"nickname": "O"')
  })
})

////////////////
// ## Preferences (epic `prefs-and-undo` P2)
////////////////

describe("/api/prefs:  each person's preferences, in their space", () => {
  it("POST save, then GET load:  the value, kept in `__prefs/<store>.json5` in the person's space", async () => {
    expect((await request("GET", "/api/prefs/load?store=api-test&key=mode")).json()).toEqual({})
    const body = JSON.stringify({ store: "api-test", key: "mode", value: "debug" })
    const saved = await request("POST", "/api/prefs/save", body, "application/json")
    expect(saved.status).toBe(200)
    expect(saved.json()).toEqual({ value: "debug" })
    expect((await request("GET", "/api/prefs/load?store=api-test&key=mode")).json()).toEqual({ value: "debug" })
    expect(readFixture("user/__prefs/api-test.json5")).toContain('"mode": "debug"')
  })

  it("GET keys and POST forget:  a prefix's keys listed, then forgotten", async () => {
    for (const key of ["layout/left", "layout/right", "theme"]) {
      await request("POST", "/api/prefs/save", JSON.stringify({ store: "api-keys", key, value: 1 }), "application/json")
    }
    expect((await request("GET", "/api/prefs/keys?store=api-keys&under=layout/")).json()).toEqual({
      keys: ["layout/left", "layout/right"]
    })
    const forgot = await request(
      "POST",
      "/api/prefs/forget",
      JSON.stringify({ store: "api-keys", under: "layout/" }),
      "application/json"
    )
    expect(forgot.json()).toEqual({ keys: ["theme"] })
  })

  it("CHANGED:  a store name that reaches outside the person's `__prefs/` answers 400, not 500", async () => {
    const reply = await request("GET", "/api/prefs/load?store=../__me&key=names")
    expect(reply.status).toBe(400)
    expect(reply.json().errors[0].message).toContain("can't name a store")
  })

  it("the kit's `ServerPlace` talks to it:  a `PrefStore` on the server, its declared default too", async () => {
    const { PrefStore, ServerPlace } = await import("spell/util/persist")
    const place = new ServerPlace({ url: `${baseUrl}/api/prefs` })
    const prefs = new PrefStore("@owen/solitaire", { place }).declare("theme", { oneOf: ["light", "dark"] })
    expect(await prefs.load("theme")).toBe("light")
    await prefs.save("theme", "dark")
    expect(await prefs.update<number>("games", (games) => (games ?? 0) + 1)).toBe(1)
    expect(await prefs.load("theme")).toBe("dark")
    expect((await prefs.loadKeysUnder()).sort()).toEqual(["games", "theme"])
    expect(readFixture("user/__prefs/@owen/solitaire.json5")).toContain('"theme": "dark"')
  })
})
