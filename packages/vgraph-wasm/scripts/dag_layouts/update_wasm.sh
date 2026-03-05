set -euo pipefail

filePtth="$( cd "$( dirname "$0"  )" && pwd  )"
cd $filePtth
PKG_DIR=$filePtth/../..
OUT_DIR=$filePtth/output

if [ ! -f "$OUT_DIR/dotlayout.wasm" ]; then
  echo "Missing: $OUT_DIR/dotlayout.wasm"
  exit 1
fi

if [ ! -f "$OUT_DIR/encoded_dot_wasm.ts" ]; then
  echo "Missing: $OUT_DIR/encoded_dot_wasm.ts"
  exit 1
fi

cp $OUT_DIR/dotlayout.wasm $PKG_DIR/examples/static/dotlayout.wasm
cp $OUT_DIR/encoded_dot_wasm.ts $PKG_DIR/examples/static/encoded_dot_wasm.ts
cp $OUT_DIR/encoded_dot_wasm.ts $PKG_DIR/src/dag/load_wasm/encoded_dot_wasm.ts

echo "Updated:"
ls -ltr $PKG_DIR/examples/static/dotlayout.wasm
ls -ltr $PKG_DIR/examples/static/encoded_dot_wasm.ts
ls -ltr $PKG_DIR/src/dag/load_wasm/encoded_dot_wasm.ts
