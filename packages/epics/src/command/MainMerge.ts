import { spawnSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { basename, dirname, join, matchesGlob, relative } from "node:path"

import { EpicConfig } from "$/epics/config/EpicConfig"

import { EXIT, EpicCommandError, type Generator, type MergeMainReport, type SnapshotReview } from "./command.types"
import { Git } from "./Git"

/**
 * A Vitest snapshot file:  its test is `<dir>/../<name>` less `.snap`.
 * - Under `tests/<package>/`, where each package's tests live (epic `people-and-orgs` P10);
 *   or under `packages/`, for a branch from before that move.
 */
const SNAPSHOTS = ["tests/*/**/__snapshots__/*.snap", "packages/*/**/__snapshots__/*.snap"]

/** Is `file` a Vitest snapshot file -- see `SNAPSHOTS`? */
const isSnapshot = (file: string) => SNAPSHOTS.some((glob) => matchesGlob(file, glob))

/** The command that updates the snapshots of `tests` (relative to their package), run in the package.
 * - `--update` AFTER the files:  it takes an optional value, so before them it swallows the first one
 */
const SNAPSHOT_UPDATE = (tests: string[]) => ["yarn", "vp", "test", "run", ...tests, "--update"]

/****************
 * ### `MainMerge`
 * `epic worktree merge-main`:  merge `main` into this checkout's branch,
 * REGENERATING every generated file both sides changed instead of merging it.
 * - `/isolate done`, `/unpark` and `/wait-for` use it.
 * - Why:  a generated file (a bundle, a snapshot) is a function of BOTH branches' source.
 *   So neither side's copy, and no line merge of the two, is right:  its generator, run on the merged source, is.
 * - The root `.gitattributes` marks the same files `merge=binary`, so git never interleaves two versions:
 *   it keeps ours and marks the file conflicted.
 *   `-diff` and `linguist-generated` there keep them out of diffs and PRs.
 * - "Both sides changed", not just "conflicted":
 *   a bundle with hashed chunk names leaves each side's chunks behind in a clean merge,
 *   and only its generator, which clears the folder, removes them.
 * - Generated output one side no longer commits:
 *   a file `main` changed, or in conflict, that the merged `.gitignore` ignores and one side's tree lacks,
 *   leaves the index and stays on disk (`untracked`).
 *   - e.g. the bundles the page server builds since 2026-10-07 (`spell dev bundles`)
 * - Snapshots are regenerated with `vp test run --update`, then each entry is compared to both sides:
 *   one NEITHER side had is new behaviour nobody reviewed, so it's reported (`review`), never hidden.
 * - Any OTHER file in conflict stops it mid-merge:
 *   Claude resolves those, `git add`s them, and runs it again with `--continue`.
 * - Node built-ins and git only:  no spell.
 ****************/
export class MainMerge {
  /** the checkout whose branch `main` merges into:  STATIC for the object's life */
  readonly root: string

  /** the generated outputs and their commands (tests pass their own) */
  readonly generators: Generator[]

  /** the command that updates the snapshots of `tests` */
  readonly snapshotUpdate: (tests: string[]) => string[]

  /**
   * - `root`:  the checkout (a worktree, usually)
   * - `generators`:  default the checkout's own list (`generatorsOf()`);  `snapshotUpdate`:  default `yarn vp test run <tests> --update`
   */
  constructor({ root, generators, snapshotUpdate = SNAPSHOT_UPDATE }: MainMergeProps) {
    this.root = root
    this.generators = generators ?? MainMerge.generatorsOf(root)
    this.snapshotUpdate = snapshotUpdate
  }

  /**
   * Merge the base branch into `root`'s branch;  what it did (`MergeMainReport`).
   * - `mode`:  `start` (default) merges;  `continue` finishes a merge it stopped on other conflicts
   * - throws `EpicCommandError` for a merge that can't start or go on, saying what to do
   */
  run(mode: "start" | "continue" = "start"): MergeMainReport {
    const { root, generators, snapshotUpdate } = this
    const branch = gitOut(root, ["branch", "--show-current"])
    if (!branch) throw new EpicCommandError("merge-main:  not on a branch;  check out the worktree's branch first")
    // the branch merged in:  the repo's base branch (`.epic/config.json5`)
    const upstream = EpicConfig.of(root).baseBranch
    const report: MergeMainReport = {
      branch,
      result: "merged",
      conflicts: [],
      untracked: [],
      regenerated: [],
      review: [],
      unstaged: []
    }

    const merging = Git.run(["rev-parse", "-q", "--verify", "MERGE_HEAD"], root).ok
    if (mode === "continue") {
      if (!merging) throw new EpicCommandError("merge-main --continue:  no merge in progress")
    } else {
      if (merging)
        throw new EpicCommandError("merge-main:  a merge is in progress;  `--continue` it, or `git merge --abort`")
      if (gitOut(root, ["status", "--porcelain", "--untracked-files=no"])) {
        throw new EpicCommandError("merge-main:  uncommitted changes;  commit them first")
      }
      if (Git.run(["merge-base", "--is-ancestor", upstream, "HEAD"], root).ok)
        return { ...report, result: "up-to-date" }
      if (Git.run(["merge-base", "--is-ancestor", "HEAD", upstream], root).ok) {
        mustGit(root, ["merge", "--ff-only", upstream])
        return { ...report, result: "fast-forward" }
      }
      // Exits 1 on conflicts, which is fine:  MERGE_HEAD says it started
      const merge = Git.run(
        ["merge", "--no-commit", "--no-ff", "-m", `Merge ${upstream} into ${branch}`, upstream],
        root
      )
      if (!Git.run(["rev-parse", "-q", "--verify", "MERGE_HEAD"], root).ok) {
        throw new EpicCommandError(
          `merge-main:  \`git merge ${upstream}\` failed:  ${merge.err || merge.out}`,
          EXIT.ERRORS
        )
      }
    }

    ////////
    // Generated output one side no longer commits (the page server's bundles, since 2026-10-07):
    // a file `main` changed or in conflict, that the merged `.gitignore` ignores and ONE side's tree lacks,
    // leaves the index, kept on disk.
    // (A file both sides track, though ignored, stays:  the `workspaces/*.code-workspace` files)
    const base = gitOut(root, ["merge-base", "HEAD", "MERGE_HEAD"])
    const conflicted = gitLines(root, ["diff", "--name-only", "--diff-filter=U"])
    const theirs = gitLines(root, ["diff", "--name-only", base, "MERGE_HEAD"])
    const ignored = new Set(gitLines(root, ["ls-files", "--cached", "--ignored", "--exclude-standard"]))
    const dropped = [...new Set([...conflicted, ...theirs])].filter((file) => ignored.has(file))
    const [inOurs, inTheirs] = [inTree(root, "HEAD", dropped), inTree(root, "MERGE_HEAD", dropped)]
    report.untracked = dropped.filter((file) => !(inOurs.has(file) && inTheirs.has(file))).sort()
    if (report.untracked.length) mustGit(root, ["rm", "-q", "--cached", "--", ...report.untracked])
    const unmerged = conflicted.filter((file) => !report.untracked.includes(file))

    ////////
    // What to regenerate:  every generated file conflicted or changed on both sides;  anything else conflicted stops it
    const ours = new Set(gitLines(root, ["diff", "--name-only", base, "HEAD"]))
    const touched = [...new Set([...unmerged, ...theirs.filter((file) => !report.untracked.includes(file))])]
    const candidates = touched.filter((file) => unmerged.includes(file) || ours.has(file))
    const plan = MainMerge.generatorsFor(candidates, generators, snapshotUpdate)
    const planned = new Set(plan.flatMap((step) => step.files))
    report.conflicts = unmerged.filter((file) => !planned.has(file))
    if (report.conflicts.length) return { ...report, result: "conflicts" }

    ////////
    // Regenerate, in table order, staging what each one wrote
    for (const { generator, files } of plan) {
      for (const file of files) {
        // Ours, without conflict markers, for a tool that reads its old output;  yarn reads (and resolves) the markers
        if (unmerged.includes(file) && file !== "yarn.lock") Git.run(["checkout", "--ours", "--", file], root)
      }
      const run = spawnSync(generator.run[0], generator.run.slice(1), {
        cwd: join(root, generator.cwd),
        stdio: ["ignore", 2, 2]
      })
      if (run.status !== 0) {
        throw new EpicCommandError(
          `merge-main:  \`${generator.run.join(" ")}\` (in ${generator.cwd}) failed;  the merge is still in progress:  ` +
            "fix it, then `epic worktree merge-main --continue`, or `git merge --abort`",
          EXIT.ERRORS
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
    if (left.length) throw new EpicCommandError(`merge-main:  still unmerged:  ${left.join(", ")}`, EXIT.ERRORS)
    report.review = reviewSnapshots(
      root,
      report.regenerated.flatMap((step) => step.files)
    )
    report.unstaged = changedFiles(root)
    mustGit(root, ["commit", "--no-edit"])
    return report
  }

  /** where a checkout lists its generated files:  `<root>/.epic/generators.json5` (epic `epic-eject` T4) */
  static readonly GENERATORS_FILE = ".epic/generators.json5"

  /**
   * The generated outputs checkout `root` lists, IN ORDER (a later one may read an earlier one's output):
   * its `.epic/generators.json5`, `{ "generators": [{ name, outputs, cwd, run }, ...] }`.
   * - the checkout's OWN file, not the main checkout's:  a branch that adds a generated file lists it, and its own
   *   merge knows it
   * - no file:  none, so only snapshots are regenerated
   * - Why a file:  the epic code is every repo's, and the generators are one repo's own (spell-app's bundles, its
   *   packs ...);  `spell dev pack new` adds a pack's line
   * - throws `SyntaxError` on a file that won't read, `TypeError` on an entry of the wrong shape:  each names the file
   */
  static generatorsOf(root: string): Generator[] {
    const file = join(root, MainMerge.GENERATORS_FILE)
    if (!existsSync(file)) return []
    const data = EpicConfig.parse(readFileSync(file, "utf8"), file) as { generators?: unknown }
    const list = data?.generators
    if (!Array.isArray(list)) throw new TypeError(`MainMerge:  ${file} must hold { "generators": [...] }`)
    return list.map((entry, index) => {
      const { name, outputs, cwd, run } = (entry ?? {}) as Record<string, unknown>
      const strings = (value: unknown) =>
        Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === "string")
      if (typeof name !== "string" || typeof cwd !== "string" || !strings(outputs) || !strings(run))
        throw new TypeError(
          `MainMerge:  ${file}'s generator ${index + 1} must be { "name": "...", "outputs": [...], "cwd": "...", "run": [...] }`
        )
      return { name, outputs: outputs as string[], cwd, run: run as string[] }
    })
  }

  /**
   * The generators `files` need, in run order, each with the files it covers:
   * `generators`' (a checkout's list, `generatorsOf()`), then one snapshot update per package.
   * - a file no generator covers isn't in any step
   * - static:  pure
   */
  static generatorsFor(
    files: string[],
    generators: Generator[],
    snapshotUpdate = SNAPSHOT_UPDATE
  ): { generator: Generator; files: string[] }[] {
    const steps = generators
      .map((generator) => ({ generator, files: files.filter((file) => matchesAny(file, generator.outputs)) }))
      .filter((step) => step.files.length)
    // By package, run in `packages/<name>` (a snapshot under `tests/<name>/` is that package's):  one run each
    const snapshots = new Map<string, string[]>()
    for (const snap of files.filter(isSnapshot)) {
      const cwd = `packages/${snap.split("/")[1]}`
      snapshots.set(cwd, [...(snapshots.get(cwd) ?? []), snap])
    }
    for (const [cwd, snaps] of snapshots) {
      // each test's path from the package:  `src/x.test.ts`, or `../../tests/<name>/src/x.test.ts`
      const tests = snaps.map((snap) => relative(cwd, join(dirname(dirname(snap)), basename(snap, ".snap"))))
      const generator = { name: `${basename(cwd)} snapshots`, outputs: snaps, cwd, run: snapshotUpdate(tests) }
      steps.push({ generator, files: snaps })
    }
    return steps
  }

  /**
   * A Vitest `.snap` file's entries:  `exports[`<key>`] = <value>;`, by key.
   * - each entry starts a line with `exports[`;  a value's own lines never do (Vitest escapes its backticks)
   * - static:  pure
   */
  static snapshotEntries(text: string): Map<string, string> {
    const entries = new Map<string, string>()
    for (const chunk of text.split(/^(?=exports\[`)/m).slice(1)) {
      const match = /^exports\[`((?:\\.|[^`\\])*)`\] = ([\s\S]*?);?\s*$/.exec(chunk)
      if (match) entries.set(match[1], match[2])
    }
    return entries
  }
}

/** What `new MainMerge()` takes:  see its constructor. */
export type MainMergeProps = {
  root: string
  generators?: Generator[]
  snapshotUpdate?: (tests: string[]) => string[]
}

/**
 * Each regenerated snapshot's entries whose value NEITHER side of the merge had.
 * - reads `HEAD` and `MERGE_HEAD`, so call it before committing
 */
function reviewSnapshots(root: string, files: string[]): SnapshotReview[] {
  return files
    .filter(isSnapshot)
    .map((file) => {
      const ours = MainMerge.snapshotEntries(Git.run(["show", `HEAD:${file}`], root).out)
      const theirs = MainMerge.snapshotEntries(Git.run(["show", `MERGE_HEAD:${file}`], root).out)
      const merged = MainMerge.snapshotEntries(Git.run(["show", `:${file}`], root).out)
      const keys = [...merged].filter(([key, value]) => ours.get(key) !== value && theirs.get(key) !== value)
      return { file, keys: keys.map(([key]) => key) }
    })
    .filter((review) => review.keys.length)
}

/** Tracked files changed, deleted or new (not ignored) in the working tree, against the index. */
function changedFiles(root: string): string[] {
  const out = mustGit(root, ["ls-files", "-z", "--modified", "--others", "--exclude-standard"])
  return [...new Set(out.split("\0").filter(Boolean))]
}

/** Which of `files` commit `rev`'s tree has;  none asked:  none (`ls-tree` with no path lists every file). */
function inTree(root: string, rev: string, files: string[]): Set<string> {
  if (!files.length) return new Set()
  return new Set(gitLines(root, ["ls-tree", "-r", "--name-only", rev, "--", ...files]))
}

/** `file` matches one of `globs`. */
function matchesAny(file: string, globs: string[]): boolean {
  return globs.some((glob) => matchesGlob(file, glob))
}

/** `git <args>`'s output, or `""` when it fails. */
function gitOut(root: string, args: string[]): string {
  const run = Git.run(args, root)
  return run.ok ? run.out : ""
}

/** `git <args>`'s output lines. */
function gitLines(root: string, args: string[]): string[] {
  return gitOut(root, args).split("\n").filter(Boolean)
}

/** `git <args>`'s output;  throws a `EpicCommandError` with git's own message when it fails. */
function mustGit(root: string, args: string[]): string {
  const run = Git.run(args, root)
  if (!run.ok) throw new EpicCommandError(`merge-main:  \`git ${args.join(" ")}\` failed:  ${run.err}`, EXIT.ERRORS)
  return run.out
}
