//
// # Rules which don't work.
//  - add rules here when they don't match properly with `skip`
//  - then we can enable them selectively to test them
//

import parser from "./all.js";

describe("broken rules:", () => {

  it.skip("doubly nested quotes", () => {
    const match = parser.parse("'\"Gadzooks! I can\\'t believe it!\" he said'", "text");
    expect(match.compile()).toBe("'\"Gadzooks! I can\'t believe it!\" he said'");
  });

});
