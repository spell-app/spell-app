import Tokenizer from "./Tokenizer.js";


//
// eatWhitespace()
//
test("eatWhitespace():  Doesn't match empty string", () => {
  let result = Tokenizer.eatWhitespace("", 0);
  expect(result).toEqual(0);
});

test("eatWhitespace():  Returns same position if not whitespace", () => {
  let result = Tokenizer.eatWhitespace("x", 0);
  expect(result).toEqual(0);
});

test("eatWhitespace():  Spaces are eaten", () => {
  let result = Tokenizer.eatWhitespace("   x", 0);
  expect(result).toEqual(3);
});

test("eatWhitespace():  Tabs are eaten", () => {
  let result = Tokenizer.eatWhitespace("\t\t\tx", 0);
  expect(result).toEqual(3);
});

test("eatWhitespace():  Mixed tabs and spaces are eaten", () => {
  let result = Tokenizer.eatWhitespace("\t \tx", 0);
  expect(result).toEqual(3);
});

test("eatWhitespace():  End of string is not a problem", () => {
  let result = Tokenizer.eatWhitespace("\t \t", 0);
  expect(result).toEqual(3);
});

test("eatWhitespace():  Should NOT eat newline", () => {
  let result = Tokenizer.eatWhitespace("  \n x", 0);
  expect(result).toEqual(2);
});

test("eatWhitespace():  Make sure it works in the middle of the string", () => {
  let result = Tokenizer.eatWhitespace("  \n x", 3);
  expect(result).toEqual(4);
});

test("eatWhitespace():  Doesn't go beyond specified end", () => {
  let result = Tokenizer.eatWhitespace("       ", 3, 4);
  expect(result).toEqual(4);
});

test("eatWhitespace():  Returns actual end if end is out of range", () => {
  let result = Tokenizer.eatWhitespace("   ", 100);
  expect(result).toEqual(3);
});

test("eatWhitespace():  Returns end if start > end", () => {
  let result = Tokenizer.eatWhitespace("   ", 2, 1);
  expect(result).toEqual(1);
});

test("eatWhitespace():  Works properly if end is out of range", () => {
  let result = Tokenizer.eatWhitespace("   ", 0, 100);
  expect(result).toEqual(3);
});


//
// matchWhitespace()
//
test("matchWhitespace():  Returns undefined for empty string", () => {
  let result = Tokenizer.matchWhitespace("");
  expect(result).toEqual(undefined);
});

test("matchWhitespace():  If no match, returns undefined", () => {
  let result = Tokenizer.matchWhitespace("x");
  expect(result).toEqual(undefined);
});

test("matchWhitespace():  Spaces are fine", () => {
  let [token, nextStart] = Tokenizer.matchWhitespace("   x");
  expect(token).toBeInstanceOf(Tokenizer.Whitespace);
  expect(token.whitespace).toBe("   ");
  expect(token.length).toBe(3);
  expect(nextStart).toBe(3);
});

test("matchWhitespace():  Tabs are fine", () => {
  let [token, nextStart] = Tokenizer.matchWhitespace("\t\t\tx");
  expect(token).toBeInstanceOf(Tokenizer.Whitespace);
  expect(token.whitespace).toBe("\t\t\t");
  expect(token.length).toBe(3);
  expect(nextStart).toBe(3);
});

test("matchWhitespace():  Mixed spaces and tabs are fine", () => {
  let [token, nextStart] = Tokenizer.matchWhitespace("\t \tx");
  expect(token).toBeInstanceOf(Tokenizer.Whitespace);
  expect(token.whitespace).toBe("\t \t");
  expect(token.length).toBe(3);
  expect(nextStart).toBe(3);
});

test("matchWhitespace():  Should NOT match newline", () => {
  let result = Tokenizer.matchWhitespace("\n");
  expect(result).toEqual(undefined);
});

test("matchWhitespace():  Matches in the middle of the string", () => {
  let [token, nextStart] = Tokenizer.matchWhitespace("  \n x", 3);
  expect(token).toBeInstanceOf(Tokenizer.Whitespace);
  expect(token.whitespace).toBe(" ");
  expect(nextStart).toBe(4);
});

test("matchWhitespace():  Doesn't go beyond the end", () => {
  let [token, nextStart] = Tokenizer.matchWhitespace("       ", 3, 4);
  expect(token).toBeInstanceOf(Tokenizer.Whitespace);
  expect(token.whitespace).toBe(" ");
  expect(nextStart).toBe(4);
});

test("matchWhitespace():  Doesn't match if start > end", () => {
  let result = Tokenizer.matchWhitespace("   ", 2, 1);
  expect(result).toEqual(undefined);
});

test("matchWhitespace():  Doesn't match if start is out of range", () => {
  let result = Tokenizer.matchWhitespace("   ", 100);
  expect(result).toEqual(undefined);
});

test("matchWhitespace():  Matches if end is out of range", () => {
  let [token, nextStart] = Tokenizer.matchWhitespace("   ", 0, 100);
  expect(token).toBeInstanceOf(Tokenizer.Whitespace);
  expect(token.whitespace).toBe("   ");
  expect(nextStart).toBe(3);
});

test("matchWhitespace():  Whitespace at start `isIndent`", () => {
  let [token, nextStart] = Tokenizer.matchWhitespace(" ");
  expect(token).toBeInstanceOf(Tokenizer.Indent);
  expect(token.whitespace).toBe(" ");
  expect(nextStart).toBe(1);
});

test("matchWhitespace():  Whitespace after newline `isIndent`", () => {
  let [token, nextStart] = Tokenizer.matchWhitespace(" \n\t", 2);
  expect(token).toBeInstanceOf(Tokenizer.Indent);
  expect(token.whitespace).toBe("\t");
  expect(nextStart).toBe(3);
});

test("matchWhitespace():  Whitespace in middle of other stuff is not indent", () => {
  let [token, nextStart] = Tokenizer.matchWhitespace("x x", 1);
  expect(token).toBeInstanceOf(Tokenizer.Whitespace);
  expect(token.whitespace).toBe(" ");
  expect(nextStart).toBe(2);
});



//
// matchNewline()
//
test("matchNewline():  Returns undefined for empty string", () => {
  let result = Tokenizer.matchNewline("");
  expect(result).toEqual(undefined);
});

test("matchNewline():  If no match, returns undefined", () => {
  let result = Tokenizer.matchNewline("x");
  expect(result).toEqual(undefined);
});

test("matchNewline():  Matches at beginning of string", () => {
  let result = Tokenizer.matchNewline("\nx");
  expect(result).toEqual([Tokenizer.NEWLINE, 1]);
});

test("matchNewline():  Does not match spaces", () => {
  let result = Tokenizer.matchNewline(" ");
  expect(result).toEqual(undefined);
});

test("matchNewline():  Does not match tabs", () => {
  let result = Tokenizer.matchNewline("\t");
  expect(result).toEqual(undefined);
});

test("matchNewline():  Matches in the middle of the string", () => {
  let result = Tokenizer.matchNewline("  \n x", 2);
  expect(result).toEqual([Tokenizer.NEWLINE, 3]);
});

test("matchNewline():  Doesn't match incorrectly in the middle of the string", () => {
  let result = Tokenizer.matchNewline("  \n x", 3);
  expect(result).toEqual(undefined);
});

test("matchNewline():  Doesn't go beyond the end", () => {
  let result = Tokenizer.matchNewline("  \n x", 3, 4);
  expect(result).toEqual(undefined);
});

test("matchNewline():  Doesn't match if start > end", () => {
  let result = Tokenizer.matchNewline("\n\n\n", 2, 1);
  expect(result).toEqual(undefined);
});

test("matchNewline():  Doesn't match if start is out of range", () => {
  let result = Tokenizer.matchNewline("\n", 100);
  expect(result).toEqual(undefined);
});

test("matchNewline():  Matches if end is out of range", () => {
  let result = Tokenizer.matchNewline("\n", 0, 100);
  expect(result).toEqual([Tokenizer.NEWLINE, 1]);
});



//
// matchSymbol()
//
test("matchSymbol():  Doesn't match empty string.", () => {
  let result = Tokenizer.matchSymbol("");
  expect(result).toEqual(undefined);
});

test("matchSymbol():  Match a single character.", () => {
  let result = Tokenizer.matchSymbol(":");
  expect(result).toEqual([":", 1]);
});

test("matchSymbol():  Doesn't match if start beyond the end", () => {
  let result = Tokenizer.matchSymbol(":", 2);
  expect(result).toEqual(undefined);
});

test("matchSymbol():  Doesn't match if start === end", () => {
  let result = Tokenizer.matchSymbol(":", 2, 2);
  expect(result).toEqual(undefined);
});

test("matchSymbol():  Doesn't match if start is out of range", () => {
  let result = Tokenizer.matchSymbol(":", 100);
  expect(result).toEqual(undefined);
});

test("matchSymbol():  Doesn't match if start is > end", () => {
  let result = Tokenizer.matchSymbol(":::", 2, 1);
  expect(result).toEqual(undefined);
});

test("matchSymbol():  Matches if end is out of range", () => {
  let result = Tokenizer.matchSymbol(":", 0, 100);
  expect(result).toEqual([":", 1]);
});




//
// matchWord()
//
test("matchWord():  Returns undefined for empty string", () => {
  let result = Tokenizer.matchWord("");
  expect(result).toEqual(undefined);
});

test("matchWord():  If no match, returns undefined", () => {
  let result = Tokenizer.matchWord(":");
  expect(result).toEqual(undefined);
});

test("matchWord():  Matches single letter at beginning of string", () => {
  let result = Tokenizer.matchWord("x ");
  expect(result).toEqual(["x", 1]);
});

test("matchWord():  Matches multiple letters at beginning of string", () => {
  let result = Tokenizer.matchWord("xxxx ");
  expect(result).toEqual(["xxxx", 4]);
});

test("matchWord():  Matches multiple letters, numbers, underscores at beginning of string", () => {
  let result = Tokenizer.matchWord("xxxx-XXX_y ");
  expect(result).toEqual(["xxxx-XXX_y", 10]);
});

test("matchWord():  Does not match leading number", () => {
  let result = Tokenizer.matchWord("9a ");
  expect(result).toEqual(undefined);
});

test("matchWord():  Does not match leading underscore", () => {
  let result = Tokenizer.matchWord("_a ");
  expect(result).toEqual(undefined);
});

test("matchWord():  Does not match leading dash", () => {
  let result = Tokenizer.matchWord("-a ");
  expect(result).toEqual(undefined);
});

test("matchWord():  Matches in the middle of the string", () => {
  let result = Tokenizer.matchWord("  xxx  ", 2);
  expect(result).toEqual(["xxx", 5]);
});

test("matchWord():  Doesn't match incorrectly in the middle of the string", () => {
  let result = Tokenizer.matchWord("  xxx  ", 5);
  expect(result).toEqual(undefined);
});

test("matchWord():  Doesn't go beyond the end", () => {
  let result = Tokenizer.matchWord("   xxx", 3, 4);
  expect(result).toEqual(["x", 4]);
});

test("matchWord():  Doesn't match if start > end", () => {
  let result = Tokenizer.matchWord("xxx", 2, 1);
  expect(result).toEqual(undefined);
});

test("matchWord():  Doesn't match if start is out of range", () => {
  let result = Tokenizer.matchWord("xxx", 100);
  expect(result).toEqual(undefined);
});

test("matchWord():  Matches if end is out of range", () => {
  let result = Tokenizer.matchWord("xxx", 0, 100);
  expect(result).toEqual(["xxx", 3]);
});



//
// matchNumber()
//
test("matchNumber():  Returns undefined for empty string", () => {
  let result = Tokenizer.matchNumber("");
  expect(result).toEqual(undefined);
});

test("matchNumber():  If no match, returns undefined", () => {
  let result = Tokenizer.matchNumber("a");
  expect(result).toEqual(undefined);
});

test("matchNumber():  Matches integer at beginning of string", () => {
  let result = Tokenizer.matchNumber("999 ");
  expect(result).toEqual([999, 3]);
});

test("matchNumber():  Matches proper decimal at beginning of string", () => {
  let result = Tokenizer.matchNumber("1.888 ");
  expect(result).toEqual([1.888, 5]);
});

test("matchNumber():  Matches no-leading-zero decimal at beginning of string", () => {
  let result = Tokenizer.matchNumber(".888 ");
  expect(result).toEqual([0.888, 4]);
});

test("matchNumber():  Ignores leading zeros at beginning of string", () => {
  let result = Tokenizer.matchNumber("00888 ");
  expect(result).toEqual([888, 5]);
});

test("matchNumber():  Matches negative integer at beginning of string", () => {
  let result = Tokenizer.matchNumber("-999 ");
  expect(result).toEqual([-999, 4]);
});

test("matchNumber():  Matches negative proper decimal at beginning of string", () => {
  let result = Tokenizer.matchNumber("-1.888 ");
  expect(result).toEqual([-1.888, 6]);
});

test("matchNumber():  Matches no-leading-zero decimal at beginning of string", () => {
  let result = Tokenizer.matchNumber("-.888 ");
  expect(result).toEqual([-0.888, 5]);
});

test("matchNumber():  Ignores negative with leading zeros at beginning of string", () => {
  let result = Tokenizer.matchNumber("-00888 ");
  expect(result).toEqual([-888, 6]);
});

test("matchNumber():  Ignores `{negative}{space}{number} at beginning of string", () => {
  let result = Tokenizer.matchNumber("- 00888 ");
  expect(result).toEqual(undefined);
});

test("matchNumber():  Matches in the middle of the string", () => {
  let result = Tokenizer.matchNumber("  999  ", 2);
  expect(result).toEqual([999, 5]);
});

test("matchNumber():  Doesn't match incorrectly in the middle of the string", () => {
  let result = Tokenizer.matchNumber("  999  999", 5);
  expect(result).toEqual(undefined);
});

test("matchNumber():  Doesn't go beyond the end", () => {
  let result = Tokenizer.matchNumber("   999", 3, 4);
  expect(result).toEqual([9, 4]);
});

test("matchNumber():  Doesn't match if start > end", () => {
  let result = Tokenizer.matchNumber("999", 2, 1);
  expect(result).toEqual(undefined);
});

test("matchNumber():  Doesn't match if start is out of range", () => {
  let result = Tokenizer.matchNumber("999", 100);
  expect(result).toEqual(undefined);
});

test("matchNumber():  Matches if end is out of range", () => {
  let result = Tokenizer.matchNumber("999", 1, 100);
  expect(result).toEqual([99, 3]);
});



//
// matchText()
//
test("matchText():  Returns undefined for empty string", () => {
  let result = Tokenizer.matchText("");
  expect(result).toEqual(undefined);
});

test("matchText():  If no match, returns undefined", () => {
  let result = Tokenizer.matchText("a");
  expect(result).toEqual(undefined);
});

test("matchText():  Matches single quotes at beginning of string", () => {
  let [token, nextStart] = Tokenizer.matchText("'a'");
  expect(token).toBeInstanceOf(Tokenizer.Text);
  expect(token.quotedString).toBe("'a'");
  expect(token.text).toBe("a");
  expect(nextStart).toBe(3);
});

test("matchText():  Matches double quotes at beginning of string", () => {
  let [token, nextStart] = Tokenizer.matchText('"aaaa"');
  expect(token).toBeInstanceOf(Tokenizer.Text);
  expect(token.quotedString).toBe('"aaaa"');
  expect(token.text).toBe("aaaa");
  expect(nextStart).toBe(6);
});

test("matchText():  Matches single quotes with escape at beginning of string", () => {
  let [token, nextStart] = Tokenizer.matchText("'a\\'a'");
  expect(token).toBeInstanceOf(Tokenizer.Text);
  expect(token.quotedString).toBe("'a\\'a'");
  expect(token.text).toBe("a\\'a");
  expect(nextStart).toBe(6);
});

test("matchText():  Matches double quotes with escape at beginning of string", () => {
  let [token, nextStart] = Tokenizer.matchText('"a\\"a"');
  expect(token).toBeInstanceOf(Tokenizer.Text);
  expect(token.quotedString).toBe('"a\\"a"');
  expect(token.text).toBe('a\\"a');
  expect(nextStart).toBe(6);
});

test("matchText():  Matches in the middle of the string", () => {
  let [token, nextStart] = Tokenizer.matchText("  'aaa'  ", 2);
  expect(token).toBeInstanceOf(Tokenizer.Text);
  expect(token.quotedString).toBe("'aaa'");
  expect(token.text).toBe("aaa");
  expect(nextStart).toBe(7);
});

test("matchText():  Doesn't match if unbalanced", () => {
  let result = Tokenizer.matchText("'aaa");
  expect(result).toEqual(undefined);
});

test("matchText():  Doesn't go beyond the end", () => {
  let result = Tokenizer.matchText("  'aaa'  ", 2, 4);
  expect(result).toEqual(undefined);
});

test("matchText():  Doesn't match if start > end", () => {
  let result = Tokenizer.matchText("'aaa'", 2, 1);
  expect(result).toEqual(undefined);
});

test("matchText():  Doesn't match if start is out of range", () => {
  let result = Tokenizer.matchText("'aaa'", 100);
  expect(result).toEqual(undefined);
});

test("matchText():  Matches if end is out of range", () => {
  let [token, nextStart] = Tokenizer.matchText("'aaa'", 0, 100);
  expect(token).toBeInstanceOf(Tokenizer.Text);
  expect(token.quotedString).toBe("'aaa'");
  expect(token.text).toBe("aaa");
  expect(nextStart).toBe(5);
});




//
// matchComment()
//
test("matchComment():  Returns undefined for empty string", () => {
  let result = Tokenizer.matchComment("");
  expect(result).toEqual(undefined);
});

test("matchComment():  If no match, returns undefined", () => {
  let result = Tokenizer.matchComment("a");
  expect(result).toEqual(undefined);
});

test("matchComment():  Matches `//` comment at beginning of string", () => {
  let [token, nextStart] = Tokenizer.matchComment("//comment here");
  expect(token).toBeInstanceOf(Tokenizer.Comment);
  expect(token.comment).toBe("comment here");
  expect(token.whitespace).toBe("");
  expect(token.commentSymbol).toBe("//");
  expect(nextStart).toBe(14);
});

test("matchComment():  Matches `--` comment at beginning of string", () => {
  let [token, nextStart] = Tokenizer.matchComment("-- comment here");
  expect(token).toBeInstanceOf(Tokenizer.Comment);
  expect(token.comment).toBe("comment here");
  expect(token.whitespace).toBe(" ");
  expect(token.commentSymbol).toBe("--");
  expect(nextStart).toBe(15);
});

test("matchComment():  Matches `##` comment at beginning of string", () => {
  let [token, nextStart] = Tokenizer.matchComment("##\tcomment here");
  expect(token).toBeInstanceOf(Tokenizer.Comment);
  expect(token.comment).toBe("comment here");
  expect(token.whitespace).toBe("\t");
  expect(token.commentSymbol).toBe("##");
  expect(nextStart).toBe(15);
});

test("matchComment():  Matches empty `//` comment", () => {
  let [token, nextStart] = Tokenizer.matchComment("//");
  expect(token).toBeInstanceOf(Tokenizer.Comment);
  expect(token.comment).toBe("");
  expect(token.whitespace).toBe("");
  expect(token.commentSymbol).toBe("//");
  expect(nextStart).toBe(2);
});

test("matchComment():  Matches empty `--` comment", () => {
  let [token, nextStart] = Tokenizer.matchComment("--");
  expect(token).toBeInstanceOf(Tokenizer.Comment);
  expect(token.comment).toBe("");
  expect(token.whitespace).toBe("");
  expect(token.commentSymbol).toBe("--");
  expect(nextStart).toBe(2);
});

test("matchComment():  Matches empty `##` comment", () => {
  let [token, nextStart] = Tokenizer.matchComment("##");
  expect(token).toBeInstanceOf(Tokenizer.Comment);
  expect(token.comment).toBe("");
  expect(token.whitespace).toBe("");
  expect(token.commentSymbol).toBe("##");
  expect(nextStart).toBe(2);
});

test("matchComment():  Matches in the middle of the string", () => {
  let [token, nextStart] = Tokenizer.matchComment("xxx//comment", 3);
  expect(token).toBeInstanceOf(Tokenizer.Comment);
  expect(token.comment).toBe("comment");
  expect(token.whitespace).toBe("");
  expect(token.commentSymbol).toBe("//");
  expect(nextStart).toBe(12);
});

test("matchComment():  Doesn't incorrectly match in the middle of the string", () => {
  let result = Tokenizer.matchComment("xxx//comment\n", 4);
  expect(result).toEqual(undefined);
});

test("matchComment():  Stops at newline", () => {
  let [token, nextStart] = Tokenizer.matchComment("//\tcomment here\n");
  expect(token).toBeInstanceOf(Tokenizer.Comment);
  expect(token.comment).toBe("comment here");
  expect(token.whitespace).toBe("\t");
  expect(token.commentSymbol).toBe("//");
  expect(nextStart).toBe(15);
});

test("matchComment():  Doesn't go beyond the end", () => {
  let [token, nextStart] = Tokenizer.matchComment("//\tcomment here\n", 0, 10);
  expect(token).toBeInstanceOf(Tokenizer.Comment);
  expect(token.comment).toBe("comment");
  expect(token.whitespace).toBe("\t");
  expect(token.commentSymbol).toBe("//");
  expect(nextStart).toBe(10);
});

test("matchComment():  Doesn't match if start > end", () => {
  let result = Tokenizer.matchComment("//\tcomment here\n", 2, 1);
  expect(result).toEqual(undefined);
});

test("matchComment():  Doesn't match if start is out of range", () => {
  let result = Tokenizer.matchComment("//\tcomment here\n", 100);
  expect(result).toEqual(undefined);
});

test("matchComment():  Matches if end is out of range", () => {
  let [token, nextStart] = Tokenizer.matchComment("//\tcomment here\n", 0, 100);
  expect(token).toBeInstanceOf(Tokenizer.Comment);
  expect(token.comment).toBe("comment here");
  expect(token.whitespace).toBe("\t");
  expect(token.commentSymbol).toBe("//");
  expect(nextStart).toBe(15);
});





//
// matchJSXStartTag()
//
test("matchJSXStartTag():  Returns undefined for empty string", () => {
  let result = Tokenizer.matchJSXStartTag("");
  expect(result).toEqual(undefined);
});

test("matchJSXStartTag():  If no match, returns undefined", () => {
  let result = Tokenizer.matchJSXStartTag("a");
  expect(result).toEqual(undefined);
});

test("matchJSXStartTag():  Matches no-attribute start tag at beginning of string", () => {
  let [token, nextStart] = Tokenizer.matchJSXStartTag("<test>");
  expect(token).toBeInstanceOf(Tokenizer.JSXElement);
  expect(token.tagName).toBe("test");
  expect(token.isUnaryTag).toBe(undefined);
  expect(token.children).toBe(undefined);
  expect(token.attributes).toBe(undefined);
  expect(nextStart).toBe(6);
});

test("matchJSXStartTag():  Matches no attribute unary tag at beginning of string", () => {
  let [token, nextStart] = Tokenizer.matchJSXStartTag("<test/>");
  expect(token).toBeInstanceOf(Tokenizer.JSXElement);
  expect(token.tagName).toBe("test");
  expect(token.isUnaryTag).toBe(true);
  expect(token.children).toBe(undefined);
  expect(token.attributes).toBe(undefined);
  expect(nextStart).toBe(7);
});

test("matchJSXStartTag():  Does NOT match end tag at beginning of string", () => {
  let result = Tokenizer.matchJSXStartTag("</test>");
  expect(result).toEqual(undefined);
});

test("matchJSXStartTag():  Matches start tag with attributes at beginning of string", () => {
  let [token, nextStart] = Tokenizer.matchJSXStartTag("<test a='a\\'a' bbb=1 c-0-a={tokens} d>");
  expect(token).toBeInstanceOf(Tokenizer.JSXElement);
  expect(token.tagName).toBe("test");
  expect(token.isUnaryTag).toBe(undefined);
  expect(token.children).toBe(undefined);
  expect(nextStart).toBe(38);

  let attributes = token.attributes;
  expect(attributes).toBeInstanceOf(Array);
  expect(attributes.length).toEqual(4);

  expect(attributes[0].name).toEqual("a");
  expect(attributes[0].value).toBeInstanceOf(Tokenizer.Text);
  expect(attributes[0].value.text).toEqual("a\\'a");

  expect(attributes[1].name).toEqual("bbb");
  expect(attributes[1].value).toBe(1)

  expect(attributes[2].name).toEqual("c-0-a");
  expect(attributes[2].value).toBeInstanceOf(Tokenizer.JSXExpression);

  expect(attributes[3].name).toEqual("d");
  expect(attributes[3].value).toBe(undefined);
});

test("matchJSXStartTag():  Matches unary tag with attributes at beginning of string", () => {
  let [token, nextStart] = Tokenizer.matchJSXStartTag("<test a='a\\'a' bbb=1 c-0-a={tokens} d/>");
  expect(token).toBeInstanceOf(Tokenizer.JSXElement);
  expect(token.tagName).toBe("test");
  expect(token.isUnaryTag).toBe(true);
  expect(token.children).toBe(undefined);
  expect(nextStart).toBe(39);

  let attributes = token.attributes;
  expect(attributes).toBeInstanceOf(Array);
  expect(attributes.length).toEqual(4);

  expect(attributes[0].name).toEqual("a");
  expect(attributes[0].value).toBeInstanceOf(Tokenizer.Text);
  expect(attributes[0].value.text).toEqual("a\\'a");

  expect(attributes[1].name).toEqual("bbb");
  expect(attributes[1].value).toBe(1)

  expect(attributes[2].name).toEqual("c-0-a");
  expect(attributes[2].value).toBeInstanceOf(Tokenizer.JSXExpression);

  expect(attributes[3].name).toEqual("d");
  expect(attributes[3].value).toBe(undefined);
});

test("matchJSXStartTag():  Matches in the middle of the string", () => {
  let [token, nextStart] = Tokenizer.matchJSXStartTag("xxx<test aprop/>xxx", 3);
  expect(token).toBeInstanceOf(Tokenizer.JSXElement);
  expect(token.tagName).toBe("test");
  expect(token.isUnaryTag).toBe(true);
  expect(token.children).toBe(undefined);
  expect(token.attributes).toBeInstanceOf(Array);
  expect(token.attributes.length).toEqual(1);
  expect(nextStart).toBe(16);
});

test("matchJSXStartTag():  Doesn't incorrectly match in the middle of the string", () => {
  let result = Tokenizer.matchJSXStartTag("xxx<test aprop/>xxx", 4);
  expect(result).toEqual(undefined);
});

test("matchJSXStartTag():  Doesn't stop at newline", () => {
  let [token, nextStart] = Tokenizer.matchJSXStartTag("xxx<test aprop\n bprop/>xxx", 3)
  expect(token).toBeInstanceOf(Tokenizer.JSXElement);
  expect(token.tagName).toBe("test");
  expect(token.isUnaryTag).toBe(true);
  expect(token.children).toBe(undefined);
  expect(token.attributes).toBeInstanceOf(Array);
  expect(token.attributes.length).toEqual(2);
  expect(nextStart).toBe(23);
});

test("matchJSXStartTag():  Matches but doesn't go beyond the end", () => {
  let [token, nextStart] = Tokenizer.matchJSXStartTag("<test aprop\n bprop/>", 0, 10)
  expect(token).toBeInstanceOf(Tokenizer.JSXElement);
  expect(token.tagName).toBe("test");
  expect(token.isUnaryTag).toBe(undefined);
  expect(token.error).toBe("No end >");
  expect(token.children).toBe(undefined);
  expect(token.attributes).toBeInstanceOf(Array);
  expect(token.attributes.length).toEqual(1);
  expect(token.attributes[0].name).toEqual("apro");
  expect(nextStart).toBe(10);
});

test("matchJSXStartTag():  Doesn't match if start > end", () => {
  let result = Tokenizer.matchJSXStartTag("xxx<test aprop\n bprop/>", 3, 2)
  expect(result).toEqual(undefined);
});

test("matchJSXStartTag():  Doesn't match if start is out of range", () => {
  let result = Tokenizer.matchJSXStartTag("xxx<test aprop\n bprop/>", 100)
  expect(result).toEqual(undefined);
});

test("matchJSXStartTag():  Matches if end is out of range", () => {
  let [token, nextStart] = Tokenizer.matchJSXStartTag("xxx<test aprop\n bprop/>xxx", 3, 100)
  expect(token).toBeInstanceOf(Tokenizer.JSXElement);
  expect(token.tagName).toBe("test");
  expect(token.isUnaryTag).toBe(true);
  expect(token.children).toBe(undefined);
  expect(token.attributes).toBeInstanceOf(Array);
  expect(token.attributes.length).toEqual(2);
  expect(nextStart).toBe(23);
});



//
// matchJSXEndTag()
//
test("matchJSXEndTag():  Returns undefined for empty string", () => {
  let result = Tokenizer.matchJSXEndTag("</test>", "");
  expect(result).toEqual(undefined);
});

test("matchJSXEndTag():  If no match, returns undefined", () => {
  let result = Tokenizer.matchJSXEndTag("</test>", "a");
  expect(result).toEqual(undefined);
});

test("matchJSXEndTag():  Matches specified end tag at beginning of string", () => {
  let [token, nextStart] = Tokenizer.matchJSXEndTag("</test>","</test>");
  expect(token).toBe("</test>")
  expect(nextStart).toBe(7);
});

test("matchJSXEndTag():  Does not match different end tag at beginning of string", () => {
  let result = Tokenizer.matchJSXEndTag("</bad>","</test>");
  expect(result).toBe(undefined);
});

test("matchJSXEndTag():  Matches specified end tag in the middle of the string", () => {
  let [token, nextStart] = Tokenizer.matchJSXEndTag("</test>","xxx</test>", 3);
  expect(token).toBe("</test>")
  expect(nextStart).toBe(10);
});

test("matchJSXEndTag():  Does not incorrectly match in the middle of the string", () => {
  let result = Tokenizer.matchJSXEndTag("</test>","xxx</test>", 2);
  expect(result).toBe(undefined);
});

test("matchJSXEndTag():  Doesn't match if start > end", () => {
  let result = Tokenizer.matchJSXEndTag("</test>","xxx</test>", 3, 2);
  expect(result).toEqual(undefined);
});

test("matchJSXEndTag():  Doesn't match if start is out of range", () => {
  let result = Tokenizer.matchJSXEndTag("</test>","xxx</test>", 100);
  expect(result).toEqual(undefined);
});

test("matchJSXEndTag():  Matches if end is out of range", () => {
  let [token, nextStart] = Tokenizer.matchJSXEndTag("</test>","xxx</test>", 3, 100);
  expect(token).toBe("</test>")
  expect(nextStart).toBe(10);
});




//
// matchJSXAttribute()
//
test("matchJSXAttribute():  Returns undefined for empty string", () => {
  let result = Tokenizer.matchJSXAttribute("");
  expect(result).toEqual(undefined);
});

test("matchJSXAttribute():  If no match, returns undefined", () => {
  let result = Tokenizer.matchJSXAttribute(":");
  expect(result).toEqual(undefined);
});

test("matchJSXAttribute():  Matches no-value attribute at beginning of string", () => {
  let [token, nextStart] = Tokenizer.matchJSXAttribute("xyz ");
  expect(token).toBeInstanceOf(Tokenizer.JSXAttribute);
  expect(token.name).toEqual("xyz");
  expect(token.value).toEqual(undefined);
  expect(nextStart).toEqual(4);
});

test("matchJSXAttribute():  Matches string attribute at beginning of string", () => {
  let [token, nextStart] = Tokenizer.matchJSXAttribute("xyz='abc' ");
  expect(token).toBeInstanceOf(Tokenizer.JSXAttribute);
  expect(token.name).toEqual("xyz");
  expect(token.value).toBeInstanceOf(Tokenizer.Text);
  expect(token.value.quotedString).toEqual("'abc'")
  expect(nextStart).toEqual(10);
});

test("matchJSXAttribute():  Matches number attribute at beginning of string", () => {
  let [token, nextStart] = Tokenizer.matchJSXAttribute("xyz=0.33 ");
  expect(token).toBeInstanceOf(Tokenizer.JSXAttribute);
  expect(token.name).toEqual("xyz");
  expect(token.value).toEqual(0.33);
  expect(nextStart).toEqual(9);
});

test("matchJSXAttribute():  Matches JSX Expression attribute at beginning of string", () => {
  let [token, nextStart] = Tokenizer.matchJSXAttribute("xyz={foo bar baz} ");
  expect(token).toBeInstanceOf(Tokenizer.JSXAttribute);
  expect(token.name).toEqual("xyz");
  expect(token.value).toBeInstanceOf(Tokenizer.JSXExpression);
  expect(token.value.contents).toEqual("foo bar baz");
  expect(nextStart).toEqual(18);
});

test("matchJSXAttribute():  Matches identifier attribute at beginning of string", () => {
  let [token, nextStart] = Tokenizer.matchJSXAttribute("xyz=foo ");
  expect(token).toBeInstanceOf(Tokenizer.JSXAttribute);
  expect(token.name).toEqual("xyz");
  expect(token.value).toBeInstanceOf(Tokenizer.JSXExpression);
  expect(token.value.contents).toEqual("foo");
  expect(nextStart).toEqual(8);
});


test("matchJSXAttribute():  Matches no-value attribute in the middle of the string", () => {
  let [token, nextStart] = Tokenizer.matchJSXAttribute("...xyz ", 3);
  expect(token).toBeInstanceOf(Tokenizer.JSXAttribute);
  expect(token.name).toEqual("xyz");
  expect(token.value).toEqual(undefined);
  expect(nextStart).toEqual(7);
});

test("matchJSXAttribute():  Matches string attribute in the middle of the string", () => {
  let [token, nextStart] = Tokenizer.matchJSXAttribute("...xyz='abc' ", 3);
  expect(token).toBeInstanceOf(Tokenizer.JSXAttribute);
  expect(token.name).toEqual("xyz");
  expect(token.value).toBeInstanceOf(Tokenizer.Text);
  expect(token.value.quotedString).toEqual("'abc'")
  expect(nextStart).toEqual(13);
});

test("matchJSXAttribute():  Matches number attribute in the middle of the string", () => {
  let [token, nextStart] = Tokenizer.matchJSXAttribute("...xyz=0.33 ", 3);
  expect(token).toBeInstanceOf(Tokenizer.JSXAttribute);
  expect(token.name).toEqual("xyz");
  expect(token.value).toEqual(0.33);
  expect(nextStart).toEqual(12);
});

test("matchJSXAttribute():  Matches JSX Expression attribute in the middle of the string", () => {
  let [token, nextStart] = Tokenizer.matchJSXAttribute("...xyz={foo bar baz} ",3);
  expect(token).toBeInstanceOf(Tokenizer.JSXAttribute);
  expect(token.name).toEqual("xyz");
  expect(token.value).toBeInstanceOf(Tokenizer.JSXExpression);
  expect(token.value.contents).toEqual("foo bar baz");
  expect(nextStart).toEqual(21);
});

test("matchJSXAttribute():  Matches identifier attribute in the middle of the string", () => {
  let [token, nextStart] = Tokenizer.matchJSXAttribute("...xyz=foo ", 3);
  expect(token).toBeInstanceOf(Tokenizer.JSXAttribute);
  expect(token.name).toEqual("xyz");
  expect(token.value).toBeInstanceOf(Tokenizer.JSXExpression);
  expect(token.value.contents).toEqual("foo");
  expect(nextStart).toEqual(11);
});

test("matchJSXAttribute():  Doesn't go beyond the end", () => {
  let [token, nextStart] = Tokenizer.matchJSXAttribute("...xyz ", 3, 4);
  expect(token).toBeInstanceOf(Tokenizer.JSXAttribute);
  expect(token.name).toEqual("x");
  expect(token.value).toEqual(undefined);
  expect(nextStart).toEqual(4);
});

test("matchJSXAttribute():  Doesn't match if start > end", () => {
  let result = Tokenizer.matchJSXAttribute("xxx", 2, 1);
  expect(result).toEqual(undefined);
});

test("matchJSXAttribute():  Doesn't match if start is out of range", () => {
  let result = Tokenizer.matchJSXAttribute("xxx", 100);
  expect(result).toEqual(undefined);
});

test("matchJSXAttribute():  Matches if end is out of range", () => {
  let [token, nextStart] = Tokenizer.matchJSXAttribute("xyz={foo bar baz} ");
  expect(token).toBeInstanceOf(Tokenizer.JSXAttribute);
  expect(token.name).toEqual("xyz");
  expect(token.value).toBeInstanceOf(Tokenizer.JSXExpression);
  expect(token.value.contents).toEqual("foo bar baz");
  expect(nextStart).toEqual(18);
});




//
// matchJSXChild()
//
test("matchJSXChild():  Returns undefined for empty string", () => {
  let result = Tokenizer.matchJSXChild("</foo>", "");
  expect(result).toEqual(undefined);
});

test("matchJSXChild():  If no match, returns undefined", () => {
  let result = Tokenizer.matchJSXChild("</foo>", ":");
  expect(result).toEqual(undefined);
});

test("matchJSXChild():  Matches JSX end tag at beginning of string", () => {
  let [token, nextStart] = Tokenizer.matchJSXChild("</foo>", "</foo>");
  expect(token).toEqual("</foo>");
  expect(nextStart).toEqual(6);
});

test("matchJSXChild():  Matches text & whitespace at beginning of string w/end delimiter", () => {
  let [token, nextStart] = Tokenizer.matchJSXChild("</foo>", " some text here <");
  expect(token).toBe(" some text here ");
  expect(nextStart).toEqual(16);
});

test("matchJSXChild():  Does NOT matches text & whitespace at beginning of string w/OUT end delimiter", () => {
  let result = Tokenizer.matchJSXChild("</foo>", " some text here");
  expect(result).toBe(undefined);
});


test("matchJSXChild():  Matches JSX element at beginning of string", () => {
  let [token, nextStart] = Tokenizer.matchJSXChild("</foo>", "<bar/>  ");
  expect(token).toBeInstanceOf(Tokenizer.JSXElement);
  expect(token.tagName).toEqual("bar");
  expect(nextStart).toEqual(6);
});

test("matchJSXChild():  Matches JSX Expression at beginning of string", () => {
  let [token, nextStart] = Tokenizer.matchJSXChild("</foo>", "{ foo bar baz } ");
  expect(token).toBeInstanceOf(Tokenizer.JSXExpression);
  expect(token.contents).toEqual(" foo bar baz ");
  expect(nextStart).toEqual(15);
});


test("matchJSXChild():  Matches JSX end tag in the middle of string", () => {
  let [token, nextStart] = Tokenizer.matchJSXChild("</foo>", "...</foo>", 3);
  expect(token).toEqual("</foo>");
  expect(nextStart).toEqual(9);
});


test("matchJSXChild():  Matches text & whitespace in the middle of string w/end delimiter", () => {
  let [token, nextStart] = Tokenizer.matchJSXChild("</foo>", "...some text here <", 3);
  expect(token).toBe("some text here ");
  expect(nextStart).toEqual(18);
});

test("matchJSXChild():  Does NOT matches text & whitespace in the middle of string w/OUT end delimiter", () => {
  let result = Tokenizer.matchJSXChild("</foo>", "...some text here", 3);
  expect(result).toBe(undefined);
});


test("matchJSXChild():  Matches JSX element in the middle of string", () => {
  let [token, nextStart] = Tokenizer.matchJSXChild("</foo>", "...<bar/>  ", 3);
  expect(token).toBeInstanceOf(Tokenizer.JSXElement);
  expect(token.tagName).toEqual("bar");
  expect(nextStart).toEqual(9);
});

test("matchJSXChild():  Matches JSX Expression in the middle of string", () => {
  let [token, nextStart] = Tokenizer.matchJSXChild("</foo>", "...{ foo bar baz } ", 3);
  expect(token).toBeInstanceOf(Tokenizer.JSXExpression);
  expect(token.contents).toEqual(" foo bar baz ");
  expect(nextStart).toEqual(18);
});


test("matchJSXChild():  Doesn't go beyond the end", () => {
  let result = Tokenizer.matchJSXChild("</foo>", "...{abc}", 3, 4);
  expect(result).toBe(undefined);
});

test("matchJSXChild():  Doesn't match if start > end", () => {
  let result = Tokenizer.matchJSXChild("</foo>", "xxx", 2, 1);
  expect(result).toEqual(undefined);
});

test("matchJSXChild():  Doesn't match if start is out of range", () => {
  let result = Tokenizer.matchJSXChild("</foo>", "xxx", 100);
  expect(result).toEqual(undefined);
});

test("matchJSXChild():  Matches if end is out of range", () => {
  let [token, nextStart] = Tokenizer.matchJSXChild("</foo>", "</foo>", 0, 100);
  expect(token).toBe("</foo>");
  expect(nextStart).toEqual(6);
});


