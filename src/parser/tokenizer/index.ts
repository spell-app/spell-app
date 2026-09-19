//
//  ## Master import file for the tokenizer.
//
//  NOTE: token classes stay behind the `Tokens` namespace rather than being flattened --
//  names like `Token.Word` / `Token.Number` are generic enough to collide at the top level.
//

export * from "./tokenizer.types"

/** Base `Token` class, flattened since it is used frequently as a type. */
export { Token } from "./Tokens"
/** Access all other tokens as `Tokens.Number` etc. */
export * as Tokens from "./Tokens"

export * from "./Tokenizer"
