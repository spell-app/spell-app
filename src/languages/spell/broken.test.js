//
// # Rules which don't work.
//  - add rules here when they don't match properly with `skip`
//  - then we can enable them selectively to test them
//

import parser from "./spell.js";

describe("broken rules:", () => {

  it.skip("doubly nested quotes", () => {
    const match = parser.parse("text", "'\"Gadzooks! I can\\'t believe it!\" he said'");
    expect(match.compile()).toBe("'\"Gadzooks! I can\'t believe it!\" he said'");
  });

});
