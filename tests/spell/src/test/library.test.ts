import { build } from "esbuild"
import { fileURLToPath } from "url"
import { describe, test, expect } from "vite-plus/test"

/**
 * A compiled LIBRARY imported as other code imports it (the `ts/lib` target, epic `people-and-orgs` P3):
 * People's, `People.lib.snapshot.ts`, which `fixtures.test.ts` keeps up to date.
 * - Its module graph has no Solid, and no drawing:  it loads the core through `@spell-app/core/model`.
 * - Importing it runs nothing but its classes:  no heading, no test, no thing made.
 * - What it makes is a plain thing, in no running program's list.
 */
describe("a compiled library", () => {
  // by its path, not `fixturePath()`:  $/spell/test loads the whole core, and the model must be alone here
  const library = fileURLToPath(new URL("../../../spaces/@spell/test/people/people.lib.snapshot.ts", import.meta.url))

  test("loads no Solid, and nothing that draws", async () => {
    // every module it loads, as a bundler finds them:  the core by its package, then the core's own aliases
    const { metafile } = await build({
      entryPoints: [library],
      bundle: true,
      write: false,
      metafile: true,
      format: "esm",
      platform: "node",
      logLevel: "silent"
    })
    const local = Object.keys(metafile.inputs)
    expect(local.some((path) => path.endsWith("core/src/model.ts"))).toBe(true)
    expect(local.filter((path) => /drawing|Drawable|elements|things\.ts/.test(path))).toEqual([])
    expect(local.filter((path) => /solid/.test(path))).toEqual([])
  })

  test("exports its classes, and runs nothing else", async () => {
    const People = await import(library)
    expect(Object.keys(People).sort()).toEqual(["DatedEvent", "FriendList", "Note", "Person", "Relationship"])
    const owen = new People.Person({ id: "owen", name: "Owen" })
    owen.emails.add("owen@example.com")
    expect([owen.id, owen.name, [...owen.emails]]).toEqual(["owen", "Owen", ["owen@example.com"]])
  })

  test("its things are saved and loaded by id, with no running program", async () => {
    const People = await import(library)
    const { Saver, Loader, spellCore } = await import("$/core/model")
    // no program's list of things:  the model leaves it out
    expect("things" in spellCore).toBe(false)
    const matt = new People.Person({ id: "matt", name: "Matt" })
    const family = new People.FriendList({ name: "family" })
    family.relationships.add(new People.Relationship({ kind: "brother", person: matt }))
    const { root, entries } = new Saver().save(family)
    const loaded = new Loader({
      entryFor: (ref) => entries.get(ref),
      classNamed: (name) => People[name]
    }).load(root)
    expect(loaded).toBeInstanceOf(People.FriendList)
    expect((loaded as typeof family).relationships.getItem(0).person.name).toBe("Matt")
  })
})
