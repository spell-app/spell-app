import { describe, test, expect } from "vitest"
import * as Tokens from "./Tokens.ts"
import { Tokenizer } from "./Tokenizer.ts"

// Turn off tokenizer warnings in the console
// Tokenizer.prototype.logger.setDebugLevel("ERROR")

// FIXME:  this is only working with our default tokenizer...
const tokenizer = new Tokenizer()

//
//  Join tokens
//
describe("Tokenizer.join()", () => {
  test("works as expected with no start/end", () => {
    const tokens = tokenizer.tokenize("if (a) then b = 'some string' + 1")
    expect(Tokenizer.join(tokens)).toBe("if (a) then b = 'some string' + 1")
  })
  test("works as expected with start and no end", () => {
    const tokens = tokenizer.tokenize("if (a) then b = 'some string' + 1")
    expect(Tokenizer.join(tokens, 1)).toBe("(a) then b = 'some string' + 1")
  })
  test("works as expected with start and end", () => {
    const tokens = tokenizer.tokenize("if (a) then b = 'some string' + 1")
    expect(Tokenizer.join(tokens, 1, -1)).toBe("(a) then b = 'some string' +")
  })
})

// TODO: describe() blocks for the below...

//
// eatWhitespace()
//
describe("eatWhitespace()", () => {
  test("Doesn't match empty string", () => {
    const index = tokenizer.eatWhitespace("", 0)
    expect(index).toEqual(0)
  })

  test("Returns same position if not whitespace", () => {
    const index = tokenizer.eatWhitespace("x", 0)
    expect(index).toEqual(0)
  })

  test("Spaces are eaten", () => {
    const index = tokenizer.eatWhitespace("   x", 0)
    expect(index).toEqual(3)
  })

  test("Tabs are eaten", () => {
    const index = tokenizer.eatWhitespace("\t\t\tx", 0)
    expect(index).toEqual(3)
  })

  test("Mixed tabs and spaces are eaten", () => {
    const index = tokenizer.eatWhitespace("\t \tx", 0)
    expect(index).toEqual(3)
  })

  test("End of string is not a problem", () => {
    const index = tokenizer.eatWhitespace("\t \t", 0)
    expect(index).toEqual(3)
  })

  test("Should NOT eat newline", () => {
    const index = tokenizer.eatWhitespace("  \n x", 0)
    expect(index).toEqual(2)
  })

  test("Make sure it works in the middle of the string", () => {
    const index = tokenizer.eatWhitespace("  \n x", 3)
    expect(index).toEqual(4)
  })

  test("Doesn't go beyond specified end", () => {
    const index = tokenizer.eatWhitespace("       ", 3, 4)
    expect(index).toEqual(4)
  })

  test("Returns actual end if end is out of range", () => {
    const index = tokenizer.eatWhitespace("   ", 100)
    expect(index).toEqual(3)
  })

  test("Returns end if start > end", () => {
    const index = tokenizer.eatWhitespace("   ", 2, 1)
    expect(index).toEqual(1)
  })

  test("Works properly if end is out of range", () => {
    const index = tokenizer.eatWhitespace("   ", 0, 100)
    expect(index).toEqual(3)
  })
})

//
// matchWhitespace()
//
describe("matchWhitespace()", () => {
  test("Returns undefined for empty string", () => {
    const token = tokenizer.matchWhitespace("")
    expect(token).toEqual(undefined)
  })

  test("If no match, returns undefined", () => {
    const token = tokenizer.matchWhitespace("x")
    expect(token).toEqual(undefined)
  })

  test("Spaces are fine", () => {
    const token = tokenizer.matchWhitespace("   x")!
    expect(token).toBeInstanceOf(Tokens.Whitespace)
    expect(token.value).toBe("   ")
    expect(token.length).toBe(3)
    expect(token.end).toBe(3)
  })

  test("Tabs are fine", () => {
    const token = tokenizer.matchWhitespace("\t\t\tx")!
    expect(token).toBeInstanceOf(Tokens.Whitespace)
    expect(token.value).toBe("\t\t\t")
    expect(token.length).toBe(3)
    expect(token.end).toBe(3)
  })

  test("Mixed spaces and tabs are fine", () => {
    const token = tokenizer.matchWhitespace("\t \tx")!
    expect(token).toBeInstanceOf(Tokens.Whitespace)
    expect(token.value).toBe("\t \t")
    expect(token.length).toBe(3)
    expect(token.end).toBe(3)
  })

  test("Should NOT match newline", () => {
    const token = tokenizer.matchWhitespace("\n")!
    expect(token).toEqual(undefined)
  })

  test("Matches in the middle of the string", () => {
    const token = tokenizer.matchWhitespace("  \n x", 3)!
    expect(token).toBeInstanceOf(Tokens.Whitespace)
    expect(token.value).toBe(" ")
    expect(token.end).toBe(4)
  })

  test("Doesn't go beyond the end", () => {
    const token = tokenizer.matchWhitespace("       ", 3, 4)!
    expect(token).toBeInstanceOf(Tokens.Whitespace)
    expect(token.value).toBe(" ")
    expect(token.end).toBe(4)
  })

  test("Doesn't match if start > end", () => {
    const token = tokenizer.matchWhitespace("   ", 2, 1)!
    expect(token).toEqual(undefined)
  })

  test("Doesn't match if start is out of range", () => {
    const token = tokenizer.matchWhitespace("   ", 100)!
    expect(token).toEqual(undefined)
  })

  test("Matches if end is out of range", () => {
    const token = tokenizer.matchWhitespace("   ", 0, 100)!
    expect(token).toBeInstanceOf(Tokens.Whitespace)
    expect(token.value).toBe("   ")
    expect(token.end).toBe(3)
  })

  test("Whitespace at start `isIndent`", () => {
    const token = tokenizer.matchWhitespace(" ")!
    expect(token).toBeInstanceOf(Tokens.Indent)
    expect(token.value).toBe(" ")
    expect(token.end).toBe(1)
  })

  test("Whitespace after newline `isIndent`", () => {
    const token = tokenizer.matchWhitespace(" \n\t", 2)!
    expect(token).toBeInstanceOf(Tokens.Indent)
    expect(token.value).toBe("\t")
    expect(token.end).toBe(3)
  })

  test("Whitespace in middle of other stuff is not indent", () => {
    const token = tokenizer.matchWhitespace("x x", 1)!
    expect(token).toBeInstanceOf(Tokens.Whitespace)
    expect(token).not.toBeInstanceOf(Tokens.Indent)
    expect(token.value).toBe(" ")
    expect(token.end).toBe(2)
  })
})

//
// matchNewline()
//
describe("matchNewline()", () => {
  test("Returns undefined for empty string", () => {
    const token = tokenizer.matchNewline("")!
    expect(token).toEqual(undefined)
  })

  test("If no match, returns undefined", () => {
    const token = tokenizer.matchNewline("x")!
    expect(token).toEqual(undefined)
  })

  test("Matches at beginning of string", () => {
    const token = tokenizer.matchNewline("\nx")!
    expect(token).toBeInstanceOf(Tokens.Newline)
    expect(token.end).toBe(1)
  })

  test("Does not match spaces", () => {
    const token = tokenizer.matchNewline(" ")!
    expect(token).toEqual(undefined)
  })

  test("Does not match tabs", () => {
    const token = tokenizer.matchNewline("\t")!
    expect(token).toEqual(undefined)
  })

  test("Matches in the middle of the string", () => {
    const token = tokenizer.matchNewline("  \n x", 2)!
    expect(token).toBeInstanceOf(Tokens.Newline)
    expect(token.end).toBe(3)
  })

  test("Doesn't match incorrectly in the middle of the string", () => {
    const token = tokenizer.matchNewline("  \n x", 3)!
    expect(token).toEqual(undefined)
  })

  test("Doesn't go beyond the end", () => {
    const token = tokenizer.matchNewline("  \n x", 3, 4)!
    expect(token).toEqual(undefined)
  })

  test("Doesn't match if start > end", () => {
    const token = tokenizer.matchNewline("\n\n\n", 2, 1)!
    expect(token).toEqual(undefined)
  })

  test("Doesn't match if start is out of range", () => {
    const token = tokenizer.matchNewline("\n", 100)!
    expect(token).toEqual(undefined)
  })

  test("Matches if end is out of range", () => {
    const token = tokenizer.matchNewline("\n", 0, 100)!
    expect(token).toBeInstanceOf(Tokens.Newline)
    expect(token.end).toBe(1)
  })
})

//
// matchSymbol()
//
describe("matchSymbol()", () => {
  test("Doesn't match empty string.", () => {
    const token = tokenizer.matchSymbol("")!
    expect(token).toEqual(undefined)
  })

  test("Match a single character.", () => {
    const token = tokenizer.matchSymbol(":")!
    expect(token).toBeInstanceOf(Tokens.Symbol)
    expect(token.value).toBe(":")
    expect(token.raw).toBe(":")
    expect(token.end).toBe(1)
  })

  test("Doesn't match if start beyond the end", () => {
    const token = tokenizer.matchSymbol(":", 2)!
    expect(token).toEqual(undefined)
  })

  test("Doesn't match if start === end", () => {
    const token = tokenizer.matchSymbol(":", 2, 2)!
    expect(token).toEqual(undefined)
  })

  test("Doesn't match if start is out of range", () => {
    const token = tokenizer.matchSymbol(":", 100)!
    expect(token).toEqual(undefined)
  })

  test("Doesn't match if start is > end", () => {
    const token = tokenizer.matchSymbol(":::", 2, 1)!
    expect(token).toEqual(undefined)
  })

  test("Matches if end is out of range", () => {
    const token = tokenizer.matchSymbol(":", 0, 100)!
    expect(token).toBeInstanceOf(Tokens.Symbol)
    expect(token.value).toBe(":")
    expect(token.end).toBe(1)
  })
})

//
// matchWord()
//
describe("matchWord()", () => {
  test("Returns undefined for empty string", () => {
    const token = tokenizer.matchWord("")!
    expect(token).toEqual(undefined)
  })

  test("If no match, returns undefined", () => {
    const token = tokenizer.matchWord(":")!
    expect(token).toEqual(undefined)
  })

  test("Matches single letter at beginning of string", () => {
    const token = tokenizer.matchWord("x ")!
    expect(token).toBeInstanceOf(Tokens.Word)
    expect(token.value).toBe("x")
    expect(token.raw).toBe("x")
    expect(token.end).toBe(1)
  })

  test("Matches multiple letters at beginning of string", () => {
    const token = tokenizer.matchWord("xxxx ")!
    expect(token).toBeInstanceOf(Tokens.Word)
    expect(token.value).toBe("xxxx")
    expect(token.end).toBe(4)
  })

  test("Matches multiple letters, numbers, underscores at beginning of string", () => {
    const token = tokenizer.matchWord("xxxx-XXX_y ")!
    expect(token).toBeInstanceOf(Tokens.Word)
    expect(token.value).toBe("xxxx-XXX_y")
    expect(token.end).toBe(10)
  })

  test("Does not match leading number", () => {
    const token = tokenizer.matchWord("9a ")!
    expect(token).toEqual(undefined)
  })

  test("Does not match leading underscore", () => {
    const token = tokenizer.matchWord("_a ")!
    expect(token).toEqual(undefined)
  })

  test("Does not match leading dash", () => {
    const token = tokenizer.matchWord("-a ")!
    expect(token).toEqual(undefined)
  })

  test("Respects start parameter before match", () => {
    const token = tokenizer.matchWord("  xxx  ", 2)!
    expect(token).toBeInstanceOf(Tokens.Word)
    expect(token.value).toBe("xxx")
    expect(token.end).toBe(5)
  })

  test("Respects start parameter after match", () => {
    const token = tokenizer.matchWord("  xxx  ", 5)!
    expect(token).toEqual(undefined)
  })

  test("Doesn't go beyond the end", () => {
    const token = tokenizer.matchWord("   xxx", 3, 4)!
    expect(token).toBeInstanceOf(Tokens.Word)
    expect(token.value).toBe("x")
    expect(token.end).toBe(4)
  })

  test("Doesn't match if start > end", () => {
    const token = tokenizer.matchWord("xxx", 2, 1)!
    expect(token).toEqual(undefined)
  })

  test("Doesn't match if start is out of range", () => {
    const token = tokenizer.matchWord("xxx", 100)!
    expect(token).toEqual(undefined)
  })

  test("Matches if end is out of range", () => {
    const token = tokenizer.matchWord("xxx", 0, 100)!
    expect(token).toBeInstanceOf(Tokens.Word)
    expect(token.value).toBe("xxx")
    expect(token.end).toBe(3)
  })
})

//
// matchNumber()
//
describe("matchNumber()", () => {
  test("Returns undefined for empty string", () => {
    const token = tokenizer.matchNumber("")!
    expect(token).toEqual(undefined)
  })

  test("If no match, returns undefined", () => {
    const token = tokenizer.matchNumber("a")!
    expect(token).toEqual(undefined)
  })

  test("Matches integer at beginning of string", () => {
    const token = tokenizer.matchNumber("999 ")!
    expect(token).toBeInstanceOf(Tokens.Number)
    expect(token.value).toBe(999)
    expect(token.raw).toBe("999")
    expect(token.end).toBe(3)
  })

  test("Matches proper decimal at beginning of string", () => {
    const token = tokenizer.matchNumber("1.888 ")!
    expect(token).toBeInstanceOf(Tokens.Number)
    expect(token.value).toBe(1.888)
    expect(token.raw).toBe("1.888")
    expect(token.end).toBe(5)
  })

  test("Matches no-leading-zero decimal at beginning of string", () => {
    const token = tokenizer.matchNumber(".888 ")!
    expect(token).toBeInstanceOf(Tokens.Number)
    expect(token.value).toBe(0.888)
    expect(token.raw).toBe(".888")
    expect(token.end).toBe(4)
  })

  test("Ignores leading zeros at beginning of string", () => {
    const token = tokenizer.matchNumber("00888 ")!
    expect(token).toBeInstanceOf(Tokens.Number)
    expect(token.value).toBe(888)
    expect(token.raw).toBe("00888")
    expect(token.end).toBe(5)
  })

  test("Matches negative integer at beginning of string", () => {
    const token = tokenizer.matchNumber("-999 ")!
    expect(token).toBeInstanceOf(Tokens.Number)
    expect(token.value).toBe(-999)
    expect(token.raw).toBe("-999")
    expect(token.end).toBe(4)
  })

  test("Matches negative proper decimal at beginning of string", () => {
    const token = tokenizer.matchNumber("-1.888 ")!
    expect(token).toBeInstanceOf(Tokens.Number)
    expect(token.value).toBe(-1.888)
    expect(token.raw).toBe("-1.888")
    expect(token.end).toBe(6)
  })

  test("Matches no-leading-zero decimal at beginning of string", () => {
    const token = tokenizer.matchNumber("-.888 ")!
    expect(token).toBeInstanceOf(Tokens.Number)
    expect(token.value).toBe(-0.888)
    expect(token.raw).toBe("-.888")
    expect(token.end).toBe(5)
  })

  test("Ignores negative with leading zeros at beginning of string", () => {
    const token = tokenizer.matchNumber("-00888 ")!
    expect(token).toBeInstanceOf(Tokens.Number)
    expect(token.value).toBe(-888)
    expect(token.raw).toBe("-00888")
    expect(token.end).toBe(6)
  })

  test("Ignores `{negative}{space}{number} at beginning of string", () => {
    const token = tokenizer.matchNumber("- 00888 ")!
    expect(token).toEqual(undefined)
  })

  test("Matches in the middle of the string", () => {
    const token = tokenizer.matchNumber("  999  ", 2)!
    expect(token).toBeInstanceOf(Tokens.Number)
    expect(token.value).toBe(999)
    expect(token.end).toBe(5)
  })

  test("Doesn't match incorrectly in the middle of the string", () => {
    const token = tokenizer.matchNumber("  999  999", 5)!
    expect(token).toEqual(undefined)
  })

  test("Doesn't go beyond the end", () => {
    const token = tokenizer.matchNumber("   999", 3, 4)!
    expect(token).toBeInstanceOf(Tokens.Number)
    expect(token.value).toBe(9)
    expect(token.end).toBe(4)
  })

  test("Doesn't match if start > end", () => {
    const token = tokenizer.matchNumber("999", 2, 1)!
    expect(token).toEqual(undefined)
  })

  test("Doesn't match if start is out of range", () => {
    const token = tokenizer.matchNumber("999", 100)!
    expect(token).toEqual(undefined)
  })

  test("Matches if end is out of range", () => {
    const token = tokenizer.matchNumber("999", 1, 100)!
    expect(token).toBeInstanceOf(Tokens.Number)
    expect(token.value).toBe(99)
    expect(token.end).toBe(3)
  })
})

//
// matchText()
//
describe("matchText()", () => {
  test("Returns undefined for empty string", () => {
    const token = tokenizer.matchText("")!
    expect(token).toEqual(undefined)
  })

  test("If no match, returns undefined", () => {
    const token = tokenizer.matchText("a")!
    expect(token).toEqual(undefined)
  })

  test("Matches single quotes at beginning of string", () => {
    const token = tokenizer.matchText("'a'")!
    expect(token).toBeInstanceOf(Tokens.Text)
    expect(token.value).toBe("'a'")
    expect(token.innerText).toBe("a")
    expect(token.end).toBe(3)
  })

  test("Matches double quotes at beginning of string", () => {
    const token = tokenizer.matchText('"aaaa"')!
    expect(token).toBeInstanceOf(Tokens.Text)
    expect(token.value).toBe('"aaaa"')
    expect(token.raw).toBe('"aaaa"')
    expect(token.innerText).toBe("aaaa")
    expect(token.end).toBe(6)
  })

  test("Matches single quotes with escape at beginning of string", () => {
    const token = tokenizer.matchText("'a\\'a'")!
    expect(token).toBeInstanceOf(Tokens.Text)
    expect(token.value).toBe("'a\\'a'")
    expect(token.raw).toBe("'a\\'a'")
    expect(token.innerText).toBe("a\\'a")
    expect(token.end).toBe(6)
  })

  test("Matches double quotes with escape at beginning of string", () => {
    const token = tokenizer.matchText('"a\\"a"')!
    expect(token).toBeInstanceOf(Tokens.Text)
    expect(token.value).toBe('"a\\"a"')
    expect(token.raw).toBe('"a\\"a"')
    expect(token.innerText).toBe('a\\"a')
    expect(token.end).toBe(6)
  })

  test("Matches in the middle of the string", () => {
    const token = tokenizer.matchText("  'aaa'  ", 2)!
    expect(token).toBeInstanceOf(Tokens.Text)
    expect(token.value).toBe("'aaa'")
    expect(token.innerText).toBe("aaa")
    expect(token.end).toBe(7)
  })

  test("Doesn't match if unbalanced", () => {
    const token = tokenizer.matchText("'aaa")!
    expect(token).toEqual(undefined)
  })

  test("Doesn't go beyond the end", () => {
    const token = tokenizer.matchText("  'aaa'  ", 2, 4)!
    expect(token).toEqual(undefined)
  })

  test("Doesn't match if start > end", () => {
    const token = tokenizer.matchText("'aaa'", 2, 1)!
    expect(token).toEqual(undefined)
  })

  test("Doesn't match if start is out of range", () => {
    const token = tokenizer.matchText("'aaa'", 100)!
    expect(token).toEqual(undefined)
  })

  test("Matches if end is out of range", () => {
    const token = tokenizer.matchText("'aaa'", 0, 100)!
    expect(token).toBeInstanceOf(Tokens.Text)
    expect(token.value).toBe("'aaa'")
    expect(token.innerText).toBe("aaa")
    expect(token.end).toBe(5)
  })
})

//
// matchComment()
//
describe("matchComment()", () => {
  test("Returns undefined for empty string", () => {
    const token = tokenizer.matchComment("")!
    expect(token).toEqual(undefined)
  })

  test("If no match, returns undefined", () => {
    const token = tokenizer.matchComment("a")!
    expect(token).toEqual(undefined)
  })

  test("Matches `//` comment at beginning of string", () => {
    const token = tokenizer.matchComment("//comment here")!
    expect(token).toBeInstanceOf(Tokens.Comment)
    expect(token.value).toBe("comment here")
    expect(token.initialWhitespace).toBe("")
    expect(token.commentSymbol).toBe("//")
    expect(token.end).toBe(14)
  })

  test("Matches `--` comment at beginning of string", () => {
    const token = tokenizer.matchComment("-- comment here")!
    expect(token).toBeInstanceOf(Tokens.Comment)
    expect(token.value).toBe("comment here")
    expect(token.initialWhitespace).toBe(" ")
    expect(token.commentSymbol).toBe("--")
    expect(token.end).toBe(15)
  })

  test("Matches `##` comment at beginning of string", () => {
    const token = tokenizer.matchComment("##\tcomment here")!
    expect(token).toBeInstanceOf(Tokens.Comment)
    expect(token.value).toBe("comment here")
    expect(token.initialWhitespace).toBe("\t")
    expect(token.commentSymbol).toBe("##")
    expect(token.end).toBe(15)
  })

  test("Matches empty `//` comment", () => {
    const token = tokenizer.matchComment("//")!
    expect(token).toBeInstanceOf(Tokens.Comment)
    expect(token.value).toBe("")
    expect(token.initialWhitespace).toBe("")
    expect(token.commentSymbol).toBe("//")
    expect(token.end).toBe(2)
  })

  test("Matches empty `--` comment", () => {
    const token = tokenizer.matchComment("--")!
    expect(token).toBeInstanceOf(Tokens.Comment)
    expect(token.value).toBe("")
    expect(token.initialWhitespace).toBe("")
    expect(token.commentSymbol).toBe("--")
    expect(token.end).toBe(2)
  })

  test("Matches empty `##` comment", () => {
    const token = tokenizer.matchComment("##")!
    expect(token).toBeInstanceOf(Tokens.Comment)
    expect(token.value).toBe("")
    expect(token.initialWhitespace).toBe("")
    expect(token.commentSymbol).toBe("##")
    expect(token.end).toBe(2)
  })

  test("Matches in the middle of the string", () => {
    const token = tokenizer.matchComment("xxx//comment", 3)!
    expect(token).toBeInstanceOf(Tokens.Comment)
    expect(token.value).toBe("comment")
    expect(token.initialWhitespace).toBe("")
    expect(token.commentSymbol).toBe("//")
    expect(token.end).toBe(12)
  })

  test("Doesn't incorrectly match in the middle of the string", () => {
    const token = tokenizer.matchComment("xxx//comment\n", 4)!
    expect(token).toEqual(undefined)
  })

  test("Stops at newline", () => {
    const token = tokenizer.matchComment("//\tcomment here\n")!
    expect(token).toBeInstanceOf(Tokens.Comment)
    expect(token.value).toBe("comment here")
    expect(token.initialWhitespace).toBe("\t")
    expect(token.commentSymbol).toBe("//")
    expect(token.end).toBe(15)
  })

  test("Doesn't go beyond the end", () => {
    const token = tokenizer.matchComment("//\tcomment here\n", 0, 10)!
    expect(token).toBeInstanceOf(Tokens.Comment)
    expect(token.value).toBe("comment")
    expect(token.initialWhitespace).toBe("\t")
    expect(token.commentSymbol).toBe("//")
    expect(token.end).toBe(10)
  })

  test("Doesn't match if start > end", () => {
    const token = tokenizer.matchComment("//\tcomment here\n", 2, 1)!
    expect(token).toEqual(undefined)
  })

  test("Doesn't match if start is out of range", () => {
    const token = tokenizer.matchComment("//\tcomment here\n", 100)!
    expect(token).toEqual(undefined)
  })

  test("Matches if end is out of range", () => {
    const token = tokenizer.matchComment("//\tcomment here\n", 0, 100)!
    expect(token).toBeInstanceOf(Tokens.Comment)
    expect(token.value).toBe("comment here")
    expect(token.initialWhitespace).toBe("\t")
    expect(token.commentSymbol).toBe("//")
    expect(token.end).toBe(15)
  })
})

//
// matchJSXStartTag()
//
describe("matchJSXStartTag()", () => {
  test("Returns undefined for empty string", () => {
    const token = tokenizer.matchJSXStartTag("")!
    expect(token).toEqual(undefined)
  })

  test("If no match, returns undefined", () => {
    const token = tokenizer.matchJSXStartTag("a")!
    expect(token).toEqual(undefined)
  })

  test("Matches no-attribute start tag at beginning of string", () => {
    const token = tokenizer.matchJSXStartTag("<test>")!
    expect(token).toBeInstanceOf(Tokens.JSXElement)
    expect(token.tagName).toBe("test")
    expect(token.isUnaryTag).toBe(undefined)
    expect(token.children).toBe(undefined)
    expect(token.attributes).toBe(undefined)
    expect(token.end).toBe(6)
  })

  test("Matches no attribute unary tag at beginning of string", () => {
    const token = tokenizer.matchJSXStartTag("<test/>")!
    expect(token).toBeInstanceOf(Tokens.JSXElement)
    expect(token.tagName).toBe("test")
    expect(token.isUnaryTag).toBe(true)
    expect(token.children).toBe(undefined)
    expect(token.attributes).toBe(undefined)
    expect(token.end).toBe(7)
  })

  test("Does NOT match end tag at beginning of string", () => {
    const token = tokenizer.matchJSXStartTag("</test>")!
    expect(token).toEqual(undefined)
  })

  test("Matches start tag with attributes at beginning of string", () => {
    const token = tokenizer.matchJSXStartTag("<test a='a\\'a' bbb=1 c-0-a={tokens} d>")!
    expect(token).toBeInstanceOf(Tokens.JSXElement)
    expect(token.tagName).toBe("test")
    expect(token.isUnaryTag).toBe(undefined)
    expect(token.children).toBe(undefined)
    expect(token.end).toBe(38)

    const attributes = token.attributes!
    expect(attributes).toBeInstanceOf(Array)
    expect(attributes.length).toEqual(4)

    expect(attributes[0].name).toEqual("a")
    expect(attributes[0].value).toBeInstanceOf(Tokens.Text)
    expect(attributes[0].value.value).toEqual("'a\\'a'")

    expect(attributes[1].name).toEqual("bbb")
    expect(attributes[1].value).toBeInstanceOf(Tokens.Number)
    expect(attributes[1].value.value).toBe(1)

    expect(attributes[2].name).toEqual("c-0-a")
    expect(attributes[2].value).toBeInstanceOf(Tokens.JSXExpression)

    expect(attributes[3].name).toEqual("d")
    expect(attributes[3].value).toBe(undefined)
  })

  test("Matches unary tag with attributes at beginning of string", () => {
    const token = tokenizer.matchJSXStartTag("<test a='a\\'a' bbb=1 c-0-a={tokens} d/>")!
    expect(token).toBeInstanceOf(Tokens.JSXElement)
    expect(token.tagName).toBe("test")
    expect(token.isUnaryTag).toBe(true)
    expect(token.children).toBe(undefined)
    expect(token.end).toBe(39)

    const attributes = token.attributes!
    expect(attributes).toBeInstanceOf(Array)
    expect(attributes.length).toEqual(4)

    expect(attributes[0].name).toEqual("a")
    expect(attributes[0].value).toBeInstanceOf(Tokens.Text)
    expect(attributes[0].value.value).toEqual("'a\\'a'")

    expect(attributes[1].name).toEqual("bbb")
    expect(attributes[1].value).toBeInstanceOf(Tokens.Number)
    expect(attributes[1].value.value).toBe(1)

    expect(attributes[2].name).toEqual("c-0-a")
    expect(attributes[2].value).toBeInstanceOf(Tokens.JSXExpression)

    expect(attributes[3].name).toEqual("d")
    expect(attributes[3].value).toBe(undefined)
  })

  test("Matches in the middle of the string", () => {
    const token = tokenizer.matchJSXStartTag("xxx<test aprop/>xxx", 3)!
    expect(token).toBeInstanceOf(Tokens.JSXElement)
    expect(token.tagName).toBe("test")
    expect(token.isUnaryTag).toBe(true)
    expect(token.children).toBe(undefined)
    expect(token.attributes).toBeInstanceOf(Array)
    expect(token.attributes!.length).toEqual(1)
    expect(token.end).toBe(16)
  })

  test("Doesn't incorrectly match in the middle of the string", () => {
    const token = tokenizer.matchJSXStartTag("xxx<test aprop/>xxx", 4)!
    expect(token).toEqual(undefined)
  })

  test("Doesn't stop at newline", () => {
    const token = tokenizer.matchJSXStartTag("xxx<test aprop\n bprop/>xxx", 3)!
    expect(token).toBeInstanceOf(Tokens.JSXElement)
    expect(token.tagName).toBe("test")
    expect(token.isUnaryTag).toBe(true)
    expect(token.children).toBe(undefined)
    expect(token.attributes).toBeInstanceOf(Array)
    expect(token.attributes!.length).toEqual(2)
    expect(token.end).toBe(23)
  })

  test("Matches but doesn't go beyond the end", () => {
    const token = tokenizer.matchJSXStartTag("<test aprop\n bprop/>", 0, 10)!
    expect(token).toBeInstanceOf(Tokens.JSXElement)
    expect(token.tagName).toBe("test")
    expect(token.isUnaryTag).toBe(undefined)
    expect(token.error).toBe("No end >")
    expect(token.children).toBe(undefined)
    expect(token.attributes).toBeInstanceOf(Array)
    expect(token.attributes!.length).toEqual(1)
    expect(token.attributes![0].name).toEqual("apro")
    expect(token.end).toBe(10)
  })

  test("Doesn't match if start > end", () => {
    const token = tokenizer.matchJSXStartTag("xxx<test aprop\n bprop/>", 3, 2)!
    expect(token).toEqual(undefined)
  })

  test("Doesn't match if start is out of range", () => {
    const token = tokenizer.matchJSXStartTag("xxx<test aprop\n bprop/>", 100)!
    expect(token).toEqual(undefined)
  })

  test("Matches if end is out of range", () => {
    const token = tokenizer.matchJSXStartTag("xxx<test aprop\n bprop/>xxx", 3, 100)!
    expect(token).toBeInstanceOf(Tokens.JSXElement)
    expect(token.tagName).toBe("test")
    expect(token.isUnaryTag).toBe(true)
    expect(token.children).toBe(undefined)
    expect(token.attributes).toBeInstanceOf(Array)
    expect(token.attributes!.length).toEqual(2)
    expect(token.end).toBe(23)
  })
})

//
// matchJSXEndTag()
//
describe("matchJSXEndTag()", () => {
  test("Returns undefined for empty string", () => {
    const token = tokenizer.matchJSXEndTag("test", "")!
    expect(token).toEqual(undefined)
  })

  test("If no match, returns undefined", () => {
    const token = tokenizer.matchJSXEndTag("test", "a")!
    expect(token).toEqual(undefined)
  })

  test("Matches specified end tag at beginning of string", () => {
    const token = tokenizer.matchJSXEndTag("test", "</test>")!
    expect(token).toBeInstanceOf(Tokens.JSXEndTag)
    expect(token.tagName).toBe("test")
    expect(token.end).toBe(7)
  })

  test("Does not match different end tag at beginning of string", () => {
    const token = tokenizer.matchJSXEndTag("bad", "</test>")!
    expect(token).toBe(undefined)
  })

  test("Matches specified end tag in the middle of the string", () => {
    const token = tokenizer.matchJSXEndTag("test", "xxx</test>", 3)!
    expect(token).toBeInstanceOf(Tokens.JSXEndTag)
    expect(token.tagName).toBe("test")
    expect(token.end).toBe(10)
  })

  test("Does not incorrectly match in the middle of the string", () => {
    const token = tokenizer.matchJSXEndTag("test", "xxx</test>", 2)!
    expect(token).toBe(undefined)
  })

  test("Doesn't match if start > end", () => {
    const token = tokenizer.matchJSXEndTag("test", "xxx</test>", 3, 2)!
    expect(token).toEqual(undefined)
  })

  test("Doesn't match if start is out of range", () => {
    const token = tokenizer.matchJSXEndTag("test", "xxx</test>", 100)!
    expect(token).toEqual(undefined)
  })

  test("Matches if end is out of range", () => {
    const token = tokenizer.matchJSXEndTag("test", "xxx</test>", 3, 100)!
    expect(token).toBeInstanceOf(Tokens.JSXEndTag)
    expect(token.tagName).toBe("test")
    expect(token.end).toBe(10)
  })
})

//
// matchJSXAttribute()
//
describe("matchJSXAttribute()", () => {
  test("Returns undefined for empty string", () => {
    const token = tokenizer.matchJSXAttribute("")!
    expect(token).toEqual(undefined)
  })

  test("If no match, returns undefined", () => {
    const token = tokenizer.matchJSXAttribute(":")!
    expect(token).toEqual(undefined)
  })

  test("Matches no-value attribute at beginning of string", () => {
    const token = tokenizer.matchJSXAttribute("xyz ")!
    expect(token).toBeInstanceOf(Tokens.JSXAttribute)
    expect(token.name).toEqual("xyz")
    expect(token.value).toEqual(undefined)
    expect(token.end).toEqual(4)
  })

  test("Matches string attribute at beginning of string", () => {
    const token = tokenizer.matchJSXAttribute("xyz='abc' ")!
    expect(token).toBeInstanceOf(Tokens.JSXAttribute)
    expect(token.name).toEqual("xyz")
    expect(token.value).toBeInstanceOf(Tokens.Text)
    expect(token.value.value).toEqual("'abc'")
    expect(token.end).toEqual(10)
  })

  test("Matches number attribute at beginning of string", () => {
    const token = tokenizer.matchJSXAttribute("xyz=0.33 ")!
    expect(token).toBeInstanceOf(Tokens.JSXAttribute)
    expect(token.name).toEqual("xyz")
    expect(token.value).toBeInstanceOf(Tokens.Number)
    expect(token.value.value).toBe(0.33)
    expect(token.end).toEqual(9)
  })

  test("Matches JSX Expression attribute at beginning of string", () => {
    const token = tokenizer.matchJSXAttribute("xyz={foo bar baz} ")!
    expect(token).toBeInstanceOf(Tokens.JSXAttribute)
    expect(token.name).toEqual("xyz")
    expect(token.value).toBeInstanceOf(Tokens.JSXExpression)
    expect(token.value.contents).toEqual("foo bar baz")
    expect(token.end).toEqual(18)
  })

  test("Matches identifier attribute at beginning of string", () => {
    const token = tokenizer.matchJSXAttribute("xyz=foo ")!
    expect(token).toBeInstanceOf(Tokens.JSXAttribute)
    expect(token.name).toEqual("xyz")
    expect(token.value).toBeInstanceOf(Tokens.JSXExpression)
    expect(token.value.contents.value).toEqual("foo")
    expect(token.end).toEqual(8)
  })

  test("Matches no-value attribute in the middle of the string", () => {
    const token = tokenizer.matchJSXAttribute("...xyz ", 3)!
    expect(token).toBeInstanceOf(Tokens.JSXAttribute)
    expect(token.name).toEqual("xyz")
    expect(token.value).toEqual(undefined)
    expect(token.end).toEqual(7)
  })

  test("Matches string attribute in the middle of the string", () => {
    const token = tokenizer.matchJSXAttribute("...xyz='abc' ", 3)!
    expect(token).toBeInstanceOf(Tokens.JSXAttribute)
    expect(token.name).toEqual("xyz")
    expect(token.value).toBeInstanceOf(Tokens.Text)
    expect(token.value.value).toEqual("'abc'")
    expect(token.end).toEqual(13)
  })

  test("Matches number attribute in the middle of the string", () => {
    const token = tokenizer.matchJSXAttribute("...xyz=0.33 ", 3)!
    expect(token).toBeInstanceOf(Tokens.JSXAttribute)
    expect(token.name).toEqual("xyz")
    expect(token.value).toBeInstanceOf(Tokens.Number)
    expect(token.value.value).toEqual(0.33)
    expect(token.end).toEqual(12)
  })

  test("Matches JSX Expression attribute in the middle of the string", () => {
    const token = tokenizer.matchJSXAttribute("...xyz={foo bar baz} ", 3)!
    expect(token).toBeInstanceOf(Tokens.JSXAttribute)
    expect(token.name).toEqual("xyz")
    expect(token.value).toBeInstanceOf(Tokens.JSXExpression)
    expect(token.value.contents).toEqual("foo bar baz")
    expect(token.end).toEqual(21)
  })

  test("Matches identifier attribute in the middle of the string", () => {
    const token = tokenizer.matchJSXAttribute("...xyz=foo ", 3)!
    expect(token).toBeInstanceOf(Tokens.JSXAttribute)
    expect(token.name).toEqual("xyz")
    expect(token.value).toBeInstanceOf(Tokens.JSXExpression)
    expect(token.value.contents.value).toEqual("foo")
    expect(token.end).toEqual(11)
  })

  test("Doesn't go beyond the end", () => {
    const token = tokenizer.matchJSXAttribute("...xyz ", 3, 4)!
    expect(token).toBeInstanceOf(Tokens.JSXAttribute)
    expect(token.name).toEqual("x")
    expect(token.value).toEqual(undefined)
    expect(token.end).toEqual(4)
  })

  test("Doesn't match if start > end", () => {
    const token = tokenizer.matchJSXAttribute("xxx", 2, 1)!
    expect(token).toEqual(undefined)
  })

  test("Doesn't match if start is out of range", () => {
    const token = tokenizer.matchJSXAttribute("xxx", 100)!
    expect(token).toEqual(undefined)
  })

  test("Matches if end is out of range", () => {
    const token = tokenizer.matchJSXAttribute("xyz={foo bar baz} ")!
    expect(token).toBeInstanceOf(Tokens.JSXAttribute)
    expect(token.name).toEqual("xyz")
    expect(token.value).toBeInstanceOf(Tokens.JSXExpression)
    expect(token.value.contents).toEqual("foo bar baz")
    expect(token.end).toEqual(18)
  })
})

//
// matchJSXChild()
//
describe("matchJSXChild()", () => {
  test("Returns undefined for empty string", () => {
    const token = tokenizer.matchJSXChild("foo", "")!
    expect(token).toEqual(undefined)
  })

  test("If no match, returns undefined", () => {
    const token = tokenizer.matchJSXChild("foo", ":")!
    expect(token).toEqual(undefined)
  })

  test("Matches JSX end tag at beginning of string", () => {
    const token = tokenizer.matchJSXChild("foo", "</foo>")! as Tokens.JSXEndTag
    expect(token).toBeInstanceOf(Tokens.JSXEndTag)
    expect(token.tagName).toBe("foo")
    expect(token.end).toBe(6)
  })

  test("Matches text & whitespace at beginning of string w/end delimiter", () => {
    const token = tokenizer.matchJSXChild("foo", " some text here <")! as Tokens.JSXText
    expect(token).toBeInstanceOf(Tokens.JSXText)
    expect(token.value).toBe(" some text here ")
    expect(token.quotedText).toBe('"some text here"')
    expect(token.end).toEqual(16)
  })

  test("Does NOT matches text & whitespace at beginning of string w/OUT end delimiter", () => {
    const token = tokenizer.matchJSXChild("foo", " some text here")!
    expect(token).toBe(undefined)
  })

  test("Matches JSX element at beginning of string", () => {
    const token = tokenizer.matchJSXChild("foo", "<bar/>  ")! as Tokens.JSXElement
    expect(token).toBeInstanceOf(Tokens.JSXElement)
    expect(token.tagName).toEqual("bar")
    expect(token.end).toEqual(6)
  })

  test("Matches JSX Expression at beginning of string", () => {
    const token = tokenizer.matchJSXChild("foo", "{ foo bar baz } ")! as Tokens.JSXExpression
    expect(token).toBeInstanceOf(Tokens.JSXExpression)
    expect(token.contents).toEqual(" foo bar baz ")
    expect(token.end).toEqual(15)
  })

  test("Matches JSX end tag in the middle of string", () => {
    const token = tokenizer.matchJSXChild("foo", "...</foo>", 3)! as Tokens.JSXEndTag
    expect(token).toBeInstanceOf(Tokens.JSXEndTag)
    expect(token.tagName).toBe("foo")
    expect(token.end).toBe(9)
  })

  test("Matches text & whitespace in the middle of string w/end delimiter", () => {
    const token = tokenizer.matchJSXChild("foo", "...some text here <", 3)! as Tokens.JSXText
    expect(token).toBeInstanceOf(Tokens.JSXText)
    expect(token.value).toBe("some text here ")
    expect(token.quotedText).toBe('"some text here"')
    expect(token.end).toEqual(18)
  })

  test("Does NOT matches text & whitespace in the middle of string w/OUT end delimiter", () => {
    const token = tokenizer.matchJSXChild("foo", "...some text here", 3)!
    expect(token).toBe(undefined)
  })

  test("Matches JSX element in the middle of string", () => {
    const token = tokenizer.matchJSXChild("foo", "...<bar/>  ", 3)! as Tokens.JSXElement
    expect(token).toBeInstanceOf(Tokens.JSXElement)
    expect(token.tagName).toEqual("bar")
    expect(token.end).toEqual(9)
  })

  test("Matches JSX Expression in the middle of string", () => {
    const token = tokenizer.matchJSXChild("foo", "...{ foo bar baz } ", 3)! as Tokens.JSXExpression
    expect(token).toBeInstanceOf(Tokens.JSXExpression)
    expect(token.contents).toEqual(" foo bar baz ")
    expect(token.end).toEqual(18)
  })

  test("Doesn't go beyond the end", () => {
    const token = tokenizer.matchJSXChild("foo", "...{abc}", 3, 4)!
    expect(token).toBe(undefined)
  })

  test("Doesn't match if start > end", () => {
    const token = tokenizer.matchJSXChild("foo", "xxx", 2, 1)!
    expect(token).toEqual(undefined)
  })

  test("Doesn't match if start is out of range", () => {
    const token = tokenizer.matchJSXChild("foo", "xxx", 100)!
    expect(token).toEqual(undefined)
  })

  test("Matches if end is out of range", () => {
    const token = tokenizer.matchJSXChild("foo", "</foo>", 0, 100)! as Tokens.JSXEndTag
    expect(token).toBeInstanceOf(Tokens.JSXEndTag)
    expect(token.tagName).toBe("foo")
    expect(token.end).toBe(6)
  })
})
