import {
  Token,
  Tokenizer
} from "./all.js";

// Turn off tokenizer warnings in the console
Tokenizer.prototype.logger.setDebugLevel("ERROR");

// FIXME:  this is only working with our default tokenizer...
const tokenizer = new Tokenizer();


//
//  Join tokens
//
describe("Tokenizer.join()", () => {
  test("works as expected with no start/end", () => {
    const tokens = tokenizer.tokenize("if (a) then b = 'some string' + 1");
    expect(Tokenizer.join(tokens)).toBe("if (a) then b = 'some string' + 1");
  });
  test("works as expected with start and no end", () => {
    const tokens = tokenizer.tokenize("if (a) then b = 'some string' + 1");
    expect(Tokenizer.join(tokens, 1)).toBe("(a) then b = 'some string' + 1");
  });
  test("works as expected with start and end", () => {
    const tokens = tokenizer.tokenize("if (a) then b = 'some string' + 1");
    expect(Tokenizer.join(tokens, 1, -1)).toBe("(a) then b = 'some string' +");
  });
});


//TODO: describe() blocks for the below...

//
// eatWhitespace()
//
test("eatWhitespace():  Doesn't match empty string", () => {
  let index = tokenizer.eatWhitespace("", 0);
  expect(index).toEqual(0);
});

test("eatWhitespace():  Returns same position if not whitespace", () => {
  let index = tokenizer.eatWhitespace("x", 0);
  expect(index).toEqual(0);
});

test("eatWhitespace():  Spaces are eaten", () => {
  let index = tokenizer.eatWhitespace("   x", 0);
  expect(index).toEqual(3);
});

test("eatWhitespace():  Tabs are eaten", () => {
  let index = tokenizer.eatWhitespace("\t\t\tx", 0);
  expect(index).toEqual(3);
});

test("eatWhitespace():  Mixed tabs and spaces are eaten", () => {
  let index = tokenizer.eatWhitespace("\t \tx", 0);
  expect(index).toEqual(3);
});

test("eatWhitespace():  End of string is not a problem", () => {
  let index = tokenizer.eatWhitespace("\t \t", 0);
  expect(index).toEqual(3);
});

test("eatWhitespace():  Should NOT eat newline", () => {
  let index = tokenizer.eatWhitespace("  \n x", 0);
  expect(index).toEqual(2);
});

test("eatWhitespace():  Make sure it works in the middle of the string", () => {
  let index = tokenizer.eatWhitespace("  \n x", 3);
  expect(index).toEqual(4);
});

test("eatWhitespace():  Doesn't go beyond specified end", () => {
  let index = tokenizer.eatWhitespace("       ", 3, 4);
  expect(index).toEqual(4);
});

test("eatWhitespace():  Returns actual end if end is out of range", () => {
  let index = tokenizer.eatWhitespace("   ", 100);
  expect(index).toEqual(3);
});

test("eatWhitespace():  Returns end if start > end", () => {
  let index = tokenizer.eatWhitespace("   ", 2, 1);
  expect(index).toEqual(1);
});

test("eatWhitespace():  Works properly if end is out of range", () => {
  let index = tokenizer.eatWhitespace("   ", 0, 100);
  expect(index).toEqual(3);
});

//
// matchWhitespace()
//
test("matchWhitespace():  Returns undefined for empty string", () => {
  let token = tokenizer.matchWhitespace("");
  expect(token).toEqual(undefined);
});

test("matchWhitespace():  If no match, returns undefined", () => {
  let token = tokenizer.matchWhitespace("x");
  expect(token).toEqual(undefined);
});

test("matchWhitespace():  Spaces are fine", () => {
  let token = tokenizer.matchWhitespace("   x");
  expect(token).toBeInstanceOf(Token.Whitespace);
  expect(token.value).toBe("   ");
  expect(token.length).toBe(3);
  expect(token.end).toBe(3);
});

test("matchWhitespace():  Tabs are fine", () => {
  let token = tokenizer.matchWhitespace("\t\t\tx");
  expect(token).toBeInstanceOf(Token.Whitespace);
  expect(token.value).toBe("\t\t\t");
  expect(token.length).toBe(3);
  expect(token.end).toBe(3);
});

test("matchWhitespace():  Mixed spaces and tabs are fine", () => {
  let token = tokenizer.matchWhitespace("\t \tx");
  expect(token).toBeInstanceOf(Token.Whitespace);
  expect(token.value).toBe("\t \t");
  expect(token.length).toBe(3);
  expect(token.end).toBe(3);
});

test("matchWhitespace():  Should NOT match newline", () => {
  let token = tokenizer.matchWhitespace("\n");
  expect(token).toEqual(undefined);
});

test("matchWhitespace():  Matches in the middle of the string", () => {
  let token = tokenizer.matchWhitespace("  \n x", 3);
  expect(token).toBeInstanceOf(Token.Whitespace);
  expect(token.value).toBe(" ");
  expect(token.end).toBe(4);
});

test("matchWhitespace():  Doesn't go beyond the end", () => {
  let token = tokenizer.matchWhitespace("       ", 3, 4);
  expect(token).toBeInstanceOf(Token.Whitespace);
  expect(token.value).toBe(" ");
  expect(token.end).toBe(4);
});

test("matchWhitespace():  Doesn't match if start > end", () => {
  let token = tokenizer.matchWhitespace("   ", 2, 1);
  expect(token).toEqual(undefined);
});

test("matchWhitespace():  Doesn't match if start is out of range", () => {
  let token = tokenizer.matchWhitespace("   ", 100);
  expect(token).toEqual(undefined);
});

test("matchWhitespace():  Matches if end is out of range", () => {
  let token = tokenizer.matchWhitespace("   ", 0, 100);
  expect(token).toBeInstanceOf(Token.Whitespace);
  expect(token.value).toBe("   ");
  expect(token.end).toBe(3);
});

test("matchWhitespace():  Whitespace at start `isIndent`", () => {
  let token = tokenizer.matchWhitespace(" ");
  expect(token).toBeInstanceOf(Token.Indent);
  expect(token.value).toBe(" ");
  expect(token.end).toBe(1);
});

test("matchWhitespace():  Whitespace after newline `isIndent`", () => {
  let token = tokenizer.matchWhitespace(" \n\t", 2);
  expect(token).toBeInstanceOf(Token.Indent);
  expect(token.value).toBe("\t");
  expect(token.end).toBe(3);
});

test("matchWhitespace():  Whitespace in middle of other stuff is not indent", () => {
  let token = tokenizer.matchWhitespace("x x", 1);
  expect(token).toBeInstanceOf(Token.Whitespace);
  expect(token).not.toBeInstanceOf(Token.Indent);
  expect(token.value).toBe(" ");
  expect(token.end).toBe(2);
});

//
// matchNewline()
//
test("matchNewline():  Returns undefined for empty string", () => {
  let token = tokenizer.matchNewline("");
  expect(token).toEqual(undefined);
});

test("matchNewline():  If no match, returns undefined", () => {
  let token = tokenizer.matchNewline("x");
  expect(token).toEqual(undefined);
});

test("matchNewline():  Matches at beginning of string", () => {
  let token = tokenizer.matchNewline("\nx");
  expect(token).toBeInstanceOf(Token.Newline);
  expect(token.end).toBe(1);
});

test("matchNewline():  Does not match spaces", () => {
  let token = tokenizer.matchNewline(" ");
  expect(token).toEqual(undefined);
});

test("matchNewline():  Does not match tabs", () => {
  let token = tokenizer.matchNewline("\t");
  expect(token).toEqual(undefined);
});

test("matchNewline():  Matches in the middle of the string", () => {
  let token = tokenizer.matchNewline("  \n x", 2);
  expect(token).toBeInstanceOf(Token.Newline);
  expect(token.end).toBe(3);
});

test("matchNewline():  Doesn't match incorrectly in the middle of the string", () => {
  let token = tokenizer.matchNewline("  \n x", 3);
  expect(token).toEqual(undefined);
});

test("matchNewline():  Doesn't go beyond the end", () => {
  let token = tokenizer.matchNewline("  \n x", 3, 4);
  expect(token).toEqual(undefined);
});

test("matchNewline():  Doesn't match if start > end", () => {
  let token = tokenizer.matchNewline("\n\n\n", 2, 1);
  expect(token).toEqual(undefined);
});

test("matchNewline():  Doesn't match if start is out of range", () => {
  let token = tokenizer.matchNewline("\n", 100);
  expect(token).toEqual(undefined);
});

test("matchNewline():  Matches if end is out of range", () => {
  let token = tokenizer.matchNewline("\n", 0, 100);
  expect(token).toBeInstanceOf(Token.Newline);
  expect(token.end).toBe(1);
});

//
// matchSymbol()
//
test("matchSymbol():  Doesn't match empty string.", () => {
  let token = tokenizer.matchSymbol("");
  expect(token).toEqual(undefined);
});

test("matchSymbol():  Match a single character.", () => {
  let token = tokenizer.matchSymbol(":");
  expect(token).toBeInstanceOf(Token.Symbol);
  expect(token.value).toBe(":");
  expect(token.raw).toBe(":");
  expect(token.end).toBe(1);
});

test("matchSymbol():  Doesn't match if start beyond the end", () => {
  let token = tokenizer.matchSymbol(":", 2);
  expect(token).toEqual(undefined);
});

test("matchSymbol():  Doesn't match if start === end", () => {
  let token = tokenizer.matchSymbol(":", 2, 2);
  expect(token).toEqual(undefined);
});

test("matchSymbol():  Doesn't match if start is out of range", () => {
  let token = tokenizer.matchSymbol(":", 100);
  expect(token).toEqual(undefined);
});

test("matchSymbol():  Doesn't match if start is > end", () => {
  let token = tokenizer.matchSymbol(":::", 2, 1);
  expect(token).toEqual(undefined);
});

test("matchSymbol():  Matches if end is out of range", () => {
  let token = tokenizer.matchSymbol(":", 0, 100);
  expect(token).toBeInstanceOf(Token.Symbol);
  expect(token.value).toBe(":");
  expect(token.end).toBe(1);
});

//
// matchWord()
//
test("matchWord():  Returns undefined for empty string", () => {
  let token = tokenizer.matchWord("");
  expect(token).toEqual(undefined);
});

test("matchWord():  If no match, returns undefined", () => {
  let token = tokenizer.matchWord(":");
  expect(token).toEqual(undefined);
});

test("matchWord():  Matches single letter at beginning of string", () => {
  let token = tokenizer.matchWord("x ");
  expect(token).toBeInstanceOf(Token.Word);
  expect(token.value).toBe("x");
  expect(token.raw).toBe("x");
  expect(token.end).toBe(1);
});

test("matchWord():  Matches multiple letters at beginning of string", () => {
  let token = tokenizer.matchWord("xxxx ");
  expect(token).toBeInstanceOf(Token.Word);
  expect(token.value).toBe("xxxx");
  expect(token.end).toBe(4);
});

test("matchWord():  Matches multiple letters, numbers, underscores at beginning of string", () => {
  let token = tokenizer.matchWord("xxxx-XXX_y ");
  expect(token).toBeInstanceOf(Token.Word);
  expect(token.value).toBe("xxxx-XXX_y");
  expect(token.end).toBe(10);
});

test("matchWord():  Does not match leading number", () => {
  let token = tokenizer.matchWord("9a ");
  expect(token).toEqual(undefined);
});

test("matchWord():  Does not match leading underscore", () => {
  let token = tokenizer.matchWord("_a ");
  expect(token).toEqual(undefined);
});

test("matchWord():  Does not match leading dash", () => {
  let token = tokenizer.matchWord("-a ");
  expect(token).toEqual(undefined);
});

test("matchWord():  Respects start parameter before match", () => {
  let token = tokenizer.matchWord("  xxx  ", 2);
  expect(token).toBeInstanceOf(Token.Word);
  expect(token.value).toBe("xxx");
  expect(token.end).toBe(5);
});

test("matchWord():  Respects start parameter after match", () => {
  let token = tokenizer.matchWord("  xxx  ", 5);
  expect(token).toEqual(undefined);
});

test("matchWord():  Doesn't go beyond the end", () => {
  let token = tokenizer.matchWord("   xxx", 3, 4);
  expect(token).toBeInstanceOf(Token.Word);
  expect(token.value).toBe("x");
  expect(token.end).toBe(4);
});

test("matchWord():  Doesn't match if start > end", () => {
  let token = tokenizer.matchWord("xxx", 2, 1);
  expect(token).toEqual(undefined);
});

test("matchWord():  Doesn't match if start is out of range", () => {
  let token = tokenizer.matchWord("xxx", 100);
  expect(token).toEqual(undefined);
});

test("matchWord():  Matches if end is out of range", () => {
  let token = tokenizer.matchWord("xxx", 0, 100);
  expect(token).toBeInstanceOf(Token.Word);
  expect(token.value).toBe("xxx");
  expect(token.end).toBe(3);
});

//
// matchNumber()
//
test("matchNumber():  Returns undefined for empty string", () => {
  let token = tokenizer.matchNumber("");
  expect(token).toEqual(undefined);
});

test("matchNumber():  If no match, returns undefined", () => {
  let token = tokenizer.matchNumber("a");
  expect(token).toEqual(undefined);
});

test("matchNumber():  Matches integer at beginning of string", () => {
  let token = tokenizer.matchNumber("999 ");
  expect(token).toBeInstanceOf(Token.Number);
  expect(token.value).toBe(999);
  expect(token.raw).toBe("999");
  expect(token.end).toBe(3);
});

test("matchNumber():  Matches proper decimal at beginning of string", () => {
  let token = tokenizer.matchNumber("1.888 ");
  expect(token).toBeInstanceOf(Token.Number);
  expect(token.value).toBe(1.888);
  expect(token.raw).toBe("1.888");
  expect(token.end).toBe(5);
});

test("matchNumber():  Matches no-leading-zero decimal at beginning of string", () => {
  let token = tokenizer.matchNumber(".888 ");
  expect(token).toBeInstanceOf(Token.Number);
  expect(token.value).toBe(0.888);
  expect(token.raw).toBe(".888");
  expect(token.end).toBe(4);
});

test("matchNumber():  Ignores leading zeros at beginning of string", () => {
  let token = tokenizer.matchNumber("00888 ");
  expect(token).toBeInstanceOf(Token.Number);
  expect(token.value).toBe(888);
  expect(token.raw).toBe("00888");
  expect(token.end).toBe(5);
});

test("matchNumber():  Matches negative integer at beginning of string", () => {
  let token = tokenizer.matchNumber("-999 ");
  expect(token).toBeInstanceOf(Token.Number);
  expect(token.value).toBe(-999);
  expect(token.raw).toBe("-999");
  expect(token.end).toBe(4);
});

test("matchNumber():  Matches negative proper decimal at beginning of string", () => {
  let token = tokenizer.matchNumber("-1.888 ");
  expect(token).toBeInstanceOf(Token.Number);
  expect(token.value).toBe(-1.888);
  expect(token.raw).toBe("-1.888");
  expect(token.end).toBe(6);
});

test("matchNumber():  Matches no-leading-zero decimal at beginning of string", () => {
  let token = tokenizer.matchNumber("-.888 ");
  expect(token).toBeInstanceOf(Token.Number);
  expect(token.value).toBe(-0.888);
  expect(token.raw).toBe("-.888");
  expect(token.end).toBe(5);
});

test("matchNumber():  Ignores negative with leading zeros at beginning of string", () => {
  let token = tokenizer.matchNumber("-00888 ");
  expect(token).toBeInstanceOf(Token.Number);
  expect(token.value).toBe(-888);
  expect(token.raw).toBe("-00888");
  expect(token.end).toBe(6);
});

test("matchNumber():  Ignores `{negative}{space}{number} at beginning of string", () => {
  let token = tokenizer.matchNumber("- 00888 ");
  expect(token).toEqual(undefined);
});

test("matchNumber():  Matches in the middle of the string", () => {
  let token = tokenizer.matchNumber("  999  ", 2);
  expect(token).toBeInstanceOf(Token.Number);
  expect(token.value).toBe(999);
  expect(token.end).toBe(5);
});

test("matchNumber():  Doesn't match incorrectly in the middle of the string", () => {
  let token = tokenizer.matchNumber("  999  999", 5);
  expect(token).toEqual(undefined);
});

test("matchNumber():  Doesn't go beyond the end", () => {
  let token = tokenizer.matchNumber("   999", 3, 4);
  expect(token).toBeInstanceOf(Token.Number);
  expect(token.value).toBe(9);
  expect(token.end).toBe(4);
});

test("matchNumber():  Doesn't match if start > end", () => {
  let token = tokenizer.matchNumber("999", 2, 1);
  expect(token).toEqual(undefined);
});

test("matchNumber():  Doesn't match if start is out of range", () => {
  let token = tokenizer.matchNumber("999", 100);
  expect(token).toEqual(undefined);
});

test("matchNumber():  Matches if end is out of range", () => {
  let token = tokenizer.matchNumber("999", 1, 100);
  expect(token).toBeInstanceOf(Token.Number);
  expect(token.value).toBe(99);
  expect(token.end).toBe(3);
});

//
// matchText()
//
test("matchText():  Returns undefined for empty string", () => {
  let token = tokenizer.matchText("");
  expect(token).toEqual(undefined);
});

test("matchText():  If no match, returns undefined", () => {
  let token = tokenizer.matchText("a");
  expect(token).toEqual(undefined);
});

test("matchText():  Matches single quotes at beginning of string", () => {
  let token = tokenizer.matchText("'a'");
  expect(token).toBeInstanceOf(Token.Text);
  expect(token.value).toBe("'a'");
  expect(token.innerText).toBe("a");
  expect(token.end).toBe(3);
});

test("matchText():  Matches double quotes at beginning of string", () => {
  let token = tokenizer.matchText('"aaaa"');
  expect(token).toBeInstanceOf(Token.Text);
  expect(token.value).toBe('"aaaa"');
  expect(token.raw).toBe('"aaaa"');
  expect(token.innerText).toBe("aaaa");
  expect(token.end).toBe(6);
});

test("matchText():  Matches single quotes with escape at beginning of string", () => {
  let token = tokenizer.matchText("'a\\'a'");
  expect(token).toBeInstanceOf(Token.Text);
  expect(token.value).toBe("'a\\'a'");
  expect(token.raw).toBe("'a\\'a'");
  expect(token.innerText).toBe("a\\'a");
  expect(token.end).toBe(6);
});

test("matchText():  Matches double quotes with escape at beginning of string", () => {
  let token = tokenizer.matchText('"a\\"a"');
  expect(token).toBeInstanceOf(Token.Text);
  expect(token.value).toBe('"a\\"a"');
  expect(token.raw).toBe('"a\\"a"');
  expect(token.innerText).toBe('a\\"a');
  expect(token.end).toBe(6);
});

test("matchText():  Matches in the middle of the string", () => {
  let token = tokenizer.matchText("  'aaa'  ", 2);
  expect(token).toBeInstanceOf(Token.Text);
  expect(token.value).toBe("'aaa'");
  expect(token.innerText).toBe("aaa");
  expect(token.end).toBe(7);
});

test("matchText():  Doesn't match if unbalanced", () => {
  let token = tokenizer.matchText("'aaa");
  expect(token).toEqual(undefined);
});

test("matchText():  Doesn't go beyond the end", () => {
  let token = tokenizer.matchText("  'aaa'  ", 2, 4);
  expect(token).toEqual(undefined);
});

test("matchText():  Doesn't match if start > end", () => {
  let token = tokenizer.matchText("'aaa'", 2, 1);
  expect(token).toEqual(undefined);
});

test("matchText():  Doesn't match if start is out of range", () => {
  let token = tokenizer.matchText("'aaa'", 100);
  expect(token).toEqual(undefined);
});

test("matchText():  Matches if end is out of range", () => {
  let token = tokenizer.matchText("'aaa'", 0, 100);
  expect(token).toBeInstanceOf(Token.Text);
  expect(token.value).toBe("'aaa'");
  expect(token.innerText).toBe("aaa");
  expect(token.end).toBe(5);
});

//
// matchComment()
//
test("matchComment():  Returns undefined for empty string", () => {
  let token = tokenizer.matchComment("");
  expect(token).toEqual(undefined);
});

test("matchComment():  If no match, returns undefined", () => {
  let token = tokenizer.matchComment("a");
  expect(token).toEqual(undefined);
});

test("matchComment():  Matches `//` comment at beginning of string", () => {
  let token = tokenizer.matchComment("//comment here");
  expect(token).toBeInstanceOf(Token.Comment);
  expect(token.value).toBe("comment here");
  expect(token.initialWhitespace).toBe("");
  expect(token.commentSymbol).toBe("//");
  expect(token.end).toBe(14);
});

test("matchComment():  Matches `--` comment at beginning of string", () => {
  let token = tokenizer.matchComment("-- comment here");
  expect(token).toBeInstanceOf(Token.Comment);
  expect(token.value).toBe("comment here");
  expect(token.initialWhitespace).toBe(" ");
  expect(token.commentSymbol).toBe("--");
  expect(token.end).toBe(15);
});

test("matchComment():  Matches `##` comment at beginning of string", () => {
  let token = tokenizer.matchComment("##\tcomment here");
  expect(token).toBeInstanceOf(Token.Comment);
  expect(token.value).toBe("comment here");
  expect(token.initialWhitespace).toBe("\t");
  expect(token.commentSymbol).toBe("##");
  expect(token.end).toBe(15);
});

test("matchComment():  Matches empty `//` comment", () => {
  let token = tokenizer.matchComment("//");
  expect(token).toBeInstanceOf(Token.Comment);
  expect(token.value).toBe("");
  expect(token.initialWhitespace).toBe("");
  expect(token.commentSymbol).toBe("//");
  expect(token.end).toBe(2);
});

test("matchComment():  Matches empty `--` comment", () => {
  let token = tokenizer.matchComment("--");
  expect(token).toBeInstanceOf(Token.Comment);
  expect(token.value).toBe("");
  expect(token.initialWhitespace).toBe("");
  expect(token.commentSymbol).toBe("--");
  expect(token.end).toBe(2);
});

test("matchComment():  Matches empty `##` comment", () => {
  let token = tokenizer.matchComment("##");
  expect(token).toBeInstanceOf(Token.Comment);
  expect(token.value).toBe("");
  expect(token.initialWhitespace).toBe("");
  expect(token.commentSymbol).toBe("##");
  expect(token.end).toBe(2);
});

test("matchComment():  Matches in the middle of the string", () => {
  let token = tokenizer.matchComment("xxx//comment", 3);
  expect(token).toBeInstanceOf(Token.Comment);
  expect(token.value).toBe("comment");
  expect(token.initialWhitespace).toBe("");
  expect(token.commentSymbol).toBe("//");
  expect(token.end).toBe(12);
});

test("matchComment():  Doesn't incorrectly match in the middle of the string", () => {
  let token = tokenizer.matchComment("xxx//comment\n", 4);
  expect(token).toEqual(undefined);
});

test("matchComment():  Stops at newline", () => {
  let token = tokenizer.matchComment("//\tcomment here\n");
  expect(token).toBeInstanceOf(Token.Comment);
  expect(token.value).toBe("comment here");
  expect(token.initialWhitespace).toBe("\t");
  expect(token.commentSymbol).toBe("//");
  expect(token.end).toBe(15);
});

test("matchComment():  Doesn't go beyond the end", () => {
  let token = tokenizer.matchComment("//\tcomment here\n", 0, 10);
  expect(token).toBeInstanceOf(Token.Comment);
  expect(token.value).toBe("comment");
  expect(token.initialWhitespace).toBe("\t");
  expect(token.commentSymbol).toBe("//");
  expect(token.end).toBe(10);
});

test("matchComment():  Doesn't match if start > end", () => {
  let token = tokenizer.matchComment("//\tcomment here\n", 2, 1);
  expect(token).toEqual(undefined);
});

test("matchComment():  Doesn't match if start is out of range", () => {
  let token = tokenizer.matchComment("//\tcomment here\n", 100);
  expect(token).toEqual(undefined);
});

test("matchComment():  Matches if end is out of range", () => {
  let token = tokenizer.matchComment("//\tcomment here\n", 0, 100);
  expect(token).toBeInstanceOf(Token.Comment);
  expect(token.value).toBe("comment here");
  expect(token.initialWhitespace).toBe("\t");
  expect(token.commentSymbol).toBe("//");
  expect(token.end).toBe(15);
});

//
// matchJSXStartTag()
//
test("matchJSXStartTag():  Returns undefined for empty string", () => {
  let token = tokenizer.matchJSXStartTag("");
  expect(token).toEqual(undefined);
});

test("matchJSXStartTag():  If no match, returns undefined", () => {
  let token = tokenizer.matchJSXStartTag("a");
  expect(token).toEqual(undefined);
});

test("matchJSXStartTag():  Matches no-attribute start tag at beginning of string", () => {
  let token = tokenizer.matchJSXStartTag("<test>");
  expect(token).toBeInstanceOf(Token.JSXElement);
  expect(token.tagName).toBe("test");
  expect(token.isUnaryTag).toBe(undefined);
  expect(token.children).toBe(undefined);
  expect(token.attributes).toBe(undefined);
  expect(token.end).toBe(6);
});

test("matchJSXStartTag():  Matches no attribute unary tag at beginning of string", () => {
  let token = tokenizer.matchJSXStartTag("<test/>");
  expect(token).toBeInstanceOf(Token.JSXElement);
  expect(token.tagName).toBe("test");
  expect(token.isUnaryTag).toBe(true);
  expect(token.children).toBe(undefined);
  expect(token.attributes).toBe(undefined);
  expect(token.end).toBe(7);
});

test("matchJSXStartTag():  Does NOT match end tag at beginning of string", () => {
  let token = tokenizer.matchJSXStartTag("</test>");
  expect(token).toEqual(undefined);
});

test("matchJSXStartTag():  Matches start tag with attributes at beginning of string", () => {
  let token = tokenizer.matchJSXStartTag("<test a='a\\'a' bbb=1 c-0-a={tokens} d>");
  expect(token).toBeInstanceOf(Token.JSXElement);
  expect(token.tagName).toBe("test");
  expect(token.isUnaryTag).toBe(undefined);
  expect(token.children).toBe(undefined);
  expect(token.end).toBe(38);

  let attributes = token.attributes;
  expect(attributes).toBeInstanceOf(Array);
  expect(attributes.length).toEqual(4);

  expect(attributes[0].name).toEqual("a");
  expect(attributes[0].value).toBeInstanceOf(Token.Text);
  expect(attributes[0].value.value).toEqual("'a\\'a'");

  expect(attributes[1].name).toEqual("bbb");
  expect(attributes[1].value).toBeInstanceOf(Token.Number);
  expect(attributes[1].value.value).toBe(1);

  expect(attributes[2].name).toEqual("c-0-a");
  expect(attributes[2].value).toBeInstanceOf(Token.JSXExpression);

  expect(attributes[3].name).toEqual("d");
  expect(attributes[3].value).toBe(undefined);
});

test("matchJSXStartTag():  Matches unary tag with attributes at beginning of string", () => {
  let token = tokenizer.matchJSXStartTag("<test a='a\\'a' bbb=1 c-0-a={tokens} d/>");
  expect(token).toBeInstanceOf(Token.JSXElement);
  expect(token.tagName).toBe("test");
  expect(token.isUnaryTag).toBe(true);
  expect(token.children).toBe(undefined);
  expect(token.end).toBe(39);

  let attributes = token.attributes;
  expect(attributes).toBeInstanceOf(Array);
  expect(attributes.length).toEqual(4);

  expect(attributes[0].name).toEqual("a");
  expect(attributes[0].value).toBeInstanceOf(Token.Text);
  expect(attributes[0].value.value).toEqual("'a\\'a'");

  expect(attributes[1].name).toEqual("bbb");
  expect(attributes[1].value).toBeInstanceOf(Token.Number);
  expect(attributes[1].value.value).toBe(1);

  expect(attributes[2].name).toEqual("c-0-a");
  expect(attributes[2].value).toBeInstanceOf(Token.JSXExpression);

  expect(attributes[3].name).toEqual("d");
  expect(attributes[3].value).toBe(undefined);
});

test("matchJSXStartTag():  Matches in the middle of the string", () => {
  let token = tokenizer.matchJSXStartTag("xxx<test aprop/>xxx", 3);
  expect(token).toBeInstanceOf(Token.JSXElement);
  expect(token.tagName).toBe("test");
  expect(token.isUnaryTag).toBe(true);
  expect(token.children).toBe(undefined);
  expect(token.attributes).toBeInstanceOf(Array);
  expect(token.attributes.length).toEqual(1);
  expect(token.end).toBe(16);
});

test("matchJSXStartTag():  Doesn't incorrectly match in the middle of the string", () => {
  let token = tokenizer.matchJSXStartTag("xxx<test aprop/>xxx", 4);
  expect(token).toEqual(undefined);
});

test("matchJSXStartTag():  Doesn't stop at newline", () => {
  let token = tokenizer.matchJSXStartTag("xxx<test aprop\n bprop/>xxx", 3);
  expect(token).toBeInstanceOf(Token.JSXElement);
  expect(token.tagName).toBe("test");
  expect(token.isUnaryTag).toBe(true);
  expect(token.children).toBe(undefined);
  expect(token.attributes).toBeInstanceOf(Array);
  expect(token.attributes.length).toEqual(2);
  expect(token.end).toBe(23);
});

test("matchJSXStartTag():  Matches but doesn't go beyond the end", () => {
  let token = tokenizer.matchJSXStartTag("<test aprop\n bprop/>", 0, 10);
  expect(token).toBeInstanceOf(Token.JSXElement);
  expect(token.tagName).toBe("test");
  expect(token.isUnaryTag).toBe(undefined);
  expect(token.error).toBe("No end >");
  expect(token.children).toBe(undefined);
  expect(token.attributes).toBeInstanceOf(Array);
  expect(token.attributes.length).toEqual(1);
  expect(token.attributes[0].name).toEqual("apro");
  expect(token.end).toBe(10);
});

test("matchJSXStartTag():  Doesn't match if start > end", () => {
  let token = tokenizer.matchJSXStartTag("xxx<test aprop\n bprop/>", 3, 2);
  expect(token).toEqual(undefined);
});

test("matchJSXStartTag():  Doesn't match if start is out of range", () => {
  let token = tokenizer.matchJSXStartTag("xxx<test aprop\n bprop/>", 100);
  expect(token).toEqual(undefined);
});

test("matchJSXStartTag():  Matches if end is out of range", () => {
  let token = tokenizer.matchJSXStartTag("xxx<test aprop\n bprop/>xxx", 3, 100);
  expect(token).toBeInstanceOf(Token.JSXElement);
  expect(token.tagName).toBe("test");
  expect(token.isUnaryTag).toBe(true);
  expect(token.children).toBe(undefined);
  expect(token.attributes).toBeInstanceOf(Array);
  expect(token.attributes.length).toEqual(2);
  expect(token.end).toBe(23);
});

//
// matchJSXEndTag()
//
test("matchJSXEndTag():  Returns undefined for empty string", () => {
  let token = tokenizer.matchJSXEndTag("test", "");
  expect(token).toEqual(undefined);
});

test("matchJSXEndTag():  If no match, returns undefined", () => {
  let token = tokenizer.matchJSXEndTag("test", "a");
  expect(token).toEqual(undefined);
});

test("matchJSXEndTag():  Matches specified end tag at beginning of string", () => {
  let token = tokenizer.matchJSXEndTag("test", "</test>");
  expect(token).toBeInstanceOf(Token.JSXEndTag);
  expect(token.tagName).toBe("test");
  expect(token.end).toBe(7);
});

test("matchJSXEndTag():  Does not match different end tag at beginning of string", () => {
  let token = tokenizer.matchJSXEndTag("bad", "</test>");
  expect(token).toBe(undefined);
});

test("matchJSXEndTag():  Matches specified end tag in the middle of the string", () => {
  let token = tokenizer.matchJSXEndTag("test", "xxx</test>", 3);
  expect(token).toBeInstanceOf(Token.JSXEndTag);
  expect(token.tagName).toBe("test");
  expect(token.end).toBe(10);
});

test("matchJSXEndTag():  Does not incorrectly match in the middle of the string", () => {
  let token = tokenizer.matchJSXEndTag("test", "xxx</test>", 2);
  expect(token).toBe(undefined);
});

test("matchJSXEndTag():  Doesn't match if start > end", () => {
  let token = tokenizer.matchJSXEndTag("test", "xxx</test>", 3, 2);
  expect(token).toEqual(undefined);
});

test("matchJSXEndTag():  Doesn't match if start is out of range", () => {
  let token = tokenizer.matchJSXEndTag("test", "xxx</test>", 100);
  expect(token).toEqual(undefined);
});

test("matchJSXEndTag():  Matches if end is out of range", () => {
  let token = tokenizer.matchJSXEndTag("test", "xxx</test>", 3, 100);
  expect(token).toBeInstanceOf(Token.JSXEndTag);
  expect(token.tagName).toBe("test");
  expect(token.end).toBe(10);
});

//
// matchJSXAttribute()
//
test("matchJSXAttribute():  Returns undefined for empty string", () => {
  let token = tokenizer.matchJSXAttribute("");
  expect(token).toEqual(undefined);
});

test("matchJSXAttribute():  If no match, returns undefined", () => {
  let token = tokenizer.matchJSXAttribute(":");
  expect(token).toEqual(undefined);
});

test("matchJSXAttribute():  Matches no-value attribute at beginning of string", () => {
  let token = tokenizer.matchJSXAttribute("xyz ");
  expect(token).toBeInstanceOf(Token.JSXAttribute);
  expect(token.name).toEqual("xyz");
  expect(token.value).toEqual(undefined);
  expect(token.end).toEqual(4);
});

test("matchJSXAttribute():  Matches string attribute at beginning of string", () => {
  let token = tokenizer.matchJSXAttribute("xyz='abc' ");
  expect(token).toBeInstanceOf(Token.JSXAttribute);
  expect(token.name).toEqual("xyz");
  expect(token.value).toBeInstanceOf(Token.Text);
  expect(token.value.value).toEqual("'abc'");
  expect(token.end).toEqual(10);
});

test("matchJSXAttribute():  Matches number attribute at beginning of string", () => {
  let token = tokenizer.matchJSXAttribute("xyz=0.33 ");
  expect(token).toBeInstanceOf(Token.JSXAttribute);
  expect(token.name).toEqual("xyz");
  expect(token.value).toBeInstanceOf(Token.Number);
  expect(token.value.value).toBe(0.33);
  expect(token.end).toEqual(9);
});

test("matchJSXAttribute():  Matches JSX Expression attribute at beginning of string", () => {
  let token = tokenizer.matchJSXAttribute("xyz={foo bar baz} ");
  expect(token).toBeInstanceOf(Token.JSXAttribute);
  expect(token.name).toEqual("xyz");
  expect(token.value).toBeInstanceOf(Token.JSXExpression);
  expect(token.value.contents).toEqual("foo bar baz");
  expect(token.end).toEqual(18);
});

test("matchJSXAttribute():  Matches identifier attribute at beginning of string", () => {
  let token = tokenizer.matchJSXAttribute("xyz=foo ");
  expect(token).toBeInstanceOf(Token.JSXAttribute);
  expect(token.name).toEqual("xyz");
  expect(token.value).toBeInstanceOf(Token.JSXExpression);
  expect(token.value.contents.value).toEqual("foo");
  expect(token.end).toEqual(8);
});

test("matchJSXAttribute():  Matches no-value attribute in the middle of the string", () => {
  let token = tokenizer.matchJSXAttribute("...xyz ", 3);
  expect(token).toBeInstanceOf(Token.JSXAttribute);
  expect(token.name).toEqual("xyz");
  expect(token.value).toEqual(undefined);
  expect(token.end).toEqual(7);
});

test("matchJSXAttribute():  Matches string attribute in the middle of the string", () => {
  let token = tokenizer.matchJSXAttribute("...xyz='abc' ", 3);
  expect(token).toBeInstanceOf(Token.JSXAttribute);
  expect(token.name).toEqual("xyz");
  expect(token.value).toBeInstanceOf(Token.Text);
  expect(token.value.value).toEqual("'abc'");
  expect(token.end).toEqual(13);
});

test("matchJSXAttribute():  Matches number attribute in the middle of the string", () => {
  let token = tokenizer.matchJSXAttribute("...xyz=0.33 ", 3);
  expect(token).toBeInstanceOf(Token.JSXAttribute);
  expect(token.name).toEqual("xyz");
  expect(token.value).toBeInstanceOf(Token.Number)
  expect(token.value.value).toEqual(0.33);
  expect(token.end).toEqual(12);
});

test("matchJSXAttribute():  Matches JSX Expression attribute in the middle of the string", () => {
  let token = tokenizer.matchJSXAttribute("...xyz={foo bar baz} ", 3);
  expect(token).toBeInstanceOf(Token.JSXAttribute);
  expect(token.name).toEqual("xyz");
  expect(token.value).toBeInstanceOf(Token.JSXExpression);
  expect(token.value.contents).toEqual("foo bar baz");
  expect(token.end).toEqual(21);
});

test("matchJSXAttribute():  Matches identifier attribute in the middle of the string", () => {
  let token = tokenizer.matchJSXAttribute("...xyz=foo ", 3);
  expect(token).toBeInstanceOf(Token.JSXAttribute);
  expect(token.name).toEqual("xyz");
  expect(token.value).toBeInstanceOf(Token.JSXExpression);
  expect(token.value.contents.value).toEqual("foo");
  expect(token.end).toEqual(11);
});

test("matchJSXAttribute():  Doesn't go beyond the end", () => {
  let token = tokenizer.matchJSXAttribute("...xyz ", 3, 4);
  expect(token).toBeInstanceOf(Token.JSXAttribute);
  expect(token.name).toEqual("x");
  expect(token.value).toEqual(undefined);
  expect(token.end).toEqual(4);
});

test("matchJSXAttribute():  Doesn't match if start > end", () => {
  let token = tokenizer.matchJSXAttribute("xxx", 2, 1);
  expect(token).toEqual(undefined);
});

test("matchJSXAttribute():  Doesn't match if start is out of range", () => {
  let token = tokenizer.matchJSXAttribute("xxx", 100);
  expect(token).toEqual(undefined);
});

test("matchJSXAttribute():  Matches if end is out of range", () => {
  let token = tokenizer.matchJSXAttribute("xyz={foo bar baz} ");
  expect(token).toBeInstanceOf(Token.JSXAttribute);
  expect(token.name).toEqual("xyz");
  expect(token.value).toBeInstanceOf(Token.JSXExpression);
  expect(token.value.contents).toEqual("foo bar baz");
  expect(token.end).toEqual(18);
});

//
// matchJSXChild()
//
test("matchJSXChild():  Returns undefined for empty string", () => {
  let token = tokenizer.matchJSXChild("foo", "");
  expect(token).toEqual(undefined);
});

test("matchJSXChild():  If no match, returns undefined", () => {
  let token = tokenizer.matchJSXChild("foo", ":");
  expect(token).toEqual(undefined);
});

test("matchJSXChild():  Matches JSX end tag at beginning of string", () => {
  let token = tokenizer.matchJSXChild("foo", "</foo>");
  expect(token).toBeInstanceOf(Token.JSXEndTag);
  expect(token.tagName).toBe("foo");
  expect(token.end).toBe(6);
});

test("matchJSXChild():  Matches text & whitespace at beginning of string w/end delimiter", () => {
  let token = tokenizer.matchJSXChild("foo", " some text here <");
  expect(token).toBeInstanceOf(Token.JSXText);
  expect(token.value).toBe(" some text here ");
  expect(token.quotedText).toBe(`"some text here"`);
  expect(token.end).toEqual(16);
});

test("matchJSXChild():  Does NOT matches text & whitespace at beginning of string w/OUT end delimiter", () => {
  let token = tokenizer.matchJSXChild("foo", " some text here");
  expect(token).toBe(undefined);
});

test("matchJSXChild():  Matches JSX element at beginning of string", () => {
  let token = tokenizer.matchJSXChild("foo", "<bar/>  ");
  expect(token).toBeInstanceOf(Token.JSXElement);
  expect(token.tagName).toEqual("bar");
  expect(token.end).toEqual(6);
});

test("matchJSXChild():  Matches JSX Expression at beginning of string", () => {
  let token = tokenizer.matchJSXChild("foo", "{ foo bar baz } ");
  expect(token).toBeInstanceOf(Token.JSXExpression);
  expect(token.contents).toEqual(" foo bar baz ");
  expect(token.end).toEqual(15);
});

test("matchJSXChild():  Matches JSX end tag in the middle of string", () => {
  let token = tokenizer.matchJSXChild("foo", "...</foo>", 3);
  expect(token).toBeInstanceOf(Token.JSXEndTag);
  expect(token.tagName).toBe("foo");
  expect(token.end).toBe(9);
});

test("matchJSXChild():  Matches text & whitespace in the middle of string w/end delimiter", () => {
  let token = tokenizer.matchJSXChild("foo", "...some text here <", 3);
  expect(token).toBeInstanceOf(Token.JSXText);
  expect(token.value).toBe("some text here ");
  expect(token.quotedText).toBe(`"some text here"`);
  expect(token.end).toEqual(18);
});

test("matchJSXChild():  Does NOT matches text & whitespace in the middle of string w/OUT end delimiter", () => {
  let token = tokenizer.matchJSXChild("foo", "...some text here", 3);
  expect(token).toBe(undefined);
});

test("matchJSXChild():  Matches JSX element in the middle of string", () => {
  let token = tokenizer.matchJSXChild("foo", "...<bar/>  ", 3);
  expect(token).toBeInstanceOf(Token.JSXElement);
  expect(token.tagName).toEqual("bar");
  expect(token.end).toEqual(9);
});

test("matchJSXChild():  Matches JSX Expression in the middle of string", () => {
  let token = tokenizer.matchJSXChild("foo", "...{ foo bar baz } ", 3);
  expect(token).toBeInstanceOf(Token.JSXExpression);
  expect(token.contents).toEqual(" foo bar baz ");
  expect(token.end).toEqual(18);
});

test("matchJSXChild():  Doesn't go beyond the end", () => {
  let token = tokenizer.matchJSXChild("foo", "...{abc}", 3, 4);
  expect(token).toBe(undefined);
});

test("matchJSXChild():  Doesn't match if start > end", () => {
  let token = tokenizer.matchJSXChild("foo", "xxx", 2, 1);
  expect(token).toEqual(undefined);
});

test("matchJSXChild():  Doesn't match if start is out of range", () => {
  let token = tokenizer.matchJSXChild("foo", "xxx", 100);
  expect(token).toEqual(undefined);
});

test("matchJSXChild():  Matches if end is out of range", () => {
  let token = tokenizer.matchJSXChild("foo", "</foo>", 0, 100);
  expect(token).toBeInstanceOf(Token.JSXEndTag);
  expect(token.tagName).toBe("foo");
  expect(token.end).toBe(6);
});
