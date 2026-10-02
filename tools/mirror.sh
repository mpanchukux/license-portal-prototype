#!/bin/bash
# mirror.sh <git-ref> <name> [scratchpad] — export a COMMIT into <scratchpad>/www/<name>/.
#
# ⚠️ WHY THIS EXISTS. "What got taller" and "what wraps now" are DIFFERENCES, so they need
# two builds served side by side, not one build measured twice. Without it a run can only
# report absolute numbers for "after", which prove nothing on their own.
#
# ⚠️ IT LIVED IN THE SCRATCHPAD AND WAS LOST (2026-10-02). The scratchpad is cleared between
# sessions; the next run rediscovered the same three harness bugs from scratch. That is the
# whole reason it is in `tools/` now.
#
# The scratchpad path defaults to $CLAUDE_SCRATCHPAD, else the first argument after <name>.
set -e
REF="$1"; NAME="$2"; SP="${3:-$CLAUDE_SCRATCHPAD}"
if [ -z "$REF" ] || [ -z "$NAME" ] || [ -z "$SP" ]; then
  echo "usage: tools/mirror.sh <git-ref> <name> [scratchpad-dir]" >&2; exit 1
fi
SRC="$(cd "$(dirname "$0")/.." && pwd)"
DST="$SP/www/$NAME"
rm -rf "$DST"; mkdir -p "$DST"
git -C "$SRC" archive "$REF" | tar -x -C "$DST"
# ⚠️ The embedded browser ignores `Cache-Control: no-store` on scripts and styles, so every
# local .js/.css link is stamped. Without it the second mirror serves the first one's code.
V=$(date +%s)
for f in "$DST"/*.html; do
  perl -0pi -e "s/((?:src|href)=\")([A-Za-z0-9_.\/-]+\.(?:js|css))(?:\?v=\d+)?(\")/\$1\$2?v=$V\$3/g" "$f"
done
echo "mirrored $(git -C "$SRC" rev-parse --short "$REF") -> $DST (v=$V)"
