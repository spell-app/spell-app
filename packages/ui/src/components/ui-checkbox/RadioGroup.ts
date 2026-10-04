import { Cell } from "$/ui/core"
import { DOCUMENT_POSITION_FOLLOWING, type RadioMember } from "./ui-checkbox.types"

/****************
 * ### `RadioGroup`
 * Every `<ui-radio>` of one `name` in one SCOPE -- its form owner, else its root node (document or shadow root) --
 * as native radios group.
 * - Why our own:  each `<ui-radio>` keeps its `<input type="radio">` in its OWN shadow root, and native grouping
 *   only spans one tree, so the platform never sees two of them as a group.
 * - Registry:  `RadioGroup.of(scope, name)`, weakly keyed by the scope node;  members `join()` / `leave()` as they
 *   connect, move and rename -- from the member's lifecycle and attribute callbacks, NEVER from an effect.
 * - Everything a member renders from is tracked (`version`), so tabbability and group validity follow joins,
 *   leaves and selections.  Reads see the live set, so a member renders against its own membership at once.
 * - Why not an effect relaying `group()` into `join()`:  readers ran once against the stale membership and again
 *   after the effect's write -- Solid dev's `EFFECT_RELAY_TEAR`, a wasted frame per radio.
 ****************/
export class RadioGroup {
  /** Groups by scope node, then name. */
  private static readonly groups = new WeakMap<Node, Map<string, RadioGroup>>()

  /**
   * Bumped on every join / leave:  tracked reads of the members go through it.
   * - `ownedWrite`:  a member joins from its constructor and the fork's hooks, which may run inside a Solid render.
   */
  private readonly version = new Cell(0, { ownedWrite: true })

  /**
   * Members right now -- read LIVE, not from a published copy.
   * - Why:  signal writes land on a microtask;  a copy would show a member joining in this tick only a flush later
   *   (every radio's first render against a membership without itself).
   */
  private readonly current = new Set<RadioMember>()

  /** Joins + leaves so far:  `version`'s next value. */
  private changes = 0

  /** The group for `name` in `scope`, created on first use. */
  static of(scope: Node, name: string): RadioGroup {
    let byName = RadioGroup.groups.get(scope)
    if (!byName) RadioGroup.groups.set(scope, (byName = new Map()))
    let group = byName.get(name)
    if (!group) byName.set(name, (group = new RadioGroup()))
    return group
  }

  /** Add `member`. */
  join(member: RadioMember) {
    if (this.current.has(member)) return
    this.current.add(member)
    this.version.set(++this.changes)
  }

  /** Remove `member`. */
  leave(member: RadioMember) {
    if (!this.current.delete(member)) return
    this.version.set(++this.changes)
  }

  /** Current members, unordered;  tracked. */
  members(): RadioMember[] {
    this.version.get()
    return [...this.current]
  }

  /** Members right now, untracked, e.g. to unchoose the others. */
  others(member: RadioMember): RadioMember[] {
    return [...this.current].filter((other) => other !== member)
  }

  /** Members in document order;  tracked. */
  ordered(): RadioMember[] {
    return this.members().sort((a, b) =>
      a.host.compareDocumentPosition(b.host) & DOCUMENT_POSITION_FOLLOWING ? -1 : 1
    )
  }

  /** The chosen member, if any;  tracked. */
  selected(): RadioMember | undefined {
    return this.ordered().find((member) => member.isSelected())
  }

  /** Is any member required?  Tracked. */
  isRequired(): boolean {
    return this.members().some((member) => member.isRequired())
  }

  /**
   * The ONE member in the tab order:  the chosen one when it's enabled, else the first enabled one (native radio
   * group behaviour);  tracked.
   */
  tabbable(): RadioMember | undefined {
    const chosen = this.selected()
    if (chosen && !chosen.isDisabled()) return chosen
    return this.ordered().find((member) => !member.isDisabled())
  }

  /** The enabled member `delta` steps from `from` in document order, wrapping;  reads the live set, untracked. */
  step(from: RadioMember, delta: number): RadioMember | undefined {
    const ordered = [...this.current].sort((a, b) =>
      a.host.compareDocumentPosition(b.host) & DOCUMENT_POSITION_FOLLOWING ? -1 : 1
    )
    const enabled = ordered.filter((member) => member === from || !member.isDisabled())
    if (enabled.length < 2) return undefined
    const index = enabled.indexOf(from)
    return enabled[(index + delta + enabled.length) % enabled.length]
  }
}
