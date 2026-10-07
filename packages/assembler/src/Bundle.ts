import { spawnSync, type StdioOptions } from "node:child_process"
import { createHash } from "node:crypto"
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { join, relative, sep } from "node:path"

import { AS } from "$/assembler"

/**
 * One bundle of the checkout at `root` that is BUILT on demand, never committed (`AS.BUNDLES`):  the brand pages' and
 * the Spell UI docs site's, which only the page server serves.
 * - `check()`:  stale when never built, its entry is missing or newer than its build, or its sources' hash isn't
 *   the one its last build recorded (`AS.BUNDLE_RECORD`, in its output folder)
 * - `build()`:  runs its build command, then records the hash
 * - The page server runs `spell dev bundles build --stale` when it starts, so a page always loads a current build.
 * - Knows the checkout's LAYOUT as folder names only (`AS.BUNDLES`):  imports no other package.
 */
export class Bundle {
  /** the checkout's root */
  readonly root: string

  /** what to build, from where, into where */
  readonly spec: AS.BundleSpec

  constructor(root: string, spec: AS.BundleSpec) {
    this.root = root
    this.spec = spec
  }

  /** the bundle's name, e.g. `brand` */
  get name(): string {
    return this.spec.name
  }

  /** its output folder, absolute */
  get outputDir(): string {
    return join(this.root, this.spec.output)
  }

  /** where its last build recorded its sources' hash */
  get recordFile(): string {
    return join(this.outputDir, AS.BUNDLE_RECORD)
  }

  /**
   * Every bundle of the checkout at `root`;  `names`:  only those, in that order.
   * - throws a `TypeError` naming the known bundles for an unknown name
   */
  static all(root: string, names: string[] = []): Bundle[] {
    if (!names.length) return AS.BUNDLES.map((spec) => new Bundle(root, spec))
    return names.map((name) => {
      const spec = AS.BUNDLES.find((each) => each.name === name)
      if (!spec) {
        const known = AS.BUNDLES.map((each) => each.name).join(", ")
        throw new TypeError(`Bundle.all():  no bundle '${name}';  bundles:  ${known}`)
      }
      return new Bundle(root, spec)
    })
  }

  /** Is it stale, and why. */
  check(): AS.BundleCheck {
    const sources = this.sourcesHash()
    const found = { name: this.name, output: this.spec.output, sources }
    const record = this.record()
    if (!record) return { ...found, stale: "never built" }
    const entry = statSync(join(this.outputDir, this.spec.entry), { throwIfNoEntry: false })
    if (!entry) return { ...found, stale: `no ${this.spec.entry}` }
    // written after its build:  something else wrote it, e.g. a merge of a branch that still commits the bundle
    if (entry.mtimeMs > statSync(this.recordFile).mtimeMs)
      return { ...found, stale: `${this.spec.entry} changed since` }
    if (record.sources !== sources) return { ...found, stale: "built from older sources" }
    return found
  }

  /** Does it need a build?  `check()`, when the reason doesn't matter. */
  get isStale(): boolean {
    return this.check().stale !== undefined
  }

  /**
   * Run its build, then record the sources' hash it started from.
   * - `stdio`:  where the build's output goes (default:  this process's stderr, so a `--json` stdout stays clean)
   * - throws when the build fails;  it records nothing then, so the bundle stays stale
   * - SIDE EFFECT:  the build clears and rewrites `outputDir`
   */
  build({ stdio = ["ignore", 2, 2] }: { stdio?: StdioOptions } = {}): AS.BundleBuilt {
    const sources = this.sourcesHash()
    const started = performance.now()
    const [command, ...args] = this.spec.run
    const run = spawnSync(command!, args, { cwd: join(this.root, this.spec.cwd), stdio })
    if (run.status !== 0) {
      const why = run.error ? run.error.message : `exit ${run.status ?? run.signal}`
      throw new Error(`Bundle.build():  \`${this.spec.run.join(" ")}\` (in ${this.spec.cwd}) failed:  ${why}`)
    }
    const record: AS.BundleRecord = { sources, built: new Date().toISOString() }
    writeFileSync(this.recordFile, `${JSON.stringify(record, null, 2)}\n`)
    return { name: this.name, sources, seconds: (performance.now() - started) / 1000 }
  }

  /**
   * The hash of every source file:  each one's path (relative to the checkout) and bytes, in path order.
   * - a missing source adds nothing, so adding it later changes the hash
   */
  sourcesHash(): string {
    const hash = createHash("sha256").update(`${BUNDLE_FORMAT}\n${this.spec.run.join(" ")}\n`)
    for (const file of this.sourceFiles()) hash.update(`${file}\n`).update(readFileSync(join(this.root, file)))
    return hash.digest("hex").slice(0, 16)
  }

  /**
   * Its source files, relative to the checkout, `/`-separated and sorted:  every file under `spec.sources`, minus
   * `SKIPPED` (tests, snapshots, dot files, the icon packs).
   */
  sourceFiles(): string[] {
    const files: string[] = []
    for (const source of this.spec.sources) walk(join(this.root, source))
    return files.map((file) => relative(this.root, file).split(sep).join("/")).sort()

    /** add `path`, or every file under it, to `files` */
    function walk(path: string): void {
      const stat = statSync(path, { throwIfNoEntry: false })
      if (!stat) return
      if (!stat.isDirectory()) {
        files.push(path)
        return
      }
      for (const entry of readdirSync(path, { withFileTypes: true })) {
        if (SKIPPED.test(entry.name)) continue
        if (entry.isDirectory() || entry.isFile()) walk(join(path, entry.name))
      }
    }
  }

  /** what its last build recorded;  `undefined` when never built, or unreadable */
  record(): AS.BundleRecord | undefined {
    try {
      return JSON.parse(readFileSync(this.recordFile, "utf8")) as AS.BundleRecord
    } catch {
      return undefined
    }
  }
}

/** Bump to make every bundle stale once, e.g. when what a build records changes. */
const BUNDLE_FORMAT = "bundle 1"

/**
 * Names never part of a bundle's sources:  dot files, `node_modules`, snapshots, tests, and the icon packs (each
 * bundle LINKS `packages/ui/src/icons/icon-packs`, never bundles it).
 */
const SKIPPED = /^(\..*|node_modules|__snapshots__|icon-packs|.*\.test\.[cm]?[jt]sx?)$/
