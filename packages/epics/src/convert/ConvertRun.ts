import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync, rmSync } from "node:fs"
import { basename, dirname, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

import { PART_EXT, PART_FILE, PARTS_DIR, PlanParts } from "$/epics/tool/PlanParts"

import { ConvertError, EXCLUSIONS, type Conversion } from "./convert.types"

import { Converter } from "./Converter"

/****************
 * ### `ConvertRun`
 * Converting the plan docs of ONE checkout, on disk:  finding them (`epics/<name>/<name>.plan.html`), converting
 * each (`Converter`), writing the results ONLY under an output folder, and the report.
 * - NEVER writes into the checkout's `epics/` (the shared docs:  they change only at the switch, P12, with Owen):
 *   `write()` refuses an output folder inside it, through its links too.
 * - Node only (`node:fs`).  `convert.ts` is its command line;  `spell dev plan-doc convert` will be.
 ****************/
export class ConvertRun {
  /** The checkout whose `epics/` it reads:  STATIC for the run. */
  readonly root: string

  constructor({ root = CHECKOUT_ROOT }: { root?: string } = {}) {
    this.root = resolve(root)
  }

  /** The checkout's `epics/`:  the shared plan docs. */
  get epics(): string {
    return join(this.root, "epics")
  }

  /** Every plan doc's name, sorted:  each folder of `epics/` holding `<name>.plan.html`. */
  get names(): string[] {
    if (!existsSync(this.epics)) return []
    return readdirSync(this.epics, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && existsSync(this.docFile(entry.name)))
      .map((entry) => entry.name)
      .sort()
  }

  /** `name`'s skeleton (or one-file doc). */
  docFile(name: string): string {
    return join(this.epics, name, `${name}.plan.html`)
  }

  /**
   * Convert each of `names` and, unless it's a dry run (no `out`), write each that converted CLEANLY under `out`:
   * `<out>/<name>/<name>.plan.html` and `<out>/<name>/parts/<id>.html`.
   * - a doc that throws (`ConvertError`) is reported, and the rest go on
   * - a doc already in `<epic-page>` markup is SKIPPED, nothing written:  so `--all` stays clean as docs move over
   * - throws `TypeError` for an unknown name, or an `out` inside `epics/`
   */
  async run({ names, out }: { names: string[]; out?: string }): Promise<RunResult[]> {
    for (const name of names)
      if (!existsSync(this.docFile(name)))
        throw new TypeError(`ConvertRun.run():  no plan doc \`${name}\` in ${this.epics}`)
    if (out) this.checkOut(out)
    const results: RunResult[] = []
    for (const name of names) {
      if (this.isConverted(name)) {
        results.push({ name, skipped: true, written: [] })
        continue
      }
      try {
        const conversion = await this.convert(name)
        const ok = conversion.proof.clean && !conversion.problems.length
        const written = out && ok ? this.write(conversion, out) : []
        results.push({ name, conversion, written })
      } catch (error) {
        if (!(error instanceof ConvertError)) throw error
        results.push({ name, error: error.message, written: [] })
      }
    }
    return results
  }

  /** `name` is already in the new markup:  its skeleton holds an `<epic-page>`. */
  isConverted(name: string): boolean {
    return /<epic-page[\s>]/.test(readFileSync(this.docFile(name), "utf8"))
  }

  /** Convert `name`, read from the checkout (its parts too). */
  convert(name: string): Promise<Conversion> {
    const file = this.docFile(name)
    return new Converter({ name, skeleton: readFileSync(file, "utf8"), readPart: PlanParts.reader(file) }).convert()
  }

  /**
   * Write `conversion` under `out`, each file only when its text changed (`PlanParts.writeChanged()`);  part files
   * there that it no longer has go.  Returns the files written.
   */
  write(conversion: Conversion, out: string): string[] {
    this.checkOut(out)
    const folder = join(resolve(out), conversion.name)
    const skeleton = join(folder, `${conversion.name}.plan.html`)
    const outputs: [string, string][] = [...conversion.parts].map(([id, text]) => [
      PlanParts.partFile(skeleton, id),
      text
    ])
    const partsDir = join(folder, PARTS_DIR)
    if (existsSync(partsDir)) {
      for (const file of readdirSync(partsDir)) {
        // a part it no longer has, or one in the old `.htm` (every part is written `.html` now)
        const id = PART_FILE.exec(file)?.[1]
        if (id !== undefined && !(file.endsWith(PART_EXT) && conversion.parts.has(id))) rmSync(join(partsDir, file))
      }
    }
    return PlanParts.writeChanged([...outputs, [skeleton, conversion.skeleton]])
  }

  /**
   * Refuse an output folder inside the checkout's `epics/`, or the shared folder it links to, or the shared content
   * repo that folder is in (`spell-app-dev`).
   */
  private checkOut(out: string) {
    const targets = [resolve(out), realPath(out)]
    const shared = realPath(this.epics)
    const isLink = existsSync(this.epics) && lstatSync(this.epics).isSymbolicLink()
    const forbiddenFolders = [this.epics, shared, ...(isLink ? [dirname(shared)] : [])]
    for (const forbidden of forbiddenFolders) {
      if (targets.some((target) => target === forbidden || target.startsWith(forbidden + sep))) {
        throw new TypeError(
          `ConvertRun:  \`--out ${out}\` is inside ${forbidden}:  the real docs change only at the switch`
        )
      }
    }
  }

  ////////////////
  // ## The report
  ////////////////

  /**
   * The report, as lines:  one per doc (its proof's numbers), then each difference, note and problem under it.
   * - `verbose`:  every note, and the exclusions
   * - STATIC:  formats results, from any run
   */
  static report(
    results: RunResult[],
    { verbose = false, root = CHECKOUT_ROOT }: { verbose?: boolean; root?: string } = {}
  ): string[] {
    const lines: string[] = []
    for (const { name, conversion, error, skipped, written } of results) {
      if (skipped) {
        lines.push(`skip  ${name}:  already in <epic-page> markup`)
        continue
      }
      if (error || !conversion) {
        lines.push(`FAIL  ${name}:  ${error}`)
        continue
      }
      const { proof, problems, notes, parts, wasSplit } = conversion
      const ok = proof.clean && !problems.length
      const shape = `${wasSplit ? "split" : "one file"} -> ${parts.size} parts`
      lines.push(
        `${ok ? "ok  " : "FAIL"}  ${name}:  ids ${proof.ids.compared}, links ${proof.links.compared}, ` +
          `words ${proof.text.words};  ${shape}${proof.text.reordered.length ? `;  ${proof.text.reordered.length} units reordered` : ""}` +
          `${notes.length ? `;  ${notes.length} notes` : ""}${written.length ? `;  wrote ${written.length}` : ""}`
      )
      for (const id of proof.ids.missing) lines.push(`      id missing:  #${id}`)
      for (const id of proof.ids.added) lines.push(`      id added:  #${id}`)
      for (const link of proof.links.missing) lines.push(`      link missing:  ${link}`)
      for (const link of proof.links.added) lines.push(`      link added:  ${link}`)
      for (const unit of proof.text.units) {
        lines.push(`      text in ${unit.unit}:  missing ${quote(unit.missing)};  added ${quote(unit.added)}`)
      }
      for (const problem of problems) lines.push(`      invalid:  ${problem}`)
      if (verbose) for (const note of notes) lines.push(`      note:  ${note}`)
      if (verbose) for (const file of written) lines.push(`      wrote:  ${relative(root, file)}`)
    }
    if (verbose)
      lines.push("", "Left out of the proof, as chrome the elements draw:", ...EXCLUSIONS.map((it) => `  - ${it}`))
    return lines
  }
}

/** One doc's result:  its conversion, why it couldn't be converted, or that it already was;  the files written. */
export type RunResult = {
  name: string
  conversion?: Conversion
  error?: string
  skipped?: true
  written: string[]
}

/** This checkout's root:  `packages/epics/src/convert/` is four folders down. */
const CHECKOUT_ROOT = fileURLToPath(new URL("../../../../", import.meta.url))

/**
 * `path`'s real path, links followed -- through its nearest folder that exists when it doesn't yet (`linked/x`, `x`
 * not made:  `linked`'s real path, plus `x`).
 */
function realPath(path: string): string {
  const resolved = resolve(path)
  if (existsSync(resolved)) return realpathSync(resolved)
  const parent = dirname(resolved)
  return parent === resolved ? resolved : join(realPath(parent), basename(resolved))
}

/** Words for a report line:  the first 12, quoted. */
function quote(words: string[]): string {
  if (!words.length) return "nothing"
  return `"${words.slice(0, 12).join(" ")}"${words.length > 12 ? ` (+${words.length - 12} words)` : ""}`
}
