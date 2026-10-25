/**
 * Where a part of the running app is written in its program:  the Inspector's way back from an element to its
 * spell, while the compiler marks nothing on what it draws.
 * - Plain text work:  no parser, no DOM beyond reading the element.
 * - A best guess:  the tag in the source with the same name, the same words and the most attributes in common.
 *   A list's rows are one tag in the source, so each row finds the same one, as it should.
 */

/**
 * The handlers `element` was written with, by event:  `{ click: "add someone" }` for
 * `<ui-button icon="plus" onClick={add someone}>Add someone</ui-button>`.
 * - `sources`:  the program's spell files' text.
 * - Nothing found:  `{}`.
 */
export function handlersInSource(element: Element, sources: readonly string[]): Record<string, string> {
  const written = writtenTagFor(element, sources)
  if (!written) return {}
  const handlers: Record<string, string> = {}
  for (const [name, code] of written.handlers) handlers[name.slice(2).toLowerCase()] = code
  return handlers
}

/** The tag in `sources` that best matches `element`, if any. */
function writtenTagFor(element: Element, sources: readonly string[]): WrittenTag | undefined {
  const tag = element.localName
  const words = ownText(element)
  const candidates = sources.flatMap((source) => tagsIn(source, tag))
  let best: WrittenTag | undefined
  let bestScore = -Infinity
  for (const candidate of candidates) {
    let score = 0
    if (words && candidate.words === words) score += 4
    else if (words && candidate.words && candidate.words !== words) score -= 4
    for (const [name, value] of candidate.attributes) {
      if (!element.hasAttribute(name)) score -= 1
      else if (element.getAttribute(name) === value || value === "") score += 1
    }
    if (score > bestScore) {
      best = candidate
      bestScore = score
    }
  }
  // one tag of that name is it;  among several, it must match on something
  return candidates.length === 1 || bestScore > 0 ? best : undefined
}

/** A tag as written in spell:  its plain attributes, its handlers (`onClick={...}`) and its own words. */
type WrittenTag = {
  attributes: [name: string, value: string][]
  handlers: [name: string, code: string][]
  words: string
}

/** Every `<tag ...>` in `source`, read. */
function tagsIn(source: string, tag: string): WrittenTag[] {
  const found: WrittenTag[] = []
  const opening = new RegExp(`<${tag}(?=[\\s/>])`, "g")
  let match: RegExpExecArray | null
  while ((match = opening.exec(source))) {
    const end = endOfTag(source, match.index + match[0].length)
    if (end < 0) continue
    const inside = source.slice(match.index + match[0].length, end)
    const isEmpty = inside.trimEnd().endsWith("/")
    const close = isEmpty ? -1 : source.indexOf(`</${tag}>`, end)
    const words =
      close < 0
        ? ""
        : source
            .slice(end + 1, close)
            .replace(/<[^>]*>|\{[^}]*\}/g, " ")
            .replace(/\s+/g, " ")
            .trim()
    found.push({ ...readAttributes(inside), words })
  }
  return found
}

/** The index of the `>` closing a tag opened before `from`, past any `{...}` and quoted values;  -1 if none. */
function endOfTag(source: string, from: number): number {
  let depth = 0
  for (let i = from; i < source.length; i++) {
    const c = source[i]
    if (c === '"' || c === "'") {
      i = source.indexOf(c, i + 1)
      if (i < 0) return -1
    } else if (c === "{") depth++
    else if (c === "}") depth--
    else if (c === ">" && depth === 0) return i
  }
  return -1
}

/** A tag's attributes as written:  `name="value"` and bare `name` plain, `onX={code}` handlers. */
function readAttributes(inside: string): Pick<WrittenTag, "attributes" | "handlers"> {
  const attributes: WrittenTag["attributes"] = []
  const handlers: WrittenTag["handlers"] = []
  const re = /([a-zA-Z][\w-]*)(?:=("[^"]*"|'[^']*'|\{))?/g
  let match: RegExpExecArray | null
  while ((match = re.exec(inside))) {
    const [, name, value] = match
    if (value === "{") {
      // its code:  to the brace that closes it
      let depth = 1
      let i = re.lastIndex
      for (; i < inside.length && depth; i++) {
        if (inside[i] === "{") depth++
        else if (inside[i] === "}") depth--
      }
      const code = inside.slice(re.lastIndex, i - 1).trim()
      if (/^on[A-Z]/.test(name)) handlers.push([name, code])
      re.lastIndex = i
    } else attributes.push([name, value ? value.slice(1, -1) : ""])
  }
  return { attributes, handlers }
}

/** `element`'s own words, its text children's, in one line. */
function ownText(element: Element): string {
  return [...element.childNodes]
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
}
