import { E } from "$/ui/core"
import type { RadioMember } from "./UICheckbox.types"

/****************
 * ### `RadioGroup`
 * Every `<ui-radio>` of one `name` in one SCOPE, as native radios group:
 * its form owner, else its root node (document or shadow root).
 * - Why our own:  each `<ui-radio>` keeps its `<input type="radio">` in its OWN shadow root,
 *   and native grouping only spans one tree, so the platform never sees two of them as a group.
 * - Registry:  `RadioGroup.of(scope, name)`, weakly keyed by the scope node.
 *   Members `join()` / `leave()` as they connect, move and rename:
 *   from the member's lifecycle and attribute callbacks, NEVER from an effect.
 * - Everything a member renders from is tracked (`version`),
 *   so tabbability and group validity follow joins, leaves and selections.
 * - Reads see the live set, so a member renders against its own membership at once.
 * - Why not an effect relaying `group` into `join()`:
 *   readers ran once against the stale membership and again after the effect's write
 *   (Solid dev's `EFFECT_RELAY_TEAR`), a wasted frame per radio.
 ****************/
export class RadioGroup {
  /**
   * Groups by scope node, then name.
   * - STATIC:  page-wide, so every radio of one scope and name finds the same group.
   * - Weakly keyed, so a scope that goes away takes its groups with it.
   */
  private static readonly groups = new WeakMap<Node, Map<string, RadioGroup>>()

  /**
   * Bumped on every join / leave:  tracked reads of the members go through it.
   * - `ownedWrite`:  a member joins from its constructor and its lifecycle methods (`onConnect()` ...),
   *   which may run inside a Solid render.
   */
  @E.state({ ownedWrite: true }) private accessor version = 0

  /**
   * Members right now -- read LIVE, not from a published copy.
   * - Why:  signal writes land on a microtask;
   *   a copy would show a member joining in this tick only a flush later
   *   (every radio's first render against a membership without itself).
   */
  private readonly current = new Set<RadioMember>()

  /**
   * The group for `name` in `scope`, created on first use.
   * - STATIC:  the registry's way in, before any member holds a group.
   */
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
    this.version++
  }

  /** Remove `member`. */
  leave(member: RadioMember) {
    if (!this.current.delete(member)) return
    this.version++
  }

  /** Current members, unordered;  tracked (the `version` read). */
  get members(): RadioMember[] {
    void this.version
    return [...this.current]
  }

  /** Members right now, untracked, e.g. to unchoose the others. */
  others(member: RadioMember): RadioMember[] {
    return [...this.current].filter((other) => other !== member)
  }

  /** Members in document order;  tracked. */
  @E.derived
  get membersInOrder(): RadioMember[] {
    return this.members.sort(RadioGroup.byDocumentOrder)
  }

  /** The chosen member, if any;  tracked. */
  @E.derived
  get selectedMember(): RadioMember | undefined {
    return this.membersInOrder.find((member) => member.isSelected)
  }

  /** Is any member required?  Tracked. */
  get isRequired(): boolean {
    return this.members.some((member) => member.required)
  }

  /**
   * The ONE member in the tab order, as in a native radio group;  tracked:
   * the chosen one when it's enabled, else the first enabled one.
   */
  @E.derived
  get tabStop(): RadioMember | undefined {
    const chosen = this.selectedMember
    if (chosen && !chosen.isDisabled) return chosen
    return this.membersInOrder.find((member) => !member.isDisabled)
  }

  /** The enabled member `delta` steps from `from` in document order, wrapping;  reads the live set, untracked. */
  step(from: RadioMember, delta: number): RadioMember | undefined {
    const ordered = [...this.current].sort(RadioGroup.byDocumentOrder)
    const enabled = ordered.filter((member) => member === from || !member.isDisabled)
    if (enabled.length < 2) return undefined
    const index = enabled.indexOf(from)
    return enabled[(index + delta + enabled.length) % enabled.length]
  }

  ////////////////
  // ## Helpers
  ////////////////

  /**
   * Sort comparator:  members in their DOM elements' document order (`E.byDocumentOrder`).
   * - STATIC:  pure, handed to `sort()`.
   */
  private static byDocumentOrder(a: RadioMember, b: RadioMember): number {
    return E.byDocumentOrder(a.domElement, b.domElement)
  }
}
