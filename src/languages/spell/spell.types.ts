/**
 * Shared types for spell language layer, plus the `import "~/languages/rulex"` side-effect import below,
 * which registers `RulexParser` onto `P.Parser.rulexParser` -- needed before any rule using a `syntax:`
 * rulex string can be defined, e.g. every rule module under `./rules`.
 * - NOTE: that's the one value-level import in this file.  `<folder>.types.ts` files are otherwise
 *   `import type` only (see `AGENTS.md`) -- this is a deliberate exception, not an oversight.
 */

// Import `rulex` language for constructing rules.
import "~/languages/rulex"

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
