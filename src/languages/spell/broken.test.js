//
// # Rules which don't work.
//  - add rules here when they don't match properly with `skip`
//  - then we can enable them selectively to test them
//

import parser from "./spell.js";

describe("broken rules:", () => {

  it.skip("and vs is precedence", () => {
    const match = parser.parse("expression", "a is 1 and b is 2");
    expect(match.compile()).toBe("(a == 1) and (b == 2)");
  });

  it.skip("doubly nested quotes", () => {
    const match = parser.parse("text", "'\"Gadzooks! I can\\'t believe it!\" he said'");
    expect(match.compile()).toBe("'\"Gadzooks! I can\'t believe it!\" he said'");
  });

});
