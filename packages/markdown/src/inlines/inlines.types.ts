import { decodeHTMLStrict } from "entities"

// Import directly to avoid circular import:  read at module evaluation, for `HTML_TAG`
import { CLOSETAG, OPENTAG } from "$/markdown/blocks/blocks.types"

// ## References

/** A link reference definition's target:  `[label]: destination "title"`. */
export type LinkReference = { destination: string; title: string }

/** Link references by normalized label (`normalizeReference()`):  the first definition of a label wins. */
export type RefMap = Record<string, LinkReference>

/**
 * A link label as references are looked up:  brackets off, inner whitespace collapsed, case folded.
 * - `[Foo  Bar]` and `[foo bar]` are the same reference.
 */
export function normalizeReference(label: string) {
  return label
    .slice(1, -1)
    .trim()
    .replace(/[ \t\r\n]+/g, " ")
    .toLowerCase()
    .toUpperCase()
}

// ## Characters

/** ASCII punctuation:  what a backslash can escape. */
export const ESCAPABLE = "[!\"#$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]"
/** An entity or numeric character reference:  `&amp;`, `&#35;`, `&#x22;`. */
export const ENTITY = "&(?:#x[a-f0-9]{1,6}|#[0-9]{1,7}|[a-z][a-z0-9]{1,31});"

/** A backslash-escaped character or an entity, anywhere. */
const ENTITY_OR_ESCAPED_CHAR = new RegExp(`\\\\${ESCAPABLE}|${ENTITY}`, "gi")

/** `text` with backslash escapes and entities resolved:  `\*` => `*`, `&amp;` => `&`. */
export function unescapeString(text: string) {
  return text.replace(ENTITY_OR_ESCAPED_CHAR, (match) => (match[0] === "\\" ? match.slice(1) : decodeHTMLStrict(match)))
}

/** Decode one entity / numeric reference;  an unknown one stays as it is. */
export function decodeEntity(entity: string) {
  return decodeHTMLStrict(entity)
}

/** Unicode punctuation, as emphasis flanking counts it:  ASCII punctuation plus Unicode `P*`. */
const PUNCTUATION = /^[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~\p{P}]/u

/** Is `char` punctuation? */
export function isPunctuation(char: string) {
  return PUNCTUATION.test(char)
}

/** Is `char` Unicode whitespace (or the edge of the text, `\n`)? */
export function isUnicodeWhitespace(char: string) {
  return /^\s/u.test(char)
}

// ## URLs

/** Characters a normalized URL keeps as they are. */
const URL_SAFE = /[A-Za-z0-9;/?:@&=+$,\-_.!~*'()#]/

/**
 * `url` percent-encoded where it needs to be, as commonmark.js (mdurl) does:  safe characters and existing
 * `%XX` escapes kept, everything else `encodeURIComponent`-ed.
 */
export function normalizeURI(url: string) {
  let result = ""
  for (let i = 0; i < url.length; i++) {
    const char = url[i]!
    if (char === "%" && /^[0-9a-fA-F]{2}$/.test(url.slice(i + 1, i + 3))) {
      result += url.slice(i, i + 3)
      i += 2
    } else if (URL_SAFE.test(char)) result += char
    else {
      // a surrogate pair is ONE character to encode
      const code = url.codePointAt(i)!
      const whole = String.fromCodePoint(code)
      result += encodeURIComponent(whole)
      i += whole.length - 1
    }
  }
  return result
}

// ## Inline HTML

/**
 * An HTML comment, processing instruction, declaration or CDATA section.
 * - Comments as cmark-gfm reads them (CommonMark 0.31's rule, which GFM's spec examples follow):  `<!-->`,
 *   `<!--->`, or `<!--` up to the first `-->`.
 */
const HTMLCOMMENT = "<!-->|<!--->|<!--[\\s\\S]*?-->"
const PROCESSINGINSTRUCTION = "[<][?][\\s\\S]*?[?][>]"
const DECLARATION = "<![A-Z]+\\s+[^>]*>"
const CDATA = "<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"

/** Raw inline HTML at the start of a string:  a tag, comment, PI, declaration or CDATA. */
export const HTML_TAG = new RegExp(
  `^(?:${OPENTAG}|${CLOSETAG}|${HTMLCOMMENT}|${PROCESSINGINSTRUCTION}|${DECLARATION}|${CDATA})`,
  "i"
)

/** GFM's tagfilter:  these tags' `<` is escaped wherever raw HTML is written. */
const FILTERED_TAG = /<(?=\/?(?:title|textarea|style|xmp|iframe|noembed|noframes|script|plaintext)\b)/gi

/** `html` with GFM's disallowed tags defused:  `<script>` => `&lt;script>`. */
export function tagFilter(html: string) {
  return html.replace(FILTERED_TAG, "&lt;")
}
