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
      const Key = upperFirst(key);
      const pluralKey = pluralize(key)
      const PluralKey = upperFirst(pluralKey);

      results[key] = lowerFirst(singularize(results[key]));
      results[Key] = upperFirst(results[key]);
      results[pluralKey] = pluralize(results[key]);
      results[PluralKey] = upperFirst(results[pluralKey]);

      // put in under `<key>Name` etc as well
      results[key+"Name"] = results[key];
      results[Key+"Name"] = results[Key];
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
//    Type: "Card",
//    Types: ["Card", "Pile"],
//    types: ["card", "pile"],
//    method: "add_card_to_pile",
//    args: ["card, pile"],
//    instanceMethod: "add_to_pile",
//    instanceArgs: ["pile"],
//    syntax: "add ${callArgs:expression} to ${callArgs:expression}"
//  }
//
export function parseMethodKeywords(results) {
  const { keywords } = results;

  const methodName = [];
  const instanceMethodName = [];
  const types = [];
  const rules = [];

  for (var i = 0; i < keywords.length; i++) {
    let word = keywords[i];
    // if starts with a capital, assume it's a Type
    let isType = (word[0].toUpperCase() === word[0]);

    // if the word before it is `a` or `an`, assume it's a type
    if ((word === "a" || word === "an") && keywords[i+1]) {
      isType = true;
      word = keywords[++i];
    }

    word = lowerFirst(word);
    if (isType) {
      word = singularize(word);
      types.push(word);
      rules.push(`{callArgs:expression}`);
      if (types.length > 1) {
        instanceMethodName.push(word);
      }
    }
    else {
      rules.push(word);
      instanceMethodName.push(word);
    }
    methodName.push(word);
  }

  const Types = types.map(type => upperFirst(type));
  const args = types.map((type, index) => { return { name: type, type: Types[index] } });
  return {
    ...results,
    ...{
      Type: Types[0],   // main type
      Types,            // all types, singular, upper case
      types,            // all types, singular, lower case
      method: methodName.join("_"),
      args,
      instanceMethod: instanceMethodName.join("_"),
      instanceArgs: args.slice(1),
      syntax: rules.join(" ")
    }
  };
}
