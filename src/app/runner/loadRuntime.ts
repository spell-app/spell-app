/**
 * Loading a FRESH copy of `spell-runtime.js` for each `<spell-viewer>` -- see `spellRuntime.ts`.
 * - The browser keeps one module per URL, so a copy needs a URL of its own:
 *   we fetch the runtime's text ONCE per page, then import it from a new `blob:` URL per copy.
 * - Its imports of the bundle's shared chunks, e.g. the page's Solid through `spell-solid-shared.js`, are relative,
 *   which a `blob:` URL can't resolve:  so they're made absolute first.
 *   Every copy then shares those chunks.
 */
import { $fetch } from "spell/util"

import type * as SpellRuntimeModule from "./spellRuntime"

/**
 * A fresh copy of the runtime at `url`, and the `blob:` URL it's loaded from -- the app's `@spell/core`.
 * - Call `release()` when done with it:  its URL stays live till then, for compiled spell to import.
 */
export async function loadRuntime(url: string): Promise<LoadedRuntime> {
  let source = sources.get(url)
  if (!source) sources.set(url, (source = fetchRuntime(url)))
  const coreUrl = URL.createObjectURL(new Blob([await source], { type: "text/javascript" }))
  const runtime = (await import(/* @vite-ignore */ coreUrl)) as SpellRuntime
  return { runtime, coreUrl, release: () => URL.revokeObjectURL(coreUrl) }
}

/** A copy of the runtime, as `loadRuntime()` answers it. */
export type LoadedRuntime = {
  /** The copy's exports -- its own `core`, and `runApp()`. */
  runtime: SpellRuntime
  /** `blob:` URL it was loaded from -- what the app's `@spell/core` points at. */
  coreUrl: string
  /** Let go of `coreUrl`, once the app's gone. */
  release: () => void
}

/** What `spell-runtime.js` exports -- see `spellRuntime.ts`. */
export type SpellRuntime = typeof SpellRuntimeModule

/**
 * `source` with its relative imports made absolute against `url`, so it runs from a `blob:` URL.
 * - e.g. `from "./spell-solid-shared.js"`, `import("./x.js")`
 * - Pure.
 */
export function absoluteImports(source: string, url: string): string {
  return source.replace(RELATIVE_IMPORT, (_whole, before: string, quote: string, specifier: string) => {
    return `${before}${quote}${new URL(specifier, url).href}${quote}`
  })
}

/** A relative specifier in an `import`:  what's before it, its quote, then it. */
const RELATIVE_IMPORT = /(\bfrom\s*|\bimport\s*\(?\s*)(["'])(\.{1,2}\/[^"']+)\2/g

/** Text of each runtime fetched, by URL -- fetched once per page. */
const sources = new Map<string, Promise<string>>()

/** Text of the runtime at `url`, its imports made absolute;  throws `$fetch()`'s error when it can't load. */
async function fetchRuntime(url: string): Promise<string> {
  return absoluteImports(await $fetch<string>({ url }), url)
}
