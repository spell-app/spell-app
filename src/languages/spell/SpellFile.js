import global from "global"
import { observable, computed } from "mobx"
import { TextFile, proto, forward, writeOnce, overrideable } from "../../util"
import { spellParser as coreSpellParser } from "."
import { SpellProject } from "./SpellProject"
import { SpellFileLocation } from "./SpellFileLocation"

/**
 * Loadable file of spell code located at `path`.
 *
 * Note that these are singleton instances --
 * you'll always get the same object back for a given `path`.
 */
export class SpellFile extends TextFile {
  /** Registry of known instances. */
  static registry = new Map()
  constructor(path) {
    // Create instance if not already present in registry
    if (!SpellFile.registry.has(path)) {
      const instance = super({ path })
      if (!instance.location.isValidFilePath)
        throw new TypeError(`SpellFile initialized with invalid path '${this.path}'`)
      SpellFile.registry.set(path, instance)
    }
    return SpellFile.registry.get(path)
  }

  /** We've been removed from the server -- clean up memory, etc.. */
  cleanUpOnRemove() {
    SpellFile.registry.clear(this.path)
  }

  /**
   * Project path as `/project/<projectId>/<filename>` or `/library/<projectId>/<filename>`.
   * MUST be passed to constructor.
   */
  @writeOnce path

  /** `location` object which we can use to get various bits of the path. */
  @forward("projectPath", "projectName", "filePath", "folder", "fileName", "name", "extension")
  get location() {
    return new SpellFileLocation(this.path)
  }

  /**
   * Return our `project` as a `SpellProject` based on our `path`.
   */
  get project() {
    return new SpellProject(this.projectPath)
  }

  //-----------------
  // Parsing / Compiling
  //-----------------

  /**
   * Load our content and attempt to parse it!
   * Pass an explicit `spellParser` if the file is, e.g. building on other files.
   */
  async parse(spellParser = coreSpellParser) {
    await this.load()
    return spellParser.parse(this.contents, "block")
  }

  /**
   * Load, parse and compile our content.
   * Pass an explicit `spellParser` if the file is, e.g. building on other files.
   */
  async compile(spellParser) {
    return (await this.parse(spellParser)).compile()
  }

  //-----------------
  //  Loading / Saving
  //-----------------

  /** Update file contents when you  do `spellFile.save(contents)` or `spellFile.save({ contents })`. */
  @proto autoUpdateContentsOnSave = true

  /** Derive `url` from our projectId / filename if not explicitly set. */
  @overrideable get url() {
    return `/api/${this.path}`
  }
}

global.SpellFile = SpellFile
