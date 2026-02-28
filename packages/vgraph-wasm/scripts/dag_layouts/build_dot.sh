filePtth="$( cd "$( dirname "$0"  )" && pwd  )"
cd $filePtth
echo "执行 graphviz configure"
# bash ../../src_cpps/graphviz/configure.sh ## 仅需configure一次
echo "执行 graphviz build"
bash ../../src_cpps/graphviz/build.sh
echo "执行 wasm build"
bash ./em.sh
echo "更新 vgraph 中 wasm 文件"
bash ./update_wasm.sh