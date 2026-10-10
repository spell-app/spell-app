import { Show, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { UIRoot, type RootVocabulary } from "$/ui/components/ui-root"
// Import directly, NOT through the `$/spell` barrel, which would pull in the whole parser.
import { SpellSetup } from "$/spell/SpellSetup"
// Import directly, NOT through the `$/app/runner` barrel, which would pull in `runCompiled()`, and so `spellCore`.
import { SPELL_COMPILED_EVENT, type SpellCompiled } from "$/app/runner/runner.types"
import { adoptShadowStyles } from "$/app/runner/shadowStyles"
import {
  SpellAppRunner,
  PUSHED_FOR,
  editorCompiled,
  isEditor,
  pushedKey,
  pushedSource,
  type SpellAppControls,
  type SpellAppSource
} from "$/app/runner/SpellAppRunner"
import { spellAppVocabulary } from "./SpellApp.en"

import "./SpellApp.css"

// Every Solid computation follows spell cells.
import "$/app/solid/cellsBridge"

/****************
 * ### `DOMSpellAppElement`
 * The DOM element of `<spell-app>`:  it adds the app's script API, `run(compiled)` and `restart()`.
 * - Its attributes are properties too (`app.project = ...`);  `pushed`, the code pushed to it last, is a property only.
 * - `run()` works before the element joins the page:  it runs the code once it does, and keeps it across leaving
 *   and rejoining the page.
 * - Above the component:  its `elementSetup` reads this class while the component is defined.
 ****************/
export class DOMSpellAppElement extends E.DOMElement {
  /**
   * What `pushed` was pushed for:  our `project`, `src`, `scopes`, `name` and `editor` then (`pushedKey()`).
   * - Pushed code counts only while they're the same.
   */
  pushedFor?: string

  /**
   * Run `compiled`, what an editor compiled, instead of what our attributes say, until one of `PUSHED_FOR` changes.
   * - Its imports and sources are its project's, from the spell server, as for `project`.
   * - Ignores `compiled` if it's what we ran last:  we may hear of one compile twice, from our `editor` AND from an
   *   editor whose `app` names us.  A `SpellCompiled` is a NEW object per compile.
   */
  run(compiled: SpellCompiled): void {
    if (compiled === this.pushed && this.pushedFor === pushedKey(this)) return
    this.pushedFor = pushedKey(this)
    this.pushed = compiled
  }

  /** Run the program again, afresh:  code pushed to us, if any. */
  restart() {
    ;(this.component as SpellApp | undefined)?.restart()
  }
}

/** The vocabulary's properties, typed:  `pushed` as what it holds. */
export interface DOMSpellAppElement extends Omit<E.AttributeValues<typeof spellAppVocabulary>, "pushed"> {
  pushed: SpellCompiled | undefined
}

/****************
 * ### `vocabulary`
 * `<spell-app>`'s whole vocabulary:  a root's names (`<ui-root>`'s), then its own (`SpellApp.en.ts`).
 * - Where both name an attribute, its own wins (`display`, `icons`, `width`, `height`, `assets`).
 * - Its own slots only:  it shows no children, it draws its app.
 * - Above the component:  its `@E.proto static vocabulary` reads it while the class is built.
 ****************/
const ROOT_VOCABULARY: RootVocabulary = UIRoot.describe()
const OWN_ATTRIBUTES = new Set<string>(spellAppVocabulary.attributes.map(({ name }) => name))
const vocabulary = {
  ...spellAppVocabulary,
  attributes: [
    ...ROOT_VOCABULARY.attributes.filter(({ name }) => !OWN_ATTRIBUTES.has(name)),
    ...spellAppVocabulary.attributes
  ],
  events: [...ROOT_VOCABULARY.events, ...spellAppVocabulary.events],
  parts: [...ROOT_VOCABULARY.parts, ...spellAppVocabulary.parts],
  states: [...ROOT_VOCABULARY.states, ...spellAppVocabulary.states],
  texts: [...ROOT_VOCABULARY.texts, ...spellAppVocabulary.texts]
} satisfies E.ComponentVocabulary

/****************
 * ### `SpellApp`
 * The component behind `<spell-app>`:  runs a compiled spell project in any page, in its own shadow root, with
 * no editor.  It works out WHAT to run, and draws `<SpellAppRunner>` to run it.
 * - What to run, one of (see the vocabulary, `SpellApp.en.ts`):
 *   - `project="@system:examples:Solitaire"` (or `@examples/Solitaire`):  from the spell server's `/api`
 *   - `src="apps/Solitaire.compiled.js"`:  from anywhere, what goes with it beside it
 *   - `editor="#ed"`:  what that `<spell-editor>` compiles (`SPELL_COMPILED_EVENT`), and what it compiled already
 *   - `run(compiled)`:  code pushed to us, e.g. by an editor whose `app` names us
 * - Code pushed (by `run()` or `editor`) wins over `project` / `src`, until `project`, `src`, `scopes`, `name` or
 *   `editor` changes (`pushedKey()`).
 * - Each runs on its own copy of the spell runtime (`spell-runtime.js` beside its script), so many can run on a
 *   page at once.
 * - A ROOT (`UIRoot`), as `<ui-root>` is, so a page needs nothing around it:
 *   - the Spell UI widgets the runner draws load the first time each appears (`contentRoots`:  in its shadow root)
 *   - so does a spell tag inside it:  `<spell-editor>` from `spell-editor.js`, beside its own script
 *     (`ownTagLoader()`);  a page with only `<spell-app>`s never downloads the editor
 *   - its `icons` default to `fomantic`:  the runner's icon names are Fomantic's.  The page's own `ui-*` keep theirs
 *   - inside another root (a docs page, the editor demo), it's a nested root:  the outer one waits for it
 * - The PROGRAM draws with React;  Semantic UI's CSS is adopted into the shadow root (`adoptShadowStyles()`).
 * - `width` / `height` set our inline style, so page CSS works too.
 * - Leaving the page stops the app and lets go of its runtime, a microtask later:  a move in one go keeps it.
 ****************/
export class SpellApp extends UIRoot<typeof vocabulary> {
  @E.proto static vocabulary = vocabulary
  @E.protoMerged static elementSetup = {
    DOMElement: DOMSpellAppElement,
    // clicking the program's text must not move focus to its first button
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  declare readonly domElement: DOMSpellAppElement

  constructor(...args: ConstructorParameters<typeof E.UIComponent>) {
    super(...args)
    // where `assets` says as we join the page, else beside this script
    const assets = new URL(untrack(() => this.assets) ?? BUNDLE, document.baseURI).href
    void adoptShadowStyles(this.domElement.renderRoot, assets)
  }

  ////////////////
  // ## A root
  ////////////////

  /** What the root loads is in our shadow root too:  the widgets the runner draws. */
  protected get contentRoots(): readonly ParentNode[] {
    return [this.domElement, this.domElement.renderRoot]
  }

  /**
   * A spell tag inside us (`<spell-editor>`) loads from its own script beside ours (`spell-editor.js`),
   * the first time one appears.
   * - Every `spell-*` tag:  `<tag>.js`, as `vite.element.config.ts` names each family's script.
   */
  protected ownTagLoader(tag: string): (() => Promise<void>) | undefined {
    if (!tag.startsWith(SPELL_TAG_PREFIX)) return undefined
    return () => import(/* @vite-ignore */ new URL(`${tag}.js`, BUNDLE).href).then(() => undefined)
  }

  /** Never a scrolling box, whatever our size:  the runner lays out and scrolls its own panes. */
  protected get scrolls(): boolean {
    return false
  }

  /**
   * Where the built-in icon packs are:  `icon-packs/` in `assets`, else beside our script --
   * ours, even on a page whose Spell UI is its own (a docs page's, which has none to load).
   * - Built, they're beside our script:  beside `spell-solid.js`, whose chunk holds `BuiltInPacks`
   *   (`iconPacksBesideBuiltIns()`, `vite.shared.ts`;  pinned by `element.build.test.ts`).
   * - In dev and tests (vite serving the source):  `undefined`, so Spell UI's source finds its own.
   */
  protected get iconAssets(): string | undefined {
    const { assets } = this
    if (!assets && !import.meta.env.PROD) return undefined
    return new URL(assets ?? BUNDLE, document.baseURI).href
  }

  ////////////////
  // ## What to run
  ////////////////

  /** What we run, as last worked out:  kept while what it's from doesn't change, so it isn't re-run. */
  private last?: { key: string; pushed: SpellCompiled | undefined; source: SpellAppSource | undefined }

  /**
   * What to run:  the SAME object while what it's from doesn't change;  `undefined` without anything.
   * - Code pushed to us if there is some (`run()`), else from our attributes.
   * - NOTE: `editor` isn't in `key`:  changing it drops pushed code, but NEVER re-runs what our attributes say.
   */
  get source(): SpellAppSource | undefined {
    const { project, src, scopes, name } = this
    const key = JSON.stringify([project, src, scopes, name])
    const pushed = this.pushed && this.domElement.pushedFor === pushedKey(this) ? this.pushed : undefined
    if (this.last?.key !== key || this.last.pushed !== pushed) {
      this.last = {
        key,
        pushed,
        source: pushed ? pushedSource(projectSource(pushed.projectId), pushed, name) : attributeSource()
      }
    }
    return this.last.source

    /** What to run from our attributes alone:  `undefined` without `project` or `src`. */
    function attributeSource(): SpellAppSource | undefined {
      const source = project ? projectSource(project) : src ? srcSource(src) : undefined
      if (!source) return undefined
      if (scopes) source.scopesUrl = new URL(scopes, document.baseURI).href
      if (name) source.name = name
      return source
    }
  }

  /**
   * An attribute saying what to run, or which editor feeds us, changed:  drop the code pushed to us for the old ones.
   * - Runs as we mount too, when nothing has changed:  code pushed before we joined the page stays.
   */
  @E.onChange(...PUSHED_FOR)
  protected onWhatToRunChanged() {
    const { domElement } = this
    if (domElement.pushedFor === undefined || domElement.pushedFor === pushedKey(this)) return
    domElement.pushedFor = undefined
    domElement.pushed = undefined
  }

  ////////////////
  // ## Fed by an editor
  ////////////////

  /**
   * Listen for our `editor`'s compiles on our root node (so it's found in a shadow root too), and run what it
   * compiled already, if anything:  it may have compiled before we joined the page.
   */
  @E.onChange("editor")
  protected onEditorChanged(selector: string | undefined) {
    if (!selector) return undefined
    const node = this.domElement.getRootNode()
    node.addEventListener(SPELL_COMPILED_EVENT, this.onCompiled)
    const compiled = editorCompiled(node as ParentNode, selector)
    if (compiled) this.domElement.run(compiled)
    return () => node.removeEventListener(SPELL_COMPILED_EVENT, this.onCompiled)
  }

  /**
   * A `SPELL_COMPILED_EVENT` on our root node:  run it, if it's from our `editor`.
   * - Reads `editor` as it is now:  a listener is only ever added for the current one.
   */
  private onCompiled = (event: Event) => {
    const selector = this.editor
    if (selector && isEditor(event.target, selector)) this.domElement.run((event as CustomEvent<SpellCompiled>).detail)
  }

  ////////////////
  // ## Running
  ////////////////

  /** What our runner lets us do, handed over by `<SpellAppRunner>`:  see `restart()`. */
  private controls?: SpellAppControls

  /** Run the program again, afresh:  code pushed to us too.  For our DOM element's `restart()`. */
  restart() {
    this.controls?.restart()
  }

  ////////////////
  // ## Drawing
  ////////////////

  /** Our size, as our inline style. */
  @E.onChange("width", "height")
  protected onSizeChanged(width: string | undefined, height: string | undefined) {
    this.domElement.style.width = cssSize(width)
    this.domElement.style.height = cssSize(height)
  }

  /** Leaving the page lets go of the app and its runtime, a microtask later:  a move in one go keeps it. */
  onDisconnect() {
    super.onDisconnect()
    const { domElement } = this
    E.afterSolidUpdate(() => {
      if (!domElement.isConnected) domElement.dispose()
    })
  }

  /** The runner, or why there's nothing to run;  hidden while the root loads, if `display` says so. */
  protected content(): JSX.Element {
    return (
      <div class="SpellAppContent" style={this.contentStyle}>
        <Show
          when={this.source}
          fallback={
            <div class="SpellAppError">
              {this.editor
                ? this.translationForKey("waitingForEditor", { editor: this.editor })
                : this.translationForKey("nothingToRun")}
            </div>
          }
        >
          {(source) => (
            <SpellAppRunner
              source={source()}
              toolbar={this.toolbar}
              debug={this.debug}
              fluid={!cssSize(this.height)}
              runtimeUrl={new URL("spell-runtime.js", BUNDLE).href}
              builtInsUrl={new URL("spellCore.scopes.js", BUNDLE).href}
              onOpen={(href) => this.send("spell-open", { href })}
              onControls={(controls) => (this.controls = controls)}
            />
          )}
        </Show>
      </div>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`):  `pushed` as what it holds. */
export interface SpellApp extends Omit<E.AttributeValues<typeof spellAppVocabulary>, "pushed"> {
  pushed: SpellCompiled | undefined
}

/**
 * URL of the folder this bundle's in:  `spell-runtime.js`, and by default our `assets`, are beside it.
 * - NOTE: NOT `new URL(".", import.meta.url)`:  vite takes that for an asset to bundle, and inlines it.
 */
const BUNDLE = import.meta.url.slice(0, import.meta.url.lastIndexOf("/") + 1)

/** Prefix of spell's own tags, which a `<spell-app>` loads from beside its script (`ownTagLoader()`). */
const SPELL_TAG_PREFIX = "spell-"

/** Where the spell server's API is:  the page's own. */
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
 * End of a compiled project's file name:  `SP.COMPILED_JS_SUFFIX`.
 * - NOTE: copies, NOT imported:  `$/spell` would pull the whole parser into the bundle.
 */
const COMPILED_JS = ".compiled.js"

/** End of a scope pack's file name:  `SP.SCOPES_JS_SUFFIX`. */
const SCOPES_JS = ".scopes.js"

/** End of a project's declarations file's name:  `SP.DECLARATIONS_JSON_SUFFIX`. */
const DECLARATIONS_JSON = ".declarations.json"

/** `width` / `height` attribute `value` as a CSS size:  `""` for `fluid`, or none. */
function cssSize(value: string | null | undefined): string {
  return !value || value === "fluid" ? "" : value
}
