"""Link source references in `.html` docs:  one named target per destination, new tab.  See `packages/docs/AGENTS.md`.

Usage (from `packages/docs`):
        python3 scripts/doc-links.py <folder>/<doc>.html ...         -- add links (idempotent)
        python3 scripts/doc-links.py --check <folder>/<doc>.html ... -- verify, exit 1 on problems


- `<code>path</code>` outside `<pre>` / `<a>` / `<head>` becomes a link when the path resolves to a real file or folder
- existing `<a href>` without a target gets one (external:  per URL;  sibling docs:  per file)
- `--check` verifies:  every local href resolves INSIDE the repo, every non-anchor link has a target, one target per
  destination (`target="_self"`, a same-tab link, is exempt from the last)
  - a missing target git IGNORES is fine:  runtime files (`.spell-server.json`) and local clones
    (`packages/ui/reference/`) exist only on some machines, or while a server runs
"""

import os
import re
import subprocess
import sys
import html

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # packages/docs
PACKAGES = os.path.dirname(REPO)
MONOREPO = os.path.dirname(PACKAGES)
UI = f"{PACKAGES}/ui"
DOC_DIR = REPO
NODE_MODULES_DIRS = [f"{UI}/node_modules", f"{MONOREPO}/node_modules"]
# bare file names (`withSolid.ts`) are looked up under these
INDEX_ROOTS = sorted(f"{PACKAGES}/{p}/src" for p in os.listdir(PACKAGES) if os.path.isdir(f"{PACKAGES}/{p}/src")) + [DOC_DIR, f"{UI}/docs"]
SKIP_DIRS = {"icons", "glyphs", "node_modules", ".git", "dist", "dist-element", "dist-runner", "build", ".cache", "graphify-out", "worktrees"}


def slug(text):
    return re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()


PLAN_DOC = re.compile(r"(?:^|/)packages/docs/epics/([^/]+)/\1\.html$")


def target_for(abs_or_url):
    if re.match(r"https?://", abs_or_url):
        return "ext-" + slug(re.sub(r"^https?://(www\.)?", "", abs_or_url))[:80]
    rel = os.path.relpath(abs_or_url, MONOREPO)
    # a plan doc's tab is its <name>:  the page sets `window.name` to it, and `yarn plan-doc open <name>` reuses it
    plan = PLAN_DOC.search(rel)
    if plan:
        return plan.group(1)
    return "src-" + slug(rel)[:80]


_file_index = None


def file_index():
    """Basename -> [paths], for bare file names like `withSolid.ts`."""
    global _file_index
    if _file_index is None:
        _file_index = {}
        for root in INDEX_ROOTS:
            for dirpath, dirnames, filenames in os.walk(root):
                dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".")]
                for name in filenames:
                    _file_index.setdefault(name, []).append(os.path.join(dirpath, name))
    return _file_index


SPECIAL = {
    "solidjs/solid": "https://github.com/solidjs/solid/tree/next",
    "solidjs/solid-docs": "https://github.com/solidjs/solid-docs/tree/v2-rebuild",
    "documentation/solid-2.0/": "https://github.com/solidjs/solid/tree/next/documentation/solid-2.0",
    "@spell-app/ui": f"{UI}/README.md",
    "@spell-app/solid-element": f"{UI}/../solid-element/README.md",
}


DOC_FOLDER = DOC_DIR


def resolve(text):
    """A code span's text -> an existing absolute path or https URL, else None."""
    text = html.unescape(text).strip()
    if text in SPECIAL:
        return SPECIAL[text]
    if re.match(r"^(solid-js|@solidjs/[\w-]+)/.+\.\w+$", text):
        for folder in NODE_MODULES_DIRS:
            if os.path.exists(f"{folder}/{text}"):
                return f"{folder}/{text}"
    if re.match(r"^(v2\.)?solidjs\.com/|^v2\.solidjs\.com", text):
        return "https://" + text
    path = re.sub(r":\d+$", "", text)  # file.ts:75
    # `/`, `./`, `..`:  operators and punctuation, not paths (`/` resolved to the filesystem root)
    if not re.search(r"[A-Za-z0-9]", path):
        return None
    if not re.fullmatch(r"[#~.@\w/-]+(\.\w+)?/?", path) or "/" not in path and "." not in path:
        return None
    alias = re.match(r"^#([\w-]+)/(.+)$", path)  # `$/util/spell/foo.ts` -> packages/util/src/spell/foo.ts
    if alias:
        path = f"{PACKAGES}/{alias.group(1)}/src/{alias.group(2)}"
    candidates = []
    candidates += [os.path.join(DOC_FOLDER, path), os.path.join(DOC_FOLDER, "experiments", path)]
    if path.startswith("node_modules/"):
        candidates += [os.path.join(MONOREPO, path), os.path.join(UI, path)]
        candidates += [os.path.join(os.path.dirname(folder), path) for folder in NODE_MODULES_DIRS]
    else:
        candidates += [os.path.join(b, path) for b in (MONOREPO, PACKAGES, DOC_DIR, UI)]
    for candidate in candidates:
        if os.path.exists(os.path.normpath(candidate)):
            return os.path.normpath(candidate)
    if "/" not in path.rstrip("/"):
        hits = [p for p in file_index().get(path, []) if "/test/" not in p]
        if len(hits) == 1:
            return hits[0]
    return None


def protected_spans(s):
    """Ranges we must not touch:  head, pre, script, style, existing links."""
    spans = []
    for pattern in (r"<head>.*?</head>", r"<pre\b.*?</pre\s*>", r"<script\b.*?</script\s*>", r"<style\b.*?</style\s*>", r"<a\b.*?</a\s*>"):
        spans += [m.span() for m in re.finditer(pattern, s, re.S)]
    return spans


def inside(pos, spans):
    return any(a <= pos < b for a, b in spans)


def linkify(path):
    global DOC_FOLDER
    s = open(path).read()
    doc_dir = os.path.dirname(os.path.abspath(path))
    DOC_FOLDER = doc_dir
    spans = protected_spans(s)
    out, last, linked, unresolved = [], 0, 0, set()
    for m in re.finditer(r"<code>([^<]+)</code\s*>", s):
        if inside(m.start(), spans):
            continue
        dest = resolve(m.group(1))
        # a path outside the repo (a handoff in a sibling folder) works only on this machine:  leave it as text
        if dest and not dest.startswith("https://") and os.path.relpath(dest, MONOREPO).startswith(".."):
            dest = None
        if not dest:
            if "/" in m.group(1) or re.search(r"\.(ts|tsx|md|mjs|js|html|json)(:\d+)?$", m.group(1)):
                unresolved.add(m.group(1))
            continue
        href = dest if dest.startswith("https://") else os.path.relpath(dest, doc_dir)
        if os.path.isdir(dest) and not href.endswith("/"):
            href += "/"
        out.append(s[last : m.start()])
        out.append(f'<a href="{html.escape(href)}" target="{target_for(dest)}">{m.group(0)}</a>')
        last = m.end()
        linked += 1
    out.append(s[last:])
    s = "".join(out)

    def add_target(m):
        tag, href = m.group(0), m.group(1)
        if href.startswith("#"):
            return tag
        dest = href if re.match(r"https?://", href) else os.path.normpath(os.path.join(doc_dir, href.split("#")[0]))
        if "target=" in tag:
            # a plan doc's tab is renamed to its <name> even where a link already has a (pre-2026-10-01) target
            if not PLAN_DOC.search(os.path.relpath(dest, MONOREPO)):
                return tag
            return re.sub(r'target="[^"]*"', f'target="{target_for(dest)}"', tag)
        return tag[:-1] + f' target="{target_for(dest)}">'

    s = re.sub(r'<a\s+href="([^"]+)"[^>]*>', add_target, s)
    open(path, "w").write(s)
    print(f"{os.path.basename(path)}:  linked {linked} code spans;  unresolved path-like:  {sorted(unresolved)}")


def git_ignored(dest):
    """Whether git ignores `dest`:  a local-only or runtime file, fine to be missing here."""
    run = subprocess.run(["git", "-C", MONOREPO, "check-ignore", "-q", dest], capture_output=True)
    return run.returncode == 0


def check(path):
    s = open(path).read()
    doc_dir = os.path.dirname(os.path.abspath(path))
    by_dest, by_target = {}, {}
    body = re.sub(r"<pre\b.*?</pre\s*>", "", s, flags=re.S)
    nested = len(re.findall(r"<a\b[^>]*>\s*<a\b", body))
    problems = [f"{nested} nested links"] if nested else []
    for m in re.finditer(r"<a\b([^>]*)>", body):
        attrs = m.group(1)
        href = re.search(r'href="([^"]+)"', attrs)
        target = re.search(r'target="([^"]+)"', attrs)
        if not href or href.group(1).startswith("#"):
            continue
        href = html.unescape(href.group(1))
        dest = href if re.match(r"https?://", href) else os.path.normpath(os.path.join(doc_dir, href.split("#")[0]))
        if not dest.startswith("http") and not os.path.exists(dest):
            if not git_ignored(dest):
                problems.append(f"missing:  {href}")
        elif not dest.startswith("http") and os.path.commonpath([dest, MONOREPO]) != MONOREPO:
            problems.append(f"outside repo:  {href}")
        if not target:
            problems.append(f"no target:  {href}")
            continue
        # `_self`:  a page that reads like a site (the master plan) navigates in place, on purpose
        if target.group(1) == "_self":
            continue
        by_dest.setdefault(dest, set()).add(target.group(1))
        by_target.setdefault(target.group(1), set()).add(dest)
    problems += [f"several targets for {d}:  {t}" for d, t in by_dest.items() if len(t) > 1]
    problems += [f"target {t} shared by {d}" for t, d in by_target.items() if len(d) > 1]
    print(f"{os.path.basename(path)}:  {sum(1 for _ in by_dest)} destinations, {len(problems)} problems")
    for problem in problems:
        print("   ", problem)
    return not problems


if __name__ == "__main__":
    files = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not files:
        sys.exit(__doc__)
    if "--check" in sys.argv:
        sys.exit(0 if all([check(f) for f in files]) else 1)
    for f in files:
        linkify(f)
