set -euo pipefail

filePtth="$( cd "$( dirname "$0"  )" && pwd  )"
if  [ ! -d "$filePtth/output" ];then
  mkdir $filePtth/output
  echo $filePtth/output
fi
cd $filePtth
export PREFIX=${PREFIX:-$filePtth/../../src_cpps/graphviz/build/}
export OUTPUT=$filePtth/output
# emcc -Oz ${DEBUG:+-g2} --closure=0 --no-entry -sMODULARIZE=1 -sMINIMAL_RUNTIME=1 -sFILESYSTEM=0 -sASSERTIONS=0 -sALLOW_MEMORY_GROWTH=1 -sENVIRONMENT=web -sEXPORT_KEEPALIVE=1 -sEXPORTED_FUNCTIONS="['_malloc', '_free']" -s EXPORTED_RUNTIME_METHODS="['ccall', 'UTF8ToString', 'lengthBytesUTF8', 'stringToUTF8', 'getValue']" -sINCOMING_MODULE_JS_API="['wasm']" --pre-js pre.js -o  "${OUTPUT}/module.mjs" viz.c  -I$PREFIX/include -I$PREFIX/include/graphviz -L$PREFIX/lib -L$PREFIX/lib/graphviz -lgvplugin_dot_layout -lgvplugin_core -lgvc -lpathplan -lcgraph -lxdot -lcdt

echo "执行 emcc 编译"
## async
emcc  -Oz --closure=0 --no-entry -sWASM_ASYNC_COMPILATION=1 -sMODULARIZE=1 -sMINIMAL_RUNTIME=1  \
 -sFILESYSTEM=0 -sASSERTIONS=0 -sALLOW_MEMORY_GROWTH=1 -sENVIRONMENT=web -sEXPORT_KEEPALIVE=1 -sTOTAL_STACK=32MB -sTOTAL_MEMORY=512MB \
 -sEXPORTED_FUNCTIONS="['_malloc', '_free']" -s EXPORTED_RUNTIME_METHODS="['ccall', 'UTF8ToString', 'lengthBytesUTF8', 'stringToUTF8', 'getValue']" \
 -sINCOMING_MODULE_JS_API="['wasm']" --pre-js pre.js -o "${OUTPUT}/dotlayout.mjs" dot.c \
 -I$PREFIX/include -I$PREFIX/include/graphviz -L$PREFIX/lib -L$PREFIX/lib/graphviz  \
 -lgvplugin_dot_layout -lgvplugin_core -lgvc -lpathplan -lcgraph -lxdot -lcdt

### 避免 mjs 文件 ts 报错
echo "/* eslint-disable */" > ${OUTPUT}/module.mjs
cat ${OUTPUT}/dotlayout.mjs | sed 's/var Module=/const Module=/g' >> ${OUTPUT}/module.mjs
echo "将 wasm 转为 base64 字符串"
node encode-wasm.mjs ${OUTPUT}/dotlayout.wasm ${OUTPUT}/encoded_dot_wasm.ts
echo "ls -ltr  \${OUTPUT}:"
ls -ltr  ${OUTPUT}
