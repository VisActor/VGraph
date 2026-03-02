filePtth="$( cd "$( dirname "$0"  )" && pwd  )"
cd $filePtth
export DAG_HOME="$filePtth/../../src_pkgs/dag_layouts/" ## 注意替换为自己的路径
if  [ ! -d "$DAG_HOME" ];then
  echo "DAG_HOME PATH 文件夹不存在"
fi
VGRAPH_WASM_DIR=$DAG_HOME/dist/wasm/
cp $filePtth/output/dotlayout.wasm $VGRAPH_WASM_DIR
cp $filePtth/output/encoded_dot_wasm.ts $VGRAPH_WASM_DIR
VGRAPH_EXSAMPLE_WASM_DIR=$DAG_HOME/examples/static/
cp $filePtth/output/dotlayout.wasm $VGRAPH_EXSAMPLE_WASM_DIR
cp $filePtth/output/encoded_dot_wasm.ts $VGRAPH_EXSAMPLE_WASM_DIR
echo "ls -ltr  \${VGRAPH_WASM_DIR}:"
ls -ltr  ${VGRAPH_WASM_DIR}