/**
 * Generates `src/components/emoji/data/<chunk>.json`:  emoji NAMES => native Unicode emoji, one JSON file per first
 * letter of the name, which `EmojiData` loads lazily.
 * - Run with `yarn gen:emoji` (`tsc -p scripts && tsx scripts/gen-emoji.ts`).
 * - Sources, both read at generation time only (NOTHING new ships at runtime;  `emojibase-data` is a devDependency):
 *   - `emojibase-data` (`en/data.json` + `en/shortcodes/cldr.json`):  every RGI emoji (Unicode / CLDR), its code
 *     points, its presentation (`type`:  0 = text by default, 1 = emoji by default) and its CLDR shortcode
 *     (`thumbs_up`, `grinning_face_with_smiling_eyes`, `flag_united_states`).  These are the NAMES.
 *   - Fomantic's `@emoji-map` in `reference/Fomantic-UI/src/themes/default/elements/emoji.variables` (read, never
 *     written), `<twemoji code points>: <name>;`.  Its names that differ from the CLDR one are kept as ALIASES of the
 *     same character (`thumbsup`, `smile`, `flag_us`, `thumbsup_tone1`), so existing pages keep drawing.
 *     - If an alias is also the CLDR name of ANOTHER emoji (`dog`:  Fomantic's is the dog face, CLDR's the whole dog),
 *       Fomantic's meaning wins, so a page written for Fomantic doesn't change;  the other emoji keeps its other
 *       names (`dog2`).  The clashes are logged.
 * - The character comes from emojibase's HEX CODE, with U+FE0F where the emoji would otherwise show as TEXT:
 *   emojibase's hex codes already have it in sequences (keycaps, ZWJ);  for a text-default emoji (`type` 0, `2600`
 *   sunny, `00a9` copyright) the generator adds it after the first code point.  No hand-written presentation
 *   ranges:  the data says.  `emoji.css`'s `font-variant-emoji: emoji` covers any the data misses, where the
 *   browser supports it.
 * - Output is COMMITTED (like the icon data):  installs and CI need neither the reference clone nor this
 *   dependency.  `.oxfmtrc.json` ignores it, so formatting never inflates it.
 * - Chunks:  `a` ... `z` by the name's first letter, `0` for names starting with a digit (`100`, `1st_place_medal`).
 *   `EmojiData.chunkOf()` MUST agree.
 */

import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { NodePackage } from "../tools/NodePackage.ts"

/** The parts of emojibase's `Emoji` we read. */
interface EmojibaseEmoji {
  hexcode: string
  /** 0 = text presentation by default, 1 = emoji presentation by default. */
  type: number
  skins?: EmojibaseEmoji[]
}

/** One emoji of the data set:  its emojibase hex code and its character. */
interface EmojiEntry {
  hexcode: string
  emoji: string
}

////////////////
// ## Generator
////////////////

/**
 * Builds every file under `src/components/emoji/data/` from emojibase's CLDR names plus Fomantic's names.
 * - `run()` reads both, turns each emoji into its character, adds the aliases, groups by chunk and writes the files.
 */
class EmojiGenerator {
  /** Repo root. */
  static readonly ROOT = fileURLToPath(new URL("../", import.meta.url))

  /** Fomantic's emoji variables (read only). */
  static readonly SOURCE = path.join(
    EmojiGenerator.ROOT,
    "reference/Fomantic-UI/src/themes/default/elements/emoji.variables"
  )

  /** Output directory;  emptied first, so a dropped emoji doesn't linger. */
  static readonly OUT = path.join(EmojiGenerator.ROOT, "src/components/emoji/data")

  /** Variation selector 16:  "show as an emoji". */
  static readonly VS16 = 0xfe0f

  /** CLDR shortcodes by emojibase hex code (the first one of a list is the name), set by `emojibase()`. */
  shortcodes: Record<string, string | string[]> = {}

  /** Generate everything;  logs a summary. */
  run() {
    const emojis = this.emojibase()
    const names = this.cldrNames(emojis)
    const aliases = this.addFomantic(names, emojis, this.read(readFileSync(EmojiGenerator.SOURCE, "utf8")))
    const chunks = this.chunk([...names])
    this.write(chunks)
    const sizes = [...chunks].map(([key, map]) => `${key} ${Object.keys(map).length}`)
    console.log(
      `gen-emoji:  ${names.size} names (${emojis.size} emoji, ${aliases} Fomantic aliases) in ${chunks.size} chunks ` +
        `(${sizes.join(", ")})`
    )
  }

  /** Every emojibase emoji and skin variant, by comparison key (`EmojiGenerator.key()`). */
  emojibase(): Map<string, EmojiEntry> {
    const folder = path.join(NodePackage.need("emojibase-data"), "en")
    this.shortcodes = JSON.parse(readFileSync(path.join(folder, "shortcodes/cldr.json"), "utf8")) as Record<
      string,
      string | string[]
    >
    const data = JSON.parse(readFileSync(path.join(folder, "data.json"), "utf8")) as EmojibaseEmoji[]
    const emojis = new Map<string, EmojiEntry>()
    for (const entry of data) {
      for (const each of [entry, ...(entry.skins ?? [])]) {
        emojis.set(EmojiGenerator.key(each.hexcode), { hexcode: each.hexcode, emoji: this.emoji(each) })
      }
    }
    return emojis
  }

  /** CLDR name => emoji, for every emoji that has a shortcode. */
  cldrNames(emojis: Map<string, EmojiEntry>): Map<string, string> {
    const names = new Map<string, string>()
    for (const { hexcode, emoji } of emojis.values()) {
      const [name] = [this.shortcodes[hexcode] ?? []].flat()
      if (name) names.set(name, emoji)
    }
    return names
  }

  /**
   * Add Fomantic's names that differ from the CLDR one as aliases (Fomantic's meaning wins a name clash);
   * returns how many were added.  Throws if a Fomantic emoji is unknown to emojibase.
   */
  addFomantic(
    names: Map<string, string>,
    emojis: Map<string, EmojiEntry>,
    fomantic: [codes: string, name: string][]
  ): number {
    let added = 0
    for (const [codes, name] of fomantic) {
      const found = emojis.get(EmojiGenerator.key(codes))
      if (!found) throw new Error(`gen-emoji:  Fomantic's ${name} (${codes}) is not in emojibase-data`)
      if ([this.shortcodes[found.hexcode] ?? []].flat()[0] === name) continue
      const clash = names.get(name)
      if (clash !== undefined && clash !== found.emoji) {
        console.log(`gen-emoji:  clash:  ${name} is Fomantic's ${found.emoji}, CLDR's ${clash} (Fomantic wins)`)
      }
      names.set(name, found.emoji)
      added++
    }
    return added
  }

  /** `[twemoji code points, name]` for every `@emoji-map` entry, in source order. */
  read(source: string): [codes: string, name: string][] {
    const start = source.indexOf("@emoji-map: {")
    if (start < 0) throw new Error(`gen-emoji:  no @emoji-map in ${EmojiGenerator.SOURCE}`)
    const body = source.slice(start, source.indexOf("};", start))
    return [...body.matchAll(ENTRY)].map(([, codes, name]) => [codes!, name!.trim()])
  }

  /**
   * The character(s) for an emojibase entry:  its hex code, plus U+FE0F after the first code point when it shows
   * as text by default (`type` 0) and the hex code has none.
   */
  emoji({ hexcode, type }: EmojibaseEmoji): string {
    const points = hexcode.split("-").map((hex) => parseInt(hex, 16))
    if (type === 0 && !points.includes(EmojiGenerator.VS16)) points.splice(1, 0, EmojiGenerator.VS16)
    return String.fromCodePoint(...points)
  }

  /** Entries grouped by chunk key, each sorted by name for stable diffs. */
  chunk(entries: [string, string][]): Map<string, Record<string, string>> {
    const chunks = new Map<string, Record<string, string>>()
    for (const [name, emoji] of [...entries].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
      const key = EmojiGenerator.chunkOf(name)
      if (!chunks.has(key)) chunks.set(key, {})
      chunks.get(key)![name] = emoji
    }
    return chunks
  }

  /** Empty the output directory, then write one compact JSON file per chunk. */
  write(chunks: Map<string, Record<string, string>>) {
    mkdirSync(EmojiGenerator.OUT, { recursive: true })
    for (const file of readdirSync(EmojiGenerator.OUT)) {
      if (file.endsWith(".json")) rmSync(path.join(EmojiGenerator.OUT, file))
    }
    for (const [key, map] of chunks) {
      writeFileSync(path.join(EmojiGenerator.OUT, `${key}.json`), `${JSON.stringify(map, null, 2)}\n`)
    }
  }

  /**
   * Comparison key for a hex code from either source:  code points as numbers, U+FE0F dropped.  Twemoji's file
   * names (`1f44d`, `a9`, `31-20e3`) and emojibase's (`1F44D`, `00A9`, `0031-FE0F-20E3`) agree on it.
   */
  static key(codes: string): string {
    return codes
      .split("-")
      .map((hex) => parseInt(hex, 16))
      .filter((point) => point !== EmojiGenerator.VS16)
      .join("-")
  }

  /** Chunk key of `name`:  its first letter, or `0` for a digit.  MUST match `EmojiData.chunkOf()`. */
  static chunkOf(name: string): string {
    const first = name[0] ?? ""
    return /[a-z]/.test(first) ? first : DIGIT_CHUNK
  }
}

/** `<code points>: <name>;` inside `@emoji-map`. */
const ENTRY = /^\s*([0-9a-f-]+):\s*([^;]+);/gm

/** Chunk of names starting with anything but a letter. */
const DIGIT_CHUNK = "0"

new EmojiGenerator().run()
