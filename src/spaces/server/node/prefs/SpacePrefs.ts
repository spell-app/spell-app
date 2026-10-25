import { SRV } from "spell/server"
import type { SpaceStorage } from "spell-app/spaces/models/SpaceStorage"
import { editJSON5, readJSON5 } from "spell-app/spaces/server/node/storage/json5"

/****************
 * ### `SpacePrefs`
 * Each person's preferences, kept in their own space:  how the page server answers the kit's `ServerPlace`
 * (epic `prefs-and-undo` P2).
 * - One JSON5 file per store, in the person's `__prefs/` folder:
 *   - `@spell/owen@/__prefs/spellEditor.json5`
 *   - a store named like a project is a folder and a file:  `@spell/owen@/__prefs/@owen/solitaire.json5`
 * - Each of the store's keys is a key of its file, its value as JSON5:  a person can read the file, and their
 *   comments in it stay (spaces' JSON5 writer).
 * - Through `SpaceStorage`, so it works on whatever storage spaces get (the disk's today).
 * - One change at a time to each file, in this server:  two saves at once never lose one.
 * - throws `SRV.HttpError(400)` for a store name that would reach outside the person's `__prefs/`, or a key that
 *   can't be one;  `SyntaxError` for a file a person broke by hand.
 * - Knows nothing of HTTP's requests:  its routes are `prefsRoutes.ts`.
 ****************/
export class SpacePrefs {
  /** Where spaces' files are:  spell-spaces' disk, or a test's. */
  readonly storage: SpaceStorage

  constructor(storage: SpaceStorage) {
    this.storage = storage
  }

  /** `person`'s value of `store` under `key`, or `undefined` for none. */
  async load(person: PrefPerson, store: string, key: string): Promise<unknown> {
    checkKey(key)
    return (await this.valuesOf(person, store))?.[key]
  }

  /** Keep `value` under `key` for `person`'s `store`;  `undefined` forgets it.  Returns `value`. */
  async save(person: PrefPerson, store: string, key: string, value: unknown): Promise<unknown> {
    checkKey(key)
    await this.edit(person, store, (values) => {
      if (value === undefined) delete values[key]
      else values[key] = value
    })
    return value
  }

  /** `person`'s keys of `store` that start with `under`:  every key, for `""`. */
  async keys(person: PrefPerson, store: string, under = ""): Promise<string[]> {
    return Object.keys((await this.valuesOf(person, store)) ?? {}).filter((key) => key.startsWith(under))
  }

  /** Forget `person`'s keys of `store` that start with `under`;  returns the keys left. */
  async forgetUnder(person: PrefPerson, store: string, under: string): Promise<string[]> {
    const values = await this.edit(person, store, (values) => {
      for (const key of Object.keys(values)) if (key.startsWith(under)) delete values[key]
    })
    return Object.keys(values)
  }

  /**
   * The file `person`'s `store` is kept in, under spell-spaces:  `@spell/owen@/__prefs/spellEditor.json5`.
   * - throws `SRV.HttpError(400)` for a name that isn't a store's:  empty, a colon, a part starting with a dot
   */
  fileFor(person: PrefPerson, store: string): string {
    if (!STORE_NAME.test(store)) {
      throw new SRV.HttpError(400, `SpacePrefs:  \`${store}\` can't name a store;  give it a name like "spellEditor"`)
    }
    return `@${person.org}/${person.id}@/${PREFS_FOLDER}/${store}.json5`
  }

  ////////////////
  // ## The files
  ////////////////

  /** `person`'s values of `store`, as its file has them;  `undefined` for no file. */
  private valuesOf(person: PrefPerson, store: string): Promise<PrefValues | undefined> {
    return readJSON5<PrefValues>(this.storage, this.fileFor(person, store))
  }

  /** `change` `person`'s values of `store` in place, and write its file back, comments kept;  one at a time per file. */
  private edit(person: PrefPerson, store: string, change: (values: PrefValues) => void): Promise<PrefValues> {
    const file = this.fileFor(person, store)
    const before = this.editing.get(file) ?? Promise.resolve()
    const after = before.then(() =>
      editJSON5<PrefValues>(this.storage, file, (values = {}) => {
        change(values)
        return values
      })
    )
    const settled = after.then(
      () => undefined,
      () => undefined
    )
    this.editing.set(file, settled)
    void settled.then(() => {
      if (this.editing.get(file) === settled) this.editing.delete(file)
    })
    return after
  }

  /** The edit under way for each file:  see `edit()`. */
  private editing = new Map<string, Promise<void>>()
}

/** Whose preferences:  a person, and the org whose space theirs is in (`owen`, `spell`). */
export type PrefPerson = {
  /** Their id, e.g. `owen`. */
  id: string
  /** Their org's, e.g. `spell`. */
  org: string
}

/** A store's values, by key, as its file keeps them. */
export type PrefValues = Record<string, unknown>

/** The folder of a person's space that keeps their preferences:  one of spaces' own names (`SPACE_NAMES`). */
const PREFS_FOLDER = "__prefs"

/** A store's name:  `/`-separated parts, none empty or starting with a dot, no colon or backslash. */
const STORE_NAME = /^(?!\.)[^/\\:]+(?:\/(?!\.)[^/\\:]+)*$/

/** Throws `SRV.HttpError(400)` for a key that can't be one:  empty, or `__proto__`. */
function checkKey(key: string): void {
  if (!key || key === "__proto__") {
    throw new SRV.HttpError(400, `SpacePrefs:  \`${key}\` can't be a pref's key;  give it a name like "mode"`)
  }
}
