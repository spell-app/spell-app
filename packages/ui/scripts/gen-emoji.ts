/**
 * `yarn gen:emoji`:  write `src/components/ui-emoji/data/<set>/<chunk>.json`, emoji NAMES => native Unicode emoji, one
 * JSON file per first letter of the name, per NAME SET, which `EmojiData` loads lazily.
 * - Two sets, never merged (`EmojiData.use()` picks one, `<ui-root emoji>` does it per subtree).  Sources are read
 *   at generation time only (NOTHING new ships at runtime;  `emojibase-data` is a devDependency):
 *   - `cldr` (the default):  every emoji `emojibase-data` (`en/data.json` + `en/shortcodes/cldr.json`) gives a CLDR
 *     shortcode (`thumbs_up`, `grinning_face_with_smiling_eyes`, `flag_united_states`)
 *   - `fomantic`:  Fomantic's `@emoji-map` in `reference/Fomantic-UI/src/themes/default/elements/emoji.variables`
 *     (read, never written), `<twemoji code points>: <name>;`, with FOMANTIC's meanings (`dog` is the dog face,
 *     `pencil` the memo).  Each entry's emoji is looked up in emojibase by its code points.
 * - The character comes from emojibase's HEX CODE, with U+FE0F where the emoji would otherwise show as TEXT:
 *   emojibase's hex codes already have it in sequences (keycaps, ZWJ);  for a text-default emoji (`type` 0, `2600`
 *   sunny, `00a9` copyright) the generator adds it after the first code point.  No hand-written presentation
 *   ranges:  the data says.  `UIEmoji.css`'s `font-variant-emoji: emoji` covers any the data misses, where the
 *   browser supports it.
 * - Output is COMMITTED (like the icon data):  installs and CI need neither the reference clone nor this
 *   dependency.  The `fmt` settings (`vite.lint.ts`) ignore it, so formatting never inflates it.
 * - Chunks:  `a` ... `z` by the name's first letter, `0` for names starting with a digit (`100`, `1st_place_medal`).
 *   `EmojiData.chunkFor()` MUST agree.
 */

import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { NodePackage } from "../tools/NodePackage.ts"
import { Terminal } from "../tools/Terminal.ts"

/****************
 * ### `EmojiGenerator`
 * Builds every file under `src/components/ui-emoji/data/`:  one folder per name set.
 * - `run()` reads both sources, turns each emoji into its character, builds each set, groups by chunk and writes.
 ****************/
class EmojiGenerator {
  /** CLDR shortcodes by emojibase hex code (the first one of a list is the name), set by `emojibase()`. */
  shortcodes: Record<string, string | string[]> = {}

  /** Generate everything;  prints a summary. */
  run() {
    const emojis = this.emojibase()
    const sets = {
      cldr: this.cldrNames(emojis),
      fomantic: this.fomanticNames(emojis, this.read(readFileSync(SOURCE, "utf8")))
    }
    rmSync(OUTPUT, { recursive: true, force: true })
    for (const [set, names] of Object.entries(sets)) {
      const chunks = this.chunk([...names])
      this.write(set, chunks)
      const sizes = [...chunks].map(([key, map]) => `${key} ${Object.keys(map).length}`)
      Terminal.out(`gen-emoji:  ${set}:  ${names.size} names in ${chunks.size} chunks (${sizes.join(", ")})`)
    }
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
   * Fomantic's name => emoji, for every `@emoji-map` entry (the first entry of a repeated name wins).
   * - throws if a Fomantic emoji is unknown to emojibase
   */
  fomanticNames(emojis: Map<string, EmojiEntry>, fomantic: [codes: string, name: string][]): Map<string, string> {
    const names = new Map<string, string>()
    for (const [codes, name] of fomantic) {
      const found = emojis.get(EmojiGenerator.key(codes))
      if (!found) {
        throw new Error(
          `EmojiGenerator.fomanticNames():  Fomantic's ${name} (${codes}) is not in emojibase-data;  ` +
            `update emojibase-data`
        )
      }
      if (!names.has(name)) names.set(name, found.emoji)
    }
    return names
  }

  /**
   * `[twemoji code points, name]` for every `@emoji-map` entry, in source order.
   * - throws if `source` has no `@emoji-map`
   */
  read(source: string): [codes: string, name: string][] {
    const start = source.indexOf("@emoji-map: {")
    if (start < 0) {
      throw new Error(`EmojiGenerator.read():  no @emoji-map in ${SOURCE};  update the Fomantic-UI reference clone`)
    }
    const body = source.slice(start, source.indexOf("};", start))
    return [...body.matchAll(ENTRY)].map(([, codes, name]) => [codes!, name!.trim()])
  }

  /**
   * The character(s) for an emojibase entry:  its hex code, plus U+FE0F after the first code point when it shows
   * as text by default (`type` 0) and the hex code has none.
   */
  emoji({ hexcode, type }: EmojibaseEmoji): string {
    const points = hexcode.split("-").map((hex) => parseInt(hex, 16))
    if (type === 0 && !points.includes(VS16)) points.splice(1, 0, VS16)
    return String.fromCodePoint(...points)
  }

  /** Entries grouped by chunk key, each sorted by name for stable diffs. */
  chunk(entries: [string, string][]): Map<string, Record<string, string>> {
    const chunks = new Map<string, Record<string, string>>()
    for (const [name, emoji] of [...entries].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
      const key = EmojiGenerator.chunkFor(name)
      if (!chunks.has(key)) chunks.set(key, {})
      chunks.get(key)![name] = emoji
    }
    return chunks
  }

  /** Write one JSON file (2-space indent) per chunk of `set`. */
  write(set: string, chunks: Map<string, Record<string, string>>) {
    const folder = path.join(OUTPUT, set)
    mkdirSync(folder, { recursive: true })
    for (const [key, map] of chunks) {
      writeFileSync(path.join(folder, `${key}.json`), `${JSON.stringify(map, null, 2)}\n`)
    }
  }

  /**
   * Comparison key for a hex code from either source:  code points as numbers, U+FE0F dropped.  Twemoji's file
   * names (`1f44d`, `a9`, `31-20e3`) and emojibase's (`1F44D`, `00A9`, `0031-FE0F-20E3`) agree on it.
   * - Static:  a pure function of its argument.
   */
  static key(codes: string): string {
    return codes
      .split("-")
      .map((hex) => parseInt(hex, 16))
      .filter((point) => point !== VS16)
      .join("-")
  }

  /**
   * Chunk key of `name`:  its first letter, or `0` for a digit.  MUST match `EmojiData.chunkFor()`.
   * - Static:  a pure function of its argument.
   */
  static chunkFor(name: string): string {
    const first = name[0] ?? ""
    return /[a-z]/.test(first) ? first : DIGIT_CHUNK
  }
}

////////////////
// ## Constants
////////////////

/** `packages/ui/`. */
const PACKAGE_ROOT = fileURLToPath(new URL("../", import.meta.url))

/** Fomantic's emoji variables (read only). */
const SOURCE = path.join(PACKAGE_ROOT, "reference/Fomantic-UI/src/themes/default/elements/emoji.variables")

/** Output directory;  emptied first, so a dropped emoji or set doesn't linger. */
const OUTPUT = path.join(PACKAGE_ROOT, "src/components/ui-emoji/data")

/** Variation selector 16:  "show as an emoji". */
const VS16 = 0xfe0f

/** `<code points>: <name>;` inside `@emoji-map`. */
const ENTRY = /^\s*([0-9a-f-]+):\s*([^;]+);/gm

/** Chunk of names starting with anything but a letter. */
const DIGIT_CHUNK = "0"

////////////////
// ## Types
////////////////

/** The parts of emojibase's `Emoji` we read. */
type EmojibaseEmoji = {
  hexcode: string
  /** 0 = text presentation by default, 1 = emoji presentation by default. */
  type: number
  skins?: EmojibaseEmoji[]
}

/** One emoji of the data set:  its emojibase hex code and its character. */
type EmojiEntry = {
  hexcode: string
  emoji: string
}

new EmojiGenerator().run()
