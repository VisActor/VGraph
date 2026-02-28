import Module from "./module";
type WasmInstance = ReturnType<typeof Module>;

export const wasmModule = {
  wasm: null as WasmInstance | null,
  status: "notloaded" as "notloaded" | "loaded" | "loading",
  promise: null as Promise<void> | null,
};

export function loadWasm(wasm: any) {
  if (wasmModule.status === "loaded" || wasmModule.status === "loading") {
    console.warn("wasm is already loaded or loading, skip loading.");
    return wasmModule.promise!;
  }

  if (wasm === undefined) {
    console.error("wasm is not defined. Please provide a wasm file.");
    return new Promise<void>((resolve) => resolve());
  }

  if (typeof wasm === "string" || wasm instanceof URL) {
    // string 通常为远端 wasm 地址。URL 通常用于本地 wasm 文件。
    const fetchPromise = fetch(wasm);
    const loadingPromise = new Promise<void>((resolve) => {
      Module({ wasm: fetchPromise }).then((wasm: WasmInstance) => {
        wasmModule.wasm = wasm;
        wasmModule.status = "loaded";
        resolve();
      });
    });
    wasmModule.status = "loading";
    wasmModule.promise = loadingPromise;
    return loadingPromise;
  }

  console.error(
    "wasm is not a string or URL, please provide a wasm file or a wasm url."
  );
  return new Promise<void>((resolve) => resolve());
}
