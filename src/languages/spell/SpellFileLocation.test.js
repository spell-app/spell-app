import { SpellFileLocation } from "./SpellFileLocation"

describe("SpellFileLocation", () => {
  describe("valid project paths", () => {
    test("valid project path", () => {
      const path = new SpellFileLocation("project/PROJECT")
      expect(path.path).toBe("project/PROJECT")
      expect(path.projectPath).toBe("project/PROJECT")
      expect(path.projectType).toBe("project")
      expect(path.isLibraryProject).toBe(false)
      expect(path.isUserProject).toBe(true)
      expect(path.projectName).toBe("PROJECT")
      expect(path.filePath).toBe(undefined)
      expect(path.folder).toBe(undefined)
      expect(path.fileName).toBe(undefined)
      expect(path.name).toBe(undefined)
      expect(path.extension).toBe(undefined)
      expect(path.isValidProjectPath).toBe(true)
      expect(path.isValidFilePath).toBe(false)
    })

    test("valid library path", () => {
      const path = new SpellFileLocation("library/PROJECT")
      expect(path.isLibraryProject).toBe(true)
      expect(path.isUserProject).toBe(false)
      expect(path.isValidProjectPath).toBe(true)
      expect(path.isValidFilePath).toBe(false)
    })

    test("trailing slash is ignored", () => {
      const path = new SpellFileLocation("library/PROJECT/")
      expect(path.filePath).toBe(undefined)
      expect(path.folder).toBe(undefined)
      expect(path.fileName).toBe(undefined)
      expect(path.isValidProjectPath).toBe(true)
      expect(path.isValidFilePath).toBe(false)
    })
  })

  describe("invalid project paths", () => {
    test("invalid projectType", () => {
      const path = new SpellFileLocation("boo/PROJECT")
      expect(path.isLibraryProject).toBe(false)
      expect(path.isUserProject).toBe(false)
      expect(path.isValidProjectPath).toBe(false)
    })
    test("no project name", () => {
      const path = new SpellFileLocation("library")
      expect(path.isLibraryProject).toBe(true)
      expect(path.isUserProject).toBe(false)
      expect(path.isValidProjectPath).toBe(false)
    })
  })

  describe("valid file paths", () => {
    test("valid file path with no folder and normal extension", () => {
      const path = new SpellFileLocation("project/PROJECT/FILE.EXTENSION")
      expect(path.path).toBe("project/PROJECT/FILE.EXTENSION")
      expect(path.projectPath).toBe("project/PROJECT")
      expect(path.projectType).toBe("project")
      expect(path.isLibraryProject).toBe(false)
      expect(path.isUserProject).toBe(true)
      expect(path.projectName).toBe("PROJECT")
      expect(path.filePath).toBe("/FILE.EXTENSION")
      expect(path.folder).toBe(undefined)
      expect(path.fileName).toBe("FILE.EXTENSION")
      expect(path.name).toBe("FILE")
      expect(path.extension).toBe(".EXTENSION")
      expect(path.isValidProjectPath).toBe(false)
      expect(path.isValidFilePath).toBe(true)
    })

    test("valid file path with folder and normal extension", () => {
      const path = new SpellFileLocation("project/PROJECT/FOLDER/FILE.EXTENSION")
      expect(path.projectPath).toBe("project/PROJECT")
      expect(path.projectType).toBe("project")
      expect(path.isLibraryProject).toBe(false)
      expect(path.isUserProject).toBe(true)
      expect(path.projectName).toBe("PROJECT")
      expect(path.filePath).toBe("/FOLDER/FILE.EXTENSION")
      expect(path.folder).toBe("/FOLDER")
      expect(path.fileName).toBe("FILE.EXTENSION")
      expect(path.name).toBe("FILE")
      expect(path.extension).toBe(".EXTENSION")
      expect(path.isValidProjectPath).toBe(false)
      expect(path.isValidFilePath).toBe(true)
    })

    test("valid file path with no extension", () => {
      const path = new SpellFileLocation("project/PROJECT/FILE")
      expect(path.filePath).toBe("/FILE")
      expect(path.folder).toBe(undefined)
      expect(path.fileName).toBe("FILE")
      expect(path.name).toBe("FILE")
      expect(path.extension).toBe("")
      expect(path.isValidFilePath).toBe(true)
    })

    test("valid file path with multi-part extension", () => {
      const path = new SpellFileLocation("project/PROJECT/FILE.EXT1.EXT2")
      expect(path.filePath).toBe("/FILE.EXT1.EXT2")
      expect(path.fileName).toBe("FILE.EXT1.EXT2")
      expect(path.name).toBe("FILE")
      expect(path.extension).toBe(".EXT1.EXT2")
      expect(path.isValidFilePath).toBe(true)
    })

    test("valid file path with hidden name and no extension", () => {
      const path = new SpellFileLocation("project/PROJECT/.FILE")
      expect(path.filePath).toBe("/.FILE")
      expect(path.fileName).toBe(".FILE")
      expect(path.name).toBe(".FILE")
      expect(path.extension).toBe("")
      expect(path.isValidFilePath).toBe(true)
    })

    test("valid file path with hidden name and multi-part extension", () => {
      const path = new SpellFileLocation("project/PROJECT/.FILE.EXT1.EXT2")
      expect(path.filePath).toBe("/.FILE.EXT1.EXT2")
      expect(path.fileName).toBe(".FILE.EXT1.EXT2")
      expect(path.name).toBe(".FILE")
      expect(path.extension).toBe(".EXT1.EXT2")
      expect(path.isValidFilePath).toBe(true)
    })
  })

  describe("invalid file paths", () => {})
})
