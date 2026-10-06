import { P } from "$/parser"
// Import directly to avoid circular import
import { Writer } from "./Writer"

/****************
 * ### `TreeWriter`
 * Writes a spell tree as BOXES for a diagram (`P.TreeNode`):  what `<ui-tree-diagram>` draws, as plain data.
 * - `ASTNode(node)` writes ANY node:  its kind in words, its datatype, a child box per field holding AST.  The other
 *   methods only give a kind a better label, e.g. `Number 15`, `Variable number`, `divided by`.
 * - Wrappers that add nothing to read are left out, their contents drawn in their place:  parentheses, a call's
 *   argument list, a block's curly braces.
 * - `TreeWriter.instance` is the one to use:  `P.TreeWriter.instance.write(match.AST)`.
 ****************/
export class TreeWriter extends Writer<P.TreeNode> {
  /** The one to use. */
  static readonly instance = new TreeWriter()

  /** `ast`'s boxes -- `undefined` when there's nothing to draw:  no AST, or a blank line. */
  static treeOf(ast: P.ASTNode | undefined): P.TreeNode | undefined {
    if (!ast || ast instanceof P.ASTBlankLine) return undefined
    return TreeWriter.instance.write(ast)
  }

  ////////////////
  // ## Any node
  ////////////////

  /** Any node:  its class's name in words (`ASTTryCatchBlock` => `Try catch block`), and its children. */
  ASTNode(node: P.ASTNode): P.TreeNode {
    return this.box(node, kindOf(node))
  }

  /**
   * A box for `node` labelled `label`:  its datatype (when known) as `detail`, its spell as `title`, and a child box
   * per AST it holds -- but not those named in `skip`, e.g. a property already in the label.
   * - datatype:  the node's own, else its match's (`P.Match.datatype`), where most are worked out
   * - `fromMatch: false`:  take neither datatype nor title from `node.match`, which isn't really its own, e.g. an
   *   operator's, whose match is just its suffix (`+ 2`)
   */
  box(node: P.ASTNode, label: string, skip: string[] = [], { fromMatch = true } = {}): P.TreeNode {
    const own = typeof node.datatype === "string" ? node.datatype : undefined
    const datatype = own ?? (fromMatch ? node.match?.datatype : undefined)
    const title = fromMatch ? node.match?.inputText.trim() : undefined
    const children = this.children(node, skip)
    return {
      label,
      ...(datatype && { detail: datatype }),
      ...(title && { title }),
      ...(children.length && { children })
    }
  }

  /** A box for each AST `node` holds, in field order, its `slot` the field's name;  wrappers drawn through. */
  children(node: P.ASTNode, skip: string[] = []): P.TreeNode[] {
    const boxes: P.TreeNode[] = []
    for (const [field, value] of Object.entries(node)) {
      if (field === "match" || field.startsWith("_") || skip.includes(field)) continue
      for (const child of unwrapped(value)) boxes.push({ ...this.write(child), slot: field })
    }
    return boxes
  }

  ////////////////
  // ## Literals
  ////////////////

  ASTNumericLiteral(node: P.ASTNumericLiteral): P.TreeNode {
    return this.leaf(`Number ${node.value}`)
  }

  ASTStringLiteral(node: P.ASTStringLiteral): P.TreeNode {
    return this.leaf(`Text ${node.quote ? JSON.stringify(node.value) : node.value}`)
  }

  /** A quoted word, e.g. the `'integer'` of `is an integer`:  one `Text` box. */
  ASTQuotedExpression(node: P.ASTQuotedExpression): P.TreeNode {
    const { expression } = node
    if (expression instanceof P.ASTStringLiteral) return this.leaf(`Text ${JSON.stringify(expression.value)}`)
    return this.box(node, "Quoted")
  }

  ASTBooleanLiteral(node: P.ASTBooleanLiteral): P.TreeNode {
    return this.leaf(`Choice ${node.value}`)
  }

  ASTNothingLiteral(node: P.ASTNothingLiteral): P.TreeNode {
    return this.leaf("Nothing")
  }

  ASTSelfLiteral(node: P.ASTSelfLiteral): P.TreeNode {
    return this.leaf("Self")
  }

  ASTMissingExpression(node: P.ASTMissingExpression): P.TreeNode {
    return this.leaf("Missing")
  }

  ASTPropertyLiteral(node: P.ASTPropertyLiteral): P.TreeNode {
    return this.leaf(`Name ${node.value}`)
  }

  ASTKeywordLiteral(node: P.ASTKeywordLiteral): P.TreeNode {
    return this.leaf(`Keyword ${node.value}`)
  }

  ////////////////
  // ## Names
  ////////////////

  ASTVariableExpression(node: P.ASTVariableExpression): P.TreeNode {
    return this.box(node, `Variable ${node.name}`)
  }

  ASTTypeExpression(node: P.ASTTypeExpression): P.TreeNode {
    return this.leaf(`Type ${node.name}`)
  }

  ASTConstantExpression(node: P.ASTConstantExpression): P.TreeNode {
    return this.box(node, `Constant ${node.name}`)
  }

  /** `Property rank`, its object below. */
  ASTPropertyExpression(node: P.ASTPropertyExpression): P.TreeNode {
    return this.box(node, `Property ${node.property.value}`, ["property"])
  }

  ////////////////
  // ## Operators
  ////////////////

  /**
   * The operator's meaning, e.g. `divided by`, its sides below.
   * - Its match is only its suffix (`+ 2`):  no datatype or title from it.
   */
  ASTInfixExpression(node: P.ASTInfixExpression): P.TreeNode {
    return this.box(node, node.operator, [], { fromMatch: false })
  }

  ASTNotExpression(node: P.ASTNotExpression): P.TreeNode {
    return this.box(node, "Not", [], { fromMatch: false })
  }

  /** Parentheses add nothing to read:  its expression, in its place. */
  ASTParenthesizedExpression(node: P.ASTParenthesizedExpression): P.TreeNode {
    return this.write(node.expression)
  }

  ////////////////
  // ## Calls
  ////////////////

  ASTMethodInvocation(node: P.ASTMethodInvocation): P.TreeNode {
    return this.box(node, `Call ${node.methodName}`)
  }

  /** `Call name` with what it's called on;  `spellCore.x()` is `Core x`, its `spellCore` left out. */
  ASTScopedMethodInvocation(node: P.ASTScopedMethodInvocation): P.TreeNode {
    if (node.thing instanceof P.ASTSpellCoreExpression) return this.box(node, `Core ${node.methodName}`, ["thing"])
    return this.box(node, `Call ${node.methodName}`)
  }

  /** `spellCore.console.log()` is `Print`. */
  ASTConsoleMethodInvocation(node: P.ASTConsoleMethodInvocation): P.TreeNode {
    const label = node.methodName === "log" ? "Print" : `Console ${node.methodName}`
    return this.box(node, label, ["thing"])
  }

  ////////////////
  // ## Statements
  ////////////////

  ASTIfStatement(node: P.ASTIfStatement): P.TreeNode {
    return this.box(node, "If")
  }

  ASTElseIfStatement(node: P.ASTElseIfStatement): P.TreeNode {
    return this.box(node, "Otherwise if")
  }

  ASTElseStatement(node: P.ASTElseStatement): P.TreeNode {
    return this.box(node, "Otherwise")
  }

  ASTAssignmentStatement(node: P.ASTAssignmentStatement): P.TreeNode {
    return this.box(node, "Set")
  }

  ASTReturnStatement(node: P.ASTReturnStatement): P.TreeNode {
    return this.box(node, "Return")
  }

  ASTAwaitExpression(node: P.ASTAwaitExpression): P.TreeNode {
    return this.box(node, "Wait for")
  }

  ASTMethodDefinition(node: P.ASTMethodDefinition): P.TreeNode {
    return this.box(node, node.methodName ? `Method ${node.methodName}` : "Function", ["methodName"])
  }

  ASTClassDeclaration(node: P.ASTClassDeclaration): P.TreeNode {
    return this.box(node, `Type ${node.type.name}`, ["type"])
  }

  ASTNewInstanceExpression(node: P.ASTNewInstanceExpression): P.TreeNode {
    return this.box(node, `New ${node.type.name}`, ["type"])
  }

  ASTPropertyDefinition(node: P.ASTPropertyDefinition): P.TreeNode {
    return this.box(node, `Property ${node.property.value}`, ["property", "type"])
  }

  ASTReactiveProperty(node: P.ASTReactiveProperty): P.TreeNode {
    return this.box(node, `Property ${node.property.value}`, ["property", "type"])
  }

  ASTStaticDefinition(node: P.ASTStaticDefinition): P.TreeNode {
    return this.box(node, `Static ${node.name}`, ["type"])
  }

  ASTComment(node: P.ASTComment): P.TreeNode {
    return this.leaf("Comment")
  }

  ASTParseError(node: P.ASTParseError): P.TreeNode {
    return { ...this.leaf("Parse error"), title: node.value }
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** A box with no children or datatype, e.g. a literal:  its label says it all. */
  leaf(label: string): P.TreeNode {
    return { label }
  }
}

/** `node`'s kind in words:  `ASTTryCatchBlock` => `Try catch block`. */
function kindOf(node: P.ASTNode): string {
  const words = String(node.nodeType)
    .replace(/^AST/, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/**
 * The AST nodes in field `value`, wrappers drawn through:  parentheses, a call's argument list, a block's statements
 * (blank lines left out).  Not AST:  none.
 */
function unwrapped(value: unknown): P.ASTNode[] {
  if (Array.isArray(value)) return value.flatMap(unwrapped)
  if (value instanceof P.ASTBlankLine) return []
  if (value instanceof P.ASTParenthesizedExpression) return unwrapped(value.expression)
  if (value instanceof P.ASTInvocationArgs) return unwrapped(value.args ?? [])
  if (value instanceof P.ASTStatementBlock || value instanceof P.ASTStatementGroup) {
    return unwrapped(value.statements ?? [])
  }
  return value instanceof P.ASTNode ? [value] : []
}
