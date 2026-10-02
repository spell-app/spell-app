/** @jsxImportSource react */
import { createRoot, type Root } from "react-dom/client"

import { raw } from "$/util"
import { SP } from "$/spell"
import { LSP } from "$/lsp"
import type * as UIT from "$/app/ui/ui.types"
import type { monaco } from "$/app/ui/monaco"
// Import directly, NOT through the `$/app/runner` barrel, which would pull in `runCompiled()`, and so `spellCore`.
import { SPELL_COMPILED_EVENT, type SpellCompiled } from "$/app/runner/runner.types"
import { shadowStyles } from "$/app/runner/shadowStyles"
import { SpellEditorPane, type SpellEditorStatus, type MonacoModule } from "./SpellEditorPane"

/**
 * `<spell-editor>`:  edits a spell project in any page, in Monaco -- and feeds `<spell-app>`s on the page what it
 * compiles.
 * - `project="@system:examples:Solitaire"` -- or `@examples/Solitaire` -- from the spell server's `/api`, as
 *   `<spell-app project>`.  Edits SAVE back to it:  every compile saves the files edited since, and Cmd+S saves.
 * - Also:
 *   - `file`:  which to show first, e.g. `Card.spell` -- default, its first spell file.  Tabs show the others.
 *   - `app`:  a CSS selector for `<spell-app>`s to run what we compile, e.g. `#game` -- see `pushToApps()`.
 *     Or an app can name US, with its `editor` attribute.  Either will do.
 *   - `width` / `height`:  a CSS length, e.g. `50%`, `30em` -- each sets our inline style, so page CSS works too.
 *   - `assets`:  where `spell-editor.css` and Lato are -- default, beside this script
 * - Compiles when it opens the project, 2 seconds after typing stops, and at once on Cmd+Enter.
 *   After each compile with no parse errors:
 *   - `compiled` holds what it made -- a `SpellCompiled`
 *   - fires `spell-compiled` (`SPELL_COMPILED_EVENT`) -- bubbling, out of the shadow root -- with it as `detail`
 *   - hands it to each app `app` names:  `run(compiled)`
 * - `compile()` and `save()` do what Cmd+Enter and Cmd+S do.
 * - Compiles WITHOUT Monaco, so apps run straight away.  Monaco -- most of our code -- loads after, for the view.
 * - Several may edit several projects on a page -- see `SpellModels.use()`.  Two of ONE project share its files, so
 *   typing in one shows in the other.
 * - NOTE: NOT in the `$/app/spellEditor` barrel:  `extends HTMLElement` fails where there's no DOM, e.g. tests.
 */
export class SpellEditorElement extends HTMLElement {
  static observedAttributes = ["project", "file", "app", "width", "height", "assets"]

  /** How long after the last edit to compile, in msec. */
  static COMPILE_DELAY = 2000

  /** What we last compiled with no parse errors -- see `compile()`. */
  compiled: SpellCompiled | undefined

  /** React root drawing us, while we're in the page. */
  #root?: Root
  /** Project we're editing, once `project` names one. */
  #project?: SP.SpellProject
  /** `project` attribute we opened `#project` for. */
  #projectAttribute?: string
  /** File we're showing. */
  #file?: SP.SpellFile
  /** What we're doing, for the status line. */
  #status: SpellEditorStatus = { state: "loading" }
  /** Monaco and our spell features, once loaded. */
  #monaco?: MonacoModule
  /** Our Monaco editor, once made. */
  #editor?: monaco.editor.IStandaloneCodeEditor
  /** Where to put the cursor when the editor next shows `path` -- e.g. "go to definition" from another file. */
  #pendingSelection?: { path: string; selection: UIT.EditorSelection }
  /** What stops everything we started listening to, or using, for `#project`. */
  #stops: Array<() => void> = []
  /** Pending `compileSoon()`, if any. */
  #compileTimer?: ReturnType<typeof setTimeout>
  /** Every compile so far, in order -- see `compile()`. */
  #compiles: Promise<unknown> = Promise.resolve()
  /** Projects we've parsed that `#project` imports compiled, for its scope pack -- see `scopesOf()`. */
  #parsedImports = new WeakSet<SP.SpellProject>()

  /** Draw ourselves -- in a shadow root, made the first time -- and open our project. */
  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: "open" })
    void shadowStyles(this.assets, EDITOR_CSS).then((sheets) => (shadow.adoptedStyleSheets = sheets))
    const mount = document.createElement("div")
    mount.className = "SpellEditorMount"
    shadow.replaceChildren(mount)
    this.#root = createRoot(mount)
    this.render()
    void this.openProject()
  }

  /** Gone from the page:  stop compiling, and let go of our project. */
  disconnectedCallback() {
    this.closeProject()
    this.#projectAttribute = undefined
    this.#root?.unmount()
    this.#root = undefined
  }

  /** An attribute changed:  open another project, show another file, or just draw again. */
  attributeChangedCallback(name: string) {
    if (!this.#root) return
    if (name === "project") void this.openProject()
    else if (name === "file") this.showFile(this.namedFile())
    else this.render()
  }

  /** Where `spell-editor.css` and Lato are -- see `assets`. */
  get assets(): string {
    return new URL(this.getAttribute("assets") ?? BUNDLE, document.baseURI).href
  }

  ////////////////
  // ## Compiling
  ////////////////

  /**
   * Compile our project now -- first saving the files edited since -- and, with no parse errors, hand it on:
   * see `compiled`.  Returns it, or `undefined` if there were errors.
   * - One at a time, in order:  a compile asked for during another waits for it.
   */
  compile(): Promise<SpellCompiled | undefined> {
    this.clearCompileSoon()
    const next = this.#compiles.then(() => this.compileNow())
    this.#compiles = next.catch(() => undefined)
    return next
  }

  /** Save the files edited since they were last saved.  Returns once they are. */
  async save(): Promise<void> {
    const project = this.#project
    if (!project) return
    const dirty = project.spellFiles.filter((file) => file.isDirty)
    if (!dirty.length) return
    await Promise.all(dirty.map(async (file) => file.save(undefined)))
    this.setStatus({ state: "saved" })
  }

  /** Compile `COMPILE_DELAY` after this -- unless asked again before. */
  private compileSoon() {
    this.clearCompileSoon()
    this.#compileTimer = setTimeout(() => void this.compile(), SpellEditorElement.COMPILE_DELAY)
  }

  /** Forget any pending `compileSoon()`. */
  private clearCompileSoon() {
    if (this.#compileTimer) clearTimeout(this.#compileTimer)
    this.#compileTimer = undefined
  }

  /** Compile `#project` -- see `compile()`. */
  private async compileNow(): Promise<SpellCompiled | undefined> {
    const project = this.#project
    if (!project) return undefined
    this.setStatus({ state: "compiling" })
    try {
      await this.save()
      await project.compile()
    } catch (error) {
      if (project === this.#project) this.setStatus({ state: "failed", message: messageOf(error) })
      return undefined
    }
    // opened another meanwhile
    if (project !== this.#project) return undefined
    const errors = parseErrors(project)
    const compiled = project.outputFile.contents ?? project.compiled
    if (errors || !compiled) {
      this.setStatus(errors ? { state: "errors", errors } : { state: "failed", message: "Nothing compiled" })
      return undefined
    }
    const detail: SpellCompiled = { projectId: project.projectId, compiled }
    const scopes = await this.scopesOf(project).catch((error: unknown) => {
      console.warn("<spell-editor> couldn't make its scope pack -- apps show the server's:", error)
      return undefined
    })
    if (scopes) detail.scopes = scopes
    if (project !== this.#project) return undefined

    this.compiled = detail
    this.dispatchEvent(new CustomEvent(SPELL_COMPILED_EVENT, { detail, bubbles: true, composed: true }))
    void this.pushToApps(detail)
    this.setStatus({ state: "compiled" })
    return detail
  }

  /**
   * `project`'s scope pack, fresh from its parse -- for an app's Type Explorer, as the server's may be stale.
   * - Only once Monaco's loaded:  its language service works out docs and locations.  Till then, `undefined`, and
   *   apps show the server's.
   * - Parses the projects it imports compiled first, once each, to show their sources -- see `LSP.ScopeExplorer`.
   */
  private async scopesOf(project: SP.SpellProject): Promise<LSP.ScopePack | undefined> {
    const service = this.#monaco?.SpellMonaco.register().service
    if (!service) return undefined
    const explorer = new LSP.ScopeExplorer(service)
    for (const imported of LSP.ScopeExplorer.importedProjects(project)) {
      if (this.#parsedImports.has(imported)) continue
      await imported.parse()
      this.#parsedImports.add(imported)
    }
    return explorer.exportPack(project)
  }

  /**
   * Hand `compiled` to each `<spell-app>` our `app` selector finds, to `run()`.
   * - Waits for `<spell-app>` to be defined, if its script hasn't run yet -- and hands on nothing if we've compiled
   *   again meanwhile.
   * - NOTE: an app added to the page later gets our NEXT compile.  One that names us, with `editor`, gets this one.
   */
  private async pushToApps(compiled: SpellCompiled) {
    const selector = this.getAttribute("app")
    if (!selector) return
    await customElements.whenDefined("spell-app")
    if (compiled !== this.compiled) return
    const root = this.getRootNode() as Document | ShadowRoot
    for (const app of selectAll(root, selector)) {
      ;(app as Element & { run?: (compiled: SpellCompiled) => void }).run?.(compiled)
    }
  }

  ////////////////
  // ## Project
  ////////////////

  /**
   * Open the project our `project` attribute names -- if it names another -- and compile it.  Then load Monaco,
   * to show it.
   */
  private async openProject() {
    const attribute = this.getAttribute("project") ?? undefined
    if (attribute === this.#projectAttribute) return
    this.closeProject()
    this.#projectAttribute = attribute
    if (!attribute) {
      this.setStatus({ state: "failed", message: "Give <spell-editor> a project to edit." })
      return
    }
    this.setStatus({ state: "loading" })
    let project: SP.SpellProject
    try {
      project = raw(new SP.SpellProject(SP.SpellProject.projectIdForImport(attribute)))
      await project.load()
    } catch (error) {
      if (attribute === this.#projectAttribute) this.setStatus({ state: "failed", message: messageOf(error) })
      return
    }
    if (attribute !== this.#projectAttribute) return
    this.#project = project
    this.#file = this.namedFile()
    await this.compile()
    await this.loadMonaco(project)
  }

  /** Stop editing our project:  no more compiles, and let go of everything we used for it. */
  private closeProject() {
    this.clearCompileSoon()
    for (const stop of this.#stops.splice(0)) stop()
    this.#project = undefined
    this.#file = undefined
    this.compiled = undefined
  }

  /** The file our `file` attribute names, else our project's first spell file. */
  private namedFile(): SP.SpellFile | undefined {
    const files = this.#project?.spellFiles ?? []
    const name = this.getAttribute("file")
    return files.find((file) => file.file === name || file.path === name) ?? files[0]
  }

  /** Show `file`, putting the cursor at `selection` if given. */
  private showFile(file: SP.SpellFile | undefined, selection?: UIT.EditorSelection) {
    if (!file) return
    if (selection) this.#pendingSelection = { path: file.path, selection }
    const same = file === this.#file
    this.#file = file
    this.render()
    if (same) this.applyPendingSelection()
  }

  ////////////////
  // ## Monaco
  ////////////////

  /**
   * Load Monaco, and follow `project` in it:  keep its models, compile soon after each edit of it, and show the
   * files "go to definition" asks our editor for.
   */
  private async loadMonaco(project: SP.SpellProject) {
    const module = await loadMonaco()
    if (project !== this.#project) return
    this.#monaco = module
    const { SpellMonaco } = module
    this.#stops.push(
      SpellMonaco.models.use(project),
      SpellMonaco.onEdit((file) => {
        if (file.project.path !== project.path) return
        this.compileSoon()
        this.render()
      }),
      SpellMonaco.onOpen((path, selection, source) => {
        const file = project.spellFiles.find((it) => it.path === path)
        if (!source || source !== this.#editor || !file) return false
        this.showFile(file, selection)
        return true
      })
    )
    this.render()
  }

  /** Our Monaco editor was made:  add our keys, and put the cursor where asked once it shows a file. */
  private onEditorMount(editor: monaco.editor.IStandaloneCodeEditor, api: typeof monaco) {
    this.#editor = editor
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
    if (this.#editor === editor) this.#editor = undefined
  }

  /** Put the cursor where `showFile()` was asked to, if our editor now shows that file. */
  private applyPendingSelection() {
    const pending = this.#pendingSelection
    const model = this.#editor?.getModel()
    if (!pending || !model || !this.#monaco || model.uri.toString() !== this.#monaco.AppAddresses.uriOf(pending.path))
      return
    this.#pendingSelection = undefined
    const { anchor, head = anchor } = pending.selection
    if (!anchor || !head) return
    const selection = new this.#monaco.monaco.Selection(anchor.line + 1, anchor.ch + 1, head.line + 1, head.ch + 1)
    this.#editor!.setSelection(selection)
    this.#editor!.revealRangeInCenterIfOutsideViewport(selection)
    this.#editor!.focus()
  }

  ////////////////
  // ## Drawing
  ////////////////

  /** Say what we're doing, in the status line. */
  private setStatus(status: SpellEditorStatus) {
    this.#status = status
    this.render()
  }

  /** Draw with our attributes and state as they are. */
  private render() {
    this.style.width = this.getAttribute("width") ?? ""
    this.style.height = this.getAttribute("height") ?? ""
    this.#root?.render(
      <SpellEditorPane
        files={this.#project?.spellFiles ?? []}
        file={this.#file}
        status={this.#status}
        monaco={this.#monaco}
        onSelect={(file) => this.showFile(file)}
        onMount={(editor, api) => this.onEditorMount(editor, api)}
        onUnmount={(editor) => this.onEditorUnmount(editor)}
      />
    )
  }
}

/**
 * URL of the folder this bundle's in -- by default, its `assets` are beside it.
 * - NOTE: NOT `new URL(".", import.meta.url)`:  vite takes that for an asset to bundle, and inlines it.
 */
const BUNDLE = import.meta.url.slice(0, import.meta.url.lastIndexOf("/") + 1)

/** CSS files our shadow root adopts, from `assets` -- Monaco's, and ours.  See `vite.editor.config.ts`. */
const EDITOR_CSS = ["spell-editor.css"]

/** `$/app/ui/monaco`, loaded once -- Monaco is most of our code, so it waits till there's a project to show. */
let monacoModule: Promise<MonacoModule> | undefined

/** Load `$/app/ui/monaco`, once. */
function loadMonaco(): Promise<MonacoModule> {
  monacoModule ??= import("$/app/ui/monaco")
  return monacoModule
}

/** How many parse errors `project`'s spell files have, plus 1 if it couldn't parse at all. */
function parseErrors(project: SP.SpellProject): number {
  const files = project.spellFiles.map((file) => (file.match && SP.Block.getParseErrors(file.match)?.length) ?? 0)
  return files.reduce((sum, errors) => sum + errors, project.parseError ? 1 : 0)
}

/** Elements under `root` that `selector` matches -- none if it isn't a selector. */
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
