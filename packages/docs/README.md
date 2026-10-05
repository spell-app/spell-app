# @spell-app/docs

Docs for every package in the repo, written as plain HTML pages that render with [`@spell-app/ui`](../ui/README.md).

Open [`index.html`](content/index.html) in a browser.  Pages load straight from disk:  no server, no build step
to read them.

| Folder                       | What's there                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------- |
| `<topic>/`                   | One doc per topic, e.g. `solid/solid-2.html`, plus its `experiments/`   |
| `templates/`                 | Starting points for each kind of doc                                          |
| `epics/`                     | Plan docs, one per `/epic` session                                        |
| `spell-docs/`                | How the pages work, and the `@spell-app/ui` problems they turned up               |
| `_assets/`                   | The shared stylesheet, page script and `@spell-app/ui` bundle every page loads    |
| `scripts/`                   | The tooling                                                                   |

## Commands

From the repo root, or from this folder:

```sh
spell dev docs update     # rebuild the @spell-app/ui bundle from the latest UI, then check every page in a real browser
spell dev docs index      # rewrite the lists in index.html after adding or renaming a page
spell dev docs new durable <topic>/<topic>.html --title "Title"  # start a page from a template
spell dev docs open       # show the index (or a given page) in Chrome
```

How to write a page:  [`AGENTS.md`](AGENTS.md).
