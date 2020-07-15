import { SpellLocation } from "~/languages/spell"

// Make sure we don't re-use registry items.
SpellLocation.useRegistry = false

describe("SpellLocation", () => {
  describe("creation", () => {
    test("Can create via `new`", () => {
      const location = new SpellLocation("@user:projects:PROJECT")
      expect(location).toBeInstanceOf(SpellLocation)
    })
    test("if `useRegistry` is set, Creating via `new SpellLocation()` always returns the same object", () => {
      SpellLocation.useRegistry = true
      const location1 = new SpellLocation("@user:projects:PROJECT")
      const location2 = new SpellLocation("@user:projects:PROJECT")
      SpellLocation.useRegistry = false
      expect(location1).toBe(location2)
    })
  })

  describe("valid project paths", () => {
    test("valid project path", () => {
      const path = new SpellLocation("@user:projects:PROJECT")
      expect(path.path).toBe("@user:projects:PROJECT")
      expect(path.projectId).toBe("@user:projects:PROJECT")
      expect(path.owner).toBe("@user")
      expect(path.domain).toBe("projects")
      expect(path.projectName).toBe("PROJECT")
      expect(path.filePath).toBe(undefined)
      expect(path.folder).toBe(undefined)
      expect(path.file).toBe(undefined)
      expect(path.fileName).toBe(undefined)
      expect(path.extension).toBe(undefined)
      expect(path.isProjectPath).toBe(true)
      expect(path.isFolderPath).toBe(false)
      expect(path.isFilePath).toBe(false)
      expect(path.isSystemProject).toBe(false)
      expect(path.isUserProject).toBe(true)
    })

    test("valid library path", () => {
      const path = new SpellLocation("@system:examples:PROJECT")
      expect(path.isSystemProject).toBe(true)
      expect(path.isUserProject).toBe(false)
      expect(path.isProjectPath).toBe(true)
      expect(path.isFolderPath).toBe(false)
      expect(path.isFilePath).toBe(false)
    })

    test("trailing slash makes folder name", () => {
      const path = new SpellLocation("@system:examples:PROJECT/")
      expect(path.filePath).toBe("/")
      expect(path.folder).toBe("/")
      expect(path.file).toBe(undefined)
      expect(path.isProjectPath).toBe(false)
      expect(path.isFolderPath).toBe(true)
      expect(path.isFilePath).toBe(false)
    })
  })

  describe("invalid project paths", () => {
    test("invalid user", () => {
      expect(() => new SpellLocation("@INVALID_USER/projects/PROJECT")).toThrow()
    })
    test("invalid domain", () => {
      expect(() => new SpellLocation("@user:INVALID_DOMAIN:PROJECT")).toThrow()
    })
    test("no project name", () => {
      const path = new SpellLocation("@user:projects")
      expect(path.isValid).toBe(true)
      expect(path.isSystemProject).toBe(false)
      expect(path.isUserProject).toBe(true)
      expect(path.isDomainPath).toBe(true)
      expect(path.isProjectPath).toBe(false)
      expect(path.isFolderPath).toBe(false)
      expect(path.isFilePath).toBe(false)
    })
  })

  describe("valid file paths", () => {
    test("valid file path with no folder and normal extension", () => {
      const path = new SpellLocation("@user:projects:PROJECT/FILE.EXTENSION")
      expect(path.path).toBe("@user:projects:PROJECT/FILE.EXTENSION")
      expect(path.projectId).toBe("@user:projects:PROJECT")
      expect(path.owner).toBe("@user")
      expect(path.domain).toBe("projects")
      expect(path.projectName).toBe("PROJECT")
      expect(path.filePath).toBe("/FILE.EXTENSION")
      expect(path.folder).toBe("/")
      expect(path.file).toBe("FILE.EXTENSION")
      expect(path.fileName).toBe("FILE")
      expect(path.extension).toBe(".EXTENSION")
      expect(path.isValid).toBe(true)
      expect(path.isProjectPath).toBe(false)
      expect(path.isFolderPath).toBe(false)
      expect(path.isFilePath).toBe(true)
      expect(path.isSystemProject).toBe(false)
      expect(path.isUserProject).toBe(true)
    })

    test("valid file path with single folder and normal extension", () => {
      const path = new SpellLocation("@user:projects:PROJECT/FOLDER/FILE.EXTENSION")
      expect(path.projectId).toBe("@user:projects:PROJECT")
      expect(path.owner).toBe("@user")
      expect(path.domain).toBe("projects")
      expect(path.projectName).toBe("PROJECT")
      expect(path.filePath).toBe("/FOLDER/FILE.EXTENSION")
      expect(path.folder).toBe("/FOLDER/")
      expect(path.file).toBe("FILE.EXTENSION")
      expect(path.fileName).toBe("FILE")
      expect(path.extension).toBe(".EXTENSION")
      expect(path.isValid).toBe(true)
      expect(path.isProjectPath).toBe(false)
      expect(path.isFolderPath).toBe(false)
      expect(path.isFilePath).toBe(true)
      expect(path.isSystemProject).toBe(false)
      expect(path.isUserProject).toBe(true)
    })

    test("valid file path with single folder and normal extension", () => {
      const path = new SpellLocation("@user:projects:PROJECT/FOLDER1/FOLDER2/FILE.EXTENSION")
      expect(path.projectId).toBe("@user:projects:PROJECT")
      expect(path.owner).toBe("@user")
      expect(path.domain).toBe("projects")
      expect(path.projectName).toBe("PROJECT")
      expect(path.filePath).toBe("/FOLDER1/FOLDER2/FILE.EXTENSION")
      expect(path.folder).toBe("/FOLDER1/FOLDER2/")
      expect(path.file).toBe("FILE.EXTENSION")
      expect(path.fileName).toBe("FILE")
      expect(path.extension).toBe(".EXTENSION")
      expect(path.isValid).toBe(true)
      expect(path.isProjectPath).toBe(false)
      expect(path.isFolderPath).toBe(false)
      expect(path.isFilePath).toBe(true)
      expect(path.isSystemProject).toBe(false)
      expect(path.isUserProject).toBe(true)
    })

    test("valid file path with no extension", () => {
      const path = new SpellLocation("@user:projects:PROJECT/FILE")
      expect(path.filePath).toBe("/FILE")
      expect(path.folder).toBe("/")
      expect(path.file).toBe("FILE")
      expect(path.fileName).toBe("FILE")
      expect(path.extension).toBe(undefined)
      expect(path.isValid).toBe(true)
      expect(path.isProjectPath).toBe(false)
      expect(path.isFolderPath).toBe(false)
      expect(path.isFilePath).toBe(true)
    })

    test("valid file path with multi-part extension", () => {
      const path = new SpellLocation("@user:projects:PROJECT/FILE.EXT1.EXT2")
      expect(path.filePath).toBe("/FILE.EXT1.EXT2")
      expect(path.file).toBe("FILE.EXT1.EXT2")
      expect(path.fileName).toBe("FILE")
      expect(path.extension).toBe(".EXT1.EXT2")
      expect(path.isValid).toBe(true)
      expect(path.isFolderPath).toBe(false)
      expect(path.isFilePath).toBe(true)
    })

    test("valid file path with hidden name and no extension", () => {
      const path = new SpellLocation("@user:projects:PROJECT/.FILE")
      expect(path.filePath).toBe("/.FILE")
      expect(path.file).toBe(".FILE")
      expect(path.fileName).toBe(".FILE")
      expect(path.extension).toBe()
      expect(path.isValid).toBe(true)
      expect(path.isFolderPath).toBe(false)
      expect(path.isFilePath).toBe(true)
    })

    test("valid file path with hidden name and multi-part extension", () => {
      const path = new SpellLocation("@user:projects:PROJECT/.FILE.EXT1.EXT2")
      expect(path.filePath).toBe("/.FILE.EXT1.EXT2")
      expect(path.file).toBe(".FILE.EXT1.EXT2")
      expect(path.fileName).toBe(".FILE")
      expect(path.extension).toBe(".EXT1.EXT2")
      expect(path.isValid).toBe(true)
      expect(path.isFolderPath).toBe(false)
      expect(path.isFilePath).toBe(true)
    })
  })

  describe("invalid file paths", () => {})
})
