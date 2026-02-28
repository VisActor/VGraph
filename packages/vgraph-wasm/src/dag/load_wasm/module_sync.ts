/* eslint-disable */
// @ts-nocheck
/** @nocollapse */
const ModuleSync = function (moduleArg = {}) {
  const Module = moduleArg;
  let readyPromiseResolve, readyPromiseReject;
  Module["ready"] = new Promise((resolve, reject) => {
    readyPromiseResolve = resolve;
    readyPromiseReject = reject;
  });
  const out = (text) => console.log(text);
  let err = (text) => console.error(text);
  function ready() {
    readyPromiseResolve(Module);
  }
  Module["agerrMessages"] = [];
  Module["stderrMessages"] = [];
  err = (text) => Module["stderrMessages"].push(text);
  function abort(what) {
    throw what;
  }
  let HEAP8,
    HEAP16,
    HEAP32,
    HEAPU8,
    HEAPU16,
    HEAPU32,
    HEAPF32,
    HEAPF64,
    wasmMemory;
  function updateMemoryViews() {
    const b = wasmMemory.buffer;
    HEAP8 = new Int8Array(b);
    HEAP16 = new Int16Array(b);
    HEAPU8 = new Uint8Array(b);
    HEAPU16 = new Uint16Array(b);
    HEAP32 = new Int32Array(b);
    HEAPU32 = new Uint32Array(b);
    HEAPF32 = new Float32Array(b);
    HEAPF64 = new Float64Array(b);
  }
  function viz_errorf(text) {
    Module["agerrMessages"].push(UTF8ToString(text));
    return 0;
  }
  const UTF8Decoder =
    typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;
  const UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
    const endIdx = idx + maxBytesToRead;
    let endPtr = idx;
    while (heapOrArray[endPtr] && !(endPtr >= endIdx)) {
      ++endPtr;
    }
    if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
      return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
    }
    let str = "";
    while (idx < endPtr) {
      let u0 = heapOrArray[idx++];
      if (!(u0 & 128)) {
        str += String.fromCharCode(u0);
        continue;
      }
      const u1 = heapOrArray[idx++] & 63;
      if ((u0 & 224) == 192) {
        str += String.fromCharCode(((u0 & 31) << 6) | u1);
        continue;
      }
      const u2 = heapOrArray[idx++] & 63;
      if ((u0 & 240) == 224) {
        u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
      } else {
        u0 =
          ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
      }
      if (u0 < 65536) {
        str += String.fromCharCode(u0);
      } else {
        const ch = u0 - 65536;
        str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
      }
    }
    return str;
  };
  var UTF8ToString = (ptr, maxBytesToRead) =>
    ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
  const ___assert_fail = (condition, filename, line, func) => {
    abort(
      `Assertion failed: ${UTF8ToString(condition)}, at: ` +
        [
          filename ? UTF8ToString(filename) : "unknown filename",
          line,
          func ? UTF8ToString(func) : "unknown function",
        ]
    );
  };
  var SYSCALLS = {
    varargs: undefined,
    get() {
      const ret = HEAP32[+SYSCALLS.varargs >> 2];
      SYSCALLS.varargs += 4;
      return ret;
    },
    getp() {
      return SYSCALLS.get();
    },
    getStr(ptr) {
      const ret = UTF8ToString(ptr);
      return ret;
    },
  };
  const ___syscall_faccessat = (dirfd, path, amode, flags) => {};
  function ___syscall_fcntl64(fd, cmd, varargs) {
    SYSCALLS.varargs = varargs;
    return 0;
  }
  const ___syscall_fstat64 = (fd, buf) => {};
  function ___syscall_ioctl(fd, op, varargs) {
    SYSCALLS.varargs = varargs;
    return 0;
  }
  const ___syscall_newfstatat = (dirfd, path, buf, flags) => {};
  function ___syscall_openat(dirfd, path, flags, varargs) {
    SYSCALLS.varargs = varargs;
  }
  const ___syscall_stat64 = (path, buf) => {};
  const ___syscall_unlinkat = (dirfd, path, flags) => {};
  const nowIsMonotonic = true;
  const __emscripten_get_now_is_monotonic = () => nowIsMonotonic;
  const _abort = () => {
    abort("");
  };
  const _emscripten_date_now = () => Date.now();
  let _emscripten_get_now;
  _emscripten_get_now = () => performance.now();
  const getHeapMax = () => 2147483648;
  const growMemory = (size) => {
    const b = wasmMemory.buffer;
    const pages = (size - b.byteLength + 65535) / 65536;
    try {
      wasmMemory.grow(pages);
      updateMemoryViews();
      return 1;
    } catch (e) {}
  };
  const _emscripten_resize_heap = (requestedSize) => {
    const oldSize = HEAPU8.length;
    requestedSize >>>= 0;
    const maxHeapSize = getHeapMax();
    if (requestedSize > maxHeapSize) {
      return false;
    }
    const alignUp = (x, multiple) =>
      x + ((multiple - (x % multiple)) % multiple);
    for (let cutDown = 1; cutDown <= 4; cutDown *= 2) {
      let overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
      overGrownHeapSize = Math.min(
        overGrownHeapSize,
        requestedSize + 100663296
      );
      const newSize = Math.min(
        maxHeapSize,
        alignUp(Math.max(requestedSize, overGrownHeapSize), 65536)
      );
      const replacement = growMemory(newSize);
      if (replacement) {
        return true;
      }
    }
    return false;
  };
  const ENV = {};
  const getExecutableName = () => "./this.program";
  var getEnvStrings = () => {
    if (!getEnvStrings.strings) {
      const lang =
        (
          (typeof navigator === "object" &&
            navigator.languages &&
            navigator.languages[0]) ||
          "C"
        ).replace("-", "_") + ".UTF-8";
      const env = {
        USER: "web_user",
        LOGNAME: "web_user",
        PATH: "/",
        PWD: "/",
        HOME: "/home/web_user",
        LANG: lang,
        _: getExecutableName(),
      };
      for (var x in ENV) {
        if (ENV[x] === undefined) {
          delete env[x];
        } else {
          env[x] = ENV[x];
        }
      }
      const strings = [];
      for (var x in env) {
        strings.push(`${x}=${env[x]}`);
      }
      getEnvStrings.strings = strings;
    }
    return getEnvStrings.strings;
  };
  const stringToAscii = (str, buffer) => {
    for (let i = 0; i < str.length; ++i) {
      HEAP8[buffer++ >> 0] = str.charCodeAt(i);
    }
    HEAP8[buffer >> 0] = 0;
  };
  const _environ_get = (__environ, environ_buf) => {
    let bufSize = 0;
    getEnvStrings().forEach((string, i) => {
      const ptr = environ_buf + bufSize;
      HEAPU32[(__environ + i * 4) >> 2] = ptr;
      stringToAscii(string, ptr);
      bufSize += string.length + 1;
    });
    return 0;
  };
  const _environ_sizes_get = (penviron_count, penviron_buf_size) => {
    const strings = getEnvStrings();
    HEAPU32[penviron_count >> 2] = strings.length;
    let bufSize = 0;
    strings.forEach((string) => (bufSize += string.length + 1));
    HEAPU32[penviron_buf_size >> 2] = bufSize;
    return 0;
  };
  const _proc_exit = (code) => {
    throw `exit(${code})`;
  };
  const _exit = _proc_exit;
  const _fd_close = (fd) => 52;
  const _fd_read = (fd, iov, iovcnt, pnum) => 52;
  const convertI32PairToI53Checked = (lo, hi) =>
    (hi + 2097152) >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN;
  function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
    const offset = convertI32PairToI53Checked(offset_low, offset_high);
    return 70;
  }
  const printCharBuffers = [null, [], []];
  const printChar = (stream, curr) => {
    const buffer = printCharBuffers[stream];
    if (curr === 0 || curr === 10) {
      (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
      buffer.length = 0;
    } else {
      buffer.push(curr);
    }
  };
  const _fd_write = (fd, iov, iovcnt, pnum) => {
    let num = 0;
    for (let i = 0; i < iovcnt; i++) {
      const ptr = HEAPU32[iov >> 2];
      const len = HEAPU32[(iov + 4) >> 2];
      iov += 8;
      for (let j = 0; j < len; j++) {
        printChar(fd, HEAPU8[ptr + j]);
      }
      num += len;
    }
    HEAPU32[pnum >> 2] = num;
    return 0;
  };
  const getCFunc = (ident) => {
    const func = Module["_" + ident];
    return func;
  };
  const writeArrayToMemory = (array, buffer) => {
    HEAP8.set(array, buffer);
  };
  const lengthBytesUTF8 = (str) => {
    let len = 0;
    for (let i = 0; i < str.length; ++i) {
      const c = str.charCodeAt(i);
      if (c <= 127) {
        len++;
      } else if (c <= 2047) {
        len += 2;
      } else if (c >= 55296 && c <= 57343) {
        len += 4;
        ++i;
      } else {
        len += 3;
      }
    }
    return len;
  };
  const stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
    if (!(maxBytesToWrite > 0)) {
      return 0;
    }
    const startIdx = outIdx;
    const endIdx = outIdx + maxBytesToWrite - 1;
    for (let i = 0; i < str.length; ++i) {
      let u = str.charCodeAt(i);
      if (u >= 55296 && u <= 57343) {
        const u1 = str.charCodeAt(++i);
        u = (65536 + ((u & 1023) << 10)) | (u1 & 1023);
      }
      if (u <= 127) {
        if (outIdx >= endIdx) {
          break;
        }
        heap[outIdx++] = u;
      } else if (u <= 2047) {
        if (outIdx + 1 >= endIdx) {
          break;
        }
        heap[outIdx++] = 192 | (u >> 6);
        heap[outIdx++] = 128 | (u & 63);
      } else if (u <= 65535) {
        if (outIdx + 2 >= endIdx) {
          break;
        }
        heap[outIdx++] = 224 | (u >> 12);
        heap[outIdx++] = 128 | ((u >> 6) & 63);
        heap[outIdx++] = 128 | (u & 63);
      } else {
        if (outIdx + 3 >= endIdx) {
          break;
        }
        heap[outIdx++] = 240 | (u >> 18);
        heap[outIdx++] = 128 | ((u >> 12) & 63);
        heap[outIdx++] = 128 | ((u >> 6) & 63);
        heap[outIdx++] = 128 | (u & 63);
      }
    }
    heap[outIdx] = 0;
    return outIdx - startIdx;
  };
  const stringToUTF8 = (str, outPtr, maxBytesToWrite) =>
    stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
  const stringToUTF8OnStack = (str) => {
    const size = lengthBytesUTF8(str) + 1;
    const ret = stackAlloc(size);
    stringToUTF8(str, ret, size);
    return ret;
  };
  const ccall = (ident, returnType, argTypes, args, opts) => {
    const toC = {
      string: (str) => {
        let ret = 0;
        if (str !== null && str !== undefined && str !== 0) {
          ret = stringToUTF8OnStack(str);
        }
        return ret;
      },
      array: (arr) => {
        const ret = stackAlloc(arr.length);
        writeArrayToMemory(arr, ret);
        return ret;
      },
    };
    function convertReturnValue(ret) {
      if (returnType === "string") {
        return UTF8ToString(ret);
      }
      if (returnType === "boolean") {
        return Boolean(ret);
      }
      return ret;
    }
    const func = getCFunc(ident);
    const cArgs = [];
    let stack = 0;
    if (args) {
      for (let i = 0; i < args.length; i++) {
        const converter = toC[argTypes[i]];
        if (converter) {
          if (stack === 0) {
            stack = stackSave();
          }
          cArgs[i] = converter(args[i]);
        } else {
          cArgs[i] = args[i];
        }
      }
    }
    let ret = func.apply(null, cArgs);

    function onDone(ret) {
      if (stack !== 0) {
        stackRestore(stack);
      }
      return convertReturnValue(ret);
    }
    ret = onDone(ret);
    return ret;
  };
  function getValue(ptr, type = "i8") {
    if (type.endsWith("*")) {
      type = "*";
    }
    switch (type) {
      case "i1":
        return HEAP8[ptr >> 0];
      case "i8":
        return HEAP8[ptr >> 0];
      case "i16":
        return HEAP16[ptr >> 1];
      case "i32":
        return HEAP32[ptr >> 2];
      case "i64":
        abort("to do getValue(i64) use WASM_BIGINT");
      case "float":
        return HEAPF32[ptr >> 2];
      case "double":
        return HEAPF64[ptr >> 3];
      case "*":
        return HEAPU32[ptr >> 2];
      default:
        abort(`invalid type for getValue: ${type}`);
    }
  }
  const wasmImports = {
    a: ___assert_fail,
    j: ___syscall_faccessat,
    e: ___syscall_fcntl64,
    t: ___syscall_fstat64,
    i: ___syscall_ioctl,
    r: ___syscall_newfstatat,
    f: ___syscall_openat,
    s: ___syscall_stat64,
    m: ___syscall_unlinkat,
    n: __emscripten_get_now_is_monotonic,
    b: _abort,
    o: _emscripten_date_now,
    l: _emscripten_resize_heap,
    p: _environ_get,
    q: _environ_sizes_get,
    g: _exit,
    c: _fd_close,
    h: _fd_read,
    k: _fd_seek,
    d: _fd_write,
    u: viz_errorf,
  };
  Module["ccall"] = ccall;
  Module["getValue"] = getValue;
  Module["UTF8ToString"] = UTF8ToString;
  Module["stringToUTF8"] = stringToUTF8;
  Module["lengthBytesUTF8"] = lengthBytesUTF8;
  function initRuntime(wasmExports) {
    wasmExports["w"]();
  }
  const imports = { a: wasmImports };
  let _viz_read_one_graph,
    _layout,
    _free,
    _malloc,
    stackSave,
    stackRestore,
    stackAlloc;

  const mod = new WebAssembly.Module(Module["wasm"]);
  const output = new WebAssembly.Instance(mod, imports);
  const wasmExports = output.exports;

  Module["_viz_read_one_graph"] = _viz_read_one_graph = wasmExports["x"];
  Module["_layout"] = _layout = wasmExports["y"];
  Module["_free"] = _free = wasmExports["A"];
  Module["_malloc"] = _malloc = wasmExports["B"];
  stackSave = wasmExports["C"];
  stackRestore = wasmExports["D"];
  stackAlloc = wasmExports["E"];
  wasmMemory = wasmExports["v"];
  updateMemoryViews();
  initRuntime(wasmExports);
  //
  return Module;
};

export default ModuleSync;
