import { describe, expect, test } from "vite-plus/test"

import { SP } from "$/spell"

// spell's project groups are spaces':  registered as it loads
import "$/spaces/models/projectGroups"

/**
 * `SP.SpellUrls`:  a project's files' URLs and its folder (epic `people-and-orgs` P15, J48);  since P4, every URL holds
 * the address as it is.
 * - That the page server and spaces' disk reader both ANSWER these URLs:  spaces' `api.test.ts`.
 */
describe("SpellUrls", () => {
  test("a file's URL:  its address, `//` and all;  saving it is a call", () => {
    expect(SP.SpellUrls.fileUrl("@spell/examples/solitaire//Card.spell")).toBe(
      "/spaces/@spell/examples/solitaire//Card.spell"
    )
    expect(SP.SpellUrls.saveUrl("owen@spell/errors//folder/1.spell")).toBe(
      "/api/projects/file/owen@spell/errors//folder/1.spell"
    )
    expect(SP.SpellUrls.fileUrl(new SP.SpellLocation("@spell/test/fizzbuzz//FizzBuzz.spell"))).toBe(
      "/spaces/@spell/test/fizzbuzz//FizzBuzz.spell"
    )
    expect(SP.SpellUrls.indexUrl("@spell/examples/solitaire")).toBe("/api/projects/index/@spell/examples/solitaire")
    expect(SP.SpellUrls.listUrl("owen@spell")).toBe("/api/projects/list/owen@spell")
  })

  test("a file's URL needs a file:  an address with no `//` throws", () => {
    expect(() => SP.SpellUrls.fileUrl("@spell/examples/solitaire")).toThrow(/isn't a file's address/)
  })

  test("each part is encoded on its own:  the `//` and the `@` stay as they are", () => {
    const url = SP.SpellUrls.fileUrl("@local/My Folder/my project//a folder/Card #2.spell")
    expect(url).toBe("/spaces/@local/My%20Folder/my%20project//a%20folder/Card%20%232.spell")
    expect(SP.SpellUrls.encodeAddress("owen@spell/errors//x y.spell")).toBe("owen@spell/errors//x%20y.spell")
  })

  test("back from a URL:  split at the FIRST `//`, from `/spaces/`, `/api/projects/file/` or the tail alone", () => {
    const solitaire = {
      projectId: "@spell/examples/solitaire",
      filePath: "/Card.spell",
      path: "@spell/examples/solitaire//Card.spell"
    }
    expect(SP.SpellUrls.fileForUrl("/spaces/@spell/examples/solitaire//Card.spell?x=1")).toEqual(solitaire)
    expect(SP.SpellUrls.fileForUrl("/api/projects/file/@spell/examples/solitaire//Card.spell")).toEqual(solitaire)
    expect(SP.SpellUrls.fileForUrl("@spell/examples/solitaire//Card.spell")).toEqual(solitaire)
    expect(SP.SpellUrls.fileForUrl("/spaces/@spell/examples/solitaire//a%20folder/Card%20%232.spell")).toMatchObject({
      filePath: "/a folder/Card #2.spell"
    })
    // the file's own `//` is part of the file:  only the first one splits
    expect(SP.SpellUrls.fileForUrl("/spaces/owen@spell/errors//a//b.spell").filePath).toBe("/a//b.spell")
  })

  test("a URL that names no project's file throws", () => {
    expect(() => SP.SpellUrls.fileForUrl("/spaces/@spell/examples/solitaire/Card.spell")).toThrow(/no '\/\/'/)
    expect(() => SP.SpellUrls.fileForUrl("/spaces/@nobody/x//Card.spell")).toThrow(/no project group there/)
    expect(() => SP.SpellUrls.fileForUrl("/spaces/@spell/examples/a/b//Card.spell")).toThrow(/no project group/)
    expect(() => SP.SpellUrls.fileForUrl("/spaces/@spell/examples/solitaire//%E0")).toThrow(/can't decode/)
  })

  test("the longest group's address wins:  `@spell/test`'s, not another of `@spell`'s", () => {
    expect(SP.SpellUrls.projectIdFor("@spell/test/fizzbuzz")).toBe("@spell/test/fizzbuzz")
    expect(SP.SpellUrls.projectIdFor("@spell/examples")).toBe("@spell/examples")
    expect(SP.SpellUrls.projectIdFor("/api/projects/index/owen@spell/errors")).toBe("owen@spell/errors")
  })

  test("a page of a running app is left out:  what follows its project with no `//` (decision Q32)", () => {
    expect(SP.SpellUrls.withoutPage("owen@spell/solitaire/rules")).toBe("owen@spell/solitaire")
    expect(SP.SpellUrls.withoutPage("@spell/examples/solitaire/rules/more")).toBe("@spell/examples/solitaire")
    expect(SP.SpellUrls.withoutPage("@spell/examples/solitaire")).toBe("@spell/examples/solitaire")
    expect(SP.SpellUrls.withoutPage("@spell/examples")).toBe("@spell/examples")
    expect(SP.SpellUrls.withoutPage("@spell/examples/solitaire//a/b.spell")).toBe(
      "@spell/examples/solitaire//a/b.spell"
    )
    expect(SP.SpellUrls.withoutPage("@nobody/x/y")).toBe("@nobody/x/y")
  })

  test("an address's folder:  the built-ins, the test projects, or a space in spell-spaces", () => {
    expect(SP.SpellUrls.folderFor("@spell/examples/solitaire")).toEqual({
      base: "builtins",
      path: "@spell/examples/solitaire"
    })
    expect(SP.SpellUrls.folderFor("@spell/test/fizzbuzz")).toEqual({ base: "tests", path: "@spell/test/fizzbuzz" })
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
      SP.SpellUrls.fileUrl("@spell/library/cards//Pile.spell"),
      SP.SpellUrls.saveUrl("@spell/library/cards//Pile.spell"),
      SP.SpellUrls.indexUrl("@spell/library/cards"),
      SP.SpellUrls.listUrl("@spell/library")
    ]
    for (const url of urls) {
      expect(url).toMatch(/^\/(spaces|api)\//)
      expect(url).not.toContain("..")
    }
  })
})
