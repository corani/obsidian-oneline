#!/usr/bin/env bash
# Usage: ./release.sh <version>
# Example: ./release.sh 0.2.0
# Example: ./release.sh 0.2.0-beta.1
set -euo pipefail

VERSION="${1:-}"
if [[ -z "$VERSION" ]]; then
  echo "Usage: $0 <version>" >&2
  exit 1
fi

# Validate semver-ish format
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9._-]+)?$ ]]; then
  echo "Error: version must be in the form X.Y.Z or X.Y.Z-suffix" >&2
  exit 1
fi

BRANCH="release/$VERSION"
DEFAULT_BRANCH="$(git remote show origin | awk '/HEAD branch/ {print $NF}')"

# Ensure working tree is clean
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Error: working tree has uncommitted changes" >&2
  exit 1
fi

# Fetch latest
git fetch origin

# Create a release branch from the default branch
git checkout -b "$BRANCH" "origin/$DEFAULT_BRANCH"

# Bump version in manifest.json and package.json
jq --arg v "$VERSION" '.version = $v' manifest.json > manifest.tmp.json && mv manifest.tmp.json manifest.json
jq --arg v "$VERSION" '.version = $v' package.json  > package.tmp.json  && mv package.tmp.json  package.json

git add manifest.json package.json
git commit -m "chore: release $VERSION"

# Push the release branch and tag
git push origin "$BRANCH"
git tag "$VERSION"
git push origin "$VERSION"

echo "Tag $VERSION pushed -- GitHub Actions will build and publish the release."
echo ""

# Open a PR to merge the version bump back to the default branch
gh pr create \
  --base "$DEFAULT_BRANCH" \
  --head "$BRANCH" \
  --title "chore: release $VERSION" \
  --body "Version bump for release \`$VERSION\`. Merge after the GitHub release is published."

echo ""
echo "Done. Monitor the release at: $(gh repo view --json url -q .url)/releases"
