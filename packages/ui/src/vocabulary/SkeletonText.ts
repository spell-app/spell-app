import type { SkeletonPart, SkeletonSpec } from "./vocabulary.types"

/****************
 * ### `SkeletonText`
 * A skeleton (`SkeletonSpec`) written as one line of text:  how vocabularies (`ComponentVocabulary.skeleton`) and
 * component packs (`<ui-components>`) say what `<ui-root display="skeleton">` draws for a tag.  Sizes are in `em`.
 *
 * ```
 * skeleton  := ["inline"] size | ["inline"] [size ":"] parts
 * size      := <w> "x" <h> | <h> "tall" | <w> "wide"
 * parts     := part ("," part)*                                  -- top to bottom
 * part      := "paragraph" | <n> "line paragraph" | "header" | "header with image"
 *            | "image" | "square image" | "rectangular image" | "line" | <length> "line"
 * length    := "full" | "very long" | "long" | "medium" | "short" | "very short"
 * ```
 *
 * - `18 x 15` ~== `{ width: "18em", height: "15em" }`;  `inline 6 x 2.5` adds `display: "inline"`;  `2 tall` ~==
 *   `{ height: "2em" }`;  `18 wide: square image, header, 3 line paragraph` ~== a width over parts
 * - No `none`:  a tag with no skeleton of its own leaves the key OUT, in a vocabulary and in a pack alike (a pack's
 *   entry without one still wins over the catalog's:  `RootLoader.skeletonFor()`).  Epic `wwod-spell-ui`, J26.
 * - ONE parser for both writers:  `yarn gen:root` parses the vocabularies into `<ui-root>`'s catalog, a pack is
 *   parsed as it's read, and `test/vocabularies.test.ts` parses every vocabulary, so a typo fails a test, not a page.
 * - Pure data, at the bottom of `$/ui/vocabulary` (types only):  node imports it (`yarn gen:root`,
 *   `yarn site:bundle`).  NOT in the folder's barrel:  `core` re-exports that barrel, and only `<ui-components>`
 *   parses at runtime, so it'd cost every page bytes for nothing.  Reached by path.
 * - Static:  pure text work, no state.
 ****************/
export class SkeletonText {
  /**
   * The skeleton `text` describes.
   * - Spaces around words, `x`, `:` and `,` are free;  words are lowercase.
   * - Throws a `TypeError` naming the text when it isn't skeleton text.
   */
  static parse(text: string): SkeletonSpec {
    const trimmed = text.trim()
    const inline = INLINE.exec(trimmed)
    const body = inline ? trimmed.slice(inline[0].length) : trimmed
    const colon = body.indexOf(SIZE_END)
    const head = colon === -1 ? body : body.slice(0, colon).trim()
    const size = SkeletonText.size(head)
    if (colon !== -1 && !size) throw SkeletonText.unreadable(text)
    const partsText = colon === -1 ? (size ? "" : body) : body.slice(colon + 1)
    const parts = partsText.trim() ? partsText.split(PART_SEPARATOR).map((part) => SkeletonText.part(part, text)) : []
    if (!size && !parts.length) throw SkeletonText.unreadable(text)
    // key order as the catalog has always written them:  display, width, height, parts
    return {
      ...(inline ? { display: INLINE_DISPLAY } : {}),
      ...size,
      ...(parts.length ? { parts } : {})
    }
  }

  /**
   * `spec` as skeleton text:  `parse(format(spec))` gives `spec` back.
   * - Throws a `TypeError` for what the text can't say:  a size not in `em`, or nothing to draw.
   */
  static format(spec: SkeletonSpec): string {
    const width = SkeletonText.emOrDie(spec.width, "width")
    const height = SkeletonText.emOrDie(spec.height, "height")
    const size =
      width && height ? `${width} x ${height}` : height ? `${height} tall` : width ? `${width} wide` : undefined
    const parts = spec.parts?.length ? spec.parts.map((part) => SkeletonText.partText(part)).join(", ") : undefined
    const body = size && parts ? `${size}: ${parts}` : (size ?? parts)
    if (!body) {
      throw new TypeError(`SkeletonText.format():  ${JSON.stringify(spec)} draws nothing;  give it a size or parts`)
    }
    return spec.display === INLINE_DISPLAY ? `inline ${body}` : body
  }

  ////////////////
  // ## Internal
  ////////////////

  /** `head` as a size (`18 x 15`, `2 tall`, `18 wide`), in `em`;  `undefined` when it isn't one. */
  private static size(head: string): Pick<SkeletonSpec, "width" | "height"> | undefined {
    const box = BOX.exec(head)
    if (box) return { width: `${box[1]}em`, height: `${box[2]}em` }
    const tall = TALL.exec(head)
    if (tall) return { height: `${tall[1]}em` }
    const wide = WIDE.exec(head)
    if (wide) return { width: `${wide[1]}em` }
    return undefined
  }

  /** One part's text as its shape;  throws naming it (and `text`, the whole skeleton) when it isn't one. */
  private static part(part: string, text: string): SkeletonPart {
    const words = part.trim().replace(SPACES, " ")
    const paragraph = PARAGRAPH.exec(words)
    if (paragraph) return paragraph[1] ? { shape: "paragraph", lines: Number(paragraph[1]) } : { shape: "paragraph" }
    if (words === "header") return { shape: "header" }
    if (words === "header with image") return { shape: "header", image: true }
    const image = IMAGE.exec(words)
    if (image) return image[1] ? { shape: "image", ratio: image[1] as ImageRatio } : { shape: "image" }
    const line = LINE.exec(words)
    if (line && (!line[1] || LINE_LENGTHS.includes(line[1] as LineLength))) {
      return line[1] ? { shape: "line", length: line[1] as LineLength } : { shape: "line" }
    }
    // the whole text is this one part:  say what a skeleton can be, not only a part
    if (part.trim() === text.trim()) throw SkeletonText.unreadable(text)
    throw new TypeError(
      `SkeletonText.parse():  "${part.trim()}" in "${text}" isn't a part;  write one of:  paragraph, ` +
        `<n> line paragraph, header, header with image, image, square image, rectangular image, line, ` +
        `<length> line (${LINE_LENGTHS.join(", ")})`
    )
  }

  /** `part` as text. */
  private static partText(part: SkeletonPart): string {
    switch (part.shape) {
      case "paragraph":
        return part.lines === undefined ? "paragraph" : `${part.lines} line paragraph`
      case "header":
        return part.image ? "header with image" : "header"
      case "image":
        return part.ratio ? `${part.ratio} image` : "image"
      case "line":
        return part.length ? `${part.length} line` : "line"
    }
  }

  /** `length`'s number (`"18em"` => `"18"`);  `undefined` for none;  throws when it isn't in `em`. */
  private static emOrDie(length: string | undefined, name: string): string | undefined {
    if (length === undefined) return undefined
    const match = EM.exec(length)
    if (!match) {
      throw new TypeError(`SkeletonText.format():  ${name} "${length}" isn't in em;  write it as e.g. "18em"`)
    }
    return match[1]
  }

  /** The error for `text` as a whole. */
  private static unreadable(text: string): TypeError {
    return new TypeError(
      `SkeletonText.parse():  can't read "${text}";  write e.g. "18 x 15", "inline 6 x 2.5", "2 tall", ` +
        `"18 wide: square image, header, 3 line paragraph" or "header, 4 line paragraph"`
    )
  }
}

/** `<ui-placeholder-image>`'s ratios. */
type ImageRatio = Extract<SkeletonPart, { shape: "image" }>["ratio"]

/** `<ui-placeholder-line>`'s lengths. */
type LineLength = NonNullable<Extract<SkeletonPart, { shape: "line" }>["length"]>

/** `display` of an inline skeleton. */
const INLINE_DISPLAY = "inline"

/** The leading `inline`. */
const INLINE = /^inline(?:\s+|$)/

/** Ends a size that parts follow:  `18 wide: header`. */
const SIZE_END = ":"

/** Between parts. */
const PART_SEPARATOR = ","

/** Runs of spaces inside a part. */
const SPACES = /\s+/g

/** A size in `em`, without the unit. */
const NUMBER = String.raw`(\d+(?:\.\d+)?)`

/** `18 x 15`. */
const BOX = new RegExp(String.raw`^${NUMBER}\s*x\s*${NUMBER}$`)

/** `2 tall`. */
const TALL = new RegExp(String.raw`^${NUMBER}\s+tall$`)

/** `18 wide`. */
const WIDE = new RegExp(String.raw`^${NUMBER}\s+wide$`)

/** `paragraph`, `3 line paragraph`. */
const PARAGRAPH = /^(?:([1-9]\d*) line )?paragraph$/

/** `image`, `square image`, `rectangular image`. */
const IMAGE = /^(?:(square|rectangular) )?image$/

/** `line`, `<length> line`. */
const LINE = /^(?:(.+) )?line$/

/** `<ui-placeholder-line length>`'s values, as `SkeletonPart`'s `line` takes them. */
const LINE_LENGTHS: readonly LineLength[] = ["full", "very long", "long", "medium", "short", "very short"]

/** A length in `em`:  its number. */
const EM = /^(\d+(?:\.\d+)?)em$/
