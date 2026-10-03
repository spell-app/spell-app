import { createEffect, createSignal, onCleanup, type Accessor } from "solid-js"
import {
  customElement,
  type ComponentOptions,
  type SolidElement,
  type SolidElementClass
} from "@spell-app/solid-element"

import { SP } from "$/spell"
import { LSP } from "$/lsp"
import type * as UIT from "$/app/ui/ui.types"
import type { monaco } from "$/app/ui/monaco"
// Import directly, NOT through the `$/app/runner` barrel, which would pull in `runCompiled()`, and so `spellCore`.
import { SPELL_COMPILED_EVENT, type SpellCompiled } from "$/app/runner/runner.types"
import { shadowStyles } from "$/app/runner/shadowStyles"
import { SpellEditorPane, type SpellEditorStatus, type MonacoModule } from "./SpellEditorPane"

import "$/app/solid/cellsBridge"

/****************
 * ### `<spell-editor>`
 * Edits a spell project in any page, in Monaco -- and feeds `<spell-app>`s on the page what it compiles.
 * - `project="@system:examples:Solitaire"` -- or `@examples/Solitaire` -- from the spell server's `/api`, as
 *   `<spell-app project>`.  Edits SAVE back to it:  every compile saves the files edited since, and Cmd+S saves.
 * - Also:
 *   - `file`:  which to show first, e.g. `Card.spell` -- default, its first spell file.  Tabs show the others.
 *   - `app`:  a CSS selector for `<spell-app>`s to run what we compile, e.g. `#game` -- see `pushToApps()`.
 *     Or an app can name US, with its `editor` attribute.  Either will do.
 *   - `width` / `height`:  a CSS length, e.g. `50%`, `30em` -- each sets our inline style, so page CSS works too.
 *   - `assets`:  where `spell-editor.css` and Lato are -- default, beside this script.  Read as we join the page.
 * - Each attribute is a property too (`editor.project = ...`), via `@spell-app/solid-element`'s `customElement()`.
 * - Compiles when it opens the project, 2 seconds after typing stops, and at once on Cmd+Enter.
 *   After each compile with no parse errors:
 *   - `compiled` holds what it made -- a `SpellCompiled`
 *   - fires `spell-compiled` (`SPELL_COMPILED_EVENT`) -- bubbling, out of the shadow root -- with it as `detail`
 *   - hands it to each app `app` names:  `run(compiled)`
 * - `compile()` and `save()` do what Cmd+Enter and Cmd+S do.
 * - Compiles WITHOUT Monaco, so apps run straight away.  Monaco -- most of our code -- loads after, for the view.
 * - Several may edit several projects on a page -- see `SpellModels.use()`.  Two of ONE project share its files, so
 *   typing in one shows in the other.
 * - Draws in Solid (`<SpellEditorPane>`), no `<ui-*>`:  plain tabs and status line, styled by `spell-editor.css`.
 * - Leaving the page lets go of the project, a microtask later:  a move in one go keeps it.
 * - NOTE: NOT in the `$/app/spellEditor` barrel:  defining an element fails where there's no DOM, e.g. tests.
 ****************/
export function defineSpellEditor(): SpellEditorElementClass {
  return customElement("spell-editor", SPELL_EDITOR_PROPS, SpellEditor, {
    BaseElement: SpellEditorBase
  }) as SpellEditorElementClass
}

/** `<spell-editor>`'s attributes, each a property too -- see `defineSpellEditor()`. */
const SPELL_EDITOR_PROPS = {
  project: { type: String },
  file: { type: String },
  app: { type: String },
  width: { type: String },
  height: { type: String }
}

/** `<spell-editor>`'s props, as its component reads them. */
type SpellEditorProps = {
  project?: string
  file?: string
  app?: string
  width?: string
  height?: string
}

/** A `<spell-editor>`:  its methods, its props as properties, and the element plumbing. */
export type SpellEditorElement = SpellEditorBase & SpellEditorProps & SolidElement

/** The `<spell-editor>` class `defineSpellEditor()` defines. */
export type SpellEditorElementClass = SolidElementClass & { new (): SpellEditorElement; COMPILE_DELAY: number }

/**
 * What `<spell-editor>` adds to `HTMLElement`, beside its props:  compiling, saving, the project and Monaco.
 * - The BASE of the class `customElement()` makes, so its prop accessors come on top.
 * - What it shows is in signals (`view`), written from anywhere (`ownedWrite`):  its component draws them.
 * - NOTE: `declare` only for the props it reads:  a field would shadow their accessors.
 */
class SpellEditorBase extends HTMLElement {
  declare file?: string
  declare app?: string

  /** How long after the last edit to compile, in msec. */
  static COMPILE_DELAY = 2000

  /** What we last compiled with no parse errors -- see `compile()`. */
  compiled: SpellCompiled | undefined

  /** Project we're editing, once `project` names one. */
  #project = createSignal<SP.SpellProject | undefined>(undefined, { ownedWrite: true })
  /**
   * `project` attribute we opened `#project` for -- `null` before we've opened anything.
   * - NOTE: NOT `undefined`:  that's "no project", which says so in the status line.
   */
  #projectAttribute: string | undefined | null = null
  /** File we're showing. */
  #file = createSignal<SP.SpellFile | undefined>(undefined, { ownedWrite: true })
  /** What we're doing, for the status line. */
  #status = createSignal<SpellEditorStatus>({ state: "loading" }, { ownedWrite: true })
  /** Monaco and our spell features, once loaded. */
  #monaco = createSignal<MonacoModule | undefined>(undefined, { ownedWrite: true })
  /** Bumped when the project's files change in ways no signal says, e.g. edited since saved -- see `redraw()`. */
  #version = createSignal(0, { ownedWrite: true })
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

  /** What we show, for our component to draw:  read-only accessors over our state. */
  readonly view: SpellEditorView = {
    files: () => this.#project[0]()?.spellFiles ?? [],
    file: () => this.#file[0](),
    status: () => this.#status[0](),
    monaco: () => this.#monaco[0](),
    isDirty: (file) => {
      this.#version[0]()
      return file.isDirty
    }
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
    const project = this.#project[0]()
    if (!project) return
    const dirty = project.spellFiles.filter((file) => file.isDirty)
    if (!dirty.length) return
    await Promise.all(dirty.map(async (file) => file.save(undefined)))
    this.setStatus({ state: "saved" })
  }

  /** Compile `COMPILE_DELAY` after this -- unless asked again before. */
  private compileSoon() {
    this.clearCompileSoon()
    const delay = (this.constructor as typeof SpellEditorBase).COMPILE_DELAY
    this.#compileTimer = setTimeout(() => void this.compile(), delay)
  }

  /** Forget any pending `compileSoon()`. */
  private clearCompileSoon() {
    if (this.#compileTimer) clearTimeout(this.#compileTimer)
    this.#compileTimer = undefined
  }

  /** Compile `#project` -- see `compile()`. */
  private async compileNow(): Promise<SpellCompiled | undefined> {
    const project = this.#project[0]()
    if (!project) return undefined
    this.setStatus({ state: "compiling" })
    try {
      await this.save()
      await project.compile()
    } catch (error) {
      if (project === this.#project[0]()) this.setStatus({ state: "failed", message: messageOf(error) })
      return undefined
    }
    // opened another meanwhile
    if (project !== this.#project[0]()) return undefined
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
    if (project !== this.#project[0]()) return undefined

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
    const service = this.#monaco[0]()?.SpellMonaco.register().service
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
    const selector = this.app
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
   * Open project `attribute` -- our `project` -- if it's another than we have open, and compile it.  Then load
   * Monaco, to show it.
   * - For our component, as `project` changes.
   */
  async openProject(attribute: string | undefined) {
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
      project = new SP.SpellProject(SP.SpellProject.projectIdForImport(attribute))
      await project.load()
    } catch (error) {
      if (attribute === this.#projectAttribute) this.setStatus({ state: "failed", message: messageOf(error) })
      return
    }
    if (attribute !== this.#projectAttribute) return
    this.#project[1](project)
    this.#file[1](this.namedFile(project))
    await this.compile()
    await this.loadMonaco(project)
  }

  /**
   * Stop editing our project:  no more compiles, and let go of everything we used for it.
   * - `forget`:  forget which `project` we opened too, so the next `openProject()` opens it afresh -- as we leave
   *   the page.
   */
  closeProject({ forget = false } = {}) {
    this.clearCompileSoon()
    for (const stop of this.#stops.splice(0)) stop()
    this.#project[1](undefined)
    this.#file[1](undefined)
    this.compiled = undefined
    if (forget) this.#projectAttribute = null
  }

  /**
   * Show the file our `file` attribute names, else our project's first spell file.
   * - For our component, as `file` changes.
   */
  showNamedFile() {
    const project = this.#project[0]()
    if (project) this.showFile(this.namedFile(project))
  }

  /** The file our `file` attribute names in `project`, else its first spell file. */
  private namedFile(project: SP.SpellProject): SP.SpellFile | undefined {
    const files = project.spellFiles
    const name = this.file
    return files.find((file) => file.file === name || file.path === name) ?? files[0]
  }

  /**
   * Show `file`, putting the cursor at `selection` if given.
   * - For our component too:  a tab clicked.  Leaves our `file` attribute as it is.
   */
  showFile(file: SP.SpellFile | undefined, selection?: UIT.EditorSelection) {
    if (!file) return
    if (selection) this.#pendingSelection = { path: file.path, selection }
    const same = file === this.#file[0]()
    this.#file[1](file)
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
    if (project !== this.#project[0]()) return
    const { SpellMonaco } = module
    this.#stops.push(
      SpellMonaco.models.use(project),
      SpellMonaco.onEdit((file) => {
        if (file.project.path !== project.path) return
        this.compileSoon()
        this.redraw()
      }),
      SpellMonaco.onOpen((path, selection, source) => {
        const file = project.spellFiles.find((it) => it.path === path)
        if (!source || source !== this.#editor || !file) return false
        this.showFile(file, selection)
        return true
      })
    )
    this.#monaco[1](module)
  }

  /**
   * Our Monaco editor was made:  add our keys, and put the cursor where asked once it shows a file.
   * - For our component.
   */
  onEditorMount(editor: monaco.editor.IStandaloneCodeEditor, api: typeof monaco) {
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

  /** Our Monaco editor is going.  For our component. */
  onEditorUnmount(editor: monaco.editor.IStandaloneCodeEditor) {
    if (this.#editor === editor) this.#editor = undefined
  }

  /** Put the cursor where `showFile()` was asked to, if our editor now shows that file. */
  private applyPendingSelection() {
    const pending = this.#pendingSelection
    const module = this.#monaco[0]()
    const model = this.#editor?.getModel()
    if (!pending || !model || !module || model.uri.toString() !== module.AppAddresses.uriOf(pending.path)) return
    this.#pendingSelection = undefined
    const { anchor, head = anchor } = pending.selection
    if (!anchor || !head) return
    const selection = new module.monaco.Selection(anchor.line + 1, anchor.ch + 1, head.line + 1, head.ch + 1)
    this.#editor!.setSelection(selection)
    this.#editor!.revealRangeInCenterIfOutsideViewport(selection)
    this.#editor!.focus()
  }

  ////////////////
  // ## Drawing
  ////////////////

  /** Say what we're doing, in the status line. */
  private setStatus(status: SpellEditorStatus) {
    this.#status[1](status)
    this.redraw()
  }

  /** Draw what no signal says changed again, e.g. which files are edited since saved. */
  private redraw() {
    this.#version[1]((version) => version + 1)
  }
}

/** What a `<spell-editor>` shows, as accessors over its state -- see `SpellEditorBase.view`. */
export type SpellEditorView = {
  /** Spell files of the project, for the tabs. */
  files: Accessor<SP.SpellFile[]>
  /** File showing. */
  file: Accessor<SP.SpellFile | undefined>
  /** What it's doing, for the status line. */
  status: Accessor<SpellEditorStatus>
  /** Monaco and our spell features, once loaded. */
  monaco: Accessor<MonacoModule | undefined>
  /** Is `file` edited since saved?  Re-read as files are edited and saved. */
  isDirty: (file: SP.SpellFile) => boolean
}

/**
 * `<spell-editor>`'s component:  styles its shadow root, follows its props, and draws `<SpellEditorPane>`.
 * - SIDE EFFECT:  sets our inline `width` / `height`;  opens `project`, and lets go of it as we leave the page.
 */
function SpellEditor(props: SpellEditorProps, options: ComponentOptions) {
  // the class `customElement()` made, on our base:  its types can't say so
  const element = options.element as unknown as SpellEditorElement
  const root = element.renderRoot as ShadowRoot
  void shadowStyles(element.assets, EDITOR_CSS).then((sheets) => {
    root.adoptedStyleSheets = [...sheets, ...root.adoptedStyleSheets.filter((sheet) => !sheets.includes(sheet))]
  })

  // Our size, as our inline style.
  createEffect(
    () => [props.width ?? "", props.height ?? ""] as const,
    ([width, height]) => {
      element.style.width = width
      element.style.height = height
    }
  )

  // Another project:  open it.  Another file:  show it.
  createEffect(
    () => props.project,
    (project) => {
      void element.openProject(project)
    }
  )
  createEffect(
    () => props.file,
    () => {
      element.showNamedFile()
    }
  )
  onCleanup(() => element.closeProject({ forget: true }))

  const { view } = element
  return (
    <SpellEditorPane
      files={view.files()}
      file={view.file()}
      status={view.status()}
      monaco={view.monaco()}
      isDirty={view.isDirty}
      onSelect={(file) => element.showFile(file)}
      onMount={(editor, api) => element.onEditorMount(editor, api)}
      onUnmount={(editor) => element.onEditorUnmount(editor)}
    />
  )
}

/**
 * URL of the folder this bundle's in -- by default, its `assets` are beside it.
 * - NOTE: NOT `new URL(".", import.meta.url)`:  vite takes that for an asset to bundle, and inlines it.
 */
const BUNDLE = import.meta.url.slice(0, import.meta.url.lastIndexOf("/") + 1)

/** CSS files our shadow root adopts, from `assets` -- Monaco's, and ours.  See `vite.editor.config.ts`. */
const EDITOR_CSS = ["spell-editor.css"]

/** `$/app/solid/monaco`, loaded once -- Monaco is most of our code, so it waits till there's a project to show. */
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
