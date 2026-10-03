#!/usr/bin/env python3
"""Everything open in this repo, sorted into three groups, for `/whassup`.

Usage:
  whassup.py           the report, as text
  whassup.py --json    the same, as JSON:  `{generated, groups: {active, dead, stalled}, items[]}`

Looks at:
- worktrees (`git worktree list`), and branches with or without one
- running Claude sessions (`~/.claude/sessions/<pid>.json`), in this repo or anywhere on the machine
- `/park` notes (`PARKED-<name>.md`) and `/bedtime` reports (`MORNING-<name>.md`) in worktrees
- plan docs (`packages/docs/epics/<name>/`) with phases left to do
- `park:<name>` stashes left behind, and window files (`workspaces/ongoing/<name>.code-workspace`) with no worktree

Each item ~== `{key, kind, name, group, why[], actions[], ...facts}`:
- `group`:
  - `active` -- actually in process:  a session working in it, or touched in the last `RECENT` hours
  - `dead` -- hanging on with nothing of value left:  merged or empty worktrees and branches, sessions idle for
    `STALE` hours, window files with no worktree
  - `stalled` -- hung or parked:  `/park`ed, waiting, a busy session gone silent, a question nobody answered, work
    nobody has touched in `RECENT` hours, a plan with phases left and nothing working on it
- `actions`:  what `/whassup` offers for it, each `{id, label, commands[]}`.  `commands` are plain shell lines to run
  one by one from the MAIN checkout;  `[]` means the action is a step Claude takes (open a session, `/wtf`, ask).
- Read-only:  this script changes nothing.
"""

import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "park" / "scripts"))
import status as park  # noqa: E402  (`/park`'s helpers:  MAIN, git(), registry(), title(), plan_status())

CLAUDE = Path.home() / ".claude"
MAIN = park.MAIN
WORKTREES = MAIN / ".claude" / "worktrees"

# hours:  touched within RECENT is in process;  a session idle for STALE is dead
RECENT = 6
STALE = 24
# minutes:  a busy session silent this long is hung;  a question unanswered this long is stalled
SILENT = 20
UNANSWERED = 30


def main():
    report = gather()
    if sys.argv[1:] == ["--json"]:
        return print(json.dumps(report, indent=2))
    if sys.argv[1:]:
        sys.exit(__doc__)
    print_report(report)


################
# ## Gather
################


def gather():
    """The whole report:  every item, grouped."""
    sessions = live_sessions()
    items, claimed = [], set()

    for name, worktree, branch in worktree_names():
        items.append(checkout_item(name, worktree, branch, sessions, claimed))
    for branch in branches():
        if branch not in {i.get("branch") for i in items} and branch != "main":
            items.append(checkout_item(branch, None, branch, sessions, claimed))
    names = {i["name"] for i in items}

    for folder in sorted((MAIN / "packages" / "docs" / "epics").glob("*")):
        if folder.is_dir() and folder.name not in names:
            item = plan_item(folder.name)
            if item:
                items.append(item)

    for session in sessions:
        if session["id"] not in claimed:
            items.append(session_item(session))

    items += stash_items() + window_items({i["name"] for i in items if i.get("worktree")})
    groups = {g: [i["key"] for i in items if i["group"] == g] for g in ("active", "stalled", "dead")}
    return {"generated": now_iso(), "main": str(MAIN), "groups": groups, "items": items}


def checkout_item(name, worktree, branch, sessions, claimed):
    """A worktree and / or branch `name`, with the sessions working in it (marked `claimed`)."""
    here = [s for s in sessions if worktree and in_folder(s["cwd"], worktree)]
    claimed.update(s["id"] for s in here)
    ahead = count(f"main..{branch}") if branch else 0
    behind = count(f"{branch}..main") if branch else 0
    # commits whose patch is already in `main` (squashed, cherry-picked) don't count as work
    unique = len([l for l in (park.git("cherry", "main", branch) or "").splitlines() if l.startswith("+")]) \
        if ahead else 0
    dirty = (run(["git", "-C", worktree, "status", "--short"]) or "").splitlines() if worktree else []
    moved = branch and len((park.git("reflog", "show", "--format=%H", f"refs/heads/{branch}") or "").splitlines()) > 1
    plan, plan_done = park.plan_status(name, WORKTREES / name)
    item = {
        "key": f"worktree:{name}" if worktree else f"branch:{name}",
        "kind": "worktree" if worktree else "branch",
        "name": name,
        "worktree": worktree,
        "branch": branch,
        "ahead": ahead,
        "unique": unique,
        "behind": behind,
        "dirty": len(dirty),
        "everCommitted": bool(moved),
        "lastCommit": park.git("log", "-1", "--format=%cI", branch) if branch else None,
        "lastTouched": last_touched(worktree, branch, here),
        "plan": plan,
        "planDone": plan_done,
        "parked": note(worktree, "PARKED", name),
        "morning": note(worktree, "MORNING", name),
        "sessions": here,
    }
    classify_checkout(item)
    return item


def classify_checkout(item):
    """Set `group`, `why` and `actions` on a worktree / branch item."""
    why, work = [], item["unique"] or item["dirty"]
    sessions = item["sessions"]
    parked = item["parked"] if item["parked"] and item["parked"]["state"] != "resumed" else None

    # stuck beats everything:  a session that stopped moving, or a question nobody answered
    why += [f"session `{s['name']}` busy but silent for {s['silentMin']} min" for s in sessions if s["state"] == "hung"]
    why += [f"session `{s['name']}` asked a question {s['questionMin']} min ago, unanswered" for s in sessions
            if s["question"] and s["questionMin"] >= UNANSWERED]
    if why:
        return set_group(item, "stalled", why + notes(item, parked), stalled_actions(item))

    # a session moving in it beats a leftover note:  it may be resuming, or the note is stale
    moving = any(s["state"] in ("busy", "waiting") or hours_since(s["lastActive"]) < RECENT for s in sessions)
    if moving or (sessions and not parked and not item["morning"] and hours_since(item["lastTouched"]) < STALE):
        return set_group(item, "active", [describe_sessions(item)] + notes(item, parked), active_actions(item))
    if parked or item["morning"]:
        return set_group(item, "stalled", notes(item, parked), stalled_actions(item))

    if not work:
        merged = "merged into `main`" if item["everCommitted"] else "never got a commit"
        if item["ahead"]:
            merged = f"its {item['ahead']} commits are already in `main` (squashed or cherry-picked)"
        idle = f";  session(s) idle {age(item['lastTouched'])}" if item["sessions"] else ""
        return set_group(item, "dead", [f"nothing left:  {merged}, nothing uncommitted{idle}"], dead_actions(item))

    left = ", ".join(b for b in (
        f"{item['unique']} commits not in `main`" if item["unique"] else "",
        f"{item['dirty']} uncommitted files" if item["dirty"] else "") if b)
    if hours_since(item["lastTouched"]) < RECENT:
        return set_group(item, "active", [f"{left};  touched {age(item['lastTouched'])}, no session open"],
                         active_actions(item))
    if item["plan"] and item["planDone"]:
        why.append(f"plan all done, but {left}:  never merged?")
    else:
        why.append(f"{left};  untouched {age(item['lastTouched'])}, no session open")
    return set_group(item, "stalled", why, stalled_actions(item))


def notes(item, parked):
    """Asides about `item`'s `/park` note and `/bedtime` report, which don't decide its group alone."""
    found = [f"parked ({parked['state']}):  {parked['stopped'] or 'see the note'}"] if parked else []
    if item["morning"]:
        found.append("`/bedtime` left a morning report (`MORNING-*.md`):  `/wakeup` not finished")
    return found


def plan_item(name):
    """A plan doc with no worktree or branch:  stalled if phases are left, else nothing to report."""
    plan, done = park.plan_status(name, WORKTREES / name)
    if not plan or done:
        return None
    item = {"key": f"plan:{name}", "kind": "plan", "name": name, "plan": plan, "planDone": False, "sessions": []}
    actions = [
        action("wtf", f"`/wtf {name}`:  where it stopped", []),
        action("epic", f"pick it up:  `/epic {name}` in a new session", []),
    ]
    return set_group(item, "stalled", ["plan doc with phases left, no worktree or branch working on it"], actions)


def session_item(session):
    """A running session not inside any worktree:  the main checkout, or elsewhere on the machine."""
    item = {"key": f"session:{session['id'][:8]}", "kind": "session", "name": session["name"], "sessions": [session],
            "lastTouched": session["lastActive"]}
    if session["this"]:
        return set_group(item, "active", ["this session"], [])
    where = "main checkout" if session["inRepo"] else session["cwd"]
    opener = action("open", f"open it:  `/session {session['id'][:8]}`", [])
    if session["state"] == "hung":
        why = [f"busy but silent for {session['silentMin']} min ({where})"]
        return set_group(item, "stalled", why, [opener, action("wtf", "`/wtf` digest of it", []), kill(session)])
    if session["question"] and session["questionMin"] >= UNANSWERED:
        why = [f"asked a question {session['questionMin']} min ago, unanswered ({where})"]
        return set_group(item, "stalled", why, [opener, action("answer", "show me the question here", [])])
    if session["state"] == "idle" and not session["used"] and hours_since(session["lastActive"]) >= 1:
        why = [f"`{session['name']}` never got a prompt, open {age(session['lastActive'])} ({where})"]
        return set_group(item, "dead", why, [kill(session)])
    if session["state"] == "idle" and hours_since(session["lastActive"]) >= STALE:
        why = [f"`{session['name']}` idle since {age(session['lastActive'])} ({where})"]
        return set_group(item, "dead", why, [kill(session), opener])
    why = [f"`{session['name']}` {session['state']}, last active {age(session['lastActive'])} ({where})"]
    return set_group(item, "active", why, [opener])


def stash_items():
    """`park:<name>` stashes:  `/park` stashes, then pops in the worktree, so one left behind means a move broke."""
    items = []
    for line in (park.git("stash", "list", "--format=%H %gd %gs") or "").splitlines():
        sha, ref, subject = line.split(" ", 2)
        tag = re.search(r"park:(\S+)", subject)
        if not tag:
            continue
        name = tag.group(1)
        item = {"key": f"stash:{sha[:8]}", "kind": "stash", "name": name, "stash": sha, "sessions": []}
        actions = [
            action("apply", f"apply it in worktree `{name}`", [f"git -C .claude/worktrees/{name} stash apply {sha}"]),
            action("drop", "drop it (look first)", [f"git stash show -p {sha}", f"git stash drop <ref of {sha}>"]),
        ]
        items.append(set_group(item, "stalled", [f"`/park` stash left behind ({ref}):  `{subject}`"], actions))
    return items


def window_items(worktrees):
    """Window files with no worktree:  `window.mjs close` deletes them;  a session that left without it, didn't."""
    items = []
    for file in sorted((MAIN / "workspaces" / "ongoing").glob("*.code-workspace")):
        name = file.stem
        if name in worktrees:
            continue
        item = {"key": f"window:{name}", "kind": "window", "name": name, "file": str(file), "sessions": []}
        actions = [action("close", "close its window and delete the file", [f"node scripts/window.mjs close {name}"])]
        items.append(set_group(item, "dead", ["window file for a worktree that's gone"], actions))
    return items


################
# ## Actions
################


def active_actions(item):
    """What to offer for work in process:  a digest, and merging when it looks finished."""
    name = item["name"]
    found = [action("wtf", f"`/wtf {name}`:  what it's doing", [])]
    if item.get("morning"):
        found.append(action("wakeup", f"go through the morning report:  `/wakeup` in `{name}`'s session", []))
    idle = not any(s["state"] in ("busy", "hung") for s in item["sessions"])
    if item.get("unique") and not item.get("dirty") and idle and (not item.get("plan") or item.get("planDone")):
        found.append(merge(item))
    return found


def stalled_actions(item):
    """What to offer for hung or parked work."""
    name, found = item["name"], []
    parked = item.get("parked")
    if parked and parked["state"].startswith("waiting:"):
        target = parked["state"].removeprefix("waiting:")
        if park.status(target, ids=[])["finished"]:
            found.append(action("nudge", f"tell it `{target}` is done:  `/unpark {name}`", []))
    if parked and parked["state"] != "resumed":
        found.append(action("unpark", f"pick it up:  `/unpark {name}` in a new session", []))
    elif item.get("morning"):
        found.append(action("wakeup", f"read the morning report:  `/wakeup` in `{name}`'s session", []))
    found += [action("open", f"open session `{s['name']}`:  `/session {s['id'][:8]}`", [])
              for s in item["sessions"]]
    found.append(action("wtf", f"`/wtf {name}`:  where it stopped", []))
    # a parked branch ends in a WIP commit:  never merge that
    if item.get("unique") and not item.get("dirty") and not parked and not item["sessions"]:
        found.append(merge(item))
    found += [kill(s) for s in item["sessions"] if s["state"] == "hung" and not s["this"]]
    # a running session owns its worktree:  it parks or leaves first
    if (item.get("worktree") or item.get("branch")) and not item["sessions"]:
        found.append(discard(item))
    return found


def dead_actions(item):
    """Clean-up for a worktree / branch with nothing left in it."""
    found = [kill(s) for s in item["sessions"] if s["state"] == "idle" and not s["this"]]
    commands = []
    if (MAIN / "workspaces" / "ongoing" / f"{item['name']}.code-workspace").exists():
        commands.append(f"node scripts/window.mjs close {item['name']}")
    if item.get("worktree"):
        commands.append(f"git worktree remove {rel(item['worktree'])}")
    if item.get("branch"):
        # `-d` refuses unmerged work;  squashed-in commits need `-D`, which `discard` asks about separately
        commands.append(f"git branch {'-D' if item['ahead'] else '-d'} {item['branch']}")
    what = "remove worktree and branch" if item.get("worktree") else "delete the branch"
    found.insert(0, action("remove", what, commands))
    return found


def merge(item):
    """Merge a finished branch into `main`, as `/isolate done` would."""
    return action("merge", f"merge `{item['branch']}` into `main` ({item['unique']} commits)",
                  [f"git merge --no-edit {item['branch']}"])


def discard(item):
    """Throw the work away:  ALWAYS asked about on its own, listing what goes."""
    commands = [f"node scripts/window.mjs close {item['name']}"] if item.get("worktree") else []
    if item.get("worktree"):
        commands.append(f"git worktree remove --force {rel(item['worktree'])}")
    if item.get("branch"):
        commands.append(f"git branch -D {item['branch']}")
    return action("discard", "throw the work away (asks again first)", commands)


def kill(session):
    """End a running session's process:  its panel / tab shows it ended, and `/session` reopens it."""
    return action("kill", f"end session `{session['name']}` (pid {session['pid']})", [f"kill {session['pid']}"])


def action(id, label, commands):
    return {"id": id, "label": label, "commands": commands}


def set_group(item, group, why, actions):
    item.update(group=group, why=why, actions=actions)
    return item


def describe_sessions(item):
    """One line on the sessions in `item`."""
    bits = [f"`{s['name']}`{' (this one)' if s['this'] else ''} {s['state']}"
            + (f", asked a question {s['questionMin']} min ago" if s["question"] else "") for s in item["sessions"]]
    return "session " + ", ".join(bits) if bits else "no session"


################
# ## Sessions
################


def live_sessions():
    """Every running session on the machine:  `{id, name, pid, cwd, inRepo, state, lastActive, silentMin,
    question, questionMin, this}`.  `state` is the registry's `busy` / `idle` / `waiting`, or `hung` for `busy`
    with no transcript write for `SILENT` minutes.  `this`:  the session running this script."""
    mine, found = park.ancestors(), []
    for file in sorted(CLAUDE.glob("sessions/*.json")):
        try:
            record = json.loads(file.read_text())
        except (OSError, ValueError):
            continue
        if not park.alive(record.get("pid", 0)):
            continue
        transcript = transcript_of(record["sessionId"])
        mtime = transcript.stat().st_mtime if transcript else record.get("updatedAt", 0) / 1000
        cwd = last_cwd(transcript) or record.get("cwd", "")
        silent = int((time.time() - mtime) / 60)
        state = record.get("status", "?")
        asked = pending_question(transcript)
        found.append({
            "id": record["sessionId"],
            "name": park.title(record["sessionId"]) or record.get("name") or record["sessionId"][:8],
            "pid": record["pid"],
            "cwd": cwd,
            "inRepo": in_folder(cwd, str(MAIN)),
            "where": {"claude-vscode": "VS Code", "claude-desktop": "Desktop", "cli": "terminal"}.get(
                record.get("entrypoint"), record.get("entrypoint")),
            "state": "hung" if state == "busy" and silent >= SILENT else state,
            "lastActive": iso(mtime),
            "silentMin": silent,
            "question": asked[0] if asked else None,
            "questionMin": asked[1] if asked else 0,
            "this": record["pid"] in mine,
            "used": bool(transcript),
        })
    return found


def transcript_of(session_id):
    found = list(CLAUDE.glob(f"projects/*/{session_id}.jsonl"))
    return max(found, key=lambda p: p.stat().st_mtime) if found else None


def last_cwd(transcript):
    """A session's LATEST `cwd`:  it may have moved into a worktree since it started."""
    if not transcript:
        return None
    found = re.findall(rb'"cwd":"([^"]*)"', tail(transcript))
    return found[-1].decode() if found else None


def pending_question(transcript):
    """`(question, minutes ago)` of an `AskUserQuestion` with no answer after it, else `None`."""
    if not transcript:
        return None
    pending = None
    for line in tail(transcript).splitlines():
        if b'"AskUserQuestion"' not in line and b'"tool_result"' not in line:
            continue
        try:
            entry = json.loads(line)
        except ValueError:
            continue
        if entry.get("isSidechain"):
            continue
        content = (entry.get("message") or {}).get("content")
        for block in content if isinstance(content, list) else []:
            if block.get("type") == "tool_result":
                pending = None
            elif block.get("type") == "tool_use" and block.get("name") == "AskUserQuestion":
                questions = block.get("input", {}).get("questions") or [{}]
                pending = (questions[0].get("question", "?"), minutes_since(entry.get("timestamp")))
    return pending


def tail(path, size=512_000):
    """Last `size` bytes of `path`:  transcripts run to tens of MB."""
    with open(path, "rb") as f:
        f.seek(max(0, path.stat().st_size - size))
        return f.read()


################
# ## Checkouts
################


def worktree_names():
    """`(name, path, branch)` of each worktree under `.claude/worktrees/`."""
    found, path = [], None
    for line in (park.git("worktree", "list", "--porcelain") or "").splitlines():
        if line.startswith("worktree "):
            path = line.removeprefix("worktree ")
        elif line.startswith("branch ") and path and path.startswith(f"{WORKTREES}/"):
            found.append((Path(path).name, path, line.removeprefix("branch refs/heads/")))
            path = None
    return found


def branches():
    return (park.git("for-each-ref", "--format=%(refname:short)", "refs/heads") or "").splitlines()


def note(worktree, kind, name):
    """`/park`'s `PARKED-<name>.md` (`{state, stopped}`) or `/bedtime`'s `MORNING-<name>.md` (`{file}`)."""
    if not worktree:
        return None
    file = Path(worktree) / f"{kind}-{name}.md"
    if not file.exists():
        return None
    if kind == "MORNING":
        return {"file": str(file)}
    found = next((p for p in park.parked() if p["file"] == str(file)), None)
    return {"state": found["state"], "stopped": found["stopped"], "file": str(file)} if found else None


def last_touched(worktree, branch, sessions):
    """Latest of:  last commit, newest uncommitted file, a session's last transcript write."""
    times = [iso_to_ts(park.git("log", "-1", "--format=%cI", branch))] if branch else []
    if worktree:
        for line in (run(["git", "-C", worktree, "status", "--short", "--untracked-files=all"]) or "").splitlines():
            file = Path(worktree) / line[3:].split(" -> ")[-1]
            if file.exists():
                times.append(file.stat().st_mtime)
    times += [iso_to_ts(s["lastActive"]) for s in sessions]
    times = [t for t in times if t]
    return iso(max(times)) if times else None


def count(range):
    return int(park.git("rev-list", "--count", range) or 0)


def in_folder(path, folder):
    return path == folder or path.startswith(f"{folder}/")


def rel(path):
    return str(Path(path).relative_to(MAIN))


def run(cmd):
    return park.run(cmd)


################
# ## Time
################


def now_iso():
    return iso(time.time())


def iso(ts):
    return datetime.fromtimestamp(ts, timezone.utc).astimezone().isoformat(timespec="minutes")


def iso_to_ts(text):
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00")).timestamp() if text else None
    except ValueError:
        return None


def hours_since(text):
    ts = iso_to_ts(text)
    return (time.time() - ts) / 3600 if ts else float("inf")


def minutes_since(text):
    ts = iso_to_ts(text)
    return int((time.time() - ts) / 60) if ts else 0


def age(text):
    """`3 min ago`, `5 h ago`, `2 days ago`."""
    hours = hours_since(text)
    if hours == float("inf"):
        return "never"
    if hours < 1:
        return f"{int(hours * 60)} min ago"
    return f"{int(hours)} h ago" if hours < 48 else f"{int(hours / 24)} days ago"


################
# ## Text report
################


TITLES = {"active": "In process", "stalled": "Hung or parked", "dead": "Dead, still hanging on"}


def print_report(report):
    items = {i["key"]: i for i in report["items"]}
    for group in ("active", "stalled", "dead"):
        keys = report["groups"][group]
        print(f"## {TITLES[group]} ({len(keys)})\n")
        for key in keys:
            item = items[key]
            print(f"- {key}  " + ";  ".join(item["why"]))
            for a in item["actions"]:
                print(f"    > {a['id']}:  {a['label']}")
        print()


if __name__ == "__main__":
    main()
