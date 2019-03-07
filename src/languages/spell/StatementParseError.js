import {
  Rule,
} from "./all.js";

// Parser error representation in parser output.
export class StatementParseError extends Rule {
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

  compile(match, scope) {
    return "// " + match.message.split("\n").join("\n// ");
  }
};
