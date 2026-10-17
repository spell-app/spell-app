import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test"

import { SRV } from "$/server"
import { ask, serveHandler, type Served } from "$/server/test/serve"

/** This run's token, as the page server's `Guard` would hand it to its pages. */
const TOKEN = "file-operations-token"

/** Headers a page the server served sends with a JSON write. */
const WRITE = { "content-type": "application/json", "x-server-token": TOKEN }

/** A checkout:  `guides/` linked in from a shared folder beside it, as the real shared content folders are. */
const DIR = mkdtempSync(join(tmpdir(), "srv-files-"))
const ROOT = join(DIR, "checkout")
const SHARED = join(DIR, "shared")

beforeAll(() => {
  mkdirSync(join(SHARED, "guides", "server"), { recursive: true })
  mkdirSync(join(ROOT, "pages"), { recursive: true })
  mkdirSync(join(ROOT, "packages"), { recursive: true })
  symlinkSync(join(SHARED, "guides"), join(ROOT, "guides"))
  writeFileSync(join(ROOT, "packages", "code.ts"), "export {}\n")
  writeFileSync(join(ROOT, "guides", "server", "notes.md"), "# Notes\n")
})

afterAll(() => rmSync(DIR, { recursive: true, force: true }))

////////////////
// ## In-process
////////////////

describe("FileOperations (in-process)", () => {
  const folder = join(DIR, "in-process")

  test("save() writes the whole file, making its folders, and answers its ETag", async () => {
    const file = join(folder, "deep", "er", "a.txt")
    const etag = await SRV.FileOperations.save(file, "one")
    expect(readFileSync(file, "utf8")).toBe("one")
    expect(etag).toBe(SRV.StaticHandler.etagOf(statSync(file)))
    await SRV.FileOperations.save(file, Buffer.from("two"))
    expect(readFileSync(file, "utf8")).toBe("two")
    expect(existsSync(`${file}.lock`)).toBe(false)
  })

  test("save() with `ifMatch`:  writes when the file is unchanged, 409 with the current ETag when it changed", async () => {
    const file = join(folder, "matched.txt")
    const etag = await SRV.FileOperations.save(file, "first")
    await SRV.FileOperations.save(file, "second", { ifMatch: etag })
    expect(readFileSync(file, "utf8")).toBe("second")
    const conflict = await SRV.FileOperations.save(file, "lost", { ifMatch: etag }).catch((error: unknown) => error)
    expect(conflict).toMatchObject({ status: 409, body: { etag: SRV.StaticHandler.etagOf(statSync(file)) } })
    expect(readFileSync(file, "utf8")).toBe("second")
  })

  test("save() with a function:  edits the current contents, holding the lock", async () => {
    const file = join(folder, "edited.txt")
    await SRV.FileOperations.save(file, (current) => `${current}a`)
    await SRV.FileOperations.save(file, (current) => `${current}b`)
    expect(readFileSync(file, "utf8")).toBe("ab")
  })

  test("create() makes a file or a folder;  409 if something is there", async () => {
    const file = join(folder, "made", "new.md")
    expect(await SRV.FileOperations.create(file, { contents: "hi" })).toBe(
      SRV.StaticHandler.etagOf(statSync(join(folder, "made", "new.md")))
    )
    expect(readFileSync(file, "utf8")).toBe("hi")
    expect(await SRV.FileOperations.create(join(folder, "made", "sub"), { folder: true })).toBeUndefined()
    expect(statSync(join(folder, "made", "sub")).isDirectory()).toBe(true)
    await expect(SRV.FileOperations.create(file)).rejects.toMatchObject({ status: 409 })
    await expect(SRV.FileOperations.create(join(folder, "made", "sub"), { folder: true })).rejects.toMatchObject({
      status: 409
    })
  })

  test("rename() moves a file or folder, making the target's folders;  404 missing, 409 taken, 400 into itself", async () => {
    const from = join(folder, "moving")
    await SRV.FileOperations.create(join(from, "inside.txt"), { contents: "x" })
    await SRV.FileOperations.rename(from, join(folder, "moved", "here"))
    expect(existsSync(from)).toBe(false)
    expect(readFileSync(join(folder, "moved", "here", "inside.txt"), "utf8")).toBe("x")
    await expect(SRV.FileOperations.rename(from, join(folder, "x"))).rejects.toMatchObject({ status: 404 })
    await SRV.FileOperations.create(join(folder, "taken.txt"))
    await expect(
      SRV.FileOperations.rename(join(folder, "moved", "here", "inside.txt"), join(folder, "taken.txt"))
    ).rejects.toMatchObject({ status: 409 })
    await expect(
      SRV.FileOperations.rename(join(folder, "moved"), join(folder, "moved", "here", "deeper"))
    ).rejects.toMatchObject({ status: 400 })
  })

  test("duplicate() copies a folder, everything inside;  404 missing, 409 taken", async () => {
    const from = join(folder, "original")
    await SRV.FileOperations.create(join(from, "a", "b.txt"), { contents: "b" })
    await SRV.FileOperations.duplicate(from, join(folder, "copy"))
    expect(readFileSync(join(folder, "copy", "a", "b.txt"), "utf8")).toBe("b")
    expect(readFileSync(join(from, "a", "b.txt"), "utf8")).toBe("b")
    await expect(SRV.FileOperations.duplicate(join(folder, "nope"), join(folder, "y"))).rejects.toMatchObject({
      status: 404
    })
    await expect(SRV.FileOperations.duplicate(from, join(folder, "copy"))).rejects.toMatchObject({ status: 409 })
  })

  test("delete() deletes a file or folder, everything inside;  404 missing", async () => {
    await SRV.FileOperations.create(join(folder, "doomed", "x", "y.txt"))
    await SRV.FileOperations.delete(join(folder, "doomed"))
    expect(existsSync(join(folder, "doomed"))).toBe(false)
    await expect(SRV.FileOperations.delete(join(folder, "doomed"))).rejects.toMatchObject({ status: 404 })
  })
})

////////////////
// ## HTTP
////////////////

describe("FileOperations.route()", () => {
  let served: Served
  let port: number

  beforeAll(async () => {
    const router = new SRV.Router()
    new SRV.FileOperations({ root: ROOT, writable: ["guides", "pages"] }).route(router, new SRV.Guard({ token: TOKEN }))
    served = await serveHandler(router.handle)
    port = served.port
  })

  afterAll(() => served.close())

  /** POST `body` as JSON to `/api/files/<call>`, with the token */
  function post(call: string, body: object, headers: Record<string, string> = WRITE) {
    return ask(port, "POST", `/api/files/${call}`, { headers, body: JSON.stringify(body) })
  }

  test("PUT saves the whole file, through the shared link, and answers its new ETag", async () => {
    const answer = await ask(port, "PUT", "/api/files?path=/guides/server/notes.md", {
      headers: { ...WRITE, "content-type": "text/plain; charset=utf-8" },
      body: "# Notes\n\nSaved.\n"
    })
    const file = join(SHARED, "guides", "server", "notes.md")
    expect(readFileSync(file, "utf8")).toBe("# Notes\n\nSaved.\n")
    expect({ status: answer.status, ...JSON.parse(answer.text) }).toEqual({
      status: 200,
      path: "/guides/server/notes.md",
      etag: SRV.StaticHandler.etagOf(statSync(file))
    })
  })

  test("PUT takes JSON { contents } too, and makes the file's folders", async () => {
    const answer = await ask(port, "PUT", "/api/files?path=/pages/new/page.html", {
      headers: WRITE,
      body: JSON.stringify({ contents: "<p>new</p>" })
    })
    expect(answer.status).toBe(200)
    expect(readFileSync(join(ROOT, "pages", "new", "page.html"), "utf8")).toBe("<p>new</p>")
    const nothing = await ask(port, "PUT", "/api/files?path=/pages/new/page.html", { headers: WRITE, body: "{}" })
    expect(nothing.status).toBe(400)
  })

  test("PUT with If-Match:  409 once the file changed since", async () => {
    const path = "/api/files?path=/pages/matched.txt"
    // each save a different size:  an `ETag` is size + mtime in ms, and two saves can land in one ms
    const first = JSON.parse((await ask(port, "PUT", path, { headers: WRITE, body: `{"contents":"1"}` })).text)
    const second = await ask(port, "PUT", path, {
      headers: { ...WRITE, "if-match": first.etag },
      body: `{"contents":"22"}`
    })
    expect(second.status).toBe(200)
    const stale = await ask(port, "PUT", path, {
      headers: { ...WRITE, "if-match": first.etag },
      body: `{"contents":"333"}`
    })
    expect(stale.status).toBe(409)
    expect(JSON.parse(stale.text).etag).toBe(JSON.parse(second.text).etag)
    expect(readFileSync(join(ROOT, "pages", "matched.txt"), "utf8")).toBe("22")
  })

  test("create makes a file or a folder;  409 if something is there", async () => {
    const file = await post("create", { path: "/pages/made.md", contents: "made" })
    expect(file.status).toBe(200)
    expect(JSON.parse(file.text)).toMatchObject({ path: "/pages/made.md", etag: expect.any(String) })
    expect(readFileSync(join(ROOT, "pages", "made.md"), "utf8")).toBe("made")
    expect((await post("create", { path: "/pages/folder", folder: true })).status).toBe(200)
    expect(statSync(join(ROOT, "pages", "folder")).isDirectory()).toBe(true)
    expect((await post("create", { path: "/pages/made.md" })).status).toBe(409)
  })

  test("rename moves a file or folder;  404 missing, 409 taken", async () => {
    await post("create", { path: "/guides/moving/a.md", contents: "a" })
    const answer = await post("rename", { path: "/guides/moving", to: "/guides/moved/here" })
    expect({ status: answer.status, ...JSON.parse(answer.text) }).toEqual({
      status: 200,
      path: "/guides/moving",
      to: "/guides/moved/here"
    })
    expect(readFileSync(join(SHARED, "guides", "moved", "here", "a.md"), "utf8")).toBe("a")
    expect((await post("rename", { path: "/guides/moving", to: "/guides/x" })).status).toBe(404)
    expect((await post("rename", { path: "/guides/moved/here/a.md", to: "/pages/made.md" })).status).toBe(409)
  })

  test("duplicate copies a folder, everything inside;  409 taken", async () => {
    await post("create", { path: "/pages/original/a/b.md", contents: "b" })
    expect((await post("duplicate", { path: "/pages/original", to: "/guides/copy" })).status).toBe(200)
    expect(readFileSync(join(SHARED, "guides", "copy", "a", "b.md"), "utf8")).toBe("b")
    expect((await post("duplicate", { path: "/pages/original", to: "/guides/copy" })).status).toBe(409)
    expect((await post("duplicate", { path: "/pages/nope", to: "/guides/nope" })).status).toBe(404)
  })

  test("DELETE deletes a file or folder, everything inside;  404 missing", async () => {
    await post("create", { path: "/pages/doomed/x.md" })
    const answer = await ask(port, "DELETE", "/api/files?path=/pages/doomed", { headers: WRITE })
    expect(answer.status).toBe(200)
    expect(existsSync(join(ROOT, "pages", "doomed"))).toBe(false)
    expect((await ask(port, "DELETE", "/api/files?path=/pages/doomed", { headers: WRITE })).status).toBe(404)
  })

  test("403 OUTSIDE the writable folders:  other folders, the root, a writable folder itself", async () => {
    const outside = await ask(port, "PUT", "/api/files?path=/packages/code.ts", {
      headers: WRITE,
      body: `{"contents":""}`
    })
    expect(outside.status).toBe(403)
    expect(readFileSync(join(ROOT, "packages", "code.ts"), "utf8")).toBe("export {}\n")
    expect((await post("create", { path: "/new.md" })).status).toBe(403)
    expect((await ask(port, "DELETE", "/api/files?path=/guides", { headers: WRITE })).status).toBe(403)
    expect((await post("rename", { path: "/pages/made.md", to: "/packages/made.md" })).status).toBe(403)
    expect((await post("duplicate", { path: "/packages/code.ts", to: "/pages/code.ts" })).status).toBe(403)
    expect(existsSync(join(ROOT, "pages", "made.md"))).toBe(true)
  })

  test("403 for `..` and dot files, encoded or not;  400 for a missing path", async () => {
    expect((await post("create", { path: "/pages/../packages/x.ts" })).status).toBe(403)
    expect((await post("create", { path: "/pages/%2e%2e/packages/x.ts" })).status).toBe(403)
    expect((await post("create", { path: "/pages/.env" })).status).toBe(403)
    expect((await post("rename", { path: "/pages/made.md", to: "/pages/.hidden" })).status).toBe(403)
    expect((await post("create", {})).status).toBe(400)
    expect((await post("rename", { path: "/pages/made.md" })).status).toBe(400)
    expect(existsSync(join(ROOT, "packages", "x.ts"))).toBe(false)
  })

  test("403 without this run's token, or from another origin", async () => {
    expect((await post("create", { path: "/pages/no-token.md" }, { "content-type": "application/json" })).status).toBe(
      403
    )
    expect((await post("create", { path: "/pages/evil.md" }, { ...WRITE, origin: "http://evil.example" })).status).toBe(
      403
    )
    expect((await ask(port, "DELETE", "/api/files?path=/pages/made.md")).status).toBe(403)
    expect(existsSync(join(ROOT, "pages", "no-token.md"))).toBe(false)
    expect(existsSync(join(ROOT, "pages", "made.md"))).toBe(true)
  })
})
