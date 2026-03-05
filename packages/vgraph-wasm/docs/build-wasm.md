# 构建 `dotlayout.wasm` 教程

本文档说明如何在本仓库内，从 Graphviz 源码构建 `dotlayout.wasm`，并同步更新到 `@visactor/vgraph-wasm` 的静态文件与内嵌 base64 资源。

## 产物与落盘位置

一次完整构建会生成并更新以下文件：

- `scripts/dag_layouts/output/dotlayout.wasm`（构建输出）
- `scripts/dag_layouts/output/encoded_dot_wasm.ts`（构建输出，base64）
- `examples/static/dotlayout.wasm`（示例静态资源，构建完成后会被覆盖更新）
- `examples/static/encoded_dot_wasm.ts`（示例静态资源，构建完成后会被覆盖更新）
- `src/dag/load_wasm/encoded_dot_wasm.ts`（包内嵌资源，构建完成后会被覆盖更新）

## 前置依赖

### 1) 安装并激活 emsdk（提供 `emcc` / `emconfigure` / `emmake`）

本仓库默认建议在 `vgraph/.tools/emsdk` 下安装 emsdk（不污染全局环境），你可以在任意终端执行：

```bash
cd /Users/bytedance/backup/vgraph
mkdir -p .tools
git clone https://github.com/emscripten-core/emsdk.git .tools/emsdk
cd .tools/emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

验证：

```bash
emcc -v
emconfigure --help >/dev/null
emmake --help >/dev/null
```

### 2) Graphviz 源码与补丁

`dotlayout.wasm` 基于 Graphviz 9.0.0 构建，并应用一组本地补丁以适配/裁剪 wasm 场景：

- 说明：`third_party/graphviz/README.md`
- 补丁：`third_party/graphviz/patches/graphviz-9.0.0-wasm-vendor.patch`

## 构建步骤（推荐）

### 方式 A：让脚本下载上游源码并自动打补丁

```bash
cd packages/vgraph-wasm
bash scripts/dag_layouts/build_dot.sh
```

脚本会把上游 Graphviz 拉到 `scripts/dag_layouts/output/graphviz-src`，并尝试应用补丁集，然后构建 Graphviz 静态库，再用 `emcc` 编译生成 `dotlayout.wasm`。
构建完成后会自动调用 `scripts/dag_layouts/update_wasm.sh`，将输出同步到包内的 `examples/static` 与 `src/dag/load_wasm`。

如果你的环境缺少 autotools（例如 macOS 没有 `autoconf` / `automake` / `libtool`），Graphviz 源码目录可能没有 `./configure`，脚本会给出明确报错与解决提示。

### 方式 B：使用一个“已包含 configure”的 Graphviz 源码目录

某些场景下你手头已有一个包含 `./configure` 的 Graphviz 源码目录（例如来自 release 包解压或内部镜像），可以通过环境变量指定：

```bash
cd packages/vgraph-wasm
GRAPHVIZ_SRC=/abs/path/to/graphviz-with-configure bash scripts/dag_layouts/build_dot.sh
```

当 `GRAPHVIZ_SRC` 指向的目录包含 `configure` 且不是 git 仓库时，脚本会直接使用该目录进行构建（并跳过 git 拉取与自动打补丁流程）。

## update_wasm.sh 的作用

`scripts/dag_layouts/update_wasm.sh` 负责把构建输出的 wasm 与 base64 产物同步回包内：

- `examples/static/dotlayout.wasm`
- `examples/static/encoded_dot_wasm.ts`
- `src/dag/load_wasm/encoded_dot_wasm.ts`

## 如何验证构建是否正确

### 1) 检查 `encoded_dot_wasm.ts` 与 `dotlayout.wasm` 是否一致

构建完成后，应该满足：

- `src/dag/load_wasm/encoded_dot_wasm.ts` base64 解码后的字节，等于 `examples/static/dotlayout.wasm`
- `examples/static/encoded_dot_wasm.ts` base64 解码后的字节，等于 `examples/static/dotlayout.wasm`

### 2) 用 sha256 做二进制一致性对比

```bash
cd packages/vgraph-wasm
shasum -a 256 examples/static/dotlayout.wasm
shasum -a 256 scripts/dag_layouts/output/dotlayout.wasm
```

两者应一致（脚本会用构建输出覆盖更新示例静态资源）。

## 常见问题

### Q1: `emcc not found in PATH`

未在当前终端激活 emsdk，执行：

```bash
source /Users/bytedance/backup/vgraph/.tools/emsdk/emsdk_env.sh
```

### Q2: `未找到 ./configure`

你使用的是 Graphviz 的 git 源码快照且本机缺少 autotools 生成步骤。解决方式：

- 安装 autotools（`autoconf`、`automake`、`libtool` 等），然后在 Graphviz 源码目录运行 `./autogen.sh` 生成 `configure`
- 或者改用包含 `configure` 的 Graphviz release 源码目录，并通过 `GRAPHVIZ_SRC=...` 指定
