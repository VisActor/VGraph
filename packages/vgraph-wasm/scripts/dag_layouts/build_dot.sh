set -euo pipefail

filePtth="$( cd "$( dirname "$0"  )" && pwd  )"
cd $filePtth
GRAPHVIZ_VERSION=${GRAPHVIZ_VERSION:-9.0.0}
GRAPHVIZ_SRC=${GRAPHVIZ_SRC:-$filePtth/output/graphviz-src}
GRAPHVIZ_BUILD=${GRAPHVIZ_BUILD:-$GRAPHVIZ_SRC/build}
PATCH_FILE=${PATCH_FILE:-$filePtth/../../third_party/graphviz/patches/graphviz-9.0.0-wasm-vendor.patch}

command -v git >/dev/null 2>&1 || { echo "git not found in PATH"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "node not found in PATH"; exit 1; }
command -v emcc >/dev/null 2>&1 || { echo "emcc not found in PATH (emsdk not activated?)"; exit 1; }
command -v emconfigure >/dev/null 2>&1 || { echo "emconfigure not found in PATH (emsdk not activated?)"; exit 1; }
command -v emmake >/dev/null 2>&1 || { echo "emmake not found in PATH (emsdk not activated?)"; exit 1; }

if [ ! -d "$filePtth/output" ]; then
  mkdir -p "$filePtth/output"
fi

echo "准备 Graphviz 源码：$GRAPHVIZ_SRC (tag=$GRAPHVIZ_VERSION)"
if [ -f "$GRAPHVIZ_SRC/configure" ] && [ ! -d "$GRAPHVIZ_SRC/.git" ]; then
  echo "使用已准备好的 Graphviz 源码目录（包含 configure，且非 git 仓库）：$GRAPHVIZ_SRC"
else
  if [ ! -d "$GRAPHVIZ_SRC/.git" ]; then
    rm -rf "$GRAPHVIZ_SRC"
    git clone --depth 1 --branch "$GRAPHVIZ_VERSION" https://gitlab.com/graphviz/graphviz.git "$GRAPHVIZ_SRC"
  fi

  cd "$GRAPHVIZ_SRC"
  git fetch --tags --depth 1 origin "$GRAPHVIZ_VERSION" >/dev/null 2>&1 || true
  git checkout -f "$GRAPHVIZ_VERSION" >/dev/null 2>&1 || true

  if [ -f "$PATCH_FILE" ]; then
    if git apply --reverse --check "$PATCH_FILE" >/dev/null 2>&1; then
      echo "Graphviz 补丁已应用，跳过：$PATCH_FILE"
    else
      echo "应用 Graphviz 补丁：$PATCH_FILE"
      git apply "$PATCH_FILE"
    fi
  else
    echo "未找到补丁文件：$PATCH_FILE"
    exit 1
  fi
fi

cd "$GRAPHVIZ_SRC"

if [ ! -f "./configure" ]; then
  echo "未找到 ./configure：$GRAPHVIZ_SRC"
  echo "提示：Graphviz 的 git 源码快照可能不包含 autotools 生成产物；你可以设置 GRAPHVIZ_SRC 指向一个包含 configure 的源码目录。"
  exit 1
fi

echo "执行 graphviz configure"
if [ ! -d "$GRAPHVIZ_BUILD" ]; then
  mkdir -p "$GRAPHVIZ_BUILD"
fi

emconfigure ./configure --host=wasm32 --disable-ltdl --prefix="$GRAPHVIZ_BUILD" --with-expat=no --with-glut=no --with-gdk=no --with-gtk=no --with-qt=no --with-sfdp=no --with-ortho=yes --with-digcola=no --with-ipsepcola=no CFLAGS="-Oz" CXXFLAGS="-Oz"

echo "执行 graphviz build"
cd lib
emmake make install
cd ../plugin
emmake make install

cd "$filePtth"
export PREFIX="$GRAPHVIZ_BUILD"
echo "执行 wasm build"
bash ./em.sh
echo "更新 vgraph 中 wasm 文件"
bash ./update_wasm.sh
