/**
 * The `methods` rule module:  dynamic method definitions (`to foo ...`, `animation ...`) and their call sites,
 * quoted ad-hoc expressions on a type (`a thing "..." if`), and the method-signature / method-arg rules they share.
 * - A definition registers its call-site rule as it parses:  a `DynamicMethodRule`, `MethodPostfixRule` or
 *   `MethodInfixRule`, `specialize()`d -- see `MethodDefinition.getRule()`.
 * - One rule per file, each registering itself on `methods` (`methods.parser.ts`) as it loads.
 * - NOTE: the rule files are listed in TIE-BREAK order:  when two rules match the same words with the same
 *   `priority` and length, the one registered first wins.  Moving a line here can change what parses.
 */
export * from "./methods.parser"
export * from "./methods.shared"
export * from "./DynamicMethodRule"
export * from "./MethodPostfixRule"
export * from "./MethodInfixRule"
export * from "./MethodDefinition"
export * from "./MethodKeyword"
export * from "./VarMethodArg"
export * from "./ValuedVarMethodArg"
export * from "./TypeMethodArg"
export * from "./BareTypeArg"
export * from "./TypedMethodArg"
export * from "./WithPropsArg"
export * from "./MethodSignature"
export * from "./QuotedMethodSignature"
export * from "./ToDoSomething"
export * from "./CreateAnimation"
export * from "./QuotedTypeExpression"
