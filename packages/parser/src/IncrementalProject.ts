import { P } from "$/parser"

/**
 * Files of one project, parsed in order into one `scope`, so an edit to one file re-parses as little as possible
 * -- see `P.IncrementalParse`.
 * - Every file shares the project scope's parser, and so its `journal` (`P.ParseJournal`):  what file 1 declares,
 *   file 2 can use, and rewinding file 1 takes back file 2 as well.
 * - Each file gets its own `P.FileScope` under `scope`.
 * - Before any file parses, every type the files declare is stubbed (`parser.stubDeclaredTypes()`),
 *   so a line can name a type declared further down.
 * - An edit which changes WHICH types a file declares re-parses everything:
 *   rare, and the only way a line above it learns of the change.
 */
export class IncrementalProject {
  /** Project scope every file's scope is under. */
  declare scope: P.Scope
  /**
   * Our files, in parse order.
   * - `types`:  names of the types it declares, joined -- see `parser.declaredTypes()`, `update()`.
   */
  declare files: Array<{ path: string; parse: P.IncrementalParse; types: string }>
  /** Journal mark before the types we stub -- rewinding to it takes back the whole project. */
  declare startMark: P.JournalMark
  /**
   * `true` if an `update()` threw part way through, so our parse state can't be trusted.
   * - Next `update()` re-parses every file from scratch.
   */
  isBroken = false

  /**
   * Parse `files` in order, from scratch.
   * - SIDE EFFECT: gives `scope.parser` a fresh `journal`.
   */
  constructor({ scope, files, keepLastGood }: IncrementalProjectProps) {
    const parser = scope.parser!
    parser.journal = new P.ParseJournal()
    this.scope = scope
    this.startMark = parser.journal.mark()
    parser.stubDeclaredTypes(
      scope,
      files.map((file) => file.text)
    )
    this.files = files.map(({ path, name = path, text }) => {
      const fileScope = new P.FileScope({ name, path, parentScope: scope })
      const types = parser.declaredTypes(text).join()
      return { path, types, parse: new P.IncrementalParse({ parser, scope: fileScope, text, keepLastGood }) }
    })
  }

  /** `IncrementalParse` for file `path`, if it's one of ours. */
  getFile(path: string): P.IncrementalParse | undefined {
    return this.files.find((file) => file.path === path)?.parse
  }

  /**
   * File `path` now has `text`:  re-parse as little as possible.
   * - Returns every file whose `match` changed, in order:  none, just that file, or that file + every later one.
   * - Throws if `path` isn't one of ours.
   */
  update(path: string, text: string): P.IncrementalParse[] {
    const index = this.files.findIndex((file) => file.path === path)
    const file = this.files[index]?.parse
    if (!file)
      throw new P.ParserError({ message: `IncrementalProject.update(): unknown file '${path}'`, context: this })

    try {
      // changed which types it declares:  every line above may read differently -- see `stubDeclaredTypes()`
      const types = this.scope.parser!.declaredTypes(text).join()
      if (this.isBroken || types !== this.files[index]!.types) return this.parseAll(path, text)
      const result = file.update(text)
      if (result === "same") return []
      if (result === "body" || result === "region") return [file]
      // Rewinding took back every later file:  re-parse them, in order.
      const later = this.files.slice(index + 1).map((it) => it.parse)
      later.forEach((it) => it.parseAll(it.text))
      return [file, ...later]
    } catch (error) {
      // e.g. a rule's `getAST()` crashed while committing a line -- a full parse would crash too.
      this.isBroken = true
      throw error
    }
  }

  /**
   * Re-parse every file from scratch, with file `path` now `text`.
   * - When:  an `update()` threw, or changed which types a file declares.
   * - Rewinds to our `startMark`, taking back everything, then stubs the types the files declare NOW.
   */
  private parseAll(path: string, text: string): P.IncrementalParse[] {
    const parser = this.scope.parser!
    if (parser.journal?.has(this.startMark)) parser.journal.rewindTo(this.startMark)
    const texts = this.files.map((file) => (file.path === path ? text : file.parse.text))
    parser.stubDeclaredTypes(this.scope, texts)
    this.files.forEach((file, index) => {
      file.types = parser.declaredTypes(texts[index]!).join()
      file.parse.parseAll(texts[index]!)
    })
    this.isBroken = false
    return this.files.map((file) => file.parse)
  }
}

/** Constructor props for `IncrementalProject`. */
export type IncrementalProjectProps = {
  /** Project scope to parse into -- its `parser` does the parsing, and gets a journal. */
  scope: P.Scope
  /**
   * Should a line edited into a broken state keep its last working declarations?  Default `false`.
   * - `true` suits an editor:  one half-typed line doesn't break every line after it.
   */
  keepLastGood?: boolean
  /** Files to parse, in order. */
  files: Array<{
    /** Unique path, as passed to `update()`. */
    path: string
    /** Name for the file's scope, e.g. in error messages.  Default `path`. */
    name?: string
    /** File contents. */
    text: string
  }>
}
