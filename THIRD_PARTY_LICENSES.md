# Third-Party Licenses

This document lists the direct third-party runtime and peer dependencies declared by the published VGraph packages. Development, build, test, and documentation tooling dependencies are tracked by `pnpm-lock.yaml` and should be covered by a generated SBOM for formal supply-chain reviews.

Last reviewed: 2026-06-25

## Published Packages

- `@visactor/vgraph`
- `@visactor/react-vgraph`
- `@visactor/react-vgraph-ui`

## Direct Runtime Dependencies

| Package | Declared Version | License | Source |
| --- | --- | --- | --- |
| `eventemitter3` | `^4.0.7` | MIT | https://github.com/primus/eventemitter3 |
| `d3-timer` | `^3.0.1` | ISC | https://github.com/d3/d3-timer |
| `d3-ease` | `^3.0.1` | BSD-3-Clause | https://github.com/d3/d3-ease |
| `d3-interpolate` | `^3.0.1` | ISC | https://github.com/d3/d3-interpolate |
| `d3-quadtree` | `^3.0.1` | ISC | https://github.com/d3/d3-quadtree |

## Direct Peer Dependencies

| Package | Declared Version | License | Source |
| --- | --- | --- | --- |
| `@arco-design/web-react` | `^2.39.3` | MIT | https://github.com/arco-design |
| `react` | `>=16` | MIT | https://github.com/facebook/react |
| `react-dom` | `>=16` | MIT | https://github.com/facebook/react |

## Notes

- `@visactor/vgraph` is an internal workspace dependency of the React packages and is covered by this repository's MIT license.
- Peer dependencies are supplied by consumers at install time, but they are listed here because the published packages declare compatibility with them.
- For a complete transitive dependency inventory, generate a CycloneDX or SPDX SBOM from `pnpm-lock.yaml` during release review.
