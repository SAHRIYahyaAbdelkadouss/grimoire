# Contributing to grimoire-store

Thank you for taking the time to contribute!

---

## Getting started

```sh
git clone https://github.com/SAHRIYahyaAbdelkadouss/grimoire.git
cd grimoire
npm install
```

---

## Branch naming

All branches must follow one of these patterns (enforced by the `pre-push` hook):

| Prefix     | When to use           | Example                      |
| ---------- | --------------------- | ---------------------------- |
| `feature/` | New functionality     | `feature/middleware-support` |
| `fix/`     | Bug fixes             | `fix/listener-leak`          |
| `chore/`   | Tooling / maintenance | `chore/update-deps`          |
| `docs/`    | Documentation only    | `docs/api-reference`         |
| `release/` | Version preparation   | `release/1.2.0`              |

Feature and fix branches should target `develop`, not `main`.

---

## Commit message format

Every commit must follow this convention (enforced by the `commit-msg` hook):

```
<gitmoji> <type> : <short description>
```

Examples:

```
✨ feat : add middleware support
🐛 fix : resolve listener memory leak
♻️ refactor : simplify hasChanged logic
📝 docs : update API reference
🔧 chore : update devDependencies
✅ test : add edge-case coverage for NaN
🔖 release : 1.2.0
```

- Use a single emoji followed by a space
- `type` is a lowercase word
- `:` (space-colon-space) separates type from description
- Merge commits, fixup commits, and squash commits are automatically skipped

---

## Running tests

```sh
npm test          # run tests + coverage report
npm run lint      # ESLint
npm run format    # Prettier (write)
npm run build     # tsup: CJS + ESM + .d.ts
```

Coverage thresholds are set to 100% for lines, functions, branches, and statements.
All new code must be tested.

---

## Opening a pull request

1. Fork the repo and create a branch from `develop` using the naming convention above
2. Ensure `npm test`, `npm run lint`, and `npm run build` all pass
3. Open a PR targeting `develop` with a clear description of what and why
4. At least one approval is required; the CI check must be green

---

## Releasing (maintainers only)

```sh
# 1. Branch from develop
git switch develop && git pull
git checkout -b release/x.y.z

# 2. Bump version (only change on the release branch)
npm version x.y.z --no-git-tag-version
git add package.json package-lock.json
git commit -m "🔖 release : x.y.z"

# 3. Push & open PR → main
git push -u origin release/x.y.z

# 4. After PR is merged: tag & push
git switch main && git pull
git tag vx.y.z
git push origin vx.y.z
```

The `publish.yml` workflow triggers on any `v*` tag and publishes to npm with SLSA provenance.
The `pre-push` hook auto cherry-picks the version bump to `develop`.

See [GIT_FLOW.md](GIT_FLOW.md) for the full strategy.
