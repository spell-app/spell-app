import { mkdtempSync, readdirSync, readFileSync, rmSync } from "fs"
import { tmpdir } from "os"
import { resolve } from "path"
import { fileURLToPath } from "url"
import { afterAll, describe, test, expect } from "vite-plus/test"

import { CLI } from "spell-app/cli"

/**
 * Each type of a compiled library, as JSON Schema for VS Code (`CLI.writeSchemas()`, epic `people-and-orgs` P5):
 * People's, the frozen test project's library, written into a temp folder -- never its build folder.
 */
describe("writeSchemas()", () => {
  // spell's frozen test projects, beside the built-in groups:  `spaces/@spell/test/` at the repo's root
  const people = "../../spaces/@spell/test/people/people.lib.snapshot.ts"
  const library = fileURLToPath(new URL(people, import.meta.url))
  const folder = mkdtempSync(resolve(tmpdir(), "spell-schemas-"))
  afterAll(() => rmSync(folder, { recursive: true, force: true }))

  test("one schema per type the library exports", async () => {
    const wrote = await CLI.writeSchemas(library, folder)
    expect(wrote.map((path) => path.slice(folder.length + 1)).sort()).toEqual([
      "DatedEvent.schema.json",
      "FriendList.schema.json",
      "Note.schema.json",
      "Person.schema.json",
      "Relationship.schema.json"
    ])
    expect(readdirSync(folder)).toHaveLength(5)
  })

  test("a type's schema holds its declared properties, and refuses others", () => {
    const person = JSON.parse(readFileSync(resolve(folder, "Person.schema.json"), "utf8"))
    expect(person.title).toBe("Person")
    expect(Object.keys(person.properties)).toEqual(
      expect.arrayContaining(["$type", "id", "name", "nickname", "emails", "dates"])
    )
    expect(person.properties.emails).toEqual({ type: "array", items: { type: ["string", "null"] } })
    expect(person.additionalProperties).toBe(false)
  })
})
