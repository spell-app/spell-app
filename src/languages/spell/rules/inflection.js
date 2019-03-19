import {
  lowerFirst,
  upperFirst,
  pluralize,
  singularize
} from "../all.js";

//
// Results manipulation for casing and such
//

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
      type: Types[0],   // main type
//      Types,            // all types, singular, upper case
//      types,            // all types, singular, lower case
      method: methodName.join("_"),
      args,
//       instanceMethod: instanceMethodName.join("_"),
//       instanceArgs: args.slice(1),
      syntax: rules.join(" ")
    }
  };
}
