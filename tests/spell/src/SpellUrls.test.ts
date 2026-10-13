import { describe, expect, test } from "vite-plus/test"

import { SP } from "$/spell"

// spell's project groups are spaces':  registered as it loads
import "$/spaces/models/projectGroups"

/**
 * `SP.SpellUrls`:  a project's place, its files' URLs and its folder (epic `people-and-orgs` P15, J48).
 * - That the page server and spaces' disk reader both ANSWER these URLs:  spaces' `api.test.ts`.
 */
describe("SpellUrls", () => {
  test("a project's place is its group's, then its name;  a group's is its own", () => {
    expect(SP.SpellUrls.placeFor("@system:examples:Solitaire")).toBe("@spell/examples/Solitaire")
    expect(SP.SpellUrls.placeFor("@system:examples")).toBe("@spell/examples")
    expect(SP.SpellUrls.placeFor("@test:fixtures:FizzBuzz")).toBe("@spell/test/FizzBuzz")
    expect(SP.SpellUrls.placeFor("@user:projects:errors")).toBe("owen@spell/errors")
    expect(SP.SpellUrls.placeFor("@library/cards")).toBe("@spell/library/cards")
  })

  test("a file's URL:  its place, `//`, the file;  saving it is a call", () => {
    expect(SP.SpellUrls.fileUrl("@system:examples:Solitaire/Card.spell")).toBe(
      "/spaces/@spell/examples/Solitaire//Card.spell"
    )
    expect(SP.SpellUrls.saveUrl("@user:projects:errors/folder/1.spell")).toBe(
      "/api/projects/file/owen@spell/errors//folder/1.spell"
    )
    expect(SP.SpellUrls.fileUrl(new SP.SpellLocation("@test/FizzBuzz/FizzBuzz.spell"))).toBe(
      "/spaces/@spell/test/FizzBuzz//FizzBuzz.spell"
    )
    expect(SP.SpellUrls.indexUrl("@system:examples:Solitaire")).toBe("/api/projects/index/@spell/examples/Solitaire")
    expect(SP.SpellUrls.listUrl("@user:projects")).toBe("/api/projects/list/owen@spell")
  })

  test("each part is encoded on its own:  the `//` and the `@` stay as they are", () => {
    const url = SP.SpellUrls.fileUrl("@system:examples:Drawable Solitaire/a folder/Card #2.spell")
    expect(url).toBe("/spaces/@spell/examples/Drawable%20Solitaire//a%20folder/Card%20%232.spell")
    expect(SP.SpellUrls.fileForUrl(url)).toEqual({
      projectId: "@system:examples:Drawable Solitaire",
      filePath: "/a folder/Card #2.spell",
      path: "@system:examples:Drawable Solitaire/a folder/Card #2.spell"
    })
  })

  test("back from a URL:  split at the FIRST `//`, from `/spaces/`, `/api/projects/file/` or the tail alone", () => {
    const solitaire = { projectId: "@system:examples:Solitaire", filePath: "/Card.spell" }
    expect(SP.SpellUrls.fileForUrl("/spaces/@spell/examples/Solitaire//Card.spell?x=1")).toMatchObject(solitaire)
    expect(SP.SpellUrls.fileForUrl("/api/projects/file/@spell/examples/Solitaire//Card.spell")).toMatchObject(solitaire)
    expect(SP.SpellUrls.fileForUrl("@spell/examples/Solitaire//Card.spell")).toMatchObject(solitaire)
    // the file's own `//` is part of the file:  only the first one splits
    expect(SP.SpellUrls.fileForUrl("/spaces/owen@spell/errors//a//b.spell").filePath).toBe("/a//b.spell")
  })

  test("a URL that names no project's file throws", () => {
    expect(() => SP.SpellUrls.fileForUrl("/spaces/@spell/examples/Solitaire/Card.spell")).toThrow(/no '\/\/'/)
    expect(() => SP.SpellUrls.fileForUrl("/spaces/@nobody/x//Card.spell")).toThrow(/no project group there/)
    expect(() => SP.SpellUrls.fileForUrl("/spaces/@spell/examples/a/b//Card.spell")).toThrow(/no project group/)
    expect(() => SP.SpellUrls.fileForUrl("/spaces/@spell/examples/Solitaire//%E0")).toThrow(/can't decode/)
  })

  test("the longest group's place wins:  `@spell/test` before `@spell`'s others", () => {
    expect(SP.SpellUrls.projectIdFor("@spell/test/FizzBuzz")).toBe("@test:fixtures:FizzBuzz")
    expect(SP.SpellUrls.projectIdFor("@spell/examples")).toBe("@system:examples")
    expect(SP.SpellUrls.projectIdFor("/api/projects/index/owen@spell/errors")).toBe("@user:projects:errors")
  })

  test("a place's folder:  the built-ins, the test projects, or a space in spell-spaces", () => {
    expect(SP.SpellUrls.folderFor("@spell/examples/Solitaire")).toEqual({
      base: "builtins",
      path: "@spell/examples/Solitaire"
    })
    expect(SP.SpellUrls.folderFor("@spell/test/FizzBuzz")).toEqual({ base: "tests", path: "@spell/test/FizzBuzz" })
    expect(SP.SpellUrls.folderFor("owen@spell/errors")).toEqual({ base: "spaces", path: "@spell/owen@/errors" })
    expect(SP.SpellUrls.folderFor("owen@spell")).toEqual({ base: "spaces", path: "@spell/owen@" })
    expect(SP.SpellUrls.folderFor("@three-degrees/bubble-trouble")).toEqual({
      base: "spaces",
      path: "@three-degrees/bubble-trouble"
    })
    expect(SP.SpellUrls.folderFor("matt@three-degrees/bubble-trouble/folder")).toEqual({
      base: "spaces",
      path: "@three-degrees/matt@/bubble-trouble/folder"
    })
    expect(SP.SpellUrls.folderFor("@local/my-folder")).toBeUndefined()
  })

  test("every URL is written whole:  it starts `/spaces/` or `/api/`, and never climbs `../` across the `//`", () => {
    const urls = [
      SP.SpellUrls.fileUrl("@system:library:cards/Pile.spell"),
      SP.SpellUrls.saveUrl("@system:library:cards/Pile.spell"),
      SP.SpellUrls.indexUrl("@system:library:cards"),
      SP.SpellUrls.listUrl("@system:library")
    ]
    for (const url of urls) {
      expect(url).toMatch(/^\/(spaces|api)\//)
      expect(url).not.toContain("..")
    }
  })
})
