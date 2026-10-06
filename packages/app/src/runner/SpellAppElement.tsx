import { Show, createEffect, createMemo } from "solid-js"
import {
  customElement,
  type ComponentOptions,
  type SolidElement,
  type SolidElementClass
} from "@spell-app/solid-element"

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

// Defines every `<ui-*>` the runner draws, once per page -- see `loadUI.ts`.
import "$/app/solid/cellsBridge"
import "$/app/solid/loadUI"

/****************
 * ### `<spell-app>`
 * Runs a compiled spell project in any page, in its own shadow root -- no editor.
 * - What to run, one of:
 *   - `project="@system:examples:Solitaire"` -- or `@examples/Solitaire` -- from the spell server's `/api`,
 *     sources and all, so the Type Explorer shows each declaration's spell and compiled code
 *   - `src="apps/Solitaire.compiled.js"` -- from anywhere.  Its scope pack is `Solitaire.scopes.js` beside it, its
 *     declarations `Solitaire.declarations.json`, and a project it imports, `@x:y:Cards`, is `Cards.compiled.js`
 *     beside it.
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
 *   - `assets`:  where Semantic UI, Lato and `spell-app.css` are -- default, beside this script.  Read as we
 *     join the page.
 * - Each attribute is a property too (`app.project = ...`), via `@spell-app/solid-element`'s `customElement()`.
 * - `restart()` runs it again, afresh -- code pushed to us too.
 * - Fires `spell-open` -- bubbling, out of the shadow root -- with `detail: { href }` when a Type Explorer
 *   link is clicked, e.g. `spell:/@system:examples:Solitaire/Card.spell#L12`.
 * - Each runs on its own copy of the spell runtime, so many can run on a page at once -- see `loadRuntime()`.
 * - Draws in Solid, the runner's UI on `@spell-app/ui`, inside a `<ui-root icons="fomantic">`:  the runner's icon
 *   names are Fomantic's.  The PROGRAM draws with React, Semantic UI's CSS adopted here (`shadowStyles()`).
 * - Leaving the page stops the app and lets go of its runtime, a microtask later:  a move in one go keeps it.
 * - NOTE: NOT in the `$/app/runner` barrel:  defining an element fails where there's no DOM, e.g. tests.
 ****************/
export function defineSpellApp(): SpellAppElementClass {
  return customElement("spell-app", SPELL_APP_PROPS, SpellApp, { BaseElement: SpellAppBase }) as SpellAppElementClass
}

/**
 * `<spell-app>`'s attributes, each a property too -- see `defineSpellApp()`.
 * - `pushed`:  property only, code pushed to us last -- see `run()`.
 */
const SPELL_APP_PROPS = {
  project: { type: String },
  src: { type: String },
  scopes: { type: String },
  name: { type: String },
  editor: { type: String },
  toolbar: { type: Boolean },
  debug: { type: String },
  width: { type: String },
  height: { type: String },
  pushed: { attribute: false as const, value: undefined as SpellCompiled | undefined }
}

/** `<spell-app>`'s props, as its component reads them. */
type SpellAppProps = {
  project?: string
  src?: string
  scopes?: string
  name?: string
  editor?: string
  toolbar: boolean
  debug?: string
  width?: string
  height?: string
  pushed?: SpellCompiled
}

/** A `<spell-app>`:  its methods, its props as properties, and the element plumbing. */
export type SpellAppElement = SpellAppBase & SpellAppProps & SolidElement

/** The `<spell-app>` class `defineSpellApp()` defines. */
export type SpellAppElementClass = SolidElementClass & { new (): SpellAppElement }

/**
 * What `<spell-app>` adds to `HTMLElement`, beside its props:  `run()`, `restart()`, `assets`.
 * - The BASE of the class `customElement()` makes, so its prop accessors come on top.
 * - NOTE: `declare` only for the props it reads:  a field would shadow their accessors.
 */
class SpellAppBase extends HTMLElement {
  declare project?: string
  declare src?: string
  declare scopes?: string
  declare name?: string
  declare editor?: string
  declare pushed?: SpellCompiled

  /** What our runner lets us do -- handed over by `<SpellAppRunner>`, see `restart()`. */
  controls?: SpellAppControls

  /**
   * What `pushed` was pushed for:  our `project`, `src`, `scopes`, `name` and `editor` then -- see `pushedKey()`.
   * - Pushed code counts only while they're the same.
   */
  pushedFor?: string

  /**
   * Run `compiled`, what an editor compiled -- instead of what our attributes say, until one of them changes.
   * - Its imports and sources are its project's, from the spell server -- as for `project`.
   * - Ignores `compiled` if it's what we ran last:  we may hear of one compile twice -- from our `editor`, AND
   *   from an editor whose `app` names us.  A `SpellCompiled` is a NEW object per compile.
   * - Before we're in the page, runs it once we are.  Kept across leaving and rejoining the page.
   */
  run(compiled: SpellCompiled): void {
    if (compiled === this.pushed && this.pushedFor === pushedKey(this)) return
    this.pushedFor = pushedKey(this)
    this.pushed = compiled
  }

  /** Run the program again, afresh -- code pushed to us, if any. */
  restart() {
    this.controls?.restart()
  }

  /** Where Semantic UI, Lato and `spell-app.css` are -- see `assets`. */
  get assets(): string {
    return new URL(this.getAttribute("assets") ?? BUNDLE, document.baseURI).href
  }
}

/**
 * `<spell-app>`'s component:  styles its shadow root, works out what to run, and draws `<SpellAppRunner>`.
 * - SIDE EFFECT:  sets our inline `width` / `height`, and listens for our `editor`'s compiles on our root node.
 */
function SpellApp(props: SpellAppProps, options: ComponentOptions) {
  // the class `customElement()` made, on our base:  its types can't say so
  const element = options.element as unknown as SpellAppElement
  const root = element.renderRoot as ShadowRoot
  void shadowStyles(element.assets).then((sheets) => {
    root.adoptedStyleSheets = [...sheets, ...root.adoptedStyleSheets.filter((sheet) => !sheets.includes(sheet))]
  })

  // An attribute saying what to run, or which editor, changed:  drop code pushed to us.
  element.addPropertyChangedCallback((key, value, old) => {
    if (!dropsPushedCode(key, old as string | null, value as string | null)) return
    element.pushedFor = undefined
    element.pushed = undefined
  })

  // Our size, as our inline style.
  createEffect(
    () => [cssSize(props.width), cssSize(props.height)] as const,
    ([width, height]) => {
      element.style.width = width
      element.style.height = height
    }
  )

  // Our `editor`'s compiles, heard on our root node -- so it's found in a shadow root too.  And what it compiled
  // already, if anything:  it may have compiled before we joined the page.
  createEffect(
    () => props.editor,
    (selector) => {
      if (!selector) return
      const node = element.getRootNode()
      node.addEventListener(SPELL_COMPILED_EVENT, onCompiled)
      const compiled = editorCompiled(node as ParentNode, selector)
      if (compiled) element.run(compiled)
      return () => node.removeEventListener(SPELL_COMPILED_EVENT, onCompiled)
    }
  )

  /** What we run, as last worked out:  kept while what it's from doesn't change, so it isn't re-run. */
  let last: { key: string; pushed: SpellCompiled | undefined; source: SpellAppSource | undefined } | undefined
  /**
   * What to run -- the SAME object while what it's from doesn't change.  `undefined` without anything.
   * - Code pushed to us if there is some, see `run()`, else from our attributes.
   * - NOTE: `editor` isn't in `key`:  changing it drops pushed code, but NEVER re-runs what our attributes say.
   */
  const source = createMemo(() => {
    const { project, src, scopes, name } = props
    const key = JSON.stringify([project, src, scopes, name])
    const pushed = props.pushed && element.pushedFor === pushedKey(props) ? props.pushed : undefined
    if (last?.key !== key || last.pushed !== pushed) {
      last = {
        key,
        pushed,
        source: pushed ? pushedSource(projectSource(pushed.projectId), pushed, name) : attributeSource()
      }
    }
    return last.source

    /** What to run from our attributes alone -- `undefined` without `project` or `src`. */
    function attributeSource(): SpellAppSource | undefined {
      const source = project ? projectSource(project) : src ? srcSource(src) : undefined
      if (!source) return undefined
      if (scopes) source.scopesUrl = new URL(scopes, document.baseURI).href
      if (name) source.name = name
      return source
    }
  })

  return (
    <ui-root icons="fomantic" display="immediately">
      <Show
        when={source()}
        fallback={
          <div class="SpellAppError">
            {props.editor
              ? `Waiting for its editor, ${props.editor}, to compile…`
              : "Give <spell-app> a project or src to run."}
          </div>
        }
      >
        {(it) => (
          <SpellAppRunner
            source={it()}
            toolbar={props.toolbar}
            debug={DEBUG_PANES.includes(props.debug as DebugPane) ? (props.debug as DebugPane) : undefined}
            fluid={!cssSize(props.height)}
            runtimeUrl={new URL("spell-runtime.js", BUNDLE).href}
            builtInsUrl={new URL("spellCore.scopes.js", BUNDLE).href}
            onOpen={(href) =>
              element.dispatchEvent(new CustomEvent("spell-open", { detail: { href }, bubbles: true, composed: true }))
            }
            onControls={(controls) => (element.controls = controls)}
          />
        )}
      </Show>
    </ui-root>
  )

  /**
   * A `SPELL_COMPILED_EVENT` on our root node:  run it, if it's from our `editor`.
   * - Reads `editor` as it is now:  a listener is only ever added for the current one.
   */
  function onCompiled(event: Event) {
    const selector = element.editor
    if (selector && isEditor(event.target, selector)) element.run((event as CustomEvent<SpellCompiled>).detail)
  }
}

/**
 * Our `project`, `src`, `scopes`, `name` and `editor` as one string -- what pushed code was pushed for.
 * - NOTE: from properties, NOT attributes:  a property set by script isn't reflected.
 */
function pushedKey(app: Pick<SpellAppProps, "project" | "src" | "scopes" | "name" | "editor">): string {
  return JSON.stringify([app.project, app.src, app.scopes, app.name, app.editor])
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
    declarationsUrl: `${API}/declarations/${projectId}`,
    scopesUrl: `${API}/scopes/${projectId}`,
    importUrl: (id) => `${API}/compiled/${SpellSetup.expandAlias(id)}`,
    importDeclarationsUrl: (id) => `${API}/declarations/${SpellSetup.expandAlias(id)}`,
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
    declarationsUrl: isCompiled ? compiledUrl.replace(/\.compiled\.js(?=$|[?#])/, DECLARATIONS_JSON) : undefined,
    importUrl: (id) => new URL(`${id.slice(id.lastIndexOf(":") + 1)}${COMPILED_JS}`, compiledUrl).href,
    importDeclarationsUrl: (id) => new URL(`${id.slice(id.lastIndexOf(":") + 1)}${DECLARATIONS_JSON}`, compiledUrl).href
  }
}

/**
 * End of a compiled project's file name -- `SP.COMPILED_JS_SUFFIX`.
 * - NOTE: copies, NOT imported:  `$/spell` would pull the whole parser into the bundle.
 */
const COMPILED_JS = ".compiled.js"

/** End of a scope pack's file name -- `SP.SCOPES_JS_SUFFIX`. */
const SCOPES_JS = ".scopes.js"

/** End of a project's declarations file's name -- `SP.DECLARATIONS_JSON_SUFFIX`. */
const DECLARATIONS_JSON = ".declarations.json"

/** `width` / `height` attribute `value` as a CSS size:  `""` for `fluid`, or none. */
function cssSize(value: string | null | undefined): string {
  return !value || value === "fluid" ? "" : value
}
