# Git Flow Strategy

## Branches

| Branch      | Purpose                                              | Protected |
| ----------- | ---------------------------------------------------- | --------- |
| `main`      | Production — receives only from `release/*` branches | ✅        |
| `develop`   | Integration — all feature/fix work targets here      | ✅        |
| `feature/*` | New functionality                                    | —         |
| `fix/*`     | Bug fixes                                            | —         |
| `chore/*`   | Tooling / maintenance                                | —         |
| `docs/*`    | Documentation only                                   | —         |
| `release/*` | Version bump only (branched from `develop`)          | —         |

---

## Day-to-day development

```
develop ← feature/my-feature
develop ← fix/my-bugfix
develop ← chore/my-task
```

1. Branch from `develop`
2. Work, commit (hooks enforce message format)
3. Open a PR → `develop`
4. CI must pass, at least one approval
5. Merge (squash or merge commit)

---

## Release process (happy path)

```
develop → release/x.y.z (version bump only) → PR → main → tag → npm
                                                      │
                                          cherry-pick version bump
                                                      ↓
                                                   develop
```

### Step-by-step

```sh
# 1. Create release branch from develop
git switch develop && git pull
git checkout -b release/x.y.z

# 2. Bump version (this is the ONLY change on the release branch)
npm version x.y.z --no-git-tag-version
git add package.json package-lock.json
git commit -m "🔖 release : x.y.z"

# 3. Push & open PR to main
git push -u origin release/x.y.z
# → Create PR on GitHub: base main ← head release/x.y.z

# 4. Merge the PR on GitHub (rebase merge recommended)

# 5. Tag & push (triggers npm publish)
git switch main && git pull
git tag vx.y.z
git push origin vx.y.z

# 6. Cherry-pick version bump to develop (auto via pre-push hook)
#    The hook detects the tag push and runs:
#      git switch develop
#      git cherry-pick <version-bump-commit>
#      git push origin develop
```

---

## Hotfix during release

If a bug is found **after** the release branch is created but **before** merging to main:

```
release/x.y.z ← fix commit(s)
              ← new version bump (x.y.z+1)
              → PR → main → tag → npm
                       │
           cherry-pick all commits
                       ↓
                    develop
```

### Step-by-step

```sh
# 1. Fix the bug on the release branch
git switch release/x.y.z
# ... make the fix ...
git commit -m "🐛 fix : description"

# 2. Bump to a new patch version
npm version x.y.z+1 --no-git-tag-version
git add package.json package-lock.json
git commit -m "🔖 release : x.y.z+1"

# 3. Push, merge PR, tag as usual
git push origin release/x.y.z
# Merge PR on GitHub, then:
git switch main && git pull
git tag vx.y.z+1
git push origin vx.y.z+1

# 4. Cherry-pick ALL release commits to develop
git switch develop && git pull
git cherry-pick <fix-commit-hash>
git cherry-pick <version-bump-hash>
git push origin develop
```

---

## Keeping develop in sync (cherry-pick, not merge)

After every release, only the version bump (and any hotfix commits) need
to reach `develop`. We use **cherry-pick** instead of merge to avoid
merge commits and divergence.

**Automated:** the `pre-push` hook detects `v*` tag pushes and
cherry-picks the latest commit on `main` (the version bump) into
`develop` automatically.

**Manual fallback** (if the hook fails or there are multiple commits):

```sh
# Find commits to cherry-pick
git log main --oneline -3

# Apply them to develop
git switch develop && git pull
git cherry-pick <hash1> <hash2>
git push origin develop
```

---

## Hooks (enforced locally)

| Hook         | What it does                                                                  |
| ------------ | ----------------------------------------------------------------------------- |
| `commit-msg` | Validates format: `<emoji> <type> : <description>` — skips merge/fixup/squash |
| `pre-commit` | Runs `lint-staged` (ESLint + Prettier) + format check                         |
| `pre-push`   | Full CI (lint → format → build → test) + auto cherry-pick on tag push         |

---

## CI / CD

| Workflow      | Trigger                        | What it does                                   |
| ------------- | ------------------------------ | ---------------------------------------------- |
| `ci.yml`      | Push/PR to `main` or `develop` | Lint, format check, build, test (Node 20 + 22) |
| `publish.yml` | Tag `v*`                       | Publish to npm with provenance                 |

---

## Visual summary

```
feature/xyz ──→ develop ──→ release/1.3.0 ──→ main ──→ tag v1.3.0
fix/abc     ──↗               (bump only)       │        │
                                                 │    npm publish
                                                 │
                                          cherry-pick version bump
                                                 ↓
                                              develop
```

**Hotfix scenario:**

```
                              release/1.3.0
                                  │
                              🐛 fix commit
                              🔖 bump to 1.3.1
                                  │
                                  ↓ PR
                                main ──→ tag v1.3.1
                                  │
                    cherry-pick fix + bump
                                  ↓
                               develop
```

---

## Rules

1. **`main` only receives from `release/*` branches** — never direct commits
2. **`develop` is the integration branch** — all feature/fix work targets here
3. **Release branches contain only the version bump** (and hotfixes if needed)
4. **Cherry-pick to sync `develop`** — never merge `main` into `develop`
5. **Tags trigger publishing** — don't tag until the PR is merged
6. **All hooks must pass** — don't use `--no-verify` unless it's a merge commit
