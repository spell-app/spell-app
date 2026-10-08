import type { TokenDeclaration } from "./styles.types"

/****************
 * ### `ComponentTokens`
 * Reads component sheets for their per-component tokens:  which `--ui-*` names belong to a component family, where
 * a sheet DECLARES them, the private aliases (`--_ui-x: var(--ui-x, <default>)`) that replace them, and the codemod
 * that converts a family.  See `docs/theming.md` "Component tokens".
 * - Pure text in, text out:  no DOM, no Vite, and nothing of `ui`'s but `styles.types` (types only), so the browser
 *   test (`test/componentTokens.test.ts`), the codemod (`yarn tokens:alias`, `scripts/tokens-alias.ts`) and the docs
 *   site's token tables (`tools/FamilyTokens.ts`, `tools/FoundationTokens.ts`, in node) share it.
 * - Build / test time only:  left out of the `$/ui/styles` barrel, import the leaf file.
 * - A COMPONENT token is `--ui-<tag>` or `--ui-<tag>-*` for a tag some vocabulary declares (`ui-button` =>
 *   `--ui-button-radius`), minus the foundation's own names (`--ui-text-color` is a token of `tokens.css`, not of
 *   `<ui-text>`).  The longest tag wins:  `--ui-buttons-x` is `buttons`, `--ui-placeholder-line-x` is
 *   `placeholder-line`.
 * - An instance knows the tags and the foundation (`owner()`, `publicDeclarations()`, `convert()`);  reading one
 *   sheet's text needs neither, so those are statics (`declarations()`, `aliases()`, `stripComments()`).
 ****************/
export class ComponentTokens {
  /** tag without `ui-` => family folder, e.g. `buttons` => `ui-button`;  longest tags first */
  readonly tags: Array<[tag: string, family: string]>

  /** every `--ui-*` name the foundation sheets (`src/styles/*.css`) declare */
  readonly foundation: Set<string>

  /** Build from source TEXT:  `ComponentTokensProps`. */
  constructor({ vocabularies, foundation }: ComponentTokensProps) {
    const tags = new Map<string, string>()
    for (const [path, text] of Object.entries(vocabularies)) {
      const family = ComponentTokens.familyFor(path)
      for (const match of text.matchAll(/\btag:\s*"ui-([a-z0-9-]+)"/g)) tags.set(match[1]!, family)
    }
    this.tags = [...tags].sort(([a], [b]) => b.length - a.length)
    this.foundation = new Set(foundation.flatMap((css) => ComponentTokens.declarations(css).map(({ name }) => name)))
  }

  ////////////////
  // ## Owners
  ////////////////

  /**
   * The tag and family a PUBLIC custom property belongs to, or `undefined` for a foundation / remap / private name.
   * - `--ui-button-radius` => `{ tag: "button", family: "ui-button" }`;  `--ui-color`, `--ui-inverted`,
   *   `--ui-text-color` (foundation) and `--_ui-button-radius` => `undefined`.
   */
  owner(name: string): { tag: string; family: string } | undefined {
    if (!name.startsWith(PUBLIC_PREFIX) || this.foundation.has(name)) return undefined
    const rest = name.slice(PUBLIC_PREFIX.length)
    const found = this.tags.find(([tag]) => rest === tag || rest.startsWith(`${tag}-`))
    return found && { tag: found[0], family: found[1] }
  }

  /**
   * Every component token a sheet DECLARES:  the thing `docs/theming.md` forbids.
   * - Style-query conditions (`@container style(--ui-x: 1)`) are reads, not declarations.
   */
  publicDeclarations(css: string): TokenDeclaration[] {
    return ComponentTokens.declarations(css).filter(({ name }) => this.owner(name))
  }

  ////////////////
  // ## Codemod
  ////////////////

  /**
   * Convert one sheet of `family` to private aliases (the codemod behind `yarn tokens:alias`).
   * - `declared`:  the family's public tokens declared in ANY of its sheets (a sheet may read tokens a sibling
   *   sheet declares, e.g. `UIPopup.anchored.css`);  default:  the ones this sheet declares.
   * - For each of the family's tokens this sheet declares:  the FIRST declaration becomes the alias
   *   (`--_ui-x: var(--ui-x, <value>)`), every later one (a variation) writes the alias (`--_ui-x: <value>`).
   * - Every read (`var(--ui-x`, `style(--ui-x`) of a `declared` token becomes `--_ui-x`.
   * - Comments are left alone:  the PUBLIC names stay the documented API.
   * - Returns the new text plus notes for a human to review (variations, a first declaration nested in
   *   `@media` / `@container`, another family's tokens this sheet declares).
   */
  convert(family: string, css: string, declared?: Set<string>): { css: string; notes: string[] } {
    const own = ComponentTokens.declarations(css).filter(({ name }) => this.owner(name)?.family === family)
    const names = declared ?? new Set(own.map(({ name }) => name))
    const stripped = ComponentTokens.stripComments(css)
    const edits: Edit[] = []
    const notes: string[] = []

    for (const match of stripped.matchAll(/\b(var|style)\(\s*(--ui-[a-z0-9-]+)(?![a-z0-9-])/g)) {
      if (!names.has(match[2]!)) continue
      const at = match.index + match[0].length - match[2]!.length
      edits.push({ at, remove: match[2]!.length, insert: ComponentTokens.privateNameFor(match[2]!) })
    }
    const seen = new Set<string>()
    for (const declaration of own) {
      const privateName = ComponentTokens.privateNameFor(declaration.name)
      edits.push({ at: declaration.at, remove: declaration.name.length, insert: privateName })
      const where = `line ${declaration.line}, \`${declaration.selector}\``
      if (seen.has(declaration.name)) {
        notes.push(`variation writes ${privateName}:  ${where}`)
        continue
      }
      seen.add(declaration.name)
      edits.push({ at: declaration.valueStart, remove: 0, insert: `var(${declaration.name}, ` })
      edits.push({ at: declaration.valueEnd, remove: 0, insert: ")" })
      if (declaration.nested)
        notes.push(`FIRST declaration of ${declaration.name} is nested (no base value?):  ${where}`)
      if (/!important/.test(declaration.value)) notes.push(`!important in ${declaration.name}:  ${where}`)
    }
    for (const declaration of this.publicDeclarations(css)) {
      if (this.owner(declaration.name)?.family === family) continue
      notes.push(
        `declares another family's token ${declaration.name} (line ${declaration.line}):  convert by hand -- ` +
          "the alias `--_ui-x: var(--ui-x, <default>)` for a look token its readers take through the alias, a " +
          "private switch for an internal one, or an EXCEPTION in `test/componentTokens.test.ts` when it " +
          "deliberately themes a nested component"
      )
    }

    let result = css
    for (const edit of edits.sort((a, b) => b.at - a.at || b.remove - a.remove))
      result = result.slice(0, edit.at) + edit.insert + result.slice(edit.at + edit.remove)
    return { css: result, notes }
  }

  ////////////////
  // ## Reading a sheet
  ////////////////

  /**
   * Public tokens a sheet exposes through private aliases:  `--_ui-x: var(--ui-x, <default>)`, first one wins,
   * with the `/* comment *\/` right above as the description (the docs' token tables, `tools/FamilyTokens.ts`).
   * - Static:  one sheet's text is all it reads, no vocabulary or foundation.
   */
  static aliases(css: string): Array<{ name: string; default: string; description?: string }> {
    const found = new Map<string, { name: string; default: string; description?: string }>()
    for (const declaration of ComponentTokens.declarations(css)) {
      const match = /^var\(\s*(--ui-[a-z0-9-]+)\s*,\s*([\s\S]*)\)$/.exec(declaration.value)
      if (!match || declaration.name !== ComponentTokens.privateNameFor(match[1]!) || found.has(match[1]!)) continue
      if (!ComponentTokens.balanced(match[2]!)) continue
      found.set(match[1]!, {
        name: match[1]!,
        default: match[2]!.replace(/\s+/g, " ").trim(),
        description: declaration.comment
      })
    }
    return [...found.values()]
  }

  /**
   * Every custom-property declaration in `css` (`--_ui-*` and `--ui-*`), in source order, outside comments.
   * - `selector`:  the prelude of the enclosing rule;  `nested`:  inside an `@media` / `@container` / `@supports`.
   * - Static:  one sheet's text is all it reads;  the constructor reads the foundation with it, before an instance
   *   exists.
   */
  static declarations(css: string): TokenDeclaration[] {
    const stripped = ComponentTokens.stripComments(css)
    const result: TokenDeclaration[] = []
    for (const match of stripped.matchAll(/(?<=[{;]\s*)(--_?ui-[a-z0-9-]+)\s*:/g)) {
      const valueStart = ComponentTokens.skipSpace(stripped, match.index + match[0].length)
      let depth = 0
      let end = valueStart
      for (; end < stripped.length; end++) {
        const char = stripped[end]
        if (char === "(") depth++
        else if (char === ")") depth--
        else if (depth === 0 && (char === ";" || char === "}")) break
      }
      let valueEnd = end
      while (valueEnd > valueStart && /\s/.test(stripped[valueEnd - 1]!)) valueEnd--
      const open = stripped.lastIndexOf("{", match.index)
      const preludeStart = Math.max(stripped.lastIndexOf("}", open), stripped.lastIndexOf(";", open)) + 1
      result.push({
        name: match[1]!,
        at: match.index,
        line: stripped.slice(0, match.index).split("\n").length,
        value: stripped.slice(valueStart, valueEnd),
        valueStart,
        valueEnd,
        selector: stripped.slice(preludeStart, open).replace(/\s+/g, " ").trim(),
        nested: ComponentTokens.nestedIn(stripped, match.index),
        comment: ComponentTokens.commentBefore(css, match.index)
      })
    }
    return result
  }

  /**
   * `css` with every comment blanked to spaces (newlines kept), so indices and line numbers still match.
   * - Static:  plain text in, text out.
   */
  static stripComments(css: string): string {
    return css.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "))
  }

  ////////////////
  // ## Internal
  ////////////////

  /**
   * Family folder of a sheet or vocabulary path:  the folder after `components/`, e.g. `ui-button`.
   * - Static:  the constructor reads it before the instance has its tags.
   * - Throws a `TypeError` on a path outside `src/components/`:  every caller passes component files.
   */
  private static familyFor(path: string): string {
    const family = /components\/([^/]+)\//.exec(path)?.[1]
    if (!family) {
      throw new TypeError(
        `ComponentTokens.familyFor():  \`${path}\` is no component path;  pass a file in \`src/components/<family>/\``
      )
    }
    return family
  }

  /** The private alias of a public token:  `--ui-button-radius` => `--_ui-button-radius`.  Static:  plain text. */
  private static privateNameFor(name: string): string {
    return `--_${name.slice(2)}`
  }

  /** Whether the declaration at `index` sits inside an `@media` / `@container` / `@supports` block.  Static:  text. */
  private static nestedIn(stripped: string, index: number): boolean {
    const stack: boolean[] = []
    const pattern = /(@(?:media|container|supports)\b[^{]*)?\{|\}/g
    for (const match of stripped.slice(0, index).matchAll(pattern)) {
      if (match[0] === "}") stack.pop()
      else stack.push(Boolean(match[1]))
    }
    return stack.some(Boolean)
  }

  /**
   * The text of a `/* comment *\/` that ends right before `index` (whitespace between), whitespace collapsed.
   * - Static:  plain text.
   */
  private static commentBefore(css: string, index: number): string | undefined {
    const before = css.slice(0, index).trimEnd()
    if (!before.endsWith("*/")) return undefined
    const start = before.lastIndexOf("/*")
    return before
      .slice(start + 2, -2)
      .replace(/^\s*\*(?!\/)/gm, "")
      .replace(/\s+/g, " ")
      .trim()
  }

  /** First non-whitespace index at or after `index`.  Static:  plain text. */
  private static skipSpace(text: string, index: number): number {
    while (index < text.length && /\s/.test(text[index]!)) index++
    return index
  }

  /** Whether `text`'s parentheses balance (a `var(--ui-x, a), b` pair would not).  Static:  plain text. */
  private static balanced(text: string): boolean {
    let depth = 0
    for (const char of text) {
      if (char === "(") depth++
      else if (char === ")" && --depth < 0) return false
    }
    return depth === 0
  }
}

/** What `new ComponentTokens()` reads:  source TEXT, never files. */
export type ComponentTokensProps = {
  /** path => text of every `ui-UI<Name>.en.ts` (one per tag);  the family is the path's folder */
  vocabularies: Record<string, string>
  /** texts of the foundation sheets (`src/styles/*.css`) */
  foundation: string[]
}

/** One text replacement of `convert()`, applied back to front. */
type Edit = {
  /** index in the original text */
  at: number
  /** characters to remove */
  remove: number
  /** text to insert */
  insert: string
}

/** What every public token starts with:  `--ui-`.  A private alias adds `_`:  `--_ui-`. */
const PUBLIC_PREFIX = "--ui-"
