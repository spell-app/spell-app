import { createRoot, type Root } from "react-dom/client"

// Import directly, NOT through the `~/languages/spell` barrel, which would pull in the whole parser.
import { SpellSetup } from "~/languages/spell/SpellSetup"
import { shadowStyles } from "./shadowStyles"
import { SpellAppRunner, type DebugPane, type SpellAppControls, type SpellAppSource } from "./SpellAppRunner"

/**
 * `<spell-app>`:  runs a compiled spell project in any page, in its own shadow root -- no editor.
 * - What to run, one of:
 *   - `project="@system:examples:Solitaire"` -- or `@examples/Solitaire` -- from the spell server's `/api`,
 *     sources and all, so the Type Explorer shows each declaration's spell and compiled code
 *   - `src="apps/Solitaire.compiled.js"` -- from anywhere.  Its scope pack is `Solitaire.scopes.js` beside it,
 *     and a project it imports, `@x:y:Cards`, is `Cards.compiled.js` beside it.
 * - Also:
 *   - `scopes`:  where its scope pack is, if not where `project` / `src` says
 *   - `name`:  for the toolbar -- default, its project's
 *   - `toolbar`:  show the toolbar:  name, Restart, "Debug"
 *   - `debug="explorer"` / `debug="console"`:  open the debug pane to start, on that tab
 *   - `width` / `height`:  `fluid` (default) or a CSS length, e.g. `50%`, `30em`.  A fluid height is as tall as
 *     the app, plus the debug pane if open.  Each sets our inline style, so page CSS works too.
 *   - `assets`:  where Semantic UI, Lato and `spell-app.css` are -- default, beside this script
 * - `restart()` runs it again, afresh.
 * - Fires `spell-open` -- bubbling, out of the shadow root -- with `detail: { href }` when a Type Explorer
 *   link is clicked, e.g. `spell:/@system:examples:Solitaire/Card.spell#L12`.
 * - Each runs on its own copy of the spell runtime, so many can run on a page at once -- see `loadRuntime()`.
 * - NOTE: NOT in the `~/app/runner` barrel:  `extends HTMLElement` fails where there's no DOM, e.g. tests.
 */
export class SpellAppElement extends HTMLElement {
  static observedAttributes = ["project", "src", "scopes", "name", "toolbar", "debug", "width", "height", "assets"]

  /** React root drawing us, while we're in the page. */
  #root?: Root
  /** What our runner lets us do -- see `restart()`. */
  #controls?: SpellAppControls
  /** What we run, as last worked out -- kept while the attributes it's from don't change, so it isn't re-run. */
  #source?: { key: string; source: SpellAppSource }

  /** Draw ourselves -- in a shadow root, made the first time. */
  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: "open" })
    void shadowStyles(this.assets).then((sheets) => (shadow.adoptedStyleSheets = sheets))
    const mount = document.createElement("div")
    mount.className = "SpellAppMount"
    shadow.replaceChildren(mount)
    this.#root = createRoot(mount)
    this.render()
  }

  /** Gone from the page:  stop the app, and let go of its runtime. */
  disconnectedCallback() {
    this.#root?.unmount()
    this.#root = undefined
  }

  /** An attribute changed:  draw again -- which re-runs the program, if what to run changed. */
  attributeChangedCallback() {
    if (this.#root) this.render()
  }

  /** Run the program again, afresh. */
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
    this.#root?.render(
      source ? (
        <SpellAppRunner
          source={source}
          toolbar={this.hasAttribute("toolbar")}
          debug={debug === "explorer" || debug === "console" ? (debug as DebugPane) : undefined}
          fluid={!cssSize(this.getAttribute("height"))}
          runtimeUrl={new URL("spell-runtime.js", BUNDLE).href}
          builtInsUrl={new URL("spellCore.scopes.js", BUNDLE).href}
          onOpen={(href) =>
            this.dispatchEvent(new CustomEvent("spell-open", { detail: { href }, bubbles: true, composed: true }))
          }
          onControls={(controls) => (this.#controls = controls)}
        />
      ) : (
        <div className="SpellAppError">{"Give <spell-app> a project or src to run."}</div>
      )
    )
  }

  /** What to run, from our attributes -- the same object while they don't change.  `undefined` without any. */
  private source(): SpellAppSource | undefined {
    const [project, src, scopes, name] = ["project", "src", "scopes", "name"].map((it) => this.getAttribute(it))
    const key = JSON.stringify([project, src, scopes, name])
    if (this.#source?.key !== key) {
      const source = project ? projectSource(project) : src ? srcSource(src) : undefined
      if (!source) return undefined
      if (scopes) source.scopesUrl = new URL(scopes, document.baseURI).href
      if (name) source.name = name
      this.#source = { key, source }
    }
    return this.#source.source
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
 * - NOTE: copies, NOT imported:  `~/languages/spell` would pull the whole parser into the bundle.
 */
const COMPILED_JS = ".compiled.js"

/** End of a scope pack's file name -- `SP.SCOPES_JS_SUFFIX`. */
const SCOPES_JS = ".scopes.js"

/** `width` / `height` attribute `value` as a CSS size:  `""` for `fluid`, or none. */
function cssSize(value: string | null): string {
  return !value || value === "fluid" ? "" : value
}
