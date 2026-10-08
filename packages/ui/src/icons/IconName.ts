// `.ts` extension:  node tooling loads this file directly (`tools/IconPackBuilder.ts`)
import { ICON_PREFIX_SEPARATOR } from "./icons.types.ts"

/****************
 * ### `IconName`
 * Icon names:  ONE name per icon, lowercase words separated by single spaces (`address book outline`).
 * - Plain functions of strings, no DOM:  shared by the runtime (`UI.icons`) and the node pack builder, which
 *   imports this file by relative path.  So it imports nothing but `icons.types`.
 * - STATIC and instance-free on purpose:  a name is a string, with nothing to hold.
 * - Within one pack, who gets a name (`IconName.claim()`):
 *   - an explicit `alias` beats a name derived from a file name
 *   - otherwise the FIRST entry to claim it keeps it
 *   - Why aliases win:  a hand-edit (or the Fomantic pack) must be able to take a word from a file name, e.g.
 *     alias `shield` on `solid/shield-halved` over the file `solid/shield`.
 ****************/
export class IconName {
  /**
   * `name` as the one canonical spelling:  lowercase, dashes / underscores -> spaces, whitespace collapsed.
   * - So names pasted from Font Awesome's site (`address-book`) work.
   */
  static normalize(name: string): string {
    return name.toLowerCase().replace(SEPARATORS, " ").trim()
  }

  /** Name an index key gives its icon:  its file name, normalized (`solid/address-book` -> `address book`). */
  static fromKey(key: string): string {
    return IconName.normalize(key.slice(key.lastIndexOf("/") + 1))
  }

  /** An entry's `alias` field as a list of normalized names. */
  static aliases(alias: string | string[] | undefined): string[] {
    if (alias === undefined) return []
    return (Array.isArray(alias) ? alias : [alias]).map(IconName.normalize).filter(Boolean)
  }

  /**
   * `prefix:name` split, both normalized.
   * - `prefix`:  the pack id or prefix before the separator (`lucide`);  `undefined` without a separator
   * - `name`:  the icon's name, normalized (`bell`)
   * - Only the FIRST separator splits, so a name itself never contains one.
   */
  static split(name: string): { prefix?: string; name: string } {
    const at = name.indexOf(ICON_PREFIX_SEPARATOR)
    if (at < 0) return { name: IconName.normalize(name) }
    return { prefix: name.slice(0, at).trim().toLowerCase(), name: IconName.normalize(name.slice(at + 1)) }
  }

  /**
   * Name -> index key for every name the entries give, by the rules above.
   * - `entries` in index order.
   */
  static claim(entries: Iterable<[key: string, alias: string | string[] | undefined]>): Map<string, string> {
    const byAlias = new Map<string, string>()
    const byFile = new Map<string, string>()
    for (const [key, alias] of entries) {
      for (const name of IconName.aliases(alias)) if (!byAlias.has(name)) byAlias.set(name, key)
      const derived = IconName.fromKey(key)
      if (derived && !byFile.has(derived)) byFile.set(derived, key)
    }
    for (const [name, key] of byAlias) byFile.set(name, key)
    return byFile
  }
}

/** Runs of dashes, underscores and whitespace:  each becomes one space. */
const SEPARATORS = /[\s_-]+/g
