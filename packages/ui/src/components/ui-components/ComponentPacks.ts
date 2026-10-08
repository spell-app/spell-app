import type { RootCatalogEntry } from "$/ui/components/ui-root/ui-root.types"

import { PACK_FILE_SUFFIX, PACK_PREFIX, UI_PREFIX, type ComponentPack, type PendingPack } from "./ui-components.types"

/****************
 * ### `ComponentPacks`
 * The page's component packs:  their catalogs and tag prefixes, and the loads of their scripts, once per page.
 * - STATIC:  one registry per page, shared by every `<ui-root>`, like `RootLoader`'s family loads.
 * - A pack is a CLASSIC script (`<script src>`, so it works from `file://`):  `load()` adds one, and the script
 *   calls `registerPack()` as it runs, which finds the load by `document.currentScript` (else by the name its file
 *   implies), defines the pack's tags and resolves it.
 * - Plain DOM, no Solid:  `<ui-root>` asks it what a tag is (`entryOf()`, `owns()`), and it knows nothing of roots.
 ****************/
export class ComponentPacks {
  /** Name => the registered pack. */
  private static readonly packs = new Map<string, ComponentPack>()

  /** Tag => its entry, from every registered pack's catalog. */
  private static readonly catalog = new Map<string, RootCatalogEntry>()

  /** Every registered pack's tag prefix. */
  private static readonly prefixes = new Set<string>()

  /** Resolved script URL => its load, started once per page. */
  private static readonly loads = new Map<string, Promise<ComponentPack>>()

  /** Loads whose script hasn't registered its pack yet. */
  private static readonly pending = new Set<PendingPack>()

  /**
   * Register `pack`:  define its tags (`pack.define()`), add its catalog and prefix, and resolve the load of the
   * script calling this (if `load()` started it).
   * - A second pack with a registered name is ignored, with a console warning:  its tags are defined already.
   * - throws `TypeError` on a malformed pack;  rethrows what `define()` throws, after failing the load
   */
  static register(pack: ComponentPack): void {
    ComponentPacks.check(pack)
    const pending = ComponentPacks.pendingFor(pack.name)
    if (pending) ComponentPacks.pending.delete(pending)
    const known = ComponentPacks.packs.get(pack.name)
    if (known) {
      console.warn(`registerPack():  a pack named "${pack.name}" is registered already;  this one is ignored`)
      pending?.resolve(known)
      return
    }
    try {
      pack.define()
    } catch (error) {
      pending?.reject(error instanceof Error ? error : new Error(String(error)))
      throw error
    }
    ComponentPacks.packs.set(pack.name, pack)
    ComponentPacks.prefixes.add(pack.prefix)
    for (const [tag, entry] of Object.entries(pack.catalog)) ComponentPacks.catalog.set(tag, entry)
    pending?.resolve(pack)
  }

  /**
   * Load the pack at `source` (relative to the page) as a classic script, ONCE per page;  resolves with the pack once
   * its script registered it.
   * - A pack already registered under the name its file implies (a page's own `<script src>`, an ES import)
   *   resolves at once, with no second script.
   * - Rejects when the script can't load, or ran without registering a pack.  NEVER throws.
   */
  static load(source: string): Promise<ComponentPack> {
    let url: string
    try {
      url = new URL(source, document.baseURI).href
    } catch (error) {
      return Promise.reject(error instanceof Error ? error : new Error(String(error)))
    }
    let load = ComponentPacks.loads.get(url)
    if (!load) {
      const known = ComponentPacks.packs.get(ComponentPacks.nameFor(url))
      load = known ? Promise.resolve(known) : ComponentPacks.inject(url)
      ComponentPacks.loads.set(url, load)
    }
    return load
  }

  /** The catalog entry of `tag`, from the registered packs;  `undefined` for a tag no pack lists. */
  static entryOf(tag: string): RootCatalogEntry | undefined {
    return ComponentPacks.catalog.get(tag)
  }

  /** `tag` has a registered pack's prefix:  a root loads (or reports) it, as it does `ui-*` tags. */
  static owns(tag: string): boolean {
    for (const prefix of ComponentPacks.prefixes) if (tag.startsWith(prefix)) return true
    return false
  }

  /** The pack name a script URL implies:  `.../epics/pack/epics.pack.js` => `epics`, `x.js` => `x`. */
  static nameFor(url: string): string {
    const file = new URL(url).pathname.split("/").pop() ?? ""
    return file.replace(PACK_FILE_SUFFIX, "")
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** Add a `<script>` for `url`;  resolves when it registers its pack, rejects when it fails to. */
  private static inject(url: string): Promise<ComponentPack> {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script")
      const pending: PendingPack = { script, name: ComponentPacks.nameFor(url), resolve, reject }
      // registering resolves first (the script runs before `load` fires), so these only fail a silent script
      const fail = (message: string) => {
        ComponentPacks.pending.delete(pending)
        reject(new Error(`ComponentPacks.load():  ${message}`))
      }
      script.onload = () => fail(`${url} ran, but registered no pack;  it must call SpellUI.registerPack()`)
      script.onerror = () => fail(`can't load ${url}`)
      script.src = url
      ComponentPacks.pending.add(pending)
      document.head.append(script)
    })
  }

  /** The load waiting for the script running now, else for a pack named `name`. */
  private static pendingFor(name: string): PendingPack | undefined {
    const running = document.currentScript
    let byName: PendingPack | undefined
    for (const pending of ComponentPacks.pending) {
      if (pending.script === running) return pending
      if (pending.name === name) byName ??= pending
    }
    return byName
  }

  /** Throw a `TypeError` naming what's wrong with `pack`. */
  private static check(pack: ComponentPack) {
    if (typeof pack?.name !== "string" || !pack.name) fail("a pack needs a `name`")
    const { name, prefix, catalog } = pack
    if (typeof prefix !== "string" || !PACK_PREFIX.test(prefix) || prefix === UI_PREFIX) {
      fail(`pack "${name}":  \`prefix\` must be lowercase words ending in "-" (\`epic-\`), never "${UI_PREFIX}"`)
    }
    if (typeof pack.define !== "function") fail(`pack "${name}":  \`define()\` must define its tags`)
    if (typeof catalog !== "object" || catalog === null) fail(`pack "${name}":  \`catalog\` must map its tags`)
    const strays = Object.keys(catalog).filter((tag) => !tag.startsWith(prefix))
    if (strays.length) fail(`pack "${name}":  every tag starts with "${prefix}", not ${strays.join(", ")}`)

    function fail(problem: string): never {
      throw new TypeError(`registerPack():  ${problem}`)
    }
  }
}

/**
 * Register a component pack:  `ComponentPacks.register()`, under the name packs call it by,
 * `SpellUI.registerPack(pack)` (the docs bundle) or `registerPack(pack)` from `$/ui`.
 */
export function registerPack(pack: ComponentPack): void {
  ComponentPacks.register(pack)
}
