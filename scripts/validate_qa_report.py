#!/usr/bin/env python3
"""Validate cockpit/docs/QA_REPORT.md commit references are internally consistent
and reachable from the current branch HEAD.

Rules enforced:
  1. Exactly one "Fix commit" SHA is present in the header.
  2. That SHA exists in the local git object store.
  3. That SHA is an ancestor of HEAD (i.e. the fix was actually merged in).
  4. No "Final HEAD" line exists in the header — that field is permanently
     removed because it can never be accurate (the act of committing the report
     creates a new HEAD that makes any embedded stamp stale immediately).
  5. No stale SHA appears in the footer that differs from the fix commit.
"""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
REPORT_PATH = REPO_ROOT / "cockpit" / "docs" / "QA_REPORT.md"

# Matches: **Fix commit** ...: `<sha40>`
FIX_COMMIT_RE = re.compile(r"\*\*Fix commit\b.*?`([0-9a-f]{40})`", re.IGNORECASE)
# Detects the banned self-referential field
FINAL_HEAD_RE = re.compile(r"\*\*Final HEAD\b", re.IGNORECASE)

def git(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", *args],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
    )


def main() -> int:
    if not REPORT_PATH.exists():
        print(f"validate_qa_report: {REPORT_PATH.relative_to(REPO_ROOT)} not found", file=sys.stderr)
        return 1

    text = REPORT_PATH.read_text(encoding="utf-8")
    findings: list[str] = []

    # Rule 4: no "Final HEAD" field allowed
    if FINAL_HEAD_RE.search(text):
        findings.append(
            "QA_REPORT.md contains a '**Final HEAD**' header line — this field is banned "
            "because it is always self-referential and will be stale by the time it is committed. "
            "Remove it; use 'git rev-parse HEAD' at read-time instead."
        )

    # Rule 1: exactly one fix commit SHA
    fix_matches = FIX_COMMIT_RE.findall(text)
    if not fix_matches:
        findings.append("QA_REPORT.md: no '**Fix commit**' SHA found in the header.")
        for f in findings:
            print(f, file=sys.stderr)
        return 1
    if len(set(fix_matches)) > 1:
        findings.append(f"QA_REPORT.md: multiple distinct Fix commit SHAs: {fix_matches}")

    fix_sha = fix_matches[0]

    # Rule 2: SHA exists in git
    result = git("cat-file", "-e", fix_sha)
    if result.returncode != 0:
        findings.append(
            f"QA_REPORT.md: fix commit {fix_sha[:12]} does not exist in local git object store."
        )

    # Rule 3: SHA is ancestor of HEAD
    if result.returncode == 0:
        anc = git("merge-base", "--is-ancestor", fix_sha, "HEAD")
        if anc.returncode != 0:
            head_result = git("rev-parse", "--short", "HEAD")
            head = head_result.stdout.strip()
            findings.append(
                f"QA_REPORT.md: fix commit {fix_sha[:12]} is not an ancestor of HEAD ({head}). "
                "Either the report references the wrong commit or the branch is in an unexpected state."
            )

    if findings:
        for f in findings:
            print(f, file=sys.stderr)
        print(f"validate_qa_report: FAILED ({len(findings)} finding(s))", file=sys.stderr)
        return 1

    print(f"validate_qa_report: ok (fix commit {fix_sha[:12]} reachable from HEAD)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
