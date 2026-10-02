import { JSON5File, $fetch, CONFIRM, TaskList, Task, getDier, type KnownFormatMimeType } from "$/util"
import { P } from "$/parser"
// Import directly, NOT through the `$/core` barrel:  a project MUST NOT load `spellCore` itself -- each
// runner runs its own copy.  See `spellRuntime.ts`.
import { SPELL_CORE_MODULE, SPELL_CORE_NAMES } from "$/core/spellCore.types"
import { SP } from "$/spell"

/**
 * Controller for a `SpellProject`.
 * - NOTE: these are singleton instances -- you'll always get same object back for a given `path`.
 */
export class SpellProject extends JSON5File<SP.ProjectManifestJSON5> {
  /** Registry of known instances. */
  static registry = new Map<string, SpellProject>()

  /**
   * Format for client/server requests.
   * - NOTE: server accepts bare `"json"` string for `requestFormat` (which becomes `Content-Type`
   *   header); cast it once here against `$FetchRequestParams`'s stricter `KnownFormatMimeType`
   *   type rather than changing actual value sent to server.
   * - CLAUDE TODO:  WTF is this?
   */
  static REQUEST_FORMAT_JSON = "json" as KnownFormatMimeType

  /**
   * Return existing `SpellProject` for `path` if already in registry, else construct new one.
   * - Throws if `path` is not a valid project path (see `SpellLocation.isProjectPath`).
   */
  constructor(path: string) {
    // Return immediately from registry if already present.
    const existing = SpellProject.registry.get(path)
    if (existing) return existing

    super({})
    Object.assign(this, { path })
    if (!this.location.isProjectPath) {
      throw new TypeError(`new SpellProject('${path}'): Must be initialized with project path.`)
    }
    SpellProject.registry.set(path, this)
  }

  /** We've been removed from the server -- clean up memory, etc.. */
  onRemove(): void {
    super.onRemove()

    this.files.forEach((file) => file.onRemove())
    SpellProject.registry.delete(this.path)
  }

  /** Full path to project, e.g. `@user:projects:myProject`. */
  /*@writeOnce path*/
  declare path: string

  /**
   * Immutable `location` object which we use to get various bits of the path.
   * - NOTE: we `forward` lots of methods on location object to this object, so you can say
   *   `project.projectName` rather than `project.location.projectName`.
   */
  /*@forward("projectId", "owner", "projectName", "isSystemProject", "isUserProject")*/
  /*@memoize*/
  get location(): SP.SpellLocation {
    return this.derived("location", () => new SP.SpellLocation(this.path))
  }
  /** Project ID, forwarded from `location.projectId`. */
  get projectId(): string {
    return this.location.projectId
  }
  /** Owner of project (`@user` or `@system`), forwarded from `location.owner`. */
  get owner(): string {
    return this.location.owner
  }
  /** Name of project, forwarded from `location.projectName`. */
  get projectName(): string | undefined {
    return this.location.projectName
  }
  /** Is this a system project? Forwarded from `location.isSystemProject`. */
  get isSystemProject(): boolean {
    return this.location.isSystemProject
  }
  /** Is this a user project? Forwarded from `location.isUserProject`. */
  get isUserProject(): boolean {
    return this.location.isUserProject
  }

  /** Owning `SpellProjectRoot` for this project (`@user:projects`, `@system:examples`, etc.). */
  /*@forward("type", "Type")*/
  /*@memoize*/
  get projectRoot(): SP.SpellProjectRoot {
    // NOTE: this works because `new SpellProjectRoot()` will return an existing object...
    return this.derived("projectRoot", () => new SP.SpellProjectRoot(this.location.projectRoot))
  }
  /**
   * Project type for string concatenation, e.g. `project`, `example` or `guide`.
   * - Forwarded from `projectRoot.type`.
   */
  get type(): string {
    return this.projectRoot.type
  }
  /**
   * Capitalized project type, e.g. `Project`, `Example` or `Guide`.
   * - Forwarded from `projectRoot.Type`.
   */
  get Type(): string {
    return this.projectRoot.Type
  }

  ////////////////
  // ## Compilation
  ////////////////

  /** `ProjectScope` used for our last `parse()` / `compile()`. */
  /*@state*/ get scope(): P.ProjectScope | undefined {
    return this.getState("scope", () => undefined)
  }
  set scope(scope: P.ProjectScope | undefined) {
    this.setState("scope", scope)
  }

  /** Last compiled result as a javascript string. */
  /*@state*/ get compiled(): string | undefined {
    return this.getState("compiled", () => undefined)
  }
  set compiled(compiled: string | undefined) {
    this.setState("compiled", compiled)
  }

  /**
   * Why our last parse of our imports crashed, e.g. a rule threw -- `undefined` once one succeeds.
   * - Parse ERRORS in the spell, e.g. a line it can't make sense of, are NOT this:  they're in each file's `match`.
   */
  /*@state*/ get parseError(): string | undefined {
    return this.getState("parseError", () => undefined)
  }

  /** `SpellJSFile` for this project's compiled output, e.g. `Solitaire.compiled.js`. */
  /*@memoize*/
  get outputFile(): SP.SpellJSFile {
    return this.derived("outputFile", () => {
      const location = this.getFileLocation(`${this.projectName}${SP.COMPILED_JS_SUFFIX}`)!
      return new SP.SpellJSFile(location.path)
    })
  }

  /** Reset our compiled state. */
  resetCompiled(): void {
    this.resetState("scope", "compiled")
  }

  /**
   * Parses our spell files so an edit re-parses as little as possible -- see `updatedContentsFor()`.
   * - Built by our `parser` task list, whenever we haven't got one we can trust.
   * - NOTE: plain field, not state:  files hold the results.
   */
  incremental: P.IncrementalProject | undefined

  /** Do we need to parse our spell files from scratch, rather than trust `incremental`? */
  get needsFullParse(): boolean {
    if (!this.incremental || this.incremental.isBroken) return true
    const { spellFiles } = this
    if (spellFiles.length !== this.incremental.files.length) return true
    return spellFiles.some((file, index) => !file.match || this.incremental!.files[index]!.path !== file.path)
  }

  /**
   * Parse our active spell files from scratch into `scope`, in order, and hand each file its result.
   * - Other files, e.g. `.css`, parse themselves.
   */
  parseImports(): void {
    const { spellFiles } = this
    this.incremental = new P.IncrementalProject({
      scope: this.scope!,
      // one half-typed line shouldn't break every line after it
      keepLastGood: true,
      files: spellFiles.map((file) => ({ path: file.path, name: file.file, text: file.parseText }))
    })
    spellFiles.forEach((file) => {
      file.setParsed(this.incremental!.getFile(file.path)!)
      file.logParseErrors()
    })
  }

  /**
   * Parse project: cancel any in-flight parse, then run `this.parser` `TaskList`.
   * - NOTE: `parser` arg is actually `parentScope` to parse from -- passed straight through
   *   to `this.parser.start()`, which calls `getScope(parentScope)` for the first task.
   */
  parse(parser?: P.Scope): Promise<unknown> {
    this.parser.cancel()
    return this.parser.start(parser)
  }
  /**
   * Compile project: cancel any in-flight parse/compile, then run `this.compiler` `TaskList`.
   * - `parser` is passed through as `parentScope`, same as `parse()`.
   * - `save: false` leaves our output in `outputFile.contents` WITHOUT writing it, e.g. `spell compile --stdout`.
   */
  compile(parser?: P.Scope, { save = true }: { save?: boolean } = {}): Promise<unknown> {
    this.parser.cancel()
    this.compiler.cancel()
    this.saveCompiled = save
    return this.compiler.start(parser)
  }

  /**
   * Does the running `compile()` write `outputFile`?  Set by each `compile()`, read by `compiler`'s last task.
   * - NOTE: plain field, not state:  it only steers one run.
   */
  saveCompiled = true

  /**
   * Return base `ProjectScope` for this project, given `parentScope`.
   * - Clones `parentScope`'s parser scoped to `this.path`, so rules added within project
   *   (e.g. custom types/macros) don't leak out to `parentScope` or sibling projects.
   */
  getScope(parentScope: P.Scope = SP.SpellParser.rootScope): P.ProjectScope {
    // Make a parser that depends on the parentScope's parser
    // This way rules added to the project won't leak out.
    const parser = parentScope.parser!.clone({ module: this.path })
    return new P.ProjectScope({
      name: this.projectName,
      path: this.path,
      parser,
      parentScope
    })
  }

  /**
   * Return `TaskList` used to parse our imports.
   * Call as `project.parser.start(parentScope?)`.
   */
  /*@memoize*/
  get parser(): TaskList {
    return this.derived("parser", () => {
      return new TaskList({
        name: `Parsing ${this.type}: ${this.projectName}`,
        tasks: [
          new Task({
            name: `Loading ${this.type}`,
            run: async (parentScope) => {
              await this.load(undefined)
              // Keep our scope while `incremental` is good:  files' matches belong to it.
              if (this.needsFullParse) {
                this.resetCompiled()
                this.incremental = undefined
                try {
                  const importScope = await this.loadImportScope(
                    (parentScope as P.Scope | undefined) ?? SP.SpellParser.rootScope
                  )
                  this.setState("scope", this.getScope(importScope))
                } catch (error) {
                  this.setState("parseError", error instanceof Error ? error.message : String(error))
                  throw error
                }
              }
            }
          }),
          TaskList.forEach({
            name: `Loading imports`,
            list: () => [...this.sourceImportFiles, ...this.activeImports],
            getTask: (file: SP.CompilableSpellFile) =>
              new Task({
                name: `Loading import: ${file.file}`,
                run: () => file.load(undefined)
              })
          }),
          new Task({
            name: `Parsing imports`,
            run: async () => {
              try {
                if (!this.incremental) this.parseImports()
                for (const file of this.activeImports) {
                  if (!(file instanceof SP.SpellFile)) await file.parse(this.scope)
                }
                SP.SpellDeclarations.checkImportClashes(this.scope!)
                this.setState("parseError", undefined)
              } catch (error) {
                this.setState("parseError", error instanceof Error ? error.message : String(error))
                throw error
              }
            }
          })
        ]
      })
    })
  }

  /**
   * Return `TaskList` used to `compile()` our imports.
   * Call as `project.compiler.start(parentScope?)`.
   */
  /*@memoize*/
  get compiler(): TaskList {
    return this.derived("compiler", () => {
      return new TaskList({
        debug: false,
        name: `Compiling ${this.type}: ${this.projectName}`,
        tasks: [
          this.parser,
          TaskList.forEach({
            name: `Compiling imports`,
            list: () => [...this.sourceImportFiles, ...this.activeImports],
            getTask: (file: SP.CompilableSpellFile) =>
              new Task({
                name: `Compiling import: ${file.file}`,
                run: () => file.compile()
              })
          }),
          new Task({
            name: "Combining output",
            run: async (allCompiled) => {
              // each `.spell` file as its AST, so a class gets its members from every file
              const files = [...this.sourceImportFiles, ...this.activeImports]
              const parts = files.map((file, index) =>
                file.AST instanceof P.ASTStatementGroup ? file.AST : (allCompiled as string[])[index]
              )
              const compiled = this.importHeader() + SpellProject.combineCompiled(parts)
              this.setState("compiled", compiled)
              return compiled
            }
          }),
          new Task({
            name: "Saving compiled output",
            run: async (compiled) => {
              // our declarations header leads the file -- each statement's own are inline, above its code --
              // so another project can import us WITHOUT our sources
              const { version, exports } = this.contents ?? {}
              const header = SP.SpellDeclarations.header(this.scope!, { version, exports })
              this.outputFile.contents = header + (compiled as string)
              if (!this.saveCompiled) return this.outputFile.contents
              return await this.outputFile.save(undefined)
            }
          })
        ]
      })
    })
  }

  /** Between each file's code in our compiled output -- see "Combining output" in `compiler`. */
  static FILE_SEPARATOR = "\n// -----------\n"

  /**
   * A project's files' code as ONE module, in order, `FILE_SEPARATOR` between each.
   * - Each `part` is a `.spell` file's AST, or code as is, e.g. a `.css` file's.
   * - Each class gets its members from EVERY file, e.g. `Card.move_to_$pile` from `Pile.spell` goes in
   *   `Card.spell`'s `class Card` -- see `SP.hoistClassMembers()`.  Each file's own were moved in by `SP.Block`.
   * - Also how a fixture compiles -- see `compiledFixture()` in `$/spell/test`.
   */
  static combineCompiled(parts: Array<P.ASTStatementGroup | string | undefined>): string {
    const hoisted = SP.hoistClassMembers(parts.map((part) => (typeof part === "object" ? (part.statements ?? []) : [])))
    return parts
      .map((part, index) => {
        if (typeof part !== "object") return part ?? ""
        return new P.ASTStatementGroup(part.match, { statements: hoisted[index] }).compile()
      })
      .join(SpellProject.FILE_SEPARATOR)
  }

  /**
   * One of our `file`s has updated its contents, e.g. on each keystroke:  re-parse as little as possible.
   * - A spell file we've parsed => `incremental` re-parses what changed:  maybe just one indented body, else from
   *   the first changed line on, plus every later file.  Each changed file gets its new `match`.
   * - Otherwise, or if that throws, has ALL of our files `resetCompiled()` so they'll parse + compile again.
   */
  updatedContentsFor(file: SP.AnySpellFile): void {
    const { incremental } = this
    if (file instanceof SP.SpellFile && incremental?.getFile(file.path) && !incremental.isBroken) {
      try {
        const changed = incremental.update(file.path, file.parseText)
        changed.forEach((parse) => {
          const path = incremental.files.find((it) => it.parse === parse)!.path
          const changedFile = this.spellFiles.find((it) => it.path === path)
          if (changedFile instanceof SP.SpellFile) changedFile.setParsed(parse)
        })
        return
      } catch (error) {
        console.error("SpellProject.updatedContentsFor(): incremental parse failed", error)
      }
    }
    this.incremental = undefined
    this.activeImports.forEach((item) => item.resetCompiled())
  }

  /**
   * An editor changed `file`'s text to `text`, e.g. on a keystroke:  take it, and re-parse as little as possible.
   * - Returns the spell files whose parse changed -- one edit can change LATER files, e.g. by renaming a type.
   * - A file we don't parse (see `SpellFile.isActive`) just takes the text, so it's there if it becomes active.
   * - If the incremental parse couldn't cope, parses from scratch straight away, rather than leaving every file
   *   without a `match` until the next `compile()`.  A crash there is left in `parseError`, NOT thrown.
   * - Does NOT mark `file` dirty or save it:  that's the editor's business.
   */
  async updateText(file: SP.SpellFile, text: string): Promise<SP.SpellFile[]> {
    if (file.contents !== text) file.contents = text
    if (!file.isActive) return [file]

    const before = new Map(this.spellFiles.map((it) => [it, it.match]))
    this.updatedContentsFor(file)
    if (!this.incremental) await this.parse().catch(() => undefined)
    return this.spellFiles.filter((it) => it.match !== before.get(it))
  }

  ////////////////
  // ## Loading / contents
  ////////////////

  /** URL to load/save this project's index, derived from `projectId`. */
  get url(): string {
    return `/api/projects/index/${this.projectId}`
  }

  /**
   * HACK:  when our `contents` are updated, re-calculate the derived properties below at once.
   * - Was:  to dodge `react-easy-state` rendering errors.  Kept so the caches fill HERE, not inside whatever
   *   reads them first, e.g. a Solid computation, which would then be the one making our files.
   */
  onContentsUpdated(): void {
    // Which files we have, or their order, may have changed:  parse from scratch next time.
    this.incremental = undefined
    const { manifest, files, imports, activeImports } = this
    void manifest
    void files
    void imports
    void activeImports
  }

  /** Load our index if necessary, calling `die()` if something goes wrong. */
  async loadOrDie(die: ReturnType<typeof getDier>): Promise<void> {
    if (this.isLoaded) return
    try {
      await this.load(undefined)
    } catch (e) {
      die(`Error loading ${this.type} index`, e)
    }
  }

  /**
   * Return `manifest` map from our `contents`.  Returns `{}` if not loaded or index malformed.
   * Returned objects have:
   * - `path` string
   * - `location` as `SpellLocation` for its `path`
   * - `file` as pointer to `SpellFile` (etc) for its `path`
   * - `created` as created timestamp
   * - `modified` as last modified timestamp
   * - `size` as file size in bytes
   */
  /*@memoizeForProp("contents")*/
  get manifest(): Record<string, SP.ProjectManifestEntry> {
    return this.derivedFrom(
      "manifest",
      () => {
        if (!this.contents?.manifest) return {}
        // add useful stuff to manifest entries
        Object.entries(this.contents.manifest).forEach(([path, entry]) => {
          entry.path = path
          entry.location = new SP.SpellLocation(path)
          entry.file = SpellProject.getFileForPath(path)
        })
        return this.contents.manifest
      },
      [this.contents]
    )
  }

  /**
   * Return pointers to all `SpellFiles` in our manifest.
   * Returns `[]` if we're not loaded.
   */
  /*@memoizeForProp("contents")*/
  get files(): SP.AnySpellFile[] {
    return this.derivedFrom(
      "files",
      () => {
        return Object.values(this.manifest).map((item) => item.file!)
      },
      [this.contents]
    )
  }

  /**
   * Return full ordered `imports` list from our `contents`, including inactive items.
   * Returns `[]` if not loaded or index is malformed.  Returned objects have:
   * - `path` full path string
   * - `active` boolean, `true` if file should be included in compilation
   * - `location` as `SpellLocation` for its `path`
   * - `file` as pointer to `SpellFile` (etc) for its `path`
   * - `contents` as file contents (NOTE: only for text files with certain extensions!)
   */
  /*@memoizeForProp("contents")*/
  get imports(): SP.ProjectImportRef[] {
    return this.derivedFrom(
      "imports",
      () => {
        if (!this.contents?.imports) return []
        // another project's entry isn't a file of ours -- see `projectImports`
        return this.contents.imports
          .filter(({ path }) => !path.startsWith("@"))
          .map(({ path, active }) => {
            const location = SP.SpellLocation.getFileLocation(this.projectId, path)
            const file = SpellProject.getFileForPath(location.path)
            return {
              path: location.path,
              active,
              location,
              file
            }
          })
      },
      [this.contents]
    )
  }

  /**
   * Return `SpellFile` / `SpellCSSFile` objects for our `active` imports -- the ones we parse + compile.
   * - Returns `[]` if we're not loaded or index is malformed.
   * - NOTE: skips anything we can't compile, e.g. an active `.js` import, which has no `parse()`.
   */
  /*@memoizeForProp("contents")*/
  get activeImports(): SP.CompilableSpellFile[] {
    return this.derivedFrom(
      "activeImports",
      () => {
        const { manifest } = this
        return this.imports //
          .filter((item) => item.active)
          .map((item) => manifest[item.path]?.file)
          .filter((file) => file instanceof SP.SpellFile || file instanceof SP.SpellCSSFile)
      },
      [this.contents]
    )
  }

  /**
   * Spell files we parse:  our active `.spell` imports, in order -- see `activeImports`.
   * - After any `source` project imports' files, which parse first -- see `sourceImportFiles`.
   */
  get spellFiles(): SP.SpellFile[] {
    const own = this.activeImports.filter((file): file is SP.SpellFile => file instanceof SP.SpellFile)
    return [...this.sourceImportFiles, ...own]
  }

  /**
   * Other projects we import, from our `project.json` -- entries naming a project, e.g. `@library/cards`.
   * - Kept out of `imports`:  they aren't files of ours.  Inactive ones are left out.
   */
  get projectImports(): SP.ProjectImport[] {
    return (this.contents?.imports ?? [])
      .filter(({ path, active }) => path.startsWith("@") && active !== false)
      .map(({ path, import: picks, version, source }) => ({
        from: path,
        projectId: SpellProject.projectIdForImport(path),
        import: picks,
        version,
        source
      }))
  }

  /**
   * `.spell` files of projects we import with `source: true`, in import order -- they parse ahead of ours.
   * - Empty until `loadImportScope()` has loaded those projects.
   */
  get sourceImportFiles(): SP.SpellFile[] {
    return this.projectImports.filter((it) => it.source).flatMap((it) => new SP.SpellProject(it.projectId).spellFiles)
  }

  /**
   * Import layer for our `projectImports`, under `parentScope` -- or `parentScope` itself if we import none.
   * - A compiled import:  reads the declarations leading its `<Project>.compiled.js`, fresh each time.
   * - A `source` import:  loads that project, so its files parse ahead of ours -- see `sourceImportFiles`.
   *   It can't rename what it imports, e.g. `Card:Playingcard`:  its sources parse as they are.
   * - Throws `P.ParserError` if one can't be loaded, e.g. it's never been compiled -- see `SP.SpellDeclarations.load()`.
   */
  async loadImportScope(parentScope: P.Scope): Promise<P.Scope> {
    const imports: SP.DeclarationsImport[] = []
    for (const it of this.projectImports) {
      const project = new SP.SpellProject(it.projectId)
      await project.load(undefined)
      if (it.source) {
        // its sources parse just as they are -- only a compiled import's declarations can be renamed
        const renaming = it.import?.find((pick) => pick.includes(":"))
        if (renaming) {
          throw new P.ParserError({
            message: `Can't import '${it.from}':  renaming ('${renaming}') needs a compiled import, not \`source: true\`.`,
            activity: "SpellProject.loadImportScope",
            params: { from: it.from }
          })
        }
        continue
      }
      const output = project.outputFile
      // another project's compile may have changed it since we last looked
      output.cacheDuration = 0
      const compiled = await output.load(undefined).catch(() => undefined)
      const declarations = compiled && SP.SpellDeclarations.read(compiled)
      if (!declarations) {
        throw new P.ParserError({
          message: `Can't import '${it.from}':  it has no compiled declarations -- compile it first.`,
          activity: "SpellProject.loadImportScope",
          params: { from: it.from }
        })
      }
      const module = `${SP.SPELL_PROJECT_MODULE}${encodeURI(it.projectId)}`
      imports.push({
        from: it.from,
        projectId: it.projectId,
        declarations,
        import: it.import,
        version: it.version,
        module
      })
    }
    return imports.length ? SP.SpellDeclarations.importScope(parentScope, imports) : parentScope
  }

  /**
   * `import`s leading our compiled output:  spell's runtime, then what we import from other projects, e.g.
   *   `import { spellCore, Thing, List, App } from "@spell/core"`
   *   `import { Card as Playingcard, Deck, Pile } from "@spell/project/@system:library:cards"`
   * - Why:  compiled spell reaches everything it didn't declare through `import`s -- NO globals.
   * - A runner rewrites each specifier onto the module it means -- see `runCompiled()` in `src/app/runner/`.
   * - A `source` import needs none:  its files compile into our output.
   */
  importHeader(): string {
    return SpellProject.importHeaderFor(this.scope)
  }

  /** `importHeader()` of a project parsed in `scope` -- also for one parsed headlessly, e.g. a test fixture. */
  static importHeaderFor(scope: P.Scope | undefined): string {
    const lines = [`import { ${SPELL_CORE_NAMES.join(", ")} } from "${SPELL_CORE_MODULE}"`]
    const imports = scope?.parentScope
    if (imports instanceof P.ImportScope) {
      for (const [module, names] of imports.modules) {
        if (names.length) lines.push(`import { ${names.join(", ")} } from "${module}"`)
      }
    }
    return `${lines.join("\n")}\n\n`
  }

  /**
   * Project id an `imports` entry's `path` names:  a root's alias expanded, e.g. `@library/cards` ~==
   * `@system:library:cards` -- else a full `@owner:domain:name` as is.  See `SP.SpellSetup.expandAlias()`.
   */
  static projectIdForImport(path: string): string {
    return SP.SpellSetup.expandAlias(path)
  }

  ////////////////
  // ## Project file access
  ////////////////

  /** Cache of `extension` -> `SpellFile` subclass constructor, lazily built in `getFileForPath()`. */
  static extensionMap?: Record<string, new (path: string) => SP.AnySpellFile>
  /** Given `fullPath` to a file, return a `SpellFile` or `SpellCSSFile` etc. */
  static getFileForPath(fullPath: string): SP.AnySpellFile {
    if (!SpellProject.extensionMap) {
      SpellProject.extensionMap = {
        ".css": SP.SpellCSSFile,
        ".js": SP.SpellJSFile,
        ".jsx": SP.SpellJSFile,
        default: SP.SpellFile
      }
    }
    const location = new SP.SpellLocation(fullPath)
    if (!location.isFilePath) {
      throw new TypeError(`SpellProject.getFileForPath('${fullPath}'): path is not a file path.`)
    }
    const extension = location.extension
    const Constructor = (extension && SpellProject.extensionMap[extension]) || SpellProject.extensionMap.default
    return new Constructor(fullPath)
  }

  /**
   * Given `path` as:
   * - `fullPath`, e.g. `@user:projects:project/file.spell`
   * - `filePath`, e.g. `file.spell` or `/file.spell`
   * - `SpellLocation` for a file
   * return `SpellLocation` for the file.
   *
   * Returns `undefined` if not found, path is not valid or is not a file path.
   */
  getFileLocation(path: string | SP.SpellLocation): SP.SpellLocation | undefined {
    let location: SP.SpellLocation | undefined
    if (path instanceof SP.SpellLocation) {
      location = path
    } else if (typeof path === "string") {
      try {
        if (path.startsWith("@")) location = SP.SpellLocation.getFileLocation(path)
        else location = SP.SpellLocation.getFileLocation(this.projectId, path)
      } catch {
        return undefined
      }
    }
    if (location?.isFilePath) return location
    return undefined
  }

  /**
   * Assuming we're loaded, return manifest `info` for a file specified by `filePath`.
   * `filePath` can be any of:
   * - `fullPath`, e.g. `@user:projects:project/file.spell`
   * - `filePath`, e.g. `file.spell` or `/file.spell`
   * - `SpellLocation` for a file
   *
   * Returns `undefined` if file not found, couldn't load index, etc.
   */
  getFileInfo(filePath: string | SP.SpellLocation): SP.ProjectManifestEntry | undefined {
    const location = this.getFileLocation(filePath)
    if (location) return this.manifest[location.path]
    return undefined
  }

  /**
   * Assuming we're loaded, then return one of our `files` as a `SpellFile` or `SpellCSSFile` etc.
   * `filePath` can be any of:
   * - `fullPath`, e.g. `@user:projects:project/file.spell`
   * - `filePath`, e.g. `file.spell` or `/file.spell`
   * - `SpellLocation` for a file
   *
   * Returns `undefined` if file not found, couldn't load index, etc.
   */
  getFile(filePath: string | SP.SpellLocation): SP.AnySpellFile | undefined {
    return this.getFileInfo(filePath)?.file
  }

  ////////////////
  // ## Project file manipulation
  ////////////////

  /**
   * Create a new file within this project.
   * - `filePath` is relative to this project, and may or may not start with `/`.
   * - NOTE: in theory this handles nested files.
   */
  async createFile(
    filePath: string | undefined,
    contents: string | undefined,
    newFileName = "Untitled.spell",
    die?: ReturnType<typeof getDier>
  ): Promise<SP.AnySpellFile | undefined> {
    if (!die) die = getDier(this, "creating file", { projectId: this.projectId, filePath })

    if (!filePath) filePath = prompt("Name for the new file?", newFileName) ?? undefined
    if (!filePath) return undefined
    die.params.filePath = filePath

    await this.loadOrDie(die)
    if (this.getFile(filePath)) die("File already exists.")

    // Tell the server to create the file, which returns updated index
    try {
      const newIndex = await $fetch<SP.ProjectManifestJSON5>({
        url: `/api/projects/create/file`,
        contents: {
          projectId: this.projectId,
          filePath,
          contents: contents ?? `## This space intentionally left blank`
        },
        requestFormat: SpellProject.REQUEST_FORMAT_JSON,
        format: "json"
      })
      this.contents = newIndex
    } catch (e) {
      die("Server error creating file", e)
    }

    // Return the file
    return this.getFile(filePath) || die("Server didn't create file.")
  }

  /**
   * Duplicate an existing file.
   * Returns pointer to new file.
   */
  async duplicateFile(filePath: string, newFilePath: string | undefined): Promise<SP.AnySpellFile | undefined> {
    const die = getDier(this, "duplicating file", {
      projectId: this.projectId,
      originalFilePath: filePath,
      filePath: newFilePath
    })
    await this.loadOrDie(die)

    const file = this.getFile(filePath) || die("File not found.")
    let contents: string | undefined
    try {
      contents = await file.load(undefined)
    } catch (e) {
      die("Server error loading file", e)
    }
    return this.createFile(newFilePath, contents, file.file, die)
  }

  /**
   * Rename an existing file.
   * Returns new file.
   */
  async renameFile(filePath: string, newFilePath?: string): Promise<SP.AnySpellFile | undefined> {
    const die = getDier(this, "renaming file", { projectId: this.projectId, filePath, newFilePath })
    await this.loadOrDie(die)
    const file = this.getFile(filePath) || die("File not found.")

    if (!newFilePath) {
      const filename = prompt("New name for the file?", file.file)
      if (!filename) return undefined
      newFilePath = SP.SpellLocation.getFileLocation(this.projectId, filename).filePath!
      if (newFilePath === filePath) return undefined
      die.params.newFilePath = newFilePath
    }
    if (this.getFile(newFilePath)) die("New file already exists.")

    // Tell the server to rename the file, which returns the updated index.
    try {
      const newIndex = await $fetch<SP.ProjectManifestJSON5>({
        url: `/api/projects/rename/file`,
        contents: {
          projectId: this.projectId,
          filePath,
          newFilePath
        },
        requestFormat: SpellProject.REQUEST_FORMAT_JSON,
        format: "json"
      })
      this.contents = newIndex
    } catch (e) {
      die("Server error renaming file", e)
    }
    // Have the file clean itself up in a tick
    // (doing it immediately causes react to barf)
    setTimeout(() => file.onRemove(), 10)
    // return the new file
    return this.getFile(newFilePath) || die("Server didn't rename file.")
  }

  /**
   * Remove an existing file from the project.
   * Returns `true` on success, `undefined` if cancelled, or throws on error.
   */
  async deleteFile(filePath: string, shouldConfirm?: typeof CONFIRM): Promise<boolean | undefined> {
    const die = getDier(this, "deleting file", { projectId: this.projectId, filePath })
    await this.loadOrDie(die)
    if (this.files.length === 1) die(`You can't delete the last file in this ${this.type}.`)

    const file = this.getFile(filePath) || die("File not found.")

    if (shouldConfirm === CONFIRM) {
      if (!confirm(`Really remove file '${file.file}'?`)) return undefined
    }

    // console.warn("before:", { activeImports: this.activeImports })
    // Tell the server to delete the file, which returns the updated index.
    try {
      const newIndex = await $fetch<SP.ProjectManifestJSON5>({
        url: `/api/projects/remove/file`,
        method: "DELETE",
        contents: {
          projectId: this.projectId,
          filePath
        },
        requestFormat: SpellProject.REQUEST_FORMAT_JSON,
        format: "json"
      })
      this.contents = newIndex
    } catch (e) {
      die("Server error deleting file", e)
    }
    // throw if file is still found
    if (this.getFile(filePath)) die("Server didn't delete the file.")

    // Have the file clean itself up in a tick
    // (doing it immediately causes react to barf)
    setTimeout(() => file.onRemove(), 10)

    return true
  }

  ////////////////
  // ## Debug
  ////////////////

  /** Debug string, e.g. `SpellProject: @user:projects:myProject`. */
  toString(): string {
    return `${this.constructor.name}: ${this.path}`
  }
}
