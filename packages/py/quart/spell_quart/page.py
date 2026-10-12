"""A spell app's page:  the HTML that loads the javascript core, the program's drawing half, and connects to `/ws`.

```python
page_html("Solitaire", elements="/Solitaire.elements.js")
```

- The javascript core, Solid and Spell UI come from `/spell/`:  the built page side (`assets_folder()`).
  - `spell-page.js` is the page's `@spell/core`, by an import map:  the drawing half imports from it.
- The program's drawing half, `<Project>.elements.js`, and those of the projects it imports (`projects`).
- Semantic UI's CSS, which spell's drawings use (`ui button`), and the program's own, in its drawing half.
- Its app draws into `<div id="spell-app-root">`, as `App.start()` draws.
- Each frame to and from the program is written to the browser's console, folded, one line each, its badge coloured:
  `SENDING >  event card-click (#26)` (blue), `RECEIVED <  patch:  Card #26, StockPile #3` (green);
  and anything that goes wrong, `< ERROR >` (red).
"""

import html
import json
import os
from pathlib import Path

# Where the page side's files are served from:  see `page_html()`, `assets_folder()`.
ASSETS_URL = "/spell"


def page_html(
    title: str, elements: str, projects: dict[str, str] | None = None, socket: str = "/ws", log_frames: bool = True
) -> str:
    """The page:  see the module's docs.

    - `elements`:  the URL of the program's drawing half, e.g. `/Solitaire.elements.js`.
    - `projects`:  the URL of each imported project's drawing half,
      by the module name the program's drawing half imports it as:
      `{"@spell/project/@system:library:cards": "/cards.elements.js"}`.
    - `socket`:  the path of the WebSocket it connects to.
    - `log_frames`:  write each frame to the browser's console, both ways, to watch the page and the program talk
      (`logFrame()`, in the javascript core's `page.ts`).  `?frames=off` on the page's address turns it off.
    """
    projects = projects or {}
    imports = {"@spell/core": f"{ASSETS_URL}/spell-page.js", **projects}
    modules = [f"import * as project{index} from {json.dumps(module)}" for index, module in enumerate(projects)]
    names = [f"project{index}" for index in range(len(projects))] + ["program"]
    return f"""<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{html.escape(title)}</title>
    <link rel="stylesheet" href="{ASSETS_URL}/semantic-ui-css/semantic.min.css" />
    <script type="importmap">{json.dumps({"imports": imports})}</script>
  </head>
  <body>
    <div id="spell-app-root"></div>
    <script type="module">
      import {{ connectPage }} from "@spell/core"
      {chr(10).join(modules)}
      import * as program from {json.dumps(elements)}
      const url = `${{location.protocol === "https:" ? "wss" : "ws"}}://${{location.host}}{socket}`
      const log = {json.dumps(log_frames)} && new URLSearchParams(location.search).get("frames") !== "off"
      connectPage({{ modules: [{", ".join(names)}], url, log }})
    </script>
  </body>
</html>
"""


def assets_folder() -> Path:
    """The page side's files:  `$SPELL_PAGE_ASSETS`, else the repo's build of them, `packages/app/dist-page`.

    - throws `FileNotFoundError` when there's none:  build it with `yarn build:page`, in `packages/app`.
    """
    named = os.environ.get("SPELL_PAGE_ASSETS")
    folder = Path(named) if named else Path(__file__).resolve().parents[3] / "app" / "dist-page"
    if not (folder / "spell-page.js").is_file():
        raise FileNotFoundError(f"No page side at {folder}:  build it with `yarn build:page`, in packages/app")
    return folder
