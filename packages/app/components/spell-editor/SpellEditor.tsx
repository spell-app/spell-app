import { untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { SP } from "$/spell"
import { LSP } from "$/lsp"
import type * as UIT from "$/app/ui/ui.types"
import type { monaco } from "$/app/ui/monaco"
// Import directly, NOT through the `$/app/runner` barrel, which would pull in `runCompiled()`, and so `spellCore`.
import type { SpellCompiled } from "$/app/runner/runner.types"
import { adoptShadowStyles } from "$/app/runner/shadowStyles"
import { SpellEditorPane, type SpellEditorStatus, type MonacoModule } from "$/app/spellEditor/SpellEditorPane"
import { spellEditorVocabulary } from "./SpellEditor.en"

// Every Solid computation follows spell cells (the project's files).
import "$/app/solid/cellsBridge"

/****************
 * ### `DOMSpellEditorElement`
 * The DOM element of `<spell-editor>`:  it adds the editor's script API, `compile()`, `save()` and `compiled`, which
 * its component does.
 * - Before the element first joins the page there's nothing to compile or save:  `compile()` resolves `undefined`.
 * - Above the component:  its `elementSetup` reads this class while the component is defined.
 ****************/
export class DOMSpellEditorElement extends E.DOMElement {
  /** How long after the last edit to compile, in msec. */
  static COMPILE_DELAY = 2000

  /** What it last compiled with no parse errors:  see `compile()`. */
  get compiled(): SpellCompiled | undefined {
    return this.editor?.compiled
  }

  /**
   * Compile its project now (first saving the files edited since) and, with no parse errors, hand it on:  see
   * `SpellEditor.compile()`.  Resolves with what it compiled, or `undefined` if there were errors.
   */
  compile(): Promise<SpellCompiled | undefined> {
    return this.editor?.compile() ?? Promise.resolve(undefined)
  }

  /** Save the files edited since they were last saved.  Resolves once they are. */
  save(): Promise<void> {
    return this.editor?.save() ?? Promise.resolve()
  }

  /** Its component. */
  private get editor(): SpellEditor | undefined {
    return this.component as SpellEditor | undefined
  }
}

/** The vocabulary's properties, typed. */
export interface DOMSpellEditorElement extends E.AttributeValues<typeof spellEditorVocabulary> {}

/****************
 * ### `SpellEditor`
 * The component behind `<spell-editor>`:  edits a spell project in any page, in Monaco, and feeds `<spell-app>`s on
 * the page what it compiles.
 * - `project="@system:examples:Solitaire"` (or `@examples/Solitaire`):  from the spell server's `/api`, as
 *   `<spell-app project>`.  Edits SAVE back to it:  every compile saves the files edited since, and Cmd+S saves.
 * - Compiles when it opens the project, `COMPILE_DELAY` after typing stops, and at once on Cmd+Enter.
 *   After each compile with no parse errors:
 *   - `compiled` holds what it made, a `SpellCompiled`
 *   - sends `spell-compiled` (`SPELL_COMPILED_EVENT`), bubbling out of the shadow root, with it as `detail`
 *   - hands it to each app `app` names:  `run(compiled)` (`pushToApps()`)
 * - Compiles WITHOUT Monaco, so apps run straight away.  Monaco, most of our code, loads after, for the view.
 * - Several may edit several projects on a page (`SpellModels.use()`).  Two of ONE project share its files, so
 *   typing in one shows in the other.
 * - Draws `<SpellEditorPane>` (no `<ui-*>`):  plain tabs and status line, styled by `spell-editor.css`, adopted
 *   from `assets` (default, beside its script).
 * - Leaving the page lets go of the project, a microtask later:  a move in one go keeps it.
 ****************/
export class SpellEditor extends E.UIComponent<typeof spellEditorVocabulary> {
  @E.proto static vocabulary = spellEditorVocabulary
  @E.protoMerged static elementSetup = {
    DOMElement: DOMSpellEditorElement,
    // Monaco takes focus where it's clicked
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  declare readonly domElement: DOMSpellEditorElement

  constructor(...args: ConstructorParameters<typeof E.UIComponent>) {
    super(...args)
    // where `assets` says as we join the page, else beside this script
    const assets = new URL(untrack(() => this.assets) ?? BUNDLE, document.baseURI).href
    void adoptShadowStyles(this.domElement.renderRoot, assets, EDITOR_CSS)
    this.domElement.addReleaseCallback(() => this.closeProject())
  }

  ////////////////
  // ## What we show
  ////////////////

  /** Project we're editing, once `project` names one. */
  @E.state private accessor openedProject: SP.SpellProject | undefined = undefined

  /** File we're showing. */
  @E.state private accessor shownFile: SP.SpellFile | undefined = undefined

  /** What we're doing, for the status line. */
  @E.state private accessor status: SpellEditorStatus = { state: "loading" }

  /** Monaco and our spell features, once loaded. */
  @E.state private accessor monacoModule: MonacoModule | undefined = undefined

  /** Bumped when the project's files change in ways no member says, e.g. edited since saved:  see `redraw()`. */
  @E.state private accessor version = 0

  /** Spell files of the project, for the tabs. */
  get files(): SP.SpellFile[] {
    return this.openedProject?.spellFiles ?? []
  }

  /** Is `file` edited since saved?  Read again as files are edited and saved (`version`). */
  isDirty = (file: SP.SpellFile): boolean => {
    void this.version
    return file.isDirty
  }

  ////////////////
  // ## Compiling
  ////////////////

  /** What we last compiled with no parse errors:  see `compile()`. */
  compiled: SpellCompiled | undefined

  /**
   * Compile our project now (first saving the files edited since) and, with no parse errors, hand it on:  see
   * `compiled`.  Returns it, or `undefined` if there were errors.
   * - One at a time, in order:  a compile asked for during another waits for it.
   */
  compile(): Promise<SpellCompiled | undefined> {
    this.clearCompileSoon()
    const next = this.compiles.then(() => this.compileNow())
    this.compiles = next.catch(() => undefined)
    return next
  }

  /** Save the files edited since they were last saved.  Returns once they are. */
  async save(): Promise<void> {
    const project = this.openedProject
    if (!project) return
    const dirty = project.spellFiles.filter((file) => file.isDirty)
    if (!dirty.length) return
    await Promise.all(dirty.map(async (file) => file.save(undefined)))
    this.setStatus({ state: "saved" })
  }

  /** Pending `compileSoon()`, if any. */
  private compileTimer?: E.CancelablePromise<unknown>

  /** Every compile so far, in order:  see `compile()`. */
  private compiles: Promise<unknown> = Promise.resolve()

  /** Projects we've parsed that `openedProject` imports compiled, for its scope pack:  see `scopesOf()`. */
  private readonly parsedImports = new WeakSet<SP.SpellProject>()

  /** Compile `COMPILE_DELAY` after this, unless asked again before. */
  private compileSoon() {
    this.clearCompileSoon()
    const delay = (this.domElement.constructor as typeof DOMSpellEditorElement).COMPILE_DELAY
    this.compileTimer = E.after(delay / 1000, () => void this.compile())
  }

  /** Forget any pending `compileSoon()`. */
  private clearCompileSoon() {
    this.compileTimer?.cancel()
    this.compileTimer = undefined
  }

  /** Compile `openedProject`:  see `compile()`. */
  private async compileNow(): Promise<SpellCompiled | undefined> {
    const project = this.openedProject
    if (!project) return undefined
    this.setStatus({ state: "compiling" })
    try {
      await this.save()
      await project.compile()
    } catch (error) {
      if (project === this.openedProject) this.setStatus({ state: "failed", message: messageOf(error) })
      return undefined
    }
    // opened another meanwhile
    if (project !== this.openedProject) return undefined
    const errors = parseErrors(project)
    const compiled = project.outputFile.contents ?? project.compiled
    if (errors || !compiled) {
      this.setStatus(
        errors ? { state: "errors", errors } : { state: "failed", message: this.textFor("nothingCompiled") }
      )
      return undefined
    }
    const detail: SpellCompiled = { projectId: project.projectId, compiled }
    const declarations = SP.SpellDeclarations.read(project.declarationsFile.contents ?? "")
    if (declarations) detail.declarations = declarations
    const scopes = await this.scopesOf(project).catch((error: unknown) => {
      console.warn("<spell-editor> couldn't make its scope pack -- apps show the server's:", error)
      return undefined
    })
    if (scopes) detail.scopes = scopes
    if (project !== this.openedProject) return undefined

    this.compiled = detail
    this.send("spell-compiled", detail)
    void this.pushToApps(detail)
    this.setStatus({ state: "compiled" })
    return detail
  }

  /**
   * `project`'s scope pack, fresh from its parse:  for an app's Type Explorer, as the server's may be stale.
   * - Only once Monaco's loaded:  its language service works out docs and locations.  Till then, `undefined`, and
   *   apps show the server's.
   * - Parses the projects it imports compiled first, once each, to show their sources:  see `LSP.ScopeExplorer`.
   */
  private async scopesOf(project: SP.SpellProject): Promise<LSP.ScopePack | undefined> {
    const service = this.monacoModule?.SpellMonaco.register().service
    if (!service) return undefined
    const explorer = new LSP.ScopeExplorer(service)
    for (const imported of LSP.ScopeExplorer.importedProjects(project)) {
      if (this.parsedImports.has(imported)) continue
      await imported.parse()
      this.parsedImports.add(imported)
    }
    return explorer.exportPack(project)
  }

  /**
   * Hand `compiled` to each `<spell-app>` our `app` selector finds, to `run()`.
   * - Waits for `<spell-app>` to be defined, if its script hasn't run yet, and hands on nothing if we've compiled
   *   again meanwhile.
   * - NOTE: an app added to the page later gets our NEXT compile.  One that names us, with `editor`, gets this one.
   */
  private async pushToApps(compiled: SpellCompiled) {
    const selector = this.app
    if (!selector) return
    await customElements.whenDefined(APP_TAG)
    if (compiled !== this.compiled) return
    const root = this.domElement.getRootNode() as Document | ShadowRoot
    for (const app of selectAll(root, selector)) {
      ;(app as Element & { run?: (compiled: SpellCompiled) => void }).run?.(compiled)
    }
  }

  ////////////////
  // ## Project
  ////////////////

  /** `project` attribute we opened `openedProject` for:  `null` before we've opened anything (`undefined` is "none"). */
  private projectAttribute: string | undefined | null = null

  /** What stops everything we started listening to, or using, for `openedProject`. */
  private stops: Array<() => void> = []

  /** Another `project`:  open it. */
  @E.onChange("project")
  protected onProjectChanged(project: string | undefined) {
    void this.openProject(project)
  }

  /** Another `file`:  show it. */
  @E.onChange("file")
  protected onFileChanged() {
    const project = this.openedProject
    if (project) this.showFile(this.namedFile(project))
  }

  /**
   * Open project `attribute` (our `project`) if it's another than we have open, and compile it.  Then load Monaco,
   * to show it.
   */
  private async openProject(attribute: string | undefined) {
    if (attribute === this.projectAttribute) return
    this.closeProject()
    this.projectAttribute = attribute
    if (!attribute) {
      this.setStatus({ state: "failed", message: this.textFor("noProject") })
      return
    }
    this.setStatus({ state: "loading" })
    let project: SP.SpellProject
    try {
      project = new SP.SpellProject(SP.SpellProject.projectIdForImport(attribute))
      await project.load()
    } catch (error) {
      if (attribute === this.projectAttribute) this.setStatus({ state: "failed", message: messageOf(error) })
      return
    }
    if (attribute !== this.projectAttribute) return
    this.openedProject = project
    this.shownFile = this.namedFile(project)
    await this.compile()
    await this.loadMonaco(project)
  }

  /** Stop editing our project:  no more compiles, and let go of everything we used for it. */
  private closeProject() {
    this.clearCompileSoon()
    for (const stop of this.stops.splice(0)) stop()
    this.openedProject = undefined
    this.shownFile = undefined
    this.compiled = undefined
  }

  /** The file our `file` attribute names in `project`, else its first spell file. */
  private namedFile(project: SP.SpellProject): SP.SpellFile | undefined {
    const files = project.spellFiles
    const name = untrack(() => this.file)
    return files.find((file) => file.file === name || file.path === name) ?? files[0]
  }

  /** Where to put the cursor when the editor next shows `path`, e.g. "go to definition" from another file. */
  private pendingSelection?: { path: string; selection: UIT.EditorSelection }

  /**
   * Show `file`, putting the cursor at `selection` if given.
   * - A tab clicked, too:  leaves our `file` attribute as it is.
   */
  showFile(file: SP.SpellFile | undefined, selection?: UIT.EditorSelection) {
    if (!file) return
    if (selection) this.pendingSelection = { path: file.path, selection }
    const same = file === this.shownFile
    this.shownFile = file
    if (same) this.applyPendingSelection()
  }

  ////////////////
  // ## Monaco
  ////////////////

  /** Our Monaco editor, once made. */
  private monacoEditor?: monaco.editor.IStandaloneCodeEditor

  /**
   * Load Monaco, and follow `project` in it:  keep its models, compile soon after each edit of it, and show the
   * files "go to definition" asks our editor for.
   */
  private async loadMonaco(project: SP.SpellProject) {
    const module = await loadMonaco()
    if (project !== this.openedProject) return
    const { SpellMonaco } = module
    this.stops.push(
      SpellMonaco.models.use(project),
      SpellMonaco.onEdit((file) => {
        if (file.project.path !== project.path) return
        this.compileSoon()
        this.redraw()
      }),
      SpellMonaco.onOpen((path, selection, source) => {
        const file = project.spellFiles.find((it) => it.path === path)
        if (!source || source !== this.monacoEditor || !file) return false
        this.showFile(file, selection)
        return true
      })
    )
    this.monacoModule = module
  }

  /** Our Monaco editor was made:  add our keys, and put the cursor where asked once it shows a file. */
  private onEditorMount(editor: monaco.editor.IStandaloneCodeEditor, api: typeof monaco) {
    this.monacoEditor = editor
    const { KeyMod, KeyCode } = api
    // `addAction()`, NOT `addCommand()`:  Monaco keeps commands for the page, so with several editors, the last wins
    editor.addAction({
      id: "spell.save",
      label: "Save",
      keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS],
      run: () => void this.save()
    })
    editor.addAction({
      id: "spell.compile",
      label: "Compile and run",
      keybindings: [KeyMod.CtrlCmd | KeyCode.Enter],
      run: () => void this.compile()
    })
    editor.onDidChangeModel(() => this.applyPendingSelection())
  }

  /** Our Monaco editor is going. */
  private onEditorUnmount(editor: monaco.editor.IStandaloneCodeEditor) {
    if (this.monacoEditor === editor) this.monacoEditor = undefined
  }

  /** Put the cursor where `showFile()` was asked to, if our editor now shows that file. */
  private applyPendingSelection() {
    const pending = this.pendingSelection
    const module = this.monacoModule
    const model = this.monacoEditor?.getModel()
    if (!pending || !model || !module || model.uri.toString() !== module.AppAddresses.uriOf(pending.path)) return
    this.pendingSelection = undefined
    const { anchor, head = anchor } = pending.selection
    if (!anchor || !head) return
    const selection = new module.monaco.Selection(anchor.line + 1, anchor.ch + 1, head.line + 1, head.ch + 1)
    this.monacoEditor!.setSelection(selection)
    this.monacoEditor!.revealRangeInCenterIfOutsideViewport(selection)
    this.monacoEditor!.focus()
  }

  ////////////////
  // ## Drawing
  ////////////////

  /** Say what we're doing, in the status line. */
  private setStatus(status: SpellEditorStatus) {
    this.status = status
    this.redraw()
  }

  /** Draw what no member says changed again, e.g. which files are edited since saved. */
  private redraw() {
    this.version++
  }

  /**
   * Our text `key`, in the page's language once the runtime has loaded;  its English before, as we may open and
   * compile a project before then.
   */
  private textFor(key: E.TextKey<typeof spellEditorVocabulary>): string {
    if (untrack(() => this.isReady)) return this.translationForKey(key)
    return spellEditorVocabulary.texts.find((text) => text.key === key)!.text
  }

  /** Our size, as our inline style. */
  @E.onChange("width", "height")
  protected onSizeChanged(width: string | undefined, height: string | undefined) {
    this.domElement.style.width = width ?? ""
    this.domElement.style.height = height ?? ""
  }

  /** Leaving the page lets go of the project, a microtask later:  a move in one go keeps it. */
  onDisconnect() {
    super.onDisconnect()
    const { domElement } = this
    E.afterSolidUpdate(() => {
      if (!domElement.isConnected) domElement.dispose()
    })
  }

  render(): JSX.Element {
    return (
      <SpellEditorPane
        files={this.files}
        file={this.shownFile}
        status={this.status}
        monaco={this.monacoModule}
        isDirty={this.isDirty}
        onSelect={(file) => this.showFile(file)}
        onMount={(editor, api) => this.onEditorMount(editor, api)}
        onUnmount={(editor) => this.onEditorUnmount(editor)}
      />
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface SpellEditor extends E.AttributeValues<typeof spellEditorVocabulary> {}

/**
 * URL of the folder this bundle's in:  by default, our `assets` are beside it.
 * - NOTE: NOT `new URL(".", import.meta.url)`:  vite takes that for an asset to bundle, and inlines it.
 */
const BUNDLE = import.meta.url.slice(0, import.meta.url.lastIndexOf("/") + 1)

/** CSS files our shadow root adopts, from `assets`:  Monaco's, and ours.  See `vite.editor.config.ts`. */
const EDITOR_CSS = ["spell-editor.css"]

/** The element we feed what we compile. */
const APP_TAG = "spell-app"

/** `$/app/solid/monaco`, loaded once:  Monaco is most of our code, so it waits till there's a project to show. */
let monacoModule: Promise<MonacoModule> | undefined

/** Load `$/app/solid/monaco` (Monaco, its spell plumbing, and the Solid `MonacoEditor`), once. */
function loadMonaco(): Promise<MonacoModule> {
  monacoModule ??= import("$/app/solid/monaco")
  return monacoModule
}

/** How many parse errors `project`'s spell files have, plus 1 if it couldn't parse at all. */
function parseErrors(project: SP.SpellProject): number {
  const files = project.spellFiles.map((file) => (file.match && SP.Block.getParseErrors(file.match)?.length) ?? 0)
  return files.reduce((sum, errors) => sum + errors, project.parseError ? 1 : 0)
}

/** Elements under `root` that `selector` matches:  none if it isn't a selector. */
function selectAll(root: Document | ShadowRoot, selector: string): Element[] {
  try {
    return Array.from(root.querySelectorAll(selector))
  } catch {
    return []
  }
}

/** Message of `error`, for the status line. */
function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
