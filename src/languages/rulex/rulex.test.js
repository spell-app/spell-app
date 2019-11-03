import { unitTestModuleRules } from "../../parser/all"
import { rulex as parser } from "./all"

describe("testing langauge rulex", () => {
  unitTestModuleRules(parser, "rulex")

  describe("integration tests", () => {})
})
