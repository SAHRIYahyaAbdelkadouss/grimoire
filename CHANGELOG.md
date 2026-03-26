# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] — 2026-03-26

### Added

- `createGrimoire<T>` — zero-dependency in-memory store with shallow-equality guard
- `hasChanged` — utility using `Object.is` to diff patched keys (handles NaN / ±0 edge cases)
- `StoreApi<T>` interface — `getState`, `setState`, `subscribe` contract
- `StateUpdater<T>` type — accepts a partial object or an updater function
- Dual CJS (`dist/index.js`) and ESM (`dist/index.mjs`) build via tsup
- Full TypeScript declarations exported (`dist/index.d.ts`, `dist/index.d.mts`)
- SLSA v1 provenance attestation on every npm publish
- GitHub Actions CI (Node 20 + 22 matrix) and automated publish-on-tag workflow
- Husky hooks: `pre-commit` (lint-staged), `pre-push` (branch validation), `commit-msg` (gitmoji format)
