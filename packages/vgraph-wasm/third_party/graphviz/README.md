# Graphviz (Upstream Source + Patch Set)

This directory documents how `dotlayout.wasm` is produced from Graphviz.

## Upstream Source

- Project: Graphviz
- Website: https://graphviz.org/
- Source Code: https://gitlab.com/graphviz/graphviz
- Version used for `dotlayout.wasm`: 9.0.0

## Patch Set

The Graphviz source tree used to build the distributed `dotlayout.wasm` is based on Graphviz 9.0.0 with a small set of local changes.

- Patch file: `patches/graphviz-9.0.0-wasm-vendor.patch`

## Rebuild `dotlayout.wasm`

Prerequisites:

- Emscripten SDK installed and activated (`emcc`, `emconfigure`, `emmake` available in PATH)
- `git` and `node` available

Build:

```bash
cd packages/vgraph-wasm
bash scripts/dag_layouts/build_dot.sh
```

