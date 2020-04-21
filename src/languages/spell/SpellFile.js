import global from "global"
import { TextFile, Registry, proto, overrideableGetter } from "../../util"

/**
 * Loadable file of spell code.
 */
export class SpellFile extends TextFile {
  /** Project name. */
  @proto project = undefined
  /** File name. */
  @proto filename = undefined
  /** Update file contents when you  do `spellFile.save(contents)` or `spellFile.save({ contents })`. */
  @proto autoUpdateContentsOnSave = true

  /**
   * Construct with a `project/path` string to get a singleton back for that path.
   * e.g.
   *    a = new SpellFile("myProject/Myfile.spell")
   *    b = new SpellFile("myProject/Myfile.spell")
   *    a === b  <<<< true
   */
  constructor(propsOrPath) {
    if (typeof propsOrPath === "string") {
      return SpellFile.registry.get(propsOrPath)
    }
    super(propsOrPath)
  }

  /** Return our `path` */
  get path() {
    return `${this.project}/${this.filename}`
  }

  /** Derive `url` from our project / filename if not explicitly set. */
  @overrideableGetter get url() {
    return `/api/projects/${this.path}`
  }

  /**
   * Use `SpellFile.registry.get("project/filename")` to get a singleton SpellFile back for that path.
   * Note that you can also just do `new SpellFile("project/filename")` to do the same thing.
   */
  static registry = new Registry({
    makeInstanceForPath(path) {
      const [project, ...filePath] = typeof path === "string" ? path.split("/") : []
      if (!project || !filePath.length)
        throw new TypeError(`SpellFile.registry: can't make instance for path: \`${path})\``)
      return new SpellFile({ project, filename: filePath.join("/") })
    }
  })
}

global.SpellFile = SpellFile
