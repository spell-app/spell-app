import { describe, test, expect } from "vite-plus/test"
import { SpellLocation } from "$/spell/SpellLocation"

// spell's project groups are spaces':  registered as it loads
import "@spell-app/spaces/models/projectGroups"

// Make sure we don't re-use registry items.
SpellLocation.useRegistry = false

/** An address:  a group's, a project, then a file or a folder, one slash between each (epic `people-and-orgs` P4, Q41). */
describe("SpellLocation", () => {
  describe("creation", () => {
    test("Can create via `new`", () => {
      const location = new SpellLocation("owen@spell/project")
      expect(location).toBeInstanceOf(SpellLocation)
    })
    test("if `useRegistry` is set, Creating via `new SpellLocation()` always returns the same object", () => {
      SpellLocation.useRegistry = true
      const location1 = new SpellLocation("owen@spell/project")
      const location2 = new SpellLocation("owen@spell/project")
      SpellLocation.useRegistry = false
      expect(location1).toBe(location2)
    })
  })

  describe("valid project paths", () => {
    test("a person's project", () => {
      const path = new SpellLocation("owen@spell/project")
      expect(path.path).toBe("owen@spell/project")
      expect(path.projectId).toBe("owen@spell/project")
      expect(path.projectRoot).toBe("owen@spell")
      expect(path.space).toBe("owen@spell")
      expect(path.domain).toBe("projects")
      expect(path.projectName).toBe("project")
      expect(path.filePath).toBe(undefined)
      expect(path.folder).toBe(undefined)
      expect(path.file).toBe(undefined)
      expect(path.fileName).toBe(undefined)
      expect(path.extension).toBe(undefined)
      expect(path.isProjectPath).toBe(true)
      expect(path.isFolderPath).toBe(false)
      expect(path.isFilePath).toBe(false)
    })

    test("a built-in project:  in its group of the `@spell` space", () => {
      const path = new SpellLocation("@spell/examples/solitaire")
      expect(path.projectRoot).toBe("@spell/examples")
      expect(path.space).toBe("@spell")
      expect(path.domain).toBe("examples")
      expect(path.projectName).toBe("solitaire")
      expect(path.isProjectPath).toBe(true)
      expect(path.isFolderPath).toBe(false)
      expect(path.isFilePath).toBe(false)
    })

    test("a slash after the project:  its own folder", () => {
      const path = new SpellLocation("@spell/examples/project/")
      expect(path.filePath).toBe("/")
      expect(path.folder).toBe("/")
      expect(path.file).toBe(undefined)
      expect(path.isProjectPath).toBe(false)
      expect(path.isFolderPath).toBe(true)
      expect(path.isFilePath).toBe(false)
    })

    test("a folder ends in a slash", () => {
      const path = new SpellLocation("@spell/examples/project/folder/")
      expect(path.folder).toBe("/folder/")
      expect(path.isFolderPath).toBe(true)
    })

    test("a group alone", () => {
      const path = new SpellLocation("owen@spell")
      expect(path.isProjectRoot).toBe(true)
      expect(path.isProjectPath).toBe(false)
      expect(path.isFolderPath).toBe(false)
      expect(path.isFilePath).toBe(false)
      expect(path.projectId).toBe("owen@spell")
    })
  })

  describe("invalid project paths", () => {
    test("an unknown space or group", () => {
      expect(() => new SpellLocation("@nobody/projects/project")).toThrow()
      expect(() => new SpellLocation("matt@spell/project")).toThrow()
    })
    test("the old forms", () => {
      expect(() => new SpellLocation("@user:projects:project")).toThrow()
      expect(() => new SpellLocation("@system:examples:Solitaire/Card.spell")).toThrow()
      expect(() => new SpellLocation("@examples/Solitaire")).toThrow()
    })
    test("no dot and no slash at the end:  a page of the app (or a type), never a location", () => {
      expect(() => new SpellLocation("owen@spell/solitaire/rules")).toThrow(/a file's name has a dot/)
      expect(() => new SpellLocation("owen@spell/solitaire/folder/README")).toThrow(/a file's name has a dot/)
    })
    test("a space's own file isn't read yet:  a project's name holds no dot", () => {
      expect(() => new SpellLocation("owen@spell/__me.json5")).toThrow()
    })
    test("the two slashes before Q41:  an empty part", () => {
      expect(() => new SpellLocation("@spell/examples/solitaire//Card.spell")).toThrow(/an empty part/)
    })
  })

  describe("valid file paths", () => {
    test("valid file path with no folder and normal extension", () => {
      const path = new SpellLocation("owen@spell/project/FILE.EXTENSION")
      expect(path.path).toBe("owen@spell/project/FILE.EXTENSION")
      expect(path.projectId).toBe("owen@spell/project")
      expect(path.space).toBe("owen@spell")
      expect(path.domain).toBe("projects")
      expect(path.projectName).toBe("project")
      expect(path.filePath).toBe("/FILE.EXTENSION")
      expect(path.folder).toBe("/")
      expect(path.file).toBe("FILE.EXTENSION")
      expect(path.fileName).toBe("FILE")
      expect(path.extension).toBe(".EXTENSION")
      expect(path.isProjectPath).toBe(false)
      expect(path.isFolderPath).toBe(false)
      expect(path.isFilePath).toBe(true)
    })

    test("valid file path with single folder and normal extension", () => {
      const path = new SpellLocation("owen@spell/project/FOLDER/FILE.EXTENSION")
      expect(path.projectId).toBe("owen@spell/project")
      expect(path.projectName).toBe("project")
      expect(path.filePath).toBe("/FOLDER/FILE.EXTENSION")
      expect(path.folder).toBe("/FOLDER/")
      expect(path.file).toBe("FILE.EXTENSION")
      expect(path.fileName).toBe("FILE")
      expect(path.extension).toBe(".EXTENSION")
      expect(path.isFilePath).toBe(true)
    })

    test("valid file path with two folders and normal extension", () => {
      const path = new SpellLocation("owen@spell/project/FOLDER1/FOLDER2/FILE.EXTENSION")
      expect(path.projectId).toBe("owen@spell/project")
      expect(path.filePath).toBe("/FOLDER1/FOLDER2/FILE.EXTENSION")
      expect(path.folder).toBe("/FOLDER1/FOLDER2/")
      expect(path.file).toBe("FILE.EXTENSION")
      expect(path.isFilePath).toBe(true)
    })

    test("valid file path with multi-part extension", () => {
      const path = new SpellLocation("owen@spell/project/FILE.EXT1.EXT2")
      expect(path.filePath).toBe("/FILE.EXT1.EXT2")
      expect(path.file).toBe("FILE.EXT1.EXT2")
      expect(path.fileName).toBe("FILE")
      expect(path.extension).toBe(".EXT1.EXT2")
      expect(path.isFolderPath).toBe(false)
      expect(path.isFilePath).toBe(true)
    })

    test("valid file path with hidden name and no extension", () => {
      const path = new SpellLocation("owen@spell/project/.FILE")
      expect(path.filePath).toBe("/.FILE")
      expect(path.file).toBe(".FILE")
      expect(path.fileName).toBe(".FILE")
      expect(path.extension).toBe(undefined)
      expect(path.isFolderPath).toBe(false)
      expect(path.isFilePath).toBe(true)
    })

    test("valid file path with hidden name and multi-part extension", () => {
      const path = new SpellLocation("owen@spell/project/.FILE.EXT1.EXT2")
      expect(path.filePath).toBe("/.FILE.EXT1.EXT2")
      expect(path.file).toBe(".FILE.EXT1.EXT2")
      expect(path.fileName).toBe(".FILE")
      expect(path.extension).toBe(".EXT1.EXT2")
      expect(path.isFolderPath).toBe(false)
      expect(path.isFilePath).toBe(true)
    })
  })

  describe("invalid file paths", () => {
    test("`.` paths throw", () => {
      expect(() => new SpellLocation("owen@spell/project/relative/./path")).toThrow()
    })
    test("`..` paths throw", () => {
      expect(() => new SpellLocation("owen@spell/project/relative/../path")).toThrow()
    })
    test("weird characters paths throw", () => {
      expect(() => new SpellLocation("owen@spell/project/weird@path")).toThrow()
      expect(() => new SpellLocation("owen@spell/project/weird^path")).toThrow()
      expect(() => new SpellLocation("owen@spell/project/weird(path")).toThrow()
      expect(() => new SpellLocation("owen@spell/project/weird)path")).toThrow()
    })
  })

  describe("building and reading addresses", () => {
    test("a file in a project:  `join()`, `getFileLocation()`", () => {
      expect(SpellLocation.join("@spell/library/cards", "/Card.spell")).toBe("@spell/library/cards/Card.spell")
      expect(SpellLocation.join("@spell/library/cards", "Card.spell")).toBe("@spell/library/cards/Card.spell")
      expect(SpellLocation.getFileLocation("@spell/library/cards", "a/Card.spell").path).toBe(
        "@spell/library/cards/a/Card.spell"
      )
      // an address of its own is taken whole
      expect(SpellLocation.getFileLocation("owen@spell/errors", "@spell/library/cards/Card.spell").path).toBe(
        "@spell/library/cards/Card.spell"
      )
    })
    test("an address, or a file's path in a project:  `isAddress()`", () => {
      expect(SpellLocation.isAddress("@spell/library/cards")).toBe(true)
      expect(SpellLocation.isAddress("owen@spell/errors")).toBe(true)
      expect(SpellLocation.isAddress("/Card.spell")).toBe(false)
      expect(SpellLocation.isAddress("folder/Card.spell")).toBe(false)
    })
    test("an app URL's tail:  each part decoded", () => {
      expect(SpellLocation.addressForUrl("@spell/examples/solitaire/a%20b.spell")).toBe(
        "@spell/examples/solitaire/a b.spell"
      )
    })
    test("an app URL from an address:  `/edit/` and `/run/`, the address as it is", () => {
      const location = new SpellLocation("@spell/examples/solitaire/Card.spell")
      expect(location.editorUrl).toBe("/edit/@spell/examples/solitaire/Card.spell")
      expect(new SpellLocation("owen@spell/errors").runnerUrl).toBe("/run/owen@spell/errors")
    })
    test("a type's address:  its project, its name, and a version at its end, `__v2` (decisions J3, J51)", () => {
      expect(SpellLocation.typeFor("@spell/library/people/Person")).toEqual({
        projectId: "@spell/library/people",
        type: "Person"
      })
      expect(SpellLocation.typeFor("@spell/library/people/Person__v2")).toEqual({
        projectId: "@spell/library/people",
        type: "Person",
        version: 2
      })
      expect(SpellLocation.typeFor("owen@spell/solitaire/Card__v12").version).toBe(12)
      for (const address of [
        "@spell/library/people",
        "@spell/library/people/Card.spell",
        "people/Person",
        "@spell/library/a-b"
      ])
        expect(() => SpellLocation.typeFor(address), address).toThrow(/not a type's address/)
    })
    test("a project's name, lower-kebab, and its title (decision Q39)", () => {
      expect(SpellLocation.kebab("Drawable Solitaire")).toBe("drawable-solitaire")
      expect(SpellLocation.kebab("OutlineSolitaire")).toBe("outline-solitaire")
      expect(SpellLocation.kebab("Todos - Form Based")).toBe("todos-form-based")
      expect(SpellLocation.kebab("  ")).toBe("")
      expect(SpellLocation.titleFor("drawable-solitaire")).toBe("Drawable Solitaire")
      expect(SpellLocation.titleFor("errors")).toBe("Errors")
      expect(SpellLocation.titleFor("My Folder")).toBe("My Folder")
    })
  })
})
