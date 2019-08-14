import _ from "lodash"
import CodeMirror from 'codemirror'

import { Token, spellParser } from "./all.js"
//import blacklist from "../languages/spell/rules/identifier-blacklist.js"

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
    if (token instanceof Token.Word) {
//      if (blacklist[token.raw]) return "keyword"
      return "unknown"
    }
    if (token instanceof Token.Symbol) return "operator"
    if (token instanceof Token.Number) return "number"
    if (token instanceof Token.Comment) {
      if (token.commentSymbol === "##") return "comment header"
      return "comment"
    }
    if (token instanceof Token.Text) return "string"
    if (token instanceof Token.JSXElement) return null //""
    if (token instanceof Token.JSXEndTag) return null //""
    if (token instanceof Token.JSXAttribute) return null //""
    if (token instanceof Token.JSXExpression) return null //""
    if (token instanceof Token.Block) return null //""
  }

  return {
    startState() {
      return {
        // spell string for the current line
        string: undefined,
        // list of tokens for the current line
        tokens: undefined,
        // match tree for the current line
        tokens: undefined,
      }
    },

    copyState(state) {
      return { ...state }
    },

    token(stream, state) {
      // update state tokens if string changes
      if (stream.string !== state.string) {
        state.string = stream.string
        state.tokens = spellParser.tokenize(stream.string)
        state.results = spellParser.parse(stream.string, "statement")
//       console.warn(stream, "\n", state.results)
      }
      else {
//        console.info(stream)
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

