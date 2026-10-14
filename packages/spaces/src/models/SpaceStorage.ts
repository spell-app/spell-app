/**
 * Where spaces' files are kept:  people's, orgs', their projects' (epic `people-and-orgs` P8, J4).
 * - Paths are `/`-separated and RELATIVE to the storage's own root, as spell-spaces lays it out:
 *   `@spell/owen@/__me.json5`, `@three-degrees/__org.json5`.
 * - The disk is the first:  `DiskStorage` (`$/spaces/server/node/storage/DiskStorage`), on spell-spaces.
 *   S3 or Git can replace it later, behind this same interface.
 * - Text in, text out:  reading and writing JSON5 so its comments stay is `$/spaces/server/node/storage/json5`'s.
 * - Types only:  safe in a browser, where nothing implements it.
 */
export interface SpaceStorage {
  /** The text of file `path`;  `undefined` if there's none. */
  read(path: string): Promise<string | undefined>

  /** Write file `path` whole, making its folders:  all at once, so a reader never sees half of it. */
  write(path: string, text: string): Promise<void>

  /**
   * The names in folder `folder` (`""` for the root), sorted:  a folder's ends in `/`, e.g. `["__me.json5", "errors/"]`.
   * - Kept up to date by itself:  a change in the folder, by anyone, shows in the next `list()`.
   * - `[]` for a folder that isn't there.
   */
  list(folder: string): Promise<string[]>

  /** Remove file or folder `path`, everything inside;  nothing if it isn't there. */
  remove(path: string): Promise<void>

  /**
   * Call `onChange(path)` with each file or folder that changes under `folder`, by anyone, until the returned
   * function is called.
   */
  watch(folder: string, onChange: (path: string) => void): () => void
}
