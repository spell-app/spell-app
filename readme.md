## Purpose

Creating an algorithmic parser for experiments in converting "natural language" code (called "spell," a subset of the english language) into machine-readable code (currently Javascript). Programs are expressed in syntactially correct English and are then translated into equivalent Javascript code.

At the root of this is a "Rule Syntax" which resembles regular expressions on steroids -- allowing the language developer to express **any** language rules (not just "spell") in a way that feels natural to anyone familiar with regular expressions. The parser itself is dead simple (src/Parser.js), and it's the formulation of the rules (src/rules/) which provides the power. In contrast to other rule-based parsers, it's easy for the language developer to add additional rules to the system by simply importing them dynamically, even at runtime. The parser core could easily be re-written in other languages (e.g. python) and other "compilation targets" are easily possible.

# Documentation

---

Experimental [Deepwiki Documentation](https://deepwiki.com/oakjs/parser)

## Getting Started

- Install Docker Desktop
- Clone this repo and switch into the project directory
- Build the docker images (e.g. first time or when docker config changes)
  - `docker compose build`
- Start app server (port 3000) and api server (port 3001) with Docker
  - `docker compose up` [1]
  - `ctrl-c` in the terminal window to stop the image, or stop in docker desktop.
- Open http://localhost:3000 in your web browser.
- Check out the [Solitaire Example](http://localhost:3000/run/examples/Solitaire/Card.spell)
- Click the `Edit Example` button to see the code.
- To run tests:
  - `docker compose run api-server yarn test`

### To install with local node/yarn/docker

- Install Docker Desktop
- Install node and yarn with volta (TODO)
- `yarn docker-build`
- `yarn docker` or `yarn docker-bg`
- To run tests
- `yarn test` or `yarn test:ui`


### Editing spell in the app

The app's editor (Monaco) gets the same language features as VS Code, from the same language service, run in
the page:  errors as you type, hover, completion, go to definition (F12, into other files too), find references
(Shift-F12), rename (F2, which saves every file it changes), outline (Cmd-Shift-O), folding, expand selection
and Format Document.


### Edit spell in VS Code

The repo has a language server for spell (`src/lsp/`) and a VS Code extension to run it (`vscode-extension/`):
errors as you type, hover, completion, go to definition, find references, rename, outline, folding, formatting.

**Install it in your VS Code:**

- `yarn` in the repo, if you haven't already -- the extension runs the repo's own language server.
- `yarn vscode` -- builds the extension and installs it in VS Code.  It's the two steps below.
  - `yarn vscode:build` -- installs the extension's packages, bundles it, and packages
    `vscode-extension/spell-language.vsix`.
  - `yarn vscode:install` -- installs that file with `code --install-extension`.  Or in VS Code:
    Extensions view => `...` menu => `Install from VSIX...`.
    (No `code` command?  In VS Code:  `Shell Command: Install 'code' command in PATH`.)
- Reload VS Code, and open a `.spell` file.

Notes:

- The extension runs the parser straight from this repo, so parser changes need no rebuild:  just
  `Developer: Restart Extension Host`, or reload the window.  Rebuild and reinstall only when `vscode-extension/`
  itself changes.
- The extension's version is pinned to the parser's (`version` in both `package.json`s):  the build fails if they
  differ, so bump them together.
- The build records where this repo is.  Move the repo and either rebuild, or set `spell.parserRoot` to its new
  folder.
- If nothing happens, look at the "Spell" entry in the Output panel.  The language server needs `node` on
  VS Code's `PATH`.

**Work on the extension:**  open the repo in VS Code and press `F5` ("Run Spell Extension").  A new window opens on
the Solitaire example with the extension loaded.

**Using it:**

- `Spell: Show Compiled JavaScript` (or the button at the top of a `.spell` editor) shows the file's javascript,
  updating as you type.
- `Spell: Run Project` (the ▶ button) runs the file's project beside it, and re-runs it each time the project
  compiles without errors -- on save, its Restart button, or anything rewriting its `<Project>.compiled.js`,
  e.g. the web app.  A project that doesn't parse leaves the last good run going.  "Show Console" opens a pane
  with "Program Output" (what it `print`s), "Type Explorer":  the live scopes it parsed in, and what each
  declares, in document order under its `##` headings or alphabetical -- click one for its docs, spell and
  compiled code -- and "Thing Explorer":  every thing the program
  has made, in the order made or by type, with its properties as they change and its actions -- ▶ does one.  Its code is this repo's `dist-runner/`
  (from `src/app/runner/`), which building the extension builds:
  after changing `src/app/runner/` alone, `yarn build:runner` and close / reopen the panel.
- Spell indents with tabs:  the extension sets `.spell` files to tabs, and formatting always uses them.
- Settings:  `spell.compileOnSave` writes the project's `<Project>.compiled.js` on save;  `spell.parserRoot` points at another
  checkout of this repo.

### Run spell in any page:  `<spell-app>`

`<spell-app>` is a web component that runs a compiled project -- no editor -- with an optional toolbar and a
"Debug" pane:  a read-only Type Explorer, the Thing Explorer, and the program's console.  Several can run on one page, each in its own
shadow root, so page and app styles don't mix.

```html
<script type="module" src="/element/spell-app.js"></script>

<!-- from the spell server, sources and all -->
<spell-app project="@examples/Solitaire" toolbar debug="explorer" height="600px"></spell-app>

<!-- from any static host:  its `Calculator.scopes.js`, and any project it imports, beside it -->
<spell-app src="apps/Calculator.compiled.js" toolbar width="50%"></spell-app>
```

- `yarn build:element` builds it into `dist-element/`:  copy that folder anywhere.  The dev server serves it at
  `/element/`, with a demo at `http://localhost:3001/demo/spell-app.html`.
- Attributes:  `project` or `src` (what to run), `scopes` (its scope pack, if not beside it), `name`, `toolbar`,
  `debug="explorer"` / `"things"` / `"console"` (open the Debug pane), `width` / `height` (`fluid`, the default, or any CSS
  length), `assets` (where Semantic UI and Lato are, if not beside the script).
- `el.restart()` runs it again;  a `spell-open` event says a Type Explorer link was clicked.
- Its Type Explorer reads the project's scope pack, `<Project>.scopes.js`.  `yarn scopes [--compile] <projectId...>`
  writes it, e.g. `yarn scopes --compile @examples/Solitaire`;  so does the VS Code extension, on each clean compile.
- `src=` from another origin needs CORS on the compiled JS -- scope packs don't.

---

## To see server logs

- The `yarn docker` command will output server logs for both servers in the command line.
- To see API server logs in docker:
  - In Docker Desktop, click `Containers` => `parser` => `api-server`
- To start docker without server logs, use `yarn docker-bg`.

## To test

- `yarn test`

or for test coverage:

- `yarn coverage`

## Parser operation

To parse English text

- `spellParser.parse("a = 1")`
  - returns the syntax tree, easiest for now to inspect it in the console
  - parses as a "statement"

or

- `spellParser.parse("expression", "a = 1")`
  - parse "text" as a specific rule type

To "compile" text into javascript:

- `spellParser.compile("a = 1")`

## Rules

- `Rule`s match specific characters/logical structures the provided text.
- Simple rules are composed into larger rules, for example:
  - `the` is a simple rule satisified with simple text match
  - `{expression}` matches the "expression" sub-rule
  - `{identifier} = {expression}` is a `statement` rule which uses the above as subrules.
- Rules come in various flavors:
  - `Keyword`s match a literal word-like string or non-word-like single characters.
  - `Pattern`s match a regular expression.
  - `Subrule`s match another rule, specified by subrule name.
  - `Sequence`s match a sequence of named rules and/or keywords.
  - `Alternatives` match one or more of a set of alternative rules.
  - `List`s match a delmited list of zero or more items.
- You'll generally specify rules using our `RuleSyntax`, which is a human-friendly way
  of specifying a sequence of rules as a string, e.g.
  - `{identifier} = {literal-value}` automatically creates a `sequence` of
    1. `identifier` subrule
    2. `=` keyword
    3. `literal-value` subrule

## RuleSyntax

- **All rules are stored in the `src/rules` directory**.
- Test files live next to the rule files they cover.
- To include a rule file in the browser
  - add it as an `import()` in `src/rules`

| Syntax           | Description                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| {...}            | Curly braces indicate that we should match a named subrule here.                                                                                                    |
| {rule:localName} | A `:` inside a rule specifier allows you to specify a local name for that rule in the parse tree.                                                                   |
| (...)            | Parenthesis indicate a parenthesized expression, often a set of `Alternatives` or used to make a rule optional (see below).                                         |
| [...]            | Indicates a `List` expresion.                                                                                                                                       |
| (...&#124;...)   | A vertical pipe, generally found inside parenthesis, indicates a set of `Alternatives`, any one of which will work.                                                 |
| ...?             | A question mark indicates that the preceding rule is optional.                                                                                                      |
| ...\*            | An asterisk indicates that the preceding rule is optional, and may repeat one or more times.                                                                        |
| ...+             | A plus indicates that the preceding rule is required, and MAY be repeated one or more times.                                                                        |
| whitespace       | Whitespace is used for nesting blocks and separating pattern/keyword rules, and is automatically consumed. **NOTE: Use `tab` and `return` characters for nesting.** |
| anything else    | Pretty much anything else indicates a keyword, which may be punctuation, e.g. `=`, or english words `is`, `not`, `play`, etc.                                       |

## Examples:

- `if {condition:expression} (then|:)? {statement}?`
- `{statement} if {condition:expression} (?:(else|otherwise) {elseStatement:statement})?`
- `a random {identifier} (of|from|in) (the)? {list:expression}`

## License

[MIT License](https://opensource.org/licenses/MIT)

Copyright &copy; 2017-2025 Matthew Owen Williams
