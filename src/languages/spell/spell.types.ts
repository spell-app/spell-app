/**
 * Shared types for spell language layer.
 * - `import type` only, per `AGENTS.md` -- the `~/languages/rulex` registration this file used to carry
 *   now lives in `SpellParser.ts`, which every rule module imports anyway.
 * - NOTE: `rules/Statement.ts` imports `BODY_KEYWORDS` from here directly, so this MUST stay free of
 *   runtime imports.
 */

import type { P } from "~/parser"
import type { SpellLocation } from "./SpellLocation"
import type { SpellFile } from "./SpellFile"
import type { SpellJSFile } from "./SpellJSFile"
import type { SpellCSSFile } from "./SpellCSSFile"

// ## SpellFile

/** Any of the file classes a `SpellProject` can hold in its manifest. */
export type AnySpellFile = SpellFile | SpellJSFile | SpellCSSFile

/** The subset of `AnySpellFile` that can actually be `parse()`d/`compile()`d as spell source. */
export type CompilableSpellFile = SpellFile | SpellCSSFile

// ## SpellProject

/** JSON5 shape of a project's index file, as read/written by the server. */
export type ProjectManifestJSON5 = {
  /** All manifest-eligible files in project, keyed by `path`. */
  manifest: Record<string, ProjectManifestEntry>
  /** Ordered list of files to compile, synced against `manifest`. */
  imports: ProjectManifestImport[]
}

/** A single entry in `contents.manifest`, augmented with `path`/`location`/`file` once loaded. */
export type ProjectManifestEntry = {
  /** File creation time (ms epoch), from the server. */
  created: number
  /** File last-modified time (ms epoch), from the server. */
  modified: number
  /** File size in bytes, from the server. */
  size: number
  /** Full path, added by the `manifest` getter once loaded. */
  path?: string
  /** `SpellLocation` for `path`, added by the `manifest` getter once loaded. */
  location?: SpellLocation
  /** Pointer to the loaded file, added by the `manifest` getter once loaded. */
  file?: AnySpellFile
}

/** A single entry in `contents.imports`, as read/written to `.imports.json` on the server. */
export type ProjectManifestImport = {
  /** Local `filePath`, or a full `@owner:domain:...` path when importing from another project. */
  path: string
  /** `true` if file should be included when compiling the project. */
  active: boolean
  /** File contents, preloaded server-side -- only set for `active` imports of preloadable extensions. */
  contents?: string
}

/** Derived (client-side) import reference, as returned by `project.imports`. */
export type ProjectImportRef = {
  /** Full `path` of import, resolved against owning project. */
  path: string
  /** `true` if file should be included when compiling project. */
  active: boolean
  /** `SpellLocation` for `path`. */
  location: SpellLocation
  /** Pointer to loaded file for `path`. */
  file: AnySpellFile
}

/** Contents of a `SpellProjectRoot`: list of project paths, e.g. `@user:projects:Foo`. */
export type ProjectPathList = string[]

// ## SpellProjectRoot

/** Every valid project root `path`, e.g. `@user:projects` -- keys of `SpellSetup.projectRoots`. */
export const ProjectRootPaths = ["@user:projects", "@system:examples", "@system:guides"] as const
/** One of `ProjectRootPaths`. */
export type ProjectRootPath = (typeof ProjectRootPaths)[number]

/**
 * One entry in the set of "roots" a project can live under.
 * - Describes an `@owner:domain` pair plus the display strings the UI needs for it.
 * - `Type`/`type` are both kept so callers can concatenate without case-munging at the call site.
 */
export type ProjectRootSpec = {
  /** Full path, e.g. `@user:projects`. */
  path: ProjectRootPath
  /** Owner of project, as `@user` or `@system`. */
  owner: string
  /** Domain of project, as `projects`, `examples` or `guides`. */
  domain: string
  /** User-friendly title of project. */
  title: string
  /** Type of project for string concatenation, as `Project`, `Example` or `Guide`. */
  Type: string
  /** Type of project for string concatenation, as `project`, `example` or `guide`. */
  type: string
  /** User friendly description of project. */
  description: string
  /** Semantic UI icon of project. */
  icon: string
}

// ## Statements

/** What a `SpellStatement` takes as its body -- decoded from the body keyword ending its `syntax`. */
export type StatementBodySpec = {
  /** Rule to parse rest of the line as, if we take an inline body. */
  inlineAs?: "statement" | "expression"
  /** How to parse the indented block after us, if we take one:  every line as a `"block"`, or ONE line. */
  nestedAs?: "block" | "expression"
  /** Body keyword rule from `syntax`, e.g. `{statement_body}?`, echoed back by `toRulexSyntax()`. */
  syntaxRule: P.Rule
}

/**
 * Body keywords which may END a `SpellStatement`'s `syntax`, alone or as a choice,
 * e.g. `({inline_statement}|{nested_statements})?`.
 * - Not registered rules:  `SpellStatement` takes them out of `rules`, so they're never parsed as rules.
 */
export const BODY_KEYWORDS: Record<string, Omit<StatementBodySpec, "syntaxRule">> = {
  // Statement bodies, e.g. `if`, `for each`, method definitions.
  /** Usual case:  `{statement_body}` ~== `({inline_statement}|{nested_statements})`. */
  statement_body: { inlineAs: "statement", nestedAs: "block" },
  /** Rest of the line, as a statement. */
  inline_statement: { inlineAs: "statement" },
  /** Indented block of statements after the line, wrapped in `{}` when compiled. */
  nested_statements: { nestedAs: "block" },

  // Expression bodies, e.g. property getters, `where` clauses, `return`.
  /** Getter-style body:  `{expression_body}` ~== `({inline_expression}|{nested_statements})`. */
  expression_body: { inlineAs: "expression", nestedAs: "block" },
  /** Rest of the line, as an expression. */
  inline_expression: { inlineAs: "expression" },
  /**
   * ONE indented line after the line, as an expression, e.g. `return` + indented JSX.
   * - TODO: review -- only `return` uses it, and only because a line can't see the indented lines under it.
   */
  nested_expression: { nestedAs: "expression" }
}
