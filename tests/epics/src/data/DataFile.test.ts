/**
 * Tests of `DataFile`:  the tooling's JSON5 data files (epic `epic-workflow` P21) -- a comment added by hand kept by
 * every save, the old `.json` name read and then removed, the layout, the renames and links `epic migrate` makes.
 * On a scratch folder.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { afterAll, describe, expect, test } from "vite-plus/test"

import { DataFile } from "$/epics/data/DataFile"

const root = mkdtempSync(join(tmpdir(), "data-file-"))
afterAll(() => rmSync(root, { recursive: true, force: true }))

/** A file in the scratch folder, with `text` in it when given. */
function file(name: string, text?: string): string {
  const path = join(root, name)
  mkdirSync(join(path, ".."), { recursive: true })
  if (text !== undefined) writeFileSync(path, text)
  return path
}

/** A hand-edited data file:  a comment above a key, one beside a value, one at the end. */
const COMMENTED = `{
  // Owen:  why this list exists
  "version": 1, // never 2
  "marks": {
    "j1": { "action": "approve" }
  }
}
// the end
`

describe("textFor():  the text a save writes", () => {
  test("no comment:  exactly JSON.stringify(value, null, 2), as before", () => {
    const value = { a: [1, { b: [] }], c: {}, s: "a // b" }
    expect(DataFile.textFor("", value)).toBe(`${JSON.stringify(value, null, 2)}\n`)
    expect(DataFile.textFor('{ "old": true }', value)).toBe(`${JSON.stringify(value, null, 2)}\n`)
  })

  test("every comment Owen added stays where it was, as keys change, come and go", () => {
    const text = DataFile.textFor(COMMENTED, {
      version: 1,
      marks: { j1: { action: "approve", at: "10/14" }, j2: { action: "todo" } }
    })
    expect(text).toBe(`{
  // Owen:  why this list exists
  "version": 1, // never 2
  "marks": {
    "j1": {
      "action": "approve",
      "at": "10/14"
    },
    "j2": {
      "action": "todo"
    }
  }
}
// the end
`)
    expect(DataFile.parse(text)).toEqual({
      version: 1,
      marks: { j1: { action: "approve", at: "10/14" }, j2: { action: "todo" } }
    })
  })

  test("saved again and again, the layout stays JSON.stringify's:  no blank lines, no hugged brackets", () => {
    let text = COMMENTED
    for (let n = 1; n <= 3; n++) text = DataFile.textFor(text, { version: 1, marks: {}, comments: [{ id: `cm${n}` }] })
    expect(text).not.toMatch(/\n\s*\n/)
    expect(text).toContain('  "comments": [\n    {\n      "id": "cm3"\n    }\n  ]')
    expect(text).toContain("// Owen:  why this list exists")
  })

  test("a null anywhere (json5-writer throws on one:  DataFile works around it)", () => {
    const text = DataFile.textFor(COMMENTED, { version: null, marks: { j1: null }, list: [null, { a: null }] })
    expect(DataFile.parse(text)).toEqual({ version: null, marks: { j1: null }, list: [null, { a: null }] })
    expect(text).toContain("// never 2")
  })

  test("a key holding undefined goes;  a class instance is its own fields;  keys and text in double quotes", () => {
    class Box {
      kept = "yes"
      gone: string | undefined = undefined
      get derived() {
        return "no"
      }
    }
    const text = DataFile.textFor('{\n  // a box\n  "kept": "no",\n  "gone": "was here"\n}', new Box())
    expect(DataFile.parse(text)).toEqual({ kept: "yes" })
    expect(text).toContain('"kept": "yes"')
  })
})

describe("the file:  .json5, its old .json read", () => {
  test("read():  the .json5 first, then the old .json;  undefined for neither", () => {
    const path = file("read/a.inbox.json5")
    expect(DataFile.read(path)).toBeUndefined()
    file("read/a.inbox.json", '{ "from": "old" }')
    expect(DataFile.read(path)).toEqual({ from: "old" })
    expect(DataFile.found(path)).toBe(join(root, "read/a.inbox.json"))
    file("read/a.inbox.json5", '{ "from": "new" } // comment')
    expect(DataFile.read(path)).toEqual({ from: "new" })
  })

  test("write():  the .json5, a comment kept from the old .json's text, which goes", () => {
    const path = file("write/b.answer.json5")
    file("write/b.answer.json", '{ "n": 1 }')
    DataFile.write(path, { n: 2 })
    expect(existsSync(join(root, "write/b.answer.json"))).toBe(false)
    writeFileSync(path, '{\n  // keep me\n  "n": 2\n}\n')
    DataFile.edit<{ n: number }>(path, (value) => ({ n: value!.n + 1 }))
    expect(readFileSync(path, "utf8")).toBe('{\n  // keep me\n  "n": 3\n}\n')
  })

  test("edited():  a save handed the current text (or the old file's), its comments kept", () => {
    const path = file("edited/favorites.json5")
    file("edited/favorites.json", '["airplane"]')
    const text = DataFile.edited<string[]>(path, "", (list) => [...list!, "seo"])
    expect(DataFile.parse(text)).toEqual(["airplane", "seo"])
    const again = DataFile.edited<string[]>(path, '[\n  // stars\n  "seo"\n]', (list) => [...list!, "x"])
    expect(again).toBe('[\n  // stars\n  "seo",\n  "x"\n]\n')
  })

  test("remove():  both names", () => {
    const path = file("remove/c.draft.json5", "{}")
    file("remove/c.draft.json", "{}")
    DataFile.remove(path)
    expect(DataFile.exists(path)).toBe(false)
  })
})

describe("epic migrate:  renames and links", () => {
  test("moveOf() / rename():  .json -> .json5;  a clash (both there) is left", () => {
    const old = file("move/d.rows.json", "{}")
    const move = DataFile.moveOf(old)
    expect(move).toEqual({ from: old, to: join(root, "move/d.rows.json5"), clash: false })
    expect(DataFile.rename(move)).toBe(true)
    expect(DataFile.rename(move)).toBe(false)
    file("move/e.rows.json", "{}")
    file("move/e.rows.json5", "{}")
    const clash = DataFile.moveOf(join(root, "move/e.rows.json"))
    expect(clash.clash).toBe(true)
    expect(DataFile.rename(clash)).toBe(false)
  })

  test("linkFor():  a link to a data file by its old name, whatever it points from;  nothing else", () => {
    const epic = join(root, "epics", "seo")
    expect(DataFile.linkFor("../home.json", epic, root)).toBe("../home.json5")
    expect(DataFile.linkFor("seo.inbox.json#marks", epic, root)).toBe("seo.inbox.json5#marks")
    expect(DataFile.linkFor("details/names.rows.json", epic, root)).toBe("details/names.rows.json5")
    expect(DataFile.linkFor("agents.json", epic, root)).toBe("agents.json5")
    expect(DataFile.linkFor("../../sagas/sagas.json", epic, root)).toBe("../../sagas/sagas.json5")
    expect(DataFile.linkFor("../../guides/dev/commands/commands.json", epic, root)).toBe(
      "../../guides/dev/commands/commands.json5"
    )
    for (const other of ["../../package.json", "seo.inbox.json5", "https://x.dev/a.inbox.json", "#j3", "notes.json"])
      expect(DataFile.linkFor(other, epic, root)).toBeUndefined()
  })
})
