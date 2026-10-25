import {
  $fetch,
  DatabasePlace,
  KnownFormat,
  LoadableFile,
  PrefStore,
  UIError,
  parseJSON,
  parseJSON5,
  type $FetchParams,
  type PrefPlace
} from "spell/util"
import { SP } from "spell-parser/spell"

import { STATIC_BUILD_CLASS } from "./staticBuild"

import "./static.css"

/**
 * The editor's files in its STATIC build (`isStaticBuild`):
 * how every project, list and file is read and saved with no server behind the page.
 * - It answers the URLs spell uses (`SP.SpellUrls`) in place of the page server, as `LoadableFile.fetch`:
 *   - a group's projects, `/api/projects/list/<group>`:  `<that>.json`, written at build time
 *   - a project's index, `/api/projects/index/<project>`:  `<that>.json`, written at build time,
 *     its files' text swapped for the visitor's edits
 *   - a file, `/spaces/<project>/<file>`:  the visitor's edit if there is one, else the file the build copied
 *   - saving a file, `/api/projects/file/<project>/<file>`:  kept in the browser (below)
 *   - anything else (create, rename, delete, settings):  a `UIError`, as the build hides those
 * - What's kept, and where:
 *   - a file of the project's own, one its index lists (`Solitaire.spell`), in two places:
 *     - the browser's database (`DatabasePlace`, the store `spell-static`):
 *       so an edit stays after a reload, until "Reset Example" (`reset()`)
 *     - this page's memory:  so a save the database refuses still holds for the visit
 *   - what spell builds from them (`Solitaire.spell.js`, its words and declarations):
 *     this page's memory only, as each visit compiles afresh
 *   - edits kept in `localStorage` before epic `prefs-and-undo` P3 (`spell-static:<address>`):
 *     moved into the database once, on first use;  every read and save waits for that (`ready()`)
 * - The page's own `fetch()`es of compiled files read the build's copies:
 *   they load OTHER projects, which a visitor can't edit (`fetchCompiled()`, the runners' `fetchText()`).
 * - Browser code;  imports only `spell/util` and spell's barrel.
 */
export class StaticFiles {
  /** Where a project's own files' edits are kept:  the store `spell-static`, by file address. */
  readonly edits: PrefStore

  /** What this visit wrote, built or edited, by file address:  read first, never kept past the page. */
  readonly built = new Map<string, string>()

  /** Each project's index as the build wrote it, by project id:  says which of its files are its own. */
  private indexes = new Map<string, SP.ProjectManifestJSON5>()

  /** `localStorage`, where edits were kept before:  moved out on first use (`moveOldEdits()`). */
  private oldStorage: Storage | undefined

  constructor({ place = DatabasePlace.shared, oldStorage = storageOrNone() }: StaticFilesProps = {}) {
    this.edits = new PrefStore(EDITS_STORE, { place })
    this.oldStorage = oldStorage
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
    if (url.startsWith(SP.SpellUrls.SAVE) && isSaving) return (await this.save(url, $params.contents)) as T
    if (isSaving) throw new UIError(`${url}:  not in the preview -- it keeps your edits in this browser only`)
    if (url.startsWith(SP.SpellUrls.LIST)) return (await this.fromBuild(url, [])) as T
    if (url.startsWith(SP.SpellUrls.INDEX)) return (await this.index(url)) as T
    if (url.startsWith(SP.SpellUrls.SPACES)) {
      const kept = await this.keptText(SP.SpellUrls.fileForUrl(url).path)
      if (kept !== undefined) return asFormat(kept, $params.format) as T
    }
    return $fetch<T>($params)
  }

  /** Has the visitor changed any file of project `projectId`? */
  async hasEdits(projectId: string): Promise<boolean> {
    await this.ready()
    return (await this.edits.loadKeysUnder(`${projectId}/`)).length > 0
  }

  /**
   * Forget the visitor's edits to project `projectId`, and what this visit built of it:
   * its files read as the build wrote them again.
   * - The caller reloads the project (the page) to show them, once this is done.
   */
  async reset(projectId: string): Promise<void> {
    await this.ready()
    await this.edits.forgetUnder(`${projectId}/`)
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
      const kept = await this.keptText(`${projectId}${entry.path}`)
      if (kept !== undefined) entry.contents = kept
    }
    return index
  }

  /**
   * Save file at `url`:  in this page's memory, and a project's own file in the browser's database too.
   * - Where each is kept, and why:  see the class.
   * - Its text as the page server gets it:  a string as is, anything else as JSON.
   * - Returns `true`, as the server does;  a refused save (the database full) is logged, and holds for this visit.
   */
  private async save(url: string, contents: unknown): Promise<true> {
    const { projectId, path } = SP.SpellUrls.fileForUrl(url)
    const text = typeof contents === "string" ? contents : JSON.stringify(contents)
    this.built.set(path, text)
    const isOwnFile = !!this.indexes.get(projectId)?.manifest?.[path]
    if (isOwnFile) {
      await this.ready()
      await this.edits.save(path, text)
    }
    return true
  }

  /** Text kept for file `path` (its address), this visit's first:  `undefined` if none. */
  private async keptText(path: string): Promise<string | undefined> {
    const visit = this.built.get(path)
    if (visit !== undefined) return visit
    await this.ready()
    const kept = await this.edits.load(path)
    return typeof kept === "string" ? kept : undefined
  }

  ////////////////
  // ## Edits kept before
  ////////////////

  /** Every read and save waits for this:  the old edits moved over first (`moveOldEdits()`), once. */
  private ready(): Promise<void> {
    return (this.moving ??= this.moveOldEdits())
  }
  private moving: Promise<void> | undefined

  /**
   * Move the edits kept in `localStorage` before (`spell-static:<address>`) into the database.
   * - Each is removed from `localStorage` as it moves.
   * - Read raw:  a file's text is kept as it is, never read as JSON.
   * - NEVER throws:  storage blocked, there's nothing to move.
   * - TODO:  drop once every browser has opened the static build since epic `prefs-and-undo` P3
   */
  private async moveOldEdits(): Promise<void> {
    const storage = this.oldStorage
    if (!storage) return
    try {
      const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index) ?? "")
      for (const key of keys.filter((each) => each.startsWith(OLD_STORAGE_PREFIX))) {
        const text = storage.getItem(key)
        if (text !== null) await this.edits.save(key.slice(OLD_STORAGE_PREFIX.length), text)
        storage.removeItem(key)
      }
    } catch (error) {
      console.error("StaticFiles:  couldn't move the edits kept in localStorage:", error)
    }
  }
}

/** Props for a `StaticFiles`. */
export type StaticFilesProps = {
  /** Where edits are kept:  default the browser's database (`DatabasePlace.shared`);  a test's own. */
  place?: PrefPlace
  /** Where edits were kept before:  default `localStorage`;  a test's own. */
  oldStorage?: Storage
}

/** The store of the files a visitor changed, in the browser's database:  each under its address. */
export const EDITS_STORE = "spell-static"

/** Start of each changed file's `localStorage` key before epic `prefs-and-undo` P3:  then its address. */
export const OLD_STORAGE_PREFIX = "spell-static:"

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
