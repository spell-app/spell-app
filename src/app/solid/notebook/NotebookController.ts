import { createSignal, runWithOwner, type Accessor } from "solid-js"
import { render } from "@solidjs/web"

import { PrefStore } from "spell/util/persist/PrefStore"
import { after, every } from "spell/element"
import { P } from "spell-parser/parser"
import { SP } from "spell-parser/spell"
import { SX } from "spell-parser/spellx"
import { editor } from "spell-app/app/editor"
import { isStaticBuild } from "spell-app/app/static/staticBuild"
import type { SpellRuntime } from "spell-app/app/runner"
import { NotebookCode, CODE_VIEWS, type CodeView } from "./NotebookCode"
import { NotebookKeys } from "./NotebookKeys"
import { NotebookPageCells, type NotebookPageModel, type PageCell } from "./NotebookPageCells"
import { CellRunner, ChunkTreeAdapter } from "./NotebookPatch"

/**
 * The controller of a notebook's page (epic `elemental-spell` P16):  its text, its cells and what each one draws;
 * every edit the page makes, saved cell by cell;  edit mode, the selection, the code view, the lock.
 * - The page is `<NotebookPage>`:  it draws what this says, and calls these methods from its clicks and editors.
 * - Its text is the notebook's `.spellx` file's:  an edit changes only its own cell's span (`NotebookPageCells`), and
 *   the file is saved 600ms after the last one, through the spaces API the editor saves with (`SP.SpellFile.save()`).
 * - Only the edited cell draws again, never the page:
 *   - each drawing cell (`<example>`, `<section>`) is compiled ON ITS OWN (`SP.SpellProject.compileChunk()`) and
 *     drawn into its own place, by the program's runtime (its `h()`, its classes);
 *   - an edited template is compiled into a class again, which takes its tag over, and the cells drawing it are
 *     drawn again (`<counter/>`);  nothing else
 *   - a broken edit keeps the last good drawing, and says what's wrong under its code (`errorsOf()`)
 * - Each example's code panel is made once and MOVED into its example when the example draws again:  an editor being
 *   typed in keeps its text, cursor and focus.
 * - Locked (`<spell-notebook "..." locked>`), only whoever can write the file saves:  anyone else's edits are a
 *   try-out, drawn but never saved, gone on reload.  "Try as a visitor" shows that side.
 * - Plain TypeScript and Solid's signals:  made in `<NotebookPage>`'s body, so its signals are the page's.
 */
export class NotebookController {
  /** The notebook's file. */
  readonly file: SP.SpellFile
  /** Its project, parsed:  where a cell compiles. */
  readonly project: SP.SpellProject

  constructor(file: SP.SpellFile, project: SP.SpellProject) {
    this.file = file
    this.project = project
    const text = file.contents ?? ""
    this.onDisk = text
    const model = NotebookPageCells.of(text, file.path)
    this.now = { text, model, keys: model?.cells.map(() => NotebookKeys.next()) ?? [], selected: undefined }
    ;[this.text, this.setText] = createSignal(text)
    ;[this.model, this.setModel] = createSignal<NotebookPageModel | undefined>(model)
    ;[this.keys, this.setKeys] = createSignal<string[]>(this.now.keys)
    ;[this.editing, this.setEditing] = createSignal(false)
    ;[this.selected, this.setSelected] = createSignal<string | undefined>(undefined)
    ;[this.visitor, this.setVisitor] = createSignal(false)
    ;[this.saving, this.setSaving] = createSignal(false)
    ;[this.errors, this.setErrors] = createSignal<Record<string, string[]>>({})
    ;[this.held, this.setHeld] = createSignal<Record<string, string>>({})
    const contents = PrefStore.getAt(this.contentsKey)
    ;[this.contentsShown, this.setContentsShown] = createSignal(contents !== false)
    ;[this.contentsOpen, this.setContentsOpenSignal] = createSignal(PrefStore.getAt(this.contentsOpenKey) === true)
    const view = PrefStore.getAt(this.viewKey) as CodeView | undefined
    ;[this.codeView, this.setCodeViewSignal] = createSignal<CodeView>(CODE_VIEWS.includes(view!) ? view! : "spellx")
  }

  ////////////////
  // ## State
  ////////////////

  /**
   * The text, its cells and their keys, and the selection, as they are NOW:  what an edit reads.
   * - Solid's signals below are what the page draws from;  a write to one is read back only once Solid has flushed,
   *   so two edits in a row would read the first one's old text.  This never lags.
   */
  private now: { text: string; model: NotebookPageModel | undefined; keys: string[]; selected: string | undefined }

  /** Set what's true now (`now`), and the signals the page draws from. */
  private setNow(now: Partial<NotebookController["now"]>) {
    this.now = { ...this.now, ...now }
    if ("text" in now) this.setText(this.now.text)
    if ("model" in now) this.setModel(this.now.model)
    if ("keys" in now) this.setKeys(this.now.keys)
    if ("selected" in now) this.setSelected(this.now.selected)
  }

  /** Cell `key` as it is now (`now`):  for an edit. */
  private currentCell(key: string): PageCell | undefined {
    const index = this.now.keys.indexOf(key)
    return index < 0 ? undefined : this.now.model?.cells[index]
  }

  /** The file's text, as the page last made it. */
  readonly text: Accessor<string>
  private readonly setText: (text: string) => void
  /** The notebook, read:  its tag and its cells. */
  readonly model: Accessor<NotebookPageModel | undefined>
  private readonly setModel: (model: NotebookPageModel | undefined) => void
  /** Each cell's key, in order:  what keeps its place (`NotebookKeys`). */
  readonly keys: Accessor<string[]>
  private readonly setKeys: (keys: string[]) => void
  /** Is the page in edit mode? */
  readonly editing: Accessor<boolean>
  private readonly setEditing: (editing: boolean) => void
  /** The selected cell's key:  what the toolbar acts on. */
  readonly selected: Accessor<string | undefined>
  private readonly setSelected: (key: string | undefined) => void
  /** Is an admin trying it as a visitor? */
  readonly visitor: Accessor<boolean>
  private readonly setVisitor: (visitor: boolean) => void
  /** Is a save on its way? */
  readonly saving: Accessor<boolean>
  private readonly setSaving: (saving: boolean) => void
  /** What's wrong with each cell's last edit, by its key:  `"<line>:<ch> <message>"`. */
  readonly errors: Accessor<Record<string, string[]>>
  private readonly setErrors: (errors: Record<string, string[]>) => void
  /** Which view the page shows code in:  one switch for every example (`CODE_VIEWS`). */
  readonly codeView: Accessor<CodeView>
  private readonly setCodeViewSignal: (view: CodeView) => void

  /** The cells, each with its key, in order. */
  cells(): KeyedCell[] {
    const keys = this.keys()
    return (this.model()?.cells ?? []).map((cell, index) => ({ cell, key: keys[index] ?? `cell-${index}` }))
  }

  /** The cell `key` is, if it's still there. */
  cellFor(key: string): PageCell | undefined {
    return this.cells().find((each) => each.key === key)?.cell
  }

  /**
   * The description of drawing cell `key`'s first example:  the text of the cell just before it, and that cell's key,
   * as a component page's example reads ("A standard button.", then the button).
   * - A prose cell gives its markdown;  a section's heading cell its text under the heading;  the page's title none.
   * - A `<text>` holding only text gives that text (`PageCell.description`).
   * - `undefined` when there's no such text, or the cell draws no example.
   */
  descriptionFor(key: string): { key: string; text: string } | undefined {
    const cells = this.cells()
    const index = cells.findIndex((each) => each.key === key)
    const before = cells[index - 1]
    if (index < 1 || !cells[index]!.cell.examples?.length) return undefined
    if (!before || before.cell.title) return undefined
    if (before.cell.description) return { key: before.key, text: before.cell.description }
    if (before.cell.kind !== "prose") return undefined
    const lines = before.cell.code.split("\n")
    const text = (before.cell.heading === undefined ? lines : lines.slice(1)).join("\n").trim()
    return text ? { key: before.key, text } : undefined
  }

  /** Is cell `key` the description of the example after it (`descriptionFor()`)?  It shows there, then. */
  isDescription(key: string): boolean {
    const cells = this.cells()
    const after = cells[cells.findIndex((each) => each.key === key) + 1]
    return !!after && this.descriptionFor(after.key)?.key === key
  }

  /** May this person save:  the notebook's unlocked, or they can write its file and aren't trying as a visitor? */
  canSave(): boolean {
    return !this.model()?.locked || this.isAdmin()
  }

  /** Can this person write the file?  Today:  the page server lets anyone (not the static build), but a visitor. */
  isAdmin(): boolean {
    return !isStaticBuild && !this.visitor()
  }

  ////////////////
  // ## Modes
  ////////////////

  /** Edit mode on or off:  every example's code becomes editable, prose and templates too. */
  toggleEditing() {
    this.setEditing(!this.editing())
  }

  /** Select cell `key`:  the toolbar's Delete and Move act on it. */
  select(key: string | undefined) {
    this.setNow({ selected: key })
  }

  /** Show every example's code as `view`, and remember it for this notebook. */
  setCodeView(view: CodeView) {
    this.setCodeViewSignal(view)
    try {
      PrefStore.setAt(this.viewKey, view)
    } catch (error) {
      console.error("NotebookController:  couldn't remember the code view", error)
    }
  }

  /** Try it as a visitor, or stop. */
  toggleVisitor() {
    this.setVisitor(!this.visitor())
  }

  /** Is "On this page" shown?  Always, unless hidden from the toolbar:  remembered per notebook. */
  readonly contentsShown: Accessor<boolean>
  private readonly setContentsShown: (shown: boolean) => void

  /** Show or hide "On this page", and remember it for this notebook. */
  toggleContents() {
    const shown = !this.contentsShown()
    this.setContentsShown(shown)
    try {
      PrefStore.setAt(this.contentsKey, shown)
    } catch (error) {
      console.error("NotebookController:  couldn't remember the contents", error)
    }
  }

  /**
   * Is "On this page" open as a flyout, from the icon on the title row, while its column isn't showing?
   * - remembered per notebook, as the column is
   */
  readonly contentsOpen: Accessor<boolean>
  private readonly setContentsOpenSignal: (open: boolean) => void

  /** Open or close "On this page"'s flyout, and remember it for this notebook. */
  setContentsOpen(open: boolean) {
    if (open === this.contentsOpen()) return
    this.setContentsOpenSignal(open)
    try {
      PrefStore.setAt(this.contentsOpenKey, open)
    } catch (error) {
      console.error("NotebookController:  couldn't remember the contents' flyout", error)
    }
  }

  /** Where "On this page"'s flyout being open is remembered:  per notebook. */
  private get contentsOpenKey(): string {
    return `spellEditor:notebook-contents-open:${this.file.path}`
  }

  /** Where "On this page" being shown is remembered:  per notebook. */
  private get contentsKey(): string {
    return `spellEditor:notebook-contents:${this.file.path}`
  }

  /** Where the code view is remembered:  per notebook. */
  private get viewKey(): string {
    return `spellEditor:notebook-view:${this.file.path}`
  }

  ////////////////
  // ## Edits
  ////////////////

  /** Cell `key`'s code is now `code` (spellx), as its editor shows it. */
  editCell(key: string, code: string) {
    const cell = this.currentCell(key)
    if (!cell || cell.code === code) return
    this.apply(NotebookPageCells.withCode(this.now.text, cell, code), { undoable: false })
  }

  /**
   * Example `index` of cell `key` now has `code`, in the page's code view:  an html edit is mapped back to spellx.
   * - The spell view is read only:  never called for it.
   */
  editExample(key: string, index: number, code: string) {
    const example = this.currentCell(key)?.examples?.[index]
    if (!example) return
    const spellx = this.codeView() === "html" ? NotebookCode.toSpellx(code, (tag) => this.wordFor(tag)) : code
    if (spellx === example.body.code) return
    this.apply(NotebookPageCells.withCode(this.now.text, example.body, spellx), { undoable: false })
  }

  /** Move the selected cell up or down one. */
  move(direction: "up" | "down") {
    const index = this.selectedIndex()
    if (index < 0) return
    this.apply(NotebookPageCells.moved(this.now.text, this.now.model!.cells, index, direction))
  }

  /** Delete the selected cell:  ⌘Z brings it back. */
  remove() {
    const index = this.selectedIndex()
    const cell = this.now.model?.cells[index]
    if (!cell) return
    this.apply(NotebookPageCells.deleted(this.now.text, cell))
    this.setNow({ selected: undefined })
  }

  /** Add `code`, a new cell, after the selected one (none:  at the end), and select it. */
  add(code: string) {
    const { model } = this.now
    if (!model) return
    const after = model.cells[this.selectedIndex()]
    const { text, start } = NotebookPageCells.inserted(this.now.text, model, after, code)
    this.apply(text)
    const index = this.now.model?.cells.findIndex((cell) => cell.span.start === start) ?? -1
    if (index >= 0) this.setNow({ selected: this.now.keys[index] })
  }

  /** Lock the notebook, or unlock it:  its tag's `locked`. */
  setLocked(locked: boolean) {
    const { model } = this.now
    if (model) this.apply(NotebookPageCells.withLock(this.now.text, model, locked))
  }

  /** Undo the last move, delete, add or lock:  the text, its cells and their keys as they were. */
  undo(): boolean {
    const last = this.history.pop()
    if (!last) return false
    this.apply(last.text, { undoable: false, keys: last.keys })
    return true
  }

  /** Is there something to undo? */
  get canUndo(): boolean {
    return this.history.length > 0
  }

  /**
   * The text is now `text`:  its cells, their keys, what draws again, and a save.
   * - `undoable`:  ⌘Z puts it back (a move, delete, add);  typing in an editor has the editor's own undo.
   * - `keys`:  the cells' keys, as an undo had them;  else carried over from the old cells (`NotebookKeys`).
   * - Locked and not an admin:  a try-out, never saved.
   */
  private apply(text: string, options: { undoable?: boolean; keys?: string[] } = {}) {
    const before = this.now.model?.cells ?? []
    const oldKeys = this.now.keys
    if (options.undoable !== false) this.history.push({ text: this.now.text, keys: oldKeys })
    const model = NotebookPageCells.of(text, this.file.path)
    const cells = model?.cells ?? []
    const keys = options.keys?.length === cells.length ? options.keys : NotebookKeys.carried(before, oldKeys, cells)
    this.setNow({ text, model, keys })
    this.later(() => this.redrawChanged(before, oldKeys, cells, keys, text))
    if (this.canSave()) this.saveSoon()
  }

  /** Index of the selected cell;  -1 for none. */
  private selectedIndex(): number {
    const key = this.now.selected
    return key ? this.now.keys.indexOf(key) : -1
  }

  /** What `undo()` puts back, newest last. */
  private readonly history: Array<{ text: string; keys: string[] }> = []

  ////////////////
  // ## Saving
  ////////////////

  /**
   * Run `work` after the work before it:  each edit's parse and drawing in turn, so one edit's parse never runs
   * between another's.
   * - NEVER throws:  a failure is logged.
   */
  private later(work: () => Promise<unknown>) {
    this.queue = this.queue.then(work).catch((error: unknown) => console.error("NotebookController:", error))
  }
  private queue: Promise<unknown> = Promise.resolve()

  /** The save waiting for the typing to stop. */
  private pendingSave: ReturnType<typeof after> | undefined

  /** Save the file 600ms after the last edit.  NEVER throws:  a failure is the editor's error banner. */
  private saveSoon() {
    this.pendingSave?.cancel()
    this.setSaving(true)
    this.pendingSave = after(SAVE_DELAY, () => {
      this.pendingSave = undefined
      // the file holds the latest text first:  its parse, after the edits before it
      this.later(async () => {
        try {
          const text = this.now.text
          await this.parsed(text)
          await this.file.save(undefined)
          this.onDisk = text
        } catch (error) {
          editor.showError(error)
        } finally {
          this.setSaving(false)
        }
      })
    })
    this.pendingSave.catch(() => undefined)
  }

  /**
   * The file's text changed from OUTSIDE the page (another tab, an agent, a text editor):
   * only the cells it changed draw again (epic `elemental-spell` P16, Step 4).
   * - Planned by epic-engine's shared page patch (`PagePatch`, P40), over the cells' chunk trees (`CellRunner`):
   *   each new cell keeps its old key where it's the same cell (`NotebookKeys`), so a moved one moves, an unchanged
   *   one stays as it is, and a changed one draws again.
   * - The cell being typed in (`typingIn`) keeps its text:  the change to it is held back, with a "Changed
   *   elsewhere" note offering theirs (`held()`, `takeTheirs()`).  An open editor is never replaced.
   */
  outsideChange(text: string) {
    if (text === this.now.text) return
    const before = this.now.model?.cells ?? []
    const oldKeys = this.now.keys
    let model = NotebookPageCells.of(text, this.file.path)
    const keys = NotebookKeys.carried(before, oldKeys, model?.cells ?? [])
    const steps = CellRunner.plan(new ChunkTreeAdapter(before, oldKeys), new ChunkTreeAdapter(model?.cells ?? [], keys))
    const typing = this.typingIn?.()
    const run = CellRunner.run(steps, new Set(typing ? [typing] : []))
    // the cell being typed in keeps its text:  theirs is kept aside, for its note
    const held = { ...this.held() }
    for (const key of run.held) {
      const mine = before[oldKeys.indexOf(key)]
      const theirs = model?.cells[keys.indexOf(key)]
      if (!mine || !theirs) continue
      held[key] = theirs.code
      text = NotebookPageCells.withCode(text, theirs, mine.code)
      model = NotebookPageCells.of(text, this.file.path)
    }
    this.setHeld(held)
    this.setNow({ text, model, keys })
    const changed = new Set(run.changed)
    this.later(() => this.redrawChanged(before, oldKeys, model?.cells ?? [], keys, text, changed))
  }

  /** The key of the cell being typed in, if any:  `<NotebookPage>` hands it in, from where the focus is. */
  typingIn: (() => string | undefined) | undefined

  /** Each held-back change from outside, by its cell's key:  the code the file had for it. */
  readonly held: Accessor<Record<string, string>>
  private readonly setHeld: (held: Record<string, string>) => void

  /** Take the change held back for cell `key`:  its code as the file had it. */
  takeTheirs(key: string) {
    const theirs = this.held()[key]
    const cell = this.currentCell(key)
    const { [key]: _taken, ...rest } = this.held()
    this.setHeld(rest)
    if (theirs !== undefined && cell) this.apply(NotebookPageCells.withCode(this.now.text, cell, theirs))
  }

  /** Keep my text for cell `key`, and forget the change held back for it. */
  keepMine(key: string) {
    const { [key]: _kept, ...rest } = this.held()
    this.setHeld(rest)
  }

  /**
   * Watch the file for changes from outside the page:  read it every `FILE_POLL` seconds while the page shows,
   * and hand a new text to `outsideChange()`.
   * - Never while a save of ours is on its way:  the file is about to be ours.
   * - Returns what stops it.
   */
  watchFile(): () => void {
    return every(FILE_POLL, () => {
      if (document.visibilityState !== "visible" || this.pendingSave || this.saving()) return
      void this.readFile()
    })
  }

  /** The file's text as it is on the server now:  someone else's, if it's not what we last read or saved. */
  private async readFile() {
    try {
      const response = await fetch(this.file.url, { cache: "no-store" })
      if (!response.ok) return
      const text = await response.text()
      if (text === this.onDisk || this.pendingSave || this.saving()) return
      this.onDisk = text
      this.outsideChange(text)
    } catch (error) {
      console.error("NotebookController:  couldn't read the file", error)
    }
  }

  /** The file's text as we last read it or saved it. */
  private onDisk: string

  ////////////////
  // ## Drawing cells
  ////////////////

  /** Each drawing cell's place on the page, and what's drawn there now, by key. */
  private readonly drawn = new Map<string, { host: HTMLElement; result?: HTMLElement; dispose?: () => void }>()

  /**
   * Each example's panels (its description, its code), by its cell's key, in order:
   * made once, moved into each new drawing.
   */
  private readonly panels = new Map<string, HTMLElement[][]>()

  /**
   * Makes example `index` of cell `key`'s panels, each slotted where it goes (`description`, `source`):
   * `<NotebookPage>` hands it in.
   */
  panelMaker: ((key: string, index: number) => HTMLElement[]) | undefined

  /** Cell `key` is drawn in `host`, a place on the page:  draw it there. */
  attach(key: string, host: HTMLElement) {
    this.drawn.set(key, { host })
    this.later(() => this.redraw(key))
  }

  /** Cell `key` left the page:  let go of what it drew, and its examples' panels. */
  detach(key: string) {
    const drawn = this.drawn.get(key)
    drawn?.dispose?.()
    this.drawn.delete(key)
  }

  /**
   * Draw cell `key` again, from its own code:  compiled on its own, drawn into a fresh box that takes the old one's
   * place, its examples' panels moved over.
   * - A compile error keeps what's drawn, and the errors show under its code (`errors()`).
   * - NEVER throws.
   */
  async redraw(key: string, text = this.now.text) {
    const cell = this.currentCell(key)
    const drawn = this.drawn.get(key)
    if (!cell || !drawn || cell.kind === "template" || cell.kind === "prose" || cell.kind === "heading") return
    try {
      const runtime = await editor.loadRuntime()
      const into = await this.parsed(text)
      const { code, errors } = SP.SpellProject.compileChunk({
        into,
        path: this.file.path,
        text,
        span: cell.span,
        kind: "drawing"
      })
      this.noteErrors(key, errors)
      if (errors.length || !code) return
      const drawing = evaluate(runtime, `(${code})`, this.notebookThing(runtime))
      const result = document.createElement("div")
      result.className = "NotebookResult"
      const dispose = runWithOwner(null, () => render(() => drawing as never, result))
      // the editor being typed in, if it's one of these panels:  moving it lets go of the focus, so it takes it back
      const typing = this.focusIn(key)
      this.movePanels(key, result)
      if (drawn.result) drawn.result.replaceWith(result)
      else drawn.host.append(result)
      // once its example has drawn its code pane round it
      if (typing) void after(0, () => typing.focus({ preventScroll: true })).catch(() => {})
      drawn.dispose?.()
      this.drawn.set(key, { host: drawn.host, result, dispose })
    } catch (error) {
      this.noteErrors(key, [error instanceof Error ? error.message : String(error)])
    }
  }

  /**
   * Template cell `key` changed:  compile its class again, which takes its tag over (`core.defineElement()`), then
   * draw again every cell drawing it.
   * - NEVER throws.
   */
  private async redefine(key: string, text: string) {
    const cell = this.currentCell(key)
    if (!cell) return
    try {
      const runtime = await editor.loadRuntime()
      const into = await this.parsed(text)
      const { code, errors, className } = SP.SpellProject.compileChunk({
        into,
        path: this.file.path,
        text,
        span: cell.span,
        kind: "template"
      })
      this.noteErrors(key, errors)
      if (errors.length || !code || !className) return
      evaluate(runtime, `(${code})`, undefined)
      const word = `<${(cell.name ?? "").trim().replace(/\s+/g, "-")}`
      for (const [index, each] of (this.now.model?.cells ?? []).entries()) {
        if (each.kind === "drawing" && each.code.includes(word)) await this.redraw(this.now.keys[index]!, text)
      }
    } catch (error) {
      this.noteErrors(key, [error instanceof Error ? error.message : String(error)])
    }
  }

  /**
   * After the text changed from `before` (`oldKeys`) to `cells` (`keys`):  draw again what changed.
   * - A drawing cell with a new key, or new code:  drawn again (a new one draws as its place joins the page).
   * - A template with new code:  its class again, and the cells drawing it.
   * - Anything else stays as it is.
   */
  private async redrawChanged(
    before: readonly PageCell[],
    oldKeys: readonly string[],
    cells: readonly PageCell[],
    keys: readonly string[],
    text: string,
    changed?: ReadonlySet<string>
  ) {
    const old = new Map(oldKeys.map((key, index) => [key, before[index]!]))
    await this.parsed(text)
    for (const [index, cell] of cells.entries()) {
      const key = keys[index]!
      const was = old.get(key)
      // the plan's changed cells, when a plan says (`outsideChange()`);  else each whose code changed
      if (changed ? !changed.has(key) : was?.code === cell.code) continue
      if (cell.kind === "template") await this.redefine(key, text)
      else if (was && this.drawn.has(key)) await this.redraw(key, text)
    }
  }

  /**
   * The project, parsed with `text` as the notebook's file:  where its cells compile.
   * - The editor parses the project as it opens it:  this waits for that (up to `PARSE_WAIT` seconds), rather than
   *   start a second parse beside it.
   * - Throws if it never parses.
   */
  private async parsed(text: string): Promise<P.IncrementalProject> {
    for (let waited = 0; !this.project.incremental && waited < PARSE_WAIT; waited += PARSE_POLL) await after(PARSE_POLL)
    if (!this.project.incremental) await this.project.parse()
    if (this.file.contents !== text) await this.project.updateText(this.file, text)
    if (!this.project.incremental) throw new Error("NotebookController:  the notebook's project didn't parse")
    return this.project.incremental
  }

  /** The program's notebook, the thing its drawings read as `it`:  its top-level notebook. */
  private notebookThing(runtime: SpellRuntime): unknown {
    const { Notebook, core } = runtime as unknown as {
      Notebook: abstract new () => unknown
      core: SpellRuntime["core"]
    }
    return core.things.topLevel().find((each) => each.thing instanceof Notebook)?.thing
  }

  /** What has the focus inside cell `key`'s examples' panels (an editor's text), if anything does. */
  private focusIn(key: string): HTMLElement | undefined {
    let active = document.activeElement
    while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement
    const panels = this.panels.get(key)?.flat() ?? []
    return active instanceof HTMLElement && panels.some((panel) => panel.contains(active)) ? active : undefined
  }

  /**
   * Move cell `key`'s examples' panels into the examples drawn in `result`, making the ones it hasn't got.
   * - An example whose code was open opens at once in the new drawing (its `code`):  no roll, nothing moves.
   */
  private movePanels(key: string, result: HTMLElement) {
    const examples = [...result.querySelectorAll(EXAMPLE_TAG)]
    const panels = this.panels.get(key) ?? []
    examples.forEach((example, index) => {
      panels[index] ??= this.panelMaker?.(key, index) ?? []
      // its code stays open as it was, while it's typed in:  the example it was in is the old drawing's
      const was = panels[index][0]?.parentElement
      if (was?.hasAttribute("code")) example.setAttribute("code", "")
      example.append(...panels[index])
    })
    this.panels.set(key, panels)
  }

  /** Note cell `key`'s errors:  `[]` for none. */
  private noteErrors(key: string, errors: string[]) {
    const all = { ...this.errors() }
    if (errors.length) all[key] = errors
    else delete all[key]
    this.setErrors(all)
  }

  ////////////////
  // ## Code views
  ////////////////

  /**
   * Example `index` of `cell`'s code in `view`.
   * - spellx:  as written;  html:  its bare names as their tags;  spell:  its `<example>` as code spell writes it.
   */
  exampleCode(cell: PageCell, index: number, view = this.codeView()): string {
    const example = cell.examples?.[index]
    if (!example) return ""
    if (view === "spellx") return example.body.code
    const html = NotebookCode.toHtml(example.body.code, (word) => this.tagFor(word))
    if (view === "html") return html
    const word = this.model()?.language === "es" ? "ejemplo" : "example"
    return [`<${word} "${example.name}">`, ...html.split("\n").map((line) => `\t${line}`), `</${word}>`].join("\n")
  }

  /** `cell`'s whole code in `view`:  a template's outline in code spell, a drawing's tags.  Read only but spellx. */
  cellCode(cell: PageCell, view = this.codeView()): string {
    if (view === "spellx" || cell.kind === "prose") return cell.code
    if (cell.kind === "template" && view === "spell") {
      const written = SX.CodeSpellWriter.write(cell.code, {
        path: this.file.path,
        componentTag: (word) => this.tagFor(word)
      })
      return written.trimEnd()
    }
    // a template's own tags (`<property>`, `<draw>`) stay:  only its drawings' names are tags
    const words = this.spellxWords()
    return NotebookCode.toHtml(cell.code, (word) => (words.has(word) ? undefined : this.tagFor(word)))
  }

  /** The words of the notebook's language that are spellx's own tags:  `property`, `draw`, `on` ... */
  private spellxWords(): Set<string> {
    const { spellx } = SP.Language.forFile(this.file.path).words
    const { declarations = {}, notes = {}, handlers = {}, controls = {} } = spellx ?? {}
    const words = [declarations, notes, handlers, controls].flatMap((table) => Object.keys(table))
    return new Set(words.map((word) => word.split(" ")[0]!))
  }

  /**
   * The tag bare name `word` draws in this notebook, as its last compile chose:  `counter` => `counter-counter`,
   * `button` => `ui-button`.
   */
  tagFor(word: string): string | undefined {
    return this.tags().get(word) ?? SP.ComponentPacks.tagFor(word, this.model()?.language ?? "en")
  }

  /** The bare name tag `tag` stands for:  `tagFor()` backwards. */
  wordFor(tag: string): string | undefined {
    for (const [word, each] of this.tags()) if (each === tag) return word
    // a pack's own:  `ui-button` is `button`
    const word = tag.replace(/^[a-z]+-/, "")
    return this.tagFor(word) === tag ? word : undefined
  }

  /** Each bare name the notebook's file draws, and its tag, from its last parse. */
  private tags(): Map<string, string> {
    const match = this.file.match
    if (this.tagsFrom && this.tagsFrom.match === match) return this.tagsFrom.tags
    const tags = new Map<string, string>()
    const visit = (each: P.Match) => {
      const [element] = each.matched
      const data = each.data as { tagName?: string; children?: unknown[] }
      if (element instanceof P.JSXElementToken && data.tagName && data.tagName !== element.tagName)
        tags.set(element.tagName, data.tagName)
      for (const inner of [...each.matched, ...(data.children ?? [])]) if (inner instanceof P.Match) visit(inner)
    }
    if (match) visit(match)
    this.tagsFrom = { match, tags }
    return tags
  }
  private tagsFrom: { match: P.Match | undefined; tags: Map<string, string> } | undefined
}

/** A cell and its key. */
export type KeyedCell = { cell: PageCell; key: string }

/** How long a cell waits for the editor's first parse of its project, seconds;  and how often it looks. */
const PARSE_WAIT = 15
const PARSE_POLL = 0.1

/** How often the page reads its file for a change from outside, seconds. */
const FILE_POLL = 2

/** How long after the last edit the file's saved, seconds. */
const SAVE_DELAY = 0.6

/** The tag a notebook's example draws as:  `example_block`'s. */
const EXAMPLE_TAG = "spell-example"

/**
 * `code`, compiled javascript, run on `runtime`, as a program's module would run it:  its `core`, `h()` and classes
 * by their names, `this` as `thisArg`.
 * - What the code reads as `@spell/core` is the runtime's own exports, as `runCompiled()` links a program's.
 */
function evaluate(runtime: SpellRuntime, code: string, thisArg: unknown): unknown {
  // oxlint-disable-next-line no-implied-eval -- running a cell's compiled spell, as a runner runs a program
  const run = new Function("$spell", `with ($spell) { return ${code} }`) as (this: unknown, scope: unknown) => unknown
  return run.call(thisArg, runtime)
}
