# @visactor/vgraph-wasm

vgraph layouts wasm version

## 环境配置

### emsdk 配置
```
### Get the emsdk repo
git clone https://github.com/emscripten-core/emsdk.git

### Enter that directory
cd emsdk

### Fetch the latest version of the emsdk (not needed the first time you clone)
git pull

### Download and install the latest SDK tools.
./emsdk install latest

### Make the "latest" SDK "active" for the current user. (writes .emscripten file)
./emsdk activate latest

### Activate PATH and other environment variables in the current terminal
source ./emsdk_env.sh
```

## 编译和更新 wasm 产物 
```
bash scripts/dag_layouts/build_dot.sh
```

## 构建教程

详见：`docs/build-wasm.md`

## Graphviz 源码与补丁说明

`dotlayout.wasm` 基于 Graphviz 9.0.0 构建，并应用了一组本地补丁以适配/裁剪 wasm 场景。补丁与说明位于：

- `third_party/graphviz/README.md`
- `third_party/graphviz/patches/graphviz-9.0.0-wasm-vendor.patch`
