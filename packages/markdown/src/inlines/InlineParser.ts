import { MD, type RefMap } from "$/markdown"

import { InlineNode } from "./InlineNode"
// read at module evaluation, for the patterns below
import { ENTITY, ESCAPABLE as ESCAPABLE_CHAR } from "./inlines.types"

/** Backslash-escapable character, alone. */
const ESCAPABLE = new RegExp(`^${ESCAPABLE_CHAR}`)
/** An entity at the start. */
const ENTITY_HERE = new RegExp(`^${ENTITY}`, "i")
/** A run of ordinary text:  stops at every character that might start something. */
const MAIN = /^[^\n`[\]\\!<&*_~]+/m
/** `<foo@bar.com>`. */
const EMAIL_AUTOLINK =
  /^<([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/
/** `<scheme:anything>`:  no spaces or control characters inside (spec 6.5). */
// oxlint-disable-next-line no-control-regex -- the spec excludes control characters by code
const AUTOLINK = /^<[A-Za-z][A-Za-z0-9.+-]{1,31}:[^<>\x00-\x20]*>/
/** A `<...>` link destination:  no NUL inside. */
// oxlint-disable-next-line no-control-regex -- the spec excludes NUL by code
const DESTINATION_BRACES = /^<(?:[^<>\n\\\x00]|\\.)*>/
/** A link title:  `"..."`, `'...'` or `(...)`. */
const ESCAPED_CHAR = `\\\\${ESCAPABLE_CHAR}`
const LINK_TITLE = new RegExp(
  `^(?:"(${ESCAPED_CHAR}|[^"\\x00])*"|'(${ESCAPED_CHAR}|[^'\\x00])*'|\\((${ESCAPED_CHAR}|[^()\\x00])*\\))`
)
/** A link label:  `[...]`, no unescaped brackets, at most 999 characters inside. */
const LINK_LABEL = /^\[(?:[^\\[\]]|\\.){0,1000}\]/s
/** Spaces, then at most one line end and its leading spaces. */
const SPNL = /^ *(?:\n *)?/
/** Only spaces to the end of the line. */
const SPACE_AT_END_OF_LINE = /^ *(?:\n|$)/
/** Spaces / tabs / line ends:  a link destination ends at one. */
// oxlint-disable-next-line no-control-regex -- the spec's whitespace includes VT and FF
const WHITESPACE_CHAR = /^[ \t\n\x0b\x0c\x0d]/

/**
 * Inline text => an `MD.InlineNode` tree:  CommonMark's second phase (spec 6), plus GFM strikethrough.
 * - A port of commonmark.js 0.29's `inlines.js`:  one pass over the characters, a DELIMITER stack for `*` / `_` /
 *   `~` runs (paired up afterwards by `processEmphasis()`) and a BRACKET stack for `[` / `![` (closed by `]`).
 * - Hand-written, not rulex:  emphasis pairing (flanking runs, the rule of 3), "a code span ends at a backtick run
 *   of the SAME length", link-text brackets that must balance, and which construct wins where they overlap are
 *   character-level rules with precedence, not a grammar -- see the plan doc's judgement J4.
 * - Also reads link reference definitions (`parseReference()`), for `MD.extractReferences()`.
 */
export class InlineParser {
  /** The text being parsed. */
  subject = ""
  /** Where we are in it. */
  pos = 0
  /** Link references, by normalized label. */
  refmap: RefMap = {}
  /** Top of the delimiter stack. */
  delimiters?: Delimiter
  /** Top of the bracket stack. */
  brackets?: Bracket

  /** Parse `text`'s inlines, links resolved against `refmap`. */
  static parse(text: string, refmap: RefMap = {}): InlineNode {
    return new InlineParser().parse(text, refmap)
  }

  /** Parse `text` into a `root` node's children. */
  parse(text: string, refmap: RefMap): InlineNode {
    const root = new InlineNode("root")
    this.subject = text.trim()
    this.pos = 0
    this.refmap = refmap
    this.delimiters = undefined
    this.brackets = undefined
    while (this.parseInline(root));
    this.processEmphasis(undefined)
    mergeText(root)
    // positions are into the trimmed text:  move them back onto `text`
    const lead = text.length - text.trimStart().length
    if (lead) shiftPositions(root, lead)
    return root
  }

  /** One inline at `pos`, appended to `block`;  `false` at the end. */
  parseInline(block: InlineNode): boolean {
    const char = this.peek()
    if (char === "") return false
    const start = this.pos
    const before = block.last
    let handled = false
    switch (char) {
      case "\n":
        handled = this.parseNewline(block)
        break
      case "\\":
        handled = this.parseBackslash(block)
        break
      case "`":
        handled = this.parseBackticks(block)
        break
      case "*":
      case "_":
      case "~":
        handled = this.handleDelim(char, block)
        break
      case "[":
        handled = this.parseOpenBracket(block)
        break
      case "!":
        handled = this.parseBang(block)
        break
      case "]":
        handled = this.parseCloseBracket(block)
        break
      case "<":
        handled = this.parseAutolink(block) || this.parseHtmlTag(block)
        break
      case "&":
        handled = this.parseEntity(block)
        break
      default:
        handled = this.parseString(block)
    }
    if (!handled) {
      this.pos++
      block.append(text(char))
    }
    // the node this step added spans what it read (a link sets its own, from its `[`)
    const added = block.last
    if (added && added !== before) {
      added.start ??= start
      added.end ??= this.pos
    }
    return true
  }

  ////////////////
  // ## Scanning
  ////////////////

  /** The character at `pos`, or `""`. */
  peek() {
    return this.subject.charAt(this.pos)
  }

  /** Match `regex` at `pos`:  the match, and `pos` moves past it;  else `undefined`. */
  match(regex: RegExp): string | undefined {
    const found = regex.exec(this.subject.slice(this.pos))
    if (!found) return undefined
    this.pos += found.index + found[0].length
    return found[0]
  }

  /** Skip spaces and at most one line end. */
  spnl() {
    this.match(SPNL)
    return true
  }

  ////////////////
  // ## Simple inlines
  ////////////////

  /** A line end:  a hard break after 2+ spaces, else soft;  the spaces around it go. */
  parseNewline(block: InlineNode) {
    this.pos++
    const last = block.last
    if (last?.kind === "text" && last.text.endsWith(" ")) {
      const hard = last.text.endsWith("  ")
      last.text = last.text.replace(/ +$/, "")
      block.append(new InlineNode(hard ? "linebreak" : "softbreak"))
    } else block.append(new InlineNode("softbreak"))
    this.match(/^ */)
    return true
  }

  /** `\*` => `*`;  `\` at a line end => a hard break;  else a plain backslash. */
  parseBackslash(block: InlineNode) {
    this.pos++
    const char = this.peek()
    if (char === "\n") {
      this.pos++
      block.append(new InlineNode("linebreak"))
    } else if (ESCAPABLE.test(char)) {
      this.pos++
      block.append(text(char))
    } else block.append(text("\\"))
    return true
  }

  /** A code span:  a backtick run, up to a run of the SAME length;  else the run is text. */
  parseBackticks(block: InlineNode) {
    const ticks = this.match(/^`+/)!
    const afterOpen = this.pos
    for (let found: string | undefined; (found = this.match(/`+/)) !== undefined;) {
      if (found === ticks) {
        let content = this.subject.slice(afterOpen, this.pos - ticks.length).replace(/\n/g, " ")
        if (content.length > 2 && content[0] === " " && content.at(-1) === " " && /[^ ]/.test(content)) {
          content = content.slice(1, -1)
        }
        block.append(new InlineNode("code", content))
        return true
      }
    }
    this.pos = afterOpen
    block.append(text(ticks))
    return true
  }

  /** `&amp;` => `&`;  an unknown one stays text. */
  parseEntity(block: InlineNode) {
    const entity = this.match(ENTITY_HERE)
    if (entity === undefined) return false
    block.append(text(MD.decodeEntity(entity)))
    return true
  }

  /** A run of ordinary text. */
  parseString(block: InlineNode) {
    const run = this.match(MAIN)
    if (run === undefined) return false
    block.append(text(run))
    return true
  }

  /** `<https://x>` / `<a@b.c>`. */
  parseAutolink(block: InlineNode) {
    const email = this.match(EMAIL_AUTOLINK)
    if (email !== undefined) {
      const address = email.slice(1, -1)
      block.append(link(`mailto:${MD.normalizeURI(address)}`, address))
      return true
    }
    const uri = this.match(AUTOLINK)
    if (uri !== undefined) {
      const target = uri.slice(1, -1)
      block.append(link(MD.normalizeURI(target), target))
      return true
    }
    return false
  }

  /** Raw inline HTML. */
  parseHtmlTag(block: InlineNode) {
    const html = this.match(MD.HTML_TAG)
    if (html === undefined) return false
    block.append(new InlineNode("html", html))
    return true
  }

  ////////////////
  // ## Emphasis
  ////////////////

  /**
   * A run of `char` (`*`, `_`, `~`):  how long, and can it open / close emphasis (spec 6.4 "left- / right-flanking").
   * - `_` inside a word can't open or close;  GFM `~` flanks as `*` does.
   */
  scanDelims(char: string) {
    const start = this.pos
    while (this.peek() === char) this.pos++
    const count = this.pos - start
    const before = start === 0 ? "\n" : this.charBefore(start)
    const after = this.pos >= this.subject.length ? "\n" : this.charAt(this.pos)
    this.pos = start

    const afterWhitespace = MD.isUnicodeWhitespace(after)
    const afterPunctuation = MD.isPunctuation(after)
    const beforeWhitespace = MD.isUnicodeWhitespace(before)
    const beforePunctuation = MD.isPunctuation(before)
    const leftFlanking = !afterWhitespace && (!afterPunctuation || beforeWhitespace || beforePunctuation)
    const rightFlanking = !beforeWhitespace && (!beforePunctuation || afterWhitespace || afterPunctuation)
    if (char === "_") {
      return {
        count,
        canOpen: leftFlanking && (!rightFlanking || beforePunctuation),
        canClose: rightFlanking && (!leftFlanking || afterPunctuation)
      }
    }
    return { count, canOpen: leftFlanking, canClose: rightFlanking }
  }

  /** A delimiter run:  text for now, and a delimiter on the stack for `processEmphasis()` to pair. */
  handleDelim(char: string, block: InlineNode) {
    const { count, canOpen, canClose } = this.scanDelims(char)
    const start = this.pos
    this.pos += count
    const node = block.append(text(this.subject.slice(start, this.pos)))
    if (canOpen || canClose) {
      this.delimiters = {
        char,
        count,
        originalCount: count,
        node,
        previous: this.delimiters,
        canOpen,
        canClose
      }
      if (this.delimiters.previous) this.delimiters.previous.next = this.delimiters
    }
    return true
  }

  /** Take `delimiter` off the stack. */
  removeDelimiter(delimiter: Delimiter) {
    if (delimiter.previous) delimiter.previous.next = delimiter.next
    if (delimiter.next) delimiter.next.previous = delimiter.previous
    else this.delimiters = delimiter.previous
  }

  /**
   * Pair openers with closers above `stackBottom`, wrapping what's between in `emph` / `strong` / `del`
   * (commonmark.js 0.29, plus GFM `~`:  one or two tildes, opener and closer the same length).
   */
  processEmphasis(stackBottom: Delimiter | undefined) {
    const openersBottom: Record<string, Delimiter | undefined> = { "*": stackBottom, _: stackBottom, "~": stackBottom }
    let closer = this.delimiters
    while (closer && closer.previous !== stackBottom) closer = closer.previous
    while (closer) {
      if (!closer.canClose) {
        closer = closer.next
        continue
      }
      let opener = closer.previous
      let found = false
      let oddMatch = false
      while (opener && opener !== stackBottom && opener !== openersBottom[closer.char]) {
        oddMatch =
          (closer.canOpen || opener.canClose) &&
          closer.originalCount % 3 !== 0 &&
          (opener.originalCount + closer.originalCount) % 3 === 0
        const tildesMatch = closer.char !== "~" || (opener.count === closer.count && closer.count <= 2)
        if (opener.char === closer.char && opener.canOpen && !oddMatch && tildesMatch) {
          found = true
          break
        }
        opener = opener.previous
      }
      const oldCloser = closer
      if (found && opener) {
        const used = closer.char === "~" ? closer.count : closer.count >= 2 && opener.count >= 2 ? 2 : 1
        const kind = closer.char === "~" ? "del" : used === 1 ? "emph" : "strong"
        opener.count -= used
        closer.count -= used
        opener.node.text = opener.node.text.slice(0, opener.node.text.length - used)
        closer.node.text = closer.node.text.slice(0, closer.node.text.length - used)
        const emph = new InlineNode(kind)
        // it spans its own delimiters:  the opener's last `used`, the closer's first `used`
        if (opener.node.start !== undefined && closer.node.start !== undefined) {
          emph.start = opener.node.start + opener.node.text.length
          emph.end = closer.node.start + used
          opener.node.end = emph.start
          closer.node.start += used
        }
        for (let node = opener.node.next; node && node !== closer.node;) {
          const next = node.next
          emph.append(node)
          node = next
        }
        opener.node.insertAfter(emph)
        // delimiters between them are spent
        for (let between = closer.previous; between && between !== opener; between = between.previous) {
          this.removeDelimiter(between)
        }
        if (opener.count === 0) {
          opener.node.unlink()
          this.removeDelimiter(opener)
        }
        if (closer.count === 0) {
          closer.node.unlink()
          const next = closer.next
          this.removeDelimiter(closer)
          closer = next
        }
      } else {
        closer = closer.next
        if (!oddMatch) {
          // no opener for this closer:  later closers of its kind needn't look below it
          openersBottom[oldCloser.char] = oldCloser.previous
          if (!oldCloser.canOpen) this.removeDelimiter(oldCloser)
        }
      }
    }
    while (this.delimiters && this.delimiters !== stackBottom) this.removeDelimiter(this.delimiters)
  }

  ////////////////
  // ## Links
  ////////////////

  /** `[`:  text for now, and a bracket on the stack. */
  parseOpenBracket(block: InlineNode) {
    const start = this.pos
    this.pos++
    this.addBracket(block.append(text("[")), start, false)
    return true
  }

  /** `![`:  an image's opener;  a lone `!` is text. */
  parseBang(block: InlineNode) {
    const start = this.pos
    this.pos++
    if (this.peek() !== "[") {
      block.append(text("!"))
      return true
    }
    this.pos++
    this.addBracket(block.append(text("![")), start + 1, true)
    return true
  }

  /** Push a bracket opener. */
  addBracket(node: InlineNode, index: number, image: boolean) {
    if (this.brackets) this.brackets.bracketAfter = true
    this.brackets = {
      node,
      previous: this.brackets,
      previousDelimiter: this.delimiters,
      index,
      image,
      active: true,
      bracketAfter: false
    }
  }

  /**
   * `]`:  closes the nearest `[` into a link / image if a destination follows -- inline `(url "title")`, or a
   * reference `[label]`, `[]` or none (shortcut).  Else it's text.
   * - A link can't hold a link:  making one deactivates the `[` openers before it.
   */
  parseCloseBracket(block: InlineNode) {
    const start = this.pos
    this.pos++
    const opener = this.brackets
    if (!opener) {
      block.append(text("]"))
      return true
    }
    if (!opener.active) {
      block.append(text("]"))
      this.brackets = opener.previous
      return true
    }

    let destination: string | undefined
    let title: string | undefined
    let matched = false
    const afterBracket = this.pos
    if (this.peek() === "(") {
      this.pos++
      if (this.spnl()) {
        destination = this.parseLinkDestination()
        if (destination !== undefined && this.spnl()) {
          if (WHITESPACE_CHAR.test(this.subject.charAt(this.pos - 1))) title = this.parseLinkTitle()
          if (this.spnl() && this.peek() === ")") {
            this.pos++
            matched = true
          }
        }
      }
      if (!matched) this.pos = afterBracket
    }
    if (!matched) {
      const beforeLabel = this.pos
      const labelLength = this.parseLinkLabel()
      let refLabel: string | undefined
      if (labelLength > 2) refLabel = this.subject.slice(beforeLabel, beforeLabel + labelLength)
      else if (!opener.bracketAfter) refLabel = this.subject.slice(opener.index, start + 1)
      if (labelLength === 0) this.pos = afterBracket
      const reference = refLabel ? this.refmap[MD.normalizeReference(refLabel)] : undefined
      if (reference) {
        destination = reference.destination
        title = reference.title
        matched = true
      }
    }

    if (!matched) {
      this.brackets = opener.previous
      this.pos = start + 1
      block.append(text("]"))
      return true
    }
    const node = new InlineNode(opener.image ? "image" : "link")
    node.destination = destination
    node.title = title ?? ""
    node.start = opener.image ? opener.index - 1 : opener.index
    for (let child = opener.node.next; child;) {
      const next = child.next
      node.append(child)
      child = next
    }
    block.append(node)
    this.processEmphasis(opener.previousDelimiter)
    this.brackets = opener.previous
    opener.node.unlink()
    if (!opener.image) {
      for (let earlier = this.brackets; earlier; earlier = earlier.previous) if (!earlier.image) earlier.active = false
    }
    return true
  }

  /** A link destination:  `<...>`, or a run with balanced parentheses;  normalized. */
  parseLinkDestination(): string | undefined {
    const braced = this.match(DESTINATION_BRACES)
    if (braced !== undefined) return MD.normalizeURI(MD.unescapeString(braced.slice(1, -1)))
    if (this.peek() === "<") return undefined
    const start = this.pos
    let parens = 0
    let char = ""
    while ((char = this.peek()) !== "") {
      if (char === "\\" && ESCAPABLE.test(this.subject.charAt(this.pos + 1))) {
        this.pos += 2
      } else if (char === "(") {
        this.pos++
        parens++
      } else if (char === ")") {
        if (parens < 1) break
        this.pos++
        parens--
      } else if (WHITESPACE_CHAR.test(char)) break
      else this.pos++
    }
    if (this.pos === start && char !== ")") return undefined
    if (parens !== 0) return undefined
    return MD.normalizeURI(MD.unescapeString(this.subject.slice(start, this.pos)))
  }

  /** A link title, unescaped;  `undefined` if none here. */
  parseLinkTitle(): string | undefined {
    const title = this.match(LINK_TITLE)
    return title === undefined ? undefined : MD.unescapeString(title.slice(1, -1))
  }

  /** A link label's length at `pos` (brackets included), or 0. */
  parseLinkLabel() {
    const label = this.match(LINK_LABEL)
    if (label === undefined || label.length > 1001) return 0
    return label.length
  }

  /**
   * A link reference definition at the start of `text` (`[label]: destination "title"`):  added to `refmap` (the
   * first one of a label wins), and its length returned;  0 if there isn't one.
   */
  parseReference(text: string, refmap: RefMap): number {
    this.subject = text
    this.pos = 0
    const labelLength = this.parseLinkLabel()
    if (labelLength === 0) return 0
    const rawLabel = this.subject.slice(0, labelLength)
    if (this.peek() !== ":") return 0
    this.pos++
    this.spnl()
    const destination = this.parseLinkDestination()
    if (destination === undefined) return 0
    const beforeTitle = this.pos
    this.spnl()
    let title: string | undefined
    if (this.pos !== beforeTitle) title = this.parseLinkTitle()
    if (title === undefined) {
      title = ""
      this.pos = beforeTitle
    }
    let atLineEnd = this.match(SPACE_AT_END_OF_LINE) !== undefined
    if (!atLineEnd && title !== "") {
      // a title not at the line end:  the definition may still stand without it
      title = ""
      this.pos = beforeTitle
      atLineEnd = this.match(SPACE_AT_END_OF_LINE) !== undefined
    }
    if (!atLineEnd) return 0
    const label = MD.normalizeReference(rawLabel)
    if (label === "") return 0
    refmap[label] ??= { destination, title }
    return this.pos
  }

  ////////////////
  // ## Characters
  ////////////////

  /** The character (code point) at `offset`. */
  charAt(offset: number) {
    return String.fromCodePoint(this.subject.codePointAt(offset)!)
  }

  /** The character (code point) just before `offset`. */
  charBefore(offset: number) {
    const low = this.subject.charCodeAt(offset - 1)
    if (low >= 0xdc00 && low <= 0xdfff && offset >= 2) return this.subject.slice(offset - 2, offset)
    return this.subject.charAt(offset - 1)
  }
}

/** A delimiter run on the stack:  `*`, `_` or `~`, how many are left, and whether it can open / close. */
type Delimiter = {
  char: string
  count: number
  originalCount: number
  node: InlineNode
  previous?: Delimiter
  next?: Delimiter
  canOpen: boolean
  canClose: boolean
}

/** A `[` / `![` on the bracket stack. */
type Bracket = {
  node: InlineNode
  previous?: Bracket
  previousDelimiter?: Delimiter
  /** Offset of the `[`. */
  index: number
  image: boolean
  /** `false` once a link closed after it:  links can't nest. */
  active: boolean
  /** Has another `[` opened after it?  Then it can't be a shortcut reference. */
  bracketAfter: boolean
}

/** A text node. */
function text(value: string) {
  return new InlineNode("text", value)
}

/** A link to `destination` whose text is `label`. */
function link(destination: string, label: string) {
  const node = new InlineNode("link")
  node.destination = destination
  node.title = ""
  node.append(text(label))
  return node
}

/** Join adjacent text nodes, everywhere under `node`;  drop empty ones. */
function mergeText(node: InlineNode) {
  for (let child = node.first; child;) {
    const next = child.next
    if (child.kind === "text") {
      if (!child.text) child.unlink()
      else if (next?.kind === "text") {
        next.text = child.text + next.text
        next.start = child.start
        child.unlink()
      }
    } else if (child.first) mergeText(child)
    child = next
  }
}

/** Move every position under `node` on by `offset`. */
function shiftPositions(node: InlineNode, offset: number) {
  for (const child of node.children()) {
    if (child.start !== undefined) child.start += offset
    if (child.end !== undefined) child.end += offset
    shiftPositions(child, offset)
  }
}
