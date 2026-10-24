import { mkdtempSync, rmSync } from "fs"
import { tmpdir } from "os"
import JSON5 from "json5"
import { resolve } from "path"
import { afterAll, describe, expect, test } from "vite-plus/test"

import { SpacePrefs, type PrefPerson } from "spell-app/spaces/server/node/prefs/SpacePrefs"
import { DiskStorage } from "spell-app/spaces/server/node/storage/DiskStorage"

/** Preferences in people's spaces (epic `prefs-and-undo` P2):  on a temporary spell-spaces. */
const root = mkdtempSync(resolve(tmpdir(), "spell-prefs-"))
const storage = new DiskStorage(root)
const prefs = new SpacePrefs(storage)
afterAll(() => {
  storage.close()
  rmSync(root, { recursive: true, force: true })
})

/** This machine's person, as the routes name them. */
const OWEN: PrefPerson = { id: "owen", org: "spell" }

////////////////
// ## Keeping values
////////////////

describe("SpacePrefs", () => {
  test("keeps a store in the person's space, one JSON5 file a person can read", async () => {
    await prefs.save(OWEN, "spellEditor", "mode", "debug")
    await prefs.save(OWEN, "spellEditor", "layout", { left: 30 })
    expect(await prefs.load(OWEN, "spellEditor", "mode")).toBe("debug")
    const text = (await storage.read("@spell/owen@/__prefs/spellEditor.json5"))!
    expect(text).toContain('"mode": "debug"')
    expect(JSON5.parse(text)).toEqual({ mode: "debug", layout: { left: 30 } })
  })

  test("a store named like a project is a folder and a file", async () => {
    await prefs.save(OWEN, "@owen/solitaire", "theme", "dark")
    expect(prefs.fileFor(OWEN, "@owen/solitaire")).toBe("@spell/owen@/__prefs/@owen/solitaire.json5")
    expect(await storage.read("@spell/owen@/__prefs/@owen/solitaire.json5")).toContain('"theme": "dark"')
  })

  test("keeps a person's comments in the file", async () => {
    await storage.write("@spell/owen@/__prefs/commented.json5", '{\n  // my theme, by hand\n  "theme": "dark"\n}\n')
    await prefs.save(OWEN, "commented", "width", 250)
    const text = await storage.read("@spell/owen@/__prefs/commented.json5")
    expect(text).toContain("// my theme, by hand")
    expect(text).toContain('"width": 250')
  })

  test("saving nothing forgets the key;  a store with no file has no keys", async () => {
    await prefs.save(OWEN, "forgetting", "a", 1)
    await prefs.save(OWEN, "forgetting", "a", undefined)
    expect(await prefs.keys(OWEN, "forgetting")).toEqual([])
    expect(await prefs.load(OWEN, "never-saved", "a")).toBeUndefined()
    expect(await prefs.keys(OWEN, "never-saved")).toEqual([])
  })

  test("lists and forgets the keys under a prefix", async () => {
    await prefs.save(OWEN, "folders", "layout/left", 30)
    await prefs.save(OWEN, "folders", "layout/right", 70)
    await prefs.save(OWEN, "folders", "theme", "dark")
    expect(await prefs.keys(OWEN, "folders", "layout/")).toEqual(["layout/left", "layout/right"])
    expect(await prefs.forgetUnder(OWEN, "folders", "layout/")).toEqual(["theme"])
  })

  test("two saves at once to one store BOTH land", async () => {
    await Promise.all([prefs.save(OWEN, "racing", "a", 1), prefs.save(OWEN, "racing", "b", 2)])
    expect((await prefs.keys(OWEN, "racing")).sort()).toEqual(["a", "b"])
  })

  test("keeps each person's apart", async () => {
    const matt: PrefPerson = { id: "matt", org: "three-degrees" }
    await prefs.save(matt, "spellEditor", "mode", "edit")
    expect(await prefs.load(OWEN, "spellEditor", "mode")).toBe("debug")
    expect(prefs.fileFor(matt, "spellEditor")).toBe("@three-degrees/matt@/__prefs/spellEditor.json5")
  })
})

////////////////
// ## Mistakes
////////////////

describe("SpacePrefs, refusing", () => {
  test("a store name that would reach outside the person's `__prefs/`:  400", async () => {
    for (const store of ["", "../__me", "a/../../b", ".hidden", "a//b", "a:b", "a\\b"]) {
      expect(() => prefs.fileFor(OWEN, store), store).toThrow(expect.objectContaining({ status: 400 }))
    }
  })

  test("a key that can't be one:  400", async () => {
    await expect(prefs.save(OWEN, "keys", "__proto__", 1)).rejects.toMatchObject({ status: 400 })
    await expect(prefs.load(OWEN, "keys", "")).rejects.toMatchObject({ status: 400 })
  })
})
