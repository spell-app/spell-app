import { MD, type InlineNode } from "$/markdown"

/** Where an extended autolink may start:  line start, after whitespace or `*` `_` `~` `(`. */
const BOUNDARY = /[\s*_~(]/
/** `www.` / `http(s)://` + domain + path, or an email address -- GFM 6.9. */
const CANDIDATE = /(?:(?:https?:\/\/|ftp:\/\/|www\.)[^\s<]*|[a-zA-Z0-9._+-]+@[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)+)/g
/** A valid domain:  segments of letters, digits, `_`, `-`;  no `_` in the last two. */
const DOMAIN = /^[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*/

/**
 * GFM's autolinks extension:  bare `www.x.com`, `https://x.com/path` and `a@b.com` in text become links.
 * - Not inside links or code;  trailing punctuation (`?!.,:*_~`), an unbalanced `)` and a trailing entity-like
 *   `&x;` stay outside the link.
 * - SIDE EFFECT:  splits `root`'s text nodes.
 */
export function autolinkText(root: InlineNode) {
  for (const child of root.children()) {
    if (child.kind === "text") linkify(child)
    else if (child.kind !== "link" && child.kind !== "image" && child.kind !== "code" && child.first)
      autolinkText(child)
  }
}

/** Split `node` around the autolinks in its text. */
function linkify(node: InlineNode) {
  const text = node.text
  let last = 0
  let anchor = node
  const pieces: InlineNode[] = []
  for (const found of text.matchAll(CANDIDATE)) {
    const start = found.index!
    if (start > 0 && !BOUNDARY.test(text[start - 1]!)) continue
    // an email ending in `-` or `_` isn't one (a trailing `.` just stays outside)
    if (!/^(?:https?|ftp):|^www\./.test(found[0]) && /[-_]$/.test(found[0])) continue
    const url = trimTrail(found[0])
    const target = linkTarget(url)
    if (!target) continue
    pieces.push(new MD.InlineNode("text", text.slice(last, start)))
    const link = new MD.InlineNode("link")
    link.destination = MD.normalizeURI(target)
    link.title = ""
    link.append(new MD.InlineNode("text", url))
    pieces.push(link)
    last = start + url.length
  }
  if (!pieces.length) return
  pieces.push(new MD.InlineNode("text", text.slice(last)))
  for (const piece of pieces) {
    if (piece.kind === "text" && !piece.text) continue
    anchor.insertAfter(piece)
    anchor = piece
  }
  node.unlink()
}

/** Where `url` links to, or `undefined` if it isn't a valid autolink. */
function linkTarget(url: string) {
  if (url.includes("@") && !/^(?:https?:\/\/|ftp:\/\/|www\.)/.test(url)) {
    if (/[-_]$/.test(url)) return undefined
    return `mailto:${url}`
  }
  const host = url.replace(/^(?:https?|ftp):\/\//, "")
  const domain = DOMAIN.exec(host)?.[0] ?? ""
  const segments = domain.split(".")
  if (segments.length < 2 && !/^(?:https?|ftp):/.test(url)) return undefined
  if (segments.slice(-2).some((segment) => segment.includes("_"))) return undefined
  if (!domain) return undefined
  return url.startsWith("www.") ? `http://${url}` : url
}

/** `url` without the trailing characters GFM leaves outside the link. */
function trimTrail(url: string) {
  for (;;) {
    const entity = /&[a-zA-Z0-9]+;$/.exec(url)
    if (entity) {
      url = url.slice(0, entity.index)
      continue
    }
    if (/[?!.,:*_~]$/.test(url)) {
      url = url.slice(0, -1)
      continue
    }
    if (url.endsWith(")")) {
      const open = (url.match(/\(/g) ?? []).length
      const close = (url.match(/\)/g) ?? []).length
      if (close > open) {
        url = url.slice(0, -1)
        continue
      }
    }
    return url
  }
}
