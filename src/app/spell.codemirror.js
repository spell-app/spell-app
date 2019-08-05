import _ from "lodash"
import CodeMirror from 'codemirror'

import { Token, spellParser } from "./all.js"

CodeMirror.defineMode("spell", function(codeMirrorConfig, modeConfig) {


  // Return the token that starts at numeric offset
  function getToken(tokens, offset) {
    for (let token of tokens) {
      if (token.offset >= offset) return token
    }
  }

  function advanceStreamPastToken(stream, token) {
    const length = token.raw.length
    for (let i = 0; i < length; i++) stream.next()
  }

  function getTokenType(token) {
    if (token instanceof Token.Word) return "none"
    if (token instanceof Token.Symbol) return "operator"
    if (token instanceof Token.Number) return "number"
    if (token instanceof Token.Comment) return "comment"
    if (token instanceof Token.Text) return "string"
    if (token instanceof Token.JSXElement) return ""
    if (token instanceof Token.JSXEndTag) return ""
    if (token instanceof Token.JSXAttribute) return ""
    if (token instanceof Token.JSXExpression) return ""
    if (token instanceof Token.Block) return ""
  }

  return {
    startState() {
      return {
        // current string that matches `tokens`
        string: undefined,
        // list of tokens for string above
        tokens: undefined
      }
    },

//     copyState(state) {
//       return { ...state }
//     },

    token(stream, state) {
      // update state tokens if string changes
      if (stream.string !== state.string) {
        state.string = stream.string
        state.tokens = spellParser.tokenize(stream.string)
      // console.warn(stream, state.tokens)
      }
      // eat whitespace outside of tokens
      const startPosition = stream.pos
      stream.eatSpace()
      if (stream.pos !== startPosition) return null

      const token = getToken(state.tokens, stream.pos)
      if (token) {
        // console.info("matched ", token, length)
        advanceStreamPastToken(stream, token)
        return getTokenType(token)
      }
      else {
        stream.skipToEnd()
      }
    }
  }
})
CodeMirror.defineMIME("text/spell", "spell");
CodeMirror.defineMIME("text/x-spell", "spell");

