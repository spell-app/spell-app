import { PlanMarkup } from "./PlanMarkup"

/****************
 * ### `PathTooltips`
 * A name and the file it's in, handed to the plan-doc tool as HTML, made ONE name with the path as its tooltip:
 * `<code title="packages/spell/src/node/buildTsx.ts:40">buildTsx()</code>`
 * (WWOD §6 › "Plain text, plain paths", epic `airplane`).
 * The tool's linker then links the name to the file, so a click still opens it.
 *
 * - What it rewrites, and only when it can't be read another way:
 *   - `<code>name</code> (<code>path</code>)`:  a path alone in brackets after a name
 *   - `<code>name</code>, <code>path</code>`:  a path after a comma, when the name is the file's
 *     (`buildTsx()` and `buildTsx.ts`, `<epic-item>` and `EpicItem.tsx`, `EpicItem` and `epic-item/index.ts`)
 *   - either, with the path as plain text (`<code>name</code>, packages/x/y.ts`),
 *     or as a link (`(<a href><code>path</code></a>)`):  the link moves onto the name
 * - What it leaves:
 *   - a path that's a folder, or a file with no folder or line (`y.ts`)
 *   - a name that's a path itself, has attributes, or is in a link already
 *   - a comma form in a list (`<code>a</code>, <code>b</code>, <code>path</code>`, or more after the path)
 *   - any other wording:  "<code>name</code> in <code>path</code>" says something the tooltip wouldn't
 *   - code (`<pre>`, `<epic-code>`) and an Original Discussion:  history stays as it was written
 * - STATIC:  a pure rewrite, in place.
 ****************/
export class PathTooltips {
  /** Rewrite every name and path under `root` (not `root` itself);  returns what it did, `name <- path` each. */
  static rewrite(root: Element): string[] {
    const done: string[] = []
    for (const code of Array.from(root.querySelectorAll("code"))) {
      const keeper = code.parentElement?.closest(KEEP_OUT)
      if (keeper && root.contains(keeper)) continue
      const name = code.textContent ?? ""
      if (!isPlainName(code)) continue
      const found = pathAfter(code)
      if (!found) continue
      found.apply()
      code.setAttribute("title", found.path)
      done.push(`${name} <- ${found.path}`)
    }
    return done
  }

  /**
   * Is `text` a path to a file:  a file in a folder (`tools/fuss.ts`), or a file and its line (`fuss.ts:12`)?
   * - never a folder, a URL, a route (`/api/...`), an alias (`$/epics`) or a package (`@spell-app/ui`)
   */
  static isFilePath(text: string): boolean {
    const path = text.trim()
    if (!path || /\s|^(?:[a-z]+:\/\/|\/|[$@~#])/i.test(path)) return false
    const line = LINE.exec(path)
    const parts = path.slice(0, line ? line.index : undefined).split("/")
    if (!parts.every((part) => /^[\w.<>*{}-]+$/.test(part) && /[a-z]/i.test(part))) return false
    const isFile = FILE_EXTENSION.test(parts.at(-1)!)
    return isFile && (parts.length > 1 || !!line)
  }
}

/** Where names are never rewritten:  code, and history. */
const KEEP_OUT = "pre, code, epic-code, epic-original"

/** A path's line number, `:40` or `:40-52`. */
const LINE = /:\d+(?:-\d+)?$/

/** A file's extension, as the docs name files. */
const FILE_EXTENSION = /\.(?:ts|tsx|js|mjs|cjs|jsx|mts|cts|md|html|json|css|yml|yaml|sh|txt)$/

/** A bare path in text, from its start:  parts split by `/`, maybe a line number. */
const BARE_PATH = /^[\w.<>*{}-]+(?:\/[\w.<>*{}-]+)*(?::\d+(?:-\d+)?)?/

/** The separator between a name and its path:  a comma, or an opening bracket. */
type Form = "comma" | "brackets"

/** A path found after a name:  the path, and how to take it out of the text. */
type Found = { path: string; apply: () => void }

/** Is `code` a name a path could hang on:  plain text, no attributes, not a path, not in a link? */
function isPlainName(code: Element): boolean {
  const text = code.textContent ?? ""
  return (
    code.attributes.length === 0 &&
    code.childElementCount === 0 &&
    !!text.trim() &&
    !PathTooltips.isFilePath(text) &&
    !text.includes("/") &&
    !code.closest("a")
  )
}

/** The path after `code`, a name, in one of the forms `PathTooltips` reads;  `undefined` for anything else. */
function pathAfter(code: Element): Found | undefined {
  const next = code.nextSibling
  if (next?.nodeType !== 3) return
  const text = next.textContent ?? ""
  const form: Form | undefined = /^,\s*$/.test(text) ? "comma" : /^\s*\(\s*$/.test(text) ? "brackets" : undefined
  if (form) return elementPath(code, next, form)
  return barePath(code, next)
}

/** `, <code>path</code>` or ` (<code>path</code>)`, the path maybe linked:  `separator` the text between. */
function elementPath(code: Element, separator: ChildNode, form: Form): Found | undefined {
  const holder = separator.nextSibling
  if (!PlanMarkup.isElement(holder)) return
  const link = holder.localName === "a" ? holder : undefined
  const pathCode = link ? onlyCode(link) : holder.localName === "code" ? holder : undefined
  if (!pathCode || pathCode.attributes.length || pathCode.childElementCount) return
  const path = (pathCode.textContent ?? "").trim()
  if (!PathTooltips.isFilePath(path)) return
  const after = holder.nextSibling
  if (form === "brackets" && !(after?.nodeType === 3 && /^\s*\)/.test(after.textContent ?? ""))) return
  if (form === "comma" && (inList(code, holder) || !isNameOf(code, path))) return
  return {
    path,
    apply() {
      separator.remove()
      if (form === "brackets") after!.textContent = after!.textContent!.replace(/^\s*\)/, "")
      if (link) {
        code.replaceWith(link)
        link.replaceChildren(code)
      } else holder.remove()
    }
  }
}

/** `, path` or ` (path)` as plain text, in `next`, the text node after `code`. */
function barePath(code: Element, next: ChildNode): Found | undefined {
  const text = next.textContent ?? ""
  const lead = /^(,\s*|\s*\(\s*)/.exec(text)
  if (!lead) return
  const form: Form = lead[0].trim() === "," ? "comma" : "brackets"
  const found = BARE_PATH.exec(text.slice(lead[0].length))
  const path = found?.[0].replace(/\.+$/, "")
  if (!path || !PathTooltips.isFilePath(path)) return
  let end = lead[0].length + path.length
  if (form === "brackets") {
    const close = /^\s*\)/.exec(text.slice(end))
    if (!close) return
    end += close[0].length
  } else if (inList(code, undefined) || !isNameOf(code, path)) return
  return {
    path,
    apply() {
      next.textContent = text.slice(end)
    }
  }
}

/** `link`'s one `<code>`, when that's all it holds. */
function onlyCode(link: Element): Element | undefined {
  const significant = Array.from(link.childNodes).filter((node) => PlanMarkup.isSignificant(node))
  const only = significant[0]
  return significant.length === 1 && PlanMarkup.isElement(only) && only.localName === "code" ? only : undefined
}

/**
 * Is the comma form part of a list:  a code span (or link) before `code` across a `,` / `and` / `or`,
 * or one after `pathHolder` (the path's element, if any) across the same?
 */
function inList(code: Element, pathHolder: Element | undefined): boolean {
  const before = code.previousSibling
  if (before?.nodeType === 3 && /(?:,|\band|\bor)\s*$/.test(before.textContent ?? "")) {
    if (isCodeLike(before.previousSibling)) return true
  }
  const after = pathHolder?.nextSibling
  return after?.nodeType === 3 && /^\s*(?:,|and|or)\s*$/.test(after.textContent ?? "") && isCodeLike(after.nextSibling)
}

/** Is `node` a `<code>`, or a link holding one? */
function isCodeLike(node: Node | null): boolean {
  if (!PlanMarkup.isElement(node)) return false
  return node.localName === "code" || (node.localName === "a" && !!onlyCode(node))
}

/**
 * Is `code`'s name the file at `path`'s:  its first word (`buildTsx` of `buildTsx()`, `epic-item` of `<epic-item>`)
 * the file's name without extensions, or its folder's, letters and digits only, any case.
 */
function isNameOf(code: Element, path: string): boolean {
  const word = (code.textContent ?? "").replace(/^[<#.]+/, "").split(/[\s.(:#>[]/)[0]
  const parts = path.replace(LINE, "").split("/")
  const file = parts.at(-1)!.split(".")[0]
  const folder = parts.at(-2) ?? ""
  return !!key(word) && (key(word) === key(file) || key(word) === key(folder))
}

/** `text`'s letters and digits, lower-cased:  `<epic-item>` and `EpicItem` both `epicitem`. */
function key(text: string): string {
  return text.replace(/[^a-z0-9]/gi, "").toLowerCase()
}
