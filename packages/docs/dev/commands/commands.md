# Commands:  rules for agents

Distilled from `commands.html` (beside this), the map of every operation the `spell` CLI, the Claude skills and the
yarn scripts do.  READ this before adding, renaming or removing a CLI command, a skill or a yarn script.

## When this applies

- Owen asks for a new skill, or a new `spell` command
- you're about to add a yarn script (any package) to solve a problem
- you rename or remove any of the three

## Before building:  suggest

1. Look the operation up:  `commands.json` (grep its `op` words and `names`), or the page's filter
   (`yarn docs:open dev/commands/commands.html`).  Does something already do it, under another name, or nearly?
2. Then tell Owen, in a numbered list, BEFORE building it:
   - where it belongs (see "Layers"):  usually a `spell dev <noun> <verb>`, with a skill or yarn alias on top
   - its name (see "Names")
   - what it would replace or merge with, and which roadmap move (`R1` ... on the page) it advances
   - whether an existing command should grow a verb or flag instead
3. A yarn script you add mid-task:  say so in the reply, with the same suggestion.  Build what was asked;  the
   suggestion is for Owen to weigh.

## Layers

- skill:  judgement and dialog only (which name, which modal, what to say).  Every repo action is ONE `spell`
  call, with `--json` when the skill reads the answer.  Steps written only as prose are debt:  name them.
- `spell` CLI:  every repo action.  Repo tools live under `spell dev`;  each finds the NEAREST checkout from the
  cwd (`CLI.findCheckout()`), so it works in a worktree.
- yarn:  a package's tool-native scripts stay (`build`, `ts`, `lint`, `format`, `test`, `gen:*`, vite, astro);
  repo actions are one-line aliases of a `spell dev` call (`"commands:check": "node packages/cli/bin/spell.mjs dev
  commands check"`).
- Package-local tool CLIs stay (`packages/ui/tools/cli.ts`).  Claude-only steps stay in skills (`EnterWorktree`,
  `SendMessage`, modals).

## Names

- Noun then verb, everywhere:  `spell dev server start` = yarn `server:start`;  dashes inside a word
  (`plan-doc`, `merge-check`), colons only between yarn's noun and verb.
- Spell-LANGUAGE commands stay bare:  `spell compile`, `spell check`.
- Skills keep short workflow names (`/isolate`, `/park`).
- The `spell dev` nouns, and their verbs:  the page's "5.2 Names".  Reuse a noun before inventing one.

## Keep the page true, in the same change

- `commands.json`:  every command sits in some row's `cli` / `skill` / `yarn` `names` (`spell dev x`, `/name`,
  `<package> <script>`, `root` for the repo root).  A new operation gets a new row (`op`, marks, `runs`,
  `target`);  the JSON's shape:  `packages/docs/_assets/commands.js`'s header.
- `yarn commands:check` must pass (`spell dev commands check`:  exits 1 on a command the page lacks, or a name
  no command has).
- A new noun or verb, or a roadmap change:  edit the page's "5. Target" / "6. Roadmap" too.
- Building a roadmap move:  update the affected rows' marks and `target`.
