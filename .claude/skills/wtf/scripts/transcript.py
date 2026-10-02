#!/usr/bin/env python3
"""Digest of ANOTHER session's transcript, for `/wtf <name>`.

Usage:
  transcript.py <session id or its first 8 chars>
  transcript.py --find <name>

`--find`:  the sessions named `<name>` (`/rename`) or that worked in worktree `<name>`, newest first:  id, name,
last active, latest cwd.  Running or not.

Otherwise prints, oldest first:
- every prompt Owen typed (slash commands as `/name args`;  tool results, hook output and reminders dropped)
- the session's last reply text
- an AskUserQuestion still waiting for an answer, with its options
Long texts are cut to keep the digest small;  read the .jsonl itself for more.
"""

import glob
import json
import os
import re
import sys

PROMPT_LIMIT = 800
REPLY_LIMIT = 3000


def main():
    if len(sys.argv) == 3 and sys.argv[1] == "--find":
        return find(sys.argv[2])
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    paths = glob.glob(os.path.expanduser(f"~/.claude/projects/*/{sys.argv[1]}*.jsonl"))
    if not paths:
        sys.exit(f"no transcript for {sys.argv[1]}")
    path = max(paths, key=os.path.getmtime)
    print(f"transcript:  {path}\n")

    prompts, last_reply, pending = [], None, None
    for line in open(path):
        try:
            entry = json.loads(line)
        except ValueError:
            continue
        if entry.get("isSidechain"):
            continue
        message = entry.get("message")
        if not isinstance(message, dict):
            continue
        content = message.get("content")
        blocks = [{"type": "text", "text": content}] if isinstance(content, str) else content or []
        if entry.get("type") == "user":
            for block in blocks:
                if block.get("type") == "tool_result":
                    # any answer clears a waiting question
                    pending = None
                elif block.get("type") == "text":
                    text = prompt_text(block["text"])
                    if text:
                        prompts.append((entry.get("timestamp", "")[:16], text))
        elif entry.get("type") == "assistant":
            for block in blocks:
                if block.get("type") == "text" and block["text"].strip():
                    last_reply = block["text"].strip()
                elif block.get("type") == "tool_use" and block.get("name") == "AskUserQuestion":
                    pending = block["input"].get("questions", [])

    print("## Owen's prompts\n")
    for when, text in prompts:
        print(f"- {when}  {cut(text, PROMPT_LIMIT)}")
    print("\n## Last reply\n")
    print(cut(last_reply or "(none)", REPLY_LIMIT))
    if pending:
        print("\n## Waiting for an answer\n")
        for question in pending:
            print(f"- {question.get('question')}")
            for option in question.get("options", []):
                print(f"  - {option.get('label')}:  {option.get('description', '')}")


def find(name):
    """Print the sessions named `name` or that worked in worktree `name`, newest first."""
    worktree = f"/.claude/worktrees/{name}"
    found = []
    for path in glob.glob(os.path.expanduser("~/.claude/projects/*/*.jsonl")):
        title, cwd, last, in_worktree = None, None, "", False
        for line in open(path):
            # cheap pre-checks:  most lines are neither
            if '"custom-title"' not in line and '"cwd"' not in line:
                continue
            try:
                entry = json.loads(line)
            except ValueError:
                continue
            if entry.get("type") == "custom-title":
                title = entry.get("customTitle")
            if entry.get("cwd"):
                cwd = entry["cwd"]
                last = entry.get("timestamp", last)
                in_worktree = in_worktree or cwd.endswith(worktree) or f"{worktree}/" in cwd
        if title == name or in_worktree:
            found.append((last, os.path.basename(path)[:8], title or "-", cwd))
    for last, id, title, cwd in sorted(found, reverse=True):
        print(f"{id}  {title:<24}  {last[:16]}  {cwd}")
    if not found:
        print(f"no session named or in worktree {name}")


def prompt_text(text):
    """A typed prompt, or `None` for harness noise (reminders, caveats, command output)."""
    command = re.search(r"<command-name>(.*?)</command-name>", text)
    if command:
        args = re.search(r"<command-args>(.*?)</command-args>", text, re.S)
        return f"{command.group(1)} {args.group(1).strip() if args else ''}".strip()
    text = re.sub(r"<(system-reminder|ide_selection|ide_opened_file)>.*?</\1>", "", text, flags=re.S).strip()
    # a skill's own instructions arrive as a user message
    if not text or text.startswith("<") or text.startswith("Base directory for this skill:"):
        return None
    return text


def cut(text, limit):
    """`text` to `limit` chars, marked when cut."""
    return text if len(text) <= limit else text[:limit] + " [...]"


main()
