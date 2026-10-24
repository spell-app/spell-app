import { existsSync, watch, type FSWatcher } from "fs"
import { readdir, readFile } from "fs/promises"
import { relative, sep } from "path"

import { SRV } from "spell/server"
import type { SpaceStorage } from "spell-app/spaces/models/SpaceStorage"

/****************
 * ### `DiskStorage`
 * Spaces' files on the disk:  `SpaceStorage` on a folder, spell-spaces by default (epic `people-and-orgs` P8).
 * - Writes through the page server's file operations (`SRV.FileOperations`):  under the file's lock, all at once.
 * - Each folder's list is an INDEX it keeps:
 *   made on the first `list()`, and rebuilt when anything in the folder changes, by anyone.
 *   - A watcher on the root (`fs.watch`, recursive) drops a changed folder's.
 * - Every path stays inside its root:  `..`, an absolute path or a dot file is refused (`SRV.fileInside()`).
 * - `close()` stops its watcher.
 ****************/
export class DiskStorage implements SpaceStorage {
  /** The folder it keeps, absolute:  spell-spaces (`environment.spellSpacesDir`), or a test's. */
  readonly root: string
  /** Each folder's names, by its path:  dropped when the folder changes (`watcher`). */
  protected index = new Map<string, string[]>()
  /** Who's watching what:  each `watch()`'s folder and callback. */
  protected watchers = new Set<{ folder: string; onChange: (path: string) => void }>()
  /** The ONE watcher on the root, made on first need. */
  protected watcher?: FSWatcher

  constructor(root: string) {
    this.root = root
  }

  async read(path: string): Promise<string | undefined> {
    const file = this.fileFor(path)
    return existsSync(file) ? readFile(file, "utf8") : undefined
  }

  async write(path: string, text: string): Promise<void> {
    await SRV.FileOperations.save(this.fileFor(path), text)
    this.changed(path)
  }

  async list(folder: string): Promise<string[]> {
    this.startWatching()
    const key = trimSlashes(folder)
    const known = this.index.get(key)
    if (known) return known
    const dir = key ? this.fileFor(key) : this.root
    if (!existsSync(dir)) return []
    const entries = await readdir(dir, { withFileTypes: true })
    const names = entries
      .filter((entry) => !entry.name.startsWith("."))
      .map((entry) => (entry.isDirectory() ? `${entry.name}/` : entry.name))
      .sort()
    this.index.set(key, names)
    return names
  }

  async remove(path: string): Promise<void> {
    const file = this.fileFor(path)
    if (!existsSync(file)) return
    await SRV.FileOperations.delete(file)
    this.changed(path)
  }

  watch(folder: string, onChange: (path: string) => void): () => void {
    this.startWatching()
    const watcher = { folder: trimSlashes(folder), onChange }
    this.watchers.add(watcher)
    return () => void this.watchers.delete(watcher)
  }

  /** Stop watching the disk:  lists are read afresh each time after. */
  close(): void {
    this.watcher?.close()
    this.watcher = undefined
    this.index.clear()
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** The absolute file `path` names, inside the root;  throws on `..` or a dot file. */
  protected fileFor(path: string): string {
    return SRV.fileInside(this.root, trimSlashes(path))
  }

  /** `path` (relative) changed:  its folder's index dropped (and its own, if it's a folder), its watchers told. */
  protected changed(path: string): void {
    const key = trimSlashes(path)
    const folder = key.includes("/") ? key.slice(0, key.lastIndexOf("/")) : ""
    this.index.delete(folder)
    this.index.delete(key)
    for (const { folder: watched, onChange } of this.watchers) {
      if (!watched || key === watched || key.startsWith(`${watched}/`)) onChange(key)
    }
  }

  /** Watch the root, recursively, once:  a change by anyone drops its folder's index. */
  protected startWatching(): void {
    if (this.watcher || !existsSync(this.root)) return
    this.watcher = watch(this.root, { recursive: true }, (_event, name) => {
      if (name) this.changed(relative(this.root, `${this.root}${sep}${name}`).split(sep).join("/"))
    })
    this.watcher.on("error", () => this.close())
  }
}

/** `path` without its leading and trailing slashes:  an index's key. */
function trimSlashes(path: string): string {
  return path.replace(/^\/+|\/+$/g, "")
}
