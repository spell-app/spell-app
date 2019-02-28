import {
  lowerFirst,
  upperFirst,
  pluralize,
  singularize
} from "../../utils/all.js";

//
// Results manipulation for casing and such
//

// Inflect string value found in `results[key]`.
// NOTE: modifies the original `results` object and returns it.
//
// e.g.     `inflectResults(`{ type: 'cards' }`, "type")`
// yields:  `{ type: 'card', types: 'cards', Type: 'Card', Types: 'Cards' }`
export function inflectResults(results, ...keys) {
  for (var i = 0, key; key = keys[i]; i++) {
    if (typeof results[key] === "string") {
      results[key] = lowerFirst(singularize(results[key]));
      results[upperFirst(key)] = upperFirst(results[key]);
      const pluralKey = pluralize(key)
      results[pluralKey] = pluralize(results[key]);
      results[upperFirst(pluralKey)] = upperFirst(results[pluralKey]);
    }
  }
  return results;
}

// Inflect array of string values found in `results[key]`.
// NOTE: modifies the original `results` object and returns it.
//
// e.g.     `inflectResultsArray(`{ types: ['cards', 'pile'] }`, "types")`
// yields:  `{ types: ['card','pile'], Types: ['Cards','Piles'] }`
export function inflectResultsArray(results, key) {
  // coerce string to an array
  if (typeof results[key] === "string") results[key] = [results[key]];
  if (Array.isArray(results[key])) {
    results[key] = results[key].map(value => lowerFirst(singularize(value)));
    results[upperFirst(key)] = results[key].map(value => upperFirst(value));
  }
  return results;
}

// Parse the `keywords` for a dynamic method.
//  e.g.  `add a card to the pile` will yield:
//  {
//    types: ["card", "pile"],
//    Types: ["Card", "Pile"],
//    method: "add_card_to_pile",
//    args: ["card, pile"],
//    instanceMethod: "add_to_pile",
//    instanceArgs: ", pile"
//  }
//
export function parseMethodKeywords(results) {
  const { keywords } = results;

  const methodName = [];
  let types = [];
  for (var i = 0; i < keywords.length; i++) {
    let word = keywords[i];
    // if starts with a capital, assume it's a Type
    let isType = word[0].toUpperCase() === word[0];

    word = word.toLowerCase();
    // if the word before it is `a` or `an`, assume it's a type
    if ((word === "a" || word === "an") && keywords[i+1]) {
      isType = true;
      word = keywords[++i].toLowerCase();   // skip the article, add the next word
    }
    if (isType) {
      word = singularize(word);
      types.push(word);
    }
    methodName.push(word);
  }

  return {
    ...results,
    ...{
      types,    // all types, singular, lower case
      Types: types.map(type => upperFirst(type)),
      method: methodName.join("_"),
      args: [...types],
      // skip the first type (assuming it will be `this`)
      instanceMethod: methodName.filter(word => word != types[0]).join("_"),
      // skip the first type
      instanceArgs: types.slice(1)
    }
  };
}
