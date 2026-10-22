# spell-app on the page server

```json
"pageServer": {
  "routes": ["src/spaces/server/node/routes/appRoutes.ts"],
  "pageScripts": [
    { "src": "/element/spell-language.js", "file": "app/dist-element/spell-language.js", "skip": ["/components/"] }
  ],
  "componentSets": {
    "app": { "name": "App UI", "dir": "app/docs", "assets": "../spell-ui/site/_assets" }
  }
}
```

_spell-app's whole part of the page server's settings, from its [package.json](package.json)._

The page server is the kit's, and so is this page's old content:  every address, every setting, bundles, tabs, live
reload and editing in place are on [the kit's README-server.md](https://github.com/spell-app/spell-kit/blob/main/README-server.md).
spell-app brings only its own part, the three settings above, the way each repo does.
The kit merges every installed repo's part as the server starts, each read from its own repo's folder.

## What the three settings add

| Setting | What it adds |
| --- | --- |
| `routes` | the app's route module, [appRoutes.ts](src/spaces/server/node/routes/appRoutes.ts):  the editor, its API, the built-in projects' build (below) |
| `pageScripts` | `spell-language.js`, which colours blocks of Spell on the docs pages;  not on the component sets' pages, and only while its file exists, so a checkout that hasn't run `yarn build:element` gets no 404 |
| `componentSets` | App UI, the docs pages of the app's components, from [app/docs/](app/docs/), at `/components/app/` ([README-app.md](README-app.md)) |

spell-app names no other repo's routes:  spell-epic, Spell UI and the content repo each declare their own.

## What `appRoutes` serves

```sh
curl -s http://127.0.0.1:4747/hello
# {"message":"Hello from the API!"}
```

It answers the editor's API under `/api/`, a project's files at `/spaces/<project>/<file>`, the editor's element
bundles at `/element/`, the header's `/editor` link, and `/hello`.
Address by address, with its one check and the builds behind it:
[spaces' servers](README-spaces.md#the-servers--an-api-that-nothing-starts).

- It's listed after spell-epic's ten modules, so it sees every `/api/` call nobody before it answered.
- It starts the editor, Vite's dev server for the app, once the page server listens, and stops it with the server.
  - The editor's record, `{ url, pid }`, goes in `.spell-server.editor.json` at the KIT's root, the page server's
    root, once it answers:  that's what `/editor` and `spell server start all` read.
  - Its output goes to `.spell-server.editor.log`, beside it.

## Running it

Day to day, `yarn start` in spell-app's folder is all you need:
a fresh page server and the editor, printing the editor's address ([spell-app's setup](README.md#setup-from-zero)).
`spell app serve [project]` does the same without the install, and opens the editor in your browser.

To see what's up, `yarn serve`, which is `spell server start all`:
it starts whatever of the kit's web servers isn't running, waits until each answers, and prints one row each.

```text
Spell servers of ~/www/spell:
  page server            4747  http://127.0.0.1:4747/                docs, epics, /api                 running
  editor                 3000  http://localhost:3000/                the spell app (vite)              running
  Spell UI's docs site   4747  http://127.0.0.1:4747/components/ui/  static pages, by the page server  running
```

- A row says `started` instead of `running` for a server it had to start.
- The editor's row is there only while spell-app is installed:  without it, the kit's server still serves the epic
  pages and the Spell UI and Epic UI sets.
- The rest of `spell server`:  [the kit's commands](https://github.com/spell-app/spell-kit/blob/main/README-cli.md#the-kit).

## See also

- [The kit's page server](https://github.com/spell-app/spell-kit/blob/main/README-server.md):  every address and setting, how the repos' parts merge,
  bundles, the tabs, adding a route
- [Spaces](README-spaces.md):  the editor's API, call by call, and the servers behind it
- [README-app.md](README-app.md):  the editor and App UI, which this part serves
