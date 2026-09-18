//
//  ## Master import file for the tokenizer.
//
//  NOTE: token classes stay behind the `Tokens` namespace rather than being flattened --
//  names like `Token.Word` / `Token.Number` are generic enough to collide at the top level.
//

/** All token classes, e.g. `Tokens.Word`, `Tokens.Number`. */
export * as Tokens from "./Tokens"

/** Base `Token` class, flattened since it is used constantly as a type. */
export { Token } from "./Tokens"

export * from "./Tokenizer"
