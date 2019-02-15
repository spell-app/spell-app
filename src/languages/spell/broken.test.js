//
// # Rules which don't work.
//  - add rules here when they don't match properly with `skip`
//  - then we can enable them selectively to test them
//

import parser from "./spell.js";

describe("broken rules:", () => {

  it.skip("property_expressions and infix_operators", () => {
    const match = parser.parse("expression", "the suit of the card is 'ace'");
    expect(match.compile()).toBe("card.suit == 'ace'");
  });

  it.skip("list_filter with complicated where", () => {
    const match = parser.parse("expression", "items in my-list where the id of the item > 1");
    expect(match.compile()).toBe("spell.filter(my_list, item => item.id > 1, 'items')");
  });

  it.skip("doubly nested quotes", () => {
    const match = parser.parse("text", "'\"Gadzooks! I can\\'t believe it!\" he said'");
    expect(match.compile()).toBe("'\"Gadzooks! I can\'t believe it!\" he said'");
  });

  it.skip("<position_expression><property_expression>", () => {
    const match = parser.parse("expression", "card n of the cards of the deck");
    expect(match.compile()).toBe("spell.getItem(deck.cards, n, 'card')");
  });

});
