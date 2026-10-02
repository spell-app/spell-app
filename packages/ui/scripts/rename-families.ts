import { execFileSync } from "node:child_process"
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

/**
 * `tsx scripts/rename-families.ts [--dry-run]`:  the codemod that named every component family folder after its tag,
 * `src/components/button/` => `src/components/ui-button/` (plan P13, step 1).  A PURE rename:  no behaviour change.
 * - Moves (`git mv`, so history follows):
 *   - each family folder `src/components/<family>/` => `ui-<family>/`
 *   - inside it, each file named `<family>.<rest>` => `ui-<family>.<rest>` (`button.css`, `button.vocabulary.en.ts`,
 *     `button.test.tsx` ...);  class files (`UIButton.tsx`), helpers (`SlottedItems.ts`) and everything under
 *     `examples/` keep their names (an example's `<name>.visual.ts` pairs with its `<name>.html`)
 *   - each docs page `site/src/content/components/<family>.mdx` => `ui-<family>.mdx` (its URL follows)
 *   - each visual baseline folder `test/visual/baselines/<os>/<browser>/<family>/` => `ui-<family>/`
 * - Rewrites references with PRECISE patterns only, never a bare word (`RULES`):  component paths, file names,
 *   package entries, `dist/` files, `family=` props, docs-site links, baseline paths, the `COMPONENTS` list.
 * - Repeatable:  the family list is the folders' names without `ui-`, every pattern matches only a name NOT already
 *   prefixed, and a move whose target exists is skipped, so a second run changes nothing.
 * - `--dry-run`:  prints the moves and the per-file rewrite counts, touches nothing;  `--lines` also prints every
 *   rewritten line, before and after.
 * - NOTE: code that DERIVES names from a family (`--ui-${family}-`, `familyOf(tag)`) can't be matched safely;
 *   those were fixed by hand alongside (see the plan doc).
 */
class FamilyRenamer {
  /** repo root (`packages/ui/../../`), with a trailing slash */
  readonly root = fileURLToPath(new URL("../../../", import.meta.url))

  /** `packages/ui/`, repo-relative */
  readonly ui = "packages/ui/"

  /** whether to print the plan only */
  readonly dryRun: boolean

  /** whether to print each rewritten line too */
  readonly lines: boolean

  /** bare family names (`button`), from the folders, sorted longest first so alternations prefer `items` to `item` */
  readonly families: string[]

  /** placeholders prose writes for a family (`src/components/<family>/`), rewritten like a name */
  static readonly PLACEHOLDERS = ["<family>", "<name>", "&lt;family&gt;", "&lt;name&gt;"]

  /** browsers the visual baselines are kept for, plus prose's placeholder */
  static readonly BROWSERS = ["chromium", "firefox", "webkit", "<browser>"]

  /**
   * Repo-relative path prefixes the rewrite reads;  a root-level file (no `/`) is always read.
   * - NOT `packages/app/` (its `static/semantic-ui-css/components/` is Semantic UI's), nor the spell packages.
   */
  static readonly SCOPE = ["packages/ui/", "packages/docs/", "packages/solid-element/", ".claude/skills/", ".github/"]

  /** Paths (prefixes) never rewritten:  generated bundles and data, history, this file, another agent's page. */
  static readonly SKIP = [
    "packages/ui/scripts/rename-families.ts",
    "packages/ui/reference/",
    "packages/ui/test/visual/baselines/",
    "packages/ui/src/icons/icon-packs/",
    "packages/ui/src/icons/data/",
    "packages/docs/_assets/spell-ui.js",
    "packages/docs/_assets/emoji/",
    "packages/docs/epics/ui-component-creation/ui-component-creation.html",
    "yarn.lock"
  ]

  /** Extensions (and dotfile names) of the text files the rewrite reads. */
  static readonly TEXT = /\.(ts|tsx|mts|js|mjs|cjs|json|jsonc|md|mdx|html|astro|css|ya?ml|txt)$|(^|\/)\.[\w.-]*ignore$/

  /** Files whose `family="..."` is a display label, not a family's name (`data-family` rows keyed by object keys). */
  static readonly LABEL_FILES = ["packages/ui/tools/demo/fallback.html"]

  constructor(args: string[]) {
    this.dryRun = args.includes("--dry-run")
    this.lines = args.includes("--lines")
    const components = `${this.root}${this.ui}src/components`
    this.families = readdirSync(components)
      .filter((name) => statSync(`${components}/${name}`).isDirectory())
      .map((name) => name.replace(/^ui-/, ""))
      .sort((a, b) => b.length - a.length || a.localeCompare(b))
  }

  /**
   * Move, then rewrite, then report.
   * - SIDE EFFECT:  without `--dry-run`, `git mv`s and overwrites files in the working tree (nothing is staged
   *   beyond what `git mv` stages).
   */
  run() {
    const moves = this.moves()
    console.log(this.dryRun ? "== DRY RUN:  nothing is changed\n" : "")
    this.printMoves(moves)
    if (!this.dryRun) for (const [from, to] of moves) this.git("mv", from, to)

    const rewrites = this.rewrites(!this.dryRun)
    console.log(`\n== References${this.dryRun ? " (would rewrite)" : " rewritten"}`)
    let total = 0
    for (const { path, counts } of rewrites) {
      const sum = Object.values(counts).reduce((a, b) => a + b, 0)
      total += sum
      const detail = Object.entries(counts)
        .map(([rule, count]) => `${rule} ${count}`)
        .join(", ")
      console.log(`${String(sum).padStart(5)}  ${path}  (${detail})`)
    }
    const byRule: Record<string, number> = {}
    for (const { counts } of rewrites) {
      for (const [rule, count] of Object.entries(counts)) byRule[rule] = (byRule[rule] ?? 0) + count
    }
    console.log(`\n== Totals`)
    console.log(`moves:  ${moves.length}  (${this.summary(moves)})`)
    console.log(`references:  ${total} in ${rewrites.length} files`)
    for (const [rule, count] of Object.entries(byRule)) console.log(`  ${rule.padEnd(12)} ${count}`)
  }

  ////////////////
  // ## Moves
  ////////////////

  /**
   * Every `git mv` to make, repo-relative `[from, to]`, in order:  a folder before the files inside it (whose paths
   * are then under the NEW folder).
   * - Skipped when the target exists (already renamed).
   */
  moves(): Array<[string, string]> {
    const moves: Array<[string, string]> = []
    const components = `${this.ui}src/components`
    for (const family of [...this.families].sort()) {
      const from = `${components}/${family}`
      const to = `${components}/ui-${family}`
      const folder = existsSync(`${this.root}${to}`) ? to : from
      if (folder === from) moves.push([from, to])
      for (const file of readdirSync(`${this.root}${folder}`).sort()) {
        if (!file.startsWith(`${family}.`) || !this.tracked(`${folder}/${file}`)) continue
        moves.push([`${to}/${file}`, `${to}/ui-${file}`])
      }
      const page = `${this.ui}site/src/content/components/${family}.mdx`
      if (existsSync(`${this.root}${page}`)) moves.push([page, page.replace(/\/([\w-]+)\.mdx$/, "/ui-$1.mdx")])
    }
    const baselines = `${this.ui}test/visual/baselines`
    if (existsSync(`${this.root}${baselines}`)) {
      for (const os of readdirSync(`${this.root}${baselines}`).sort()) {
        for (const browser of this.folders(`${baselines}/${os}`)) {
          for (const family of this.folders(`${baselines}/${os}/${browser}`)) {
            if (!this.families.includes(family)) continue
            const from = `${baselines}/${os}/${browser}/${family}`
            if (!existsSync(`${this.root}${baselines}/${os}/${browser}/ui-${family}`)) {
              moves.push([from, `${baselines}/${os}/${browser}/ui-${family}`])
            }
          }
        }
      }
    }
    return moves
  }

  /** The move table, one row per family. */
  private printMoves(moves: Array<[string, string]>) {
    console.log("family        folder         files  page  baselines")
    for (const family of [...this.families].sort()) {
      const mine = moves.filter(([from]) => FamilyRenamer.familyOfMove(from) === family)
      const folder = mine.some(([from]) => from.endsWith(`/components/${family}`)) ? `ui-${family}` : "(done)"
      const files = mine.filter(([from]) => /\/components\/ui-[\w-]+\/[^/]+$/.test(from)).length
      const page = mine.some(([from]) => from.endsWith(".mdx")) ? "yes" : "-"
      const baselines = mine.filter(([from]) => from.includes("/baselines/")).length
      console.log(
        `${family.padEnd(13)} ${folder.padEnd(14)} ${String(files).padStart(5)}  ${page.padEnd(4)}  ${baselines}`
      )
    }
  }

  /** `12 folders, 300 files, ...` */
  private summary(moves: Array<[string, string]>): string {
    const count = (test: (from: string) => boolean) => moves.filter(([from]) => test(from)).length
    return [
      `${count((from) => /\/src\/components\/[\w-]+$/.test(from))} family folders`,
      `${count((from) => /\/src\/components\/ui-[\w-]+\/[^/]+$/.test(from))} family files`,
      `${count((from) => from.endsWith(".mdx"))} docs pages`,
      `${count((from) => from.includes("/baselines/"))} baseline folders`
    ].join(", ")
  }

  /** Bare family a move belongs to, from its source path. */
  private static familyOfMove(from: string): string {
    return (
      /\/src\/components\/(?:ui-)?([\w-]+)/.exec(from)?.[1] ??
      /\/content\/components\/([\w-]+)\.mdx$/.exec(from)?.[1] ??
      /\/baselines\/[^/]+\/[^/]+\/([\w-]+)$/.exec(from)?.[1] ??
      ""
    )
  }

  ////////////////
  // ## Rewrites
  ////////////////

  /**
   * Pattern rules, in order, each `[name, pattern, replacement, applies to path?]`.
   * - `F` is the family alternation (names + placeholders);  every rule refuses a name already prefixed (`ui-`).
   */
  rules(): Array<[string, RegExp, string | ((...match: string[]) => string), (path: string) => boolean]> {
    const F = `(${[...this.families, ...FamilyRenamer.PLACEHOLDERS].map(FamilyRenamer.escape).join("|")})`
    const rests = this.rests()
      .map(FamilyRenamer.escape)
      .sort((a, b) => b.length - a.length)
      .join("|")
    const browsers = FamilyRenamer.BROWSERS.map(FamilyRenamer.escape).join("|")
    const always = () => true
    return [
      // `src/components/button/`, `$/ui/components/button`, `/components/button/` (site URLs), `\/components\/emoji\/`
      ["path", new RegExp(`(?<=components(?:/|\\\\/))${F}(?![\\w-])`, "g"), "ui-$1", always],
      // `button.css`, `./button.vocabulary.en`, `search/search.css` -- the renamed files, by their exact names;  NOT
      // an element's whole text (`<ui-content>accordion.css</ui-content>`):  that's an example's content, a file tree
      ["file", new RegExp(`(?<![\\w.-])${F}\\.(${rests})(?![\\w-]|\\.\\w|<)`, "g"), "ui-$1.$2", always],
      // `search/ui-search.css` (after `file`) => `ui-search/ui-search.css`:  a family folder outside `components/`
      ["folder", new RegExp(`(?<![\\w./-])${F}/(?=ui-\\1\\.)`, "g"), "ui-$1/", always],
      // `@spell-app/ui/button` (package entries)
      ["entry", new RegExp(`(?<=@spell-app/ui/)${F}(?![\\w-])`, "g"), "ui-$1", always],
      // `dist/button.js`, `dist/button.d.ts`
      ["dist", new RegExp(`(?<=dist/)${F}(?=\\.(?:js|d\\.ts)\\b)`, "g"), "ui-$1", always],
      // `package.json` `exports` keys:  `"./button":`
      ["export", new RegExp(`(?<="\\./)${F}(?=":)`, "g"), "ui-$1", (path) => path.endsWith("package.json")],
      // `family="button"` (docs props), `family: "button"` (test cases, expectations)
      [
        "family",
        new RegExp(`((?<![\\w-])family(?:=|:\\s*)["'])${F}(["'])`, "g"),
        "$1ui-$2$3",
        (path) => !FamilyRenamer.LABEL_FILES.includes(path)
      ],
      // docs pages' relative links:  `](../dropdown/)`
      ["link", new RegExp(`(?<=\\]\\(\\.\\./)${F}(?=/)`, "g"), "ui-$1", (path) => path.endsWith(".mdx")],
      // baseline folders:  `local-darwin/chromium/button/`
      ["baseline", new RegExp(`(?<=(?:${browsers})/)${F}(?=/)`, "g"), "ui-$1", always],
      // `vite.config.ts`'s `COMPONENTS` list
      [
        "COMPONENTS",
        /(export const COMPONENTS = \[)([^\]]*)(\])/,
        (_all, open, body, close) => `${open}${body!.replace(new RegExp(`"${F}"`, "g"), '"ui-$1"')}${close}`,
        (path) => path === `${this.ui}vite.config.ts`
      ]
    ]
  }

  /**
   * Rewrite every text file in scope;  per file, the count of each rule's matches.
   * - SIDE EFFECT:  writes the files when `write`.
   */
  rewrites(write: boolean): Array<{ path: string; counts: Record<string, number> }> {
    const rules = this.rules()
    const results: Array<{ path: string; counts: Record<string, number> }> = []
    for (const path of this.files()) {
      const before = readFileSync(`${this.root}${path}`, "utf8")
      let text = before
      const counts: Record<string, number> = {}
      for (const [name, pattern, replacement, applies] of rules) {
        if (!applies(path)) continue
        let count = 0
        text = text.replace(pattern, (...match: unknown[]) => {
          const groups = match.slice(0, -2) as string[]
          const replaced =
            typeof replacement === "string"
              ? replacement.replace(/\$(\d)/g, (_, index: string) => groups[Number(index)] ?? "")
              : replacement(...groups)
          if (replaced !== groups[0])
            count += typeof replacement === "string" ? 1 : FamilyRenamer.added(groups[0]!, replaced)
          return replaced
        })
        if (count) counts[name] = count
      }
      if (text === before) continue
      results.push({ path, counts })
      if (this.lines) this.printLines(path, before, text)
      if (write) writeFileSync(`${this.root}${path}`, text)
    }
    return results
  }

  /** Text files in scope, repo-relative, from git's index (so moved files are read at their new paths). */
  private files(): string[] {
    return this.git("ls-files")
      .split("\n")
      .filter((path) => path && FamilyRenamer.TEXT.test(path))
      .filter((path) => !path.includes("/") || FamilyRenamer.SCOPE.some((prefix) => path.startsWith(prefix)))
      .filter((path) => !FamilyRenamer.SKIP.some((prefix) => path.startsWith(prefix)))
      .filter((path) => !/\/src\/components\/[\w-]+\/data\//.test(path))
      .filter((path) => existsSync(`${this.root}${path}`))
  }

  /**
   * What follows `<family>.` in each file the moves rename (`css`, `vocabulary.en.ts` ...), plus import forms
   * without the extension (`vocabulary.en`, `fallback`) and prose's `vocabulary.<lang>.ts` / `a11y.test.ts`.
   */
  private rests(): string[] {
    const rests = new Set<string>(["vocabulary.<lang>.ts", "a11y.test.ts"])
    const components = `${this.root}${this.ui}src/components`
    for (const folder of readdirSync(components)) {
      const family = folder.replace(/^ui-/, "")
      if (!statSync(`${components}/${folder}`).isDirectory()) continue
      for (const file of readdirSync(`${components}/${folder}`)) {
        const name = file.replace(/^ui-/, "")
        if (!name.startsWith(`${family}.`) || !statSync(`${components}/${folder}/${file}`).isFile()) continue
        const rest = name.slice(family.length + 1)
        rests.add(rest)
        if (/\.(ts|tsx)$/.test(rest)) rests.add(rest.replace(/\.(ts|tsx)$/, ""))
      }
    }
    return [...rests]
  }

  /** Each line of `path` that differs, before and after (the rewrites never add or remove lines). */
  private printLines(path: string, before: string, after: string) {
    const old = before.split("\n")
    after.split("\n").forEach((line, index) => {
      if (line !== old[index]) console.log(`${path}:${index + 1}\n  - ${old[index]!.trim()}\n  + ${line.trim()}`)
    })
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** Run git at the repo root;  its stdout. */
  private git(...args: string[]): string {
    return execFileSync("git", args, { cwd: this.root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
  }

  /** Whether git tracks repo-relative `path` (read once:  the index before any move). */
  private tracked(path: string): boolean {
    this.index ??= new Set(this.git("ls-files", "--", `${this.ui}src/components`).split("\n"))
    return this.index.has(path)
  }

  /** `git ls-files` of `src/components/`, cached by `tracked()` */
  private index?: Set<string>

  /** How many `"ui-` prefixes `after` has that `before` hadn't:  a function rule's rewrite count. */
  private static added(before: string, after: string): number {
    return (after.match(/"ui-/g)?.length ?? 0) - (before.match(/"ui-/g)?.length ?? 0)
  }

  /** Sub-folder names of repo-relative `path`, sorted. */
  private folders(path: string): string[] {
    return readdirSync(`${this.root}${path}`)
      .filter((name) => statSync(`${this.root}${path}/${name}`).isDirectory())
      .sort()
  }

  /** `text` with RegExp metacharacters escaped. */
  private static escape(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  }
}

new FamilyRenamer(process.argv.slice(2)).run()
