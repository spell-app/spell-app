//
// # Rules which don't work.
//  - add rules here when they don't match properly with `skip`
//  - then we can enable them selectively to test them
//

import parser from "./languages/spell/spell.js";

describe("broken rules:", () => {

  it.skip("the suit of the card is 'ace'", () => {
    const match = parser.parse("expression", "the suit of the card is 'ace'");
    expect(match.compile()).toBe("card.suit == 'ace'");
  });


});
