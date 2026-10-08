import type { ParsedCommit } from "./planDoc.types"

/****************
 * ### `PlanCommits`
 * Commits as a plan doc lists them:  what a commit subject says it did (`P3:  Name -- summary`, `Fix I3:  ...`), the
 * repo's GitHub page, and finding a listed one (`<epic-commit sha>`).
 * - STATIC and instance-free on purpose:  pure functions of their arguments;  never runs git (the command line does,
 *   and hands the log in).
 * - From `packages/docs/tools/plan-doc.js` (epic `epic-components`, P7).
 ****************/
export class PlanCommits {
  /**
   * What a commit subject says it did:  `{ phases, items, sentence }`, or `null` when it names neither.
   * - `phases`:  numbers (`P6a` -> 6);  `items`:  ids, lower case (`i3`)
   * - `sentence`:  the subject after ` -- ` (`P3:  Name -- what it did`), else after the colon
   */
  static parseCommitSubject(subject: string): ParsedCommit | null {
    const phase = subject.match(PlanCommits.PHASE_SUBJECT)
    const item = phase ? null : subject.match(PlanCommits.ITEM_SUBJECT)
    const match = phase ?? item
    if (!match) return null
    const names = match[1].split(/\s*[+,]\s*/)
    const rest = match[2].trim()
    const dash = rest.indexOf(" -- ")
    return {
      phases: phase ? names.map((name) => Number(name.match(/\d+/)![0])) : [],
      items: item ? names.map((name) => name.toLowerCase()) : [],
      sentence: (dash >= 0 ? rest.slice(dash + 4) : rest).trim()
    }
  }

  /**
   * The GitHub page of a repo, from its remote's URL (`git remote get-url origin`);  `null` when it isn't GitHub.
   * - `https://github.com/o/r.git`, `git@github.com:o/r.git`, `ssh://git@github.com/o/r` -> `https://github.com/o/r`
   */
  static githubBase(remote: string | null | undefined): string | null {
    const match = String(remote ?? "")
      .trim()
      .match(/github\.com[:/]([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/)
    return match ? `https://github.com/${match[1]}/${match[2]}` : null
  }

  /**
   * The `<epic-commit>` for commit `sha` among `host`'s children (a phase, an item), if any:  by its `sha`, either one
   * a prefix of the other (a short sha given, or listed).
   */
  static findCommit(host: Element, sha: string): Element | undefined {
    return Array.from(host.querySelectorAll(":scope > epic-commit")).find((commit) => {
      const listed = commit.getAttribute("sha") ?? ""
      return Boolean(listed) && (listed === sha || sha.startsWith(listed) || listed.startsWith(sha))
    })
  }

  ////////////////
  // ## Subjects
  ////////////////

  /**
   * A phase commit's subject:  `P3:`, `P4 + P5:`, `WIP P3:`, `<epic> P3:`, `P6a:` (phase 6), `P1 follow-up:`.
   * - `P052 fonts` isn't one:  a phase number has no leading 0, and the colon follows at once
   * - static:  every subject is read against the same pattern
   */
  private static readonly PHASE_SUBJECT =
    /^(?:WIP\s+)?(?:[a-z][a-z0-9-]*\s+)?(P[1-9]\d*[a-z]?(?:\s*\+\s*P[1-9]\d*[a-z]?)*)(?:\s+follow-up)?\s*:\s*(.*)$/

  /**
   * An item fix's subject:  `Fix I3:`, `<epic> I3:`, `Fix I3 + I4:`;  ids of any item kind.
   * - static:  every subject is read against the same pattern
   */
  private static readonly ITEM_SUBJECT =
    /^(?:WIP\s+)?(?:[a-z][a-z0-9-]*\s+)?(?:[Ff]ix\s+)?([QCITVJD]\d+(?:\s*[+,]\s*[QCITVJD]\d+)*)\s*:\s*(.*)$/
}
