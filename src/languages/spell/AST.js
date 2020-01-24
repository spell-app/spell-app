/** AST classes.  These do not necessarily correspond do anyone else's AST. */
import _get from "lodash/get"
import { proto, readonly } from "../../utils/decorators"
import { Scope, Match, AST } from "./all"

/** Abstract root of all AST node types.
 *  - `type` is
 */
export class ASTNode {
  @proto @readonly type = "ASTNode"

  /** On construction, pass:
   *  - `scope` passed to `toAST()` method.
   *  - `match` passed to `toAST()` method,
   *  - `props` as arbitrary properties to be assigned to the instance.
   *
   *  Use `this.assert()` or `this.assertType()` to validate input as much as you can.
   */
  constructor(scope, match, props) {
    if (props) Object.assign(this, props)
    this.parentScope = scope
    this.match = match
    this.assertType("parentScope", Scope)
    this.assertType("match", Match)
  }

  /** Compile this AST into Javascript.  You MUST override in a subclass. */
  toJS(scope) {
    throw new TypeError(`AST ${this.type} must implement toJS()`)
  }

  /** Debug: assert that a condition is true, generally called on constructor as sanity check. */
  assert(expressionValue, ...message) {
    if (!expressionValue) console.warn(`Error creating AST ${this.type}: `, ...message)
  }

  /** Debug: assert that type of `property` (path) matches `type`. */
  assertType(property, type) {
    const propValue = _get(this, property)
    if (typeof type === "string") {
      // eslint-disable-next-line valid-typeof
      const expression = typeof propValue === type
      this.assert(expression, `expected property '${property}' to be a ${type}.  Actual value: `, propValue)
    } else if (type === null) {
      this.assert(propValue === null, `expected property '${property}' to be null.  Actual value: `, propValue)
    } else if (type === undefined) {
      this.assert(
        propValue === undefined,
        `expected property '${property}' to be undefined.  Actual value: `,
        propValue
      )
    } else {
      this.assert(
        propValue instanceof type,
        `expected property '${property}' to be instanceof `,
        type,
        `.  Actual value: `,
        propValue
      )
    }
  }

  /** Assert that `this[property]` is an array, and that each item is of `type` */
  assertArrayType(property, type) {
    this.assertType(property, Array)
    if (Array.isArray(this[property])) {
      this[property].forEach((arg, index) => this.assertType(`${property}[${index}]`, type))
    }
  }
}

/** Base of all Expression types.  Useful for `instanceof`.
 *  - Try to figure out `datatype` if you can, either as a value or as a getter.
 */
export class Expression extends ASTNode {
  @proto @readonly type = "Expression"
}

/** Generic Literal type.  Useful for `instanceof`.
 *  - `value` is the actual JS value, which by default we assume we can just output.
 *  - `raw` (optional) is the raw input value.
 */
export class Literal extends Expression {
  @proto @readonly type = "Literal"
  toJS() {
    return this.value
  }
}

/** NumericLiteral type. */
export class NumericLiteral extends Literal {
  @proto @readonly type = "NumericLiteral"
  @proto @readonly datatype = "number"
  constructor(...args) {
    super(...args)
    this.assertType("value", "number")
  }
}

/** StringLiteral type. */
export class StringLiteral extends Literal {
  @proto @readonly type = "StringLiteral"
  @proto @readonly datatype = "string"
  constructor(...args) {
    super(...args)
    this.assertType("value", "string")
  }
}

/** BooleanLiteral type. */
export class BooleanLiteral extends Literal {
  @proto @readonly type = "BooleanLiteral"
  @proto @readonly datatype = "boolean"
  constructor(...args) {
    super(...args)
    this.assertType("value", "boolean")
  }
}

/** RegExpLiteral type. */
export class RegExpLiteral extends Literal {
  @proto @readonly type = "RegExpLiteral"
  @proto @readonly datatype = RegExp
  constructor(...args) {
    super(...args)
    this.assertType("value", RegExp)
  }
}

/** NullLiteral type. TODO: ???? */
export class NullLiteral extends Literal {
  @proto @readonly type = "NullLiteral"
  // TODO: ???
  @proto @readonly datatype = "null"
  constructor(...args) {
    super(...args)
    this.assertType("value", undefined)
  }
  toJS() {
    return "null"
  }
}

/** UndefinedLiteral type. TODO: ???? */
export class UndefinedLiteral extends Literal {
  @proto @readonly type = "UndefinedLiteral"
  @proto @readonly datatype = "undefined"
  constructor(...args) {
    super(...args)
    this.assertType("value", undefined)
  }
  toJS() {
    return "undefined"
  }
}

/** Keyword type.
 *  - `raw` is the raw input string
 *  - `value` is raw input converted into a JS-legal keyword.
 */
export class KeywordLiteral extends Literal {
  @proto @readonly type = "KeywordLiteral"
  @proto @readonly datatype = "string" // TODO???
  constructor(...args) {
    super(...args)
    this.assertType("raw", "string")
    this.assertType("value", "string")
  }
}

/** Abstract comment type. Useful for `instanceof`. */
export class Comment extends ASTNode {}

/** LineComment type.
 *  - `value` is text of the comment (may be empty string).
 *  - `commentSymbol` is the comment symbol used
 *  - `initialWhitespace` is whitespace between the commentSymbol and the `value`
 */
export class LineComment extends Comment {
  @proto @readonly type = "LineComment"
  constructor(...args) {
    super(...args)
    this.assertType("value", "string")
    this.assertType("commentSymbol", "string")
    this.assertType("initialWhitespace", "string")
  }
  toJS() {
    let { commentSymbol } = this
    if (commentSymbol !== "//") commentSymbol = `//${commentSymbol}`
    return `${commentSymbol}${this.initialWhitespace}${this.value}`
  }
}

/** ParserAnnotation type, used for parser annotations injected into the output.
 *  - `value` is text of the annotation.
 *  - `commentSymbol` is always `>>`
 */
export class ParserAnnotation extends LineComment {
  @proto @readonly type = "ParserAnnotation"
  @proto @readonly commentSymbol = ">>"
  @proto @readonly initialWhitespace = " "
}

/** BlockComment type.
 *  - `value` is the entire contents of the original comment, including initial space and newlines.
 */
export class BlockComment extends Comment {
  @proto @readonly type = "BlockComment"
  constructor(...args) {
    super(...args)
    this.assertType("value", "string")
  }
  toJS() {
    return `/*${this.value}*/`
  }
}

/** Parenthesized expression.
 *  - `expression` is the contained AST Expression. */
export class ParenthesizedExpression extends Expression {
  @proto @readonly type = "ParenthesizedExpression"
  constructor(...args) {
    super(...args)
    this.assertType("expression", Expression)
  }
  get datatype() {
    return this.expression.datatype
  }
  toJS() {
    return `(${this.expression.toJS()})`
  }
}

/** Not expression.
 *  - `expression` is the contained AST Expression.
 *  - `datatype` is ALWAYS boolean. */
export class NotExpression extends Expression {
  @proto @readonly type = "NotExpression"
  @proto @readonly datatype = "boolean"
  constructor(...args) {
    super(...args)
    this.assertType("expression", Expression)
  }
  toJS() {
    return `!${this.expression.toJS()}`
  }
}

/** InfixExpression:  <lhs> <operator> <rhs> */
export class InfixExpression extends Expression {
  @proto @readonly type = "InfixExpression"
  constructor(...args) {
    super(...args)
    this.assertType("lhs", Expression)
    this.assertType("operator", "string")
    this.assertType("rhs", Expression)
  }
  toJS() {
    return `${this.lhs.toJS()} ${this.operator.toJS()} ${this.rhs.toJS()}}`
  }
}

/** CoreMethodExpression:  calls a `spellCore` `method`.  Used for output languge independence.
 *  - `method` is spellcore method name.
 *  - `arguments` is a (possibly empty) list of Expressions.
 *  - Try to set `datatype` as string or getter if you can.
 */
export class CoreMethodExpression extends Expression {
  @proto @readonly type = "InfixExpression"
  constructor(...args) {
    super(...args)
    this.assertType("method", "string")
    this.assertArrayType("arguments", Expression)
  }
  toJS() {
    const args = this.arguments.map(arg => arg.toJS()).join(", ")
    return `spellCore.${this.method}(${args})`
  }
}

/** TypeExpression -- pointer to a Type object/scope.
 *  - `raw` is the original input string, unnormalized.
 *  - `name` is the normalized type name: Typecase, singular and dashes to underscores.
 *  - `plurality` (optional) is "singular", "plural" or `undefined`
 *  - `scope` (optional) is a pointer to the known type scope, if any
 *  TODO: ^^^ ???
 */
export class TypeExpression extends Expression {
  @proto @readonly type = "TypeExpression"
  @proto @readonly datatype = "Type"
  constructor(...args) {
    super(...args)
    this.assertType("raw", "string")
    this.assertType("name", "string")
  }

  /** Pointer to the known Scope for this type, if available. ??? */
  get scope() {
    return this.match.type
  }
}

/** VariableExpression -- pointer to a Variable object.
 *  - `raw` is the original input string, unnormalized.
 *  - `name` is the normalized type name: dashes and spaces converted to underscores.
 *  - `variable` (optional) is pointer to scope Variable, if there is one.
 *  - `plurality` (optional) is "singular", "plural" or `undefined`  // TODO: derive?
 */
export class VariableExpression extends Expression {
  @proto @readonly type = "VariableExpression"
  constructor(...args) {
    super(...args)
    this.assertType("raw", "string")
    this.assertType("name", "string")
  }
  // TODO: datatype according to Variable ?
  toJS() {
    return this.name
  }
}

/** ConstantExpression -- pointer to a Constant object.
 *  - `name` is the constant name (not normalized ???)
 *  - `value` is the constant string to output.
 *  - `constant` is pointer to scope Constant, if there is one.
 */
export class ConstantExpression extends Expression {
  @proto @readonly type = "ConstantExpression"
  @proto @readonly datatype = "string"
  constructor(...args) {
    super(...args)
    this.assertType("name", "string")
    this.assertType("value", "string")
  }
  toJS() {
    return this.value
  }
}

/** ThisLiteral type. */
export class ThisLiteral extends Literal {
  @proto @readonly type = "ThisLiteral"
  toJS() {
    return "this"
  }
}

/** PropertyLiteral -- identifier which refers to some property of an object.
 *  - `raw` is the input property name
 *  - `value` is the normalized property name.
 */
export class PropertyLiteral extends Literal {
  @proto @readonly type = "PropertyLiteral"
  @proto @readonly datatype = "string"
  constructor(...args) {
    super(...args)
    this.assertType("raw", "string")
    this.assertType("value", "string")
  }
}

/** PropertyExpression -- named property of some object.
 *  - `object` is the thing to get the property from, as an Expression.
 *  - `property` is the normalized property name.
 */
export class PropertyExpression extends Expression {
  @proto @readonly type = "PropertyExpression"
  constructor(...args) {
    super(...args)
    this.assertType("object", Expression)
    this.assertType("property", PropertyLiteral)
  }
  // TODO: datatype???
  toJS() {
    return `(${this.object.toJS()}).${this.property.toJS()}`
  }
}

/** ObjectLiteralProperty type
 *  - `property` is the normalized property name.
 *  - `value` (optional) is the property value.
 */
export class ObjectLiteralProperty extends ASTNode {
  @proto @readonly type = "ObjectLiteralProperty"
  constructor(...args) {
    super(...args)
    this.assertType("property", PropertyLiteral)
    if (this.value) this.assertType("value", Expression)
  }
  toJS() {
    // If no value, assume it's available as a local variable.
    if (!this.value) return this.property.toJS()
    return `${this.property.toJS()}: ${this.value.toJS()}`
  }
}

/** ObjectLiteral -- bag of properties.
 *  - `properties` is an array of PropertyValues
 */
export class ObjectLiteral extends Expression {
  @proto @readonly type = "PropertyExpression"
  @proto @readonly datatype = "object"
  constructor(...args) {
    super(...args)
    this.assertArrayType("properties", ObjectLiteralProperty)
  }
  // TODO: datatype???
  toJS() {
    return `{ ${this.properties.map(prop => prop.toJS()).join(", ")} }`
  }
}

/** Statement type.
 */
export class Statement extends ASTNode {
  @proto @readonly type = "Statement"
}

/** AssignmentStatement -- assign value to thing.
 *  - `thing` is an Expression.
 *  - `value` is an Expression
 *  - `isNewVariable` (optional) if true and `thing` is an Expression, we'll declare the var.
 */
export class AssignmentStatement extends Statement {
  @proto @readonly type = "Statement"
  constructor(...args) {
    super(...args)
    this.assertType("thing", Expression)
    this.assertType("value", Expression)
  }
  toJS() {
    const { thing, value, isNewVariable } = this
    const declarator = isNewVariable ? "let " : ""
    return `${declarator}${thing.toJS()} = ${value.toJS()}`
  }
}

/** ReturnStatement -- return value.
 *  - `value` is an Expression
 */
export class ReturnStatement extends Statement {
  @proto @readonly type = "Statement"
  constructor(...args) {
    super(...args)
    this.assertType("value", Expression)
  }
  toJS() {
    if (this.value instanceof UndefinedLiteral) return "return"
    return `return ${this.value.toJS()}`
  }
}
