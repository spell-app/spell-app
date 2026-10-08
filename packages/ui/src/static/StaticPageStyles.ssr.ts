import postcss, { type AtRule, type Rule } from "postcss"

import { SSR } from "$/ui/static"

/****************
 * ### `StaticPageStyles`
 * A PAGE's own CSS (its `<style>` elements, later its linked sheets) rewritten for the flattened output, so what
 * it said about elements still applies once the DOM elements are gone:
 * - `H::part(p)` => `H[part~="p"]` (the part is the root, which replaced the DOM element) and `H [part~="p"]` (deeper)
 * - `:state(x)` => `[data-state~="x"]`, the flattener's attribute for DOM element states
 * - `ui-card` (a rendered family's tag) => `[data-ui="card"]`:  the tag is gone, its root carries the kind
 * - every other subject gets `REACH`:  page CSS never reached a component's own markup (the shadow boundary kept it
 *   out), only roots (the DOM elements), slotted author content, and everything outside components.
 *   `h2 { border }` must not draw on a section's internal heading.
 * - Layers, order and specificity otherwise as written:  a `::part()` rule beat the shadow sheets, and an
 *   unlayered page rule beats every `ui.*` layer.
 * - NOTE: approximate for `::part()`:  the shadow boundary limited it to H's own parts, `H [part~="p"]` also
 *   reaches parts of components nested inside H.
 * - Node only (`$/ui/static`, postcss):  strings in, strings out, no DOM;  NEVER imported by a component or `$/ui`.
 ****************/
export class StaticPageStyles {
  /** `css` rewritten;  `tags`:  rendered tag => kind (`ui-card` => `card`). */
  static rewrite(css: string, tags: ReadonlyMap<string, string>): string {
    const sheet = postcss.parse(css)
    sheet.walkRules((rule) => {
      if (StaticPageStyles.inKeyframes(rule)) return
      rule.selectors = [...new Set(rule.selectors.flatMap((selector) => StaticPageStyles.selector(selector, tags)))]
    })
    return sheet.toString()
  }

  /** A keyframe step (`from`, `50%`), not a selector. */
  static inKeyframes(rule: Rule): boolean {
    return rule.parent?.type === "atrule" && (rule.parent as AtRule).name.endsWith("keyframes")
  }

  /** One page selector => its static equivalents. */
  static selector(selector: string, tags: ReadonlyMap<string, string>): string[] {
    let text = selector.replace(STATE, (_match, name: string) => `[${SSR.STATE_ATTRIBUTE}~="${name.trim()}"]`)
    text = text.replace(TAG, (match, before: string, tag: string) => {
      const kind = tags.get(tag)
      return kind ? `${before}[${SSR.ROOT_ATTRIBUTE}="${kind}"]` : match
    })
    const part = PART.exec(text)
    if (!part) return [SSR.StaticSelectors.onSubject(text, SSR.REACH)]
    const host = text.slice(0, part.index)
    const names = part[1]!.trim().split(/\s+/)
    const attribute = names.map((name) => `[part~="${name}"]`).join("")
    const after = text.slice(part.index + part[0].length)
    return [`${host}${attribute}${after}`, `${host} ${attribute}${after}`]
  }
}

/** `:state(name)`. */
const STATE = /:state\(([^()]*)\)/g

/** A `ui-*` type selector:  at the start, after a combinator, `(` or `,`. */
const TAG = /(^|[\s>+~(,])(ui-[a-z][\w-]*)(?![\w-])/g

/** `::part(names)`. */
const PART = /::part\(([^()]*)\)/
