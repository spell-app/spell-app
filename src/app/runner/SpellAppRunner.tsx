import { Match, Show, Switch, createEffect, createSignal, getOwner, onSettled, runWithOwner, untrack } from "solid-js"

import type { LSP } from "spell-app/lsp"
import type { SP } from "spell-parser/spell"
import type { ThingExplorerState, TypeExplorerState } from "spell-app/app/ui/ui.types"
import { appTexts, type AppTextKey } from "spell-app/app/ui/AppTexts"
// Import directly, NOT through the `spell-app/app/solid` barrel, which pulls in the editor
import { TypeExplorer } from "spell-app/app/solid/TypeExplorer"
import { ThingExplorer } from "spell-app/app/solid/ThingExplorer"
import { loadRuntime, type LoadedRuntime } from "./loadRuntime"
import { fetchJSON, fetchText } from "./fetchFresh"
import { languagesOf, mergedWords, wordsAt, wordsOfLanguages } from "./words"
import {
  loadScopePack,
  scopesFromPacks,
  type CompiledDeclarations,
  type ScopesSource
} from "spell-app/lsp/ScopesSource"
import { RunnerSplit, DEFAULT_SPLIT } from "./RunnerSplit"
import { RunnerPane, type RunnerTab } from "./RunnerPane"
import { RunnerConsole } from "./RunnerConsole"
import { layoutHasSpell, type SpellCompiled } from "./runner.types"

import "./SpellAppRunner.css"

/****************
 * ### `<SpellAppRunner>`
 * Runs one spell app in a page, inside `<spell-viewer>`'s shadow root:
 * an optional toolbar, the app, and a "debug" pane below it --
 * the Type Explorer, the Thing Explorer, and the program's console.
 * - Runs on its OWN copy of the spell runtime -- see `loadRuntime()` -- so many can run on a page at once.
 * - Runs `source`:
 *   - when the runtime's loaded
 *   - again when `source` changes (a NEW object)
 *   - and on Restart, which fetches the program afresh, so a recompiled one shows
 *     -- or runs `source.compiled` again, if set
 * - The program draws with Solid (`App.start()` mounts its own root, `core.mountApp()`):
 *   we only hand it `appRoot`, a `<div>` drawn once and never touched again.
 *   The app it mounted is unmounted with us.
 * - A program with NO app shows its console on top instead, and the explorers below.
 *   One that starts its app AFTER the run finished, e.g. from a timer, shows it once it draws.
 * - The Type Explorer is read-only, and shows only if there's a scope pack -- see `ScopesSource`.
 * - The Thing Explorer shows things' members in spell's words,
 *   if the program and what it imports have words files -- see `SP.SpellWords`.
 *   They're loaded afresh after each run, as its imports are.
 * - `debug` and `fluid` are read once, to start;  `runtimeUrl` once per copy loaded.
 * - Its `<ui-*>` tags are the caller's to define, with Fomantic's icon names:
 *   `<spell-viewer>` is a root that loads them as they appear;  the VS Code runner imports `spell-app/app/solid/loadUI`.
 * - NEVER imports `spell-parser/core`:  it'd land in the bundle's shared chunk, so every app would share it.
 *   Everything of spell's comes from this app's copy of the runtime.
 ****************/
export function SpellAppRunner(props: SpellAppRunnerProps) {
  // `run()` reads props from an effect's callback, and a conditional prop is a memo made on its first read:
  // since Solid rc.17, a memo made there needs an owner (`PRIMITIVE_IN_EFFECT_CALLBACK`)
  const owner = getOwner()
  const [loaded, setLoaded] = createSignal<LoadedRuntime>()
  const [error, setError] = createSignal<string>()
  // Does the program draw an app?  Assume so until a run says.
  const [hasApp, setHasApp] = createSignal(true)
  const [debugOpen, setDebugOpen] = createSignal(!!untrack(() => props.debug))
  const [pane, setPane] = createSignal<DebugPane>(untrack(() => props.debug) ?? "explorer")
  const [split, setSplit] = createSignal(untrack(() => props.fluid) ? DEFAULT_DEBUG_HEIGHT : DEFAULT_SPLIT)
  const [scopes, setScopes] = createSignal<ScopesSource>()
  const [words, setWords] = createSignal<SP.SpellWordsData>()
  // the explorers' state, kept here so it outlives switching tabs:  each reads it once, as it mounts
  let explorerState: TypeExplorerState = {}
  let thingsState: ThingExplorerState = {}
  // compiled javascript of each project the last run loaded, by id -- for the Type Explorer's "Compiled Output"
  const compiledRef: CompiledRef = { current: new Map() }

  // what takes back the last run's layout spell -- see `bindLayout()`.
  // Declared up here:  a run may start before this function reaches its end.
  let unbindLayout: (() => void) | undefined
  /** What we ran last:  a new compile of the same program keeps its things;  an older run's late words aren't shown. */
  let lastSource: SpellAppSource | undefined

  // what takes back the last run's `in="header"` slots -- see `slotsFromIn()`.  Up here, as above.
  let unslot: (() => void) | undefined

  // NOTE: ALWAYS here, just hidden without an app -- so its mount point is never redrawn
  const appRoot = (<div class="App" />) as HTMLDivElement
  // a layout in markup is the app's drawing:  shown through a slot, its `to draw` not drawn (epic `drawable-thing` P9)
  const appPane = (
    <div class={["SpellAppApp", { hidden: !hasApp() && !props.layout }]}>
      <Show when={props.layout}>
        <slot />
      </Show>
      {appRoot}
    </div>
  )

  // this app's own copy of the runtime, for as long as we're here -- and its app, unmounted with us
  createEffect(
    () => props.runtimeUrl,
    (runtimeUrl) => {
      let copy: LoadedRuntime | undefined
      let gone = false
      loadRuntime(runtimeUrl).then(
        (it) => (gone ? it.release() : setLoaded((copy = it))),
        (problem: unknown) => setError(messageOf(problem))
      )
      return () => {
        gone = true
        unbindLayout?.()
        ;(appRoot as AppElement).spellRoot?.unmount()
        copy?.release()
      }
    }
  )

  // run the program -- once the runtime's loaded, and again for each new `source`:
  // a new compile of the same program keeps its things, e.g. the game in progress (epic `drawable-thing` P16)
  createEffect(
    () => [loaded(), props.source] as const,
    ([copy, source]) => {
      if (copy) void runWithOwner(owner, () => run(copy, source, "keep things"))
    }
  )

  // the Type Explorer's scopes, for each new `source`
  createEffect(
    () => [props.source, props.builtInsUrl] as const,
    ([source, builtInsUrl]) => {
      let gone = false
      void loadScopes(source, builtInsUrl, compiledRef).then((it) => gone || setScopes(it))
      return () => {
        gone = true
      }
    }
  )

  // An app started AFTER the run finished, e.g. from a timer, shows once it draws.
  onSettled(() => {
    const observer = new MutationObserver(() => {
      if (appRoot.childElementCount) setHasApp(true)
    })
    observer.observe(appRoot, { childList: true })
    return () => observer.disconnect()
  })

  props.onControls?.({ restart })

  return (
    <div class={["SpellApp", { fluid: props.fluid }]}>
      <Show when={props.toolbar}>
        <SpellAppToolbar
          name={props.source.name}
          error={error()}
          onRestart={restart}
          debugOpen={debugOpen()}
          onToggleDebug={() => setDebugOpen(!debugOpen())}
        />
      </Show>
      <Show when={!props.toolbar && error()}>
        <div class="SpellAppError">{error()}</div>
      </Show>
      <RunnerSplit
        unit={props.fluid ? "px" : "%"}
        split={split()}
        onSplit={setSplit}
        showBottom={debugOpen()}
        bottom={
          <RunnerPane tabs={debugTabs().map(debugTab)} pane={showing()} onPane={setPane}>
            <Switch>
              <Match when={showing() === "explorer"}>{explorer()}</Match>
              <Match when={showing() === "things"}>{things()}</Match>
              <Match when={showing() === "console"}>{output()}</Match>
            </Switch>
          </RunnerPane>
        }
      >
        {appPane}
        <Show when={!hasApp()}>
          <RunnerPane tabs={[debugTab("console")]} pane="console">
            {output()}
          </RunnerPane>
        </Show>
      </RunnerSplit>
    </div>
  )

  /** Tabs the debug pane has now -- no console without an app:  it's on top already. */
  function debugTabs(): DebugPane[] {
    return [...(scopes() ? ["explorer" as const] : []), "things" as const, ...(hasApp() ? ["console" as const] : [])]
  }

  /** Tab the debug pane shows:  the one chosen, if it has it, else its first. */
  function showing(): DebugPane {
    const tabs = debugTabs()
    return tabs.includes(pane()) ? pane() : tabs[0]!
  }

  /** Run the program again, afresh, on purpose:  a new deal (Q25) -- once the runtime's loaded. */
  function restart() {
    const copy = loaded()
    if (copy) void run(copy, props.source, "afresh")
  }

  /**
   * Run `source` in `copy` -- see `runProgram()` -- and show how it went.
   * - `keep things`:  when it's the program that ran last, its things carry over;  else it starts afresh.
   */
  async function run(copy: LoadedRuntime, source: SpellAppSource, how: "afresh" | "keep things") {
    unbindLayout?.()
    unbindLayout = undefined
    unslot?.()
    unslot = undefined
    // read props before waiting:  by then, whoever handed them to us may be gone (`<spell-viewer>` dropping its source)
    const layout = props.layout
    if (layout) unslot = slotsFromIn(layout)
    const keepThings = how === "keep things" && isSameProgram(lastSource, source)
    lastSource = source
    // its own words first:  their `messages` are what the core says as it runs, e.g. its tests' lines in Spanish
    // - awaited only when there are some to load:  else the last run's app goes at once, in the same tick, as before
    const own = source.words || !source.wordsUrl ? source.words : await ownWords(source)
    // a program in another language draws with that language's tags (`<es-boton>`):  Spell UI defines them first
    if (own?.lang && own.lang !== "en") {
      const { RootLoader } = await import("spell-ui/components/ui-root")
      // oxlint-disable-next-line react-hooks/rules-of-hooks -- Spell UI's `useLanguage()` is no React hook
      await RootLoader.useLanguage(own.lang)
    }
    const ran = await runProgram(copy, source, appRoot, { layout: !!layout, keepThings, messages: own?.messages })
    compiledRef.current = ran.compiled
    setError(ran.error)
    setHasApp(ran.hasApp)
    if (layout && !ran.error && layoutHasSpell(layout)) {
      bindLayout(copy, source, layout).then(
        (unbind) => (unbindLayout = unbind),
        (problem: unknown) => setError(messageOf(problem))
      )
    }
    const loaded = await loadWords(
      source,
      own,
      [...ran.compiled.keys()].filter((id) => id !== MAIN_PROJECT)
    )
    // a newer source's run may have started meanwhile:  its words are its own
    if (source === lastSource) setWords(loaded)
  }

  /** The Type Explorer, read-only, if there's a scope pack. */
  function explorer() {
    return (
      <Show when={scopes()} keyed>
        {(it) => (
          <TypeExplorer
            readonly
            tree={it.tree}
            loadDetails={it.details}
            onOpen={(href) => props.onOpen(href)}
            state={explorerState}
            onStateChange={(state) => (explorerState = state)}
          />
        )}
      </Show>
    )
  }

  /** The Thing Explorer, once the runtime's loaded. */
  function things() {
    return (
      <Show when={loaded()} keyed>
        {(copy) => (
          <ThingExplorer
            things={copy.runtime.core.things}
            words={words()}
            state={thingsState}
            onStateChange={(state) => (thingsState = state)}
          />
        )}
      </Show>
    )
  }

  /** The program's console, once the runtime's loaded. */
  function output() {
    return (
      <Show when={loaded()} keyed>
        {(copy) => <RunnerConsole console={copy.runtime.core.console} />}
      </Show>
    )
  }
}

/** Props for `<SpellAppRunner>`. */
export type SpellAppRunnerProps = {
  /**
   * What to run, and where its scope pack is -- from `<spell-viewer>`'s attributes, or pushed by an editor.
   * - Re-run when this is a NEW object -- see `SpellAppSource`.
   */
  source: SpellAppSource
  /** Show the toolbar? */
  toolbar: boolean
  /**
   * The element whose markup lays the app out, inside its `<spell-viewer>`:  the `<spell-viewer>` itself, if it has some.
   * - That markup shows, through a slot, and the app's `to draw` isn't drawn -- see `core.appLayout`.
   * - Its spell (holes, actions, `<spell>` blocks) is compiled in the page, after each run -- see `LayoutSpell`.
   */
  layout?: Element
  /** Open the debug pane to start, on this tab -- else it starts closed. */
  debug?: DebugPane
  /** As tall as it needs to be, NOT a fixed height -- see `<RunnerSplit unit>`. */
  fluid: boolean
  /** URL of `spell-runtime.js`, which each app loads a copy of. */
  runtimeUrl: string
  /** URL of the built-in types' scope pack, `core.scopes.js`. */
  builtInsUrl: string
  /** A Type Explorer link clicked, e.g. `spell:/@spell/examples/Solitaire/Solitaire.spell#L12`. */
  onOpen: (href: string) => void
  /** Hand over what the element can do to us, e.g. `restart()` -- every render. */
  onControls?: (controls: SpellAppControls) => void
}

/**
 * Where a `<spell-viewer>`'s program, and what's around it, come from --
 * worked out from its attributes, or from code a `<spell-editor>` pushed to it.  See `pushedSource()`.
 * - NOTE: `compiled`, `scopes`, `declarations` and `words` are in memory, the rest are URLs.
 *   An in-memory one wins over its URL.
 */
export type SpellAppSource = {
  /** Name for the toolbar, e.g. `Solitaire`. */
  name: string
  /** Its project, e.g. `@spell/examples/solitaire`:  what its remembered props are kept under (`runCompiled()`). */
  projectId?: string
  /**
   * URL of its compiled javascript.
   * - NOT fetched while `compiled` is set.  Still required:  every source has one, as a project's is its server's.
   */
  compiledUrl: string
  /** Its compiled javascript, in memory -- run instead of fetching `compiledUrl`, e.g. what an editor compiled. */
  compiled?: string
  /** URL of its scope pack, if it may have one. */
  scopesUrl?: string
  /** Its scope pack, in memory -- used instead of loading `scopesUrl`, e.g. fresh from an editor. */
  scopes?: LSP.ScopePack
  /** URL of its declarations, `<Project>.declarations.json5`, if it may have them:  where the Type Explorer finds code. */
  declarationsUrl?: string
  /** Its declarations, in memory -- used instead of loading `declarationsUrl`, e.g. fresh from an editor. */
  declarations?: CompiledDeclarations
  /** URL of the compiled javascript of project `projectId`, which it imports. */
  importUrl: (projectId: string) => string
  /** URL of the declarations of project `projectId`, which it imports -- if it may have them. */
  importDeclarationsUrl?: (projectId: string) => string
  /**
   * URL of its words, `<Project>.en.js`, if it may have them:  the Thing Explorer's labels -- see `SP.SpellWords`.
   * - `{lang}` in it is each language its files are in, from its declarations:
   *   `<Project>.{lang}.js` => `Solitario.es.js`, and `Solitario.en.js` too for a project mixing them (epic `spanish` P19).
   */
  wordsUrl?: string
  /** Its words, in memory -- used instead of loading `wordsUrl`, e.g. fresh from an editor. */
  words?: SP.SpellWordsData
  /** URL of the words of project `projectId`, which it imports -- if it may have them;  `{lang}` as in `wordsUrl`. */
  importWordsUrl?: (projectId: string) => string
  /** URL of spell file `uri`, e.g. `spell:/@spell/examples/Solitaire/Solitaire.spell` -- if its sources can be had. */
  sourceUrl?: (uri: string) => string
}

/** What a `<spell-viewer>` can ask its runner to do. */
export type SpellAppControls = {
  /** Run the program again, afresh. */
  restart: () => void
}

/** Tab of the debug pane:  the Type Explorer, the Thing Explorer, or the program's console (`<spell-viewer debug>`). */
export type DebugPane = "explorer" | "things" | "console"

/****************
 * ### `<SpellAppToolbar>`
 * The app's name, Restart, the last run's error if it threw, then "Debug" at the right.
 * - HACK: icons are slotted `<ui-icon>`s, not the items' `icon`:  see `<RunnerPane>`.
 ****************/
function SpellAppToolbar(props: SpellAppToolbarProps) {
  return (
    <ui-menu attached="top" size="small" class="SpellAppToolbar">
      <ui-item type="header">{props.name}</ui-item>
      <ui-item link="" class="restart" onClick={() => props.onRestart()}>
        <ui-icon name="redo" />
        {appTexts.text("restart")}
      </ui-item>
      <Show when={props.error}>
        <ui-item class="error">
          <ui-icon name="warning sign" />
          {props.error}
        </ui-item>
      </Show>
      <ui-menu position="right">
        <ui-item link="" class="debug" selected={props.debugOpen} onClick={() => props.onToggleDebug()}>
          <ui-icon name="bug" />
          {appTexts.text("debug")}
        </ui-item>
      </ui-menu>
    </ui-menu>
  )
}

/** Props for `<SpellAppToolbar>`. */
type SpellAppToolbarProps = {
  /** App's name. */
  name: string
  /** Last run's error message, if it threw. */
  error?: string
  /** Restart pressed. */
  onRestart: () => void
  /** Is the debug pane showing? */
  debugOpen: boolean
  /** "Debug" pressed. */
  onToggleDebug: () => void
}

////////////////
// ## Running
////////////////

/**
 * Run `source`'s program in runtime copy `copy`, drawing into `appRoot`:
 * fetched again, with each project it imports.
 * - Afresh, unless `keepThings`:  then the last run's things carry over (`runCompiled()`).
 * - NOTE: its own javascript is NOT fetched if it's in memory, `source.compiled` -- its imports still are.
 * - Answers how it went, and the compiled javascript it loaded, by project id --
 *   the program's own under `MAIN_PROJECT` -- for the Type Explorer's "Compiled Output".
 */
async function runProgram(
  copy: LoadedRuntime,
  source: SpellAppSource,
  appRoot: HTMLElement,
  { layout, keepThings, messages }: { layout: boolean; keepThings: boolean; messages?: Record<string, string> }
): Promise<Ran> {
  const compiled = new Map<string, string>()
  try {
    const text = source.compiled ?? (await fetchText(source.compiledUrl))
    compiled.set(MAIN_PROJECT, text)
    const error = await copy.runtime.runApp(text, {
      appRoot,
      layout,
      keepThings,
      messages,
      projectId: source.projectId,
      coreUrl: copy.coreUrl,
      loadImport: async (projectId) => {
        const imported = await fetchText(source.importUrl(projectId))
        compiled.set(projectId, imported)
        return imported
      }
    })
    return { error, hasApp: copy.runtime.appIsMounted(), compiled }
  } catch (problem) {
    return { error: messageOf(problem), hasApp: false, compiled }
  }
}

/**
 * Compile and run the spell in `root`'s layout, against `source`'s program as it ran in `copy` -- see `LayoutSpell`.
 * - Loads `LayoutSpell`, and so spell's parser, only now:  a layout with spell in it is the only thing that needs it.
 * - Answers what takes it back.
 */
async function bindLayout(copy: LoadedRuntime, source: SpellAppSource, root: Element): Promise<() => void> {
  const [{ LayoutSpell }, declarations] = await Promise.all([
    import("./LayoutSpell"),
    source.declarations ?? fetchJSON(source.declarationsUrl)
  ])
  const { core } = copy.runtime
  return new LayoutSpell({ root, projectId: source.name, declarations, core }).bind()
}

/**
 * Is `source` the same program as `last`, compiled again?  The same name, from the same place.
 * - `undefined` (nothing ran yet):  no.
 */
function isSameProgram(last: SpellAppSource | undefined, source: SpellAppSource): boolean {
  return !!last && last.name === source.name && last.compiledUrl === source.compiledUrl
}

/** How a run went -- see `runProgram()`. */
type Ran = {
  /** Its error message, if it threw. */
  error?: string
  /** Did it start an app? */
  hasApp: boolean
  /** Compiled javascript it loaded, by project id -- the program's own under `MAIN_PROJECT`. */
  compiled: Map<string, string>
}

/**
 * The Type Explorer's data for `source`:  the built-ins' scope pack, then its own -- `undefined` if it has none.
 * - Its own is `source.scopes` if that's set, else loaded from `source.scopesUrl`.
 * - Its `spell` from the sources, if `source` says where they are;
 *   its `compiled` from what the last run loaded, in `compiledRef`.
 */
async function loadScopes(
  source: SpellAppSource,
  builtInsUrl: string,
  compiledRef: CompiledRef
): Promise<ScopesSource | undefined> {
  const [builtIns, pack] = await Promise.all([
    loadScopePack(builtInsUrl),
    source.scopes ?? (source.scopesUrl ? loadScopePack(source.scopesUrl) : undefined)
  ])
  if (!pack) return undefined
  const { sourceUrl } = source
  return scopesFromPacks(builtIns ? [builtIns, pack] : [pack], {
    loadSource: sourceUrl && ((uri) => fetchText(sourceUrl(uri))),
    loadCompiled: async (projectId) => compiledRef.current.get(projectId === pack.id ? MAIN_PROJECT : projectId),
    loadDeclarations: async (projectId) => {
      if (projectId !== pack.id) return fetchJSON(source.importDeclarationsUrl?.(projectId))
      return source.declarations ?? fetchJSON(source.declarationsUrl)
    }
  })
}

/**
 * `source`'s own words:  `source.words` if set, else loaded from `source.wordsUrl`, in each of its languages.
 * - `undefined` if it has none.
 * - NEVER throws:  words are optional, as a scope pack is.
 */
async function ownWords(source: SpellAppSource): Promise<SP.SpellWordsData | undefined> {
  const ownDeclarations = async () => source.declarations ?? fetchJSON<CompiledDeclarations>(source.declarationsUrl)
  return source.words ?? wordsInLanguages(source.wordsUrl, ownDeclarations)
}

/**
 * The Thing Explorer's words for `source`, as one:  its own (`own`), then those of each project it imported (`importIds`).
 * - `undefined` if none of them has any.
 * - NEVER throws:  words are optional, as a scope pack is.
 */
async function loadWords(
  source: SpellAppSource,
  own: SP.SpellWordsData | undefined,
  importIds: string[]
): Promise<SP.SpellWordsData | undefined> {
  const { importWordsUrl, importDeclarationsUrl } = source
  const imported = await Promise.all(
    importIds.map((id) => wordsInLanguages(importWordsUrl?.(id), () => fetchJSON(importDeclarationsUrl?.(id))))
  )
  return mergedWords([own, ...imported])
}

/**
 * The words at `url`, with `{lang}` filled in with each language its project's declarations name, as one:
 * the one its program speaks first, whose `messages` they keep -- English (`en`) alone if they name none.
 * - A project mixing languages has a words file in each (epic `spanish` P19):  `wordsOfLanguages()` joins them.
 * - Declarations are read only when the URL asks for a language.
 * - NEVER throws:  no declarations, English.
 */
async function wordsInLanguages(
  url: string | undefined,
  declarations: () => Promise<CompiledDeclarations | undefined>
): Promise<SP.SpellWordsData | undefined> {
  if (!url?.includes(LANG)) return wordsAt(url)
  const languages = await declarations()
    .then((it) => languagesOf(it))
    .catch(() => languagesOf(undefined))
  return wordsOfLanguages(await Promise.all(languages.map((lang) => wordsAt(url.replace(LANG, lang)))))
}

/** Where a words file's URL takes each of its project's languages:  `<Project>.{lang}.js`. */
const LANG = "{lang}"

////////////////
// ## Fed by an editor
//  what a `<spell-viewer editor="<selector>">` decides --
//  here, NOT in its component (`SpellViewer`), so it's testable with no DOM.
////////////////

/**
 * What a `<spell-viewer>` runs for `pushed`, code an editor compiled.
 * - `base` (its project's source, for its imports and sources),
 *   with `pushed`'s javascript, scope pack, declarations and words in memory.
 * - A NEW object, so `<SpellAppRunner>` re-runs it.
 * - `name`, the app's `name` attribute, wins over `base`'s, if set.
 */
export function pushedSource(base: SpellAppSource, pushed: SpellCompiled, name?: string | null): SpellAppSource {
  return {
    ...base,
    name: name || base.name,
    compiled: pushed.compiled,
    ...(pushed.scopes ? { scopes: pushed.scopes } : {}),
    ...(pushed.declarations ? { declarations: pushed.declarations } : {}),
    ...(pushed.words ? { words: pushed.words } : {})
  }
}

/**
 * What code pushed to a `<spell-viewer>` was pushed FOR, as one string:
 * the app's `PUSHED_FOR` attributes then -- `project`, `src`, `scopes`, `name` and `editor`.
 * - Pushed code counts only while the app's are the same:
 *   a change of what it runs, or of which editor feeds it, drops it.
 * - NOT `toolbar`, `debug`, `width`, `height`, `assets`:  they change how it looks, and NEVER re-run it.
 * - `undefined` and `null` are the same:  no such attribute.
 */
export function pushedKey(app: PushedFor): string {
  return JSON.stringify(PUSHED_FOR.map((name) => app[name] ?? null))
}

/** The `<spell-viewer>` attributes whose change drops the code an editor pushed to it -- see `pushedKey()`. */
export const PUSHED_FOR = ["project", "src", "scopes", "name", "editor"] as const

/** A `<spell-viewer>`, or its component, as far as `pushedKey()` cares. */
export type PushedFor = { readonly [Name in (typeof PUSHED_FOR)[number]]?: string | null }

/**
 * Is `target`, what fired an event, an element `selector` matches -- e.g. a `<spell-viewer>`'s `editor`?
 * - `false` if it's not an element, or `selector` isn't a CSS selector.
 * - NOTE: duck-typed, NOT `instanceof Element`, which throws where there's no DOM.
 */
export function isEditor(target: unknown, selector: string): boolean {
  const element = target as { matches?: unknown } | null
  if (typeof element?.matches !== "function") return false
  return orIfBadSelector(() => (target as Element).matches(selector), false)
}

/**
 * What the editor `selector` finds in `root` compiled last -- its `compiled` property -- if anything.
 * - `undefined` if there's no such editor, it hasn't compiled, or `selector` isn't a CSS selector.
 */
export function editorCompiled(root: EditorRoot, selector: string): SpellCompiled | undefined {
  const editor = orIfBadSelector(() => root.querySelector(selector), null) as EditorElement | null
  return editor?.compiled
}

/** Where a `<spell-viewer>` looks for its editor:  its root node, a document or a shadow root. */
export type EditorRoot = { querySelector(selector: string): Element | null }

/** A `<spell-editor>`, as far as a `<spell-viewer>` cares:  what it compiled last, if anything. */
type EditorElement = { compiled?: SpellCompiled }

/**
 * `find()` -- else `fallback` if it threw because a selector isn't CSS, a `SyntaxError` `DOMException`.
 * - Anything else it throws, it throws.
 */
function orIfBadSelector<T>(find: () => T, fallback: T): T {
  try {
    return find()
  } catch (problem) {
    if ((problem as { name?: unknown } | null)?.name === "SyntaxError") return fallback
    throw problem
  }
}

////////////////
// ## Helpers
////////////////

/** Each debug pane tab's icon, and its title's key. */
const DEBUG_TABS: Record<DebugPane, { icon: string; text: AppTextKey }> = {
  explorer: { icon: "sitemap", text: "typeExplorer" },
  things: { icon: "cubes", text: "thingExplorer" },
  console: { icon: "terminal", text: "console" }
}

/** Debug pane tab `id`, titled in the page's language. */
function debugTab(id: DebugPane): RunnerTab<DebugPane> {
  const { icon, text } = DEBUG_TABS[id]
  return { id, icon, title: appTexts.text(text) }
}

/** Debug pane's height to start, in px, when `fluid` -- until dragged. */
const DEFAULT_DEBUG_HEIGHT = 280

/** Key in a run's compiled javascript for the program's own -- its project id isn't known until its pack is. */
const MAIN_PROJECT = ""

/** Message of `problem`, whatever was thrown. */
function messageOf(problem: unknown): string {
  return problem instanceof Error ? problem.message : String(problem)
}

/** The app's mount point, with the mounted app `App.start()` leaves on it (`core.mountApp()`). */
type AppElement = HTMLElement & { spellRoot?: { unmount(): void } }

/** Compiled javascript the last run loaded, by project id -- a box, so the Type Explorer reads the latest. */
type CompiledRef = { current: Map<string, string> }

/**
 * Spell's `in="header"` on a layout's tags, written the web's way:  `slot="header"` (Q21 B, J35).
 * - So a child the page writes by hand lands in its frame's `<children name="header"/>`.
 * - A tag with a `slot` of its own keeps it.
 * - Returns what takes the slots back.
 */
export function slotsFromIn(root: Element): () => void {
  const slotted = [...root.querySelectorAll("[in]")].filter((element) => !element.hasAttribute("slot"))
  for (const element of slotted) element.setAttribute("slot", element.getAttribute("in")!)
  return () => {
    for (const element of slotted) element.removeAttribute("slot")
  }
}
