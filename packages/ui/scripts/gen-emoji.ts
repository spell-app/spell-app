/**
 * Generates `src/components/emoji/data/<chunk>.json`:  Fomantic-UI's emoji NAMES => native Unicode emoji, one
 * JSON file per first letter of the name, which `EmojiData` loads lazily.
 * - Run with `yarn gen:emoji` (`tsc -p scripts && tsx scripts/gen-emoji.ts`).
 * - Source:  Fomantic's `@emoji-map` in `reference/Fomantic-UI/src/themes/default/elements/emoji.variables` (read,
 *   never written), where each entry is `<code points>: <name>;` -- the code points are Twemoji's file names
 *   (`1f604`, `1f1fa-1f1f8`, `31-20e3`), which Fomantic uses to fetch its sprite images.  We render the CHARACTERS
 *   instead:  no images, no CDN, the platform's emoji font.
 * - Twemoji file names drop U+FE0F (the emoji variation selector) outside ZWJ sequences, so this puts it back where
 *   a character would otherwise show as TEXT:
 *   - keycaps (`31-20e3`):  `1` FE0F U+20E3, the only valid keycap sequence
 *   - single code points below U+1F000 (`2600` sunny, `00a9` copyright ...), and the few above it whose default
 *     presentation is text (`TEXT_DEFAULT`, from Unicode's `emoji-data.txt`:  Emoji=Yes, Emoji_Presentation=No)
 *   - `emoji.css`'s `font-variant-emoji: emoji` covers any the list misses, where the browser supports it
 * - Output is COMMITTED (like the icon data):  installs and CI need no reference clone.  `.oxfmtrc.json` ignores
 *   it, so formatting never inflates it.
 * - Chunks:  `a` ... `z` by the name's first letter, `0` for names starting with a digit (`100`, `8ball`).
 *   `EmojiData.chunkOf()` MUST agree.
 */

import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

////////////////
// ## Generator
////////////////

/**
 * Builds every file under `src/components/emoji/data/` from Fomantic's emoji map.
 * - `run()` reads the map, turns each entry into its character, groups by chunk and writes the files.
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

  /** Combining enclosing keycap. */
  static readonly KEYCAP = 0x20e3

  /** Zero width joiner. */
  static readonly ZWJ = 0x200d

  /**
   * Single code points at or above U+1F000 whose DEFAULT presentation is text (Emoji_Presentation=No), so they
   * need U+FE0F to draw as emoji.  Ranges are inclusive.
   */
  static readonly TEXT_DEFAULT: readonly (readonly [number, number])[] = [
    [0x1f170, 0x1f171],
    [0x1f17e, 0x1f17f],
    [0x1f202, 0x1f202],
    [0x1f237, 0x1f237],
    [0x1f321, 0x1f321],
    [0x1f324, 0x1f32c],
    [0x1f336, 0x1f336],
    [0x1f37d, 0x1f37d],
    [0x1f396, 0x1f397],
    [0x1f399, 0x1f39b],
    [0x1f39e, 0x1f39f],
    [0x1f3cb, 0x1f3ce],
    [0x1f3d4, 0x1f3df],
    [0x1f3f3, 0x1f3f3],
    [0x1f3f5, 0x1f3f5],
    [0x1f3f7, 0x1f3f7],
    [0x1f43f, 0x1f43f],
    [0x1f441, 0x1f441],
    [0x1f4fd, 0x1f4fd],
    [0x1f549, 0x1f54a],
    [0x1f56f, 0x1f570],
    [0x1f573, 0x1f579],
    [0x1f587, 0x1f587],
    [0x1f58a, 0x1f58d],
    [0x1f590, 0x1f590],
    [0x1f5a5, 0x1f5a5],
    [0x1f5a8, 0x1f5a8],
    [0x1f5b1, 0x1f5b2],
    [0x1f5bc, 0x1f5bc],
    [0x1f5c2, 0x1f5c4],
    [0x1f5d1, 0x1f5d3],
    [0x1f5dc, 0x1f5de],
    [0x1f5e1, 0x1f5e1],
    [0x1f5e3, 0x1f5e3],
    [0x1f5e8, 0x1f5e8],
    [0x1f5ef, 0x1f5ef],
    [0x1f5f3, 0x1f5f3],
    [0x1f5fa, 0x1f5fa],
    [0x1f6cb, 0x1f6cb],
    [0x1f6cd, 0x1f6cf],
    [0x1f6e0, 0x1f6e5],
    [0x1f6e9, 0x1f6e9],
    [0x1f6f0, 0x1f6f0],
    [0x1f6f3, 0x1f6f3]
  ]

  /** Generate everything;  logs a summary. */
  run() {
    const entries = this.read(readFileSync(EmojiGenerator.SOURCE, "utf8"))
    const chunks = this.chunk(entries)
    this.write(chunks)
    const sizes = [...chunks].map(([key, map]) => `${key} ${Object.keys(map).length}`)
    console.log(`gen-emoji:  ${entries.length} emoji in ${chunks.size} chunks (${sizes.join(", ")})`)
  }

  /** `[name, emoji]` for every `@emoji-map` entry, in source order. */
  read(source: string): [name: string, emoji: string][] {
    const start = source.indexOf("@emoji-map: {")
    if (start < 0) throw new Error(`gen-emoji:  no @emoji-map in ${EmojiGenerator.SOURCE}`)
    const body = source.slice(start, source.indexOf("};", start))
    const entries: [string, string][] = []
    for (const [, codes, name] of body.matchAll(ENTRY)) entries.push([name!.trim(), this.emoji(codes!)])
    return entries
  }

  /** The character(s) for Twemoji-style code points `codes` (`1f1fa-1f1f8`), U+FE0F restored where needed. */
  emoji(codes: string): string {
    const points = codes.split("-").map((hex) => parseInt(hex, 16))
    const keycap = points.indexOf(EmojiGenerator.KEYCAP)
    if (keycap > 0 && points[keycap - 1] !== EmojiGenerator.VS16) points.splice(keycap, 0, EmojiGenerator.VS16)
    else if (points.length === 1 && this.textDefault(points[0]!)) points.push(EmojiGenerator.VS16)
    return String.fromCodePoint(...points)
  }

  /** Does single code point `point` show as text without U+FE0F? */
  textDefault(point: number): boolean {
    if (point < 0x1f000) return true
    return EmojiGenerator.TEXT_DEFAULT.some(([from, to]) => point >= from && point <= to)
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
      writeFileSync(path.join(EmojiGenerator.OUT, `${key}.json`), `${JSON.stringify(map)}\n`)
    }
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
