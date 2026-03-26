# Grimoire — Open-Source Publishing Checklist

Step-by-step guide to make this repo professional before publishing to npm.
Check off each item as you go.

---

## 1. Repository Files

### Must-have files

- [ ] **README.md** — project description, install command, quick usage example, API reference, badge row (CI, npm version, license, bundle size)
- [ ] **LICENSE** — already set to ISC; create the actual `LICENSE` file:
  ```sh
  npx license ISC -o "SAHRI Yahya Abdelkadouss" > LICENSE
  # or manually create it
  ```
- [ ] **CHANGELOG.md** — document every version; follow [Keep a Changelog](https://keepachangelog.com) format
- [ ] **CONTRIBUTING.md** — how to fork, branch, commit (gitmoji convention), open a PR, run tests
- [ ] **CODE_OF_CONDUCT.md** — use [Contributor Covenant](https://www.contributor-covenant.org/)
- [ ] **.npmignore** or `"files"` field in `package.json` — only ship `dist/`, `README.md`, `LICENSE`, `package.json`

### Nice-to-have

- [ ] **SECURITY.md** — how to report vulnerabilities privately
- [ ] **FUNDING.yml** (`.github/FUNDING.yml`) — link to sponsor page if applicable
- [ ] **Issue templates** (`.github/ISSUE_TEMPLATE/bug_report.md`, `feature_request.md`)
- [ ] **PR template** (`.github/pull_request_template.md`)

---

## 2. package.json Cleanup

Make sure these fields are correct before `npm publish`:

```jsonc
{
  "name": "grimoire-store",
  "version": "1.0.0",
  "main": "dist/index.js", // ← CJS entry (fix: currently "index.js")
  "module": "dist/index.mjs", // ← ESM entry
  "types": "dist/index.d.ts", // ← TypeScript types
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts",
    },
  },
  "files": ["dist", "LICENSE", "README.md"],
  "sideEffects": false,
}
```

---

## 3. Branch Strategy

### Branches to create

| Branch      | Purpose                                                    |
| ----------- | ---------------------------------------------------------- |
| `main`      | Stable, published code. Every merge = potential release    |
| `develop`   | Integration branch. All feature PRs target this            |
| `feature/*` | One branch per feature (e.g. `feature/middleware-support`) |
| `fix/*`     | One branch per bug fix (e.g. `fix/listener-leak`)          |
| `release/*` | Prep for a release: bump version, update changelog         |

### Setup

```sh
git branch -M main
git checkout -b develop
git push -u origin main develop
```

---

## 4. Branch Protection Rules (GitHub)

Go to **Settings → Branches → Add rule** for `main`:

- [x] **Require a pull request before merging**
  - Require at least 1 approval
  - Dismiss stale approvals on new pushes
- [x] **Require status checks to pass** (select the CI workflow)
- [x] **Require branches to be up to date before merging**
- [x] **Do not allow force pushes**
- [x] **Do not allow deletions**

Repeat for `develop` with the same status checks but allow direct pushes from maintainers (optional).

---

## 5. Git Tags & Versioning

Follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

```sh
# When ready to release:
npm version patch   # 1.0.0 → 1.0.1 (bug fix)
npm version minor   # 1.0.0 → 1.1.0 (new feature)
npm version major   # 1.0.0 → 2.0.0 (breaking change)

# This auto-creates a git tag (v1.0.1) and bumps package.json
git push origin main --follow-tags
```

---

## 6. GitHub Actions (CI/CD)

### 6.1 CI — runs on every PR and push

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: npm
      - run: npm ci --legacy-peer-deps
      - run: npm run lint
      - run: npm run format:check
      - run: npm run build
      - run: npm test
```

### 6.2 Publish — runs when you push a version tag

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  push:
    tags: ['v*']

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          registry-url: https://registry.npmjs.org
          cache: npm
      - run: npm ci --legacy-peer-deps
      - run: npm run build
      - run: npm test
      - run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 6.3 Set up the npm token

1. Go to [npmjs.com → Access Tokens](https://www.npmjs.com/settings/~/tokens)
2. Create a **Granular Access Token** (or Automation token) with publish permission
3. In GitHub: **Settings → Secrets → Actions → New secret**
   - Name: `NPM_TOKEN`
   - Value: paste the token

---

## 7. Release Workflow (Step by Step)

```sh
# 1. Work on develop
git checkout develop
git checkout -b feature/my-feature
# ... make changes, commit with gitmoji ...
git push -u origin feature/my-feature
# → Open PR to develop, wait for CI ✅, merge

# 2. Prepare release
git checkout develop && git pull
git checkout -b release/1.1.0
# Update CHANGELOG.md
npm version minor --no-git-tag-version
git add -A && git commit -m "🔖 release : v1.1.0"
# → Open PR to main, wait for CI ✅, merge

# 3. Tag and publish
git checkout main && git pull
git tag v1.1.0
git push origin v1.1.0
# → GitHub Action auto-publishes to npm

# 4. Sync develop
git checkout develop && git merge main && git push
```

---

## 8. Pre-publish Dry Run

Before your first real publish, test locally:

```sh
npm run build
npm pack --dry-run        # see exactly what files would be shipped
npm pack                  # creates grimoire-store-1.0.0.tgz
npm publish --dry-run     # simulates publish without uploading
```

---

## 9. Badges for README

```md
[![CI](https://github.com/SAHRIYahyaAbdelkadouss/grimoire/actions/workflows/ci.yml/badge.svg)](https://github.com/SAHRIYahyaAbdelkadouss/grimoire/actions)
[![npm](https://img.shields.io/npm/v/grimoire-store)](https://www.npmjs.com/package/grimoire-store)
[![License](https://img.shields.io/npm/l/grimoire-store)](./LICENSE)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/grimoire-store)](https://bundlephobia.com/package/grimoire-store)
```

---

## 10. Final Checklist Before `npm publish`

- [ ] `npm run lint` — passes
- [ ] `npm run format:check` — passes
- [ ] `npm test` — all green
- [ ] `npm run build` — builds CJS + ESM + DTS
- [ ] `npm pack --dry-run` — only ships dist/, README, LICENSE, package.json
- [ ] `package.json` has correct `main`, `module`, `types`, `exports`, `files`
- [ ] `README.md` exists with usage examples
- [ ] `LICENSE` file exists
- [ ] `CHANGELOG.md` documents v1.0.0
- [ ] CI workflow passes on GitHub
- [ ] Branch protections are enabled on `main`
- [ ] npm token is stored as GitHub secret
- [ ] `git tag v1.0.0 && git push origin v1.0.0` → triggers publish action
