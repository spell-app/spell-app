import { spawnSync } from "child_process"
import { basename, dirname, join, matchesGlob } from "path"

import { CLI, type Generator, type MergeMainOptions, type MergeMainReport, type SnapshotReview } from "$/cli"

/**
 * `spell dev worktree merge-main`:  merge `main` into this checkout's branch, REGENERATING every generated file both
 * sides changed instead of merging it.  `/isolate done`, `/unpark` and `/wait-for` use it.
 * - Why:  a generated file (a bundle, a snapshot) is a function of BOTH branches' source, so neither side's copy, and
 *   no line merge of the two, is right.  Its generator, run on the merged source, is.
 * - The root `.gitattributes` marks the same files `merge=binary`, so git never interleaves two versions:  it keeps
 *   ours and marks the file conflicted.  `-diff` and `linguist-generated` there keep them out of diffs and PRs.
 * - "Both sides changed", not just "conflicted":  a bundle with hashed chunk names (`site/_assets/`) leaves each
 *   side's chunks behind in a clean merge, and only its generator, which clears the folder, removes them.
 * - Snapshots are regenerated with `vp test run --update`, then each entry is compared to both sides:  one NEITHER
 *   side had is new behaviour nobody reviewed, so it's reported (`review`), never hidden.
 * - Any OTHER file in conflict stops it mid-merge:  Claude resolves those, `git add`s them, and runs it again with
 *   `--continue`.
 * - Node built-ins and git only:  no spell.
 */
export function mergeMain(root: string, options: MergeMainOptions = {}): MergeMainReport {
  const { mode = "start", generators = GENERATORS, snapshotUpdate = SNAPSHOT_UPDATE } = options
  const branch = gitOut(root, ["branch", "--show-current"])
  if (!branch) throw new CLI.CliError("merge-main:  not on a branch;  check out the worktree's branch first")
  const report: MergeMainReport = { branch, result: "merged", conflicts: [], regenerated: [], review: [], unstaged: [] }

  const merging = CLI.git(["rev-parse", "-q", "--verify", "MERGE_HEAD"], root).ok
  if (mode === "continue") {
    if (!merging) throw new CLI.CliError("merge-main --continue:  no merge in progress")
  } else {
    if (merging) throw new CLI.CliError("merge-main:  a merge is in progress;  `--continue` it, or `git merge --abort`")
    if (gitOut(root, ["status", "--porcelain", "--untracked-files=no"])) {
      throw new CLI.CliError("merge-main:  uncommitted changes;  commit them first")
    }
    if (CLI.git(["merge-base", "--is-ancestor", MAIN, "HEAD"], root).ok) return { ...report, result: "up-to-date" }
    if (CLI.git(["merge-base", "--is-ancestor", "HEAD", MAIN], root).ok) {
      mustGit(root, ["merge", "--ff-only", MAIN])
      return { ...report, result: "fast-forward" }
    }
    // Exits 1 on conflicts, which is fine:  MERGE_HEAD says it started
    const merge = CLI.git(["merge", "--no-commit", "--no-ff", "-m", `Merge ${MAIN} into ${branch}`, MAIN], root)
    if (!CLI.git(["rev-parse", "-q", "--verify", "MERGE_HEAD"], root).ok) {
      throw new CLI.CliError(`merge-main:  \`git merge ${MAIN}\` failed:  ${merge.err || merge.out}`, CLI.EXIT.ERRORS)
    }
  }

  ////////
  // What to regenerate:  every generated file conflicted or changed on both sides;  anything else conflicted stops it
  const unmerged = gitLines(root, ["diff", "--name-only", "--diff-filter=U"])
  const base = gitOut(root, ["merge-base", "HEAD", "MERGE_HEAD"])
  const ours = new Set(gitLines(root, ["diff", "--name-only", base, "HEAD"]))
  const touched = [...new Set([...unmerged, ...gitLines(root, ["diff", "--name-only", base, "MERGE_HEAD"])])]
  const candidates = touched.filter((file) => unmerged.includes(file) || ours.has(file))
  const plan = generatorsFor(candidates, generators, snapshotUpdate)
  const planned = new Set(plan.flatMap((step) => step.files))
  report.conflicts = unmerged.filter((file) => !planned.has(file))
  if (report.conflicts.length) return { ...report, result: "conflicts" }

  ////////
  // Regenerate, in table order, staging what each one wrote
  for (const { generator, files } of plan) {
    for (const file of files) {
      // Ours, without conflict markers, for a tool that reads its old output;  yarn reads (and resolves) the markers
      if (unmerged.includes(file) && file !== "yarn.lock") CLI.git(["checkout", "--ours", "--", file], root)
    }
    const run = spawnSync(generator.run[0], generator.run.slice(1), {
      cwd: join(root, generator.cwd),
      stdio: ["ignore", 2, 2]
    })
    if (run.status !== 0) {
      throw new CLI.CliError(
        `merge-main:  \`${generator.run.join(" ")}\` (in ${generator.cwd}) failed;  the merge is still in progress:  ` +
          "fix it, then `spell dev worktree merge-main --continue`, or `git merge --abort`",
        CLI.EXIT.ERRORS
      )
    }
    const written = changedFiles(root).filter((file) => matchesAny(file, generator.outputs))
    const staged = [...new Set([...files.filter((file) => unmerged.includes(file)), ...written])].sort()
    if (staged.length) mustGit(root, ["add", "-A", "--", ...staged])
    report.regenerated.push({ name: generator.name, files: staged })
  }

  ////////
  // Commit, then say what a person should look at
  const left = gitLines(root, ["diff", "--name-only", "--diff-filter=U"])
  if (left.length) throw new CLI.CliError(`merge-main:  still unmerged:  ${left.join(", ")}`, CLI.EXIT.ERRORS)
  report.review = reviewSnapshots(
    root,
    report.regenerated.flatMap((step) => step.files)
  )
  report.unstaged = changedFiles(root)
  mustGit(root, ["commit", "--no-edit"])
  return report
}

/** The branch merged in. */
const MAIN = "main"

/** A Vitest snapshot file:  its test is `<dir>/../<name>` less `.snap`. */
const SNAPSHOT = "packages/*/**/__snapshots__/*.snap"

/** The command that updates the snapshots of `tests` (relative to their package), run in the package.
 * - `--update` AFTER the files:  it takes an optional value, so before them it swallows the first one
 */
const SNAPSHOT_UPDATE = (tests: string[]) => ["yarn", "vp", "test", "run", ...tests, "--update"]

/**
 * The generated outputs, IN ORDER:  a later one may read an earlier one's output.
 * - The docs bundle builds UI first, whose `<ui-code>` loads the spell highlighter, so `gen:spell` comes before it.
 * - Snapshots aren't here:  `generatorsFor()` makes one per package, after these.
 * - The same paths are `merge=binary` in the root `.gitattributes`:  keep the two in step.
 * - NOT here:  `pages.json` (hand-kept), emoji data (`gen:emoji` needs a reference clone).
 */
// oxfmt-ignore
export const GENERATORS: Generator[] = [
  { name: "yarn.lock",                outputs: ["yarn.lock"],                                           cwd: ".",               run: ["yarn", "install"] },
  { name: "spell highlighter",        outputs: ["packages/ui/src/languages/spell.*"],                   cwd: "packages/ui",     run: ["yarn", "gen:spell"] },
  {
    name: "markdown bundle",
    outputs: ["packages/ui/src/components/ui-markdown/md.bundle.*", "packages/ui/src/components/ui-markdown/MDBundle.ts"],
    cwd: "packages/ui",
    run: ["yarn", "gen:markdown"]
  },
  {
    name: "Spell UI site data",
    outputs: ["packages/ui/site/_data/{components,icons,custom-elements,html-custom-data}.json"],
    cwd: "packages/ui",
    run: ["yarn", "site:data"]
  },
  { name: "Spell UI site bundle",     outputs: ["packages/ui/site/_assets/**"],                         cwd: "packages/ui",     run: ["yarn", "site:bundle"] },
  {
    name: "docs bundle",
    outputs: ["packages/docs/tools/_assets/spell-ui.js", "packages/docs/tools/_assets/{emoji,lazy}/**"],
    cwd: "packages/docs",
    run: ["node", "tools/bundle-spell-ui.js"]
  },
  {
    name: "brand data",
    outputs: ["packages/brand/_data/{components,custom-elements,html-custom-data}.json"],
    cwd: "packages/brand",
    run: ["yarn", "site:data"]
  },
  { name: "brand bundle",             outputs: ["packages/brand/_assets/ui/**"],                        cwd: "packages/brand",  run: ["yarn", "build"] }
]

/**
 * The generators `files` need, in run order, each with the files it covers:  the table's, then one snapshot update
 * per package.
 * - a file no generator covers isn't in any step
 */
export function generatorsFor(
  files: string[],
  generators = GENERATORS,
  snapshotUpdate = SNAPSHOT_UPDATE
): { generator: Generator; files: string[] }[] {
  const steps = generators
    .map((generator) => ({ generator, files: files.filter((file) => matchesAny(file, generator.outputs)) }))
    .filter((step) => step.files.length)
  // By package, `packages/<name>`:  one run each
  const snapshots = new Map<string, string[]>()
  for (const snap of files.filter((file) => matchesGlob(file, SNAPSHOT))) {
    const cwd = snap.split("/").slice(0, 2).join("/")
    snapshots.set(cwd, [...(snapshots.get(cwd) ?? []), snap])
  }
  for (const [cwd, snaps] of snapshots) {
    const tests = snaps.map((snap) => join(dirname(dirname(snap)), basename(snap, ".snap")).slice(cwd.length + 1))
    const generator = { name: `${basename(cwd)} snapshots`, outputs: snaps, cwd, run: snapshotUpdate(tests) }
    steps.push({ generator, files: snaps })
  }
  return steps
}

/**
 * Each regenerated snapshot's entries whose value NEITHER side of the merge had.
 * - reads `HEAD` and `MERGE_HEAD`, so call it before committing
 */
function reviewSnapshots(root: string, files: string[]): SnapshotReview[] {
  return files
    .filter((file) => matchesGlob(file, SNAPSHOT))
    .map((file) => {
      const ours = snapshotEntries(CLI.git(["show", `HEAD:${file}`], root).out)
      const theirs = snapshotEntries(CLI.git(["show", `MERGE_HEAD:${file}`], root).out)
      const merged = snapshotEntries(CLI.git(["show", `:${file}`], root).out)
      const keys = [...merged].filter(([key, value]) => ours.get(key) !== value && theirs.get(key) !== value)
      return { file, keys: keys.map(([key]) => key) }
    })
    .filter((review) => review.keys.length)
}

/**
 * A Vitest `.snap` file's entries:  `exports[`<key>`] = <value>;`, by key.
 * - each entry starts a line with `exports[`;  a value's own lines never do (Vitest escapes its backticks)
 */
export function snapshotEntries(text: string): Map<string, string> {
  const entries = new Map<string, string>()
  for (const chunk of text.split(/^(?=exports\[`)/m).slice(1)) {
    const match = /^exports\[`((?:\\.|[^`\\])*)`\] = ([\s\S]*?);?\s*$/.exec(chunk)
    if (match) entries.set(match[1], match[2])
  }
  return entries
}

/** Tracked files changed, deleted or new (not ignored) in the working tree, against the index. */
function changedFiles(root: string): string[] {
  const out = mustGit(root, ["ls-files", "-z", "--modified", "--others", "--exclude-standard"])
  return [...new Set(out.split("\0").filter(Boolean))]
}

/** `file` matches one of `globs`. */
function matchesAny(file: string, globs: string[]): boolean {
  return globs.some((glob) => matchesGlob(file, glob))
}

/** `git <args>`'s output, or `""` when it fails. */
function gitOut(root: string, args: string[]): string {
  const run = CLI.git(args, root)
  return run.ok ? run.out : ""
}

/** `git <args>`'s output lines. */
function gitLines(root: string, args: string[]): string[] {
  return gitOut(root, args).split("\n").filter(Boolean)
}

/** `git <args>`'s output;  throws a `CliError` with git's own message when it fails. */
function mustGit(root: string, args: string[]): string {
  const run = CLI.git(args, root)
  if (!run.ok) throw new CLI.CliError(`merge-main:  \`git ${args.join(" ")}\` failed:  ${run.err}`, CLI.EXIT.ERRORS)
  return run.out
}
