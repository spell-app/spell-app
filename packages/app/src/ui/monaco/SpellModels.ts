import { observe } from "$/util"
import { SP } from "$/spell"
import type { LSP } from "$/lsp"
import { monaco } from "./monaco"
import { AppAddresses } from "./AppAddresses"
import { LspToMonaco } from "./LspToMonaco"
import { SpellMonaco } from "./SpellMonaco"

/**
 * One Monaco model per file the editor works with, each a VIEW of its file's `contents`.
 * - `SpellFile` / `SpellProject` stay the source of truth:  this never parses, and stores nothing about parses.
 * - Model => file:  every edit, typed or from a rename, goes into `file.contents` and re-parses as little as
 *   possible via `project.updateText()`, then `onEdit`.  All at once, so a hover right after sees the new parse.
 * - File => model:  a change from outside, e.g. load or reload, replaces the model's text (and its undo).
 * - Parse => markers:  whenever a spell file's `match` changes -- even from an edit to ANOTHER file -- its
 *   diagnostics become the model's markers, and `onDidParse` fires, e.g. for fresh semantic colouring.
 * - Follows files with `observe()` (`$/util`, on spell cells):  a plain function, re-run synchronously as the cells
 *   it read change -- no framework, so it's fine wherever `modelFor()` is called from.
 * - Covers a project at a time:  a model for every spell file it parses (peek, references and rename need them),
 *   plus any other file once shown.  Showing a file of another project disposes of the last one's models --
 *   UNLESS something `use()`s it, e.g. a `<spell-editor>`, so several editors on a page can show several projects.
 */
export class SpellModels {
  /** Answers diagnostics for our spell files. */
  declare service: LSP.SpellLanguageService
  /** Called after each edit of a model has gone into its file. */
  declare onEdit: (file: SP.AnySpellFile) => void

  /** Project of the file we last made a model for -- see `modelFor()`. */
  #project: SP.SpellProject | undefined
  /** How many are using each project, so its models stay -- see `use()`. */
  #users = new Map<SP.SpellProject, number>()
  /** Each file's model, its project, and what stops it following its file, by `file.path`. */
  #models = new Map<string, { model: monaco.editor.ITextModel; project: SP.SpellProject; dispose: () => void }>()
  /**
   * Paths of files to save as soon as their model takes an edit -- see `saveAfterEdit()`.
   * - By path:  what `saveAfterEdit()` is handed may be a fresh object for the same file.
   */
  #toSave = new Set<string>()
  /** Fires when any spell file's parse changes. */
  #onDidParse = new monaco.Emitter<void>()
  /** Subscribe to parse changes, e.g. to ask for semantic colouring again. */
  readonly onDidParse = this.#onDidParse.event

  constructor(service: LSP.SpellLanguageService, onEdit: (file: SP.AnySpellFile) => void) {
    this.service = service
    this.onEdit = onEdit
  }

  /**
   * Model for `file`, made if need be -- along with one for every spell file its project parses.
   * - SIDE EFFECT:  a file of another project disposes of the last project's models first, unless it's `use()`d.
   */
  modelFor(file: SP.AnySpellFile): monaco.editor.ITextModel {
    const previous = this.#project
    if (file.project !== previous) {
      this.#project = file.project
      if (previous && !this.#users.has(previous)) this.disposeProject(previous)
    }
    for (const spellFile of file.project.spellFiles) this.ensureModel(spellFile)
    return this.ensureModel(file)
  }

  /**
   * Keep `project`'s models while it's in use, e.g. by a `<spell-editor>` -- whatever other project's files are shown.
   * - Returns what stops using it:  once nobody does, its models go, unless it's the project last shown.
   */
  use(project: SP.SpellProject): () => void {
    this.#users.set(project, (this.#users.get(project) ?? 0) + 1)
    let released = false
    return () => {
      if (released) return
      released = true
      const users = this.#users.get(project)! - 1
      if (users) this.#users.set(project, users)
      else {
        this.#users.delete(project)
        if (project !== this.#project) this.disposeProject(project)
      }
    }
  }

  /**
   * Save each of `files` once its model takes its next edit, e.g. a rename's.
   * - Forgets any that haven't had one after `SAVE_WAIT` msec, e.g. a rename Monaco didn't apply.
   */
  saveAfterEdit(files: SP.AnySpellFile[]): void {
    for (const file of files) this.#toSave.add(file.path)
    setTimeout(() => files.forEach((file) => this.#toSave.delete(file.path)), SpellModels.SAVE_WAIT)
  }

  /** How long `saveAfterEdit()` waits for an edit, in msec. */
  static SAVE_WAIT = 2000

  /** Dispose of every model we have, and stop following their files. */
  disposeAll(): void {
    for (const { dispose } of this.#models.values()) dispose()
    this.#models.clear()
    this.#project = undefined
  }

  /** Dispose of `project`'s models, and stop following their files. */
  private disposeProject(project: SP.SpellProject): void {
    for (const [path, { project: owner, dispose }] of this.#models) {
      if (owner !== project) continue
      dispose()
      this.#models.delete(path)
    }
  }

  ////////////////
  // ## Following files
  ////////////////

  /** `file`'s model, made and set following its file if we don't have one. */
  private ensureModel(file: SP.AnySpellFile): monaco.editor.ITextModel {
    const existing = this.#models.get(file.path)
    if (existing) return existing.model

    const uri = monaco.Uri.parse(AppAddresses.uriOf(file.path))
    const model =
      monaco.editor.getModel(uri) ??
      monaco.editor.createModel(file.contents ?? "", SpellMonaco.languageForPath(file.path), uri)
    const listener = model.onDidChangeContent(() => this.modelEdited(file, model))
    const stopContents = observe(() => this.whenContentsChange(file, model))
    const stopParse = file instanceof SP.SpellFile ? observe(() => this.whenParsed(file, model)) : undefined
    this.#models.set(file.path, {
      model,
      project: file.project,
      dispose() {
        listener.dispose()
        stopContents()
        stopParse?.()
        model.dispose()
      }
    })
    return model
  }

  /**
   * `model` was edited:  its text goes into `file`, which re-parses.
   * - Ignores `contentsChanged()` putting `file`'s own text in, which leaves them equal.
   */
  private modelEdited(file: SP.AnySpellFile, model: monaco.editor.ITextModel): void {
    const text = model.getValue()
    if (text === file.contents) return
    file.isDirty = true
    if (file instanceof SP.SpellFile) void file.project.updateText(file, text)
    else {
      file.contents = text
      file.project.updatedContentsFor(file)
    }
    this.onEdit(file)
    if (this.#toSave.delete(file.path)) {
      Promise.resolve(file.save(undefined)).catch((error: unknown) =>
        console.warn(`SpellModels: couldn't save ${file.path}`, error)
      )
    }
  }

  /**
   * Follow `file.contents` -- and ONLY that:  when they change, `contentsChanged()` in a microtask.
   * - NEVER touch Monaco inside the reaction:  `setValue()` fires cursor events there and then, whose listeners read
   *   spell state -- which the reaction would follow too.
   */
  private whenContentsChange(file: SP.AnySpellFile, model: monaco.editor.ITextModel): void {
    if (file.contents !== undefined) queueMicrotask(() => this.contentsChanged(file, model))
  }

  /** `file`'s `contents` changed from outside, e.g. it loaded:  `model` takes them, starting its undo afresh. */
  private contentsChanged(file: SP.AnySpellFile, model: monaco.editor.ITextModel): void {
    const { contents } = file
    if (contents !== undefined && !model.isDisposed() && contents !== model.getValue()) model.setValue(contents)
  }

  /**
   * Follow `file.match` -- and ONLY that:  when it changes, `parseChanged()` in a microtask.
   * - Outside this reaction, so nothing `parseChanged()` reads is followed too:  the diagnostics read, and fill
   *   caches in, observable state, e.g. `project.activeImports`, which would set this off again, for ever.
   * - A microtask also lets a parse finish setting `scope`, `inputLines` and `match` first.
   */
  private whenParsed(file: SP.SpellFile, model: monaco.editor.ITextModel): void {
    if (file.match) queueMicrotask(() => this.parseChanged(file, model))
  }

  /** `file`'s parse changed:  its diagnostics become `model`'s markers, and `onDidParse` fires. */
  private parseChanged(file: SP.SpellFile, model: monaco.editor.ITextModel): void {
    if (!file.match || model.isDisposed()) return
    const markers = this.service.diagnostics(file).map((diagnostic) => LspToMonaco.marker(diagnostic))
    monaco.editor.setModelMarkers(model, SpellMonaco.LANGUAGE, markers)
    this.#onDidParse.fire()
  }
}
