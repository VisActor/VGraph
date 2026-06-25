# Release Guide

This document describes the public release process for VGraph packages.

## Published Packages

The Rush projects marked with `shouldPublish: true` in `rush.json` are published to npm:

- `@visactor/vgraph`
- `@visactor/react-vgraph`
- `@visactor/react-vgraph-ui`

All three packages use the `vgraphMain` lockstep version policy from
`common/config/rush/version-policies.json`.

## Required Access

Release maintainers need:

- Write access to this GitHub repository.
- Publish access for the `@visactor` npm scope.
- The GitHub Actions secret `NPM_TOKEN`, containing an npm automation token.

The release workflow reads npm credentials from `NPM_TOKEN` / `NODE_AUTH_TOKEN` and
uses `common/config/rush/.npmrc-publish` for Rush publish configuration. Do not
commit npm tokens or personal `.npmrc` files.

## Local Preflight

Before creating a release branch, verify the repository locally:

```bash
rush install
rush build --only tag:package
rush test --only tag:package
```

For a full documentation smoke check, run:

```bash
rush docs
```

The generated package entry points should be available under each package's
`cjs` and `es` directories after `rush build --only tag:package`.

## Release Branches

The release workflow is triggered by pushing one of these branch name patterns:

- Stable release: `release/x.y.z`
- Hotfix release: `hotfix/x.y.z`
- Pre-release: `pre-release/x.y.z-alpha.n`
- Pre-release: `pre-release/x.y.z-beta.n`
- Pre-release: `pre-release/x.y.z-rc.n`
- Pre-release hotfix: `pre-release/x.y.z-hotfix.n`

Examples:

```bash
git checkout main
git pull origin main
git checkout -b release/0.1.0
git push origin release/0.1.0
```

```bash
git checkout main
git pull origin main
git checkout -b pre-release/0.1.0-alpha.0
git push origin pre-release/0.1.0-alpha.0
```

## Automated Release Flow

`.github/workflows/release.yml` performs the release after a matching branch is pushed:

1. Installs Node.js 20, pnpm 10.7.0, Rush, and native dependencies required by tests.
2. Updates package versions with `common/scripts/apply-release-version.js`.
3. Builds all publishable packages and their dependencies.
4. Checks npm to skip already published versions.
5. Publishes all publishable Rush projects with `rush publish --publish --include-all`.
6. Updates the Rush shrinkwrap.
7. Commits generated version and lockfile changes back to the release branch.
8. Creates a pull request back to `main` for stable release branches.

Published npm dist-tags:

- `release/*` publishes with `latest`.
- `hotfix/*` publishes with `hotfix`.
- `pre-release/*` publishes with the parsed pre-release type, such as `alpha`, `beta`, or `rc`.

## Manual Publish Fallback

Use this only if GitHub Actions cannot be used and the release owner has verified
the package versions and npm token locally.

```bash
export NPM_AUTH_TOKEN=<npm automation token>
export NODE_AUTH_TOKEN="$NPM_AUTH_TOKEN"

rush install
rush build --only tag:package
rush test --only tag:package
node common/scripts/install-run-rush.js publish --publish --include-all --tag <latest|alpha|beta|rc|hotfix>
```

After a manual publish, run:

```bash
npm view @visactor/vgraph version --registry=https://registry.npmjs.org
npm view @visactor/react-vgraph version --registry=https://registry.npmjs.org
npm view @visactor/react-vgraph-ui version --registry=https://registry.npmjs.org
```

Then commit any generated version or shrinkwrap changes and open a pull request
back to `main`.

## Failure Recovery

- If npm reports that all publishable packages for a version already exist, the
  workflow skips publishing.
- If only some packages were published, rerun the release workflow for the same
  branch. Rush will skip existing versions and continue publishing missing packages.
- If package tests fail because `cjs` or `es` output is missing, run
  `rush build --only tag:package` before rerunning tests.
- If Git hooks are missing after history rewrite or a fresh clone, run
  `rush install`.

