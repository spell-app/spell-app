import { SpellFileLocation } from "~/languages/spell"

describe("SpellFileLocation", () => {
  describe("creation", () => {
    test("Can create via `new`", () => {
      const location = new SpellFileLocation("/projects/PROJECT")
      expect(location).toBeInstanceOf(SpellFileLocation)
    })
    test("Creating via `new SpellFileLocation()` always returns the same object", () => {
      const location1 = new SpellFileLocation("/projects/PROJECT")
      const location2 = new SpellFileLocation("/projects/PROJECT")
      expect(location1).toBe(location2)
    })
  })

  describe("valid project paths", () => {
    test("valid project path", () => {
      const path = new SpellFileLocation("/projects/PROJECT")
      expect(path.path).toBe("/projects/PROJECT")
      expect(path.projectPath).toBe("/projects/PROJECT")
      expect(path.projectType).toBe("projects")
      expect(path.isSystemProject).toBe(false)
      expect(path.isUserProject).toBe(true)
      expect(path.projectId).toBe("PROJECT")
      expect(path.filePath).toBe(undefined)
      expect(path.folder).toBe(undefined)
      expect(path.fileName).toBe(undefined)
      expect(path.name).toBe(undefined)
      expect(path.extension).toBe(undefined)
      expect(path.isValidProjectPath).toBe(true)
      expect(path.isValidFilePath).toBe(false)
    })

    test("valid library path", () => {
      const path = new SpellFileLocation("/library/PROJECT")
      expect(path.isSystemProject).toBe(true)
      expect(path.isUserProject).toBe(false)
      expect(path.isValidProjectPath).toBe(true)
      expect(path.isValidFilePath).toBe(false)
    })

    test("trailing slash is ignored", () => {
      const path = new SpellFileLocation("/library/PROJECT/")
      expect(path.filePath).toBe(undefined)
      expect(path.folder).toBe(undefined)
      expect(path.fileName).toBe(undefined)
      expect(path.isValidProjectPath).toBe(true)
      expect(path.isValidFilePath).toBe(false)
    })
  })

  describe("invalid project paths", () => {
    test("invalid projectType", () => {
      const path = new SpellFileLocation("/boo/PROJECT")
      expect(path.isSystemProject).toBe(false)
      expect(path.isUserProject).toBe(false)
      expect(path.isValidProjectPath).toBe(false)
    })
    test("no project name", () => {
      const path = new SpellFileLocation("/library")
      expect(path.isSystemProject).toBe(true)
      expect(path.isUserProject).toBe(false)
      expect(path.isValidProjectPath).toBe(false)
    })
  })

  describe("valid file paths", () => {
    test("valid file path with no folder and normal extension", () => {
      const path = new SpellFileLocation("/projects/PROJECT/FILE.EXTENSION")
      expect(path.path).toBe("/projects/PROJECT/FILE.EXTENSION")
      expect(path.projectPath).toBe("/projects/PROJECT")
      expect(path.projectType).toBe("projects")
      expect(path.isSystemProject).toBe(false)
      expect(path.isUserProject).toBe(true)
      expect(path.projectId).toBe("PROJECT")
      expect(path.filePath).toBe("/FILE.EXTENSION")
      expect(path.folder).toBe(undefined)
      expect(path.fileName).toBe("FILE.EXTENSION")
      expect(path.name).toBe("FILE")
      expect(path.extension).toBe(".EXTENSION")
      expect(path.isValidProjectPath).toBe(false)
      expect(path.isValidFilePath).toBe(true)
    })

    test("valid file path with folder and normal extension", () => {
      const path = new SpellFileLocation("/projects/PROJECT/FOLDER/FILE.EXTENSION")
      expect(path.projectPath).toBe("/projects/PROJECT")
      expect(path.projectType).toBe("projects")
      expect(path.isSystemProject).toBe(false)
      expect(path.isUserProject).toBe(true)
      expect(path.projectId).toBe("PROJECT")
      expect(path.filePath).toBe("/FOLDER/FILE.EXTENSION")
      expect(path.folder).toBe("/FOLDER")
      expect(path.fileName).toBe("FILE.EXTENSION")
      expect(path.name).toBe("FILE")
      expect(path.extension).toBe(".EXTENSION")
      expect(path.isValidProjectPath).toBe(false)
      expect(path.isValidFilePath).toBe(true)
    })

    test("valid file path with no extension", () => {
      const path = new SpellFileLocation("/projects/PROJECT/FILE")
      expect(path.filePath).toBe("/FILE")
      expect(path.folder).toBe(undefined)
      expect(path.fileName).toBe("FILE")
      expect(path.name).toBe("FILE")
      expect(path.extension).toBe("")
      expect(path.isValidFilePath).toBe(true)
    })

    test("valid file path with multi-part extension", () => {
      const path = new SpellFileLocation("/projects/PROJECT/FILE.EXT1.EXT2")
      expect(path.filePath).toBe("/FILE.EXT1.EXT2")
      expect(path.fileName).toBe("FILE.EXT1.EXT2")
      expect(path.name).toBe("FILE")
      expect(path.extension).toBe(".EXT1.EXT2")
      expect(path.isValidFilePath).toBe(true)
    })

    test("valid file path with hidden name and no extension", () => {
      const path = new SpellFileLocation("/projects/PROJECT/.FILE")
      expect(path.filePath).toBe("/.FILE")
      expect(path.fileName).toBe(".FILE")
      expect(path.name).toBe(".FILE")
      expect(path.extension).toBe("")
      expect(path.isValidFilePath).toBe(true)
    })

    test("valid file path with hidden name and multi-part extension", () => {
      const path = new SpellFileLocation("/projects/PROJECT/.FILE.EXT1.EXT2")
      expect(path.filePath).toBe("/.FILE.EXT1.EXT2")
      expect(path.fileName).toBe(".FILE.EXT1.EXT2")
      expect(path.name).toBe(".FILE")
      expect(path.extension).toBe(".EXT1.EXT2")
      expect(path.isValidFilePath).toBe(true)
    })
  })

  describe("invalid file paths", () => {})
})
