import { spellParser } from "~/languages/spell"
console.debug = console.info = console.group = console.groupEnd = () => {}
const scope = spellParser.getScope("probe")
const setup = [
  "a bank-account is a thing",
  "bank-accounts have an account-type as one of checking or savings",
  "a card is a thing",
  "cards have a suit as one of clubs, diamonds",
  "a card \"is a (suit)\" for its suits",
  "set the account to a new bank-account",
].join("\n")
const block = scope.parse(setup, "block")
console.log("@@ setup errors:", JSON.stringify((await import("~/languages/spell")).getParseErrors(block!)?.map((e: any) => e.inputText)))
console.log("@@ rules:", scope.rules.get().map((r: any) => `${r.name} ${JSON.stringify(r.definition.literals ?? r.definition.syntax)}`).join(" | "))
const bank = scope.types.get("bank-account")!
console.log("@@ bank vars:", bank.variables.get().map((v: any) => v.name), "class:", bank.classVariables.get().map((v: any) => v.name))
for (const input of [
  "bank-account account-types", "bank_account account_types", "Bank_Account Account_types", "bank-account account_types",
  "the account-types of the account", "the account-type of the account",
  "the card is a club", "the card is a clubs",
]) {
  const m = scope.parse(input, "expression")
  let out: unknown; try { out = m?.compile() } catch (e) { out = `THROW ${e}` }
  console.log(`@@ ${JSON.stringify(input).padEnd(40)} ${m ? m.rule.name : "NO MATCH"} ${JSON.stringify(m?.inputText?.trim())} => ${JSON.stringify(out)}`)
}
const def = scope.parse("bank-accounts have an account-type as one of checking or savings", "statement")
console.log("@@", JSON.stringify(def?.compile()))
