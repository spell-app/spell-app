
//  NOT SURE HOW RELEVANT THIS IS -- HyperCard used it for fields...
parser.defineRule({
  name: "assignment",
  alias: "statement",
  syntax: "put {value:expression} into {thing:expression}",
  testRule: "put",
  compile(scope, match) {
    let { thing, value } = match.results;
    // TODO: declare identifier if not in scope, etc
    return `${thing} = ${value}`;
  },
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["put yes into thing", "thing = true"]
      ]
    }
  ]
});
