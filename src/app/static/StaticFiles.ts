import { $fetch, KnownFormat, LoadableFile, UIError, parseJSON, parseJSON5, type $FetchParams } from "spell/util"
import { SP } from "spell-parser/spell"

import { STATIC_BUILD_CLASS } from "./staticBuild"

import "./static.css"

/**
 * The editor's files in its STATIC build (`isStaticBuild`):  how every project, list and file is read and saved
 * with no server behind the page.
 * - It answers the URLs spell uses (`SP.SpellUrls`) in place of the page server, as `LoadableFile.fetch`:
 *   - a group's projects, `/api/projects/list/<group>`:  `<that>.json`, written at build time
 *   - a project's index, `/api/projects/index/<project>`:  `<that>.json`, written at build time,
 *     its files' text swapped for the visitor's edits
 *   - a file, `/spaces/<project>/<file>`:  the visitor's edit if there is one, else the file the build copied
 *   - saving a file, `/api/projects/file/<project>/<file>`:  kept in the browser (below)
 *   - anything else (create, rename, delete, settings):  a `UIError`, as the build hides those
 * - What's kept, and where:
 *   - a file of the project's own, one its index lists (`Solitaire.spell`):
 *     the browser's `localStorage`, so an edit stays after a reload, until "Reset Example" (`reset()`)
 *   - what spell builds from them (`Solitaire.spell.js`, its words and declarations):
 *     this page's memory only, as each visit compiles afresh
 * - The page's own `fetch()`es of compiled files (`fetchCompiled()`, the runners' `fetchText()`) read the build's
 *   copies:  they load OTHER projects, which a visitor can't edit.
 * - Browser code;  imports only `spell/util` and spell's barrel.
 */
export class StaticFiles {
  /** Where edits are kept:  the browser's `localStorage`, or none (a private window that refuses it). */
  readonly storage: Storage | undefined

  /** What spell built this visit, by file address:  never kept past the page. */
  readonly built = new Map<string, string>()

  /** Each project's index as the build wrote it, by project id:  says which of its files are its own. */
  private indexes = new Map<string, SP.ProjectManifestJSON5>()

  constructor(storage: Storage | undefined = storageOrNone()) {
    this.storage = storage
  }

  /**
   * Answer every `LoadableFile` from now on, and mark the page (`:root.spell-static`).
   * - SIDE EFFECT:  replaces `LoadableFile.fetch`, adds `STATIC_BUILD_CLASS` to `<html>`.
   */
  install(): this {
    LoadableFile.fetch = this.fetch
    document.documentElement.classList.add(STATIC_BUILD_CLASS)
    return this
  }

  /**
   * `$fetch()` look-alike for the static build -- see the class.
   * - Same result shapes as the page server's:  a list, an index, a file's text (or parsed `format`), `true` for a save.
   * - throws as `$fetch()` does for a file the build doesn't have;  `UIError` for a call it can't make
   */
  fetch = async <T = any>($params: $FetchParams): Promise<T> => {
    const url = $params.url.split(/[?#]/)[0]!
    const isSaving = $params.contents != null || ($params.method && $params.method !== "GET")
    if (url.startsWith(SP.SpellUrls.SAVE) && isSaving) return this.save(url, $params.contents) as T
    if (isSaving) throw new UIError(`${url}:  not in the preview -- it keeps your edits in this browser only`)
    if (url.startsWith(SP.SpellUrls.LIST)) return (await this.fromBuild(url, [])) as T
    if (url.startsWith(SP.SpellUrls.INDEX)) return (await this.index(url)) as T
    if (url.startsWith(SP.SpellUrls.SPACES)) {
      const kept = this.keptText(SP.SpellUrls.fileForUrl(url).path)
      if (kept !== undefined) return asFormat(kept, $params.format) as T
    }
    return $fetch<T>($params)
  }

  /** Has the visitor changed any file of project `projectId`? */
  hasEdits(projectId: string): boolean {
    return this.keptKeys(projectId).length > 0
  }

  /**
   * Forget the visitor's edits to project `projectId`, and what this visit built of it:
   * its files read as the build wrote them again.
   * - The caller reloads the project (the page) to show them.
   */
  reset(projectId: string): void {
    for (const key of this.keptKeys(projectId)) this.storage?.removeItem(key)
    for (const path of [...this.built.keys()]) if (path.startsWith(`${projectId}/`)) this.built.delete(path)
  }

  ////////////////
  // ## Reading and keeping
  ////////////////

  /** JSON the build wrote for API URL `url`:  `<url>.json`;  `fallback` if it has none. */
  private fromBuild<T>(url: string, fallback?: T): Promise<T> {
    return $fetch<T>({ url: `${url}${BUILT_DATA_SUFFIX}`, format: KnownFormat.json, defaultContents: fallback })
  }

  /** Project index at `url`, its files' text the visitor's where they changed it. */
  private async index(url: string): Promise<SP.ProjectManifestJSON5> {
    const projectId = SP.SpellUrls.projectIdFor(url)
    const index = await this.fromBuild<SP.ProjectManifestJSON5>(url)
    this.indexes.set(projectId, index)
    for (const entry of index.imports ?? []) {
      if (SP.SpellLocation.isAddress(entry.path)) continue
      const kept = this.keptText(`${projectId}${entry.path}`)
      if (kept !== undefined) entry.contents = kept
    }
    return index
  }

  /**
   * Save file at `url`:  a project's own file in the browser's storage, a built one in memory -- see the class.
   * - Its text as the page server gets it:  a string as is, anything else as JSON.
   * - Returns `true`, as the server does.
   */
  private save(url: string, contents: unknown): true {
    const { projectId, path } = SP.SpellUrls.fileForUrl(url)
    const text = typeof contents === "string" ? contents : JSON.stringify(contents)
    const isOwnFile = !!this.indexes.get(projectId)?.manifest?.[path]
    if (isOwnFile && this.storage) {
      try {
        this.storage.setItem(STORAGE_PREFIX + path, text)
        return true
      } catch (error) {
        // full, or refused:  kept for this visit only
        console.error(`StaticFiles:  couldn't keep ${path} in this browser`, error)
      }
    }
    this.built.set(path, text)
    return true
  }

  /** Text kept for file `path` (its address), this visit's first:  `undefined` if none. */
  private keptText(path: string): string | undefined {
    return this.built.get(path) ?? this.storage?.getItem(STORAGE_PREFIX + path) ?? undefined
  }

  /** Storage keys of project `projectId`'s kept files. */
  private keptKeys(projectId: string): string[] {
    const { storage } = this
    if (!storage) return []
    const prefix = `${STORAGE_PREFIX}${projectId}/`
    return Array.from({ length: storage.length }, (_, index) => storage.key(index)!).filter((key) =>
      key?.startsWith(prefix)
    )
  }
}

/** Start of the storage key of each file a visitor changed:  then its address, `@spell/examples/x/x.spell`. */
export const STORAGE_PREFIX = "spell-static:"

/** End of the files the build writes for the API's lists and indexes:  `/api/projects/list/@spell/examples.json`. */
export const BUILT_DATA_SUFFIX = ".json"

/** The page's `localStorage`, or none where reading it throws (a private window, blocked site data). */
function storageOrNone(): Storage | undefined {
  try {
    return globalThis.localStorage ?? undefined
  } catch {
    return undefined
  }
}

/** `text` as `$fetch()` would return it for `format`:  parsed for JSON / JSON5, else as is. */
function asFormat(text: string, format: string | undefined): unknown {
  if (format === KnownFormat.json || format?.toLowerCase() === "json") return parseJSON(text)
  if (format === KnownFormat.json5 || format?.toLowerCase() === "json5") return parseJSON5(text)
  return text
}

/** The page's one `StaticFiles`:  installed at start-up in the static build only (`index.tsx`). */
export const staticFiles = new StaticFiles()
