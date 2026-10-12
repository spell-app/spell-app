import ts from "@typescript/typescript6"

import type { AppUIProp, SourceComponent, SourceUse, TypeSourceFinder } from "./tools.types.ts"

/****************
 * ### `ComponentSource`
 * One of the app's `.tsx` files, read for the App UI docs set (`AppUIDataBuilder`, `yarn site:data`):
 * its documented components, and every component it draws.
 * - A documented component is an EXPORTED function or class with a banner comment above it (WWOD §6):
 *   `### `<Name>``, then what it is.
 *   Its page shows the banner's first paragraph, and its props.
 * - Its props:  the members of its first parameter's type, as written, each with its docstring.
 *   - A props type named in this file, or imported from another file of the app, is followed:
 *     intersections, `Pick<>` and `Omit<>` of it too.
 *   - A type from outside the app (`JSX.HTMLAttributes<HTMLDivElement>`) is one row, `...` and its name.
 * - What it draws:  every JSX tag starting with a capital, and the top-level declaration it's in.
 * - Reads the syntax only (TypeScript 6's parser, `@typescript/typescript6`):
 *   no type checker, so a file reads in milliseconds and needs nothing else to compile.
 * - Node only:  a build tool, never in a bundle.
 ****************/
export class ComponentSource {
  /** The file, from `packages/app/`, e.g. `src/solid/SplitPanel.tsx`. */
  readonly file: string

  /** Its syntax tree. */
  private readonly source: ts.SourceFile

  /** Finds the file another type comes from (`AppUIDataBuilder`'s);  none:  types stay in this file. */
  private readonly findTypeSource: TypeSourceFinder | undefined

  /** Reads another file's types, when a props type is imported. */
  private readonly sourceFor: ((file: string) => ComponentSource) | undefined

  constructor({ file, text, findTypeSource, sourceFor }: ComponentSourceProps) {
    this.file = file
    this.source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    this.findTypeSource = findTypeSource
    this.sourceFor = sourceFor
  }

  /** Every exported component with a banner, in file order. */
  get components(): SourceComponent[] {
    const components: SourceComponent[] = []
    for (const statement of this.source.statements) {
      if (!ts.isFunctionDeclaration(statement) && !ts.isClassDeclaration(statement)) continue
      if (!statement.name || !ComponentSource.isExported(statement)) continue
      const banner = this.bannerOf(statement)
      if (banner === undefined) continue
      components.push({
        name: statement.name.text,
        description: banner,
        props: ts.isFunctionDeclaration(statement) ? this.propsOf(statement) : []
      })
    }
    return components
  }

  /**
   * Every JSX tag starting with a capital it draws, with the top-level declaration it's drawn in;  file order.
   * - A dotted tag counts as its last name:  `<LazyMonaco.FileEditor>` draws `FileEditor`, once loaded.
   * - Drawn outside any declaration (an entry's `render(...)`):  by the file's name, `index`.
   */
  get uses(): SourceUse[] {
    const uses: SourceUse[] = []
    const fileName = this.file.slice(this.file.lastIndexOf("/") + 1).replace(/\.\w+$/, "")
    for (const statement of this.source.statements) {
      const by = ComponentSource.declaredName(statement) ?? fileName
      const visit = (node: ts.Node): void => {
        if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
          const tag = node.tagName.getText(this.source).split(".").at(-1)!
          if (COMPONENT_TAG.test(tag)) uses.push({ tag, by })
        }
        ts.forEachChild(node, visit)
      }
      visit(statement)
    }
    return uses
  }

  ////////////////
  // ## Banners
  ////////////////

  /**
   * The first paragraph of `node`'s banner, on one line;  `undefined` when it has none.
   * - A banner is the block comment right above it whose second line is `### `<Name>`` (or `### `Name``).
   * - The paragraph ends at the first bullet or blank line.
   */
  private bannerOf(node: ts.Node): string | undefined {
    const ranges = ts.getLeadingCommentRanges(this.source.text, node.getFullStart()) ?? []
    const last = ranges.at(-1)
    if (!last || last.kind !== ts.SyntaxKind.MultiLineCommentTrivia) return undefined
    const lines = ComponentSource.commentLines(this.source.text.slice(last.pos, last.end))
    const heading = lines.findIndex((line) => BANNER_HEADING.test(line))
    if (heading < 0) return undefined
    const paragraph: string[] = []
    for (const line of lines.slice(heading + 1)) {
      if (!line || line.startsWith("- ")) break
      paragraph.push(line)
    }
    return paragraph.join(" ")
  }

  ////////////////
  // ## Props
  ////////////////

  /** `component`'s props:  its first parameter's type, as rows. */
  private propsOf(component: ts.FunctionDeclaration): AppUIProp[] {
    const type = component.parameters[0]?.type
    return type ? this.propsOfType(type, new Set()) : []
  }

  /**
   * The rows of a props type:  a type literal's members;  a named type followed (here, or in its own file);
   * an intersection's parts in turn;  `Pick<>` / `Omit<>` of a followed type, filtered.
   * - Anything else is one row:  `...` and the type as written.
   * - `seen` stops a type naming itself.
   */
  private propsOfType(type: ts.TypeNode, seen: Set<string>): AppUIProp[] {
    if (ts.isTypeLiteralNode(type)) return this.membersOf(type)
    if (ts.isIntersectionTypeNode(type)) return type.types.flatMap((part) => this.propsOfType(part, seen))
    if (ts.isParenthesizedTypeNode(type)) return this.propsOfType(type.type, seen)
    if (ts.isTypeReferenceNode(type) && ts.isIdentifier(type.typeName)) {
      const name = type.typeName.text
      const [first, keys] = type.typeArguments ?? []
      if ((name === PICK || name === OMIT) && first && keys) {
        const picked = new Set(ComponentSource.literalsOf(keys))
        const inner = this.propsOfType(first, seen)
        if (!inner.some((prop) => prop.name.startsWith(SPREAD))) {
          return inner.filter((prop) => picked.has(prop.name) === (name === PICK))
        }
      } else if (!seen.has(name)) {
        const followed = this.followType(name, new Set([...seen, name]))
        if (followed) return followed
      }
    }
    const text = ComponentSource.flat(type.getText(this.source))
    return [{ name: `${SPREAD}${text}`, type: text, description: TAKES_EVERY_PROP }]
  }

  /** The rows of the type alias or interface `name`:  declared here, else in the app file it's imported from. */
  private followType(name: string, seen: Set<string>): AppUIProp[] | undefined {
    for (const statement of this.source.statements) {
      if (ts.isTypeAliasDeclaration(statement) && statement.name.text === name) {
        return this.propsOfType(statement.type, seen)
      }
      if (ts.isInterfaceDeclaration(statement) && statement.name.text === name && !statement.heritageClauses) {
        return this.membersOf(statement)
      }
    }
    const specifier = this.importedFrom(name)
    const file = specifier && this.findTypeSource?.(this.file, specifier)
    return file && this.sourceFor ? this.sourceFor(file).followType(name, seen) : undefined
  }

  /** The module `name` is imported from, as written (`./modals.types`, `$/app/solid/monaco`);  else `undefined`. */
  private importedFrom(name: string): string | undefined {
    for (const statement of this.source.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue
      const bindings = statement.importClause?.namedBindings
      if (bindings && ts.isNamedImports(bindings) && bindings.elements.some((element) => element.name.text === name)) {
        return statement.moduleSpecifier.text
      }
    }
    return undefined
  }

  /** A type literal's or interface's members as rows, index signatures left out. */
  private membersOf(type: ts.TypeLiteralNode | ts.InterfaceDeclaration): AppUIProp[] {
    const props: AppUIProp[] = []
    for (const member of type.members) {
      if (!member.name || (!ts.isPropertySignature(member) && !ts.isMethodSignature(member))) continue
      const typeText = ts.isMethodSignature(member)
        ? `(${member.parameters.map((parameter) => parameter.getText(this.source)).join(", ")}) => ` +
          (member.type?.getText(this.source) ?? "void")
        : (member.type?.getText(this.source) ?? "unknown")
      props.push({
        name: member.name.getText(this.source),
        type: ComponentSource.flat(typeText),
        ...(!member.questionToken && { required: true }),
        description: this.docOf(member)
      })
    }
    return props
  }

  /** `node`'s docstring (the `/** ... *\/` right above it), on one line;  `""` for none. */
  private docOf(node: ts.Node): string {
    const ranges = ts.getLeadingCommentRanges(this.source.text, node.getFullStart()) ?? []
    const doc = ranges.findLast((range) => this.source.text.startsWith(DOC_START, range.pos))
    if (!doc) return ""
    return ComponentSource.commentLines(this.source.text.slice(doc.pos, doc.end)).filter(Boolean).join(" ")
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** A block comment's text lines:  fences, leading `*`s and their space taken off;  rows of `*` dropped. */
  private static commentLines(comment: string): string[] {
    return comment
      .replace(/^\/\*+/, "")
      .replace(/\*+\/$/, "")
      .split("\n")
      .map((line) => line.replace(/^\s*\*?\s?/, "").trimEnd())
      .filter((line) => !/^\*+$/.test(line))
      .map((line) => line.trim())
  }

  /** `text` on one line:  every run of whitespace one space. */
  private static flat(text: string): string {
    return text.replace(/\s+/g, " ").trim()
  }

  /** The string literals of a union of them (`"onMount" | "onUnmount"`), or of one. */
  private static literalsOf(type: ts.TypeNode): string[] {
    const parts = ts.isUnionTypeNode(type) ? type.types : [type]
    return parts.flatMap((part) =>
      ts.isLiteralTypeNode(part) && ts.isStringLiteral(part.literal) ? [part.literal.text] : []
    )
  }

  /** Is `node` exported? */
  private static isExported(node: ts.FunctionDeclaration | ts.ClassDeclaration): boolean {
    return !!node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
  }

  /** The name a top-level statement declares (a function, class or the first variable);  else `undefined`. */
  private static declaredName(statement: ts.Statement): string | undefined {
    if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) && statement.name) {
      return statement.name.text
    }
    if (ts.isVariableStatement(statement)) {
      const name = statement.declarationList.declarations[0]?.name
      return name && ts.isIdentifier(name) ? name.text : undefined
    }
    return undefined
  }
}

/** What `ComponentSource` reads. */
export type ComponentSourceProps = {
  /** the file, from `packages/app/` */
  file: string
  /** its text */
  text: string
  /** finds the file a type is imported from;  none:  only this file's types are followed */
  findTypeSource?: TypeSourceFinder
  /** reads another file (cached by the caller) */
  sourceFor?: (file: string) => ComponentSource
}

/** A banner's heading line:  `### `<Name>``, or `### `Name``. */
const BANNER_HEADING = /^### `<?[\w-]+>?`$/

/** A JSX tag that's a component, not an element:  it starts with a capital (`SplitPane`). */
const COMPONENT_TAG = /^[A-Z]/

/** A docstring's start. */
const DOC_START = "/**"

/** The type helpers whose kept or dropped keys a props table follows. */
const PICK = "Pick"
const OMIT = "Omit"

/** Before a type a props table takes whole:  `...JSX.HTMLAttributes<HTMLDivElement>`. */
const SPREAD = "..."

/** The description of such a row. */
const TAKES_EVERY_PROP = "Every prop of this type too."
