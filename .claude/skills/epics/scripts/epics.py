#!/usr/bin/env python3
"""Every epic (a plan doc, `packages/docs/epics/<name>/<name>.plan.html`, or an old `<name>.html`) and where it stands, for `/epics`.

Usage:
  epics.py               the open epics, as text
  epics.py --all         every epic, finished ones too
  epics.py --json        the same as JSON:  `{generated, main, epics[]}` (`--all --json` too)

Looks at:
- the plan docs on `main`, and in each worktree `.claude/worktrees/<name>` the one named for it (its live copy:  an
  epic plans and works in its own worktree, so `main` may have an older copy, or none yet)
- each doc's phases and open items (`yarn plan-doc summaries`, one run for all)
- the worktree / branch `<name>`:  commits not in `main`, uncommitted files, `/park` notes
- the running sessions in that worktree, or titled `<name>`

Each epic ~== `{name, title, file, state, open, phases[], done, active, next, estimate, waiting{<kind>: n},
worktree, branch, unique, dirty, parked, overnight, sessions[], error}`:
- `state`:
  - `planning` -- no phases yet
  - `working` -- a phase active, or phases left and a session on it busy or waiting
  - `stalled` -- phases left, nothing working on it
  - `unmerged` -- every phase done, but its branch has work not in `main`
  - `done` -- every phase done, nothing left outside `main`
  - `unreadable` -- `plan-doc` can't read it (`error` says why)
- `open`:  anything but `done`;  `/epics` lists only these unless `--all`
- `waiting`:  open items Owen acts on, by kind (`question`, `judgement`, `test`, `issue`), zeros left out
- Read-only:  this script changes nothing.
"""

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "worktrees" / "scripts"))
import worktrees as wt  # noqa: E402  (`/worktrees`' helpers:  live_sessions(), worktree_names(), note(), ...)

park = wt.park
MAIN = wt.MAIN
EPICS = Path("packages") / "docs" / "epics"

# open item kinds worth Owen's attention, in the order to act on them
WAITING = ["question", "judgement", "test", "issue"]


def main():
    args = set(sys.argv[1:])
    if args - {"--all", "--json"}:
        sys.exit(__doc__)
    epics = gather()
    shown = epics if "--all" in args else [e for e in epics if e["open"]]
    if "--json" in args:
        return print(json.dumps({"generated": wt.now_iso(), "main": str(MAIN), "epics": shown}, indent=2))
    print_report(shown, epics)


################
# ## Gather
################


def gather():
    """Every epic, open ones first, then by name."""
    worktrees = {name: (path, branch) for name, path, branch in wt.worktree_names()}
    files = {}
    for folder in sorted((MAIN / EPICS).glob("*")):
        found = plan_doc_in(folder, folder.name)
        if found:
            files[folder.name] = found
    # a worktree's own plan doc is the live one
    for name, (path, _) in worktrees.items():
        own = plan_doc_in(Path(path) / EPICS / name, name)
        if own:
            files[name] = own
    summaries = park.plan_summaries([str(f) for f in files.values()])
    sessions = wt.live_sessions()
    epics = [epic(name, str(file), summaries.get(str(file)), worktrees.get(name), sessions)
             for name, file in files.items()]
    return sorted(epics, key=lambda e: (not e["open"], e["name"]))


def plan_doc_in(folder, name):
    """Epic `name`'s plan doc in `folder`:  `<name>.plan.html`, else an old `<name>.html` that is a plan doc, else None.

    - why both:  plan docs were renamed on 2026-10-04 (`review-review` P4);  worktrees cut before keep the old name
      until they merge `main` (`packages/docs/scripts/pages.js` `planDocIn()` is the same)
    """
    renamed = folder / f"{name}.plan.html"
    if renamed.exists():
        return renamed
    old = folder / f"{name}.html"
    if old.exists() and re.search(r'<body\b[^>]*\bclass="[^"]*\bplan-doc\b', old.read_text()):
        return old
    return None


def epic(name, file, summary, worktree, sessions):
    """One epic's facts and `state`."""
    path, branch = worktree or (None, None)
    if not branch and park.git("rev-parse", "--verify", "--quiet", f"refs/heads/{name}"):
        branch = name
    ahead = wt.count(f"main..{branch}") if branch else 0
    # commits whose patch is already in `main` (squashed, cherry-picked) don't count as work
    unique = len([l for l in (park.git("cherry", "main", branch) or "").splitlines() if l.startswith("+")]) \
        if ahead else 0
    dirty = len((wt.run(["git", "-C", path, "status", "--short"]) or "").splitlines()) if path else 0
    here = [s for s in sessions if (path and wt.in_folder(s["cwd"], path)) or s["name"] == name]
    summary = summary or {"error": "`plan-doc summaries` didn't run"}
    phases = summary.get("phases") or []
    found = {
        "name": name,
        "title": summary.get("title") or name,
        "file": file,
        "phases": phases,
        "done": len([p for p in phases if p.get("status") == "done"]),
        "active": summary.get("active"),
        "next": summary.get("next"),
        "estimate": summary.get("estimate"),
        "waiting": {k: len(summary["open"][k]) for k in WAITING if summary.get("open", {}).get(k)},
        "worktree": path,
        "branch": branch,
        "unique": unique,
        "dirty": dirty,
        "parked": wt.note(path, "PARKED", name),
        "overnight": summary.get("overnight"),
        "sessions": [{k: s[k] for k in ("id", "name", "agent", "state", "lastActive", "this")} for s in here],
        "error": summary.get("error"),
    }
    found["state"] = state(found)
    found["open"] = found["state"] != "done"
    return found


def state(epic):
    """`planning` / `working` / `stalled` / `unmerged` / `done` / `unreadable`:  see the module docstring."""
    if epic["error"]:
        return "unreadable"
    if not epic["phases"]:
        return "planning"
    if epic["done"] < len(epic["phases"]):
        moving = epic["active"] or any(s["state"] in ("busy", "waiting") for s in epic["sessions"])
        return "working" if moving else "stalled"
    return "unmerged" if epic["unique"] or epic["dirty"] else "done"


################
# ## Text report
################


def print_report(shown, epics):
    """One block per epic shown:  its line, then its plan doc.  Then the finished epics left out that still wait on
    Owen:  a question, judgement call or test is his to act on, done or not."""
    print(f"{len(shown)} of {len(epics)} epics\n")
    for e in shown:
        print(f"- {e['name']}  [{e['state']}]  {e['title']}")
        print(f"    {describe(e)}")
        print(f"    {e['file']}")
    hidden = [e for e in epics if e not in shown and set(e["waiting"]) - {"issue"}]
    if hidden:
        print("\nDone, but still waiting on you:")
        for e in hidden:
            waits = {k: n for k, n in e["waiting"].items() if k != "issue"}
            print(f"- {e['name']}:  " + ", ".join(f"{n} {k}{'s' if n > 1 else ''}" for k, n in waits.items()))
    print()


def describe(epic):
    """Where `epic` stands, in one line."""
    bits = [progress(epic)]
    bits.append(f"worktree `{epic['name']}`" if epic["worktree"] else f"branch `{epic['branch']}`" if epic["branch"]
                else "no worktree")
    left = ", ".join(b for b in (f"{epic['unique']} commits not in `main`" if epic["unique"] else "",
                                 f"{epic['dirty']} uncommitted" if epic["dirty"] else "") if b)
    if left:
        bits.append(left)
    bits += [f"session `{s['name']}` {s['state']}" + (" (this one)" if s["this"] else "") for s in epic["sessions"]]
    if epic["waiting"]:
        bits.append("waiting:  " + ", ".join(f"{n} {k}{'s' if n > 1 else ''}" for k, n in epic["waiting"].items()))
    if epic["parked"] and epic["parked"]["state"] != "resumed":
        bits.append(f"parked ({epic['parked']['state']})")
    if epic["overnight"] == "active":
        bits.append("running overnight (/bedtime)")
    elif epic["overnight"] == "done":
        bits.append("overnight report not gone through")
    if epic["error"]:
        bits.append(epic["error"])
    return ";  ".join(bits)


def progress(epic):
    """`P3 · Name active (2/5 done)`, `next P3 · Name (2/5 done)`, `all 5 phases done`, `no phases yet`."""
    total = len(epic["phases"])
    if not total:
        return "no phases yet"
    if epic["done"] == total:
        return f"all {total} phases done"
    if epic["active"]:
        return f"P{epic['active']['n']} · {epic['active']['name']} active ({epic['done']}/{total} done)"
    return f"next P{epic['next']['n']} · {epic['next']['name']} ({epic['done']}/{total} done)"


if __name__ == "__main__":
    main()
