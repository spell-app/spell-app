#!/usr/bin/env python3
"""Where session / worktree / plan `<name>` stands, for `/park`, `/unpark` and `/wait-for`.

Usage:
  status.py <name>                                   JSON, below
  status.py --candidates                             what `/wait-for ?` offers:  JSON list
  status.py --parked                                 every parked worktree:  JSON list
  status.py --wait <name> [--every 60] [--max 7140]  poll until `<name>` finishes

`<name>` resolves the way `/wtf <name>` does:  worktree `.claude/worktrees/<name>`, branch `<name>`, plan doc
`packages/docs/epics/<name>/`, and the sessions titled `<name>` or that worked in that worktree.

`status.py <name>` ~== `{name, worktree, branch, ahead, merged, plan, planDone, sessions[{id, title, running,
pid}], finished, why}`:
- `ahead`:  commits on the branch not in `main`
- `merged`:  the branch had commits of its own (its reflog moved past "Created") and all are in `main` now.
  NOTE:  "in `main`" alone isn't enough -- a fresh branch is, too.
- `finished`:  `merged` or `planDone`.  `--wait` adds two it can only see by comparing with when it started:
  the worktree went away, and every running session of `<name>` exited.
  - NEVER "idle":  a session goes idle each time it waits for Owen

`--wait` exits:
- 0 finished (prints the status JSON, `why` saying which)
- 2 `--max` seconds passed first:  run it again.  Why:  a background Bash command is stopped after 2 hours.
- 3 `<name>` matches nothing to wait on
"""

import json
import os
import subprocess
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "wtf" / "scripts"))
from transcript import sessions_named  # noqa: E402

CLAUDE = Path.home() / ".claude"


def main():
    args = sys.argv[1:]
    if args == ["--candidates"]:
        return dump(candidates())
    if args == ["--parked"]:
        return dump(parked())
    if len(args) >= 2 and args[0] == "--wait":
        return wait(args[1], every=flag(args, "--every", 60), most=flag(args, "--max", 7140))
    if len(args) == 1 and not args[0].startswith("-"):
        return dump(status(args[0]))
    sys.exit(__doc__)


################
# ## Status
################


def status(name, ids=None):
    """Status of `name` (see the module docstring);  `ids`:  its session ids, when already known (`find` is slow)."""
    worktree = MAIN / ".claude" / "worktrees" / name
    branch = name if git("rev-parse", "--verify", "--quiet", f"refs/heads/{name}") else None
    ahead = int(git("rev-list", "--count", f"main..{name}") or 0) if branch else 0
    moved = branch and len((git("reflog", "show", "--format=%H", f"refs/heads/{name}") or "").splitlines()) > 1
    merged = bool(branch and moved and ahead == 0)
    plan, done = plan_status(name, worktree)
    live = running()
    if ids is None:
        ids = [id for _, id, _, _ in sessions_named(name)]
        ids += [r["sessionId"] for r in registry() if r["sessionId"] not in ids and named(r, name)]
    sessions = [{"id": id, "title": title(id), "running": id in live, "pid": live.get(id)} for id in ids]
    why = "merged into main" if merged else "plan all done" if done else None
    return {
        "name": name,
        "worktree": str(worktree) if worktree.exists() else None,
        "branch": branch,
        "ahead": ahead,
        "merged": merged,
        "plan": plan,
        "planDone": done,
        "sessions": sessions,
        "finished": bool(why),
        "why": why,
    }


def plan_status(name, worktree):
    """`(plan doc folder or None, every phase done)`, read with `yarn plan-doc summary`:  from the worktree when it
    has `node_modules/`, as its copy of the plan is the live one."""
    for root in (worktree, MAIN):
        folder = root / "packages" / "docs" / "epics" / name
        if folder.exists() and (root / "node_modules").exists():
            out = run(["yarn", "plan-doc", "summary", name, "--json"], cwd=root)
            try:
                phases = json.loads(out or "").get("phases") or []
            except ValueError:
                return str(folder), False
            return str(folder), bool(phases) and all(p.get("status") == "done" for p in phases)
    return None, False


################
# ## Waiting
################


def wait(name, every, most):
    """Poll `name` every `every` seconds until it finishes (exit 0) or `most` seconds pass (exit 2)."""
    first = status(name)
    if not (first["worktree"] or first["branch"] or first["plan"] or first["sessions"]):
        print(f"nothing named {name}:  no worktree, branch, plan doc or session")
        sys.exit(3)
    ids = [s["id"] for s in first["sessions"]]
    had_worktree = bool(first["worktree"])
    was_running = any(s["running"] for s in first["sessions"])
    deadline = time.time() + most
    now = first
    while True:
        if not now["why"] and had_worktree and not now["worktree"]:
            now["why"] = "worktree removed"
        if not now["why"] and was_running and not any(s["running"] for s in now["sessions"]):
            now["why"] = "session exited"
        if now["why"]:
            now["finished"] = True
            dump(now)
            sys.exit(0)
        if time.time() + every > deadline:
            print(f"still waiting for {name} after {most}s:  run again")
            sys.exit(2)
        time.sleep(every)
        now = status(name, ids)


################
# ## Listings
################


def candidates():
    """What `/wait-for ?` offers, each `{name, label}`:  unfinished worktrees and epics, and running sessions
    outside any worktree.  This session is left out."""
    names = {p.name for p in (MAIN / ".claude" / "worktrees").glob("*") if p.is_dir()}
    names |= {p.name for p in (MAIN / "packages" / "docs" / "epics").glob("*") if p.is_dir()}
    mine, found = ancestors(), []
    for name in sorted(names):
        s = status(name, ids=[])
        if s["finished"] or not (s["ahead"] or s["worktree"]):
            continue
        ahead = f"{s['ahead']} commits not in main" if s["ahead"] else "nothing committed yet"
        bits = [ahead if s["branch"] else None, "plan doc" if s["plan"] else None]
        found.append({"name": name, "label": ", ".join(b for b in bits if b) or "worktree"})
    for record in registry():
        cwd = record.get("cwd", "")
        if record["pid"] in mine or "/.claude/worktrees/" in cwd:
            continue
        name = title(record["sessionId"]) or record.get("name", record["sessionId"][:8])
        found.append({"name": name, "label": f"running session ({record.get('status', '?')})"})
    return found


def parked():
    """Every `.claude/worktrees/<name>/PARKED-<name>.md`:  `{name, file, state, stopped}`, `state` from line 1
    (`<!-- park: <state> -->`), `stopped` the first line under "## Where it stopped"."""
    found = []
    for note in sorted((MAIN / ".claude" / "worktrees").glob("*/PARKED-*.md")):
        lines = note.read_text().splitlines()
        state = lines[0].removeprefix("<!-- park:").removesuffix("-->").strip() if lines else "?"
        stopped = next((l for l in lines[lines.index("## Where it stopped") + 1:] if l.strip()), "") \
            if "## Where it stopped" in lines else ""
        found.append({"name": note.parent.name, "file": str(note), "state": state, "stopped": stopped.strip("- ")})
    return found


################
# ## Sessions
################


def registry():
    """The CLI's live-session records, `~/.claude/sessions/<pid>.json`, whose process is still alive and that
    started in this repo (main checkout or a worktree)."""
    records = []
    for file in sorted(CLAUDE.glob("sessions/*.json")):
        try:
            record = json.loads(file.read_text())
        except (OSError, ValueError):
            continue
        inside = record.get("cwd", "") == str(MAIN) or record.get("cwd", "").startswith(f"{MAIN}/")
        if inside and alive(record.get("pid", 0)):
            records.append(record)
    return records


def named(record, name):
    """Whether running session `record` goes by `name`:  its title, its registry name or its id's start."""
    return name in (title(record["sessionId"]), record.get("name")) or record["sessionId"].startswith(name)


def running():
    """`{session id: pid}` of every running session."""
    return {r["sessionId"]: r["pid"] for r in registry()}


def title(session_id):
    """Session `session_id`'s title:  its last `custom-title`, else its last `ai-title` (as `handoff.mjs` does)."""
    custom = ai = None
    for transcript in CLAUDE.glob(f"projects/*/{session_id}.jsonl"):
        for line in open(transcript):
            if '"custom-title"' not in line and '"ai-title"' not in line:
                continue
            try:
                entry = json.loads(line)
            except ValueError:
                continue
            if entry.get("type") == "custom-title":
                custom = entry.get("customTitle")
            elif entry.get("type") == "ai-title":
                ai = entry.get("aiTitle")
    return custom or ai


def alive(pid):
    """Whether process `pid` exists;  `PermissionError` means it does, someone else's."""
    try:
        os.kill(pid, 0)
        return True
    except ProcessLookupError:
        return False
    except (PermissionError, OverflowError):
        return pid > 0


def ancestors():
    """Pids above this script, so the session that ran it can be left out."""
    pids, pid = set(), os.getppid()
    while pid > 1 and pid not in pids:
        pids.add(pid)
        pid = int(run(["ps", "-o", "ppid=", "-p", str(pid)]) or 0)
    return pids


################
# ## Plumbing
################


def run(cmd, cwd=None):
    """`cmd`'s stdout, stripped, or `None` when it fails."""
    try:
        out = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=60)
    except (OSError, subprocess.TimeoutExpired):
        return None
    return out.stdout.strip() if out.returncode == 0 else None


def git(*args):
    """`git` in the MAIN checkout (branches are shared, so worktrees see the same answer)."""
    return run(["git", "-C", str(MAIN), *args])


def flag(args, name, default):
    """Integer value of `--name <n>` in `args`, else `default`."""
    return int(args[args.index(name) + 1]) if name in args else default


def dump(value):
    print(json.dumps(value, indent=2))


def main_checkout():
    """The main checkout's root:  the parent of the shared `.git` folder, from wherever this runs."""
    common = run(["git", "rev-parse", "--path-format=absolute", "--git-common-dir"])
    if not common:
        sys.exit("not in a git repository")
    return Path(common).parent


MAIN = main_checkout()

if __name__ == "__main__":
    main()
