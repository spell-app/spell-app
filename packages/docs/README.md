# @spell-app/docs

Docs for every package in the repo, written as plain HTML pages that render with [`@spell-app/ui`](../ui/README.md).

The pages live in shared folders at the repo root (links into `../spell-app-dev`, not tracked here);  this package
holds their tooling.  Open the docs home, [`pages/index.html`](../../pages/index.html), with `spell dev docs open`:
the page server gives live reload and the review buttons.  Most pages also load straight from disk.

| Folder (repo root)           | What's there                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------- |
| `guides/<topic>/`            | One doc per topic, e.g. `guides/solid/solid-2.html`, plus its `experiments/`  |
| `templates/`                 | Starting points for each kind of doc                                          |
| `epics/`                     | Plan docs, one per `/epic` session:  `<epic-*>` elements, `packages/epics`    |
| `pages/`                     | The docs home, and the scratch details pages                                  |

| Folder (here)                | What's there                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------- |
| `tools/`                     | The tooling:  `spell dev docs ...`, the checks, link fixing                   |
| `tools/_assets/`             | The shared stylesheets, page script and `@spell-app/ui` bundle every page loads |

## Commands

From the repo root, or from this folder:

```sh
spell dev docs update     # rebuild the @spell-app/ui bundle from the latest UI, then check every page in a real browser
spell dev docs index      # rewrite the docs home's cards and each area's list page after adding or renaming a page
spell dev docs new durable <topic>/<topic>.html --title "Title"  # start a page from a template
spell dev docs open       # show the docs home (or a given page) in Chrome
```

How to write a page:  [`AGENTS.md`](AGENTS.md).
