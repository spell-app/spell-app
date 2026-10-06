/**
 * The icons `@spell-app/ui` ships, by the names `UI.icons` knows them by -- for `spell icons`.
 * - Read from each built-in pack's `pack.js` (`$/ui/icons`, `BuiltInPacks`), named as the runtime names them:
 *   `IconName.claim()`.  An icon no name reaches is left out.
 * - Search keywords from ui's `data/search.json`, keyed by Font Awesome file name, e.g. `bell` -> `alarm`.
 */
import { readFileSync } from "fs"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

import { BuiltInIconPacks, BuiltInPacks, IconName, type IconPackIndex } from "$/ui/icons"

/** ui's search keywords:  `src/icons/data/search.json`, beside `icon-packs/`. */
const SEARCH_FILE = resolve(dirname(fileURLToPath(BuiltInPacks.url("fa7-free"))), "..", "..", "data", "search.json")

/**
 * One icon.
 * - `name`:  what to write, e.g. `bell` -- `pack:name` reaches it in that pack only
 * - `pack`:  its pack's id, e.g. `fa7-free`
 * - `aliases`:  other names it goes by in that pack
 * - `keywords`:  words to find it by, e.g. `alarm`
 * - `svg`:  its SVG file
 */
export type IconInfo = {
  name: string
  pack: string
  aliases: string[]
  keywords: string[]
  svg: string
}

/** Every icon of `packs` -- default, all the built-in ones -- in pack order, then index order. */
export async function loadIcons(packs: readonly string[] = BuiltInIconPacks): Promise<IconInfo[]> {
  const keywordsByFile = JSON.parse(readFileSync(SEARCH_FILE, "utf8")) as Record<string, string[]>
  const icons: IconInfo[] = []
  for (const pack of packs) {
    if (!BuiltInPacks.has(pack)) throw new Error(`No icon pack '${pack}' -- packs:  ${BuiltInIconPacks.join(", ")}`)
    const indexUrl = BuiltInPacks.url(pack)
    const index = (await import(indexUrl)).default as IconPackIndex
    const folder = dirname(fileURLToPath(indexUrl))
    // every name -> its key, then each key's names, in index order
    const names = new Map<string, string[]>()
    for (const [name, key] of IconName.claim(Object.entries(index.icons).map(([key, it]) => [key, it.alias]))) {
      names.set(key, [...(names.get(key) ?? []), name])
    }
    for (const key of Object.keys(index.icons)) {
      const claimed = names.get(key)
      if (!claimed) continue
      const own = IconName.fromKey(key)
      const name = claimed.includes(own) ? own : claimed[0]!
      icons.push({
        name,
        pack,
        aliases: claimed.filter((it) => it !== name),
        keywords: keywordsByFile[key.slice(key.lastIndexOf("/") + 1)] ?? [],
        svg: resolve(folder, `${key}.svg`)
      })
    }
  }
  return icons
}

/**
 * The icons `query` finds:  every word of it in a name or alias, or starting a keyword's word -- so `bell` finds
 * `dumbbell`, but not `brain` by its keyword `cerebellum`.  Ignoring case, `-` ~== space.
 * - An exact name first, then names starting with the query, then the rest, each by name.
 * - Empty `query`:  all of them.
 */
export function searchIcons(icons: IconInfo[], query: string): IconInfo[] {
  const wanted = IconName.normalize(query)
  if (!wanted) return icons
  const words = wanted.split(" ")
  const found = icons.filter((icon) => {
    const names = [icon.name, ...icon.aliases].join("|")
    const keywordWords = icon.keywords.flatMap((it) => IconName.normalize(it).split(" "))
    return words.every((word) => names.includes(word) || keywordWords.some((it) => it.startsWith(word)))
  })
  const rank = (icon: IconInfo) => (icon.name === wanted ? 0 : icon.name.startsWith(wanted) ? 1 : 2)
  return found.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
}
