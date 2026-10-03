/**
 * Reads component sheets for their per-component tokens:  which `--ui-*` names belong to a component family, where a
 * sheet DECLARES them, the private aliases (`--_ui-x: var(--ui-x, <default>)`) that replace them, and the codemod
 * that converts a family.  See `docs/theming.md` "Component tokens".
 * - Pure text in, text out:  no DOM, no Vite, so the browser test (`test/component-tokens.test.ts`), the codemod
 *   (`yarn tokens:alias`, `scripts/alias-tokens.ts`) and the docs site's token tables (`tools/FamilyTokens.ts`) share it.
 * - Build / test time only:  left out of the `$/ui/styles` barrel, import the leaf file.
 * - A COMPONENT token is `--ui-<tag>` or `--ui-<tag>-*` for a tag some vocabulary declares (`ui-button` =>
 *   `--ui-button-radius`), minus the foundation's own names (`--ui-text-color` is a token of `tokens.css`, not of
 *   `<ui-text>`).  The longest tag wins:  `--ui-buttons-x` is `buttons`, `--ui-placeholder-line-x` is
 *   `placeholder-line`.
 */
export class ComponentTokens {
  /** tag without `ui-` => family folder, e.g. `buttons` => `ui-button`;  longest tags first */
  readonly tags: Array<[tag: string, family: string]>

  /** every `--ui-*` name the foundation sheets (`src/styles/*.css`) declare */
  readonly foundation: Set<string>

  /**
   * Build from source TEXT.
   * - `vocabularies`:  path => text of every `ui-<tag>.vocabulary.en.ts` (one per tag);  the family is the path's folder
   * - `foundation`:  texts of the foundation sheets
   */
  constructor(vocabularies: Record<string, string>, foundation: string[]) {
    const tags = new Map<string, string>()
    for (const [path, text] of Object.entries(vocabularies)) {
      const family = ComponentTokens.familyOf(path)
      for (const match of text.matchAll(/\btag:\s*"ui-([a-z0-9-]+)"/g)) tags.set(match[1]!, family)
    }
    this.tags = [...tags].sort(([a], [b]) => b.length - a.length)
    this.foundation = new Set(foundation.flatMap((css) => ComponentTokens.declarations(css).map(({ name }) => name)))
  }

  /**
   * Family folder of a sheet or vocabulary path:  the folder after `components/`, e.g. `ui-button`.
   * - Throws on a path outside `src/components/`:  every caller passes component files.
   */
  static familyOf(path: string): string {
    const family = /components\/([^/]+)\//.exec(path)?.[1]
    if (!family) throw new Error(`ComponentTokens: not a component path:  ${path}`)
    return family
  }

  /**
   * The tag and family a PUBLIC custom property belongs to, or `undefined` for a foundation / remap / private name.
   * - `--ui-button-radius` => `{ tag: "button", family: "ui-button" }`;  `--ui-color`, `--ui-inverted`,
   *   `--ui-text-color` (foundation) and `--_ui-button-radius` => `undefined`.
   */
  owner(name: string): { tag: string; family: string } | undefined {
    if (!name.startsWith("--ui-") || this.foundation.has(name)) return undefined
    const rest = name.slice("--ui-".length)
    const found = this.tags.find(([tag]) => rest === tag || rest.startsWith(`${tag}-`))
    return found && { tag: found[0], family: found[1] }
  }

  /**
   * Every component token a sheet DECLARES:  the thing `docs/theming.md` forbids.
   * - Style-query conditions (`@container style(--ui-x: 1)`) are reads, not declarations.
   */
  publicDeclarations(css: string): Declaration[] {
    return ComponentTokens.declarations(css).filter(({ name }) => this.owner(name))
  }

  /**
   * Convert one sheet of `family` to private aliases (the codemod behind `yarn tokens:alias`).
   * - `declared`:  the family's public tokens declared in ANY of its sheets (a sheet may read tokens a sibling
   *   sheet declares, e.g. `ui-popup.anchored.css`);  default:  the ones this sheet declares.
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
      edits.push({ at, remove: match[2]!.length, insert: `--_${match[2]!.slice(2)}` })
    }
    const seen = new Set<string>()
    for (const declaration of own) {
      const privateName = `--_${declaration.name.slice(2)}`
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
          "private switch for an internal one, or an EXCEPTION in `test/component-tokens.test.ts` when it " +
          "deliberately themes a nested component"
      )
    }

    let result = css
    for (const edit of edits.sort((a, b) => b.at - a.at || b.remove - a.remove))
      result = result.slice(0, edit.at) + edit.insert + result.slice(edit.at + edit.remove)
    return { css: result, notes }
  }

  /**
   * Public tokens a sheet exposes through private aliases:  `--_ui-x: var(--ui-x, <default>)`, first one wins,
   * with the `/* comment *\/` right above as the description (the docs' token tables, `tools/FamilyTokens.ts`).
   */
  static aliases(css: string): Array<{ name: string; default: string; description?: string }> {
    const found = new Map<string, { name: string; default: string; description?: string }>()
    for (const declaration of ComponentTokens.declarations(css)) {
      const match = /^var\(\s*(--ui-[a-z0-9-]+)\s*,\s*([\s\S]*)\)$/.exec(declaration.value)
      if (!match || declaration.name !== `--_${match[1]!.slice(2)}` || found.has(match[1]!)) continue
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
   */
  static declarations(css: string): Declaration[] {
    const stripped = ComponentTokens.stripComments(css)
    const result: Declaration[] = []
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

  /** `css` with every comment blanked to spaces (newlines kept), so indices and line numbers still match. */
  static stripComments(css: string): string {
    return css.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "))
  }

  /** Whether the declaration at `index` sits inside an `@media` / `@container` / `@supports` block. */
  private static nestedIn(stripped: string, index: number): boolean {
    const stack: boolean[] = []
    const pattern = /(@(?:media|container|supports)\b[^{]*)?\{|\}/g
    for (const match of stripped.slice(0, index).matchAll(pattern)) {
      if (match[0] === "}") stack.pop()
      else stack.push(Boolean(match[1]))
    }
    return stack.some(Boolean)
  }

  /** The text of a `/* comment *\/` that ends right before `index` (whitespace between), whitespace collapsed. */
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

  /** First non-whitespace index at or after `index`. */
  private static skipSpace(text: string, index: number): number {
    while (index < text.length && /\s/.test(text[index]!)) index++
    return index
  }

  /** Whether `text`'s parentheses balance (a `var(--ui-x, a), b` pair would not). */
  private static balanced(text: string): boolean {
    let depth = 0
    for (const char of text) {
      if (char === "(") depth++
      else if (char === ")" && --depth < 0) return false
    }
    return depth === 0
  }
}

/** One custom-property declaration found by `ComponentTokens.declarations()`. */
export type Declaration = {
  /** property name, e.g. `--ui-button-radius` */
  name: string
  /** index of the name in the sheet text */
  at: number
  /** 1-based line of the name */
  line: number
  /** value text, trimmed, comments blanked */
  value: string
  /** index where the value starts */
  valueStart: number
  /** index right after the value's last non-space character */
  valueEnd: number
  /** prelude of the enclosing rule, whitespace collapsed, e.g. `.ui.button, .ui.buttons, .or` */
  selector: string
  /** inside `@media` / `@container` / `@supports`:  a first declaration there usually lacks a base value */
  nested: boolean
  /** the comment right above, if any */
  comment?: string
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
