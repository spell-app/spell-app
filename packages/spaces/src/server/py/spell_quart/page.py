"""A spell app's page:  the HTML that loads the javascript core, the program's drawing half, and connects to `/ws`.

```python
page_html("Solitaire", elements="/Solitaire.elements.spell.js")
```

- The javascript core, Solid and Spell UI come from `/spell/`:  the built page side (`assets_folder()`).
  - `spell-page.js` is the page's `@spell/core`, by an import map:  the drawing half imports from it.
- The program's drawing half, `<Project>.elements.spell.js`, and those of the projects it imports (`projects`).
- Semantic UI's CSS, which spell's drawings use (`ui button`), and the program's own, in its drawing half.
- Its app draws into `<div id="spell-app-root">`, as `App.start()` draws.
- Until it does, a "Loading <title>" block with a spinner (`LOADING`).
  - Plain HTML and CSS, so it shows the moment the page arrives, before any script has loaded.
  - It fades out once the app draws its first thing.
- Each frame to and from the program is written to the browser's console, folded, one line each, its badge coloured:
  - `SENDING  >  event card-click (#26)` (blue)
  - `RECEIVED <  patch:  Card #26, StockPile #3` (green)
  - anything that goes wrong, `< ERROR  >` (red)
"""

import html
import json
import os
from pathlib import Path
from typing import Any

# Where the page side's files are served from:  see `page_html()`, `assets_folder()`.
ASSETS_URL = "/spell"


def page_html(
    title: str, elements: str, projects: dict[str, str] | None = None, socket: str = "/ws", log_frames: bool = True
) -> str:
    """The page:  see the module's docs.

    - `elements`:  the URL of the program's drawing half, e.g. `/Solitaire.elements.spell.js`.
    - `projects`:  the URL of each imported project's drawing half,
      by the module name the program's drawing half imports it as:
      `{"@spell/project/@spell/library/cards": "/cards.elements.spell.js"}`.
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
    <link rel="icon" type="image/svg+xml" href="{ASSETS_URL}/favicon/favicon.svg" />
    <link rel="stylesheet" href="{ASSETS_URL}/semantic-ui-css/semantic.min.css" />
    <script type="importmap">{json.dumps({"imports": imports})}</script>
  </head>
  <body>
    {LOADING.replace("__TITLE__", html.escape(title))}
    <div id="spell-app-root"></div>
    <script>{HIDE_LOADING}</script>
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
    folder = Path(named) if named else Path(__file__).resolve().parents[5] / "app" / "dist-page"
    if not (folder / "spell-page.js").is_file():
        raise FileNotFoundError(f"No page side at {folder}:  build it with `yarn build:page`, in packages/app")
    return folder


def built_folder(path: str) -> Path:
    """Folder `path` in the build folder of the checkout this spell_quart is in:  `$SPELL_BUILD_DIR`, else its `build/`.

    - e.g. `built_folder("spaces/@spell/examples/solitaire")`:  where `spell compile` builds Solitaire
      (epic `people-and-orgs` J33).
    - Found as `assets_folder()` finds the page side:  each checkout's app runs its own spell_quart,
      so it loads its own checkout's build, in a worktree or after a move.
    - `$SPELL_BUILD_DIR` is the variable the node side reads.
    """
    named = os.environ.get("SPELL_BUILD_DIR")
    build = Path(named) if named else Path(__file__).resolve().parents[6] / "build"
    return build / path


def fresh(response: Any) -> Any:
    """SIDE EFFECT:  `response` tells the browser to check with the server before reusing its copy.  Returns it.

    - For the page side's files and a program's drawing half:  their names stay the same when they're built again,
      so a browser reusing a copy from before could mix an old file with a new one
      (`ui-button.js` asking `UIComponent.js` for something it no longer has).
    - The check is cheap:  the server answers "not modified" when nothing changed.
    """
    response.cache_control.no_cache = True
    return response


# What the page shows until its app draws:  a card with a spinner, "Loading <title>".
# - Plain HTML and CSS, in the page itself, ahead of every script:  it shows the moment the page arrives.
# - Its own names (`spell-loading`), so neither Semantic UI nor the program's styles touch it.
LOADING = """<style>
      #spell-loading {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: grid;
        place-items: center;
        background: radial-gradient(circle at 30% 20%, #f3efff, #e7eefb 55%, #dde6f4);
        font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        color: #23253a;
        transition: opacity 0.4s ease;
      }
      #spell-loading.spell-loaded {
        opacity: 0;
        pointer-events: none;
      }
      #spell-loading .spell-loading-card {
        padding: 44px 64px;
        border-radius: 22px;
        text-align: center;
        background: rgba(255, 255, 255, 0.78);
        box-shadow: 0 24px 64px rgba(40, 50, 100, 0.16);
      }
      #spell-loading .spell-loading-spinner {
        width: 56px;
        height: 56px;
        margin: 0 auto 26px;
        border: 5px solid #dadff1;
        border-top-color: #6435c9;
        border-radius: 50%;
        animation: spell-loading-spin 0.9s linear infinite;
      }
      #spell-loading h1 {
        margin: 0 0 8px;
        font-size: 30px;
        font-weight: 700;
        letter-spacing: -0.01em;
      }
      #spell-loading p {
        margin: 0;
        font-size: 15px;
        color: #676b84;
      }
      @keyframes spell-loading-spin {
        to {
          transform: rotate(360deg);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        #spell-loading .spell-loading-spinner {
          animation-duration: 2.5s;
        }
      }
    </style>
    <div id="spell-loading" role="status" aria-live="polite">
      <div class="spell-loading-card">
        <div class="spell-loading-spinner"></div>
        <h1>Loading __TITLE__</h1>
        <p>Starting the program in Python&hellip;</p>
      </div>
    </div>"""

# Fades `LOADING` out, then removes it, once the app draws its first thing into its root.
HIDE_LOADING = """
      new MutationObserver((changes, observer) => {
        const loading = document.getElementById("spell-loading")
        if (!loading || !document.getElementById("spell-app-root").firstChild) return
        observer.disconnect()
        loading.classList.add("spell-loaded")
        setTimeout(() => loading.remove(), 400)
      }).observe(document.getElementById("spell-app-root"), { childList: true })
    """
