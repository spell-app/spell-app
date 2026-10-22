import { mkdtempSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { resolve } from "path"
import { afterAll, describe, test, expect, vi } from "vite-plus/test"

import { DiskStorage } from "spell-app/spaces/server/node/storage/DiskStorage"
import { editJSON5, json5Edited, readJSON5, writeJSON5 } from "spell-app/spaces/server/node/storage/json5"

/**
 * Spaces' storage on the disk, and its JSON5 editing (epic `people-and-orgs` P8):  on a temporary folder.
 */
const root = mkdtempSync(resolve(tmpdir(), "spell-storage-"))
const storage = new DiskStorage(root)
afterAll(() => {
  storage.close()
  rmSync(root, { recursive: true, force: true })
})

describe("DiskStorage", () => {
  test("writes and reads a file, making its folders;  nothing for a file that isn't there", async () => {
    await storage.write("@spell/owen@/notes.txt", "hello")
    expect(await storage.read("@spell/owen@/notes.txt")).toBe("hello")
    expect(await storage.read("@spell/owen@/nope.txt")).toBeUndefined()
  })

  test("lists a folder, folders ending in /, sorted;  [] for a folder that isn't there", async () => {
    await storage.write("@spell/owen@/errors/1.spell", "x")
    expect(await storage.list("@spell/owen@")).toEqual(["errors/", "notes.txt"])
    expect(await storage.list("@nobody")).toEqual([])
  })

  test("its index follows a change it made, and one made by anyone else", async () => {
    expect(await storage.list("@spell/owen@")).toEqual(["errors/", "notes.txt"])
    await storage.write("@spell/owen@/__me.json5", "{}")
    expect(await storage.list("@spell/owen@")).toEqual(["__me.json5", "errors/", "notes.txt"])
    // by someone else, straight to the disk:  the watcher drops the folder's index
    writeFileSync(resolve(root, "@spell/owen@/other.txt"), "y")
    await vi.waitFor(async () => expect(await storage.list("@spell/owen@")).toContain("other.txt"), { timeout: 3000 })
  })

  test("removes a file or a folder;  nothing if it isn't there", async () => {
    await storage.remove("@spell/owen@/errors")
    await storage.remove("@spell/owen@/nope")
    expect(await storage.list("@spell/owen@")).not.toContain("errors/")
  })

  test("tells a watcher what changed under its folder", async () => {
    const changes: string[] = []
    const stop = storage.watch("@three-degrees", (path) => changes.push(path))
    await storage.write("@three-degrees/__org.json5", "{}")
    await storage.write("@spell/owen@/elsewhere.txt", "z")
    stop()
    expect(changes).toContain("@three-degrees/__org.json5")
    expect(changes).not.toContain("@spell/owen@/elsewhere.txt")
  })

  test("never outside its root", async () => {
    await expect(storage.read("../escape.txt")).rejects.toThrow()
    await expect(storage.write("/etc/../../x", "no")).rejects.toThrow()
  })
})

describe("JSON5, its comments kept", () => {
  const SOURCE = [
    "{",
    "  // who I am",
    '  "names": "Owen",',
    '  "age": 50, // years',
    "  /* my emails */",
    '  "emails": ["owen@example.com"]',
    "}",
    ""
  ].join("\n")

  test("a changed value:  every comment, above, beside and after, where it was", () => {
    const text = json5Edited(SOURCE, { names: "O", age: 51, emails: ["owen@example.com"] })
    expect(text).toContain("// who I am")
    expect(text).toContain('"names": "O"')
    expect(text).toContain("/* my emails */")
    // a comment at the end of a line stays on its line (I10)
    expect(text).toMatch(/"age": 51,? \/\/ years/)
  })

  test("a key the value leaves out is gone;  a new one added;  keys and text in double quotes", () => {
    const text = json5Edited(SOURCE, { names: "Owen", emails: [], nickname: "O" })
    expect(text).not.toContain('"age"')
    expect(text).toContain('"nickname": "O"')
    expect(text).not.toMatch(/'/)
  })

  test("written and read back through the storage;  edited whole, its comments kept", async () => {
    writeFileSync(resolve(root, "me.json5"), SOURCE)
    const edited = await editJSON5<{ names: string; age: number }>(storage, "me.json5", (value) => ({
      ...value!,
      age: 52
    }))
    expect(edited.age).toBe(52)
    expect(await readJSON5(storage, "me.json5")).toEqual({ names: "Owen", age: 52, emails: ["owen@example.com"] })
    expect(await storage.read("me.json5")).toContain("// years")
    await writeJSON5(storage, "fresh.json5", { a: 1 })
    expect(await storage.read("fresh.json5")).toBe('{\n  "a": 1\n}\n')
  })
})
