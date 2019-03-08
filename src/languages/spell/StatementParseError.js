import {
  Rule,
  SpellParser
} from "./all.js";

// Parser error representation in parser output.
SpellParser.Rule.StatementParseError = class parse_error extends Rule {
  get message() {
    if (this.parsed) {
      return (
        "CANT PARSE ENTIRE STATEMENT\n" +
        "PARSED      : `" +
        this.parsed +
        "`\n" +
        "CAN'T PARSE : `" +
        this.unparsed +
        "`"
      );
    }
    return "CAN'T PARSE STATEMENT: `" + this.unparsed + "`";
  }

  compile(scope, match) {
    return "// " + match.message.split("\n").join("\n// ");
  }
};
