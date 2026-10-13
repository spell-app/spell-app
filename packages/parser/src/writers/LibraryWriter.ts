import { P } from "$/parser"

// Import directly to avoid circular import
import { JSWriter } from "./JSWriter"
import { TSWriter } from "./TSWriter"

/**
 * What a compiled LIBRARY imports its core from:  the core with no drawing, so no Solid -- `$/core/model`.
 * - By the core's PACKAGE name, as its `package.json` exports it, never the `$/core/...` alias:
 *   the repo's aliases reach only the files a `tsconfig.json` includes, and a library lives with its project,
 *   e.g. `packages/spell/projects/...`, which none does.
 * - node, vite and `tsx` all read a package's exports, wherever the importing file is.
 */
export const LIBRARY_CORE_MODULE = "@spell-app/core/model"

/****************
 * ### `LibraryWriter`
 * Writes a project as a LIBRARY:  its classes as a plain javascript module, for other code to import, e.g.
 * `import { Person } from "./People.lib.js"` (the `js/lib` target, epic `people-and-orgs` P3).
 * - As `P.JSWriter`, with:
 *   - its classes as they are:  their properties, getters, methods, statics
 *   - its top-level functions, as they are
 *   - the program's top-level STEPS left out:  headings, tests, `print`, the things it makes
 *     -- importing it runs nothing but the class declarations
 *   - its core imported from `@spell-app/core/model` (`LIBRARY_CORE_MODULE`), and only what it uses:
 *     no Solid, and a thing it makes registers in no program's list
 * - A project that draws can't be a library:  its target says it can't draw (`SP.TARGETS`).
 * - `LibraryTSWriter` writes the same, as TypeScript:  what `tsc` turns into the library's `.d.ts`.
 ****************/
export class LibraryWriter extends JSWriter {
  /** The writer with no project. */
  static readonly instance = new LibraryWriter()

  /** Writing a file's own top level, where only the declarations are kept -- see `ASTStatementGroup()`. */
  protected atTopLevel = true

  /** As `JSWriter`'s, starting at a file's top level. */
  forProject(files: P.ASTNode[][], scope?: P.Scope, options?: P.WriterOptions): this {
    const writer = super.forProject(files, scope, options)
    writer.atTopLevel = true
    return writer
  }

  /** A file's statements, at the top level:  only its declarations (`libraryHalf()`);  any other group as `JSWriter`'s. */
  ASTStatementGroup(node: P.ASTStatementGroup): string {
    if (!this.atTopLevel) return super.ASTStatementGroup(node)
    this.atTopLevel = false
    try {
      return super.ASTStatementGroup(new P.ASTStatementGroup(node.match, { statements: libraryHalf(node.statements) }))
    } finally {
      this.atTopLevel = true
    }
  }

  /** As `JSWriter`'s, its core import from `@spell-app/core/model`, naming only what the code uses. */
  module(code: string): string {
    return libraryImports(super.module(code))
  }
}

/****************
 * ### `LibraryTSWriter`
 * `LibraryWriter`'s TypeScript:  the same module, as `P.TSWriter` writes it, for `tsc` to make its `.d.ts` from.
 * - Never saved itself:  `spell compile` turns it into `<Project>.lib.d.ts`, beside `<Project>.lib.js`
 *   (`declarationsFor()`, in `$/spell/node/typecheck`).
 ****************/
export class LibraryTSWriter extends TSWriter {
  /** The writer with no project. */
  static readonly instance = new LibraryTSWriter()

  /** As `LibraryWriter.atTopLevel`. */
  protected atTopLevel = true

  /** As `LibraryWriter`'s. */
  forProject(files: P.ASTNode[][], scope?: P.Scope, options?: P.WriterOptions): this {
    const writer = super.forProject(files, scope, options)
    writer.atTopLevel = true
    return writer
  }

  /** As `LibraryWriter`'s. */
  ASTStatementGroup(node: P.ASTStatementGroup): string {
    if (!this.atTopLevel) return super.ASTStatementGroup(node)
    this.atTopLevel = false
    try {
      return super.ASTStatementGroup(new P.ASTStatementGroup(node.match, { statements: libraryHalf(node.statements) }))
    } finally {
      this.atTopLevel = true
    }
  }

  /** As `LibraryWriter`'s. */
  module(code: string): string {
    return libraryImports(super.module(code))
  }
}

////////////////
// ## Helpers
////////////////

/**
 * Of `statements`, the top level of a file, what a library keeps:  its declarations (`isDeclaration()`),
 * and its top-level functions.
 * - A nested group's (e.g. under a heading) the same way;  a `try` block is a step, and goes.
 * - A docstring goes with what it documents:  a heading's `/** Using them *\/`, above the steps, goes too.
 */
export function libraryHalf(statements: P.ASTNode[] = []): P.ASTNode[] {
  const kept: P.ASTNode[] = []
  statements.forEach((statement, index) => {
    if (statement instanceof P.ASTStatementGroup && !(statement instanceof P.ASTTryCatchBlock)) {
      kept.push(...libraryHalf(statement.statements))
    } else if (statement instanceof P.ASTDocComment ? documentsKept(statements, index) : isKept(statement)) {
      kept.push(statement)
    }
  })
  return kept
}

/** Does a library keep `statement`, at a file's top level:  a declaration, or a top-level function? */
function isKept(statement: P.ASTNode): boolean {
  return isDeclaration(statement) || (statement instanceof P.ASTMethodDefinition && !!statement.methodName)
}

/** Is the docstring at `statements[index]` above something a library keeps (`isKept()`), past blank lines? */
function documentsKept(statements: P.ASTNode[], index: number): boolean {
  const next = statements.slice(index + 1).find((it) => !(it instanceof P.ASTBlankLine))
  return !!next && !(next instanceof P.ASTDocComment) && isKept(next)
}

/**
 * Is `statement` part of a file's declarations, kept as it is where only declarations are written:
 * a class, what's added to one, a comment.
 * - `LibraryWriter` keeps them;  so does Python's page writer, `PY.ElementsWriter`.
 */
export function isDeclaration(statement: P.ASTNode): boolean {
  return declarationKinds().some((kind) => statement instanceof kind)
}

/** `code`'s `@spell/core` import as a library's:  from `@spell-app/core/model`, naming only what the rest of `code` uses. */
function libraryImports(code: string): string {
  return code.replace(P.jsShapes.CORE_IMPORT, (_line, imported: string) => {
    const body = code.replace(P.jsShapes.CORE_IMPORT, "")
    const used = imported.split(/,\s*/).filter((name) => new RegExp(`\\b${name}\\b`).test(body))
    return used.length ? `import { ${used.join(", ")} } from "${LIBRARY_CORE_MODULE}"` : ""
  })
}

/** The kinds of statement `isDeclaration()` keeps.  Made when first asked for. */
function declarationKinds(): Array<abstract new (...args: never[]) => P.ASTNode> {
  return (DECLARATION_KINDS ??= [
    P.ASTClassDeclaration,
    P.ASTPropertyDefinition,
    P.ASTReactiveProperty,
    P.ASTStaticDefinition,
    P.ASTStaticMethod,
    P.ASTPatchedMember,
    P.ASTDocComment,
    P.ASTPreservedComment,
    P.ASTLineComment,
    P.ASTBlockComment,
    P.ASTBannerComment,
    P.ASTBlankLine
  ])
}

/** See `declarationKinds()`:  made then, as the AST classes may not be loaded when this module is. */
let DECLARATION_KINDS: Array<abstract new (...args: never[]) => P.ASTNode> | undefined
