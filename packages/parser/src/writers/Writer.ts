import type { P } from "$/parser"

/****************
 * ### `Writer`
 * Writes a spell tree (`P.ASTNode`s) as one `Output` per node:  a target's code (`P.JSWriter`, `Output` a `string`),
 * or another view of the tree (`P.TreeWriter`, boxes for a diagram).
 * - ONE METHOD PER KIND OF NODE, named for its class:  `ASTIfStatement(node)` writes an `ASTIfStatement`.
 *   - a node with no method of its own is written by its nearest base class's, e.g. `ASTCoreMethodInvocation` by
 *     `ASTScopedMethodInvocation(node)`;  none at all:  `write()` throws -- unless the writer has `ASTNode(node)`,
 *     the root of every chain:  then that writes anything
 *   - a subclass writer (`TSWriter extends JSWriter`) overrides just the kinds it writes differently
 *   - write a child with `this.write(child)`, NEVER `child.compile()`:  that's always the `JSWriter`, so a subclass's
 *     overrides would never reach the child
 * - A class member written INSIDE its class's body has a second method, `<class>AsMember(node)`:  see
 *   `writeAsMember()`.
 * - NOTE: finds methods by CLASS NAME, so every build MUST keep class names (`keepNames`, as rule names already
 *   need:  `packages/parser/AGENTS.md`).  `JSWriter.test.ts` checks every AST class finds its method.
 * - Knows nothing of a target's language:  that's all in the subclass.
 ****************/
export abstract class Writer<Output = string> {
  /** Method for each node class (and suffix) already looked up:  `"ASTIfStatement"` => its method. */
  private methods = new Map<string, (node: P.ASTNode) => Output>()

  /**
   * Write `node` with our method for its kind.
   * - NOTE: a `JSWriter` literal's method may return its raw value (a number, a `RegExp`), not a string --
   *   `P.ASTLiteral`'s do, as `compile()` always has.  Typed `Output` for the common case.
   * - throws if no method writes `node`'s class or any class it extends
   */
  write(node: P.ASTNode): Output {
    return this.methodFor(node, "").call(this, node)
  }

  /**
   * Write class member `member` as it reads in its class's body, e.g. `get title() {...}`:  our
   * `<class>AsMember(node)` method.  Its plain `write()` patches it onto its class from outside.
   * - throws if no `...AsMember` method writes `member`'s class or any class it extends
   */
  writeAsMember(member: P.ASTClassMember): Output {
    return this.methodFor(member, "AsMember").call(this, member)
  }

  /**
   * Our method for `node`'s class plus `suffix`, else for the nearest class it extends;  remembered per class.
   * - throws if none
   */
  protected methodFor(node: P.ASTNode, suffix: "" | "AsMember"): (node: P.ASTNode) => Output {
    const key = `${node.nodeType}${suffix}`
    let method = this.methods.get(key)
    if (method) return method
    for (let type = node.constructor; type && type !== Object; type = Object.getPrototypeOf(type)) {
      const found = (this as unknown as Record<string, unknown>)[`${type.name}${suffix}`]
      if (typeof found === "function") {
        method = found as (node: P.ASTNode) => Output
        break
      }
    }
    if (!method) {
      throw new TypeError(
        `${this.constructor.name}.write():  no \`${key}()\` method writes a ${node.nodeType}, nor one for any class it extends`
      )
    }
    this.methods.set(key, method)
    return method
  }
}
