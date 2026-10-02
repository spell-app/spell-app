/** @jsxImportSource react */
import { createRoot, type Root } from "react-dom/client"

// Import directly, NOT through the `$/spell` barrel, which would pull in the whole parser.
import { SpellSetup } from "$/spell/SpellSetup"
import { SPELL_COMPILED_EVENT, type SpellCompiled } from "./runner.types"
import { shadowStyles } from "./shadowStyles"
import {
  SpellAppRunner,
  DEBUG_PANES,
  dropsPushedCode,
  editorCompiled,
  isEditor,
  pushedSource,
  type DebugPane,
  type SpellAppControls,
  type SpellAppSource
} from "./SpellAppRunner"

/**
 * `<spell-app>`:  runs a compiled spell project in any page, in its own shadow root -- no editor.
 * - What to run, one of:
 *   - `project="@system:examples:Solitaire"` -- or `@examples/Solitaire` -- from the spell server's `/api`,
 *     sources and all, so the Type Explorer shows each declaration's spell and compiled code
 *   - `src="apps/Solitaire.compiled.js"` -- from anywhere.  Its scope pack is `Solitaire.scopes.js` beside it,
 *     and a project it imports, `@x:y:Cards`, is `Cards.compiled.js` beside it.
 *   - `editor="#ed"`:  a CSS selector for a `<spell-editor>` in the same document or shadow root -- runs what it
 *     compiles, each `SPELL_COMPILED_EVENT`, and what it compiled already.  Waits for it without the others.
 *   - `run(compiled)`:  code pushed to us, e.g. by an editor with `app="<selector>"` -- see `run()`.
 * - Code pushed -- by `run()` or `editor` -- wins over `project` / `src`, until `project`, `src`, `scopes`,
 *   `name` or `editor` changes.  See `dropsPushedCode()`.
 * - Also:
 *   - `scopes`:  where its scope pack is, if not where `project` / `src` says
 *   - `name`:  for the toolbar -- default, its project's
 *   - `toolbar`:  show the toolbar:  name, Restart, "Debug"
 *   - `debug="explorer"` / `debug="things"` / `debug="console"`:  open the debug pane to start, on that tab
 *   - `width` / `height`:  `fluid` (default) or a CSS length, e.g. `50%`, `30em`.  A fluid height is as tall as
 *     the app, plus the debug pane if open.  Each sets our inline style, so page CSS works too.
 *   - `assets`:  where Semantic UI, Lato and `spell-app.css` are -- default, beside this script
 * - `restart()` runs it again, afresh -- code pushed to us too.
 * - Fires `spell-open` -- bubbling, out of the shadow root -- with `detail: { href }` when a Type Explorer
 *   link is clicked, e.g. `spell:/@system:examples:Solitaire/Card.spell#L12`.
 * - Each runs on its own copy of the spell runtime, so many can run on a page at once -- see `loadRuntime()`.
 * - NOTE: NOT in the `$/app/runner` barrel:  `extends HTMLElement` fails where there's no DOM, e.g. tests.
 */
export class SpellAppElement extends HTMLElement {
  static observedAttributes = [
    "project",
    "src",
    "scopes",
    "name",
    "editor",
    "toolbar",
    "debug",
    "width",
    "height",
    "assets"
  ]

  /** React root drawing us, while we're in the page. */
  #root?: Root
  /** What our runner lets us do -- see `restart()`. */
  #controls?: SpellAppControls
  /**
   * What we run, as last worked out -- kept while what it's from doesn't change, so it isn't re-run.
   * - From `pushed` if set, else the attributes in `key`.  `source` is `undefined` if there's nothing to run.
   */
  #source?: { key: string; pushed: SpellCompiled | undefined; source: SpellAppSource | undefined }
  /**
   * Code an editor pushed to us last -- see `run()`.
   * - Kept across leaving and rejoining the page.  Dropped when an attribute saying what to run changes.
   */
  #pushed?: SpellCompiled
  /** Where we listen for our `editor`'s compiles:  our root node, while we're in the page with an `editor`. */
  #listeningOn?: Node

  /** Draw ourselves -- in a shadow root, made the first time -- and listen for our `editor`. */
  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: "open" })
    void shadowStyles(this.assets).then((sheets) => (shadow.adoptedStyleSheets = sheets))
    const mount = document.createElement("div")
    mount.className = "SpellAppMount"
    shadow.replaceChildren(mount)
    this.#root = createRoot(mount)
    this.listen()
    this.render()
  }

  /** Gone from the page:  stop the app, let go of its runtime, and stop listening for our `editor`. */
  disconnectedCallback() {
    this.unlisten()
    this.#root?.unmount()
    this.#root = undefined
  }

  /**
   * An attribute changed:  draw again -- which re-runs the program, if what to run changed.
   * - SIDE EFFECT:  `project`, `src`, `scopes`, `name` or `editor` drops code pushed to us -- see `dropsPushedCode()`.
   * - A new `editor`:  listen for it instead, and run what it compiled already.
   */
  attributeChangedCallback(attribute: string, old: string | null, value: string | null) {
    if (old === value) return
    if (dropsPushedCode(attribute, old, value)) this.#pushed = undefined
    if (!this.#root) return
    if (attribute === "editor") this.listen()
    this.render()
  }

  /**
   * Run `compiled`, what an editor compiled -- instead of what our attributes say, until one of them changes.
   * - Its imports and sources are its project's, from the spell server -- as for `project`.
   * - Ignores `compiled` if it's what we ran last:  we may hear of one compile twice -- from our `editor`, AND
   *   from an editor whose `app` names us.  A `SpellCompiled` is a NEW object per compile.
   * - Before we're in the page, runs it once we are.
   */
  run(compiled: SpellCompiled): void {
    if (compiled === this.#pushed) return
    this.#pushed = compiled
    if (this.#root) this.render()
  }

  /** Run the program again, afresh -- code pushed to us, if any. */
  restart() {
    this.#controls?.restart()
  }

  /** Where Semantic UI, Lato and `spell-app.css` are -- see `assets`. */
  get assets(): string {
    return new URL(this.getAttribute("assets") ?? BUNDLE, document.baseURI).href
  }

  /** Draw with our attributes as they are. */
  private render() {
    this.style.width = cssSize(this.getAttribute("width"))
    this.style.height = cssSize(this.getAttribute("height"))
    const source = this.source()
    const debug = this.getAttribute("debug")
    const editor = this.getAttribute("editor")
    this.#root?.render(
      source ? (
        <SpellAppRunner
          source={source}
          toolbar={this.hasAttribute("toolbar")}
          debug={DEBUG_PANES.includes(debug as DebugPane) ? (debug as DebugPane) : undefined}
          fluid={!cssSize(this.getAttribute("height"))}
          runtimeUrl={new URL("spell-runtime.js", BUNDLE).href}
          builtInsUrl={new URL("spellCore.scopes.js", BUNDLE).href}
          onOpen={(href) =>
            this.dispatchEvent(new CustomEvent("spell-open", { detail: { href }, bubbles: true, composed: true }))
          }
          onControls={(controls) => (this.#controls = controls)}
        />
      ) : (
        <div className="SpellAppError">
          {editor ? `Waiting for its editor, ${editor}, to compile…` : "Give <spell-app> a project or src to run."}
        </div>
      )
    )
  }

  /**
   * What to run -- the same object while what it's from doesn't change.  `undefined` without anything.
   * - Code pushed to us if there is some, see `run()`, else from our attributes.
   * - NOTE: `editor` isn't in `key`:  changing it drops pushed code, but NEVER re-runs what our attributes say.
   */
  private source(): SpellAppSource | undefined {
    const [project, src, scopes, name] = ["project", "src", "scopes", "name"].map((it) => this.getAttribute(it))
    const key = JSON.stringify([project, src, scopes, name])
    const pushed = this.#pushed
    if (this.#source?.key !== key || this.#source.pushed !== pushed)
      this.#source = {
        key,
        pushed,
        source: pushed ? pushedSource(projectSource(pushed.projectId), pushed, name) : attributeSource()
      }
    return this.#source.source

    /** What to run from our attributes alone -- `undefined` without `project` or `src`. */
    function attributeSource(): SpellAppSource | undefined {
      const source = project ? projectSource(project) : src ? srcSource(src) : undefined
      if (!source) return undefined
      if (scopes) source.scopesUrl = new URL(scopes, document.baseURI).href
      if (name) source.name = name
      return source
    }
  }

  /**
   * Listen for our `editor`'s compiles, if we have one -- on our root node, so it's found in a shadow root too.
   * - Runs what it compiled already, if anything:  it may have compiled before we joined the page.
   */
  private listen() {
    this.unlisten()
    const selector = this.getAttribute("editor")
    if (!selector) return
    const root = (this.#listeningOn = this.getRootNode())
    root.addEventListener(SPELL_COMPILED_EVENT, this.#onCompiled)
    const compiled = editorCompiled(root as ParentNode, selector)
    if (compiled) this.run(compiled)
  }

  /** Stop listening for our `editor`'s compiles. */
  private unlisten() {
    this.#listeningOn?.removeEventListener(SPELL_COMPILED_EVENT, this.#onCompiled)
    this.#listeningOn = undefined
  }

  /**
   * A `SPELL_COMPILED_EVENT` in our root node:  run it, if it's from our `editor`.
   * - NOTE: an arrow, so it's the same function to add and remove.
   */
  #onCompiled = (event: Event) => {
    const selector = this.getAttribute("editor")
    if (selector && isEditor(event.target, selector)) this.run((event as CustomEvent<SpellCompiled>).detail)
  }
}

/**
 * URL of the folder this bundle's in -- `spell-runtime.js`, and by default its `assets`, are beside it.
 * - NOTE: NOT `new URL(".", import.meta.url)`:  vite takes that for an asset to bundle, and inlines it.
 */
const BUNDLE = import.meta.url.slice(0, import.meta.url.lastIndexOf("/") + 1)

/** Where the spell server's API is -- the page's own. */
const API = "/api/projects"

/** What to run for `project="<projectId>"`:  from the spell server, sources and all. */
function projectSource(project: string): SpellAppSource {
  const projectId = SpellSetup.expandAlias(project)
  return {
    name: projectId.slice(projectId.lastIndexOf(":") + 1),
    compiledUrl: `${API}/compiled/${projectId}`,
    scopesUrl: `${API}/scopes/${projectId}`,
    importUrl: (id) => `${API}/compiled/${SpellSetup.expandAlias(id)}`,
    // `spell:/@system:examples:Solitaire/Card.spell` => its project id, then its file
    sourceUrl: (uri) => `${API}/file/${decodeURI(uri.replace(/^spell:\//, ""))}`
  }
}

/** What to run for `src="<url>"`:  from anywhere, with what goes with it beside it. */
function srcSource(src: string): SpellAppSource {
  const compiledUrl = new URL(src, document.baseURI).href
  const file = decodeURIComponent(new URL(compiledUrl).pathname.split("/").pop() ?? "")
  const isCompiled = file.endsWith(COMPILED_JS)
  return {
    name: isCompiled ? file.slice(0, -COMPILED_JS.length) : file,
    compiledUrl,
    scopesUrl: isCompiled ? compiledUrl.replace(/\.compiled\.js(?=$|[?#])/, SCOPES_JS) : undefined,
    importUrl: (id) => new URL(`${id.slice(id.lastIndexOf(":") + 1)}${COMPILED_JS}`, compiledUrl).href
  }
}

/**
 * End of a compiled project's file name -- `SP.COMPILED_JS_SUFFIX`.
 * - NOTE: copies, NOT imported:  `$/spell` would pull the whole parser into the bundle.
 */
const COMPILED_JS = ".compiled.js"

/** End of a scope pack's file name -- `SP.SCOPES_JS_SUFFIX`. */
const SCOPES_JS = ".scopes.js"

/** `width` / `height` attribute `value` as a CSS size:  `""` for `fluid`, or none. */
function cssSize(value: string | null): string {
  return !value || value === "fluid" ? "" : value
}
