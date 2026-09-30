/*! SPELL: SCOPES @system:examples:FizzBuzz */
;(globalThis.SPELL_SCOPES ??= {})[document.currentScript.src] = {
  id: "@system:examples:FizzBuzz",
  entries: [
    { path: "project:FizzBuzz" },
    {
      path: "project:FizzBuzz/file:FizzBuzz.spell",
      uri: "spell:/@system:examples:FizzBuzz/FizzBuzz.spell"
    },
    {
      path: "project:FizzBuzz/file:FizzBuzz.spell/function:play fizzbuzz", line: [2, 7],
      section: "File FizzBuzz.spell",
      description: "## File FizzBuzz.spell",
      rules: [
        { name: "play_fizzbuzz", syntax: "play fizzbuzz" }
      ]
    }
  ]
}
