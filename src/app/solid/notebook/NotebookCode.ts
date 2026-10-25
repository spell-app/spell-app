/**
 * A notebook's code in its three VIEWS (epic `elemental-spell` P16, Owen 2026-10-25):  spellx, spell and html.
 * - `spellx`:  as written, `<button>`, `<counter/>`.
 * - `html`:  its drawing with each bare name as its element's tag, `<ui-button>`, `<counter-counter/>`, and each `</>`
 *   naming what it closes:  the page's own tags.
 * - `spell`:  the code spell it reads as (`SX.CodeSpellWriter`'s):  an example's markup inside its `<example "...">`,
 *   a template's outline.
 * - The tag for a bare name is the one the file's last compile chose (`tagFor`):  the project's own views, then its
 *   packs' components, as `SpellJSX.componentTagFor()` chooses.
 * - An edit in the html view is mapped back to spellx before it's saved:  each tag that is a bare name's becomes that
 *   name again;  anything else (a `ui-*` tag no bare name gives, an attribute) stays as written.
 * - Pure text:  no parser, no Solid.
 */
export class NotebookCode {
  /** `markup` (spellx) with each bare name's tag, and each closer naming what it closes:  its html. */
  static toHtml(markup: string, tagFor: (word: string) => string | undefined): string {
    const open: string[] = []
    return markup.replace(TAG, (whole, slash: string, name: string, rest: string) => {
      if (!name) return slash ? `</${open.pop() ?? ""}>` : whole
      const tag = BARE.test(name) ? (tagFor(name) ?? name) : name
      if (slash) {
        open.pop()
        return `</${tag}>`
      }
      if (!/\/\s*>$/.test(rest)) open.push(tag)
      return `<${tag}${rest}`
    })
  }

  /** `markup` (html) with each tag a bare name gives as that name again:  its spellx. */
  static toSpellx(markup: string, wordFor: (tag: string) => string | undefined): string {
    return markup.replace(TAG, (whole, slash: string, name: string, rest: string) => {
      if (!name) return whole
      const word = wordFor(name) ?? name
      return slash ? `</${word}>` : `<${word}${rest}`
    })
  }
}

/** The views a notebook shows its code in. */
export const CODE_VIEWS = ["spellx", "spell", "html"] as const

/** One of `CODE_VIEWS`. */
export type CodeView = (typeof CODE_VIEWS)[number]

/**
 * A tag in markup:  its slash (a closer), its name (none for `</>`), and the rest of its head up to its `>`.
 * - The rest skips quoted values and `{...}` holes, which may hold `>`.
 */
const TAG = /<(\/?)([\p{L}][\p{L}\p{N}_.-]*)?((?:"[^"]*"|\{[^}]*\}|[^>"{])*>)/gu

/** A component's bare name, `button`, `botón`:  lower-case letters only, as `SpellJSX` reads one. */
const BARE = /^\p{Ll}+$/u
